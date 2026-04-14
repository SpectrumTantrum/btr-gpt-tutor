import { embed, embedMany } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { EmbeddingModel } from "ai";
import type { ProviderConfig } from "../types";

function createEmbeddingModel(config: ProviderConfig): EmbeddingModel {
  const { provider, model, apiKey, baseUrl } = config;

  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey, baseURL: baseUrl });
      return openai.embedding(model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey, baseURL: baseUrl });
      return google.textEmbeddingModel(model);
    }
    default:
      throw new Error(`Unsupported embedding provider: ${provider}`);
  }
}

export async function embedText(text: string, config: ProviderConfig): Promise<number[]> {
  const embeddingModel = createEmbeddingModel(config);
  const { embedding } = await embed({ model: embeddingModel, value: text });
  return embedding;
}

export async function embedTexts(texts: string[], config: ProviderConfig): Promise<number[][]> {
  const embeddingModel = createEmbeddingModel(config);
  const { embeddings } = await embedMany({ model: embeddingModel, values: texts });
  return embeddings;
}
