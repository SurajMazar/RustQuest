import type { LessonContent, LessonSection } from '../types/lessonContent'
import { SlideDeck } from './SlideDeck'
import { AnimatedDiagram } from './diagrams/AnimatedDiagram'
import { CodePlayground } from './interactive/CodePlayground'
import { StaticCodeBlock } from './interactive/StaticCodeBlock'
import { TerminalSim } from './interactive/TerminalSim'
import { Quiz } from './interactive/Quiz'
import { ExercisePanel } from './interactive/ExercisePanel'
import { DebugChallenge } from './interactive/DebugChallenge'
import { CompareTable, ProjectSteps } from './interactive/Misc'
import { BookOpen, Sparkles, Code2, Terminal as TerminalIcon, Dumbbell, Bug, HelpCircle, Columns3, Hammer } from 'lucide-react'

const ICONS: Record<LessonSection['type'], typeof BookOpen> = {
  explain: BookOpen,
  diagram: Sparkles,
  code: Code2,
  terminal: TerminalIcon,
  exercise: Dumbbell,
  debug: Bug,
  quiz: HelpCircle,
  compare: Columns3,
  'project-steps': Hammer,
}

const TONE_CALLOUT: Record<string, string> = {
  accent: 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-300',
  danger: 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300',
  warning: 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-300',
  default: 'bg-neutral-500/10 border-neutral-500/30 text-neutral-700 dark:text-neutral-300',
}

function SectionBody({ section }: { section: LessonSection }) {
  switch (section.type) {
    case 'explain':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3">{section.title}</h3>
          <div className="space-y-3">
            {section.body.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                {p}
              </p>
            ))}
          </div>
          {section.bullets && (
            <ul className="mt-3 space-y-1.5">
              {section.bullets.map((b, i) => (
                <li key={i} className="text-[15px] text-neutral-600 dark:text-neutral-300 flex gap-2">
                  <span className="text-violet-400 mt-1">▸</span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          {section.callout && (
            <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${TONE_CALLOUT[section.callout.tone] ?? TONE_CALLOUT.default}`}>
              {section.callout.text}
            </div>
          )}
        </div>
      )
    case 'diagram':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-1">{section.title}</h3>
          {section.description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{section.description}</p>}
          <AnimatedDiagram spec={section.diagram} />
        </div>
      )
    case 'code':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-1">{section.title}</h3>
          {section.description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{section.description}</p>}
          {section.runnable === false ? (
            <StaticCodeBlock code={section.code} language={section.language ?? 'rust'} note={section.description ? undefined : "This snippet can't run on the in-browser Rust Playground — it depends on Tauri, an external crate, or is frontend JS/TS."} />
          ) : (
            <CodePlayground starterCode={section.code} />
          )}
        </div>
      )
    case 'terminal':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-1">{section.title}</h3>
          {section.description && <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-3">{section.description}</p>}
          <TerminalSim lines={section.lines} />
        </div>
      )
    case 'exercise':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3">{section.title}</h3>
          <ExercisePanel exercise={section.exercise} />
        </div>
      )
    case 'debug':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3">{section.title}</h3>
          <DebugChallenge challenge={section.challenge} />
        </div>
      )
    case 'quiz':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3">{section.title}</h3>
          <Quiz questions={section.questions} />
        </div>
      )
    case 'compare':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3">{section.title}</h3>
          <CompareTable columns={section.columns} />
        </div>
      )
    case 'project-steps':
      return (
        <div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50 mb-3">{section.title}</h3>
          <ProjectSteps goals={section.goals} steps={section.steps} />
        </div>
      )
  }
}

function sectionLabel(section: LessonSection): string {
  switch (section.type) {
    case 'explain':
      return 'Explain'
    case 'diagram':
      return 'Animate'
    case 'code':
      return 'Code'
    case 'terminal':
      return 'Terminal'
    case 'exercise':
      return 'Exercise'
    case 'debug':
      return 'Debug'
    case 'quiz':
      return 'Quiz'
    case 'compare':
      return 'Compare'
    case 'project-steps':
      return 'Build'
  }
}

export function LessonRenderer({ content }: { content: LessonContent }) {
  const labels = content.sections.map(sectionLabel)
  return (
    <SlideDeck slideLabels={labels}>{(i) => <SectionBody section={content.sections[i]} />}</SlideDeck>
  )
}

export { ICONS as SectionIcons }
