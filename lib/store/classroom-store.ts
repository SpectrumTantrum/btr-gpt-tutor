import { create } from "zustand"
import type { Classroom, Scene, AgentConfig, GenerationProgress } from "@/lib/core/types"
import type { PlaybackStatus } from "@/lib/classroom/playback/types"

// ============================================================
// Discussion message type
// ============================================================

export interface DiscussionMessage {
  readonly agentId: string
  readonly agentName: string
  readonly content: string
}

// ============================================================
// State interface
// ============================================================

interface ClassroomState {
  readonly classroom: Classroom | null
  readonly currentScene: Scene | null
  readonly playbackStatus: PlaybackStatus | null
  readonly generationProgress: GenerationProgress | null
  readonly agents: readonly AgentConfig[]
  readonly discussionMessages: readonly DiscussionMessage[]
  readonly isGenerating: boolean

  setClassroom: (classroom: Classroom | null) => void
  setCurrentScene: (scene: Scene | null) => void
  setPlaybackStatus: (status: PlaybackStatus | null) => void
  setGenerationProgress: (progress: GenerationProgress | null) => void
  setAgents: (agents: readonly AgentConfig[]) => void
  addDiscussionMessage: (message: DiscussionMessage) => void
  clearDiscussion: () => void
  setIsGenerating: (isGenerating: boolean) => void
}

// ============================================================
// Store
// ============================================================

export const useClassroomStore = create<ClassroomState>((set) => ({
  classroom: null,
  currentScene: null,
  playbackStatus: null,
  generationProgress: null,
  agents: [],
  discussionMessages: [],
  isGenerating: false,

  setClassroom: (classroom) => set({ classroom }),
  setCurrentScene: (scene) => set({ currentScene: scene }),
  setPlaybackStatus: (status) => set({ playbackStatus: status }),
  setGenerationProgress: (progress) => set({ generationProgress: progress }),
  setAgents: (agents) => set({ agents: [...agents] }),
  addDiscussionMessage: (message) =>
    set((state) => ({
      discussionMessages: [...state.discussionMessages, message],
    })),
  clearDiscussion: () => set({ discussionMessages: [] }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}))
