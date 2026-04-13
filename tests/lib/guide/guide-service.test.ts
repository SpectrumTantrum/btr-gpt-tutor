import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieGuideRepository } from "@/lib/core/storage/guide-repo"
import { GuideService } from "@/lib/guide/guide-service"
import type { GuideStep } from "@/lib/core/types"

let dbCounter = 0

function makeSteps(count: number): Omit<GuideStep, "isCompleted">[] {
  return Array.from({ length: count }, (_, i) => ({
    title: `Step ${i + 1}`,
    description: `Description for step ${i + 1}`,
  }))
}

describe("GuideService", () => {
  let db: TutorDatabase
  let repo: DexieGuideRepository
  let service: GuideService

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-guide-${++dbCounter}`)
    repo = new DexieGuideRepository(db)
    service = new GuideService(repo)
  })

  it("creates a guide plan with id starting with guide_, status in_progress, currentStepIndex 0", async () => {
    // Arrange
    const steps = makeSteps(3)

    // Act
    const guide = await service.createGuide({
      knowledgeBaseId: "kb_test",
      topic: "Introduction to TypeScript",
      steps,
    })

    // Assert
    expect(guide.id).toMatch(/^guide_/)
    expect(guide.status).toBe("in_progress")
    expect(guide.currentStepIndex).toBe(0)
    expect(guide.knowledgeBaseId).toBe("kb_test")
    expect(guide.topic).toBe("Introduction to TypeScript")
    expect(guide.steps).toHaveLength(3)
    expect(guide.steps.every((s) => s.isCompleted === false)).toBe(true)
  })

  it("advances to next step: completeStep marks step completed and increments currentStepIndex", async () => {
    // Arrange
    const steps = makeSteps(3)
    const guide = await service.createGuide({
      knowledgeBaseId: "kb_test",
      topic: "TypeScript Generics",
      steps,
    })

    // Act
    const updated = await service.completeStep(guide.id, 0)

    // Assert
    expect(updated.steps[0].isCompleted).toBe(true)
    expect(updated.currentStepIndex).toBe(1)
    expect(updated.status).toBe("in_progress")
  })

  it("marks guide completed when all steps are done", async () => {
    // Arrange
    const steps = makeSteps(2)
    const guide = await service.createGuide({
      knowledgeBaseId: "kb_test",
      topic: "TypeScript Enums",
      steps,
    })

    // Act — complete step 0 then step 1
    await service.completeStep(guide.id, 0)
    const finished = await service.completeStep(guide.id, 1)

    // Assert
    expect(finished.steps[0].isCompleted).toBe(true)
    expect(finished.steps[1].isCompleted).toBe(true)
    expect(finished.status).toBe("completed")
  })
})
