import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import type { LanguageModel } from "ai";
import type { ProviderConfig } from "../types";

export function createLanguageModel(config: ProviderConfig): LanguageModel {
  const { provider, model, apiKey, baseUrl } = config;

  switch (provider) {
    case "openai": {
      const openai = createOpenAI({ apiKey, baseURL: baseUrl });
      return openai(model);
    }
    case "anthropic": {
      const anthropic = createAnthropic({ apiKey, baseURL: baseUrl });
      return anthropic(model);
    }
    case "google": {
      const google = createGoogleGenerativeAI({ apiKey, baseURL: baseUrl });
      return google(model);
    }
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}
