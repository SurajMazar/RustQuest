import { useCallback, useEffect, useRef, useState } from 'react'
import KokoroWorker from './kokoro.worker?worker'
import type { KokoroWorkerRequest } from './kokoro.worker'

// Kokoro-82M (https://huggingface.co/hexgrad/Kokoro-82M) narrating every
// diagram, in place of the OS's built-in SpeechSynthesis voices — same "free,
// no server, no API key" deal, but it actually sounds like a person. The
// model runs off-thread in kokoro.worker.ts; this hook owns the one shared
// worker + <audio> element playback and exposes a small speak/cancel/pause/
// resume surface that mirrors what the old browser-TTS hook offered, so
// AnimatedDiagram barely had to change.
export interface KokoroVoiceOption {
  id: string
  label: string
  accent: 'US' | 'UK'
  gender: 'F' | 'M'
}

// Kokoro ships 28 voices of wildly uneven quality (see the grade table in the
// kokoro-js README) — this is the curated subset worth surfacing in a UI
// picker, one solid pick per accent/gender combination.
export const KOKORO_VOICES: KokoroVoiceOption[] = [
  { id: 'af_heart', label: 'Heart', accent: 'US', gender: 'F' },
  { id: 'af_bella', label: 'Bella', accent: 'US', gender: 'F' },
  { id: 'af_nicole', label: 'Nicole', accent: 'US', gender: 'F' },
  { id: 'am_fenrir', label: 'Fenrir', accent: 'US', gender: 'M' },
  { id: 'am_michael', label: 'Michael', accent: 'US', gender: 'M' },
  { id: 'am_puck', label: 'Puck', accent: 'US', gender: 'M' },
  { id: 'bf_emma', label: 'Emma', accent: 'UK', gender: 'F' },
  { id: 'bm_george', label: 'George', accent: 'UK', gender: 'M' },
]

export const DEFAULT_KOKORO_VOICE = 'af_heart'

export type KokoroStatus = 'idle' | 'loading' | 'ready' | 'error'

interface KokoroWorkerResponse {
  type: 'progress' | 'ready' | 'result' | 'error'
  id?: number
  percent?: number
  wav?: ArrayBuffer
  message?: string
}

// Model state (and the worker itself) is module-level, not per-hook-instance
// — every diagram on every lesson shares one download and one warm model
// instead of re-fetching ~80MB each time a diagram mounts.
let worker: Worker | null = null
let loadStatus: KokoroStatus = 'idle'
let loadProgress = 0
let loadError: string | null = null
const statusListeners = new Set<() => void>()

function setLoadState(next: Partial<{ status: KokoroStatus; progress: number; error: string | null }>) {
  if (next.status !== undefined) loadStatus = next.status
  if (next.progress !== undefined) loadProgress = next.progress
  if (next.error !== undefined) loadError = next.error
  statusListeners.forEach((l) => l())
}

let nextRequestId = 1
const pendingRequests = new Map<number, { resolve: (wav: ArrayBuffer) => void; reject: (err: Error) => void }>()

function getWorker(): Worker | null {
  if (worker) return worker
  try {
    worker = new KokoroWorker()
  } catch {
    return null
  }
  worker.onmessage = (e: MessageEvent<KokoroWorkerResponse>) => {
    const msg = e.data
    if (msg.type === 'progress') {
      setLoadState({ status: 'loading', progress: msg.percent ?? 0 })
    } else if (msg.type === 'ready') {
      setLoadState({ status: 'ready', progress: 100 })
    } else if (msg.type === 'result' && msg.id != null && msg.wav) {
      pendingRequests.get(msg.id)?.resolve(msg.wav)
      pendingRequests.delete(msg.id)
    } else if (msg.type === 'error') {
      if (msg.id != null) {
        pendingRequests.get(msg.id)?.reject(new Error(msg.message ?? 'Kokoro generation failed'))
        pendingRequests.delete(msg.id)
      } else {
        setLoadState({ status: 'error', error: msg.message ?? 'Failed to load the narration voice model' })
      }
    }
  }
  worker.onerror = () => setLoadState({ status: 'error', error: 'Failed to load the narration voice model' })
  return worker
}

function preload() {
  const w = getWorker()
  if (!w || loadStatus !== 'idle') return
  setLoadState({ status: 'loading', progress: 0 })
  const req: KokoroWorkerRequest = { type: 'preload' }
  w.postMessage(req)
}

function generate(text: string, voice: string): Promise<ArrayBuffer> {
  const w = getWorker()
  if (!w) return Promise.reject(new Error('Web Workers are not supported here'))
  if (loadStatus === 'idle') setLoadState({ status: 'loading', progress: 0 })
  const id = nextRequestId++
  const req: KokoroWorkerRequest = { type: 'generate', id, text, voice }
  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject })
    w.postMessage(req)
  })
}

export function useKokoroNarration() {
  const supported = typeof Worker !== 'undefined'
  const [status, setStatus] = useState(loadStatus)
  const [progress, setProgress] = useState(loadProgress)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioCache = useRef<Map<string, string>>(new Map())
  const requestSeq = useRef(0)

  useEffect(() => {
    if (!supported) return
    const listener = () => {
      setStatus(loadStatus)
      setProgress(loadProgress)
    }
    statusListeners.add(listener)
    listener()
    return () => {
      statusListeners.delete(listener)
    }
  }, [supported])

  useEffect(() => {
    if (!supported) return
    audioRef.current = new Audio()
    const audio = audioRef.current
    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [supported])

  useEffect(() => {
    const cache = audioCache.current
    return () => {
      cache.forEach((url) => URL.revokeObjectURL(url))
      cache.clear()
    }
  }, [])

  const speak = useCallback(
    (text: string, opts?: { rate?: number; voiceId?: string | null; onEnd?: () => void }) => {
      if (!supported || !text.trim()) return
      const audio = audioRef.current
      if (!audio) return
      const voice = opts?.voiceId || DEFAULT_KOKORO_VOICE
      const mySeq = ++requestSeq.current
      audio.pause()
      audio.onended = null

      const play = (url: string) => {
        if (requestSeq.current !== mySeq) return
        audio.src = url
        audio.playbackRate = opts?.rate ?? 1
        audio.onended = () => opts?.onEnd?.()
        void audio.play().catch(() => {})
      }

      const cacheKey = `${voice}::${text}`
      const cached = audioCache.current.get(cacheKey)
      if (cached) {
        play(cached)
        return
      }

      generate(text, voice)
        .then((wav) => {
          if (requestSeq.current !== mySeq) return
          const url = URL.createObjectURL(new Blob([wav], { type: 'audio/wav' }))
          audioCache.current.set(cacheKey, url)
          play(url)
        })
        .catch(() => {
          // Narration is a nice-to-have layered on top of the diagram, never
          // something that should be allowed to break it.
        })
    },
    [supported]
  )

  const cancel = useCallback(() => {
    requestSeq.current++
    audioRef.current?.pause()
  }, [])

  const pause = useCallback(() => {
    audioRef.current?.pause()
  }, [])

  const resume = useCallback(() => {
    void audioRef.current?.play().catch(() => {})
  }, [])

  return {
    supported,
    status,
    progress,
    error: loadError,
    voices: KOKORO_VOICES,
    preload,
    speak,
    cancel,
    pause,
    resume,
  }
}
