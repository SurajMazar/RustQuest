import { useEffect, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function SlideDeck({
  slideLabels,
  onIndexChange,
  children,
}: {
  slideLabels: string[]
  onIndexChange?: (i: number) => void
  children: (index: number) => ReactNode
}) {
  const [index, setIndex] = useState(0)
  const total = slideLabels.length

  useEffect(() => {
    onIndexChange?.(index)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(total - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [total])

  return (
    <div>
      {/* Dot / label progress bar */}
      <div className="flex items-center gap-1.5 mb-5 overflow-x-auto pb-1">
        {slideLabels.map((label, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`shrink-0 flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
              i === index
                ? 'bg-violet-600 border-violet-600 text-white'
                : i < index
                ? 'border-violet-300 text-violet-500 bg-violet-500/5'
                : 'border-neutral-200 dark:border-neutral-700 text-neutral-400'
            }`}
          >
            <span className="font-mono">{i + 1}</span>
            {label}
          </button>
        ))}
      </div>

      <div className="relative min-h-[200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children(index)}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-200 dark:border-neutral-800">
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-30"
        >
          <ChevronLeft size={16} /> Previous slide
        </button>
        <div className="text-xs font-mono text-neutral-400">
          {index + 1} / {total}
        </div>
        <button
          onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
          disabled={index === total - 1}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg text-violet-600 hover:bg-violet-500/10 disabled:opacity-30"
        >
          Next slide <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
