import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, FolderKanban, Loader2, Plus } from "lucide-react";
import { useProjects } from "@/hooks/useTasks";
import { createProject, hasApiKey } from "@/lib/manus-api";
import { useQueryClient } from "@tanstack/react-query";

export function ProjectsPage() {
  const { data, isLoading, isError, error } = useProjects();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();

  const create = async () => {
    if (!name.trim() || !hasApiKey()) return;
    setBusy(true);
    try {
      await createProject(name.trim());
      setName("");
      qc.invalidateQueries({ queryKey: ["projects"] });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-muse-surface">
      <header className="flex h-14 items-center gap-2 border-b border-muse-border px-3">
        <Link to="/" className="flex h-9 w-9 items-center justify-center rounded-full text-muse-muted hover:bg-muse-bg">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-semibold">Projects</span>
      </header>
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <p className="mb-4 max-w-lg text-sm text-muse-muted">
          Projects group tasks and can carry shared instructions (Muse “Goals”-like organization via Manus API).
        </p>
        <div className="mb-6 flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name"
            className="flex-1 rounded-xl border border-muse-border bg-muse-bg px-3 py-2 text-sm focus:border-muse-accent/40 focus:outline-none"
          />
          <button
            type="button"
            onClick={create}
            disabled={busy || !name.trim()}
            className="flex items-center gap-1 rounded-full bg-muse-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Create
          </button>
        </div>
        {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muse-muted" />}
        {isError && <p className="text-sm text-red-500">{(error as Error)?.message}</p>}
        <ul className="space-y-2">
          {data?.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-2xl border border-muse-border px-4 py-3"
            >
              <FolderKanban className="h-4 w-4 text-muse-accent" />
              <div>
                <div className="text-sm font-medium">{p.name || p.title || p.id}</div>
                <div className="text-[11px] font-mono text-muse-muted">{p.id}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
