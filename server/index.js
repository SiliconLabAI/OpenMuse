/**
 * OpenMuse server
 * - Proxies Manus API (avoids browser CORS)
 * - POST /webhook/manus  — Manus async callback (task_created, task_stopped)
 * - GET  /events         — SSE stream of webhook events to the UI
 * - GET  /webhook/events — recent events JSON
 * - POST /webhook/register — register this callback URL with Manus
 */
import express from "express";
import cors from "cors";
import { createServer } from "http";
import { EventEmitter } from "events";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 8787);
const MANUS_BASE = "https://api.manus.ai";
const PUBLIC_BASE =
  process.env.OPENMUSE_PUBLIC_URL || `http://localhost:${PORT}`;

const bus = new EventEmitter();
bus.setMaxListeners(100);

/** @type {Array<object>} */
const recentEvents = [];
const MAX_EVENTS = 200;

function pushEvent(evt) {
  const record = {
    ...evt,
    received_at: new Date().toISOString(),
  };
  recentEvents.unshift(record);
  if (recentEvents.length > MAX_EVENTS) recentEvents.length = MAX_EVENTS;
  bus.emit("event", record);
  return record;
}

const app = express();
app.use(cors());
// Keep raw body option for future signature verification
app.use(
  express.json({
    limit: "2mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);

// ---------- Health ----------
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "openmuse",
    webhook_url: `${PUBLIC_BASE}/webhook/manus`,
    events: recentEvents.length,
  });
});

// ---------- Manus webhook callback (async task updates) ----------
app.post("/webhook/manus", (req, res) => {
  // Manus may send a verification/test POST; always 200 within 10s
  const body = req.body || {};
  const eventType = body.event_type || body.type || "unknown";
  const taskDetail = body.task_detail || body.task || {};

  const record = pushEvent({
    source: "manus_webhook",
    event_id: body.event_id,
    event_type: eventType,
    task_id: taskDetail.task_id || taskDetail.id,
    task_title: taskDetail.task_title || taskDetail.title,
    task_url: taskDetail.task_url,
    message: taskDetail.message,
    stop_reason: taskDetail.stop_reason,
    attachments: taskDetail.attachments || [],
    question_expectation: taskDetail.question_expectation,
    structured_output: taskDetail.structured_output,
    raw: body,
  });

  console.log(
    `[webhook] ${eventType} task=${record.task_id || "?"} reason=${record.stop_reason || "-"}`
  );

  res.status(200).json({ ok: true, received: record.event_id || true });
});

app.get("/webhook/events", (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  res.json({ ok: true, data: recentEvents.slice(0, limit) });
});

app.delete("/webhook/events", (_req, res) => {
  recentEvents.length = 0;
  res.json({ ok: true });
});

// SSE — browser listens for live webhook pushes
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: "connected", at: new Date().toISOString() })}\n\n`);

  const onEvent = (evt) => {
    res.write(`data: ${JSON.stringify({ type: "webhook", event: evt })}\n\n`);
  };
  bus.on("event", onEvent);

  const heartbeat = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    bus.off("event", onEvent);
  });
});

// Register webhook with Manus (needs API key)
app.post("/webhook/register", async (req, res) => {
  const apiKey =
    req.headers["x-manus-api-key"] ||
    req.body?.api_key ||
    process.env.MANUS_API_KEY;
  if (!apiKey) {
    return res.status(401).json({
      ok: false,
      error: { message: "API key required (header x-manus-api-key or body.api_key)" },
    });
  }

  const webhookUrl =
    req.body?.url || `${PUBLIC_BASE}/webhook/manus`;

  try {
    const r = await fetch(`${MANUS_BASE}/v2/webhook.create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-manus-api-key": apiKey,
      },
      body: JSON.stringify({
        url: webhookUrl,
        ...(req.body?.events ? { events: req.body.events } : {}),
      }),
    });
    const data = await r.json();
    res.status(r.status).json({
      ...data,
      registered_url: webhookUrl,
      note:
        "Manus requires a publicly reachable HTTPS URL for production. Use ngrok for local dev.",
    });
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: { message: e instanceof Error ? e.message : "register failed" },
    });
  }
});

app.get("/webhook/list", async (req, res) => {
  const apiKey = req.headers["x-manus-api-key"] || process.env.MANUS_API_KEY;
  if (!apiKey) {
    return res.status(401).json({ ok: false, error: { message: "API key required" } });
  }
  try {
    const r = await fetch(`${MANUS_BASE}/v2/webhook.list`, {
      headers: { "x-manus-api-key": apiKey },
    });
    const data = await r.json();
    res.status(r.status).json(data);
  } catch (e) {
    res.status(500).json({
      ok: false,
      error: { message: e instanceof Error ? e.message : "list failed" },
    });
  }
});

// ---------- Manus API proxy (browser → /api/* → api.manus.ai) ----------
app.all("/api/*", async (req, res) => {
  const subPath = req.path.replace(/^\/api/, "") || "/";
  const url = `${MANUS_BASE}${subPath}${req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : ""}`;

  const headers = {
    "Content-Type": "application/json",
  };
  const key = req.headers["x-manus-api-key"];
  if (key) headers["x-manus-api-key"] = key;
  const auth = req.headers["authorization"];
  if (auth) headers["Authorization"] = auth;

  try {
    const init = {
      method: req.method,
      headers,
    };
    if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
      init.body = JSON.stringify(req.body);
    }
    const r = await fetch(url, init);
    const text = await r.text();
    res.status(r.status);
    const ct = r.headers.get("content-type") || "application/json";
    res.setHeader("Content-Type", ct);
    res.send(text);
  } catch (e) {
    res.status(502).json({
      ok: false,
      error: {
        code: "proxy_error",
        message: e instanceof Error ? e.message : "proxy failed",
      },
    });
  }
});

// ---------- Production static UI ----------
const dist = path.join(root, "dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`OpenMuse server on http://localhost:${PORT}`);
  console.log(`  Webhook callback: ${PUBLIC_BASE}/webhook/manus`);
  console.log(`  SSE events:       http://localhost:${PORT}/events`);
  console.log(`  Manus proxy:      http://localhost:${PORT}/api/...`);
});
