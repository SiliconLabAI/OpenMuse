import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Webhook,
  Loader2,
} from "lucide-react";
import {
  setApiKey,
  clearApiKey,
  hasApiKey,
  registerWebhook,
  serverBase,
} from "@/lib/manus-api";
import { useValidateKey, useCredits } from "@/hooks/useTasks";

export function SettingsPage() {
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(hasApiKey());
  const [msg, setMsg] = useState<string | null>(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [hookMsg, setHookMsg] = useState<string | null>(null);
  const [hookBusy, setHookBusy] = useState(false);
  const validate = useValidateKey();
  const { data: credits } = useCredits();

  const save = async () => {
    if (!key.trim()) {
      setMsg("Paste a Manus API key first.");
      return;
    }
    setApiKey(key);
    setSaved(true);
    setMsg(null);
    try {
      await validate.mutateAsync();
      setMsg("API key saved and validated.");
    } catch (e) {
      setMsg(
        e instanceof Error
          ? `Saved, but validation failed: ${e.message}`
          : "Saved, but validation failed."
      );
    }
  };

  const remove = () => {
    clearApiKey();
    setKey("");
    setSaved(false);
    setMsg("API key removed.");
  };

  const register = async () => {
    setHookBusy(true);
    setHookMsg(null);
    try {
      const res = await registerWebhook(publicUrl.trim() || undefined);
      if (res.ok === false) {
        setHookMsg(res.error?.message || "Registration failed");
      } else {
        setHookMsg(
          `Registered: ${res.registered_url || "ok"}. ${res.note || ""}`
        );
      }
    } catch (e) {
      setHookMsg(e instanceof Error ? e.message : "failed");
    } finally {
      setHookBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-muse-surface">
      <header className="flex h-14 items-center gap-2 border-b border-muse-border px-3">
        <Link
          to="/"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muse-muted hover:bg-muse-bg"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-semibold">Settings</span>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-6 py-8 space-y-5">
        <section className="rounded-2xl border border-muse-border bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Key className="h-5 w-5 text-muse-accent" />
            <h2 className="font-semibold">Manus API key</h2>
          </div>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={saved ? "••••••••" : "manus_…"}
            className="mb-3 w-full rounded-xl border border-muse-border bg-muse-bg px-4 py-3 text-sm focus:border-muse-accent/50 focus:outline-none"
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={validate.isPending}
              className="rounded-full bg-muse-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {validate.isPending ? "Validating…" : "Save key"}
            </button>
            {saved && (
              <button
                type="button"
                onClick={remove}
                className="rounded-full border border-muse-border px-4 py-2 text-sm text-muse-muted"
              >
                Remove
              </button>
            )}
            <a
              href="https://manus.im"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2 text-sm text-muse-accent"
            >
              Manus <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          {msg && (
            <div
              className={`mt-3 flex gap-2 rounded-xl px-3 py-2 text-sm ${
                msg.includes("fail") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
              }`}
            >
              {msg.includes("fail") ? (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              )}
              {msg}
            </div>
          )}
          {credits && (
            <p className="mt-3 text-xs text-muse-muted">
              Credits:{" "}
              {String(
                credits.credits ?? credits.balance ?? JSON.stringify(credits).slice(0, 80)
              )}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-muse-border bg-white p-5 shadow-soft">
          <div className="mb-3 flex items-center gap-2">
            <Webhook className="h-5 w-5 text-muse-accent" />
            <h2 className="font-semibold">Async webhook callback</h2>
          </div>
          <p className="mb-3 text-sm text-muse-muted">
            Manus tasks are async. This server exposes{" "}
            <code className="text-xs bg-muse-bg px-1 rounded">POST /webhook/manus</code>{" "}
            for <code className="text-xs">task_created</code> /{" "}
            <code className="text-xs">task_stopped</code>. Local URL:{" "}
            <code className="text-xs bg-muse-bg px-1 rounded">
              {serverBase()}/webhook/manus
            </code>
            . For real Manus delivery, tunnel with ngrok and paste the public HTTPS URL below.
          </p>
          <input
            value={publicUrl}
            onChange={(e) => setPublicUrl(e.target.value)}
            placeholder="https://xxxx.ngrok.io/webhook/manus (optional)"
            className="mb-3 w-full rounded-xl border border-muse-border bg-muse-bg px-4 py-3 text-sm focus:outline-none"
          />
          <button
            type="button"
            onClick={register}
            disabled={hookBusy || !hasApiKey()}
            className="flex items-center gap-2 rounded-full bg-muse-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            {hookBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Register webhook with Manus
          </button>
          {hookMsg && (
            <p className="mt-3 text-sm text-muse-muted whitespace-pre-wrap">{hookMsg}</p>
          )}
        </section>

        <section className="rounded-2xl border border-muse-border bg-white p-5 shadow-soft text-sm text-muse-muted">
          <h2 className="mb-2 font-semibold text-muse-text">OpenMuse scope</h2>
          Chat, approvals, connectors list, projects, files, usage, and webhooks —
          only features backed by{" "}
          <a
            href="https://open.manus.ai/docs/v2/introduction"
            className="text-muse-accent underline"
            target="_blank"
            rel="noreferrer"
          >
            Manus API v2
          </a>
          . Not Meta Secure VM / WhatsApp platform access.
        </section>
      </div>
    </div>
  );
}
