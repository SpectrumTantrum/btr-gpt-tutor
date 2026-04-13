import type { OutlineItem, ProviderConfig, Scene, GenerationProgress } from "@/lib/core/types"

export interface GenerationDeps {
  readonly generateOutline: (
    topic: string,
    context: string,
    sceneCount: number,
    config: ProviderConfig,
  ) => Promise<readonly OutlineItem[]>
  readonly generateScene: (
    classroomId: string,
    outlineItem: OutlineItem,
    order: number,
    context: string,
    config: ProviderConfig,
  ) => Promise<Scene>
}

export interface GenerateParams {
  readonly topic: string
  readonly context: string
  readonly sceneCount: number
  readonly classroomId: string
  readonly config: ProviderConfig
  readonly onProgress?: (progress: GenerationProgress) => void
}

export interface GenerationResult {
  readonly outline: readonly OutlineItem[]
  readonly scenes: readonly Scene[]
}

export class GenerationPipeline {
  constructor(private readonly deps: GenerationDeps) {}

  async generate(params: GenerateParams): Promise<GenerationResult> {
    const { topic, context, sceneCount, classroomId, config, onProgress } = params

    onProgress?.({
      phase: "outline",
      current: 0,
      total: sceneCount,
      message: "Generating lesson outline…",
    })

    const outline = await this.deps.generateOutline(topic, context, sceneCount, config)

    onProgress?.({
      phase: "scenes",
      current: 0,
      total: outline.length,
      message: "Generating scenes…",
    })

    const scenes: Scene[] = []

    for (let i = 0; i < outline.length; i++) {
      const scene = await this.deps.generateScene(
        classroomId,
        outline[i],
        i,
        context,
        config,
      )
      scenes.push(scene)

      onProgress?.({
        phase: "scenes",
        current: i + 1,
        total: outline.length,
        message: `Generated scene ${i + 1} of ${outline.length}`,
      })
    }

    onProgress?.({
      phase: "complete",
      current: outline.length,
      total: outline.length,
      message: "Generation complete",
    })

    return { outline, scenes }
  }
}
