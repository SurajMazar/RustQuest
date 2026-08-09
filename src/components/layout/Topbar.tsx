import { Menu, Moon, Sun, Keyboard } from 'lucide-react'
import { useState } from 'react'
import { useThemeStore, applyThemeClass } from '../../state/themeStore'

export function Topbar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const theme = useThemeStore((s) => s.theme)
  const toggle = useThemeStore((s) => s.toggle)
  const [showShortcuts, setShowShortcuts] = useState(false)

  const handleToggle = () => {
    toggle()
    applyThemeClass(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-8 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur">
      <button onClick={onOpenMobile} className="md:hidden text-neutral-500">
        <Menu size={20} />
      </button>
      <div className="flex-1" />
      <div className="relative">
        <button
          onClick={() => setShowShortcuts((s) => !s)}
          onBlur={() => setShowShortcuts(false)}
          className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          title="Keyboard shortcuts"
        >
          <Keyboard size={17} />
        </button>
        {showShortcuts && (
          <div className="absolute right-0 mt-1 w-56 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-lg p-3 text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5 z-40">
            <div className="font-semibold text-neutral-800 dark:text-neutral-100 mb-1">Keyboard shortcuts</div>
            <div className="flex justify-between"><span>Next slide</span><kbd className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">→</kbd></div>
            <div className="flex justify-between"><span>Previous slide</span><kbd className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 rounded">←</kbd></div>
          </div>
        )}
      </div>
      <button
        onClick={handleToggle}
        className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        title="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
      </button>
    </header>
  )
}
