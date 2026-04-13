import type { Memory, LearnerProfile, LearningProgress, TopicProgress } from "@/lib/core/types"
import type { MemoryRepository } from "@/lib/core/storage/repository"

// ============================================================
// Constants
// ============================================================

const MEMORY_DEFAULT_ID = "memory_default"

const DEFAULT_PROFILE: LearnerProfile = {
  knowledgeLevels: {},
  learningStyle: "mixed",
  pacePreference: "moderate",
  goals: [],
  language: "en",
}

const DEFAULT_PROGRESS: LearningProgress = {
  topicsExplored: [],
  totalSessions: 0,
  totalMessages: 0,
  lastActiveAt: 0,
}

// ============================================================
// Types
// ============================================================

interface RecordSessionParams {
  topics: string[]
  messageCount: number
}

// ============================================================
// MemoryService
// ============================================================

export class MemoryService {
  constructor(private readonly repo: MemoryRepository) {}

  async getOrInitMemory(): Promise<Memory> {
    const existing = await this.repo.getMemory()
    if (existing !== undefined) {
      return existing
    }

    const defaultMemory: Memory = {
      id: MEMORY_DEFAULT_ID,
      profile: { ...DEFAULT_PROFILE },
      progress: { ...DEFAULT_PROGRESS, lastActiveAt: Date.now() },
      updatedAt: Date.now(),
    }

    await this.repo.saveMemory(defaultMemory)
    return defaultMemory
  }

  async updateProfile(updates: Partial<LearnerProfile>): Promise<Memory> {
    const current = await this.getOrInitMemory()

    const updated: Memory = {
      ...current,
      profile: { ...current.profile, ...updates },
      updatedAt: Date.now(),
    }

    await this.repo.saveMemory(updated)
    return updated
  }

  async recordSessionCompleted({ topics, messageCount }: RecordSessionParams): Promise<Memory> {
    const current = await this.getOrInitMemory()
    const now = Date.now()

    const updatedTopics = upsertTopics(current.progress.topicsExplored, topics, now)

    const updatedProgress: LearningProgress = {
      ...current.progress,
      totalSessions: current.progress.totalSessions + 1,
      totalMessages: current.progress.totalMessages + messageCount,
      topicsExplored: updatedTopics,
      lastActiveAt: now,
    }

    const updated: Memory = {
      ...current,
      progress: updatedProgress,
      updatedAt: now,
    }

    await this.repo.saveMemory(updated)
    return updated
  }
}

// ============================================================
// Helpers
// ============================================================

function upsertTopics(
  existing: readonly TopicProgress[],
  topics: string[],
  now: number,
): readonly TopicProgress[] {
  const topicMap = new Map<string, TopicProgress>(existing.map((t) => [t.topic, t]))

  for (const topic of topics) {
    const current = topicMap.get(topic)
    if (current !== undefined) {
      topicMap.set(topic, {
        ...current,
        sessionsCount: current.sessionsCount + 1,
        lastStudiedAt: now,
      })
    } else {
      topicMap.set(topic, {
        topic,
        mastery: "exploring",
        sessionsCount: 1,
        lastStudiedAt: now,
      })
    }
  }

  return Array.from(topicMap.values())
}
