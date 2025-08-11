"use client"

import { useState } from "react"

export default function OutputPanel({ result, running, height = "420px" }) {
  const [tab, setTab] = useState("stdout")

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text || "")
    } catch (e) {
      console.error("Copy failed", e)
    }
  }

  return (
    <div
      className="rounded-xl bg-card-light dark:bg-card-dark shadow-soft border border-black/10 dark:border-white/10 overflow-hidden h-full flex flex-col pane"
      style={{ height }}
    >
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10">
        <div className="flex gap-2">
          <button
            aria-label="Output"
            onClick={() => setTab("stdout")}
            className={`px-3 py-1.5 rounded-lg text-sm border ${tab === "stdout" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
          >
            Output
          </button>
          <button
            aria-label="Errors"
            onClick={() => setTab("stderr")}
            className={`px-3 py-1.5 rounded-lg text-sm border ${tab === "stderr" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
          >
            Errors
          </button>
        </div>
        <div className="text-xs text-gray-700 dark:text-gray-300">
          {running ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-black dark:bg-white animate-pulse"></span>
              Running...
            </span>
          ) : result ? (
            <span>
              {result.status?.toUpperCase?.() || "DONE"} • {result.durationMs != null ? `${result.durationMs} ms` : "-"}
            </span>
          ) : (
            <span>Idle</span>
          )}
        </div>
      </div>

      <div className="pane-body p-3 sm:p-4 scrollbar-thin">
        {!result && !running && (
          <p className="text-sm text-gray-700 dark:text-gray-300">Run code to see output here.</p>
        )}
        {running && <div className="text-sm text-gray-900 dark:text-gray-100">Executing...</div>}
        {!!result && tab === "stdout" && (
          <div>
            <div className="flex justify-end mb-2">
              <button
                onClick={() => copy(result.stdout)}
                className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 bg-white dark:bg-black"
              >
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
                className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 bg-white dark:bg-black"
              >
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
          <div className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Logs</div>
          <ul className="list-disc ml-5 text-xs text-gray-700 dark:text-gray-300 space-y-1">
            {result.logs.slice(0, 10).map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
