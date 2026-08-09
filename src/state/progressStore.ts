import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { totalLessonCount } from '../data/curriculum'

interface QuizResult {
  correct: boolean
  attempts: number
}

interface ProgressState {
  completedLessons: Record<string, boolean>
  quizResults: Record<string, QuizResult>
  lastVisitedLessonId?: string
  markComplete: (lessonId: string) => void
  markIncomplete: (lessonId: string) => void
  toggleComplete: (lessonId: string) => void
  recordQuiz: (questionId: string, correct: boolean) => void
  setLastVisited: (lessonId: string) => void
  isComplete: (lessonId: string) => boolean
  completionPercent: () => number
  resetAll: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      completedLessons: {},
      quizResults: {},
      lastVisitedLessonId: undefined,
      markComplete: (lessonId) =>
        set((s) => ({ completedLessons: { ...s.completedLessons, [lessonId]: true } })),
      markIncomplete: (lessonId) =>
        set((s) => {
          const next = { ...s.completedLessons }
          delete next[lessonId]
          return { completedLessons: next }
        }),
      toggleComplete: (lessonId) => {
        const isDone = !!get().completedLessons[lessonId]
        if (isDone) get().markIncomplete(lessonId)
        else get().markComplete(lessonId)
      },
      recordQuiz: (questionId, correct) =>
        set((s) => {
          const prev = s.quizResults[questionId]
          return {
            quizResults: {
              ...s.quizResults,
              [questionId]: { correct, attempts: (prev?.attempts ?? 0) + 1 },
            },
          }
        }),
      setLastVisited: (lessonId) => set({ lastVisitedLessonId: lessonId }),
      isComplete: (lessonId) => !!get().completedLessons[lessonId],
      completionPercent: () => {
        const total = totalLessonCount()
        if (total === 0) return 0
        const done = Object.values(get().completedLessons).filter(Boolean).length
        return Math.round((done / total) * 100)
      },
      resetAll: () => set({ completedLessons: {}, quizResults: {}, lastVisitedLessonId: undefined }),
    }),
    { name: 'rust-tauri-academy-progress' }
  )
)
