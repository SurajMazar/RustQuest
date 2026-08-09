import { useCallback, useEffect, useRef, useState } from 'react'

// Thin wrapper around the browser's built-in Web Speech API (SpeechSynthesis).
// This is the "free text-to-speech" backing every diagram's narration — no
// API key, no server round-trip, no bundled audio files. Voice quality and
// availability depend entirely on the visitor's OS/browser (great on Chrome
// and Safari/macOS, thinner on some Linux/mobile browsers). When the API
// isn't present at all (older browsers, some embedded webviews, and — worth
// knowing if you ever screenshot-test this in headless Chromium — sandboxes
// with no system TTS engine wired up) we report `supported: false` and every
// caller degrades to silently rendering the animation with no narration.
export function useSpeechNarration() {
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    // Most browsers fire this async on first load; Safari sometimes needs the
    // direct call above too, so we do both.
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [supported])

  useEffect(() => {
    if (!supported) return
    // Never let narration outlive the component that started it — a lesson
    // switch or unmount must not leave a stray voice talking over the next page.
    return () => window.speechSynthesis.cancel()
  }, [supported])

  const speak = useCallback(
    (text: string, opts?: { rate?: number; voiceName?: string | null; onEnd?: () => void }) => {
      if (!supported || !text.trim()) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = opts?.rate ?? 1
      const preferred = opts?.voiceName ? voices.find((v) => v.name === opts.voiceName) : undefined
      const fallback = voices.find((v) => v.lang.startsWith('en')) ?? voices[0]
      utterance.voice = preferred ?? fallback ?? null
      if (opts?.onEnd) utterance.onend = opts.onEnd
      currentUtterance.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [supported, voices]
  )

  const cancel = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.cancel()
  }, [supported])

  const pause = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.pause()
  }, [supported])

  const resume = useCallback(() => {
    if (!supported) return
    window.speechSynthesis.resume()
  }, [supported])

  return { supported, voices, speak, cancel, pause, resume }
}
