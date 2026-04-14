import { generateText } from "ai"
import { createLanguageModel } from "@/lib/core/ai/providers"
import type { OutlineItem, ProviderConfig, Scene, SlideData } from "@/lib/core/types"
import { generateId } from "@/lib/utils/id"
import { buildScenePrompt } from "./prompts"

interface SceneResponse {
  readonly title?: string
  readonly narration?: string
  readonly slide?: {
    readonly elements?: unknown[]
    readonly background?: string
    readonly transition?: string
  }
  readonly content?: string
  readonly prompt?: string
}

/**
 * Calls the LLM with a scene prompt, parses the JSON response, and constructs
 * a Scene object. Slide scenes include the full SlideData with elements.
 */
export async function generateScene(
  classroomId: string,
  outlineItem: OutlineItem,
  order: number,
  context: string,
  config: ProviderConfig,
): Promise<Scene> {
  const model = createLanguageModel(config)
  const prompt = buildScenePrompt(outlineItem, context)

  const result = await generateText({
    model,
    messages: [{ role: "user", content: prompt }],
  })

  const parsed = JSON.parse(result.text) as SceneResponse

  const slide: SlideData | undefined =
    outlineItem.sceneType === "slide" && parsed.slide
      ? {
          elements: Array.isArray(parsed.slide.elements)
            ? parsed.slide.elements.map((el: unknown) => {
                const element = el as Record<string, unknown>
                return {
                  id: (element.id as string) ?? generateId("el"),
                  type: ((element.type as string) ?? "text") as import("@/lib/core/types").SlideElementType,
                  x: (element.x as number) ?? 0,
                  y: (element.y as number) ?? 0,
                  width: (element.width as number) ?? 100,
                  height: (element.height as number) ?? 100,
                  content: (element.content as string) ?? "",
                  style: (element.style as Record<string, string>) ?? {},
                }
              })
            : [],
          background: parsed.slide.background,
          transition: parsed.slide.transition,
        }
      : undefined

  return {
    id: generateId("scene"),
    classroomId,
    type: outlineItem.sceneType,
    title: parsed.title ?? outlineItem.title,
    order,
    slide,
    narration: parsed.narration,
    actions: [],
  }
}
