import type { AgentConfig } from "@/lib/core/types"

export interface DebateStatement {
  readonly agentId: string
  readonly content: string
}

export class RoundtableOrchestrator {
  private readonly moderator: AgentConfig
  private readonly debaters: readonly AgentConfig[]
  private readonly topic: string
  private readonly history: DebateStatement[]

  // debaterIndex === -1 means moderator is current speaker
  private debaterIndex: number
  private round: number

  constructor(agents: readonly AgentConfig[], topic: string) {
    if (agents.length === 0) {
      throw new Error("RoundtableOrchestrator requires at least one agent")
    }

    this.topic = topic
    this.history = []
    this.debaterIndex = -1
    this.round = 0

    const moderatorCandidate = agents.find((a) => a.role === "moderator")
    this.moderator = moderatorCandidate ?? agents[0]
    this.debaters = agents.filter((a) => a.id !== this.moderator.id)
  }

  getCurrentSpeaker(): AgentConfig {
    if (this.debaterIndex === -1) {
      return this.moderator
    }
    return this.debaters[this.debaterIndex]
  }

  advanceRound(): void {
    if (this.debaterIndex === -1) {
      // Moderator just spoke — move to first debater (if any)
      if (this.debaters.length > 0) {
        this.debaterIndex = 0
      }
      return
    }

    const next = this.debaterIndex + 1

    if (next >= this.debaters.length) {
      // Full cycle of debaters completed — return to moderator, increment round
      this.debaterIndex = -1
      this.round += 1
    } else {
      this.debaterIndex = next
    }
  }

  getRound(): number {
    return this.round
  }

  addStatement(agentId: string, content: string): void {
    this.history.push({ agentId, content })
  }

  getHistory(): readonly DebateStatement[] {
    return [...this.history]
  }
}

export function buildDebatePrompt(
  agent: AgentConfig,
  topic: string,
  priorStatements: readonly DebateStatement[]
): string {
  const statementsSection =
    priorStatements.length > 0
      ? "\n\nDebate so far:\n" +
        priorStatements.map((s) => `[${s.agentId}]: ${s.content}`).join("\n")
      : ""

  return (
    `You are ${agent.name}, participating in a structured roundtable debate.\n\n` +
    `Your persona: ${agent.persona}\n\n` +
    `Debate topic: ${topic}${statementsSection}\n\n` +
    `Respond in character as ${agent.name}. Make a clear, reasoned argument that reflects your persona. ` +
    `Engage directly with what has been said and advance the debate.`
  )
}
