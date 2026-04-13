import { describe, it, expect, beforeEach } from "vitest"
import { ClassroomDirector } from "@/lib/classroom/orchestration/director"
import type { AgentConfig } from "@/lib/core/types"

const TEACHER: AgentConfig = {
  id: "teacher",
  name: "Professor",
  role: "teacher",
  persona: "A clear and patient educator who explains concepts step by step.",
}

const STUDENT_ALEX: AgentConfig = {
  id: "alex",
  name: "Alex",
  role: "student",
  persona: "A curious student who asks probing questions and loves to explore ideas.",
}

const STUDENT_JORDAN: AgentConfig = {
  id: "jordan",
  name: "Jordan",
  role: "student",
  persona: "A practical student who focuses on real-world applications and examples.",
}

const ALL_AGENTS = [TEACHER, STUDENT_ALEX, STUDENT_JORDAN]

describe("ClassroomDirector", () => {
  let director: ClassroomDirector

  beforeEach(() => {
    director = new ClassroomDirector(ALL_AGENTS)
  })

  it("assigns teacher as first speaker", () => {
    // Arrange & Act
    const current = director.getCurrentSpeaker()

    // Assert
    expect(current.role).toBe("teacher")
    expect(current.id).toBe("teacher")
  })

  it("rotates to next speaker via advanceTurn()", () => {
    // Arrange
    const first = director.getCurrentSpeaker()

    // Act
    director.advanceTurn()
    const second = director.getCurrentSpeaker()

    // Assert
    expect(second.id).not.toBe(first.id)
    expect(second.id).toBe("alex")
  })

  it("wraps around after all agents speak", () => {
    // Arrange — advance past all agents
    director.advanceTurn() // alex
    director.advanceTurn() // jordan
    director.advanceTurn() // wraps back to teacher

    // Act
    const current = director.getCurrentSpeaker()

    // Assert
    expect(current.id).toBe("teacher")
  })

  it("allows setting specific speaker via setSpeaker(id)", () => {
    // Arrange
    expect(director.getCurrentSpeaker().id).toBe("teacher")

    // Act
    director.setSpeaker("jordan")
    const current = director.getCurrentSpeaker()

    // Assert
    expect(current.id).toBe("jordan")
    expect(current.name).toBe("Jordan")
  })

  it("returns all agents via getAgents()", () => {
    // Arrange & Act
    const agents = director.getAgents()

    // Assert
    expect(agents).toHaveLength(3)
    const ids = agents.map((a) => a.id)
    expect(ids).toContain("teacher")
    expect(ids).toContain("alex")
    expect(ids).toContain("jordan")
  })

  it("identifies teacher via getTeacher()", () => {
    // Arrange & Act
    const teacher = director.getTeacher()

    // Assert
    expect(teacher).not.toBeNull()
    expect(teacher!.role).toBe("teacher")
    expect(teacher!.id).toBe("teacher")
  })
})
