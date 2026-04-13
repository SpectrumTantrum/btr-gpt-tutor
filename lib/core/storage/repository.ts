import type {
  KnowledgeBase,
  Document,
  Chunk,
  Session,
  Message,
  Memory,
  AppSettings,
} from "@/lib/core/types"

// ============================================================
// Knowledge Repository
// ============================================================

export interface KnowledgeRepository {
  listKnowledgeBases(): Promise<KnowledgeBase[]>
  getKnowledgeBase(id: string): Promise<KnowledgeBase | null>
  createKnowledgeBase(data: Omit<KnowledgeBase, "id">): Promise<KnowledgeBase>
  updateKnowledgeBase(id: string, data: Partial<Omit<KnowledgeBase, "id">>): Promise<KnowledgeBase>
  deleteKnowledgeBase(id: string): Promise<void>

  addDocument(data: Omit<Document, "id">): Promise<Document>
  getDocuments(knowledgeBaseId: string): Promise<Document[]>
  deleteDocument(id: string): Promise<void>

  addChunks(data: Omit<Chunk, "id">[]): Promise<Chunk[]>
  getChunks(knowledgeBaseId: string): Promise<Chunk[]>
  getChunksByDocument(documentId: string): Promise<Chunk[]>
  updateChunkEmbedding(id: string, embedding: number[]): Promise<void>
  deleteChunksByDocument(documentId: string): Promise<void>
}

// ============================================================
// Session Repository
// ============================================================

export interface SessionRepository {
  listSessions(): Promise<Session[]>
  getSession(id: string): Promise<Session | null>
  createSession(data: Omit<Session, "id">): Promise<Session>
  updateSession(id: string, data: Partial<Omit<Session, "id">>): Promise<Session>
  deleteSession(id: string): Promise<void>
  addMessage(sessionId: string, message: Omit<Message, "id">): Promise<Session>
}

// ============================================================
// Memory Repository
// ============================================================

export interface MemoryRepository {
  getMemory(): Promise<Memory | undefined>
  saveMemory(memory: Memory): Promise<void>
}

// ============================================================
// Settings Repository
// ============================================================

export interface SettingsRepository {
  getSettings(): Promise<AppSettings | undefined>
  saveSettings(settings: AppSettings): Promise<void>
}
