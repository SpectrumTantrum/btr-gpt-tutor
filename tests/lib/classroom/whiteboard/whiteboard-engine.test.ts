import { describe, it, expect, beforeEach } from "vitest"
import { WhiteboardEngine } from "@/lib/classroom/whiteboard/whiteboard-engine"
import type { WhiteboardStroke } from "@/lib/core/types"

describe("WhiteboardEngine", () => {
  let engine: WhiteboardEngine

  beforeEach(() => {
    engine = new WhiteboardEngine()
  })

  it("starts with empty strokes", () => {
    // Arrange — engine created in beforeEach

    // Act
    const strokes = engine.getStrokes()

    // Assert
    expect(strokes).toEqual([])
    expect(strokes.length).toBe(0)
  })

  it("adds a pen stroke and records id and length", () => {
    // Arrange
    const stroke: WhiteboardStroke = {
      id: "stroke-1",
      tool: "pen",
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 60 },
      ],
      color: "#ff0000",
      width: 2,
    }

    // Act
    engine.addStroke(stroke)
    const strokes = engine.getStrokes()

    // Assert
    expect(strokes.length).toBe(1)
    expect(strokes[0].id).toBe("stroke-1")
  })

  it("adds a text stroke at a position with text content", () => {
    // Arrange
    const stroke: WhiteboardStroke = {
      id: "stroke-text-1",
      tool: "text",
      points: [{ x: 100, y: 150 }],
      color: "#000000",
      width: 1,
      text: "Hello World",
    }

    // Act
    engine.addStroke(stroke)
    const strokes = engine.getStrokes()

    // Assert
    expect(strokes.length).toBe(1)
    expect(strokes[0].text).toBe("Hello World")
    expect(strokes[0].points[0]).toEqual({ x: 100, y: 150 })
  })

  it("adds a shape stroke and records the shape type", () => {
    // Arrange
    const stroke: WhiteboardStroke = {
      id: "stroke-shape-1",
      tool: "shape",
      points: [
        { x: 50, y: 50 },
        { x: 150, y: 150 },
      ],
      color: "#0000ff",
      width: 2,
      shape: "rect",
    }

    // Act
    engine.addStroke(stroke)
    const strokes = engine.getStrokes()

    // Assert
    expect(strokes.length).toBe(1)
    expect(strokes[0].shape).toBe("rect")
  })

  it("clears all strokes", () => {
    // Arrange
    engine.addStroke({
      id: "s1",
      tool: "pen",
      points: [{ x: 0, y: 0 }],
      color: "#000",
      width: 1,
    })
    engine.addStroke({
      id: "s2",
      tool: "pen",
      points: [{ x: 10, y: 10 }],
      color: "#000",
      width: 1,
    })
    expect(engine.getStrokes().length).toBe(2)

    // Act
    engine.clear()

    // Assert
    expect(engine.getStrokes().length).toBe(0)
    expect(engine.getStrokes()).toEqual([])
  })

  it("removes a specific stroke by id", () => {
    // Arrange
    engine.addStroke({
      id: "keep-1",
      tool: "pen",
      points: [{ x: 0, y: 0 }],
      color: "#000",
      width: 1,
    })
    engine.addStroke({
      id: "remove-me",
      tool: "pen",
      points: [{ x: 5, y: 5 }],
      color: "#000",
      width: 1,
    })
    engine.addStroke({
      id: "keep-2",
      tool: "pen",
      points: [{ x: 10, y: 10 }],
      color: "#000",
      width: 1,
    })
    expect(engine.getStrokes().length).toBe(3)

    // Act
    engine.removeStroke("remove-me")
    const strokes = engine.getStrokes()

    // Assert
    expect(strokes.length).toBe(2)
    expect(strokes.find((s) => s.id === "remove-me")).toBeUndefined()
    expect(strokes.map((s) => s.id)).toEqual(["keep-1", "keep-2"])
  })

  it("generates SVG path data from pen strokes with correct d attribute and stroke color", () => {
    // Arrange
    engine.addStroke({
      id: "pen-path-1",
      tool: "pen",
      points: [
        { x: 10, y: 20 },
        { x: 30, y: 40 },
        { x: 50, y: 10 },
      ],
      color: "#ff0000",
      width: 3,
    })
    // Add a non-pen stroke (should not appear in SVG paths)
    engine.addStroke({
      id: "text-1",
      tool: "text",
      points: [{ x: 0, y: 0 }],
      color: "#000000",
      width: 1,
      text: "ignored",
    })

    // Act
    const paths = engine.toSVGPaths()

    // Assert
    expect(paths.length).toBe(1)
    expect(paths[0].id).toBe("pen-path-1")
    expect(paths[0].d).toMatch(/^M /)
    expect(paths[0].stroke).toBe("#ff0000")
    expect(paths[0].strokeWidth).toBe(3)
    expect(paths[0].fill).toBe("none")
  })
})
