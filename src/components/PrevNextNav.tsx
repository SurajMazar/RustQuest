import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import type { FlatLessonRef } from '../types/curriculum'
import { useProgressStore } from '../state/progressStore'

function lessonPath(ref: FlatLessonRef) {
  return `/${ref.levelId}/${ref.chapterId}/${ref.lesson.id}`
}

export function PrevNextNav({ current }: { current: FlatLessonRef }) {
  const isComplete = useProgressStore((s) => s.isComplete(current.lesson.id))
  const toggleComplete = useProgressStore((s) => s.toggleComplete)

  return (
    <div className="mt-10 space-y-4">
      <button
        onClick={() => toggleComplete(current.lesson.id)}
        className={`w-full flex items-center justify-center gap-2 rounded-xl border-2 py-3 text-sm font-semibold transition-colors ${
          isComplete
            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'border-neutral-300 dark:border-neutral-700 text-neutral-500 hover:border-violet-400 hover:text-violet-500'
        }`}
      >
        {isComplete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
        {isComplete ? 'Marked complete' : 'Mark this lesson complete'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        {current.prev ? (
          <Link
            to={lessonPath(current.prev)}
            className="group rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-violet-400 transition-colors"
          >
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
              <ArrowLeft size={13} /> Previous
            </div>
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-violet-500">
              {current.prev.lesson.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
        {current.next ? (
          <Link
            to={lessonPath(current.next)}
            className="group rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 text-right hover:border-violet-400 transition-colors"
          >
            <div className="flex items-center justify-end gap-1.5 text-xs text-neutral-400 mb-1">
              Next <ArrowRight size={13} />
            </div>
            <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 group-hover:text-violet-500">
              {current.next.lesson.title}
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
