import http from "node:http";

const PORT = Number(process.env.PORT || 9000);
const MODEL_KIND = process.env.MODEL_KIND || "image";

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function imageResponse() {
  return {
    predictions: [
      { class: "tabby cat", confidence: 0.82 },
      { class: "tiger cat", confidence: 0.12 },
      { class: "Egyptian cat", confidence: 0.06 }
    ]
  };
}

function textResponse(payload) {
  const text = payload?.instances?.[0]?.text || "";
  const summary = text.length > 120 ? `${text.slice(0, 117)}...` : text || "요약할 텍스트가 없습니다.";
  return { summary };
}

const server = http.createServer(async (req, res) => {
  if (req.url === "/healthz") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", modelKind: MODEL_KIND }));
    return;
  }

  if (req.method !== "POST") {
    res.writeHead(405, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "method_not_allowed" }));
    return;
  }

  try {
    const payload = await readJson(req);
    const response = MODEL_KIND === "text" ? textResponse(payload) : imageResponse();
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify(response));
  } catch (error) {
    res.writeHead(400, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "invalid_json", detail: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`${MODEL_KIND} mock model listening on :${PORT}`);
});
