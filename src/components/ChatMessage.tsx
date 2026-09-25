import ReactMarkdown from "react-markdown";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractText, type TaskMessage } from "@/lib/manus-api";
import { useConfirmAction } from "@/hooks/useTasks";

type Props = {
  message: TaskMessage;
  taskId: string;
};

export function ChatMessage({ message, taskId }: Props) {
  const confirm = useConfirmAction(taskId);
  const text =
    extractText(message.content) ||
    message.text ||
    (typeof message.message === "string" ? message.message : "") ||
    "";

  const role = (message.role || message.type || "").toLowerCase();
  const isUser =
    role.includes("user") ||
    role === "human" ||
    message.type === "user_message";
  const isStatus =
    message.type === "status_update" ||
    (Boolean(message.agent_status) && !text);
  const isWaiting =
    message.agent_status === "waiting" ||
    Boolean(message.waiting_for_event_type);

  if (isStatus && !isWaiting) {
    return (
      <div className="flex justify-center py-1">
        <span className="rounded-full bg-muse-bg px-3 py-1 text-xs text-muse-muted">
          {message.agent_status || message.type || "update"}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[min(92%,560px)] rounded-bubble px-4 py-3 shadow-sm",
          isUser
            ? "rounded-br-md bg-muse-user text-muse-userText"
            : "rounded-bl-md bg-muse-bubble text-muse-text"
        )}
      >
        {text ? (
          <div className="prose-muse">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        ) : (
          <p className="text-sm italic text-muse-muted">
            {message.type || "Event"}
          </p>
        )}

        {isWaiting && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-800">
              <AlertCircle className="h-4 w-4" />
              Needs your approval
              {message.waiting_for_event_type
                ? ` · ${message.waiting_for_event_type}`
                : ""}
            </div>
            {(message.event_id || message.id) && (
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={confirm.isPending}
                  onClick={() =>
                    confirm.mutate({
                      eventId: String(message.event_id || message.id),
                      accept: true,
                    })
                  }
                  className="flex items-center gap-1.5 rounded-full bg-muse-connected/15 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-muse-connected/25"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={confirm.isPending}
                  onClick={() =>
                    confirm.mutate({
                      eventId: String(message.event_id || message.id),
                      accept: false,
                    })
                  }
                  className="rounded-full bg-black/5 px-3 py-1.5 text-xs text-muse-muted hover:bg-black/10"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
