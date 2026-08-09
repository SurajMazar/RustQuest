import type { FlatLessonRef, Level, LessonMeta } from '../../types/curriculum'
import { rustBeginner } from './rustBeginner'
import { rustIntermediate } from './rustIntermediate'
import { rustAdvanced } from './rustAdvanced'
import { tauriBeginner } from './tauriBeginner'
import { tauriIntermediate } from './tauriIntermediate'
import { tauriAdvanced } from './tauriAdvanced'
import { production } from './production'

export const LEVELS: Level[] = [
  rustBeginner,
  rustIntermediate,
  rustAdvanced,
  tauriBeginner,
  tauriIntermediate,
  tauriAdvanced,
  production,
].sort((a, b) => a.order - b.order)

export const LEVEL_MAP: Record<string, Level> = Object.fromEntries(LEVELS.map((l) => [l.id, l]))

// Flatten every lesson across every level/chapter, in curriculum order, and
// wire up prev/next links + lookup by id. Computed once at module load.
function buildFlatIndex(): { flat: FlatLessonRef[]; byId: Record<string, FlatLessonRef> } {
  const flat: FlatLessonRef[] = []
  let index = 0
  for (const level of LEVELS) {
    for (const chapter of level.chapters) {
      for (const lesson of chapter.lessons) {
        flat.push({
          lesson,
          levelId: level.id,
          levelTitle: level.title,
          levelOrder: level.order,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          index: index++,
        })
      }
    }
  }
  for (let i = 0; i < flat.length; i++) {
    if (i > 0) flat[i].prev = flat[i - 1]
    if (i < flat.length - 1) flat[i].next = flat[i + 1]
  }
  const byId: Record<string, FlatLessonRef> = {}
  for (const ref of flat) byId[ref.lesson.id] = ref
  return { flat, byId }
}

const { flat: FLAT_LESSONS, byId: LESSON_INDEX } = buildFlatIndex()

export { FLAT_LESSONS, LESSON_INDEX }

export function getLessonRef(lessonId: string): FlatLessonRef | undefined {
  return LESSON_INDEX[lessonId]
}

export function getAllLessons(): LessonMeta[] {
  return FLAT_LESSONS.map((f) => f.lesson)
}

export function totalLessonCount(): number {
  return FLAT_LESSONS.length
}

export function levelProgressTotals(levelId: string): number {
  const level = LEVEL_MAP[levelId]
  if (!level) return 0
  return level.chapters.reduce((sum, c) => sum + c.lessons.length, 0)
}
