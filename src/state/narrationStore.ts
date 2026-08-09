import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface NarrationState {
  /** User's global preference — applies to every diagram across every course. */
  enabled: boolean
  /** Preferred voice, remembered by name since SpeechSynthesisVoice objects aren't serializable. */
  voiceName: string | null
  setEnabled: (v: boolean) => void
  setVoiceName: (name: string | null) => void
  toggle: () => void
}

export const useNarrationStore = create<NarrationState>()(
  persist(
    (set, get) => ({
      enabled: true,
      voiceName: null,
      setEnabled: (v) => set({ enabled: v }),
      setVoiceName: (name) => set({ voiceName: name }),
      toggle: () => set({ enabled: !get().enabled }),
    }),
    { name: 'rust-tauri-academy-narration' }
  )
)
