import type { GuidePlan, GuideStep } from "@/lib/core/types"
import type { GuideRepository } from "@/lib/core/storage/repository"

interface CreateGuideInput {
  knowledgeBaseId: string
  topic: string
  steps: Omit<GuideStep, "isCompleted">[]
}

export class GuideService {
  constructor(private readonly repo: GuideRepository) {}

  async createGuide(input: CreateGuideInput): Promise<GuidePlan> {
    const now = Date.now()
    const steps: GuideStep[] = input.steps.map((s) => ({ ...s, isCompleted: false }))
    return this.repo.createGuide({
      knowledgeBaseId: input.knowledgeBaseId,
      topic: input.topic,
      steps,
      status: "in_progress",
      currentStepIndex: 0,
      createdAt: now,
      updatedAt: now,
    })
  }

  async getGuide(id: string): Promise<GuidePlan | null> {
    return this.repo.getGuide(id)
  }

  async listGuides(knowledgeBaseId: string): Promise<GuidePlan[]> {
    return this.repo.listGuides(knowledgeBaseId)
  }

  async completeStep(guideId: string, stepIndex: number): Promise<GuidePlan> {
    const guide = await this.repo.getGuide(guideId)
    if (!guide) throw new Error(`Guide ${guideId} not found`)

    const updatedSteps: GuideStep[] = guide.steps.map((step, i) =>
      i === stepIndex ? { ...step, isCompleted: true } : step
    )

    const allDone = updatedSteps.every((s) => s.isCompleted)
    const nextIndex = stepIndex + 1
    const newCurrentIndex = nextIndex < updatedSteps.length ? nextIndex : stepIndex

    return this.repo.updateGuide(guideId, {
      steps: updatedSteps,
      currentStepIndex: newCurrentIndex,
      status: allDone ? "completed" : "in_progress",
      updatedAt: Date.now(),
    })
  }

  async setStepContent(guideId: string, stepIndex: number, htmlContent: string): Promise<GuidePlan> {
    const guide = await this.repo.getGuide(guideId)
    if (!guide) throw new Error(`Guide ${guideId} not found`)

    const updatedSteps: GuideStep[] = guide.steps.map((step, i) =>
      i === stepIndex ? { ...step, htmlContent } : step
    )

    return this.repo.updateGuide(guideId, {
      steps: updatedSteps,
      updatedAt: Date.now(),
    })
  }
}
