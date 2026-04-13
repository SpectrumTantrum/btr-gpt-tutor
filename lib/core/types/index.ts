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

// ============================================================
// Notebook Types
// ============================================================

export interface Notebook {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly color: string;
  readonly recordCount: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface NotebookRecord {
  readonly id: string;
  readonly notebookId: string;
  readonly title: string;
  readonly content: string;
  readonly source: "chat" | "quiz" | "guide" | "research" | "co-writer" | "manual";
  readonly sourceId?: string;
  readonly tags: readonly string[];
  readonly createdAt: number;
}

// ============================================================
// Quiz Types
// ============================================================

export type QuestionType = "single_choice" | "multiple_choice" | "short_answer";

export interface QuizQuestion {
  readonly id: string;
  readonly type: QuestionType;
  readonly question: string;
  readonly options?: readonly string[];
  readonly correctAnswer: string;
  readonly explanation: string;
}

export interface Quiz {
  readonly id: string;
  readonly knowledgeBaseId: string;
  readonly title: string;
  readonly questions: readonly QuizQuestion[];
  readonly createdAt: number;
}

export interface QuizAttempt {
  readonly id: string;
  readonly quizId: string;
  readonly answers: readonly QuizAnswer[];
  readonly score: number;
  readonly totalQuestions: number;
  readonly completedAt: number;
}

export interface QuizAnswer {
  readonly questionId: string;
  readonly userAnswer: string;
  readonly isCorrect: boolean;
  readonly feedback: string;
}

// ============================================================
// Guided Learning Types
// ============================================================

export interface GuidePlan {
  readonly id: string;
  readonly knowledgeBaseId: string;
  readonly topic: string;
  readonly steps: readonly GuideStep[];
  readonly status: "in_progress" | "completed";
  readonly currentStepIndex: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface GuideStep {
  readonly title: string;
  readonly description: string;
  readonly htmlContent?: string;
  readonly isCompleted: boolean;
}

// ============================================================
// Plugin and Search Types
// ============================================================

export interface ToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly execute: (params: Record<string, unknown>) => Promise<unknown>;
}

export interface CapabilityDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly requiredTools: readonly string[];
}

export type ChatMode = "chat" | "deep_solve" | "deep_research" | "vision_solver";

export interface WebSearchResult {
  readonly title: string;
  readonly url: string;
  readonly snippet: string;
}

export interface SearchOptions {
  readonly query: string;
  readonly maxResults?: number;
  readonly provider?: string;
}

// ============================================================
// Classroom Types
// ============================================================

export interface Classroom {
  readonly id: string;
  readonly title: string;
  readonly knowledgeBaseId: string;
  readonly scenes: readonly Scene[];
  readonly agents: readonly AgentConfig[];
  readonly status: "generating" | "ready" | "error";
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface Scene {
  readonly id: string;
  readonly classroomId: string;
  readonly type: "slide" | "quiz" | "interactive" | "discussion";
  readonly title: string;
  readonly order: number;
  readonly slide?: SlideData;
  readonly narration?: string;
  readonly actions: readonly ClassroomAction[];
}

export interface SlideData {
  readonly elements: readonly SlideElement[];
  readonly background?: string;
  readonly transition?: string;
}

export type SlideElementType = "text" | "image" | "shape" | "chart" | "latex";

export interface SlideElement {
  readonly id: string;
  readonly type: SlideElementType;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly content: string;
  readonly style?: Readonly<Record<string, string>>;
}

export interface AgentConfig {
  readonly id: string;
  readonly name: string;
  readonly role: "teacher" | "student" | "moderator";
  readonly persona: string;
  readonly avatarUrl?: string;
  readonly voiceId?: string;
}

export type ActionType =
  | "speech"
  | "navigate"
  | "spotlight"
  | "laser"
  | "whiteboard_draw"
  | "whiteboard_text"
  | "whiteboard_clear"
  | "animation"
  | "pause"
  | "discussion_start"
  | "discussion_end";

export interface ClassroomAction {
  readonly id: string;
  readonly type: ActionType;
  readonly agentId: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly durationMs?: number;
}

export interface OutlineItem {
  readonly title: string;
  readonly description: string;
  readonly sceneType: Scene["type"];
  readonly keyPoints: readonly string[];
}

export interface GenerationProgress {
  readonly phase: "outline" | "scenes" | "tts" | "complete" | "error";
  readonly current: number;
  readonly total: number;
  readonly message: string;
}
