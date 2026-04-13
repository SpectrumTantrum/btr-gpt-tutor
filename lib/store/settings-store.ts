import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ProviderConfig } from "@/lib/core/types"

interface SettingsState {
  readonly llmConfig: ProviderConfig
  readonly embeddingConfig: ProviderConfig
  setLlmConfig: (config: ProviderConfig) => void
  setEmbeddingConfig: (config: ProviderConfig) => void
}

const DEFAULT_LLM_CONFIG: ProviderConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
  apiKey: "",
}

const DEFAULT_EMBEDDING_CONFIG: ProviderConfig = {
  provider: "openai",
  model: "text-embedding-3-small",
  apiKey: "",
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      llmConfig: DEFAULT_LLM_CONFIG,
      embeddingConfig: DEFAULT_EMBEDDING_CONFIG,
      setLlmConfig: (config) => set({ llmConfig: { ...config } }),
      setEmbeddingConfig: (config) => set({ embeddingConfig: { ...config } }),
    }),
    {
      name: "btr-settings",
    }
  )
)
