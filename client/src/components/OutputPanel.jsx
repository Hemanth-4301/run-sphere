"use client";
import { useState } from "react";
import { Copy, Terminal, AlertTriangle, Loader2 } from "lucide-react";

export default function OutputPanel({ result, running, height = "420px" }) {
  const [tab, setTab] = useState("stdout");

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "");
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const status = (() => {
    if (running) return "Running...";
    if (result) {
      const s = result.status?.toUpperCase?.() || "DONE";
      const t = result.durationMs != null ? `${result.durationMs} ms` : "-";
      return `${s} • ${t}`;
    }
    return "Idle";
  })();

  return (
    <div className="h-full" style={{ height }}>
      <div className="h-full rounded-2xl p-[1.5px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-rose-500 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        <div className="h-full rounded-2xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-white/30 dark:border-white/10 bg-gradient-to-r from-white/50 via-white/35 to-white/20 dark:from-zinc-900/60 dark:via-zinc-900/45 dark:to-zinc-900/30">
            <div className="flex gap-2">
              <button
                aria-label="Output"
                onClick={() => setTab("stdout")}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  tab === "stdout"
                    ? "text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-rose-600 border-transparent"
                    : "bg-white/90 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 border-white/40 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-900"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <Terminal size={14} />
                  Output
                </span>
              </button>
              <button
                aria-label="Errors"
                onClick={() => setTab("stderr")}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  tab === "stderr"
                    ? "text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-rose-600 border-transparent"
                    : "bg-white/90 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 border-white/40 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-900"
                }`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  Errors
                </span>
              </button>
            </div>

            <div className="text-xs text-zinc-800 dark:text-zinc-200">
              {running ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {status}
                </span>
              ) : (
                <span>{status}</span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-3 sm:p-4 overflow-auto scrollbar-thin">
            {!result && !running && (
              <p className="text-sm text-zinc-800/80 dark:text-zinc-200/80">
                Run code to see output here.
              </p>
            )}
            {running && (
              <div className="text-sm text-zinc-900 dark:text-zinc-100 inline-flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Executing...
              </div>
            )}

            {!!result && tab === "stdout" && (
              <div>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => copy(result.stdout)}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
                    title="Copy output"
                  >
                    <Copy size={14} />
                    Copy Output
                  </button>
                </div>
                <pre className="font-mono text-sm whitespace-pre-wrap break-words bg-zinc-950/[0.03] dark:bg-white/[0.06] p-3 rounded-xl min-h-[120px] text-zinc-900 dark:text-zinc-100">
                  {result.stdout || ""}
                </pre>
              </div>
            )}

            {!!result && tab === "stderr" && (
              <div>
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => copy(result.stderr)}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60"
                    title="Copy errors"
                  >
                    <Copy size={14} />
                    Copy Errors
                  </button>
                </div>
                <pre className="font-mono text-sm whitespace-pre-wrap break-words bg-zinc-950/[0.03] dark:bg-white/[0.06] p-3 rounded-xl min-h-[120px] text-red-700 dark:text-red-300">
                  {result.stderr || ""}
                </pre>
              </div>
            )}
          </div>

          {!!result?.logs?.length && (
            <div className="border-t border-white/30 dark:border-white/10 p-3 sm:p-4">
              <div className="text-xs font-semibold mb-1 text-zinc-800 dark:text-zinc-200">
                Logs
              </div>
              <ul className="list-disc ml-5 text-xs text-zinc-800/90 dark:text-zinc-200/90 space-y-1">
                {result.logs.slice(0, 10).map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
