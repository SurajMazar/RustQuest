import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion'
import type { AnimatedDiagramSpec, DiagramFrame, DiagramNode, Tone } from '../../types/lessonContent'

export const FPS = 30
const TRANSITION_FRAMES = 20
const MIN_SEGMENT_SEC = 2.6
const MAX_SEGMENT_SEC = 9
// Rough average speaking rate for the built-in browser voices this narration
// relies on — used only to size each step's on-screen duration so the visual
// timeline doesn't outrun (or crawl behind) the spoken caption.
const WORDS_PER_SEC = 2.6

export interface DiagramSegment {
  index: number
  frame: DiagramFrame
  startFrame: number
  durationInFrames: number
  endFrame: number
}

function estimateSegmentFrames(caption: string): number {
  const words = caption.trim().split(/\s+/).filter(Boolean).length
  const sec = Math.min(MAX_SEGMENT_SEC, Math.max(MIN_SEGMENT_SEC, words / WORDS_PER_SEC + 0.7))
  return Math.round(sec * FPS)
}

export function buildSegments(spec: AnimatedDiagramSpec): DiagramSegment[] {
  let cursor = 0
  return spec.frames.map((frame, index) => {
    const durationInFrames = estimateSegmentFrames(frame.caption)
    const seg: DiagramSegment = { index, frame, startFrame: cursor, durationInFrames, endFrame: cursor + durationInFrames }
    cursor += durationInFrames
    return seg
  })
}

export function totalFramesFor(segments: DiagramSegment[]): number {
  if (segments.length === 0) return FPS
  return segments[segments.length - 1].endFrame
}

export function segmentIndexForFrame(segments: DiagramSegment[], frame: number): number {
  for (let i = segments.length - 1; i >= 0; i--) {
    if (frame >= segments[i].startFrame) return i
  }
  return 0
}

const TONE_CLASSES: Record<Tone, string> = {
  stack: 'bg-sky-500/15 border-sky-400 text-sky-700 dark:text-sky-300',
  heap: 'bg-violet-500/15 border-violet-400 text-violet-700 dark:text-violet-300',
  default: 'bg-neutral-500/10 border-neutral-400 text-neutral-700 dark:text-neutral-200',
  accent: 'bg-amber-500/15 border-amber-400 text-amber-700 dark:text-amber-300',
  danger: 'bg-rose-500/15 border-rose-400 text-rose-700 dark:text-rose-300',
  success: 'bg-emerald-500/15 border-emerald-400 text-emerald-700 dark:text-emerald-300',
  muted: 'bg-neutral-400/10 border-neutral-300 text-neutral-400 dark:text-neutral-500',
  warning: 'bg-orange-500/15 border-orange-400 text-orange-700 dark:text-orange-300',
}

// See the long comment in the old AnimatedDiagram.tsx history for why this
// exists: content authors mix two conventions for `w`/`h` — a handful of
// diagrams pass literal pixel widths (128, 300, 130...), most pass small
// numbers (14-90) meant as a percentage of the canvas. Values <=100 are
// treated as a percentage of the (now fixed, Remotion-known) canvas size;
// anything larger is a literal pixel value.
function sizePx(v: number | undefined, fallbackPx: number, canvasSize: number): number {
  if (v == null) return fallbackPx
  return v <= 100 ? (v / 100) * canvasSize : v
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function lerpMaybe(a: number | undefined, b: number | undefined, t: number): number | undefined {
  if (a == null && b == null) return undefined
  if (a == null) return b
  if (b == null) return a
  return lerp(a, b, t)
}

interface RenderEntry {
  node: DiagramNode
  x: number
  y: number
  w?: number
  h?: number
  opacity: number
  scale: number
}

function NodeBox({ entry, canvasWidth, canvasHeight }: { entry: RenderEntry; canvasWidth: number; canvasHeight: number }) {
  const { node, x, y, w, h, opacity, scale } = entry
  const tone = TONE_CLASSES[node.tone ?? 'default']
  const shape = node.shape ?? 'box'
  const width = sizePx(w, 128, canvasWidth)
  const minHeight = h ? sizePx(h, 0, canvasHeight) : undefined
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    >
      <div
        style={{ width, minHeight }}
        className={`select-none border-2 px-3 py-2 text-center shadow-sm backdrop-blur-sm ${tone} ${
          shape === 'pill' ? 'rounded-full' : shape === 'circle' ? 'rounded-full aspect-square flex items-center justify-center' : 'rounded-xl'
        }`}
      >
        <div className={`text-xs font-semibold font-mono break-words ${node.invalid ? 'line-through' : ''}`}>{node.label}</div>
        {node.sublabel && <div className="text-[10px] opacity-70 mt-0.5 break-words">{node.sublabel}</div>}
      </div>
    </div>
  )
}

