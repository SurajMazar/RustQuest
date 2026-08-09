# Rust → Tauri Academy

An interactive, animated learning platform that takes a learner from **"I know nothing about Rust"** to Tauri desktop applications, following the progression:

```
Rust Beginner → Rust Intermediate → Rust Advanced →
Tauri Beginner → Tauri Intermediate → Tauri Advanced → Production Projects
```

Built with React + TypeScript + Vite, Tailwind CSS v4, Framer Motion, Zustand, and a real Monaco-based code editor wired to the public Rust Playground for actually running code in the browser.

## Running it

```bash
npm install
npm run dev       # local dev server, hot reload
npm run build     # production build → dist/
npm run preview   # serve the production build locally
```

Requires internet access at runtime for two things: the "Run" button in code exercises sends code to `https://play.rust-lang.org/execute` (the same public API play.rust-lang.org itself uses) and returns real compiler output; everything else (the editor, animations, navigation, progress tracking) works fully offline since Monaco is bundled locally rather than loaded from a CDN.

## What's here

**A full interactive lesson engine**, not a static docs site:
- Slide-based lessons (`src/components/SlideDeck.tsx`) — every lesson is a sequence of steppable slides (Explain → Animate → Code → Exercise/Debug → Quiz), not a single scrolling page.
- A generic animated-diagram engine (`src/components/diagrams/AnimatedDiagram.tsx`) driven entirely by data (frames of positioned boxes + arrows), with play/pause/restart/step-forward/step-back/speed controls. It powers the ownership/move-semantics memory diagrams, the Rc reference-counting animation, the Mutex/thread-contention diagram, the Future/Poll/Pending/Waker/Ready pipeline, and the Tauri IPC/architecture diagrams — all with the same reusable component.
- A real code playground (Monaco editor + Rust Playground execution) for runnable exercises, and a lightweight read-only code block for Tauri/frontend snippets that can't run in a browser sandbox.
- Progressive-hint exercises, "fix the broken code" debug challenges (with genuine compiler errors), multi-question quizzes with instant feedback, and collapsible project step-by-step walkthroughs.
- localStorage-backed progress tracking (per-lesson completion, quiz results), a dashboard with per-level progress bars, dark/light mode, a fully responsive/mobile layout, and keyboard navigation (←/→ between slides).

**The full 7-level curriculum tree** (`src/data/curriculum/*.ts`) — every topic, project, and challenge listed in the original spec exists as a navigable entry with its own difficulty badge, time estimate, and "why this matters / what's next" dependency chain. Two content states:

- **`status: 'full'`** — fully authored, all five slide types, real (compiled-and-verified) Rust code. This includes the entire Rust Beginner level, the full Ownership & Memory chapter and Option/Result error-handling in Rust Intermediate, the flagship Smart Pointers / Mutex-and-threads / Futures-and-polling lessons in Rust Advanced, the Tauri architecture + IPC lessons and first project in Tauri Beginner/Intermediate/Advanced, and the Capstone overview.
- **`status: 'stub'`** — everything else from the original spec (e.g. structs/enums, generics/traits, most intermediate/advanced projects, most Tauri Intermediate/Advanced topics, the 10 capstone milestones). These render as a "coming soon" card listing exactly what the lesson will cover, but are fully wired into navigation, progress tracking, and prev/next — so extending the course later is just adding a `LessonContent` entry to the relevant `src/content/*.content.ts` file; no architecture changes needed.

## Extending it

To turn a stub into a real lesson: open `src/types/lessonContent.ts` to see the section schema (`explain` / `diagram` / `code` / `terminal` / `exercise` / `debug` / `quiz` / `compare` / `project-steps`), then add a `LessonContent` object keyed by the lesson's id to the matching file in `src/content/` (e.g. `rustIntermediate.content.ts`) and it will automatically render — the lesson metadata, sidebar entry, and prev/next links already exist in `src/data/curriculum/`.
