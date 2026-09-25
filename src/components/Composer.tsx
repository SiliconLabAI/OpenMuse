import { useState, useRef, useEffect } from "react";
import { Plus, Mic, Send, Loader2, Square } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string) => void;
  onStop?: () => void;
  disabled?: boolean;
  isSending?: boolean;
  isRunning?: boolean;
  placeholder?: string;
};

export function Composer({
  onSend,
  onStop,
  disabled,
  isSending,
  isRunning,
  placeholder = "Message",
}: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const submit = () => {
    const t = value.trim();
    if (!t || disabled || isSending) return;
    onSend(t);
    setValue("");
    if (ref.current) {
      ref.current.style.height = "auto";
    }
  };

  return (
    <div className="border-t border-muse-border bg-muse-surface px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <button
          type="button"
          className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muse-muted hover:bg-muse-bg hover:text-muse-text"
          title="Attach"
        >
          <Plus className="h-5 w-5" strokeWidth={1.8} />
        </button>

        <div className="relative flex-1">
          <textarea
            ref={ref}
            rows={1}
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            placeholder={placeholder}
            className={cn(
              "w-full resize-none rounded-full border border-muse-border bg-muse-bg px-5 py-3 pr-12 text-[15px] text-muse-text placeholder:text-muse-muted",
              "focus:border-muse-accent/40 focus:outline-none focus:ring-2 focus:ring-muse-accent/15",
              "disabled:opacity-50"
            )}
            style={{ maxHeight: 140 }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
            }}
          />
          {isRunning && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-muse-muted hover:bg-white hover:text-muse-text"
              title="Stop"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
            </button>
          ) : value.trim() ? (
            <button
              type="button"
              onClick={submit}
              disabled={disabled || isSending}
              className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-muse-accent text-white hover:opacity-90 disabled:opacity-40"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          ) : (
            <button
              type="button"
              className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-full text-muse-muted hover:bg-white hover:text-muse-text"
              title="Voice"
            >
              <Mic className="h-4 w-4" strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
