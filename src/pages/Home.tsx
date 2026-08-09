import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, PlayCircle } from 'lucide-react'
import { LEVELS, FLAT_LESSONS } from '../data/curriculum'
import { getLevelTheme } from '../lib/theme'
import { useProgressStore } from '../state/progressStore'
import { LevelIconByName as LevelIcon } from '../lib/levelIcons'

export default function Home() {
  const pct = useProgressStore((s) => s.completionPercent())
  const lastVisited = useProgressStore((s) => s.lastVisitedLessonId)
  const firstLesson = FLAT_LESSONS[0]
  const resumeLesson = lastVisited ? FLAT_LESSONS.find((f) => f.lesson.id === lastVisited) : undefined
  const ctaTarget = resumeLesson ?? firstLesson
  const ctaPath = `/${ctaTarget.levelId}/${ctaTarget.chapterId}/${ctaTarget.lesson.id}`

  return (
    <div>
      {/* Hero */}
      <section className="text-center py-8 md:py-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-violet-500/10 text-violet-500 mb-5"
        >
          <Sparkles size={12} /> Zero to production-ready, one animated concept at a time
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white leading-[1.05]"
        >
          Learn Rust <span className="bg-gradient-to-r from-orange-500 via-violet-500 to-sky-500 bg-clip-text text-transparent">→</span> Tauri
          <br />
          the interactive way
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mt-5 text-neutral-500 dark:text-neutral-400 text-lg"
        >
          "I know nothing about Rust" → "I can design, build, debug, optimize, test, and ship production Rust and Tauri apps."
          Animated memory diagrams, a real code playground, and hands-on projects — no walls of text.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex items-center justify-center gap-3">
          <Link
            to={ctaPath}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold shadow-lg shadow-violet-500/25"
          >
            <PlayCircle size={18} /> {resumeLesson ? 'Continue where you left off' : 'Start Learning — It\'s Free'}
          </Link>
        </motion.div>
        {pct > 0 && <div className="mt-4 text-xs text-neutral-400">You're {pct}% through the whole curriculum</div>}
      </section>

      {/* Progression roadmap */}
      <section className="mb-14">
        <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-neutral-400 mb-6">The Learning Path</h2>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {LEVELS.map((level, i) => {
            const theme = getLevelTheme(level.color)
            return (
              <div key={level.id} className="flex items-center gap-2">
                <Link
                  to={`/${level.id}`}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border ${theme.border} ${theme.bgSoft} ${theme.text} text-sm font-medium hover:scale-[1.03] transition-transform`}
                >
                  <LevelIcon name={level.icon} />
                  {level.shortTitle}
                </Link>
                {i < LEVELS.length - 1 && <ArrowRight size={14} className="text-neutral-300 dark:text-neutral-700" />}
              </div>
            )
          })}
        </div>
      </section>

      {/* Level cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {LEVELS.map((level) => {
          const theme = getLevelTheme(level.color)
          const totalLessons = level.chapters.reduce((s, c) => s + c.lessons.length, 0)
          return (
            <Link
              key={level.id}
              to={`/${level.id}`}
              className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 hover:border-violet-400 dark:hover:border-violet-500 transition-colors bg-white dark:bg-neutral-900/40"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-10 h-10 rounded-xl ${theme.bgSoft} ${theme.text} flex items-center justify-center`}>
                  <LevelIcon name={level.icon} />
                </span>
                <div>
                  <div className="text-xs font-mono text-neutral-400">Level {level.order}</div>
                  <div className="font-semibold text-neutral-900 dark:text-white group-hover:text-violet-500">{level.title}</div>
                </div>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{level.subtitle}</p>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>{level.chapters.length} chapters · {totalLessons} lessons</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
