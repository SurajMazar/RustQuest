import type { LessonContent } from '../types/lessonContent'

export const tauriIntermediateContent: Record<string, LessonContent> = {
  'tim-commands-invoke': {
    id: 'tim-commands-invoke',
    heroSummary:
      'A deeper look at #[tauri::command] and invoke(): typed arguments, typed returns, async commands, and how Result<T, String> becomes a rejected Promise.',
    dependencyChain: {
      learned: 'The basic Frontend/IPC/Rust round trip, and wired up one command (add_todo) end-to-end.',
      why: 'Real apps need commands with multiple typed arguments, proper error handling, and sometimes async work — not just one toy example.',
      build: 'Fluency with the full command signature shape: arguments, Result returns, async fn, and what each becomes on the JS side.',
      next: 'Pushing data the other direction with events (emit/listen), for updates the frontend didn\'t explicitly ask for.',
    },
    sections: [
      {
        type: 'explain',
        title: 'The round trip, one more time — with the details that matter',
        body: [
          'Recall the architecture: frontend calls invoke(name, args), that crosses IPC to a matching #[tauri::command] fn, which runs in Rust and returns a value that gets serialized back as the resolved value of the frontend\'s Promise.',
          'What we glossed over before: a command\'s arguments can be any type that implements Deserialize (numbers, strings, structs, enums, Vecs — anything serde can decode from JSON), and its return type can be any type that implements Serialize. The object you pass as the second argument to invoke() is matched by field name to the command function\'s parameter names.',
          'Commands can also be async fn — Tauri runs them on its async runtime and awaits them for you, so a slow command (a network call, a database query) won\'t block the whole app. And instead of always returning a bare value, commands very often return Result<T, String>: on Ok, the frontend Promise resolves with T; on Err, the Promise rejects with that String, which you catch with a normal try/catch or .catch(...) in JS.',
        ],
        bullets: [
          'Arguments: any Deserialize type; matched to the JS object\'s keys by name.',
          'Return type: any Serialize type — becomes the resolved value of the Promise.',
          'async fn commands: awaited automatically by Tauri, don\'t block other commands.',
          'Result<T, String> return: Ok(t) → Promise resolves with t. Err(e) → Promise rejects with e.',
        ],
      },
      {
        type: 'diagram',
        title: 'Payloads on the wire',
        description: 'Zooming into just the Frontend ↔ Backend hop, with the actual argument and return payloads shown on the edges.',
        diagram: {
          title: 'invoke(\'greet\', { name }) round trip',
          height: 300,
          frames: [
            {
              caption: 'Frontend calls invoke with a typed argument object.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', x: 30, y: 45, w: 40, h: 22, tone: 'accent', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', x: 75, y: 45, w: 35, h: 22, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'frontend', to: 'backend', label: "invoke('greet', { name: \"Ada\" })", tone: 'accent', animated: true },
              ],
            },
            {
              caption: 'The command receives name: String as a normal typed parameter.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', x: 30, y: 45, w: 40, h: 22, tone: 'default', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: 'fn greet(name: String)', x: 75, y: 45, w: 35, h: 22, tone: 'accent', shape: 'box' },
              ],
              edges: [
                { from: 'frontend', to: 'backend', tone: 'muted' },
              ],
            },
            {
              caption: 'The command returns a String — Tauri serializes it for the trip back.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', x: 30, y: 45, w: 40, h: 22, tone: 'default', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', sublabel: 'returns String', x: 75, y: 45, w: 35, h: 22, tone: 'success', shape: 'box' },
              ],
              edges: [
                { from: 'backend', to: 'frontend', label: '"Hello, Ada!"', tone: 'success', animated: true },
              ],
            },
            {
              caption: 'Frontend\'s Promise resolves with the returned string.',
              nodes: [
                { id: 'frontend', label: 'React / Web Frontend', sublabel: 'Promise resolved: "Hello, Ada!"', x: 30, y: 45, w: 40, h: 22, tone: 'success', shape: 'box' },
                { id: 'backend', label: 'Rust Backend', x: 75, y: 45, w: 35, h: 22, tone: 'default', shape: 'box' },
              ],
              edges: [],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'The greet command in Rust',
        description:
          'This runs inside a real Tauri project, not the online playground — follow along and try it in your own `cargo tauri dev` once you\'ve scaffolded a project.',
        language: 'rust',
        runnable: false,
        code:
`#[tauri::command]
fn greet(name: String) -> String {
    format!("Hello, {}!", name)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`,
      },
      {
        type: 'code',
        title: 'Calling greet from the frontend',
        description: 'Frontend TypeScript calling invoke() — requires a running Tauri app, so this is not runnable here.',
        language: 'typescript',
        runnable: false,
        code:
`import { invoke } from '@tauri-apps/api/core'

const message = await invoke<string>('greet', { name: 'Ada' })
console.log(message) // "Hello, Ada!"`,
      },
      {
        type: 'exercise',
        title: 'Write the pure logic a command would wrap',
        exercise: {
          problem:
            'A real app might have a #[tauri::command] fn calculate_total(prices: Vec<f64>, tax_rate: f64) -> f64 that a checkout screen calls via invoke(). Command wiring can\'t run in this sandbox, but the actual math can — and testing it here is exactly how you\'d unit-test the logic before wrapping it in a command. Write calculate_total so it returns the sum of prices plus tax (sum * (1.0 + tax_rate)), then print the result for the given sample data.',
          starterCode:
`fn calculate_total(prices: Vec<f64>, tax_rate: f64) -> f64 {
    // TODO: sum the prices, then apply tax_rate on top of the sum
    0.0
}

fn main() {
    let prices = vec![19.99, 5.50, 12.25];
    let total = calculate_total(prices, 0.08);
    println!("{:.2}", total);
}`,
          hints: [
            { title: 'Summing a Vec<f64>', body: 'prices.iter().sum::<f64>() gives you the sum of all elements.' },
            { title: 'Applying tax', body: 'Multiply the sum by (1.0 + tax_rate) to add tax_rate as a percentage on top.' },
          ],
          solutionCode:
`fn calculate_total(prices: Vec<f64>, tax_rate: f64) -> f64 {
    let sum: f64 = prices.iter().sum();
    sum * (1.0 + tax_rate)
}

fn main() {
    let prices = vec![19.99, 5.50, 12.25];
    let total = calculate_total(prices, 0.08);
    println!("{:.2}", total);
}`,
          solutionExplanation:
            'Summing with iter().sum() gives the subtotal (37.74), then multiplying by 1.08 applies an 8% tax on top, giving 40.76. This exact function is what a #[tauri::command] would call internally — the command just adds the IPC plumbing around it.',
          expectedOutputContains: ['40.76'],
        },
      },
      {
        type: 'code',
        title: 'Wrapping the pure function in a real command',
        description:
          'This is how the function you just wrote and tested becomes callable from the frontend — Tauri-specific, so not runnable here.',
        language: 'rust',
        runnable: false,
        code:
`fn calculate_total(prices: Vec<f64>, tax_rate: f64) -> f64 {
    let sum: f64 = prices.iter().sum();
    sum * (1.0 + tax_rate)
}

#[tauri::command]
fn checkout_total(prices: Vec<f64>, tax_rate: f64) -> f64 {
    calculate_total(prices, tax_rate)
}`,
      },
      {
        type: 'explain',
        title: 'Async commands and error handling',
        body: [
          'Mark a command async fn and Tauri will await it for you — useful whenever a command does I/O (a database query, an HTTP request) that shouldn\'t block other commands from running while it waits.',
          'For errors, the idiomatic pattern is returning Result<T, String> (or a custom error type that implements Serialize). On the frontend, a rejected command surfaces exactly like a rejected fetch — wrap the invoke() call in try/catch or attach .catch(...).',
        ],
        bullets: [
          'async fn read_config() -> Result<Config, String> — Tauri awaits it automatically.',
          'Ok(value) → frontend Promise resolves with value.',
          'Err(message) → frontend Promise rejects; catch it with try/catch around await invoke(...).',
        ],
      },
      {
        type: 'code',
        title: 'A fallible async command',
        description: 'Tauri-specific async command with Result — requires a running Tauri app, not runnable here.',
        language: 'rust',
        runnable: false,
        code:
`#[tauri::command]
async fn read_config(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("failed to read {}: {}", path, e))
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'How are the fields of the object passed as the second argument to invoke() matched to a command\'s parameters?',
            options: [
              { id: 'a', text: 'By position, in the order they appear in the object.' },
              { id: 'b', text: 'By name — each object key must match a parameter name in the Rust function.' },
              { id: 'c', text: 'They aren\'t matched — the entire object is passed as one JSON blob.' },
              { id: 'd', text: 'By type only, regardless of name.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'invoke(\'greet\', { name: \'Ada\' }) works because the object key name matches the Rust parameter name: fn greet(name: String). Tauri deserializes based on field names.',
          },
          {
            id: 'q2',
            prompt: 'What determines what a JS invoke() call resolves with?',
            options: [
              { id: 'a', text: 'The frontend code decides independently of the backend.' },
              { id: 'b', text: 'Whatever value the Rust command returns, serialized to JSON.' },
              { id: 'c', text: 'It always resolves with undefined; the actual data comes from a separate event.' },
              { id: 'd', text: 'The command\'s function name.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'The command\'s return value is serialized (via Serialize) and delivered back as the resolved value of the Promise the frontend is awaiting.',
          },
          {
            id: 'q3',
            prompt: 'A command returns Result<Config, String>. What happens on the frontend when the command returns Err("file not found")?',
            options: [
              { id: 'a', text: 'invoke() resolves with the string "file not found" as if it were a success.' },
              { id: 'b', text: 'invoke() throws/rejects, so the error is caught by try/catch or .catch(...).' },
              { id: 'c', text: 'The app crashes.' },
              { id: 'd', text: 'Nothing happens — errors from Result are silently dropped.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Err(...) from a command maps to a rejected Promise on the JS side — exactly the same pattern as a rejected fetch, so normal JS error handling applies.',
          },
          {
            id: 'q4',
            prompt: 'Why would you mark a command async fn instead of a plain fn?',
            options: [
              { id: 'a', text: 'async fn commands run faster for pure CPU-bound math.' },
              { id: 'b', text: 'It lets the command perform I/O (network, file, DB) without blocking other commands while waiting.' },
              { id: 'c', text: 'It is required for any command that takes arguments.' },
              { id: 'd', text: 'It changes what type the frontend receives back.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'async fn commands are awaited by Tauri\'s runtime, which frees up the executor to keep handling other work while an I/O-bound command is waiting — plain synchronous commands would block that thread.',
          },
        ],
      },
    ],
  },

  'tim-events': {
    id: 'tim-events',
    heroSummary: 'Beyond request/response: emit() lets Rust push updates to the frontend whenever it wants, and listen() lets the frontend react to them.',
    dependencyChain: {
      learned: 'The invoke()/command round trip for frontend-initiated calls into Rust.',
      why: 'Not everything fits request/response — background progress, file-watcher changes, or timers need Rust to speak first.',
      build: 'The emit/listen pair for backend-to-frontend pushes, complementing the invoke()/command pair you already know.',
      next: 'Sharing mutable data safely across every command with tauri::State<T>, and the IPC internals underneath both patterns.',
    },
    sections: [
      {
        type: 'explain',
        title: 'When Rust needs to speak first',
        body: [
          'invoke() is always frontend-initiated: the UI asks, Rust answers. But some updates don\'t have a clean "ask" — a long-running task reporting progress every few seconds, or a file-watcher noticing a change on disk. For those, Tauri has an event system: the backend emits a named event with a payload, and any number of frontend listeners can react to it whenever it arrives.',
          'Events are fire-and-forget from Rust\'s side — emit() doesn\'t wait for a response the way a command\'s return value does. Any number of frontend listen() calls (or zero) can be attached to the same event name.',
        ],
        bullets: [
          'emit (Rust) — push a named event with any Serialize payload to listening windows.',
          'listen (JS) — register a callback that fires every time that named event arrives.',
          'No response expected: unlike commands, emitting is one-directional.',
        ],
      },
      {
        type: 'code',
        title: 'Emitting progress from Rust',
        description: 'Tauri-specific — needs a running app with a window handle, not runnable here.',
        language: 'rust',
        runnable: false,
        code:
`#[tauri::command]
fn start_import(app_handle: tauri::AppHandle) {
    // ... kick off work, then periodically:
    app_handle.emit("progress", 42).unwrap();
}`,
      },
      {
        type: 'code',
        title: 'Listening for progress in React',
        description: 'Frontend TypeScript — requires the Tauri runtime, not runnable here.',
        language: 'typescript',
        runnable: false,
        code:
`import { listen } from '@tauri-apps/api/event'

const unlisten = await listen<number>('progress', (event) => {
  console.log('progress:', event.payload)
})

// later, when the component unmounts:
unlisten()`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'How does the emit/listen pattern differ from invoke/command?',
            options: [
              { id: 'a', text: 'They are identical — emit is just an alias for invoke.' },
              { id: 'b', text: 'emit/listen lets Rust push updates to the frontend without the frontend asking first; invoke/command is always frontend-initiated.' },
              { id: 'c', text: 'listen() can only be used once per app.' },
              { id: 'd', text: 'emit() requires the frontend to send a request first.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'invoke() always starts on the frontend and expects a response. emit() lets the backend send data whenever it wants, with any number of listen() callbacks reacting on the frontend side.',
          },
        ],
      },
    ],
  },
}
