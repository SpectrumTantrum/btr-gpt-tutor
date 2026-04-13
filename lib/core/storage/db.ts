import Dexie, { type Table } from "dexie"
import type { KnowledgeBase, Document, Chunk, Session, Memory, AppSettings } from "@/lib/core/types"

export class TutorDatabase extends Dexie {
  knowledgeBases!: Table<KnowledgeBase, string>
  documents!: Table<Document, string>
  chunks!: Table<Chunk, string>
  sessions!: Table<Session, string>
  memory!: Table<Memory, string>
  settings!: Table<AppSettings & { id: string }, string>

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
  }
}
