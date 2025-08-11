"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { EXAMPLES, STDIN_EXAMPLE } from "../lib/examplePrograms";

const LANG_OPTIONS = [
  { value: "csharp", label: "C#", monaco: "csharp" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "python", label: "Python", monaco: "python" },
  { value: "javascript", label: "JavaScript", monaco: "javascript" },
  { value: "c", label: "C", monaco: "c" },
  { value: "cpp", label: "C++", monaco: "cpp" },
];

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
  const editorRef = useRef(null);
  const containerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  const monacoLang = useMemo(() => {
    const opt = LANG_OPTIONS.find((o) => o.value === language);
    return opt?.monaco || "plaintext";
  }, [language]);

  const monacoTheme = useMemo(() => {
    if (!editorSettings) return systemTheme === "dark" ? "vs-dark" : "light";
    switch (editorSettings.theme) {
      case "light":
        return "light";
      case "dark":
        return "vs-dark";
      case "hc":
        return "hc-black";
      case "system":
      default:
        return systemTheme === "dark" ? "vs-dark" : "light";
    }
  }, [editorSettings, systemTheme]);

  useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const runCombo =
        (isMac && e.metaKey && e.key === "Enter") ||
        (!isMac && e.ctrlKey && e.key === "Enter");
      const saveCombo =
        (isMac && e.metaKey && e.key.toLowerCase() === "s") ||
        (!isMac && e.ctrlKey && e.key.toLowerCase() === "s");
      if (runCombo) {
        e.preventDefault();
        onRun();
      } else if (saveCombo) {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onRun, onSave]);

  // Ensure Monaco relayouts on container resize
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (editorRef.current?.layout) {
        try {
          editorRef.current.layout();
        } catch {}
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const loadExample = () => {
    onCodeChange(EXAMPLES[language] || "");
    onStdinChange(STDIN_EXAMPLE[language] || "");
  };

  const copySelected = async () => {
    try {
      const ed = editorRef.current;
      const text = ed ? ed.getModel().getValueInRange(ed.getSelection()) : "";
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  const pasteAtCursor = async () => {
    try {
      const ed = editorRef.current;
      const txt = await navigator.clipboard.readText();
      if (ed) {
        ed.trigger("keyboard", "type", { text: txt });
      } else {
        onCodeChange((code || "") + txt);
      }
    } catch {}
  };

  return (
    <div
      ref={containerRef}
      className="rounded-xl bg-card-light dark:bg-card-dark shadow-soft border border-black/10 dark:border-white/10 overflow-hidden h-full flex flex-col"
    >
      <div className="px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10 flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <label htmlFor="lang" className="text-sm">
            Language
          </label>
          <select
            id="lang"
            aria-label="Language"
            className="text-sm rounded-lg px-2 py-1 bg-white dark:bg-black border border-black/10 dark:border-white/20"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            {LANG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadExample}
            className="text-sm px-2 py-1 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Load Hello World and stdin example"
          >
            Load Example
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-hidden">
          {/* Mobile action buttons (visible on small screens) */}
          <div className="md:hidden flex flex-wrap gap-1 xs:flex-col xs:gap-2">
            <button
              onClick={copySelected}
              className="min-w-fit max-w-[120px] px-2.5 py-1.5 rounded-lg text-xs sm:text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Copy Selected
            </button>
            <button
              onClick={pasteAtCursor}
              className="min-w-fit max-w-[120px] px-2.5 py-1.5 rounded-lg text-xs sm:text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Paste
            </button>
            <button
              onClick={onClear}
              className="min-w-fit max-w-[120px] px-2.5 py-1.5 rounded-lg text-xs sm:text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={running}
              title="Clear"
            >
              Clear
            </button>
            <button
              onClick={onSave}
              className="min-w-fit max-w-[120px] px-2.5 py-1.5 rounded-lg text-xs sm:text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={running}
              title="Save (Ctrl/Cmd+S)"
            >
              Save
            </button>
          </div>

          {/* Desktop action buttons */}
          <button
            onClick={onClear}
            className="hidden md:inline-block px-3 py-1.5 rounded-lg text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={running}
            title="Clear"
          >
            Clear
          </button>
          <button
            onClick={onSave}
            className="hidden md:inline-block px-3 py-1.5 rounded-lg text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={running}
            title="Save (Ctrl/Cmd+S)"
          >
            Save
          </button>
          <button
            aria-label="Run"
            onClick={onRun}
            className="hidden md:inline-block px-4 py-1.5 rounded-lg text-sm bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
            disabled={running}
            title="Run (Ctrl/Cmd + Enter)"
          >
            {running ? "Running..." : "Run ▶"}
          </button>

          <div className="hidden lg:flex items-center gap-2">
            {!!onToggleMaximize && (
              <button
                onClick={onToggleMaximize}
                className="px-3 py-1.5 rounded-lg text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
                title={isMaximized ? "Exit Full Width" : "Expand Editor"}
              >
                {isMaximized ? "Exit Full Width" : "Expand Editor"}
              </button>
            )}
            {!!onResetSize && (
              <button
                onClick={onResetSize}
                className="px-3 py-1.5 rounded-lg text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Reset panel size"
              >
                Reset Size
              </button>
            )}
          </div>
        </div>
      </div>

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
            editorRef.current = editor;
            setMounted(true);
          }}
        />
      </div>

      <div className="p-3 sm:p-4 border-t border-black/10 dark:border-white/10">
        <label className="block text-sm mb-1">Standard Input (stdin)</label>
        <textarea
          aria-label="stdin"
          className="w-full rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black p-2 h-24 font-mono text-sm"
          value={stdin}
          onChange={(e) => onStdinChange(e.target.value)}
          placeholder="Optional input supplied to the program..."
        />
      </div>
    </div>
  );
}
