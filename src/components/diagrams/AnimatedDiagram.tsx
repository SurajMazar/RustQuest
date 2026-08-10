import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Gauge, Volume2, VolumeX, Loader2, Sparkles } from 'lucide-react'
import type { AnimatedDiagramSpec } from '../../types/lessonContent'
import { DiagramComposition, FPS, buildSegments, segmentIndexForFrame, totalFramesFor } from './DiagramComposition'
import { useKokoroNarration } from '../../lib/useKokoroNarration'
import { useNarrationStore } from '../../state/narrationStore'

const COMPOSITION_WIDTH = 960

function formatTime(frames: number): string {
  const totalSec = Math.max(0, Math.floor(frames / FPS))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// Every diagram across the whole curriculum runs through this one component,
// so this is also where the "video-like" upgrade and free narration live —
// no per-lesson wiring needed, since it's driven entirely by the same
// AnimatedDiagramSpec data (frames/nodes/edges/captions) every diagram
// already provides. See DiagramComposition.tsx for the actual Remotion
// composition; this file is the <Player> wrapper plus transport controls and
// the Kokoro-82M narration (see useKokoroNarration.ts) that reads each
// frame's `caption` aloud in a natural voice, running entirely on-device.
export function AnimatedDiagram({ spec }: { spec: AnimatedDiagramSpec }) {
  const playerRef = useRef<PlayerRef>(null)
  const hasInteracted = useRef(false)
  const lastSpokenSegment = useRef(-1)
  const narrationPausedMidSegment = useRef(false)

  const segments = useMemo(() => buildSegments(spec), [spec])
  const totalFrames = useMemo(() => totalFramesFor(segments), [segments])
  const canvasHeight = spec.height ?? 300

  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const narration = useKokoroNarration()
  const narrationEnabled = useNarrationStore((s) => s.enabled)
  const setNarrationEnabled = useNarrationStore((s) => s.setEnabled)
  const voiceId = useNarrationStore((s) => s.voiceId)
  const setVoiceId = useNarrationStore((s) => s.setVoiceId)

  // Start downloading/warming the voice model as soon as narration is on,
  // so it's more likely to already be ready by the time the user hits play
  // instead of only kicking off on the first spoken segment.
  useEffect(() => {
    if (narrationEnabled) narration.preload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrationEnabled])

  // Reset transport + narration state whenever the diagram itself changes
  // (e.g. navigating between lessons re-uses the component in some renderers).
  useEffect(() => {
    setCurrentFrame(0)
    setPlaying(false)
    hasInteracted.current = false
    lastSpokenSegment.current = -1
    narrationPausedMidSegment.current = false
    narration.cancel()
    playerRef.current?.seekTo(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec])

  const segIndex = segmentIndexForFrame(segments, currentFrame)

  const speechRateFor = useCallback((s: number) => (s <= 0.5 ? 0.85 : s >= 2 ? 1.3 : s >= 1.5 ? 1.15 : 1), [])

  const speakSegment = useCallback(
    (idx: number) => {
      if (!narrationEnabled || !narration.supported) return
      lastSpokenSegment.current = idx
      narrationPausedMidSegment.current = false
      narration.speak(segments[idx].frame.caption, { rate: speechRateFor(speed), voiceId })
    },
    [narrationEnabled, narration, speed, voiceId, segments, speechRateFor]
  )

  // Player event wiring: keeps our React state (scrubber, progress bar,
  // play/pause icon) in sync with whatever actually drives the timeline
  // (our buttons, but also keyboard/media-session controls the Player
  // itself may expose).
  useEffect(() => {
    const player = playerRef.current
    if (!player) return
    const onFrameUpdate = (e: { detail: { frame: number } }) => setCurrentFrame(e.detail.frame)
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnded = () => setPlaying(false)
    player.addEventListener('frameupdate', onFrameUpdate)
    player.addEventListener('play', onPlay)
    player.addEventListener('pause', onPause)
    player.addEventListener('ended', onEnded)
    return () => {
      player.removeEventListener('frameupdate', onFrameUpdate)
      player.removeEventListener('play', onPlay)
      player.removeEventListener('pause', onPause)
      player.removeEventListener('ended', onEnded)
    }
  }, [])

  // Automatic narration for segments the timeline crosses *during playback*
  // (i.e. everything after the user's first explicit gesture) — manual
  // step/scrub/restart handlers below speak their target segment directly.
  useEffect(() => {
    if (!hasInteracted.current) return
    if (lastSpokenSegment.current === segIndex) return
    speakSegment(segIndex)
  }, [segIndex, speakSegment])

  const isLast = currentFrame >= totalFrames - 1

  const handlePlayPause = () => {
    const player = playerRef.current
    if (!player) return
    hasInteracted.current = true
    if (playing) {
      player.pause()
      narration.pause()
      narrationPausedMidSegment.current = true
      return
    }
    if (isLast) {
      player.seekTo(0)
      lastSpokenSegment.current = -1
    }
    player.play()
    if (narrationPausedMidSegment.current) {
      narrationPausedMidSegment.current = false
      narration.resume()
    } else {
      speakSegment(segmentIndexForFrame(segments, isLast ? 0 : currentFrame))
    }
  }

  const stepTo = (idx: number) => {
    const clamped = Math.max(0, Math.min(segments.length - 1, idx))
    const target = segments[clamped]
    hasInteracted.current = true
    playerRef.current?.pause()
    playerRef.current?.seekTo(target.startFrame)
    setCurrentFrame(target.startFrame)
    setPlaying(false)
    speakSegment(target.index)
  }

  const handleRestart = () => {
    hasInteracted.current = true
    playerRef.current?.pause()
    playerRef.current?.seekTo(0)
    setCurrentFrame(0)
    setPlaying(false)
    lastSpokenSegment.current = -1
    speakSegment(0)
  }

  const handleToggleNarration = () => {
    const next = !narrationEnabled
    setNarrationEnabled(next)
    if (!next) narration.cancel()
  }

  const progressPct = totalFrames <= 1 ? 100 : (currentFrame / (totalFrames - 1)) * 100
  const voicesByAccent = useMemo(() => {
    const groups = new Map<string, typeof narration.voices>()
    for (const v of narration.voices) groups.set(v.accent, [...(groups.get(v.accent) ?? []), v])
    return groups
  }, [narration.voices])

  const narrationBusy = narrationEnabled && narration.supported && narration.status === 'loading'
  const narrationFailed = narrationEnabled && narration.supported && narration.status === 'error'

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm">
      <div className="px-4 pt-3 pb-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{spec.title}</div>
          {spec.description && <div className="text-xs text-neutral-500 dark:text-neutral-400">{spec.description}</div>}
        </div>
        <div className="text-xs font-mono text-neutral-400 whitespace-nowrap">
          Step {segIndex + 1} / {segments.length}
        </div>
      </div>

      <div className="relative bg-grid overflow-hidden" style={{ height: canvasHeight }}>
        <Player
          ref={playerRef}
          component={DiagramComposition}
          inputProps={{ spec, segments, playing }}
          durationInFrames={totalFrames}
          compositionWidth={COMPOSITION_WIDTH}
          compositionHeight={canvasHeight}
          fps={FPS}
          style={{ width: '100%', height: '100%' }}
          controls={false}
          clickToPlay={false}
          spaceKeyToPlayOrPause={false}
          doubleClickToFullscreen={false}
          playbackRate={speed}
          initiallyMuted
        />
      </div>

      <div className="px-4 py-3 border-t border-neutral-200 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-3 min-h-[1.5rem] mb-2">
          <div className="text-xs text-neutral-600 dark:text-neutral-300">{segments[segIndex]?.frame.caption}</div>
          {narrationBusy && (
            <div className="flex items-center gap-1 text-[10px] font-mono text-violet-500 dark:text-violet-400 whitespace-nowrap shrink-0 pt-0.5">
              <Loader2 size={11} className="animate-spin" />
              Loading voice… {narration.progress}%
            </div>
          )}
          {narrationFailed && (
            <div
              className="flex items-center gap-1 text-[10px] font-mono text-neutral-400 whitespace-nowrap shrink-0 pt-0.5"
              title={narration.error ?? undefined}
            >
              Voice unavailable
            </div>
          )}
        </div>

        <div className="relative h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 mb-1 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-150"
            style={{ width: `${progressPct}%` }}
          />
          {segments.slice(1).map((seg, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 w-px bg-white/50 dark:bg-black/30"
              style={{ left: `${(seg.startFrame / Math.max(1, totalFrames - 1)) * 100}%` }}
            />
          ))}
        </div>
        <div className="flex justify-end mb-2.5">
          <span className="text-[10px] font-mono text-neutral-400">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800/60 p-0.5">
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 transition-colors"
              title="Restart"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => stepTo(segIndex - 1)}
              disabled={segIndex === 0}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 disabled:opacity-30 transition-colors"
              title="Step back"
            >
              <SkipBack size={15} />
            </button>
            <button
              onClick={handlePlayPause}
              className="p-2 rounded-full bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-colors"
              title={playing ? 'Pause' : 'Play'}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              onClick={() => stepTo(segIndex + 1)}
              disabled={segIndex >= segments.length - 1}
              className="p-1.5 rounded-full hover:bg-white dark:hover:bg-neutral-700 text-neutral-500 dark:text-neutral-400 disabled:opacity-30 transition-colors"
              title="Step forward"
            >
              <SkipForward size={15} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleNarration}
              disabled={!narration.supported}
              className={`p-1.5 rounded-lg transition-colors disabled:opacity-30 ${
                narrationEnabled
                  ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300'
                  : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
              title={
                !narration.supported
                  ? "Narration isn't supported in this browser"
                  : narrationEnabled
                    ? 'Narration on — click to mute'
                    : 'Narration off — click to enable'
              }
            >
              {narrationEnabled && narration.supported ? <Volume2 size={15} /> : <VolumeX size={15} />}
            </button>

            {narration.supported && (
              <div
                className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-violet-500 dark:text-violet-400"
                title="Narrated by Kokoro-82M, an open-weight text-to-speech model running locally in your browser"
              >
                <Sparkles size={11} />
                Kokoro
              </div>
            )}

            {narration.supported && (
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="text-[11px] font-mono bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-md px-1.5 py-1 text-neutral-500 dark:text-neutral-400 max-w-[110px]"
                title="Narration voice"
              >
                {[...voicesByAccent.entries()].map(([accent, voices]) => (
                  <optgroup key={accent} label={accent}>
                    {voices.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 text-neutral-400">
            <Gauge size={14} />
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                  speed === s ? 'bg-violet-600 text-white' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>

        {/* Segment scrubber dots */}
        <div className="flex items-center gap-1 mt-2.5 flex-wrap">
          {segments.map((seg, i) => (
            <button
              key={i}
              onClick={() => stepTo(i)}
              title={seg.frame.caption}
              className={`h-1.5 rounded-full transition-all ${
                i === segIndex ? 'w-6 bg-violet-500' : 'w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
