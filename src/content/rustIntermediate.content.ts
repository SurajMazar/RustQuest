import type { LessonContent } from '../types/lessonContent'

export const rustIntermediateContent: Record<string, LessonContent> = {
  // ---------------------------------------------------------------------
  // 1. Stack, Heap & Ownership
  // ---------------------------------------------------------------------
  'ri-stack-heap-ownership': {
    id: 'ri-stack-heap-ownership',
    heroSummary:
      'Every value in a Rust program lives on the stack or the heap. Ownership is the rule set that decides who is responsible for cleaning up heap memory — and it lets Rust do that with zero runtime garbage collector.',
    dependencyChain: {
      learned: 'Variables, functions, and basic types (tuples, arrays) from Rust Beginner.',
      why: 'Before ownership makes sense, you need a mental model of WHERE data actually lives in memory.',
      build: 'A visual, steppable model of the stack and the heap, plus the three ownership rules that govern them.',
      next: 'Move semantics (what happens when you assign a heap-backed value to a new variable) and, eventually, smart pointers that bend these rules on purpose.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Two places your data can live',
        body: [
          'The stack is a simple, fast, last-in-first-out region of memory. Every value with a known, fixed size at compile time — integers, booleans, fixed-size structs, references — gets pushed onto it. Popping it off is free: just move a pointer.',
          'The heap is for data whose size can grow, shrink, or isn\'t known until runtime — a String\'s contents, a Vec\'s elements. Heap allocation is slower and needs explicit bookkeeping: something has to remember to free it later.',
          'Languages with garbage collectors solve "who frees the heap memory?" by scanning for unreachable data at runtime. Rust solves it at compile time instead, with a single rule: every value has exactly one owner, and when the owner goes out of scope, Rust inserts the cleanup code for you.',
        ],
        bullets: [
          'Stack: fixed size, fast, automatic (push/pop with scope)',
          'Heap: dynamic size, slower, needs an owner to free it',
          'Ownership = compile-time bookkeeping instead of a runtime garbage collector',
        ],
        callout: {
          tone: 'accent',
          text: 'A `String` is really a small stack value (a pointer, a length, and a capacity) that points at a larger heap allocation holding the actual bytes.',
        },
      },
      {
        type: 'diagram',
        title: 'Stack, Heap & Drop',
        description: 'Step through what happens in memory for `let s = String::from("hello");` and then watch it get cleaned up automatically when its scope ends.',
        diagram: {
          title: 'let s = String::from("hello");',
          description: 'Use the step controls to watch the allocation happen, then watch Rust free it automatically at the end of scope — no garbage collector required.',
          frames: [
            {
              caption: 'Before this line runs, the stack and heap are both empty.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
              ],
            },
            {
              caption: '`let s = String::from("hello");` — `s` is pushed onto the stack, storing a pointer/length/capacity. The actual text is allocated on the heap.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
                { id: 's', label: 's', sublabel: 'ptr, len 5, cap 5', tone: 'stack', x: 25, y: 40 },
                { id: 'heap-hello', label: '"hello"', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 40 },
              ],
              edges: [{ from: 's', to: 'heap-hello', label: 'points to' }],
            },
            {
              caption: 'While `s` is in scope, anything that reads it follows this pointer out to the heap.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
                { id: 's', label: 's', sublabel: 'ptr, len 5, cap 5', tone: 'stack', x: 25, y: 40 },
                { id: 'heap-hello', label: '"hello"', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 40 },
              ],
              edges: [{ from: 's', to: 'heap-hello', label: 'points to', animated: true }],
            },
            {
              caption: 'The block containing `s` ends. Rust automatically calls `drop(s)` — `s` is no longer valid, and its heap allocation is about to be freed.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
                { id: 's', label: 's', sublabel: 'dropped', tone: 'danger', x: 25, y: 40, invalid: true },
                { id: 'heap-hello', label: '"hello"', sublabel: 'being freed', tone: 'danger', x: 75, y: 40, invalid: true },
              ],
              edges: [{ from: 's', to: 'heap-hello', dashed: true, tone: 'danger' }],
            },
            {
              caption: 'The heap memory is freed and the stack slot for `s` is reclaimed. No garbage collector ever had to run — the compiler inserted this cleanup at compile time.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
              ],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'The three ownership rules',
        body: [
          'Everything above is really just three rules, applied consistently everywhere in the language:',
        ],
        bullets: [
          'Each value has exactly one owner (one variable "in charge" of it) at a time.',
          'When the owner goes out of scope, Rust calls `drop` on the value automatically.',
          'Ownership can be transferred ("moved") to another variable — but then the original owner can no longer be used. (This is the subject of the next lesson.)',
        ],
        callout: {
          tone: 'success',
          text: 'These three rules are the entire foundation. Move semantics, borrowing, and lifetimes are just consequences of enforcing them at compile time.',
        },
      },
      {
        type: 'code',
        title: 'Scope and automatic drop',
        description: 'Run this and notice the order of output: the inner `String` is created, used, and dropped before the outer one is used again.',
        code: `fn main() {
    let outer = String::from("I'm still here");

    {
        let s = String::from("hello");
        println!("inside the block: {}", s);
    } // <- \`s\` goes out of scope here; Rust calls \`drop(s)\` and the heap memory is freed

    println!("after the block: {}", outer);
}
`,
        runnable: true,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Which kind of value is stored directly on the stack, with no separate heap allocation?',
            options: [
              { id: 'a', text: 'A String holding user input of unknown length' },
              { id: 'b', text: 'A Vec<i32> that grows as items are pushed' },
              { id: 'c', text: 'An i32' },
            ],
            correctOptionIds: ['c'],
            explanation: 'i32 has a fixed, known-at-compile-time size, so it lives entirely on the stack. String and Vec store their variable-length contents on the heap, with a small fixed-size handle (ptr/len/capacity) on the stack.',
          },
          {
            id: 'q2',
            prompt: 'What triggers a heap allocation being freed in Rust?',
            options: [
              { id: 'a', text: 'A garbage collector runs periodically in the background' },
              { id: 'b', text: 'The owning variable goes out of scope, and Rust calls drop on it' },
              { id: 'c', text: 'The programmer must call free() manually, like in C' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Rust has no garbage collector and no manual free(). Instead, the compiler inserts a call to drop() at the exact point the owning variable\'s scope ends.',
          },
          {
            id: 'q3',
            prompt: 'How many owners can a single value have at any given moment?',
            options: [
              { id: 'a', text: 'Exactly one' },
              { id: 'b', text: 'As many as have a reference to it' },
              { id: 'c', text: 'Unlimited, Rust tracks a reference count automatically for every value' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Every value has exactly one owner at a time. (Types like Rc<T> let multiple owners share a value later in the course, but that\'s an explicit opt-in, not the default.)',
          },
          {
            id: 'q4',
            prompt: 'True or false: reading a String only ever touches stack memory.',
            options: [
              { id: 'a', text: 'True' },
              { id: 'b', text: 'False — reading its contents follows a pointer out to the heap' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The String value itself (pointer, length, capacity) is on the stack, but its actual character data lives on the heap — reading the text follows that pointer.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 2. Move Semantics, Copy & Clone
  // ---------------------------------------------------------------------
  'ri-move-copy-clone': {
    id: 'ri-move-copy-clone',
    heroSummary:
      'When you write `let b = a;`, does `a` still work afterwards? The answer depends on whether the type is Copy, and it is the single most common source of confusing compiler errors for new Rust developers.',
    dependencyChain: {
      learned: 'The stack/heap model and the three ownership rules — specifically that every value has exactly one owner.',
      why: 'Rule three said ownership can transfer. This lesson shows EXACTLY what that transfer looks like in memory, frame by frame.',
      build: 'Move semantics for heap-backed types, the Copy trait for simple stack-only types, and .clone() for when you explicitly want a second independent allocation.',
      next: 'Borrowing — a way to use a value WITHOUT moving or cloning it at all.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Assignment moves by default',
        body: [
          'In many languages, `let b = a;` copies `a`\'s value. In Rust, if `a`\'s type owns heap data (like `String` or `Vec<T>`), that line MOVES ownership from `a` to `b` instead of copying the underlying data.',
          'After the move, `a` is no longer valid. The compiler doesn\'t just discourage using it — it refuses to compile any code that tries. This prevents a whole class of bugs: two variables can never accidentally both believe they own (and will free) the same heap memory.',
          'Simple, fixed-size types like integers and booleans implement the `Copy` trait instead. For them, assignment really is a cheap bitwise copy, and both variables remain valid and independent.',
        ],
        bullets: [
          'Heap-backed types (String, Vec<T>, ...) → assignment MOVES ownership; the source becomes invalid.',
          'Copy types (i32, f64, bool, char, tuples of Copy types, ...) → assignment COPIES the value; both remain valid.',
          '.clone() explicitly duplicates heap data, giving you two independent allocations at the cost of the extra work.',
        ],
      },
      {
        type: 'diagram',
        title: 'Move: let b = a;',
        description: 'The flagship diagram for this lesson — step through exactly what a move does to `a` and `b` in memory.',
        diagram: {
          title: 'let a = String::from("hello"); let b = a;',
          height: 320,
          frames: [
            {
              caption: 'Before either line runs: an empty stack and heap.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
              ],
            },
            {
              caption: '`let a = String::from("hello");` — `a` is pushed onto the stack, pointing at a fresh heap allocation.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 'a', label: 'a', sublabel: 'ptr, len 5, cap 5', tone: 'stack', x: 25, y: 30 },
                { id: 'heap-hello', label: '"hello"', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 45 },
              ],
              edges: [{ from: 'a', to: 'heap-hello', label: 'points to' }],
            },
            {
              caption: '`let b = a;` starts executing — Rust prepares a new stack slot for `b` to receive a\'s pointer/length/capacity.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 'a', label: 'a', sublabel: 'ptr, len 5, cap 5', tone: 'stack', x: 25, y: 30 },
                { id: 'b', label: 'b', sublabel: '(receiving...)', tone: 'muted', x: 25, y: 60 },
                { id: 'heap-hello', label: '"hello"', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 45 },
              ],
              edges: [{ from: 'a', to: 'heap-hello', label: 'points to' }],
            },
            {
              caption: 'The move completes: `b` now holds the pointer. `a` is marked invalid — the compiler will not let it be used again.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 'a', label: 'a', sublabel: 'moved', tone: 'danger', x: 25, y: 30, invalid: true },
                { id: 'b', label: 'b', sublabel: 'ptr, len 5, cap 5', tone: 'stack', x: 25, y: 60 },
                { id: 'heap-hello', label: '"hello"', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 45 },
              ],
              edges: [{ from: 'b', to: 'heap-hello', label: 'points to' }],
            },
            {
              caption: 'Any later use of `a`, like `println!("{}", a)`, fails to compile with error E0382: "borrow of moved value: `a`".',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 'a', label: 'a', sublabel: 'moved', tone: 'danger', x: 25, y: 30, invalid: true },
                { id: 'b', label: 'b', sublabel: 'ptr, len 5, cap 5', tone: 'stack', x: 25, y: 60 },
                { id: 'heap-hello', label: '"hello"', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 45 },
                { id: 'attempt', label: 'println!("{}", a)', sublabel: 'E0382: value moved', tone: 'danger', shape: 'pill', x: 25, y: 82 },
              ],
              edges: [
                { from: 'b', to: 'heap-hello', label: 'points to' },
                { from: 'attempt', to: 'a', dashed: true, tone: 'danger', label: 'compile error' },
              ],
            },
            {
              caption: 'At any moment, exactly one variable owns the heap data — that\'s what makes double-free bugs impossible in safe Rust.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 'b', label: 'b', sublabel: 'sole owner', tone: 'stack', x: 25, y: 45 },
                { id: 'heap-hello', label: '"hello"', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 45 },
              ],
              edges: [{ from: 'b', to: 'heap-hello', label: 'points to' }],
            },
          ],
        },
      },
      {
        type: 'diagram',
        title: 'Contrast: Copy types',
        description: 'i32 implements Copy, so the exact same code shape behaves completely differently — no heap, no invalidation.',
        diagram: {
          title: 'let x = 5; let y = x;',
          frames: [
            {
              caption: '`let x = 5;` — a plain i32 on the stack. There is no heap involved at all.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 50, y: 8 },
                { id: 'x', label: 'x', sublabel: '5', tone: 'stack', x: 30, y: 45 },
              ],
            },
            {
              caption: '`let y = x;` — because i32 is Copy, this bitwise-copies the value into a new stack slot. `x` remains completely valid.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 50, y: 8 },
                { id: 'x', label: 'x', sublabel: '5', tone: 'stack', x: 30, y: 45 },
                { id: 'y', label: 'y', sublabel: '5', tone: 'stack', x: 70, y: 45 },
              ],
            },
            {
              caption: 'They are now fully independent. Changing `y` later has no effect on `x` — neither one was ever invalidated.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 50, y: 8 },
                { id: 'x', label: 'x', sublabel: 'still 5', tone: 'stack', x: 30, y: 45 },
                { id: 'y', label: 'y', sublabel: 'now 6', tone: 'accent', x: 70, y: 45 },
              ],
            },
          ],
        },
      },
      {
        type: 'diagram',
        title: 'Contrast: .clone()',
        description: 'When you DO want a heap-backed type duplicated instead of moved, call .clone() explicitly.',
        diagram: {
          title: 'let s2 = s1.clone();',
          frames: [
            {
              caption: '`let s1 = String::from("world");` — one heap allocation, owned by `s1`.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 's1', label: 's1', tone: 'stack', x: 25, y: 30 },
                { id: 'heap1', label: '"world"', sublabel: 'allocation #1', tone: 'heap', x: 75, y: 30 },
              ],
              edges: [{ from: 's1', to: 'heap1', label: 'points to' }],
            },
            {
              caption: '`let s2 = s1.clone();` — a brand-new, SEPARATE heap allocation is made with a copy of the bytes. `s1` is untouched and still valid.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 's1', label: 's1', tone: 'stack', x: 25, y: 25 },
                { id: 's2', label: 's2', tone: 'stack', x: 25, y: 60 },
                { id: 'heap1', label: '"world"', sublabel: 'allocation #1', tone: 'heap', x: 75, y: 25 },
                { id: 'heap2', label: '"world"', sublabel: 'allocation #2 (copy)', tone: 'heap', x: 75, y: 60 },
              ],
              edges: [
                { from: 's1', to: 'heap1', label: 'points to' },
                { from: 's2', to: 'heap2', label: 'points to' },
              ],
            },
            {
              caption: 'Two owners, two allocations, twice the memory — but now mutating one truly cannot affect the other.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 6 },
                { id: 's1', label: 's1', tone: 'stack', x: 25, y: 25 },
                { id: 's2', label: 's2', tone: 'stack', x: 25, y: 60 },
                { id: 'heap1', label: '"world"', sublabel: 'allocation #1', tone: 'heap', x: 75, y: 25 },
                { id: 'heap2', label: '"world!!!"', sublabel: 'allocation #2 (mutated)', tone: 'accent', x: 75, y: 60 },
              ],
              edges: [
                { from: 's1', to: 'heap1', label: 'points to' },
                { from: 's2', to: 'heap2', label: 'points to' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Move vs. Copy vs. Clone, in real code',
        description: 'This compiles and runs as-is. The commented-out line shows exactly where the E0382 "value moved" error would appear if you uncommented it.',
        code: `fn main() {
    // --- Move: String does NOT implement Copy ---
    let a = String::from("hello");
    let b = a; // ownership of the heap data moves from \`a\` to \`b\`
    // println!("{}", a); // <- uncommenting this line fails to compile:
    //                       error[E0382]: borrow of moved value: \`a\`
    println!("b = {}", b);

    // --- Copy: i32 implements Copy, so this is a bitwise copy, not a move ---
    let x = 5;
    let y = x; // \`x\` is copied; both are independently valid
    println!("x = {}, y = {}", x, y);

    // --- Clone: explicitly duplicate heap data instead of moving it ---
    let s1 = String::from("world");
    let s2 = s1.clone(); // s1 and s2 now point at two SEPARATE heap allocations
    println!("s1 = {}, s2 = {}", s1, s2);
}
`,
        runnable: true,
      },
      {
        type: 'debug',
        title: 'Fix the compile error',
        challenge: {
          problem: 'This code looks reasonable but fails to compile. Figure out why before checking the fix.',
          brokenCode: `fn main() {
    let a = String::from("hello");
    let b = a;
    println!("a = {}, b = {}", a, b);
}
`,
          bugExplanation:
            'String does not implement Copy, so `let b = a;` MOVES ownership of the heap data from `a` into `b`. From that point on, `a` is no longer a valid variable to read from. The `println!` on the next line tries to use `a` after the move, so rustc rejects the program with error E0382: "borrow of moved value: `a`".',
          hints: [
            { title: 'Look at what implements Copy', body: 'i32 and bool are Copy. Is String one of them? Check what happens to the ORIGINAL variable after `let b = a;` for a non-Copy type.' },
            { title: 'Read the actual compiler error', body: 'rustc will point at the exact `println!` line and say "value borrowed here after move" — that tells you precisely which use is the problem.' },
            { title: 'Two ways to fix it', body: 'Either clone the value before the move so both variables get an independent copy, or restructure the code so `a` is not used again after `b = a`.' },
          ],
          fixedCode: `fn main() {
    let a = String::from("hello");
    let b = a.clone();
    println!("a = {}, b = {}", a, b);
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'After `let b = a;` where `a: String`, what is the state of `a`?',
            options: [
              { id: 'a', text: '`a` still holds an independent copy of the string' },
              { id: 'b', text: '`a` is invalid — using it is a compile error' },
              { id: 'c', text: '`a` and `b` both point at the same data and both remain valid' },
            ],
            correctOptionIds: ['b'],
            explanation: 'String is not Copy, so the assignment moves ownership to `b`. The compiler statically forbids any further use of `a`.',
          },
          {
            id: 'q2',
            prompt: 'Which of these types is Copy (assignment duplicates the value rather than moving it)?',
            options: [
              { id: 'a', text: 'String' },
              { id: 'b', text: 'Vec<i32>' },
              { id: 'c', text: 'i32' },
            ],
            correctOptionIds: ['c'],
            multi: false,
            explanation: 'i32 has a small, fixed size and no heap allocation to worry about sharing, so it implements Copy. String and Vec own heap data, so they are moved instead.',
          },
          {
            id: 'q3',
            prompt: 'What does `.clone()` actually do for a String?',
            options: [
              { id: 'a', text: 'It moves ownership, just like plain assignment' },
              { id: 'b', text: 'It creates a brand-new, independent heap allocation with a copy of the bytes' },
              { id: 'c', text: 'It creates a second stack pointer to the SAME heap allocation' },
            ],
            correctOptionIds: ['b'],
            explanation: '.clone() is how you explicitly opt into a real, separate heap allocation. It costs extra memory and CPU time, which is exactly why Rust does not do it silently on every assignment.',
          },
          {
            id: 'q4',
            prompt: 'Why does Rust invalidate the source variable after a move, instead of allowing both variables to keep using it?',
            options: [
              { id: 'a', text: 'To save memory by never allocating twice' },
              { id: 'b', text: 'To guarantee there is only ever one owner responsible for freeing that heap memory, preventing double-free bugs' },
              { id: 'c', text: 'It is an arbitrary restriction with no safety benefit' },
            ],
            correctOptionIds: ['b'],
            explanation: 'If both variables stayed valid after a move, they would both eventually try to free the same memory when they went out of scope — a double-free, which is undefined behavior. Invalidating the source variable makes that impossible.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 3. Borrowing, References & Slices
  // ---------------------------------------------------------------------
  'ri-borrowing-references': {
    id: 'ri-borrowing-references',
    heroSummary:
      'Moving or cloning every time you want to use a value would be exhausting. Borrowing lets you hand out a reference to a value — read-only or mutable — without transferring ownership, as long as the compiler can prove it is safe.',
    dependencyChain: {
      learned: 'Move semantics: assigning a heap-backed value transfers ownership and invalidates the source.',
      why: 'If every function call moved its arguments, you would need to clone constantly just to keep using a value. Borrowing avoids that.',
      build: 'References (&T, &mut T), the borrowing rules that keep them safe, and slices as a special "borrowed view" into a collection.',
      next: 'Lifetimes — the compiler\'s explicit vocabulary for "how long is this reference allowed to be valid?"',
    },
    sections: [
      {
        type: 'explain',
        title: 'Borrowing instead of owning',
        body: [
          'A reference (`&T`) lets you access a value without owning it. The owner is unaffected — no move happens, and the original variable stays perfectly usable.',
          'To keep this safe without a runtime check, Rust enforces one rule at compile time: at any given point, you may have either any number of immutable references (`&T`), OR exactly one mutable reference (`&mut T`) — never both at the same time.',
          'This is often summarized as "aliasing XOR mutability." If nobody can mutate the data, it is safe for many readers to share it. If someone might mutate it, nobody else may be looking at it at the same time.',
        ],
        bullets: [
          '&T — an immutable, read-only borrow. Any number can exist simultaneously.',
          '&mut T — a mutable, exclusive borrow. Only one can exist, and no &T may exist alongside it.',
          'A slice (&[T] / &str) is just a reference to a contiguous run of elements inside a larger collection — no copying.',
        ],
      },
      {
        type: 'diagram',
        title: 'The borrowing rules, visualized',
        description: 'What happens when a mutable borrow is attempted while an immutable one is still alive — and how to fix it.',
        diagram: {
          title: 'Overlapping borrows',
          frames: [
            {
              caption: '`let mut s = String::from("hello");` — `s` owns the data, no borrows exist yet.',
              nodes: [{ id: 's', label: 's', sublabel: '"hello"', tone: 'stack', x: 50, y: 20 }],
            },
            {
              caption: '`let r1 = &s;` — an immutable borrow is created. This is fine; more immutable borrows could coexist with it.',
              nodes: [
                { id: 's', label: 's', sublabel: '"hello"', tone: 'stack', x: 50, y: 20 },
                { id: 'r1', label: 'r1', sublabel: '&s', tone: 'accent', x: 25, y: 55 },
              ],
              edges: [{ from: 'r1', to: 's', label: 'borrows', dashed: true }],
            },
            {
              caption: '`let r2 = &mut s;` while `r1` is still alive — REJECTED. The compiler will not allow a mutable borrow to coexist with an active immutable one (E0502).',
              nodes: [
                { id: 's', label: 's', sublabel: '"hello"', tone: 'stack', x: 50, y: 20 },
                { id: 'r1', label: 'r1', sublabel: '&s', tone: 'accent', x: 25, y: 55 },
                { id: 'r2', label: 'r2', sublabel: '&mut s', tone: 'danger', x: 75, y: 55, invalid: true },
              ],
              edges: [
                { from: 'r1', to: 's', label: 'borrows', dashed: true },
                { from: 'r2', to: 's', label: 'borrows (mut) — conflict!', dashed: true, tone: 'danger' },
              ],
            },
            {
              caption: 'The fix: let `r1`\'s borrow end (e.g. stop using it, or let its scope close) BEFORE creating `r2`. Borrows just can\'t overlap in time.',
              nodes: [
                { id: 's', label: 's', sublabel: '"hello"', tone: 'stack', x: 50, y: 20 },
                { id: 'r2', label: 'r2', sublabel: '&mut s', tone: 'accent', x: 50, y: 55 },
              ],
              edges: [{ from: 'r2', to: 's', label: 'borrows (mut) — OK now', dashed: true }],
            },
          ],
        },
      },
      {
        type: 'diagram',
        title: 'Slices: a borrowed view into data',
        description: 'A slice never copies data — it is a reference to a contiguous range inside an existing collection.',
        diagram: {
          title: '&arr[1..3]',
          frames: [
            {
              caption: 'An array of 4 elements, fully owned, no borrows yet.',
              nodes: [
                { id: 'e0', label: 'arr[0]', sublabel: '10', tone: 'stack', x: 15, y: 30 },
                { id: 'e1', label: 'arr[1]', sublabel: '20', tone: 'stack', x: 38, y: 30 },
                { id: 'e2', label: 'arr[2]', sublabel: '30', tone: 'stack', x: 61, y: 30 },
                { id: 'e3', label: 'arr[3]', sublabel: '40', tone: 'stack', x: 84, y: 30 },
              ],
            },
            {
              caption: '`let slice = &arr[1..3];` — a slice highlights elements 1 and 2 (index 3 is excluded) without moving or copying them.',
              nodes: [
                { id: 'e0', label: 'arr[0]', sublabel: '10', tone: 'stack', x: 15, y: 30 },
                { id: 'e1', label: 'arr[1]', sublabel: '20', tone: 'accent', x: 38, y: 30 },
                { id: 'e2', label: 'arr[2]', sublabel: '30', tone: 'accent', x: 61, y: 30 },
                { id: 'e3', label: 'arr[3]', sublabel: '40', tone: 'stack', x: 84, y: 30 },
                { id: 'slice', label: 'slice', sublabel: '&arr[1..3] — ptr + len 2', tone: 'accent', shape: 'pill', x: 50, y: 70 },
              ],
              edges: [
                { from: 'slice', to: 'e1', dashed: true, tone: 'accent' },
                { from: 'slice', to: 'e2', dashed: true, tone: 'accent' },
              ],
            },
            {
              caption: 'The underlying array is untouched and still fully owned by `arr` — the slice is just a "window" pointing into part of it.',
              nodes: [
                { id: 'e0', label: 'arr[0]', sublabel: '10', tone: 'stack', x: 15, y: 30 },
                { id: 'e1', label: 'arr[1]', sublabel: '20', tone: 'accent', x: 38, y: 30 },
                { id: 'e2', label: 'arr[2]', sublabel: '30', tone: 'accent', x: 61, y: 30 },
                { id: 'e3', label: 'arr[3]', sublabel: '40', tone: 'stack', x: 84, y: 30 },
                { id: 'slice', label: 'slice', sublabel: '&arr[1..3] — no allocation', tone: 'accent', shape: 'pill', x: 50, y: 70 },
              ],
              edges: [
                { from: 'slice', to: 'e1', dashed: true, tone: 'accent' },
                { from: 'slice', to: 'e2', dashed: true, tone: 'accent' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: '&T, &mut T, and &str slices',
        description: 'Borrows are released as soon as they are last used, so this compiles and runs cleanly: two sequential borrows of `greeting`, never overlapping.',
        code: `fn print_len(s: &String) {
    // borrows \`s\` — reads it without taking ownership
    println!("length: {}", s.len());
}

fn shout(s: &mut String) {
    // a mutable borrow — allowed to modify the data it points to
    s.push_str("!!!");
}

fn first_word(s: &str) -> &str {
    // returns a slice that borrows from the input — no allocation, no copy
    match s.find(' ') {
        Some(index) => &s[..index],
        None => s,
    }
}

fn main() {
    let mut greeting = String::from("hello world");

    print_len(&greeting); // immutable borrow, released right after the call
    shout(&mut greeting); // mutable borrow, released right after the call
    println!("greeting = {}", greeting);

    let word = first_word(&greeting);
    println!("first word = {}", word);
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: Sum without taking ownership',
        exercise: {
          problem:
            'Implement `sum_all`, which takes a borrowed reference to a Vec<i32> and returns the sum of its elements — WITHOUT taking ownership, so `values` must still be printable after the call.',
          starterCode: `fn sum_all(numbers: &Vec<i32>) -> i32 {
    // TODO: sum all the values in \`numbers\` without taking ownership of the Vec
    0
}

fn main() {
    let values = vec![10, 20, 30, 40];
    let total = sum_all(&values);
    println!("total = {}", total);
    println!("values are still usable: {:?}", values);
}
`,
          hints: [
            { title: 'Iterate over the reference', body: '`for n in numbers { ... }` works directly on a `&Vec<i32>` — each `n` will be a `&i32`.' },
            { title: 'Accumulate into a local total', body: 'Start a `let mut total = 0;` before the loop and add each element to it.' },
            { title: 'Dereference if needed', body: 'You can add a `&i32` to an `i32` total with `total += n;` — Rust auto-derefs numeric references in arithmetic.' },
          ],
          solutionCode: `fn sum_all(numbers: &Vec<i32>) -> i32 {
    let mut total = 0;
    for n in numbers {
        total += n;
    }
    total
}

fn main() {
    let values = vec![10, 20, 30, 40];
    let total = sum_all(&values);
    println!("total = {}", total);
    println!("values are still usable: {:?}", values);
}
`,
          solutionExplanation:
            'Because `sum_all` takes `&Vec<i32>` instead of `Vec<i32>`, no ownership transfer happens at the call site. `values` is only ever lent out for the duration of the call, so `main` can keep using it afterwards.',
          expectedOutputContains: ['total = 100', 'values are still usable: [10, 20, 30, 40]'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the borrow conflict',
        challenge: {
          problem: 'This code tries to keep a reference to an element while also mutating the collection it came from. Why does it fail?',
          brokenCode: `fn main() {
    let mut numbers = vec![1, 2, 3];

    let first = &numbers[0];
    numbers.push(4);
    println!("first = {}", first);
}
`,
          bugExplanation:
            'Vec::push can reallocate the whole backing buffer if there is not enough capacity — which would leave `first` pointing at freed memory. To make that impossible, the borrow checker forbids any mutable borrow (like the one `push` needs) while an immutable borrow (`first`) is still alive. Because `first` is used again in the `println!` below, its borrow spans across the `push` call, producing error E0502.',
          hints: [
            { title: 'What could push() do to old references?', body: 'push() might need to grow the underlying allocation, invalidating any pointers into the old one. The borrow checker prevents this at compile time.' },
            { title: 'Check how long the borrow of `first` lasts', body: 'Its last use is the println! AFTER the push — so the borrow is considered alive across the mutation.' },
            { title: 'Copy instead of borrow', body: 'i32 is Copy. If you only need the VALUE, not a live reference, copy it out instead of borrowing.' },
          ],
          fixedCode: `fn main() {
    let mut numbers = vec![1, 2, 3];

    let first = numbers[0]; // copy the value out (i32 is Copy) instead of borrowing
    numbers.push(4);
    println!("first = {}", first);
    println!("numbers = {:?}", numbers);
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Which combination of borrows is allowed to exist at the same time?',
            options: [
              { id: 'a', text: 'Two &mut T references to the same value' },
              { id: 'b', text: 'One &mut T and one &T to the same value' },
              { id: 'c', text: 'Any number of &T references to the same value' },
            ],
            correctOptionIds: ['c'],
            explanation: 'Rust allows unlimited simultaneous immutable borrows, but never a mutable borrow alongside any other borrow (mutable or immutable) of the same value.',
          },
          {
            id: 'q2',
            prompt: 'What is a slice like `&arr[1..3]`?',
            options: [
              { id: 'a', text: 'A copy of elements 1 and 2 into a new, independent array' },
              { id: 'b', text: 'A borrowed reference to a contiguous range within the original array — no copy' },
              { id: 'c', text: 'A move of elements 1 and 2 out of the original array' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Slices are a "view" — a pointer plus a length — into existing data. They never allocate or copy the elements they reference.',
          },
          {
            id: 'q3',
            prompt: 'Why did `let first = &numbers[0]; numbers.push(4); println!("{}", first);` fail to compile?',
            options: [
              { id: 'a', text: 'Vec does not support indexing' },
              { id: 'b', text: 'push() might reallocate the buffer, which would invalidate the reference in `first` — so the borrow checker forbids the overlap' },
              { id: 'c', text: 'i32 values cannot be borrowed' },
            ],
            correctOptionIds: ['b'],
            explanation: 'This is exactly the scenario the borrowing rules exist to prevent: a mutation that could invalidate an outstanding reference.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 4. Lifetimes
  // ---------------------------------------------------------------------
  'ri-lifetimes': {
    id: 'ri-lifetimes',
    heroSummary:
      'Every reference is valid for some span of the program — its lifetime. Usually the compiler figures this out silently; lifetime annotations are the syntax for the rare cases where it needs your help to see the connection between input and output references.',
    dependencyChain: {
      learned: 'Borrowing rules: at most one mutable XOR any number of immutable references, enforced at compile time.',
      why: 'The borrow checker also needs to know HOW LONG a reference is allowed to live — lifetimes are how that "how long" gets expressed and checked.',
      build: 'Lifetime annotation syntax (\'a), reading function signatures for lifetime relationships, and recognizing dangling references.',
      next: 'Structs that hold references (advanced track) and trait objects with explicit lifetime bounds.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Lifetimes are about "how long," not "what type"',
        body: [
          'A lifetime is the compiler\'s name for a span of code during which a reference is guaranteed to be valid. It is not a runtime concept — no lifetime information exists in your compiled binary. It exists purely so the compiler can verify, at compile time, that no reference ever outlives the data it points to.',
          'Most of the time, lifetimes are elided (inferred) and you never write them. You only write an explicit lifetime annotation like `\'a` when a function signature has more than one reference and the compiler cannot tell on its own how their lifetimes relate — most commonly, when a function returns a reference and takes more than one reference as input.',
          '`fn longest<\'a>(x: &\'a str, y: &\'a str) -> &\'a str` does not make the two references live longer. It DECLARES a fact the compiler must then verify: the returned reference is valid for exactly as long as the SHORTER of `x` and `y`\'s lifetimes.',
        ],
        bullets: [
          "A lifetime is a name for a span of validity, checked entirely at compile time",
          'Lifetime elision handles the common single-reference cases automatically',
          'Explicit annotations describe relationships between multiple references\' lifetimes',
        ],
      },
      {
        type: 'diagram',
        title: 'Two different lifetimes, one illegal reference',
        description: 'Different variables live for different spans of a function. A reference can never outlive the data it points to.',
        diagram: {
          title: "Why you can't return a reference to a short-lived local",
          frames: [
            {
              caption: '`x` is created at the top of the function and lives all the way to the end — a long lifetime, drawn as a wide timeline bar.',
              nodes: [{ id: 'x-bar', label: "x: 'long", sublabel: 'lives the whole function', tone: 'stack', shape: 'pill', x: 45, y: 30, w: 300 }],
            },
            {
              caption: '`y` is created later, inside a narrower scope — a shorter lifetime, drawn as a shorter bar that ends sooner.',
              nodes: [
                { id: 'x-bar', label: "x: 'long", sublabel: 'lives the whole function', tone: 'stack', shape: 'pill', x: 45, y: 30, w: 300 },
                { id: 'y-bar', label: "y: 'short", sublabel: 'dropped before the function returns', tone: 'accent', shape: 'pill', x: 68, y: 55, w: 130 },
              ],
            },
            {
              caption: 'Trying to `return &y;` would hand the caller a reference that becomes invalid the moment `y` is dropped — the reference would outlive its data.',
              nodes: [
                { id: 'x-bar', label: "x: 'long", sublabel: 'lives the whole function', tone: 'stack', shape: 'pill', x: 45, y: 30, w: 300 },
                { id: 'y-bar', label: "y: 'short", sublabel: 'dropped before the function returns', tone: 'accent', shape: 'pill', x: 68, y: 55, w: 130 },
                { id: 'attempt', label: 'return &y ?', sublabel: 'would dangle', tone: 'danger', shape: 'pill', x: 82, y: 80 },
              ],
              edges: [{ from: 'attempt', to: 'y-bar', dashed: true, tone: 'danger', label: 'outlives y!' }],
            },
            {
              caption: 'The compiler rejects this at compile time (E0515: "cannot return reference to local variable") — before it ever becomes a runtime bug.',
              nodes: [
                { id: 'x-bar', label: "x: 'long", sublabel: 'lives the whole function', tone: 'stack', shape: 'pill', x: 45, y: 30, w: 300 },
                { id: 'y-bar', label: "y: 'short", sublabel: 'dropped before the function returns', tone: 'accent', shape: 'pill', x: 68, y: 55, w: 130 },
                { id: 'attempt', label: 'return &y ?', sublabel: 'rejected: E0515', tone: 'danger', shape: 'pill', x: 82, y: 80, invalid: true },
              ],
              edges: [{ from: 'attempt', to: 'y-bar', dashed: true, tone: 'danger', label: 'outlives y!' }],
            },
            {
              caption: 'The fix: only return references that live at least as long as the return value needs to — e.g. reference `x` instead, or return an owned value.',
              nodes: [
                { id: 'x-bar', label: "x: 'long", sublabel: 'lives the whole function', tone: 'stack', shape: 'pill', x: 45, y: 30, w: 300 },
                { id: 'y-bar', label: "y: 'short", sublabel: 'dropped before the function returns', tone: 'accent', shape: 'pill', x: 68, y: 55, w: 130 },
                { id: 'fixed', label: 'return &x', sublabel: 'valid: x outlives the call', tone: 'success', shape: 'pill', x: 45, y: 80 },
              ],
              edges: [{ from: 'fixed', to: 'x-bar', tone: 'success', label: 'safe' }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'An explicit lifetime annotation',
        description: 'This compiles because `result` is only used while `s2` (the shorter-lived string) is still alive — the compiler checks exactly this.',
        code: `// The lifetime 'a says: the returned reference lives at most as long as
// the SHORTER of \`x\` and \`y\`'s lifetimes — the compiler enforces this at
// every call site, so it never has to guess.
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}

fn main() {
    let s1 = String::from("hello world");
    let result;
    {
        let s2 = String::from("hi");
        result = longest(s1.as_str(), s2.as_str());
        println!("longest string is '{}'", result);
    }
}
`,
        runnable: true,
      },
      {
        type: 'debug',
        title: 'Fix the dangling reference',
        challenge: {
          problem: 'This function tries to return a reference to data it created internally. Why can that never work, no matter how it is annotated?',
          brokenCode: `fn dangle<'a>() -> &'a String {
    let s = String::from("hello");
    &s
}

fn main() {
    let result = dangle();
    println!("{}", result);
}
`,
          bugExplanation:
            '`s` is a local variable created inside `dangle`. It is dropped the instant the function returns. Returning `&s` would hand the caller a reference to memory that no longer exists — a dangling reference. No lifetime annotation can fix this, because there genuinely is no lifetime long enough: the caller needs the reference to live LONGER than the function call, but `s` cannot live longer than the function call. Rust rejects this with E0515: "cannot return reference to local variable `s`".',
          hints: [
            { title: 'Ask: who owns `s` after the function returns?', body: 'Nobody — it was about to be dropped. A reference to it would point at freed memory.' },
            { title: 'Adding more lifetime annotations will not help', body: "This isn't a syntax problem the annotation can solve — it's a fundamental fact about how long `s` exists." },
            { title: 'Return ownership instead of a reference', body: 'If you return the String itself (not a reference to it), ownership moves to the caller and nothing is left dangling.' },
          ],
          fixedCode: `fn dangle() -> String {
    let s = String::from("hello");
    s // ownership moves out to the caller — nothing is left dangling
}

fn main() {
    let result = dangle();
    println!("{}", result);
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'The lifetime puzzle: which of these compile?',
        questions: [
          {
            id: 'q1',
            prompt: 'Does this function compile?',
            code: `fn first(list: &[i32]) -> &i32 {
    &list[0]
}
`,
            options: [
              { id: 'a', text: 'Yes — lifetime elision infers the output lifetime from the single input reference' },
              { id: 'b', text: 'No — it needs an explicit <\'a> annotation' },
            ],
            correctOptionIds: ['a'],
            explanation: "With exactly one reference parameter, Rust's lifetime elision rules automatically tie the output reference's lifetime to the input's — this compiles with no annotations needed.",
          },
          {
            id: 'q2',
            prompt: 'Does this function compile?',
            code: `fn pick<'a>(x: &str, y: &'a str) -> &'a str {
    x
}
`,
            options: [
              { id: 'a', text: 'Yes' },
              { id: 'b', text: "No — E0621: x's lifetime isn't tied to 'a, so it can't be returned as &'a str" },
            ],
            correctOptionIds: ['b'],
            explanation: '`x` has its own, separate, unnamed lifetime — it was never declared to be `\'a`. The compiler cannot assume `x` lives as long as `\'a` requires, so returning it as `&\'a str` is rejected with E0621. Fixing it means giving `x` the `\'a` annotation too: `fn pick<\'a>(x: &\'a str, y: &\'a str) -> &\'a str`.',
          },
          {
            id: 'q3',
            prompt: 'Does this function compile?',
            code: `fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
`,
            options: [
              { id: 'a', text: 'Yes — both inputs share \'a, so either can be returned as \'a' },
              { id: 'b', text: 'No — you cannot return either x or y conditionally' },
            ],
            correctOptionIds: ['a'],
            explanation: "Because both x and y are explicitly tied to the same lifetime 'a, the compiler knows either one is valid to return as &'a str — the returned reference is guaranteed valid for at most the shorter of the two.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 5. Challenge: Fix the Borrow Checker
  // ---------------------------------------------------------------------
  'ri-challenge-borrow-checker': {
    id: 'ri-challenge-borrow-checker',
    heroSummary:
      'Three real, independent borrow-checker mistakes. No hand-holding explanations up front — just broken code, the real compiler error, and a hint ladder to walk you to the fix, the same way you\'ll actually debug this in your own projects.',
    dependencyChain: {
      learned: 'Move semantics and the borrowing rules (one mutable XOR many immutable references at a time).',
      why: 'Reading a real borrow-checker error and knowing which of a handful of common causes it is takes practice — this lesson is that practice.',
      build: 'Pattern recognition for the borrow checker\'s most common complaints, and the standard fixes for each.',
      next: 'Option, Result, and the ? operator — the next place the compiler starts actively helping you instead of fighting you.',
    },
    sections: [
      {
        type: 'explain',
        title: 'The compiler is your pair programmer',
        body: [
          'Every error in this lesson is a real error rustc produces. None of these are contrived — they are the exact three mistakes almost every developer makes in their first weeks with Rust.',
          "Treat the compiler's error message as a colleague pointing at the problem, not an obstacle. It always tells you: which value, which borrow, and why they conflict. Reading it carefully is faster than guessing.",
        ],
        bullets: [
          'Mutating a collection while iterating over it',
          'Using a value after moving it into a function',
          'Two mutable borrows alive in the same scope',
        ],
      },
      {
        type: 'debug',
        title: 'Challenge 1: Mutating while iterating',
        challenge: {
          problem: 'This tries to double every even number in a Vec by pushing new values in — while looping over that same Vec. Why does it fail?',
          brokenCode: `fn main() {
    let mut numbers = vec![1, 2, 3, 4];

    for n in &numbers {
        if *n % 2 == 0 {
            numbers.push(*n * 10);
        }
    }

    println!("{:?}", numbers);
}
`,
          bugExplanation:
            '`for n in &numbers` holds an immutable borrow of `numbers` for the entire loop. Calling `numbers.push(...)` inside that loop needs a MUTABLE borrow — while the immutable one from the loop is still active. This is exactly the "iterator invalidation" problem: push() might reallocate the buffer, which would leave the iterator pointing at stale, freed memory. rustc rejects it with E0502 before that can ever happen.',
          hints: [
            { title: 'What is `&numbers` in the for loop?', body: 'It creates an iterator that holds an immutable borrow of the whole Vec for the duration of the loop.' },
            { title: 'What could push() invalidate?', body: 'If the Vec needs to grow, push() may move all its elements to a new, larger allocation — invalidating any outstanding references/iterators into the old one.' },
            { title: 'Separate reading from mutating', body: 'Collect the values you want to add into a separate Vec first, finish the loop (ending the immutable borrow), THEN mutate the original.' },
          ],
          fixedCode: `fn main() {
    let mut numbers = vec![1, 2, 3, 4];

    let to_add: Vec<i32> = numbers.iter().filter(|n| **n % 2 == 0).map(|n| n * 10).collect();
    numbers.extend(to_add);

    println!("{:?}", numbers);
}
`,
        },
      },
      {
        type: 'debug',
        title: 'Challenge 2: Use after move into a function',
        challenge: {
          problem: 'This passes a String into a function, then tries to use it again afterwards. Why is that a problem?',
          brokenCode: `fn print_name(name: String) {
    println!("hello, {}", name);
}

fn main() {
    let name = String::from("Priya");
    print_name(name);
    println!("goodbye, {}", name);
}
`,
          bugExplanation:
            '`print_name` takes `name: String` BY VALUE, meaning the call `print_name(name)` moves ownership of the string into the function. Once the function returns, that value has already been dropped (freed) — there is nothing left in `main` for the second `println!` to read. rustc rejects this with E0382: "borrow of moved value: `name`".',
          hints: [
            { title: 'Check the parameter type', body: 'Does `print_name` need to OWN the string, or does it just need to read it?' },
            { title: 'A function only needs ownership if it stores or returns the value', body: 'Here, `print_name` only reads `name` to print it — it never needs to keep it around.' },
            { title: 'Borrow instead of consume', body: 'Change the parameter to `&str` and pass `&name` at the call site — the function reads the data without taking ownership, so `main` can keep using `name` afterward.' },
          ],
          fixedCode: `fn print_name(name: &str) {
    println!("hello, {}", name);
}

fn main() {
    let name = String::from("Priya");
    print_name(&name);
    println!("goodbye, {}", name);
}
`,
        },
      },
      {
        type: 'debug',
        title: 'Challenge 3: Two mutable borrows at once',
        challenge: {
          problem: 'This creates two mutable references to the same String and tries to use them both. What goes wrong?',
          brokenCode: `fn main() {
    let mut score = String::from("0");

    let r1 = &mut score;
    let r2 = &mut score;

    r1.push('!');
    r2.push('?');
    println!("{} {}", r1, r2);
}
`,
          bugExplanation:
            'Rust allows at most one mutable borrow of a value to exist at a time. Here, `r1` and `r2` are both live mutable borrows of `score` simultaneously (both are used later, in the `push` calls and the `println!`), which rustc rejects with E0499: "cannot borrow `score` as mutable more than once at a time." Allowing this would let two independent references both believe they have exclusive write access, which could cause data races or invalidated pointers.',
          hints: [
            { title: 'Count the live mutable borrows', body: 'At the point `r2` is created, is `r1` still going to be used later in the code? If yes, both borrows overlap in time.' },
            { title: 'Borrows end at their last use, not at the end of the block', body: "Rust's borrow checker (with modern non-lexical lifetimes) considers a borrow \"over\" after its last use — so shrinking r1's usage to before r2 is created can help." },
            { title: 'Give each borrow its own non-overlapping scope', body: 'Wrap the first borrow in a block (or otherwise finish using it) before creating the second one.' },
          ],
          fixedCode: `fn main() {
    let mut score = String::from("0");

    {
        let r1 = &mut score;
        r1.push('!');
    } // r1's borrow ends here

    let r2 = &mut score;
    r2.push('?');
    println!("{}", r2);
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Quick recap',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the common thread across all three challenges in this lesson?',
            options: [
              { id: 'a', text: 'They are all syntax errors' },
              { id: 'b', text: 'They all involve two things trying to access the same data in a way that conflicts — either two mutable accesses, or a mutable access alongside an immutable one, or use-after-ownership-transfer' },
              { id: 'c', text: 'They only happen with String and Vec, never other types' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Every borrow-checker error ultimately comes down to the same core rule: one owner, and either many readers or one writer, never both — checked entirely at compile time.',
          },
          {
            id: 'q2',
            prompt: 'When a function only needs to READ a value, what is usually the best parameter type to use?',
            options: [
              { id: 'a', text: 'Take ownership (e.g. String, Vec<T>) so the function is self-contained' },
              { id: 'b', text: 'A reference (&str, &Vec<T>, &T) so the caller keeps ownership and can keep using the value afterward' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Taking a reference is the idiomatic default whenever a function does not need to own, store, or return the value — it avoids unnecessary moves and keeps the caller\'s variable usable.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 6. Option, Result & Error Handling
  // ---------------------------------------------------------------------
  'ri-option-result': {
    id: 'ri-option-result',
    heroSummary:
      'Rust has no null and no exceptions. "Maybe nothing" and "maybe failure" are ordinary enum values — Option<T> and Result<T, E> — which the type system forces you to handle before you can use the value inside.',
    dependencyChain: {
      learned: 'Enums and pattern matching with match, plus ownership/borrowing for passing values around safely.',
      why: 'Option and Result are just enums — understanding them is a direct application of everything already learned about enums and match.',
      build: 'Option<T> for absence, Result<T, E> for fallibility, and the ? operator for propagating errors without boilerplate.',
      next: 'Every fallible standard library API, and later, Tauri commands that return Result to the frontend.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Failure as a type, not an exception',
        body: [
          'Instead of throwing an exception or returning a special "null" value, a fallible Rust function returns a value whose TYPE communicates that it might have failed. The compiler then forces you to handle both possibilities before you can get at the underlying data.',
          '`Option<T>` represents a value that might be absent: `Some(value)` or `None`. Use it for things like "look up a key that might not exist" — there is no error to report, just presence or absence.',
          '`Result<T, E>` represents an operation that might fail with a specific error: `Ok(value)` or `Err(error)`. Use it whenever failure carries useful information about WHY it failed.',
        ],
      },
      {
        type: 'code',
        title: 'The real (simplified) standard library definitions',
        description: "Option and Result aren't special compiler magic — they're ordinary enums defined in std, with generic type parameters. This snippet is for reading only (it doesn't need to run).",
        code: `// The real standard library definitions (simplified) — Option and Result
// are just enums, nothing magic:

enum Option<T> {
    Some(T),
    None,
}

enum Result<T, E> {
    Ok(T),
    Err(E),
}
`,
        runnable: false,
      },
      {
        type: 'diagram',
        title: 'A fallible call, branching',
        description: 'Every call to a function returning Result produces exactly one of two possible paths — both are ordinary values the caller must handle.',
        diagram: {
          title: 'text.parse::<i32>() -> Result<i32, ParseIntError>',
          frames: [
            {
              caption: 'Calling a fallible function returns a Result<T, E> value — not the parsed number directly, and not an exception.',
              nodes: [{ id: 'call', label: 'text.parse::<i32>()', tone: 'default', x: 20, y: 50 }],
            },
            {
              caption: 'If parsing succeeds, the function produces Ok(value) — an ordinary, successful return value.',
              nodes: [
                { id: 'call', label: 'text.parse::<i32>()', tone: 'default', x: 20, y: 50 },
                { id: 'ok', label: 'Ok(42)', tone: 'success', x: 65, y: 25 },
              ],
              edges: [{ from: 'call', to: 'ok', label: 'success path', tone: 'success' }],
            },
            {
              caption: 'If parsing fails, the function produces Err(error) instead — just as ordinary a return value, carrying details about what went wrong.',
              nodes: [
                { id: 'call', label: 'text.parse::<i32>()', tone: 'default', x: 20, y: 50 },
                { id: 'ok', label: 'Ok(42)', tone: 'success', x: 65, y: 25 },
                { id: 'err', label: 'Err(ParseIntError)', tone: 'danger', x: 65, y: 75 },
              ],
              edges: [
                { from: 'call', to: 'ok', label: 'success path', tone: 'success' },
                { from: 'call', to: 'err', label: 'failure path', dashed: true, tone: 'danger' },
              ],
            },
            {
              caption: 'The caller must handle BOTH branches — with match, if let, .unwrap_or(), or by propagating the Err upward with ?.',
              nodes: [
                { id: 'call', label: 'text.parse::<i32>()', tone: 'default', x: 20, y: 50 },
                { id: 'ok', label: 'Ok(42)', tone: 'success', x: 65, y: 25 },
                { id: 'err', label: 'Err(ParseIntError)', tone: 'danger', x: 65, y: 75 },
                { id: 'handled-ok', label: 'use 42', tone: 'success', shape: 'pill', x: 95, y: 25 },
                { id: 'handled-err', label: 'log / retry / ?', tone: 'muted', shape: 'pill', x: 95, y: 75 },
              ],
              edges: [
                { from: 'call', to: 'ok', label: 'success path', tone: 'success' },
                { from: 'call', to: 'err', label: 'failure path', dashed: true, tone: 'danger' },
                { from: 'ok', to: 'handled-ok', tone: 'success' },
                { from: 'err', to: 'handled-err', dashed: true, tone: 'muted' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Handling Result with match',
        description: 'Parsing a string as a number can fail — .parse() returns a Result, and match forces both cases to be handled.',
        code: `fn main() {
    let inputs = ["42", "not-a-number"];

    for text in inputs {
        match text.parse::<i32>() {
            Ok(n) => println!("parsed {} -> {}", text, n),
            Err(e) => println!("parsed {} -> error: {}", text, e),
        }
    }
}
`,
        runnable: true,
      },
      {
        type: 'code',
        title: 'The same logic with the ? operator',
        description: '? unwraps an Ok value, or returns the Err early from the current function — no explicit match needed. main() here returns a Result so it can use ? too.',
        code: `fn parse_and_double(text: &str) -> Result<i32, std::num::ParseIntError> {
    let n = text.parse::<i32>()?; // returns early with Err if parsing fails
    Ok(n * 2)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let doubled = parse_and_double("21")?;
    println!("doubled = {}", doubled);
    Ok(())
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: Result Challenge — safe division',
        exercise: {
          problem:
            'Implement `divide(a, b)` so it returns `Err(DivideByZeroError)` when `b` is zero, and `Ok(a / b)` otherwise. Then use `?` inside `compute()` to propagate that error upward.',
          starterCode: `#[derive(Debug)]
struct DivideByZeroError;

fn divide(a: f64, b: f64) -> Result<f64, DivideByZeroError> {
    // TODO: return Err(DivideByZeroError) if \`b\` is 0.0, otherwise Ok(a / b)
    Ok(0.0)
}

fn compute() -> Result<(), DivideByZeroError> {
    let result = divide(10.0, 2.0)?;
    println!("10 / 2 = {}", result);

    match divide(5.0, 0.0) {
        Ok(v) => println!("5 / 0 = {}", v),
        Err(_) => println!("cannot divide by zero"),
    }
    Ok(())
}

fn main() {
    compute().unwrap();
}
`,
          hints: [
            { title: 'Check the divisor first', body: 'Before doing any division, check `if b == 0.0 { ... }` and return early.' },
            { title: 'Return the error variant directly', body: '`DivideByZeroError` has no fields, so `Err(DivideByZeroError)` is a complete, valid value.' },
            { title: "The ? in compute() already does what you'd write manually", body: '`divide(10.0, 2.0)?` is equivalent to matching on the Result and returning early on Err — you only need to make `divide` itself correct.' },
          ],
          solutionCode: `#[derive(Debug)]
struct DivideByZeroError;

fn divide(a: f64, b: f64) -> Result<f64, DivideByZeroError> {
    if b == 0.0 {
        return Err(DivideByZeroError);
    }
    Ok(a / b)
}

fn compute() -> Result<(), DivideByZeroError> {
    let result = divide(10.0, 2.0)?;
    println!("10 / 2 = {}", result);

    match divide(5.0, 0.0) {
        Ok(v) => println!("5 / 0 = {}", v),
        Err(_) => println!("cannot divide by zero"),
    }
    Ok(())
}

fn main() {
    compute().unwrap();
}
`,
          solutionExplanation:
            '`divide` checks for the zero-divisor case up front and returns `Err` immediately, otherwise wrapping the successful division in `Ok`. Inside `compute`, `?` on the first call unwraps the `Ok` value (or would return the `Err` immediately if there were one), while the second call is handled explicitly with `match` since we want to keep running even after a failure.',
          expectedOutputContains: ['10 / 2 = 5', 'cannot divide by zero'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the panic',
        challenge: {
          problem: 'This program panics at runtime instead of failing to compile. Why, and how do we handle it safely?',
          brokenCode: `fn main() {
    let text = "abc";
    let number: i32 = text.parse().unwrap();
    println!("number = {}", number);
}
`,
          bugExplanation:
            '`.parse::<i32>()` returns `Result<i32, ParseIntError>`. `"abc"` is not a valid integer, so parsing produces `Err(ParseIntError { kind: InvalidDigit })`. Calling `.unwrap()` on a `Result` immediately panics if the value is `Err` — it is a shortcut that says "I am certain this will always be Ok," which was not true here. The program compiles fine (this is a RUNTIME error, not a compile error) and crashes with: `thread \'main\' panicked at ...: called \`Result::unwrap()\` on an \`Err\` value: ParseIntError { kind: InvalidDigit }`.',
          hints: [
            { title: 'unwrap() is a promise, not a check', body: 'unwrap() tells the compiler "trust me, this is Ok" — if you are wrong, the program panics instead of failing to compile.' },
            { title: 'Where does .parse() actually fail?', body: '"abc" contains no digits at all, so parsing as i32 always produces an Err(ParseIntError) here.' },
            { title: 'Handle both cases explicitly', body: 'Use match (or if let / .unwrap_or / .ok()) instead of unwrap() so an Err results in a graceful message instead of a crash.' },
          ],
          fixedCode: `fn main() {
    let text = "abc";
    match text.parse::<i32>() {
        Ok(number) => println!("number = {}", number),
        Err(e) => println!("could not parse '{}': {}", text, e),
    }
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'When should you reach for Option<T> instead of Result<T, E>?',
            options: [
              { id: 'a', text: 'When a value might simply be absent, and there is no meaningful "reason" for its absence to report' },
              { id: 'b', text: 'When you need detailed information about why an operation failed' },
              { id: 'c', text: 'Option and Result are interchangeable and it never matters which you pick' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Option<T> communicates "there may be nothing here" (like a HashMap lookup miss). Result<T, E> communicates "this operation can fail, and here is why."',
          },
          {
            id: 'q2',
            prompt: 'What does the ? operator do inside a function that returns Result<T, E>?',
            options: [
              { id: 'a', text: 'It ignores errors silently and continues with a default value' },
              { id: 'b', text: 'On Ok(v), it evaluates to v; on Err(e), it returns Err(e) immediately from the enclosing function' },
              { id: 'c', text: 'It always panics on Err, just like unwrap()' },
            ],
            correctOptionIds: ['b'],
            explanation: '? is shorthand for "match and propagate": unwrap the success value to keep going, or return the error immediately to the caller.',
          },
          {
            id: 'q3',
            prompt: 'What happens when you call .unwrap() on a Result that is Err?',
            options: [
              { id: 'a', text: 'It returns a default value of the expected type' },
              { id: 'b', text: 'It compiles fine but panics at runtime with a message describing the Err value' },
              { id: 'c', text: 'It fails to compile' },
            ],
            correctOptionIds: ['b'],
            explanation: 'unwrap() is a runtime assertion, not a compile-time check. Calling it on an Err (or None) causes an immediate panic.',
          },
          {
            id: 'q4',
            prompt: 'Why can main() itself return Result<(), Box<dyn std::error::Error>> in Rust?',
            options: [
              { id: 'a', text: 'It cannot — main must always return ()' },
              { id: 'b', text: 'Rust allows main to return any type implementing the Termination trait, including Result, which lets you use ? directly inside main' },
            ],
            correctOptionIds: ['b'],
            explanation: 'This is a convenience for exactly this situation: it lets you use ? at the top level of your program instead of manually matching every fallible call in main.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Structs, Methods, Enums & Pattern Matching (added)
  // ---------------------------------------------------------------------
// ─────────────────────────────────────────────────────────────────────
  // ri-structs-methods
  // ─────────────────────────────────────────────────────────────────────
  'ri-structs-methods': {
    id: 'ri-structs-methods',
    heroSummary:
      'A struct groups related data under one name; an impl block attaches behavior to it. Together they are how Rust builds its own types out of the primitives you already know.',
    dependencyChain: {
      learned: 'References, borrowing rules, and slices — how to look at data without taking ownership of it.',
      why: 'Structs are the first place those borrowing rules matter for YOUR types: methods take &self, and the same one-writer-or-many-readers rule applies to fields exactly as it did to plain variables.',
      build: 'Struct definitions, struct update syntax, impl blocks, methods (&self), and associated functions (Self::new).',
      next: 'Enums — a second, equally fundamental way to define your own types, this time for "one of several shapes" instead of "all of these fields together."',
    },
    sections: [
      {
        type: 'explain',
        title: 'A struct is a named bundle of fields',
        body: [
          "Up to now, related data has probably lived in separate variables — a user's name in one String, their age in one u32 — or in a tuple where you have to remember that field 0 is the name and field 1 is the age. A struct fixes both problems: it groups fields under one name, and each field has its own name too.",
          "Defining a struct only describes its SHAPE — it doesn't allocate anything by itself. An instance is created with a struct literal: the type name followed by `{ field: value, ... }` for every field. Rust requires every field to be initialized; there is no notion of a partially-built struct or a default-zeroed instance unless you ask for one explicitly.",
          "Struct update syntax (`..other`) lets you build a new instance that copies the remaining fields from an existing one, which is common when you want 'the same struct but with one field changed.' It's exactly one field-by-field copy, using `..` to say 'and everything else comes from here.'",
        ],
        bullets: [
          'struct Point { x: f64, y: f64 } defines the shape',
          'Point { x: 1.0, y: 2.0 } creates one instance',
          'Point { x: 5.0, ..other } copies every field except x from other',
        ],
      },
      {
        type: 'code',
        title: 'Defining and constructing a struct',
        description: 'A struct with a mix of field types, plus the struct update syntax for producing a modified copy.',
        code: `#[derive(Debug)]
struct User {
    username: String,
    email: String,
    active: bool,
    sign_in_count: u64,
}

fn main() {
    let user1 = User {
        username: String::from("priya"),
        email: String::from("priya@example.com"),
        active: true,
        sign_in_count: 1,
    };

    // Struct update syntax: same as user1, but with a new email.
    // Every field NOT listed explicitly is copied from user1.
    let user2 = User {
        email: String::from("priya.dev@example.com"),
        ..user1
    };

    println!("{:?}", user2);
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'impl blocks: attaching behavior to data',
        body: [
          "A struct definition only has fields — no behavior. An `impl Type { ... }` block is where you write functions that belong to that type. Inside an impl block there are two distinct kinds of functions, and mixing them up is the single most common beginner confusion.",
          "A METHOD takes `self` (usually `&self`) as its first parameter and is called on an instance with dot syntax: `user.is_active()`. It reads (or, with `&mut self`, mutates) the fields of the specific instance it was called on.",
          "An ASSOCIATED FUNCTION has no `self` parameter at all and is called on the TYPE itself with `::`, not an instance: `User::new(...)`. There is no instance yet for it to operate on — that's exactly why it's the idiomatic place to put a constructor. `Self` inside an impl block is just shorthand for the type name being implemented, so `Self::new` and `User::new` mean the same thing inside `impl User`.",
        ],
        bullets: [
          '&self — borrows the instance immutably (read-only method)',
          '&mut self — borrows the instance mutably (can modify fields)',
          'self (no &) — takes ownership of the instance, consuming it',
          'no self at all — an associated function, called as Type::function(...)',
        ],
        callout: {
          tone: 'accent',
          text: "By convention, constructors are named `new`, but that's just convention — `Self::new` is not special syntax the compiler recognizes, it's simply the associated function most Rust code expects to find.",
        },
      },
      {
        type: 'diagram',
        title: 'Methods vs. associated functions',
        description: 'The first parameter (or its absence) is what distinguishes a method call on an instance from an associated function call on the type.',
        diagram: {
          title: 'Rectangle::new(3.0, 4.0).area()',
          frames: [
            {
              caption: 'Rectangle::new is an associated function — called on the type itself, with no instance in existence yet, using double-colon syntax.',
              nodes: [
                { id: 'type', label: 'Rectangle (the type)', tone: 'muted', shape: 'ghost', x: 20, y: 20 },
                { id: 'new-call', label: 'Rectangle::new(3.0, 4.0)', tone: 'accent', x: 20, y: 50 },
              ],
            },
            {
              caption: 'Calling it produces a brand-new Rectangle instance on the stack, with width and height set from the arguments.',
              nodes: [
                { id: 'type', label: 'Rectangle (the type)', tone: 'muted', shape: 'ghost', x: 20, y: 20 },
                { id: 'new-call', label: 'Rectangle::new(3.0, 4.0)', tone: 'accent', x: 20, y: 50 },
                { id: 'instance', label: 'rect { width: 3.0, height: 4.0 }', tone: 'stack', x: 60, y: 50 },
              ],
              edges: [{ from: 'new-call', to: 'instance', label: 'returns Self', tone: 'accent' }],
            },
            {
              caption: 'rect.area() is a method — it is called ON the instance with dot syntax, implicitly passing &rect as the &self parameter.',
              nodes: [
                { id: 'type', label: 'Rectangle (the type)', tone: 'muted', shape: 'ghost', x: 20, y: 20 },
                { id: 'new-call', label: 'Rectangle::new(3.0, 4.0)', tone: 'accent', x: 20, y: 50 },
                { id: 'instance', label: 'rect { width: 3.0, height: 4.0 }', tone: 'stack', x: 60, y: 50 },
                { id: 'method-call', label: 'rect.area()', tone: 'default', x: 60, y: 80 },
              ],
              edges: [
                { from: 'new-call', to: 'instance', label: 'returns Self', tone: 'accent' },
                { from: 'method-call', to: 'instance', label: '&self borrows rect', dashed: true, tone: 'default' },
              ],
            },
            {
              caption: 'area() reads width and height through the borrow and returns 12.0 — rect itself is untouched and still usable afterward.',
              nodes: [
                { id: 'type', label: 'Rectangle (the type)', tone: 'muted', shape: 'ghost', x: 20, y: 20 },
                { id: 'new-call', label: 'Rectangle::new(3.0, 4.0)', tone: 'accent', x: 20, y: 50 },
                { id: 'instance', label: 'rect { width: 3.0, height: 4.0 }', tone: 'stack', x: 60, y: 50 },
                { id: 'method-call', label: 'rect.area()', tone: 'default', x: 60, y: 80 },
                { id: 'result', label: '12.0', tone: 'success', shape: 'pill', x: 90, y: 80 },
              ],
              edges: [
                { from: 'new-call', to: 'instance', label: 'returns Self', tone: 'accent' },
                { from: 'method-call', to: 'instance', label: '&self borrows rect', dashed: true, tone: 'default' },
                { from: 'method-call', to: 'result', tone: 'success' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'An impl block: constructor plus methods',
        description: '`new` is an associated function (constructor); `area` and `grow` are methods, one read-only and one mutating.',
        code: `struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    // Associated function: no self, called as Rectangle::new(...)
    fn new(width: f64, height: f64) -> Self {
        Self { width, height }
    }

    // Method: &self, called as rect.area()
    fn area(&self) -> f64 {
        self.width * self.height
    }

    // Method: &mut self, called as rect.grow(...), mutates the instance
    fn grow(&mut self, factor: f64) {
        self.width *= factor;
        self.height *= factor;
    }
}

fn main() {
    let mut rect = Rectangle::new(3.0, 4.0);
    println!("area = {}", rect.area());

    rect.grow(2.0);
    println!("area after growing = {}", rect.area());
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: a Circle with area() and scale()',
        exercise: {
          problem:
            'Finish the `Circle` struct: implement `Circle::new(radius)` as an associated function, `area(&self)` returning π·r² (use `std::f64::consts::PI`), and `scale(&mut self, factor)` that multiplies the radius in place.',
          starterCode: `struct Circle {
    radius: f64,
}

impl Circle {
    fn new(radius: f64) -> Self {
        // TODO: construct and return Self with the given radius
        todo!()
    }

    fn area(&self) -> f64 {
        // TODO: return PI * radius * radius
        0.0
    }

    fn scale(&mut self, factor: f64) {
        // TODO: multiply self.radius by factor
    }
}

fn main() {
    let mut c = Circle::new(2.0);
    println!("area = {:.2}", c.area());

    c.scale(3.0);
    println!("radius after scale = {}", c.radius);
    println!("area after scale = {:.2}", c.area());
}
`,
          hints: [
            { title: 'Self { field }', body: 'Inside `impl Circle`, `Self` means `Circle`. When a variable has the same name as the field, `Self { radius }` is shorthand for `Self { radius: radius }`.' },
            { title: 'Reach for the constant', body: '`std::f64::consts::PI` is a f64 constant already in std — you can call it fully qualified, or bring it in with `use std::f64::consts::PI;` at the top.' },
            { title: '&mut self can assign through self', body: '`scale` takes `&mut self`, so `self.radius = self.radius * factor;` (or `self.radius *= factor;`) is allowed — it would NOT be, with a plain `&self`.' },
          ],
          solutionCode: `struct Circle {
    radius: f64,
}

impl Circle {
    fn new(radius: f64) -> Self {
        Self { radius }
    }

    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }

    fn scale(&mut self, factor: f64) {
        self.radius *= factor;
    }
}

fn main() {
    let mut c = Circle::new(2.0);
    println!("area = {:.2}", c.area());

    c.scale(3.0);
    println!("radius after scale = {}", c.radius);
    println!("area after scale = {:.2}", c.area());
}
`,
          solutionExplanation:
            '`new` builds a `Self` using field-init shorthand since the parameter and field share the name `radius`. `area` only reads fields, so `&self` is enough. `scale` needs to modify `self.radius` in place, so it takes `&mut self` and the caller must hold `c` in a `mut` binding and call `c.scale(...)` (which Rust auto-borrows as `&mut c`).',
          expectedOutputContains: ['area = 12.57', 'radius after scale = 6', 'area after scale = 113.10'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the borrow error',
        challenge: {
          problem: 'This takes a reference to a rectangle, then tries to grow it, then prints through that same reference afterward. Why does it fail to compile?',
          brokenCode: `struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn grow(&mut self, factor: f64) {
        self.width *= factor;
        self.height *= factor;
    }
}

fn main() {
    let mut rect = Rectangle { width: 2.0, height: 3.0 };

    let r = &rect;
    rect.grow(2.0);
    println!("area = {}", r.area());
}
`,
          bugExplanation:
            '`let r = &rect;` creates an immutable borrow of `rect`. Because `r` is used later — in the final `println!("{}", r.area())` — that immutable borrow is alive across the entire span up to that use, under Rust\'s non-lexical-lifetime rules. `rect.grow(2.0)` needs a MUTABLE borrow of `rect` to run, but one is not allowed to exist while an immutable borrow of the same value is still alive. rustc rejects this with E0502: "cannot borrow `rect` as mutable because it is also borrowed as immutable." This is the exact same one-writer-or-many-readers rule from the borrowing lesson — it did not go away just because `rect` is now a struct instead of a plain variable.',
          hints: [
            { title: 'Borrows last until their last use, not the end of the block', body: '`r`\'s borrow is not "over" right after `let r = &rect;` — it stays alive because `r` is read again later, in the final println!.' },
            { title: 'grow needs exclusive access', body: '`grow(&mut self, ...)` requires no other borrows of `rect` to be alive at the same time — but `r` is still going to be used after the grow() call.' },
            { title: 'End the immutable borrow before mutating', body: 'Use `r` (if you need it) BEFORE calling grow, or drop the `let r = &rect;` line entirely and just call `rect.area()` fresh at the end.' },
          ],
          fixedCode: `struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn grow(&mut self, factor: f64) {
        self.width *= factor;
        self.height *= factor;
    }
}

fn main() {
    let mut rect = Rectangle { width: 2.0, height: 3.0 };

    rect.grow(2.0);
    println!("area = {}", rect.area());
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What distinguishes a method from an associated function in an impl block?',
            options: [
              { id: 'a', text: 'A method takes `self` (or `&self`/`&mut self`) as its first parameter and is called with dot syntax on an instance; an associated function has no `self` and is called with `::` on the type' },
              { id: 'b', text: 'Methods are faster than associated functions at runtime' },
              { id: 'c', text: 'Associated functions can only return `Self`' },
            ],
            correctOptionIds: ['a'],
            explanation: 'The presence of a `self` parameter is the entire distinction. `Self::new(...)` has no instance to operate on yet, which is exactly why constructors are written as associated functions.',
          },
          {
            id: 'q2',
            prompt: 'Given `fn grow(&mut self, factor: f64)`, what does calling `rect.grow(2.0)` require of `rect`?',
            code: 'fn grow(&mut self, factor: f64) { self.width *= factor; }',
            options: [
              { id: 'a', text: '`rect` must be declared with `let mut rect = ...`, since the method needs a mutable borrow to modify its fields' },
              { id: 'b', text: 'Nothing special — any binding can call a &mut self method' },
              { id: 'c', text: '`rect` must be re-declared as `Rectangle::new` each time' },
            ],
            correctOptionIds: ['a'],
            explanation: 'A &mut self method needs exclusive, mutable access to the instance, which only a `mut` binding can provide — exactly the same rule that applies to plain `&mut` references.',
          },
          {
            id: 'q3',
            prompt: 'What does struct update syntax (`..other`) do in a struct literal?',
            options: [
              { id: 'a', text: 'It deletes the fields not explicitly listed' },
              { id: 'b', text: 'It copies/moves every field NOT explicitly given a value from the `other` instance' },
              { id: 'c', text: 'It merges two structs of different types' },
            ],
            correctOptionIds: ['b'],
            explanation: '`..other` fills in the remaining fields from an existing instance of the same type — useful for producing "the same value, but with one field changed" without retyping every field.',
          },
          {
            id: 'q4',
            prompt: 'Inside `impl Rectangle { ... }`, what does `Self` refer to?',
            options: [
              { id: 'a', text: 'The current instance the method was called on (equivalent to `self`)' },
              { id: 'b', text: 'The type being implemented — here, `Rectangle` itself' },
              { id: 'c', text: 'A reserved keyword with no meaning inside impl blocks' },
            ],
            correctOptionIds: ['b'],
            explanation: '`Self` (capital S) is shorthand for the type name of the impl block — `Self::new` and `Rectangle::new` are interchangeable inside `impl Rectangle`. `self` (lowercase) is the instance parameter, a different thing entirely.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // ri-enums-pattern-matching
  // ─────────────────────────────────────────────────────────────────────
  'ri-enums-pattern-matching': {
    id: 'ri-enums-pattern-matching',
    heroSummary:
      'An enum defines a type as "exactly one of these named shapes," each optionally carrying its own data — and match is how you safely handle every shape the compiler knows might occur.',
    dependencyChain: {
      learned: 'Structs, impl blocks, and the distinction between methods (&self) and associated functions (Self::new).',
      why: 'Structs model "all of these fields, together." Enums model the other half of data modeling: "one of these possibilities, and only one, at a time" — a shape structs cannot express.',
      build: 'Defining enums, attaching data to individual variants, exhaustive match, if let / while let for the single-pattern case, and destructuring nested data in patterns.',
      next: 'Option<T> and Result<T, E> — the two most important enums in the entire language, both built from exactly what this lesson teaches.',
    },
    sections: [
      {
        type: 'explain',
        title: 'One of several shapes, not all of several fields',
        body: [
          "A struct forces every field to exist at once — a `Rectangle` always has both a width AND a height. An enum expresses the opposite kind of constraint: a value is exactly ONE of a fixed set of named variants, never more than one at a time. `IpAddr` is either `V4` or `V6` — never both, never neither.",
          "Variants aren't required to carry data at all (a plain tag, like an on/off flag), but they can each carry DIFFERENT data shapes. This is the feature structs alone can't give you: `Shape::Circle(f64)` carries one radius, `Shape::Rectangle(f64, f64)` carries two dimensions, and `Shape::Point` carries nothing — all three are still values of the single type `Shape`.",
          "This is exactly how Option<T> and Result<T, E> — which you'll meet properly next lesson — are built: ordinary enums, with variants that carry data (`Some(T)`, `Ok(T)`, `Err(E)`) or don't (`None`). There is no special-cased 'nullable type' in Rust; it's this same enum mechanism, used by the standard library.",
        ],
        bullets: [
          'enum IpAddr { V4(String), V6(String) } — two variants, each carrying a String',
          'A value of an enum type is always exactly one variant at a time',
          'Different variants of the same enum can carry completely different data shapes',
        ],
      },
      {
        type: 'code',
        title: 'Defining an enum with data-carrying variants',
        code: `#[derive(Debug)]
enum Shape {
    Circle(f64),           // radius
    Rectangle(f64, f64),   // width, height
    Point,                 // no data at all
}

fn main() {
    let shapes = vec![
        Shape::Circle(2.0),
        Shape::Rectangle(3.0, 4.0),
        Shape::Point,
    ];

    for shape in &shapes {
        println!("{:?}", shape);
    }
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'match: exhaustive, compiler-checked branching',
        body: [
          '`match` compares a value against a series of patterns and runs the code for the first one that fits. The critical difference from an if/else chain: the compiler REQUIRES every possible variant to be covered. Add a new variant to an enum later, and every `match` on that enum that forgot to handle it becomes a compile error, not a silent runtime bug — the compiler does the auditing for you.',
          "Each match arm can also DESTRUCTURE the data a variant carries, binding it to new names right in the pattern. `Shape::Circle(radius) => ...` both confirms the value is a Circle AND extracts its radius into a local variable named `radius`, in one step.",
          "`_` is the catch-all pattern — 'anything not matched above.' It's useful when you only care about specific variants and want everything else lumped together, but be deliberate: an unnecessary `_` can silently swallow a case you actually meant to handle, defeating the whole point of exhaustiveness checking.",
        ],
      },
      {
        type: 'code',
        title: 'match on an enum, destructuring each variant',
        description: 'Every arm binds the data it needs directly in the pattern — no separate "get the value out" step.',
        code: `enum Shape {
    Circle(f64),
    Rectangle(f64, f64),
    Point,
}

fn describe(shape: &Shape) -> String {
    match shape {
        Shape::Circle(radius) => format!("circle with area {:.2}", std::f64::consts::PI * radius * radius),
        Shape::Rectangle(w, h) => format!("rectangle with area {:.2}", w * h),
        Shape::Point => String::from("a single point, no area"),
    }
}

fn main() {
    let shapes = vec![Shape::Circle(2.0), Shape::Rectangle(3.0, 4.0), Shape::Point];

    for shape in &shapes {
        println!("{}", describe(shape));
    }
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'match forces every variant to be handled',
        description: 'Adding a variant to an enum later turns any match that forgot it into a compile error — the compiler is doing the exhaustiveness audit for you, permanently.',
        diagram: {
          title: 'match shape { ... }',
          frames: [
            {
              caption: 'Shape currently has three variants: Circle, Rectangle, and Point.',
              nodes: [
                { id: 'circle', label: 'Shape::Circle(f64)', tone: 'default', x: 20, y: 20 },
                { id: 'rect', label: 'Shape::Rectangle(f64, f64)', tone: 'default', x: 20, y: 50 },
                { id: 'point', label: 'Shape::Point', tone: 'default', x: 20, y: 80 },
              ],
            },
            {
              caption: 'A match expression with one arm per variant covers all three — the compiler confirms every possibility is accounted for.',
              nodes: [
                { id: 'circle', label: 'Shape::Circle(f64)', tone: 'default', x: 20, y: 20 },
                { id: 'rect', label: 'Shape::Rectangle(f64, f64)', tone: 'default', x: 20, y: 50 },
                { id: 'point', label: 'Shape::Point', tone: 'default', x: 20, y: 80 },
                { id: 'arm1', label: 'Circle(r) => ...', tone: 'success', shape: 'pill', x: 65, y: 20 },
                { id: 'arm2', label: 'Rectangle(w, h) => ...', tone: 'success', shape: 'pill', x: 65, y: 50 },
                { id: 'arm3', label: 'Point => ...', tone: 'success', shape: 'pill', x: 65, y: 80 },
              ],
              edges: [
                { from: 'circle', to: 'arm1', tone: 'success' },
                { from: 'rect', to: 'arm2', tone: 'success' },
                { from: 'point', to: 'arm3', tone: 'success' },
              ],
            },
            {
              caption: 'Now suppose a new variant, Triangle, is added to the enum somewhere else in the codebase.',
              nodes: [
                { id: 'circle', label: 'Shape::Circle(f64)', tone: 'default', x: 20, y: 15 },
                { id: 'rect', label: 'Shape::Rectangle(f64, f64)', tone: 'default', x: 20, y: 40 },
                { id: 'point', label: 'Shape::Point', tone: 'default', x: 20, y: 65 },
                { id: 'triangle', label: 'Shape::Triangle(f64, f64, f64)', tone: 'warning', x: 20, y: 90 },
                { id: 'arm1', label: 'Circle(r) => ...', tone: 'success', shape: 'pill', x: 65, y: 15 },
                { id: 'arm2', label: 'Rectangle(w, h) => ...', tone: 'success', shape: 'pill', x: 65, y: 40 },
                { id: 'arm3', label: 'Point => ...', tone: 'success', shape: 'pill', x: 65, y: 65 },
              ],
              edges: [
                { from: 'circle', to: 'arm1', tone: 'success' },
                { from: 'rect', to: 'arm2', tone: 'success' },
                { from: 'point', to: 'arm3', tone: 'success' },
              ],
            },
            {
              caption: 'This existing match no longer covers every variant — rustc refuses to compile it with "non-exhaustive patterns: `Triangle(_, _, _)` not covered," catching the gap immediately instead of letting it become a silent runtime bug.',
              nodes: [
                { id: 'circle', label: 'Shape::Circle(f64)', tone: 'default', x: 20, y: 15 },
                { id: 'rect', label: 'Shape::Rectangle(f64, f64)', tone: 'default', x: 20, y: 40 },
                { id: 'point', label: 'Shape::Point', tone: 'default', x: 20, y: 65 },
                { id: 'triangle', label: 'Shape::Triangle(f64, f64, f64)', tone: 'warning', x: 20, y: 90 },
                { id: 'arm1', label: 'Circle(r) => ...', tone: 'success', shape: 'pill', x: 65, y: 15 },
                { id: 'arm2', label: 'Rectangle(w, h) => ...', tone: 'success', shape: 'pill', x: 65, y: 40 },
                { id: 'arm3', label: 'Point => ...', tone: 'success', shape: 'pill', x: 65, y: 65 },
                { id: 'error', label: 'compile error: non-exhaustive match', tone: 'danger', shape: 'pill', x: 65, y: 90 },
              ],
              edges: [
                { from: 'circle', to: 'arm1', tone: 'success' },
                { from: 'rect', to: 'arm2', tone: 'success' },
                { from: 'point', to: 'arm3', tone: 'success' },
                { from: 'triangle', to: 'error', dashed: true, tone: 'danger' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'if let and while let: matching just one pattern',
        description: 'When you only care about one variant and want to ignore the rest, if let is a shorter, equivalent alternative to a match with a `_ => {}` arm.',
        code: `enum Message {
    Quit,
    Move { x: i32, y: i32 }, // a variant with named fields, like a mini-struct
    Text(String),
}

fn main() {
    let messages = vec![
        Message::Move { x: 3, y: 7 },
        Message::Text(String::from("hello")),
        Message::Quit,
    ];

    for msg in &messages {
        // Only interested in Move; everything else is skipped.
        if let Message::Move { x, y } = msg {
            println!("moving to ({}, {})", x, y);
        }
    }

    // while let keeps matching (and popping) as long as the pattern holds.
    let mut stack = vec![1, 2, 3];
    while let Some(top) = stack.pop() {
        println!("popped {}", top);
    }
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: traffic light durations',
        exercise: {
          problem:
            'Define an enum `TrafficLight` with variants `Red`, `Yellow`, and `Green`. Implement `duration_seconds(light: &TrafficLight) -> u32` using match, returning 30 for Red, 5 for Yellow, and 25 for Green.',
          starterCode: `enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn duration_seconds(light: &TrafficLight) -> u32 {
    // TODO: match on light and return the right duration
    0
}

fn main() {
    let lights = vec![TrafficLight::Red, TrafficLight::Yellow, TrafficLight::Green];

    for light in &lights {
        println!("{} seconds", duration_seconds(light));
    }
}
`,
          hints: [
            { title: 'Match on the reference directly', body: '`match light { TrafficLight::Red => ..., ... }` works even though `light` is `&TrafficLight` — Rust matches through the reference automatically.' },
            { title: 'One arm per variant, no data to destructure', body: 'None of these variants carry data, so each arm is just `TrafficLight::Variant => some_number`.' },
            { title: 'match is an expression', body: 'You can write `match light { ... }` as the last line of the function (no semicolon) and its value becomes the return value — no separate `return` needed.' },
          ],
          solutionCode: `enum TrafficLight {
    Red,
    Yellow,
    Green,
}

fn duration_seconds(light: &TrafficLight) -> u32 {
    match light {
        TrafficLight::Red => 30,
        TrafficLight::Yellow => 5,
        TrafficLight::Green => 25,
    }
}

fn main() {
    let lights = vec![TrafficLight::Red, TrafficLight::Yellow, TrafficLight::Green];

    for light in &lights {
        println!("{} seconds", duration_seconds(light));
    }
}
`,
          solutionExplanation:
            '`match light { ... }` is used as the final expression (no trailing semicolon on the match, and no semicolon needed after since it IS the return value), covering all three variants of TrafficLight exhaustively. Because none of the variants carry data, each pattern is just the bare variant name.',
          expectedOutputContains: ['30 seconds', '5 seconds', '25 seconds'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the non-exhaustive match',
        challenge: {
          problem: 'This enum grew a new variant, but the match handling it was written before that happened. What does the compiler say, and how do we fix it?',
          brokenCode: `enum Command {
    Start,
    Stop,
    Pause,
}

fn describe(cmd: &Command) -> &'static str {
    match cmd {
        Command::Start => "starting",
        Command::Stop => "stopping",
    }
}

fn main() {
    println!("{}", describe(&Command::Pause));
}
`,
          bugExplanation:
            "`Command` has three variants (`Start`, `Stop`, `Pause`), but the `match` in `describe` only has arms for `Start` and `Stop`. rustc rejects this with E0004: \"non-exhaustive patterns: `&Command::Pause` not covered\" — match requires every possible variant of the matched type to be handled, and `Pause` has none. This is exactly the safety net exhaustiveness checking is for: without it, calling `describe(&Command::Pause)` would need to do SOMETHING at runtime with no arm to run, which Rust refuses to allow it to even compile.",
          hints: [
            { title: 'Count the variants against the arms', body: 'Command has 3 variants. The match only has 2 arms — one variant is missing entirely.' },
            { title: "Which variant isn't covered?", body: '`Pause` has no corresponding `Command::Pause => ...` arm anywhere in the match.' },
            { title: 'Add the missing arm', body: 'Add `Command::Pause => "pausing",` as a third arm — or, if you genuinely want to lump it with a default, add a `_ => ...` catch-all arm instead.' },
          ],
          fixedCode: `enum Command {
    Start,
    Stop,
    Pause,
}

fn describe(cmd: &Command) -> &'static str {
    match cmd {
        Command::Start => "starting",
        Command::Stop => "stopping",
        Command::Pause => "pausing",
    }
}

fn main() {
    println!("{}", describe(&Command::Pause));
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the key difference between how a struct and an enum model data?',
            options: [
              { id: 'a', text: 'A struct groups fields that all exist together at once; an enum represents exactly one of several possible variants at a time' },
              { id: 'b', text: 'Enums cannot hold any data, only structs can' },
              { id: 'c', text: 'They are interchangeable and only differ in keyword' },
            ],
            correctOptionIds: ['a'],
            explanation: 'A struct is an AND (all fields present together). An enum is an OR (exactly one variant, chosen at construction time) — a fundamentally different modeling tool.',
          },
          {
            id: 'q2',
            prompt: 'Why does the Rust compiler require a match expression to be exhaustive (cover every variant)?',
            options: [
              { id: 'a', text: 'It is an arbitrary style rule that can be disabled with a compiler flag' },
              { id: 'b', text: 'So that adding a new variant to an enum later turns every match that forgot to handle it into a compile-time error instead of an unhandled case at runtime' },
              { id: 'c', text: 'Because match is otherwise slower than if/else at runtime' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Exhaustiveness checking is what makes enums + match safe for evolving code: forgetting a case becomes something the compiler catches immediately, not a bug discovered in production.',
          },
          {
            id: 'q3',
            prompt: 'When is `if let` a better choice than a full `match`?',
            code: 'if let Message::Move { x, y } = msg { println!("{} {}", x, y); }',
            options: [
              { id: 'a', text: 'When you only care about one specific pattern and want to ignore every other variant without writing a `_ => {}` arm' },
              { id: 'b', text: 'Never — match should always be preferred in every situation' },
              { id: 'c', text: '`if let` and `match` cannot both be used on enums' },
            ],
            correctOptionIds: ['a'],
            explanation: '`if let PATTERN = value { ... }` is sugar for a match with one real arm and an implicit `_ => {}` — shorter and clearer when you genuinely only care about a single case.',
          },
          {
            id: 'q4',
            prompt: 'What does the `_` pattern do inside a match arm?',
            options: [
              { id: 'a', text: 'It matches any value not already matched by an earlier arm, acting as a catch-all' },
              { id: 'b', text: 'It only matches the None or Err case specifically' },
              { id: 'c', text: 'It causes a compile error if used' },
            ],
            correctOptionIds: ['a'],
            explanation: '`_` is a wildcard pattern that matches anything. It is useful for a deliberate default case, but overusing it can accidentally hide variants you meant to handle explicitly.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // ri-collections-vec-hashmap
  // ─────────────────────────────────────────────────────────────────────
  'ri-collections-vec-hashmap': {
    id: 'ri-collections-vec-hashmap',
    heroSummary:
      'Vec<T> for ordered, growable lists; HashMap<K, V> for key-value lookups; HashSet<T> for uniqueness checks — the three collections that cover the overwhelming majority of everyday Rust data storage.',
    dependencyChain: {
      learned: 'Option<T>, Result<T, E>, and the ? operator for propagating errors.',
      why: 'Collection APIs lean on Option constantly — .get() returns Option<&T>, HashMap lookups return Option<&V> — so this lesson is where Option stops being an abstract idea and becomes a tool you reach for in nearly every line of collection-handling code.',
      build: 'Fluency with Vec<T> (push, iteration, indexing safely), HashMap<K, V> (insert, get, the entry API), and HashSet<T> (uniqueness, set-like membership checks).',
      next: 'Strings — a deep look at String vs &str, UTF-8, and the collection-adjacent gotchas specific to text.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Three shapes of "more than one value"',
        body: [
          "`Vec<T>` is an ordered, growable list, heap-allocated, indexed by position (0, 1, 2, ...). Reach for it whenever order matters or you need to process items sequentially — a todo list, a queue of jobs, rows from a file.",
          "`HashMap<K, V>` stores key-value pairs with no guaranteed order, optimized for 'given this key, find its value' in roughly constant time. Reach for it whenever you're looking things up by some identifier rather than by position — a username to a user profile, a word to its count.",
          "`HashSet<T>` is really a `HashMap<T, ()>` under the hood — it stores each value at most once and answers 'have I seen this before?' in constant time, with no values attached, just presence. Reach for it for deduplication and membership tests, not for storing associated data (that's what HashMap is for).",
          'All three types require you to import them with `use std::collections::HashMap;` and `use std::collections::HashSet;` — Vec is available without an import because it, along with Option and Result, is part of the automatically-included prelude.',
        ],
      },
      {
        type: 'code',
        title: 'Vec<T>: push, iterate, and index safely',
        description: '.get() returns Option<&T> instead of panicking on an out-of-range index the way [] indexing does.',
        code: `fn main() {
    let mut scores: Vec<i32> = Vec::new();
    scores.push(85);
    scores.push(92);
    scores.push(78);

    // Direct indexing panics if out of range:
    println!("first score = {}", scores[0]);

    // .get() is the safe alternative -- Option<&T>, never panics
    match scores.get(10) {
        Some(s) => println!("score at 10: {}", s),
        None => println!("no score at index 10"),
    }

    // Iterate with &, so scores is only borrowed, not consumed
    let total: i32 = scores.iter().sum();
    println!("total = {}, average = {:.1}", total, total as f64 / scores.len() as f64);

    // Iterate mutably to modify every element in place
    for s in scores.iter_mut() {
        *s += 5; // bonus points
    }
    println!("after bonus: {:?}", scores);
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'HashMap lookups return Option<&V>',
        description: 'A missing key is never an error or a crash — it is an ordinary None value the caller decides how to handle.',
        diagram: {
          title: 'scores.get("bob")',
          frames: [
            {
              caption: 'A HashMap<String, i32> holds a small set of key-value pairs, in no particular order.',
              nodes: [
                { id: 'map', label: 'HashMap { "alice": 90, "carol": 77 }', tone: 'heap', x: 40, y: 50 },
              ],
            },
            {
              caption: 'Looking up a key that exists, .get("alice"), returns Some, wrapping a reference to that value.',
              nodes: [
                { id: 'map', label: 'HashMap { "alice": 90, "carol": 77 }', tone: 'heap', x: 25, y: 50 },
                { id: 'hit', label: 'Some(&90)', tone: 'success', x: 70, y: 30 },
              ],
              edges: [{ from: 'map', to: 'hit', label: 'get("alice")', tone: 'success' }],
            },
            {
              caption: 'Looking up a key that does not exist, .get("bob"), returns None -- an ordinary value, not a panic or an exception.',
              nodes: [
                { id: 'map', label: 'HashMap { "alice": 90, "carol": 77 }', tone: 'heap', x: 25, y: 50 },
                { id: 'hit', label: 'Some(&90)', tone: 'success', x: 70, y: 25 },
                { id: 'miss', label: 'None', tone: 'muted', x: 70, y: 75 },
              ],
              edges: [
                { from: 'map', to: 'hit', label: 'get("alice")', tone: 'success' },
                { from: 'map', to: 'miss', label: 'get("bob")', dashed: true, tone: 'muted' },
              ],
            },
            {
              caption: 'The caller handles both outcomes explicitly -- with match, if let, or .unwrap_or(0) -- exactly like any other Option.',
              nodes: [
                { id: 'map', label: 'HashMap { "alice": 90, "carol": 77 }', tone: 'heap', x: 20, y: 50 },
                { id: 'hit', label: 'Some(&90)', tone: 'success', x: 55, y: 25 },
                { id: 'miss', label: 'None', tone: 'muted', x: 55, y: 75 },
                { id: 'handled-ok', label: 'print 90', tone: 'success', shape: 'pill', x: 90, y: 25 },
                { id: 'handled-miss', label: 'print "not found"', tone: 'muted', shape: 'pill', x: 90, y: 75 },
              ],
              edges: [
                { from: 'map', to: 'hit', label: 'get("alice")', tone: 'success' },
                { from: 'map', to: 'miss', label: 'get("bob")', dashed: true, tone: 'muted' },
                { from: 'hit', to: 'handled-ok', tone: 'success' },
                { from: 'miss', to: 'handled-miss', dashed: true, tone: 'muted' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'HashMap: insert, get, and the entry API',
        description: 'The entry API avoids a separate "does this key exist" check-then-act pair of steps, doing both atomically in one call.',
        code: `use std::collections::HashMap;

fn main() {
    let mut scores: HashMap<String, i32> = HashMap::new();
    scores.insert(String::from("alice"), 90);
    scores.insert(String::from("carol"), 77);

    match scores.get("alice") {
        Some(score) => println!("alice: {}", score),
        None => println!("alice not found"),
    }

    match scores.get("bob") {
        Some(score) => println!("bob: {}", score),
        None => println!("bob not found"),
    }

    // Counting word frequency is the canonical entry API use case:
    let words = ["the", "cat", "sat", "on", "the", "mat", "the"];
    let mut counts: HashMap<&str, i32> = HashMap::new();
    for word in words {
        // or_insert(0) inserts 0 only if the key is absent, then
        // returns a &mut i32 to the (possibly just-inserted) value.
        let count = counts.entry(word).or_insert(0);
        *count += 1;
    }

    let mut pairs: Vec<(&&str, &i32)> = counts.iter().collect();
    pairs.sort(); // sort for deterministic output
    for (word, count) in pairs {
        println!("{}: {}", word, count);
    }
}
`,
        runnable: true,
      },
      {
        type: 'code',
        title: 'HashSet: membership and deduplication',
        description: 'A HashSet stores at most one of each value; .insert() reports back whether it was actually new.',
        code: `use std::collections::HashSet;

fn main() {
    let mut seen: HashSet<i32> = HashSet::new();

    let ids = [1, 2, 3, 2, 4, 1, 5];
    let mut unique_count = 0;

    for id in ids {
        // insert() returns true if the value was NOT already present
        if seen.insert(id) {
            unique_count += 1;
        }
    }

    println!("unique ids seen: {}", unique_count);
    println!("contains 3: {}", seen.contains(&3));
    println!("contains 99: {}", seen.contains(&99));
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: group names by their first letter',
        exercise: {
          problem:
            'Given a Vec of names, build a `HashMap<char, Vec<String>>` mapping each first letter to a Vec of names starting with it. Use the entry API with `.or_insert_with(Vec::new)` to get-or-create the inner Vec, then push the name.',
          starterCode: `use std::collections::HashMap;

fn group_by_first_letter(names: &[&str]) -> HashMap<char, Vec<String>> {
    let mut groups: HashMap<char, Vec<String>> = HashMap::new();

    for name in names {
        // TODO: get the first character of \`name\`
        // TODO: use groups.entry(first_char).or_insert_with(Vec::new)
        //       to get a &mut Vec<String>, then push name.to_string() onto it
    }

    groups
}

fn main() {
    let names = ["Alice", "Bob", "Anna", "Charlie", "Ben"];
    let groups = group_by_first_letter(&names);

    let mut keys: Vec<&char> = groups.keys().collect();
    keys.sort();

    for key in keys {
        let mut list = groups[key].clone();
        list.sort();
        println!("{}: {:?}", key, list);
    }
}
`,
          hints: [
            { title: 'Getting the first character', body: '`name.chars().next()` returns `Option<char>` (a &str could technically be empty). Use `if let Some(first_char) = name.chars().next() { ... }` to unwrap it safely.' },
            { title: 'entry + or_insert_with', body: '`groups.entry(first_char).or_insert_with(Vec::new)` returns a `&mut Vec<String>` — creating an empty Vec first only if this key has never been seen before.' },
            { title: 'Push onto the returned reference', body: 'Call `.push(name.to_string())` directly on the `&mut Vec<String>` that `.entry(...).or_insert_with(Vec::new)` gives back.' },
          ],
          solutionCode: `use std::collections::HashMap;

fn group_by_first_letter(names: &[&str]) -> HashMap<char, Vec<String>> {
    let mut groups: HashMap<char, Vec<String>> = HashMap::new();

    for name in names {
        if let Some(first_char) = name.chars().next() {
            groups.entry(first_char).or_insert_with(Vec::new).push(name.to_string());
        }
    }

    groups
}

fn main() {
    let names = ["Alice", "Bob", "Anna", "Charlie", "Ben"];
    let groups = group_by_first_letter(&names);

    let mut keys: Vec<&char> = groups.keys().collect();
    keys.sort();

    for key in keys {
        let mut list = groups[key].clone();
        list.sort();
        println!("{}: {:?}", key, list);
    }
}
`,
          solutionExplanation:
            '`name.chars().next()` gets the first character as `Option<char>`, unwrapped safely with `if let`. `.entry(first_char).or_insert_with(Vec::new)` returns a `&mut Vec<String>` for that key — creating an empty Vec only the first time a letter is seen — and `.push(...)` appends the name directly onto it, all without ever writing a separate "does this key exist" check.',
          expectedOutputContains: ['A: ["Alice", "Anna"]', 'B: ["Ben", "Bob"]', 'C: ["Charlie"]'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the panic on missing key',
        challenge: {
          problem: 'This looks up a user by name using [] indexing on a HashMap. It works for existing users but crashes for one that does not exist. Why, and what is the safe alternative?',
          brokenCode: `use std::collections::HashMap;

fn main() {
    let mut ages: HashMap<String, u32> = HashMap::new();
    ages.insert(String::from("alice"), 30);
    ages.insert(String::from("bob"), 25);

    let names = ["alice", "bob", "carol"];

    for name in names {
        let age = ages[name];
        println!("{} is {} years old", name, age);
    }
}
`,
          bugExplanation:
            'HashMap implements the `Index` trait, so `ages[name]` compiles and works — but exactly like Vec\'s `[]` indexing, it PANICS if the key is not present, instead of returning an Option. `"carol"` was never inserted, so `ages["carol"]` panics at runtime with `thread \'main\' panicked at ...: called \`Option::unwrap()\` on a \`None\` value` (the actual message varies by std version, but the outcome is always an immediate crash) rather than compiling to something the program can gracefully react to.',
          hints: [
            { title: '[] on a HashMap has the same trap as [] on a Vec', body: 'Both panic on a missing key/index rather than returning an Option — [] is a "trust me, this exists" assertion, not a safe check.' },
            { title: 'The safe alternative already exists on HashMap', body: '`ages.get(name)` returns `Option<&u32>` instead of panicking — Some(&age) if present, None if absent.' },
            { title: 'Handle both branches explicitly', body: 'Use `match ages.get(name) { Some(age) => ..., None => ... }` (or `if let`) so a missing name produces a message instead of a crash.' },
          ],
          fixedCode: `use std::collections::HashMap;

fn main() {
    let mut ages: HashMap<String, u32> = HashMap::new();
    ages.insert(String::from("alice"), 30);
    ages.insert(String::from("bob"), 25);

    let names = ["alice", "bob", "carol"];

    for name in names {
        match ages.get(name) {
            Some(age) => println!("{} is {} years old", name, age),
            None => println!("no age on record for {}", name),
        }
    }
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'You need to deduplicate a list of user IDs and quickly check whether a given ID has already been seen, without needing to store any extra data per ID. Which collection fits best?',
            options: [
              { id: 'a', text: 'Vec<i32>' },
              { id: 'b', text: 'HashSet<i32>' },
              { id: 'c', text: 'HashMap<i32, i32>' },
            ],
            correctOptionIds: ['b'],
            explanation: 'HashSet<T> is purpose-built for "have I seen this value before" with no associated data — exactly this use case, and more direct than a HashMap mapping each ID to a throwaway value.',
          },
          {
            id: 'q2',
            prompt: 'What does `map.entry(key).or_insert(default)` do?',
            code: 'let count = counts.entry(word).or_insert(0);\n*count += 1;',
            options: [
              { id: 'a', text: 'It always overwrites the value at `key` with `default`' },
              { id: 'b', text: 'It inserts `default` only if `key` is not already present, then returns a mutable reference to the (possibly just-inserted) value either way' },
              { id: 'c', text: 'It returns an Option<&mut V>, requiring a further unwrap' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The entry API combines "check if present" and "insert if absent" into one atomic-feeling operation, returning a &mut V you can then modify directly — the idiomatic way to implement counters and grouped collections.',
          },
          {
            id: 'q3',
            prompt: 'Why does `some_vec[10]` panic instead of returning None when index 10 is out of range, while `some_vec.get(10)` does not panic?',
            options: [
              { id: 'a', text: '[] indexing is meant for cases where you assert the index is valid and want an immediate crash otherwise; .get() is the explicit, safe alternative returning Option<&T>' },
              { id: 'b', text: 'They behave identically; this is a trick question' },
              { id: 'c', text: '.get() is deprecated in favor of [] indexing' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Both are valid tools for different situations: [] when you are certain the index is valid and a panic on failure is acceptable (or even desired, as a loud bug signal), .get() whenever the index might legitimately be out of range and you want to handle that gracefully.',
          },
          {
            id: 'q4',
            prompt: 'What ordering guarantee does HashMap make when you iterate over it with .iter()?',
            options: [
              { id: 'a', text: 'Insertion order is always preserved' },
              { id: 'b', text: 'Keys are always returned sorted' },
              { id: 'c', text: 'No particular order is guaranteed at all — it can even vary between runs of the same program' },
            ],
            correctOptionIds: ['c'],
            explanation: "HashMap makes no ordering promises. If you need deterministic or sorted output (as in the entry API example), collect the pairs into a Vec and sort that explicitly, as shown in this lesson's word-count example.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Collections, Strings, Modules & Generics (added)
  // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
  // ri-strings
  // ---------------------------------------------------------------------
  'ri-strings': {
    id: 'ri-strings',
    heroSummary:
      "String and &str look interchangeable at first glance, but they differ in ownership, and Rust's UTF-8 guarantee means indexing text is not as simple as it is in most languages you've used before.",
    dependencyChain: {
      learned: 'Vec, HashMap and HashSet for storing collections, plus Option/Result for handling absence and failure.',
      why: 'Text is everywhere in real programs, and Rust treats it differently from almost every other mainstream language: strings are guaranteed valid UTF-8, which changes what "indexing" even means.',
      build: 'The String vs &str distinction, how UTF-8 is actually laid out in memory, and the string methods you will reach for constantly.',
      next: 'Modules and crates — now that your programs are getting bigger (structs, enums, string-processing functions), you need a way to organize all of it.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Two string types, on purpose',
        body: [
          '`String` is an owned, growable, heap-allocated buffer of text — it is really just a wrapper around `Vec<u8>` with the extra guarantee that those bytes are always valid UTF-8. Like any owned, heap-backed type, it follows the same move/clone rules you already know: assigning it moves ownership, and `.clone()` gives you an independent copy.',
          '`&str` ("string slice") is a *borrowed view* into UTF-8 text — a pointer plus a length, never an owner. That text might live inside a `String`\'s heap allocation, or it might be a string literal like `"hello"`, which the compiler bakes directly into your binary as `&\'static str` (valid for the entire program, no heap allocation at all).',
          'A useful rule of thumb: write function parameters as `&str` whenever you only need to read the text. `&str` accepts both string literals and borrowed `String`s (via automatic deref coercion), so it is strictly more flexible than requiring `&String`. Only use an owned `String` when you actually need to store, build, or return new text.',
        ],
        bullets: [
          'String — owned, growable, heap-allocated, follows normal move/clone rules',
          '&str — borrowed, read-only view (ptr + length) into UTF-8 text you do not own',
          'String literals like "hi" are &\'static str — baked into the binary, valid for the whole program',
        ],
        callout: {
          tone: 'accent',
          text: 'Prefer `&str` for function parameters that only read text — it is more flexible than `&String` and costs nothing.',
        },
      },
      {
        type: 'diagram',
        title: 'What "String::from(\\"héllo\\")" actually stores',
        description: 'Rust strings are UTF-8 bytes, not a fixed-size array of characters — and that has real consequences for slicing.',
        diagram: {
          title: 'String::from("héllo") — bytes vs. characters',
          height: 340,
          frames: [
            {
              caption: 'This string looks like five characters, but Rust stores it as UTF-8 bytes on the heap, with the usual pointer/length/capacity handle on the stack.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 20, y: 6 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 70, y: 6 },
                { id: 's', label: 's', sublabel: 'ptr, len 6, cap 6', tone: 'stack', x: 20, y: 40 },
                { id: 'heap', label: '"héllo"', sublabel: '6 bytes total', tone: 'heap', x: 70, y: 40 },
              ],
              edges: [{ from: 's', to: 'heap', label: 'points to' }],
            },
            {
              caption: 'Zooming in on those 6 bytes: "h" is 1 byte, but "é" needs 2 bytes to encode in UTF-8 — so byte index and character position are NOT the same thing.',
              nodes: [
                { id: 'b0', label: 'byte 0', sublabel: "'h'", tone: 'heap', x: 12, y: 40 },
                { id: 'b1', label: 'byte 1', sublabel: "'é' (1/2)", tone: 'accent', x: 30, y: 40 },
                { id: 'b2', label: 'byte 2', sublabel: "'é' (2/2)", tone: 'accent', x: 48, y: 40 },
                { id: 'b3', label: 'byte 3', sublabel: "'l'", tone: 'heap', x: 66, y: 40 },
                { id: 'b4', label: 'byte 4', sublabel: "'l'", tone: 'heap', x: 84, y: 40 },
                { id: 'b5', label: 'byte 5', sublabel: "'o'", tone: 'heap', x: 100, y: 40 },
              ],
            },
            {
              caption: 'Valid "char boundaries" only exist at 0, 1, 3, 4, 5 and 6 — the start/end of a real character. Byte index 2 sits INSIDE "é", which is not a boundary.',
              nodes: [
                { id: 'b0', label: 'byte 0', sublabel: 'boundary ✓', tone: 'success', x: 12, y: 40 },
                { id: 'b1', label: 'byte 1', sublabel: "'é' (1/2) — boundary ✓", tone: 'success', x: 30, y: 40 },
                { id: 'b2', label: 'byte 2', sublabel: "'é' (2/2) — NOT a boundary", tone: 'danger', x: 48, y: 40 },
                { id: 'b3', label: 'byte 3', sublabel: 'boundary ✓', tone: 'success', x: 66, y: 40 },
                { id: 'b4', label: 'byte 4', sublabel: 'boundary ✓', tone: 'success', x: 84, y: 40 },
                { id: 'b5', label: 'byte 5', sublabel: 'boundary ✓', tone: 'success', x: 100, y: 40 },
              ],
            },
            {
              caption: '`&s[0..1]` is fine — both 0 and 1 are boundaries, so it slices out exactly "h". But `&s[1..2]` would slice ending at byte 2 — right in the middle of "é" — and Rust panics rather than return garbage.',
              nodes: [
                { id: 'ok', label: '&s[0..1]', sublabel: '"h" — OK', tone: 'success', shape: 'pill', x: 25, y: 30 },
                { id: 'bad', label: '&s[1..2]', sublabel: 'panic: byte index 2 is not a char boundary', tone: 'danger', shape: 'pill', x: 75, y: 30, invalid: true },
              ],
            },
            {
              caption: 'The safe fix is to stop thinking in bytes: `.chars()` walks whole characters at a time, so `s.chars().take(2).collect::<String>()` gives you "hé" without ever risking an invalid byte offset.',
              nodes: [
                { id: 'fixed', label: 's.chars().take(2).collect()', sublabel: '"hé" — always valid', tone: 'success', shape: 'pill', x: 50, y: 45 },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Building and inspecting a String',
        description: 'Run this and watch the gap between .len() (bytes) and .chars().count() (characters) once a multi-byte character is involved.',
        language: 'rust',
        code: `fn main() {
    let mut greeting = String::new();
    greeting.push_str("Hello");
    greeting.push_str(", Rust ");
    greeting.push('🦀');

    println!("{}", greeting);
    println!("byte length (.len()): {}", greeting.len());
    println!("character count (.chars().count()): {}", greeting.chars().count());

    println!("uppercase: {}", greeting.to_uppercase());
    println!("contains 'Rust': {}", greeting.contains("Rust"));
    println!("replaced: {}", greeting.replace("Rust", "Ferris"));

    let padded = String::from("   trim me   ");
    println!("trimmed: {:?}", padded.trim());
}
`,
        runnable: true,
      },
      {
        type: 'code',
        title: 'Concatenation & formatting',
        description: '`+` moves its left-hand String and borrows its right-hand argument; format! never takes ownership of anything and is usually the clearer choice.',
        language: 'rust',
        code: `fn main() {
    let s1 = String::from("Hello, ");
    let s2 = String::from("world!");

    // \`+\` uses String's Add<&str> impl: it MOVES s1, and borrows s2 (via deref
    // coercion from &String to &str). s1 is no longer usable after this line.
    let s3 = s1 + &s2;
    println!("{}", s3);
    println!("s2 is still usable: {}", s2); // s2 was only ever borrowed

    // format! never takes ownership of any argument — everything stays usable
    // afterward, which is why it's the usual choice for anything beyond a
    // single simple concatenation.
    let name = "Ferris";
    let unread = 3;
    let notice = format!("Hello, {}! You have {} unread messages.", name, unread);
    println!("{}", notice);
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: Truncate safely, by character',
        exercise: {
          problem:
            'Implement `truncate_chars(s, max_chars)`, returning at most the first `max_chars` characters of `s`. It must never slice by raw byte index — the diagram above showed exactly why that can panic on multi-byte text.',
          starterCode: `fn truncate_chars(s: &str, max_chars: usize) -> String {
    // TODO: return the first \`max_chars\` characters of \`s\` as an owned String,
    // WITHOUT slicing \`s\` by byte index (e.g. no \`&s[0..n]\`).
    s.to_string()
}

fn main() {
    let text = "héllo world";
    println!("{}", truncate_chars(text, 3));
    println!("{}", truncate_chars(text, 100));
}
`,
          hints: [
            { title: 'Work in characters, not bytes', body: '`s.chars()` gives you an iterator over whole Unicode characters, immune to the byte-boundary problem entirely.' },
            { title: 'Limit how many you take', body: '`.take(max_chars)` on any iterator stops it after at most that many items — even if the iterator has fewer, it just yields all of them.' },
            { title: 'Collect back into a String', body: 'An iterator of `char` can be turned into an owned `String` with `.collect::<String>()` (or let type inference fill in the target type from the return type).' },
          ],
          solutionCode: `fn truncate_chars(s: &str, max_chars: usize) -> String {
    s.chars().take(max_chars).collect()
}

fn main() {
    let text = "héllo world";
    println!("{}", truncate_chars(text, 3));
    println!("{}", truncate_chars(text, 100));
}
`,
          solutionExplanation:
            '`.chars()` walks the string one whole Unicode character at a time (so "é" is always treated as a single item, never split), `.take(3)` stops after three characters regardless of how many bytes they took up, and `.collect()` reassembles them into an owned String. Asking for more characters than exist (100) just yields everything there is — no panic, no out-of-bounds error.',
          expectedOutputContains: ['hél', 'héllo world'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the panic',
        challenge: {
          problem: 'This program compiles fine but panics the moment it runs. Why, and what is the safe fix?',
          brokenCode: `fn main() {
    let s = String::from("héllo");
    let slice = &s[0..2];
    println!("first two chars: {}", slice);
}
`,
          bugExplanation:
            '`"héllo"` is 6 bytes, not 5: `\'h\'` is 1 byte (index 0), but `\'é\'` takes 2 bytes (indices 1 and 2). Valid char boundaries only exist at byte offsets 0, 1, 3, 4, 5 and 6. `&s[0..2]` asks Rust to slice ending at byte index 2 — which lands in the MIDDLE of `\'é\'`\'s 2-byte encoding, not a char boundary. Rust cannot return "half a character," so it panics at runtime rather than hand back invalid UTF-8: `byte index 2 is not a char boundary; it is inside \'é\' (bytes 1..3) of \`héllo\``.',
          hints: [
            { title: '.len() counts bytes, not characters', body: 'For ASCII text bytes and characters line up 1-to-1, which is why this bug hides easily until non-ASCII text shows up.' },
            { title: 'Find where "é" actually lives', body: '"é" occupies byte indices 1 and 2. Any slice that starts or ends exactly at index 2 is invalid — it would split that character in half.' },
            { title: 'Stop indexing by byte at all', body: 'Use `.chars()` to iterate by whole character instead of computing raw byte offsets yourself.' },
          ],
          fixedCode: `fn main() {
    let s = String::from("héllo");
    let slice: String = s.chars().take(2).collect();
    println!("first two chars: {}", slice);
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the core difference between String and &str?',
            options: [
              { id: 'a', text: 'String is always faster than &str at runtime' },
              { id: 'b', text: 'String owns growable, heap-allocated UTF-8 text; &str is a borrowed view (pointer + length) into UTF-8 text it does not own' },
              { id: 'c', text: 'They are two names for exactly the same type' },
            ],
            correctOptionIds: ['b'],
            explanation: 'String follows the normal ownership/move rules for heap-backed types. &str never owns anything — it just borrows a view into text that lives somewhere else (a String\'s buffer, a string literal, etc).',
          },
          {
            id: 'q2',
            prompt: 'Why can `.len()` on a String be larger than the number of characters a human would count?',
            options: [
              { id: 'a', text: '.len() counts UTF-8 bytes, and some characters (accented letters, emoji, ...) are encoded using more than one byte' },
              { id: 'b', text: '.len() is unreliable and should generally be avoided' },
              { id: 'c', text: '.len() always overestimates by a fixed amount' },
            ],
            correctOptionIds: ['a'],
            explanation: 'String::len() reports byte length, because Strings are stored as UTF-8 bytes. Use .chars().count() when you specifically need a character count.',
          },
          {
            id: 'q3',
            prompt: "Why doesn't Rust let you write s[0] to get a String's first character directly?",
            options: [
              { id: 'a', text: 'Rust simply never got around to implementing it' },
              { id: 'b', text: 'A single byte index could land in the middle of a multi-byte UTF-8 character; rather than silently return a meaningless value, Rust refuses to compile single-index access on String' },
              { id: 'c', text: 'Strings in Rust have no defined order' },
            ],
            correctOptionIds: ['b'],
            explanation: 'This is a direct consequence of the UTF-8 guarantee. Range slicing (&s[0..n]) is allowed but can panic at runtime if the boundaries land mid-character; single-index access is not allowed at all.',
          },
          {
            id: 'q4',
            prompt: 'After `let s3 = s1 + &s2;` (where s1, s2: String), what is true?',
            options: [
              { id: 'a', text: 'Both s1 and s2 remain fully valid and unchanged' },
              { id: 'b', text: 's1 has been moved into the + operation and is no longer usable; s2 was only borrowed and is still usable' },
              { id: 'c', text: 's2 has been moved and s1 is still usable' },
            ],
            correctOptionIds: ['b'],
            explanation: "String's + is implemented as Add<&str> for String, taking self (s1) by value — a move — and &str (borrowed from s2) as the other argument. s1 is consumed; s2 is not.",
          },
          {
            id: 'q5',
            prompt: "What's the safe way to grab the first N characters of a &str without risking a panic?",
            options: [
              { id: 'a', text: '&s[0..n], since Rust always rounds n to the nearest valid boundary' },
              { id: 'b', text: 's.chars().take(n).collect::<String>() — this walks whole characters and never computes a raw byte offset' },
              { id: 'c', text: 's.len() / n' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Iterating with .chars() sidesteps the byte-boundary problem entirely, because each item it yields is already a complete character.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ri-modules-crates
  // ---------------------------------------------------------------------
  'ri-modules-crates': {
    id: 'ri-modules-crates',
    heroSummary:
      'A single file stops scaling long before your program logic does. mod, pub, and the crate/package distinction are how Rust lets you split code across namespaces and files without losing control over what is visible from where.',
    dependencyChain: {
      learned: 'String and &str, and how to work with text data through methods and slices.',
      why: 'Every program so far has fit in one file. Real projects need a way to group related code, hide implementation details, and split across multiple files — that is what modules give you.',
      build: 'The mod/pub system, the package vs crate distinction, use paths, and a preview of Cargo workspaces for multi-crate projects.',
      next: 'Generics — writing one function or struct that works across many types, often organized into their own module.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Packages, crates, and modules are three different things',
        body: [
          'These three terms get used loosely, but they mean specific, distinct things in Rust. A **package** is what `cargo new` creates: a directory with a `Cargo.toml`, containing one or more **crates**. A **crate** is a single compilation unit — either a *binary crate* (has a `main` function, produces an executable, conventionally starting from `src/main.rs`) or a *library crate* (no `main`, gets linked into other programs, conventionally starting from `src/lib.rs`). A package may contain at most one library crate, but any number of binary crates.',
          'A **module** (`mod`) is something else entirely: a namespace *inside* a single crate. Modules do not produce separate compiled artifacts and do not need their own `Cargo.toml` — they exist purely to group related code together and to control visibility with `pub`.',
          'By default, everything in Rust is private: a function, struct, or module is visible only within the module that defines it and that module\'s descendants. `pub` is how you deliberately open a door in that wall. This default-private model means turning something public is always an explicit, visible choice in the code — nothing leaks by accident.',
        ],
        bullets: [
          'Package: one Cargo.toml, one or more crates',
          'Crate: one compilation unit — a binary (has main) or a library (has lib.rs)',
          'Module (mod): a namespace inside a crate, for organization and visibility control — everything is private unless marked pub',
        ],
      },
      {
        type: 'compare',
        title: 'Package vs. Crate vs. Module',
        columns: [
          {
            heading: 'Package',
            body: [
              'Described by exactly one Cargo.toml.',
              'Can contain at most one library crate, and any number of binary crates.',
              'The unit you `cargo build` or publish to crates.io.',
            ],
          },
          {
            heading: 'Crate',
            body: [
              'A single compilation unit rustc builds at once.',
              'A binary crate has a main() and produces an executable (src/main.rs).',
              'A library crate has no main() and gets linked into other code (src/lib.rs).',
            ],
          },
          {
            heading: 'Module (mod)',
            body: [
              'A namespace inside one crate — no separate compiled artifact.',
              'Created with `mod name { ... }` or by declaring `mod name;` and putting the body in another file.',
              'Everything inside is private by default; `pub` opts specific items in.',
            ],
          },
        ],
      },
      {
        type: 'diagram',
        title: 'Visibility is checked at every step of a path',
        description: 'A module tree with a mix of public and private items — and what happens when code outside tries to reach a private one.',
        diagram: {
          title: 'crate root -> front_of_house -> hosting',
          height: 340,
          frames: [
            {
              caption: 'Every crate starts with one root module: src/main.rs for a binary crate. `mod front_of_house` declares a child module nested inside it.',
              nodes: [
                { id: 'root', label: 'crate root', sublabel: 'src/main.rs', tone: 'default', x: 50, y: 12 },
                { id: 'foh', label: 'front_of_house', sublabel: 'mod (private)', tone: 'accent', x: 50, y: 42 },
              ],
              edges: [{ from: 'root', to: 'foh' }],
            },
            {
              caption: '`hosting` is declared `pub mod` inside front_of_house — it is nested one level deeper.',
              nodes: [
                { id: 'root', label: 'crate root', sublabel: 'src/main.rs', tone: 'default', x: 50, y: 10 },
                { id: 'foh', label: 'front_of_house', sublabel: 'mod (private)', tone: 'accent', x: 50, y: 35 },
                { id: 'hosting', label: 'hosting', sublabel: 'pub mod', tone: 'accent', x: 50, y: 60 },
              ],
              edges: [
                { from: 'root', to: 'foh' },
                { from: 'foh', to: 'hosting' },
              ],
            },
            {
              caption: 'Inside hosting, add_to_waitlist is pub fn (a public door), but seat_at_table has no pub at all (private to hosting and its descendants only).',
              nodes: [
                { id: 'root', label: 'crate root', sublabel: 'src/main.rs', tone: 'default', x: 50, y: 8 },
                { id: 'foh', label: 'front_of_house', sublabel: 'mod (private)', tone: 'accent', x: 50, y: 28 },
                { id: 'hosting', label: 'hosting', sublabel: 'pub mod', tone: 'accent', x: 50, y: 48 },
                { id: 'add', label: 'add_to_waitlist()', sublabel: 'pub fn', tone: 'success', x: 25, y: 75 },
                { id: 'seat', label: 'seat_at_table()', sublabel: 'private fn', tone: 'muted', x: 75, y: 75 },
              ],
              edges: [
                { from: 'root', to: 'foh' },
                { from: 'foh', to: 'hosting' },
                { from: 'hosting', to: 'add' },
                { from: 'hosting', to: 'seat' },
              ],
            },
            {
              caption: 'main() in the crate root can reach add_to_waitlist — every step of the path (front_of_house is visible from its own defining module, hosting is pub, add_to_waitlist is pub) checks out. Reaching seat_at_table the same way is REJECTED (E0603: private).',
              nodes: [
                { id: 'root', label: 'crate root', sublabel: 'main()', tone: 'default', x: 50, y: 8 },
                { id: 'foh', label: 'front_of_house', sublabel: 'mod (private)', tone: 'accent', x: 50, y: 28 },
                { id: 'hosting', label: 'hosting', sublabel: 'pub mod', tone: 'accent', x: 50, y: 48 },
                { id: 'add', label: 'add_to_waitlist()', sublabel: 'pub fn — reachable', tone: 'success', x: 25, y: 75 },
                { id: 'seat', label: 'seat_at_table()', sublabel: 'private — blocked!', tone: 'danger', x: 75, y: 75, invalid: true },
              ],
              edges: [
                { from: 'root', to: 'foh' },
                { from: 'foh', to: 'hosting' },
                { from: 'root', to: 'add', tone: 'success', animated: true, label: 'allowed', curved: true },
                { from: 'root', to: 'seat', tone: 'danger', dashed: true, label: 'E0603: private', curved: true },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'mod, pub, and paths in one file',
        description: 'This compiles as-is — `mod` blocks work perfectly well inline in a single file, which is why it is the easiest way to experiment with visibility rules interactively.',
        language: 'rust',
        code: `mod front_of_house {
    pub mod hosting {
        pub fn add_to_waitlist() {
            println!("added to the waitlist");
        }
    }

    pub fn greet_and_seat() {
        // Relative path: \`hosting\` is a sibling module inside this same module
        hosting::add_to_waitlist();
        println!("seated at a table");
    }
}

// Brings \`hosting\` into scope so we can write \`hosting::...\` instead of the
// full path every time.
use front_of_house::hosting;

fn main() {
    // Absolute path, starting from the crate root
    crate::front_of_house::hosting::add_to_waitlist();

    // Works thanks to the \`use\` above
    hosting::add_to_waitlist();

    front_of_house::greet_and_seat();
}
`,
        runnable: true,
      },
      {
        type: 'code',
        title: 'The same tree, split across real files',
        description: "This is illustrative, not runnable in a single playground — but it's exactly how the module tree above would be organized in a real multi-file project.",
        language: 'rust',
        code: `// src/lib.rs — the crate root of a library crate
mod front_of_house; // tells rustc: look for src/front_of_house.rs (or src/front_of_house/mod.rs)

// Re-export so callers of this crate can write \`my_crate::hosting::...\`
// instead of the longer internal path.
pub use crate::front_of_house::hosting;

// --------------------------------------------------------------------
// src/front_of_house.rs
pub mod hosting; // tells rustc: look for src/front_of_house/hosting.rs

// --------------------------------------------------------------------
// src/front_of_house/hosting.rs
pub fn add_to_waitlist() {
    println!("added to the waitlist");
}
`,
        runnable: false,
      },
      {
        type: 'explain',
        title: 'use paths, and a preview of workspaces',
        body: [
          '`use` brings a path into scope so you do not have to spell it out fully every time. Paths can be absolute (starting with `crate::`, walking from the crate root) or relative (starting from the current module, optionally using `self::` or `super::` to step up one level). `pub use` does both at once: it brings the path into scope AND re-exports it, so code outside your crate can use the shorter path too.',
          "As a project grows past a single crate, a Cargo **workspace** lets several packages share one top-level Cargo.toml (with a `[workspace]` table listing `members`), one `Cargo.lock`, and one shared `target/` build directory — instead of being built and versioned completely independently. You will not need workspaces for a while, but recognize the shape: it is how large real-world Rust projects (including Tauri apps, which typically split into a Rust core crate and a thin Tauri command layer) are organized.",
        ],
        bullets: [
          'use crate::foo::bar — absolute path from the crate root',
          'use super::foo — relative path, one level up from the current module',
          'pub use ... — re-export, exposing a shorter path to code outside the crate',
          'A Cargo workspace groups multiple related packages under one Cargo.lock and target/ directory',
        ],
      },
      {
        type: 'exercise',
        title: 'Exercise: Build a shapes module',
        exercise: {
          problem:
            'Create a module `shapes` containing two public sub-modules, `circle` and `square`, each exposing a public `area` function. Then call both from main using their full paths.',
          starterCode: `mod shapes {
    // TODO: add \`pub mod circle\` with \`pub fn area(radius: f64) -> f64\`
    //       (use std::f64::consts::PI * radius * radius)

    // TODO: add \`pub mod square\` with \`pub fn area(side: f64) -> f64\`
}

fn main() {
    let circle_area = 0.0; // TODO: call shapes::circle::area(3.0)
    let square_area = 0.0; // TODO: call shapes::square::area(4.0)

    println!("circle area: {:.2}", circle_area);
    println!("square area: {:.2}", square_area);
}
`,
          hints: [
            { title: 'Nest pub mod blocks', body: 'Inside `mod shapes { ... }`, add `pub mod circle { ... }` and `pub mod square { ... }` — each needs `pub` on both the module and the function inside it to be reachable from main.' },
            { title: 'Call with the full path', body: 'From main, reach a nested module with `shapes::circle::area(3.0)` — no `use` needed for a single call.' },
            { title: 'PI is already available', body: '`std::f64::consts::PI` works without any `use` statement — just write the fully qualified path directly in the expression.' },
          ],
          solutionCode: `mod shapes {
    pub mod circle {
        pub fn area(radius: f64) -> f64 {
            std::f64::consts::PI * radius * radius
        }
    }

    pub mod square {
        pub fn area(side: f64) -> f64 {
            side * side
        }
    }
}

fn main() {
    let circle_area = shapes::circle::area(3.0);
    let square_area = shapes::square::area(4.0);

    println!("circle area: {:.2}", circle_area);
    println!("square area: {:.2}", square_area);
}
`,
          solutionExplanation:
            'shapes::circle::area and shapes::square::area are each reachable from main because every step along the path is public: the modules are declared `pub mod`, and the functions inside are declared `pub fn`. If either `pub` were missing, the path would fail to compile with a "private" visibility error, exactly like `seat_at_table` in the diagram above.',
          expectedOutputContains: ['circle area: 28.27', 'square area: 16.00'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the relationship between a package and a crate?',
            options: [
              { id: 'a', text: 'They are interchangeable terms for the same thing' },
              { id: 'b', text: 'A package is described by one Cargo.toml and contains one or more crates — at most one library crate, plus any number of binary crates' },
              { id: 'c', text: 'A crate contains many packages' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Package is the Cargo-level unit (one Cargo.toml); crate is the compilation-level unit that rustc actually builds.',
          },
          {
            id: 'q2',
            prompt: 'By default, are items declared inside a mod block visible from outside that module?',
            options: [
              { id: 'a', text: 'Yes — everything is public unless explicitly marked private' },
              { id: 'b', text: 'No — everything is private by default; pub must be added explicitly to expose an item' },
              { id: 'c', text: 'Only struct fields are private by default; functions are always public' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Rust\'s default is private. This means visibility is always an explicit, visible decision in the source code — nothing is exposed by accident.',
          },
          {
            id: 'q3',
            prompt: 'Given `mod a { pub mod b { pub fn f() {} } }` declared in your crate root, which call(s) work from `main()` (also in the crate root)?',
            options: [
              { id: 'a', text: 'Only crate::a::b::f()' },
              { id: 'b', text: 'Only a::b::f()' },
              { id: 'c', text: 'Both crate::a::b::f() and a::b::f() work equally well' },
            ],
            correctOptionIds: ['c'],
            explanation: 'crate::a::b::f() is the absolute path from the crate root; a::b::f() is the equivalent relative path from main\'s own module (which is the crate root). Both resolve to the same function.',
          },
          {
            id: 'q4',
            prompt: 'What does a Cargo workspace let you do?',
            options: [
              { id: 'a', text: 'Run multiple versions of rustc side by side' },
              { id: 'b', text: 'Group several related packages so they share one Cargo.lock and one target/ build directory, instead of building each completely independently' },
              { id: 'c', text: 'Automatically format all code in a project' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Workspaces are how large multi-crate projects (e.g. splitting a Rust core library from a thin Tauri command layer) stay organized without duplicating build state.',
          },
          {
            id: 'q5',
            prompt: 'What does `pub use crate::front_of_house::hosting;` accomplish inside a library\'s src/lib.rs?',
            options: [
              { id: 'a', text: 'It deletes the original front_of_house module' },
              { id: 'b', text: 'It re-exports hosting at the crate\'s top level, so external code can write my_crate::hosting::... instead of the longer internal path' },
              { id: 'c', text: 'It makes hosting private to external crates' },
            ],
            correctOptionIds: ['b'],
            explanation: 'pub use both brings the path into scope locally and re-exports it, which is the standard way to present a clean public API over a deeper internal module structure.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ri-generics
  // ---------------------------------------------------------------------
  'ri-generics': {
    id: 'ri-generics',
    heroSummary:
      'Generics let you write one function or struct that works over many types, checked and specialized entirely at compile time — no runtime cost, and no giving up type safety.',
    dependencyChain: {
      learned: 'The mod/pub system for organizing code into namespaces across one or more files.',
      why: 'Without generics, using both a Vec<i32> and a Vec<String> in the same way (say, finding the largest element) would mean writing near-identical functions once per type. Generics let you write the logic exactly once.',
      build: 'Generic functions, generic structs and enums, the idea of monomorphization, and trait bounds via where clauses.',
      next: 'Traits — the mechanism that lets you write bounds like `T: PartialOrd` in the first place, and define your own shared behavior across types.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Stop copy-pasting for every type',
        body: [
          'Imagine writing `largest_i32(list: &[i32]) -> i32`, then `largest_f64(list: &[f64]) -> f64`, then `largest_char(list: &[char]) -> char` — identical logic, three (or thirty) copies. Generics let you write it once, with a placeholder type parameter (conventionally named `T`, `U`, and so on) standing in for "whatever concrete type gets used here."',
          'A bare, unconstrained `T` can do almost nothing — Rust does not assume it can be compared, copied, printed, or added, because it genuinely might be any type at all. A **trait bound**, written `T: SomeTrait`, is how you tell the compiler exactly which capabilities `T` needs to have for your function body to compile. You will see bounds like `T: PartialOrd` (comparable with `<`/`>`) and `T: Copy` (cheaply duplicable) before traits get their own full lesson — for now, read `T: PartialOrd` as "T must support the comparison operators."',
          "Generics cost nothing at runtime. The compiler generates a fully specialized version of your generic code for every concrete type it is actually used with — a process called monomorphization — so the compiled code is just as fast as if you had hand-written a separate version per type.",
        ],
        bullets: [
          'T (and U, and so on) is a type parameter — a placeholder for "some concrete type, decided at each call site"',
          'A bare T has no guaranteed abilities; trait bounds (T: PartialOrd, T: Copy, ...) grant specific ones',
          'Generic code is specialized per type at COMPILE time (monomorphization) — zero runtime cost',
        ],
      },
      {
        type: 'code',
        title: 'One generic function, many types',
        description: 'largest works for both a slice of i32 and a slice of char, with no duplicated logic — as long as T supports both comparison and copying.',
        language: 'rust',
        code: `fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("largest number: {}", largest(&numbers));

    let chars = vec!['y', 'm', 'a', 'q'];
    println!("largest char: {}", largest(&chars));
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'Monomorphization: one definition, many compiled copies',
        description: 'What the compiler does behind the scenes with a generic function that gets called at two different types.',
        diagram: {
          title: 'largest::<T>() called with i32 and char',
          frames: [
            {
              caption: 'Your source code contains exactly one generic definition of largest<T>.',
              nodes: [{ id: 'src', label: 'fn largest<T: PartialOrd + Copy>(...)', sublabel: 'one source definition', tone: 'default', shape: 'pill', x: 50, y: 15, w: 320 }],
            },
            {
              caption: "It's called twice in main: once with &[i32], once with &[char].",
              nodes: [
                { id: 'src', label: 'fn largest<T: PartialOrd + Copy>(...)', sublabel: 'one source definition', tone: 'default', shape: 'pill', x: 50, y: 15, w: 320 },
                { id: 'call1', label: 'largest(&numbers)', sublabel: 'T = i32', tone: 'muted', x: 25, y: 45 },
                { id: 'call2', label: 'largest(&chars)', sublabel: 'T = char', tone: 'muted', x: 75, y: 45 },
              ],
              edges: [
                { from: 'src', to: 'call1' },
                { from: 'src', to: 'call2' },
              ],
            },
            {
              caption: 'At compile time, rustc generates two separate, fully specialized copies — one per concrete type actually used. This is monomorphization.',
              nodes: [
                { id: 'src', label: 'fn largest<T: PartialOrd + Copy>(...)', sublabel: 'one source definition', tone: 'default', shape: 'pill', x: 50, y: 10, w: 320 },
                { id: 'gen1', label: 'largest_i32(list: &[i32]) -> i32', sublabel: 'compiled copy #1', tone: 'accent', x: 25, y: 45 },
                { id: 'gen2', label: 'largest_char(list: &[char]) -> char', sublabel: 'compiled copy #2', tone: 'accent', x: 75, y: 45 },
              ],
              edges: [
                { from: 'src', to: 'gen1', dashed: true },
                { from: 'src', to: 'gen2', dashed: true },
              ],
            },
            {
              caption: 'Each specialized copy runs exactly as fast as if you had hand-written it for that one type — no dynamic dispatch, no runtime type check, ever.',
              nodes: [
                { id: 'gen1', label: 'largest_i32', sublabel: 'zero-cost', tone: 'success', x: 25, y: 45 },
                { id: 'gen2', label: 'largest_char', sublabel: 'zero-cost', tone: 'success', x: 75, y: 45 },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Generic structs with one or more type parameters',
        description: 'Point<T> uses a single type parameter for both fields; Pair<T, U> shows two independent type parameters in the same struct.',
        language: 'rust',
        code: `struct Point<T> {
    x: T,
    y: T,
}

impl<T: std::fmt::Display> Point<T> {
    fn describe(&self) -> String {
        format!("({}, {})", self.x, self.y)
    }
}

struct Pair<T, U> {
    first: T,
    second: U,
}

fn main() {
    let integer_point = Point { x: 5, y: 10 };
    let float_point = Point { x: 1.5, y: 2.5 };

    println!("integer point: {}", integer_point.describe());
    println!("float point: {}", float_point.describe());

    // Pair's two type parameters don't have to match — here T = &str, U = i32
    let mixed = Pair { first: "age", second: 30 };
    println!("{} = {}", mixed.first, mixed.second);
}
`,
        runnable: true,
      },
      {
        type: 'compare',
        title: 'Inline trait bounds vs. where clauses',
        columns: [
          {
            heading: 'Inline: `T: PartialOrd + Copy`',
            body: [
              '`fn largest<T: PartialOrd + Copy>(list: &[T]) -> T`',
              'Bounds live right next to the type parameter, in the angle brackets.',
              'Reads fine with one type parameter and one or two bounds.',
            ],
          },
          {
            heading: 'where clause',
            body: [
              '`fn largest<T>(list: &[T]) -> T where T: PartialOrd + Copy { ... }`',
              'Bounds move below the signature, after `where`.',
              'Behaves identically — purely a readability choice that pays off once you have multiple type parameters with several bounds each.',
            ],
          },
        ],
      },
      {
        type: 'debug',
        title: 'Fix the missing trait bounds',
        challenge: {
          problem: 'This looks like a reasonable generic version of "find the largest item" — but it fails to compile. Why?',
          brokenCode: `fn largest<T>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("{}", largest(&numbers));
}
`,
          bugExplanation:
            "A bare, unconstrained T has NO guaranteed capabilities — Rust cannot assume every possible type supports every operation. `item > largest` requires the PartialOrd trait (comparison isn't defined for arbitrary types), and `let mut largest = list[0];` copies a value out of the slice, which requires the Copy trait (moving out of an indexed slice element isn't allowed in general, since something else might still need it there). Without bounds, rustc rejects both: error E0369 (\"binary operation `>` cannot be applied to type `T`\") and E0507 (\"cannot move out of index of `[T]`\").",
          hints: [
            { title: 'A generic T starts with nothing', body: 'Unlike a concrete type like i32, a bare T is not assumed to support comparison, copying, printing, or anything else — you must ask for each capability explicitly.' },
            { title: 'Comparison needs PartialOrd', body: 'The `>` operator on a generic type requires `T: PartialOrd` — without it, the compiler has no idea how to compare two Ts.' },
            { title: 'Copying out of a slice needs Copy', body: '`list[0]` moves a T value out of the slice into `largest`; add `T: Copy` so that move is actually a cheap, valid copy instead of an illegal move out of borrowed data.' },
          ],
          fixedCode: `fn largest<T: PartialOrd + Copy>(list: &[T]) -> T {
    let mut largest = list[0];
    for &item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    println!("{}", largest(&numbers));
}
`,
        },
      },
      {
        type: 'exercise',
        title: 'Exercise: largest, but safe for empty slices',
        exercise: {
          problem:
            'Extend `largest` to return `Option<T>` instead of `T` directly: `None` for an empty slice, `Some(the largest item)` otherwise. Call it with both a slice of i32 and a slice of char, plus an empty slice.',
          starterCode: `fn largest<T: PartialOrd + Copy>(list: &[T]) -> Option<T> {
    // TODO: return None if \`list\` is empty; otherwise return Some(largest item)
    None
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    let chars = vec!['y', 'm', 'a', 'q'];

    println!("largest number: {:?}", largest(&numbers));
    println!("largest char: {:?}", largest(&chars));
    println!("largest of empty: {:?}", largest::<i32>(&[]));
}
`,
          hints: [
            { title: 'Handle the empty case up front', body: '`if list.is_empty() { return None; }` before doing anything else.' },
            { title: 'Reuse the same scanning loop as before', body: 'Start `let mut largest = list[0];` (safe now, since you already returned early for empty lists), then loop and update it exactly like the non-Option version.' },
            { title: "Don't forget to wrap the final answer", body: 'The function returns Option<T>, so the successful result needs to be `Some(largest)`, not just `largest`.' },
          ],
          solutionCode: `fn largest<T: PartialOrd + Copy>(list: &[T]) -> Option<T> {
    if list.is_empty() {
        return None;
    }

    let mut largest = list[0];
    for &item in list {
        if item > largest {
            largest = item;
        }
    }
    Some(largest)
}

fn main() {
    let numbers = vec![34, 50, 25, 100, 65];
    let chars = vec!['y', 'm', 'a', 'q'];

    println!("largest number: {:?}", largest(&numbers));
    println!("largest char: {:?}", largest(&chars));
    println!("largest of empty: {:?}", largest::<i32>(&[]));
}
`,
          solutionExplanation:
            'The empty-slice check runs before any indexing, so `list[0]` is only ever reached when it is guaranteed safe. Everything else is the same scanning loop as before, just wrapped in Some(...) at the end. The turbofish in `largest::<i32>(&[])` is needed because an empty slice gives the compiler no value to infer T from.',
          expectedOutputContains: ['largest number: Some(100)', "largest char: Some('y')", 'largest of empty: None'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What problem do generics primarily solve?',
            options: [
              { id: 'a', text: 'They make code run faster via dynamic runtime type checks' },
              { id: 'b', text: 'They let you write one function or struct definition that works across many concrete types, instead of duplicating near-identical code per type' },
              { id: 'c', text: 'They remove the need for the borrow checker' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Generics are about code reuse across types, checked entirely at compile time — not a runtime feature.',
          },
          {
            id: 'q2',
            prompt: 'What is monomorphization?',
            options: [
              { id: 'a', text: 'A runtime lookup Rust performs to determine which concrete type T is' },
              { id: 'b', text: 'The compile-time process of generating a separate, fully specialized copy of generic code for each concrete type it is actually used with' },
              { id: 'c', text: 'A way to merge multiple generic type parameters into a single one' },
            ],
            correctOptionIds: ['b'],
            explanation: 'This is why generics are "zero cost": by the time your program runs, there is no generic code left — only specialized, type-specific compiled copies.',
          },
          {
            id: 'q3',
            prompt: 'Why does `fn largest<T>(list: &[T]) -> T { ... item > largest ... }` fail to compile with no bounds on T?',
            options: [
              { id: 'a', text: 'Slices cannot be generic over T at all' },
              { id: 'b', text: 'A bare T has no guaranteed capabilities — comparing with > requires PartialOrd, and copying a value out of the slice requires Copy; neither is assumed by default' },
              { id: 'c', text: 'Generic functions can only return references, never owned T values' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Every capability a generic type needs — comparison, copying, printing, arithmetic, and so on — must be requested explicitly via a trait bound.',
          },
          {
            id: 'q4',
            prompt: 'What is the relationship between `fn f<T: Bound>(x: T)` and `fn f<T>(x: T) where T: Bound`?',
            options: [
              { id: 'a', text: 'They are different signatures with different runtime behavior' },
              { id: 'b', text: 'They are exactly equivalent — where is just an alternative, often more readable, place to write the same trait bounds' },
              { id: 'c', text: 'where clauses only work on structs, never on functions' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Both forms compile to identical bounds; where clauses mainly pay off readability-wise once you have several type parameters or several bounds per parameter.',
          },
          {
            id: 'q5',
            prompt: 'Given `struct Pair<T, U> { first: T, second: U }` instantiated as `Pair { first: "age", second: 30 }`, what are T and U?',
            options: [
              { id: 'a', text: 'T and U remain an unresolved generic placeholder until the program runs' },
              { id: 'b', text: 'T = &str and U = i32 (or another integer type), inferred at compile time from the field values provided' },
              { id: 'c', text: 'This fails to compile because T and U must always be the same type' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Rust infers each type parameter independently from how the struct is constructed — Pair<T, U> places no requirement that T and U match.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Traits, Iterators & Closures (added)
  // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
  // ri-traits — Traits & Trait Bounds
  // ---------------------------------------------------------------------
  'ri-traits': {
    id: 'ri-traits',
    heroSummary:
      "A trait is a contract: it says a type provides certain behavior, without saying how. Traits are Rust's answer to interfaces — and combined with generics, they let you write one function that works over any type that keeps the contract.",
    dependencyChain: {
      learned: 'Generic functions and structs, monomorphization, and where clauses from the Generics lesson.',
      why: "Generics let you write `fn f<T>(x: T)`, but without constraints T could be anything — you couldn't call any method on it. Traits are exactly the vocabulary for constraining T to 'any type that can do this.'",
      build: 'Defining and implementing traits, default methods, trait bounds on generic functions, and the derive macros that generate common traits for you.',
      next: 'Iterators and closures — where Iterator itself is just a trait, and Fn/FnMut/FnOnce are the traits that make closures work.',
    },
    sections: [
      {
        type: 'explain',
        title: "Traits: Rust's shared-behavior contract",
        body: [
          "A trait defines a set of methods a type must provide. Defining a trait doesn't write any behavior by itself — it's a promise. A type only gains that behavior by writing `impl TraitName for TypeName` and filling in the required methods.",
          "This matters because Rust has no class inheritance. Two completely unrelated structs — a network response and a blog post, say — can both implement the same `Summary` trait, and any code that only needs 'something Summary-able' can accept either one without knowing their concrete types.",
          'Traits can also provide default method bodies. An implementor gets the default for free, or can override it with its own logic — the trait only forces you to fill in whatever it marks as required.',
        ],
        bullets: [
          'trait Name { fn required(&self); } — declares behavior without implementing it',
          'impl Name for Type { ... } — a specific type opts into the contract',
          'A default method body is inherited automatically unless the implementor overrides it',
          'Trait bounds (T: Trait) let generic code call trait methods on T, something plain generics alone cannot do',
        ],
        callout: {
          tone: 'accent',
          text: 'A trait with a default method is like an abstract base class where every method already has a fallback — except there is no inheritance, no base class, and no runtime cost for using it this way.',
        },
      },
      {
        type: 'code',
        title: 'Defining, implementing, and defaulting',
        description:
          'Article overrides summarize() completely. Tweet implements only the required author() method and inherits the default summarize() body for free.',
        code: `trait Summary {
    fn author(&self) -> String;

    // A default method body. Implementors can use this as-is, or override it.
    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.author())
    }
}

struct Article {
    headline: String,
    author: String,
}

impl Summary for Article {
    fn author(&self) -> String {
        self.author.clone()
    }

    // Article overrides the default entirely.
    fn summarize(&self) -> String {
        format!("{}, by {}", self.headline, self.author)
    }
}

struct Tweet {
    username: String,
    content: String,
}

impl Summary for Tweet {
    fn author(&self) -> String {
        format!("@{}", self.username)
    }
    // No summarize() override here — Tweet uses Summary's default implementation.
}

fn main() {
    let article = Article {
        headline: String::from("Rust 2.0 announced"),
        author: String::from("Jane Doe"),
    };
    let tweet = Tweet {
        username: String::from("rustlang"),
        content: String::from("Traits are just interfaces, but compiled away."),
    };

    println!("{}", article.summarize());
    println!("{} — \\"{}\\"", tweet.summarize(), tweet.content);
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'Trait bounds compile away, just like generics',
        description:
          'fn notify<T: Summary>(item: &T) is written once. Each concrete type it gets called with produces its own specialized copy at compile time — the same monomorphization you saw with plain generics, now applied to a trait-bounded function.',
        diagram: {
          title: 'fn notify<T: Summary>(item: &T)',
          height: 300,
          frames: [
            {
              caption:
                'The source code has exactly one generic function: notify, constrained to any type T that implements Summary.',
              nodes: [{ id: 'src', label: 'notify<T: Summary>', sublabel: 'source code — written once', tone: 'default', shape: 'pill', x: 50, y: 15, w: 260 }],
            },
            {
              caption:
                'Calling notify(&article) causes the compiler to generate a fully specialized version of notify just for Article, with Article::summarize() compiled directly into it.',
              nodes: [
                { id: 'src', label: 'notify<T: Summary>', sublabel: 'source code — written once', tone: 'default', shape: 'pill', x: 50, y: 15, w: 260 },
                { id: 'article-fn', label: 'notify_for_Article', sublabel: 'compiled machine code', tone: 'accent', shape: 'box', x: 25, y: 55 },
              ],
              edges: [{ from: 'src', to: 'article-fn', label: 'monomorphized for Article', animated: true }],
            },
            {
              caption:
                'Calling notify(&tweet) elsewhere in the program generates a second, completely separate specialized version — notify_for_Tweet.',
              nodes: [
                { id: 'src', label: 'notify<T: Summary>', sublabel: 'source code — written once', tone: 'default', shape: 'pill', x: 50, y: 15, w: 260 },
                { id: 'article-fn', label: 'notify_for_Article', sublabel: 'compiled machine code', tone: 'accent', shape: 'box', x: 25, y: 55 },
                { id: 'tweet-fn', label: 'notify_for_Tweet', sublabel: 'compiled machine code', tone: 'accent', shape: 'box', x: 75, y: 55 },
              ],
              edges: [
                { from: 'src', to: 'article-fn', label: 'monomorphized for Article' },
                { from: 'src', to: 'tweet-fn', label: 'monomorphized for Tweet', animated: true },
              ],
            },
            {
              caption:
                'At runtime, each call site jumps straight to its own specialized code. There is no vtable lookup and no per-call overhead — the trait bound cost nothing beyond compile time.',
              nodes: [
                { id: 'article-fn', label: 'notify_for_Article', sublabel: 'zero-cost', tone: 'success', shape: 'box', x: 25, y: 45 },
                { id: 'tweet-fn', label: 'notify_for_Tweet', sublabel: 'zero-cost', tone: 'success', shape: 'box', x: 75, y: 45 },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Trait bounds, where clauses, and derive macros',
        description:
          '<T: Trait>, the where clause form, and &impl Trait are three ways to write the same constraint. derive macros generate whole trait implementations (Debug, Clone, PartialEq) instead of you writing them by hand.',
        code: `use std::fmt::Display;

trait Summary {
    fn summarize(&self) -> String;
}

struct Headline(String);

impl Summary for Headline {
    fn summarize(&self) -> String {
        format!("HEADLINE: {}", self.0)
    }
}

impl Display for Headline {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

// Long form: an explicit generic parameter with a trait bound.
fn notify<T: Summary>(item: &T) {
    println!("Breaking news! {}", item.summarize());
}

// Multiple bounds combined with \`where\` — reads better once bounds pile up.
fn describe<T>(item: &T) -> String
where
    T: Summary + Display,
{
    format!("{} (raw: {})", item.summarize(), item)
}

// Shorthand: \`&impl Trait\` in argument position means exactly the same
// thing as \`notify<T: Summary>(item: &T)\` — pick whichever reads clearer.
fn notify_short(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

// derive macros generate common trait implementations for you instead of
// writing them by hand: Debug ({:?} printing), Clone (.clone()), PartialEq (==).
#[derive(Debug, Clone, PartialEq)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let h = Headline(String::from("Rust 2.0 announced"));
    notify(&h);
    notify_short(&h);
    println!("{}", describe(&h));

    let p1 = Point { x: 1, y: 2 };
    let p2 = p1.clone();
    println!("{:?} == {:?}: {}", p1, p2, p1 == p2);
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: A Shape trait with a default method',
        exercise: {
          problem:
            'Implement the required area() method for Circle and Rectangle. Both should use Shape\'s default describe() method as-is — you should not need to touch describe() at all.',
          starterCode: `trait Shape {
    fn area(&self) -> f64;

    // Default method — implementors get this for free unless they override it.
    fn describe(&self) -> String {
        format!("area = {:.2}", self.area())
    }
}

struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        // TODO: return the area of a circle (pi * radius^2).
        // std::f64::consts::PI is available.
        0.0
    }
}

struct Rectangle {
    width: f64,
    height: f64,
}

impl Shape for Rectangle {
    fn area(&self) -> f64 {
        // TODO: return width * height
        0.0
    }
}

fn print_shape(shape: &impl Shape) {
    println!("{}", shape.describe());
}

fn main() {
    let circle = Circle { radius: 2.0 };
    let rectangle = Rectangle { width: 3.0, height: 4.0 };

    print_shape(&circle);
    print_shape(&rectangle);
}
`,
          hints: [
            { title: 'Circle area formula', body: 'Area of a circle is pi * radius * radius. Use std::f64::consts::PI for pi.' },
            { title: 'Rectangle area formula', body: 'Area of a rectangle is simply width * height.' },
            {
              title: "You don't need to change describe()",
              body: 'describe() is a default method on the trait — both Circle and Rectangle inherit it automatically once area() is correct, because describe() calls self.area() internally.',
            },
          ],
          solutionCode: `trait Shape {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("area = {:.2}", self.area())
    }
}

struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

struct Rectangle {
    width: f64,
    height: f64,
}

impl Shape for Rectangle {
    fn area(&self) -> f64 {
        self.width * self.height
    }
}

fn print_shape(shape: &impl Shape) {
    println!("{}", shape.describe());
}

fn main() {
    let circle = Circle { radius: 2.0 };
    let rectangle = Rectangle { width: 3.0, height: 4.0 };

    print_shape(&circle);
    print_shape(&rectangle);
}
`,
          solutionExplanation:
            'Once area() is implemented for each type, describe() — a default method neither struct overrides — calls self.area() and formats it. print_shape takes &impl Shape, so it works identically for both types without knowing their concrete type. Circle area = pi * 2.0^2 ≈ 12.57; Rectangle area = 3.0 * 4.0 = 12.00.',
          expectedOutputContains: ['area = 12.57', 'area = 12.00'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the missing trait import',
        challenge: {
          problem:
            'Square clearly implements the Shape trait\'s area() method. Why does the compiler still refuse to let main() call sq.area()?',
          brokenCode: `mod shapes {
    pub trait Shape {
        fn area(&self) -> f64;
    }

    pub struct Square {
        pub side: f64,
    }

    impl Shape for Square {
        fn area(&self) -> f64 {
            self.side * self.side
        }
    }
}

use shapes::Square;

fn main() {
    let sq = Square { side: 3.0 };
    println!("area = {}", sq.area());
}
`,
          bugExplanation:
            'Square does implement Shape, and area() is a real method on it — but Rust requires the TRAIT that defines a method to be in scope (imported with use) at the call site, not just the type. Here only `use shapes::Square;` was written; `Shape` itself was never imported. rustc rejects `sq.area()` with error E0599: "no method named `area` found for struct `Square` in the current scope", with a help note: "trait `Shape` which provides `area` is implemented but not in scope; perhaps you need to import it". This rule exists so that two unrelated traits in different crates can both define a method with the same name without silently colliding — you always explicitly choose which one you mean by importing it.',
          hints: [
            { title: 'Does Square actually implement area()?', body: 'Yes — check the impl block. The method genuinely exists. So the problem is not with Square itself.' },
            { title: 'What did the use statement actually import?', body: '`use shapes::Square;` brings the TYPE into scope, but says nothing about the Shape TRAIT.' },
            { title: 'Trait methods need the trait itself in scope', body: 'Add a second import: `use shapes::Shape;`, alongside the existing import for Square.' },
          ],
          fixedCode: `mod shapes {
    pub trait Shape {
        fn area(&self) -> f64;
    }

    pub struct Square {
        pub side: f64,
    }

    impl Shape for Square {
        fn area(&self) -> f64 {
            self.side * self.side
        }
    }
}

use shapes::Shape;
use shapes::Square;

fn main() {
    let sq = Square { side: 3.0 };
    println!("area = {}", sq.area());
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does defining `trait Summary { fn author(&self) -> String; }` actually do?',
            options: [
              { id: 'a', text: 'It generates a default author() implementation automatically' },
              { id: 'b', text: 'It declares a contract: any type that implements Summary must provide an author() method — no behavior exists yet' },
              { id: 'c', text: 'It creates a new struct named Summary' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A trait on its own is just a contract. Behavior only exists once a concrete type writes `impl Summary for SomeType` and fills in the required methods.',
          },
          {
            id: 'q2',
            prompt: 'In the Article/Tweet example, why does tweet.summarize() work even though Tweet never defines summarize()?',
            options: [
              { id: 'a', text: 'Tweet inherits it from Article via struct inheritance' },
              { id: 'b', text: 'Summary provides a default method body for summarize(), and Tweet did not override it, so it uses the default' },
              { id: 'c', text: 'It is a compiler error that happens to still run' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Default trait methods are inherited by any implementor that does not explicitly override them. Tweet only implemented the required author() method.',
          },
          {
            id: 'q3',
            prompt: 'Which of these are equivalent ways to require that T implements Summary? (select all that apply)',
            options: [
              { id: 'a', text: 'fn notify<T: Summary>(item: &T)' },
              { id: 'b', text: 'fn notify(item: &impl Summary)' },
              { id: 'c', text: 'fn notify<T>(item: &T) where T: Summary' },
              { id: 'd', text: 'fn notify<T>(item: &T)' },
            ],
            correctOptionIds: ['a', 'b', 'c'],
            multi: true,
            explanation: 'The generic-with-bound form, the where-clause form, and the &impl Trait shorthand all express the identical constraint. Option d has no bound at all, so item.summarize() would not compile inside it.',
          },
          {
            id: 'q4',
            prompt: 'What does #[derive(Clone)] do for a struct?',
            options: [
              { id: 'a', text: 'Nothing until you also write an impl Clone block yourself' },
              { id: 'b', text: 'Generates a working Clone implementation automatically, as long as every field is itself Clone' },
              { id: 'c', text: 'Makes the struct implement Copy instead' },
            ],
            correctOptionIds: ['b'],
            explanation: 'derive macros generate a real trait implementation for you at compile time. #[derive(Clone)] produces a .clone() that clones each field, provided every field type also implements Clone.',
          },
          {
            id: 'q5',
            prompt: 'Why did `sq.area()` fail to compile even though Square correctly implements Shape?',
            options: [
              { id: 'a', text: 'Rust requires the defining trait to be imported into scope before you can call its methods, to avoid silently ambiguous method names across crates' },
              { id: 'b', text: 'Square secretly does not implement Shape' },
              { id: 'c', text: 'area() needs to be called as Shape::area(&sq) always' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Importing the type is not enough — the trait itself must be in scope for its methods to be callable with dot syntax. This is intentional: it keeps method calls unambiguous even when multiple traits define methods with the same name.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ri-iterators-closures — Iterators & Closures
  // ---------------------------------------------------------------------
  'ri-iterators-closures': {
    id: 'ri-iterators-closures',
    heroSummary:
      "Closures are anonymous functions that can capture variables from where they're defined. Iterators are lazy pipelines built entirely on one trait method, next(). Together they are how Rust does functional-style data processing without sacrificing performance.",
    dependencyChain: {
      learned: 'Traits, default methods, and trait bounds — including that a bound like T: Summary constrains a generic type.',
      why: 'Closures are sugar for structs that implement one of the Fn/FnMut/FnOnce traits, and Iterator is itself just a trait with one required method — none of this makes sense without traits first.',
      build: 'Closures and their capture modes, the Fn/FnMut/FnOnce hierarchy, the lazy Iterator adapter chain (map/filter/fold/collect), and writing your own iterator by implementing next().',
      next: 'These patterns show up everywhere from here on — passing closures into std::thread::spawn, iterator chains in almost every Rust project you will write, and eventually async code.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Closures capture their environment',
        body: [
          'A closure is an anonymous, inline function that can capture variables from the scope where it is written — something an ordinary `fn` cannot do. `let add_one = |x| x + 1;` is a closure; Rust infers its parameter and return types from how it is used.',
          'How a closure captures a variable depends entirely on what its body does with that variable: reading it captures by immutable reference, mutating it captures by mutable reference, and moving it out (or using `move`) captures by value.',
          "That capture behavior determines which of three traits the closure implements: Fn (can be called repeatedly, only reads captures), FnMut (can be called repeatedly, mutates captures), or FnOnce (can only be called once, because calling it consumes captured values). Every closure implements at least FnOnce — some implement all three.",
        ],
        bullets: [
          'Fn — calls take &self; only reads captured variables; callable any number of times',
          'FnMut — calls take &mut self; mutates captured variables; the closure binding itself must be mut',
          'FnOnce — calls take self by value; consumes a captured variable; callable exactly once',
          '`move` before a closure forces it to take ownership of everything it captures, instead of borrowing',
        ],
      },
      {
        type: 'code',
        title: 'Fn, FnMut, and FnOnce in practice',
        description:
          'Three closures, three different capture modes, three different trait bounds on the functions that accept them.',
        code: `fn apply<F: Fn()>(f: F) {
    f();
}

fn apply_mut<F: FnMut()>(mut f: F) {
    f();
    f();
}

fn apply_once<F: FnOnce() -> String>(f: F) -> String {
    f()
}

fn main() {
    // Fn: only reads \`greeting\`, so it captures by immutable reference.
    // Callable any number of times; \`greeting\` is still usable afterward.
    let greeting = String::from("hello");
    let say_hello = || println!("{}, world", greeting);
    apply(say_hello);
    println!("still usable: {}", greeting);

    // FnMut: mutates \`count\`, so it captures by mutable reference.
    let mut count = 0;
    let increment = || {
        count += 1;
        println!("count is now {}", count);
    };
    apply_mut(increment);

    // FnOnce: \`move\` forces ownership of \`name\` into the closure, and the
    // closure body moves \`name\` back out again — so it can only run once.
    let name = String::from("Ferris");
    let consume = move || {
        println!("goodbye, {}", name);
        name
    };
    let returned = apply_once(consume);
    println!("got back: {}", returned);
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'Iterators: one method, an entire ecosystem',
        body: [
          'The Iterator trait requires exactly one method: `fn next(&mut self) -> Option<Self::Item>`, returning `Some(item)` until the sequence is exhausted, then `None` forever after.',
          "Everything else — map, filter, fold, sum, take, zip, and dozens more — is provided automatically as default methods on top of next(). Implement next() once, and your type gets the entire adapter ecosystem for free.",
          "Adapters like map() and filter() are lazy: calling them does no work, they just wrap the previous iterator in a new one describing 'what to do.' Only a consuming operation — collect(), sum(), fold(), or a for loop — actually pulls values through the whole chain.",
        ],
        bullets: [
          'next() is the only required method; Option<Self::Item> signals "value" or "done"',
          'map/filter/take/zip/... are lazy adapters — they build a pipeline, they do not run it',
          'collect/sum/fold/for-loops are consumers — calling one is what actually drives the iterator',
        ],
      },
      {
        type: 'diagram',
        title: 'Lazy evaluation: nothing runs until you consume it',
        description: 'v.iter().filter(...).map(...).collect() looks like three separate passes over the data — it is actually one.',
        diagram: {
          title: 'numbers.iter().filter(...).map(...).collect()',
          height: 320,
          frames: [
            {
              caption:
                'Writing .filter(...) and .map(...) builds a description of a pipeline. No filtering and no mapping have executed yet — nothing has even looked at the underlying data.',
              nodes: [
                { id: 'src', label: 'numbers.iter()', tone: 'default', shape: 'pill', x: 15, y: 30 },
                { id: 'filter', label: '.filter(even)', tone: 'muted', shape: 'pill', x: 45, y: 30 },
                { id: 'map', label: '.map(double)', tone: 'muted', shape: 'pill', x: 75, y: 30 },
              ],
              edges: [
                { from: 'src', to: 'filter', dashed: true, tone: 'muted' },
                { from: 'filter', to: 'map', dashed: true, tone: 'muted' },
              ],
            },
            {
              caption:
                '.collect() is a consumer. Calling it is what actually starts the pipeline — it asks map for a value, which asks filter for a value, which asks the source for a value.',
              nodes: [
                { id: 'src', label: 'numbers.iter()', tone: 'default', shape: 'pill', x: 15, y: 20 },
                { id: 'filter', label: '.filter(even)', tone: 'default', shape: 'pill', x: 45, y: 20 },
                { id: 'map', label: '.map(double)', tone: 'default', shape: 'pill', x: 75, y: 20 },
                { id: 'collect', label: '.collect()', sublabel: 'pulls values', tone: 'accent', shape: 'pill', x: 92, y: 60 },
              ],
              edges: [
                { from: 'collect', to: 'map', label: 'requests next()', dashed: true, tone: 'accent', animated: true },
                { from: 'map', to: 'filter', label: 'requests next()', dashed: true, tone: 'accent', animated: true },
                { from: 'filter', to: 'src', label: 'requests next()', dashed: true, tone: 'accent', animated: true },
              ],
            },
            {
              caption:
                'One element flows through the whole chain per request: the source yields it, filter decides whether to keep it, map transforms it. Only then does collect receive that single finished value.',
              nodes: [
                { id: 'src', label: 'numbers.iter()', sublabel: 'yields 4', tone: 'stack', shape: 'pill', x: 15, y: 20 },
                { id: 'filter', label: '.filter(even)', sublabel: 'kept', tone: 'success', shape: 'pill', x: 45, y: 20 },
                { id: 'map', label: '.map(double)', sublabel: '4 -> 8', tone: 'success', shape: 'pill', x: 75, y: 20 },
                { id: 'collect', label: '.collect()', sublabel: 'received 8', tone: 'accent', shape: 'pill', x: 92, y: 60 },
              ],
              edges: [
                { from: 'src', to: 'filter', tone: 'success' },
                { from: 'filter', to: 'map', tone: 'success' },
                { from: 'map', to: 'collect', tone: 'success' },
              ],
            },
            {
              caption:
                'This repeats element by element until the source runs out and returns None. No intermediate Vec is ever built between filter and map — chaining ten adapters costs no more allocation than chaining one.',
              nodes: [
                { id: 'result', label: 'Vec<i32>', sublabel: 'final collected result', tone: 'success', shape: 'box', x: 50, y: 45, w: 200 },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Adapter chains and a custom iterator',
        description:
          'Counter only implements next(). Everything else — take(), sum(), and the rest of the Iterator trait\'s adapters — comes free once that one method exists.',
        code: `fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];

    // filter and map are lazy adapters; collect drives the pipeline.
    let doubled_evens: Vec<i32> = numbers
        .iter()
        .filter(|n| **n % 2 == 0)
        .map(|n| n * 2)
        .collect();
    println!("doubled evens: {:?}", doubled_evens);

    // fold accumulates a single value across the whole sequence.
    let total: i32 = numbers.iter().fold(0, |acc, n| acc + n);
    println!("total: {}", total);

    // A custom iterator: only next() is required.
    struct Counter {
        count: u32,
    }

    impl Counter {
        fn new() -> Counter {
            Counter { count: 0 }
        }
    }

    impl Iterator for Counter {
        type Item = u32;

        fn next(&mut self) -> Option<u32> {
            if self.count < 5 {
                self.count += 1;
                Some(self.count)
            } else {
                None
            }
        }
    }

    // .take() and .sum() are default methods Counter gets for free.
    let sum_of_counter: u32 = Counter::new().take(3).sum();
    println!("sum of first 3 counter values: {}", sum_of_counter);
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: Sum of squares of even numbers',
        exercise: {
          problem:
            'Implement sum_of_squares_of_evens using an iterator chain — no explicit for loop or manual indexing. Filter down to even numbers, square each one, then sum.',
          starterCode: `fn sum_of_squares_of_evens(numbers: &[i32]) -> i32 {
    // TODO: use numbers.iter().filter(...).map(...).sum() to add up the
    // squares of only the even numbers in \`numbers\`
    0
}

fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];
    let result = sum_of_squares_of_evens(&numbers);
    println!("sum of squares of evens = {}", result);
}
`,
          hints: [
            { title: 'Start with the iterator', body: 'numbers.iter() produces items of type &i32.' },
            { title: 'Filter, then map', body: '.filter(|n| **n % 2 == 0) keeps only even numbers; .map(|n| n * n) squares each remaining one.' },
            { title: 'Consume with sum()', body: '.sum() drives the whole chain and adds up the results into a single i32 — it is the last call in the chain, with no closure argument.' },
          ],
          solutionCode: `fn sum_of_squares_of_evens(numbers: &[i32]) -> i32 {
    numbers
        .iter()
        .filter(|n| **n % 2 == 0)
        .map(|n| n * n)
        .sum()
}

fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6];
    let result = sum_of_squares_of_evens(&numbers);
    println!("sum of squares of evens = {}", result);
}
`,
          solutionExplanation:
            'filter narrows the sequence down to 2, 4, 6; map squares each into 4, 16, 36; sum consumes the lazy chain and adds them into a single i32 (56). None of the intermediate steps allocate a Vec — the whole computation happens in one pass.',
          expectedOutputContains: ['sum of squares of evens = 56'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the FnMut closure',
        challenge: {
          problem: 'This closure only mutates a variable it already captures. Why does calling it fail to compile?',
          brokenCode: `fn main() {
    let mut count = 0;
    let increment = || {
        count += 1;
        println!("count: {}", count);
    };

    increment();
    increment();
}
`,
          bugExplanation:
            "increment mutates count, so its body requires a mutable reference to what it captured — that makes increment an FnMut closure. Calling an FnMut closure requires &mut access to the closure value ITSELF (its `call` method takes &mut self), the same way calling a method that takes &mut self needs a mutable receiver. Because `increment` was bound with plain `let` rather than `let mut`, rustc rejects the very first call to increment() with error E0596: \"cannot borrow `increment` as mutable, as it is not declared as mutable\". This is one of the most common closure surprises: the `mut` belongs on the closure's own binding, not just on the variable it captures.",
          hints: [
            { title: "What trait does modifying `count` require increment to implement?", body: 'A closure that mutates something it captured implements FnMut, not just Fn.' },
            { title: 'Calling FnMut needs a mutable closure binding', body: 'FnMut::call_mut takes &mut self — so calling the closure directly needs the closure itself to be a mutable binding, just like calling a &mut self method needs a mutable receiver.' },
            { title: 'Add mut to the binding', body: 'Change `let increment = ...` to `let mut increment = ...`.' },
          ],
          fixedCode: `fn main() {
    let mut count = 0;
    let mut increment = || {
        count += 1;
        println!("count: {}", count);
    };

    increment();
    increment();
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What determines whether a closure implements Fn, FnMut, or FnOnce?',
            options: [
              { id: 'a', text: 'The order the closure is declared in relative to main()' },
              { id: 'b', text: 'How the closure body uses the variables it captures — only reads (Fn), mutates (FnMut), or consumes/moves out (FnOnce)' },
              { id: 'c', text: 'Whether the closure has any parameters' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The capture behavior required by the closure body determines which trait(s) it implements. A closure that only reads captured data implements all three (Fn implies FnMut implies FnOnce); one that consumes a capture only implements FnOnce.',
          },
          {
            id: 'q2',
            prompt: 'Why did `increment()` fail to compile until `increment` was declared with `let mut`?',
            options: [
              { id: 'a', text: 'Calling an FnMut closure requires mutable access to the closure value itself, not just to what it captured' },
              { id: 'b', text: 'count needed to be declared as a constant instead' },
              { id: 'c', text: 'Closures can never mutate captured variables under any circumstances' },
            ],
            correctOptionIds: ['a'],
            explanation: 'FnMut::call_mut takes &mut self. Invoking the closure directly needs a mutable binding to the closure, exactly like calling any &mut self method needs a mutable receiver.',
          },
          {
            id: 'q3',
            prompt: 'True or false: numbers.iter().map(|n| n * 2) performs the multiplication immediately when that line runs.',
            options: [
              { id: 'a', text: 'True' },
              { id: 'b', text: 'False — map is a lazy adapter; it only describes the transformation, and nothing runs until a consumer like collect() or sum() pulls values through it' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Iterator adapters are lazy. They build up a pipeline description; only a consuming call actually executes the work, one element at a time.',
          },
          {
            id: 'q4',
            prompt: 'What is the one method required to implement the Iterator trait for a custom type?',
            options: [
              { id: 'a', text: 'fn collect(self) -> Vec<Self::Item>' },
              { id: 'b', text: 'fn next(&mut self) -> Option<Self::Item>' },
              { id: 'c', text: 'fn map<F>(self, f: F) -> Self' },
            ],
            correctOptionIds: ['b'],
            explanation: 'next() is the sole required method. Every other adapter — map, filter, take, sum, collect, and more — is a default method built on top of it.',
          },
          {
            id: 'q5',
            prompt: 'What does writing `move` before a closure\'s parameter list do?',
            options: [
              { id: 'a', text: 'It forces the closure to take ownership of every variable it captures, instead of borrowing them' },
              { id: 'b', text: 'It makes the closure run on a separate thread automatically' },
              { id: 'c', text: 'It has no effect unless the closure is passed to std::thread::spawn' },
            ],
            correctOptionIds: ['a'],
            explanation: '`move` changes the capture mode: instead of borrowing, the closure takes ownership of everything it uses from the enclosing scope. This is why it is required when a closure needs to outlive the scope it was created in, such as when spawning a thread.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ri-challenge-ownership-puzzle — Challenge: Ownership Puzzle
  // ---------------------------------------------------------------------
  'ri-challenge-ownership-puzzle': {
    id: 'ri-challenge-ownership-puzzle',
    heroSummary:
      'Four short snippets. Some fail to compile in ways that look innocent; one looks broken but is perfectly legal. The skill this challenge builds: point at the exact line where ownership changes hands, every time.',
    dependencyChain: {
      learned: 'Move semantics, the Copy trait, and .clone() from the Move, Copy & Clone lesson.',
      why: "Knowing the rule 'assignment moves non-Copy types' is one thing. Recognizing every place a move quietly happens — a struct literal, a Vec::push, a for loop — is the actual skill, and it only comes from tracing real code.",
      build: 'Pattern recognition for the ownership traps hiding inside function calls, struct construction, collections, and for loops — plus the discipline to trace exactly which variable owns what before assuming a bug exists.',
      next: 'The borrow-checker and lifetime challenges build on this same tracing skill, applied to references instead of owned values.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Trace the move, not the read',
        body: [
          "Every puzzle below hinges on the same single fact: a value moves the instant it is passed BY VALUE somewhere — into a function argument, into a struct field, into a Vec via push, or into a for loop's implicit call to into_iter(). It has nothing to do with which line later tries to READ the variable; the move already happened earlier, at the point of the pass.",
          'One of these four snippets is a trap in the other direction: it looks exactly like a use-after-move bug at first glance, but it actually compiles. Reasoning that one out requires noticing what shadowing (`let x = ...; let x = ...;`) really does — it creates a brand-new variable, it does not resurrect the old one.',
        ],
        bullets: [
          'A move happens where a value is passed by value — not where it is later used',
          'Struct literals, Vec::push, and for loops all move non-Copy values just like a plain assignment does',
          'Shadowing with `let` creates an entirely new binding; it does not reuse or extend the old one\'s lifetime',
          'Read the compiler error fully — it always names both the move point and the point you tried to use the value afterward',
        ],
        callout: {
          tone: 'accent',
          text: "Before checking any fix below, try to point at the exact token where ownership changes hands. That single habit is what this whole challenge is training.",
        },
      },
      {
        type: 'debug',
        title: 'Puzzle 1: Moved into a struct field',
        challenge: {
          problem: 'Wrapper clearly just holds a String. Why can\'t `text` still be printed after wrapper is built?',
          brokenCode: `struct Wrapper {
    value: String,
}

fn main() {
    let text = String::from("packed");
    let wrapper = Wrapper { value: text };

    println!("wrapper contains: {}", wrapper.value);
    println!("original: {}", text);
}
`,
          bugExplanation:
            'A struct literal moves its field values in by default, exactly like a plain assignment does. `Wrapper { value: text }` moves `text`\'s String data into `wrapper.value` — String is not Copy, so this is a move, not a duplication. From that point on, `text` is invalid. The final `println!("original: {}", text)` tries to read it anyway, so rustc rejects the program with E0382: "borrow of moved value: `text`", pointing at the struct literal as the move and the last println! as the invalid later use.',
          hints: [
            { title: 'What does `Wrapper { value: text }` do to text?', body: 'A struct literal assigns each field exactly like a `let` binding would — for a non-Copy type, that means moving, not copying.' },
            { title: 'Check what String does NOT implement', body: 'String is not Copy, so nothing here duplicates the data automatically. Only wrapper.value owns it now.' },
            { title: 'Give the struct its own copy', body: 'Clone text before moving it in, so both `text` and `wrapper.value` end up with independent, valid data.' },
          ],
          fixedCode: `struct Wrapper {
    value: String,
}

fn main() {
    let text = String::from("packed");
    let wrapper = Wrapper { value: text.clone() };

    println!("wrapper contains: {}", wrapper.value);
    println!("original: {}", text);
}
`,
        },
      },
      {
        type: 'debug',
        title: 'Puzzle 2: Moved into a Vec via push',
        challenge: {
          problem: 'This pushes a String into a Vec, then tries to print the original variable and the value inside the Vec separately. What goes wrong?',
          brokenCode: `fn main() {
    let name = String::from("Ferris");
    let mut names = Vec::new();
    names.push(name);

    println!("first: {}", names[0]);
    println!("original: {}", name);
}
`,
          bugExplanation:
            'Vec::push takes its argument by value: `fn push(&mut self, value: T)`. Calling `names.push(name)` moves ownership of the String out of `name` and into the Vec\'s internal storage — again, because String is not Copy. `name` is invalid immediately afterward. The `println!("original: {}", name)` line tries to read it anyway, producing E0382: "borrow of moved value: `name`", with a note that the move happened "due to this method call."',
          hints: [
            { title: 'What does push(&mut self, value: T) take?', body: 'It takes ownership of `value` by value — pushing a non-Copy type moves it into the Vec, it does not borrow or copy it.' },
            { title: 'Where does the data live after push()?', body: "Only inside names[0] now. `name` the variable no longer owns anything." },
            { title: 'Clone before pushing, or read from the Vec only', body: 'Either push name.clone() so `name` stays valid, or stop using the original `name` binding after the push and read names[0] instead.' },
          ],
          fixedCode: `fn main() {
    let name = String::from("Ferris");
    let mut names = Vec::new();
    names.push(name.clone());

    println!("first: {}", names[0]);
    println!("original: {}", name);
}
`,
        },
      },
      {
        type: 'debug',
        title: 'Puzzle 3: The ownership boomerang — does this compile?',
        challenge: {
          problem:
            "At first glance this looks like a textbook use-after-move: `greeting` is passed into add_excitement, then a variable named `greeting` is read again on the very next line. Trace the ownership carefully before deciding whether it compiles.",
          brokenCode: `fn add_excitement(mut message: String) -> String {
    message.push('!');
    message
}

fn main() {
    let greeting = String::from("hello");
    let greeting = add_excitement(greeting);
    println!("{}", greeting);
}
`,
          bugExplanation:
            "This actually compiles — there is no bug. `add_excitement(greeting)` does move the ORIGINAL `greeting` into the function's `message` parameter, and that original binding is indeed invalid afterward. But `let greeting = add_excitement(greeting);` doesn't try to reuse that old binding — the `let` on the left creates a BRAND NEW variable, which happens to shadow the old name `greeting`. The new variable is bound to whatever add_excitement returns (the same String, with an '!' appended and ownership handed back to the caller). Nothing in this program ever tries to read the old, moved-from binding — the only later use is of the new, shadowing one — so the compiler has nothing to reject. It prints \"hello!\".",
          hints: [
            { title: "Which `greeting` is moved, and which is created?", body: 'The `greeting` inside add_excitement(greeting) — the argument — is the OLD binding, moved at that exact call. The `let greeting = ...` on the left of that same line declares a NEW binding.' },
            { title: 'Shadowing creates a new variable, it does not resurrect the old one', body: '`let x = ...; let x = ...;` are two entirely separate storage locations that happen to share a name. The second does not extend the lifetime of the first.' },
            { title: 'Does anything read the OLD greeting afterward?', body: "Look at the println! at the end — it reads the NEW `greeting` (the one from the second `let`), never the one that was moved into add_excitement. There is no use-after-move here." },
          ],
          fixedCode: `fn add_excitement(mut message: String) -> String {
    message.push('!');
    message
}

fn main() {
    let greeting = String::from("hello");
    // \`greeting\` is moved into add_excitement() right here — the OLD binding
    // becomes invalid the instant this call is made...
    let greeting = add_excitement(greeting);
    // ...but this line declares a BRAND NEW \`greeting\` that shadows it.
    // Nothing ever reads the old, moved-from binding, so nothing is rejected.
    println!("{}", greeting);
}
`,
        },
      },
      {
        type: 'debug',
        title: 'Puzzle 4: for loops move by default too',
        challenge: {
          problem: 'This loops over names to print each one, then tries to print the whole Vec afterward. Why does the second println! fail?',
          brokenCode: `fn main() {
    let names = vec![String::from("Ferris"), String::from("Crab")];

    for name in names {
        println!("hello, {}", name);
    }

    println!("all names: {:?}", names);
}
`,
          bugExplanation:
            '`for name in names` desugars to `for name in names.into_iter() { ... }`. IntoIterator::into_iter takes `self` by value — it consumes the Vec, moving ownership of `names` into the iterator the loop drives. Each `name` inside the loop body owns one String, moved out of the Vec one at a time. By the time the loop ends, `names` itself has been moved and no longer exists as a usable variable. The final `println!("all names: {:?}", names)` tries to read it anyway, producing E0382: "borrow of moved value: `names`", with a note pointing at the implicit into_iter() call as the move.',
          hints: [
            { title: 'What does `for x in collection` actually call?', body: 'It desugars to `collection.into_iter()`. Check what into_iter takes: self by value, or a reference?' },
            { title: 'into_iter() takes ownership', body: 'Because it consumes `self`, the Vec you loop over this way is moved into the loop and gone afterward — the same as passing it into any other function that takes it by value.' },
            { title: 'Borrow instead of consume', body: 'Loop over `&names` (or call `names.iter()`) instead of `names` directly — that yields `&String` references and leaves `names` itself untouched.' },
          ],
          fixedCode: `fn main() {
    let names = vec![String::from("Ferris"), String::from("Crab")];

    for name in &names {
        println!("hello, {}", name);
    }

    println!("all names: {:?}", names);
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Quick recap',
        questions: [
          {
            id: 'q1',
            prompt: 'In `let wrapper = Wrapper { value: text };` where text: String, what happens to text?',
            options: [
              { id: 'a', text: 'It is copied into wrapper.value; text remains usable' },
              { id: 'b', text: 'It is moved into wrapper.value; text is no longer usable afterward' },
              { id: 'c', text: 'It is borrowed; text remains usable as long as wrapper is alive' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Struct literals move non-Copy field values in exactly like a plain assignment would. String is not Copy, so this is a move.',
          },
          {
            id: 'q2',
            prompt: 'What does `for x in some_vec { ... }` do to some_vec, when some_vec: Vec<String>?',
            options: [
              { id: 'a', text: 'Nothing — it only borrows some_vec for the duration of the loop' },
              { id: 'b', text: 'It calls some_vec.into_iter(), which takes ownership and moves some_vec into the loop' },
              { id: 'c', text: 'It clones some_vec automatically so the original stays usable' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Looping directly over a collection by value calls into_iter(), which consumes it. Loop over &some_vec instead if you only need to read the elements.',
          },
          {
            id: 'q3',
            prompt:
              'process(s: String) -> String takes ownership and hands it back. Does `let s = String::from("hi"); let s = process(s); println!("{}", s);` compile?',
            options: [
              { id: 'a', text: 'Yes — the second `let s` shadows the first with a brand-new binding, and only the new one is ever read afterward' },
              { id: 'b', text: 'No — s is used after being moved into process()' },
            ],
            correctOptionIds: ['a'],
            explanation: 'The old `s` is indeed moved into process() and becomes invalid — but nothing tries to read that old binding again. Shadowing creates a separate new variable, and only the new one appears in the println!.',
          },
          {
            id: 'q4',
            prompt: 'Which of these operations move a non-Copy value, assuming no .clone() or & is used? (select all that apply)',
            options: [
              { id: 'a', text: 'Passing it as an argument to a function that takes it by value' },
              { id: 'b', text: 'Pushing it into a Vec with .push(value)' },
              { id: 'c', text: 'Using it as a struct field value in a struct literal' },
              { id: 'd', text: 'Passing a reference to it, like some_fn(&value)' },
            ],
            correctOptionIds: ['a', 'b', 'c'],
            multi: true,
            explanation: 'Function arguments taken by value, Vec::push, and struct literal fields all move non-Copy data exactly like a plain assignment. Passing a reference (&value) never moves anything — the owner keeps the value.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Lifetime/Trait Challenges & CLI File Manager Project (added)
  // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
  // Challenge: Lifetime Puzzle
  // ---------------------------------------------------------------------
  'ri-challenge-lifetime-puzzle': {
    id: 'ri-challenge-lifetime-puzzle',
    heroSummary:
      'Three real signatures that trip people up right after learning lifetimes — each one fails to compile for a different reason tied to the elision rules, not because the rules are broken.',
    dependencyChain: {
      learned: "Explicit lifetime annotations ('a) and the elision rules that let the compiler skip writing them out for you.",
      why: 'Elision feels like magic until you can predict, just by looking at a signature, whether the compiler will fill in the lifetimes for you or reject the function outright. That prediction is a skill built through repetition.',
      build: 'Fast, confident recognition of exactly which shape of function or method signature elision can — and cannot — handle on its own.',
      next: 'Traits & Trait Bounds, where shared behavior gets defined once and reused across types, the same way lifetimes let references get reused across call sites.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Elision is three rules, not one guess',
        body: [
          "The compiler doesn't guess at lifetimes — it applies three mechanical rules, in order, and if they don't fully pin down every reference in the signature, it stops and asks you to write the lifetimes explicitly.",
          'Rule 1: every elided reference parameter gets its own distinct lifetime. Rule 2: if there is EXACTLY ONE input lifetime (after rule 1), it is assigned to every elided output lifetime. Rule 3: if one of the parameters is `&self` or `&mut self`, the lifetime of `self` is assigned to every elided output lifetime, overriding rule 2.',
          'Each challenge below is a real, common way these rules stop applying — zero input references to borrow an output from, too many candidates for rule 2 to pick from, or a self-method whose output is quietly tied to the wrong reference.',
        ],
        bullets: [
          'Rule 1: each reference parameter gets its own lifetime',
          'Rule 2: exactly one input lifetime -> it becomes the output lifetime',
          'Rule 3: a `&self` parameter always wins the output lifetime, if present',
        ],
      },
      {
        type: 'debug',
        title: 'Challenge 1: Nothing to borrow from',
        challenge: {
          problem:
            'This function returns a `&str` but never takes one in. It reads fine — so why does rustc refuse to compile it?',
          brokenCode: `fn greeting(name_len: usize) -> &str {
    if name_len > 10 {
        "Hello, friend!"
    } else {
        "Hi!"
    }
}

fn main() {
    println!("{}", greeting(12));
}
`,
          bugExplanation:
            'Rule 2 only fires when there is exactly one input lifetime to copy onto the output. Here there are ZERO reference parameters — `name_len: usize` is not a reference at all, so it contributes no lifetime for elision to work with. rustc rejects this with E0106 ("missing lifetime specifier"), and its own help text says exactly what is wrong: "this function\'s return type contains a borrowed value, but there is no value for it to be borrowed from."',
          hints: [
            { title: 'Count the reference parameters, not the parameters', body: '`usize` is not a reference. For elision purposes, this function has zero input lifetimes to draw from.' },
            { title: 'So what IS the lifetime of "Hello, friend!"?', body: 'String literals are baked into the compiled binary itself — they are valid for the entire program. Rust has a name for that: the `\'static` lifetime.' },
            { title: 'Name the lifetime explicitly', body: "Since the returned references aren't borrowed from any parameter, annotate the return type with the one lifetime that\'s actually true here: `&'static str`." },
          ],
          fixedCode: `fn greeting(name_len: usize) -> &'static str {
    if name_len > 10 {
        "Hello, friend!"
    } else {
        "Hi!"
    }
}

fn main() {
    println!("{}", greeting(12));
}
`,
        },
      },
      {
        type: 'debug',
        title: 'Challenge 2: Too many candidates for rule 2',
        challenge: {
          problem:
            'This function takes two string slices and returns one derived from `s`. A human can tell which one — why can\'t the compiler?',
          brokenCode: `fn first_match(s: &str, pat: &str) -> &str {
    match s.find(pat) {
        Some(i) => &s[..i],
        None => s,
    }
}

fn main() {
    let text = "hello world";
    let result = first_match(text, "wor");
    println!("{}", result);
}
`,
          bugExplanation:
            "Rule 1 gives `s` and `pat` each their own distinct, separate lifetime. Rule 2 only kicks in when there is EXACTLY ONE input lifetime — here there are two, so rule 2 does not apply, and there is no `&self` for rule 3 to apply either. No rule pins down the output, so rustc stops and reports E0106, with the help text: \"this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `s` or `pat`.\" The compiler will not assume you meant `s` just because the body happens to only return slices of `s` — the SIGNATURE has to say so.",
          hints: [
            { title: 'How many reference parameters are there?', body: 'Two: `s` and `pat`. Rule 2 needs exactly one to fire automatically.' },
            { title: 'The body is not part of the contract', body: "Even though every returned value in the body traces back to `s`, the signature alone has to guarantee that — the compiler does not read the body to decide a signature's lifetimes." },
            { title: 'Name the relationship explicitly', body: "Add an explicit lifetime `'a`, tie it to `s` and the return type, and leave `pat` out of it — it can keep its own independent, unconstrained lifetime." },
          ],
          fixedCode: `fn first_match<'a>(s: &'a str, pat: &str) -> &'a str {
    match s.find(pat) {
        Some(i) => &s[..i],
        None => s,
    }
}

fn main() {
    let text = "hello world";
    let result = first_match(text, "wor");
    println!("{}", result);
}
`,
        },
      },
      {
        type: 'debug',
        title: 'Challenge 3: Rule 3 ties the output to the wrong reference',
        challenge: {
          problem:
            'This method takes `&self` and a `&str`, then returns the `&str` argument. It looks like the single-reference case from the Lifetimes lesson — so why does it fail?',
          brokenCode: `struct Logger {
    prefix: String,
}

impl Logger {
    fn format(&self, label: &str) -> &str {
        label
    }
}

fn main() {
    let logger = Logger { prefix: String::from("[app]") };
    let msg = logger.format("starting up");
    println!("{}", msg);
}
`,
          bugExplanation:
            'Rule 3 is not a suggestion — it OVERRIDES rule 2 whenever `&self` (or `&mut self`) is present. Because `format` takes `&self`, the elided output lifetime is tied to `self`\'s lifetime, not to `label`\'s, even though `label` is the only OTHER reference and even though the body returns `label`, not anything from `self`. The result is two references with unrelated lifetimes where the signature promised one: rustc rejects this with E0623 ("lifetime mismatch"), pointing out that `label` and the return type "are declared with different lifetimes" and that data from `label` is what actually gets returned.',
          hints: [
            { title: 'Which reference does rule 3 pick?', body: 'Whenever `&self` or `&mut self` appears in the parameter list, its lifetime — not any other parameter\'s — becomes the elided output lifetime. This happens even if `self` is never actually used in the return value.' },
            { title: 'Check what the body actually returns', body: '`format` returns `label`, a reference that was never tied to `self` at all. The signature says the output lives as long as `self`; the body hands back something with an unrelated lifetime.' },
            { title: 'Override rule 3 by naming the real relationship', body: "Give `label` its own explicit lifetime `'a` and tie the return type to THAT instead of letting elision default to `self`." },
          ],
          fixedCode: `struct Logger {
    prefix: String,
}

impl Logger {
    fn format<'a>(&self, label: &'a str) -> &'a str {
        label
    }
}

fn main() {
    let logger = Logger { prefix: String::from("[app]") };
    let msg = logger.format("starting up");
    println!("{}", msg);
}
`,
        },
      },
      {
        type: 'quiz',
        title: 'Predict the compiler',
        questions: [
          {
            id: 'q1',
            prompt: 'Does this function compile as written?',
            code: `fn last_word(s: &str) -> &str {
    s.split_whitespace().last().unwrap_or("")
}
`,
            options: [
              { id: 'a', text: 'Yes — exactly one input reference, so rule 2 ties the output to it automatically' },
              { id: 'b', text: 'No — it needs an explicit lifetime because it returns a slice, not the original reference' },
            ],
            correctOptionIds: ['a'],
            explanation: 'There is exactly one reference parameter (`s`), so rule 2 applies with no help needed: the elided output lifetime is automatically tied to `s`. This is true regardless of what expression inside the body produces the returned `&str`.',
          },
          {
            id: 'q2',
            prompt: 'Which rule is responsible for this function needing no annotations at all?',
            code: `struct Cache {
    value: String,
}

impl Cache {
    fn get(&self) -> &str {
        &self.value
    }
}
`,
            options: [
              { id: 'a', text: 'Rule 1 alone (each reference gets its own lifetime)' },
              { id: 'b', text: 'Rule 2 (exactly one input lifetime becomes the output)' },
              { id: 'c', text: 'Rule 3 (the `&self` parameter\'s lifetime becomes the output)' },
            ],
            correctOptionIds: ['c'],
            explanation: '`&self` is the only reference parameter here, so rules 2 and 3 would agree in this particular case — but it is rule 3 that actually fires whenever `&self` is present, and it takes priority over rule 2 by definition. The distinction only becomes visible once a second, non-self reference parameter is added, as in Challenge 3.',
          },
          {
            id: 'q3',
            prompt: 'A function takes two `&str` parameters and returns `&str`, but never actually borrows from the second parameter in its body. Will elision let it compile without annotations?',
            options: [
              { id: 'a', text: 'Yes, because the compiler reads the function body to see which parameter is actually used' },
              { id: 'b', text: 'No — with two input references and no `&self`, elision never applies, regardless of what the body does' },
            ],
            correctOptionIds: ['b'],
            explanation: "Elision is decided purely from the SIGNATURE, before the compiler ever looks at the body. Two reference parameters with no `&self` means rules 2 and 3 both fail to apply — an explicit lifetime is required no matter how the body actually uses the references.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Challenge: Implement a Trait for Multiple Types
  // ---------------------------------------------------------------------
  'ri-challenge-trait-challenge': {
    id: 'ri-challenge-trait-challenge',
    heroSummary:
      'Design one `Shape` trait, implement it for three unrelated structs, then call it generically two different ways — once with a compile-time trait bound, once with a runtime trait object.',
    dependencyChain: {
      learned: 'How to define a trait, give it a default method, implement it for a type with `impl Trait for Type`, and constrain a generic with a trait bound (`T: Trait`).',
      why: 'Trait design only really clicks once you have implemented the same trait for several different, unrelated types and then written one function that works across all of them without caring which type it got.',
      build: 'A reusable `Shape` trait implemented for three structs, called generically through both `impl Trait` (static dispatch) and `Box<dyn Shape>` (dynamic dispatch).',
      next: 'Closures & Iterators, which lean on trait bounds even more heavily — `Fn`, `FnMut`, `FnOnce`, and the `Iterator` trait itself.',
    },
    sections: [
      {
        type: 'explain',
        title: 'A trait is a contract, not an implementation',
        body: [
          "Designing a trait means deciding what behavior every implementor must provide, and what behavior can be derived automatically from that. A `Shape` trait should require exactly one thing from every shape — how to compute its area — and can then build anything else (like a description string) on top of that single method, for free, in every implementor.",
          "Once a trait exists, there are two different ways to write code that works across multiple implementing types: a generic function with a trait bound (`fn f<T: Shape>(s: T)`, or its sugar `fn f(s: impl Shape)`) picks ONE concrete type per call and the compiler generates specialized machine code for each — this is static dispatch, decided entirely at compile time. A trait object (`&dyn Shape`, `Box<dyn Shape>`) can hold ANY implementor behind one pointer, chosen at runtime — this is dynamic dispatch, and it's the only way to put different concrete `Shape` types in the same `Vec`.",
        ],
        bullets: [
          'One required method (`area`) is the whole contract',
          'A default method can build on the required one, for free, in every implementor',
          'Generic bound = one concrete type per call, decided at compile time',
          'Trait object (`dyn Trait`) = any implementor, decided at runtime, needed for heterogeneous collections',
        ],
      },
      {
        type: 'debug',
        title: 'Missing the trait bound',
        challenge: {
          problem:
            'This function is meant to work for any `Shape`, but it does not even compile yet — the trait has not entered the signature at all. What is missing?',
          brokenCode: `trait Shape {
    fn area(&self) -> f64;
}

struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn print_area<T>(shape: T) {
    println!("area = {:.2}", shape.area());
}

fn main() {
    print_area(Circle { radius: 2.0 });
}
`,
          bugExplanation:
            'An unconstrained generic `<T>` means "any type at all," and the compiler has to generate code that works for literally every possible `T` — including types that have no `area` method whatsoever. Since nothing in the signature says `T: Shape`, the compiler will not assume `shape.area()` is callable, even though the ONE type actually passed in (`Circle`) does implement `Shape`. rustc rejects this with E0599: "no method named `area` found for type parameter `T` in the current scope."',
          hints: [
            { title: 'What does `<T>` promise the compiler?', body: '`<T>` with no bound means the function must compile for ANY type — string, integer, struct, anything. The compiler cannot call a method that is not guaranteed to exist on every possible T.' },
            { title: 'Where does `.area()` actually come from?', body: 'It is defined on the `Shape` trait, not on every type in existence. The function needs to tell the compiler that its `T` is specifically a `Shape`.' },
            { title: 'Add the trait bound', body: 'Constrain the generic with `T: Shape` (or use the `impl Shape` shorthand for the parameter type) so the compiler knows `.area()` is guaranteed to exist.' },
          ],
          fixedCode: `trait Shape {
    fn area(&self) -> f64;
}

struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

fn print_area<T: Shape>(shape: T) {
    println!("area = {:.2}", shape.area());
}

fn main() {
    print_area(Circle { radius: 2.0 });
}
`,
        },
      },
      {
        type: 'code',
        title: 'One trait, three implementors, called generically',
        description:
          'The default `describe` method is written once on the trait and never repeated — every implementor gets it automatically, built entirely on top of each type\'s own `area()`.',
        language: 'rust',
        runnable: true,
        code: `trait Shape {
    fn area(&self) -> f64;

    // A default method: implemented once here, inherited by every Shape,
    // built only on top of the one method every implementor must supply.
    fn describe(&self) -> String {
        format!("This shape has an area of {:.2}", self.area())
    }
}

struct Circle {
    radius: f64,
}

struct Square {
    side: f64,
}

struct Triangle {
    base: f64,
    height: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

impl Shape for Square {
    fn area(&self) -> f64 {
        self.side * self.side
    }
}

impl Shape for Triangle {
    fn area(&self) -> f64 {
        0.5 * self.base * self.height
    }
}

// \`shape: &impl Shape\` is sugar for a generic \`<T: Shape>(shape: &T)\` bound —
// the compiler generates a separate, specialized version of this function
// for each concrete type it is actually called with (static dispatch).
fn print_shape_info(shape: &impl Shape) {
    println!("{}", shape.describe());
}

fn main() {
    let circle = Circle { radius: 2.0 };
    let square = Square { side: 3.0 };
    let triangle = Triangle { base: 4.0, height: 5.0 };

    print_shape_info(&circle);
    print_shape_info(&square);
    print_shape_info(&triangle);
}
`,
      },
      {
        type: 'code',
        title: 'A heterogeneous collection needs a trait object',
        description:
          'A generic bound picks one concrete type per call site, so `Vec<T: Shape>` cannot hold a Circle and a Square in the same Vec. `Vec<Box<dyn Shape>>` can, because each element carries its own type information behind a pointer, resolved at runtime.',
        language: 'rust',
        runnable: true,
        code: `trait Shape {
    fn area(&self) -> f64;

    fn describe(&self) -> String {
        format!("This shape has an area of {:.2}", self.area())
    }
}

struct Circle {
    radius: f64,
}

struct Square {
    side: f64,
}

struct Triangle {
    base: f64,
    height: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

impl Shape for Square {
    fn area(&self) -> f64 {
        self.side * self.side
    }
}

impl Shape for Triangle {
    fn area(&self) -> f64 {
        0.5 * self.base * self.height
    }
}

fn main() {
    // Each Box<dyn Shape> is one pointer plus a vtable of method pointers —
    // this is the only way to mix different concrete Shape types in one Vec.
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Circle { radius: 2.0 }),
        Box::new(Square { side: 3.0 }),
        Box::new(Triangle { base: 4.0, height: 5.0 }),
    ];

    for shape in &shapes {
        println!("{}", shape.describe());
    }

    let total_area: f64 = shapes.iter().map(|s| s.area()).sum();
    println!("Total area: {:.2}", total_area);
}
`,
      },
      {
        type: 'quiz',
        title: 'Static vs dynamic dispatch',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does `fn print_area<T>(shape: T)` fail to compile with `shape.area()` inside it?',
            options: [
              { id: 'a', text: 'Because `area` is spelled wrong' },
              { id: 'b', text: 'Because an unconstrained `T` could be any type, and the compiler cannot assume `.area()` exists on every possible type' },
              { id: 'c', text: 'Because generics cannot call methods at all' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A bare `<T>` promises the function works for literally any type. Only a bound like `T: Shape` tells the compiler that `.area()` is guaranteed to exist, no matter which concrete type is substituted in.',
          },
          {
            id: 'q2',
            prompt: 'Why does `Vec<Box<dyn Shape>>` work for mixing a Circle and a Square, while `fn f<T: Shape>(shapes: Vec<T>)` does not?',
            options: [
              { id: 'a', text: 'A generic `Vec<T>` is monomorphized into one concrete element type per call, so every element must be the SAME type; `Box<dyn Shape>` erases the concrete type behind a pointer, so different types can sit side by side' },
              { id: 'b', text: 'There is no real difference — both work identically for mixed types' },
              { id: 'c', text: '`dyn Shape` is only for a single type at a time, same as `T`' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Generic code is compiled once per concrete type actually used (monomorphization), so `Vec<T>` is a vector of one specific type. `Box<dyn Shape>` is a trait object — a fat pointer plus a vtable — that can point at ANY `Shape` implementor, which is what lets a single Vec hold several different concrete shapes.',
          },
          {
            id: 'q3',
            prompt: 'The `describe()` method is written once on the trait, with no override in `Circle`, `Square`, or `Triangle`. What makes this possible?',
            options: [
              { id: 'a', text: 'A default trait method body, which every implementor inherits automatically unless it chooses to override it' },
              { id: 'b', text: 'Rust automatically generates a `describe` method for every struct' },
              { id: 'c', text: '`describe` is a special compiler-provided method name' },
            ],
            correctOptionIds: ['a'],
            explanation: "Traits can provide a default implementation for a method, built on top of the trait's other (required) methods. Every implementor gets it for free, and could override it individually with its own `fn describe(&self) -> String { ... }` if it needed different behavior.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Project: CLI File Manager
  // ---------------------------------------------------------------------
  'ri-proj-cli-file-manager': {
    id: 'ri-proj-cli-file-manager',
    heroSummary:
      'A small command-line tool that lists, copies, moves, and deletes real files with std::fs — the first project where Option, Result, and ? stop being an exercise and start doing load-bearing work.',
    dependencyChain: {
      learned: 'Option<T>, Result<T, E>, and the ? operator for propagating errors without match-heavy boilerplate.',
      why: 'Almost every std::fs function can fail for reasons entirely outside your program\'s control — a missing file, a permissions error, a full disk — which is exactly the situation Result was designed for. This project is where that becomes unavoidable rather than optional.',
      build: 'Comfort reading and writing io::Result<T>-returning functions built on std::fs and std::path::{Path, PathBuf}, and chaining them together with ?.',
      next: 'Project: JSON Parser / Application, which applies the same error-propagation discipline to a hand-rolled recursive-descent parser.',
    },
    sections: [
      {
        type: 'explain',
        title: 'The filesystem is not optional about failure',
        body: [
          'Every function in `std::fs` returns `std::io::Result<T>` — a type alias for `Result<T, std::io::Error>` — because every one of them can fail in ways your program cannot prevent: a file that got deleted by another process, a directory you lack permission to read, a disk that filled up mid-write. There is no version of "list a directory" that cannot fail.',
          'This is exactly why the `?` operator exists. Without it, every single filesystem call would need its own `match` to either unwrap the success value or bail out with the error. With it, a whole chain of fallible operations reads almost like the happy path, while every failure still propagates correctly to the caller.',
          '`Path` and `PathBuf` are the other half of the toolkit: `Path` is a borrowed, unsized view onto a filesystem path (think `&str` for paths), while `PathBuf` is the owned, growable version (think `String` for paths). Functions that only need to READ a path take `&Path`; anything that needs to build up or own a path uses `PathBuf`.',
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Build the demo files and folders the tool operates on, entirely with std::fs, so the example never depends on anything already present on disk.',
          'List a directory\'s contents with fs::read_dir, collecting entries into a Vec<PathBuf>.',
          'Copy a file with fs::copy, propagating any failure with io::Result and ?.',
          'Move a file with fs::rename.',
          'Delete a file with fs::remove_file.',
          'Tie every function together in a main() that returns io::Result<()> and cleans up after itself.',
        ],
        steps: [
          {
            title: '1. Set up a self-contained demo directory',
            description:
              'std::env::temp_dir() gives a writable scratch location on any OS. Building the demo files here means the lesson never assumes any particular file already exists on your machine.',
            code: `let base = std::env::temp_dir().join("rust_file_manager_demo");
if base.exists() {
    fs::remove_dir_all(&base)?;
}
fs::create_dir_all(&base)?;

fs::write(base.join("notes.txt"), b"meeting notes")?;
fs::write(base.join("todo.txt"), b"buy milk\\nwalk the dog")?;`,
          },
          {
            title: '2. List a directory',
            description:
              'fs::read_dir returns an iterator of io::Result<DirEntry> — each entry itself might fail to read (e.g. a race with another process deleting it), so the inner `?` handles that too. .path() turns each DirEntry into a PathBuf.',
            code: `fn list_dir(dir: &Path) -> io::Result<Vec<PathBuf>> {
    let mut entries = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        entries.push(entry.path());
    }
    entries.sort();
    Ok(entries)
}`,
          },
          {
            title: '3. Copy a file',
            description:
              'fs::copy does the whole read-and-write itself and returns the number of bytes copied on success — there is nothing more to add on top of it.',
            code: `fn copy_file(src: &Path, dst: &Path) -> io::Result<u64> {
    fs::copy(src, dst)
}`,
          },
          {
            title: '4. Move (rename) a file',
            description:
              'fs::rename works within the same filesystem as an actual rename (instant, no data copied). Moving across filesystems would need a copy-then-delete instead, but that distinction is handled inside fs::rename itself.',
            code: `fn move_file(src: &Path, dst: &Path) -> io::Result<()> {
    fs::rename(src, dst)
}`,
          },
          {
            title: '5. Delete a file',
            description:
              'fs::remove_file deletes exactly one file (not a directory) and returns Err if the path does not exist or cannot be removed.',
            code: `fn delete_file(path: &Path) -> io::Result<()> {
    fs::remove_file(path)
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete CLI file manager',
        description:
          'main() returns io::Result<()> so every `?` inside it can propagate a real error all the way out, instead of needing to unwrap or panic on failure. The demo directory is created at the start and torn down at the end, so running this program leaves nothing behind.',
        language: 'rust',
        runnable: true,
        code: `use std::fs;
use std::io;
use std::path::{Path, PathBuf};

/// Lists the entries of a directory as a Vec of PathBufs, sorted for
/// deterministic output.
fn list_dir(dir: &Path) -> io::Result<Vec<PathBuf>> {
    let mut entries = Vec::new();
    for entry in fs::read_dir(dir)? {
        let entry = entry?;
        entries.push(entry.path());
    }
    entries.sort();
    Ok(entries)
}

/// Copies a file from src to dst, returning the number of bytes copied.
fn copy_file(src: &Path, dst: &Path) -> io::Result<u64> {
    fs::copy(src, dst)
}

/// Moves (renames) a file from src to dst.
fn move_file(src: &Path, dst: &Path) -> io::Result<()> {
    fs::rename(src, dst)
}

/// Deletes a single file.
fn delete_file(path: &Path) -> io::Result<()> {
    fs::remove_file(path)
}

fn main() -> io::Result<()> {
    // Build a self-contained demo directory so this example never depends on
    // files that happen to already exist on disk.
    let base = std::env::temp_dir().join("rust_file_manager_demo");
    if base.exists() {
        fs::remove_dir_all(&base)?;
    }
    fs::create_dir_all(&base)?;

    fs::write(base.join("notes.txt"), b"meeting notes")?;
    fs::write(base.join("todo.txt"), b"buy milk\\nwalk the dog")?;

    println!("--- Initial contents ---");
    for path in list_dir(&base)? {
        println!("{}", path.display());
    }

    let src = base.join("notes.txt");
    let backup = base.join("notes_backup.txt");
    let bytes_copied = copy_file(&src, &backup)?;
    println!("\\nCopied {} bytes: {} -> {}", bytes_copied, src.display(), backup.display());

    let archive_dir = base.join("archive");
    fs::create_dir_all(&archive_dir)?;
    let moved_to = archive_dir.join("todo.txt");
    move_file(&base.join("todo.txt"), &moved_to)?;
    println!("Moved todo.txt -> {}", moved_to.display());

    delete_file(&backup)?;
    println!("Deleted {}", backup.display());

    println!("\\n--- Final contents ---");
    for path in list_dir(&base)? {
        println!("{}", path.display());
        if path.is_dir() {
            for nested in list_dir(&path)? {
                println!("  {}", nested.display());
            }
        }
    }

    // Clean up after ourselves — leave nothing behind on disk.
    fs::remove_dir_all(&base)?;

    Ok(())
}
`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does every function here return io::Result<T> instead of just T, or panicking on failure?',
            options: [
              { id: 'a', text: 'Because std::fs functions can fail for reasons the program cannot control (permissions, missing files, disk errors), and Result forces the caller to acknowledge that possibility' },
              { id: 'b', text: 'Because Rust requires every function to return Result' },
              { id: 'c', text: 'Purely stylistic — panicking would work identically' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Filesystem operations depend on external state (other processes, hardware, permissions) that the program cannot guarantee. Result<T, E> makes that possibility part of the type signature, so failures are handled explicitly instead of crashing the whole program.',
          },
          {
            id: 'q2',
            prompt: 'What does the `?` operator do inside `fs::read_dir(dir)?`?',
            options: [
              { id: 'a', text: 'If the Result is Err, it returns that Err immediately from the enclosing function; if it is Ok, it unwraps and continues with the inner value' },
              { id: 'b', text: 'It ignores errors and continues with a default value' },
              { id: 'c', text: 'It panics immediately on any Err' },
            ],
            correctOptionIds: ['a'],
            explanation: '`?` is short for "propagate the error if there is one, otherwise unwrap the success value and keep going." It requires the enclosing function to itself return a compatible Result (here, io::Result<()> on main), so the error can keep flowing outward.',
          },
          {
            id: 'q3',
            prompt: 'Why do list_dir, copy_file, move_file, and delete_file take `&Path` parameters instead of `PathBuf`?',
            options: [
              { id: 'a', text: 'They only need to READ the path to perform the operation, not own or grow it — a borrowed &Path is enough, and it lets the caller keep using its PathBuf afterward' },
              { id: 'b', text: 'PathBuf cannot be passed into functions at all' },
              { id: 'c', text: '&Path and PathBuf are interchangeable with no difference' },
            ],
            correctOptionIds: ['a'],
            explanation: '&Path is the borrowed, read-only view (the Path equivalent of &str), while PathBuf is the owned, growable version (the Path equivalent of String). Since these functions never need to build up or store a path, taking &Path avoids an unnecessary move and lets callers keep their own PathBuf afterward — and PathBuf derefs to &Path automatically at call sites.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // JSON Parser, REST Client & Markdown Processor Projects (added)
  // ---------------------------------------------------------------------
// ────────────────────────────────────────────────────────────────────────
  // ri-proj-json-parser
  // ────────────────────────────────────────────────────────────────────────
  'ri-proj-json-parser': {
    id: 'ri-proj-json-parser',
    heroSummary:
      "Design a recursive JsonValue enum and hand-write a recursive-descent parser that turns a JSON-like string into that tree — no crates required, just enums, match, and a first look at why Box<T> exists.",
    dependencyChain: {
      learned: "Enums, match, and if let from the pattern matching lesson.",
      why: "Structured data formats like JSON are recursive by nature — a value can contain other values — and an enum is exactly how Rust models \"one of several possible shapes.\"",
      build: "A recursive JsonValue enum and a hand-rolled parser that turns raw text into that tree, plus your first look at why Box<T> exists.",
      next: "The REST API Client project swaps this hand-rolled parser for serde, the crate that generates this same kind of code automatically.",
    },
    sections: [
      {
        type: 'explain',
        title: 'A tree-shaped value needs a tree-shaped type',
        body: [
          "JSON is recursive: an array can hold other arrays or objects, and an object's values can themselves be any JSON value at all. An enum is Rust's tool for modeling \"one of several possible shapes,\" so a JsonValue with one variant per JSON type — Null, Bool, Number, String, Array, and Object — is the natural fit.",
          "Because Array holds a Vec<JsonValue> and Object holds a Vec<(String, JsonValue)>, JsonValue technically contains itself. That works because Vec<T> is always the same fixed size on the stack — a pointer, a length, and a capacity — no matter what T is, since the actual elements live in a separate heap allocation. That indirection is exactly what lets a self-referential type have a known size at compile time.",
          "You'll sometimes see this same problem solved with Box<T> instead of Vec — for example a singly linked list, enum List { Cons(i32, Box<List>), Nil }, where there is no Vec to hide the recursion behind. Box<T> is a smart pointer: it stores its contents on the heap and is itself just a pointer, so wrapping a recursive field in Box<T> gives the compiler a fixed size to work with. Full coverage of Box and the other smart pointers comes in Rust Advanced — for now, just recognize it as \"the heap pointer you reach for when a type needs to contain itself, and nothing else is already providing that indirection.\"",
          "The parser itself uses recursive descent: one function per kind of value, calling each other in the same shape as the grammar. parse_value calls parse_array, which calls parse_value again for every element — the function call structure mirrors the recursive structure of the data.",
        ],
      },
      {
        type: 'diagram',
        title: 'Why some recursive enums need Box, and ours does not',
        description: "Comparing a directly recursive type against JsonValue's Vec-based recursion.",
        diagram: {
          title: 'Fixed-size recursion',
          frames: [
            {
              caption: "A type that directly contains another copy of itself, like this List enum, has no fixed size at compile time, because each Cons would need to hold an infinitely nested copy of itself inline.",
              nodes: [
                { id: 'decl', label: 'enum List { Cons(i32, List), Nil }', shape: 'pill', tone: 'danger', x: 50, y: 20, w: 380 },
                { id: 'size', label: 'size_of::<List>() = ?', tone: 'danger', x: 50, y: 50 },
                { id: 'reason', label: 'each Cons holds a whole List inline — infinite nesting', shape: 'ghost', tone: 'danger', x: 50, y: 78, w: 340 },
              ],
            },
            {
              caption: "Box<List> replaces the inline List with a single heap pointer, so Cons only ever stores a fixed-size pointer no matter how long the actual list gets.",
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
                { id: 'cons', label: 'Cons(i32, Box<List>)', sublabel: 'the Box is just a pointer — fixed size', tone: 'stack', x: 25, y: 45 },
                { id: 'heap-list', label: 'List', sublabel: 'the rest of the list, heap-allocated', tone: 'heap', x: 75, y: 45 },
              ],
              edges: [{ from: 'cons', to: 'heap-list', label: 'Box points here', tone: 'accent' }],
            },
            {
              caption: "Vec already does this same trick for us: it stores its elements in a heap-allocated buffer behind a fixed-size pointer, which is why JsonValue's Array and Object variants compile without you ever writing Box yourself.",
              nodes: [
                { id: 'stack-header2', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header2', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
                { id: 'json', label: 'Array(Vec<JsonValue>)', sublabel: 'Vec is ptr + len + cap — fixed size', tone: 'stack', x: 25, y: 45 },
                { id: 'heap-items', label: '[JsonValue, JsonValue, ...]', sublabel: 'heap-allocated buffer', tone: 'heap', x: 75, y: 45 },
              ],
              edges: [{ from: 'json', to: 'heap-items', label: 'Vec points here', tone: 'accent' }],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          "Define a JsonValue enum covering null, booleans, numbers, strings, arrays, and objects.",
          "Track a cursor position through the input as a recursive-descent parser consumes it.",
          "Parse each JSON construct — literals, strings, numbers, arrays, objects — with its own function.",
          "Return Result<JsonValue, String> so malformed input produces a message instead of a panic.",
          "Pretty-print the resulting tree to confirm the parse worked.",
        ],
        steps: [
          {
            title: '1. Define the JsonValue tree',
            description: "One variant per JSON type. Array and Object hold a Vec, which is exactly what makes the recursion compile — see the diagram above for why.",
            code: `#[derive(Debug)]
enum JsonValue {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<JsonValue>),
    Object(Vec<(String, JsonValue)>),
}`,
          },
          {
            title: '2. Track position with a shared cursor',
            description: "Every parsing function receives the same chars slice and a &mut usize cursor, advancing it as it consumes characters. skip_whitespace runs before every value, so whitespace between tokens is invisible to the rest of the parser.",
            code: `fn skip_whitespace(chars: &[char], pos: &mut usize) {
    while *pos < chars.len() && chars[*pos].is_whitespace() {
        *pos += 1;
    }
}`,
          },
          {
            title: '3. Dispatch on the next character',
            description: "parse_value peeks at the next character to decide which kind of value is coming, then delegates. Literals (null / true / false) just check a fixed word; numbers and strings get their own small helper functions.",
            code: `fn parse_value(chars: &[char], pos: &mut usize) -> Result<JsonValue, String> {
    skip_whitespace(chars, pos);
    if *pos >= chars.len() {
        return Err("unexpected end of input".to_string());
    }
    match chars[*pos] {
        'n' => parse_literal(chars, pos, "null", JsonValue::Null),
        't' => parse_literal(chars, pos, "true", JsonValue::Bool(true)),
        'f' => parse_literal(chars, pos, "false", JsonValue::Bool(false)),
        '"' => parse_string(chars, pos).map(JsonValue::String),
        '[' => parse_array(chars, pos),
        '{' => parse_object(chars, pos),
        c if c == '-' || c.is_ascii_digit() => parse_number(chars, pos),
        c => Err(format!("unexpected character '{}' at position {}", c, *pos)),
    }
}`,
          },
          {
            title: '4. Parse a comma-separated array',
            description: "Skip the opening bracket, handle the empty-array case, then loop: parse a value, then expect a comma (keep going) or a closing bracket (stop). This exact shape repeats for objects.",
            code: `fn parse_array(chars: &[char], pos: &mut usize) -> Result<JsonValue, String> {
    *pos += 1; // skip '['
    let mut items = Vec::new();
    skip_whitespace(chars, pos);
    if *pos < chars.len() && chars[*pos] == ']' {
        *pos += 1;
        return Ok(JsonValue::Array(items));
    }
    loop {
        let value = parse_value(chars, pos)?;
        items.push(value);
        skip_whitespace(chars, pos);
        match chars.get(*pos) {
            Some(',') => *pos += 1,
            Some(']') => {
                *pos += 1;
                break;
            }
            _ => return Err(format!("expected ',' or ']' at position {}", *pos)),
        }
    }
    Ok(JsonValue::Array(items))
}`,
          },
          {
            title: '5. Parse "key": value pairs for an object',
            description: "Same comma-loop shape as parse_array, except each iteration first reads a quoted string key and a colon before parsing the value.",
            code: `fn parse_object(chars: &[char], pos: &mut usize) -> Result<JsonValue, String> {
    *pos += 1; // skip '{'
    let mut entries = Vec::new();
    skip_whitespace(chars, pos);
    if *pos < chars.len() && chars[*pos] == '}' {
        *pos += 1;
        return Ok(JsonValue::Object(entries));
    }
    loop {
        skip_whitespace(chars, pos);
        if chars.get(*pos) != Some(&'"') {
            return Err(format!("expected string key at position {}", *pos));
        }
        let key = parse_string(chars, pos)?;
        skip_whitespace(chars, pos);
        if chars.get(*pos) != Some(&':') {
            return Err(format!("expected ':' at position {}", *pos));
        }
        *pos += 1; // skip ':'
        let value = parse_value(chars, pos)?;
        entries.push((key, value));
        skip_whitespace(chars, pos);
        match chars.get(*pos) {
            Some(',') => *pos += 1,
            Some('}') => {
                *pos += 1;
                break;
            }
            _ => return Err(format!("expected ',' or '}}' at position {}", *pos)),
        }
    }
    Ok(JsonValue::Object(entries))
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete JSON parser',
        description: "Every helper function from the steps above, plus parse_literal, parse_string, and parse_number, wired into one parse() entry point and a print_json() pretty-printer. Running this parses a small nested JSON object — a string, a number, an array, a boolean, and a null — and prints the resulting tree with two-space indentation per level. Fully std-only: no crates needed.",
        language: 'rust',
        runnable: true,
        code: `#[derive(Debug)]
enum JsonValue {
    Null,
    Bool(bool),
    Number(f64),
    String(String),
    Array(Vec<JsonValue>),
    Object(Vec<(String, JsonValue)>),
}

fn parse(input: &str) -> Result<JsonValue, String> {
    let chars: Vec<char> = input.chars().collect();
    let mut pos = 0;
    let value = parse_value(&chars, &mut pos)?;
    skip_whitespace(&chars, &mut pos);
    if pos != chars.len() {
        return Err(format!("unexpected trailing characters at position {}", pos));
    }
    Ok(value)
}

fn skip_whitespace(chars: &[char], pos: &mut usize) {
    while *pos < chars.len() && chars[*pos].is_whitespace() {
        *pos += 1;
    }
}

fn parse_value(chars: &[char], pos: &mut usize) -> Result<JsonValue, String> {
    skip_whitespace(chars, pos);
    if *pos >= chars.len() {
        return Err("unexpected end of input".to_string());
    }
    match chars[*pos] {
        'n' => parse_literal(chars, pos, "null", JsonValue::Null),
        't' => parse_literal(chars, pos, "true", JsonValue::Bool(true)),
        'f' => parse_literal(chars, pos, "false", JsonValue::Bool(false)),
        '"' => parse_string(chars, pos).map(JsonValue::String),
        '[' => parse_array(chars, pos),
        '{' => parse_object(chars, pos),
        c if c == '-' || c.is_ascii_digit() => parse_number(chars, pos),
        c => Err(format!("unexpected character '{}' at position {}", c, *pos)),
    }
}

fn parse_literal(
    chars: &[char],
    pos: &mut usize,
    literal: &str,
    value: JsonValue,
) -> Result<JsonValue, String> {
    let end = *pos + literal.len();
    let matches_literal = end <= chars.len() && chars[*pos..end].iter().collect::<String>() == literal;
    if !matches_literal {
        return Err(format!("expected '{}' at position {}", literal, *pos));
    }
    *pos = end;
    Ok(value)
}

fn parse_string(chars: &[char], pos: &mut usize) -> Result<String, String> {
    *pos += 1; // skip opening quote
    let mut result = String::new();
    while *pos < chars.len() && chars[*pos] != '"' {
        result.push(chars[*pos]);
        *pos += 1;
    }
    if *pos >= chars.len() {
        return Err("unterminated string".to_string());
    }
    *pos += 1; // skip closing quote
    Ok(result)
}

fn parse_number(chars: &[char], pos: &mut usize) -> Result<JsonValue, String> {
    let start = *pos;
    if chars[*pos] == '-' {
        *pos += 1;
    }
    while *pos < chars.len() && (chars[*pos].is_ascii_digit() || chars[*pos] == '.') {
        *pos += 1;
    }
    let text: String = chars[start..*pos].iter().collect();
    text.parse::<f64>()
        .map(JsonValue::Number)
        .map_err(|_| format!("invalid number '{}'", text))
}

fn parse_array(chars: &[char], pos: &mut usize) -> Result<JsonValue, String> {
    *pos += 1; // skip '['
    let mut items = Vec::new();
    skip_whitespace(chars, pos);
    if *pos < chars.len() && chars[*pos] == ']' {
        *pos += 1;
        return Ok(JsonValue::Array(items));
    }
    loop {
        let value = parse_value(chars, pos)?;
        items.push(value);
        skip_whitespace(chars, pos);
        match chars.get(*pos) {
            Some(',') => *pos += 1,
            Some(']') => {
                *pos += 1;
                break;
            }
            _ => return Err(format!("expected ',' or ']' at position {}", *pos)),
        }
    }
    Ok(JsonValue::Array(items))
}

fn parse_object(chars: &[char], pos: &mut usize) -> Result<JsonValue, String> {
    *pos += 1; // skip '{'
    let mut entries = Vec::new();
    skip_whitespace(chars, pos);
    if *pos < chars.len() && chars[*pos] == '}' {
        *pos += 1;
        return Ok(JsonValue::Object(entries));
    }
    loop {
        skip_whitespace(chars, pos);
        if chars.get(*pos) != Some(&'"') {
            return Err(format!("expected string key at position {}", *pos));
        }
        let key = parse_string(chars, pos)?;
        skip_whitespace(chars, pos);
        if chars.get(*pos) != Some(&':') {
            return Err(format!("expected ':' at position {}", *pos));
        }
        *pos += 1; // skip ':'
        let value = parse_value(chars, pos)?;
        entries.push((key, value));
        skip_whitespace(chars, pos);
        match chars.get(*pos) {
            Some(',') => *pos += 1,
            Some('}') => {
                *pos += 1;
                break;
            }
            _ => return Err(format!("expected ',' or '}}' at position {}", *pos)),
        }
    }
    Ok(JsonValue::Object(entries))
}

fn print_json(value: &JsonValue, indent: usize) {
    let pad = "  ".repeat(indent);
    match value {
        JsonValue::Null => println!("{}null", pad),
        JsonValue::Bool(b) => println!("{}{}", pad, b),
        JsonValue::Number(n) => println!("{}{}", pad, n),
        JsonValue::String(s) => println!("{}\\"{}\\"", pad, s),
        JsonValue::Array(items) => {
            println!("{}[", pad);
            for item in items {
                print_json(item, indent + 1);
            }
            println!("{}]", pad);
        }
        JsonValue::Object(entries) => {
            println!("{}{{", pad);
            for (key, val) in entries {
                println!("{}  {}:", pad, key);
                print_json(val, indent + 2);
            }
            println!("{}}}", pad);
        }
    }
}

fn main() {
    let input = r#"{"name": "Ferris", "age": 3, "languages": ["Rust", "friendliness"], "active": true, "pet": null}"#;

    match parse(input) {
        Ok(value) => print_json(&value, 0),
        Err(e) => println!("Parse error: {}", e),
    }
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: "Why do JsonValue::Array(Vec<JsonValue>) and JsonValue::Object(Vec<(String, JsonValue)>) compile without wrapping JsonValue in Box, even though JsonValue refers to itself?",
            options: [
              { id: 'a', text: "Vec already stores its elements in a separate heap allocation and is itself only a fixed-size pointer, length, and capacity — so it provides the same indirection Box would." },
              { id: 'b', text: "Rust special-cases Vec so recursive types never need Box." },
              { id: 'c', text: "JsonValue is not actually recursive." },
              { id: 'd', text: "Arrays always have a fixed size regardless of what they contain." },
            ],
            correctOptionIds: ['a'],
            explanation: "A recursive type needs some fixed-size indirection to break the infinite-size problem. Box<T> provides that as a bare heap pointer; Vec<T> already provides the same thing internally, which is why wrapping JsonValue in Box isn't necessary here.",
          },
          {
            id: 'q2',
            prompt: "What's wrong with `enum List { Cons(i32, List), Nil }`, and how does Box<List> fix it?",
            options: [
              { id: 'a', text: "It has no fixed size — each Cons would need to hold a whole List inline, forever. Box<List> replaces the inline List with a single heap pointer of known size." },
              { id: 'b', text: "It's a borrow-checker error about lifetimes." },
              { id: 'c', text: "Nothing is wrong; it compiles as written." },
              { id: 'd', text: "i32 cannot appear in a tuple variant." },
            ],
            correctOptionIds: ['a'],
            explanation: "This is the classic E0072 'recursive type has infinite size' error. Box<T> fixes it because Box is always pointer-sized, no matter what it points to.",
          },
          {
            id: 'q3',
            prompt: "Why does parse_value return Result<JsonValue, String> instead of just JsonValue?",
            options: [
              { id: 'a', text: "Parsing can fail on malformed input, and Result lets the caller handle that failure instead of the whole program panicking." },
              { id: 'b', text: "JsonValue cannot be returned by value from a function." },
              { id: 'c', text: "It's required syntax for any function that takes a &mut usize parameter." },
              { id: 'd', text: "String is faster to return than JsonValue." },
            ],
            correctOptionIds: ['a'],
            explanation: "Malformed JSON — an unterminated string, a missing comma, an unexpected character — is an expected possibility here, not a bug. Result models that directly instead of forcing a panic or an unwrap.",
          },
          {
            id: 'q4',
            prompt: "Every parsing function takes `pos: &mut usize` instead of returning the new position. Why?",
            options: [
              { id: 'a', text: "It lets every function advance one shared cursor through the same input, so the next function to run always picks up exactly where the last one left off." },
              { id: 'b', text: "usize cannot be returned from a function." },
              { id: 'c', text: "It makes the parser run in a separate thread." },
              { id: 'd', text: "It avoids needing the Result type." },
            ],
            correctOptionIds: ['a'],
            explanation: "A &mut usize is a mutable reference to one shared counter. Each helper mutates it in place via *pos, so there's a single source of truth for 'how far into the input have we read' as control passes between functions.",
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // ri-proj-rest-api-client
  // ────────────────────────────────────────────────────────────────────────
  'ri-proj-rest-api-client': {
    id: 'ri-proj-rest-api-client',
    heroSummary:
      "Model a real API's JSON shape as a struct, then use reqwest and serde inside an async fn to fetch and deserialize it in a few lines — your first look at async Rust.",
    dependencyChain: {
      learned: "Traits, and how #[derive(...)] generates a trait implementation for you automatically.",
      why: "Real programs fetch data over a network, and Rust's answer to \"don't block the whole program while waiting\" is async fn — this project is your first contact with it.",
      build: "A Post struct deriving Deserialize, and an async main that awaits a GET request and then awaits decoding its JSON body.",
      next: "Rust Advanced covers async and the Tokio runtime in real depth — here you only need enough to read this pattern and trust why it's shaped the way it is.",
    },
    sections: [
      {
        type: 'explain',
        title: 'Why this needs derive, reqwest, and a preview of async',
        body: [
          "A public JSON API has a fixed response shape. jsonplaceholder.typicode.com/posts/1 — a well-known, stable test API — always returns something like {\"userId\": 1, \"id\": 1, \"title\": \"...\", \"body\": \"...\"}. Instead of hand-writing a parser like the JSON Parser project did, you describe that shape once as a struct and let the serde crate's #[derive(Deserialize)] generate the field-by-field decoding code for you at compile time.",
          "Fetching that data means making an HTTP request, which takes an unpredictable amount of time — the network might respond in 20 milliseconds or 2 seconds. A normal (\"blocking\", or synchronous) function would freeze its entire thread for that whole wait. async fn preview: marking a function async lets it pause at each .await point instead of blocking, handing control back so other work can happen while it waits. You're not implementing this mechanism yourself — the Tokio crate provides an async runtime that drives these paused functions to completion in the background. Full coverage of async, futures, and Tokio's runtime internals is a Rust Advanced topic; here, treat async fn / .await as \"this pauses instead of blocking, and something else is required to actually run it.\"",
          "#[tokio::main] is the bridge between the two worlds: it rewrites your async fn main into an ordinary fn main that starts a Tokio runtime and runs your async code on top of it. Without it (or an equivalent), there is nothing to actually execute an async fn at all — async fn on its own just describes a paused computation, it doesn't run itself.",
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          "Model the API's JSON response as a struct deriving Deserialize.",
          "Add reqwest, serde, and tokio to Cargo.toml so the project has what it needs to compile.",
          "Write an async fn main, marked #[tokio::main], that awaits a GET request.",
          "Deserialize the response body into that struct with one more .await, and print the result.",
        ],
        steps: [
          {
            title: '1. Model the response shape',
            description: "The struct's field names should match the JSON keys. userId is camelCase in the JSON but Rust convention is snake_case, so #[serde(rename = \"userId\")] tells serde to map the JSON key \"userId\" onto the user_id field during deserialization.",
            code: `use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct Post {
    #[serde(rename = "userId")]
    user_id: u32,
    id: u32,
    title: String,
    body: String,
}`,
          },
          {
            title: '2. Add the three dependencies',
            description: "reqwest performs the HTTP request, serde defines the Deserialize trait and its derive macro, and tokio provides the async runtime that actually drives .await points to completion. Without tokio specifically, there is no runtime to execute an async fn main at all.",
            code: `[dependencies]
reqwest = { version = "0.12", features = ["json"] }
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }`,
          },
          {
            title: '3. Mark main async and hand it to Tokio',
            description: "#[tokio::main] expands to a plain fn main() that boots a Tokio runtime and immediately runs your async body inside it. Every .await inside this function is a point where the function can pause without blocking the underlying OS thread.",
            code: `#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    // ...
    Ok(())
}`,
          },
          {
            title: '4. Fetch and decode in one chain',
            description: "reqwest::get(url).await performs the request and pauses until the response headers arrive; .json::<Post>().await reads the body and deserializes it, pausing until the full body is downloaded and parsed. Both steps return a Result, so both use ? to propagate failure — a bad connection and a body that doesn't match Post's shape are both reqwest::Error.",
            code: `let url = "https://jsonplaceholder.typicode.com/posts/1";
let post: Post = reqwest::get(url).await?.json().await?;

println!("Post #{} (by user {})", post.id, post.user_id);
println!("Title: {}", post.title);
println!("Body:  {}", post.body);`,
          },
        ],
      },
      {
        type: 'code',
        title: 'Cargo.toml',
        description: "These three dependencies are required for the program below to compile at all — none of this is std-only. reqwest needs its \"json\" feature enabled to gain the .json() method on responses; serde needs its \"derive\" feature enabled for #[derive(Deserialize)] to exist; tokio needs \"full\" (or at least \"rt-multi-thread\" and \"macros\") to provide #[tokio::main].",
        language: 'toml',
        runnable: false,
        code: `[package]
name = "rest_client"
version = "0.1.0"
edition = "2021"

[dependencies]
reqwest = { version = "0.12", features = ["json"] }
serde = { version = "1", features = ["derive"] }
tokio = { version = "1", features = ["full"] }`,
      },
      {
        type: 'code',
        title: 'The complete REST API client',
        description: "This is the real, correct shape of the code — but it needs the Cargo.toml above plus live network access to actually run, neither of which this in-browser playground can guarantee. Marked non-runnable for that reason; treat it as a reference for exactly what production code calling a JSON API looks like.",
        language: 'rust',
        runnable: false,
        code: `use serde::Deserialize;

#[derive(Debug, Deserialize)]
struct Post {
    #[serde(rename = "userId")]
    user_id: u32,
    id: u32,
    title: String,
    body: String,
}

#[tokio::main]
async fn main() -> Result<(), reqwest::Error> {
    let url = "https://jsonplaceholder.typicode.com/posts/1";
    let post: Post = reqwest::get(url).await?.json().await?;

    println!("Post #{} (by user {})", post.id, post.user_id);
    println!("Title: {}", post.title);
    println!("Body:  {}", post.body);

    Ok(())
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: "Why is main marked async fn and annotated with #[tokio::main]?",
            options: [
              { id: 'a', text: "async fn lets the function pause at each .await instead of blocking its thread while waiting on network I/O, and #[tokio::main] supplies the runtime that actually drives that paused code to completion." },
              { id: 'b', text: "Every Rust program's main function must be async." },
              { id: 'c', text: "#[tokio::main] only changes how errors are formatted." },
              { id: 'd', text: "async fn is required whenever a function returns a Result." },
            ],
            correctOptionIds: ['a'],
            explanation: "async fn on its own just describes a computation that can pause; #[tokio::main] is what actually creates a runtime and runs it. Neither one alone would compile and run correctly without the other.",
          },
          {
            id: 'q2',
            prompt: "What does #[serde(rename = \"userId\")] do on the user_id field?",
            options: [
              { id: 'a', text: "Tells serde's generated Deserialize code to read the JSON key \"userId\" into this snake_case field, instead of looking for a literal \"user_id\" key." },
              { id: 'b', text: "Renames the field in the struct's compiled memory layout." },
              { id: 'c', text: "Only affects how the field is shown with {:?}." },
              { id: 'd', text: "Is required on every field of every struct that derives Deserialize." },
            ],
            correctOptionIds: ['a'],
            explanation: "Without the rename attribute, serde would look for a JSON key matching the Rust field name exactly (\"user_id\"), and fail to find \"userId\" in the response — this attribute bridges the naming convention mismatch.",
          },
          {
            id: 'q3',
            prompt: "reqwest::get(url).await? succeeds (a 200 OK arrives), but .json::<Post>().await? still returns an Err. What does that mean?",
            options: [
              { id: 'a', text: "The response body doesn't actually match the shape Post expects — e.g. a field is missing or has the wrong type — which is a deserialization failure, not a network failure." },
              { id: 'b', text: "This can never happen once the request itself succeeds." },
              { id: 'c', text: "Post is missing a Debug derive." },
              { id: 'd', text: "Tokio's runtime crashed." },
            ],
            correctOptionIds: ['a'],
            explanation: "A successful HTTP status only means the server responded — it says nothing about whether the body's JSON actually matches your struct. reqwest's .json() call performs deserialization and can fail independently of the network call.",
          },
          {
            id: 'q4',
            prompt: "What would happen if Cargo.toml declared `serde = { version = \"1\" }` without `features = [\"derive\"]`?",
            options: [
              { id: 'a', text: "#[derive(Deserialize)] would fail to compile — the derive macro itself lives behind serde's \"derive\" feature flag and isn't available without it." },
              { id: 'b', text: "Nothing changes; Cargo features are purely cosmetic." },
              { id: 'c', text: "The program would compile but panic at runtime on every request." },
              { id: 'd', text: "reqwest would silently disable JSON support instead." },
            ],
            correctOptionIds: ['a'],
            explanation: "serde ships its core traits by default, but the #[derive(...)] macros that generate trait implementations for your types are gated behind the \"derive\" feature — omit it and #[derive(Deserialize)] simply won't exist to call.",
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // ri-proj-markdown-processor
  // ────────────────────────────────────────────────────────────────────────
  'ri-proj-markdown-processor': {
    id: 'ri-proj-markdown-processor',
    heroSummary:
      "Classify each line of a small Markdown subset with an enum, then stitch the classified lines into valid HTML — including grouping consecutive list items into one <ul>.",
    dependencyChain: {
      learned: "String vs &str, UTF-8, and core string methods like .lines() and .trim().",
      why: "Turning text into structured output is a classic line-by-line parsing problem, and a natural next step once you're comfortable slicing and inspecting strings.",
      build: "A BlockType enum that classifies each line, and a converter that stitches classified lines into valid HTML, including grouping consecutive list items into a single <ul>.",
      next: "The JSON Parser project tackles a similar parsing problem for a format that's recursive rather than line-based.",
    },
    sections: [
      {
        type: 'explain',
        title: 'One enum variant per line, one function to stitch them together',
        body: [
          "Markdown's structure is mostly line-based: whether a line is a heading, a list item, or a plain paragraph is fully decided by looking at its first few characters, in isolation from the lines around it. That makes an enum a great fit for the moment-to-moment classification — BlockType::Heading(u8), BlockType::Paragraph, and BlockType::ListItem cover the subset we need here, with the u8 remembering which heading level (1, 2, or 3) it was.",
          "The harder part isn't classifying a single line — it's that HTML wants list items grouped inside one shared <ul>...</ul>, not wrapped individually. That means the converter needs a tiny bit of memory across loop iterations: a boolean tracking \"am I currently inside a list,\" so it knows to open a <ul> on the first list item in a run and close it on the first non-list line (or a blank line, or the end of input) that follows.",
          "This is intentionally the simple end of Markdown: no bold/italic inline formatting, no nested lists, no escaping of special HTML characters in the content. Line-by-line classification followed by a small amount of cross-line state is the core technique real Markdown processors build on — this project gives you that core, without the dozens of edge cases a production parser like pulldown-cmark has to handle.",
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          "Define a BlockType enum for headings (with their level), paragraphs, and list items.",
          "Classify a line by peeling off its Markdown prefix with str::strip_prefix.",
          "Convert one classified line into its HTML tag.",
          "Group consecutive list items into a single <ul>, using a boolean carried across the loop.",
        ],
        steps: [
          {
            title: '1. Define the block types',
            description: "Heading needs to remember its level (1, 2, or 3) so it can later produce <h1>, <h2>, or <h3>. Paragraph and ListItem don't need extra data — their content is just whatever's left of the line. Deriving Clone and Copy is safe and convenient here since the only payload is a u8.",
            code: `#[derive(Clone, Copy)]
enum BlockType {
    Heading(u8),
    Paragraph,
    ListItem,
}`,
          },
          {
            title: '2. Classify a line by its prefix',
            description: "str::strip_prefix returns Some(rest) — with the prefix already removed — if the string starts with exactly that prefix, or None otherwise. Checking \"### \" and \"## \" before the plain \"# \" matters: a line starting with \"### \" also technically starts with \"#\", so the longer, more specific prefixes must be tried first.",
            code: `fn classify_line(line: &str) -> (BlockType, &str) {
    if let Some(rest) = line.strip_prefix("### ") {
        (BlockType::Heading(3), rest)
    } else if let Some(rest) = line.strip_prefix("## ") {
        (BlockType::Heading(2), rest)
    } else if let Some(rest) = line.strip_prefix("# ") {
        (BlockType::Heading(1), rest)
    } else if let Some(rest) = line.strip_prefix("- ") {
        (BlockType::ListItem, rest)
    } else {
        (BlockType::Paragraph, line)
    }
}`,
          },
          {
            title: '3. Walk the lines, tracking whether we\'re inside a list',
            description: "in_list is the cross-line memory: it opens <ul> the moment a ListItem shows up while it's false, and closes </ul> the moment a non-list line (or a blank line) shows up while it's true. Everything else — headings and paragraphs — maps straight to one HTML tag using the level or content that classify_line already extracted.",
            code: `fn convert(markdown: &str) -> String {
    let mut html = String::new();
    let mut in_list = false;

    for raw_line in markdown.lines() {
        let line = raw_line.trim();

        if line.is_empty() {
            if in_list {
                html.push_str("</ul>\\n");
                in_list = false;
            }
            continue;
        }

        let (block, content) = classify_line(line);

        if !matches!(block, BlockType::ListItem) && in_list {
            html.push_str("</ul>\\n");
            in_list = false;
        }

        match block {
            BlockType::Heading(level) => {
                html.push_str(&format!("<h{0}>{1}</h{0}>\\n", level, content));
            }
            BlockType::Paragraph => {
                html.push_str(&format!("<p>{}</p>\\n", content));
            }
            BlockType::ListItem => {
                if !in_list {
                    html.push_str("<ul>\\n");
                    in_list = true;
                }
                html.push_str(&format!("  <li>{}</li>\\n", content));
            }
        }
    }

    if in_list {
        html.push_str("</ul>\\n");
    }

    html
}`,
          },
          {
            title: '4. Run it on a small multi-block document',
            description: "A mix of headings at every supported level, a plain paragraph, and a run of list items, so the output shows every code path — including the </ul> that closes automatically once the list ends.",
            code: `fn main() {
    let markdown = "\\
# Rust Notes

Rust is a systems language.

## Why people like it

- Memory safety without garbage collection
- Fearless concurrency
- Great tooling

### Getting started

Install it with rustup.";

    let html = convert(markdown);
    println!("{}", html);
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete Markdown-to-HTML converter',
        description: "BlockType, classify_line, and convert combined into one runnable program, std-only — no crates needed. Running it converts a small document with three heading levels, a paragraph, and a bulleted list into well-formed HTML, correctly wrapping the three list items in a single <ul>...</ul>.",
        language: 'rust',
        runnable: true,
        code: `#[derive(Clone, Copy)]
enum BlockType {
    Heading(u8),
    Paragraph,
    ListItem,
}

fn classify_line(line: &str) -> (BlockType, &str) {
    if let Some(rest) = line.strip_prefix("### ") {
        (BlockType::Heading(3), rest)
    } else if let Some(rest) = line.strip_prefix("## ") {
        (BlockType::Heading(2), rest)
    } else if let Some(rest) = line.strip_prefix("# ") {
        (BlockType::Heading(1), rest)
    } else if let Some(rest) = line.strip_prefix("- ") {
        (BlockType::ListItem, rest)
    } else {
        (BlockType::Paragraph, line)
    }
}

fn convert(markdown: &str) -> String {
    let mut html = String::new();
    let mut in_list = false;

    for raw_line in markdown.lines() {
        let line = raw_line.trim();

        if line.is_empty() {
            if in_list {
                html.push_str("</ul>\\n");
                in_list = false;
            }
            continue;
        }

        let (block, content) = classify_line(line);

        if !matches!(block, BlockType::ListItem) && in_list {
            html.push_str("</ul>\\n");
            in_list = false;
        }

        match block {
            BlockType::Heading(level) => {
                html.push_str(&format!("<h{0}>{1}</h{0}>\\n", level, content));
            }
            BlockType::Paragraph => {
                html.push_str(&format!("<p>{}</p>\\n", content));
            }
            BlockType::ListItem => {
                if !in_list {
                    html.push_str("<ul>\\n");
                    in_list = true;
                }
                html.push_str(&format!("  <li>{}</li>\\n", content));
            }
        }
    }

    if in_list {
        html.push_str("</ul>\\n");
    }

    html
}

fn main() {
    let markdown = "\\
# Rust Notes

Rust is a systems language.

## Why people like it

- Memory safety without garbage collection
- Fearless concurrency
- Great tooling

### Getting started

Install it with rustup.";

    let html = convert(markdown);
    println!("{}", html);
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: "Why does convert() need an in_list boolean carried across loop iterations, instead of just handling each line independently?",
            options: [
              { id: 'a', text: "Consecutive \"- \" lines must be grouped inside one shared <ul>...</ul>, and only the first list line in a run should open that tag while only the line that ends the run should close it." },
              { id: 'b', text: "HTML documents are only allowed to contain a single <ul> in total." },
              { id: 'c', text: "It's needed to avoid printing headings more than once." },
              { id: 'd', text: "Rust requires every loop to declare a boolean before it." },
            ],
            correctOptionIds: ['a'],
            explanation: "Classifying a line is independent, but rendering isn't: HTML wants all consecutive list items wrapped in one <ul>, so the converter needs to remember, from one line to the next, whether it's currently inside a list run.",
          },
          {
            id: 'q2',
            prompt: "Why does classify_line check line.strip_prefix(\"## \") and \"### \" before checking \"# \"?",
            options: [
              { id: 'a', text: "A line starting with \"### \" or \"## \" also starts with \"#\", so the longer, more specific prefixes have to be tried first or a level-2/3 heading would be wrongly classified as level 1." },
              { id: 'b', text: "strip_prefix panics if called in the wrong order." },
              { id: 'c', text: "Rust requires match arms to be sorted by string length." },
              { id: 'd', text: "It has no effect on the result either way." },
            ],
            correctOptionIds: ['a'],
            explanation: "strip_prefix(\"# \") would actually fail to match a \"### \" line too, since the third character is '#' rather than a space — but checking longest-prefix-first is still the correct, robust habit for exactly this kind of overlapping-prefix classification.",
          },
          {
            id: 'q3',
            prompt: "Why does classify_line return (BlockType, &str) instead of just BlockType?",
            options: [
              { id: 'a', text: "The caller also needs the line's content with its Markdown marker already stripped off, ready to drop straight into the matching HTML tag." },
              { id: 'b', text: "BlockType alone would not be a valid return type from a function." },
              { id: 'c', text: "Tuples are required whenever a function takes a &str parameter." },
              { id: 'd', text: "It has no real purpose beyond convention." },
            ],
            correctOptionIds: ['a'],
            explanation: "Classification and content-extraction happen together naturally here — strip_prefix both tells you which variant matched and hands back the remaining text in the same call, so returning both as a tuple avoids re-deriving the content elsewhere.",
          },
          {
            id: 'q4',
            prompt: "What happens to a blank line in the input?",
            options: [
              { id: 'a', text: "It's skipped entirely, and if it appears while in_list is true, it closes the open <ul> first, since a blank line marks the end of the current block." },
              { id: 'b', text: "It gets rendered as an empty <p></p>." },
              { id: 'c', text: "It causes convert() to panic." },
              { id: 'd', text: "It's converted into a <br> tag." },
            ],
            correctOptionIds: ['a'],
            explanation: "The `if line.is_empty()` branch closes any open list before `continue`-ing past the blank line, which is exactly why a blank line after a run of list items correctly produces a closing </ul> in the output.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // HTTP Client, CLI Database & Multithreaded File Processor Projects (added)
  // ---------------------------------------------------------------------
'ri-proj-http-client': {
    id: 'ri-proj-http-client',
    heroSummary:
      'Speak raw HTTP/1.1 by hand over a TcpStream — open a socket, write the request bytes yourself, and parse the status line, headers, and body back out of the response.',
    dependencyChain: {
      learned: 'Vec<T> and HashMap<K, V> from the collections lesson.',
      why: "Every HTTP request you've ever made through a browser or a library like reqwest is, underneath, just bytes flowing over a TCP socket. Writing the request text yourself and parsing the response by hand demystifies the protocol completely — there is no magic left once you've built this.",
      build: 'Comfort with TcpStream for raw byte-level networking, and a habit for turning delimiter-separated text (like a header block) into structured data.',
      next: "Later concurrency lessons build multi-connection servers out of exactly this TcpListener/TcpStream pair — you've already seen both sides of the wire.",
    },
    sections: [
      {
        type: 'explain',
        title: 'HTTP is just text over a socket',
        body: [
          "HTTP/1.1 is a plain-text protocol: a client opens a TCP connection, writes a request as literal ASCII text, and the server writes back a response as literal ASCII text. `std::net::TcpStream` gives you that raw connection — no parsing, no formatting, just a stream of bytes you read from and write to yourself.",
          'A request looks like `GET /path HTTP/1.1\\r\\nHost: example.com\\r\\nConnection: close\\r\\n\\r\\n` — a request line, one header per line, and a blank line (two `\\r\\n` in a row) marking "no more headers." A response has the same shape: a status line, headers, a blank line, then the body.',
          "Connecting to a real external server isn't guaranteed to work in every sandboxed environment, so this project's runnable demo is fully self-contained: the same program spins up its own tiny `TcpListener` on a background thread and connects to that instead. The client code — the part that matters — is identical to what you'd write against any real HTTP server.",
        ],
        callout: {
          tone: 'warning',
          text: "This parser handles the happy path only — no chunked transfer-encoding, no redirects, no TLS. Real HTTP clients (like reqwest) handle dozens of edge cases this project deliberately skips so you can see the core mechanism clearly.",
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Define an HttpResponse struct to hold the parsed status, headers, and body.',
          'Open a TcpStream and write a raw HTTP/1.1 request as bytes.',
          'Read the raw response bytes back from the socket.',
          'Split the response into head and body on the blank-line separator.',
          'Parse the header block into a HashMap<String, String>.',
        ],
        steps: [
          {
            title: '1. Define the HttpResponse struct',
            description:
              'Bundling status, headers, and body into one struct gives the rest of the program a clean value to work with, instead of passing three loose pieces around.',
            code: `struct HttpResponse {
    status: String,
    headers: HashMap<String, String>,
    body: String,
}`,
          },
          {
            title: '2. Open the connection and write the request',
            description:
              'TcpStream::connect opens a raw byte-level connection to host:port. There is no HTTP library involved — write_all sends our own hand-formatted request text straight over the wire.',
            code: `let mut stream = TcpStream::connect((host, port)).expect("connect failed");

let request = format!(
    "GET {path} HTTP/1.1\\r\\nHost: {host}\\r\\nConnection: close\\r\\n\\r\\n"
);
stream.write_all(request.as_bytes()).expect("write failed");`,
          },
          {
            title: '3. Read the raw bytes back',
            description:
              'A single .read() call is not guaranteed to capture the whole response — TCP is a stream, not a sequence of messages. read_to_end keeps reading until the connection closes, which it will, because we asked the server for "Connection: close".',
            code: `let mut buf = Vec::new();
stream.read_to_end(&mut buf).expect("read failed");
let raw = String::from_utf8_lossy(&buf);`,
          },
          {
            title: '4. Split the head from the body',
            description:
              'HTTP/1.1 always separates headers from the body with exactly one blank line — two \\r\\n in a row. Everything before that is the status line plus headers; everything after is the body.',
            code: `let (head, body) = raw.split_once("\\r\\n\\r\\n").unwrap_or((raw, ""));
let mut lines = head.lines();
let status = lines.next().unwrap_or("").to_string();`,
          },
          {
            title: '5. Parse the remaining header lines into a HashMap',
            description:
              'Each header line looks like "Name: value". split_once(\':\') cleanly separates the two at the first colon, and .trim() strips the leading space the convention leaves after it.',
            code: `let mut headers = HashMap::new();
for line in lines {
    if let Some((name, value)) = line.split_once(':') {
        headers.insert(name.trim().to_string(), value.trim().to_string());
    }
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete HTTP client (and its own test server)',
        description:
          'main() spins up a TcpListener on a background thread that plays the role of a real HTTP server, then connects to it with the client code above — a fully self-contained round trip you can actually run.',
        language: 'rust',
        runnable: true,
        code: `use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::thread;

struct HttpResponse {
    status: String,
    headers: HashMap<String, String>,
    body: String,
}

fn fetch(host: &str, port: u16, path: &str) -> HttpResponse {
    let mut stream = TcpStream::connect((host, port)).expect("connect failed");

    let request = format!(
        "GET {path} HTTP/1.1\\r\\nHost: {host}\\r\\nConnection: close\\r\\n\\r\\n"
    );
    stream.write_all(request.as_bytes()).expect("write failed");

    let mut buf = Vec::new();
    stream.read_to_end(&mut buf).expect("read failed");
    let raw = String::from_utf8_lossy(&buf);

    parse_response(&raw)
}

fn parse_response(raw: &str) -> HttpResponse {
    let (head, body) = raw.split_once("\\r\\n\\r\\n").unwrap_or((raw, ""));
    let mut lines = head.lines();
    let status = lines.next().unwrap_or("").to_string();

    let mut headers = HashMap::new();
    for line in lines {
        if let Some((name, value)) = line.split_once(':') {
            headers.insert(name.trim().to_string(), value.trim().to_string());
        }
    }

    HttpResponse { status, headers, body: body.to_string() }
}

fn main() {
    // Spin up a tiny local server so the round trip is self-contained.
    // Binding to port 0 asks the OS for any free port.
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind failed");
    let addr = listener.local_addr().unwrap();

    let server = thread::spawn(move || {
        if let Ok((mut socket, _)) = listener.accept() {
            let mut buf = [0u8; 512];
            let _ = socket.read(&mut buf); // drain the request; we don't need to parse it server-side

            let body = "Hello from a hand-rolled server!";
            let response = format!(
                "HTTP/1.1 200 OK\\r\\nContent-Type: text/plain\\r\\nContent-Length: {}\\r\\n\\r\\n{}",
                body.len(),
                body,
            );
            let _ = socket.write_all(response.as_bytes());
        }
    });

    let response = fetch("127.0.0.1", addr.port(), "/");

    println!("Status: {}", response.status);
    println!("Content-Type header: {:?}", response.headers.get("Content-Type"));
    println!("Content-Length header: {:?}", response.headers.get("Content-Length"));
    println!("Body: {}", response.body);

    server.join().unwrap();
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does parse_response split the raw response on "\\r\\n\\r\\n" specifically, rather than "\\n\\n"?',
            options: [
              { id: 'a', text: 'HTTP/1.1 uses CRLF (\\r\\n) as its line ending, so the blank line separating headers from the body is two CRLFs in a row, not two bare newlines.' },
              { id: 'b', text: '"\\n\\n" is not valid Rust syntax inside a string.' },
              { id: 'c', text: 'It makes no difference — either would work identically.' },
              { id: 'd', text: 'TcpStream automatically converts \\n to \\r\\n before this point.' },
            ],
            correctOptionIds: ['a'],
            explanation: 'The HTTP/1.1 spec mandates CRLF line endings. Splitting on a bare "\\n\\n" would fail to find the separator at all, since the real bytes on the wire are \\r\\n\\r\\n.',
          },
          {
            id: 'q2',
            prompt: 'Why call stream.read_to_end(&mut buf) instead of a single stream.read(&mut buf)?',
            options: [
              { id: 'a', text: 'read_to_end() is required for all TcpStream reads.' },
              { id: 'b', text: 'A single .read() call is not guaranteed to return the entire response at once, since TCP is a byte stream — read_to_end keeps reading until the server closes the connection (which it will, thanks to "Connection: close").' },
              { id: 'c', text: '.read() only works with TcpListener, not TcpStream.' },
              { id: 'd', text: 'read_to_end() is faster because it uses less memory.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'TCP delivers a stream of bytes with no message boundaries. A response could arrive in several chunks across several .read() calls; read_to_end loops internally until it hits EOF, which happens here because the server closes the socket after writing.',
          },
          {
            id: 'q3',
            prompt: 'Why bind the demo server\'s TcpListener to "127.0.0.1:0" instead of a fixed port like 7878?',
            options: [
              { id: 'a', text: 'Port 0 is reserved specifically for HTTP.' },
              { id: 'b', text: 'Passing port 0 asks the OS to hand back any free port, avoiding an "address already in use" failure — the actual port is then read back with listener.local_addr().' },
              { id: 'c', text: 'Fixed ports are not allowed with TcpListener.' },
              { id: 'd', text: 'Port 0 makes the server run faster.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A hardcoded port can fail to bind if something else on the machine already holds it. Binding to port 0 sidesteps that entirely — the kernel picks a free one, and addr.port() tells you which.',
          },
          {
            id: 'q4',
            prompt: 'Why store headers in a HashMap<String, String> rather than, say, a Vec<(String, String)>?',
            options: [
              { id: 'a', text: 'Vec cannot hold tuples in Rust.' },
              { id: 'b', text: 'Headers are naturally name-value pairs, and a HashMap gives O(1) lookup by name (e.g. headers.get("Content-Length")) instead of scanning every entry.' },
              { id: 'c', text: 'HashMap preserves the original header order, which a Vec would not.' },
              { id: 'd', text: 'There is no meaningful difference; either would work exactly the same way.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A HashMap is the natural fit for key-based lookup like headers.get("Content-Type"). (Note it does NOT preserve insertion order — if header order mattered, a Vec of pairs would be the better choice.)',
          },
        ],
      },
    ],
  },

  'ri-proj-cli-database': {
    id: 'ri-proj-cli-database',
    heroSummary:
      'Build a tiny key-value store on top of a HashMap, then teach it to persist itself to disk as plain "key=value" lines — and prove a fresh load reconstructs the exact same data.',
    dependencyChain: {
      learned: 'HashMap<K, V>, its entry-style methods, and Option from the collections lesson.',
      why: "A HashMap disappears the instant your program exits — everything you set() is gone. Real tools need state that survives a restart. This project bridges an in-memory collection to durable, on-disk storage without reaching for a database or an external crate.",
      build: 'A repeatable pattern for turning any HashMap into a simple, human-readable file format, and parsing it back into an identical HashMap.',
      next: "The multithreaded file processor project reuses this same read-data, do-work, produce-answers shape — but spreads the work across threads instead of a single pass.",
    },
    sections: [
      {
        type: 'explain',
        title: 'A database is just a HashMap with a save button',
        body: [
          "At its core, a key-value database is exactly the HashMap<String, String> you already know — the only new idea is persistence: writing its contents to a file so the data survives after the program exits, and reading that file back into an equivalent HashMap on the next run.",
          'The simplest possible file format is one entry per line, formatted as `key=value`. No JSON, no binary encoding, no external crate — just String formatting on the way out, and str::split_once(\'=\') on the way back in.',
        ],
        callout: {
          tone: 'warning',
          text: "This format has a real limitation: if a key or value contains its own '=' or a newline, the naive line-based parsing breaks (a value with '=' is fine, since split_once only splits at the FIRST '=' — but a newline inside a value would corrupt the file). A production key-value store would escape or length-prefix values instead.",
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Define a Store struct wrapping a HashMap<String, String>.',
          'Implement set, get, and delete methods on Store.',
          'Implement save_to_file, serializing every entry as one "key=value" line.',
          'Implement load_from_file, parsing those lines back into a fresh Store.',
        ],
        steps: [
          {
            title: '1. Define the Store struct',
            description:
              'Store is a thin wrapper around a HashMap — wrapping it in a struct (instead of passing a bare HashMap around) gives us a clean place to attach methods like save_to_file.',
            code: `struct Store {
    data: HashMap<String, String>,
}

impl Store {
    fn new() -> Self {
        Store { data: HashMap::new() }
    }
}`,
          },
          {
            title: '2. set, get, and delete',
            description:
              '.insert() overwrites any existing value for that key (which is exactly what "set" should do). .get() borrows a value without taking ownership. .remove() both deletes the entry and hands back whether it existed.',
            code: `fn set(&mut self, key: &str, value: &str) {
    self.data.insert(key.to_string(), value.to_string());
}

fn get(&self, key: &str) -> Option<&String> {
    self.data.get(key)
}

fn delete(&mut self, key: &str) -> bool {
    self.data.remove(key).is_some()
}`,
          },
          {
            title: '3. Save to a file',
            description:
              'fs::File::create opens (or overwrites) a file; writeln! formats one "key=value" line per entry, using the ? operator to propagate any I/O error instead of unwrapping it here.',
            code: `fn save_to_file(&self, path: &str) -> std::io::Result<()> {
    let mut file = fs::File::create(path)?;
    for (key, value) in &self.data {
        writeln!(file, "{}={}", key, value)?;
    }
    Ok(())
}`,
          },
          {
            title: '4. Load from a file',
            description:
              'This is an associated function (Store::load_from_file), not a method — loading builds a brand-new Store rather than mutating an existing one. split_once(\'=\') splits each line at only the first \'=\', which is what lets a value safely contain one of its own.',
            code: `fn load_from_file(path: &str) -> std::io::Result<Store> {
    let contents = fs::read_to_string(path)?;
    let mut store = Store::new();
    for line in contents.lines() {
        if let Some((key, value)) = line.split_once('=') {
            store.set(key, value);
        }
    }
    Ok(store)
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete key-value store',
        description:
          'main() sets three keys, deletes one, saves the rest to disk, then loads a completely fresh Store from that same file — proving persistence actually round-trips.',
        language: 'rust',
        runnable: true,
        code: `use std::collections::HashMap;
use std::fs;
use std::io::Write;

struct Store {
    data: HashMap<String, String>,
}

impl Store {
    fn new() -> Self {
        Store { data: HashMap::new() }
    }

    fn set(&mut self, key: &str, value: &str) {
        self.data.insert(key.to_string(), value.to_string());
    }

    fn get(&self, key: &str) -> Option<&String> {
        self.data.get(key)
    }

    fn delete(&mut self, key: &str) -> bool {
        self.data.remove(key).is_some()
    }

    fn save_to_file(&self, path: &str) -> std::io::Result<()> {
        let mut file = fs::File::create(path)?;
        for (key, value) in &self.data {
            writeln!(file, "{}={}", key, value)?;
        }
        Ok(())
    }

    fn load_from_file(path: &str) -> std::io::Result<Store> {
        let contents = fs::read_to_string(path)?;
        let mut store = Store::new();
        for line in contents.lines() {
            if let Some((key, value)) = line.split_once('=') {
                store.set(key, value);
            }
        }
        Ok(store)
    }
}

fn main() {
    let mut store = Store::new();
    store.set("name", "Ferris");
    store.set("language", "Rust");
    store.set("version", "1.0");

    println!("name = {:?}", store.get("name"));

    store.delete("version");
    println!("version after delete = {:?}", store.get("version"));

    let path = "kv_store.db";
    store.save_to_file(path).expect("failed to save");
    println!("Saved store to {}", path);

    let loaded = Store::load_from_file(path).expect("failed to load");
    println!("Loaded name = {:?}", loaded.get("name"));
    println!("Loaded language = {:?}", loaded.get("language"));
    println!("Loaded has version? {}", loaded.get("version").is_some());

    fs::remove_file(path).ok();
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What real limitation does the "key=value" line format have, that a production database format would need to solve?',
            options: [
              { id: 'a', text: 'It cannot store more than 100 entries.' },
              { id: 'b', text: 'A newline inside a value (or an "=" inside a key) would corrupt the file, since the format relies on one entry per line and splitting at the first "=".' },
              { id: 'c', text: 'HashMap cannot be written to a file at all.' },
              { id: 'd', text: 'It only works with numeric values, not strings.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'split_once(\'=\') safely handles a value containing "=" (it only splits at the first occurrence), but the format has no way to escape a literal newline inside a key or value — that would be silently read back as two separate lines.',
          },
          {
            id: 'q2',
            prompt: 'Why is load_from_file written as Store::load_from_file(path) — an associated function — instead of a method like store.load(path) that takes &mut self?',
            options: [
              { id: 'a', text: 'Rust does not allow methods to return Result.' },
              { id: 'b', text: 'Loading constructs a brand-new Store from a file\'s contents, so it needs no existing instance to operate on — it is a constructor, like Store::new(), not a mutation of one.' },
              { id: 'c', text: 'Associated functions run faster than methods.' },
              { id: 'd', text: 'There is no real difference; either form works identically.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'load_from_file produces a Store from scratch — there is no existing self to mutate, so it takes the shape of a constructor rather than an instance method, exactly like Store::new().',
          },
          {
            id: 'q3',
            prompt: 'Why does save_to_file take &self instead of &mut self?',
            options: [
              { id: 'a', text: 'Writing to disk requires exclusive (mutable) access to the Store.' },
              { id: 'b', text: 'Saving only reads the store\'s existing data — it never modifies the HashMap itself — so an immutable borrow is all that\'s needed.' },
              { id: 'c', text: '&self is required by the fs::File::create function.' },
              { id: 'd', text: 'Rust does not allow &mut self on functions that return Result.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'save_to_file iterates over &self.data and writes it out; it never inserts, removes, or changes any entry, so it only needs shared (&self) access, not exclusive (&mut self) access.',
          },
          {
            id: 'q4',
            prompt: 'What does the "version after delete" line print, and why?',
            options: [
              { id: 'a', text: '"1.0", because delete() only marks entries as deleted without removing them.' },
              { id: 'b', text: 'None, because delete("version") calls self.data.remove("version"), which actually removes the entry — a later get("version") finds nothing.' },
              { id: 'c', text: 'An error, because "version" no longer exists.' },
              { id: 'd', text: 'Some(""), because remove() replaces the value with an empty string.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'HashMap::remove fully removes the key, returning Option<String> of what was there. After that, get("version") has nothing to find and returns None, printed as "version after delete = None".',
          },
        ],
      },
    ],
  },

  'ri-proj-multithreaded-file-processor': {
    id: 'ri-proj-multithreaded-file-processor',
    heroSummary:
      "Split a batch of files across several OS threads with std::thread::spawn, process each chunk in parallel, and join every thread's result back into one total — your first hands-on use of real concurrency.",
    dependencyChain: {
      learned: 'Closures and iterator adapters (map, filter, sum) from the previous lesson.',
      why: 'Every program so far has run on a single OS thread — one instruction stream, using exactly one of your CPU cores no matter how many it has. The moment work is independent per item (counting words in unrelated files, say), splitting it across threads can use every core on the machine instead of just one.',
      build: 'Your first working use of std::thread::spawn and JoinHandle — the foundation the advanced concurrency chapter builds directly on top of.',
      next: 'The advanced concurrency chapter picks this up with shared mutable state (Arc<Mutex<T>>) for when threads need to cooperate on one shared value, instead of working on independent chunks like this project does.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Your first real OS threads',
        body: [
          "std::thread::spawn(closure) starts a brand-new operating-system thread that runs concurrently with the one that spawned it, and returns immediately with a JoinHandle<T> — a handle you can use later to wait for that thread and collect whatever value its closure returns.",
          "Calling handle.join() blocks the calling thread until the spawned thread finishes, then returns a Result<T, ...>: Ok(value) if the closure completed normally, or Err(...) if it panicked. Spawning a thread and never joining it doesn't stop that thread from running — it just means you never wait for it or retrieve its result.",
          'The closure passed to thread::spawn must be `move`: it needs to take full ownership of any data it captures (like a chunk of files), rather than borrowing it. A spawned thread can easily outlive the stack frame that created it, so the compiler will not let it hold a borrowed reference that might not survive that long.',
        ],
        bullets: [
          'Splitting files into chunks means each thread works on a disjoint slice of the input — no two threads ever touch the same file, so there is nothing to coordinate or lock.',
          "Because every thread's job is independent, the final sum does not depend on which thread happens to finish first — the total is the same no matter the order .join() calls complete in.",
        ],
      },
      {
        type: 'diagram',
        title: 'Splitting work across threads, then joining it back',
        description: 'Four files are split into two chunks; each chunk is handed to its own thread, and the results are summed once every thread reports back.',
        diagram: {
          title: 'Fan-out, then fan-in',
          height: 320,
          frames: [
            {
              caption: 'The list of files is split into two chunks, and each chunk is handed to its own spawned thread to count words in parallel.',
              nodes: [
                { id: 'files-header', label: 'INPUT', shape: 'ghost', tone: 'muted', x: 50, y: 6 },
                { id: 'files', label: 'files', sublabel: '4 files', tone: 'default', x: 50, y: 22 },
                { id: 'chunk1', label: 'Chunk 1', sublabel: '2 files', tone: 'accent', x: 25, y: 42 },
                { id: 'chunk2', label: 'Chunk 2', sublabel: '2 files', tone: 'accent', x: 75, y: 42 },
                { id: 'thread1', label: 'Thread 1', sublabel: 'counting words…', tone: 'accent', x: 25, y: 64 },
                { id: 'thread2', label: 'Thread 2', sublabel: 'counting words…', tone: 'accent', x: 75, y: 64 },
              ],
              edges: [
                { from: 'files', to: 'chunk1', tone: 'accent' },
                { from: 'files', to: 'chunk2', tone: 'accent' },
                { from: 'chunk1', to: 'thread1', label: 'spawn', tone: 'accent', animated: true },
                { from: 'chunk2', to: 'thread2', label: 'spawn', tone: 'accent', animated: true },
              ],
            },
            {
              caption: "Each thread finishes and hands its word count back through JoinHandle::join(), and the main thread sums both into the final total.",
              nodes: [
                { id: 'thread1', label: 'Thread 1', sublabel: 'returns 15', tone: 'success', x: 25, y: 30 },
                { id: 'thread2', label: 'Thread 2', sublabel: 'returns 19', tone: 'success', x: 75, y: 30 },
                { id: 'main', label: 'Main thread', sublabel: 'total = 34', tone: 'success', x: 50, y: 68 },
              ],
              edges: [
                { from: 'thread1', to: 'main', label: 'join()', tone: 'success', animated: true },
                { from: 'thread2', to: 'main', label: 'join()', tone: 'success', animated: true },
              ],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'See std::thread::spawn and JoinHandle in their simplest possible form.',
          'Split a Vec of files into roughly equal chunks.',
          'Spawn one thread per chunk, each counting words in its slice.',
          'Join every thread and sum their individual totals into one number.',
        ],
        steps: [
          {
            title: '1. A minimal spawn and join',
            description:
              'thread::spawn takes a closure, runs it on a new OS thread, and immediately returns a JoinHandle<T> where T is whatever the closure returns. .join() waits for that thread to finish and unwraps its Result to get the value back out.',
            code: `let handle = thread::spawn(|| {
    42
});
let result = handle.join().unwrap();
println!("thread returned {}", result); // thread returned 42`,
          },
          {
            title: '2. Split the files into chunks',
            description:
              "chunks(n) is a slice method that returns non-overlapping sub-slices of length n (the last one possibly shorter). Rounding chunk_size up (rather than down) guarantees every file ends up in exactly one chunk, even when the count doesn't divide evenly.",
            code: `let chunk_size = (files.len() + thread_count - 1) / thread_count;

for chunk in files.chunks(chunk_size) {
    // one chunk (a slice of the original Vec) per iteration
}`,
          },
          {
            title: '3. Spawn one thread per chunk',
            description:
              '.chunks() hands back a borrowed slice, but the spawned thread might outlive this function — so chunk.to_vec() makes an owned copy that move can hand fully over to the thread, satisfying thread::spawn\'s requirement that the closure not borrow anything short-lived.',
            code: `let chunk = chunk.to_vec(); // owned copy so the thread can take ownership
let handle = thread::spawn(move || {
    chunk.iter().map(|text| count_words(text)).sum::<usize>()
});
handles.push(handle);`,
          },
          {
            title: '4. Join every handle and sum the totals',
            description:
              'Collecting all the JoinHandles first (in the loop above) and only joining them afterward lets every thread run concurrently. Joining one immediately after spawning it would block until that thread finished before the next one even started, defeating the point of parallelism.',
            code: `let mut total = 0;
for handle in handles {
    total += handle.join().expect("thread panicked");
}
total`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete multithreaded file processor',
        description: 'Four in-memory "files" (plain strings, so the example is portable) are split across 2 threads, each counting words in its half — the totals always sum to 34, regardless of which thread finishes first.',
        language: 'rust',
        runnable: true,
        code: `use std::thread;

fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

fn process_in_parallel(files: Vec<String>, thread_count: usize) -> usize {
    let chunk_size = (files.len() + thread_count - 1) / thread_count;
    let mut handles = Vec::new();

    for chunk in files.chunks(chunk_size) {
        let chunk = chunk.to_vec(); // owned copy so the thread can take ownership
        let handle = thread::spawn(move || {
            chunk.iter().map(|text| count_words(text)).sum::<usize>()
        });
        handles.push(handle);
    }

    let mut total = 0;
    for handle in handles {
        total += handle.join().expect("thread panicked");
    }
    total
}

fn main() {
    let files = vec![
        "the quick brown fox jumps over the lazy dog".to_string(),
        "rust is fast and memory safe".to_string(),
        "threads let you use every core on the machine".to_string(),
        "joining collects each threads result back on the main thread".to_string(),
    ];

    let total_words = process_in_parallel(files, 2);
    println!("Total words across all files: {}", total_words);
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does the loop spawn every thread and push its handle into a Vec BEFORE joining any of them, instead of joining each thread right after spawning it?',
            options: [
              { id: 'a', text: 'Joining immediately would cause a compile error.' },
              { id: 'b', text: 'Joining right after spawning would block until that thread finished before the next one even started — collecting all handles first lets every thread run concurrently.' },
              { id: 'c', text: 'Vec<JoinHandle<T>> is the only type that supports .join().' },
              { id: 'd', text: 'It makes no difference to how the threads execute.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'join() blocks the calling thread. Calling it immediately after each spawn would serialize the work — spawn thread 1, wait for it, spawn thread 2, wait for it — which is no faster than not using threads at all.',
          },
          {
            id: 'q2',
            prompt: 'Why must the closure passed to thread::spawn use the move keyword?',
            options: [
              { id: 'a', text: 'move makes the closure run faster.' },
              { id: 'b', text: 'move forces the closure to take ownership of captured data (like chunk) instead of borrowing it — necessary because the spawned thread could outlive the stack frame that created it, so a borrowed reference cannot be guaranteed valid.' },
              { id: 'c', text: 'Without move, the code would not compile for an unrelated syntax reason.' },
              { id: 'd', text: 'move is only needed when spawning more than one thread.' },
            ],
            correctOptionIds: ['b'],
            explanation: "thread::spawn's closure has no way to prove to the compiler it will finish before its captured references would become invalid, so it requires 'static data — move ownership makes that guarantee by transferring the data itself into the thread.",
          },
          {
            id: 'q3',
            prompt: 'What does handle.join() return, and why does the code call .expect("thread panicked") on it?',
            options: [
              { id: 'a', text: 'It returns the count directly (usize) — .expect() is only decorative.' },
              { id: 'b', text: 'It returns Result<usize, Box<dyn Any + Send>> — Ok with the closure\'s return value if the thread finished normally, or Err if it panicked. .expect() unwraps the Ok case and panics with a message if the thread itself panicked.' },
              { id: 'c', text: 'It returns Option<usize>, and .expect() converts None into 0.' },
              { id: 'd', text: 'join() never fails, so .expect() is unreachable dead code.' },
            ],
            correctOptionIds: ['b'],
            explanation: "A spawned thread can panic independently of the main thread. join() surfaces that as an Err instead of silently losing the panic, and .expect() is how the main thread chooses to propagate that failure loudly rather than ignore it.",
          },
          {
            id: 'q4',
            prompt: 'Why call chunk.to_vec() to make an owned copy, instead of moving the borrowed slice from .chunks() straight into the thread?',
            options: [
              { id: 'a', text: '.chunks() returns borrowed slices (&[String]) tied to the original Vec\'s lifetime, but a spawned thread may outlive the function that owns that Vec — so the thread needs data it fully owns, not a reference into someone else\'s memory.' },
              { id: 'b', text: 'Slices cannot be used inside closures at all.' },
              { id: 'c', text: '.to_vec() is required syntax for every thread::spawn call.' },
              { id: 'd', text: 'It has no functional purpose here — it is purely a style choice.' },
            ],
            correctOptionIds: ['a'],
            explanation: "thread::spawn requires its closure's captures to be 'static (or fully owned) precisely because the thread's lifetime is not tied to the function that spawned it. .to_vec() clones the slice's data into a new, independently-owned Vec<String> that move can transfer wholesale.",
          },
        ],
      },
    ],
  },
}
