import type { Message, LearnerProfile, Chunk, SearchResult } from "@/lib/core/types";
import type { ProviderConfig } from "@/lib/core/types";
import { embedText } from "@/lib/core/ai/embeddings";
import { retrieveChunks } from "@/lib/core/knowledge/retriever";
import { createLanguageModel } from "@/lib/core/ai/providers";
import { streamText } from "ai";
import { buildSystemPrompt } from "./prompts";

const TOP_K = 5;
const MIN_SCORE = 0.3;

export interface ChatRequest {
  readonly messages: readonly Message[];
  readonly llmConfig: ProviderConfig;
  readonly embeddingConfig: ProviderConfig;
  readonly chunks: readonly Chunk[];
  readonly profile: LearnerProfile | null;
}

export interface ChatResponse {
  readonly textStream: AsyncIterable<string>;
  readonly citations: readonly SearchResult[];
}

export async function streamChat(request: ChatRequest): Promise<ChatResponse> {
  const { messages, llmConfig, embeddingConfig, chunks, profile } = request;

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  let retrievedChunks: readonly SearchResult[] = [];

  if (lastUserMessage && chunks.length > 0) {
    const queryEmbedding = await embedText(lastUserMessage.content, embeddingConfig);
    retrievedChunks = retrieveChunks(queryEmbedding, chunks, { topK: TOP_K, minScore: MIN_SCORE });
  }

  const systemPrompt = buildSystemPrompt(profile, retrievedChunks);
  const model = createLanguageModel(llmConfig);

  const aiMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const result = streamText({
    model,
    system: systemPrompt,
    messages: aiMessages,
  });

  return {
    textStream: result.textStream,
    citations: retrievedChunks,
  };
}
