// Curated, explicitly-imported icon set for level badges. Using named imports
// (instead of `import * as Icons from 'lucide-react'`) lets the bundler tree-shake
// away the hundreds of unused icons in the library, which otherwise bloats the
// main chunk substantially.
import { Sprout, GitBranch, Cpu, AppWindow, Layers, ShieldCheck, Rocket, Sparkles } from 'lucide-react'
import type { LucideProps } from 'lucide-react'

const MAP: Record<string, React.ComponentType<LucideProps>> = {
  Sprout,
  GitBranch,
  Cpu,
  AppWindow,
  Layers,
  ShieldCheck,
  Rocket,
  Sparkles,
}

export function LevelIconByName({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = MAP[name] ?? Sparkles
  return <Cmp size={size} />
}
