import { describe, it, expect, beforeEach } from "vitest"
import {
  RoundtableOrchestrator,
  buildDebatePrompt,
} from "@/lib/classroom/orchestration/roundtable"
import type { AgentConfig } from "@/lib/core/types"

const MODERATOR: AgentConfig = {
  id: "moderator-1",
  name: "Dr. Chen",
  role: "moderator",
  persona: "A neutral and sharp moderator who keeps debates on track.",
}

const DEBATER_ALICE: AgentConfig = {
  id: "alice",
  name: "Alice",
  role: "teacher",
  persona: "A passionate advocate for evidence-based reasoning.",
}

const DEBATER_BOB: AgentConfig = {
  id: "bob",
  name: "Bob",
  role: "student",
  persona: "A skeptic who challenges assumptions and pushes for clarity.",
}

const ALL_AGENTS = [MODERATOR, DEBATER_ALICE, DEBATER_BOB]
const TOPIC = "Should AI replace human teachers?"

describe("RoundtableOrchestrator", () => {
  let orchestrator: RoundtableOrchestrator

  beforeEach(() => {
    orchestrator = new RoundtableOrchestrator(ALL_AGENTS, TOPIC)
  })

  it("starts with moderator as current speaker", () => {
    // Arrange & Act
    const current = orchestrator.getCurrentSpeaker()

    // Assert
    expect(current.role).toBe("moderator")
    expect(current.id).toBe("moderator-1")
  })

  it("rotates through debaters after moderator via advanceRound()", () => {
    // Arrange — moderator is first
    expect(orchestrator.getCurrentSpeaker().id).toBe("moderator-1")

    // Act — advance to first debater
    orchestrator.advanceRound()
    const firstDebater = orchestrator.getCurrentSpeaker()

    // Assert — must be a non-moderator
    expect(firstDebater.role).not.toBe("moderator")
    expect(firstDebater.id).toBe("alice")

    // Act — advance to second debater
    orchestrator.advanceRound()
    const secondDebater = orchestrator.getCurrentSpeaker()

    // Assert
    expect(secondDebater.id).toBe("bob")
  })

  it("returns to moderator after full round and increments getRound()", () => {
    // Arrange — initial state
    expect(orchestrator.getRound()).toBe(0)

    // Act — cycle through all debaters
    orchestrator.advanceRound() // alice
    orchestrator.advanceRound() // bob
    orchestrator.advanceRound() // back to moderator → completes round 1

    // Assert — round incremented and speaker is back to moderator
    expect(orchestrator.getRound()).toBe(1)
    expect(orchestrator.getCurrentSpeaker().id).toBe("moderator-1")
  })

  it("tracks debate history via addStatement() and getHistory()", () => {
    // Arrange
    expect(orchestrator.getHistory()).toHaveLength(0)

    // Act
    orchestrator.addStatement("moderator-1", "Welcome to the debate.")
    orchestrator.addStatement("alice", "AI cannot replace human empathy.")
    orchestrator.addStatement("bob", "But AI can scale education infinitely.")

    const history = orchestrator.getHistory()

    // Assert
    expect(history).toHaveLength(3)
    expect(history[0]).toEqual({ agentId: "moderator-1", content: "Welcome to the debate." })
    expect(history[1]).toEqual({ agentId: "alice", content: "AI cannot replace human empathy." })
    expect(history[2]).toEqual({ agentId: "bob", content: "But AI can scale education infinitely." })
  })
})

describe("buildDebatePrompt", () => {
  it("includes agent persona, topic, and prior statements", () => {
    // Arrange
    const priorStatements = [
      { agentId: "moderator-1", content: "The debate begins now." },
      { agentId: "alice", content: "AI lacks emotional intelligence." },
    ]

    // Act
    const prompt = buildDebatePrompt(DEBATER_BOB, TOPIC, priorStatements)

    // Assert — contains the agent's persona
    expect(prompt).toContain(DEBATER_BOB.persona)
    // Assert — contains the debate topic
    expect(prompt).toContain(TOPIC)
    // Assert — contains prior statement content
    expect(prompt).toContain("The debate begins now.")
    expect(prompt).toContain("AI lacks emotional intelligence.")
  })
})
