import { generateText, streamText } from "ai";
import type { ProviderConfig } from "../types";
import { createLanguageModel } from "./providers";

export interface GenerateOptions {
  readonly config: ProviderConfig;
  readonly system?: string;
  readonly messages: readonly { role: "user" | "assistant" | "system"; content: string }[];
}

export async function generate(options: GenerateOptions) {
  const { config, system, messages } = options;
  const model = createLanguageModel(config);

  return generateText({
    model,
    system,
    messages: messages as { role: "user" | "assistant" | "system"; content: string }[],
  });
}

export function stream(options: GenerateOptions) {
  const { config, system, messages } = options;
  const model = createLanguageModel(config);

  return streamText({
    model,
    system,
    messages: messages as { role: "user" | "assistant" | "system"; content: string }[],
  });
}
