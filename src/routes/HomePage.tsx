import { useNavigate } from "@tanstack/react-router";
import {
  Hotel,
  Briefcase,
  Ticket,
  Mail,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { Composer } from "@/components/Composer";
import { ChatHeader } from "@/components/ChatHeader";
import { useCreateTask } from "@/hooks/useTasks";
import { hasApiKey } from "@/lib/manus-api";

const SUGGESTIONS = [
  {
    icon: Hotel,
    label: "Book a hotel",
    prompt:
      "Find hotel options in San Francisco next Friday–Sunday under $250/night near downtown, and summarize top 3.",
  },
  {
    icon: Briefcase,
    label: "Job hunting",
    prompt:
      "Research 5 mid-level product manager roles and draft a short outreach message template.",
  },
  {
    icon: Ticket,
    label: "Reserve tickets",
    prompt:
      "Find available tickets for a popular event this month and summarize prices and seating.",
  },
  {
    icon: Mail,
    label: "Email help",
    prompt:
      "Once my email connector is enabled in Manus, summarize urgent unread emails and draft short replies.",
  },
  {
    icon: ShoppingBag,
    label: "Shopping list",
    prompt:
      "Turn a simple vegetarian dinner plan for 4 nights into a grocery list organized by section.",
  },
];

export function HomePage() {
  const navigate = useNavigate();
  const create = useCreateTask();
  const ready = hasApiKey();

  const start = async (text: string) => {
    if (!ready) {
      navigate({ to: "/settings" });
      return;
    }
    const res = await create.mutateAsync(text);
    if (res.ok && res.task_id) {
      navigate({ to: "/task/$taskId", params: { taskId: res.task_id } });
    } else {
      alert(res.error?.message || "Failed to create task");
    }
  };

  return (
    <div className="flex h-full flex-col bg-muse-surface">
      <ChatHeader title="Chats" />

      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-10">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muse-accentSoft">
          <Sparkles className="h-6 w-6 text-muse-accent" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight text-muse-text">
          What should Muse do?
        </h1>
        <p className="mt-2 max-w-md text-center text-sm text-muse-muted">
          Plan trips, hunt jobs, book tickets — same style of tasks as Muse,
          powered by the Manus agent API.
        </p>

        <div className="mt-8 grid w-full max-w-xl gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              onClick={() => start(s.prompt)}
              disabled={create.isPending}
              className="flex items-start gap-3 rounded-2xl border border-muse-border bg-muse-bg/60 px-4 py-3 text-left transition hover:border-muse-accent/30 hover:bg-muse-accentSoft/40 disabled:opacity-50"
            >
              <s.icon className="mt-0.5 h-4 w-4 shrink-0 text-muse-accent" />
              <div>
                <div className="text-sm font-medium text-muse-text">
                  {s.label}
                </div>
                <div className="mt-0.5 line-clamp-2 text-xs text-muse-muted">
                  {s.prompt}
                </div>
              </div>
            </button>
          ))}
        </div>

        {!ready && (
          <p className="mt-8 text-sm text-amber-600">
            Set your Manus API key in Settings to start.
          </p>
        )}
      </div>

      <Composer
        onSend={start}
        disabled={!ready}
        isSending={create.isPending}
        placeholder="Message"
      />
    </div>
  );
}
