import { Link } from 'react-router-dom'
import { Trophy, RotateCcw } from 'lucide-react'
import { LEVELS } from '../data/curriculum'
import { getLevelTheme } from '../lib/theme'
import { useProgressStore } from '../state/progressStore'
import { LevelIconByName as LevelIcon } from '../lib/levelIcons'

export default function Dashboard() {
  const pct = useProgressStore((s) => s.completionPercent())
  const completed = useProgressStore((s) => s.completedLessons)
  const resetAll = useProgressStore((s) => s.resetAll)
  const totalDone = Object.values(completed).filter(Boolean).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-2">Your Progress</h1>
        <p className="text-neutral-500 dark:text-neutral-400">Skill progression across the full Rust → Tauri curriculum.</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-8 bg-gradient-to-br from-violet-500/5 to-sky-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">
            <Trophy size={18} className="text-amber-500" /> Overall completion
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-white">{pct}%</div>
        </div>
        <div className="h-2.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-violet-500 to-sky-500 transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-xs text-neutral-400 mt-2">{totalDone} lessons marked complete</div>
      </div>

      <div className="space-y-3 mb-8">
        {LEVELS.map((level) => {
          const theme = getLevelTheme(level.color)
          const total = level.chapters.reduce((s, c) => s + c.lessons.length, 0)
          const done = level.chapters.reduce((s, c) => s + c.lessons.filter((l) => completed[l.id]).length, 0)
          const levelPct = total ? Math.round((done / total) * 100) : 0
          return (
            <Link
              key={level.id}
              to={`/${level.id}`}
              className="flex items-center gap-4 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-violet-400 transition-colors"
            >
              <span className={`w-9 h-9 rounded-lg ${theme.bgSoft} ${theme.text} flex items-center justify-center shrink-0`}>
                <LevelIcon name={level.icon} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-neutral-800 dark:text-neutral-100">{level.shortTitle}</div>
                <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden mt-1.5">
                  <div className={`h-full ${theme.bg}`} style={{ width: `${levelPct}%` }} />
                </div>
              </div>
              <div className="text-xs font-mono text-neutral-400 w-14 text-right shrink-0">
                {done}/{total}
              </div>
            </Link>
          )
        })}
      </div>

      <button
        onClick={() => {
          if (confirm('Reset all progress? This clears every completed lesson and quiz result.')) resetAll()
        }}
        className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-500"
      >
        <RotateCcw size={12} /> Reset all progress
      </button>
    </div>
  )
}
