import { describe, it, expect } from "vitest"
import { buildHtmlExport } from "@/lib/export/html-exporter"
import type { Classroom } from "@/lib/core/types"

const makeClassroom = (overrides: Partial<Classroom> = {}): Classroom => ({
  id: "cls_1",
  title: "My Classroom",
  knowledgeBaseId: "kb_1",
  scenes: [],
  agents: [],
  status: "ready",
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
})

describe("buildHtmlExport", () => {
  it("generates valid HTML with doctype", () => {
    // Arrange
    const classroom = makeClassroom()

    // Act
    const html = buildHtmlExport(classroom)

    // Assert
    expect(html).toMatch(/^<!DOCTYPE html>/i)
    expect(html).toContain("<html")
    expect(html).toContain("</html>")
    expect(html).toContain("<head>")
    expect(html).toContain("</head>")
    expect(html).toContain("<body")
    expect(html).toContain("</body>")
  })

  it("includes navigation script", () => {
    // Arrange
    const classroom = makeClassroom({
      scenes: [
        {
          id: "scene_1",
          classroomId: "cls_1",
          type: "slide",
          title: "Slide One",
          order: 0,
          actions: [],
          slide: { elements: [] },
        },
        {
          id: "scene_2",
          classroomId: "cls_1",
          type: "slide",
          title: "Slide Two",
          order: 1,
          actions: [],
          slide: { elements: [] },
        },
      ],
    })

    // Act
    const html = buildHtmlExport(classroom)

    // Assert
    expect(html).toContain("<script")
    expect(html).toContain("</script>")
    expect(html).toContain("function")
  })

  it("renders scene titles", () => {
    // Arrange
    const classroom = makeClassroom({
      scenes: [
        {
          id: "scene_1",
          classroomId: "cls_1",
          type: "slide",
          title: "Introduction to Physics",
          order: 0,
          actions: [],
          slide: { elements: [] },
        },
        {
          id: "scene_2",
          classroomId: "cls_1",
          type: "slide",
          title: "Newton's Laws",
          order: 1,
          actions: [],
          slide: { elements: [] },
        },
      ],
    })

    // Act
    const html = buildHtmlExport(classroom)

    // Assert
    expect(html).toContain("Introduction to Physics")
    expect(html).toContain("Newton&#39;s Laws")
  })
})
