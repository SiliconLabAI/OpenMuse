import { Link, useRouterState } from "@tanstack/react-router";
import {
  MessageCircle,
  Plug,
  FolderKanban,
  Settings,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: MessageCircle, label: "Chats", match: (p: string) => p === "/" || p.startsWith("/task") },
  { to: "/connectors", icon: Plug, label: "Apps", match: (p: string) => p.startsWith("/connectors") },
  { to: "/projects", icon: FolderKanban, label: "Projects", match: (p: string) => p.startsWith("/projects") },
  { to: "/activity", icon: Activity, label: "Activity", match: (p: string) => p.startsWith("/activity") },
];

export function IconRail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onSettings = pathname.startsWith("/settings");

  return (
    <nav className="flex h-full w-14 flex-col items-center border-r border-muse-border bg-muse-surface py-3">
      <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-muse-accentSoft text-muse-accent">
        <MessageCircle className="h-4 w-4" strokeWidth={2.2} />
      </div>
      <div className="flex flex-1 flex-col items-center gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.match(pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              title={item.label}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl transition",
                active
                  ? "bg-muse-accentSoft text-muse-accent"
                  : "text-muse-muted hover:bg-black/[0.04] hover:text-muse-text"
              )}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            </Link>
          );
        })}
      </div>
      <Link
        to="/settings"
        title="Settings"
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-xl transition",
          onSettings
            ? "bg-muse-accentSoft text-muse-accent"
            : "text-muse-muted hover:bg-black/[0.04] hover:text-muse-text"
        )}
      >
        <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} />
      </Link>
    </nav>
  );
}
