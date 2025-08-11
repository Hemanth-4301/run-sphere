import { describe, it, expect, beforeEach } from "vitest"
import { listSavedPrograms, saveProgram, updateProgram, deleteProgram, deletePrograms } from "./localStoragePrograms"

describe("localStoragePrograms", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("saves and lists programs", () => {
    expect(listSavedPrograms()).toEqual([])
    const id = saveProgram({ name: "Test", language: "javascript", code: "console.log('hi')" })
    const list = listSavedPrograms()
    expect(list.length).toBe(1)
    expect(list[0].id).toBe(id)
  })

  it("updates a program", () => {
    const id = saveProgram({ name: "A", language: "python", code: "print(1)" })
    const ok = updateProgram(id, { name: "B" })
    expect(ok).toBe(true)
    const list = listSavedPrograms()
    expect(list[0].name).toBe("B")
  })

  it("deletes a program", () => {
    const id = saveProgram({ name: "X", language: "c", code: "int main(){}" })
    const ok = deleteProgram(id)
    expect(ok).toBe(true)
    expect(listSavedPrograms().length).toBe(0)
  })

  it("bulk deletes programs", () => {
    const id1 = saveProgram({ name: "1", language: "cpp", code: "" })
    const id2 = saveProgram({ name: "2", language: "java", code: "" })
    deletePrograms([id1, id2])
    expect(listSavedPrograms().length).toBe(0)
  })
})
