import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Globe,
  List,
  Shield,
  Clock,
  Fingerprint,
  Pencil,
  Zap,
} from "lucide-react";
import { useTasks, useWebhookEvents } from "@/hooks/useTasks";
import { hasApiKey } from "@/lib/manus-api";
import { formatRelativeTime, cn } from "@/lib/utils";

export function ActivityPanel() {
  const { data: tasks } = useTasks();
  const { data: webhookEvents } = useWebhookEvents();
  const connected = hasApiKey();
  const latestHook = webhookEvents?.[0];

  return (
    <aside className="hidden h-full w-[300px] shrink-0 flex-col border-l border-muse-border bg-muse-surface lg:flex">
      <div className="flex flex-col items-center px-6 pb-4 pt-8">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-200 to-purple-300 shadow-soft">
            <svg viewBox="0 0 80 80" className="h-16 w-16" aria-hidden>
              <ellipse cx="40" cy="48" rx="28" ry="22" fill="#c4b5fd" />
              <circle cx="40" cy="32" r="20" fill="#ddd6fe" />
              <circle cx="33" cy="30" r="3.5" fill="#1c1c1e" />
              <circle cx="47" cy="30" r="3.5" fill="#1c1c1e" />
              <ellipse cx="40" cy="38" rx="5" ry="3" fill="#a78bfa" />
              <ellipse cx="22" cy="28" rx="6" ry="8" fill="#c4b5fd" />
              <ellipse cx="58" cy="28" rx="6" ry="8" fill="#c4b5fd" />
            </svg>
          </div>
          <button
            type="button"
            className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-muse-border bg-white text-muse-muted shadow-soft"
            title="Edit"
          >
            <Pencil className="h-3 w-3" />
          </button>
        </div>
        <h2 className="mt-3 text-lg font-semibold tracking-tight">Muse</h2>
        <div className="mt-1 flex items-center gap-1.5 text-sm">
          <span
            className={cn(
              "inline-block h-2 w-2 rounded-full",
              connected ? "bg-muse-connected" : "bg-muse-muted"
            )}
          />
          <span className={connected ? "text-muse-connected" : "text-muse-muted"}>
            {connected ? "Connected" : "Not connected"}
          </span>
        </div>
        {latestHook && (
          <div className="mt-2 flex items-center gap-1 text-[11px] text-muse-muted">
            <Zap className="h-3 w-3 text-amber-500" />
            Webhook: {latestHook.event_type || "event"}
          </div>
        )}
      </div>

      <div className="mx-6 mb-5 flex items-center justify-center gap-1 rounded-full border border-muse-border bg-muse-bg/80 px-2 py-1.5">
        {[List, Shield, Clock, Fingerprint].map((Icon, i) => (
          <button
            key={i}
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muse-muted hover:bg-white hover:text-muse-text"
          >
            <Icon className="h-4 w-4" strokeWidth={1.7} />
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <h3 className="mb-3 px-2 text-sm font-semibold text-muse-text">Today</h3>
        <ul className="space-y-1">
          {!connected && (
            <li className="rounded-xl px-3 py-3 text-sm text-muse-muted">
              Add your Manus API key in Settings.
            </li>
          )}
          {connected && (!tasks || tasks.length === 0) && (
            <li className="rounded-xl px-3 py-3 text-sm text-muse-muted">
              No tasks yet — start a chat.
            </li>
          )}
          {tasks?.slice(0, 12).map((t) => {
            const done =
              t.status === "stopped" ||
              t.status === "completed" ||
              t.status === "done";
            const running =
              t.status === "running" || t.has_running_background_jobs;
            return (
              <li key={t.id}>
                <Link
                  to="/task/$taskId"
                  params={{ taskId: t.id }}
                  className="flex gap-3 rounded-xl px-3 py-2.5 transition hover:bg-muse-bg"
                >
                  <div className="mt-0.5 shrink-0">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-muse-connected" />
                    ) : running ? (
                      <Globe className="h-5 w-5 text-muse-accent" />
                    ) : (
                      <Globe className="h-5 w-5 text-muse-muted" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-muse-text">
                      {t.title || "Untitled task"}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muse-muted">
                      {running ? "Working…" : done ? "Finished" : t.status}
                      {t.updated_at ? ` · ${formatRelativeTime(t.updated_at)}` : ""}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
