import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Player, type PlayerRef } from '@remotion/player'
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Gauge, Volume2, VolumeX } from 'lucide-react'
import type { AnimatedDiagramSpec } from '../../types/lessonContent'
import { DiagramComposition, FPS, buildSegments, segmentIndexForFrame, totalFramesFor } from './DiagramComposition'
import { useSpeechNarration } from '../../lib/useSpeechNarration'
import { useNarrationStore } from '../../state/narrationStore'

const COMPOSITION_WIDTH = 960

// Every diagram across the whole curriculum runs through this one component,
// so this is also where the "video-like" upgrade and free narration live —
// no per-lesson wiring needed, since it's driven entirely by the same
// AnimatedDiagramSpec data (frames/nodes/edges/captions) every diagram
// already provides. See DiagramComposition.tsx for the actual Remotion
// composition; this file is the <Player> wrapper plus transport controls and
// the Web Speech narration that reads each frame's `caption` aloud.
export function AnimatedDiagram({ spec }: { spec: AnimatedDiagramSpec }) {
  const playerRef = useRef<PlayerRef>(null)
  const hasInteracted = useRef(false)
  const lastSpokenSegment = useRef(-1)

  const segments = useMemo(() => buildSegments(spec), [spec])
  const totalFrames = useMemo(() => totalFramesFor(segments), [segments])
  const canvasHeight = spec.height ?? 300

  const [currentFrame, setCurrentFrame] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const narration = useSpeechNarration()
  const narrationEnabled = useNarrationStore((s) => s.enabled)
  const setNarrationEnabled = useNarrationStore((s) => s.setEnabled)
  const voiceName = useNarrationStore((s) => s.voiceName)
  const setVoiceName = useNarrationStore((s) => s.setVoiceName)

  // Reset transport + narration state whenever the diagram itself changes
  // (e.g. navigating between lessons re-uses the component in some renderers).
  useEffect(() => {
    setCurrentFrame(0)
    setPlaying(false)
    hasInteracted.current = false
    lastSpokenSegment.current = -1
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
      narration.speak(segments[idx].frame.caption, { rate: speechRateFor(speed), voiceName })
    },
    [narrationEnabled, narration, speed, voiceName, segments, speechRateFor]
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
      return
    }
    if (isLast) {
      player.seekTo(0)
      lastSpokenSegment.current = -1
    }
    player.play()
    if (typeof window !== 'undefined' && window.speechSynthesis?.paused) {
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
  const englishVoices = useMemo(
    () => narration.voices.filter((v) => v.lang.toLowerCase().startsWith('en')).slice(0, 12),
    [narration.voices]
  )

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden">
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

      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-xs text-neutral-600 dark:text-neutral-300 min-h-[1.5rem] mb-2">{segments[segIndex]?.frame.caption}</div>

        <div className="h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 mb-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-[width] duration-150"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRestart}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            title="Restart"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => stepTo(segIndex - 1)}
            disabled={segIndex === 0}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
            title="Step back"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={handlePlayPause}
            className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-sm"
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={() => stepTo(segIndex + 1)}
            disabled={segIndex >= segments.length - 1}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
            title="Step forward"
          >
            <SkipForward size={15} />
          </button>

          <button
            onClick={handleToggleNarration}
            disabled={!narration.supported}
            className={`p-1.5 rounded-lg text-neutral-500 disabled:opacity-30 ${
              narrationEnabled ? 'bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300' : 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
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

          {narration.supported && englishVoices.length > 0 && (
            <select
              value={voiceName ?? ''}
              onChange={(e) => setVoiceName(e.target.value || null)}
              className="text-[11px] font-mono bg-transparent border border-neutral-200 dark:border-neutral-700 rounded px-1 py-0.5 text-neutral-500 max-w-[110px]"
              title="Narration voice"
            >
              <option value="">Auto voice</option>
              {englishVoices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name.replace(/^Microsoft |^Google /, '').slice(0, 18)}
                </option>
              ))}
            </select>
          )}

          <div className="ml-auto flex items-center gap-1.5 text-neutral-400">
            <Gauge size={14} />
            {[0.5, 1, 1.5, 2].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
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
