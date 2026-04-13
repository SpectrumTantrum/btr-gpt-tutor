import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { TutorDatabase } from "@/lib/core/storage/db"
import { DexieClassroomRepository } from "@/lib/core/storage/classroom-repo"
import type { Classroom, Scene, AgentConfig } from "@/lib/core/types"

let dbCounter = 0

function makeClassroom(
  overrides: Partial<Omit<Classroom, "id">> = {}
): Omit<Classroom, "id"> & { id?: string } {
  return {
    title: "Intro to TypeScript",
    knowledgeBaseId: "kb_test_001",
    scenes: [],
    agents: [],
    status: "generating",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides,
  }
}

function makeScene(classroomId: string, order = 0): Scene {
  return {
    id: `scene_${order}`,
    classroomId,
    type: "slide",
    title: `Scene ${order}`,
    order,
    actions: [],
  }
}

function makeAgent(): AgentConfig {
  return {
    id: "agent_001",
    name: "Prof. Ada",
    role: "teacher",
    persona: "An enthusiastic TypeScript educator.",
  }
}

describe("DexieClassroomRepository", () => {
  let db: TutorDatabase
  let repo: DexieClassroomRepository

  beforeEach(() => {
    db = new TutorDatabase(`TutorDatabase-cls-${++dbCounter}`)
    repo = new DexieClassroomRepository(db)
  })

  it("creates and retrieves a classroom", async () => {
    // Arrange
    const data = makeClassroom({ title: "Advanced React Patterns" })

    // Act
    const created = await repo.createClassroom(data)
    const retrieved = await repo.getClassroom(created.id)

    // Assert
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(created.id)
    expect(retrieved!.id).toMatch(/^cls_/)
    expect(retrieved!.title).toBe("Advanced React Patterns")
    expect(retrieved!.knowledgeBaseId).toBe("kb_test_001")
    expect(retrieved!.status).toBe("generating")
    expect(retrieved!.scenes).toEqual([])
    expect(retrieved!.agents).toEqual([])
  })

  it("updates classroom status and scenes", async () => {
    // Arrange
    const classroom = await repo.createClassroom(makeClassroom())
    const newScenes: readonly Scene[] = [
      makeScene(classroom.id, 0),
      makeScene(classroom.id, 1),
    ]

    // Act
    const updated = await repo.updateClassroom(classroom.id, {
      status: "ready",
      scenes: newScenes,
      agents: [makeAgent()],
      updatedAt: Date.now(),
    })

    // Assert
    expect(updated.id).toBe(classroom.id)
    expect(updated.status).toBe("ready")
    expect(updated.scenes).toHaveLength(2)
    expect(updated.scenes[0].title).toBe("Scene 0")
    expect(updated.agents).toHaveLength(1)
    expect(updated.agents[0].name).toBe("Prof. Ada")
  })

  it("lists classrooms", async () => {
    // Arrange
    await repo.createClassroom(makeClassroom({ title: "Classroom A" }))
    await repo.createClassroom(makeClassroom({ title: "Classroom B" }))
    await repo.createClassroom(makeClassroom({ title: "Classroom C" }))

    // Act
    const classrooms = await repo.listClassrooms()

    // Assert
    expect(classrooms).toHaveLength(3)
    const titles = classrooms.map((c) => c.title)
    expect(titles).toContain("Classroom A")
    expect(titles).toContain("Classroom B")
    expect(titles).toContain("Classroom C")
  })

  it("deletes a classroom", async () => {
    // Arrange
    const classroom = await repo.createClassroom(makeClassroom())

    // Act
    await repo.deleteClassroom(classroom.id)
    const retrieved = await repo.getClassroom(classroom.id)

    // Assert
    expect(retrieved).toBeNull()
  })
})
