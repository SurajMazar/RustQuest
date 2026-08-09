import { useState } from 'react'
import { Target, ChevronDown, ChevronRight, Code2 } from 'lucide-react'

export function CompareTable({ columns }: { columns: { heading: string; body: string[] }[] }) {
  return (
    <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
      {columns.map((col, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
          <div className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800/60 text-sm font-semibold text-neutral-800 dark:text-neutral-100">
            {col.heading}
          </div>
          <div className="p-3 space-y-1.5">
            {col.body.map((line, j) => (
              <div key={j} className="text-sm text-neutral-600 dark:text-neutral-300 flex gap-2">
                <span className="text-violet-400 mt-0.5">•</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProjectSteps({
  goals,
  steps,
}: {
  goals: string[]
  steps: { title: string; description: string; code?: string }[]
}) {
  const [open, setOpen] = useState<number | null>(0)
  const [checked, setChecked] = useState<Record<number, boolean>>({})

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-500 mb-2">
          <Target size={13} /> What you'll build
        </div>
        <ul className="space-y-1">
          {goals.map((g, i) => (
            <li key={i} className="text-sm text-neutral-700 dark:text-neutral-200 flex gap-2">
              <span className="text-emerald-500">✓</span>
              {g}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-2">
        {steps.map((step, i) => {
          const isOpen = open === i
          return (
            <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900"
              >
                <input
                  type="checkbox"
                  checked={!!checked[i]}
                  onChange={(e) => {
                    e.stopPropagation()
                    setChecked((c) => ({ ...c, [i]: !c[i] }))
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="accent-violet-600"
                />
                <span className="text-xs font-mono text-neutral-400 w-5 shrink-0">{i + 1}.</span>
                <span className={`text-sm font-medium flex-1 ${checked[i] ? 'line-through text-neutral-400' : 'text-neutral-800 dark:text-neutral-100'}`}>
                  {step.title}
                </span>
                {isOpen ? <ChevronDown size={16} className="text-neutral-400" /> : <ChevronRight size={16} className="text-neutral-400" />}
              </button>
              {isOpen && (
                <div className="px-4 pb-3 pl-11 space-y-2">
                  <p className="text-sm text-neutral-600 dark:text-neutral-300">{step.description}</p>
                  {step.code && (
                    <pre className="rounded-lg bg-neutral-900 text-neutral-100 text-xs font-mono px-3 py-2.5 overflow-x-auto whitespace-pre flex gap-2">
                      <Code2 size={0} className="hidden" />
                      {step.code}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
