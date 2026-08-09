import { Info } from 'lucide-react'

const LANG_FILENAMES: Record<string, string> = {
  rust: 'main.rs',
  toml: 'Cargo.toml',
  typescript: 'App.tsx',
  javascript: 'app.js',
  json: 'tauri.conf.json',
}

// A read-only, syntax-free but nicely formatted code block for snippets that
// can't run on the live Rust Playground (Tauri APIs, frontend TS/JS, config
// files). Deliberately lightweight — no Monaco — since these are for reading,
// not editing.
export function StaticCodeBlock({ code, language = 'rust', note }: { code: string; language?: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-neutral-800 overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-mono">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2">{LANG_FILENAMES[language] ?? language}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-neutral-500">read-only</span>
      </div>
      <pre className="px-4 py-3.5 text-[13px] leading-relaxed font-mono text-neutral-200 overflow-x-auto whitespace-pre">{code}</pre>
      {note && (
        <div className="flex items-start gap-2 px-4 py-2.5 border-t border-neutral-800 bg-amber-500/5 text-xs text-amber-300">
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>{note}</span>
        </div>
      )}
    </div>
  )
}
