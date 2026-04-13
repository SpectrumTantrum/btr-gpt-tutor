import { create } from "zustand"
import type { Quiz, QuizAttempt } from "@/lib/core/types"

interface QuizState {
  readonly quizzes: readonly Quiz[]
  readonly activeQuizId: string | null
  readonly currentAttempt: QuizAttempt | null
  setQuizzes: (quizzes: readonly Quiz[]) => void
  addQuiz: (quiz: Quiz) => void
  setActiveQuiz: (id: string | null) => void
  setCurrentAttempt: (attempt: QuizAttempt | null) => void
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  activeQuizId: null,
  currentAttempt: null,
  setQuizzes: (quizzes) => set({ quizzes: [...quizzes] }),
  addQuiz: (quiz) =>
    set((state) => ({ quizzes: [...state.quizzes, quiz] })),
  setActiveQuiz: (id) => set({ activeQuizId: id }),
  setCurrentAttempt: (attempt) =>
    set({ currentAttempt: attempt !== null ? { ...attempt } : null }),
}))
