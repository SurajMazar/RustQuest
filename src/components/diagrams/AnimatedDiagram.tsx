import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Play, Pause, RotateCcw, SkipBack, SkipForward, Gauge } from 'lucide-react'
import type { AnimatedDiagramSpec, DiagramNode, Tone } from '../../types/lessonContent'

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

// Content is authored with two conventions for `w`/`h`: a handful of diagrams
// (e.g. the lifetimes bars) pass literal pixel widths (128, 300, 130...),
// while most architecture-style diagrams pass small numbers (14-90) meant as
// a percentage of the canvas, matching the 0-100 scale already used for x/y.
// Values <=100 are treated as a percentage of the canvas; anything larger is
// a literal pixel value. We resolve the percentage case to an actual pixel
// number in JS (using the canvas's measured size) rather than a CSS `%`
// string — a `%` width on the motion-animated node ends up resolving against
// its immediate positioning wrapper (which is intentionally auto-sized so it
// doesn't fight the centering transform below), not the canvas, and silently
// collapses to a much smaller box. A definite pixel number sidesteps that
// entirely. Height is always a *minimum* (not fixed) so wrapped text can
// never overflow the box — it just grows taller than requested.
function sizePx(v: number | undefined, fallbackPx: number, canvasSize: number): number {
  if (v == null) return fallbackPx
  return v <= 100 ? (v / 100) * canvasSize : v
}

