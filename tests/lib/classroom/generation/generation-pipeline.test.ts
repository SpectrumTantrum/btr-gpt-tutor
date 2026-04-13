import { describe, it, expect, vi } from "vitest"
import { GenerationPipeline } from "@/lib/classroom/generation/generation-pipeline"
import type { OutlineItem, ProviderConfig, Scene, GenerationProgress } from "@/lib/core/types"

const mockConfig: ProviderConfig = {
  provider: "openai",
  model: "gpt-4o",
  apiKey: "test-key",
}

const mockOutline: OutlineItem[] = [
  {
    title: "Introduction to Photosynthesis",
    description: "Overview of photosynthesis.",
    sceneType: "slide",
    keyPoints: ["Light energy", "Chlorophyll"],
  },
  {
    title: "Why Photosynthesis Matters",
    description: "Group discussion on importance.",
    sceneType: "discussion",
    keyPoints: ["Oxygen", "Food chain"],
  },
]

function makeScene(outlineItem: OutlineItem, order: number): Scene {
  return {
    id: `scene_${order}`,
    classroomId: "cls_test",
    type: outlineItem.sceneType,
    title: outlineItem.title,
    order,
    narration: "Narration text.",
    actions: [],
  }
}

// ============================================================
// GenerationPipeline.generate
// ============================================================

describe("GenerationPipeline.generate", () => {
  it("reports progress through outline, scenes, and complete phases", async () => {
    // Arrange
    const mockGenerateOutline = vi.fn().mockResolvedValue(mockOutline)
    const mockGenerateScene = vi
      .fn()
      .mockImplementation((_classroomId: string, outlineItem: OutlineItem, order: number) =>
        Promise.resolve(makeScene(outlineItem, order)),
      )

    const pipeline = new GenerationPipeline({
      generateOutline: mockGenerateOutline,
      generateScene: mockGenerateScene,
    })

    const progressEvents: GenerationProgress[] = []
    const onProgress = vi.fn((p: GenerationProgress) => progressEvents.push(p))

    // Act
    await pipeline.generate({
      topic: "Photosynthesis",
      context: "Plants convert light to glucose.",
      sceneCount: 2,
      classroomId: "cls_test",
      config: mockConfig,
      onProgress,
    })

    // Assert
    const phases = progressEvents.map((p) => p.phase)
    expect(phases).toContain("outline")
    expect(phases).toContain("scenes")
    expect(phases).toContain("complete")
    expect(onProgress).toHaveBeenCalled()
  })

  it("returns generated scenes with length matching the outline", async () => {
    // Arrange
    const mockGenerateOutline = vi.fn().mockResolvedValue(mockOutline)
    const mockGenerateScene = vi
      .fn()
      .mockImplementation((_classroomId: string, outlineItem: OutlineItem, order: number) =>
        Promise.resolve(makeScene(outlineItem, order)),
      )

    const pipeline = new GenerationPipeline({
      generateOutline: mockGenerateOutline,
      generateScene: mockGenerateScene,
    })

    // Act
    const result = await pipeline.generate({
      topic: "Photosynthesis",
      context: "Plants convert light to glucose.",
      sceneCount: 2,
      classroomId: "cls_test",
      config: mockConfig,
    })

    // Assert
    expect(result.scenes).toHaveLength(mockOutline.length)
    expect(result.outline).toHaveLength(mockOutline.length)
    expect(mockGenerateScene).toHaveBeenCalledTimes(mockOutline.length)
  })
})
