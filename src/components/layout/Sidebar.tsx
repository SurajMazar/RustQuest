import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, Circle, GraduationCap, LayoutDashboard, X, Sparkles } from 'lucide-react'
import { LEVELS } from '../../data/curriculum'
import { useProgressStore } from '../../state/progressStore'
import { getLevelTheme } from '../../lib/theme'
import { LevelIconByName as LevelIcon } from '../../lib/levelIcons'

export function Sidebar({ mobileOpen, onCloseMobile }: { mobileOpen: boolean; onCloseMobile: () => void }) {
  const location = useLocation()
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>(() => {
    const currentLevelId = location.pathname.split('/')[1]
    return currentLevelId ? { [currentLevelId]: true } : { 'rust-beginner': true }
  })
  const completed = useProgressStore((s) => s.completedLessons)
  const pct = useProgressStore((s) => s.completionPercent())

  const content = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 via-violet-500 to-sky-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-sm leading-tight">Rust <span className="text-violet-500">→</span> Tauri<br /><span className="text-xs font-normal text-neutral-400">Academy</span></span>
        </Link>
        <button onClick={onCloseMobile} className="md:hidden text-neutral-400">
          <X size={18} />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
        <Link to="/dashboard" className="flex items-center gap-2 text-xs font-medium text-neutral-500 hover:text-violet-500 mb-2">
          <LayoutDashboard size={13} /> Your Progress
        </Link>
        <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-orange-500 via-violet-500 to-sky-500" animate={{ width: `${pct}%` }} />
        </div>
        <div className="text-[11px] text-neutral-400 mt-1">{pct}% of the curriculum complete</div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {LEVELS.map((level) => {
          const theme = getLevelTheme(level.color)
          const isOpen = !!openLevels[level.id]
          const totalInLevel = level.chapters.reduce((s, c) => s + c.lessons.length, 0)
          const doneInLevel = level.chapters.reduce(
            (s, c) => s + c.lessons.filter((l) => completed[l.id]).length,
            0
          )
          return (
            <div key={level.id}>
              <button
                onClick={() => setOpenLevels((o) => ({ ...o, [level.id]: !o[level.id] }))}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-left"
              >
                <span className={`w-6 h-6 rounded-md ${theme.bgSoft} flex items-center justify-center ${theme.text}`}>
                  <LevelIcon name={level.icon} />
                </span>
                <span className="flex-1 text-sm font-medium text-neutral-700 dark:text-neutral-200">{level.shortTitle}</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {doneInLevel}/{totalInLevel}
                </span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4"
                  >
                    {level.chapters.map((chapter) => (
                      <div key={chapter.id} className="mb-1">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 px-2 pt-2 pb-1">
                          {chapter.title}
                        </div>
                        {chapter.lessons.map((lesson) => {
                          const path = `/${level.id}/${chapter.id}/${lesson.id}`
                          const isActive = location.pathname === path
                          const isDone = !!completed[lesson.id]
                          return (
                            <Link
                              key={lesson.id}
                              to={path}
                              onClick={onCloseMobile}
                              className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] leading-tight ${
                                isActive
                                  ? `${theme.bgSoft} ${theme.text} font-medium`
                                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                              ) : (
                                <Circle size={13} className="shrink-0 opacity-40" />
                              )}
                              <span className="flex-1">{lesson.title}</span>
                              {lesson.status === 'stub' && (
                                <span className="text-[9px] px-1 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-500">soon</span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
        <Link to="/" className="flex items-center gap-2 text-xs text-neutral-400 hover:text-violet-500">
          <GraduationCap size={14} /> Course overview
        </Link>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden md:flex md:w-72 md:flex-col border-r border-neutral-200 dark:border-neutral-800 h-screen sticky top-0 bg-white dark:bg-neutral-950">
        {content}
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween', duration: 0.2 }}
              className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-neutral-950 z-50 md:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
