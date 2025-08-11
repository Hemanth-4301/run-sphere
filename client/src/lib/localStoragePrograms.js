const KEY = "savedPrograms"

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

function uuid() {
  if (crypto?.randomUUID) return crypto.randomUUID()
  return "id-" + Math.random().toString(36).slice(2) + Date.now()
}

export function listSavedPrograms() {
  return load()
}

export function saveProgram({ id, name, language, code }) {
  const now = new Date().toISOString()
  const list = load()
  const existingIndex = id ? list.findIndex((p) => p.id === id) : -1
  if (existingIndex >= 0) {
    const updated = {
      ...list[existingIndex],
      name: name ?? list[existingIndex].name,
      language: language ?? list[existingIndex].language,
      code: code ?? list[existingIndex].code,
      updatedAt: now,
    }
    list[existingIndex] = updated
    save(list)
    return updated.id
  } else {
    const item = {
      id: uuid(),
      name: name || "Untitled",
      language,
      code,
      createdAt: now,
      updatedAt: now,
    }
    list.unshift(item)
    save(list)
    return item.id
  }
}

export function updateProgram(id, { name, code, language }) {
  const now = new Date().toISOString()
  const list = load()
  const idx = list.findIndex((p) => p.id === id)
  if (idx === -1) return false
  list[idx] = {
    ...list[idx],
    name: name ?? list[idx].name,
    code: code ?? list[idx].code,
    language: language ?? list[idx].language,
    updatedAt: now,
  }
  save(list)
  return true
}

export function deleteProgram(id) {
  const list = load()
  const next = list.filter((p) => p.id !== id)
  save(next)
  return next.length !== list.length
}

export function deletePrograms(ids) {
  const set = new Set(ids)
  const next = load().filter((p) => !set.has(p.id))
  save(next)
  return true
}
