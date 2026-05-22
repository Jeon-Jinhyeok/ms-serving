import http from "node:http";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8088);
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || BACKEND_URL;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || BACKEND_URL;
const INFERENCE_SERVICE_URL = process.env.INFERENCE_SERVICE_URL || BACKEND_URL;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const routes = [
  { prefix: "/api/auth", target: AUTH_SERVICE_URL },
  { prefix: "/api/user", target: USER_SERVICE_URL },
  { prefix: "/user", target: USER_SERVICE_URL, rewritePrefix: "/api/user" },
  { prefix: "/dashboard/image-class", target: INFERENCE_SERVICE_URL },
  { prefix: "/dashboard/text-summary", target: INFERENCE_SERVICE_URL },
  { prefix: "/dashboard/usage-stats", target: USER_SERVICE_URL }
];

function corsOrigin(origin) {
  if (!origin) return ALLOWED_ORIGINS.includes("*") ? "*" : ALLOWED_ORIGINS[0];
  if (ALLOWED_ORIGINS.includes("*") || ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return null;
}

function writeCors(req, res) {
  const origin = corsOrigin(req.headers.origin);
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
}

function routeFor(pathname) {
  return routes.find((route) => pathname === route.prefix || pathname.startsWith(`${route.prefix}/`));
}

function rewritePath(pathname, route) {
  if (!route.rewritePrefix) return pathname;
  return `${route.rewritePrefix}${pathname.slice(route.prefix.length) || ""}`;
}

function proxy(req, res, route) {
  const incomingUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const targetUrl = new URL(route.target);
  targetUrl.pathname = rewritePath(incomingUrl.pathname, route);
  targetUrl.search = incomingUrl.search;

  const headers = { ...req.headers };
  headers.host = targetUrl.host;
  headers["x-forwarded-host"] = req.headers.host || "";
  headers["x-forwarded-proto"] = req.headers["x-forwarded-proto"] || "http";

  const upstreamReq = http.request(
    {
      protocol: targetUrl.protocol,
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      method: req.method,
      path: `${targetUrl.pathname}${targetUrl.search}`,
      headers
    },
    (upstreamRes) => {
      writeCors(req, res);
      res.writeHead(upstreamRes.statusCode || 502, upstreamRes.headers);
      upstreamRes.pipe(res);
    }
  );

  upstreamReq.on("error", (error) => {
    writeCors(req, res);
    res.writeHead(502, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "upstream_unavailable", detail: error.message }));
  });

  req.pipe(upstreamReq);
}

const server = http.createServer((req, res) => {
  writeCors(req, res);

  if (req.method === "OPTIONS") {
    res.writeHead(corsOrigin(req.headers.origin) ? 204 : 403);
    res.end();
    return;
  }

  const incomingUrl = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (incomingUrl.pathname === "/healthz") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ status: "ok", backend: BACKEND_URL }));
    return;
  }

  const route = routeFor(incomingUrl.pathname);
  if (!route) {
    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "route_not_found", path: incomingUrl.pathname }));
    return;
  }

  proxy(req, res, route);
});

server.listen(PORT, () => {
  console.log(`api-gateway listening on :${PORT}`);
  console.log(`auth traffic -> ${AUTH_SERVICE_URL}`);
  console.log(`user traffic -> ${USER_SERVICE_URL}`);
  console.log(`inference traffic -> ${INFERENCE_SERVICE_URL}`);
});
