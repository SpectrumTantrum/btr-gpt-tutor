import type { Session, Message, Citation } from "@/lib/core/types"
import type { SessionRepository } from "@/lib/core/storage/repository"
import { generateId } from "@/lib/utils/id"

interface CreateSessionOptions {
  knowledgeBaseIds: readonly string[]
  title?: string
}

export class SessionService {
  constructor(private readonly repo: SessionRepository) {}

  async createSession(options: CreateSessionOptions): Promise<Session> {
    const now = Date.now()
    return this.repo.createSession({
      id: generateId("sess"),
      title: options.title ?? "New Session",
      knowledgeBaseIds: options.knowledgeBaseIds,
      messages: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  async getSession(id: string): Promise<Session | null> {
    return this.repo.getSession(id)
  }

  async listSessions(): Promise<Session[]> {
    return this.repo.listSessions()
  }

  async deleteSession(id: string): Promise<void> {
    return this.repo.deleteSession(id)
  }

  async addUserMessage(sessionId: string, content: string): Promise<Session> {
    const message: Omit<Message, "id"> & { id: string } = {
      id: generateId("msg"),
      role: "user",
      content,
      createdAt: Date.now(),
    }
    return this.repo.addMessage(sessionId, message)
  }

  async addAssistantMessage(
    sessionId: string,
    content: string,
    citations?: readonly Citation[]
  ): Promise<Session> {
    const message: Omit<Message, "id"> & { id: string } = {
      id: generateId("msg"),
      role: "assistant",
      content,
      createdAt: Date.now(),
      ...(citations !== undefined ? { citations } : {}),
    }
    return this.repo.addMessage(sessionId, message)
  }

  async updateTitle(sessionId: string, title: string): Promise<Session> {
    return this.repo.updateSession(sessionId, { title, updatedAt: Date.now() })
  }
}
