import { KokoroTTS } from 'kokoro-js'
import { env } from '@huggingface/transformers'

// Kokoro-82M running entirely in the browser via Transformers.js/onnxruntime-web
// — the actual model weights stream from the HF Hub CDN straight into the
// browser's Cache Storage (so every visitor pays the download exactly once,
// ever, no matter how many lessons or diagrams they watch afterwards) and all
// inference happens on-device. No server, no API key, no per-request cost.
// This lives in a Worker because a forward pass through the model — even a
// tiny 82M-parameter one — is squarely CPU work; running it on the main
// thread would freeze the diagram's animation and every other tab interaction
// for the duration of each sentence.
const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX'

// This app serves no COOP/COEP headers, so `crossOriginIsolated` is false and
// SharedArrayBuffer isn't available. onnxruntime-web's multi-threaded wasm
// path needs that; without it, it fails in ways that are annoying to debug.
// Pinning to a single thread sidesteps the whole class of failure.
if (env.backends.onnx.wasm) env.backends.onnx.wasm.numThreads = 1

type ProgressEvent = { status: string; file?: string; loaded?: number; total?: number }

// tsconfig only pulls in the "DOM" lib (not "webworker", which conflicts with
// it), so `self`'s declared type is `Window`. It's actually a
// DedicatedWorkerGlobalScope at runtime — close enough in shape that casting
// through `Worker` (the DOM lib's type for the *other* end of this channel)
// gives `postMessage` its correct transferable-array overload.
const ctx = self as unknown as Worker

let ttsPromise: Promise<KokoroTTS> | null = null

function loadModel(): Promise<KokoroTTS> {
  if (!ttsPromise) {
    const hasWebGPU = 'gpu' in self.navigator
    const device = hasWebGPU ? 'webgpu' : 'wasm'
    const fileProgress = new Map<string, { loaded: number; total: number }>()

    ttsPromise = KokoroTTS.from_pretrained(MODEL_ID, {
      dtype: device === 'webgpu' ? 'fp32' : 'q8',
      device,
      progress_callback: (progress: ProgressEvent) => {
        if (progress.status !== 'progress' && progress.status !== 'initiate' && progress.status !== 'done') return
        const file = progress.file ?? 'model'
        if (progress.status === 'done') {
          const existing = fileProgress.get(file)
          fileProgress.set(file, { loaded: existing?.total ?? 1, total: existing?.total ?? 1 })
        } else {
          fileProgress.set(file, { loaded: progress.loaded ?? 0, total: progress.total ?? 0 })
        }
        let loaded = 0
        let total = 0
        for (const f of fileProgress.values()) {
          loaded += f.loaded
          total += f.total
        }
        const percent = total > 0 ? Math.min(100, Math.round((loaded / total) * 100)) : 0
        ctx.postMessage({ type: 'progress', percent })
      },
    })
  }
  return ttsPromise
}

export interface KokoroWorkerRequest {
  type: 'preload' | 'generate'
  id?: number
  text?: string
  voice?: string
}

ctx.onmessage = async (e: MessageEvent<KokoroWorkerRequest>) => {
  const msg = e.data
  try {
    if (msg.type === 'preload') {
      await loadModel()
      ctx.postMessage({ type: 'ready' })
      return
    }
    if (msg.type === 'generate') {
      const tts = await loadModel()
      const audio = await tts.generate(msg.text ?? '', { voice: msg.voice as keyof KokoroTTS['voices'] })
      const wav = audio.toWav()
      ctx.postMessage({ type: 'result', id: msg.id, wav }, [wav])
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    ctx.postMessage({ type: 'error', id: msg.id, message })
  }
}
