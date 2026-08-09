// Per-level color theme tokens (Tailwind classes), centralized so every
// component that needs "this level's accent color" reads from one place.
export interface LevelTheme {
  text: string
  textDark: string
  bg: string
  bgSoft: string
  border: string
  ring: string
  gradient: string
  dot: string
}

const THEMES: Record<string, LevelTheme> = {
  orange: {
    text: 'text-orange-600 dark:text-orange-400',
    textDark: 'text-orange-700 dark:text-orange-300',
    bg: 'bg-orange-500',
    bgSoft: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    ring: 'ring-orange-500/40',
    gradient: 'from-orange-500 to-amber-400',
    dot: 'bg-orange-500',
  },
  amber: {
    text: 'text-amber-600 dark:text-amber-400',
    textDark: 'text-amber-700 dark:text-amber-300',
    bg: 'bg-amber-500',
    bgSoft: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    ring: 'ring-amber-500/40',
    gradient: 'from-amber-500 to-yellow-400',
    dot: 'bg-amber-500',
  },
  rose: {
    text: 'text-rose-600 dark:text-rose-400',
    textDark: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-500',
    bgSoft: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    ring: 'ring-rose-500/40',
    gradient: 'from-rose-500 to-pink-400',
    dot: 'bg-rose-500',
  },
  sky: {
    text: 'text-sky-600 dark:text-sky-400',
    textDark: 'text-sky-700 dark:text-sky-300',
    bg: 'bg-sky-500',
    bgSoft: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    ring: 'ring-sky-500/40',
    gradient: 'from-sky-500 to-cyan-400',
    dot: 'bg-sky-500',
  },
  teal: {
    text: 'text-teal-600 dark:text-teal-400',
    textDark: 'text-teal-700 dark:text-teal-300',
    bg: 'bg-teal-500',
    bgSoft: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    ring: 'ring-teal-500/40',
    gradient: 'from-teal-500 to-emerald-400',
    dot: 'bg-teal-500',
  },
  indigo: {
    text: 'text-indigo-600 dark:text-indigo-400',
    textDark: 'text-indigo-700 dark:text-indigo-300',
    bg: 'bg-indigo-500',
    bgSoft: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    ring: 'ring-indigo-500/40',
    gradient: 'from-indigo-500 to-violet-400',
    dot: 'bg-indigo-500',
  },
  emerald: {
    text: 'text-emerald-600 dark:text-emerald-400',
    textDark: 'text-emerald-700 dark:text-emerald-300',
    bg: 'bg-emerald-500',
    bgSoft: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    ring: 'ring-emerald-500/40',
    gradient: 'from-emerald-500 to-teal-400',
    dot: 'bg-emerald-500',
  },
  violet: {
    text: 'text-violet-600 dark:text-violet-400',
    textDark: 'text-violet-700 dark:text-violet-300',
    bg: 'bg-violet-500',
    bgSoft: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    ring: 'ring-violet-500/40',
    gradient: 'from-violet-500 to-purple-400',
    dot: 'bg-violet-500',
  },
}

export function getLevelTheme(color: string): LevelTheme {
  return THEMES[color] ?? THEMES.violet
}

export const DIFFICULTY_STYLES: Record<string, { label: string; classes: string }> = {
  beginner: { label: 'Beginner', classes: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  intermediate: { label: 'Intermediate', classes: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
  advanced: { label: 'Advanced', classes: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
}
