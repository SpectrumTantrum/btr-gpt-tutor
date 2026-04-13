import "fake-indexeddb/auto"
import { describe, it, expect, beforeEach } from "vitest"
import { buildQuizGenerationPrompt, buildGradingPrompt } from "@/lib/quiz/prompts"
import { QuizService } from "@/lib/quiz/quiz-service"
import { DexieQuizRepository } from "@/lib/core/storage/quiz-repo"
import { TutorDatabase } from "@/lib/core/storage/db"
import type { QuestionType } from "@/lib/core/types"

let dbCounter = 0

// ============================================================
// buildQuizGenerationPrompt
// ============================================================

describe("buildQuizGenerationPrompt", () => {
  it("includes the provided context", () => {
    // Arrange
    const context = "Photosynthesis converts light energy into chemical energy."
    const types: QuestionType[] = ["single_choice"]

    // Act
    const prompt = buildQuizGenerationPrompt(context, 3, types)

    // Assert
    expect(prompt).toContain(context)
  })

  it("includes the requested question count", () => {
    // Arrange
    const types: QuestionType[] = ["short_answer"]

    // Act
    const prompt = buildQuizGenerationPrompt("Some context.", 7, types)

    // Assert
    expect(prompt).toContain("7")
  })

  it("includes all requested question types", () => {
    // Arrange
    const types: QuestionType[] = ["single_choice", "multiple_choice", "short_answer"]

    // Act
    const prompt = buildQuizGenerationPrompt("Some context.", 5, types)

    // Assert
    expect(prompt).toContain("single_choice")
    expect(prompt).toContain("multiple_choice")
    expect(prompt).toContain("short_answer")
  })
})

// ============================================================
// buildGradingPrompt
// ============================================================

describe("buildGradingPrompt", () => {
  it("includes the question text", () => {
    // Arrange
    const question = "What is the powerhouse of the cell?"
    const correct = "Mitochondria"
    const user = "Nucleus"

    // Act
    const prompt = buildGradingPrompt(question, correct, user)

    // Assert
    expect(prompt).toContain(question)
  })

  it("includes both the correct answer and the user answer", () => {
    // Arrange
    const question = "What is the powerhouse of the cell?"
    const correct = "Mitochondria"
    const user = "Nucleus"

    // Act
    const prompt = buildGradingPrompt(question, correct, user)

    // Assert
    expect(prompt).toContain(correct)
    expect(prompt).toContain(user)
  })
})

// ============================================================
// QuizService.saveQuiz
// ============================================================

describe("QuizService.saveQuiz", () => {
  let service: QuizService

  beforeEach(() => {
    const db = new TutorDatabase(`TutorDatabase-quiz-${++dbCounter}`)
    const repo = new DexieQuizRepository(db)
    service = new QuizService(repo)
  })

  it("saves a quiz and returns it with an id", async () => {
    // Arrange
    const quizData = {
      knowledgeBaseId: "kb_test",
      title: "Chapter 1 Quiz",
      questions: [
        {
          id: "q1",
          type: "single_choice" as QuestionType,
          question: "What is 2+2?",
          options: ["2", "3", "4", "5"],
          correctAnswer: "4",
          explanation: "Basic arithmetic.",
        },
      ],
      createdAt: Date.now(),
    }

    // Act
    const saved = await service.saveQuiz(quizData)

    // Assert
    expect(saved.id).toBeTruthy()
    expect(saved.id).toMatch(/^quiz_/)
    expect(saved.title).toBe(quizData.title)
    expect(saved.knowledgeBaseId).toBe(quizData.knowledgeBaseId)
    expect(saved.questions).toHaveLength(1)
  })

  it("retrieves a previously saved quiz by id", async () => {
    // Arrange
    const quizData = {
      knowledgeBaseId: "kb_test",
      title: "Retrieval Quiz",
      questions: [],
      createdAt: Date.now(),
    }
    const saved = await service.saveQuiz(quizData)

    // Act
    const retrieved = await service.getQuiz(saved.id)

    // Assert
    expect(retrieved).not.toBeNull()
    expect(retrieved!.id).toBe(saved.id)
    expect(retrieved!.title).toBe(quizData.title)
  })
})
