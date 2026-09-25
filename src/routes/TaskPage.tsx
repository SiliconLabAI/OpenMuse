import { useEffect, useRef } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import { ChatMessage } from "@/components/ChatMessage";
import { Composer } from "@/components/Composer";
import { ChatHeader } from "@/components/ChatHeader";
import {
  useTaskMessages,
  useSendMessage,
  useStopTask,
  useTasks,
} from "@/hooks/useTasks";
import { hasApiKey } from "@/lib/manus-api";

export function TaskPage() {
  const { taskId } = useParams({ from: "/task/$taskId" });
  const { data: messages, isLoading, isError, error } = useTaskMessages(taskId);
  const { data: tasks } = useTasks();
  const send = useSendMessage(taskId);
  const stop = useStopTask();
  const bottomRef = useRef<HTMLDivElement>(null);

  const task = tasks?.find((t) => t.id === taskId);
  const isRunning =
    task?.status === "running" ||
    task?.has_running_background_jobs ||
    messages?.some((m) => m.agent_status === "running");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  if (!hasApiKey()) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-muse-surface">
        <p className="text-sm text-muse-muted">
          <Link to="/settings" className="text-muse-accent underline">
            Add API key
          </Link>{" "}
          to view this chat.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-muse-surface">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-muse-border px-3">
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muse-muted hover:bg-muse-bg hover:text-muse-text"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">
            {task?.title || "Chat"}
          </div>
          <div className="text-[11px] text-muse-muted">
            {task?.status || "…"}
            {task?.agent_profile ? ` · ${task.agent_profile}` : ""}
          </div>
        </div>
        {task?.task_url && (
          <a
            href={task.task_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-muse-muted hover:bg-muse-bg hover:text-muse-text"
          >
            Manus
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {isLoading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muse-muted" />
            </div>
          )}
          {isError && (
            <p className="text-center text-sm text-red-500">
              {(error as Error)?.message}
            </p>
          )}
          {!isLoading && messages?.length === 0 && (
            <p className="py-12 text-center text-sm text-muse-muted">
              Waiting for the agent…
            </p>
          )}
          {messages?.map((m, i) => (
            <ChatMessage
              key={m.event_id || m.id || `m-${i}`}
              message={m}
              taskId={taskId}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <Composer
        onSend={(text) => send.mutate(text)}
        onStop={() => stop.mutate(taskId)}
        isSending={send.isPending}
        isRunning={Boolean(isRunning)}
        placeholder="Message"
      />
    </div>
  );
}
