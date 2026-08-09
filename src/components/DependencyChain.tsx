import { Brain, Lightbulb, Hammer, ArrowRightCircle } from 'lucide-react'
import type { DependencyChain as Chain } from '../types/lessonContent'

export function DependencyChainStrip({ chain }: { chain: Chain }) {
  const items = [
    { icon: Brain, label: 'What you learned', text: chain.learned },
    { icon: Lightbulb, label: 'Why it matters', text: chain.why },
    { icon: Hammer, label: 'What you can build', text: chain.build },
    { icon: ArrowRightCircle, label: 'What\'s next', text: chain.next },
  ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
      {items.map(({ icon: Icon, label, text }, i) => (
        <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 px-3.5 py-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-violet-500 mb-1">
            <Icon size={12} /> {label}
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-snug">{text}</div>
        </div>
      ))}
    </div>
  )
}
