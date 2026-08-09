import { lazy, Suspense, useRef, useState } from 'react'
import { Play, Loader2, RotateCcw, TerminalSquare } from 'lucide-react'
import { useThemeStore } from '../../state/themeStore'

const Editor = lazy(() => import('../../lib/monacoEditorLazy'))

interface RunResult {
  success: boolean
  stdout: string
  stderr: string
  errored?: boolean
  errorMessage?: string
}

async function runOnRustPlayground(code: string): Promise<RunResult> {
  try {
    const res = await fetch('https://play.rust-lang.org/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        channel: 'stable',
        mode: 'debug',
        edition: '2021',
        crateType: 'bin',
        tests: false,
        backtrace: false,
        code,
      }),
    })
    if (!res.ok) {
      return { success: false, stdout: '', stderr: '', errored: true, errorMessage: `Playground responded with HTTP ${res.status}.` }
    }
    const data = await res.json()
    return { success: data.success, stdout: data.stdout ?? '', stderr: data.stderr ?? '' }
  } catch (e) {
    return {
      success: false,
      stdout: '',
      stderr: '',
      errored: true,
      errorMessage:
        'Could not reach the Rust Playground (play.rust-lang.org) — this usually means no internet access, or the request was blocked by the browser. Re-check your connection and try Run again.',
    }
  }
}

export function CodePlayground({
  starterCode,
  height = 260,
  onOutput,
}: {
  starterCode: string
  height?: number
  onOutput?: (result: RunResult) => void
}) {
  const [code, setCode] = useState(starterCode)
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<RunResult | null>(null)
  const theme = useThemeStore((s) => s.theme)
  const originalRef = useRef(starterCode)

  const run = async () => {
    setRunning(true)
    setResult(null)
    const r = await runOnRustPlayground(code)
    setResult(r)
    setRunning(false)
    onOutput?.(r)
  }

  const reset = () => {
    setCode(originalRef.current)
    setResult(null)
  }

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between px-3 py-2 bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2">main.rs</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reset}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            <RotateCcw size={12} /> Reset
          </button>
          <button
            onClick={run}
            disabled={running}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60"
          >
            {running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            {running ? 'Compiling…' : 'Run'}
          </button>
        </div>
      </div>

      <Suspense
        fallback={
          <div style={{ height }} className="flex items-center justify-center text-neutral-500 text-xs gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading editor…
          </div>
        }
      >
        <Editor
          height={height}
          defaultLanguage="rust"
          value={code}
          onChange={(v) => setCode(v ?? '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            padding: { top: 12 },
            lineNumbersMinChars: 3,
          }}
        />
      </Suspense>

      {(result || running) && (
        <div className="border-t border-neutral-800 bg-black/90 px-3 py-2.5 font-mono text-xs">
          <div className="flex items-center gap-1.5 text-neutral-400 mb-1.5">
            <TerminalSquare size={12} />
            <span>output</span>
          </div>
          {running && <div className="text-neutral-400">Compiling and running on the Rust Playground…</div>}
          {result?.errored && <div className="text-amber-400 whitespace-pre-wrap">{result.errorMessage}</div>}
          {result && !result.errored && (
            <>
              {result.stdout && <pre className="text-neutral-200 whitespace-pre-wrap">{result.stdout}</pre>}
              {result.stderr && (
                <pre className={`whitespace-pre-wrap ${result.success ? 'text-amber-400' : 'text-rose-400'}`}>{result.stderr}</pre>
              )}
              {!result.stdout && !result.stderr && <div className="text-neutral-500">(no output)</div>}
            </>
          )}
        </div>
      )}
    </div>
  )
}
