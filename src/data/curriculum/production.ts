import type { Level } from '../../types/curriculum'

export const production: Level = {
  id: 'production',
  order: 7,
  title: 'Production Projects',
  shortTitle: 'Production',
  subtitle: 'Ship something real — culminating in a full capstone application',
  description:
    'The final stage. Every project here is production-shaped, and the course ends with one complete capstone: a React/TypeScript + Tauri + Rust + SQLite application with authentication, background tasks, and a real release pipeline — broken into taught milestones, not dumped as a finished codebase.',
  color: 'emerald',
  icon: 'Rocket',
  chapters: [
    {
      id: 'capstone-milestones',
      title: 'Final Capstone: Production Desktop App',
      description: 'React/TypeScript + Tauri + Rust + SQLite, built milestone by milestone — each one taught before it\'s implemented.',
      lessons: [
        {
          id: 'cap-overview',
          title: 'Capstone Overview & Architecture',
          kind: 'overview',
          difficulty: 'advanced',
          summary: 'What we\'re building, why each piece exists, and the milestone roadmap.',
          estMinutes: 15,
          status: 'full',
          topics: ['Feature scope', 'System architecture diagram', 'Milestone roadmap', 'Tech stack rationale'],
          prerequisites: ['tad-proj-native-backend-app'],
          unlocks: 'Every milestone below.',
          why: 'A capstone without a map turns into a codebase you copy instead of a system you understand.',
        },
        { id: 'cap-m1-scaffold', title: 'Milestone 1: Project Scaffold & Architecture', kind: 'milestone', difficulty: 'advanced', summary: 'Set up the React/TS frontend, Rust backend, and workspace layout.', estMinutes: 30, status: 'stub', topics: ['Workspace layout', 'Frontend/backend boundary', 'Shared types strategy'], prerequisites: ['cap-overview'] },
        { id: 'cap-m2-database', title: 'Milestone 2: Database Layer (SQLite)', kind: 'milestone', difficulty: 'advanced', summary: 'Schema, migrations, and a repository layer over SQLite.', estMinutes: 40, status: 'stub', topics: ['Schema design', 'Migrations', 'Repository pattern'], prerequisites: ['cap-m1-scaffold'] },
        { id: 'cap-m3-auth', title: 'Milestone 3: Authentication', kind: 'milestone', difficulty: 'advanced', summary: 'Login, session storage, and protecting commands.', estMinutes: 40, status: 'stub', topics: ['Credential storage', 'Session state', 'Guarded commands'], prerequisites: ['cap-m2-database'] },
        { id: 'cap-m4-commands-state', title: 'Milestone 4: Commands, State & IPC', kind: 'milestone', difficulty: 'advanced', summary: 'The full command surface and shared app state design.', estMinutes: 40, status: 'stub', topics: ['Command modules', 'App state', 'Error handling strategy'], prerequisites: ['cap-m3-auth'] },
        { id: 'cap-m5-events-realtime', title: 'Milestone 5: Events & Real-Time Updates', kind: 'milestone', difficulty: 'advanced', summary: 'Push updates from Rust to the UI as background work completes.', estMinutes: 35, status: 'stub', topics: ['Event architecture', 'Background task events'], prerequisites: ['cap-m4-commands-state'] },
        { id: 'cap-m6-filesystem-api', title: 'Milestone 6: File System & External API Communication', kind: 'milestone', difficulty: 'advanced', summary: 'Reading/writing local files and talking to an external API.', estMinutes: 35, status: 'stub', topics: ['fs access', 'HTTP client in Rust', 'Rate limiting/retries'], prerequisites: ['cap-m5-events-realtime'] },
        { id: 'cap-m7-background-tasks', title: 'Milestone 7: Background Tasks', kind: 'milestone', difficulty: 'advanced', summary: 'Long-running and scheduled work off the main command path.', estMinutes: 35, status: 'stub', topics: ['Background workers', 'Task scheduling', 'Cancellation'], prerequisites: ['cap-m6-filesystem-api'] },
        { id: 'cap-m8-security', title: 'Milestone 8: Security Hardening', kind: 'milestone', difficulty: 'advanced', summary: 'Capabilities, permission scopes, and a security review pass.', estMinutes: 30, status: 'stub', topics: ['Capability config', 'Permission audit', 'CSP review'], prerequisites: ['cap-m7-background-tasks'] },
        { id: 'cap-m9-testing', title: 'Milestone 9: Testing', kind: 'milestone', difficulty: 'advanced', summary: 'Unit tests for Rust logic, integration tests for commands.', estMinutes: 35, status: 'stub', topics: ['Unit tests', 'Command integration tests', 'CI basics'], prerequisites: ['cap-m8-security'] },
        { id: 'cap-m10-packaging-updates', title: 'Milestone 10: Packaging, Auto-Update & Release', kind: 'milestone', difficulty: 'advanced', summary: 'Production builds, code signing basics, and shipping updates.', estMinutes: 35, status: 'stub', topics: ['tauri build targets', 'Auto-updater', 'Release checklist'], prerequisites: ['cap-m9-testing'] },
        { id: 'cap-final', title: 'Capstone Complete: What You Can Build Now', kind: 'overview', difficulty: 'advanced', summary: 'A retrospective on the whole course, and where to go from here.', estMinutes: 10, status: 'stub', topics: ['Skills recap', 'Suggested next projects', 'Further reading'], prerequisites: ['cap-m10-packaging-updates'] },
      ],
    },
  ],
}
