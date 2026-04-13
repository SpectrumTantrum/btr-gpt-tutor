import { describe, it, expect } from "vitest"
import { buildCoWriterPrompt } from "@/lib/co-writer/prompts"

// ============================================================
// buildCoWriterPrompt
// ============================================================

describe("buildCoWriterPrompt", () => {
  it("rewrite prompt contains 'Rewrite', selected text, and context", () => {
    // Arrange
    const selectedText = "The quick brown fox."
    const fullContent = "A story about animals in the forest."

    // Act
    const prompt = buildCoWriterPrompt("rewrite", selectedText, fullContent)

    // Assert
    expect(prompt).toContain("Rewrite")
    expect(prompt).toContain(selectedText)
    expect(prompt).toContain(fullContent)
  })

  it("expand prompt contains 'Expand' and 'more detail'", () => {
    // Arrange
    const selectedText = "The mitochondria produces ATP."
    const fullContent = "A biology lesson about cellular respiration."

    // Act
    const prompt = buildCoWriterPrompt("expand", selectedText, fullContent)

    // Assert
    expect(prompt).toContain("Expand")
    expect(prompt).toContain("more detail")
  })

  it("shorten prompt contains 'Shorten' and 'concise'", () => {
    // Arrange
    const selectedText = "This is a very long and unnecessarily verbose sentence."
    const fullContent = "An essay on writing style."

    // Act
    const prompt = buildCoWriterPrompt("shorten", selectedText, fullContent)

    // Assert
    expect(prompt).toContain("Shorten")
    expect(prompt).toContain("concise")
  })

  it("summarize prompt contains 'Summarize' and '2-3 sentences'", () => {
    // Arrange
    const selectedText = "A long passage about climate change and its effects."
    const fullContent = "A research paper on environmental topics."

    // Act
    const prompt = buildCoWriterPrompt("summarize", selectedText, fullContent)

    // Assert
    expect(prompt).toContain("Summarize")
    expect(prompt).toContain("2-3 sentences")
  })
})
