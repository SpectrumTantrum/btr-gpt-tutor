export interface ProviderDefinition {
  readonly id: string;
  readonly name: string;
  readonly requiresApiKey: boolean;
  readonly defaultBaseUrl?: string;
  readonly models: readonly string[];
  readonly embeddingModels?: readonly string[];
}

export const PROVIDERS: readonly ProviderDefinition[] = [
  {
    id: "openai",
    name: "OpenAI",
    requiresApiKey: true,
    models: ["gpt-4o", "gpt-4o-mini", "o4-mini"],
    embeddingModels: ["text-embedding-3-small", "text-embedding-3-large"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    requiresApiKey: true,
    models: ["claude-sonnet-4-6", "claude-haiku-4-5"],
  },
  {
    id: "google",
    name: "Google",
    requiresApiKey: true,
    models: ["gemini-2.5-flash", "gemini-2.5-pro"],
    embeddingModels: ["text-embedding-004"],
  },
] as const;

export function getProviderDefinition(id: string): ProviderDefinition | undefined {
  return PROVIDERS.find((p) => p.id === id);
}
