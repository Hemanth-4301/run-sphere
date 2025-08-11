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
    <div
      className="rounded-2xl bg-white dark:bg-black shadow-sm border border-black/10 dark:border-white/10 overflow-hidden h-full flex flex-col"
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10">
        <div className="flex gap-2">
          <button
            aria-label="Output"
            onClick={() => setTab("stdout")}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              tab === "stdout"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                : "bg-white dark:bg-black border-black/10 dark:border-white/20"
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
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              tab === "stderr"
                ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                : "bg-white dark:bg-black border-black/10 dark:border-white/20"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <AlertTriangle size={14} />
              Errors
            </span>
          </button>
        </div>

        <div className="text-xs">
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
      <div className="p-3 sm:p-4 overflow-auto">
        {!result && !running && (
          <p className="text-sm">Run code to see output here.</p>
        )}
        {running && (
          <div className="text-sm inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Executing...
          </div>
        )}

        {!!result && tab === "stdout" && (
          <div>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => copy(result.stdout)}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20"
                title="Copy output"
              >
                <Copy size={14} />
                Copy Output
              </button>
            </div>
            <pre className="font-mono text-sm whitespace-pre-wrap break-words bg-black/[0.03] dark:bg-white/[0.06] p-3 rounded-lg min-h-[120px]">
              {result.stdout || ""}
            </pre>
          </div>
        )}

        {!!result && tab === "stderr" && (
          <div>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => copy(result.stderr)}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20"
                title="Copy errors"
              >
                <Copy size={14} />
                Copy Errors
              </button>
            </div>
            <pre className="font-mono text-sm whitespace-pre-wrap break-words bg-black/[0.03] dark:bg-white/[0.06] text-red-700 dark:text-red-300 p-3 rounded-lg min-h-[120px]">
              {result.stderr || ""}
            </pre>
          </div>
        )}
      </div>

      {!!result?.logs?.length && (
        <div className="border-t border-black/10 dark:border-white/10 p-3 sm:p-4">
          <div className="text-xs font-semibold mb-1">Logs</div>
          <ul className="list-disc ml-5 text-xs space-y-1">
            {result.logs.slice(0, 10).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
