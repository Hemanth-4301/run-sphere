"use client"

export default function SettingsPanel({ settings, onChange, onReset }) {
  const update = (k, v) => onChange({ ...settings, [k]: v })

  return (
    <div className="h-full">
      <div className="h-full rounded-2xl p-[1.5px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-rose-500 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        <div className="h-full rounded-2xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-auto flex flex-col">
          <div className="px-3 sm:px-4 py-2.5 border-b border-white/30 dark:border-white/10 font-semibold text-zinc-900 dark:text-zinc-100 bg-gradient-to-r from-white/50 via-white/35 to-white/20 dark:from-zinc-900/60 dark:via-zinc-900/45 dark:to-zinc-900/30">
            Editor Settings
          </div>

          <div className="p-3 sm:p-4 space-y-4 text-sm">
            {/* Theme */}
            <div>
              <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">Editor Theme</label>
              <select
                className="w-full rounded-xl border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
                value={settings.theme}
                onChange={(e) => update("theme", e.target.value)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="hc">High Contrast</option>
              </select>
            </div>

            {/* Font family */}
            <div>
              <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">Font Family</label>
              <select
                className="w-full rounded-xl border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                value={settings.fontFamily}
                onChange={(e) => update("fontFamily", e.target.value)}
              >
                <option value={'"Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace'}>Fira Code</option>
                <option value={'"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'}>
                  JetBrains Mono
                </option>
                <option value={'"Cascadia Code", ui-monospace, SFMono-Regular, Menlo, monospace'}>Cascadia Code</option>
                <option value={'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'}>
                  Menlo/Monaco
                </option>
              </select>
            </div>

            {/* Font size */}
            <div>
              <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">
                {"Font Size: "}
                {settings.fontSize}
                {"px"}
              </label>
              <input
                type="range"
                min={10}
                max={24}
                step={1}
                value={settings.fontSize}
                onChange={(e) => update("fontSize", Number(e.target.value))}
                className="w-full accent-fuchsia-600"
              />
            </div>

            {/* Tab size */}
            <div>
              <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">Tab Size</label>
              <input
                type="number"
                min={2}
                max={8}
                value={settings.tabSize}
                onChange={(e) => update("tabSize", Math.max(2, Math.min(8, Number(e.target.value) || 2)))}
                className="w-24 rounded-xl border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/60"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="inline-flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
                <input
                  type="checkbox"
                  checked={settings.minimap}
                  onChange={(e) => update("minimap", e.target.checked)}
                  className="accent-fuchsia-600 h-4 w-4"
                />
                <span>Show Minimap</span>
              </label>

              <div>
                <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">Word Wrap</label>
                <select
                  className="w-full rounded-xl border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
                  value={settings.wordWrap}
                  onChange={(e) => update("wordWrap", e.target.value)}
                >
                  <option value="off">Off</option>
                  <option value="on">On</option>
                  <option value="bounded">Bounded</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 text-zinc-900 dark:text-zinc-100">Line Numbers</label>
                <select
                  className="w-full rounded-xl border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 p-2 text-zinc-900 dark:text-zinc-100 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                  value={settings.lineNumbers}
                  onChange={(e) => update("lineNumbers", e.target.value)}
                >
                  <option value="on">On</option>
                  <option value="off">Off</option>
                  <option value="interval">Interval</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onReset}
                className="px-3 py-1.5 rounded-full text-sm text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-rose-600 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/60"
                title="Reset to defaults"
              >
                Reset Defaults
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
