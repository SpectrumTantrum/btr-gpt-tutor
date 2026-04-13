import type { CoWriterRequest, ProviderConfig } from "@/lib/core/types";
import { createLanguageModel } from "@/lib/core/ai/providers";
import { streamText } from "ai";
import { buildCoWriterPrompt } from "./prompts";

/**
 * Streams an LLM-generated co-writer edit for the given request.
 *
 * @param request  The co-writer operation, selected text, and full document content.
 * @param context  Optional additional context (e.g. retrieved knowledge base chunks).
 * @param config   The LLM provider configuration.
 * @returns        The streamText result from the AI SDK.
 */
export function streamCoWriterEdit(
  request: CoWriterRequest,
  context: string | undefined,
  config: ProviderConfig
) {
  const model = createLanguageModel(config);
  const prompt = buildCoWriterPrompt(
    request.operation,
    request.selectedText,
    request.fullContent,
    context
  );

  return streamText({
    model,
    prompt,
  });
}
