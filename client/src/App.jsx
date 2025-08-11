"use client";
import { useEffect, useRef, useState } from "react";
import EditorPanel from "./components/EditorPanel.jsx";
import OutputPanel from "./components/OutputPanel.jsx";
import SavedPrograms from "./components/SavedPrograms.jsx";
import SettingsPanel from "./components/SettingsPanel.jsx";
import { runCode } from "./lib/api-setup.js";
import { saveProgram } from "./lib/localStoragePrograms.js";
import { EXAMPLES } from "./lib/examplePrograms.js";
import { useViewportHeight } from "./lib/useViewportHeight.js";
import {
  loadEditorSettings,
  saveEditorSettings,
  resetEditorSettings,
} from "./lib/editorSettings.js";
import { Moon, Sun, Play } from "lucide-react";

const THEME_KEY = "uiTheme";
const WIDTH_KEY = "editorPaneWidth"; // percent (desktop vertical split)
const OUT_HEIGHT_KEY = "outputPaneHeight"; // percent of right column height (desktop horizontal split)
const DEFAULT_WIDTH = 56;
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
    return Number.isFinite(v) ? Math.min(75, Math.max(30, v)) : DEFAULT_WIDTH;
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
    setIsMaximized(false);
    setBottomTab("settings");
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
      const clamped = Math.min(75, Math.max(30, pct));
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
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors">
      {/* Header */}
      <header className="border-b border-black/10 dark:border-white/10 sticky top-0 z-20 backdrop-blur bg-white/80 dark:bg-black/70">
        <div className="max-w-[1800px] mx-auto px-3 sm:px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-lg font-semibold tracking-tight">
              Run Sphere
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <button
                onClick={doRun}
                className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20 dark:focus-visible:ring-white/20"
                disabled={running}
                title="Run (Ctrl/Cmd + Enter)"
              >
                <Play size={16} />
                {running ? "Running..." : "Run"}
              </button>
            )}
            <button
              onClick={openSettingsDesktop}
              className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm"
              title="Editor Settings"
            >
              Settings
            </button>
            <button
              aria-label="Toggle theme"
              onClick={toggleSiteTheme}
              className="px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm"
              title="Toggle dark/light"
            >
              {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        className="max-w-[1800px] mx-auto px-3 sm:px-5 py-4"
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
      >
        {/* Desktop/Laptop: resizable split; Mobile/Tablet: tabbed views */}
        {!isMobile ? (
          <div ref={layoutRef} className="relative flex gap-2 min-h-[68vh]">
            {/* Left: Editor */}
            <div
              className="pr-1 sm:pr-2 transition-[width] duration-150 ease-out min-w-[300px]"
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
                height="clamp(50vh, 64vh, 78vh)"
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
                className={`w-2 cursor-col-resize rounded-full bg-black/10 dark:bg-white/20 hover:bg-black/20 dark:hover:bg-white/30 border border-black/10 dark:border-white/10 ${draggingV ? "bg-black/30 dark:bg-white/40" : ""}`}
              />
            )}

            {/* Right column: Output + Bottom tabs */}
            {!isMaximized && (
              <div
                ref={rightColRef}
                className="pl-1 sm:pl-2 flex-1 min-w-[300px] flex flex-col min-h-[64vh]"
              >
                <div
                  className="transition-[height] duration-150 ease-out"
                  style={{ height: `${outHeightPct}%` }}
                >
                  <div className="h-full rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 overflow-hidden shadow-sm">
                    <OutputPanel
                      result={result}
                      running={running}
                      height="100%"
                    />
                  </div>
                </div>

                {/* Tabs for bottom panel */}
                <div className="mt-3 mb-2 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setBottomTab("saved")}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      bottomTab === "saved"
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                        : "bg-white dark:bg-black border-black/10 dark:border-white/20"
                    }`}
                  >
                    Saved
                  </button>
                  <button
                    onClick={() => setBottomTab("settings")}
                    className={`px-3 py-1.5 rounded-lg text-sm border ${
                      bottomTab === "settings"
                        ? "bg-black text-white dark:bg-white dark:text-black border-black dark:border-white"
                        : "bg-white dark:bg-black border-black/10 dark:border-white/20"
                    }`}
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
                  className={`h-2 mb-2 cursor-row-resize rounded-full bg-black/10 dark:bg-white/20 hover:bg-black/20 dark:hover:bg-white/30 border border-black/10 dark:border-white/10 ${draggingH ? "bg-black/30 dark:bg-white/40" : ""}`}
                />

                <div className="transition-[height] duration-150 ease-out flex-1 min-h-[220px]">
                  <div className="h-full rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 overflow-hidden p-2 sm:p-3 shadow-sm">
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
              </div>
            )}

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
                <div className="h-full rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 overflow-hidden shadow-sm">
                  <OutputPanel
                    result={result}
                    running={running}
                    height="calc(var(--app-vh) * 65)"
                  />
                </div>
              </div>
            )}
            {activeTab === "saved" && (
              <div className="min-h-[calc(var(--app-vh)*60)]">
                <div className="rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 overflow-hidden p-2 shadow-sm">
                  <SavedPrograms onOpen={openSaved} />
                </div>
              </div>
            )}
            {activeTab === "settings" && (
              <div className="min-h-[calc(var(--app-vh)*60)]">
                <div className="rounded-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 overflow-hidden p-2 shadow-sm">
                  <SettingsPanel
                    settings={editorSettings}
                    onChange={onSettingsChange}
                    onReset={onSettingsReset}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Mobile floating dock with central Run */}
      {isMobile && (
        <nav className="fixed bottom-3 inset-x-0 z-30">
          <div className="mx-auto max-w-md px-3">
            <div className="relative rounded-2xl border border-black/10 dark:border-white/20 bg-white/90 dark:bg-black/90 backdrop-blur shadow-lg">
              <div className="grid grid-cols-5 gap-1 items-center px-2 py-2">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-2 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "editor"
                      ? "text-white bg-black dark:text-black dark:bg-white"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab("output")}
                  className={`px-2 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "output"
                      ? "text-white bg-black dark:text-black dark:bg-white"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Output
                </button>

                {/* Big Run in center */}
                <div className="flex items-center justify-center">
                  <button
                    onClick={doRun}
                    disabled={running}
                    className="h-12 w-12 -mt-8 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-xl flex items-center justify-center border border-black/10 dark:border-white/20 disabled:opacity-60"
                    title="Run"
                  >
                    {running ? "…" : <Play size={18} />}
                  </button>
                </div>

                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-2 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "saved"
                      ? "text-white bg-black dark:text-black dark:bg-white"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Saved
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`px-2 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === "settings"
                      ? "text-white bg-black dark:text-black dark:bg-white"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      <footer className="py-6 text-center text-xs text-zinc-700/80 dark:text-zinc-300/80">
        {"Use Ctrl/Cmd + Enter to Run • Ctrl/Cmd + S to Save"}
      </footer>
    </div>
  );
}
