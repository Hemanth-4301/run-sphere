"use client"

import { useMemo, useState } from "react"
import { listSavedPrograms, saveProgram, deleteProgram, deletePrograms } from "../lib/localStoragePrograms"

const LANGUAGE_LABELS = {
  c: "C",
  cpp: "C++",
  csharp: "C#",
  java: "Java",
  python: "Python",
  javascript: "JavaScript",
}

export default function SavedPrograms({ onOpen }) {
  const [items, setItems] = useState(() => listSavedPrograms())
  const [selected, setSelected] = useState({})

  const toggle = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }))
  const allSelected = useMemo(() => items.length > 0 && items.every((i) => selected[i.id]), [items, selected])

  const toggleAll = () => {
    if (allSelected) {
      setSelected({})
    } else {
      const next = {}
      for (const i of items) next[i.id] = true
      setSelected(next)
    }
  }

  const doDelete = (id) => {
    if (!confirm("Delete this program?")) return
    deleteProgram(id)
    setItems(listSavedPrograms())
  }

  const doBulkDelete = () => {
    const ids = Object.keys(selected).filter((id) => selected[id])
    if (ids.length === 0) return
    if (!confirm(`Delete ${ids.length} selected program(s)?`)) return
    deletePrograms(ids)
    setSelected({})
    setItems(listSavedPrograms())
  }

  const duplicate = (item) => {
    saveProgram({ name: item.name + " (Copy)", language: item.language, code: item.code })
    setItems(listSavedPrograms())
  }

  const rename = (item) => {
    const name = prompt("New name", item.name)
    if (!name) return
    saveProgram({ id: item.id, name, language: item.language, code: item.code })
    setItems(listSavedPrograms())
  }

  return (
    <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-soft border border-black/10 dark:border-white/10 overflow-hidden h-full flex flex-col pane">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10">
        <div className="font-semibold">Saved Programs</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 bg-white dark:bg-black"
          >
            {allSelected ? "Unselect All" : "Select All"}
          </button>
          <button
            onClick={doBulkDelete}
            className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 bg-white dark:bg-black"
          >
            Delete Selected
          </button>
        </div>
      </div>
      <div className="pane-body p-3 sm:p-4 scrollbar-thin">
        {items.length === 0 ? (
          <p className="text-sm text-gray-700 dark:text-gray-300">No saved programs yet.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="bg-white dark:bg-black rounded-lg p-3 border border-black/10 dark:border-white/10 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.name}`}
                    checked={!!selected[item.id]}
                    onChange={() => toggle(item.id)}
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-700 dark:text-gray-300">
                      {LANGUAGE_LABELS[item.language] || item.language} • Updated{" "}
                      {new Date(item.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="text-xs px-2 py-1 rounded bg-black text-white dark:bg-white dark:text-black"
                    onClick={() => onOpen(item)}
                  >
                    Open
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 bg-white dark:bg-black"
                    onClick={() => duplicate(item)}
                  >
                    Duplicate
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 bg-white dark:bg-black"
                    onClick={() => rename(item)}
                  >
                    Rename
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded border border-black/10 dark:border-white/20 bg-white dark:bg-black"
                    onClick={() => doDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
