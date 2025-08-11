"use client";
import { useMemo, useState } from "react";
import {
  listSavedPrograms,
  saveProgram,
  deleteProgram,
  deletePrograms,
} from "../lib/localStoragePrograms";
import { FilePlus2, Copy, Pencil, Trash2, FolderOpen } from "lucide-react";

const LANGUAGE_LABELS = {
  c: "C",
  cpp: "C++",
  csharp: "C#",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
};

export default function SavedPrograms({ onOpen }) {
  const [items, setItems] = useState(() => listSavedPrograms());
  const [selected, setSelected] = useState({});

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const allSelected = useMemo(
    () => items.length > 0 && items.every((i) => selected[i.id]),
    [items, selected]
  );

  const toggleAll = () => {
    if (allSelected) {
      setSelected({});
    } else {
      const next = {};
      for (const i of items) next[i.id] = true;
      setSelected(next);
    }
  };

  const doDelete = (id) => {
    if (!confirm("Delete this program?")) return;
    deleteProgram(id);
    setItems(listSavedPrograms());
  };

  const doBulkDelete = () => {
    const ids = Object.keys(selected).filter((id) => selected[id]);
    if (ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} selected program(s)?`)) return;
    deletePrograms(ids);
    setSelected({});
    setItems(listSavedPrograms());
  };

  const duplicate = (item) => {
    saveProgram({
      name: item.name + " (Copy)",
      language: item.language,
      code: item.code,
    });
    setItems(listSavedPrograms());
  };

  const rename = (item) => {
    const name = prompt("New name", item.name);
    if (!name) return;
    saveProgram({
      id: item.id,
      name,
      language: item.language,
      code: item.code,
    });
    setItems(listSavedPrograms());
  };

  return (
    <div className="h-full">
      <div className="h-full rounded-2xl p-[1.5px] bg-gradient-to-br from-purple-500 via-fuchsia-500 to-rose-500 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
        <div className="h-full rounded-2xl bg-white/80 dark:bg-zinc-900/70 backdrop-blur-xl border border-white/20 dark:border-white/10 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-white/30 dark:border-white/10 bg-gradient-to-r from-white/50 via-white/35 to-white/20 dark:from-zinc-900/60 dark:via-zinc-900/45 dark:to-zinc-900/30">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">
              Saved Programs
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAll}
                className="text-xs px-3 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 shadow-sm transition-colors"
              >
                {allSelected ? "Unselect All" : "Select All"}
              </button>
              <button
                onClick={doBulkDelete}
                className="text-xs px-3 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900 shadow-sm transition-colors"
              >
                Delete Selected
              </button>
            </div>
          </div>

          {/* List */}
          <div className="p-3 sm:p-4 overflow-auto scrollbar-thin">
            {items.length === 0 ? (
              <div className="rounded-xl border border-white/30 dark:border-white/10 bg-white/60 dark:bg-zinc-900/50 p-6 text-sm text-zinc-800/80 dark:text-zinc-200/80">
                No saved programs yet.
              </div>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-xl p-3 border border-white/30 dark:border-white/10 bg-white/85 dark:bg-zinc-950/70 hover:bg-white/95 dark:hover:bg-zinc-900/80 transition-colors shadow-sm flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        aria-label={`Select ${item.name}`}
                        checked={!!selected[item.id]}
                        onChange={() => toggle(item.id)}
                        className="accent-fuchsia-600 h-4 w-4"
                      />
                      <div className="truncate">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-xs text-zinc-700 dark:text-zinc-300 truncate">
                          {LANGUAGE_LABELS[item.language] || item.language} •
                          Updated {new Date(item.updatedAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-rose-600 shadow-sm"
                        onClick={() => onOpen(item)}
                        title="Open"
                      >
                        <FolderOpen size={14} />
                        Open
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900"
                        onClick={() => duplicate(item)}
                        title="Duplicate"
                      >
                        <Copy size={14} />
                        Duplicate
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900"
                        onClick={() => rename(item)}
                        title="Rename"
                      >
                        <Pencil size={14} />
                        Rename
                      </button>
                      <button
                        className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border border-white/40 dark:border-white/10 bg-white/90 dark:bg-zinc-950/80 hover:bg-white dark:hover:bg-zinc-900"
                        onClick={() => doDelete(item.id)}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
