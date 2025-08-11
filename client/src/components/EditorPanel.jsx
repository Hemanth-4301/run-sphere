"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import { EXAMPLES, STDIN_EXAMPLE } from "../lib/examplePrograms"
import { Play, Save, Trash2, Copy, ClipboardPaste, Maximize2, Minimize2, BookOpen } from "lucide-react"

const LANG_OPTIONS = [
  { value: "csharp", label: "C#", monaco: "csharp" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "python", label: "Python", monaco: "python" },
  { value: "javascript", label: "JavaScript", monaco: "javascript" },
  { value: "c", label: "C", monaco: "c" },
  { value: "cpp", label: "C++", monaco: "cpp" },
]

export default function EditorPanel({
  language,
  code,
  stdin,
  onLanguageChange,
  onCodeChange,
  onStdinChange,
  onRun,
  onClear,
  onSave,
  running,
  height = "52vh",
  isMaximized = false,
  onToggleMaximize,
  onResetSize,
  editorSettings,
  systemTheme = "dark",
}) {
  const editorRef = useRef(null)
  const containerRef = useRef(null)
  const [mounted, setMounted] = useState(false)

  const monacoLang = useMemo(() => {
    const opt = LANG_OPTIONS.find((o) => o.value === language)
    return opt?.monaco || "plaintext"
  }, [language])

  const monacoTheme = useMemo(() => {
    if (!editorSettings) return systemTheme === "dark" ? "vs-dark" : "light"
    switch (editorSettings.theme) {
      case "light":
        return "light"
      case "dark":
        return "vs-dark"
      case "hc":
        return "hc-black"
      case "system":
      default:
        return systemTheme === "dark" ? "vs-dark" : "light"
    }
  }, [editorSettings, systemTheme])

  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC")
      const runCombo = (isMac && e.metaKey && e.key === "Enter") || (!isMac && e.ctrlKey && e.key === "Enter")
      const saveCombo =
        (isMac && e.metaKey && e.key.toLowerCase() === "s") || (!isMac && e.ctrlKey && e.key.toLowerCase() === "s")

      if (runCombo) {
        e.preventDefault()
        onRun()
      } else if (saveCombo) {
        e.preventDefault()
        onSave()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onRun, onSave])

  // Ensure Monaco relayouts on container resize
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(() => {
      if (editorRef.current?.layout) {
        try {
          editorRef.current.layout()
        } catch {}
      }
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const loadExample = () => {
    onCodeChange(EXAMPLES[language] || "")
    onStdinChange(STDIN_EXAMPLE[language] || "")
  }

  const copySelected = async () => {
    try {
      const ed = editorRef.current
      const text = ed ? ed.getModel().getValueInRange(ed.getSelection()) : ""
      await navigator.clipboard.writeText(text)
    } catch {}
  }

  const pasteAtCursor = async () => {
    try {
      const ed = editorRef.current
      const txt = await navigator.clipboard.readText()
      if (ed) {
        ed.trigger("keyboard", "type", { text: txt })
      } else {
        onCodeChange((code || "") + txt)
      }
    } catch {}
  }

  return (
    <div className="relative">
      {/* Gradient frame */}
      <div className="rounded-2xl p-[1.5px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-rose-500 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        {/* Glass container */}
        <div
          ref={containerRef}
          className="rounded-2xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-hidden h-full flex flex-col"
        >
          {/* Top command bar */}
          <div className="px-3 sm:px-4 py-2.5 border-b border-white/30 dark:border-white/10 bg-gradient-to-r from-white/60 via-white/40 to-white/20 dark:from-zinc-900/70 dark:via-zinc-900/50 dark:to-zinc-900/30 backdrop-blur supports-[backdrop-filter]:backdrop-blur flex flex-wrap items-center justify-between gap-2">
            {/* Left: language + example */}
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <div className="flex items-center gap-2">
                <label htmlFor="lang" className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-100">
                  Language
                </label>
                <select
                  id="lang"
                  aria-label="Language"
                  className="text-[13px] sm:text-sm rounded-full px-2.5 py-1.5 bg-white/90 dark:bg-zinc-950/80 border border-zinc-200/60 dark:border-white/10 text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
                  value={language}
                  onChange={(e) => onLanguageChange(e.target.value)}
                >
                  {LANG_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={loadExample}
                className="inline-flex items-center gap-1.5 text-[13px] sm:text-sm px-3 py-1.5 rounded-full border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 text-zinc-900 dark:text-zinc-100 hover:bg-white/100 dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60"
                title="Load Hello World and stdin example"
              >
                <BookOpen size={16} className="text-fuchsia-600 dark:text-fuchsia-400" />
                Load Example
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
              {/* Mobile compact row */}
              <div className="flex md:hidden items-center gap-1.5">
                <button
                  onClick={copySelected}
                  className="min-w-fit px-3 py-1.5 rounded-full text-xs sm:text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={pasteAtCursor}
                  className="min-w-fit px-3 py-1.5 rounded-full text-xs sm:text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                >
                  <ClipboardPaste size={14} />
                </button>
                <button
                  onClick={onClear}
                  className="min-w-fit px-3 py-1.5 rounded-full text-xs sm:text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 disabled:opacity-50"
                  disabled={running}
                  title="Clear"
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={onSave}
                  className="min-w-fit px-3 py-1.5 rounded-full text-xs sm:text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 disabled:opacity-50"
                  disabled={running}
                  title="Save (Ctrl/Cmd+S)"
                >
                  <Save size={14} />
                </button>
              </div>

              {/* Desktop actions */}
              <div className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={onClear}
                  className="px-3 py-1.5 rounded-full text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60 disabled:opacity-50"
                  disabled={running}
                  title="Clear"
                >
                  <span className="inline-flex items-center gap-1">
                    <Trash2 size={16} /> Clear
                  </span>
                </button>
                <button
                  onClick={onSave}
                  className="px-3 py-1.5 rounded-full text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60 disabled:opacity-50"
                  disabled={running}
                  title="Save (Ctrl/Cmd+S)"
                >
                  <span className="inline-flex items-center gap-1">
                    <Save size={16} /> Save
                  </span>
                </button>
                <button
                  aria-label="Run"
                  onClick={onRun}
                  className="px-4 py-1.5 rounded-full text-sm text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-rose-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-rose-500 shadow-md disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
                  disabled={running}
                  title="Run (Ctrl/Cmd + Enter)"
                >
                  <span className="inline-flex items-center gap-2 font-medium">
                    <Play size={16} className="text-white" />
                    {running ? "Running..." : "Run"}
                  </span>
                </button>
                <div className="hidden lg:flex items-center gap-2">
                  {!!onToggleMaximize && (
                    <button
                      onClick={onToggleMaximize}
                      className="px-3 py-1.5 rounded-full text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                      title={isMaximized ? "Exit Full Width" : "Expand Editor"}
                    >
                      <span className="inline-flex items-center gap-1">
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        {isMaximized ? "Exit" : "Expand"}
                      </span>
                    </button>
                  )}
                  {!!onResetSize && (
                    <button
                      onClick={onResetSize}
                      className="px-3 py-1.5 rounded-full text-sm border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 transition-colors shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
                      title="Reset panel size"
                    >
                      Reset Size
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 min-h-[220px]">
            <Editor
              height={height}
              defaultLanguage={monacoLang}
              language={monacoLang}
              theme={mounted ? monacoTheme : "light"}
              value={code}
              onChange={(v) => onCodeChange(v ?? "")}
              options={{
                fontFamily: editorSettings?.fontFamily,
                fontSize: editorSettings?.fontSize ?? 14,
                minimap: { enabled: !!editorSettings?.minimap },
                scrollBeyondLastLine: false,
                wordWrap: editorSettings?.wordWrap ?? "on",
                smoothScrolling: true,
                tabSize: editorSettings?.tabSize ?? 2,
                lineNumbers: editorSettings?.lineNumbers ?? "on",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                renderWhitespace: "selection",
                contextmenu: true,
                dragAndDrop: true,
              }}
              onMount={(editor) => {
                editorRef.current = editor
                setMounted(true)
              }}
            />
          </div>

          {/* Stdin */}
          <div className="p-3 sm:p-4 border-t border-white/30 dark:border-white/10 bg-gradient-to-r from-white/40 via-white/30 to-white/20 dark:from-zinc-900/60 dark:via-zinc-900/50 dark:to-zinc-900/30">
            <label className="block text-sm font-medium mb-1.5 text-zinc-800 dark:text-zinc-200">
              Standard Input (stdin)
            </label>
            <textarea
              aria-label="stdin"
              className="w-full rounded-xl border border-zinc-200/60 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-2.5 h-28 font-mono text-sm text-zinc-900 dark:text-zinc-100 shadow-inner focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Optional input supplied to the program..."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
