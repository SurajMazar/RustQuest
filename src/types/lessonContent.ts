// Schema-driven lesson content. Authoring a lesson means writing one of these
// objects (pure data) — the LessonRenderer turns it into the full interactive
// experience: explanation -> animation -> code -> exercise -> quiz.

export type Tone = 'stack' | 'heap' | 'default' | 'accent' | 'danger' | 'success' | 'muted' | 'warning'

export interface DiagramNode {
  id: string
  label: string
  sublabel?: string
  /** percentage position within the canvas, 0-100 */
  x: number
  y: number
  w?: number
  h?: number
  tone?: Tone
  shape?: 'box' | 'pill' | 'circle' | 'ghost'
  /** render with strikethrough / faded, e.g. a moved-out variable */
  invalid?: boolean
}

export interface DiagramEdge {
  id?: string
  from: string
  to: string
  label?: string
  tone?: Tone
  dashed?: boolean
  animated?: boolean
  curved?: boolean
}

export interface DiagramFrame {
  caption: string
  nodes: DiagramNode[]
  edges?: DiagramEdge[]
}

export interface AnimatedDiagramSpec {
  title: string
  description?: string
  frames: DiagramFrame[]
  height?: number
}

export interface QuizOption {
  id: string
  text: string
}

export interface QuizQuestion {
  id: string
  prompt: string
  code?: string
  options: QuizOption[]
  correctOptionIds: string[]
  multi?: boolean
  explanation: string
}

export interface TerminalLine {
  prompt?: string
  text: string
}

export interface ExerciseHint {
  title: string
  body: string
}

export interface Exercise {
  problem: string
  starterCode: string
  hints: ExerciseHint[]
  solutionCode: string
  solutionExplanation: string
  expectedOutputContains?: string[]
}

export interface DebugChallenge {
  problem: string
  brokenCode: string
  bugExplanation: string
  hints: ExerciseHint[]
  fixedCode: string
}

export type LessonSection =
  | { type: 'explain'; title: string; body: string[]; bullets?: string[]; callout?: { tone: Tone; text: string } }
  | { type: 'diagram'; title: string; description?: string; diagram: AnimatedDiagramSpec }
  | { type: 'code'; title: string; description?: string; code: string; language?: string; runnable?: boolean }
  | { type: 'terminal'; title: string; description?: string; lines: TerminalLine[] }
  | { type: 'exercise'; title: string; exercise: Exercise }
  | { type: 'debug'; title: string; challenge: DebugChallenge }
  | { type: 'quiz'; title: string; questions: QuizQuestion[] }
  | { type: 'compare'; title: string; columns: { heading: string; body: string[] }[] }
  | { type: 'project-steps'; title: string; goals: string[]; steps: { title: string; description: string; code?: string }[] }

export interface DependencyChain {
  learned: string
  why: string
  build: string
  next: string
}

export interface LessonContent {
  id: string
  heroSummary: string
  dependencyChain?: DependencyChain
  sections: LessonSection[]
}
