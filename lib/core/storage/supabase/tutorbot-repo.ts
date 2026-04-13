import type { SupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"
import type { TutorBot } from "@/lib/core/types"
import type { TutorBotRepository } from "@/lib/core/storage/repository"

const BOT_ID_PREFIX = "bot_"

function toTutorBot(row: Record<string, unknown>): TutorBot {
  return {
    id: row.id as string,
    name: row.name as string,
    persona: row.persona as string,
    soulTemplateId: row.soul_template_id as string | undefined,
    status: row.status as TutorBot["status"],
    model: row.model as string,
    skills: (row.skills as TutorBot["skills"]) ?? [],
    heartbeat: row.heartbeat as TutorBot["heartbeat"],
    memoryContext: row.memory_context as string,
    channels: (row.channels as string[]) ?? [],
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  }
}

export class SupabaseTutorBotRepository implements TutorBotRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async createBot(data: Omit<TutorBot, "id"> & { id?: string }): Promise<TutorBot> {
    const row = {
      id: data.id ?? `${BOT_ID_PREFIX}${nanoid()}`,
      user_id: this.userId,
      name: data.name,
      persona: data.persona,
      soul_template_id: data.soulTemplateId ?? null,
      status: data.status,
      model: data.model,
      skills: data.skills,
      heartbeat: data.heartbeat,
      memory_context: data.memoryContext,
      channels: data.channels,
    }

    const { data: inserted, error } = await this.supabase
      .from("tutorbots")
      .insert(row)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toTutorBot(inserted)
  }

  async getBot(id: string): Promise<TutorBot | null> {
    const { data, error } = await this.supabase
      .from("tutorbots")
      .select("*")
      .eq("id", id)
      .eq("user_id", this.userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? toTutorBot(data) : null
  }

  async updateBot(id: string, data: Partial<Omit<TutorBot, "id">>): Promise<TutorBot> {
    const updates: Record<string, unknown> = {}
    if (data.name !== undefined) updates.name = data.name
    if (data.persona !== undefined) updates.persona = data.persona
    if (data.soulTemplateId !== undefined) updates.soul_template_id = data.soulTemplateId
    if (data.status !== undefined) updates.status = data.status
    if (data.model !== undefined) updates.model = data.model
    if (data.skills !== undefined) updates.skills = data.skills
    if (data.heartbeat !== undefined) updates.heartbeat = data.heartbeat
    if (data.memoryContext !== undefined) updates.memory_context = data.memoryContext
    if (data.channels !== undefined) updates.channels = data.channels
    if (data.updatedAt !== undefined) updates.updated_at = new Date(data.updatedAt).toISOString()

    const { data: updated, error } = await this.supabase
      .from("tutorbots")
      .update(updates)
      .eq("id", id)
      .eq("user_id", this.userId)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toTutorBot(updated)
  }

  async listBots(): Promise<TutorBot[]> {
    const { data, error } = await this.supabase
      .from("tutorbots")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toTutorBot)
  }

  async deleteBot(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("tutorbots")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId)

    if (error) throw new Error(error.message)
  }
}
