import type { CoWriterOperation } from "@/lib/core/types";

/**
 * Prompt builders for the co-writer feature.
 * These produce LLM-ready strings — no I/O, pure functions.
 */

/**
 * Builds a prompt instructing the LLM to apply the given co-writer operation
 * to the selected text, with the full document as context.
 */
export function buildCoWriterPrompt(
  operation: CoWriterOperation,
  selectedText: string,
  fullContent: string,
  context?: string
): string {
  const contextSection = context
    ? `\nAdditional context:\n${context}\n`
    : "";

  const fullContentSection = `Document context:\n${fullContent}`;

  switch (operation) {
    case "rewrite":
      return `Rewrite the following passage to improve clarity, flow, and style while preserving its original meaning.

${fullContentSection}
${contextSection}
Selected text to rewrite:
${selectedText}

Return only the rewritten text with no additional explanation.`;

    case "expand":
      return `Expand the following passage with more detail, examples, and depth to help the reader better understand the topic.

${fullContentSection}
${contextSection}
Selected text to expand:
${selectedText}

Return only the expanded text with no additional explanation.`;

    case "shorten":
      return `Shorten the following passage to be more concise without losing the core meaning or key information.

${fullContentSection}
${contextSection}
Selected text to shorten:
${selectedText}

Return only the shortened text with no additional explanation.`;

    case "summarize":
      return `Summarize the following passage in 2-3 sentences, capturing only the most essential points.

${fullContentSection}
${contextSection}
Selected text to summarize:
${selectedText}

Return only the summary with no additional explanation.`;
  }
}
