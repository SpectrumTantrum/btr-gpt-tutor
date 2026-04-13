import { describe, it, expect } from "vitest"
import { buildPptxData } from "@/lib/export/pptx-exporter"
import type { Classroom } from "@/lib/core/types"

const makeClassroom = (overrides: Partial<Classroom> = {}): Classroom => ({
  id: "cls_1",
  title: "Test Classroom",
  knowledgeBaseId: "kb_1",
  scenes: [],
  agents: [],
  status: "ready",
  createdAt: 1000,
  updatedAt: 1000,
  ...overrides,
})

describe("buildPptxData", () => {
  it("produces one slide per scene with slide data", () => {
    // Arrange
    const classroom = makeClassroom({
      scenes: [
        {
          id: "scene_1",
          classroomId: "cls_1",
          type: "slide",
          title: "Intro",
          order: 0,
          actions: [],
          slide: {
            elements: [
              {
                id: "el_1",
                type: "text",
                x: 10,
                y: 20,
                width: 300,
                height: 50,
                content: "Hello World",
              },
            ],
          },
        },
        {
          id: "scene_2",
          classroomId: "cls_1",
          type: "slide",
          title: "Second Slide",
          order: 1,
          actions: [],
          slide: {
            elements: [],
          },
        },
      ],
    })

    // Act
    const result = buildPptxData(classroom)

    // Assert
    expect(result.slides).toHaveLength(2)
    expect(result.slides[0].title).toBe("Intro")
    expect(result.slides[1].title).toBe("Second Slide")
  })

  it("skips scenes without slides (e.g. discussion scenes)", () => {
    // Arrange
    const classroom = makeClassroom({
      scenes: [
        {
          id: "scene_1",
          classroomId: "cls_1",
          type: "slide",
          title: "Has Slide",
          order: 0,
          actions: [],
          slide: { elements: [] },
        },
        {
          id: "scene_2",
          classroomId: "cls_1",
          type: "discussion",
          title: "Discussion Only",
          order: 1,
          actions: [],
        },
        {
          id: "scene_3",
          classroomId: "cls_1",
          type: "quiz",
          title: "Quiz Scene",
          order: 2,
          actions: [],
        },
      ],
    })

    // Act
    const result = buildPptxData(classroom)

    // Assert
    expect(result.slides).toHaveLength(1)
    expect(result.slides[0].title).toBe("Has Slide")
  })

  it("includes element positions in slide output", () => {
    // Arrange
    const classroom = makeClassroom({
      scenes: [
        {
          id: "scene_1",
          classroomId: "cls_1",
          type: "slide",
          title: "Positioned Elements",
          order: 0,
          actions: [],
          slide: {
            elements: [
              {
                id: "el_text",
                type: "text",
                x: 50,
                y: 100,
                width: 400,
                height: 80,
                content: "A text element",
              },
              {
                id: "el_image",
                type: "image",
                x: 500,
                y: 200,
                width: 200,
                height: 150,
                content: "https://example.com/img.png",
              },
            ],
          },
        },
      ],
    })

    // Act
    const result = buildPptxData(classroom)

    // Assert
    expect(result.slides[0].elements).toHaveLength(2)

    const textEl = result.slides[0].elements[0]
    expect(textEl.x).toBe(50)
    expect(textEl.y).toBe(100)
    expect(textEl.width).toBe(400)
    expect(textEl.height).toBe(80)
    expect(textEl.content).toBe("A text element")
    expect(textEl.type).toBe("text")

    const imgEl = result.slides[0].elements[1]
    expect(imgEl.x).toBe(500)
    expect(imgEl.y).toBe(200)
    expect(imgEl.type).toBe("image")
  })
})
