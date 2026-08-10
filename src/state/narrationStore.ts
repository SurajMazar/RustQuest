import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_KOKORO_VOICE } from '../lib/useKokoroNarration'

interface NarrationState {
  /** User's global preference — applies to every diagram across every course. */
  enabled: boolean
  /** Preferred Kokoro voice id, e.g. "af_heart". */
  voiceId: string
  setEnabled: (v: boolean) => void
  setVoiceId: (id: string) => void
  toggle: () => void
}

export const useNarrationStore = create<NarrationState>()(
  persist(
    (set, get) => ({
      enabled: true,
      voiceId: DEFAULT_KOKORO_VOICE,
      setEnabled: (v) => set({ enabled: v }),
      setVoiceId: (id) => set({ voiceId: id }),
      toggle: () => set({ enabled: !get().enabled }),
    }),
    // Renamed from the old "-narration" key: that store held a raw OS
    // SpeechSynthesis voice name (e.g. "Google US English"), which means
    // nothing to Kokoro's fixed voice ids — a fresh key avoids a stale value
    // silently failing to match any of them.
    { name: 'rust-tauri-academy-narration-v2' }
  )
)
