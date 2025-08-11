"use client"
import { useMemo, useState } from "react"
import { listSavedPrograms, saveProgram, deleteProgram, deletePrograms } from "../lib/localStoragePrograms"
import { Copy, Pencil, Trash2, FolderOpen } from 'lucide-react'

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
    <div className="rounded-2xl bg-white dark:bg-black shadow-sm border border-black/10 dark:border-white/10 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-black/10 dark:border-white/10">
        <div className="font-semibold">Saved Programs</div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAll}
            className="text-xs px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm transition-colors"
          >
            {allSelected ? "Unselect All" : "Select All"}
          </button>
          <button
            onClick={doBulkDelete}
            className="text-xs px-3 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm transition-colors"
          >
            Delete Selected
          </button>
        </div>
      </div>

      {/* List */}
      <div className="p-3 sm:p-4 overflow-auto">
        {items.length === 0 ? (
          <div className="rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6 text-sm">
            No saved programs yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg p-3 border border-black/10 dark:border-white/10 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.name}`}
                    checked={!!selected[item.id]}
                    onChange={() => toggle(item.id)}
                    className="h-4 w-4"
                  />
                  <div className="truncate">
                    <div className="font-medium truncate">{item.name}</div>
                    <div className="text-xs truncate">
                      {LANGUAGE_LABELS[item.language] || item.language} • Updated {new Date(item.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-black text-white dark:bg-white dark:text-black shadow-sm"
                    onClick={() => onOpen(item)}
                    title="Open"
                  >
                    <FolderOpen size={14} />
                    Open
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => duplicate(item)}
                    title="Duplicate"
                  >
                    <Copy size={14} />
                    Duplicate
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900"
                    onClick={() => rename(item)}
                    title="Rename"
                  >
                    <Pencil size={14} />
                    Rename
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-black/10 dark:border-white/20 bg-white dark:bg-black hover:bg-zinc-50 dark:hover:bg-zinc-900"
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
  )
}
