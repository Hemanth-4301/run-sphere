const KEY = "editorSettings";

export const DEFAULT_EDITOR_SETTINGS = {
  // Theme and typography
  theme: "system", // system | light | dark | hc
  fontFamily: '"Fira Code", ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 14,
  fontLigatures: true,

  // Wrapping and layout
  wordWrap: "on", // off | on | wordWrapColumn | bounded
  wordWrapColumn: 80,
  wrappingIndent: "same", // none | same | indent | deepIndent
  lineNumbers: "on", // on | off | interval
  rulers: "80,120", // comma-separated string -> [80, 120]

  // Tabs and indentation
  tabSize: 2,
  insertSpaces: true,

  // UI toggles
  minimap: true,
  minimapRenderCharacters: true,
  minimapSide: "right", // right | left
  renderWhitespace: "selection", // none | selection | all
  renderLineHighlight: "line", // none | gutter | line | all
  renderIndentGuides: true,
  folding: true,
  stickyScroll: true,
  smoothScrolling: true,
  scrollBeyondLastLine: false,

  // Cursor behavior
  cursorStyle: "line", // line | block | underline | line-thin | block-outline | underline-thin
  cursorBlinking: "smooth", // blink | smooth | phase | expand | solid
  mouseWheelZoom: false,

  // Brackets and formatting
  bracketPairColorization: true,
  autoClosingBrackets: "languageDefined", // always | languageDefined | never
  formatOnPaste: true,
  formatOnType: false,
};

export function loadEditorSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_EDITOR_SETTINGS };
    const saved = JSON.parse(raw);
    return { ...DEFAULT_EDITOR_SETTINGS, ...saved };
  } catch {
    return { ...DEFAULT_EDITOR_SETTINGS };
  }
}

export function saveEditorSettings(settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {}
}

export function resetEditorSettings() {
  saveEditorSettings(DEFAULT_EDITOR_SETTINGS);
  return { ...DEFAULT_EDITOR_SETTINGS };
}
