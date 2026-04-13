import { nanoid } from "nanoid"
import type { TutorBot } from "@/lib/core/types"
import type { TutorBotRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

const BOT_ID_PREFIX = "bot_"

export class DexieTutorBotRepository implements TutorBotRepository {
  constructor(private readonly db: TutorDatabase) {}

  async createBot(data: Omit<TutorBot, "id"> & { id?: string }): Promise<TutorBot> {
    const bot: TutorBot = {
      ...data,
      id: data.id ?? `${BOT_ID_PREFIX}${nanoid()}`,
    }
    await this.db.tutorbots.add(bot)
    return bot
  }

  async getBot(id: string): Promise<TutorBot | null> {
    const bot = await this.db.tutorbots.get(id)
    return bot ?? null
  }

  async updateBot(id: string, data: Partial<Omit<TutorBot, "id">>): Promise<TutorBot> {
    await this.db.tutorbots.update(id, data)
    const updated = await this.db.tutorbots.get(id)
    if (!updated) throw new Error(`TutorBot ${id} not found`)
    return updated
  }

  async listBots(): Promise<TutorBot[]> {
    return this.db.tutorbots.toArray()
  }

  async deleteBot(id: string): Promise<void> {
    await this.db.tutorbots.delete(id)
  }
}
