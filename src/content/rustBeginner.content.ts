import type { LessonContent } from '../types/lessonContent'

export const rustBeginnerContent: Record<string, LessonContent> = {
  // ────────────────────────────────────────────────────────────────────────
  // 1. rb-what-is-rust
  // ────────────────────────────────────────────────────────────────────────
  'rb-what-is-rust': {
    id: 'rb-what-is-rust',
    heroSummary:
      'Rust is a systems programming language that gives you C-like control over memory and performance, but catches entire categories of bugs at compile time instead of letting them crash — or silently corrupt — your program in production.',
    dependencyChain: {
      learned: 'Nothing yet — this is lesson one.',
      why: 'Every "strict" rule you will meet later (the borrow checker, no null, mandatory error handling) exists to solve a real, historical problem.',
      build: 'A mental model for why Rust looks the way it does, before you write a single line.',
      next: 'Next you will map Rust against languages you may already know, so the syntax feels less alien.',
    },
    sections: [
      {
        type: 'explain',
        title: 'What is Rust, exactly?',
        body: [
          "Rust is a compiled, statically-typed systems programming language. That puts it in the same rough category as C and C++ — it compiles straight to machine code, gives you fine control over memory layout, and has no runtime garbage collector slowing things down.",
          "What makes Rust different from C and C++ is its compiler. Rust's compiler (rustc) performs deep checks on how your program uses memory — who owns a piece of data, how long it lives, who is allowed to change it — and it refuses to produce a binary if those rules are violated.",
        ],
        bullets: [
          'Compiles to native machine code — no VM, no interpreter, no runtime GC pauses.',
          'Static types are checked before your program ever runs.',
          'A unique "ownership" system (you will meet this in Level 2) enforces memory safety at compile time.',
        ],
      },
      {
        type: 'explain',
        title: 'The problem Rust was built to kill',
        body: [
          "For decades, C and C++ gave programmers total control over memory — and total responsibility for it. Forget to free memory and you leak it. Free it twice, or use it after freeing it, and you get undefined behavior: crashes, corrupted data, or security holes that attackers exploit.",
          "These aren't rare beginner mistakes. Studies of large C/C++ codebases (including Microsoft and Google's own security reports) repeatedly found that the majority of serious security vulnerabilities were memory-safety bugs — use-after-free, buffer overflows, null pointer dereferences, and data races between threads.",
        ],
        callout: {
          tone: 'accent',
          text: 'Rust started as a personal project by Graydon Hoare at Mozilla around 2006, aimed squarely at this problem: how do you get C++-level performance without C++-level memory bugs? Mozilla sponsored it in 2009, and Rust 1.0 shipped in 2015.',
        },
      },
      {
        type: 'diagram',
        title: 'Rust\'s timeline, briefly',
        description: 'A quick tour of how Rust went from a side project to a production-grade systems language.',
        diagram: {
          title: 'From personal project to production language',
          height: 260,
          frames: [
            {
              caption: '2006 — Graydon Hoare starts Rust as a personal project.',
              nodes: [
                { id: 'y2006', label: '2006', sublabel: 'Personal project', x: 12, y: 50, tone: 'muted', shape: 'pill' },
              ],
            },
            {
              caption: '2009 — Mozilla begins sponsoring the project.',
              nodes: [
                { id: 'y2006', label: '2006', sublabel: 'Personal project', x: 12, y: 50, tone: 'muted', shape: 'pill' },
                { id: 'y2009', label: '2009', sublabel: 'Mozilla sponsors it', x: 36, y: 50, tone: 'accent', shape: 'pill' },
              ],
              edges: [{ from: 'y2006', to: 'y2009', animated: true }],
            },
            {
              caption: '2010–2014 — Built to power Servo, an experimental browser engine.',
              nodes: [
                { id: 'y2006', label: '2006', sublabel: 'Personal project', x: 10, y: 50, tone: 'muted', shape: 'pill' },
                { id: 'y2009', label: '2009', sublabel: 'Mozilla sponsors it', x: 32, y: 50, tone: 'accent', shape: 'pill' },
                { id: 'servo', label: 'Servo', sublabel: 'Experimental browser engine', x: 58, y: 50, tone: 'stack', shape: 'pill' },
              ],
              edges: [
                { from: 'y2006', to: 'y2009', animated: true },
                { from: 'y2009', to: 'servo', animated: true },
              ],
            },
            {
              caption: '2015 — Rust 1.0 ships with a stability promise.',
              nodes: [
                { id: 'y2009', label: '2009', sublabel: 'Mozilla sponsors it', x: 20, y: 50, tone: 'muted', shape: 'pill' },
                { id: 'servo', label: 'Servo', sublabel: 'Experimental browser engine', x: 42, y: 50, tone: 'muted', shape: 'pill' },
                { id: 'y2015', label: '2015', sublabel: 'Rust 1.0 — stable', x: 68, y: 50, tone: 'success', shape: 'pill' },
              ],
              edges: [
                { from: 'y2009', to: 'servo', animated: true },
                { from: 'servo', to: 'y2015', animated: true },
              ],
            },
            {
              caption: 'Today — used for browsers, operating systems, cloud infra, and desktop apps (like the Tauri apps later in this course).',
              nodes: [
                { id: 'y2015', label: '2015', sublabel: 'Rust 1.0 — stable', x: 22, y: 50, tone: 'muted', shape: 'pill' },
                { id: 'today', label: 'Today', sublabel: 'Browsers · OS kernels · cloud · desktop apps', x: 58, y: 50, tone: 'success', shape: 'pill', w: 34 },
              ],
              edges: [{ from: 'y2015', to: 'today', animated: true }],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'Who reaches for Rust, and why',
        body: [
          "You don't need a list of logos to get the point: Rust tends to get picked whenever a team needs the raw performance of C/C++ but can no longer afford the memory bugs that come with it — browser components, operating system pieces, network infrastructure, game engines, and increasingly, desktop apps (this is exactly why Tauri, which you'll learn in a later level, uses Rust for its backend).",
          "The core pitch, in one sentence: Rust gives you memory safety and thread safety, checked entirely at compile time, with zero runtime garbage collector — so your program is both safer and just as fast as hand-written C.",
        ],
        bullets: [
          'Safety: whole classes of bugs (use-after-free, null dereference, data races) become compile errors, not crashes.',
          'Speed: no GC pauses, no runtime overhead — Rust compiles to code that performs like C/C++.',
          'Confidence: "if it compiles, it usually works" is a common, only slightly exaggerated saying in the Rust community.',
        ],
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the single biggest thing that sets Rust apart from C and C++?',
            options: [
              { id: 'a', text: 'Rust has a garbage collector that C/C++ lack.' },
              { id: 'b', text: "Rust's compiler enforces memory-safety rules at compile time, without a runtime garbage collector." },
              { id: 'c', text: 'Rust is an interpreted language, so it never crashes.' },
              { id: 'd', text: 'Rust does not allow pointers of any kind.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Rust achieves memory safety through compile-time checks (ownership and borrowing), not a garbage collector — that\'s how it stays fast while still being safe.',
          },
          {
            id: 'q2',
            prompt: 'Which kinds of bugs was Rust specifically designed to eliminate?',
            options: [
              { id: 'a', text: 'Typos in variable names' },
              { id: 'b', text: 'Slow network requests' },
              { id: 'c', text: 'Memory-safety bugs like use-after-free, buffer overflows, and data races' },
              { id: 'd', text: 'CSS layout bugs' },
            ],
            correctOptionIds: ['c'],
            explanation:
              'Memory-safety and thread-safety bugs were historically responsible for a huge share of serious security vulnerabilities in C/C++ software — this is precisely the gap Rust closes.',
          },
          {
            id: 'q3',
            prompt: 'True or false: Rust achieves memory safety by using a garbage collector, similar to Java or Go.',
            options: [
              { id: 'a', text: 'True' },
              { id: 'b', text: 'False — Rust checks memory safety at compile time and has no garbage collector' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'This is a common misconception. Rust has no garbage collector at all — the compiler proves your memory usage is safe before the program ever runs, using ownership and borrowing rules.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 2. rb-rust-vs-others
  // ────────────────────────────────────────────────────────────────────────
  'rb-rust-vs-others': {
    id: 'rb-rust-vs-others',
    heroSummary:
      'You already have a mental model for programming from another language. This lesson maps that model onto Rust by comparing memory management, safety, performance, and typical use cases across C/C++, Go, JavaScript, and Rust.',
    dependencyChain: {
      learned: 'What Rust is and the historical problem it solves.',
      why: 'Mapping Rust onto languages you already know is the fastest way to build intuition for what "feels different."',
      build: 'A clear sense of the trade-off Rust makes: more compiler strictness up front, in exchange for fewer runtime surprises later.',
      next: 'With the "why," you are ready to actually install the toolchain and start writing Rust.',
    },
    sections: [
      {
        type: 'explain',
        title: 'You already know a language — here is the mapping',
        body: [
          'Every language makes a trade-off between how much control you have over memory and how much the language protects you from yourself. C and C++ sit at "total control, minimal protection." Garbage-collected languages like Go and JavaScript sit at "less control, strong protection, but you pay for it with a runtime."',
          'Rust tries to sit in a spot nothing else occupies: C/C++-level control and performance, with stronger safety guarantees than even garbage-collected languages — because the compiler proves memory safety instead of checking it while your program runs.',
        ],
      },
      {
        type: 'compare',
        title: 'Rust vs C/C++, Go, and JavaScript',
        columns: [
          {
            heading: 'C / C++',
            body: [
              'Memory: manual malloc/free (C) or new/delete (C++). Nothing stops a use-after-free.',
              'Safety: none enforced by the compiler — bugs surface at runtime, often as crashes or exploits.',
              'Performance: as fast as it gets — no runtime, no GC, direct hardware access.',
              'Typical use: OS kernels, embedded systems, game engines, performance-critical libraries.',
            ],
          },
          {
            heading: 'Go',
            body: [
              'Memory: automatic garbage collection — you never free anything by hand.',
              'Safety: memory-safe, but data races on shared state are still possible at runtime.',
              'Performance: fast and simple, but GC pauses and less control over layout than Rust/C.',
              'Typical use: backend services, cloud infrastructure, CLI tools — optimized for developer speed.',
            ],
          },
          {
            heading: 'JavaScript',
            body: [
              'Memory: automatic garbage collection, single-threaded event loop (Node) or browser sandbox.',
              'Safety: memory-safe, but dynamically typed — many bugs only appear at runtime.',
              'Performance: JIT-compiled, good enough for most UI/web work, not for systems programming.',
              'Typical use: web front ends, Node.js backends, scripting, rapid prototyping.',
            ],
          },
          {
            heading: 'Rust',
            body: [
              'Memory: no garbage collector — ownership rules are checked entirely at compile time.',
              'Safety: memory-safe and (mostly) data-race-free, enforced by the compiler before code runs.',
              'Performance: matches C/C++ — no runtime overhead, no GC pauses, predictable latency.',
              'Typical use: browsers, OS components, network infra, game engines, and desktop apps (Tauri).',
            ],
          },
        ],
      },
      {
        type: 'explain',
        title: 'So what are you actually trading?',
        body: [
          "If you're coming from JavaScript or Go, the trade is this: Rust asks you to think about memory ownership up front, in exchange for eliminating an entire category of runtime bugs and removing GC pauses entirely.",
          "If you're coming from C or C++, the trade is the opposite direction: Rust asks the compiler to be stricter than you're used to, in exchange for never chasing a segfault or a use-after-free again.",
        ],
        bullets: [
          'Coming from JS/Go: expect more upfront compiler pushback, but far fewer 2am production bugs.',
          'Coming from C/C++: expect the compiler to reject code you know "would probably be fine" — that strictness is the whole point.',
          'Either way: once code compiles in Rust, a huge class of bugs simply cannot exist in it.',
        ],
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What do Go and JavaScript have in common that Rust does not use?',
            options: [
              { id: 'a', text: 'Static typing' },
              { id: 'b', text: 'A garbage collector for automatic memory management' },
              { id: 'c', text: 'Compilation to native machine code' },
              { id: 'd', text: 'Manual memory management with malloc/free' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Go and JavaScript both rely on a runtime garbage collector to reclaim memory. Rust has no garbage collector — ownership rules free memory deterministically at compile-checked points.',
          },
          {
            id: 'q2',
            prompt: 'Which statement best describes Rust\'s position relative to C/C++?',
            options: [
              { id: 'a', text: 'Rust is slower than C/C++ but much safer.' },
              { id: 'b', text: 'Rust matches C/C++ performance while adding compile-time memory safety.' },
              { id: 'c', text: 'Rust is only meant for scripting, not systems work.' },
              { id: 'd', text: 'Rust requires a virtual machine like Java.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Rust compiles to native code with no runtime overhead, so it is performance-competitive with C/C++, but its ownership system catches memory bugs that C/C++ would let through.',
          },
          {
            id: 'q3',
            prompt: 'A team building a data-race-prone, multi-threaded network service in Go finds occasional crashes under load. What is the most likely underlying issue?',
            options: [
              { id: 'a', text: 'Go\'s garbage collector prevents all data races, so this cannot happen.' },
              { id: 'b', text: 'Go is memory-safe but does not prevent data races on shared state at compile time.' },
              { id: 'c', text: 'Go code cannot use multiple threads at all.' },
              { id: 'd', text: 'This is impossible in any garbage-collected language.' },
            ],
            correctOptionIds: ['b'],
            explanation:
              'Go protects you from memory-safety bugs (like use-after-free) via its GC, but it does not statically prevent data races the way Rust\'s borrow checker does — that\'s a distinguishing feature of Rust\'s design.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 3. rb-install-toolchain
  // ────────────────────────────────────────────────────────────────────────
  'rb-install-toolchain': {
    id: 'rb-install-toolchain',
    heroSummary:
      'Rust\'s tooling has three layers: rustup manages your toolchains, rustc is the compiler, and cargo is the build tool, package manager, and test runner you\'ll use every day. This lesson sets up all three.',
    dependencyChain: {
      learned: 'How Rust compares to languages you already know, and the trade-off it makes.',
      why: 'You need a working toolchain before you can run a single line of Rust.',
      build: 'A working rustup + rustc + cargo install, and a mental model of how the three pieces relate.',
      next: 'You will use cargo to create and run your very first Rust project.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Three tools, one toolchain',
        body: [
          "rustup is the version manager: it installs and switches between Rust toolchains (stable, beta, nightly) and keeps them updated. You install rustup once, and it takes care of everything downstream.",
          "rustc is the actual compiler — it turns your .rs source files into a machine-code binary. You will almost never call rustc directly, though, because...",
          "cargo is the tool you actually use day to day. It calls rustc for you, manages your project's dependencies (called \"crates\"), runs your tests, and defines your project's structure via a Cargo.toml file.",
        ],
      },
      {
        type: 'diagram',
        title: 'How the pieces fit together',
        description: 'rustup installs the toolchain; cargo is your daily driver; cargo delegates the actual compiling to rustc.',
        diagram: {
          title: 'rustup → rustc + cargo → your program',
          height: 240,
          frames: [
            {
              caption: 'Step 1 — You install rustup, once.',
              nodes: [{ id: 'rustup', label: 'rustup', sublabel: 'toolchain installer & version manager', x: 15, y: 50, tone: 'accent', shape: 'pill', w: 26 }],
            },
            {
              caption: 'Step 2 — rustup installs rustc (the compiler) and cargo (the build tool) for your chosen toolchain.',
              nodes: [
                { id: 'rustup', label: 'rustup', sublabel: 'toolchain installer', x: 12, y: 50, tone: 'muted', shape: 'pill', w: 20 },
                { id: 'rustc', label: 'rustc', sublabel: 'the compiler', x: 45, y: 30, tone: 'stack', shape: 'pill', w: 20 },
                { id: 'cargo', label: 'cargo', sublabel: 'build tool & package manager', x: 45, y: 70, tone: 'accent', shape: 'pill', w: 26 },
              ],
              edges: [
                { from: 'rustup', to: 'rustc', animated: true },
                { from: 'rustup', to: 'cargo', animated: true },
              ],
            },
            {
              caption: 'Step 3 — Day to day, you type cargo commands (like cargo run).',
              nodes: [
                { id: 'you', label: 'You', sublabel: 'cargo run', x: 8, y: 50, tone: 'success', shape: 'pill', w: 16 },
                { id: 'cargo', label: 'cargo', sublabel: 'build tool & package manager', x: 42, y: 50, tone: 'accent', shape: 'pill', w: 26 },
              ],
              edges: [{ from: 'you', to: 'cargo', animated: true, label: 'command' }],
            },
            {
              caption: 'Step 4 — cargo calls rustc under the hood to compile your code.',
              nodes: [
                { id: 'cargo', label: 'cargo', sublabel: 'build tool & package manager', x: 18, y: 50, tone: 'accent', shape: 'pill', w: 26 },
                { id: 'rustc', label: 'rustc', sublabel: 'the compiler', x: 60, y: 50, tone: 'stack', shape: 'pill', w: 20 },
              ],
              edges: [{ from: 'cargo', to: 'rustc', animated: true, label: 'compiles' }],
            },
            {
              caption: 'Step 5 — rustc produces a native binary you can run directly.',
              nodes: [
                { id: 'rustc', label: 'rustc', sublabel: 'the compiler', x: 20, y: 50, tone: 'muted', shape: 'pill', w: 20 },
                { id: 'binary', label: 'your_app', sublabel: 'native executable', x: 62, y: 50, tone: 'success', shape: 'box', w: 24 },
              ],
              edges: [{ from: 'rustc', to: 'binary', animated: true, label: 'emits' }],
            },
          ],
        },
      },
      {
        type: 'terminal',
        title: 'Installing and checking your toolchain',
        description: 'On macOS/Linux, rustup is installed via a shell script. On Windows, you\'d download rustup-init.exe instead — the result is the same.',
        lines: [
          { prompt: '$', text: 'curl --proto \'=https\' --tlsv1.2 -sSf https://sh.rustup.rs | sh' },
          { text: 'info: downloading installer' },
          { text: 'info: default host triple is x86_64-unknown-linux-gnu' },
          { text: 'info: installing component \'rustc\', \'cargo\', \'rust-std\', \'rustfmt\', \'clippy\'' },
          { text: 'Rust is installed now. Great!' },
          { prompt: '$', text: 'rustc --version' },
          { text: 'rustc 1.83.0 (90b35a623 2024-11-26)' },
          { prompt: '$', text: 'cargo --version' },
          { text: 'cargo 1.83.0 (5ffbef321 2024-10-29)' },
        ],
      },
      {
        type: 'explain',
        title: 'Channels and editors, briefly',
        body: [
          "rustup manages three release channels: stable (what you'll use for everything in this course), beta (the next stable, for early testing), and nightly (bleeding-edge, needed only for experimental features). Stick to stable.",
          "For an editor, install VS Code with the rust-analyzer extension — it gives you inline type hints, autocomplete, and error highlighting that make learning Rust dramatically less painful.",
        ],
        bullets: [
          'rustup toolchain list — see installed toolchains.',
          'rustup update — update stable to the latest release.',
          'rust-analyzer — the language server that powers editor tooling for Rust.',
        ],
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Which tool actually turns your .rs source code into a runnable binary?',
            options: [
              { id: 'a', text: 'rustup' },
              { id: 'b', text: 'rustc' },
              { id: 'c', text: 'cargo, and only cargo' },
              { id: 'd', text: 'rust-analyzer' },
            ],
            correctOptionIds: ['b'],
            explanation: 'rustc is the compiler. cargo is a wrapper around it that also manages dependencies, running, and testing — but the actual compilation is done by rustc.',
          },
          {
            id: 'q2',
            prompt: 'What is rustup responsible for?',
            options: [
              { id: 'a', text: 'Compiling individual .rs files' },
              { id: 'b', text: 'Installing and managing Rust toolchains (stable/beta/nightly) and keeping them updated' },
              { id: 'c', text: 'Managing your project\'s external dependencies' },
              { id: 'd', text: 'Providing autocomplete in your editor' },
            ],
            correctOptionIds: ['b'],
            explanation: 'rustup is the version/toolchain manager — it installs rustc and cargo for whichever channel (stable, beta, nightly) you select, and keeps them up to date.',
          },
          {
            id: 'q3',
            prompt: 'You run `cargo run` in a project directory. What actually happens under the hood?',
            options: [
              { id: 'a', text: 'cargo interprets your Rust code line by line, like a script.' },
              { id: 'b', text: 'cargo calls rustc to compile your code into a binary, then executes that binary.' },
              { id: 'c', text: 'cargo sends your code to a remote server for compilation.' },
              { id: 'd', text: 'cargo skips compilation entirely and only checks syntax.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'cargo run compiles your project (delegating the actual compilation to rustc) and then immediately runs the resulting binary if compilation succeeds.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 4. rb-first-project
  // ────────────────────────────────────────────────────────────────────────
  'rb-first-project': {
    id: 'rb-first-project',
    heroSummary:
      'Every Rust project — from a five-line script to a full Tauri desktop app — starts the same way: cargo new. This lesson walks through the generated file tree, what each file does, and the cargo run / build / check workflow.',
    dependencyChain: {
      learned: 'What rustup, rustc, and cargo each do.',
      why: 'cargo new is the starting point of literally every Rust project you will ever build.',
      build: 'A real, running "Hello, world!" project on disk, and the cargo workflow you\'ll repeat for the rest of the course.',
      next: 'With a project running, you can start learning the language itself — starting with variables.',
    },
    sections: [
      {
        type: 'terminal',
        title: 'Creating a new project',
        description: 'cargo new scaffolds a complete, runnable project — no manual file creation required.',
        lines: [
          { prompt: '$', text: 'cargo new hello_rust' },
          { text: '     Created binary (application) `hello_rust` package' },
          { prompt: '$', text: 'cd hello_rust' },
          { prompt: '$', text: 'ls -la' },
          { text: '.git/  .gitignore  Cargo.toml  src/' },
        ],
      },
      {
        type: 'explain',
        title: 'What cargo new just created',
        body: [
          "cargo new gives you a minimal but complete project: a Cargo.toml manifest describing your package, a src/main.rs file with a working \"Hello, world!\" program, and a .git repository already initialized.",
          "Cargo.toml is the equivalent of package.json (Node) or requirements.txt (Python) — it declares your package's name, version, edition, and dependencies. src/main.rs is where execution starts: Rust always looks for a fn main() as the entry point of a binary.",
        ],
        bullets: [
          'Cargo.toml — project metadata + dependency list.',
          'src/main.rs — your program\'s entry point (fn main()).',
          '.gitignore — pre-configured to ignore the target/ build directory.',
          'target/ — appears after your first build; this is where compiled output goes (never commit it).',
        ],
      },
      {
        type: 'code',
        title: 'The generated src/main.rs',
        description: 'This is exactly what cargo new writes for you — a complete, if tiny, Rust program.',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    println!("Hello, world!");
}`,
      },
      {
        type: 'code',
        title: 'The generated Cargo.toml',
        description: 'The manifest file. The [dependencies] section is empty for now — you\'ll add crates here in later projects.',
        language: 'toml',
        runnable: false,
        code: `[package]
name = "hello_rust"
version = "0.1.0"
edition = "2021"

[dependencies]`,
      },
      {
        type: 'terminal',
        title: 'Running it',
        description: 'cargo run compiles (if needed) and immediately runs your binary. cargo build only compiles. cargo check compiles just enough to report errors, without producing a binary — much faster for a quick sanity check.',
        lines: [
          { prompt: '$', text: 'cargo run' },
          { text: '   Compiling hello_rust v0.1.0 (/home/you/hello_rust)' },
          { text: '    Finished dev [unoptimized + debuginfo] target(s) in 0.42s' },
          { text: '     Running `target/debug/hello_rust`' },
          { text: 'Hello, world!' },
        ],
      },
      {
        type: 'exercise',
        title: 'Make it your own',
        exercise: {
          problem:
            'Edit main() so it prints two lines: first "Learning Rust one lesson at a time!", then "This is my first Cargo project." — each on its own println! call.',
          starterCode: `fn main() {
    // TODO: print two lines describing what you're learning right now
    println!("Hello, world!");
}`,
          hints: [
            { title: 'One println! per line', body: 'Each println!("...") call produces one line of output, including its own newline.' },
            { title: 'Exact text matters', body: 'The checker looks for the exact phrases, so copy them precisely, including capitalization and punctuation.' },
            { title: 'Remove the placeholder', body: 'Delete the "Hello, world!" line so it does not appear in your final output.' },
          ],
          solutionCode: `fn main() {
    println!("Learning Rust one lesson at a time!");
    println!("This is my first Cargo project.");
}`,
          solutionExplanation:
            'Each println! call is a separate statement ending in a semicolon, and each one emits exactly one line (println! automatically appends a newline — that\'s the difference from print!).',
          expectedOutputContains: ['Learning Rust one lesson at a time!', 'This is my first Cargo project.'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Which file does cargo new create as your program\'s entry point?',
            options: [
              { id: 'a', text: 'Cargo.toml' },
              { id: 'b', text: 'src/main.rs' },
              { id: 'c', text: 'index.rs' },
              { id: 'd', text: 'package.rs' },
            ],
            correctOptionIds: ['b'],
            explanation: 'src/main.rs contains fn main(), which is where a Rust binary starts executing.',
          },
          {
            id: 'q2',
            prompt: 'What is the difference between cargo build and cargo run?',
            options: [
              { id: 'a', text: 'There is no difference, they are aliases.' },
              { id: 'b', text: 'cargo build only compiles the project; cargo run compiles it (if needed) and then executes it.' },
              { id: 'c', text: 'cargo build is for tests only.' },
              { id: 'd', text: 'cargo run does not compile anything, it only reruns the last binary.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'cargo build stops after producing the binary in target/debug (or target/release). cargo run does that and then immediately executes the result.',
          },
          {
            id: 'q3',
            prompt: 'Why should target/ never be committed to git?',
            options: [
              { id: 'a', text: 'It contains your source code, which is a security risk.' },
              { id: 'b', text: 'It is entirely regenerated build output — compiled binaries and intermediate artifacts — not source.' },
              { id: 'c', text: 'Git cannot store binary files at all.' },
              { id: 'd', text: 'cargo requires target/ to be absent to run.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'target/ holds compiled artifacts that can always be regenerated from source via cargo build — that\'s exactly why .gitignore excludes it by default.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 5. rb-variables-mutability
  // ────────────────────────────────────────────────────────────────────────
  'rb-variables-mutability': {
    id: 'rb-variables-mutability',
    heroSummary:
      'In Rust, every variable is immutable unless you explicitly say otherwise with mut. This one default flips how you write code — and it\'s your first taste of the compiler catching a bug before it exists.',
    dependencyChain: {
      learned: 'The cargo workflow — new, run, build, check.',
      why: 'Immutability-by-default is Rust\'s very first safety net, and it shapes every pattern you\'ll learn after this.',
      build: 'Confidence reading and writing let and let mut bindings, and recognizing the compiler error when you get it wrong.',
      next: 'Next you\'ll see shadowing — a controlled way to "change" a value without ever using mut.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Immutable by default',
        body: [
          "When you write `let x = 5;`, x is immutable — you cannot assign a new value to it later. This is the opposite default from most languages you've used, where variables are mutable unless marked const or final.",
          "To make a variable changeable, you add the `mut` keyword: `let mut x = 5;`. Now x can be reassigned as many times as you like.",
          "This isn't a minor style choice. Immutability-by-default means that anywhere you see a plain `let`, you know — guaranteed by the compiler — that the value never changes for the rest of its lifetime. That's one less thing to track mentally while reading code.",
        ],
        bullets: [
          '`let x = 5;` → immutable. Reassigning x is a compile error.',
          '`let mut x = 5;` → mutable. x = 6; is allowed.',
          'This is checked entirely at compile time — there is zero runtime cost.',
        ],
      },
      {
        type: 'diagram',
        title: 'Immutable vs mutable bindings',
        description: 'Watch what happens when you try to reassign each kind of binding.',
        diagram: {
          title: 'let vs let mut, under reassignment',
          height: 260,
          frames: [
            {
              caption: 'Both bindings start out holding the value 5.',
              nodes: [
                { id: 'x', label: 'x', sublabel: '5  (let)', x: 25, y: 35, tone: 'default', shape: 'box' },
                { id: 'y', label: 'y', sublabel: '5  (let mut)', x: 25, y: 70, tone: 'accent', shape: 'box' },
              ],
            },
            {
              caption: 'We attempt `x = 6;` on the immutable binding.',
              nodes: [
                { id: 'x', label: 'x', sublabel: '5  (let)', x: 25, y: 35, tone: 'default', shape: 'box' },
                { id: 'xnew', label: 'x = 6?', sublabel: 'rejected by compiler', x: 65, y: 35, tone: 'danger', shape: 'ghost', invalid: true },
                { id: 'y', label: 'y', sublabel: '5  (let mut)', x: 25, y: 70, tone: 'accent', shape: 'box' },
              ],
              edges: [{ from: 'x', to: 'xnew', dashed: true, tone: 'danger', label: 'E0384' }],
            },
            {
              caption: 'That reassignment is a compile error — x never changes.',
              nodes: [
                { id: 'x', label: 'x', sublabel: '5  (still 5, forever)', x: 25, y: 35, tone: 'default', shape: 'box' },
                { id: 'y', label: 'y', sublabel: '5  (let mut)', x: 25, y: 70, tone: 'accent', shape: 'box' },
              ],
            },
            {
              caption: 'We attempt `y = 6;` on the mutable binding — this is allowed.',
              nodes: [
                { id: 'x', label: 'x', sublabel: '5  (still 5, forever)', x: 25, y: 35, tone: 'default', shape: 'box' },
                { id: 'y', label: 'y', sublabel: '5 → 6', x: 25, y: 70, tone: 'success', shape: 'box' },
              ],
              edges: [{ from: 'y', to: 'y', label: 'updates in place', tone: 'success' }],
            },
            {
              caption: 'y now holds 6, in the exact same memory slot — no new variable was created.',
              nodes: [
                { id: 'x', label: 'x', sublabel: '5  (still 5, forever)', x: 25, y: 35, tone: 'default', shape: 'box' },
                { id: 'y', label: 'y', sublabel: '6', x: 25, y: 70, tone: 'success', shape: 'box' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'let vs let mut in practice',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    let x = 5;
    println!("x is {}", x);

    let mut y = 5;
    println!("y is {}", y);
    y = y + 1;
    println!("y is now {}", y);
}`,
      },
      {
        type: 'debug',
        title: 'Fix the compile error',
        challenge: {
          problem: 'This program is supposed to increment x and print the new value, but it will not compile. Find and fix the bug.',
          brokenCode: `fn main() {
    let x = 5;
    println!("x = {}", x);
    x = 6;
    println!("x = {}", x);
}`,
          bugExplanation:
            'x is declared with `let`, which makes it immutable. The line `x = 6;` tries to assign a new value to it, which the compiler rejects with error E0384: "cannot assign twice to immutable variable". The fix is to opt into mutability with `let mut x = 5;`.',
          hints: [
            { title: 'Read the error code', body: 'rustc will point at the exact line and mention E0384 — search "cannot assign twice to immutable variable" if you want more detail.' },
            { title: 'Where was x declared?', body: 'Look at how x is declared on the first line — is there a keyword missing?' },
            { title: 'One keyword fixes it', body: 'Add `mut` to the `let` that declares x.' },
          ],
          fixedCode: `fn main() {
    let mut x = 5;
    println!("x = {}", x);
    x = 6;
    println!("x = {}", x);
}`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does `let count = 0;` mean in Rust?',
            options: [
              { id: 'a', text: 'count is a mutable variable that can be reassigned freely.' },
              { id: 'b', text: 'count is immutable — attempting to reassign it is a compile error.' },
              { id: 'c', text: 'count is a constant that must be known at compile time.' },
              { id: 'd', text: 'count is undefined until first used.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Without `mut`, every `let` binding is immutable by default — the compiler will reject any later reassignment.',
          },
          {
            id: 'q2',
            prompt: 'Which line makes a variable reassignable?',
            options: [
              { id: 'a', text: 'let x = 5;' },
              { id: 'b', text: 'const x = 5;' },
              { id: 'c', text: 'let mut x = 5;' },
              { id: 'd', text: 'var x = 5;' },
            ],
            correctOptionIds: ['c'],
            explanation: '`let mut` explicitly opts a binding into mutability. Rust has no `var` keyword, and `const` is even stricter than a plain `let` (you\'ll see this next lesson).',
          },
          {
            id: 'q3',
            prompt: 'Why might immutable-by-default be considered a safety feature, not just a style preference?',
            options: [
              { id: 'a', text: 'It makes programs run faster at runtime.' },
              { id: 'b', text: 'It lets the compiler guarantee, at compile time, that a value never changes — eliminating a class of "who changed this?" bugs.' },
              { id: 'c', text: 'It prevents all functions from having bugs.' },
              { id: 'd', text: 'It is required for the program to compile at all, even with mut everywhere.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Immutability is enforced statically, so when you read a plain `let`, you know with certainty — not just convention — that the value cannot be mutated elsewhere in its scope.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 6. rb-constants-shadowing
  // ────────────────────────────────────────────────────────────────────────
  'rb-constants-shadowing': {
    id: 'rb-constants-shadowing',
    heroSummary:
      'Constants are values that are always immutable and known at compile time. Shadowing lets you reuse a variable name to represent a transformed version of a value — without ever reaching for mut.',
    dependencyChain: {
      learned: 'let vs let mut, and why immutability is the default.',
      why: 'const and shadowing are two more tools for controlling exactly how (and whether) a value can change.',
      build: 'The ability to write clean, step-by-step data transformations under one variable name.',
      next: 'Next you\'ll need actual types to store in these bindings — starting with the primitive types.',
    },
    sections: [
      {
        type: 'explain',
        title: 'const: always immutable, always known upfront',
        body: [
          "A `const` is stricter than even a plain `let`: it must be immutable (mut is never allowed), its type must be annotated explicitly, and its value must be computable at compile time — you can't set a const from user input or a function call that isn't itself const.",
          "By convention, constants are named in SCREAMING_SNAKE_CASE, and they can be declared at any scope, including outside of any function.",
        ],
        bullets: [
          'const MAX_USERS: u32 = 100_000; — type annotation is required.',
          'Constants can live at module/global scope, unlike let bindings.',
          'Use const for values that are truly fixed: limits, mathematical constants, configuration ceilings.',
        ],
      },
      {
        type: 'explain',
        title: 'Shadowing: reusing a name on purpose',
        body: [
          'Shadowing means declaring a new `let` binding with the same name as a previous one. The old binding is not mutated — it\'s hidden. You get a brand new variable that happens to share a name, and it can even have a different type.',
          "This is genuinely useful for pipelines: parse a string, trim it, transform it, and reuse the same name at every step instead of inventing `raw_input`, `trimmed_input`, `parsed_input`, etc.",
        ],
        callout: {
          tone: 'accent',
          text: 'Shadowing is NOT the same as mutation. Mutation changes the value stored in one binding. Shadowing creates an entirely new binding that reuses the old name — the compiler treats them as two separate variables.',
        },
      },
      {
        type: 'diagram',
        title: 'Following a value through shadowing',
        description: 'Each `let spaces = ...` line creates a new binding — the old one is shadowed, not overwritten.',
        diagram: {
          title: 'Shadowing "spaces" through three transformations',
          height: 240,
          frames: [
            {
              caption: 'First binding: spaces is the string "   " (three spaces).',
              nodes: [{ id: 'v1', label: 'spaces', sublabel: '"   "  (&str)', x: 20, y: 50, tone: 'default', shape: 'box', w: 26 }],
            },
            {
              caption: 'Second binding: a brand-new "spaces" shadows the first, now holding its length.',
              nodes: [
                { id: 'v1', label: 'spaces (old)', sublabel: '"   "  (&str)', x: 15, y: 25, tone: 'muted', shape: 'ghost', invalid: true },
                { id: 'v2', label: 'spaces', sublabel: '3  (usize)', x: 55, y: 60, tone: 'accent', shape: 'box' },
              ],
              edges: [{ from: 'v1', to: 'v2', dashed: true, label: 'shadowed' }],
            },
            {
              caption: 'Third binding: another new "spaces" shadows the second, now holding the doubled length.',
              nodes: [
                { id: 'v2', label: 'spaces (old)', sublabel: '3  (usize)', x: 20, y: 25, tone: 'muted', shape: 'ghost', invalid: true },
                { id: 'v3', label: 'spaces', sublabel: '6  (usize)', x: 60, y: 60, tone: 'success', shape: 'box' },
              ],
              edges: [{ from: 'v2', to: 'v3', dashed: true, label: 'shadowed' }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Shadowing through a data pipeline',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    let spaces = "   ";
    let spaces = spaces.len();
    println!("Number of spaces: {}", spaces);

    let value = "42";
    let value: i32 = value.parse().expect("not a number");
    let value = value * 2;
    println!("Doubled value: {}", value);
}`,
      },
      {
        type: 'exercise',
        title: 'Chain three transformations',
        exercise: {
          problem:
            'Given `let raw = "   Rust   ";`, shadow `raw` three times: first to its trimmed &str, then to its length (usize), then to that length multiplied by 10. Print the final value as "Final value: <n>".',
          starterCode: `fn main() {
    let raw = "   Rust   ";
    // TODO: shadow \`raw\` through: trimmed &str -> its length (usize) -> length * 10
    println!("Final value: {}", raw);
}`,
          hints: [
            { title: 'Trim first', body: 'Use `raw.trim()` to strip the leading/trailing whitespace, and shadow raw with the result.' },
            { title: 'Then measure', body: 'Shadow again with `raw.len()` to get a usize length.' },
            { title: 'Then multiply', body: 'Shadow one more time with `raw * 10`.' },
          ],
          solutionCode: `fn main() {
    let raw = "   Rust   ";
    let raw = raw.trim();
    let raw = raw.len();
    let raw = raw * 10;
    println!("Final value: {}", raw);
}`,
          solutionExplanation:
            '"Rust" has 4 characters, so after trim() and len(), raw becomes 4, and after multiplying by 10, it becomes 40 — each step is a fresh binding that shadows the last.',
          expectedOutputContains: ['Final value: 40'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the key difference between shadowing and mutation?',
            options: [
              { id: 'a', text: 'Shadowing changes the value in place; mutation creates a new binding.' },
              { id: 'b', text: 'Shadowing creates a brand-new binding (which can even have a different type); mutation changes the value stored in an existing mutable binding.' },
              { id: 'c', text: 'There is no difference — they compile to the same thing.' },
              { id: 'd', text: 'Mutation requires the `let` keyword; shadowing does not.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Shadowing declares a new variable with `let` (possibly of a different type) that hides the old one. Mutation requires `mut` and changes the value inside the same binding.',
          },
          {
            id: 'q2',
            prompt: 'Which of these is true about `const`?',
            options: [
              { id: 'a', text: 'const values can be marked mut for special cases.' },
              { id: 'b', text: 'const requires an explicit type annotation and a compile-time-computable value.' },
              { id: 'c', text: 'const can only be declared inside a function.' },
              { id: 'd', text: 'const behaves exactly like `let` but with a different keyword.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Unlike `let`, `const` always requires an explicit type and a value the compiler can compute ahead of time — and it can never be made mutable.',
          },
          {
            id: 'q3',
            prompt: 'Can shadowing change a variable\'s type, e.g. from &str to usize, using the same name?',
            options: [
              { id: 'a', text: 'No, Rust variables always keep their original type forever.' },
              { id: 'b', text: 'Yes — each `let` with the same name introduces a completely new, independently-typed binding.' },
              { id: 'c', text: 'Only if you use `mut`.' },
              { id: 'd', text: 'Only for numeric types.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Since shadowing creates a new variable rather than reusing storage, its type is independent of the shadowed one — going from &str to usize is exactly the pattern shown in this lesson.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 7. rb-primitive-types
  // ────────────────────────────────────────────────────────────────────────
  'rb-primitive-types': {
    id: 'rb-primitive-types',
    heroSummary:
      'Rust is statically typed with explicit-width numeric types, a real boolean, and a Unicode-aware character type. This lesson covers integers, floats, bool, char, and how much type inference you get for free.',
    dependencyChain: {
      learned: 'const, let, and shadowing.',
      why: 'Every value you store, every function parameter, and every struct field needs a concrete type — this is the vocabulary for all of them.',
      build: 'Fluency picking the right integer/float type, and reading Rust\'s type-inference behavior.',
      next: 'Next you\'ll combine these primitives into your first compound types: tuples and arrays.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Integers: signed, unsigned, and sized',
        body: [
          "Rust spells out exactly how many bits an integer uses, and whether it can be negative. `i32` is a 32-bit signed integer (Rust's default integer type when nothing else is inferred). `u8` is an 8-bit unsigned integer — useful for byte values 0-255.",
          "This precision matters once memory layout or interop is a concern (you'll see this again with FFI in the advanced track), but even as a beginner it helps: choosing u32 for something that logically can't be negative documents your intent and lets the compiler catch impossible values.",
        ],
      },
      {
        type: 'compare',
        title: 'Rust\'s primitive type families',
        columns: [
          {
            heading: 'Signed integers',
            body: ['i8, i16, i32, i64, i128', 'Can hold negative and positive values.', 'i32 is the default when Rust infers an integer type.'],
          },
          {
            heading: 'Unsigned integers',
            body: ['u8, u16, u32, u64, u128', 'Zero and positive values only.', 'u8 (0–255) is common for raw bytes.'],
          },
          {
            heading: 'Floating point',
            body: ['f32, f64', 'f64 is the default — same precision as a JS `number` or a C `double`.', 'Always has a decimal component, even for whole numbers (5.0, not 5).'],
          },
          {
            heading: 'Other primitives',
            body: ['bool — true or false, exactly 1 byte.', 'char — a single Unicode scalar value, 4 bytes (not just ASCII!).', 'usize/isize — pointer-sized integers, used for indexing.'],
          },
        ],
      },
      {
        type: 'code',
        title: 'Types in action, with inference',
        description: 'Rust infers types when it can, but you can always annotate explicitly with `: Type`.',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    let age: u8 = 30;
    let temperature: i32 = -10;
    let pi: f64 = 3.14159;
    let is_learning: bool = true;
    let grade: char = 'A';

    let inferred = 42;       // Rust infers i32
    let inferred_float = 2.5; // Rust infers f64

    println!("age: {} (u8)", age);
    println!("temperature: {} (i32)", temperature);
    println!("pi: {} (f64)", pi);
    println!("is_learning: {}", is_learning);
    println!("grade: {}", grade);
    println!("inferred: {}, inferred_float: {}", inferred, inferred_float);

    let max_u8 = u8::MAX;
    println!("u8::MAX = {}", max_u8);
}`,
      },
      {
        type: 'explain',
        title: 'A word of caution: overflow',
        body: [
          "Because integer types have a fixed size, they have a maximum (and minimum) value. u8::MAX is 255 — try to store 256 in a u8 and, at best, the compiler catches it if it's a literal; at worst, arithmetic that overflows at runtime will panic in debug builds (and silently wrap around in release builds, which is its own hazard).",
          "You don't need to memorize every limit today — just remember that Rust's integer types are not infinite, unlike JavaScript numbers or Python's ints, and the compiler will warn you about obviously-too-large literals.",
        ],
      },
      {
        type: 'exercise',
        title: 'Annotate the types',
        exercise: {
          problem:
            'Add explicit, correctly-sized type annotations to each variable: user_id should be u32, account_balance should be f64, is_active should be bool, and plan_code should be char. Keep the println! calls unchanged.',
          starterCode: `fn main() {
    // TODO: add explicit, correctly-sized type annotations to each variable below
    let user_id = 48219;
    let account_balance = -152.75;
    let is_active = true;
    let plan_code = 'P';

    println!("user_id: {}", user_id);
    println!("account_balance: {}", account_balance);
    println!("is_active: {}", is_active);
    println!("plan_code: {}", plan_code);
}`,
          hints: [
            { title: 'Syntax reminder', body: 'Type annotations go right after the variable name: `let name: Type = value;`.' },
            { title: 'Pick sizes that fit', body: 'user_id is always positive, so an unsigned type (u32) fits. account_balance can be negative and has a decimal, so it needs a float (f64).' },
            { title: 'bool and char are already concrete', body: 'true/false is always bool, and a single-quoted letter is always char — you just need to write the annotation.' },
          ],
          solutionCode: `fn main() {
    let user_id: u32 = 48219;
    let account_balance: f64 = -152.75;
    let is_active: bool = true;
    let plan_code: char = 'P';

    println!("user_id: {}", user_id);
    println!("account_balance: {}", account_balance);
    println!("is_active: {}", is_active);
    println!("plan_code: {}", plan_code);
}`,
          solutionExplanation:
            'Each annotation documents intent and lets the compiler verify it: u32 for a non-negative id, f64 for a signed decimal balance, bool for the flag, and char for the single letter code.',
          expectedOutputContains: ['user_id: 48219', 'account_balance: -152.75', 'is_active: true', 'plan_code: P'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the default integer type Rust infers when you write `let x = 10;` with no annotation?',
            options: [
              { id: 'a', text: 'u8' },
              { id: 'b', text: 'i32' },
              { id: 'c', text: 'i64' },
              { id: 'd', text: 'usize' },
            ],
            correctOptionIds: ['b'],
            explanation: 'i32 is Rust\'s default integer type — it\'s a good general-purpose size on virtually all modern hardware.',
          },
          {
            id: 'q2',
            prompt: 'Which type would you use to represent a single Unicode character, like \'A\' or \'β\' or \'🦀\'?',
            options: [
              { id: 'a', text: 'u8' },
              { id: 'b', text: 'str' },
              { id: 'c', text: 'char' },
              { id: 'd', text: 'bool' },
            ],
            correctOptionIds: ['c'],
            explanation: 'char represents a single Unicode scalar value and is always 4 bytes — that\'s why it can hold emoji like 🦀, unlike a plain byte.',
          },
          {
            id: 'q3',
            prompt: 'Why should you care about integer overflow in Rust even though the compiler is otherwise very strict?',
            options: [
              { id: 'a', text: 'Rust integers automatically grow in size, so overflow is impossible.' },
              { id: 'b', text: 'A fixed-size integer type has a maximum value; exceeding it can panic in debug builds or silently wrap in release builds.' },
              { id: 'c', text: 'Overflow only matters for floating point numbers, not integers.' },
              { id: 'd', text: 'The compiler always converts overflowing values to f64 automatically.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Unlike Python\'s arbitrary-precision ints or JS numbers, Rust\'s fixed-width integers (u8, i32, etc.) have hard limits — overflow behavior differs between debug (panic) and release (wrap) builds, so it\'s worth being aware of.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 8. rb-tuples-arrays
  // ────────────────────────────────────────────────────────────────────────
  'rb-tuples-arrays': {
    id: 'rb-tuples-arrays',
    heroSummary:
      'Tuples group values of different types together; arrays hold a fixed number of values of the same type. Both live on the stack with a size known at compile time.',
    dependencyChain: {
      learned: 'The primitive types: integers, floats, bool, char.',
      why: 'Tuples and arrays are your first compound types — the simplest way to group related values.',
      build: 'The ability to destructure tuples and safely index arrays, plus a gut feeling for out-of-bounds bugs.',
      next: 'Vec and slices (Level 2) are the flexible, heap-allocated cousins of the array you\'re about to learn.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Tuples: fixed-size, mixed types',
        body: [
          "A tuple groups a fixed number of values, which can be different types, into one compound value: `(3.0, 4.0, \"origin-offset\")` is a `(f64, f64, &str)`. Once created, its length can never change.",
          "You can pull values out either by `.0`, `.1`, `.2` indexing, or by destructuring into named variables in one line: `let (x, y, label) = point;`.",
        ],
      },
      {
        type: 'explain',
        title: 'Arrays: fixed-size, same type',
        body: [
          "An array holds multiple values of the *same* type, with a length fixed at compile time: `[i32; 5]` is exactly 5 i32s, no more, no less. Arrays are indexed with square brackets starting at 0, just like most languages you know.",
          "Because the length is fixed and known at compile time, an array lives entirely on the stack — no heap allocation, no runtime resizing. That's fast, but it's also why Rust needs a growable alternative (Vec) for cases where you don't know the size upfront — you'll meet Vec in the CLI Todo project later in this level.",
        ],
      },
      {
        type: 'diagram',
        title: 'Tuples and arrays in memory',
        description: 'Both are laid out contiguously, back-to-back, with no gaps and no headers.',
        diagram: {
          title: 'Contiguous layout, indexed by position',
          height: 260,
          frames: [
            {
              caption: 'A tuple (f64, f64, &str) — three different types, packed together.',
              nodes: [
                { id: 't0', label: '.0', sublabel: '3.0 (f64)', x: 20, y: 40, tone: 'stack', shape: 'box' },
                { id: 't1', label: '.1', sublabel: '4.0 (f64)', x: 45, y: 40, tone: 'stack', shape: 'box' },
                { id: 't2', label: '.2', sublabel: '"origin-offset" (&str)', x: 75, y: 40, tone: 'stack', shape: 'box', w: 26 },
              ],
            },
            {
              caption: 'An array [i32; 5] — five values, all the same type, indexed 0 through 4.',
              nodes: [
                { id: 'a0', label: '[0]', sublabel: '88', x: 12, y: 75, tone: 'accent', shape: 'box' },
                { id: 'a1', label: '[1]', sublabel: '92', x: 28, y: 75, tone: 'accent', shape: 'box' },
                { id: 'a2', label: '[2]', sublabel: '79', x: 44, y: 75, tone: 'accent', shape: 'box' },
                { id: 'a3', label: '[3]', sublabel: '100', x: 60, y: 75, tone: 'accent', shape: 'box' },
                { id: 'a4', label: '[4]', sublabel: '65', x: 76, y: 75, tone: 'accent', shape: 'box' },
              ],
            },
            {
              caption: 'Indexing scores[0] reaches straight into that slot — no searching required.',
              nodes: [
                { id: 'a0', label: '[0]', sublabel: '88 ← scores[0]', x: 12, y: 75, tone: 'success', shape: 'box' },
                { id: 'a1', label: '[1]', sublabel: '92', x: 28, y: 75, tone: 'muted', shape: 'box' },
                { id: 'a2', label: '[2]', sublabel: '79', x: 44, y: 75, tone: 'muted', shape: 'box' },
                { id: 'a3', label: '[3]', sublabel: '100', x: 60, y: 75, tone: 'muted', shape: 'box' },
                { id: 'a4', label: '[4]', sublabel: '65', x: 76, y: 75, tone: 'muted', shape: 'box' },
              ],
            },
            {
              caption: 'scores[5] would reach past the end — Rust checks bounds and panics rather than reading garbage memory.',
              nodes: [
                { id: 'a4', label: '[4]', sublabel: '65  (last valid index)', x: 60, y: 75, tone: 'muted', shape: 'box' },
                { id: 'a5', label: '[5]', sublabel: 'out of bounds!', x: 80, y: 75, tone: 'danger', shape: 'ghost', invalid: true },
              ],
              edges: [{ from: 'a4', to: 'a5', dashed: true, tone: 'danger', label: 'panics at runtime' }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Destructuring a tuple, indexing an array',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    let point: (f64, f64, &str) = (3.0, 4.0, "origin-offset");
    let (x, y, label) = point;
    println!("x = {}, y = {}, label = {}", x, y, label);

    let scores = [88, 92, 79, 100, 65];
    println!("First score: {}", scores[0]);
    println!("Number of scores: {}", scores.len());

    let mut total = 0;
    for i in 0..scores.len() {
        total += scores[i];
    }
    println!("Total: {}", total);
}`,
      },
      {
        type: 'debug',
        title: 'Fix the runtime panic',
        challenge: {
          problem: 'This program compiles fine but panics when run. Find the out-of-bounds access and fix it so the program handles a missing index gracefully instead of crashing.',
          brokenCode: `fn main() {
    let scores = [10, 20, 30, 40, 50];
    let index = 5;
    println!("Looking up index {}", index);
    println!("Score: {}", scores[index]);
}`,
          bugExplanation:
            'The array `scores` has 5 elements, valid at indices 0 through 4. Index 5 is one past the end. Direct indexing with `[]` panics at runtime with "index out of bounds" — arrays don\'t silently return garbage or None, they check bounds and crash loudly instead.',
          hints: [
            { title: 'Count the elements', body: 'scores has 5 items — what are the valid index values?' },
            { title: 'Rust checks bounds at runtime', body: 'Unlike C, Rust never reads past the end of an array silently — it panics instead. That protects you, but you still need to avoid triggering it.' },
            { title: 'Use a safe accessor', body: 'scores.get(index) returns an Option<&i32> — Some(value) if in bounds, None if not — letting you handle the missing case without panicking.' },
          ],
          fixedCode: `fn main() {
    let scores = [10, 20, 30, 40, 50];
    let index = 5;
    println!("Looking up index {}", index);
    match scores.get(index) {
        Some(score) => println!("Score: {}", score),
        None => println!("No score at index {} (array only has {} elements)", index, scores.len()),
    }
}`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the key difference between a tuple and an array in Rust?',
            options: [
              { id: 'a', text: 'A tuple can hold mixed types; an array must hold all-the-same type.' },
              { id: 'b', text: 'Arrays can grow at runtime; tuples cannot.' },
              { id: 'c', text: 'Tuples live on the heap; arrays live on the stack.' },
              { id: 'd', text: 'There is no meaningful difference.' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Tuples like (f64, f64, &str) can mix types. Arrays like [i32; 5] must be homogeneous — every element is the same type, and neither can resize.',
          },
          {
            id: 'q2',
            prompt: 'What happens when you index an array out of bounds with `arr[i]` in Rust?',
            options: [
              { id: 'a', text: 'It silently returns a default value like 0.' },
              { id: 'b', text: 'It returns None.' },
              { id: 'c', text: 'The program panics at runtime with an "index out of bounds" error.' },
              { id: 'd', text: 'It reads whatever garbage memory happens to be there, like in C.' },
            ],
            correctOptionIds: ['c'],
            explanation: 'Direct `[]` indexing performs a bounds check and panics if the index is invalid — this is exactly the kind of memory-safety bug Rust prevents from becoming a silent, exploitable read.',
          },
          {
            id: 'q3',
            prompt: 'Given `let (a, b) = (1, "two");`, what is the type of `a`?',
            options: [
              { id: 'a', text: 'i32 (or another inferred integer type)' },
              { id: 'b', text: '&str' },
              { id: 'c', text: 'A tuple' },
              { id: 'd', text: 'bool' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Destructuring `(a, b) = (1, "two")` binds `a` to the first tuple element (an integer, inferred as i32) and `b` to the second (&str).',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 9. rb-functions
  // ────────────────────────────────────────────────────────────────────────
  'rb-functions': {
    id: 'rb-functions',
    heroSummary:
      'Rust functions have explicit parameter and return types, and — unlike most mainstream languages — nearly everything in Rust is an expression that produces a value, including the body of a function.',
    dependencyChain: {
      learned: 'Tuples and arrays as fixed-size compound types.',
      why: 'Functions are how you organize logic, and Rust\'s "everything is an expression" philosophy changes how you write even simple return statements.',
      build: 'The ability to read and write fn signatures, and to spot the difference between an expression and a statement.',
      next: 'Next you\'ll use expressions inside if/match — Rust\'s branching constructs, which are themselves expressions.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Function syntax',
        body: [
          "A Rust function looks like: `fn name(param: Type) -> ReturnType { ... }`. Parameter types are required — Rust never infers them from how you call the function. The return type after `->` is also required if the function returns anything other than the empty tuple `()`.",
          "Function names use snake_case by convention (`is_even`, not `isEven`), and Rust does not care where a function is defined relative to where it's called — you can call a function before its definition appears in the file.",
        ],
      },
      {
        type: 'explain',
        title: 'Expressions vs statements — the big one',
        body: [
          "A statement performs an action and produces no value (technically, it produces the unit value `()`). An expression evaluates to a value. In Rust, `if`, `match`, and even a block `{ ... }` are expressions — they can produce a value directly.",
          "This means a function's return value is usually just its last expression, with no `return` keyword and no semicolon on that final line. Adding a semicolon turns an expression into a statement, discarding its value — this is one of the most common beginner mix-ups.",
        ],
        callout: {
          tone: 'warning',
          text: 'A semicolon changes meaning! `x * x` is an expression (a value). `x * x;` is a statement (the value is computed and thrown away). Forgetting to drop the trailing semicolon on a function\'s last line is a classic first-week Rust bug.',
        },
      },
      {
        type: 'code',
        title: 'Implicit return vs explicit return',
        description: 'Both functions return correctly — but square() uses the idiomatic tail-expression style.',
        language: 'rust',
        runnable: true,
        code: `fn square(n: i32) -> i32 {
    n * n
}

fn shout(message: &str) -> String {
    return message.to_uppercase();
}

fn main() {
    let result = square(6);
    println!("6 squared is {}", result);
    println!("{}", shout("we return early here"));
}`,
      },
      {
        type: 'exercise',
        title: 'Write a function from a signature',
        exercise: {
          problem: 'Implement `fn is_even(n: i32) -> bool` so it returns true when n is even and false otherwise, using the remainder operator `%`. Do not change main().',
          starterCode: `fn is_even(n: i32) -> bool {
    // TODO: return true if n is even, false otherwise
    true
}

fn main() {
    println!("{}", is_even(4));
    println!("{}", is_even(7));
}`,
          hints: [
            { title: 'The remainder operator', body: 'n % 2 gives the remainder of n divided by 2 — it is 0 for even numbers.' },
            { title: 'Comparisons are expressions too', body: '`n % 2 == 0` evaluates directly to a bool — you can return it as the function\'s tail expression.' },
            { title: 'Drop the semicolon on the last line', body: 'To return it implicitly, write `n % 2 == 0` with no trailing semicolon as the function\'s final line.' },
          ],
          solutionCode: `fn is_even(n: i32) -> bool {
    n % 2 == 0
}

fn main() {
    println!("{}", is_even(4));
    println!("{}", is_even(7));
}`,
          solutionExplanation:
            '`n % 2 == 0` is a single expression that evaluates to a bool. Because it\'s the last line with no semicolon, it becomes the function\'s return value — no `return` keyword needed.',
          expectedOutputContains: ['true', 'false'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Does `let y = (let x = 5);` compile in Rust?',
            options: [
              { id: 'a', text: 'Yes — x becomes 5 and y becomes 5 too.' },
              { id: 'b', text: 'No — `let x = 5` is a statement, not an expression, so it has no value to assign to y.' },
              { id: 'c', text: 'Yes, but only inside a function.' },
              { id: 'd', text: 'Yes, y becomes the unit value () and x becomes 5.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Unlike C, `let x = 5` is a statement in Rust — it produces no value at all, so trying to use it as the right-hand side of another assignment is a compile error.',
          },
          {
            id: 'q2',
            prompt: 'What does adding a semicolon to a function\'s final line do?',
            options: [
              { id: 'a', text: 'Nothing, semicolons are purely cosmetic in Rust.' },
              { id: 'b', text: 'It turns that line into a statement, discarding its value, which typically breaks an implicit return.' },
              { id: 'c', text: 'It forces the function to return early.' },
              { id: 'd', text: 'It converts the expression into a String.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A trailing semicolon converts an expression into a statement whose value is `()` — if that was meant to be your return value, you\'ll get a type-mismatch error instead.',
          },
          {
            id: 'q3',
            prompt: 'Which parts of a function signature does Rust require you to write explicitly?',
            options: [
              { id: 'a', text: 'Nothing — Rust infers all types from usage, like TypeScript.' },
              { id: 'b', text: 'Parameter types always; the return type too, whenever it is not the unit type ().' },
              { id: 'c', text: 'Only the return type; parameters are always inferred.' },
              { id: 'd', text: 'Only the function name; types are optional everywhere.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Rust never infers a function\'s parameter types, and requires an explicit `-> Type` for any non-unit return value — this is part of why function signatures double as documentation.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 10. rb-if-match
  // ────────────────────────────────────────────────────────────────────────
  'rb-if-match': {
    id: 'rb-if-match',
    heroSummary:
      'if/else branches on a boolean condition; match branches on the shape or value of data, and the compiler forces you to handle every possible case. Both are expressions that can produce a value.',
    dependencyChain: {
      learned: 'Functions, expressions, and statements.',
      why: 'Branching logic is unavoidable in any real program, and match\'s exhaustiveness is the foundation for safe error handling later.',
      build: 'Comfort writing if-as-expression and match with literal values and ranges.',
      next: 'Loops are next — the last piece of control flow before your first real projects.',
    },
    sections: [
      {
        type: 'explain',
        title: 'if as an expression',
        body: [
          "if/else in Rust works like you'd expect for control flow, but because it's an expression, you can assign its result directly: `let x = if cond { a } else { b };`. Every branch must produce the same type, and if you use it as an expression, you must include an `else`.",
          "match compares a value against a series of patterns — literal values, ranges, or more complex shapes you'll see later with enums — and runs the code for the first arm that matches.",
        ],
      },
      {
        type: 'diagram',
        title: 'Watching match pick a branch',
        description: 'Only one arm ever runs — watch how a different input lights up a different path.',
        diagram: {
          title: 'match day { ... } for three different inputs',
          height: 280,
          frames: [
            {
              caption: 'Input: day = 1. The match checks each arm in order.',
              nodes: [
                { id: 'input', label: 'day = 1', x: 10, y: 50, tone: 'accent', shape: 'pill' },
                { id: 'a1', label: '1 =>', sublabel: '"Monday"', x: 45, y: 15, tone: 'default', shape: 'box' },
                { id: 'a2', label: '2 =>', sublabel: '"Tuesday"', x: 45, y: 40, tone: 'muted', shape: 'box' },
                { id: 'a3', label: '4..=5 =>', sublabel: '"Almost weekend"', x: 45, y: 65, tone: 'muted', shape: 'box' },
                { id: 'a4', label: '_ =>', sublabel: '"Weekend!"', x: 45, y: 90, tone: 'muted', shape: 'box' },
              ],
            },
            {
              caption: '1 matches the first arm — "Monday" is chosen, no other arm is checked.',
              nodes: [
                { id: 'input', label: 'day = 1', x: 10, y: 50, tone: 'accent', shape: 'pill' },
                { id: 'a1', label: '1 =>', sublabel: '"Monday"  ✓ MATCH', x: 45, y: 15, tone: 'success', shape: 'box' },
                { id: 'a2', label: '2 =>', sublabel: '"Tuesday"', x: 45, y: 40, tone: 'muted', shape: 'box' },
                { id: 'a3', label: '4..=5 =>', sublabel: '"Almost weekend"', x: 45, y: 65, tone: 'muted', shape: 'box' },
                { id: 'a4', label: '_ =>', sublabel: '"Weekend!"', x: 45, y: 90, tone: 'muted', shape: 'box' },
              ],
              edges: [{ from: 'input', to: 'a1', animated: true, tone: 'success' }],
            },
            {
              caption: 'New input: day = 5. This time the range arm (4..=5) matches.',
              nodes: [
                { id: 'input', label: 'day = 5', x: 10, y: 50, tone: 'accent', shape: 'pill' },
                { id: 'a1', label: '1 =>', sublabel: '"Monday"', x: 45, y: 15, tone: 'muted', shape: 'box' },
                { id: 'a2', label: '2 =>', sublabel: '"Tuesday"', x: 45, y: 40, tone: 'muted', shape: 'box' },
                { id: 'a3', label: '4..=5 =>', sublabel: '"Almost weekend"  ✓ MATCH', x: 45, y: 65, tone: 'success', shape: 'box' },
                { id: 'a4', label: '_ =>', sublabel: '"Weekend!"', x: 45, y: 90, tone: 'muted', shape: 'box' },
              ],
              edges: [{ from: 'input', to: 'a3', animated: true, tone: 'success' }],
            },
            {
              caption: 'New input: day = 9. No specific arm matches — the catch-all `_` arm handles it.',
              nodes: [
                { id: 'input', label: 'day = 9', x: 10, y: 50, tone: 'accent', shape: 'pill' },
                { id: 'a1', label: '1 =>', sublabel: '"Monday"', x: 45, y: 15, tone: 'muted', shape: 'box' },
                { id: 'a2', label: '2 =>', sublabel: '"Tuesday"', x: 45, y: 40, tone: 'muted', shape: 'box' },
                { id: 'a3', label: '4..=5 =>', sublabel: '"Almost weekend"', x: 45, y: 65, tone: 'muted', shape: 'box' },
                { id: 'a4', label: '_ =>', sublabel: '"Weekend!"  ✓ MATCH', x: 45, y: 90, tone: 'success', shape: 'box' },
              ],
              edges: [{ from: 'input', to: 'a4', animated: true, tone: 'success' }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'if-as-expression and match with ranges',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    let temp = 15;

    let description = if temp < 0 {
        "freezing"
    } else if temp < 15 {
        "cold"
    } else if temp < 25 {
        "mild"
    } else {
        "hot"
    };
    println!("It's {} degrees, which is {}", temp, description);

    let day = 3;
    match day {
        1 => println!("Monday"),
        2 => println!("Tuesday"),
        3 => println!("Wednesday"),
        4..=5 => println!("Almost the weekend"),
        _ => println!("Weekend!"),
    }
}`,
      },
      {
        type: 'exercise',
        title: 'Grade classifier',
        exercise: {
          problem:
            'Implement `fn classify(score: i32) -> &\'static str` using match with inclusive ranges: 90-100 → "A", 80-89 → "B", 70-79 → "C", anything else → "F". Do not change main().',
          starterCode: `fn classify(score: i32) -> &'static str {
    // TODO: match score into "A" (90-100), "B" (80-89), "C" (70-79), else "F"
    "F"
}

fn main() {
    println!("{}", classify(95));
    println!("{}", classify(82));
    println!("{}", classify(40));
}`,
          hints: [
            { title: 'Ranges in match arms', body: 'Use `90..=100 => "A",` for an inclusive range covering 90 through 100.' },
            { title: 'Order matters top to bottom', body: 'match checks arms in order and stops at the first match — list ranges from highest to lowest.' },
            { title: 'Always end with a catch-all', body: 'The `_ => "F"` arm handles every score not covered by the earlier ranges, which is also what makes the match exhaustive.' },
          ],
          solutionCode: `fn classify(score: i32) -> &'static str {
    match score {
        90..=100 => "A",
        80..=89 => "B",
        70..=79 => "C",
        _ => "F",
    }
}

fn main() {
    println!("{}", classify(95));
    println!("{}", classify(82));
    println!("{}", classify(40));
}`,
          solutionExplanation:
            'Each range arm covers a band of scores; because match is exhaustive, the final `_` arm is required to cover every i32 not already covered — including negative numbers and anything above 100.',
          expectedOutputContains: ['A', 'B', 'F'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does Rust require a match expression to be exhaustive (cover every possible value)?',
            options: [
              { id: 'a', text: 'It is a style preference with no functional benefit.' },
              { id: 'b', text: 'So the compiler can guarantee, at compile time, that no possible input value falls through with no defined behavior.' },
              { id: 'c', text: 'Because match cannot have more than 4 arms.' },
              { id: 'd', text: 'Only to make the syntax consistent with if/else.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Exhaustiveness is a real safety guarantee — it means there is no code path where a value silently falls through unhandled, which becomes especially valuable once you match on Option and Result.',
          },
          {
            id: 'q2',
            prompt: 'What does the `_` pattern do in a match arm?',
            options: [
              { id: 'a', text: 'It matches only the literal underscore character.' },
              { id: 'b', text: 'It acts as a catch-all, matching any value not matched by earlier arms.' },
              { id: 'c', text: 'It causes a compile error if reached.' },
              { id: 'd', text: 'It is required only for numeric types.' },
            ],
            correctOptionIds: ['b'],
            explanation: '`_` is a wildcard pattern — it matches anything, which is exactly why it\'s commonly used as the final arm to satisfy exhaustiveness.',
          },
          {
            id: 'q3',
            prompt: 'Given `let x = if true { 5 } else { "five" };`, what happens?',
            options: [
              { id: 'a', text: 'x becomes 5, since the condition is true.' },
              { id: 'b', text: 'This is a compile error — both branches of an if-expression must produce the same type.' },
              { id: 'c', text: 'x becomes "5" as a string.' },
              { id: 'd', text: 'Rust automatically converts 5 to "5" to match types.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Because if/else is an expression whose overall type must be known, both branches must agree on a single type — mixing i32 and &str here is a type-mismatch compile error.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 11. rb-loops
  // ────────────────────────────────────────────────────────────────────────
  'rb-loops': {
    id: 'rb-loops',
    heroSummary:
      'Rust has three loop constructs: for (iterate over a range or collection), while (loop while a condition holds), and loop (loop forever until you break) — and loop can even hand back a value from its break.',
    dependencyChain: {
      learned: 'if/else and match as branching, value-producing expressions.',
      why: 'Loops are the last fundamental control-flow tool before you start building real projects.',
      build: 'Fluency choosing between for/while/loop, and using break with a value and loop labels.',
      next: 'Iterators (Level 2) are a more powerful, chainable version of the for loop you just learned.',
    },
    sections: [
      {
        type: 'explain',
        title: 'for, while, and loop',
        body: [
          "`for` iterates over a range (`0..5`) or any collection, and is the loop you'll reach for most often — it's concise and there's no off-by-one risk since Rust manages the iteration for you.",
          "`while` runs as long as a condition stays true, checked before each iteration — useful when you don't know the exact number of iterations upfront.",
          "`loop` runs forever until you explicitly `break` out of it. Unlike the other two, `loop` is an expression: `break value;` can hand a value back out of the loop, which you can assign directly to a variable.",
        ],
      },
      {
        type: 'diagram',
        title: 'loop returning a value via break',
        description: 'Each iteration bumps a counter; once it hits 5, break hands the doubled counter out as the loop\'s result.',
        diagram: {
          title: 'let result = loop { ... break counter * 2; };',
          height: 240,
          frames: [
            {
              caption: 'counter starts at 0, before the loop begins.',
              nodes: [{ id: 'c', label: 'counter', sublabel: '0', x: 20, y: 50, tone: 'default', shape: 'box' }],
            },
            {
              caption: 'Each iteration increments counter by 1: 1, 2, 3, 4...',
              nodes: [
                { id: 'c', label: 'counter', sublabel: '4', x: 20, y: 50, tone: 'accent', shape: 'box' },
                { id: 'check', label: 'counter == 5?', sublabel: 'not yet — loop again', x: 55, y: 50, tone: 'muted', shape: 'ghost' },
              ],
              edges: [{ from: 'c', to: 'check', animated: true }],
            },
            {
              caption: 'counter reaches 5 — the break condition is met.',
              nodes: [
                { id: 'c', label: 'counter', sublabel: '5', x: 20, y: 50, tone: 'success', shape: 'box' },
                { id: 'check', label: 'counter == 5?', sublabel: 'yes!', x: 55, y: 50, tone: 'success', shape: 'ghost' },
              ],
              edges: [{ from: 'c', to: 'check', animated: true, tone: 'success' }],
            },
            {
              caption: '`break counter * 2;` exits the loop, handing 10 out as its value.',
              nodes: [
                { id: 'c', label: 'counter', sublabel: '5', x: 15, y: 50, tone: 'muted', shape: 'box' },
                { id: 'result', label: 'result', sublabel: '10  (5 * 2)', x: 60, y: 50, tone: 'success', shape: 'box' },
              ],
              edges: [{ from: 'c', to: 'result', animated: true, label: 'break counter * 2', tone: 'success' }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'for over a range, and a labeled outer break',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 5 {
            break counter * 2;
        }
    };
    println!("Loop result: {}", result);

    for i in 1..=3 {
        println!("for i = {}", i);
    }

    let mut count = 0;
    'outer: for x in 0..5 {
        for y in 0..5 {
            if x * y > 6 {
                println!("breaking outer at x={}, y={}", x, y);
                break 'outer;
            }
            count += 1;
        }
    }
    println!("count = {}", count);
}`,
      },
      {
        type: 'exercise',
        title: 'Sum the even numbers',
        exercise: {
          problem: 'Using a for loop over `1..=10`, add every even number to `sum`, then print "Sum of even numbers 1-10: <n>".',
          starterCode: `fn main() {
    let mut sum = 0;
    // TODO: loop through 1..=10 and add only the even numbers to \`sum\`
    println!("Sum of even numbers 1-10: {}", sum);
}`,
          hints: [
            { title: 'Iterate inclusively', body: 'for n in 1..=10 iterates n = 1, 2, ..., 10 (the ..= makes 10 inclusive).' },
            { title: 'Check evenness', body: 'Use `if n % 2 == 0` inside the loop to filter for even numbers.' },
            { title: 'Accumulate', body: 'Use `sum += n;` to add a matching number into the running total.' },
          ],
          solutionCode: `fn main() {
    let mut sum = 0;
    for n in 1..=10 {
        if n % 2 == 0 {
            sum += n;
        }
    }
    println!("Sum of even numbers 1-10: {}", sum);
}`,
          solutionExplanation: '2 + 4 + 6 + 8 + 10 = 30. The loop visits every integer from 1 to 10 inclusive, and the if-guard only accumulates the even ones.',
          expectedOutputContains: ['Sum of even numbers 1-10: 30'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Which loop construct can directly produce a value via `break value;`?',
            options: [
              { id: 'a', text: 'for' },
              { id: 'b', text: 'while' },
              { id: 'c', text: 'loop' },
              { id: 'd', text: 'None of them can produce a value.' },
            ],
            correctOptionIds: ['c'],
            explanation: '`loop` is the only one of the three that is itself an expression producing a value — `break value;` sets what that value is.',
          },
          {
            id: 'q2',
            prompt: 'What does `1..=10` mean in a for loop, compared to `1..10`?',
            options: [
              { id: 'a', text: 'They are identical.' },
              { id: 'b', text: '1..=10 includes 10 as the last value; 1..10 stops at 9.' },
              { id: 'c', text: '1..=10 starts at 0; 1..10 starts at 1.' },
              { id: 'd', text: '1..=10 is only valid for floats.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The `..=` operator makes a range inclusive of its upper bound, while plain `..` is exclusive — this is a very common off-by-one trap if you mix them up.',
          },
          {
            id: 'q3',
            prompt: 'What is the purpose of a loop label like `\'outer:` before a for loop?',
            options: [
              { id: 'a', text: 'It names the loop variable.' },
              { id: 'b', text: 'It lets `break` or `continue` target that specific outer loop from inside a nested loop.' },
              { id: 'c', text: 'It is required syntax for every for loop.' },
              { id: 'd', text: 'It converts the for loop into a while loop.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Without a label, `break` only exits the innermost loop. `break \'outer;` lets you exit a specifically labeled outer loop from within nested loops.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 12. rb-proj-hello-world
  // ────────────────────────────────────────────────────────────────────────
  'rb-proj-hello-world': {
    id: 'rb-proj-hello-world',
    heroSummary:
      'A light victory lap: revisit "Hello, world!" now that you know what println! actually is — a macro, not a function — and walk through exactly what cargo does to get it on screen.',
    dependencyChain: {
      learned: 'The full cargo new / run / build workflow.',
      why: 'Locking in the smallest possible complete project before adding real logic in the next five projects.',
      build: 'A confirmed, running project and the vocabulary to describe what println! actually is.',
      next: 'The Command-Line Calculator project adds real logic: reading input and branching on it.',
    },
    sections: [
      {
        type: 'explain',
        title: 'println! is a macro, not a function',
        body: [
          "Notice the `!` after println — that marks it as a macro, not a regular function call. Macros run at compile time and expand into other code before your program is even compiled; that's how println! can accept a variable number of arguments and check your format string against them at compile time.",
          "You don't need to understand how macros are written yet — just recognize the pattern: `name!(...)` is a macro invocation, `name(...)` is a function call. You'll see println!, vec!, and format! constantly from here on.",
        ],
      },
      {
        type: 'terminal',
        title: 'From zero to running',
        lines: [
          { prompt: '$', text: 'cargo new hello_world' },
          { text: '     Created binary (application) `hello_world` package' },
          { prompt: '$', text: 'cd hello_world' },
          { prompt: '$', text: 'cargo run' },
          { text: '   Compiling hello_world v0.1.0 (/home/you/hello_world)' },
          { text: '    Finished dev [unoptimized + debuginfo] target(s) in 0.31s' },
          { text: '     Running `target/debug/hello_world`' },
          { text: 'Hello, world!' },
        ],
      },
      {
        type: 'code',
        title: 'The complete program',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    println!("Hello, world!");
}`,
      },
      {
        type: 'project-steps',
        title: 'Project checklist',
        goals: [
          'Create a fresh project with cargo new.',
          'Understand why println! has a `!`.',
          'Successfully run the project with cargo run.',
        ],
        steps: [
          {
            title: 'Scaffold the project',
            description: 'Run cargo new hello_world and cd into the generated directory. Cargo has already written a working main.rs for you.',
            code: `cargo new hello_world
cd hello_world`,
          },
          {
            title: 'Read main.rs before running it',
            description: 'Open src/main.rs and confirm you can explain every token: `fn main()` is the entry point, `println!` is a macro call, and the string in quotes is what gets printed.',
            code: `fn main() {
    println!("Hello, world!");
}`,
          },
          {
            title: 'Run it',
            description: 'cargo run compiles and immediately executes the binary. You should see "Hello, world!" printed to your terminal.',
            code: 'cargo run',
          },
        ],
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does println! end with a `!`?',
            options: [
              { id: 'a', text: 'It is just decorative Rust style, with no meaning.' },
              { id: 'b', text: 'It marks println! as a macro rather than a regular function.' },
              { id: 'c', text: 'It means the call is guaranteed to panic.' },
              { id: 'd', text: 'It is required only when printing more than one value.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The `!` is how Rust distinguishes macro invocations (name!(...)) from ordinary function calls (name(...)) — macros are expanded at compile time.',
          },
          {
            id: 'q2',
            prompt: 'What command both compiles and runs your project in one step?',
            options: [
              { id: 'a', text: 'cargo build' },
              { id: 'b', text: 'cargo check' },
              { id: 'c', text: 'cargo run' },
              { id: 'd', text: 'cargo new' },
            ],
            correctOptionIds: ['c'],
            explanation: 'cargo run compiles the project (recompiling only if something changed) and then immediately executes the resulting binary.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 13. rb-proj-calculator
  // ────────────────────────────────────────────────────────────────────────
  'rb-proj-calculator': {
    id: 'rb-proj-calculator',
    heroSummary:
      'Build a small command-line calculator: read two numbers and an operator from stdin, match on the operator, and print the result — with a divide-by-zero check along the way.',
    dependencyChain: {
      learned: 'match, functions, and basic types.',
      why: 'This is your first project that reads real input and has to handle it defensively.',
      build: 'A working calculator, and the standard stdin-read-parse pattern you\'ll reuse constantly.',
      next: 'The Temperature Converter project reuses this "functions + f64 math" pattern without any stdin handling.',
    },
    sections: [
      {
        type: 'explain',
        title: 'The plan',
        body: [
          "The calculator reads two numbers and an operator from standard input (the terminal), one line at a time, using std::io::stdin().read_line(). Each line comes in as a String, so it needs `.trim()` (to strip the trailing newline) and `.parse::<f64>()` (to convert text into a number) before you can do math with it.",
          "Once you have two f64 values and an operator string, a match on the operator picks the right arithmetic — with a special case for division by zero, since dividing by 0.0 wouldn't crash (floats have infinity), but a real calculator should still catch and report it clearly.",
        ],
      },
      {
        type: 'diagram',
        title: 'The calculator\'s data flow',
        description: 'Text in, a validated number out, at each step.',
        diagram: {
          title: 'stdin → trim → parse → match → print',
          height: 220,
          frames: [
            {
              caption: 'Read a raw line of text from the user.',
              nodes: [{ id: 'raw', label: '"  4.5\\n"', sublabel: 'raw stdin line', x: 15, y: 50, tone: 'default', shape: 'box', w: 24 }],
            },
            {
              caption: 'trim() strips the surrounding whitespace and newline.',
              nodes: [
                { id: 'raw', label: '"  4.5\\n"', sublabel: 'raw stdin line', x: 12, y: 50, tone: 'muted', shape: 'box', w: 22 },
                { id: 'trimmed', label: '"4.5"', sublabel: 'trimmed', x: 42, y: 50, tone: 'stack', shape: 'box' },
              ],
              edges: [{ from: 'raw', to: 'trimmed', animated: true, label: '.trim()' }],
            },
            {
              caption: 'parse::<f64>() converts the text into a real number, or an Err if it is not valid.',
              nodes: [
                { id: 'trimmed', label: '"4.5"', sublabel: 'trimmed', x: 20, y: 50, tone: 'muted', shape: 'box' },
                { id: 'parsed', label: '4.5', sublabel: 'f64', x: 50, y: 50, tone: 'accent', shape: 'box' },
              ],
              edges: [{ from: 'trimmed', to: 'parsed', animated: true, label: '.parse::<f64>()' }],
            },
            {
              caption: 'match on the operator picks the right arithmetic.',
              nodes: [
                { id: 'parsed', label: 'a = 4.5, b = 2.0', sublabel: 'both parsed', x: 15, y: 50, tone: 'muted', shape: 'box', w: 24 },
                { id: 'op', label: 'match op { ... }', sublabel: '"+" "-" "*" "/"', x: 55, y: 50, tone: 'accent', shape: 'box', w: 24 },
              ],
              edges: [{ from: 'parsed', to: 'op', animated: true }],
            },
            {
              caption: 'The result is printed — with a guard against dividing by zero.',
              nodes: [
                { id: 'op', label: 'match op { ... }', sublabel: '"/" chosen', x: 15, y: 50, tone: 'muted', shape: 'box', w: 24 },
                { id: 'result', label: '4.5 / 2.0 = 2.25', sublabel: 'printed to stdout', x: 55, y: 50, tone: 'success', shape: 'box', w: 26 },
              ],
              edges: [{ from: 'op', to: 'result', animated: true }],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Read two numbers and an operator from stdin.',
          'Parse text input into f64 values, handling bad input gracefully.',
          'match on the operator to compute the right result.',
          'Guard against division by zero with a clear error message.',
        ],
        steps: [
          {
            title: '1. Read a line from stdin',
            description: 'std::io::stdin().read_line(&mut buffer) appends the next line of input (including the newline) into a mutable String.',
            code: `use std::io;

let mut input = String::new();
io::stdin().read_line(&mut input).expect("failed to read line");`,
          },
          {
            title: '2. Trim and parse into a number',
            description: '.trim() removes the trailing newline and any surrounding whitespace; .parse::<f64>() attempts to convert the remaining text into a float, returning a Result you can match on.',
            code: `let number: f64 = match input.trim().parse() {
    Ok(n) => n,
    Err(_) => {
        println!("That doesn't look like a number.");
        return;
    }
};`,
          },
          {
            title: '3. Read the operator and match on it',
            description: 'Read one more line for the operator, then match its trimmed contents against "+", "-", "*", and "/", with a fallback arm for anything unexpected.',
            code: `match op {
    "+" => Some(a + b),
    "-" => Some(a - b),
    "*" => Some(a * b),
    "/" => {
        if b == 0.0 {
            println!("Error: cannot divide by zero.");
            None
        } else {
            Some(a / b)
        }
    }
    other => {
        println!("Unknown operator: {}", other);
        None
    }
}`,
          },
          {
            title: '4. Print the result, if there is one',
            description: 'Because the match above returns an Option<f64>, use `if let Some(value) = result` to print only when a real result was computed.',
            code: `if let Some(value) = result {
    println!("{} {} {} = {}", a, op, b, value);
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete calculator',
        description: 'This version defensively falls back to 0.0 if it receives no input at all (as happens when running non-interactively), so it never panics — try it with real input locally by piping in numbers and an operator.',
        language: 'rust',
        runnable: true,
        code: `use std::io;

fn read_number(prompt: &str) -> Option<f64> {
    println!("{}", prompt);
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("failed to read line");
    input.trim().parse::<f64>().ok()
}

fn main() {
    println!("=== Command-Line Calculator ===");

    let a = match read_number("Enter the first number:") {
        Some(n) => n,
        None => {
            println!("Not a valid number, using 0.0 for this demo run.");
            0.0
        }
    };

    let b = match read_number("Enter the second number:") {
        Some(n) => n,
        None => {
            println!("Not a valid number, using 0.0 for this demo run.");
            0.0
        }
    };

    println!("Enter an operator (+, -, *, /):");
    let mut op = String::new();
    io::stdin().read_line(&mut op).expect("failed to read line");
    let op = op.trim();
    let op = if op.is_empty() { "+" } else { op };

    let result = match op {
        "+" => Some(a + b),
        "-" => Some(a - b),
        "*" => Some(a * b),
        "/" => {
            if b == 0.0 {
                println!("Error: cannot divide by zero.");
                None
            } else {
                Some(a / b)
            }
        }
        other => {
            println!("Unknown operator: {}", other);
            None
        }
    };

    if let Some(value) = result {
        println!("{} {} {} = {}", a, op, b, value);
    }
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why is .trim() called on the input before parsing it?',
            options: [
              { id: 'a', text: 'To make the string uppercase.' },
              { id: 'b', text: 'read_line() includes the trailing newline character, which would make parsing fail if left in.' },
              { id: 'c', text: 'trim() converts the String into an f64 directly.' },
              { id: 'd', text: 'It is not necessary — parse() ignores whitespace automatically.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'read_line appends everything up to and including the newline character. parse::<f64>() would fail on "4.5\\n" — trim() strips that so parsing succeeds.',
          },
          {
            id: 'q2',
            prompt: 'Why does the division arm check `if b == 0.0` before dividing?',
            options: [
              { id: 'a', text: 'Because dividing by 0.0 would cause the program to fail to compile.' },
              { id: 'b', text: 'To give a clear, intentional error message instead of silently producing infinity or NaN.' },
              { id: 'c', text: 'Rust automatically panics on any float division, so the check is required to avoid a panic.' },
              { id: 'd', text: 'b can never legally be 0.0 in Rust.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Floating-point division by zero in Rust does not panic (it produces inf, -inf, or NaN) — but a calculator should surface that as an intentional, readable error rather than printing "inf".',
          },
          {
            id: 'q3',
            prompt: 'What does `input.trim().parse::<f64>()` return?',
            options: [
              { id: 'a', text: 'An f64 directly, or it panics on invalid input.' },
              { id: 'b', text: 'A Result<f64, ParseFloatError> — Ok(number) on success, Err(...) on failure.' },
              { id: 'c', text: 'A bool indicating whether parsing would succeed.' },
              { id: 'd', text: 'Always Some(f64), never fails.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'parse is generic over its target type and returns a Result, letting you handle invalid input (like "abc") without a panic — exactly what the match/Err arm in this project does.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 14. rb-proj-temp-converter
  // ────────────────────────────────────────────────────────────────────────
  'rb-proj-temp-converter': {
    id: 'rb-proj-temp-converter',
    heroSummary:
      'Write three small, pure functions to convert between Celsius, Fahrenheit, and Kelvin — practicing multi-parameter functions, f64 arithmetic, and formatted output.',
    dependencyChain: {
      learned: 'Functions with explicit parameter/return types, and f64 math.',
      why: 'A project with zero stdin handling, so you can focus entirely on function design and formatting.',
      build: 'Three correct, independently testable conversion functions, and a habit of writing small pure functions.',
      next: 'The Number Guessing Game reintroduces stdin, plus your first external crate dependency.',
    },
    sections: [
      {
        type: 'explain',
        title: 'The plan',
        body: [
          'Three conversions, three functions: celsius_to_fahrenheit, fahrenheit_to_celsius, and celsius_to_kelvin. Each takes one f64 and returns one f64 — no shared state, no side effects, just math.',
          "For output, `{:.1}` inside a format string rounds a float to 1 decimal place — much friendlier to read than Rust's default float formatting, which can print long tails of digits.",
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Write celsius_to_fahrenheit(c: f64) -> f64.',
          'Write fahrenheit_to_celsius(f: f64) -> f64.',
          'Write celsius_to_kelvin(c: f64) -> f64.',
          'Format results to a readable number of decimal places.',
        ],
        steps: [
          {
            title: '1. Celsius to Fahrenheit',
            description: 'The formula is F = C * 9/5 + 32. Keep the multiplication and division as floats (9.0, 5.0) so the result stays an f64.',
            code: `fn celsius_to_fahrenheit(c: f64) -> f64 {
    c * 9.0 / 5.0 + 32.0
}`,
          },
          {
            title: '2. Fahrenheit to Celsius',
            description: 'The inverse formula: C = (F - 32) * 5/9.',
            code: `fn fahrenheit_to_celsius(f: f64) -> f64 {
    (f - 32.0) * 5.0 / 9.0
}`,
          },
          {
            title: '3. Celsius to Kelvin',
            description: 'Kelvin is just Celsius shifted by a constant: K = C + 273.15.',
            code: `fn celsius_to_kelvin(c: f64) -> f64 {
    c + 273.15
}`,
          },
          {
            title: '4. Format the output',
            description: 'Use {:.1} (or {:.2} for Kelvin, which needs more precision) inside println! to round floats to a fixed number of decimal places.',
            code: `println!("{:.1}C is {:.1}F", 100.0, celsius_to_fahrenheit(100.0));`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete temperature converter',
        language: 'rust',
        runnable: true,
        code: `fn celsius_to_fahrenheit(c: f64) -> f64 {
    c * 9.0 / 5.0 + 32.0
}

fn fahrenheit_to_celsius(f: f64) -> f64 {
    (f - 32.0) * 5.0 / 9.0
}

fn celsius_to_kelvin(c: f64) -> f64 {
    c + 273.15
}

fn main() {
    let boiling_c = 100.0;
    let freezing_c = 0.0;
    let body_temp_f = 98.6;

    println!("{:.1}C is {:.1}F", boiling_c, celsius_to_fahrenheit(boiling_c));
    println!("{:.1}C is {:.1}F", freezing_c, celsius_to_fahrenheit(freezing_c));
    println!("{:.1}F is {:.1}C", body_temp_f, fahrenheit_to_celsius(body_temp_f));
    println!("{:.1}C is {:.2}K", boiling_c, celsius_to_kelvin(boiling_c));
}`,
      },
      {
        type: 'exercise',
        title: 'Add a new conversion',
        exercise: {
          problem:
            'Add `fn kelvin_to_celsius(k: f64) -> f64` (formula: C = K - 273.15), then call it with 300.0 and print the result rounded to 2 decimal places.',
          starterCode: `fn celsius_to_fahrenheit(c: f64) -> f64 {
    c * 9.0 / 5.0 + 32.0
}

// TODO: write kelvin_to_celsius(k: f64) -> f64

fn main() {
    println!("{:.1}", celsius_to_fahrenheit(20.0));
    // TODO: call your new function with 300.0 and print the result
}`,
          hints: [
            { title: 'The formula', body: 'Celsius = Kelvin - 273.15 — this is just a constant offset, same shape as celsius_to_kelvin but reversed.' },
            { title: 'Function shape', body: 'fn kelvin_to_celsius(k: f64) -> f64 { k - 273.15 }' },
            { title: 'Formatting', body: 'Use {:.2} in your println! format string to show 2 decimal places.' },
          ],
          solutionCode: `fn celsius_to_fahrenheit(c: f64) -> f64 {
    c * 9.0 / 5.0 + 32.0
}

fn kelvin_to_celsius(k: f64) -> f64 {
    k - 273.15
}

fn main() {
    println!("{:.1}", celsius_to_fahrenheit(20.0));
    println!("{:.2}", kelvin_to_celsius(300.0));
}`,
          solutionExplanation: '300.0 - 273.15 = 26.85, printed with 2 decimal places via the {:.2} format specifier.',
          expectedOutputContains: ['68.0', '26.85'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does `{:.1}` do inside a println! format string?',
            options: [
              { id: 'a', text: 'Rounds the value to 1 significant figure.' },
              { id: 'b', text: 'Formats a floating-point value with exactly 1 digit after the decimal point.' },
              { id: 'c', text: 'Truncates the string to 1 character.' },
              { id: 'd', text: 'Converts the value to an integer.' },
            ],
            correctOptionIds: ['b'],
            explanation: '`{:.1}` is a precision specifier — it formats the argument (typically a float) to exactly one digit after the decimal point, rounding as needed.',
          },
          {
            id: 'q2',
            prompt: 'Why write celsius_to_fahrenheit as `c * 9.0 / 5.0 + 32.0` instead of `c * 9 / 5 + 32`?',
            options: [
              { id: 'a', text: 'There is no difference — Rust converts integers to floats automatically wherever needed.' },
              { id: 'b', text: 'c is an f64, and mixing it with integer literals like 9 and 5 without a decimal point would be a type-mismatch compile error.' },
              { id: 'c', text: 'Integer literals are forbidden anywhere in Rust.' },
              { id: 'd', text: 'It only matters for negative temperatures.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Rust does not implicitly convert between numeric types. Since c is f64, every literal combined with it (9.0, 5.0, 32.0) must also be written as a float, or the compiler rejects the mismatch.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 15. rb-proj-guessing-game
  // ────────────────────────────────────────────────────────────────────────
  'rb-proj-guessing-game': {
    id: 'rb-proj-guessing-game',
    heroSummary:
      'The classic Rust Book project: generate a secret random number using an external crate (rand), then loop reading guesses, comparing with std::cmp::Ordering, until the player finds it.',
    dependencyChain: {
      learned: 'Loops, match, and reading from stdin.',
      why: 'This is your first taste of an external dependency (a "crate"), and Ordering — a pattern you\'ll see again constantly for comparisons.',
      build: 'Comfort adding a dependency to Cargo.toml, and using loop + break with a real interactive program.',
      next: 'The CLI Todo List project introduces Vec — Rust\'s growable collection type.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Your first external dependency',
        body: [
          'So far, every project has used only Rust\'s standard library. Generating a random number needs more than that — the standard library deliberately does not include an RNG, so we reach for the community-maintained `rand` crate.',
          'Adding a dependency means adding one line to Cargo.toml: `rand = "0.8"`. The next time you `cargo build` or `cargo run`, Cargo downloads the crate (and anything it depends on) and compiles it alongside your own code — no separate package manager needed.',
        ],
        callout: {
          tone: 'accent',
          text: 'crates.io is Rust\'s central package registry (like npm for JavaScript or PyPI for Python). Any crate published there can be pulled in with one line in Cargo.toml.',
        },
      },
      {
        type: 'diagram',
        title: 'The guess-compare-adjust loop',
        description: 'Every iteration reads a guess, compares it to the secret number, and either narrows the range or ends the game.',
        diagram: {
          title: 'loop { read guess -> cmp -> react }',
          height: 240,
          frames: [
            {
              caption: 'A secret number is generated once, before the loop starts.',
              nodes: [{ id: 'secret', label: 'secret', sublabel: '42  (hidden from player)', x: 55, y: 20, tone: 'muted', shape: 'pill' }],
            },
            {
              caption: 'The player guesses 70.',
              nodes: [
                { id: 'secret', label: 'secret', sublabel: '42  (hidden)', x: 55, y: 20, tone: 'muted', shape: 'pill' },
                { id: 'guess1', label: 'guess', sublabel: '70', x: 15, y: 55, tone: 'accent', shape: 'box' },
              ],
            },
            {
              caption: 'guess.cmp(&secret) returns Ordering::Greater — "Too big!"',
              nodes: [
                { id: 'secret', label: 'secret', sublabel: '42  (hidden)', x: 55, y: 20, tone: 'muted', shape: 'pill' },
                { id: 'guess1', label: 'guess', sublabel: '70', x: 15, y: 55, tone: 'danger', shape: 'box' },
                { id: 'r1', label: 'Ordering::Greater', sublabel: '"Too big!"', x: 65, y: 60, tone: 'danger', shape: 'ghost' },
              ],
              edges: [{ from: 'guess1', to: 'r1', animated: true, tone: 'danger' }],
            },
            {
              caption: 'The player guesses again: 42.',
              nodes: [
                { id: 'secret', label: 'secret', sublabel: '42  (hidden)', x: 55, y: 20, tone: 'muted', shape: 'pill' },
                { id: 'guess2', label: 'guess', sublabel: '42', x: 15, y: 55, tone: 'accent', shape: 'box' },
              ],
            },
            {
              caption: 'guess.cmp(&secret) returns Ordering::Equal — the loop breaks, game over.',
              nodes: [
                { id: 'secret', label: 'secret', sublabel: '42  (revealed!)', x: 55, y: 20, tone: 'success', shape: 'pill' },
                { id: 'guess2', label: 'guess', sublabel: '42', x: 15, y: 55, tone: 'success', shape: 'box' },
                { id: 'r2', label: 'Ordering::Equal', sublabel: '"You got it!" -> break', x: 65, y: 60, tone: 'success', shape: 'ghost' },
              ],
              edges: [{ from: 'guess2', to: 'r2', animated: true, tone: 'success' }],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Add rand as a dependency in Cargo.toml.',
          'Generate a random secret number in a range.',
          'Loop reading guesses from stdin until the player wins.',
          'Compare each guess with std::cmp::Ordering.',
        ],
        steps: [
          {
            title: '1. Add the dependency',
            description: 'Add rand to your [dependencies] section in Cargo.toml. Cargo fetches and compiles it automatically on your next build.',
            code: `[dependencies]
rand = "0.8.5"`,
          },
          {
            title: '2. Generate the secret number',
            description: 'rand::thread_rng() gives you a random number generator seeded from the OS; gen_range(1..=100) produces one number in that inclusive range.',
            code: `use rand::Rng;

let secret_number = rand::thread_rng().gen_range(1..=100);`,
          },
          {
            title: '3. Loop, reading guesses',
            description: 'Read a line, parse it, and `continue` back to the top of the loop on invalid input instead of crashing.',
            code: `let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => {
        println!("That's not a number, try again.");
        continue;
    }
};`,
          },
          {
            title: '4. Compare and react',
            description: 'guess.cmp(&secret_number) returns an Ordering — Less, Greater, or Equal — which you match on to decide what to print, and whether to break out of the loop.',
            code: `match guess.cmp(&secret_number) {
    Ordering::Less => println!("Too small!"),
    Ordering::Greater => println!("Too big!"),
    Ordering::Equal => {
        println!("You got it! The number was {}.", secret_number);
        break;
    }
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete guessing game',
        description:
          'This uses the external rand crate, so it is marked non-runnable here — the shared playground sandbox in this lesson does not have crates enabled. Paste this into a real `cargo new guessing_game` project (after adding rand to Cargo.toml) to actually play it.',
        language: 'rust',
        runnable: false,
        code: `use rand::Rng;
use std::cmp::Ordering;
use std::io;

fn main() {
    println!("=== Guess the Number ===");
    let secret_number = rand::thread_rng().gen_range(1..=100);

    loop {
        println!("Please input your guess (1-100):");

        let mut guess = String::new();
        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("That's not a number, try again.");
                continue;
            }
        };

        println!("You guessed: {}", guess);

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You got it! The number was {}.", secret_number);
                break;
            }
        }
    }
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does guess.cmp(&secret_number) return?',
            options: [
              { id: 'a', text: 'A bool — true if equal, false otherwise.' },
              { id: 'b', text: 'An std::cmp::Ordering value: Less, Greater, or Equal.' },
              { id: 'c', text: 'An i32 representing the numeric difference.' },
              { id: 'd', text: 'A String describing the result.' },
            ],
            correctOptionIds: ['b'],
            explanation: '.cmp() returns an Ordering enum with exactly three possible values — Less, Greater, or Equal — which match pairs naturally with an exhaustive match.',
          },
          {
            id: 'q2',
            prompt: 'Where do you declare that your project depends on the rand crate?',
            options: [
              { id: 'a', text: 'In src/main.rs, with a special #[dependency] attribute.' },
              { id: 'b', text: 'In the [dependencies] section of Cargo.toml.' },
              { id: 'c', text: 'By running `rustc --add-dependency rand`.' },
              { id: 'd', text: 'Dependencies cannot be added to a Rust project.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Cargo.toml\'s [dependencies] table is where every external crate your project uses gets declared, along with its version requirement.',
          },
          {
            id: 'q3',
            prompt: 'In the guessing loop, what does `continue;` do when the input fails to parse?',
            options: [
              { id: 'a', text: 'It exits the program immediately.' },
              { id: 'b', text: 'It skips the rest of the current loop iteration and jumps back to the top of the loop for another guess.' },
              { id: 'c', text: 'It breaks out of the loop entirely, ending the game.' },
              { id: 'd', text: 'It retries parsing the same input automatically.' },
            ],
            correctOptionIds: ['b'],
            explanation: '`continue` skips straight to the next loop iteration, letting the player try again without the program crashing or ending on bad input.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 16. rb-proj-cli-todo
  // ────────────────────────────────────────────────────────────────────────
  'rb-proj-cli-todo': {
    id: 'rb-proj-cli-todo',
    heroSummary:
      'Build a small in-memory todo list: a Vec of Todo structs, with functions to add, list, and complete items — your first taste of Rust\'s growable collection type.',
    dependencyChain: {
      learned: 'loop, match, Ordering, and reading from stdin.',
      why: 'Every project so far used fixed-size data. A todo list needs a collection that can actually grow — that\'s Vec.',
      build: 'Comfort with Vec::new, .push(), .get_mut(), and iterating with .iter().enumerate().',
      next: 'The Simple Text Processor project applies these same iteration skills to strings instead of a Vec.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Why Vec instead of an array',
        body: [
          "Arrays (from Lesson 8) have a length fixed at compile time — you cannot add a sixth item to a [Todo; 5]. Vec<T> is Rust's growable, heap-allocated list: you can .push() new items onto it for as long as your program runs.",
          "For each todo, we'll use a small struct — `struct Todo { text: String, done: bool }` — bundling the task description with whether it's finished, instead of tracking two separate parallel lists.",
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Define a Todo struct with text and done fields.',
          'Store todos in a Vec<Todo> and add new ones with .push().',
          'List all todos, showing their completion status.',
          'Mark a todo complete by index, safely handling an invalid index.',
        ],
        steps: [
          {
            title: '1. Define the Todo struct',
            description: 'A struct groups related fields under one name — here, the task text and whether it\'s done.',
            code: `struct Todo {
    text: String,
    done: bool,
}`,
          },
          {
            title: '2. Add items to a Vec',
            description: 'Vec::new() creates an empty, growable list; .push() appends to the end. &mut Vec<Todo> lets the function modify the caller\'s vector directly.',
            code: `fn add(todos: &mut Vec<Todo>, text: &str) {
    todos.push(Todo { text: text.to_string(), done: false });
    println!("Added: \\"{}\\"", text);
}`,
          },
          {
            title: '3. List todos with their status',
            description: '.iter().enumerate() walks the Vec while also giving you each item\'s index, which is exactly what you need to show numbered items.',
            code: `fn list(todos: &Vec<Todo>) {
    println!("--- Todo List ---");
    for (i, todo) in todos.iter().enumerate() {
        let marker = if todo.done { "[x]" } else { "[ ]" };
        println!("{} {} {}", i, marker, todo.text);
    }
}`,
          },
          {
            title: '4. Complete a todo by index, safely',
            description: '.get_mut(index) returns Option<&mut Todo> — Some if the index is valid, None otherwise — so an out-of-range index never panics.',
            code: `fn complete(todos: &mut Vec<Todo>, index: usize) {
    if let Some(todo) = todos.get_mut(index) {
        todo.done = true;
        println!("Completed: \\"{}\\"", todo.text);
    } else {
        println!("No todo at index {}", index);
    }
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete todo list',
        description: 'A few commands are hardcoded in main() so the output is deterministic when run once — a real CLI version would read these from stdin in a loop instead.',
        language: 'rust',
        runnable: true,
        code: `struct Todo {
    text: String,
    done: bool,
}

fn add(todos: &mut Vec<Todo>, text: &str) {
    todos.push(Todo { text: text.to_string(), done: false });
    println!("Added: \\"{}\\"", text);
}

fn complete(todos: &mut Vec<Todo>, index: usize) {
    if let Some(todo) = todos.get_mut(index) {
        todo.done = true;
        println!("Completed: \\"{}\\"", todo.text);
    } else {
        println!("No todo at index {}", index);
    }
}

fn list(todos: &Vec<Todo>) {
    println!("--- Todo List ---");
    for (i, todo) in todos.iter().enumerate() {
        let marker = if todo.done { "[x]" } else { "[ ]" };
        println!("{} {} {}", i, marker, todo.text);
    }
}

fn main() {
    let mut todos: Vec<Todo> = Vec::new();

    add(&mut todos, "Learn Rust ownership");
    add(&mut todos, "Build a CLI todo app");
    add(&mut todos, "Ship the guessing game project");

    list(&todos);

    complete(&mut todos, 0);

    println!();
    list(&todos);
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why is Vec<Todo> used here instead of a fixed-size array like [Todo; 5]?',
            options: [
              { id: 'a', text: 'Arrays cannot hold structs.' },
              { id: 'b', text: 'Vec can grow at runtime via .push(), while an array\'s length is fixed at compile time.' },
              { id: 'c', text: 'Vec is faster than arrays for every use case.' },
              { id: 'd', text: 'There is no real difference between them.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A todo list needs an unknown, growing number of items — exactly the case Vec is designed for, since its size is not fixed at compile time.',
          },
          {
            id: 'q2',
            prompt: 'Why does complete() use `todos.get_mut(index)` instead of `todos[index]`?',
            options: [
              { id: 'a', text: 'get_mut() is required for all Vec access.' },
              { id: 'b', text: 'get_mut() returns an Option, letting an invalid index be handled gracefully instead of panicking.' },
              { id: 'c', text: '[] indexing does not work on Vec at all.' },
              { id: 'd', text: 'get_mut() is faster than [] indexing.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Direct [] indexing panics on an out-of-range index, just like arrays. get_mut() returns None instead, which the if let handles without crashing.',
          },
          {
            id: 'q3',
            prompt: 'What does `todos.iter().enumerate()` give you inside the for loop?',
            options: [
              { id: 'a', text: 'Only the index of each item, not the item itself.' },
              { id: 'b', text: 'Pairs of (index, item_reference) for every element in the Vec, in order.' },
              { id: 'c', text: 'A random ordering of items.' },
              { id: 'd', text: 'A count of how many items are done.' },
            ],
            correctOptionIds: ['b'],
            explanation: '.enumerate() wraps an iterator so each item comes paired with its position, letting `for (i, todo) in todos.iter().enumerate()` destructure both at once.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // 17. rb-proj-text-processor
  // ────────────────────────────────────────────────────────────────────────
  'rb-proj-text-processor': {
    id: 'rb-proj-text-processor',
    heroSummary:
      'Your first "real" text tool: count words, lines, and characters in a block of text using .lines(), .split_whitespace(), and .chars().count() — capping off the Beginner level.',
    dependencyChain: {
      learned: 'Vec, structs, and iteration with .iter().enumerate().',
      why: 'String processing is one of the most common real-world tasks, and this project is your first pass at Rust\'s string methods.',
      build: 'Fluency with .lines(), .split_whitespace(), and .chars().count() — the basic toolkit for analyzing text.',
      next: 'This closes out Rust Beginner — Level 2 goes deep on ownership, borrowing, and the String/&str distinction you\'ve been using intuitively so far.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Three ways to slice a string',
        body: [
          '.lines() splits a string into an iterator of lines, breaking on newline characters — perfect for counting how many lines of text you have.',
          '.split_whitespace() splits on any run of whitespace (spaces, tabs, newlines) and conveniently skips empty fragments, making it the natural way to count words.',
          '.chars().count() walks the string one Unicode character at a time and counts them — this is different from .len(), which counts bytes and can give a different answer for non-ASCII text.',
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Store a multi-line block of text in a &str.',
          'Count lines with .lines().count().',
          'Count words with .split_whitespace().count().',
          'Count characters with .chars().count().',
        ],
        steps: [
          {
            title: '1. A hardcoded block of text',
            description: 'A raw multi-line string literal, using a backslash to avoid an unwanted leading newline.',
            code: `let text = "\\
Rust is a systems programming language.
It runs blazingly fast and prevents segfaults.
Rust guarantees memory safety without a garbage collector.";`,
          },
          {
            title: '2. Count lines',
            description: '.lines() gives you one item per line of the string, regardless of how it ends.',
            code: `let line_count = text.lines().count();`,
          },
          {
            title: '3. Count words',
            description: '.split_whitespace() handles multiple spaces and different whitespace characters gracefully, unlike a naive .split(\' \').',
            code: `let word_count = text.split_whitespace().count();`,
          },
          {
            title: '4. Count characters',
            description: '.chars() iterates Unicode scalar values one at a time; .count() consumes the iterator and returns how many there were.',
            code: `let char_count = text.chars().count();`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete text processor',
        language: 'rust',
        runnable: true,
        code: `fn main() {
    let text = "\\
Rust is a systems programming language.
It runs blazingly fast and prevents segfaults.
Rust guarantees memory safety without a garbage collector.";

    let line_count = text.lines().count();
    let word_count = text.split_whitespace().count();
    let char_count = text.chars().count();

    println!("Lines: {}", line_count);
    println!("Words: {}", word_count);
    println!("Characters: {}", char_count);

    let mut longest = "";
    for word in text.split_whitespace() {
        if word.len() > longest.len() {
            longest = word;
        }
    }
    println!("Longest word: {}", longest);
}`,
      },
      {
        type: 'exercise',
        title: 'Count the vowels',
        exercise: {
          problem:
            'Extend the program to also count vowels (a, e, i, o, u, both cases) in `text` and print "Vowels: <n>".',
          starterCode: `fn main() {
    let text = "Rust is fast and safe";
    // TODO: count how many characters in \`text\` are vowels (aeiouAEIOU)
    println!("Vowels: {}", 0);
}`,
          hints: [
            { title: 'Filter characters', body: 'text.chars() gives you each character; .filter(...) keeps only the ones matching a condition.' },
            { title: 'Check membership', body: '"aeiouAEIOU".contains(c) tells you whether the character c is a vowel, in either case.' },
            { title: 'Count what is left', body: 'Chain .count() onto the filtered iterator to get the total number of vowels.' },
          ],
          solutionCode: `fn main() {
    let text = "Rust is fast and safe";
    let vowel_count = text
        .chars()
        .filter(|c| "aeiouAEIOU".contains(*c))
        .count();
    println!("Vowels: {}", vowel_count);
}`,
          solutionExplanation:
            '.chars() produces each character, .filter() keeps only those found in the vowel string ("aeiouAEIOU"), and .count() totals what is left — "Rust is fast and safe" contains 6 vowels.',
          expectedOutputContains: ['Vowels: 6'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why use .split_whitespace() instead of .split(\' \') to count words?',
            options: [
              { id: 'a', text: 'They behave identically in every case.' },
              { id: 'b', text: '.split_whitespace() handles multiple consecutive spaces, tabs, and newlines correctly, without producing empty "words".' },
              { id: 'c', text: '.split(\' \') cannot be called on a &str.' },
              { id: 'd', text: '.split_whitespace() is only for counting, not splitting.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A naive .split(\' \') would produce empty strings for repeated spaces (e.g. "a  b" splits into ["a", "", "b"]). .split_whitespace() collapses any run of whitespace and skips empties automatically.',
          },
          {
            id: 'q2',
            prompt: 'Why might .chars().count() give a different result than .len() on the same string?',
            options: [
              { id: 'a', text: 'They never differ — count() and len() always agree.' },
              { id: 'b', text: '.len() counts bytes, while .chars().count() counts Unicode scalar values — these differ for non-ASCII text like emoji or accented letters.' },
              { id: 'c', text: '.chars() only works on numbers.' },
              { id: 'd', text: '.len() is only available on Vec, not String.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A String\'s .len() returns its size in bytes (UTF-8 encoded), while .chars().count() returns the number of actual characters — a multi-byte character like \'é\' or \'🦀\' counts as 1 character but more than 1 byte.',
          },
          {
            id: 'q3',
            prompt: 'In the longest-word loop, why compare `word.len() > longest.len()` instead of comparing the words directly?',
            options: [
              { id: 'a', text: 'Strings cannot be compared with > in Rust at all.' },
              { id: 'b', text: 'We want to track which word has the most characters, not which word is alphabetically greatest.' },
              { id: 'c', text: '.len() is required before any string can be printed.' },
              { id: 'd', text: 'There is no reason — either comparison would work identically.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The goal is length comparison (finding the longest word), so comparing .len() values is correct — comparing the &str values directly (word > longest) would instead perform lexicographic (alphabetical) comparison.',
          },
        ],
      },
    ],
  },
}
