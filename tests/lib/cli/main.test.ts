import { describe, it, expect } from "vitest"
import { parseArgs } from "@/lib/cli/main"

describe("parseArgs", () => {
  it("extracts command name and flags", () => {
    // Arrange
    const args = ["chat", "--format=rich"]

    // Act
    const result = parseArgs(args)

    // Assert
    expect(result.command).toBe("chat")
    expect(result.flags["format"]).toBe("rich")
  })

  it("handles --format=json flag", () => {
    // Arrange
    const args = ["kb", "--format=json"]

    // Act
    const result = parseArgs(args)

    // Assert
    expect(result.command).toBe("kb")
    expect(result.flags["format"]).toBe("json")
  })

  it("handles unknown command gracefully", () => {
    // Arrange
    const args = ["unknown-command"]

    // Act
    const result = parseArgs(args)

    // Assert
    expect(result.command).toBe("unknown-command")
    expect(result.isKnownCommand).toBe(false)
  })

  it("extracts positional arguments", () => {
    // Arrange
    const args = ["kb", "create", "my-knowledge-base", "--format=json"]

    // Act
    const result = parseArgs(args)

    // Assert
    expect(result.command).toBe("kb")
    expect(result.positional).toEqual(["create", "my-knowledge-base"])
    expect(result.flags["format"]).toBe("json")
  })
})
