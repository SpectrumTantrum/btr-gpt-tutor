import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo"
import { NotebookService } from "@/lib/notebook/notebook-service"

let dbCounter = 0

describe("NotebookService", () => {
  let service: NotebookService

  beforeEach(() => {
    const db = new TutorDatabase(`TutorDatabase-svc-${++dbCounter}`)
    const repo = new DexieNotebookRepository(db)
    service = new NotebookService(repo)
  })

  it("creates a notebook with a generated id starting with nb_", async () => {
    // Act
    const notebook = await service.createNotebook({
      name: "Physics Notes",
      description: "Notes on mechanics",
      color: "#ef4444",
    })

    // Assert
    expect(notebook.id).toMatch(/^nb_/)
    expect(notebook.name).toBe("Physics Notes")
    expect(notebook.description).toBe("Notes on mechanics")
    expect(notebook.recordCount).toBe(0)
  })

  it("saves a record to a notebook and increments recordCount", async () => {
    // Arrange
    const notebook = await service.createNotebook({
      name: "Biology Notes",
      description: "Cell biology",
      color: "#22c55e",
    })

    // Act
    const record = await service.saveRecord(notebook.id, {
      title: "Cell Membrane",
      content: "The cell membrane regulates transport...",
      source: "chat",
      tags: ["biology", "cells"],
    })

    // Assert
    expect(record.id).toMatch(/^rec_/)
    expect(record.notebookId).toBe(notebook.id)
    expect(record.title).toBe("Cell Membrane")
    expect(record.source).toBe("chat")

    const updated = await service.getNotebook(notebook.id)
    expect(updated).not.toBeNull()
    expect(updated!.recordCount).toBe(1)
  })

  it("lists notebooks", async () => {
    // Arrange
    await service.createNotebook({ name: "Notebook A", description: "", color: "#000" })
    await service.createNotebook({ name: "Notebook B", description: "", color: "#fff" })

    // Act
    const notebooks = await service.listNotebooks()

    // Assert
    expect(notebooks).toHaveLength(2)
    const names = notebooks.map((n) => n.name)
    expect(names).toContain("Notebook A")
    expect(names).toContain("Notebook B")
  })
})
