import type { Level } from '../../types/curriculum'

export const tauriIntermediate: Level = {
  id: 'tauri-intermediate',
  order: 5,
  title: 'Tauri — Intermediate',
  shortTitle: 'Tauri Intermediate',
  subtitle: 'Commands, events, windows, and real OS integration',
  description:
    'Go beyond a single command: structured arguments and return values, events flowing both directions, app state shared across commands, windows, menus, system tray, and talking to the file system, HTTP, and SQLite from Rust.',
  color: 'teal',
  icon: 'Layers',
  chapters: [
    {
      id: 'commands-and-communication',
      title: 'Commands & Communication',
      description: 'The invoke() bridge in depth — arguments, return values, and errors.',
      lessons: [
        {
          id: 'tim-commands-invoke',
          title: 'Tauri Commands & invoke()',
          kind: 'concept',
          difficulty: 'intermediate',
          summary: 'Define a Rust command, call it from JavaScript, and pass data both directions — with a hands-on exercise.',
          estMinutes: 24,
          status: 'full',
          topics: ['#[tauri::command]', 'invoke() from JS/TS', 'Arguments', 'Return values', 'Async commands preview', 'Error handling across IPC'],
          prerequisites: ['tb-proj-todo-desktop'],
          unlocks: 'Every backend feature in the rest of the course is exposed through this exact pattern.',
          why: 'This is the single most-used API surface in a Tauri app — once it\'s automatic, building features becomes about Rust logic, not plumbing.',
        },
        {
          id: 'tim-events',
          title: 'Events: Backend → Frontend & Back',
          kind: 'concept',
          difficulty: 'intermediate',
          summary: 'Push updates from Rust to the UI without waiting for a request.',
          estMinutes: 18,
          status: 'stub',
          topics: ['emit() from Rust', 'listen() in JS', 'Global vs window-scoped events', 'Event payloads'],
          prerequisites: ['tim-commands-invoke'],
        },
        {
          id: 'tim-state-management',
          title: 'State Management',
          kind: 'concept',
          difficulty: 'intermediate',
          summary: 'Share Rust state safely across commands with Tauri\'s managed State.',
          estMinutes: 20,
          status: 'stub',
          topics: ['tauri::State', 'Mutex-wrapped app state', 'Setup hooks', 'Shared connections/config'],
          prerequisites: ['tim-commands-invoke'],
        },
      ],
    },
    {
      id: 'windows-and-native-ui',
      title: 'Windows & Native UI',
      description: 'Multiple windows, menus, tray icons, notifications, and dialogs.',
      lessons: [
        { id: 'tim-window-management', title: 'Window Management & Multiple Windows', kind: 'concept', difficulty: 'intermediate', summary: 'Create, position, and communicate between multiple app windows.', estMinutes: 18, status: 'stub', topics: ['WindowBuilder', 'Multiple windows', 'Window events', 'Inter-window communication'], prerequisites: ['tim-state-management'] },
        { id: 'tim-menus-tray', title: 'Menus & System Tray', kind: 'concept', difficulty: 'intermediate', summary: 'Native application menus and a system tray icon with its own menu.', estMinutes: 16, status: 'stub', topics: ['App menus', 'System tray', 'Tray events'], prerequisites: ['tim-window-management'] },
        { id: 'tim-notifications-dialogs', title: 'Notifications & Dialogs', kind: 'concept', difficulty: 'intermediate', summary: 'Native OS notifications, and file/message dialogs.', estMinutes: 14, status: 'stub', topics: ['Notification API', 'Open/save dialogs', 'Message boxes'], prerequisites: ['tim-window-management'] },
      ],
    },
    {
      id: 'system-integration',
      title: 'System Integration',
      description: 'File system, HTTP, plugins, permissions, and persistent storage.',
      lessons: [
        { id: 'tim-fs-http', title: 'File System & HTTP from Rust', kind: 'concept', difficulty: 'intermediate', summary: 'Read/write files and make HTTP requests from your Tauri backend.', estMinutes: 18, status: 'stub', topics: ['fs plugin', 'http plugin', 'Async I/O in commands'], prerequisites: ['tim-commands-invoke'] },
        { id: 'tim-plugins-permissions', title: 'Plugins & Permissions', kind: 'concept', difficulty: 'intermediate', summary: 'Extending Tauri with official and custom plugins, gated by the permission system.', estMinutes: 18, status: 'stub', topics: ['Official plugins', 'Adding a plugin', 'Capabilities & permissions basics'], prerequisites: ['tim-fs-http'] },
        { id: 'tim-persistent-storage-sqlite', title: 'Persistent Storage & SQLite', kind: 'concept', difficulty: 'intermediate', summary: 'Give your app a real embedded database.', estMinutes: 22, status: 'stub', topics: ['tauri-plugin-sql', 'SQLite schema & migrations', 'Querying from commands'], prerequisites: ['tim-plugins-permissions'] },
      ],
    },
    {
      id: 'tauri-intermediate-projects',
      title: 'Intermediate Tauri Projects',
      description: 'Four projects that combine commands, events, and real persistence.',
      lessons: [
        { id: 'tim-proj-markdown-editor', title: 'Project: Markdown Editor', kind: 'project', difficulty: 'intermediate', summary: 'Live-preview Markdown editor with file open/save.', estMinutes: 60, status: 'stub', topics: ['File dialogs', 'Live preview', 'Unsaved-changes state'], prerequisites: ['tim-notifications-dialogs'] },
        { id: 'tim-proj-file-manager', title: 'Project: File Manager', kind: 'project', difficulty: 'intermediate', summary: 'Browse, rename, and organize files with a native-feeling UI.', estMinutes: 60, status: 'stub', topics: ['Directory traversal', 'File operations', 'Context menus'], prerequisites: ['tim-fs-http'] },
        { id: 'tim-proj-api-client', title: 'Project: API Client', kind: 'project', difficulty: 'intermediate', summary: 'A Postman-style tool for firing HTTP requests and inspecting responses.', estMinutes: 60, status: 'stub', topics: ['HTTP from Rust', 'Request history', 'Response formatting'], prerequisites: ['tim-fs-http'] },
        { id: 'tim-proj-sqlite-app', title: 'Project: SQLite Application', kind: 'project', difficulty: 'intermediate', summary: 'A CRUD app backed by a real embedded database.', estMinutes: 65, status: 'stub', topics: ['Schema design', 'CRUD commands', 'Migrations on startup'], prerequisites: ['tim-persistent-storage-sqlite'] },
      ],
    },
  ],
}
