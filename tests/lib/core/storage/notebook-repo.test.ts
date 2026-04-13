import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo"
import type { Notebook, NotebookRecord } from "@/lib/core/types"

let dbCounter = 0

function makeNotebook(overrides: Partial<Omit<Notebook, "id">> = {}): Omit<Notebook, "id"> {
  return {
    name: "Test Notebook",
    description: "A test notebook",
    color: "#3b82f6",
    recordCount: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

function makeRecord(
  notebookId: string,
  overrides: Partial<Omit<NotebookRecord, "id">> = {}
): Omit<NotebookRecord, "id"> {
  return {
    notebookId,
    title: "Test Record",
    content: "Some content here",
    source: "manual",
    tags: [],
    createdAt: Date.now(),
    ...overrides,
  }
}

describe("DexieNotebookRepository", () => {
  let db: TutorDatabase
  let repo: DexieNotebookRepository

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-nb-${++dbCounter}`)
    repo = new DexieNotebookRepository(db)
  })

  it("creates and retrieves a notebook", async () => {
    // Arrange
    const notebookData = makeNotebook({ name: "My Study Notes" })

    // Act
    const created = await repo.createNotebook(notebookData)
    const retrieved = await repo.getNotebook(created.id)

    // Assert
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.id).toMatch(/^nb_/)
    expect(retrieved!.name).toBe("My Study Notes")
    expect(retrieved!.description).toBe(notebookData.description)
  })

  it("adds and retrieves records for a notebook", async () => {
    // Arrange
    const notebook = await repo.createNotebook(makeNotebook())
    const recordData = makeRecord(notebook.id, { title: "Key Insight", source: "chat" })

    // Act
    const added = await repo.addRecord(recordData)
    const records = await repo.getRecords(notebook.id)

    // Assert
    expect(records).toHaveLength(1)
    expect(records[0].id).toBe(added.id)
    expect(records[0].id).toMatch(/^rec_/)
    expect(records[0].title).toBe("Key Insight")
    expect(records[0].notebookId).toBe(notebook.id)
    expect(records[0].source).toBe("chat")
  })

  it("deletes a notebook and cascades records", async () => {
    // Arrange
    const notebook = await repo.createNotebook(makeNotebook())
    await repo.addRecord(makeRecord(notebook.id, { title: "Record 1" }))
    await repo.addRecord(makeRecord(notebook.id, { title: "Record 2" }))

    // Act
    await repo.deleteNotebook(notebook.id)

    // Assert
    const retrieved = await repo.getNotebook(notebook.id)
    expect(retrieved).toBeNull()

    const records = await repo.getRecords(notebook.id)
    expect(records).toHaveLength(0)
  })
})
