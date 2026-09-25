import { Link } from "@tanstack/react-router";
import { ArrowLeft, Plug, ExternalLink, Loader2 } from "lucide-react";
import { useConnectors } from "@/hooks/useTasks";
import { hasApiKey } from "@/lib/manus-api";

export function ConnectorsPage() {
  const { data, isLoading, isError, error } = useConnectors();

  return (
    <div className="flex h-full flex-col bg-muse-surface">
      <header className="flex h-14 items-center gap-2 border-b border-muse-border px-3">
        <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full text-muse-muted hover:bg-muse-bg">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-semibold">Apps / Connectors</span>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="mb-4 max-w-lg text-sm text-muse-muted">
          Connectors must be authorized once on{" "}
          <a href="https://manus.im" target="_blank" rel="noreferrer" className="text-muse-accent underline">
            manus.im
          </a>
          . OpenMuse lists those already installed and can pass their IDs into tasks.
        </p>
        {!hasApiKey() && (
          <p className="text-sm text-amber-600">Add an API key in Settings first.</p>
        )}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muse-muted" />
          </div>
        )}
        {isError && (
          <p className="text-sm text-red-500">{(error as Error)?.message}</p>
        )}
        <ul className="grid gap-2 sm:grid-cols-2">
          {data?.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-2xl border border-muse-border bg-muse-bg/50 px-4 py-3"
            >
              <Plug className="h-4 w-4 text-muse-accent" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{c.name || c.id}</div>
                <div className="truncate text-[11px] text-muse-muted font-mono">{c.id}</div>
              </div>
            </li>
          ))}
        </ul>
        {hasApiKey() && data?.length === 0 && !isLoading && (
          <p className="mt-4 text-sm text-muse-muted">
            No connectors installed yet. Add them in Manus, then refresh.
          </p>
        )}
        <a
          href="https://manus.im"
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-1 text-sm text-muse-accent"
        >
          Open Manus integrations <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
