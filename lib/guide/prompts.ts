/**
 * Prompt builders for the guided learning feature.
 * These produce LLM-ready strings — no I/O, pure functions.
 */

/**
 * Builds a prompt asking the LLM to decompose a topic into 3-5 progressive
 * learning steps returned as a JSON array.
 */
export function buildPlanGenerationPrompt(topic: string, context: string): string {
  return `You are an expert tutor creating a structured learning plan.

Topic: ${topic}

${context ? `Context from knowledge base:\n${context}\n` : ""}
Generate a learning plan with 3 to 5 progressive knowledge points that guide a learner from foundational concepts to deeper understanding. Each step should build on the previous one.

Respond with ONLY a valid JSON array — no markdown, no explanation — in this exact shape:
[
  { "title": "Step title", "description": "One or two sentence description of what the learner will understand after this step." },
  ...
]`
}

/**
 * Builds a prompt asking the LLM to generate a rich HTML content page for a
 * single guide step.
 */
export function buildPageGenerationPrompt(
  stepTitle: string,
  stepDescription: string,
  context: string
): string {
  return `You are an expert tutor writing an educational content page.

Step title: ${stepTitle}
Step goal: ${stepDescription}

${context ? `Relevant knowledge base content:\n${context}\n` : ""}
Write a comprehensive, well-structured HTML page that teaches this concept. Include:
- A clear heading
- Explanatory prose broken into logical sections
- Examples where helpful
- A concise summary at the end

Use only semantic HTML tags (h1–h4, p, ul, ol, li, strong, em, code, pre, blockquote). Do NOT include <html>, <head>, or <body> wrapper tags. Respond with the HTML content only.`
}
