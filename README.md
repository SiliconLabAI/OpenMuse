# OpenMuse

**Muse-style personal agent UI** powered only by [Manus API v2](https://open.manus.ai/docs/v2/introduction), plus a **local callback server** for async webhooks.

Manus tasks run asynchronously. OpenMuse includes:

1. **Web UI** (Vite + React + TanStack) — Muse-like chat, Today feed, connectors, projects  
2. **Server** (`server/index.js`) — Manus API proxy, **webhook callback**, SSE to the browser  

Not affiliated with Meta. No Muse Secure VM / Meta WhatsApp platform access.

---

## Architecture

```
Browser (OpenMuse UI)
    │  REST + SSE
    ▼
OpenMuse server :8787
    ├── POST /webhook/manus   ← Manus async callbacks (task_created, task_stopped)
    ├── GET  /events          ← SSE to UI
    ├── GET  /webhook/events  ← recent events JSON
    ├── POST /webhook/register← register URL with Manus
    └── /api/*                → proxy → https://api.manus.ai
```

---

## Quick start

```bash
cd openmuse
npm install
npm run dev
```

This starts:

- **Server** → http://localhost:8787  
- **UI** → http://localhost:5173  

1. Settings → paste Manus API key → Save  
2. (Optional) Connect Gmail etc. on [manus.im](https://manus.im)  
3. Start a chat  

### Webhook callback (async)

Local callback URL:

```text
http://localhost:8787/webhook/manus
```

Manus needs a **public HTTPS** URL in production. For local dev:

```bash
ngrok http 8787
# then Settings → paste https://xxxx.ngrok.io/webhook/manus → Register webhook
```

Or call:

```bash
curl -X POST http://localhost:8787/webhook/register \
  -H "Content-Type: application/json" \
  -H "x-manus-api-key: YOUR_KEY" \
  -d '{"url":"https://xxxx.ngrok.io/webhook/manus"}'
```

Test the endpoint:

```bash
curl -X POST http://localhost:8787/webhook/manus \
  -H "Content-Type: application/json" \
  -d '{"event_type":"task_stopped","event_id":"test","task_detail":{"task_id":"t1","task_title":"Demo","stop_reason":"finish","message":"Done"}}'
```

Watch **Activity** in the UI or `GET /webhook/events`.

---

## Feature map (Manus-backed only)

| Muse-like UX | Implementation |
|--------------|----------------|
| Chat / tasks | `task.create` / `sendMessage` / `listMessages` |
| Today feed | `task.list` |
| Approvals | `task.confirmAction` |
| Connected | `user.me` |
| Apps | `connector.list` (OAuth on manus.im first) |
| Projects | `project.create` / `project.list` |
| Async updates | **Webhook** `task_created` / `task_stopped` + SSE |
| Credits | `usage.availableCredits` |

See full matrix in the product description below.

---

## API surface

| Endpoint | Role |
|----------|------|
| `user.me` | Connected |
| `task.*` | Chat lifecycle |
| `connector.list` | Apps page |
| `project.*` | Projects page |
| `webhook.create` | Register callback (via server) |
| Server `POST /webhook/manus` | **Your** callback for Manus |

Auth: `x-manus-api-key`  
Proxy base in dev: `http://localhost:8787/api`

---

## Scripts

| Command | What |
|---------|------|
| `npm run dev` | Server + Vite together |
| `npm run server` | Callback + proxy only |
| `npm run web` | UI only |
| `npm run build` && `npm start` | Production static + server |

Env:

- `PORT` — server port (default `8787`)  
- `OPENMUSE_PUBLIC_URL` — public base for webhook registration  
- `MANUS_API_KEY` — optional server-side default key  

---

## Stack

React 18 · TypeScript · Vite · TanStack Query/Router · Tailwind · Express  

MIT — Manus agent API client with Muse-inspired UI.
