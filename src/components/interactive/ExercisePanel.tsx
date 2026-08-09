import { useState } from 'react'
import { Lightbulb, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import type { Exercise } from '../../types/lessonContent'
import { CodePlayground } from './CodePlayground'

export function ExercisePanel({ exercise }: { exercise: Exercise }) {
  const [hintsShown, setHintsShown] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const [ranOk, setRanOk] = useState<boolean | null>(null)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-violet-500/5 border border-violet-500/20 px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-violet-500 mb-1">Problem</div>
        <p className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line">{exercise.problem}</p>
      </div>

      <CodePlayground
        starterCode={exercise.starterCode}
        onOutput={(r) => {
          if (r.errored) return
          const ok = r.success && (!exercise.expectedOutputContains || exercise.expectedOutputContains.every((s) => r.stdout.includes(s)))
          setRanOk(ok)
        }}
      />

      {ranOk !== null && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${ranOk ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
          <CheckCircle2 size={16} />
          {ranOk ? 'Looks right! Output matches what we expected.' : 'It ran, but the output doesn\'t look right yet — check a hint below.'}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {hintsShown < exercise.hints.length && (
          <button
            onClick={() => setHintsShown((h) => h + 1)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <Lightbulb size={14} /> {hintsShown === 0 ? 'Show a hint' : 'Show another hint'} ({hintsShown}/{exercise.hints.length})
          </button>
        )}
        <button
          onClick={() => setShowSolution((s) => !s)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {showSolution ? <EyeOff size={14} /> : <Eye size={14} />}
          {showSolution ? 'Hide Solution' : 'Show Solution'}
        </button>
      </div>

      {hintsShown > 0 && (
        <div className="space-y-2">
          {exercise.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5 text-sm">
              <div className="font-semibold text-amber-600 dark:text-amber-400">{hint.title}</div>
              <div className="text-neutral-600 dark:text-neutral-300 mt-0.5">{hint.body}</div>
            </div>
          ))}
        </div>
      )}

      {showSolution && (
        <div className="space-y-2">
          <pre className="rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono px-4 py-3 overflow-x-auto whitespace-pre">{exercise.solutionCode}</pre>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{exercise.solutionExplanation}</p>
        </div>
      )}
    </div>
  )
}
