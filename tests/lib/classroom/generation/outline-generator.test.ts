import { describe, it, expect } from "vitest"
import {
  buildOutlinePrompt,
  buildScenePrompt,
  buildNarrationPrompt,
} from "@/lib/classroom/generation/prompts"
import type { OutlineItem } from "@/lib/core/types"

// ============================================================
// buildOutlinePrompt
// ============================================================

describe("buildOutlinePrompt", () => {
  it("contains the topic", () => {
    // Arrange
    const topic = "Photosynthesis"
    const context = "Plants use sunlight to produce food."
    const sceneCount = 3

    // Act
    const prompt = buildOutlinePrompt(topic, context, sceneCount)

    // Assert
    expect(prompt).toContain(topic)
  })

  it("contains the scene count", () => {
    // Arrange
    const topic = "Cellular Respiration"
    const context = "Cells convert glucose to ATP."
    const sceneCount = 5

    // Act
    const prompt = buildOutlinePrompt(topic, context, sceneCount)

    // Assert
    expect(prompt).toContain("5")
  })

  it("contains the context", () => {
    // Arrange
    const topic = "DNA Replication"
    const context = "DNA unwinds and each strand acts as a template."
    const sceneCount = 4

    // Act
    const prompt = buildOutlinePrompt(topic, context, sceneCount)

    // Assert
    expect(prompt).toContain(context)
  })

  it("instructs the LLM to return a JSON array", () => {
    // Arrange
    const topic = "Mitosis"
    const context = "Cell division produces two identical daughter cells."
    const sceneCount = 3

    // Act
    const prompt = buildOutlinePrompt(topic, context, sceneCount)

    // Assert
    expect(prompt).toContain("JSON array")
  })
})

// ============================================================
// buildScenePrompt
// ============================================================

describe("buildScenePrompt", () => {
  it("contains 'elements' for a slide scene type", () => {
    // Arrange
    const outlineItem: OutlineItem = {
      title: "What is Photosynthesis?",
      description: "An overview of the photosynthesis process.",
      sceneType: "slide",
      keyPoints: ["Light energy", "Chlorophyll", "Glucose"],
    }
    const context = "Photosynthesis occurs in chloroplasts."

    // Act
    const prompt = buildScenePrompt(outlineItem, context)

    // Assert
    expect(prompt).toContain("elements")
  })

  it("does NOT contain 'elements' for a discussion scene type", () => {
    // Arrange
    const outlineItem: OutlineItem = {
      title: "Why does photosynthesis matter?",
      description: "Group discussion on the importance of photosynthesis.",
      sceneType: "discussion",
      keyPoints: ["Oxygen production", "Food chain", "Climate"],
    }
    const context = "Photosynthesis is the basis of most food chains."

    // Act
    const prompt = buildScenePrompt(outlineItem, context)

    // Assert
    expect(prompt).not.toContain("elements")
  })
})

// ============================================================
// buildNarrationPrompt
// ============================================================

describe("buildNarrationPrompt", () => {
  it("contains the key points", () => {
    // Arrange
    const slideContent = "Photosynthesis converts CO2 and water into glucose using sunlight."
    const keyPoints = ["Light energy", "Chlorophyll", "Glucose production"] as const

    // Act
    const prompt = buildNarrationPrompt(slideContent, keyPoints)

    // Assert
    expect(prompt).toContain("Light energy")
    expect(prompt).toContain("Chlorophyll")
    expect(prompt).toContain("Glucose production")
  })

  it("includes the word 'teacher' in the prompt", () => {
    // Arrange
    const slideContent = "DNA carries genetic information."
    const keyPoints = ["Double helix", "Base pairs"] as const

    // Act
    const prompt = buildNarrationPrompt(slideContent, keyPoints)

    // Assert
    expect(prompt.toLowerCase()).toContain("teacher")
  })
})
