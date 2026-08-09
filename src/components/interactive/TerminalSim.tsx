import { useEffect, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react'
import type { TerminalLine } from '../../types/lessonContent'

export function TerminalSim({ lines, title = 'terminal' }: { lines: TerminalLine[]; title?: string }) {
  const [run, setRun] = useState(0)
  const [visibleChars, setVisibleChars] = useState(0)
  const fullText = lines.map((l) => (l.prompt ?? '$') + ' ' + l.text).join('\n')

  useEffect(() => {
    setVisibleChars(0)
    const total = fullText.length
    let i = 0
    const id = setInterval(() => {
      i += Math.max(1, Math.round(total / 60))
      setVisibleChars(Math.min(i, total))
      if (i >= total) clearInterval(id)
    }, 18)
    return () => clearInterval(id)
  }, [run, fullText.length])

  const shown = fullText.slice(0, visibleChars)
  const done = visibleChars >= fullText.length

  return (
    <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-[#0b0d0f]">
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2">{title}</span>
        </div>
        <button onClick={() => setRun((r) => r + 1)} className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-neutral-400 hover:bg-neutral-800">
          {done ? <RotateCcw size={12} /> : <Play size={12} />}
          {done ? 'Replay' : 'Playing…'}
        </button>
      </div>
      <pre className="px-4 py-3 text-[13px] font-mono text-emerald-300 whitespace-pre-wrap min-h-[3rem]">
        {shown}
        {!done && <span className="inline-block w-2 h-4 bg-emerald-300 align-middle animate-pulse ml-0.5" />}
      </pre>
    </div>
  )
}
