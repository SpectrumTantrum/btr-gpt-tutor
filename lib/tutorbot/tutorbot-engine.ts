import type { TutorBot, ProviderConfig } from "@/lib/core/types"
import type { TutorBotRepository } from "@/lib/core/storage/repository"
import { stream } from "@/lib/core/ai/llm"
import { getSoulTemplate } from "./soul-templates"
import { buildBotSystemPrompt } from "./prompts"

// ============================================================
// Types
// ============================================================

interface CreateBotInput {
  readonly name: string
  readonly persona: string
  readonly soulTemplateId?: string
  readonly model?: string
}

// ============================================================
// TutorBotEngine
// ============================================================

export class TutorBotEngine {
  constructor(
    private readonly repo: TutorBotRepository,
    private readonly providerConfig: ProviderConfig,
  ) {}

  async createBot(input: CreateBotInput): Promise<TutorBot> {
    const now = Date.now()
    return this.repo.createBot({
      name: input.name,
      persona: input.persona,
      soulTemplateId: input.soulTemplateId,
      model: input.model ?? this.providerConfig.model,
      status: "stopped",
      skills: [],
      heartbeat: { enabled: false, intervalMs: 60000, message: "" },
      memoryContext: "",
      channels: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  async getBot(id: string): Promise<TutorBot | null> {
    return this.repo.getBot(id)
  }

  async listBots(): Promise<TutorBot[]> {
    return this.repo.listBots()
  }

  streamBotResponse(botId: string, message: string, memoryContext: string) {
    return this.repo.getBot(botId).then((bot) => {
      if (bot === null) {
        throw new Error(`TutorBot ${botId} not found`)
      }

      const soul =
        bot.soulTemplateId !== undefined ? getSoulTemplate(bot.soulTemplateId) : null

      const systemPrompt = buildBotSystemPrompt(bot, soul, memoryContext)

      return stream({
        config: { ...this.providerConfig, model: bot.model },
        system: systemPrompt,
        messages: [{ role: "user", content: message }],
      })
    })
  }
}
