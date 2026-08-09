import { useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Clock, Construction } from 'lucide-react'
import { getLessonRef } from '../data/curriculum'
import { getLessonContent } from '../content/registry'
import { DifficultyBadge, KindBadge } from '../components/interactive/DifficultyBadge'
import { DependencyChainStrip } from '../components/DependencyChain'
import { LessonRenderer } from '../components/LessonRenderer'
import { PrevNextNav } from '../components/PrevNextNav'
import { useProgressStore } from '../state/progressStore'
import { getLevelTheme } from '../lib/theme'
import { LEVEL_MAP } from '../data/curriculum'

function StubLesson({ topics }: { topics: string[] }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 p-8 text-center">
      <Construction className="mx-auto mb-3 text-neutral-400" size={28} />
      <div className="text-lg font-semibold text-neutral-700 dark:text-neutral-200 mb-1">Coming soon</div>
      <p className="text-sm text-neutral-500 max-w-md mx-auto mb-4">
        This lesson's full interactive content (animation, playground, exercises, and quiz) hasn't been authored yet in this
        build. Here's what it will cover:
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
        {topics.map((t, i) => (
          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LessonPage() {
  const { lessonId } = useParams()
  const ref = lessonId ? getLessonRef(lessonId) : undefined
  const setLastVisited = useProgressStore((s) => s.setLastVisited)

  useEffect(() => {
    if (ref) setLastVisited(ref.lesson.id)
  }, [ref, setLastVisited])

  if (!ref) return <Navigate to="/" replace />

  const level = LEVEL_MAP[ref.levelId]
  const theme = getLevelTheme(level?.color ?? 'violet')
  const content = getLessonContent(ref.lesson.id)

  return (
    <div>
      <div className="mb-6">
        <div className={`text-xs font-semibold uppercase tracking-wide mb-2 ${theme.text}`}>
          {ref.levelTitle} · {ref.chapterTitle}
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-3">{ref.lesson.title}</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mb-3">{ref.lesson.summary}</p>
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={ref.lesson.difficulty} />
          <KindBadge kind={ref.lesson.kind} />
          <span className="inline-flex items-center gap-1 text-xs text-neutral-400">
            <Clock size={12} /> ~{ref.lesson.estMinutes} min
          </span>
        </div>
      </div>

      {ref.lesson.why && ref.lesson.unlocks && (
        <DependencyChainStrip
          chain={{
            learned: ref.lesson.summary,
            why: ref.lesson.why,
            build: ref.lesson.topics.slice(0, 3).join(', '),
            next: ref.lesson.unlocks,
          }}
        />
      )}

      {content ? <LessonRenderer content={content} /> : <StubLesson topics={ref.lesson.topics} />}

      <PrevNextNav current={ref} />
    </div>
  )
}
