import { describe, it, expect } from "vitest"
import {
  exportNotebookAsMarkdown,
  exportContentAsMarkdown,
} from "@/lib/export/markdown-exporter"
import type { NotebookRecord } from "@/lib/core/types"

const makeRecord = (overrides: Partial<NotebookRecord> = {}): NotebookRecord => ({
  id: "rec_1",
  notebookId: "nb_1",
  title: "My Record",
  content: "Some content here.",
  source: "manual",
  tags: [],
  createdAt: 1000,
  ...overrides,
})

describe("exportNotebookAsMarkdown", () => {
  it("formats notebook as markdown with title, record headings, and dividers", () => {
    // Arrange
    const notebook = { name: "Physics Notes", description: "Mechanics and waves" }
    const records: readonly NotebookRecord[] = [
      makeRecord({ id: "rec_1", title: "Newton's Laws", content: "F = ma" }),
      makeRecord({ id: "rec_2", title: "Wave Equation", content: "v = fλ" }),
    ]

    // Act
    const md = exportNotebookAsMarkdown(notebook, records)

    // Assert
    expect(md).toContain("# Physics Notes")
    expect(md).toContain("## Newton's Laws")
    expect(md).toContain("F = ma")
    expect(md).toContain("## Wave Equation")
    expect(md).toContain("v = fλ")
    expect(md).toContain("---")
  })

  it("returns just the title heading when records array is empty", () => {
    // Arrange
    const notebook = { name: "Empty Notebook", description: "" }

    // Act
    const md = exportNotebookAsMarkdown(notebook, [])

    // Assert
    expect(md).toContain("# Empty Notebook")
    expect(md).not.toContain("##")
    expect(md).not.toContain("---")
  })
})

describe("exportContentAsMarkdown", () => {
  it("wraps content with an optional title heading", () => {
    // Arrange
    const content = "This is the body text."

    // Act
    const md = exportContentAsMarkdown(content, "My Title")

    // Assert
    expect(md).toContain("# My Title")
    expect(md).toContain("This is the body text.")
  })

  it("returns just content when no title is provided", () => {
    // Arrange
    const content = "Plain content with no title."

    // Act
    const md = exportContentAsMarkdown(content)

    // Assert
    expect(md).not.toContain("#")
    expect(md).toContain("Plain content with no title.")
  })
})
