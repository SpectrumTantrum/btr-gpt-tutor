import type { Quiz, QuizAttempt, QuizAnswer } from "@/lib/core/types"
import type { QuizRepository } from "@/lib/core/storage/repository"

export class QuizService {
  constructor(private readonly repo: QuizRepository) {}

  async saveQuiz(data: Omit<Quiz, "id">): Promise<Quiz> {
    return this.repo.createQuiz(data)
  }

  async getQuiz(id: string): Promise<Quiz | null> {
    return this.repo.getQuiz(id)
  }

  async listQuizzes(knowledgeBaseId: string): Promise<Quiz[]> {
    return this.repo.listQuizzes(knowledgeBaseId)
  }

  async saveAttempt(
    quizId: string,
    answers: readonly QuizAnswer[],
  ): Promise<QuizAttempt> {
    const correctCount = answers.filter((a) => a.isCorrect).length
    const attemptData: Omit<QuizAttempt, "id"> = {
      quizId,
      answers,
      score: correctCount,
      totalQuestions: answers.length,
      completedAt: Date.now(),
    }
    return this.repo.saveAttempt(attemptData)
  }

  async getAttempts(quizId: string): Promise<QuizAttempt[]> {
    return this.repo.getAttempts(quizId)
  }
}
