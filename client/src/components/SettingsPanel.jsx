"use client";

export default function SettingsPanel({ settings, onChange, onReset }) {
  const update = (k, v) => onChange({ ...settings, [k]: v });

  return (
    <div className="rounded-xl bg-card-light dark:bg-card-dark border border-black/10 dark:border-white/10 shadow-soft overflow-auto h-full flex flex-col">
      <div className="px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10 font-semibold">
        Editor Settings
      </div>
      <div className="p-3 sm:p-4 space-y-4 text-sm">
        {/* Theme */}
        <div>
          <label className="block font-medium mb-1">Editor Theme</label>
          <select
            className="w-full rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black p-2"
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
          <label className="block font-medium mb-1">Font Family</label>
          <select
            className="w-full rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black p-2"
            value={settings.fontFamily}
            onChange={(e) => update("fontFamily", e.target.value)}
          >
            <option
              value={
                '"Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace'
              }
            >
              Fira Code
            </option>
            <option
              value={
                '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace'
              }
            >
              JetBrains Mono
            </option>
            <option
              value={
                '"Cascadia Code", ui-monospace, SFMono-Regular, Menlo, monospace'
              }
            >
              Cascadia Code
            </option>
            <option
              value={
                'Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
              }
            >
              Menlo/Monaco
            </option>
          </select>
        </div>

        {/* Font size */}
        <div>
          <label className="block font-medium mb-1">
            Font Size: {settings.fontSize}px
          </label>
          <input
            type="range"
            min={10}
            max={24}
            step={1}
            value={settings.fontSize}
            onChange={(e) => update("fontSize", Number(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Tab size */}
        <div>
          <label className="block font-medium mb-1">Tab Size</label>
          <input
            type="number"
            min={2}
            max={8}
            value={settings.tabSize}
            onChange={(e) =>
              update(
                "tabSize",
                Math.max(2, Math.min(8, Number(e.target.value) || 2))
              )
            }
            className="w-24 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black p-2"
          />
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.minimap}
              onChange={(e) => update("minimap", e.target.checked)}
            />
            <span>Show Minimap</span>
          </label>
          <div>
            <label className="block font-medium mb-1">Word Wrap</label>
            <select
              className="w-full rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black p-2"
              value={settings.wordWrap}
              onChange={(e) => update("wordWrap", e.target.value)}
            >
              <option value="off">Off</option>
              <option value="on">On</option>
              <option value="bounded">Bounded</option>
            </select>
          </div>
          <div>
            <label className="block font-medium mb-1">Line Numbers</label>
            <select
              className="w-full rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black p-2"
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
            className="px-3 py-1.5 rounded-lg text-sm border border-black/10 dark:border-white/20 bg-white dark:bg-black"
            title="Reset to defaults"
          >
            Reset Defaults
          </button>
        </div>
      </div>
    </div>
  );
}
