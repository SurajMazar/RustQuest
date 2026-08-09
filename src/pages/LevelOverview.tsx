import { Link, Navigate, useParams } from 'react-router-dom'
import { CheckCircle2, Circle, Clock, ArrowRight } from 'lucide-react'
import { LEVEL_MAP } from '../data/curriculum'
import { getLevelTheme } from '../lib/theme'
import { DifficultyBadge } from '../components/interactive/DifficultyBadge'
import { useProgressStore } from '../state/progressStore'
import { LevelIconByName as LevelIcon } from '../lib/levelIcons'

export default function LevelOverview() {
  const { levelId } = useParams()
  const level = levelId ? LEVEL_MAP[levelId] : undefined
  const completed = useProgressStore((s) => s.completedLessons)

  if (!level) return <Navigate to="/" replace />
  const theme = getLevelTheme(level.color)
  const totalLessons = level.chapters.reduce((s, c) => s + c.lessons.length, 0)
  const doneLessons = level.chapters.reduce((s, c) => s + c.lessons.filter((l) => completed[l.id]).length, 0)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span className={`w-12 h-12 rounded-2xl ${theme.bgSoft} ${theme.text} flex items-center justify-center`}>
            <LevelIcon name={level.icon} />
          </span>
          <div>
            <div className="text-xs font-mono text-neutral-400">Level {level.order} of 7</div>
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white">{level.title}</h1>
          </div>
        </div>
        <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl">{level.description}</p>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 w-40 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
            <div className={`h-full ${theme.bg}`} style={{ width: `${totalLessons ? (doneLessons / totalLessons) * 100 : 0}%` }} />
          </div>
          <span className="text-xs text-neutral-400">
            {doneLessons}/{totalLessons} lessons complete
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {level.chapters.map((chapter) => (
          <div key={chapter.id}>
            <h2 className="text-lg font-semibold text-neutral-800 dark:text-neutral-100 mb-1">{chapter.title}</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{chapter.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {chapter.lessons.map((lesson) => {
                const isDone = !!completed[lesson.id]
                return (
                  <Link
                    key={lesson.id}
                    to={`/${level.id}/${chapter.id}/${lesson.id}`}
                    className="group rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-violet-400 transition-colors bg-white dark:bg-neutral-900/40"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="font-medium text-sm text-neutral-800 dark:text-neutral-100 group-hover:text-violet-500">
                        {lesson.title}
                      </div>
                      {isDone ? (
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <Circle size={16} className="text-neutral-300 dark:text-neutral-700 shrink-0 mt-0.5" />
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2.5 line-clamp-2">{lesson.summary}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <DifficultyBadge difficulty={lesson.difficulty} />
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-400">
                        <Clock size={10} /> {lesson.estMinutes}m
                      </span>
                      {lesson.status === 'stub' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                          coming soon
                        </span>
                      )}
                      <ArrowRight size={12} className="ml-auto text-neutral-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
