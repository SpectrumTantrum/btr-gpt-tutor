import { nanoid } from "nanoid"
import type { Quiz, QuizAttempt } from "@/lib/core/types"
import type { QuizRepository } from "@/lib/core/storage/repository"
import type { TutorDatabase } from "@/lib/core/storage/db"

const QUIZ_ID_PREFIX = "quiz_"
const ATTEMPT_ID_PREFIX = "attempt_"

export class DexieQuizRepository implements QuizRepository {
  constructor(private readonly db: TutorDatabase) {}

  async createQuiz(data: Omit<Quiz, "id">): Promise<Quiz> {
    const quiz: Quiz = { ...data, id: `${QUIZ_ID_PREFIX}${nanoid()}` }
    await this.db.quizzes.add(quiz)
    return quiz
  }

  async getQuiz(id: string): Promise<Quiz | null> {
    const quiz = await this.db.quizzes.get(id)
    return quiz ?? null
  }

  async listQuizzes(knowledgeBaseId: string): Promise<Quiz[]> {
    const quizzes = await this.db.quizzes
      .where("knowledgeBaseId")
      .equals(knowledgeBaseId)
      .toArray()
    return [...quizzes].sort((a, b) => b.createdAt - a.createdAt)
  }

  async deleteQuiz(id: string): Promise<void> {
    await this.db.transaction(
      "rw",
      [this.db.quizzes, this.db.quizAttempts],
      async () => {
        await this.db.quizAttempts.where("quizId").equals(id).delete()
        await this.db.quizzes.delete(id)
      }
    )
  }

  async saveAttempt(data: Omit<QuizAttempt, "id">): Promise<QuizAttempt> {
    const attempt: QuizAttempt = { ...data, id: `${ATTEMPT_ID_PREFIX}${nanoid()}` }
    await this.db.quizAttempts.add(attempt)
    return attempt
  }

  async getAttempts(quizId: string): Promise<QuizAttempt[]> {
    const attempts = await this.db.quizAttempts
      .where("quizId")
      .equals(quizId)
      .toArray()
    return [...attempts].sort((a, b) => b.completedAt - a.completedAt)
  }
}
