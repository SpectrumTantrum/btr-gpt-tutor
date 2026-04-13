import type { Classroom, SlideElement } from "@/lib/core/types"

// ============================================================
// PPTX Export Types
// ============================================================

export interface PptxElementData {
  readonly id: string
  readonly type: SlideElement["type"]
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
  readonly content: string
  readonly style?: Readonly<Record<string, string>>
}

export interface PptxSlideData {
  readonly title: string
  readonly elements: readonly PptxElementData[]
  readonly background?: string
}

export interface PptxExportData {
  readonly title: string
  readonly slides: readonly PptxSlideData[]
}

// ============================================================
// Builder
// ============================================================

/**
 * Converts a Classroom into a serializable PPTX slide description.
 * Only scenes that have slide data are included — discussion, quiz, and
 * interactive scenes without a slide property are skipped.
 *
 * The returned structure is environment-agnostic and can be passed directly
 * to a pptxgenjs API route or serialized to JSON.
 */
export function buildPptxData(classroom: Classroom): PptxExportData {
  const slides = classroom.scenes
    .filter((scene) => scene.slide !== undefined)
    .map((scene): PptxSlideData => {
      const elements = (scene.slide?.elements ?? []).map(
        (el): PptxElementData => ({
          id: el.id,
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          content: el.content,
          ...(el.style !== undefined ? { style: el.style } : {}),
        }),
      )

      return {
        title: scene.title,
        elements,
        ...(scene.slide?.background !== undefined
          ? { background: scene.slide.background }
          : {}),
      }
    })

  return {
    title: classroom.title,
    slides,
  }
}
