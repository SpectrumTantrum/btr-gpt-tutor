export function buildDecompositionPrompt(topic: string): string {
  return `You are a research assistant. Decompose the following research topic into 3 to 5 focused subtopics that together cover the subject comprehensively.

Topic: ${topic}

Return your answer as a JSON array only, with no additional text. Each element must have exactly two fields:
- "title": a short descriptive label for the subtopic
- "query": a precise search query that would retrieve relevant sources for this subtopic

Example format:
[
  { "title": "Historical background", "query": "history and origins of ${topic}" },
  { "title": "Core mechanisms", "query": "how ${topic} works mechanistically" }
]`;
}

export function buildResearchPrompt(
  subtopic: string,
  ragResults: readonly string[],
  webResults: readonly string[]
): string {
  const ragSection =
    ragResults.length > 0
      ? `Knowledge base sources:\n${ragResults.map((r, i) => `[KB${i + 1}] ${r}`).join("\n")}`
      : "No knowledge base sources available.";

  const webSection =
    webResults.length > 0
      ? `Web sources:\n${webResults.map((r, i) => `[WEB${i + 1}] ${r}`).join("\n")}`
      : "No web sources available.";

  return `You are a research writer. Write a thorough, well-structured section on the following subtopic. Use the provided sources and cite them inline using their reference labels (e.g., [KB1], [WEB2]).

Subtopic: ${subtopic}

${ragSection}

${webSection}

Write a comprehensive section with clear paragraphs. Cite every factual claim with the appropriate source label. Do not fabricate citations.`;
}

export function buildSynthesisPrompt(
  topic: string,
  sections: readonly string[]
): string {
  const sectionText = sections
    .map((s, i) => `--- Section ${i + 1} ---\n${s}`)
    .join("\n\n");

  return `You are a research editor. Synthesize the following research sections into a final, cohesive report on the given topic.

Topic: ${topic}

${sectionText}

Your report must include:
1. An executive summary (2-3 sentences capturing the key findings)
2. A coherent synthesis that integrates all sections, resolves any contradictions, and draws conclusions
3. A brief conclusion with implications or open questions

Write in clear, professional prose suitable for an informed audience.`;
}