function NodeBox({ node, canvasWidth, canvasHeight }: { node: DiagramNode; canvasWidth: number; canvasHeight: number }) {
  const tone = TONE_CLASSES[node.tone ?? 'default']
  const shape = node.shape ?? 'box'
  const width = sizePx(node.w, 128, canvasWidth)
  const minHeight = node.h ? sizePx(node.h, 0, canvasHeight) : undefined
  return (
    // Positioning lives on a plain (non-motion) wrapper. Framer Motion's
    // `layout` projection manages the `transform` CSS property itself for
    // shared layout-id animations, which was silently clobbering a manual
    // `translate(-50%, -50%)` set directly on the animated element —
    // nodes with an explicit w/h (most architecture-diagram boxes) rendered
    // with their top-left corner at (x%, y%) instead of being centered
    // there. Keeping the centering transform on an inert wrapper and letting
    // the motion element only animate size/color avoids that conflict.
    <div
      style={{
        position: 'absolute',
        left: `${node.x}%`,
        top: `${node.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        layout
        layoutId={node.id}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: node.invalid ? 0.35 : 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        style={{ width, minHeight }}
        className={`pointer-events-none select-none border-2 px-3 py-2 text-center shadow-sm backdrop-blur-sm ${tone} ${
          shape === 'pill' ? 'rounded-full' : shape === 'circle' ? 'rounded-full aspect-square flex items-center justify-center' : 'rounded-xl'
        }`}
      >
        <div className={`text-xs font-semibold font-mono break-words ${node.invalid ? 'line-through' : ''}`}>{node.label}</div>
        {node.sublabel && <div className="text-[10px] opacity-70 mt-0.5 break-words">{node.sublabel}</div>}
      </motion.div>
    </div>
  )
}

function EdgesLayer({ nodes, edges }: { nodes: DiagramNode[]; edges: NonNullable<AnimatedDiagramSpec['frames'][0]['edges']> }) {
  // Edges are drawn using the same percentage coordinate space as nodes via an SVG overlay.
  return (
    <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 0 }}>
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
        </marker>
      </defs>
      {edges.map((edge, i) => {
        const from = nodes.find((n) => n.id === edge.from)
        const to = nodes.find((n) => n.id === edge.to)
        if (!from || !to) return null
        const x1 = from.x, y1 = from.y, x2 = to.x, y2 = to.y
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2 - (edge.curved ? 8 : 0)
        const toneColor =
          edge.tone === 'danger' ? 'text-rose-500' : edge.tone === 'success' ? 'text-emerald-500' : edge.tone === 'accent' ? 'text-amber-500' : 'text-violet-400'
        return (
          <g key={edge.id ?? `${edge.from}-${edge.to}-${i}`} className={toneColor}>
            <path
              d={`M ${x1}% ${y1}% Q ${midX}% ${midY}% ${x2}% ${y2}%`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeDasharray={edge.dashed ? '4 4' : undefined}
              markerEnd="url(#arrow)"
              opacity={0.8}
            />
            {edge.label && (
              <text x={`${midX}%`} y={`${midY}%`} className="fill-current text-[9px] font-mono" dy={-4} textAnchor="middle">
                {edge.label}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

export function AnimatedDiagram({ spec }: { spec: AnimatedDiagramSpec }) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [canvasWidth, setCanvasWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const frame = spec.frames[frameIndex]
  const isLast = frameIndex === spec.frames.length - 1
  const canvasHeight = spec.height ?? 300

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => setCanvasWidth(el.clientWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return
    if (isLast) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setFrameIndex((i) => Math.min(i + 1, spec.frames.length - 1)), 2200 / speed)
    return () => clearTimeout(id)
  }, [playing, frameIndex, speed, isLast, spec.frames.length])

  const progressPct = useMemo(() => (spec.frames.length <= 1 ? 100 : (frameIndex / (spec.frames.length - 1)) * 100), [frameIndex, spec.frames.length])

  return (
    <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">{spec.title}</div>
          {spec.description && <div className="text-xs text-neutral-500 dark:text-neutral-400">{spec.description}</div>}
        </div>
        <div className="text-xs font-mono text-neutral-400">
          Step {frameIndex + 1} / {spec.frames.length}
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative bg-grid overflow-hidden"
        style={{ height: spec.height ?? 300 }}
      >
        <EdgesLayer nodes={frame.nodes} edges={frame.edges ?? []} />
        <AnimatePresence mode="popLayout">
          {frame.nodes.map((node) => (
            <NodeBox key={node.id} node={node} canvasWidth={canvasWidth} canvasHeight={canvasHeight} />
          ))}
        </AnimatePresence>
      </div>

      <div className="px-4 py-2 border-t border-neutral-200 dark:border-neutral-800">
        <div className="text-xs text-neutral-600 dark:text-neutral-300 min-h-[1.5rem] mb-2">{frame.caption}</div>

        <div className="h-1 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 mb-3 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
            animate={{ width: `${progressPct}%` }}
            transition={{ type: 'tween', duration: 0.3 }}
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setFrameIndex(0)
              setPlaying(false)
            }}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            title="Restart"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={() => {
              setPlaying(false)
              setFrameIndex((i) => Math.max(0, i - 1))
            }}
            disabled={frameIndex === 0}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
            title="Step back"
          >
            <SkipBack size={15} />
          </button>
          <button
            onClick={() => {
              if (isLast) {
                setFrameIndex(0)
                setPlaying(true)
              } else {
                setPlaying((p) => !p)
              }
            }}
            className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-sm"
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <button
            onClick={() => {
              setPlaying(false)
              setFrameIndex((i) => Math.min(spec.frames.length - 1, i + 1))
            }}
            disabled={isLast}
            className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 disabled:opacity-30"
            title="Step forward"
          >
            <SkipForward size={15} />
          </button>

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

        {/* Frame scrubber dots */}
        <div className="flex items-center gap-1 mt-2.5 flex-wrap">
          {spec.frames.map((f, i) => (
            <button
              key={i}
              onClick={() => {
                setPlaying(false)
                setFrameIndex(i)
              }}
              title={f.caption}
              className={`h-1.5 rounded-full transition-all ${
                i === frameIndex ? 'w-6 bg-violet-500' : 'w-1.5 bg-neutral-300 dark:bg-neutral-700 hover:bg-neutral-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
