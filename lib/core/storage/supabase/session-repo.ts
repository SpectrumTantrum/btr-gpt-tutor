import type { SupabaseClient } from "@supabase/supabase-js"
import { nanoid } from "nanoid"
import type { Session, Message } from "@/lib/core/types"
import type { SessionRepository } from "@/lib/core/storage/repository"

function toSession(row: Record<string, unknown>): Session {
  return {
    id: row.id as string,
    title: row.title as string,
    knowledgeBaseIds: (row.knowledge_base_ids as string[]) ?? [],
    messages: (row.messages as Message[]) ?? [],
    createdAt: new Date(row.created_at as string).getTime(),
    updatedAt: new Date(row.updated_at as string).getTime(),
  }
}

export class SupabaseSessionRepository implements SessionRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string
  ) {}

  async listSessions(): Promise<Session[]> {
    const { data, error } = await this.supabase
      .from("sessions")
      .select("*")
      .eq("user_id", this.userId)
      .order("updated_at", { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []).map(toSession)
  }

  async getSession(id: string): Promise<Session | null> {
    const { data, error } = await this.supabase
      .from("sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", this.userId)
      .maybeSingle()

    if (error) throw new Error(error.message)
    return data ? toSession(data) : null
  }

  async createSession(data: Omit<Session, "id"> & { id?: string }): Promise<Session> {
    const row = {
      id: data.id ?? nanoid(),
      user_id: this.userId,
      title: data.title,
      knowledge_base_ids: data.knowledgeBaseIds,
      messages: data.messages,
    }

    const { data: inserted, error } = await this.supabase
      .from("sessions")
      .insert(row)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toSession(inserted)
  }

  async updateSession(id: string, data: Partial<Omit<Session, "id">>): Promise<Session> {
    const updates: Record<string, unknown> = {}
    if (data.title !== undefined) updates.title = data.title
    if (data.knowledgeBaseIds !== undefined) updates.knowledge_base_ids = data.knowledgeBaseIds
    if (data.messages !== undefined) updates.messages = data.messages
    if (data.updatedAt !== undefined) updates.updated_at = new Date(data.updatedAt).toISOString()

    const { data: updated, error } = await this.supabase
      .from("sessions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", this.userId)
      .select("*")
      .single()

    if (error) throw new Error(error.message)
    return toSession(updated)
  }

  async deleteSession(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("sessions")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId)

    if (error) throw new Error(error.message)
  }

  async addMessage(
    sessionId: string,
    messageData: Omit<Message, "id"> & { id?: string }
  ): Promise<Session> {
    const session = await this.getSession(sessionId)
    if (!session) throw new Error(`Session ${sessionId} not found`)

    const message: Message = { ...messageData, id: messageData.id ?? nanoid() }
    const updatedMessages = [...session.messages, message]

    return this.updateSession(sessionId, {
      messages: updatedMessages,
      updatedAt: Date.now(),
    })
  }
}
