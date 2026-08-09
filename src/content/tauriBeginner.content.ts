import type { LessonContent } from '../types/lessonContent'

export const tauriBeginnerContent: Record<string, LessonContent> = {
  'tb-what-is-tauri': {
    id: 'tb-what-is-tauri',
    heroSummary:
      'Tauri lets you build a desktop app with a web-tech UI and a Rust backend, rendered by the OS\'s own webview instead of a bundled browser.',
    dependencyChain: {
      learned: 'You know Rust fundamentals (ownership, structs, error handling) from the Rust track.',
      why: 'That Rust knowledge is about to power a real desktop app — Tauri is where "systems Rust" meets everyday UI work.',
      build: 'A mental model of Tauri\'s two-layer architecture: a web frontend for UI, a Rust backend for everything else.',
      next: 'Tauri\'s layered architecture and the IPC bridge that connects the two layers.',
    },
    sections: [
      {
        type: 'explain',
        title: 'A desktop app, built like a website, running like a native app',
        body: [
          'Tauri apps look and behave like normal desktop apps, but the UI is written in HTML/CSS/JS (often React, like this app). The difference from something like Electron is where that UI actually runs.',
          'Electron ships its own copy of Chromium inside every app, so every Electron app carries a full browser engine as baggage — often 100MB+ before you\'ve written a line of your own code. Tauri instead asks the operating system to render the UI using the webview the OS already has installed (WebView2 on Windows, WKWebView on macOS, WebKitGTK on Linux).',
          'Everything that isn\'t "draw the UI" — file access, databases, background work, OS integration — is written in Rust and runs as a real native process. The web frontend talks to that Rust backend over a message-passing bridge called IPC, which is the subject of the next lesson.',
        ],
        bullets: [
          'Frontend: HTML/CSS/JS (React, Vue, Svelte, or plain JS) — purely presentation and interaction.',
          'Backend: Rust — file system, OS APIs, business logic, anything performance- or security-sensitive.',
          'No bundled browser engine: the OS webview does the rendering, so the shipped binary is small.',
          'Rust\'s memory safety and lack of a garbage collector mean the backend is both fast and hard to crash.',
        ],
        callout: {
          tone: 'accent',
          text: 'Rule of thumb: if it touches pixels, it\'s frontend. If it touches the disk, network, or OS, it\'s a Rust command.',
        },
      },
      {
        type: 'compare',
        title: 'Electron vs. Tauri',
        columns: [
          {
            heading: 'Electron',
            body: [
              'Bundle size: ~100-150MB baseline, because a full Chromium build ships inside every app.',
              'Memory usage: heavy — each app runs its own Chromium + Node.js process, often 200MB+ idle.',
              'Backend language: Node.js/JavaScript.',
              'Rendering engine: bundled Chromium, identical on every OS, but duplicated per app.',
            ],
          },
          {
            heading: 'Tauri',
            body: [
              'Bundle size: often 3-10MB, since no browser engine is bundled — just your code.',
              'Memory usage: light — reuses the OS webview process the system already manages.',
              'Backend language: Rust (compiled, no runtime/GC overhead).',
              'Rendering engine: the OS-native webview (WebView2 / WKWebView / WebKitGTK) — slight rendering differences across OSes, in exchange for a much smaller app.',
            ],
          },
        ],
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why are Tauri apps typically far smaller than Electron apps?',
            options: [
              { id: 'a', text: 'Tauri apps don\'t need a UI framework like React.' },
              { id: 'b', text: 'Tauri uses the OS\'s existing webview instead of bundling a full Chromium browser engine.' },
              { id: 'c', text: 'Tauri compresses the frontend JavaScript more aggressively.' },
              { id: 'd', text: 'Tauri apps can only render plain text, not full HTML/CSS.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Electron bundles an entire Chromium browser inside every app. Tauri instead delegates rendering to the webview the operating system already provides, so there\'s no browser engine to ship.',
          },
          {
            id: 'q2',
            prompt: 'What does "uses the OS webview" mean in practice?',
            options: [
              { id: 'a', text: 'The app opens the user\'s default browser in a separate window.' },
              { id: 'b', text: 'The UI is rendered by a system-provided component (WebView2, WKWebView, WebKitGTK) instead of a bundled rendering engine.' },
              { id: 'c', text: 'The app requires an internet connection to render its UI.' },
              { id: 'd', text: 'The UI is rendered entirely by Rust with no HTML involved.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Windows, macOS, and Linux each ship a native webview component. Tauri hosts your HTML/CSS/JS inside that component rather than embedding its own browser.',
          },
          {
            id: 'q3',
            prompt: 'In a Tauri app, which layer is responsible for reading and writing files on disk?',
            options: [
              { id: 'a', text: 'The React/web frontend, using browser file APIs.' },
              { id: 'b', text: 'The Rust backend, typically via a command the frontend invokes.' },
              { id: 'c', text: 'The OS webview component directly.' },
              { id: 'd', text: 'Neither — Tauri apps cannot access the file system.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Browsers deliberately can\'t touch the file system for security reasons. Tauri\'s Rust backend runs as a native process and can, so file access is exposed to the frontend through IPC commands.',
          },
        ],
      },
    ],
  },

  'tb-architecture': {
    id: 'tb-architecture',
    heroSummary:
      'Every Tauri app is three layers talking in one direction and back: the web frontend, an IPC bridge, and a Rust backend that can reach the OS.',
    dependencyChain: {
      learned: 'What Tauri is and why it\'s smaller/lighter than Electron-style apps.',
      why: 'Before writing any code, you need the mental map of how a click in the UI turns into real work in Rust and a result flowing back.',
      build: 'The layered architecture — Frontend, IPC, Rust Backend, OS — and the round trip a single user action takes through it.',
      next: 'Scaffolding a real Tauri project and building your first command end-to-end in the Todo Desktop App project.',
    },
    sections: [
      {
        type: 'diagram',
        title: 'The Tauri round trip: click to disk and back',
        description:
          'Watch one user action travel down through IPC into Rust, out to the OS, and the result travel back up as a resolved Promise.',
        diagram: {
          title: 'Frontend, IPC & Rust Backend',
          description: 'Three layers: React/Web Frontend, Rust Backend, OS / Files / DB — connected by the IPC bridge.',
          height: 380,
          frames: [
            {
              caption: 'At rest: three layers stacked, nothing happening yet.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', sublabel: 'HTML, CSS, JS', x: 50, y: 15, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: '#[tauri::command] fns', x: 50, y: 50, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'os', label: 'OS / Files / DB', sublabel: 'filesystem, network, native APIs', x: 50, y: 85, w: 60, h: 18, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'frontend', to: 'backend', label: 'IPC', tone: 'muted' },
                { from: 'backend', to: 'os', tone: 'muted' },
              ],
            },
            {
              caption: 'User clicks a button — the frontend has work to hand off.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', sublabel: 'onClick fires', x: 50, y: 15, w: 60, h: 18, tone: 'accent', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: '#[tauri::command] fns', x: 50, y: 50, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'os', label: 'OS / Files / DB', sublabel: 'filesystem, network, native APIs', x: 50, y: 85, w: 60, h: 18, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'frontend', to: 'backend', label: 'IPC', tone: 'muted' },
                { from: 'backend', to: 'os', tone: 'muted' },
              ],
            },
            {
              caption: 'The IPC hop: invoke(\'save_file\') carries serialized arguments across the bridge.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', sublabel: 'awaiting response...', x: 50, y: 15, w: 60, h: 18, tone: 'accent', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: '#[tauri::command] fns', x: 50, y: 50, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'os', label: 'OS / Files / DB', sublabel: 'filesystem, network, native APIs', x: 50, y: 85, w: 60, h: 18, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'frontend', to: 'backend', label: "invoke('save_file')", tone: 'accent', animated: true },
                { from: 'backend', to: 'os', tone: 'muted' },
              ],
            },
            {
              caption: 'The matching Rust command runs and asks the OS to do the real work.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', sublabel: 'awaiting response...', x: 50, y: 15, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: 'fn save_file(...) runs', x: 50, y: 50, w: 60, h: 18, tone: 'accent', shape: 'box' },
                { id: 'os', label: 'OS / Files / DB', sublabel: 'filesystem, network, native APIs', x: 50, y: 85, w: 60, h: 18, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'frontend', to: 'backend', tone: 'muted' },
                { from: 'backend', to: 'os', label: 'fs::write(...)', tone: 'accent', animated: true },
              ],
            },
            {
              caption: 'The OS confirms the write succeeded — the result starts flowing back up.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', sublabel: 'awaiting response...', x: 50, y: 15, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: 'fn save_file(...) runs', x: 50, y: 50, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'os', label: 'OS / Files / DB', sublabel: 'write complete', x: 50, y: 85, w: 60, h: 18, tone: 'success', shape: 'box' },
              ],
              edges: [
                { from: 'frontend', to: 'backend', tone: 'muted' },
                { from: 'os', to: 'backend', label: 'Ok(())', tone: 'success', animated: true },
              ],
            },
            {
              caption: 'Backend serializes the result back over IPC — the frontend\'s Promise resolves.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', sublabel: 'Promise resolved — UI updates', x: 50, y: 15, w: 60, h: 18, tone: 'success', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: '#[tauri::command] fns', x: 50, y: 50, w: 60, h: 18, tone: 'default', shape: 'box' },
                { id: 'os', label: 'OS / Files / DB', sublabel: 'filesystem, network, native APIs', x: 50, y: 85, w: 60, h: 18, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'backend', to: 'frontend', label: 'Promise resolves', tone: 'success', animated: true },
                { from: 'backend', to: 'os', tone: 'muted' },
              ],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'Naming the three hops',
        body: [
          'The round trip you just watched has three named parts, and knowing the vocabulary makes every later Tauri lesson click faster.',
          'First, invoke() is the IPC call — the frontend function you call from JS/TS to ask Rust to do something, by name, with arguments. Second, a command is the Rust function on the other end, marked with #[tauri::command], that actually receives those arguments and does the work. Third, the response: whatever the Rust function returns gets serialized and sent back across the bridge, which is why calling invoke() from JS always gives you back a Promise — the answer isn\'t instant, it has to cross a process boundary.',
        ],
        bullets: [
          'invoke(name, args) — frontend-side, starts the IPC call and returns a Promise.',
          '#[tauri::command] fn name(...) — backend-side, the Rust function that handles that specific call.',
          'Return value — serialized to JSON and delivered back as the value the Promise resolves with (or rejects with, on error).',
        ],
        callout: {
          tone: 'muted',
          text: 'Nothing in the frontend can read files, spawn processes, or touch the network directly — every one of those capabilities is reached by naming a Rust command and invoking it.',
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does invoke(\'save_file\', { path }) do from the frontend\'s perspective?',
            options: [
              { id: 'a', text: 'It directly calls a JavaScript function named save_file in the same process.' },
              { id: 'b', text: 'It starts an IPC call to a Rust command named save_file and returns a Promise for the result.' },
              { id: 'c', text: 'It writes the file immediately using a browser API.' },
              { id: 'd', text: 'It only works if the Rust backend is running as root.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'invoke() is the frontend-side entry point into IPC. It sends the command name and arguments across the bridge and gives you back a Promise that settles once Rust responds.',
          },
          {
            id: 'q2',
            prompt: 'Why does invoke() always return a Promise, even for very fast Rust commands?',
            options: [
              { id: 'a', text: 'Because JavaScript requires all functions to be async.' },
              { id: 'b', text: 'Because the call crosses a process boundary via IPC, so the result can never be available synchronously.' },
              { id: 'c', text: 'Because Rust commands are always slow.' },
              { id: 'd', text: 'Promises are only used for error cases, not normal results.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Even a trivial Rust command still has to be serialized, sent over IPC, executed, and have its response serialized back — that round trip is inherently asynchronous from the frontend\'s point of view.',
          },
          {
            id: 'q3',
            prompt: 'In the diagram, what does the edge labeled fs::write(...) represent?',
            options: [
              { id: 'a', text: 'The frontend directly writing to disk.' },
              { id: 'b', text: 'The Rust backend asking the OS to perform the actual file write.' },
              { id: 'c', text: 'The IPC bridge serializing the request.' },
              { id: 'd', text: 'A background task unrelated to the current invoke() call.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Once the command function is running in Rust, it can call real OS-level APIs like fs::write — this is the "Rust Backend → OS" hop, distinct from the IPC hop above it.',
          },
        ],
      },
    ],
  },

  'tb-proj-todo-desktop': {
    id: 'tb-proj-todo-desktop',
    heroSummary:
      'Build a real, minimal Todo desktop app: a Rust command that stores todos in shared state, and a React frontend that calls it with invoke().',
    dependencyChain: {
      learned: 'The Frontend / IPC / Rust Backend architecture and the invoke() → command → response round trip.',
      why: 'Reading about IPC only goes so far — wiring up one real command end-to-end is what makes it click.',
      build: 'A working #[tauri::command] that mutates shared state, registered with the app, and called from a React component.',
      next: 'Deeper command patterns: typed arguments, error handling with Result, and async commands.',
    },
    sections: [
      {
        type: 'project-steps',
        title: 'Project: Todo Desktop App',
        goals: [
          'Scaffold a Tauri + React project (via `cargo tauri dev` / `create-tauri-app`).',
          'Define a #[tauri::command] fn add_todo(...) that appends to a shared list.',
          'Register that command with tauri::Builder so the frontend is allowed to call it.',
          'Call the command from React using invoke() and render the returned list.',
        ],
        steps: [
          {
            title: 'Define the command',
            description:
              'Write a Rust command that takes the new todo text, appends it to state shared across every call, and returns the updated list so the frontend always has the full picture.',
            code:
`#[tauri::command]
fn add_todo(state: tauri::State<TodoState>, text: String) -> Vec<String> {
    let mut todos = state.0.lock().unwrap();
    todos.push(text);
    todos.clone()
}`,
          },
          {
            title: 'Hold the todos in shared state',
            description:
              'TodoState wraps a Mutex<Vec<String>> so multiple command calls can safely read and mutate the same list. It\'s registered once with .manage(...) when the app is built.',
            code:
`struct TodoState(std::sync::Mutex<Vec<String>>);

fn main() {
    tauri::Builder::default()
        .manage(TodoState(std::sync::Mutex::new(Vec::new())))
        .invoke_handler(tauri::generate_handler![add_todo])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`,
          },
          {
            title: 'Call it from React',
            description:
              'From the frontend, invoke(\'add_todo\', { text }) sends the new todo text over IPC and resolves with the updated list, which you can drop straight into component state.',
            code:
`import { invoke } from '@tauri-apps/api/core'

async function addTodo(text: string) {
  const todos = await invoke<string[]>('add_todo', { text })
  setTodos(todos)
}`,
          },
          {
            title: 'Render the list',
            description:
              'Keep a simple todos: string[] state in React, call addTodo() from a form submit handler, and map over todos to render them. No Rust changes needed for this step — it\'s plain React.',
          },
        ],
      },
      {
        type: 'code',
        title: 'Full backend setup',
        description:
          'This runs inside a real Tauri project, not the online playground — follow along and try it in your own `cargo tauri dev` once you\'ve scaffolded a project.',
        language: 'rust',
        runnable: false,
        code:
`use std::sync::Mutex;
use tauri::State;

struct TodoState(Mutex<Vec<String>>);

#[tauri::command]
fn add_todo(state: State<TodoState>, text: String) -> Vec<String> {
    let mut todos = state.0.lock().unwrap();
    todos.push(text);
    todos.clone()
}

#[tauri::command]
fn get_todos(state: State<TodoState>) -> Vec<String> {
    state.0.lock().unwrap().clone()
}

fn main() {
    tauri::Builder::default()
        .manage(TodoState(Mutex::new(Vec::new())))
        .invoke_handler(tauri::generate_handler![add_todo, get_todos])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`,
      },
      {
        type: 'code',
        title: 'Full frontend component',
        description:
          'Frontend TypeScript calling invoke() — this needs a running Tauri app to execute, so it is not runnable here.',
        language: 'typescript',
        runnable: false,
        code:
`import { useState } from 'react'
import { invoke } from '@tauri-apps/api/core'

export function TodoApp() {
  const [todos, setTodos] = useState<string[]>([])
  const [text, setText] = useState('')

  async function handleAdd() {
    if (!text.trim()) return
    const updated = await invoke<string[]>('add_todo', { text })
    setTodos(updated)
    setText('')
  }

  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleAdd}>Add Todo</button>
      <ul>
        {todos.map((t, i) => <li key={i}>{t}</li>)}
      </ul>
    </div>
  )
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does add_todo take a tauri::State<TodoState> parameter?',
            options: [
              { id: 'a', text: 'It\'s required boilerplate that every command must include.' },
              { id: 'b', text: 'It gives the command access to data shared across every invocation, registered once via .manage(...).' },
              { id: 'c', text: 'It tells Tauri which frontend component called the command.' },
              { id: 'd', text: 'It replaces the need for a Mutex.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'State<T> is how Tauri injects app-wide shared data into a command. It doesn\'t replace the Mutex — the Mutex is still what makes mutation from multiple calls safe.',
          },
          {
            id: 'q2',
            prompt: 'What must happen before a command like add_todo can be called from the frontend?',
            options: [
              { id: 'a', text: 'It must be listed in tauri::generate_handler![...] when building the app.' },
              { id: 'b', text: 'It must be marked async.' },
              { id: 'c', text: 'It must return a String.' },
              { id: 'd', text: 'Nothing — any #[tauri::command] fn is automatically callable.' },
            ],
            correctOptionIds: ['a'],
            explanation:
              'A function decorated with #[tauri::command] still has to be registered in generate_handler![...] (passed to .invoke_handler(...)) or the frontend\'s invoke() call for it will fail.',
          },
          {
            id: 'q3',
            prompt: 'On the frontend, what does `await invoke<string[]>(\'add_todo\', { text })` return once it resolves?',
            options: [
              { id: 'a', text: 'Nothing — invoke() calls are fire-and-forget.' },
              { id: 'b', text: 'The value returned by the Rust command — here, the updated Vec<String> of todos, as a JS array.' },
              { id: 'c', text: 'A raw JSON string that must be parsed manually.' },
              { id: 'd', text: 'The previous state of the TodoState struct before this call.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Whatever the Rust command returns is serialized and delivered as the resolved value of the Promise — the generic <string[]> just tells TypeScript what shape to expect.',
          },
        ],
      },
    ],
  },
}
