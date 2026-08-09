import { useState } from 'react'
import { CheckCircle2, XCircle, ArrowRight, Trophy } from 'lucide-react'
import type { QuizQuestion } from '../../types/lessonContent'
import { useProgressStore } from '../../state/progressStore'

function OneQuestion({ q, onAnswered }: { q: QuizQuestion; onAnswered: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const recordQuiz = useProgressStore((s) => s.recordQuiz)

  const isCorrect =
    submitted &&
    selected.length === q.correctOptionIds.length &&
    selected.every((s) => q.correctOptionIds.includes(s))

  const toggle = (id: string) => {
    if (submitted) return
    if (q.multi) {
      setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    } else {
      setSelected([id])
    }
  }

  const submit = () => {
    if (selected.length === 0) return
    setSubmitted(true)
    const correct = selected.length === q.correctOptionIds.length && selected.every((s) => q.correctOptionIds.includes(s))
    recordQuiz(q.id, correct)
    onAnswered(correct)
  }

  return (
    <div>
      <div className="text-sm font-medium text-neutral-800 dark:text-neutral-100 mb-3">{q.prompt}</div>
      {q.code && (
        <pre className="mb-3 rounded-lg bg-neutral-900 text-neutral-100 text-xs font-mono px-3 py-2.5 overflow-x-auto">{q.code}</pre>
      )}
      <div className="space-y-2 mb-3">
        {q.options.map((opt) => {
          const isSelected = selected.includes(opt.id)
          const isRight = q.correctOptionIds.includes(opt.id)
          let stateClasses = 'border-neutral-200 dark:border-neutral-700 hover:border-violet-400'
          if (submitted) {
            if (isRight) stateClasses = 'border-emerald-500 bg-emerald-500/10'
            else if (isSelected && !isRight) stateClasses = 'border-rose-500 bg-rose-500/10'
            else stateClasses = 'border-neutral-200 dark:border-neutral-700 opacity-60'
          } else if (isSelected) {
            stateClasses = 'border-violet-500 bg-violet-500/10'
          }
          return (
            <button
              key={opt.id}
              onClick={() => toggle(opt.id)}
              disabled={submitted}
              className={`w-full text-left px-3 py-2.5 rounded-xl border-2 text-sm flex items-center justify-between gap-2 transition-colors ${stateClasses}`}
            >
              <span className="font-mono">{opt.text}</span>
              {submitted && isRight && <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />}
              {submitted && isSelected && !isRight && <XCircle size={16} className="text-rose-500 shrink-0" />}
            </button>
          )
        })}
      </div>

      {!submitted ? (
        <button
          onClick={submit}
          disabled={selected.length === 0}
          className="text-sm font-semibold px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40"
        >
          Check Answer
        </button>
      ) : (
        <div className={`rounded-xl px-3 py-2.5 text-sm ${isCorrect ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'}`}>
          <div className="font-semibold mb-1">{isCorrect ? 'Correct!' : 'Not quite.'}</div>
          <div className="text-neutral-600 dark:text-neutral-300">{q.explanation}</div>
        </div>
      )}
    </div>
  )
}

export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [answeredCurrent, setAnsweredCurrent] = useState(false)

  const finished = index >= questions.length

  if (finished) {
    return (
      <div className="text-center py-8">
        <Trophy className="mx-auto mb-3 text-amber-500" size={32} />
        <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-100">
          {score} / {questions.length} correct
        </div>
        <p className="text-sm text-neutral-500 mt-1">
          {score === questions.length ? 'Perfect score — you\'ve got this concept locked in.' : 'Nice work — re-read the explanations above if anything is still fuzzy.'}
        </p>
      </div>
    )
  }

  const q = questions[index]

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-4">
        {questions.map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full ${i < index ? 'bg-violet-500' : i === index ? 'bg-violet-300' : 'bg-neutral-200 dark:bg-neutral-800'}`} />
        ))}
      </div>
      <OneQuestion
        key={q.id}
        q={q}
        onAnswered={(correct) => {
          setAnsweredCurrent(true)
          if (correct) setScore((s) => s + 1)
        }}
      />
      {answeredCurrent && (
        <button
          onClick={() => {
            setIndex((i) => i + 1)
            setAnsweredCurrent(false)
          }}
          className="mt-4 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900"
        >
          {index === questions.length - 1 ? 'See Results' : 'Next Question'} <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}
