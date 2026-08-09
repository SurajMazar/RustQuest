import { useState } from 'react'
import { Bug, Lightbulb, Wrench, CheckCircle2 } from 'lucide-react'
import type { DebugChallenge as DebugChallengeSpec } from '../../types/lessonContent'
import { CodePlayground } from './CodePlayground'

export function DebugChallenge({ challenge }: { challenge: DebugChallengeSpec }) {
  const [hintsShown, setHintsShown] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [ranFailed, setRanFailed] = useState<boolean | null>(null)

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500 mb-1">
          <Bug size={13} /> Broken Code
        </div>
        <p className="text-sm text-neutral-700 dark:text-neutral-200 whitespace-pre-line">{challenge.problem}</p>
      </div>

      <CodePlayground
        starterCode={challenge.brokenCode}
        onOutput={(r) => setRanFailed(!r.success)}
      />

      {ranFailed !== null && (
        <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${ranFailed ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'}`}>
          <CheckCircle2 size={16} />
          {ranFailed ? 'Yep — that\'s the compiler error we\'re here to fix. Read it closely, then check a hint if needed.' : 'It compiled! Did you already fix it, or does it still have the bug logically?'}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {hintsShown < challenge.hints.length && (
          <button
            onClick={() => setHintsShown((h) => h + 1)}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-amber-400/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
          >
            <Lightbulb size={14} /> {hintsShown === 0 ? 'Show a hint' : 'Show another hint'} ({hintsShown}/{challenge.hints.length})
          </button>
        )}
        <button
          onClick={() => setRevealed((r) => !r)}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-emerald-400/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <Wrench size={14} /> {revealed ? 'Hide Fix' : 'Reveal the Fix'}
        </button>
      </div>

      {hintsShown > 0 && (
        <div className="space-y-2">
          {challenge.hints.slice(0, hintsShown).map((hint, i) => (
            <div key={i} className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2.5 text-sm">
              <div className="font-semibold text-amber-600 dark:text-amber-400">{hint.title}</div>
              <div className="text-neutral-600 dark:text-neutral-300 mt-0.5">{hint.body}</div>
            </div>
          ))}
        </div>
      )}

      {revealed && (
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-500">Why it breaks</div>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">{challenge.bugExplanation}</p>
          <div className="text-xs font-semibold uppercase tracking-wide text-emerald-500 mt-3">Fixed Code</div>
          <pre className="rounded-xl bg-neutral-900 text-neutral-100 text-xs font-mono px-4 py-3 overflow-x-auto whitespace-pre">{challenge.fixedCode}</pre>
        </div>
      )}
    </div>
  )
}
