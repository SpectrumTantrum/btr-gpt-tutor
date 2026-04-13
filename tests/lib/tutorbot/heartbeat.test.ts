import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { HeartbeatManager } from "@/lib/tutorbot/heartbeat"
import { loadSkills, registerSkill } from "@/lib/tutorbot/skill-loader"
import type { BotSkill, HeartbeatConfig } from "@/lib/core/types"

describe("HeartbeatManager", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts and reports isRunning true", () => {
    const config: HeartbeatConfig = { enabled: true, intervalMs: 5000, message: "ping" }
    const onTick = vi.fn().mockResolvedValue(undefined)
    const manager = new HeartbeatManager(config, onTick)

    manager.start()

    expect(manager.isRunning()).toBe(true)
  })

  it("stops and reports isRunning false", () => {
    const config: HeartbeatConfig = { enabled: true, intervalMs: 5000, message: "ping" }
    const onTick = vi.fn().mockResolvedValue(undefined)
    const manager = new HeartbeatManager(config, onTick)

    manager.start()
    expect(manager.isRunning()).toBe(true)

    manager.stop()
    expect(manager.isRunning()).toBe(false)
  })
})

describe("loadSkills", () => {
  it("formats skills into a prompt-injectable string", () => {
    const skills: readonly BotSkill[] = [
      {
        id: "skill_1",
        name: "Math Tutor",
        description: "Helps with math problems",
        instructions: "Break down each problem step by step",
      },
      {
        id: "skill_2",
        name: "Writing Coach",
        description: "Improves writing quality",
        instructions: "Focus on clarity and structure",
      },
    ]

    const result = loadSkills(skills)

    expect(result).toContain("Skill: Math Tutor")
    expect(result).toContain("Description: Helps with math problems")
    expect(result).toContain("Instructions: Break down each problem step by step")
    expect(result).toContain("Skill: Writing Coach")
    expect(result).toContain("Description: Improves writing quality")
    expect(result).toContain("Instructions: Focus on clarity and structure")
  })
})

describe("registerSkill", () => {
  it("generates id and validates required fields", () => {
    const skill = {
      name: "Quiz Master",
      description: "Generates quizzes",
      instructions: "Create 5 questions per topic",
    }

    const registered = registerSkill("bot_abc", skill)

    expect(registered.id).toBeDefined()
    expect(registered.id.length).toBeGreaterThan(0)
    expect(registered.name).toBe("Quiz Master")
    expect(registered.description).toBe("Generates quizzes")
    expect(registered.instructions).toBe("Create 5 questions per topic")
  })
})
