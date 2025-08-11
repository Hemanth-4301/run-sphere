"use client";

import { useEffect, useRef, useState } from "react";
import EditorPanel from "./components/EditorPanel.jsx";
import OutputPanel from "./components/OutputPanel.jsx";
import SavedPrograms from "./components/SavedPrograms.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import { runCode } from "./lib/api.js";
import { saveProgram } from "./lib/localStoragePrograms.js";
import { EXAMPLES } from "./lib/examplePrograms.js";
import { useViewportHeight } from "./lib/useViewportHeight.js";
import {
  loadEditorSettings,
  saveEditorSettings,
  resetEditorSettings,
} from "./lib/editorSettings.js";
import { Moon, Sun } from "lucide-react";

const THEME_KEY = "uiTheme";
const WIDTH_KEY = "editorPaneWidth"; // percent (desktop vertical split)
const OUT_HEIGHT_KEY = "outputPaneHeight"; // percent of right column height (desktop horizontal split)
const DEFAULT_WIDTH = 58;
const DEFAULT_OUT_HEIGHT = 55;

export default function App() {
  useViewportHeight();

  const [theme, setTheme] = useState(
    () => localStorage.getItem(THEME_KEY) || "dark"
  );
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(EXAMPLES["javascript"] || "");
  const [stdin, setStdin] = useState("");
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState([]);

  // Mobile tabs: editor | output | saved | settings
  const [activeTab, setActiveTab] = useState("editor");
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia("(max-width: 1024px)").matches
  );
  const touchRef = useRef({ x: 0, y: 0 });

  // Desktop resizable layout
  const [editorWidthPct, setEditorWidthPct] = useState(() => {
    const v = Number.parseFloat(localStorage.getItem(WIDTH_KEY));
    return Number.isFinite(v) ? Math.min(80, Math.max(35, v)) : DEFAULT_WIDTH;
  });
  const [outHeightPct, setOutHeightPct] = useState(() => {
    const v = Number.parseFloat(localStorage.getItem(OUT_HEIGHT_KEY));
    return Number.isFinite(v)
      ? Math.min(80, Math.max(35, v))
      : DEFAULT_OUT_HEIGHT;
  });
  const [isMaximized, setIsMaximized] = useState(false);
  const [draggingV, setDraggingV] = useState(false);
  const [draggingH, setDraggingH] = useState(false);
  const layoutRef = useRef(null);
  const rightColRef = useRef(null);
  const [bottomTab, setBottomTab] = useState("saved"); // desktop bottom panel: saved | settings

  // Editor settings
  const [editorSettings, setEditorSettings] = useState(() =>
    loadEditorSettings()
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1024px)");
    const cb = (e) => setIsMobile(e.matches);
    mq.addEventListener?.("change", cb);
    return () => mq.removeEventListener?.("change", cb);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleSiteTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  function openSettingsDesktop() {
    // make sure the right column is visible
    setIsMaximized(false);
    // show settings in the bottom panel
    setBottomTab("settings");
    // scroll the right column into view if available
    if (rightColRef.current) {
      rightColRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  // Desktop vertical drag
  useEffect(() => {
    if (!draggingV) return;
    const onMove = (e) => {
      if (!layoutRef.current) return;
      const rect = layoutRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = (x / rect.width) * 100;
      const clamped = Math.min(80, Math.max(35, pct));
      setEditorWidthPct(clamped);
    };
    const onUp = () => {
      setDraggingV(false);
      localStorage.setItem(WIDTH_KEY, String(editorWidthPct));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draggingV, editorWidthPct]);

  // Desktop horizontal drag (inside right column)
  useEffect(() => {
    if (!draggingH) return;
    const onMove = (e) => {
      if (!rightColRef.current) return;
      const rect = rightColRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const pct = (y / rect.height) * 100;
      const clamped = Math.min(80, Math.max(35, pct));
      setOutHeightPct(clamped);
    };
    const onUp = () => {
      setDraggingH(false);
      localStorage.setItem(OUT_HEIGHT_KEY, String(outHeightPct));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [draggingH, outHeightPct]);

  const resetSize = () => {
    setEditorWidthPct(DEFAULT_WIDTH);
    localStorage.setItem(WIDTH_KEY, String(DEFAULT_WIDTH));
  };
  const resetRightSplit = () => {
    setOutHeightPct(DEFAULT_OUT_HEIGHT);
    localStorage.setItem(OUT_HEIGHT_KEY, String(DEFAULT_OUT_HEIGHT));
  };
  const toggleMaximize = () => setIsMaximized((v) => !v);

  const onSettingsChange = (s) => {
    setEditorSettings(s);
    saveEditorSettings(s);
  };
  const onSettingsReset = () => {
    const s = resetEditorSettings();
    setEditorSettings(s);
  };

  const doRun = async () => {
    setRunning(true);
    setResult(null);
    const startedAt = Date.now();
    try {
      const resp = await runCode({ language, code, stdin, timeoutMs: 10000 });
      setResult(resp);
      setRuns((r) => [
        {
          id: resp.id,
          language,
          status: resp.status,
          durationMs: resp.durationMs,
          at: new Date().toISOString(),
        },
        ...r,
      ]);
      if (isMobile) setActiveTab("output");
    } catch (e) {
      setResult({
        status: "error",
        stdout: "",
        stderr: e.message || "Run failed",
        durationMs: Date.now() - startedAt,
      });
      if (isMobile) setActiveTab("output");
    } finally {
      setRunning(false);
    }
  };

  const doClear = () => {
    setCode("");
    setStdin("");
    setResult(null);
  };

  const doSave = () => {
    const name = prompt("Save program as:", "Untitled");
    if (!name) return;
    const id = saveProgram({ name, language, code });
    alert("Saved with id: " + id);
  };

  const openSaved = (item) => {
    setLanguage(item.language);
    setCode(item.code);
    if (isMobile) setActiveTab("editor");
  };

  // Mobile swipe between Editor and Output
  const onTouchStart = (e) => {
    const t = e.changedTouches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e) => {
    const t = e.changedTouches[0];
    const dx = t.clientX - touchRef.current.x;
    const dy = t.clientY - touchRef.current.y;
    if (Math.abs(dx) > 60 && Math.abs(dy) < 50) {
      if (dx < 0 && activeTab === "editor") setActiveTab("output");
      if (dx > 0 && activeTab === "output") setActiveTab("editor");
    }
  };

  const systemTheme = theme;

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-black dark:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-black/10 dark:border-white/10 sticky top-0 z-20 backdrop-blur bg-white/70 dark:bg-black/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold">Run Sphere</div>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <button
                onClick={doRun}
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black"
                disabled={running}
                title="Run (Ctrl/Cmd + Enter)"
              >
                {running ? "Running..." : "Run ▶"}
              </button>
            )}
            <button
              onClick={openSettingsDesktop}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black"
              title="Editor Settings"
            >
              Settings
            </button>
            <button
              aria-label="Toggle theme"
              onClick={toggleSiteTheme}
              className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black"
              title="Toggle dark/light"
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        className="max-w-7xl mx-auto px-3 sm:px-6 py-4"
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
      >
        {/* Desktop: resizable split; Mobile: tabbed views */}
        {!isMobile ? (
          <div ref={layoutRef} className="relative flex gap-0 min-h-[72vh]">
            {/* Left: Editor */}
            <div
              className="pr-3 transition-[width] duration-150 ease-out min-w-[320px]"
              style={{ width: isMaximized ? "100%" : `${editorWidthPct}%` }}
            >
              <EditorPanel
                language={language}
                code={code}
                stdin={stdin}
                onLanguageChange={setLanguage}
                onCodeChange={setCode}
                onStdinChange={setStdin}
                onRun={doRun}
                onClear={doClear}
                onSave={doSave}
                running={running}
                height="66vh"
                isMaximized={isMaximized}
                onToggleMaximize={toggleMaximize}
                onResetSize={() => {
                  resetSize();
                  resetRightSplit();
                }}
                editorSettings={editorSettings}
                systemTheme={systemTheme}
              />
            </div>

            {/* Divider (vertical) */}
            {!isMaximized && (
              <div
                role="separator"
                aria-orientation="vertical"
                title="Drag to resize (double-click to reset)"
                onDoubleClick={() => {
                  resetSize();
                  resetRightSplit();
                }}
                onMouseDown={() => setDraggingV(true)}
                className={`w-1.5 cursor-col-resize bg-black/10 dark:bg-white/20 rounded-full hover:bg-black/20 dark:hover:bg-white/30 ${draggingV ? "bg-black/30 dark:bg-white/40" : ""}`}
              />
            )}

            {/* Right column: Output (top) + Bottom tabs (Saved | Settings) with horizontal resizer */}
            {!isMaximized && (
              <div
                ref={rightColRef}
                className="pl-3 flex-1 min-w-[340px] flex flex-col min-h-[66vh]"
              >
                <div
                  className="transition-[height] duration-150 ease-out"
                  style={{ height: `${outHeightPct}%` }}
                >
                  <OutputPanel
                    result={result}
                    running={running}
                    height="100%"
                  />
                </div>

                {/* Tabs for bottom panel */}
                <div className="mt-2 mb-2 flex items-center gap-2">
                  <button
                    onClick={() => setBottomTab("saved")}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${bottomTab === "saved" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setBottomTab("settings")}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${bottomTab === "settings" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
                  >
                    Settings
                  </button>
                </div>

                {/* Horizontal divider */}
                <div
                  role="separator"
                  aria-orientation="horizontal"
                  title="Drag to resize (double-click to reset)"
                  onDoubleClick={resetRightSplit}
                  onMouseDown={() => setDraggingH(true)}
                  className={`h-1.5 mb-2 cursor-row-resize bg-black/10 dark:bg-white/20 rounded-full hover:bg-black/20 dark:hover:bg-white/30 ${draggingH ? "bg-black/30 dark:bg-white/40" : ""}`}
                />

                <div className="transition-[height] duration-150 ease-out flex-1 min-h-[220px]">
                  {bottomTab === "saved" ? (
                    <SavedPrograms onOpen={openSaved} />
                  ) : (
                    <SettingsPanel
                      settings={editorSettings}
                      onChange={onSettingsChange}
                      onReset={onSettingsReset}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Drag overlays */}
            {(draggingV || draggingH) && (
              <div
                className="fixed inset-0 z-10"
                onMouseUp={() => (setDraggingV(false), setDraggingH(false))}
              />
            )}
          </div>
        ) : (
          <>
            {activeTab === "editor" && (
              <EditorPanel
                language={language}
                code={code}
                stdin={stdin}
                onLanguageChange={setLanguage}
                onCodeChange={setCode}
                onStdinChange={setStdin}
                onRun={doRun}
                onClear={doClear}
                onSave={doSave}
                running={running}
                height="calc(var(--app-vh) * 62)"
                editorSettings={editorSettings}
                systemTheme={systemTheme}
              />
            )}
            {activeTab === "output" && (
              <div className="h-[1px] min-h-[calc(var(--app-vh)*65)]">
                <OutputPanel
                  result={result}
                  running={running}
                  height="calc(var(--app-vh) * 65)"
                />
              </div>
            )}
            {activeTab === "saved" && (
              <div className="min-h-[calc(var(--app-vh)*60)]">
                <SavedPrograms onOpen={openSaved} />
              </div>
            )}
            {activeTab === "settings" && (
              <div className="min-h-[calc(var(--app-vh)*60)] ">
                <SettingsPanel
                  settings={editorSettings}
                  onChange={onSettingsChange}
                  onReset={onSettingsReset}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile bottom navigation with central Run */}
      {isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-black/90 backdrop-blur border-t border-black/10 dark:border-white/10 safe-bottom">
          <div className="max-w-7xl mx-auto px-2 py-2 grid grid-cols-5 gap-2 items-center">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-2 py-2 rounded-lg text-sm border ${activeTab === "editor" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("output")}
              className={`px-2 py-2 rounded-lg text-sm border ${activeTab === "output" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
            >
              Output
            </button>
            {/* Big Run in center */}
            <button
              onClick={doRun}
              disabled={running}
              className="px-3 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black"
              title="Run"
            >
              {running ? "…" : "▶"}
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`px-2 py-2 rounded-lg text-sm border ${activeTab === "saved" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
            >
              Saved
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-2 py-2 rounded-lg text-sm border ${activeTab === "settings" ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-black border-black/10 dark:border-white/20"}`}
            >
              Settings
            </button>
          </div>
        </nav>
      )}

      <footer className="py-6 text-center text-xs text-gray-700 dark:text-gray-300">
        Use Ctrl/Cmd + Enter to Run • Ctrl/Cmd + S to Save
      </footer>
    </div>
  );
}
