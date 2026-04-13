import { isMultiUserMode } from "@/lib/core/auth/middleware"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieKnowledgeRepository } from "@/lib/core/storage/knowledge-repo"
import { DexieSessionRepository } from "@/lib/core/storage/session-repo"
import { DexieMemoryRepository } from "@/lib/core/storage/memory-repo"
import { DexieNotebookRepository } from "@/lib/core/storage/notebook-repo"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import { DexieTutorBotRepository } from "@/lib/core/storage/tutorbot-repo"
import type {
  KnowledgeRepository,
  SessionRepository,
  MemoryRepository,
  NotebookRepository,
  ClassroomRepository,
  TutorBotRepository,
} from "@/lib/core/storage/repository"

export interface RepositorySet {
  readonly knowledge: KnowledgeRepository
  readonly session: SessionRepository
  readonly memory: MemoryRepository
  readonly notebook: NotebookRepository
  readonly classroom: ClassroomRepository
  readonly tutorbot: TutorBotRepository
}

export function createRepositories(userId?: string): RepositorySet {
  if (isMultiUserMode() && userId) {
    // Supabase mode — import dynamically to avoid bundling when not needed
    throw new Error(
      "Supabase repositories require runtime configuration — use createSupabaseRepositories()"
    )
  }

  // Personal mode — Dexie
  const db = new TutorDatabase()
  return {
    knowledge: new DexieKnowledgeRepository(db),
    session: new DexieSessionRepository(db),
    memory: new DexieMemoryRepository(db),
    notebook: new DexieNotebookRepository(db),
    classroom: new DexieClassroomRepository(db),
    tutorbot: new DexieTutorBotRepository(db),
  }
}
