import type { AgentConfig } from "@/lib/core/types"

export class ClassroomDirector {
  private readonly agents: readonly AgentConfig[]
  private currentIndex: number

  constructor(agents: readonly AgentConfig[]) {
    if (agents.length === 0) {
      throw new Error("ClassroomDirector requires at least one agent")
    }

    this.agents = agents

    const teacherIndex = agents.findIndex((a) => a.role === "teacher")
    this.currentIndex = teacherIndex >= 0 ? teacherIndex : 0
  }

  getCurrentSpeaker(): AgentConfig {
    return this.agents[this.currentIndex]
  }

  advanceTurn(): void {
    this.currentIndex = (this.currentIndex + 1) % this.agents.length
  }

  setSpeaker(id: string): void {
    const index = this.agents.findIndex((a) => a.id === id)
    if (index === -1) {
      throw new Error(`Agent with id "${id}" not found`)
    }
    this.currentIndex = index
  }

  getTeacher(): AgentConfig | null {
    return this.agents.find((a) => a.role === "teacher") ?? null
  }

  getAgents(): AgentConfig[] {
    return [...this.agents]
  }
}
