import type { SupabaseClient } from "@supabase/supabase-js"
import type { Memory } from "@/lib/core/types"
import type { MemoryRepository } from "@/lib/core/storage/repository"

function toMemory(row: Record<string, unknown>): Memory {
  return {
    id: row.id as string,
    profile: row.profile as Memory["profile"],
    progress: row.progress as Memory["progress"],
    updatedAt: new Date(row.updated_at as string).getTime(),
  }
}

export class SupabaseMemoryRepository implements MemoryRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async getMemory(): Promise<Memory | undefined> {
    const { data, error } = await this.supabase
      .from("memory")
      .select("*")
      .eq("user_id", this.userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? toMemory(data) : undefined
  }

  async saveMemory(memory: Memory): Promise<void> {
    const row = {
      id: memory.id,
      user_id: this.userId,
      profile: memory.profile,
      progress: memory.progress,
      updated_at: new Date(memory.updatedAt).toISOString(),
    }

    const { error } = await this.supabase
      .from("memory")
      .upsert(row, { onConflict: "user_id" })

    if (error) throw new Error(error.message)
  }
}
