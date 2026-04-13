import type { OutlineItem } from "@/lib/core/types"

/**
 * Builds a prompt instructing the LLM to generate a JSON array of OutlineItems
 * for a classroom lesson on the given topic.
 */
export function buildOutlinePrompt(
  topic: string,
  context: string,
  sceneCount: number,
): string {
  return `You are a classroom curriculum designer. Create an outline for a lesson on the topic below.

Topic: ${topic}

Generate exactly ${sceneCount} scene(s) for this lesson. Use the provided context to shape the content.

Allowed scene types: slide, quiz, interactive, discussion

Rules:
- Each scene must have a unique, descriptive title
- Each scene must have a brief description of what it covers
- Each scene must have an appropriate sceneType
- Each scene must have 2-4 keyPoints as an array of strings
- Distribute scene types sensibly (use slides for teaching content, quiz for assessment, discussion for reflection)

Respond with ONLY a valid JSON array — no markdown fences, no extra text. Example shape:
[
  {
    "title": "Introduction to Photosynthesis",
    "description": "Overview of how plants convert light to energy.",
    "sceneType": "slide",
    "keyPoints": ["Light energy", "Chlorophyll", "Glucose production"]
  }
]

## Context

${context}`
}

/**
 * Builds a prompt instructing the LLM to generate the content for a single scene.
 * Slide scenes receive an elements spec; other types receive narrative content.
 */
export function buildScenePrompt(
  outlineItem: OutlineItem,
  context: string,
): string {
  const { title, description, sceneType, keyPoints } = outlineItem
  const keyPointsList = keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join("\n")

  if (sceneType === "slide") {
    return `You are a classroom slide designer. Create the content for a slide scene.

Title: ${title}
Description: ${description}
Key Points:
${keyPointsList}

Generate slide elements for this scene. Each element has a position, size, and content.

Respond with ONLY a valid JSON object — no markdown fences, no extra text. Example shape:
{
  "title": "${title}",
  "narration": "Teacher narration text here.",
  "slide": {
    "elements": [
      {
        "id": "el_1",
        "type": "text",
        "x": 50,
        "y": 50,
        "width": 900,
        "height": 80,
        "content": "Heading text",
        "style": { "fontSize": "32px", "fontWeight": "bold" }
      }
    ],
    "background": "#ffffff"
  }
}

## Context

${context}`
  }

  return `You are a classroom content designer. Create the content for a ${sceneType} scene.

Title: ${title}
Description: ${description}
Key Points:
${keyPointsList}

Generate the content for this ${sceneType} scene.

Respond with ONLY a valid JSON object — no markdown fences, no extra text. Example shape:
{
  "title": "${title}",
  "narration": "Teacher narration text here.",
  "content": "Detailed content for this scene.",
  "prompt": "Discussion question or interactive prompt here."
}

## Context

${context}`
}

/**
 * Builds a prompt instructing the LLM to write a teacher narration script
 * for a given slide's content and key points.
 */
export function buildNarrationPrompt(
  slideContent: string,
  keyPoints: readonly string[],
): string {
  const keyPointsList = keyPoints.map((kp, i) => `${i + 1}. ${kp}`).join("\n")

  return `You are a teacher writing a narration script for a classroom slide.

Write what the teacher should say while presenting this slide. The narration should:
- Be natural and conversational, as if spoken aloud by a teacher
- Cover each key point clearly
- Be engaging and educational
- Be 3-5 sentences in length

Key Points to cover:
${keyPointsList}

Slide Content:
${slideContent}

Respond with ONLY the narration text — no JSON, no markdown, no extra formatting.`
}
