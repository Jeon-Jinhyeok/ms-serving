import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8081);
const IMAGE_MODEL_URL = process.env.IMAGE_MODEL_URL || "http://localhost:9001/v1/models/mobilenet:predict";
const IMAGE_MODEL_HOST = process.env.IMAGE_MODEL_HOST || "";
const TEXT_MODEL_URL = process.env.TEXT_MODEL_URL || "http://localhost:9002/v1/models/kobart-summary:predict";
const TEXT_MODEL_HOST = process.env.TEXT_MODEL_HOST || "";
const MODEL_TIMEOUT_MS = Number(process.env.MODEL_TIMEOUT_MS || 30000);

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 20 * 1024 * 1024) {
        reject(new Error("request_body_too_large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("invalid_json"));
      }
    });
    req.on("error", reject);
  });
}

function json(res, statusCode, body) {
  res.writeHead(statusCode, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function modelPayloadForImage(payload) {
  const b64 = payload?.b64 || payload?.instances?.[0]?.b64;
  if (!b64 || typeof b64 !== "string") {
    throw new Error("image_b64_required");
  }
  return { instances: [{ b64 }] };
}

function modelPayloadForText(payload) {
  const text = payload?.text || payload?.instances?.[0]?.text;
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new Error("text_required");
  }
  return { instances: [{ text }] };
}

async function callModel(target, hostHeader, payload) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MODEL_TIMEOUT_MS);

  try {
    const headers = { "content-type": "application/json" };
    if (hostHeader) {
      headers.host = hostHeader;
    }

    const response = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const text = await response.text();
    let body;
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { raw: text };
    }

    if (!response.ok) {
      const error = new Error("model_error");
      error.statusCode = response.status;
      error.body = body;
      throw error;
    }

    return body;
  } finally {
    clearTimeout(timeout);
  }
}

const server = http.createServer(async (req, res) => {
  const incomingUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && incomingUrl.pathname === "/healthz") {
    json(res, 200, { status: "ok" });
    return;
  }

  if (req.method !== "POST") {
    json(res, 405, { error: "method_not_allowed" });
    return;
  }

  try {
    const payload = await readJson(req);

    if (incomingUrl.pathname === "/image-class") {
      const response = await callModel(IMAGE_MODEL_URL, IMAGE_MODEL_HOST, modelPayloadForImage(payload));
      json(res, 200, response);
      return;
    }

    if (incomingUrl.pathname === "/text-summary") {
      const response = await callModel(TEXT_MODEL_URL, TEXT_MODEL_HOST, modelPayloadForText(payload));
      json(res, 200, response);
      return;
    }

    json(res, 404, { error: "route_not_found", path: incomingUrl.pathname });
  } catch (error) {
    if (error.message === "invalid_json") {
      json(res, 400, { error: "invalid_json" });
      return;
    }
    if (error.message === "request_body_too_large") {
      json(res, 413, { error: "request_body_too_large" });
      return;
    }
    if (error.message === "image_b64_required" || error.message === "text_required") {
      json(res, 400, { error: error.message });
      return;
    }
    if (error.name === "AbortError") {
      json(res, 504, { error: "model_timeout" });
      return;
    }
    if (error.message === "model_error") {
      json(res, 502, { error: "model_error", status: error.statusCode, detail: error.body });
      return;
    }

    json(res, 500, { error: "internal_error" });
  }
});

server.listen(PORT, () => {
  console.log(`inference-service listening on :${PORT}`);
});
