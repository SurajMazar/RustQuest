import type { LessonContent } from '../types/lessonContent'

export const tauriAdvancedContent: Record<string, LessonContent> = {
  'tad-ipc-internals': {
    id: 'tad-ipc-internals',
    heroSummary:
      'Underneath invoke() and #[tauri::command] is a serialize-send-deserialize-run-serialize pipeline — and tauri::State<T> is how commands share data safely across that pipeline.',
    dependencyChain: {
      learned: 'The observable behavior of commands and events: invoke()/command for requests, emit()/listen() for pushes, plus async commands and Result-based errors.',
      why: 'Knowing the API surface gets you far, but understanding what actually crosses the process boundary — and how to safely share state across every call — is what separates "it works" from "I know why it works".',
      build: 'A precise model of the IPC pipeline (serialize → route → run → deserialize) and how State<T> plugs shared, mutex-guarded data into that pipeline, tying back to Mutex/Arc from the Rust Advanced track.',
      next: 'Applying this directly in the capstone: real App State, a database layer, and commands that are actually production-shaped.',
    },
    sections: [
      {
        type: 'explain',
        title: 'What invoke() actually does under the hood',
        body: [
          'When you call invoke(\'greet\', { name: \'Ada\' }), the arguments object is serialized to JSON right there in the webview, then sent across the webview\'s message channel to the Rust side — this is the actual IPC transport, a message-passing channel between the webview process and your Rust process, not a network call.',
          'Tauri Core receives that message, looks up which registered command matches the name "greet" (this is the command router, built from tauri::generate_handler![...]), and hands the raw JSON arguments to it. Before your command function body ever runs, serde deserializes that JSON into the actual Rust parameter types your function declared — this is exactly why every command argument type must implement Deserialize, and every return type must implement Serialize: the whole pipeline is built on serde doing that conversion in both directions.',
          'Once deserialized, your command function runs as ordinary Rust. Whatever it returns gets serialized back to JSON by the same mechanism, sent back across the channel, and deserialized one final time on the JS side into the value your Promise resolves with.',
        ],
        bullets: [
          'Serialize (JS → JSON): arguments object becomes a JSON payload.',
          'Command router: matches the invoked name to a registered #[tauri::command] fn.',
          'Deserialize (JSON → Rust): serde builds your typed parameters from the JSON.',
          'Your command runs, produces a typed return value (or Result<T, E>).',
          'Serialize (Rust → JSON) and one final deserialize (JSON → JS) deliver the result to the Promise.',
        ],
        callout: {
          tone: 'accent',
          text: 'This is why a command\'s signature is a real contract: every type in it must round-trip through JSON via serde, in both directions.',
        },
      },
      {
        type: 'diagram',
        title: 'One invoke() call, traced hop by hop',
        description: 'The same round trip you\'ve seen before, but with serialize/deserialize surfaced as explicit steps rather than glossed over.',
        diagram: {
          title: 'IPC internals',
          height: 420,
          frames: [
            {
              caption: 'JS calls invoke() with a plain arguments object.',
              nodes: [
                { id: 'js', label: 'JS invoke()', x: 15, y: 10, w: 26, h: 14, tone: 'accent', shape: 'box' },
                { id: 'ser', label: 'Serialize (JSON)', x: 15, y: 32, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'router', label: 'Tauri Core / Command Router', x: 50, y: 55, w: 34, h: 14, tone: 'default', shape: 'box' },
                { id: 'cmd', label: 'Your #[tauri::command] fn', x: 15, y: 78, w: 30, h: 14, tone: 'default', shape: 'box' },
                { id: 'deser', label: 'Deserialize response', x: 78, y: 78, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [],
            },
            {
              caption: 'The arguments object is serialized to a JSON payload.',
              nodes: [
                { id: 'js', label: 'JS invoke()', x: 15, y: 10, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'ser', label: 'Serialize (JSON)', x: 15, y: 32, w: 26, h: 14, tone: 'accent', shape: 'box' },
                { id: 'router', label: 'Tauri Core / Command Router', x: 50, y: 55, w: 34, h: 14, tone: 'default', shape: 'box' },
                { id: 'cmd', label: 'Your #[tauri::command] fn', x: 15, y: 78, w: 30, h: 14, tone: 'default', shape: 'box' },
                { id: 'deser', label: 'Deserialize response', x: 78, y: 78, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'js', to: 'ser', label: '{ name: "Ada" }', tone: 'accent', animated: true },
              ],
            },
            {
              caption: 'The JSON payload crosses the webview message channel to Tauri Core, which routes it by command name.',
              nodes: [
                { id: 'js', label: 'JS invoke()', x: 15, y: 10, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'ser', label: 'Serialize (JSON)', x: 15, y: 32, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'router', label: 'Tauri Core / Command Router', x: 50, y: 55, w: 34, h: 14, tone: 'accent', shape: 'box' },
                { id: 'cmd', label: 'Your #[tauri::command] fn', x: 15, y: 78, w: 30, h: 14, tone: 'default', shape: 'box' },
                { id: 'deser', label: 'Deserialize response', x: 78, y: 78, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'ser', to: 'router', label: 'JSON over IPC channel', tone: 'accent', animated: true },
              ],
            },
            {
              caption: 'The router deserializes the JSON into your command\'s typed parameters and calls it.',
              nodes: [
                { id: 'js', label: 'JS invoke()', x: 15, y: 10, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'ser', label: 'Serialize (JSON)', x: 15, y: 32, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'router', label: 'Tauri Core / Command Router', x: 50, y: 55, w: 34, h: 14, tone: 'default', shape: 'box' },
                { id: 'cmd', label: 'Your #[tauri::command] fn', x: 15, y: 78, w: 30, h: 14, tone: 'accent', shape: 'box' },
                { id: 'deser', label: 'Deserialize response', x: 78, y: 78, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'router', to: 'cmd', label: 'name: String', tone: 'accent', animated: true },
              ],
            },
            {
              caption: 'Your command runs and returns a typed value — serialized back to JSON.',
              nodes: [
                { id: 'js', label: 'JS invoke()', x: 15, y: 10, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'ser', label: 'Serialize (JSON)', x: 15, y: 32, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'router', label: 'Tauri Core / Command Router', x: 50, y: 55, w: 34, h: 14, tone: 'default', shape: 'box' },
                { id: 'cmd', label: 'Your #[tauri::command] fn', x: 15, y: 78, w: 30, h: 14, tone: 'success', shape: 'box' },
                { id: 'deser', label: 'Deserialize response', x: 78, y: 78, w: 26, h: 14, tone: 'default', shape: 'box' },
              ],
              edges: [
                { from: 'cmd', to: 'deser', label: '"Hello, Ada!" → JSON', tone: 'success', animated: true },
              ],
            },
            {
              caption: 'The response is deserialized on the JS side — the invoke() Promise resolves.',
              nodes: [
                { id: 'js', label: 'JS invoke()', sublabel: 'Promise resolved', x: 15, y: 10, w: 26, h: 14, tone: 'success', shape: 'box' },
                { id: 'ser', label: 'Serialize (JSON)', x: 15, y: 32, w: 26, h: 14, tone: 'default', shape: 'box' },
                { id: 'router', label: 'Tauri Core / Command Router', x: 50, y: 55, w: 34, h: 14, tone: 'default', shape: 'box' },
                { id: 'cmd', label: 'Your #[tauri::command] fn', x: 15, y: 78, w: 30, h: 14, tone: 'default', shape: 'box' },
                { id: 'deser', label: 'Deserialize response', x: 78, y: 78, w: 26, h: 14, tone: 'success', shape: 'box' },
              ],
              edges: [
                { from: 'deser', to: 'js', label: '"Hello, Ada!"', tone: 'success', animated: true },
              ],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'App State: tauri::State<T>',
        body: [
          'Every command call is, in principle, independent — so how does one command see data another command wrote? That\'s what tauri::State<T> is for: it hands a command a reference to data you registered once, with .manage(...), when building the app. It\'s the same "shared, mutable data across many call sites" problem you already solved with Arc<Mutex<T>> in the Rust Advanced smart-pointers and shared-state lessons — Tauri State<T> is that exact pattern, wired into the command pipeline for you.',
          'Because multiple commands (and potentially multiple concurrent invocations of the same command) can access the same State<T> value, anything mutable inside it almost always needs to be wrapped in a Mutex or RwLock, exactly as you\'d do for any other Rust code sharing data across threads.',
        ],
        bullets: [
          'app.manage(value) registers value once; any command can request State<T> for it afterward.',
          'Mutation needs synchronization: wrap the field in Mutex<T> (or RwLock<T> for read-heavy access).',
          'This is the same Arc<Mutex<T>> shared-state pattern from Rust Advanced, applied to command handlers specifically.',
        ],
        callout: {
          tone: 'muted',
          text: 'If a value in State<T> is only ever read, no lock is needed. The moment any command needs to mutate it, wrap it in a Mutex or RwLock.',
        },
      },
      {
        type: 'code',
        title: 'A counter in shared App State',
        description:
          'This runs inside a real Tauri project, not the online playground — follow along and try it in your own `cargo tauri dev` once you\'ve scaffolded a project.',
        language: 'rust',
        runnable: false,
        code:
`use std::sync::Mutex;
use tauri::State;

struct AppState {
    counter: Mutex<i32>,
}

#[tauri::command]
fn increment(state: State<AppState>) -> i32 {
    let mut counter = state.counter.lock().unwrap();
    *counter += 1;
    *counter
}

fn main() {
    tauri::Builder::default()
        .manage(AppState { counter: Mutex::new(0) })
        .invoke_handler(tauri::generate_handler![increment])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}`,
      },
      {
        type: 'exercise',
        title: 'The pure-Rust equivalent: safely increment shared state',
        exercise: {
          problem:
            'Command wiring can\'t run here, but the concurrency pattern underneath State<Mutex<i32>> can be tested directly with std::sync::Arc and std::sync::Mutex. Simulate 5 "command calls" each incrementing a shared counter, using real threads so the Mutex\'s safety actually matters, and print the final value.',
          starterCode:
`use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..5 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            // TODO: lock the mutex and increment the shared counter
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("{}", *counter.lock().unwrap());
}`,
          hints: [
            { title: 'Locking inside the thread', body: 'Call counter.lock().unwrap() to get a MutexGuard, then dereference it to mutate the i32 inside.' },
            { title: 'Why Arc, not just Rc', body: 'Rc<T> is not thread-safe. Arc<T> uses atomic reference counting so it can be safely cloned into each spawned thread — exactly what Tauri does internally to hand State<T> to concurrent command calls.' },
          ],
          solutionCode:
`use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..5 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("{}", *counter.lock().unwrap());
}`,
          solutionExplanation:
            'Each thread clones the Arc (cheap, atomic refcount bump), locks the shared Mutex, increments, and the guard is dropped (unlocked) at the end of the closure. After all 5 threads join, the counter is deterministically 5 — this is exactly the safety guarantee State<Mutex<i32>> gives you across concurrent command invocations.',
          expectedOutputContains: ['5'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why must a command\'s argument and return types implement Deserialize and Serialize respectively?',
            options: [
              { id: 'a', text: 'It\'s an arbitrary restriction Tauri could remove in a future version.' },
              { id: 'b', text: 'Because the IPC pipeline moves data as JSON across the webview message channel — serde needs those traits to convert to/from JSON.' },
              { id: 'c', text: 'Only commands that use async fn need this.' },
              { id: 'd', text: 'Because Rust requires all function parameters to implement these traits.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Arguments arrive as JSON and must be deserialized into Rust types; return values must be serialized back to JSON to cross the channel to JS. Serialize/Deserialize are what make that conversion possible.',
          },
          {
            id: 'q2',
            prompt: 'What is tauri::State<T> for?',
            options: [
              { id: 'a', text: 'Storing the current window\'s title.' },
              { id: 'b', text: 'Giving a command access to data registered once via .manage(...) and shared across every command call.' },
              { id: 'c', text: 'Automatically persisting data to disk between app runs.' },
              { id: 'd', text: 'Replacing the need for Serialize/Deserialize on command arguments.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'State<T> is Tauri\'s mechanism for dependency-injecting app-wide shared data into any command that asks for it, based on what was registered with .manage(...) at startup.',
          },
          {
            id: 'q3',
            prompt: 'Why does mutable data inside State<T> usually need a Mutex or RwLock?',
            options: [
              { id: 'a', text: 'Because State<T> data is read-only by default and the lock is what allows any access at all.' },
              { id: 'b', text: 'Because multiple commands — potentially running concurrently — may access the same State<T> value, and Rust requires synchronized access to shared mutable data.' },
              { id: 'c', text: 'Because JSON serialization requires a lock.' },
              { id: 'd', text: 'It doesn\'t — Tauri automatically synchronizes all State<T> access.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'This is the same rule as any other shared mutable Rust data accessed from multiple threads: without a Mutex/RwLock, concurrent mutation would be a data race, which the compiler won\'t allow.',
          },
          {
            id: 'q4',
            prompt: 'What does marking a command async fn change about how it\'s handled?',
            options: [
              { id: 'a', text: 'Tauri awaits it on its async runtime instead of running it synchronously, so it can do I/O without blocking other commands.' },
              { id: 'b', text: 'It changes the wire format from JSON to a binary protocol.' },
              { id: 'c', text: 'It disables error handling via Result.' },
              { id: 'd', text: 'It requires State<T> to be passed by value instead of by reference.' },
            ],
            correctOptionIds: ['a'],
            explanation:
              'async fn commands are polled/awaited by Tauri\'s async runtime rather than run to completion synchronously, which matters for I/O-bound work that would otherwise tie up a thread while waiting.',
          },
        ],
      },
    ],
  },
}
