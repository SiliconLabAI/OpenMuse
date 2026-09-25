import { Link } from "@tanstack/react-router";
import { ArrowLeft, Zap, Loader2 } from "lucide-react";
import { useWebhookEvents } from "@/hooks/useTasks";

export function ActivityPage() {
  const { data, isLoading } = useWebhookEvents();

  return (
    <div className="flex h-full flex-col bg-muse-surface">
      <header className="flex h-14 items-center gap-2 border-b border-muse-border px-3">
        <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full text-muse-muted hover:bg-muse-bg">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-semibold">Webhook activity</span>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="mb-4 max-w-lg text-sm text-muse-muted">
          Async Manus callbacks land on <code className="text-xs bg-muse-bg px-1 rounded">POST /webhook/manus</code>.
          The UI also listens via SSE. Register the public URL in Settings (use ngrok locally).
        </p>
        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muse-muted" />}
        <ul className="space-y-2">
          {!data?.length && !isLoading && (
            <li className="text-sm text-muse-muted">No webhook events yet.</li>
          )}
          {data?.map((e, i) => (
            <li
              key={(e.event_id as string) || i}
              className="rounded-2xl border border-muse-border px-4 py-3"
            >
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-amber-500" />
                {e.event_type || "event"}
                {e.stop_reason ? ` · ${e.stop_reason}` : ""}
              </div>
              <div className="mt-1 text-xs text-muse-muted">
                {e.task_title || e.task_id || "—"}
                {e.received_at ? ` · ${e.received_at}` : ""}
              </div>
              {e.message && (
                <p className="mt-2 text-sm text-muse-text line-clamp-3">{String(e.message)}</p>
              )}
              {e.task_id && (
                <Link
                  to="/task/$taskId"
                  params={{ taskId: String(e.task_id) }}
                  className="mt-2 inline-block text-xs text-muse-accent"
                >
                  Open task
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
