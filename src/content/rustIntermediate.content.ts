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
}
