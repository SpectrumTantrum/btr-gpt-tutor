import type {
  KnowledgeBase,
  Document,
  Chunk,
  Session,
  Message,
  Memory,
  AppSettings,
  Notebook,
  NotebookRecord,
  Quiz,
  QuizAttempt,
  GuidePlan,
  Classroom,
  TutorBot,
  SharedClassroom,
} from "@/lib/core/types"

// ============================================================
// Knowledge Repository
// ============================================================

export interface KnowledgeRepository {
  listKnowledgeBases(): Promise<KnowledgeBase[]>
  getKnowledgeBase(id: string): Promise<KnowledgeBase | null>
  createKnowledgeBase(data: Omit<KnowledgeBase, "id"> & { id?: string }): Promise<KnowledgeBase>
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
  createSession(data: Omit<Session, "id"> & { id?: string }): Promise<Session>
  updateSession(id: string, data: Partial<Omit<Session, "id">>): Promise<Session>
  deleteSession(id: string): Promise<void>
  addMessage(sessionId: string, message: Omit<Message, "id"> & { id?: string }): Promise<Session>
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

// ============================================================
// Notebook Repository
// ============================================================

export interface NotebookRepository {
  listNotebooks(): Promise<Notebook[]>
  getNotebook(id: string): Promise<Notebook | null>
  createNotebook(data: Omit<Notebook, "id">): Promise<Notebook>
  updateNotebook(id: string, data: Partial<Omit<Notebook, "id">>): Promise<Notebook>
  deleteNotebook(id: string): Promise<void>
  addRecord(data: Omit<NotebookRecord, "id">): Promise<NotebookRecord>
  getRecords(notebookId: string): Promise<NotebookRecord[]>
  deleteRecord(id: string): Promise<void>
}

// ============================================================
// Quiz Repository
// ============================================================

export interface QuizRepository {
  createQuiz(data: Omit<Quiz, "id">): Promise<Quiz>
  getQuiz(id: string): Promise<Quiz | null>
  listQuizzes(knowledgeBaseId: string): Promise<Quiz[]>
  deleteQuiz(id: string): Promise<void>
  saveAttempt(data: Omit<QuizAttempt, "id">): Promise<QuizAttempt>
  getAttempts(quizId: string): Promise<QuizAttempt[]>
}

// ============================================================
// Guide Repository
// ============================================================

export interface GuideRepository {
  createGuide(data: Omit<GuidePlan, "id">): Promise<GuidePlan>
  getGuide(id: string): Promise<GuidePlan | null>
  updateGuide(id: string, data: Partial<Omit<GuidePlan, "id">>): Promise<GuidePlan>
  listGuides(knowledgeBaseId: string): Promise<GuidePlan[]>
  deleteGuide(id: string): Promise<void>
}

// ============================================================
// Classroom Repository
// ============================================================

export interface ClassroomRepository {
  createClassroom(data: Omit<Classroom, "id"> & { id?: string }): Promise<Classroom>
  getClassroom(id: string): Promise<Classroom | null>
  updateClassroom(id: string, data: Partial<Omit<Classroom, "id">>): Promise<Classroom>
  listClassrooms(): Promise<Classroom[]>
  deleteClassroom(id: string): Promise<void>
}

// ============================================================
// TutorBot Repository
// ============================================================

export interface TutorBotRepository {
  createBot(data: Omit<TutorBot, "id"> & { id?: string }): Promise<TutorBot>
  getBot(id: string): Promise<TutorBot | null>
  updateBot(id: string, data: Partial<Omit<TutorBot, "id">>): Promise<TutorBot>
  listBots(): Promise<TutorBot[]>
  deleteBot(id: string): Promise<void>
}

// ============================================================
// Shared Classroom Repository
// ============================================================

export interface SharedClassroomRepository {
  createShare(data: Omit<SharedClassroom, "id">): Promise<SharedClassroom>
  getShareByToken(token: string): Promise<SharedClassroom | null>
  listSharesByClassroom(classroomId: string): Promise<SharedClassroom[]>
  deleteShare(id: string): Promise<void>
}
