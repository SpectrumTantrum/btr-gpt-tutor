"use client"

import { useSettingsStore } from "@/lib/store/settings-store"
import { PROVIDERS, getProviderDefinition } from "@/configs/providers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const { llmConfig, embeddingConfig, setLlmConfig, setEmbeddingConfig } =
    useSettingsStore()

  const llmProvider = getProviderDefinition(llmConfig.provider)
  const embeddingProvider = getProviderDefinition(embeddingConfig.provider)

  const embeddingProviders = PROVIDERS.filter(
    (p) => p.embeddingModels && p.embeddingModels.length > 0
  )

  return (
    <div className="p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>

      <div className="space-y-6">
        {/* LLM Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">LLM Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="llm-provider">Provider</Label>
              <Select
                value={llmConfig.provider}
                onValueChange={(value) => {
                  const def = getProviderDefinition(value)
                  setLlmConfig({
                    ...llmConfig,
                    provider: value,
                    model: def?.models[0] ?? "",
                  })
                }}
              >
                <SelectTrigger id="llm-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {PROVIDERS.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="llm-model">Model</Label>
              <Select
                value={llmConfig.model}
                onValueChange={(value) =>
                  setLlmConfig({ ...llmConfig, model: value })
                }
              >
                <SelectTrigger id="llm-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(llmProvider?.models ?? []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {llmProvider?.requiresApiKey && (
              <div className="space-y-1.5">
                <Label htmlFor="llm-key">API Key</Label>
                <Input
                  id="llm-key"
                  type="password"
                  placeholder="sk-…"
                  value={llmConfig.apiKey}
                  onChange={(e) =>
                    setLlmConfig({ ...llmConfig, apiKey: e.target.value })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Embedding Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Embedding Provider</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="emb-provider">Provider</Label>
              <Select
                value={embeddingConfig.provider}
                onValueChange={(value) => {
                  const def = getProviderDefinition(value)
                  setEmbeddingConfig({
                    ...embeddingConfig,
                    provider: value,
                    model: def?.embeddingModels?.[0] ?? "",
                  })
                }}
              >
                <SelectTrigger id="emb-provider">
                  <SelectValue placeholder="Select provider" />
                </SelectTrigger>
                <SelectContent>
                  {embeddingProviders.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="emb-model">Model</Label>
              <Select
                value={embeddingConfig.model}
                onValueChange={(value) =>
                  setEmbeddingConfig({ ...embeddingConfig, model: value })
                }
              >
                <SelectTrigger id="emb-model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {(embeddingProvider?.embeddingModels ?? []).map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {embeddingProvider?.requiresApiKey && (
              <div className="space-y-1.5">
                <Label htmlFor="emb-key">API Key</Label>
                <Input
                  id="emb-key"
                  type="password"
                  placeholder="sk-…"
                  value={embeddingConfig.apiKey}
                  onChange={(e) =>
                    setEmbeddingConfig({
                      ...embeddingConfig,
                      apiKey: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
