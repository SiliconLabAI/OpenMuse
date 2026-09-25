import { Menu } from "lucide-react";

type Props = {
  title?: string;
  onMenu?: () => void;
};

export function ChatHeader({ title = "Chats", onMenu }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-muse-border bg-muse-surface px-4">
      <button
        type="button"
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muse-muted hover:bg-muse-bg hover:text-muse-text lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2 rounded-full bg-muse-bg px-3.5 py-1.5">
        <Menu className="hidden h-4 w-4 text-muse-muted sm:block" />
        <span className="text-sm font-semibold text-muse-text">{title}</span>
      </div>
    </header>
  );
}