// SVG path `d` commands only accept plain numbers, never `%` units — a `d`
// string built from percentage tokens (the previous version of this layer)
// silently fails to parse, so every edge/arrow/label was invisible. Giving
// the SVG a viewBox equal to the composition's real pixel size lets node
// percentages convert to plain numbers that line up 1:1 with the boxes
// NodeBox draws (which position via CSS % of that same pixel canvas).
function EdgesLayer({
  nodes,
  edges,
  canvasWidth,
  canvasHeight,
}: {
  nodes: DiagramNode[]
  edges: NonNullable<AnimatedDiagramSpec['frames'][0]['edges']>
  canvasWidth: number
  canvasHeight: number
}) {
  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
      preserveAspectRatio="none"
      style={{ zIndex: 0 }}
    >
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const from = nodes.find((n) => n.id === edge.from)
        const to = nodes.find((n) => n.id === edge.to)
        if (!from || !to) return null
        const x1 = (from.x / 100) * canvasWidth
        const y1 = (from.y / 100) * canvasHeight
        const x2 = (to.x / 100) * canvasWidth
        const y2 = (to.y / 100) * canvasHeight
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2 - (edge.curved ? 0.08 * canvasHeight : 0)
        const toneColor =
          edge.tone === 'danger' ? 'text-rose-500' : edge.tone === 'success' ? 'text-emerald-500' : edge.tone === 'accent' ? 'text-amber-500' : 'text-violet-400'
        return (
          <g key={edge.id ?? `${edge.from}-${edge.to}-${i}`} className={toneColor}>
            <path
              d={`M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeDasharray={edge.dashed ? '4 4' : undefined}
              markerEnd="url(#arrow)"
              opacity={0.8}
              vectorEffect="non-scaling-stroke"
            />
            {edge.label && (
              <text x={midX} y={midY} className="fill-current text-[9px] font-mono" dy={-4} textAnchor="middle">
                {edge.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export interface DiagramCompositionProps {
  spec: AnimatedDiagramSpec
  segments: DiagramSegment[]
  /**
   * Whether the Player is actively advancing frames right now. A frame-based
   * transition is only meaningful while frames are moving — if the player is
   * paused (including sitting idle before the first play, or freshly landed
   * on a segment via a step/scrub jump), `useCurrentFrame()` still reports
   * the exact frame we're parked on, which for a segment's opening frames is
   * mid fade-in. Without this flag every "new" node in a segment would render
   * partially (or fully, at frame 0) transparent any time playback isn't
   * actively running — freezing the transition at its *settled* end state
   * while paused is what makes stepping/scrubbing land on a fully-drawn step.
   */
  playing: boolean
}

// The Remotion composition itself. Rendered by <Player>, driven purely by
// `useCurrentFrame()` — every visual is a deterministic function of the
// frame number, which is what makes this "video-like": scrubbing, seeking,
// and playback rate all just work, and the same component could be handed to
// Remotion's renderer to produce a real .mp4 later without changing a line.
export function DiagramComposition({ segments, playing }: DiagramCompositionProps) {
  const frame = useCurrentFrame()
  const { width, height } = useVideoConfig()
  const segIndex = segmentIndexForFrame(segments, frame)
  const seg = segments[segIndex]
  const localFrame = frame - seg.startFrame

  const currFrame = seg.frame
  const prevFrame = segIndex > 0 ? segments[segIndex - 1].frame : null
  const currNodes = currFrame.nodes
  const prevNodes = prevFrame?.nodes ?? []
  const prevById = new Map(prevNodes.map((n) => [n.id, n]))
  const currById = new Map(currNodes.map((n) => [n.id, n]))

  const rawT = playing ? interpolate(localFrame, [0, TRANSITION_FRAMES], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) : 1
  const t = Easing.out(Easing.cubic)(rawT)

  const renderEntries: RenderEntry[] = []

  currNodes.forEach((node) => {
    const prev = prevById.get(node.id)
    if (prev) {
      renderEntries.push({
        node,
        x: lerp(prev.x, node.x, t),
        y: lerp(prev.y, node.y, t),
        w: lerpMaybe(prev.w, node.w, t),
        h: lerpMaybe(prev.h, node.h, t),
        opacity: node.invalid ? lerp(1, 0.35, t) : 1,
        scale: 1,
      })
    } else {
      renderEntries.push({
        node,
        x: node.x,
        y: node.y,
        w: node.w,
        h: node.h,
        opacity: node.invalid ? lerp(t, 0.35, t) : t,
        scale: lerp(0.7, 1, t),
      })
    }
  })

  // Nodes present a moment ago but gone now fade out instead of vanishing —
  // only while actively transitioning through a segment change, then they
  // simply stop being rendered (and never appear at all while paused).
  if (playing && localFrame < TRANSITION_FRAMES) {
    prevNodes.forEach((node) => {
      if (!currById.has(node.id)) {
        renderEntries.push({ node, x: node.x, y: node.y, w: node.w, h: node.h, opacity: lerp(1, 0, t), scale: lerp(1, 0.6, t) })
      }
    })
  }

  return (
    <AbsoluteFill className="bg-grid">
      <EdgesLayer nodes={currNodes} edges={currFrame.edges ?? []} canvasWidth={width} canvasHeight={height} />
      {renderEntries.map((entry) => (
        <NodeBox key={entry.node.id} entry={entry} canvasWidth={width} canvasHeight={height} />
      ))}
    </AbsoluteFill>
  )
}
