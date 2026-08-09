import type { LessonContent } from '../types/lessonContent'

export const productionContent: Record<string, LessonContent> = {
  'cap-overview': {
    id: 'cap-overview',
    heroSummary:
      'The capstone is a production-style desktop app — React/TS + Tauri + Rust + SQLite — broken into 10 taught milestones, each concept covered before you build it.',
    dependencyChain: {
      learned: 'Every Tauri fundamental: architecture, commands/invoke, events, IPC internals, and State<T>-backed shared data — plus Rust ownership, concurrency, and error handling from the Rust track.',
      why: 'None of those pieces exist in isolation in a real app — a production system needs them wired together with a database, auth, background work, and a deployment story.',
      build: 'A map of the whole capstone system before touching code: what each layer does, how data flows between them, and which of the 10 milestones teaches which piece.',
      next: 'Milestone 1 — scaffolding the actual project structure this diagram describes.',
    },
    sections: [
      {
        type: 'explain',
        title: 'What you\'re building',
        body: [
          'The capstone is a production-style desktop app: React/TypeScript for the UI, Tauri as the shell, Rust for all backend logic, and SQLite as a real embedded database. It has the pieces a real shipped app needs — authentication, persistent state, IPC, events, file system access, communication with an external API, background tasks, error handling, a security review, tests, and a packaged, auto-updating build.',
          'This is deliberately not a tutorial you copy line-by-line. It\'s a system you\'ll understand piece by piece: every milestone below teaches the concept first — with diagrams and small exercises, the same way every lesson so far has — and only then has you implement that piece in the real project. By the end, you won\'t just have a working app; you\'ll be able to explain why every piece of it is built the way it is.',
        ],
        bullets: [
          'Frontend: React + TypeScript UI, talking to Rust exclusively through commands and events.',
          'Backend: Rust — commands, shared App State, a SQLite-backed data layer, background workers.',
          'Cross-cutting concerns taught as their own milestones: auth, security, testing, packaging.',
        ],
        callout: {
          tone: 'accent',
          text: 'Every milestone follows the same shape you\'ve already learned from: explain → diagram → code/exercise → quiz, then "now build this piece for real".',
        },
      },
      {
        type: 'diagram',
        title: 'Capstone system architecture',
        description: 'The full system, revealed one subsystem\'s connections at a time.',
        diagram: {
          title: 'Production app architecture',
          height: 440,
          frames: [
            {
              caption: 'The core UI-to-data path: React UI calls Tauri Commands, which reach into App State.',
              nodes: [
                { id: 'ui', label: 'React UI', x: 15, y: 12, w: 26, h: 14, tone: 'accent', shape: 'box' },
                { id: 'commands', label: 'Tauri Commands', x: 15, y: 40, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'state', label: 'App State\n(Arc<Mutex<..>> / State<T>)', x: 50, y: 40, w: 30, h: 16, tone: 'default', shape: 'box' },
                { id: 'sqlite', label: 'SQLite (via sqlx)', x: 15, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'auth', label: 'Auth / Session', x: 82, y: 12, w: 24, h: 14, tone: 'default', shape: 'box' },
                { id: 'worker', label: 'Background Task Worker', x: 82, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'api', label: 'External API', x: 50, y: 90, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'ui', to: 'commands', label: 'invoke()', tone: 'accent', animated: true },
                { from: 'commands', to: 'state', label: 'read/write', tone: 'accent', animated: true },
              ],
            },
            {
              caption: 'App State persists through a real database: SQLite via sqlx.',
              nodes: [
                { id: 'ui', label: 'React UI', x: 15, y: 12, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'commands', label: 'Tauri Commands', x: 15, y: 40, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'state', label: 'App State\n(Arc<Mutex<..>> / State<T>)', x: 50, y: 40, w: 30, h: 16, tone: 'accent', shape: 'box' },
                { id: 'sqlite', label: 'SQLite (via sqlx)', x: 15, y: 68, w: 26, h: 14, tone: 'accent', shape: 'box' },
                { id: 'auth', label: 'Auth / Session', x: 82, y: 12, w: 24, h: 14, tone: 'default', shape: 'box' },
                { id: 'worker', label: 'Background Task Worker', x: 82, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'api', label: 'External API', x: 50, y: 90, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'ui', to: 'commands', tone: 'muted' },
                { from: 'commands', to: 'state', tone: 'muted' },
                { from: 'state', to: 'sqlite', label: 'queries', tone: 'accent', animated: true },
              ],
            },
            {
              caption: 'Auth/Session sits in front of Commands, guarding which ones a caller may run.',
              nodes: [
                { id: 'ui', label: 'React UI', x: 15, y: 12, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'commands', label: 'Tauri Commands', x: 15, y: 40, w: 26, h: 14, tone: 'accent', shape: 'box' },
                { id: 'state', label: 'App State\n(Arc<Mutex<..>> / State<T>)', x: 50, y: 40, w: 30, h: 16, tone: 'default', shape: 'box' },
                { id: 'sqlite', label: 'SQLite (via sqlx)', x: 15, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'auth', label: 'Auth / Session', x: 82, y: 12, w: 24, h: 14, tone: 'accent', shape: 'box' },
                { id: 'worker', label: 'Background Task Worker', x: 82, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'api', label: 'External API', x: 50, y: 90, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'ui', to: 'commands', tone: 'muted' },
                { from: 'commands', to: 'state', tone: 'muted' },
                { from: 'state', to: 'sqlite', tone: 'muted' },
                { from: 'auth', to: 'commands', label: 'guards', tone: 'accent', dashed: true, animated: true },
              ],
            },
            {
              caption: 'Commands can also reach out to an external API for data the local database doesn\'t have.',
              nodes: [
                { id: 'ui', label: 'React UI', x: 15, y: 12, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'commands', label: 'Tauri Commands', x: 15, y: 40, w: 26, h: 14, tone: 'accent', shape: 'box' },
                { id: 'state', label: 'App State\n(Arc<Mutex<..>> / State<T>)', x: 50, y: 40, w: 30, h: 16, tone: 'default', shape: 'box' },
                { id: 'sqlite', label: 'SQLite (via sqlx)', x: 15, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'auth', label: 'Auth / Session', x: 82, y: 12, w: 24, h: 14, tone: 'default', shape: 'box' },
                { id: 'worker', label: 'Background Task Worker', x: 82, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'api', label: 'External API', x: 50, y: 90, w: 26, h: 14, tone: 'accent', shape: 'box' },
              ],
              edges: [
                { from: 'ui', to: 'commands', tone: 'muted' },
                { from: 'commands', to: 'state', tone: 'muted' },
                { from: 'state', to: 'sqlite', tone: 'muted' },
                { from: 'auth', to: 'commands', tone: 'muted', dashed: true },
                { from: 'commands', to: 'api', label: 'HTTP request', tone: 'accent', animated: true, curved: true },
              ],
            },
            {
              caption: 'A background worker runs independently, writing results into SQLite and notifying the UI via events.',
              nodes: [
                { id: 'ui', label: 'React UI', x: 15, y: 12, w: 26, h: 14, tone: 'success', shape: 'box' },
                { id: 'commands', label: 'Tauri Commands', x: 15, y: 40, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'state', label: 'App State\n(Arc<Mutex<..>> / State<T>)', x: 50, y: 40, w: 30, h: 16, tone: 'default', shape: 'box' },
                { id: 'sqlite', label: 'SQLite (via sqlx)', x: 15, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'auth', label: 'Auth / Session', x: 82, y: 12, w: 24, h: 14, tone: 'default', shape: 'box' },
                { id: 'worker', label: 'Background Task Worker', x: 82, y: 68, w: 26, h: 14, tone: 'accent', shape: 'box' },
                { id: 'api', label: 'External API', x: 50, y: 90, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'ui', to: 'commands', tone: 'muted' },
                { from: 'commands', to: 'state', tone: 'muted' },
                { from: 'state', to: 'sqlite', tone: 'muted' },
                { from: 'auth', to: 'commands', tone: 'muted', dashed: true },
                { from: 'commands', to: 'api', tone: 'muted', curved: true },
                { from: 'worker', to: 'sqlite', label: 'writes results', tone: 'accent', animated: true, curved: true },
                { from: 'worker', to: 'ui', label: 'emit("task-complete")', tone: 'success', animated: true, dashed: true, curved: true },
              ],
            },
            {
              caption: 'The full system, all subsystems connected — this is the shape every milestone below builds toward.',
              nodes: [
                { id: 'ui', label: 'React UI', x: 15, y: 12, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'commands', label: 'Tauri Commands', x: 15, y: 40, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'state', label: 'App State\n(Arc<Mutex<..>> / State<T>)', x: 50, y: 40, w: 30, h: 16, tone: 'default', shape: 'box' },
                { id: 'sqlite', label: 'SQLite (via sqlx)', x: 15, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'auth', label: 'Auth / Session', x: 82, y: 12, w: 24, h: 14, tone: 'default', shape: 'box' },
                { id: 'worker', label: 'Background Task Worker', x: 82, y: 68, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'api', label: 'External API', x: 50, y: 90, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'ui', to: 'commands', label: 'invoke()', tone: 'muted' },
                { from: 'commands', to: 'state', tone: 'muted' },
                { from: 'state', to: 'sqlite', tone: 'muted' },
                { from: 'auth', to: 'commands', label: 'guards', tone: 'muted', dashed: true },
                { from: 'commands', to: 'api', label: 'HTTP', tone: 'muted', curved: true },
                { from: 'worker', to: 'sqlite', tone: 'muted', curved: true },
                { from: 'worker', to: 'ui', label: 'events', tone: 'muted', dashed: true, curved: true },
              ],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'The 10 milestones',
        goals: [
          'Understand each subsystem before implementing it, in the order a real app is actually built.',
          'End with a working, tested, packaged desktop app you can explain end-to-end.',
        ],
        steps: [
          { title: 'Milestone 1: Scaffold', description: 'Set up the React/TS frontend, Rust backend, and workspace layout — the skeleton every later milestone builds into.' },
          { title: 'Milestone 2: Database', description: 'Design the SQLite schema, write migrations, and build a repository layer that Commands will call into.' },
          { title: 'Milestone 3: Auth', description: 'Store credentials safely, manage session state, and guard specific commands so only an authenticated session can call them.' },
          { title: 'Milestone 4: Commands & State', description: 'Design the full command surface and the shared App State they read/write, including a consistent error-handling strategy.' },
          { title: 'Milestone 5: Events', description: 'Push real-time updates from Rust to the UI as background work progresses, using emit()/listen() instead of polling.' },
          { title: 'Milestone 6: File System & External API', description: 'Read/write local files safely and integrate with an external API from the Rust backend, not the frontend.' },
          { title: 'Milestone 7: Background Tasks', description: 'Run long or scheduled work off the main command path, and coordinate it safely with shared App State.' },
          { title: 'Milestone 8: Security', description: 'Review capabilities and permission scopes, and audit the app for the security issues a real shipped app must avoid.' },
          { title: 'Milestone 9: Testing', description: 'Unit test the pure Rust logic and integration-test the commands built on top of it.' },
          { title: 'Milestone 10: Packaging & Auto-Update', description: 'Produce production builds, understand code signing basics, and ship an auto-updating release.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Sanity-check the architecture',
        questions: [
          {
            id: 'q1',
            prompt: 'In this architecture, which layer should talk directly to SQLite?',
            options: [
              { id: 'a', text: 'The React UI, using a JS SQLite library.' },
              { id: 'b', text: 'The Rust backend (App State / repository layer), via sqlx — the UI only ever goes through Commands.' },
              { id: 'c', text: 'The External API.' },
              { id: 'd', text: 'Auth/Session, bypassing Commands entirely.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'The frontend never touches the database directly — it calls a Command, which reads/writes App State, which is backed by SQLite through sqlx. Keeping the UI ignorant of storage details is what makes the storage layer swappable later.',
          },
          {
            id: 'q2',
            prompt: 'Where does authentication get enforced in this design?',
            options: [
              { id: 'a', text: 'Entirely in the React UI, by hiding buttons for unauthenticated users.' },
              { id: 'b', text: 'At the Tauri Commands layer — Auth/Session guards which commands a given session is allowed to call.' },
              { id: 'c', text: 'Only inside the Background Task Worker.' },
              { id: 'd', text: 'Nowhere — SQLite enforces it via row-level permissions.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Hiding UI elements is a UX nicety, not security — a determined caller could still invoke() a command directly. Real enforcement has to happen on the Rust side, at the command boundary, which is what the Auth/Session → Commands guard edge represents.',
          },
        ],
      },
    ],
  },
}
