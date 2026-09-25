/**
 * Manus API v2 client — all calls go through OpenMuse server proxy (/api)
 * Docs: https://open.manus.ai/docs/v2/introduction
 */

const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "http://localhost:8787/api" : "/api");

const SERVER_BASE =
  import.meta.env.VITE_SERVER_BASE?.replace(/\/$/, "") ||
  (import.meta.env.DEV ? "http://localhost:8787" : "");

export type ManusError = { code?: string; message: string };

export type ApiResponse<T = Record<string, unknown>> = {
  ok: boolean;
  request_id?: string;
  error?: ManusError;
} & T;

export type TaskSummary = {
  id: string;
  status: string;
  created_at: number;
  updated_at: number;
  title?: string;
  task_url?: string;
  agent_profile?: string;
  has_running_background_jobs?: boolean;
  credit_usage?: number;
};

export type TaskMessage = {
  id?: string;
  event_id?: string;
  type?: string;
  role?: string;
  content?: string | ContentPart[];
  text?: string;
  agent_status?: string;
  waiting_for_event_type?: string;
  created_at?: number;
  message?: string;
  [key: string]: unknown;
};

export type ContentPart = { type: string; text?: string; [key: string]: unknown };

export type Connector = { id: string; name: string; [key: string]: unknown };
export type Project = { id: string; name?: string; title?: string; [key: string]: unknown };
export type Skill = { id: string; name?: string; [key: string]: unknown };
export type WebhookEvent = {
  event_type?: string;
  task_id?: string;
  task_title?: string;
  stop_reason?: string;
  message?: string;
  received_at?: string;
  [key: string]: unknown;
};

function getApiKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("openmuse_api_key") || "";
}

export function setApiKey(key: string) {
  localStorage.setItem("openmuse_api_key", key.trim());
}

export function clearApiKey() {
  localStorage.removeItem("openmuse_api_key");
}

export function hasApiKey(): boolean {
  return Boolean(getApiKey());
}

export function serverBase() {
  return SERVER_BASE;
}

async function request<T = Record<string, unknown>>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const key = getApiKey();
  if (!key && !path.startsWith("/webhook") && path !== "/user.me") {
    // still allow user.me to fail with auth error
  }
  if (!key) {
    return {
      ok: false,
      error: { code: "unauthenticated", message: "No API key. Add one in Settings." },
    };
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-manus-api-key": key,
    ...(options.headers as Record<string, string>),
  };

  try {
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = (await res.json()) as ApiResponse<T>;
    if (!res.ok && data.ok !== false) {
      return {
        ok: false,
        error: { code: "http_error", message: `HTTP ${res.status}` },
      };
    }
    return data;
  } catch (e) {
    return {
      ok: false,
      error: {
        code: "network",
        message:
          e instanceof Error
            ? `${e.message} (is the OpenMuse server running on :8787?)`
            : "Network error",
      },
    };
  }
}

export async function createTask(params: {
  content: string;
  title?: string;
  connectors?: string[];
  agent_profile?: string;
  project_id?: string;
  enable_skills?: string[];
}) {
  const message: Record<string, unknown> = { content: params.content };
  if (params.connectors?.length) message.connectors = params.connectors;
  if (params.enable_skills?.length) message.enable_skills = params.enable_skills;

  const body: Record<string, unknown> = { message };
  if (params.title) body.title = params.title;
  if (params.agent_profile) body.agent_profile = params.agent_profile;
  if (params.project_id) body.project_id = params.project_id;

  return request<{
    task_id: string;
    task_title?: string;
    task_url?: string;
    share_url?: string;
  }>("/v2/task.create", { method: "POST", body: JSON.stringify(body) });
}

export async function listTasks(limit = 40) {
  return request<{ data: TaskSummary[]; has_more?: boolean }>(
    `/v2/task.list?limit=${limit}`
  );
}

export async function getTaskDetail(taskId: string) {
  return request<{
    id: string;
    status: string;
    title?: string;
    task_url?: string;
    agent_profile?: string;
    has_running_background_jobs?: boolean;
  }>(`/v2/task.detail?task_id=${encodeURIComponent(taskId)}`);
}

export async function listMessages(
  taskId: string,
  limit = 80,
  order: "asc" | "desc" = "asc"
) {
  return request<{ data: TaskMessage[]; has_more?: boolean }>(
    `/v2/task.listMessages?task_id=${encodeURIComponent(taskId)}&limit=${limit}&order=${order}`
  );
}

export async function sendMessage(taskId: string, content: string) {
  return request("/v2/task.sendMessage", {
    method: "POST",
    body: JSON.stringify({ task_id: taskId, message: { content } }),
  });
}

export async function confirmAction(
  taskId: string,
  eventId: string,
  accept: boolean
) {
  return request("/v2/task.confirmAction", {
    method: "POST",
    body: JSON.stringify({
      task_id: taskId,
      event_id: eventId,
      input: { accept },
    }),
  });
}

export async function stopTask(taskId: string) {
  return request("/v2/task.stop", {
    method: "POST",
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function deleteTask(taskId: string) {
  return request("/v2/task.delete", {
    method: "POST",
    body: JSON.stringify({ task_id: taskId }),
  });
}

export async function getMe() {
  return request<{ user_id?: string; id?: string }>("/v2/user.me");
}

export async function listConnectors() {
  return request<{ data: Connector[] }>("/v2/connector.list");
}

export async function listProjects() {
  return request<{ data: Project[] }>("/v2/project.list");
}

export async function createProject(name: string, instructions?: string) {
  return request<{ id?: string; project_id?: string }>("/v2/project.create", {
    method: "POST",
    body: JSON.stringify({
      name,
      ...(instructions ? { instructions } : {}),
    }),
  });
}

export async function listSkills() {
  return request<{ data: Skill[] }>("/v2/skill.list");
}

export async function availableCredits() {
  return request<{
    credits?: number;
    balance?: number;
    [key: string]: unknown;
  }>("/v2/usage.availableCredits");
}

export async function listWebhooks() {
  const key = getApiKey();
  try {
    const res = await fetch(`${SERVER_BASE}/webhook/list`, {
      headers: { "x-manus-api-key": key },
    });
    return (await res.json()) as ApiResponse<{ data?: unknown[] }>;
  } catch (e) {
    return {
      ok: false,
      error: { message: e instanceof Error ? e.message : "failed" },
    };
  }
}

export async function registerWebhook(publicUrl?: string) {
  const key = getApiKey();
  try {
    const res = await fetch(`${SERVER_BASE}/webhook/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-manus-api-key": key,
      },
      body: JSON.stringify(publicUrl ? { url: publicUrl } : {}),
    });
    return (await res.json()) as ApiResponse & {
      registered_url?: string;
      note?: string;
    };
  } catch (e) {
    return {
      ok: false,
      error: { message: e instanceof Error ? e.message : "failed" },
    };
  }
}

export async function fetchWebhookEvents(limit = 40) {
  try {
    const res = await fetch(`${SERVER_BASE}/webhook/events?limit=${limit}`);
    return (await res.json()) as { ok: boolean; data: WebhookEvent[] };
  } catch {
    return { ok: false, data: [] as WebhookEvent[] };
  }
}

export function extractText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part)
          return String((part as ContentPart).text || "");
        return "";
      })
      .filter(Boolean)
      .join("\n");
  }
  if (content && typeof content === "object" && "text" in (content as object)) {
    return String((content as { text: string }).text);
  }
  return "";
}
