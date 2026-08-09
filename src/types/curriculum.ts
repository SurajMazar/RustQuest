export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type LessonKind = 'concept' | 'project' | 'milestone' | 'overview' | 'challenge'

export type LessonStatus = 'full' | 'stub'

export interface LessonMeta {
  /** Globally unique slug, e.g. "rust-beg-variables" */
  id: string
  title: string
  kind: LessonKind
  difficulty: Difficulty
  /** One or two sentence summary shown in cards / stubs */
  summary: string
  /** Rough minutes to complete */
  estMinutes: number
  /** Whether this lesson has real authored content or is a placeholder */
  status: LessonStatus
  /** Bullet list of what this lesson covers (used in nav preview + stub page) */
  topics: string[]
  /** lessonIds this depends on conceptually */
  prerequisites?: string[]
  /** what this lesson unlocks / enables next, shown in the dependency chain strip */
  unlocks?: string
  /** why this concept matters, shown in the dependency chain strip */
  why?: string
}

export interface Chapter {
  id: string
  title: string
  description: string
  lessons: LessonMeta[]
}

export type LevelId =
  | 'rust-beginner'
  | 'rust-intermediate'
  | 'rust-advanced'
  | 'tauri-beginner'
  | 'tauri-intermediate'
  | 'tauri-advanced'
  | 'production'

export interface Level {
  id: LevelId
  order: number
  title: string
  shortTitle: string
  subtitle: string
  description: string
  color: string // tailwind color token base, e.g. "orange"
  icon: string // lucide icon name
  chapters: Chapter[]
}

export interface FlatLessonRef {
  lesson: LessonMeta
  levelId: LevelId
  levelTitle: string
  levelOrder: number
  chapterId: string
  chapterTitle: string
  index: number
  prev?: FlatLessonRef
  next?: FlatLessonRef
}
