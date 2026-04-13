// ============================================================
// Knowledge Base Types
// ============================================================

export interface KnowledgeBase {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly embeddingModel: string
  readonly embeddingDimension: number
  readonly documentCount: number
  readonly chunkCount: number
  readonly createdAt: number
  readonly updatedAt: number
}

export interface Document {
  readonly id: string
  readonly knowledgeBaseId: string
  readonly name: string
  readonly mimeType: string
  readonly size: number
  readonly chunkCount: number
  readonly createdAt: number
}

export interface ChunkMetadata {
  readonly documentName: string
  readonly pageNumber?: number
  readonly headingHierarchy?: readonly string[]
  readonly chunkIndex: number
}

export interface Chunk {
  readonly id: string
  readonly knowledgeBaseId: string
  readonly documentId: string
  readonly content: string
  readonly metadata: ChunkMetadata
  readonly embedding: readonly number[] | null
}

export interface SearchResult {
  readonly chunk: Chunk
  readonly score: number
}

// ============================================================
// Session Types
// ============================================================

export interface Citation {
  readonly chunkId: string
  readonly documentName: string
  readonly content: string
  readonly score: number
}

export interface Message {
  readonly id: string
  readonly role: "user" | "assistant" | "system"
  readonly content: string
  readonly citations?: readonly Citation[]
  readonly createdAt: number
}

export interface Session {
  readonly id: string
  readonly title: string
  readonly knowledgeBaseIds: readonly string[]
  readonly messages: readonly Message[]
  readonly createdAt: number
  readonly updatedAt: number
}

// ============================================================
// Memory Types
// ============================================================

export interface LearnerProfile {
  readonly knowledgeLevels: Readonly<Record<string, "beginner" | "intermediate" | "advanced">>
  readonly learningStyle: "visual" | "verbal" | "hands-on" | "mixed"
  readonly pacePreference: "fast" | "moderate" | "thorough"
  readonly goals: readonly string[]
  readonly language: string
}

export interface TopicProgress {
  readonly topic: string
  readonly mastery: "exploring" | "familiar" | "proficient"
  readonly sessionsCount: number
  readonly lastStudiedAt: number
}

export interface LearningProgress {
  readonly topicsExplored: readonly TopicProgress[]
  readonly totalSessions: number
  readonly totalMessages: number
  readonly lastActiveAt: number
}

export interface Memory {
  readonly id: string
  readonly profile: LearnerProfile
  readonly progress: LearningProgress
  readonly updatedAt: number
}

// ============================================================
// Settings Types
// ============================================================

export interface ProviderConfig {
  readonly provider: string
  readonly model: string
  readonly apiKey: string
  readonly baseUrl?: string
}

export interface AppSettings {
  readonly llm: ProviderConfig
  readonly embedding: ProviderConfig
}
