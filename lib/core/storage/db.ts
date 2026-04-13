import Dexie, { type Table } from "dexie"
import type { KnowledgeBase, Document, Chunk, Session, Memory, AppSettings, Notebook, NotebookRecord, Quiz, QuizAttempt, GuidePlan } from "@/lib/core/types"

export class TutorDatabase extends Dexie {
  knowledgeBases!: Table<KnowledgeBase, string>
  documents!: Table<Document, string>
  chunks!: Table<Chunk, string>
  sessions!: Table<Session, string>
  memory!: Table<Memory, string>
  settings!: Table<AppSettings & { id: string }, string>
  notebooks!: Table<Notebook, string>
  notebookRecords!: Table<NotebookRecord, string>
  quizzes!: Table<Quiz, string>
  quizAttempts!: Table<QuizAttempt, string>
  guides!: Table<GuidePlan, string>

  constructor(name = "TutorDatabase") {
    super(name)

    this.version(1).stores({
      knowledgeBases: "id, name, createdAt, updatedAt",
      documents: "id, knowledgeBaseId, name, createdAt",
      chunks: "id, knowledgeBaseId, documentId",
      sessions: "id, title, createdAt, updatedAt",
      memory: "id",
      settings: "id",
    })

    this.version(2).stores({
      knowledgeBases: "id, name, createdAt, updatedAt",
      documents: "id, knowledgeBaseId, name, createdAt",
      chunks: "id, knowledgeBaseId, documentId",
      sessions: "id, title, createdAt, updatedAt",
      memory: "id",
      settings: "id",
      notebooks: "id, name, createdAt",
      notebookRecords: "id, notebookId, source, createdAt",
    })

    this.version(3).stores({
      knowledgeBases: "id, name, createdAt, updatedAt",
      documents: "id, knowledgeBaseId, name, createdAt",
      chunks: "id, knowledgeBaseId, documentId",
      sessions: "id, title, createdAt, updatedAt",
      memory: "id",
      settings: "id",
      notebooks: "id, name, createdAt",
      notebookRecords: "id, notebookId, source, createdAt",
      quizzes: "id, knowledgeBaseId, createdAt",
      quizAttempts: "id, quizId, completedAt",
      guides: "id, knowledgeBaseId, status, createdAt",
    })
  }
}
