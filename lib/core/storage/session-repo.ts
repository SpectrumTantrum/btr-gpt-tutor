import { nanoid } from "nanoid"
import type { Session, Message } from "@/lib/core/types"
import type { SessionRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

export class DexieSessionRepository implements SessionRepository {
  constructor(private readonly db: TutorDatabase) {}

  async listSessions(): Promise<Session[]> {
    const all = await this.db.sessions.toArray()
    return [...all].sort((a, b) => b.updatedAt - a.updatedAt)
  }

  async getSession(id: string): Promise<Session | null> {
    const session = await this.db.sessions.get(id)
    return session ?? null
  }

  async createSession(data: Omit<Session, "id"> & { id?: string }): Promise<Session> {
    const session: Session = { ...data, id: data.id ?? nanoid() }
    await this.db.sessions.add(session)
    return session
  }

  async updateSession(id: string, data: Partial<Omit<Session, "id">>): Promise<Session> {
    await this.db.sessions.update(id, data)
    const updated = await this.db.sessions.get(id)
    if (!updated) throw new Error(`Session ${id} not found`)
    return updated
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.sessions.delete(id)
  }

  async addMessage(sessionId: string, messageData: Omit<Message, "id"> & { id?: string }): Promise<Session> {
    const session = await this.db.sessions.get(sessionId)
    if (!session) throw new Error(`Session ${sessionId} not found`)

    const message: Message = { ...messageData, id: messageData.id ?? nanoid() }
    const updated: Session = {
      ...session,
      messages: [...session.messages, message],
      updatedAt: Date.now(),
    }

    await this.db.sessions.put(updated)
    return updated
  }
}
