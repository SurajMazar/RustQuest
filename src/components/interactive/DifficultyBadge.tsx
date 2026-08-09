import { DIFFICULTY_STYLES } from '../../lib/theme'
import type { Difficulty } from '../../types/curriculum'

export function DifficultyBadge({ difficulty, className = '' }: { difficulty: Difficulty; className?: string }) {
  const style = DIFFICULTY_STYLES[difficulty]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.classes} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {style.label}
    </span>
  )
}

const KIND_LABELS: Record<string, string> = {
  concept: 'Concept',
  project: 'Project',
  milestone: 'Milestone',
  overview: 'Overview',
  challenge: 'Challenge',
}

export function KindBadge({ kind, className = '' }: { kind: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-neutral-300 dark:border-neutral-700 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 ${className}`}
    >
      {KIND_LABELS[kind] ?? kind}
    </span>
  )
}
