import type { LessonContent } from '../types/lessonContent'

export const rustAdvancedContent: Record<string, LessonContent> = {
  // ---------------------------------------------------------------------
  // 7. Smart Pointers: Box, Rc, Arc, Cell & RefCell
  // ---------------------------------------------------------------------
  'ra-smart-pointers': {
    id: 'ra-smart-pointers',
    heroSummary:
      'One owner isn\'t always enough, and "immutable means immutable" isn\'t always what you need. Smart pointers let you opt into heap allocation, shared ownership, and controlled mutability — explicitly, safely, and without disabling the borrow checker.',
    dependencyChain: {
      learned: 'Ownership, moves, borrowing, and lifetimes — the default rules for exactly-one-owner and either-many-readers-or-one-writer.',
      why: 'Real programs sometimes need a value with multiple simultaneous owners, or mutation through a reference that looks immutable. Smart pointers are how Rust lets you ask for that, on purpose.',
      build: 'Box<T> for simple heap allocation, Rc<T>/Arc<T> for shared ownership via reference counting, and Cell<T>/RefCell<T> for interior mutability.',
      next: 'Arc<Mutex<T>> for sharing mutable state safely ACROSS THREADS — the concurrency chapter builds directly on Rc/RefCell\'s single-threaded version.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Why "just one owner" sometimes is not enough',
        body: [
          'Regular ownership works great when data has one clear owner. But some structures are genuinely shared — a node in a graph with multiple parents, a cache multiple parts of a program read from, a GUI widget tree where a child needs to notify its parent.',
          'Smart pointers are structs that behave like pointers (usually via the Deref trait) but carry extra behavior. This lesson covers four of the most common ones: Box<T> (plain heap allocation, single owner), Rc<T> (shared ownership via reference counting, single-threaded), Arc<T> (Rc\'s thread-safe sibling), and Cell<T>/RefCell<T> (mutating a value through what looks like an immutable reference — "interior mutability").',
        ],
      },
      {
        type: 'diagram',
        title: 'Box<T>: simple heap allocation',
        description: 'Box is the simplest smart pointer — one owner, one heap allocation, freed automatically when the Box is dropped.',
        diagram: {
          title: 'let b = Box::new(5);',
          frames: [
            {
              caption: '`let b = Box::new(5);` — `b` lives on the stack and is the sole owner of a value placed on the heap.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
                { id: 'b', label: 'b', sublabel: 'Box<i32>', tone: 'stack', x: 25, y: 40 },
                { id: 'heap-5', label: '5', sublabel: 'heap allocation', tone: 'heap', x: 75, y: 40 },
              ],
              edges: [{ from: 'b', to: 'heap-5', label: 'owns' }],
            },
            {
              caption: 'When `b` goes out of scope, Rust drops it — exactly one owner means exactly one, unambiguous deallocation.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 25, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
              ],
            },
          ],
        },
      },
      {
        type: 'diagram',
        title: 'Rc<T>: shared ownership via reference counting',
        description: 'Rc lets multiple stack variables share ownership of ONE heap allocation. Watch the reference count rise as clones are made, and fall as they go out of scope.',
        diagram: {
          title: 'Rc::clone and reference counting',
          height: 340,
          frames: [
            {
              caption: '`let a = Rc::new(String::from("data"));` — one heap allocation, ref count 1.',
              nodes: [
                { id: 'a', label: 'a', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 30 },
                { id: 'heap', label: '"data"', sublabel: 'ref count: 1', tone: 'heap', x: 70, y: 45 },
              ],
              edges: [{ from: 'a', to: 'heap', label: 'owns (shared)' }],
            },
            {
              caption: '`let b = Rc::clone(&a);` — `b` points at the SAME allocation. No new heap allocation is made; the count increments to 2.',
              nodes: [
                { id: 'a', label: 'a', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 18 },
                { id: 'b', label: 'b', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 55 },
                { id: 'heap', label: '"data"', sublabel: 'ref count: 2', tone: 'heap', x: 70, y: 36 },
              ],
              edges: [
                { from: 'a', to: 'heap', label: 'owns (shared)' },
                { from: 'b', to: 'heap', label: 'owns (shared)' },
              ],
            },
            {
              caption: '`let c = Rc::clone(&a);` — a third owner, count increments to 3. Still just one heap allocation.',
              nodes: [
                { id: 'a', label: 'a', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 12 },
                { id: 'b', label: 'b', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 45 },
                { id: 'c', label: 'c', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 78 },
                { id: 'heap', label: '"data"', sublabel: 'ref count: 3', tone: 'heap', x: 70, y: 45 },
              ],
              edges: [
                { from: 'a', to: 'heap', label: 'owns (shared)' },
                { from: 'b', to: 'heap', label: 'owns (shared)' },
                { from: 'c', to: 'heap', label: 'owns (shared)' },
              ],
            },
            {
              caption: '`c` goes out of scope — the count decrements to 2. The heap data is untouched; other owners remain.',
              nodes: [
                { id: 'a', label: 'a', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 18 },
                { id: 'b', label: 'b', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 55 },
                { id: 'heap', label: '"data"', sublabel: 'ref count: 2', tone: 'heap', x: 70, y: 36 },
              ],
              edges: [
                { from: 'a', to: 'heap', label: 'owns (shared)' },
                { from: 'b', to: 'heap', label: 'owns (shared)' },
              ],
            },
            {
              caption: '`b` goes out of scope — the count decrements to 1. `a` is now the sole remaining owner.',
              nodes: [
                { id: 'a', label: 'a', sublabel: 'Rc<String>', tone: 'stack', x: 20, y: 30 },
                { id: 'heap', label: '"data"', sublabel: 'ref count: 1', tone: 'heap', x: 70, y: 45 },
              ],
              edges: [{ from: 'a', to: 'heap', label: 'owns (shared)' }],
            },
            {
              caption: '`a` goes out of scope — the count hits 0, and only THEN does Rust actually free the heap allocation.',
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 20, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 70, y: 8 },
              ],
            },
          ],
        },
      },
      {
        type: 'compare',
        title: 'Which smart pointer do I reach for?',
        columns: [
          {
            heading: 'Box<T>',
            body: [
              'Single owner, heap-allocated.',
              'Use for: recursive types, large values you want on the heap, or trait objects (Box<dyn Trait>).',
              'No runtime overhead beyond the allocation itself.',
            ],
          },
          {
            heading: 'Rc<T>',
            body: [
              'Multiple owners, single-threaded, reference-counted.',
              'Use for: shared, read-mostly data within one thread (e.g. a shared config, a tree with shared child nodes).',
              'Cloning is cheap (just increments a counter) — no deep copy.',
            ],
          },
          {
            heading: 'Arc<T>',
            body: [
              "Rc's thread-safe twin — the reference count is updated atomically.",
              'Use for: sharing data across multiple threads.',
              'Slightly slower than Rc due to atomic operations — do not use it single-threaded when Rc would do.',
            ],
          },
          {
            heading: 'RefCell<T>',
            body: [
              'Interior mutability: mutate a value through what looks like an immutable reference.',
              'Borrowing rules are enforced at RUNTIME instead of compile time — .borrow() / .borrow_mut() panic on conflict.',
              'Commonly paired with Rc<T> as Rc<RefCell<T>> for shared, mutable, single-threaded state.',
            ],
          },
        ],
      },
      {
        type: 'code',
        title: 'Shared, mutable state with Rc<RefCell<T>>',
        description: 'Two independent handles to the SAME counter, both able to mutate it — Rc gives shared ownership, RefCell gives mutation through that shared, technically-immutable Rc.',
        code: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let counter = Rc::new(RefCell::new(0));

    let handle_a = Rc::clone(&counter);
    let handle_b = Rc::clone(&counter);

    *handle_a.borrow_mut() += 1;
    *handle_b.borrow_mut() += 1;
    *counter.borrow_mut() += 1;

    println!("final count = {}", counter.borrow());
    println!("outstanding handles = {}", Rc::strong_count(&counter));
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: A shared, mutable list',
        exercise: {
          problem:
            'Create a `Vec<i32>` shared through `Rc<RefCell<Vec<i32>>>`. Clone the Rc into two handles, `writer_one` and `writer_two`, and push `1` through the first handle and `2` then `3` through the second — all three pushes should land in the SAME underlying Vec.',
          starterCode: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let shared_list: Rc<RefCell<Vec<i32>>> = Rc::new(RefCell::new(Vec::new()));

    // TODO: clone \`shared_list\` into \`writer_one\` and \`writer_two\`, then push
    // 1 through writer_one, and 2 and 3 through writer_two.

    println!("list = {:?}", shared_list.borrow());
    println!("len = {}", shared_list.borrow().len());
}
`,
          hints: [
            { title: 'Cloning an Rc does not clone the Vec', body: '`Rc::clone(&shared_list)` gives you a second handle to the SAME RefCell<Vec<i32>> — it increments a reference count, it does not duplicate the list.' },
            { title: 'Mutating through RefCell', body: 'Call `.borrow_mut()` on the handle to get a mutable reference to the inner Vec, then call `.push(...)` on that.' },
            { title: 'Keep each borrow short-lived', body: 'Something like `writer_one.borrow_mut().push(1);` creates the mutable borrow, pushes, and releases it all in one statement — avoiding any risk of a runtime borrow panic.' },
          ],
          solutionCode: `use std::cell::RefCell;
use std::rc::Rc;

fn main() {
    let shared_list = Rc::new(RefCell::new(Vec::new()));

    let writer_one = Rc::clone(&shared_list);
    writer_one.borrow_mut().push(1);

    let writer_two = Rc::clone(&shared_list);
    writer_two.borrow_mut().push(2);
    writer_two.borrow_mut().push(3);

    println!("list = {:?}", shared_list.borrow());
    println!("len = {}", shared_list.borrow().len());
}
`,
          solutionExplanation:
            '`Rc::clone` gives `writer_one` and `writer_two` shared ownership of the exact same `RefCell<Vec<i32>>` — there is only ever one Vec. Each `.borrow_mut()` call takes a short-lived mutable borrow just long enough to push, then releases it, so the three pushes never overlap and never panic.',
          expectedOutputContains: ['list = [1, 2, 3]', 'len = 3'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does "interior mutability" mean?',
            options: [
              { id: 'a', text: 'Mutating a value through what the type system treats as an immutable reference, with the borrowing rules enforced at runtime instead' },
              { id: 'b', text: 'A special kind of mutable reference that can be cloned freely' },
              { id: 'c', text: 'A way to disable the borrow checker entirely with unsafe code' },
            ],
            correctOptionIds: ['a'],
            explanation: 'RefCell<T> moves the borrow-checking from compile time to runtime: you can call .borrow_mut() through a shared (&) reference to the RefCell, but if two mutable borrows ever overlap, it panics instead of failing to compile.',
          },
          {
            id: 'q2',
            prompt: 'What happens if you call .borrow_mut() on a RefCell<T> while another .borrow() (or .borrow_mut()) on it is still active?',
            options: [
              { id: 'a', text: 'It silently succeeds — RefCell allows this' },
              { id: 'b', text: 'It panics at runtime with a "already borrowed" message' },
              { id: 'c', text: 'It fails to compile' },
            ],
            correctOptionIds: ['b'],
            explanation: 'RefCell enforces the same "one writer XOR many readers" rule as ordinary references — just at runtime. Violating it panics rather than being caught by rustc.',
          },
          {
            id: 'q3',
            prompt: 'When should you use Arc<T> instead of Rc<T>?',
            options: [
              { id: 'a', text: 'Always — Arc is a strict improvement with no downsides' },
              { id: 'b', text: 'When the value needs to be shared across multiple threads; Arc uses atomic operations to update its reference count safely' },
              { id: 'c', text: 'Never — Arc is deprecated in favor of Rc' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Arc\'s atomic reference counting is exactly what makes it safe to share across threads — but that safety has a small performance cost, so Rc is preferred for single-threaded sharing.',
          },
          {
            id: 'q4',
            prompt: 'In the Rc<T> diagram, what actually happens to the heap allocation while the reference count is still above 0?',
            options: [
              { id: 'a', text: 'It gets copied every time a new owner clones the Rc' },
              { id: 'b', text: 'Nothing — it stays exactly where it is; only the count changes as owners are added or dropped' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Rc::clone never copies the underlying data — it only increments a counter and returns a new handle to the SAME allocation. The data is only freed once the count reaches 0.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 8. Shared State: Mutex, Atomics & Race Conditions
  // ---------------------------------------------------------------------
  'ra-mutex-atomics-shared-state': {
    id: 'ra-mutex-atomics-shared-state',
    heroSummary:
      'Multiple threads touching the same memory is where "safe by default" gets hard-won. Watch a Mutex serialize access to a shared counter step by step, see what a race condition looks like without one, and learn why atomics exist for the simplest cases.',
    dependencyChain: {
      learned: 'Rc<RefCell<T>> for shared, mutable state within a single thread.',
      why: "Rc and RefCell are explicitly NOT thread-safe. Sharing mutable state ACROSS threads needs Arc (thread-safe shared ownership) and Mutex (thread-safe exclusive access) instead.",
      build: 'Mutex<T> locking semantics, what a race condition looks like without one, atomics as a lock-free alternative for simple counters, and how deadlocks happen.',
      next: 'The Future/Poll/Waker state machine — async Rust\'s answer to "do work without blocking a thread while waiting."',
    },
    sections: [
      {
        type: 'explain',
        title: 'One writer at a time, enforced at runtime',
        body: [
          'A Mutex<T> ("mutual exclusion") wraps a value and guarantees that only one thread can access it at a time. A thread calls `.lock()`, which blocks until it acquires exclusive access, does its work, and then the lock is released automatically when the returned guard is dropped.',
          "Combined with Arc<T> for shared ownership across threads, Arc<Mutex<T>> is the standard pattern for a piece of state multiple threads need to read and write safely.",
        ],
      },
      {
        type: 'diagram',
        title: 'Three threads, one Mutex',
        description: 'Follow exactly what happens as three threads compete for the same lock to increment a shared counter — step through it frame by frame.',
        diagram: {
          title: 'Arc<Mutex<counter>> contended by 3 threads',
          height: 340,
          frames: [
            {
              caption: 'All three threads start. The Mutex is unlocked; the shared counter is 0.',
              nodes: [
                { id: 't1', label: 'Thread 1', tone: 'stack', x: 20, y: 15 },
                { id: 't2', label: 'Thread 2', tone: 'stack', x: 50, y: 15 },
                { id: 't3', label: 'Thread 3', tone: 'stack', x: 80, y: 15 },
                { id: 'mutex', label: 'Mutex', sublabel: 'unlocked · counter = 0', tone: 'default', x: 50, y: 65 },
              ],
            },
            {
              caption: 'Thread 1 calls lock() and acquires the mutex first.',
              nodes: [
                { id: 't1', label: 'Thread 1', tone: 'accent', x: 20, y: 15 },
                { id: 't2', label: 'Thread 2', tone: 'stack', x: 50, y: 15 },
                { id: 't3', label: 'Thread 3', tone: 'stack', x: 80, y: 15 },
                { id: 'mutex', label: 'Mutex', sublabel: 'locked by T1 · counter = 0', tone: 'accent', x: 50, y: 65 },
              ],
              edges: [{ from: 't1', to: 'mutex', label: 'lock()', tone: 'accent', animated: true }],
            },
            {
              caption: 'Threads 2 and 3 also try to lock — since T1 already holds it, they block and wait.',
              nodes: [
                { id: 't1', label: 'Thread 1', tone: 'accent', x: 20, y: 15 },
                { id: 't2', label: 'Thread 2', tone: 'muted', x: 50, y: 15 },
                { id: 't3', label: 'Thread 3', tone: 'muted', x: 80, y: 15 },
                { id: 'mutex', label: 'Mutex', sublabel: 'locked by T1 · counter = 0', tone: 'accent', x: 50, y: 65 },
              ],
              edges: [
                { from: 't1', to: 'mutex', label: 'holds lock', tone: 'accent' },
                { from: 't2', to: 'mutex', label: 'lock() [blocked]', tone: 'warning', dashed: true },
                { from: 't3', to: 'mutex', label: 'lock() [blocked]', tone: 'warning', dashed: true },
              ],
            },
            {
              caption: 'Thread 1 increments the counter, then drops its lock guard — the mutex unlocks automatically. T2 and T3 are still waiting.',
              nodes: [
                { id: 't1', label: 'Thread 1', tone: 'success', x: 20, y: 15 },
                { id: 't2', label: 'Thread 2', tone: 'muted', x: 50, y: 15 },
                { id: 't3', label: 'Thread 3', tone: 'muted', x: 80, y: 15 },
                { id: 'mutex', label: 'Mutex', sublabel: 'unlocked · counter = 1', tone: 'default', x: 50, y: 65 },
              ],
              edges: [
                { from: 't2', to: 'mutex', label: 'lock() [waiting]', tone: 'warning', dashed: true },
                { from: 't3', to: 'mutex', label: 'lock() [waiting]', tone: 'warning', dashed: true },
              ],
            },
            {
              caption: 'Thread 2 wins the race for the now-free lock and acquires it. T3 keeps waiting.',
              nodes: [
                { id: 't1', label: 'Thread 1', tone: 'stack', x: 20, y: 15 },
                { id: 't2', label: 'Thread 2', tone: 'accent', x: 50, y: 15 },
                { id: 't3', label: 'Thread 3', tone: 'muted', x: 80, y: 15 },
                { id: 'mutex', label: 'Mutex', sublabel: 'locked by T2 · counter = 1', tone: 'accent', x: 50, y: 65 },
              ],
              edges: [
                { from: 't2', to: 'mutex', label: 'lock()', tone: 'accent', animated: true },
                { from: 't3', to: 'mutex', label: 'lock() [blocked]', tone: 'warning', dashed: true },
              ],
            },
            {
              caption: 'Thread 2 increments and releases. Thread 3 finally acquires the lock, increments, and releases it too.',
              nodes: [
                { id: 't1', label: 'Thread 1', tone: 'stack', x: 20, y: 15 },
                { id: 't2', label: 'Thread 2', tone: 'success', x: 50, y: 15 },
                { id: 't3', label: 'Thread 3', tone: 'accent', x: 80, y: 15 },
                { id: 'mutex', label: 'Mutex', sublabel: 'locked by T3 · counter = 2', tone: 'accent', x: 50, y: 65 },
              ],
              edges: [{ from: 't3', to: 'mutex', label: 'lock()', tone: 'accent', animated: true }],
            },
            {
              caption: 'All three threads have run and finished. Final state: counter = 3, mutex unlocked — every increment was counted exactly once.',
              nodes: [
                { id: 't1', label: 'Thread 1', tone: 'success', x: 20, y: 15 },
                { id: 't2', label: 'Thread 2', tone: 'success', x: 50, y: 15 },
                { id: 't3', label: 'Thread 3', tone: 'success', x: 80, y: 15 },
                { id: 'mutex', label: 'Mutex', sublabel: 'unlocked · counter = 3', tone: 'success', x: 50, y: 65 },
              ],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'What would happen WITHOUT the mutex?',
        body: [
          'Imagine the increment is not one atomic step but two: "read the current value" then "write value + 1." Without a mutex serializing access, two threads can interleave those steps and silently lose an update:',
        ],
        bullets: [
          'Thread A reads counter (sees 5).',
          'Thread B reads counter (also sees 5) — before A has written anything back.',
          'Thread A computes 5 + 1 = 6 and writes 6.',
          'Thread B computes 5 + 1 = 6 (using its stale read) and writes 6.',
          'Result: two increments happened, but the counter only went from 5 to 6 — one increment vanished. This is a race condition, and it is exactly the bug class the Mutex in the diagram above prevents.',
        ],
        callout: {
          tone: 'danger',
          text: 'Race conditions are non-deterministic — the bug might not show up for thousands of runs, then appear under load in production. The Mutex above makes this class of bug impossible by construction, not by luck.',
        },
      },
      {
        type: 'code',
        title: 'Arc<Mutex<T>> across real threads',
        description: 'Three real OS threads, each incrementing a shared counter 1000 times through a Mutex. .join() waits for every thread to finish before reading the final value — deterministically 3000, every run.',
        code: `use std::sync::{Arc, Mutex};
use std::thread;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..3 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            for _ in 0..1000 {
                let mut num = counter.lock().unwrap();
                *num += 1;
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("final count = {}", *counter.lock().unwrap());
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'Atomics: lock-free for simple cases',
        body: [
          "For a single counter, a full Mutex is sometimes more machinery than necessary. Types like AtomicI32 / AtomicUsize (in std::sync::atomic) perform increments as a single, indivisible hardware-level operation — no lock, no blocking.",
          "`counter.fetch_add(1, Ordering::SeqCst)` is the atomic equivalent of the Mutex-protected increment above. Atomics are faster for simple counters, but they don't generalize: as soon as you need to update MULTIPLE related pieces of state consistently together, you need a Mutex (or equivalent) around all of them.",
        ],
      },
      {
        type: 'explain',
        title: 'Deadlocks: when locking order turns into a trap',
        body: [
          'A deadlock happens when two or more threads each hold a lock the other one needs, and neither can proceed. The classic case is circular lock ordering:',
        ],
        bullets: [
          'Thread A locks mutex_1, then tries to lock mutex_2.',
          'Thread B locks mutex_2, then tries to lock mutex_1.',
          'If both threads run this at the same time, A is stuck waiting for mutex_2 (held by B), and B is stuck waiting for mutex_1 (held by A) — forever.',
          'The standard fix: always acquire multiple locks in the SAME, consistent order everywhere in your codebase (e.g. always mutex_1 before mutex_2), so this circular wait can never form.',
        ],
        callout: {
          tone: 'warning',
          text: 'Unlike a race condition, a deadlock does not corrupt data — it just freezes forever. Rust\'s type system cannot catch deadlocks for you (they are a logic/design issue, not a memory-safety one), so consistent lock ordering is a discipline you have to maintain yourself.',
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does calling .lock() on a Mutex<T> do if another thread currently holds the lock?',
            options: [
              { id: 'a', text: 'It returns an error immediately' },
              { id: 'b', text: 'It blocks the calling thread until the lock becomes available' },
              { id: 'c', text: 'It silently proceeds anyway, ignoring the other lock' },
            ],
            correctOptionIds: ['b'],
            explanation: 'lock() blocks the calling thread until it can acquire exclusive access. This is exactly why T2 and T3 in the diagram had to wait while T1 held the lock.',
          },
          {
            id: 'q2',
            prompt: 'Why did Threads 2 and 3 need Arc, rather than Rc, to share the Mutex in the code example?',
            options: [
              { id: 'a', text: 'Arc looks nicer in code' },
              { id: 'b', text: 'Rc\'s reference count is not updated atomically, so sharing an Rc across real OS threads is not safe — Arc uses atomic operations specifically so multiple threads can clone/drop it concurrently without corrupting the count' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Rc is explicitly single-threaded (it does not implement Send/Sync). Arc exists specifically to make the reference-counting itself thread-safe.',
          },
          {
            id: 'q3',
            prompt: 'In the "no mutex" scenario described, why does an increment go missing?',
            options: [
              { id: 'a', text: 'Because addition of integers is inherently unreliable' },
              { id: 'b', text: 'Because two threads both read the same stale value before either writes back, so one thread\'s update overwrites the other\'s instead of building on it' },
            ],
            correctOptionIds: ['b'],
            explanation: 'This is the textbook race condition: "read, then write" is not one atomic step, so two threads can both read the same value and both compute the same +1, losing one of the increments.',
          },
          {
            id: 'q4',
            prompt: 'What causes a deadlock?',
            options: [
              { id: 'a', text: 'Too many threads reading the same immutable data at once' },
              { id: 'b', text: 'Two or more threads each waiting on a lock the other one already holds, with no way for either to proceed' },
              { id: 'c', text: 'Calling .lock() on a Mutex that was never initialized' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A deadlock is a circular wait: A needs what B has, B needs what A has. Consistent lock ordering across the codebase is the standard way to prevent it.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // 9. Futures, Executors & Polling
  // ---------------------------------------------------------------------
  'ra-futures-executors-polling': {
    id: 'ra-futures-executors-polling',
    heroSummary:
      'async/await is syntax sugar over a state machine: an executor repeatedly calls poll() on a future, which returns Pending (and registers a Waker to be notified later) until it can finally return Ready with a value. Once you can see this loop, "why does my future never complete" stops being mysterious.',
    dependencyChain: {
      learned: 'Threads, Arc<Mutex<T>>, and how OS threads share state — the "one task per thread" model of concurrency.',
      why: "Threads are relatively heavyweight — spawning thousands of them to wait on network requests doesn't scale. Futures let a single thread juggle many pending operations by cooperatively yielding instead of blocking.",
      build: 'The Future trait, the Poll enum (Pending / Ready), the executor loop that drives futures forward, and the Waker that lets a future say "I have made progress, poll me again."',
      next: 'async fn / .await syntax (which compiles down to exactly this state machine) and the Tokio runtime, which supplies a real, production-grade executor.',
    },
    sections: [
      {
        type: 'explain',
        title: 'A future is a value that is not ready yet',
        body: [
          "A Future in Rust is just a type implementing the Future trait, with one required method: poll(). Calling poll() either returns Poll::Ready(value) — the work is done — or Poll::Pending — not yet, try again later.",
          'Critically, a future does nothing on its own. Something has to actually call poll() repeatedly to drive it forward: that something is an executor (like Tokio\'s runtime). This is why async code needs a runtime — "just calling an async function" does not run anything by itself.',
          'The Waker is how a Pending future avoids being polled wastefully in a tight loop. When a future returns Pending, it registers a Waker with whatever it is waiting on (a socket, a timer). Once that thing is ready, IT calls the Waker, which tells the executor "poll this task again — it can make progress now."',
        ],
      },
      {
        type: 'diagram',
        title: 'The Future → Poll → Pending → Waker → Poll → Ready pipeline',
        description: 'This is the exact state machine every async fn compiles down to. Step through it to see how an executor, a future, and a waker cooperate.',
        diagram: {
          title: 'One async operation, start to finish',
          height: 340,
          frames: [
            {
              caption: 'The executor calls poll() on the future to make progress.',
              nodes: [
                { id: 'executor', label: 'Executor', tone: 'stack', x: 18, y: 50 },
                { id: 'future', label: 'Future', tone: 'default', x: 55, y: 22 },
                { id: 'waker', label: 'Waker', tone: 'muted', x: 88, y: 50 },
              ],
              edges: [{ from: 'executor', to: 'future', label: 'poll()', tone: 'accent', animated: true }],
            },
            {
              caption: "The future isn't ready yet — the awaited work (e.g. data hasn't arrived on a socket) hasn't finished, so it returns Poll::Pending.",
              nodes: [
                { id: 'executor', label: 'Executor', tone: 'stack', x: 18, y: 50 },
                { id: 'future', label: 'Future', tone: 'warning', x: 55, y: 22 },
                { id: 'waker', label: 'Waker', tone: 'muted', x: 88, y: 50 },
              ],
              edges: [{ from: 'future', to: 'executor', label: 'Pending', tone: 'warning', dashed: true }],
            },
            {
              caption: 'Before returning, the future registers its Waker with whatever it is waiting on, so it can be notified instead of being polled wastefully in a loop.',
              nodes: [
                { id: 'executor', label: 'Executor', tone: 'stack', x: 18, y: 50 },
                { id: 'future', label: 'Future', tone: 'warning', x: 55, y: 22 },
                { id: 'waker', label: 'Waker', tone: 'muted', x: 88, y: 50 },
              ],
              edges: [{ from: 'future', to: 'waker', label: 'register', dashed: true }],
            },
            {
              caption: 'Time passes. The awaited event completes — e.g. data arrives on the socket the future was waiting on.',
              nodes: [
                { id: 'executor', label: 'Executor', tone: 'stack', x: 18, y: 50 },
                { id: 'future', label: 'Future', tone: 'muted', x: 55, y: 22 },
                { id: 'waker', label: 'Waker', tone: 'accent', x: 88, y: 50 },
                { id: 'io', label: 'IO ready', tone: 'success', shape: 'pill', x: 88, y: 82 },
              ],
              edges: [{ from: 'io', to: 'waker', label: 'notify', tone: 'success', dashed: true }],
            },
            {
              caption: 'The Waker tells the executor: this task can make progress now — wake it up.',
              nodes: [
                { id: 'executor', label: 'Executor', tone: 'stack', x: 18, y: 50 },
                { id: 'future', label: 'Future', tone: 'muted', x: 55, y: 22 },
                { id: 'waker', label: 'Waker', tone: 'accent', x: 88, y: 50 },
              ],
              edges: [{ from: 'waker', to: 'executor', label: 'wake()', tone: 'accent', animated: true }],
            },
            {
              caption: 'The executor polls the future a second time, now that it has been woken.',
              nodes: [
                { id: 'executor', label: 'Executor', tone: 'stack', x: 18, y: 50 },
                { id: 'future', label: 'Future', tone: 'default', x: 55, y: 22 },
                { id: 'waker', label: 'Waker', tone: 'muted', x: 88, y: 50 },
              ],
              edges: [{ from: 'executor', to: 'future', label: 'poll()', tone: 'accent', animated: true }],
            },
            {
              caption: 'This time the future completes and returns Poll::Ready(42) — the async operation is done, and its value flows back to whoever was awaiting it.',
              nodes: [
                { id: 'executor', label: 'Executor', tone: 'stack', x: 18, y: 50 },
                { id: 'future', label: 'Future', tone: 'success', x: 55, y: 22 },
                { id: 'waker', label: 'Waker', tone: 'muted', x: 88, y: 50 },
              ],
              edges: [{ from: 'future', to: 'executor', label: 'Ready(42)', tone: 'success' }],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'How this connects to async/await',
        body: [
          'Writing `async fn` and using `.await` is syntax sugar for exactly the state machine above. The compiler transforms an async function into a struct implementing Future, where each `.await` point is a spot the generated poll() implementation can pause at and resume from.',
          'You still need an executor to actually drive that Future — that is the role Tokio plays in real projects: `#[tokio::main]` sets up a runtime (a pool of threads plus an executor loop) that repeatedly calls poll() on your top-level future, handles Wakers for you, and lets thousands of pending operations share a small number of OS threads efficiently.',
        ],
        bullets: [
          'async fn body → compiler-generated struct implementing Future',
          'Each .await → a point the generated poll() can suspend at and resume from',
          'Tokio (or another runtime) → the actual executor loop that calls poll() and manages Wakers',
        ],
      },
      {
        type: 'code',
        title: 'A hand-rolled poll loop (std-only, no runtime needed)',
        description: 'This is a simplified stand-in for the real Future trait, using plain std so it runs anywhere without a Cargo.toml or the tokio crate. It manually plays the role of a tiny executor, calling poll() in a loop until Ready.',
        code: `// A tiny, hand-rolled stand-in for \`std::future::Future\` and \`Poll\` so we
// can see the poll loop with plain std — no executor crate required.
enum SimplePoll {
    Ready(i32),
    Pending,
}

struct CountdownFuture {
    remaining_polls: u32,
}

impl CountdownFuture {
    fn poll(&mut self) -> SimplePoll {
        if self.remaining_polls == 0 {
            SimplePoll::Ready(42)
        } else {
            self.remaining_polls -= 1;
            SimplePoll::Pending
        }
    }
}

fn main() {
    let mut future = CountdownFuture { remaining_polls: 3 };

    // A tiny hand-written "executor": keep polling until Ready.
    loop {
        match future.poll() {
            SimplePoll::Pending => println!("poll -> Pending"),
            SimplePoll::Ready(value) => {
                println!("poll -> Ready({})", value);
                break;
            }
        }
    }
}
`,
        runnable: true,
      },
      {
        type: 'code',
        title: 'The real thing: async fn with Tokio',
        description:
          'This needs a real async runtime and the tokio crate — it cannot run on the bare Playground with std alone. To run it locally: add `tokio = { version = "1", features = ["full"] }` to Cargo.toml, then `cargo run`. Structurally, it mirrors the hand-rolled poll loop above: fetch_value() is an async fn (compiler-generated Future), and #[tokio::main] supplies the executor that drives it to completion.',
        code: `use std::time::Duration;

async fn fetch_value() -> i32 {
    // In real code this would be a non-blocking operation (network, timer, ...)
    // that returns Pending until the underlying IO completes.
    tokio::time::sleep(Duration::from_millis(10)).await;
    42
}

#[tokio::main]
async fn main() {
    let value = fetch_value().await;
    println!("got value = {}", value);
}
`,
        runnable: false,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does it mean for a future to return Poll::Pending?',
            options: [
              { id: 'a', text: 'The future has failed and will never complete' },
              { id: 'b', text: 'The future is not ready to produce its value yet, and should be polled again later (typically after registering a Waker)' },
              { id: 'c', text: 'The future has completed with no value' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Pending just means "not yet" — the future is a placeholder for a value that will exist later, and needs to be polled again to check on its progress.',
          },
          {
            id: 'q2',
            prompt: "What is an executor's job?",
            options: [
              { id: 'a', text: 'To compile async fn bodies into machine code' },
              { id: 'b', text: 'To repeatedly call poll() on futures (and manage Wakers) to actually drive them to completion' },
              { id: 'c', text: 'To allocate memory for Box<dyn Future>' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A future does nothing by itself. Something — the executor — has to call poll() on it, respond to Pending by waiting for a wake signal, and poll again. Tokio is the most common real-world executor.',
          },
          {
            id: 'q3',
            prompt: 'What is the purpose of the Waker?',
            options: [
              { id: 'a', text: 'It lets a Pending future notify the executor when it can make progress, instead of being polled wastefully over and over in a tight loop' },
              { id: 'b', text: 'It converts a Future into a thread' },
              { id: 'c', text: 'It stores the final Ready value for later retrieval' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Without a Waker, an executor would have no way to know WHEN to poll a pending future again except by busy-polling constantly — the Waker turns that into an efficient, event-driven notification.',
          },
          {
            id: 'q4',
            prompt: 'What does .await actually compile down to?',
            options: [
              { id: 'a', text: 'A blocking call that pauses the entire OS thread' },
              { id: 'b', text: 'A suspend/resume point inside the compiler-generated Future for the enclosing async fn — the generated poll() can pause there and pick back up later' },
            ],
            correctOptionIds: ['b'],
            explanation: '.await does not block the thread. It marks a point where the generated state machine can return Pending and later resume exactly where it left off, once the awaited future is Ready.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Deref, Drop, Trait Objects & Advanced Generics (added)
  // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
  // ra-deref-drop
  // ---------------------------------------------------------------------
  'ra-deref-drop': {
    id: 'ra-deref-drop',
    heroSummary:
      "Smart pointers feel like the values they wrap because of one trait, Deref, and they clean up after themselves because of another, Drop. This lesson opens up the machinery behind `*box_val` and behind every automatic deallocation you have been trusting all along.",
    dependencyChain: {
      learned: "Box<T>, Rc<T>, Arc<T>, and Cell<T>/RefCell<T> as ready-made tools for heap allocation, shared ownership, and interior mutability.",
      why: "None of those types are magic. They are ordinary structs whose pointer-like behavior comes from implementing two small, precise traits — and once you understand those traits, you can write your own smart pointers, and you stop being surprised by exactly when cleanup code runs.",
      build: "The Deref trait (what `*value` actually calls), deref coercion (how `&String` becomes `&str` for free), and the Drop trait (deterministic, scope-based cleanup — Rust's version of RAII).",
      next: "dyn Trait objects, which lean on Box's heap allocation to store values of different concrete types behind one shared pointer type.",
    },
    sections: [
      {
        type: 'explain',
        title: 'What `*value` actually calls',
        body: [
          "Writing `*box_val` looks like a built-in language feature, and for references it is — but for a smart pointer like Box<T>, Rc<T>, or a type you write yourself, the unary `*` operator is sugar for a trait method call. The Deref trait defines exactly one thing: `fn deref(&self) -> &Self::Target`. `*value` desugars to `*Deref::deref(&value)` — call deref to get an ordinary reference, then dereference that.",
          "This is why a Box<i32> lets you write `*b + 1`: Box implements Deref<Target = i32>, so `*b` calls `Box::deref`, gets back an `&i32`, and the outer `*` reads through it. DerefMut is the mutable sibling — `fn deref_mut(&mut self) -> &mut Self::Target` — and it's what lets `*b += 1` compile.",
          "The trait is deliberately narrow. It does not know anything about heap allocation, reference counting, or borrow tracking — those behaviors live in each type's own fields and methods. Deref only answers one question: 'if someone writes `*this`, what reference should they get back?'",
        ],
      },
      {
        type: 'code',
        title: 'A minimal smart pointer: implementing Deref and DerefMut',
        description:
          "MyBox<T> stores its value directly (no real heap allocation — the point is the trait, not the allocator). Implementing Deref makes `*m` work and enables deref coercion; implementing DerefMut makes `*m = ...` and `*n += 1` work too.",
        code: `use std::ops::{Deref, DerefMut};

struct MyBox<T>(T);

impl<T> MyBox<T> {
    fn new(x: T) -> MyBox<T> {
        MyBox(x)
    }
}

impl<T> Deref for MyBox<T> {
    type Target = T;

    fn deref(&self) -> &T {
        &self.0
    }
}

impl<T> DerefMut for MyBox<T> {
    fn deref_mut(&mut self) -> &mut T {
        &mut self.0
    }
}

fn hello(name: &str) {
    println!("Hello, {name}!");
}

fn main() {
    let m = MyBox::new(String::from("Rust"));

    // Deref coercion: &MyBox<String> -> &String -> &str, chained
    // automatically because the compiler follows Deref as far as it needs to.
    hello(&m);

    let mut n = MyBox::new(5);
    *n += 1; // uses DerefMut
    println!("n = {}", *n);
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'Following the Deref chain',
        description: "MyBox<T> does not allocate on the heap itself — it just wraps T inline. But when T is a String, the String still owns its own heap buffer. Watch what `hello(&m)` and `*n += 1` actually resolve to.",
        diagram: {
          title: 'Deref coercion and DerefMut in action',
          height: 340,
          frames: [
            {
              caption: "`let m = MyBox::new(String::from(\"Rust\"));` — `m` is a MyBox<String> holding a String, and that String owns a small heap buffer holding the actual bytes \"Rust\".",
              nodes: [
                { id: 'stack-header', label: 'STACK', shape: 'ghost', tone: 'muted', x: 22, y: 8 },
                { id: 'heap-header', label: 'HEAP', shape: 'ghost', tone: 'muted', x: 75, y: 8 },
                { id: 'm', label: 'm', sublabel: 'MyBox<String>', tone: 'stack', x: 22, y: 45 },
                { id: 'heap-buf', label: '"Rust"', sublabel: 'heap buffer', tone: 'heap', x: 75, y: 45 },
              ],
              edges: [{ from: 'm', to: 'heap-buf', label: 'owns (via inner String)' }],
            },
            {
              caption: "`hello(&m)` needs a &str. The compiler inserts two deref calls automatically: &MyBox<String> becomes &String via MyBox's Deref, then &String becomes &str via String's own Deref — no data is copied, both references point at the same heap buffer.",
              nodes: [
                { id: 'm2', label: '&m', sublabel: '&MyBox<String>', tone: 'stack', x: 15, y: 30 },
                { id: 'ref-string', label: '&String', sublabel: 'after 1st .deref()', tone: 'accent', x: 45, y: 30 },
                { id: 'ref-str', label: '&str', sublabel: 'after 2nd .deref()', tone: 'accent', x: 75, y: 30 },
                { id: 'heap-buf2', label: '"Rust"', sublabel: 'same heap buffer', tone: 'heap', x: 60, y: 70 },
              ],
              edges: [
                { from: 'm2', to: 'ref-string', label: '.deref()', tone: 'accent', animated: true },
                { from: 'ref-string', to: 'ref-str', label: '.deref()', tone: 'accent', animated: true },
                { from: 'ref-str', to: 'heap-buf2', label: 'points to' },
              ],
            },
            {
              caption: "`*n += 1` on a `MyBox<i32>` instead calls DerefMut::deref_mut to get an &mut i32, then mutates through it in place — the value inside `n` changes from 5 to 6.",
              nodes: [
                { id: 'n', label: 'n', sublabel: 'MyBox<i32> · value: 5', tone: 'stack', x: 30, y: 30 },
                { id: 'n-after', label: 'n', sublabel: 'MyBox<i32> · value: 6', tone: 'success', x: 70, y: 30 },
              ],
              edges: [{ from: 'n', to: 'n-after', label: '*n += 1 via deref_mut()', tone: 'success', animated: true }],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'Drop: cleanup tied to scope, not to memory',
        body: [
          "Drop is Rust's answer to RAII (Resource Acquisition Is Initialization): tie a cleanup action to a value's lifetime so it runs automatically, deterministically, exactly once — no garbage collector, no manual free() to forget.",
          "`impl Drop for T { fn drop(&mut self) { ... } }` gives you one hook, called the instant a value's scope ends (or when it's explicitly moved into `std::mem::drop`). You never call `.drop()` yourself with method syntax — the compiler calls it for you, and it deliberately refuses to let you call it directly, because doing so could leave a value that still exists (as far as the type system is concerned) but has already had its cleanup logic run — a recipe for a double drop.",
          "Local variables drop in the reverse of the order they were declared — last declared, first dropped — which mirrors how a stack unwinds. If a value's own Drop::drop needs to run cleanup for its fields too, its fields are then dropped, in the order they were declared.",
        ],
      },
      {
        type: 'code',
        title: 'Watching drop order',
        description: "Three values, each printing its own name when dropped. None of them are dropped until `main` ends — and then they go in reverse declaration order.",
        code: `struct Droplet {
    name: &'static str,
}

impl Drop for Droplet {
    fn drop(&mut self) {
        println!("dropping {}", self.name);
    }
}

fn main() {
    let _a = Droplet { name: "a" };
    let _b = Droplet { name: "b" };
    let _c = Droplet { name: "c" };

    println!("end of main reached");
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: Deref and Drop on the same type',
        exercise: {
          problem:
            "You're given a `Grams(f64)` newtype representing a weight. Implement `Deref` (with `Target = f64`) so a `&Grams` can be used anywhere a `&f64` is expected via deref coercion, and implement `Drop` so that dropping a `Grams` prints `\"recycling {value}g\"` using the weight it wrapped.",
          starterCode: `use std::ops::Deref;

struct Grams(f64);

// TODO: implement Deref for Grams so \`*g\` yields the inner f64, and so
// &Grams coerces to &f64 wherever a &f64 is expected.


// TODO: implement Drop for Grams so dropping it prints
// "recycling {value}g" using the value it wrapped.


fn print_weight(w: &f64) {
    println!("weight = {w}g");
}

fn main() {
    let g = Grams(42.5);
    print_weight(&g); // relies on deref coercion: &Grams -> &f64
    println!("doubled = {}", *g * 2.0);
}
`,
          hints: [
            {
              title: 'Deref only needs a Target and one method',
              body: "`type Target = f64;` and `fn deref(&self) -> &f64 { &self.0 }` are all Deref requires. Once that's in place, `&g` coerces to `&f64` automatically wherever a &f64 is expected.",
            },
            {
              title: "Drop::drop takes &mut self, not self",
              body: "The signature is `fn drop(&mut self)`, never `fn drop(self)` — Rust needs to still own the value while your cleanup code runs, and it drops the value's fields itself right after your `drop` returns.",
            },
            {
              title: '`*g` goes through your Deref impl',
              body: "`*g * 2.0` first calls your `deref()` to get an `&f64`, dereferences that to an `f64`, and only then multiplies — it is not special syntax, it is your trait impl being invoked.",
            },
          ],
          solutionCode: `use std::ops::Deref;

struct Grams(f64);

impl Deref for Grams {
    type Target = f64;

    fn deref(&self) -> &f64 {
        &self.0
    }
}

impl Drop for Grams {
    fn drop(&mut self) {
        println!("recycling {}g", self.0);
    }
}

fn print_weight(w: &f64) {
    println!("weight = {w}g");
}

fn main() {
    let g = Grams(42.5);
    print_weight(&g);
    println!("doubled = {}", *g * 2.0);
}
`,
          solutionExplanation:
            "`Deref<Target = f64>` is what lets `&g` (a &Grams) coerce into the &f64 that `print_weight` expects, and lets `*g` yield the inner f64 for the multiplication. `Drop::drop` then runs automatically when `g` goes out of scope at the end of `main` — after both println! calls have already executed — printing the recycling message last.",
          expectedOutputContains: ['weight = 42.5g', 'doubled = 85', 'recycling 42.5g'],
        },
      },
      {
        type: 'debug',
        title: 'Debug: why does `a.drop()` refuse to compile?',
        challenge: {
          problem: "This code tries to force `a`'s cleanup early by calling `.drop()` on it directly. It won't compile. Find out why, and fix it.",
          brokenCode: `struct Droplet {
    name: &'static str,
}

impl Drop for Droplet {
    fn drop(&mut self) {
        println!("dropping {}", self.name);
    }
}

fn main() {
    let a = Droplet { name: "a" };
    let b = Droplet { name: "b" };

    a.drop(); // want to force cleanup of \`a\` early
    println!("a is gone, b still alive");
}
`,
          bugExplanation:
            "Rust specifically forbids calling `Drop::drop` with method-call syntax (`value.drop()`) — this is compiler error E0040, 'explicit use of destructor method'. If it were allowed, `a` would still be a live, usable variable after its cleanup logic had already run once, and it would then get dropped a SECOND time automatically at the end of scope — a double drop. Instead, use the free function `std::mem::drop` (available in the prelude as just `drop`), which takes its argument BY VALUE. Passing `a` to `drop(a)` moves `a` into the function, which immediately lets it go out of scope there — running Drop::drop exactly once — and the move means `a` can never be referenced (and therefore never auto-dropped) back in `main` again.",
          hints: [
            { title: 'Read the exact compiler error', body: "rustc reports error[E0040]: explicit use of destructor method — it is telling you `.drop()` as a method call is specifically disallowed, not just discouraged." },
            { title: "There's a free function for this", body: "`std::mem::drop` (aliased as `drop` in the prelude) takes ownership of a value and drops it immediately — that's the sanctioned way to force early cleanup." },
            { title: 'Ownership is the mechanism', body: "`drop(a)` moves `a` by value into the function. Because it's moved, `a` cannot be used (or auto-dropped) again later — there is no way to end up with two drops." },
          ],
          fixedCode: `struct Droplet {
    name: &'static str,
}

impl Drop for Droplet {
    fn drop(&mut self) {
        println!("dropping {}", self.name);
    }
}

fn main() {
    let a = Droplet { name: "a" };
    let b = Droplet { name: "b" };

    drop(a); // force cleanup of \`a\` early, via the free function
    println!("a is gone, b still alive");
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
            prompt: "What does the expression `*y` actually do when `y` is a type with a custom Deref impl?",
            options: [
              { id: 'a', text: 'It calls Deref::deref(&y) to get back an ordinary reference, then dereferences that reference' },
              { id: 'b', text: 'It copies the wrapped value out of y directly, with no trait method involved' },
              { id: 'c', text: 'It only works for types defined in the standard library, never for custom types' },
            ],
            correctOptionIds: ['a'],
            explanation: '`*y` desugars to `*Deref::deref(&y)` — deref() hands back a `&Target`, and the outer `*` reads through that reference. Any type, including your own, gets this behavior by implementing Deref.',
          },
          {
            id: 'q2',
            prompt: 'What is "deref coercion"?',
            options: [
              { id: 'a', text: 'The compiler automatically inserting one or more .deref() calls when passing a reference where a different, but Deref-reachable, reference type is expected' },
              { id: 'b', text: 'A way to bypass the borrow checker for smart pointers' },
              { id: 'c', text: 'An unsafe operation that must be wrapped in an unsafe block' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Deref coercion is purely a compile-time convenience: at a call site expecting &U, the compiler follows the Deref chain from &T as many steps as needed (e.g. &MyBox<String> -> &String -> &str) to find a match.',
          },
          {
            id: 'q3',
            prompt: 'Why does Rust forbid calling `value.drop()` directly?',
            options: [
              { id: 'a', text: "Because it would leave a value the compiler still considers alive and usable, but whose cleanup logic has already run once — risking a double drop when it's dropped again automatically" },
              { id: 'b', text: 'Because Drop::drop is a private trait method, inaccessible from outside its own module' },
              { id: 'c', text: "It's actually allowed — .drop() is just discouraged, deprecated syntax" },
            ],
            correctOptionIds: ['a'],
            explanation: "This is enforced by the compiler (error E0040), not just a style rule. `std::mem::drop` is the sanctioned way to force early cleanup, because it takes ownership by value and prevents any later use.",
          },
          {
            id: 'q4',
            prompt: "In what order do a function's local variables get dropped when it returns, assuming none were moved out early?",
            options: [
              { id: 'a', text: 'In the reverse of the order they were declared' },
              { id: 'b', text: 'In the same order they were declared' },
              { id: 'c', text: 'In an unspecified, compiler-chosen order' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Drop order mirrors stack unwinding: the last variable declared is the first one dropped. This is a guaranteed, documented part of the language — not an implementation detail you can\'t rely on.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ra-trait-objects-dispatch
  // ---------------------------------------------------------------------
  'ra-trait-objects-dispatch': {
    id: 'ra-trait-objects-dispatch',
    heroSummary:
      "Generic code with impl Trait resolves to concrete types at compile time — zero overhead, one specialized copy per type. dyn Trait defers that resolution to runtime through a vtable, trading a small indirection for the ability to hold many different concrete types behind one shared interface.",
    dependencyChain: {
      learned: 'Box<T> for single-owner heap allocation, Deref for pointer-like access, and writing generic functions with trait bounds like `fn f<T: Trait>(x: T)`.',
      why: "A Vec<T> forces every element to be the exact same concrete type. Storing 'anything that implements this trait' — a genuine mix of different concrete types in one collection, or behind one return type — needs a different mechanism: dynamic dispatch through a trait object.",
      build: 'The distinction between static dispatch (generics, monomorphized at compile time) and dynamic dispatch (dyn Trait, resolved at runtime via a vtable), Box<dyn Trait> as the standard owned trait object, and the object-safety rules that decide which traits can become dyn Trait at all.',
      next: "Associated types and PhantomData — the type-level tools for encoding relationships and state directly into the type system, often as an alternative to reaching for dyn Trait.",
    },
    sections: [
      {
        type: 'explain',
        title: 'Two ways to call a trait method',
        body: [
          "`fn f<T: Shape>(x: &T)` and `fn f(x: &dyn Shape)` both let the body call `x.area()`. They compile to completely different machine code, though. The generic version is monomorphized: for every concrete type it's ever called with, the compiler generates a fresh, specialized copy of `f` with the call to `area()` inlined or resolved directly at compile time. This is static dispatch — no runtime cost beyond what a hand-written, type-specific function would already have.",
          "`dyn Shape` takes the opposite approach. Instead of generating one copy per type, there is exactly ONE `f`, and it calls `area()` by following a pointer to a table of function pointers — a vtable — chosen based on whatever concrete type happens to be behind the trait object at runtime. That's dynamic dispatch: one shared function, one extra pointer indirection per call, and the flexibility to not know (or care) the concrete type until runtime.",
          "Neither is strictly better. Static dispatch is the default and should stay the default when you know the concrete type(s) up front. Reach for `dyn Trait` when you genuinely need heterogeneity — a single Vec, field, or return type that has to hold DIFFERENT concrete types implementing the same trait.",
        ],
      },
      {
        type: 'code',
        title: 'Static dispatch vs. dynamic dispatch, side by side',
        description: "`print_area<T: Shape>` is monomorphized once per concrete type it's called with. `Vec<Box<dyn Shape>>` holds a Circle and a Square in the SAME collection — only possible because the concrete type is erased behind a shared vtable-backed pointer.",
        code: `trait Shape {
    fn area(&self) -> f64;
    fn name(&self) -> &str;
}

struct Circle { radius: f64 }
struct Square { side: f64 }

impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
    fn name(&self) -> &str { "circle" }
}

impl Shape for Square {
    fn area(&self) -> f64 { self.side * self.side }
    fn name(&self) -> &str { "square" }
}

// Static dispatch: the compiler generates a separate, specialized copy
// of print_area for every concrete type it's called with.
fn print_area<T: Shape>(shape: &T) {
    println!("{} area = {:.2}", shape.name(), shape.area());
}

fn main() {
    let c = Circle { radius: 2.0 };
    let s = Square { side: 3.0 };
    print_area(&c);
    print_area(&s);

    // Dynamic dispatch: one Vec holding DIFFERENT concrete types behind
    // a shared interface, because Box<dyn Shape> erases the concrete
    // type and calls through a vtable at runtime.
    let shapes: Vec<Box<dyn Shape>> = vec![
        Box::new(Circle { radius: 2.0 }),
        Box::new(Square { side: 3.0 }),
    ];
    let total: f64 = shapes.iter().map(|s| s.area()).sum();
    println!("total area = {:.2}", total);
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'Box<dyn Shape> as a fat pointer',
        description: "A Box<dyn Shape> is two words wide instead of one: a data pointer to the heap-allocated concrete value, and a vtable pointer to a static table of function pointers for THAT concrete type. Swapping the concrete type behind the box only changes which vtable it points at.",
        diagram: {
          title: 'Fat pointers and vtable dispatch',
          height: 340,
          frames: [
            {
              caption: 'A Box<dyn Shape> holding a Circle is a fat pointer: a data pointer to the Circle on the heap, and a vtable pointer to Circle\'s vtable — a fixed table of function pointers for area, name, and the drop glue.',
              nodes: [
                { id: 'fatptr', label: 'Box<dyn Shape>', sublabel: 'data ptr + vtable ptr', tone: 'stack', x: 20, y: 45 },
                { id: 'heap-circle', label: 'Circle { radius: 2.0 }', tone: 'heap', x: 72, y: 20 },
                { id: 'vtable-circle', label: 'Circle vtable', sublabel: 'area, name, drop fn ptrs', tone: 'accent', x: 72, y: 70 },
              ],
              edges: [
                { from: 'fatptr', to: 'heap-circle', label: 'data ptr' },
                { from: 'fatptr', to: 'vtable-circle', label: 'vtable ptr' },
              ],
            },
            {
              caption: 'Calling shape.area() follows the vtable pointer to find WHICH concrete area function to run, then calls it with the data pointer — one extra indirection compared to a statically-known call.',
              nodes: [
                { id: 'fatptr2', label: 'Box<dyn Shape>', sublabel: 'data ptr + vtable ptr', tone: 'stack', x: 20, y: 45 },
                { id: 'heap-circle2', label: 'Circle { radius: 2.0 }', tone: 'heap', x: 78, y: 15 },
                { id: 'vtable-circle2', label: 'Circle vtable', sublabel: "1. look up 'area'", tone: 'accent', x: 50, y: 70 },
              ],
              edges: [
                { from: 'fatptr2', to: 'vtable-circle2', label: '1. vtable ptr', tone: 'accent', animated: true },
                { from: 'vtable-circle2', to: 'heap-circle2', label: '2. call Circle::area on data', tone: 'accent', animated: true },
              ],
            },
            {
              caption: "Swap in a Square instead: same Box<dyn Shape> type, same two-word layout — but now the data pointer targets a Square and the vtable pointer targets Square's vtable. This is exactly how one Vec<Box<dyn Shape>> holds different concrete types.",
              nodes: [
                { id: 'fatptr3', label: 'Box<dyn Shape>', sublabel: 'data ptr + vtable ptr', tone: 'stack', x: 20, y: 45 },
                { id: 'heap-square', label: 'Square { side: 3.0 }', tone: 'heap', x: 72, y: 20 },
                { id: 'vtable-square', label: 'Square vtable', sublabel: 'area, name, drop fn ptrs', tone: 'accent', x: 72, y: 70 },
              ],
              edges: [
                { from: 'fatptr3', to: 'heap-square', label: 'data ptr' },
                { from: 'fatptr3', to: 'vtable-square', label: 'vtable ptr' },
              ],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: 'Object safety: not every trait can become `dyn Trait`',
        body: [
          "A trait must be 'object safe' to be used as `dyn Trait`. The rules all come from the same underlying constraint: a vtable has to be a fixed, finite table of function pointers, built once, that works no matter what concrete type ends up behind it — which rules out anything that would need a DIFFERENT vtable shape depending on the concrete type.",
          "Two common violations: a method with its OWN generic type parameter (`fn process<U>(&self, x: U)`) would need a fresh vtable entry for every possible U — impossible to enumerate ahead of time. And a method that returns `Self` by value (`fn duplicate(&self) -> Self`) would need the vtable to know the concrete return type's exact size at the call site — but the whole point of `dyn Trait` is that the concrete type is unknown at that point.",
          "Rust's own standard library shows the pattern: `Clone::clone(&self) -> Self` is why `Clone` is NOT object safe (`Box<dyn Clone>` doesn't compile), while `Iterator` (whose methods take/return `Self` only where `Self: Sized` is required) mostly is.",
        ],
      },
      {
        type: 'code',
        title: 'Two ways to make a trait not object-safe',
        description: "Both traits below compile fine on their own — the failure only shows up the moment you try to write `Box<dyn Cloneable>` or `Box<dyn Spawn>`.",
        code: `// NOT object-safe: a generic method needs a fresh vtable entry for
// every possible T, which can't be enumerated once and for all.
trait Cloneable {
    fn clone_into<T>(&self, target: &mut T);
}

// NOT object-safe either: returning \`Self\` by value requires the
// caller to know the concrete return type's size up front — but a
// dyn Trait caller never knows the concrete type.
trait Spawn {
    fn spawn_default() -> Self;
}

fn main() {
    // Neither of the following compiles:
    // let x: Box<dyn Cloneable> = ...;  // error[E0038]: method has generic type parameters
    // let y: Box<dyn Spawn> = ...;      // error[E0038]: associated function has no \`self\`/returns Self
    println!("Cloneable and Spawn compile as traits — dyn Cloneable / dyn Spawn do not.");
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: A Vec of different greeters',
        exercise: {
          problem:
            "Define a trait `Greet` with one method `fn greeting(&self) -> String`. Implement it for unit-like structs `English` (returns \"Hello!\") and `French` (returns \"Bonjour!\"). Fill in the TODO to build a `Vec<Box<dyn Greet>>` holding one of each, and print every greeting, one per line.",
          starterCode: `trait Greet {
    fn greeting(&self) -> String;
}

struct English;
struct French;

impl Greet for English {
    fn greeting(&self) -> String {
        String::from("Hello!")
    }
}

impl Greet for French {
    fn greeting(&self) -> String {
        String::from("Bonjour!")
    }
}

fn main() {
    // TODO: build a Vec<Box<dyn Greet>> holding one English and one
    // French, then print each greeting on its own line.
}
`,
          hints: [
            { title: 'Two different types, one Vec', body: 'English and French are different concrete types — a plain Vec<English> or Vec<French> could never hold both. Box<dyn Greet> erases the concrete type behind a shared interface so both fit in the same collection.' },
            { title: "Annotate the Vec's element type", body: 'Write `let greeters: Vec<Box<dyn Greet>> = vec![...]` so the compiler stores trait objects rather than trying to infer one single concrete element type.' },
            { title: 'Box::new each element', body: 'Wrap each value individually: `Box::new(English)`, `Box::new(French)`.' },
          ],
          solutionCode: `trait Greet {
    fn greeting(&self) -> String;
}

struct English;
struct French;

impl Greet for English {
    fn greeting(&self) -> String {
        String::from("Hello!")
    }
}

impl Greet for French {
    fn greeting(&self) -> String {
        String::from("Bonjour!")
    }
}

fn main() {
    let greeters: Vec<Box<dyn Greet>> = vec![Box::new(English), Box::new(French)];

    for greeter in &greeters {
        println!("{}", greeter.greeting());
    }
}
`,
          solutionExplanation:
            "`Vec<Box<dyn Greet>>` can hold English and French in the same collection because both are erased behind the same fat-pointer type. Iterating and calling `.greeting()` dispatches through each element's own vtable at runtime, calling English's implementation for the first and French's for the second.",
          expectedOutputContains: ['Hello!', 'Bonjour!'],
        },
      },
      {
        type: 'debug',
        title: "Debug: why won't `Vec<dyn Shape>` compile?",
        challenge: {
          problem: "This code tries to store trait objects directly in a Vec without a Box. It fails to compile before it even gets to main. Find the error and fix it.",
          brokenCode: `trait Shape {
    fn area(&self) -> f64;
}

struct Circle { radius: f64 }
impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
}

fn biggest(shapes: Vec<dyn Shape>) -> f64 {
    shapes.iter().map(|s| s.area()).fold(0.0, f64::max)
}

fn main() {
    let shapes = vec![Circle { radius: 2.0 }];
    println!("{}", biggest(shapes));
}
`,
          bugExplanation:
            "`dyn Shape` is unsized — Circle, Square, and every other implementor can have a different size, so `dyn Shape` itself has no single, fixed size known at compile time. `Vec<T>` (like almost every generic type) requires `T: Sized`, so `Vec<dyn Shape>` fails with error E0277: 'the size for values of type `dyn Shape` cannot be known at compilation time'. The same restriction is why `dyn Shape` can never appear as a plain function parameter or return type either — a trait object always has to sit behind SOME pointer with a known, fixed size: `Box<dyn Shape>`, `&dyn Shape`, `Rc<dyn Shape>`, and so on.",
          hints: [
            { title: 'Read the size error carefully', body: "rustc reports 'the size for values of type `dyn Shape` cannot be known at compilation time' — that phrase is your direct pointer to the fix." },
            { title: 'Trait objects are unsized', body: 'Different implementors of Shape have different sizes, so dyn Shape alone has none. Anything that holds a trait object needs an extra layer of indirection with a fixed size of its own.' },
            { title: 'Reach for Box<dyn Trait>', body: 'Wrap each element with Box::new(...) and change the Vec\'s (and the function parameter\'s) type to Vec<Box<dyn Shape>>.' },
          ],
          fixedCode: `trait Shape {
    fn area(&self) -> f64;
}

struct Circle { radius: f64 }
impl Shape for Circle {
    fn area(&self) -> f64 { std::f64::consts::PI * self.radius * self.radius }
}

fn biggest(shapes: Vec<Box<dyn Shape>>) -> f64 {
    shapes.iter().map(|s| s.area()).fold(0.0, f64::max)
}

fn main() {
    let shapes: Vec<Box<dyn Shape>> = vec![Box::new(Circle { radius: 2.0 })];
    println!("{}", biggest(shapes));
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
            prompt: "What's the key difference between static dispatch (generics / impl Trait) and dynamic dispatch (dyn Trait)?",
            options: [
              { id: 'a', text: 'Static dispatch resolves which function to call at compile time, generating a specialized copy per type; dynamic dispatch resolves it at runtime through a vtable lookup' },
              { id: 'b', text: 'Static dispatch is slower because it duplicates code for every type it is used with' },
              { id: 'c', text: 'Dynamic dispatch is always faster because it avoids compiling generic code multiple times' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Monomorphization (static dispatch) trades compile-time code duplication for zero runtime dispatch cost. dyn Trait keeps one shared function body but pays a small per-call vtable indirection.',
          },
          {
            id: 'q2',
            prompt: "Why is Box<dyn Shape> sometimes called a 'fat pointer'?",
            options: [
              { id: 'a', text: 'It stores two words: a pointer to the heap data and a pointer to a vtable of function pointers for the concrete type' },
              { id: 'b', text: 'It allocates twice as much heap memory as a plain Box<T>' },
              { id: 'c', text: 'It can only be used for structs larger than a machine word' },
            ],
            correctOptionIds: ['a'],
            explanation: 'A regular Box<T> is one pointer. Box<dyn Trait> is two: the data pointer plus a vtable pointer, since the concrete type (and therefore which functions to call) is erased.',
          },
          {
            id: 'q3',
            prompt: 'Which of the following would make a trait NOT object-safe (unable to write Box<dyn TraitName>)? Select all that apply.',
            options: [
              { id: 'a', text: 'A method with its own generic type parameter, like fn process<T>(&self, x: T)' },
              { id: 'b', text: 'A method that returns Self by value, like fn duplicate(&self) -> Self' },
              { id: 'c', text: 'A method that only takes &self and returns a plain value, like fn area(&self) -> f64' },
            ],
            correctOptionIds: ['a', 'b'],
            multi: true,
            explanation: 'A vtable is a fixed table built once; a generic method would need unbounded entries per T, and a Self-returning method would need the vtable to know the concrete return size — neither is possible without knowing the concrete type ahead of time. A plain &self method with an ordinary return type is exactly what a vtable entry CAN represent.',
          },
          {
            id: 'q4',
            prompt: "Why can't `dyn Shape` be used directly as a function parameter type, as in `fn use_shape(s: dyn Shape)`?",
            options: [
              { id: 'a', text: 'dyn Shape is unsized — different implementors have different sizes, so it must be accessed through a pointer like &dyn Shape or Box<dyn Shape>' },
              { id: 'b', text: 'dyn Shape can only ever be used as a return type, never as a parameter' },
              { id: 'c', text: 'You would need to write `impl Shape` instead, which means the same thing' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Every function parameter needs a compile-time-known size unless explicitly opted out of. dyn Shape has no fixed size, so it must sit behind a pointer type that does.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ra-advanced-generics
  // ---------------------------------------------------------------------
  'ra-advanced-generics': {
    id: 'ra-advanced-generics',
    heroSummary:
      "Associated types, higher-ranked trait bounds, and PhantomData are the generics features that show up constantly in library and framework code — including Tauri's own command and state APIs — for encoding precise, compiler-checked contracts between types.",
    dependencyChain: {
      learned: 'dyn Trait vs. static dispatch, Box<dyn Trait> as an owned trait object, and the object-safety rules that decide which traits can be erased at runtime.',
      why: "Not every relationship between types should be erased at runtime, and not every generic parameter is really about holding many different types. Associated types let a trait fix one specific type per implementor at COMPILE time; higher-ranked trait bounds describe a closure that must work for every possible lifetime, not one fixed one; PhantomData lets you track ownership and state information the compiler enforces but that costs nothing at runtime.",
      build: 'Associated types vs. generic trait parameters, `for<\'a>` higher-ranked trait bounds, PhantomData<T>, and the type-state pattern for compile-time-only state machines.',
      next: 'Macros — the tool for generating the repetitive trait impls and boilerplate that associated-type and type-state patterns tend to produce by hand.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Associated types vs. generic trait parameters',
        body: [
          "A trait can relate itself to another type in two different ways: as a generic parameter (`trait Container<T>`) or as an associated type (`trait Container { type Item; }`). Both let a trait talk about 'some other type' — but they answer a different question. Can one struct implement this trait for MANY different T at once (generic parameter)? Or does each implementor have exactly ONE type that makes sense to pair with it (associated type)?",
          "std::iter::Iterator is the canonical associated-type trait: `trait Iterator { type Item; fn next(&mut self) -> Option<Self::Item>; }`. A Counter only ever produces one kind of item — there's no reason, and no clean way, to implement `Iterator<u32>` AND `Iterator<String>` for the same Counter. Associated types make that a compile-time fact: you pick `Item` exactly once, in the `impl` block, and every function that's generic over `Self: Iterator` can just write `Self::Item` without threading an extra type parameter through everywhere.",
          "Generic type parameters earn their keep exactly when a single type genuinely needs to support many different T's at once — Vec<T> is a container, and you want Vec<i32> and Vec<String> to coexist as legitimately different types built from the same definition. Forcing that relationship to be an associated type would mean picking ONE element type for the whole program.",
        ],
      },
      {
        type: 'code',
        title: 'A Sequence trait with an associated Item, contrasted with a generic parameter',
        description: 'Counter implements Sequence exactly once, fixing Item = u32 for good. GenericContainer<T>, by contrast, is designed so one type COULD implement it for several different T — that flexibility is the whole point of a generic parameter, and it is unavailable to associated types on purpose.',
        code: `// Associated type: exactly ONE Item per implementor.
trait Sequence {
    type Item;
    fn next_item(&mut self) -> Option<Self::Item>;
}

struct Counter {
    count: u32,
    max: u32,
}

impl Sequence for Counter {
    type Item = u32;

    fn next_item(&mut self) -> Option<u32> {
        if self.count < self.max {
            self.count += 1;
            Some(self.count)
        } else {
            None
        }
    }
}

// Contrast: a generic trait parameter lets ONE type implement the
// trait for MANY different T's. Useful when that's actually desired —
// but it means every caller has to carry the T parameter along too.
trait GenericContainer<T> {
    fn get_item(&self, index: usize) -> Option<&T>;
}

impl GenericContainer<u32> for Vec<u32> {
    fn get_item(&self, index: usize) -> Option<&u32> {
        self.get(index)
    }
}

fn main() {
    let mut counter = Counter { count: 0, max: 3 };
    while let Some(n) = counter.next_item() {
        println!("counter produced {n}");
    }

    let nums = vec![10u32, 20, 30];
    println!("nums.get_item(1) = {:?}", nums.get_item(1));
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'One Item per impl vs. many T per impl',
        description: 'The practical rule for choosing between an associated type and a generic parameter, shown as two different relationships between a type and a trait.',
        diagram: {
          title: 'Associated type vs. generic parameter',
          height: 320,
          frames: [
            {
              caption: 'Counter implements Sequence exactly once, and that single impl fixes Item = u32 for good — there is no Item type parameter to juggle at every call site that uses Counter as a Sequence.',
              nodes: [
                { id: 'counter', label: 'Counter', sublabel: 'struct', tone: 'default', x: 22, y: 45 },
                { id: 'sequence', label: 'Sequence', sublabel: 'trait { type Item; }', tone: 'accent', x: 60, y: 20 },
                { id: 'item', label: 'Item = u32', sublabel: 'fixed by the one impl', tone: 'success', x: 60, y: 70 },
              ],
              edges: [
                { from: 'counter', to: 'sequence', label: 'impl Sequence for Counter' },
                { from: 'sequence', to: 'item', label: 'binds' },
              ],
            },
            {
              caption: 'A generic trait parameter allows the reverse: the SAME type could implement GenericContainer<u32> and GenericContainer<String> at once — useful when you truly want that, but every function using the trait now has to carry the T parameter along too.',
              nodes: [
                { id: 'sometype', label: 'SomeType', sublabel: 'struct', tone: 'default', x: 22, y: 45 },
                { id: 'gc-u32', label: 'GenericContainer<u32>', tone: 'accent', x: 68, y: 20 },
                { id: 'gc-string', label: 'GenericContainer<String>', tone: 'accent', x: 68, y: 70 },
              ],
              edges: [
                { from: 'sometype', to: 'gc-u32', label: 'impl #1' },
                { from: 'sometype', to: 'gc-string', label: 'impl #2' },
              ],
            },
            {
              caption: 'The practical rule: reach for an associated type when there is exactly one sensible Item per implementor, like Iterator or Sequence. Reach for a generic parameter when a single type legitimately needs to work with many different T at once, like Vec or HashMap.',
              nodes: [
                { id: 'assoc', label: 'Associated type', sublabel: 'one Item per impl', tone: 'success', x: 25, y: 45 },
                { id: 'generic', label: 'Generic parameter', sublabel: 'many T per impl', tone: 'accent', x: 75, y: 45 },
              ],
            },
          ],
        },
      },
      {
        type: 'explain',
        title: "Higher-ranked trait bounds: 'for any lifetime', not one fixed lifetime",
        body: [
          "Some trait bounds need to hold not for one specific lifetime, but for EVERY possible lifetime a caller might use. That's what `for<'a> Fn(&'a str) -> &'a str` means, and the technique is called a higher-ranked trait bound (HRTB).",
          "Compare it to a bound written with an ordinary, named lifetime parameter of the enclosing function, like `F: Fn(&'b str) -> &'b str` where `'b` is one of that function's own generic lifetimes. That bound only ever gets instantiated with ONE lifetime, chosen once by the function's caller. If the function needs to call `f` with a borrow of something whose lifetime can't be named as one of ITS OWN lifetime parameters — a local variable created inside the function body, for instance — a fixed `'b` cannot describe that, because the local doesn't live as long as anything the caller could have picked.",
          "`for<'a>` sidesteps the problem entirely: it makes no commitment to any specific lifetime. It says 'however short-lived the borrow is, at the moment you call me, I can handle it.' In practice you rarely write `for<'a>` by hand for simple cases — `Fn(&str) -> &str` already implies it via lifetime elision — but it's worth recognizing, because it's exactly what's happening under the hood, and you do need to write it explicitly once a `where` clause needs to name the bound.",
        ],
      },
      {
        type: 'code',
        title: 'Why a plain lifetime parameter is not enough',
        description: "`owned` is created inside `make_temp_and_call` — its lifetime ends at the close of the function and could never be named as one of the function's own generic lifetime parameters. Only a bound that works for ANY lifetime can accept a closure being called this way.",
        code: `// F: for<'a> Fn(&'a str) -> &'a str reads as: "for ANY lifetime 'a,
// F can be called with a &'a str and hands back a &'a str borrowed
// from that same call" -- not one fixed lifetime chosen in advance.
fn make_temp_and_call<F>(f: F)
where
    F: for<'a> Fn(&'a str) -> &'a str,
{
    let owned = String::from("borrowed just for this call");

    // \`owned\` is local: its lifetime ends at the close of this function
    // and could never be named as one of make_temp_and_call's OWN
    // generic lifetime parameters. A plain Fn(&'b str) -> &'b str bound
    // (with 'b fixed once, from outside) could not accept a closure
    // called like this. The higher-ranked bound can, because it makes
    // no commitment to any specific lifetime at all.
    println!("{}", f(owned.as_str()));
}

fn main() {
    make_temp_and_call(|s| s);
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'PhantomData and the type-state pattern',
        body: [
          "PhantomData<T> is a zero-sized marker: it tells the compiler 'this type behaves as if it owns or relates to a T' without actually storing one. It occupies no space at runtime — it exists purely so the type checker can track a relationship (ownership, variance, or in this case, a STATE) that has no data of its own.",
          "The type-state pattern uses that trick to encode a value's state directly in its TYPE. `Door<Closed>` and `Door<Open>` are different types as far as rustc is concerned, even though the struct definition is identical — so methods that only make sense in one state (`unlock` on a closed door, `walk_through` on an open one) simply don't exist on the wrong type. Invalid transitions become compile errors instead of runtime panics, and because PhantomData and the marker structs (`Open`, `Closed`) are never actually constructed with real data, all of this costs nothing at runtime — it's pure compile-time bookkeeping.",
          "This is exactly the shape of Tauri's and many Rust builder APIs: a value moves through a sequence of `.with_x()` / `.build()` calls where each step is only legal in a specific state, and the type system — not a runtime check — is what stops you from calling `.build()` too early or `.run()` twice.",
        ],
      },
      {
        type: 'code',
        title: 'A door that only unlocks in the right order',
        description: 'Door<Closed> and Door<Open> are different types built from the same generic struct. `open` and `close` consume `self` and return the OTHER state — the compiler enforces that you can only call `walk_through` once the door is actually open.',
        code: `use std::marker::PhantomData;

struct Open;
struct Closed;

struct Door<State> {
    _marker: PhantomData<State>,
}

impl Door<Closed> {
    fn new() -> Door<Closed> {
        Door { _marker: PhantomData }
    }

    fn open(self) -> Door<Open> {
        println!("opening the door");
        Door { _marker: PhantomData }
    }
}

impl Door<Open> {
    fn close(self) -> Door<Closed> {
        println!("closing the door");
        Door { _marker: PhantomData }
    }

    fn walk_through(&self) {
        println!("walking through the open door");
    }
}

fn main() {
    let door = Door::<Closed>::new();
    let door = door.open();
    door.walk_through();
    let door = door.close();

    // door.walk_through(); // would not compile: Door<Closed> has no
    //                          walk_through method. The type system
    //                          enforces the state machine at compile time.
    let _ = door;
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: A type-state file handle',
        exercise: {
          problem:
            "Build a minimal type-state file handle using `File<Locked>` and `File<Unlocked>`, distinguished by PhantomData markers `Locked` and `Unlocked`. Add an `unlock(self) -> File<Unlocked>` method on `File<Locked>` that prints `\"unlocking {name}\"`, and a `read(&self)` method on `File<Unlocked>` that prints `\"reading {name}\"`.",
          starterCode: `use std::marker::PhantomData;

struct Locked;
struct Unlocked;

struct File<State> {
    name: String,
    _marker: PhantomData<State>,
}

impl File<Locked> {
    fn new(name: &str) -> File<Locked> {
        File { name: name.to_string(), _marker: PhantomData }
    }

    // TODO: add fn unlock(self) -> File<Unlocked> that prints
    // "unlocking {name}" and returns a File<Unlocked> with the same name.
}

impl File<Unlocked> {
    // TODO: add fn read(&self) that prints "reading {name}".
}

fn main() {
    let file = File::<Locked>::new("report.txt");
    let file = file.unlock();
    file.read();
}
`,
          hints: [
            { title: 'unlock consumes self, not &self', body: 'Transitioning state changes the TYPE (File<Locked> -> File<Unlocked>), so the old value must be consumed by value — take `self`, not `&self`, and return a brand new File<Unlocked>.' },
            { title: 'Reuse the name field', body: 'Build the returned File<Unlocked> from `self.name` (moved out of the consumed File<Locked>) plus a fresh `PhantomData`.' },
            { title: 'read only needs &self', body: "Reading doesn't change state, so it can borrow rather than consume — `fn read(&self)` printing `self.name` is enough." },
          ],
          solutionCode: `use std::marker::PhantomData;

struct Locked;
struct Unlocked;

struct File<State> {
    name: String,
    _marker: PhantomData<State>,
}

impl File<Locked> {
    fn new(name: &str) -> File<Locked> {
        File { name: name.to_string(), _marker: PhantomData }
    }

    fn unlock(self) -> File<Unlocked> {
        println!("unlocking {}", self.name);
        File { name: self.name, _marker: PhantomData }
    }
}

impl File<Unlocked> {
    fn read(&self) {
        println!("reading {}", self.name);
    }
}

fn main() {
    let file = File::<Locked>::new("report.txt");
    let file = file.unlock();
    file.read();
}
`,
          solutionExplanation:
            "`unlock` takes `self` by value because unlocking changes the file's TYPE from File<Locked> to File<Unlocked> — the old, locked value is consumed and can never be used again, so there is no way to accidentally read a still-locked file. `read` only needs `&self` because reading doesn't change the state further. The PhantomData markers make all of this compile-time-only: no bytes are spent tracking Locked vs. Unlocked at runtime.",
          expectedOutputContains: ['unlocking report.txt', 'reading report.txt'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: "When should a trait use an associated type (`type Item;`) rather than a generic type parameter (`Container<T>`)?",
            options: [
              { id: 'a', text: 'When each implementor has exactly one sensible type to pair with the trait — like Iterator, where a given type only ever produces one kind of item' },
              { id: 'b', text: 'Always — associated types are a strict improvement over generic parameters in every case' },
              { id: 'c', text: 'Only when the associated type needs to implement Copy' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Associated types fix a relationship once per implementor. Generic parameters exist precisely for the opposite case — a single type that legitimately needs to work with many different type arguments, like Vec<T>.',
          },
          {
            id: 'q2',
            prompt: "What does the bound `F: for<'a> Fn(&'a str) -> &'a str` express that `F: Fn(&'b str) -> &'b str` (with 'b a named lifetime parameter of the enclosing function) cannot?",
            options: [
              { id: 'a', text: 'That F must work for EVERY possible lifetime, including ones shorter than anything nameable in the enclosing function\'s own signature, like a local variable\'s borrow' },
              { id: 'b', text: 'That F must be called exactly once, never more' },
              { id: 'c', text: 'That F only accepts \'static string slices' },
            ],
            correctOptionIds: ['a'],
            explanation: "A named lifetime parameter is fixed once by the caller. for<'a> makes no commitment to any single lifetime, so it also covers borrows of values (like a function-local String) that could never be described by one of the function's own lifetime parameters.",
          },
          {
            id: 'q3',
            prompt: "What does PhantomData<T> contribute to a struct's size at runtime?",
            options: [
              { id: 'a', text: "Nothing — it's zero-sized; it exists purely so the compiler tracks a relationship with T at compile time" },
              { id: 'b', text: 'Exactly the size of a T value, since it behaves like an embedded T' },
              { id: 'c', text: 'The size of one pointer, since it behaves like a reference to T' },
            ],
            correctOptionIds: ['a'],
            explanation: 'PhantomData<T> is a zero-sized type. It never allocates and adds nothing to the size of the struct it appears in — its only job is to give the type checker something to reason about.',
          },
          {
            id: 'q4',
            prompt: 'In the Door<Closed>/Door<Open> example, why does `door.walk_through()` fail to compile when `door: Door<Closed>`?',
            options: [
              { id: 'a', text: 'walk_through is defined only in impl Door<Open> — Door<Closed> and Door<Open> are different, unrelated types, so a Door<Closed> value simply has no such method' },
              { id: 'b', text: 'walk_through requires unsafe code to call' },
              { id: 'c', text: 'PhantomData blocks all method calls on any struct that contains it' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Door<Closed> and Door<Open> are two distinct instantiations of the same generic struct, and methods are attached per-instantiation via separate impl blocks — there is no method-lookup fallback between them.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Threads, Channels & Thread Pools (added)
  // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
  // Threads & Thread Ownership
  // ---------------------------------------------------------------------
  'ra-threads-ownership': {
    id: 'ra-threads-ownership',
    heroSummary:
      "std::thread::spawn hands a closure to a brand-new OS thread — and because that thread might outlive the stack frame that spawned it, ownership rules do not relax at the boundary, they get stricter. This lesson covers spawning threads, why captured data must be moved in, and getting a value back out with JoinHandle::join().",
    dependencyChain: {
      learned: 'Ownership, moves, and smart pointers like Box, Rc and RefCell for sharing and mutating data within a single thread.',
      why: 'Real programs do real work concurrently. Spawning an OS thread is the foundation everything else in this chapter — channels, mutexes, thread pools — is built on top of.',
      build: 'std::thread::spawn, why its closure must be `move`, and JoinHandle::join() to wait for a thread and collect its return value.',
      next: 'Channels (mpsc) — passing data between threads by moving it through a queue, instead of sharing memory directly.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Spawning a thread',
        body: [
          "std::thread::spawn(f) asks the operating system for a new thread of execution and hands it a closure, f, to run. The new thread starts running immediately and independently — the OS scheduler decides how the spawning thread and the new thread interleave, and you should not assume any particular order between them.",
          "spawn returns a JoinHandle<T> immediately, without waiting for the new thread to do anything. T is whatever type the closure evaluates to when it finishes — the last expression in the closure body becomes the thread's return value, exactly like a function.",
        ],
        bullets: [
          'thread::spawn takes one argument: a closure implementing FnOnce() -> T.',
          'That closure also has to satisfy Send + \'static — safe to hand to another thread, and not borrowing anything that could go away before the thread finishes.',
          'The calling thread keeps running past the spawn call — spawning does not block.',
        ],
      },
      {
        type: 'explain',
        title: 'Why the closure usually needs `move`',
        body: [
          "A closure that references a variable from its environment without `move` captures the minimum it needs — often just a borrow (&T or &mut T). Borrows are tied to the lifetime of the stack frame that owns the data.",
          "thread::spawn cannot make that guarantee: the spawned thread is a genuinely separate stack that can keep running after the function that called spawn returns (and its local variables are dropped). If the closure only borrowed a local variable, that borrow could dangle. So thread::spawn requires its closure to be 'static — no non-'static borrows allowed — and the idiomatic way to satisfy that is the `move` keyword, which transfers ownership of every captured variable INTO the closure instead of borrowing it.",
          'Once a variable has been moved into a `move` closure passed to another thread, the thread that called spawn can no longer use it — ownership genuinely left.',
        ],
        callout: {
          tone: 'accent',
          text: "'move' does not mean 'copy'. It means the closure now owns the data outright, and the original binding in the spawning thread is no longer valid to use.",
        },
      },
      {
        type: 'diagram',
        title: 'From spawn to join',
        description: 'Watch ownership of a value move into a spawned thread, both threads run concurrently, and the spawning thread block on join() until it gets a result back.',
        diagram: {
          title: 'thread::spawn(move || ...) and handle.join()',
          height: 340,
          frames: [
            {
              caption: '`let data = vec![1, 2, 3];` — before any thread exists, `data` is an ordinary local variable, owned by main\'s stack frame.',
              nodes: [
                { id: 'main', label: 'main thread', sublabel: 'owns `data: Vec<i32>`', tone: 'stack', x: 30, y: 35 },
              ],
            },
            {
              caption: '`thread::spawn(move || { ... data ... })` — the `move` keyword transfers ownership of `data` into the closure. The spawned thread now owns it; main cannot use `data` anymore.',
              nodes: [
                { id: 'main', label: 'main thread', sublabel: 'no longer owns `data`', tone: 'stack', x: 25, y: 15 },
                { id: 'moved-data', label: 'data', sublabel: 'moved out', tone: 'muted', invalid: true, x: 25, y: 55 },
                { id: 'child', label: 'spawned thread', sublabel: 'now owns `data`', tone: 'accent', x: 75, y: 15 },
                { id: 'new-data', label: 'data', sublabel: 'owned here now', tone: 'stack', x: 75, y: 55 },
              ],
              edges: [{ from: 'child', to: 'new-data', label: 'owns', tone: 'accent' }],
            },
            {
              caption: 'Both threads now run concurrently. Main continues past the spawn call immediately — it does NOT wait for the spawned thread to do anything.',
              nodes: [
                { id: 'main', label: 'main thread', sublabel: 'continues running', tone: 'stack', x: 25, y: 15 },
                { id: 'child', label: 'spawned thread', sublabel: 'computing sum(data)', tone: 'accent', x: 75, y: 15 },
              ],
            },
            {
              caption: '`handle.join()` blocks main until the spawned thread finishes. If the spawned thread is still working, main simply waits here.',
              nodes: [
                { id: 'main', label: 'main thread', sublabel: 'blocked on join()', tone: 'muted', x: 25, y: 15 },
                { id: 'child', label: 'spawned thread', sublabel: 'still computing', tone: 'accent', x: 75, y: 15 },
              ],
              edges: [{ from: 'main', to: 'child', label: 'join() [waiting]', tone: 'warning', dashed: true }],
            },
            {
              caption: 'The spawned thread finishes; its last expression\'s value becomes the thread\'s return value. join() unblocks and hands it back wrapped in Ok(value).',
              nodes: [
                { id: 'main', label: 'main thread', sublabel: 'resumed with the result', tone: 'success', x: 25, y: 15 },
                { id: 'child', label: 'spawned thread', sublabel: 'finished · returned 6', tone: 'success', x: 75, y: 15 },
              ],
              edges: [{ from: 'child', to: 'main', label: 'returns via join()', tone: 'success', animated: true }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Spawn, run concurrently, join for a value',
        description: 'The spawned thread takes ownership of `data`, computes a sum, and returns it. Main keeps running in the meantime, then blocks on join() to collect the result.',
        code: `use std::thread;

fn main() {
    let data = vec![1, 2, 3];

    let handle = thread::spawn(move || {
        let sum: i32 = data.iter().sum();
        println!("spawned thread finished summing");
        sum
    });

    println!("main thread keeps running while the spawned thread works");

    let result = handle.join().unwrap();
    println!("result received on main thread: {result}");
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'What join() actually gives you',
        body: [
          "JoinHandle<T>::join() returns Result<T, Box<dyn Any + Send + 'static>>, not T directly. Ok(value) means the thread ran to completion and returned value. Err(e) means the thread panicked — the panic payload is captured in e instead of being allowed to crash the whole process.",
          '.unwrap() on that Result is common in examples (and panics the CALLING thread if the spawned thread panicked), but production code often matches on the Result explicitly to decide how to recover from a worker thread panicking.',
          "If you never call .join() on a handle, the spawned thread is not stopped — it keeps running independently (it is sometimes called 'detached'). The only guarantee you lose is knowing when it finished or what it returned; if main exits first, the whole process (and every thread in it) terminates regardless.",
        ],
      },
      {
        type: 'debug',
        title: 'Debug: "closure may outlive the current function"',
        challenge: {
          problem: 'This code tries to print a String from a spawned thread. It fails to compile. Find the bug and fix it.',
          brokenCode: `use std::thread;

fn main() {
    let message = String::from("hello from main");

    let handle = thread::spawn(|| {
        println!("{message}");
    });

    handle.join().unwrap();
}
`,
          bugExplanation:
            "thread::spawn requires its closure to satisfy F: FnOnce() + Send + 'static — in particular, it must not borrow anything whose lifetime is tied to the current stack frame, because the spawned thread can keep running after that stack frame is gone. Since this closure has no `move`, Rust captures `message` in the smallest way that satisfies println! — by reference (&message). A reference to a local variable cannot outlive the function it lives in, and the compiler cannot prove it outlives the spawned thread, so it rejects the program with E0373: \"closure may outlive the current function, but it borrows `message`, which is owned by the current function,\" and suggests adding `move`.",
          hints: [
            { title: 'Look at what thread::spawn actually requires', body: "Its signature needs F: FnOnce() + Send + 'static. That 'static bound is the whole story here — nothing the closure captures is allowed to be a borrow of something that could disappear." },
            { title: 'What is this closure actually capturing?', body: 'Without `move`, the closure captures only what it needs — here, a shared reference to `message`, since that is all println! requires. That reference is tied to main\'s stack frame.' },
            { title: 'The fix rustc itself suggests', body: 'Add the `move` keyword before the closure\'s parameter list. That transfers ownership of `message` into the closure, so it no longer borrows anything from main — satisfying the \'static bound.' },
          ],
          fixedCode: `use std::thread;

fn main() {
    let message = String::from("hello from main");

    let handle = thread::spawn(move || {
        println!("{message}");
    });

    handle.join().unwrap();
}
`,
        },
      },
      {
        type: 'exercise',
        title: 'Exercise: Sum chunks in parallel',
        exercise: {
          problem:
            'Given three chunks of numbers, spawn one thread PER chunk. Each thread should take ownership of its chunk, sum it, and return the sum as the closure\'s final expression. Back in main, join every handle, add up all three returned sums, and print the total.',
          starterCode: `use std::thread;

fn main() {
    let chunks: Vec<Vec<i32>> = vec![vec![1, 2, 3], vec![4, 5, 6], vec![7, 8, 9]];
    let mut handles = Vec::new();

    // TODO: for each chunk in 'chunks', spawn a thread that moves the chunk
    // in, sums it with chunk.iter().sum::<i32>(), and returns that sum.
    // Push each JoinHandle into 'handles'.

    let mut total = 0;
    // TODO: join every handle in 'handles', unwrap the result, and add it
    // to 'total'.

    println!("total = {total}");
}
`,
          hints: [
            { title: 'Moving the loop variable in', body: '`for chunk in chunks { ... }` takes ownership of each Vec<i32> one at a time — pass `chunk` straight into a `move` closure inside the loop body.' },
            { title: 'The closure\'s return value', body: 'A closure\'s last expression (no semicolon) is its return value. `chunk.iter().sum::<i32>()` as the last line of the closure makes that sum the thread\'s result.' },
            { title: 'Order does not matter here', body: 'Because you sum the results with += after joining, it does not matter which thread actually finishes first — join() on handles[0] just waits for THAT thread specifically, regardless of what order the threads run in.' },
          ],
          solutionCode: `use std::thread;

fn main() {
    let chunks: Vec<Vec<i32>> = vec![vec![1, 2, 3], vec![4, 5, 6], vec![7, 8, 9]];
    let mut handles = Vec::new();

    for chunk in chunks {
        let handle = thread::spawn(move || chunk.iter().sum::<i32>());
        handles.push(handle);
    }

    let mut total = 0;
    for handle in handles {
        total += handle.join().unwrap();
    }

    println!("total = {total}");
}
`,
          solutionExplanation:
            'Each chunk is moved into its own thread by value, so there is no shared mutable state and nothing to synchronize — every thread owns its own data outright. Joining each handle blocks until that SPECIFIC thread finishes and hands back its sum; because the final total is just an accumulation of three independent numbers, the order the three threads actually run in never affects the printed result.',
          expectedOutputContains: ['total = 45'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does a closure passed to thread::spawn usually need the `move` keyword?',
            options: [
              { id: 'a', text: 'move makes the closure run faster' },
              { id: 'b', text: 'The spawned thread can outlive the stack frame that called spawn, so any captured variable must be OWNED by the closure rather than borrowed from a frame that might disappear' },
              { id: 'c', text: 'move is only needed when the closure captures more than one variable' },
            ],
            correctOptionIds: ['b'],
            explanation: "thread::spawn's closure must be 'static — it cannot hold a borrow tied to a stack frame that could be gone before the thread finishes. `move` transfers ownership in, sidestepping that entirely.",
          },
          {
            id: 'q2',
            prompt: 'What does JoinHandle<T>::join() return?',
            options: [
              { id: 'a', text: 'T directly' },
              { id: 'b', text: "Result<T, Box<dyn Any + Send + 'static>> — Ok(value) if the thread finished normally, Err(payload) if it panicked" },
              { id: 'c', text: 'Nothing — join() only blocks, it does not return a value' },
            ],
            correctOptionIds: ['b'],
            explanation: "join() gives you a Result so a panic inside the spawned thread doesn't silently vanish or crash your whole process — it's reported back as an Err you can handle.",
          },
          {
            id: 'q3',
            prompt: 'If you never call .join() on a JoinHandle, what happens to the spawned thread?',
            options: [
              { id: 'a', text: 'It is immediately killed since nothing is waiting for it' },
              { id: 'b', text: 'It keeps running independently in the background — you just lose the ability to know when it finishes or collect its return value' },
              { id: 'c', text: 'The program refuses to compile' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Not joining a handle does not stop the thread — it simply runs to completion on its own. (If the whole process exits first, every thread is terminated regardless.)',
          },
          {
            id: 'q4',
            prompt: 'In the E0373 debug example, why did the ORIGINAL (broken) code fail to compile even though it never uses `message` after the thread::spawn call?',
            options: [
              { id: 'a', text: 'Because without `move`, the closure captured `message` by reference, and that reference is not guaranteed to outlive the spawned thread — the compiler cannot see "it happens not to be used afterward," only what the types allow' },
              { id: 'b', text: 'Because String does not implement Send' },
            ],
            correctOptionIds: ['a'],
            explanation: "The compiler reasons about types and lifetimes, not actual runtime usage patterns. A non-move closure captures the minimum (a reference here), and that reference's lifetime is what fails the 'static check — regardless of whether main uses `message` again.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Channels, Send & Sync
  // ---------------------------------------------------------------------
  'ra-channels-send-sync': {
    id: 'ra-channels-send-sync',
    heroSummary:
      "Channels let threads communicate by moving ownership of data through a queue instead of sharing memory directly. Send and Sync are the marker traits that let the compiler check, at compile time, which types are even allowed to make that crossing.",
    dependencyChain: {
      learned: 'How to spawn a thread with thread::spawn, why its closure needs to be `move`, and how to get a value back with JoinHandle::join().',
      why: "Once you have multiple threads, you need a safe way to move data between them, and a compile-time guarantee about which types are safe to hand across a thread boundary at all.",
      build: 'std::sync::mpsc channels for message passing, and the Send / Sync marker traits the compiler uses to reject unsafe crossings.',
      next: 'Arc<Mutex<T>> — for when threads need to share and mutate the SAME piece of state, instead of passing messages about it.',
    },
    sections: [
      {
        type: 'explain',
        title: 'mpsc: multiple producer, single consumer',
        body: [
          "std::sync::mpsc::channel() creates a queue and returns a (Sender<T>, Receiver<T>) pair connected to it. tx.send(value) pushes value onto the queue (moving it — the sending side gives up ownership); rx.recv() blocks until a value is available and pops it off, or returns an Err once the channel is closed and empty.",
          "'mpsc' stands for multiple producer, single consumer: there is exactly one Receiver, but Sender implements Clone, so you can hand out as many cloned Senders as you like — typically one per worker thread — and every clone feeds the SAME underlying queue.",
          "The channel closes automatically once every Sender (the original plus every clone) has been dropped. That is what lets `for received in rx` terminate on its own instead of blocking forever: once there is no Sender left that could possibly send another value, the iterator ends.",
        ],
      },
      {
        type: 'diagram',
        title: 'Multiple producers feeding one receiver',
        description: 'Follow a channel from creation, through several cloned Senders running on worker threads, to the moment the last Sender drops and the receiving loop ends on its own.',
        diagram: {
          title: 'mpsc::channel() with cloned Senders',
          height: 340,
          frames: [
            {
              caption: '`let (tx, rx) = mpsc::channel();` creates one channel — a Sender and a Receiver connected to the same underlying queue, which starts empty.',
              nodes: [
                { id: 'tx', label: 'tx', sublabel: 'Sender<String>', tone: 'stack', x: 22, y: 20 },
                { id: 'queue', label: 'channel queue', sublabel: 'empty', tone: 'default', x: 50, y: 60 },
                { id: 'rx', label: 'rx', sublabel: 'Receiver<String>', tone: 'stack', x: 78, y: 20 },
              ],
              edges: [
                { from: 'tx', to: 'queue', label: 'send()' },
                { from: 'rx', to: 'queue', label: 'recv()', dashed: true },
              ],
            },
            {
              caption: '`tx.clone()` produces more Senders pointing at the SAME queue. Each clone is `move`d into a different worker thread — this is what makes the channel "multi-producer."',
              nodes: [
                { id: 'tx1', label: 'tx1 (clone)', sublabel: 'on worker thread 1', tone: 'accent', x: 15, y: 15 },
                { id: 'tx2', label: 'tx2 (clone)', sublabel: 'on worker thread 2', tone: 'accent', x: 40, y: 15 },
                { id: 'tx3', label: 'tx3 (clone)', sublabel: 'on worker thread 3', tone: 'accent', x: 65, y: 15 },
                { id: 'queue', label: 'channel queue', sublabel: 'empty', tone: 'default', x: 40, y: 60 },
                { id: 'rx', label: 'rx', sublabel: 'in main thread', tone: 'stack', x: 90, y: 15 },
              ],
              edges: [
                { from: 'tx1', to: 'queue', label: 'send()' },
                { from: 'tx2', to: 'queue', label: 'send()' },
                { from: 'tx3', to: 'queue', label: 'send()' },
              ],
            },
            {
              caption: 'All three worker threads call .send() concurrently. Messages land in the queue in whatever order the OS scheduler happens to run the threads — not a guaranteed order.',
              nodes: [
                { id: 'tx1', label: 'tx1', sublabel: 'sent', tone: 'success', x: 15, y: 15 },
                { id: 'tx2', label: 'tx2', sublabel: 'sent', tone: 'success', x: 40, y: 15 },
                { id: 'tx3', label: 'tx3', sublabel: 'sending...', tone: 'accent', x: 65, y: 15 },
                { id: 'queue', label: 'channel queue', sublabel: 'holds: msg-from-1, msg-from-2', tone: 'warning', x: 40, y: 60 },
                { id: 'rx', label: 'rx', sublabel: 'in main thread', tone: 'stack', x: 90, y: 15 },
              ],
              edges: [{ from: 'tx3', to: 'queue', label: 'send()', tone: 'accent', animated: true }],
            },
            {
              caption: '`for received in rx` pulls messages out one at a time as they arrive, blocking only when the queue is momentarily empty.',
              nodes: [
                { id: 'queue', label: 'channel queue', sublabel: 'draining', tone: 'default', x: 40, y: 55 },
                { id: 'rx', label: 'rx', sublabel: 'receiving in a loop', tone: 'accent', x: 90, y: 20 },
              ],
              edges: [{ from: 'rx', to: 'queue', label: 'recv()', tone: 'accent', animated: true }],
            },
            {
              caption: 'Once every Sender — every clone across every thread — has been dropped, the channel closes. The `for` loop simply ends instead of blocking forever.',
              nodes: [
                { id: 'queue', label: 'channel queue', sublabel: 'closed · empty', tone: 'muted', x: 40, y: 45 },
                { id: 'rx', label: 'rx', sublabel: 'loop ended', tone: 'success', x: 90, y: 20 },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Fan-in: several producer threads, one receiver',
        description: 'Each worker gets its own cloned Sender. Dropping the original tx after spawning lets the channel close once every clone is also dropped, so the receiving `for` loop ends on its own.',
        code: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    for id in 0..3 {
        let tx = tx.clone();
        thread::spawn(move || {
            tx.send(format!("message from worker {id}")).unwrap();
        });
    }

    // Drop the original sender — only the clones moved into the threads
    // are left, and the channel closes once those are gone too.
    drop(tx);

    for received in rx {
        println!("main received: {received}");
    }
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'Send and Sync: the traits behind the guarantee',
        body: [
          "Send and Sync are marker traits — they have no methods, they exist purely so the compiler can track a fact about a type. Both are auto-derived: a type is Send (or Sync) automatically if every field inside it is Send (or Sync), with no action needed from you. You almost never implement them by hand.",
          "T: Send means a value of type T can be safely MOVED to a different thread — ownership can cross the boundary. That is exactly the bound thread::spawn's closure needs, since `move` transfers ownership of captured variables into a value that then runs on another thread.",
          "T: Sync means &T can be safely SHARED between threads — multiple threads can each hold a reference to the same T at the same time without corrupting it. Formally, T is Sync if and only if &T is Send.",
          "Most ordinary types (i32, String, Vec<T> where T: Send, etc.) are both Send and Sync. The interesting exceptions are the ones that are deliberately single-threaded — most notably Rc<T> and RefCell<T> — because their internal bookkeeping (a plain, non-atomic reference count, or a plain, non-atomic borrow flag) would be corrupted if two threads touched it at once without synchronization.",
        ],
      },
      {
        type: 'compare',
        title: 'Send vs Sync',
        columns: [
          {
            heading: 'Send',
            body: [
              '"Safe to move to another thread."',
              'This is the bound thread::spawn needs on its closure (and everything the closure captures) — because `move` transfers ownership across the thread boundary.',
              'Rc<T> is NOT Send — its refcount is a plain integer, unsafe to update from two threads at once.',
            ],
          },
          {
            heading: 'Sync',
            body: [
              '"Safe to share via &T across threads" — equivalently, T is Sync iff &T is Send.',
              'Mutex<T> is Sync even when T itself is not, because Mutex enforces exclusive access internally — that is its entire purpose.',
              'Rc<T> is also NOT Sync, for the same reason it is not Send: the refcount is not safe to touch from multiple threads.',
            ],
          },
        ],
      },
      {
        type: 'debug',
        title: 'Debug: sharing an Rc<T> across a thread',
        challenge: {
          problem: 'This code moves an Rc<i32> into a spawned thread and fails to compile. Diagnose the error and fix it.',
          brokenCode: `use std::rc::Rc;
use std::thread;

fn main() {
    let shared = Rc::new(5);

    let handle = thread::spawn(move || {
        println!("value = {shared}");
    });

    handle.join().unwrap();
}
`,
          bugExplanation:
            "thread::spawn requires its closure — and everything captured inside it — to implement Send. Rc<T>'s reference count is a plain, non-atomic integer: if two threads could clone or drop an Rc at the same time, the count could be corrupted by a data race, potentially freeing the value while another handle still thinks it is alive. Because of that risk, Rc<T> deliberately does NOT implement Send (or Sync), and rustc rejects this with E0277: \"`Rc<i32>` cannot be sent between threads safely,\" noting that the trait bound `Send` is not satisfied for `Rc<i32>`. Arc<T> exists specifically to fix this — its reference count is updated with atomic instructions, so cloning and dropping it from multiple threads is sound, and Arc<T> IS Send (and Sync, when T: Sync).",
          hints: [
            { title: 'Read the trait named in the error', body: 'The compiler names Rc<i32> specifically and says the trait `Send` is not implemented for it — this is not a borrow-checker error, it is a marker-trait bound failing.' },
            { title: 'Why Rc opts out of Send', body: "Rc::clone and Rc's Drop both read-modify-write a plain integer refcount. That is fine with one thread; two threads doing it at the same time without synchronization is a data race on the count itself." },
            { title: 'The thread-safe sibling', body: 'Swap `Rc::new` for `Arc::new` and the corresponding import from `std::rc::Rc` to `std::sync::Arc`. Arc has the identical clone-based API, just with atomic refcounting underneath.' },
          ],
          fixedCode: `use std::sync::Arc;
use std::thread;

fn main() {
    let shared = Arc::new(5);

    let handle = thread::spawn(move || {
        println!("value = {shared}");
    });

    handle.join().unwrap();
}
`,
        },
      },
      {
        type: 'exercise',
        title: 'Exercise: Sum values sent from multiple workers',
        exercise: {
          problem:
            'Spawn 4 worker threads (ids 0..4). Each worker should clone `tx`, move the clone in, and send `id * 10` through it. Back in main, drop the original `tx`, then receive every value sent and print their sum.',
          starterCode: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    // TODO: spawn 4 threads (ids 0..4). Each thread should clone \`tx\`,
    // move the clone in, and send \`id * 10\` through it.

    // TODO: drop the original \`tx\` so the channel can close once every
    // cloned Sender has also been dropped.

    let total: i32 = 0; // TODO: sum every value received from \`rx\`.

    println!("total = {total}");
}
`,
          hints: [
            { title: 'Clone before you move', body: 'Inside the loop, `let tx = tx.clone();` shadows the outer `tx` with a fresh clone, which you then move into `thread::spawn(move || { ... })`.' },
            { title: 'Do not forget to drop the original', body: 'If you never `drop(tx)`, the ORIGINAL Sender is still alive in main for as long as main runs, so the channel never closes and `rx.iter()` blocks forever waiting for a value that will never come.' },
            { title: 'Receiving and summing', body: '`rx.iter().sum()` (or a `for v in rx { total += v; }` loop) keeps receiving until every Sender is gone, then stops — regardless of which order the 4 values happened to arrive in.' },
          ],
          solutionCode: `use std::sync::mpsc;
use std::thread;

fn main() {
    let (tx, rx) = mpsc::channel();

    for id in 0..4 {
        let tx = tx.clone();
        thread::spawn(move || {
            tx.send(id * 10).unwrap();
        });
    }

    drop(tx);

    let total: i32 = rx.iter().sum();

    println!("total = {total}");
}
`,
          solutionExplanation:
            'Each worker owns its own cloned Sender, so there is nothing shared to lock — sending is just moving a value into the channel. Dropping the original `tx` after spawning means the ONLY Senders left are the ones inside the four threads; once every one of those finishes sending and its thread exits (dropping its Sender), the channel closes and `rx.iter()` stops. Because the result is a sum, the arrival order of the four values never changes the final total.',
          expectedOutputContains: ['total = 60'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What makes std::sync::mpsc "multiple producer"?',
            options: [
              { id: 'a', text: 'Sender<T> implements Clone, so any number of Senders can feed the same underlying queue, typically one per worker thread' },
              { id: 'b', text: 'The Receiver can be cloned to read from multiple threads at once' },
              { id: 'c', text: 'It automatically load-balances across CPU cores' },
            ],
            correctOptionIds: ['a'],
            explanation: 'mpsc has exactly one Receiver, but Sender is Clone — every clone feeds the same queue, which is what lets many threads act as producers.',
          },
          {
            id: 'q2',
            prompt: 'A `for received in rx` loop is currently blocking, waiting for the next message. Under what condition does it stop blocking and end the loop (without ever receiving another value)?',
            options: [
              { id: 'a', text: 'After a fixed timeout elapses' },
              { id: 'b', text: 'Once every Sender connected to the channel — the original and every clone — has been dropped' },
              { id: 'c', text: 'It never ends on its own; you must call rx.close() explicitly' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The channel closes automatically once no Sender could possibly send again. That is exactly what lets a receiving loop terminate cleanly instead of blocking forever.',
          },
          {
            id: 'q3',
            prompt: 'Which best describes the difference between Send and Sync?',
            options: [
              { id: 'a', text: 'Send means safe to MOVE to another thread; Sync means safe to SHARE (via &T) between threads at the same time' },
              { id: 'b', text: 'They are two names for the exact same guarantee' },
              { id: 'c', text: 'Send applies to structs, Sync applies to enums' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Send is about ownership crossing a thread boundary; Sync is about a shared reference being safe to hold from multiple threads simultaneously (T is Sync iff &T is Send).',
          },
          {
            id: 'q4',
            prompt: 'Why does Rc<T> fail to compile when moved into a thread::spawn closure, while Arc<T> works fine?',
            options: [
              { id: 'a', text: "Rc's reference count is a plain, non-atomic integer — unsafe to update from multiple threads — so Rc does not implement Send; Arc updates its count with atomic operations, so it does" },
              { id: 'b', text: 'Rc is simply an older, deprecated API' },
            ],
            correctOptionIds: ['a'],
            explanation: "This is precisely why Arc exists: same clone-based shared-ownership API as Rc, but with atomic refcounting that makes Send (and Sync) sound across real threads.",
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Thread Pools
  // ---------------------------------------------------------------------
  'ra-thread-pools': {
    id: 'ra-thread-pools',
    heroSummary:
      'Spawning a fresh OS thread per task is fine until tasks arrive faster than threads can be created and torn down. A thread pool flips that around: a fixed number of worker threads, created once, that pull jobs off one shared queue for the life of the program.',
    dependencyChain: {
      learned: 'Arc<Mutex<T>> for sharing mutable state across threads, and how a Mutex serializes access to prevent race conditions.',
      why: 'Spawning a brand-new thread for every incoming task does not scale — thread creation has real overhead, and an unbounded number of threads under load can exhaust the OS. A thread pool reuses a fixed set of threads instead.',
      build: 'A minimal ThreadPool built from a fixed number of worker threads sharing one Arc<Mutex<mpsc::Receiver<Job>>>, executing boxed closures sent through a channel.',
      next: 'Wiring this exact pool into a real multithreaded TCP server, where each incoming connection becomes one job handed to the pool.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Why not just spawn a thread per task?',
        body: [
          "thread::spawn works fine for a handful of long-lived threads. It works badly as a strategy for handling a continuous stream of short tasks — for example, one HTTP request per thread on a busy server. Every spawn has real overhead (allocating a stack, registering with the OS scheduler), and there is no upper bound on how many threads you might end up with if tasks arrive faster than they finish. Enough concurrent threads will exhaust memory or hit OS limits long before any of them are doing useful work.",
          "A thread pool fixes this by decoupling 'how many tasks arrive' from 'how many threads exist.' You create a small, fixed number of worker threads ONCE, up front. Tasks — jobs — are handed to the pool as closures, dropped into a shared queue, and whichever worker is free next picks one up. The number of threads stays constant no matter how many jobs come in; jobs simply wait their turn in the queue.",
        ],
      },
      {
        type: 'explain',
        title: 'The moving parts',
        body: [
          'A minimal thread pool needs three things: a way to represent "a unit of work" as a value, a shared queue every worker can pull from, and a fixed set of worker threads looping on that queue.',
        ],
        bullets: [
          'Job = Box<dyn FnOnce() + Send + \'static> — a boxed closure is how you store "a task" as a value you can send through a channel. FnOnce because a job runs exactly once; Send + \'static for the same reason thread::spawn needs them.',
          'An mpsc::channel::<Job>() gives you a Sender the pool\'s execute() method uses to hand out work, and a Receiver the workers pull from.',
          'mpsc only allows ONE Receiver — so to let several worker threads pull from the SAME queue, the Receiver is wrapped in Arc<Mutex<Receiver<Job>>>. Arc shares it across the workers; Mutex ensures only one worker is popping a job off at any instant.',
          'Each worker is its own OS thread running a loop: lock the shared receiver just long enough to pull one job, release the lock, then run the job.',
        ],
      },
      {
        type: 'diagram',
        title: 'Three workers, one job queue',
        description: 'Watch a fixed pool of 3 worker threads pull jobs off a single shared queue as they finish their current work, instead of a new thread being spawned per job.',
        diagram: {
          title: 'ThreadPool::new(3) dispatching 5 jobs',
          height: 340,
          frames: [
            {
              caption: 'ThreadPool::new(3) spawns 3 worker threads up front. All three share the SAME Arc<Mutex<Receiver<Job>>> — there is only one queue, and every worker pulls from it.',
              nodes: [
                { id: 'w0', label: 'Worker 0', sublabel: 'idle', tone: 'stack', x: 20, y: 20 },
                { id: 'w1', label: 'Worker 1', sublabel: 'idle', tone: 'stack', x: 50, y: 20 },
                { id: 'w2', label: 'Worker 2', sublabel: 'idle', tone: 'stack', x: 80, y: 20 },
                { id: 'queue', label: 'shared job queue', sublabel: 'empty', tone: 'default', x: 50, y: 70 },
              ],
            },
            {
              caption: 'pool.execute(job) is called 5 times. Each call boxes a closure and sends it down the channel — the jobs queue up, waiting for a free worker.',
              nodes: [
                { id: 'w0', label: 'Worker 0', sublabel: 'idle', tone: 'stack', x: 20, y: 20 },
                { id: 'w1', label: 'Worker 1', sublabel: 'idle', tone: 'stack', x: 50, y: 20 },
                { id: 'w2', label: 'Worker 2', sublabel: 'idle', tone: 'stack', x: 80, y: 20 },
                { id: 'queue', label: 'shared job queue', sublabel: 'jobs: [J1, J2, J3, J4, J5]', tone: 'warning', x: 50, y: 70 },
              ],
            },
            {
              caption: 'Workers 0, 1 and 2 each lock the queue just long enough to pop ONE job, then release the lock immediately and start executing. The lock is never held during a job\'s execution — only during the brief pop.',
              nodes: [
                { id: 'w0', label: 'Worker 0', sublabel: 'running J1', tone: 'accent', x: 20, y: 20 },
                { id: 'w1', label: 'Worker 1', sublabel: 'running J2', tone: 'accent', x: 50, y: 20 },
                { id: 'w2', label: 'Worker 2', sublabel: 'running J3', tone: 'accent', x: 80, y: 20 },
                { id: 'queue', label: 'shared job queue', sublabel: 'jobs: [J4, J5]', tone: 'default', x: 50, y: 70 },
              ],
            },
            {
              caption: 'Worker 1 finishes J2 first and immediately goes back to the queue for the next job, picking up J4. Workers 0 and 2 are still busy on their original jobs.',
              nodes: [
                { id: 'w0', label: 'Worker 0', sublabel: 'running J1', tone: 'accent', x: 20, y: 20 },
                { id: 'w1', label: 'Worker 1', sublabel: 'running J4', tone: 'accent', x: 50, y: 20 },
                { id: 'w2', label: 'Worker 2', sublabel: 'running J3', tone: 'accent', x: 80, y: 20 },
                { id: 'queue', label: 'shared job queue', sublabel: 'jobs: [J5]', tone: 'default', x: 50, y: 70 },
              ],
            },
            {
              caption: 'All 5 jobs finish. When the ThreadPool is dropped, it drops its Sender — every worker\'s next recv() call returns an error, so each one breaks its loop, and the pool joins all 3 threads before continuing.',
              nodes: [
                { id: 'w0', label: 'Worker 0', sublabel: 'shut down', tone: 'success', x: 20, y: 20 },
                { id: 'w1', label: 'Worker 1', sublabel: 'shut down', tone: 'success', x: 50, y: 20 },
                { id: 'w2', label: 'Worker 2', sublabel: 'shut down', tone: 'success', x: 80, y: 20 },
                { id: 'queue', label: 'shared job queue', sublabel: 'closed', tone: 'muted', x: 50, y: 70 },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'A minimal ThreadPool from scratch',
        description: 'A fixed number of worker threads sharing one Arc<Mutex<Receiver<Job>>>. execute() boxes a closure and sends it down the channel; dropping the pool closes the channel and joins every worker so no in-flight job is abandoned.',
        code: `use std::sync::{mpsc, Arc, Mutex};
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

pub struct ThreadPool {
    workers: Vec<Worker>,
    sender: Option<mpsc::Sender<Job>>,
}

impl ThreadPool {
    /// Creates a new ThreadPool with \`size\` worker threads.
    ///
    /// # Panics
    /// Panics if \`size\` is zero.
    pub fn new(size: usize) -> ThreadPool {
        assert!(size > 0);

        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));

        let mut workers = Vec::with_capacity(size);
        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender: Some(sender) }
    }

    pub fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.as_ref().unwrap().send(job).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        // Dropping the sender closes the channel — every worker's recv()
        // then returns an Err, which breaks it out of its loop.
        drop(self.sender.take());

        for worker in &mut self.workers {
            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

struct Worker {
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            // The MutexGuard here is a temporary: it is dropped at the end
            // of THIS statement, before \`job()\` runs on the next line — so
            // the lock is held only long enough to pop one job, never for
            // the duration of running it.
            let message = receiver.lock().unwrap().recv();

            match message {
                Ok(job) => {
                    println!("worker {id} got a job; executing.");
                    job();
                }
                Err(_) => {
                    println!("worker {id} disconnected; shutting down.");
                    break;
                }
            }
        });

        Worker { thread: Some(thread) }
    }
}

fn main() {
    let pool = ThreadPool::new(4);

    for i in 0..8 {
        pool.execute(move || {
            println!("task {i} running on a pooled worker thread");
        });
    }

    // When \`pool\` goes out of scope here, Drop sends the shutdown signal
    // and joins every worker, so all 8 tasks are guaranteed to finish
    // before main returns.
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'Why the lock is only held for the pop, never the job',
        body: [
          "The line `let message = receiver.lock().unwrap().recv();` looks like it might hold the Mutex locked while `job()` runs afterward, but it does not: the MutexGuard returned by .lock() is a temporary value with no name, so Rust drops it at the end of the statement it was created in — right after .recv() returns, and BEFORE the next line runs. By the time job() executes, the lock has already been released.",
          'This matters enormously for throughput. If the guard were kept alive across the call to job() — for example by binding it to a named variable first — every worker would need to hold the pool\'s ONE lock for the entire duration of running its job, which serializes all the workers and makes the "pool" behave exactly like a single thread, no matter how many workers you spawn.',
        ],
        callout: {
          tone: 'warning',
          text: 'A thread pool whose workers hold the queue\'s lock while executing jobs is not actually parallel — it just spent extra threads to run everything one at a time. The debug challenge below is exactly this bug.',
        },
      },
      {
        type: 'debug',
        title: 'Debug: a pool that never runs jobs in parallel',
        challenge: {
          problem:
            'This Worker loop compiles and the pool runs correctly — but 4 workers process 8 jobs no faster than 1 worker would. Find why the jobs are secretly running one at a time instead of in parallel.',
          brokenCode: `fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
    let thread = thread::spawn(move || loop {
        let guard = receiver.lock().unwrap();
        let message = guard.recv();

        match message {
            Ok(job) => {
                println!("worker {id} got a job; executing.");
                job(); // <- guard is STILL in scope here
            }
            Err(_) => break,
        }
    });

    Worker { thread: Some(thread) }
}
`,
          bugExplanation:
            'Binding the MutexGuard to a named variable, `guard`, extends its lifetime to the end of the enclosing block — which includes the call to `job()`. That means every worker holds the shared Mutex locked for the ENTIRE time it takes to run its job, not just for the instant it takes to pop one off the queue. Since only one thread can hold that Mutex at a time, only one worker can ever be "inside" its job at once — the other workers all block on `.lock()` waiting for it, even though they have nothing to do with each other\'s actual work. Four workers end up running jobs one after another, exactly as if there were only one thread.',
          hints: [
            { title: 'Compare the two versions side by side', body: 'The broken version and the version from the code section above look almost identical — the difference is whether the MutexGuard has a name that survives past the `match`.' },
            { title: 'Temporary lifetime rules', body: 'A temporary created in the middle of an expression — like the guard from `.lock().unwrap()` when it is never assigned to a variable — is dropped at the end of the STATEMENT it was created in. A named `let guard = ...;` binding instead lives until the end of its enclosing block.' },
            { title: 'What "releasing the lock" should look like', body: 'You want the lock held for exactly as long as it takes to call .recv() and get a Job out — nothing more. Restructure the code so nothing keeps the guard alive once you have the job in hand.' },
          ],
          fixedCode: `fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
    let thread = thread::spawn(move || loop {
        // No named guard survives past this statement — the lock is
        // released here, BEFORE job() runs below.
        let message = receiver.lock().unwrap().recv();

        match message {
            Ok(job) => {
                println!("worker {id} got a job; executing.");
                job();
            }
            Err(_) => break,
        }
    });

    Worker { thread: Some(thread) }
}
`,
        },
      },
      {
        type: 'exercise',
        title: 'Exercise: A hand-rolled worker pool with results',
        exercise: {
          problem:
            'Without wrapping anything in a ThreadPool struct, spawn 3 worker threads that all share one Arc<Mutex<mpsc::Receiver<Job>>>. Send 5 jobs, where job `n` (for n in 0..5) computes `n * n` and sends the result through a second channel, `results_tx`. In main, receive exactly 5 results from `results_rx` and print their sum.',
          starterCode: `use std::sync::{mpsc, Arc, Mutex};
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

fn main() {
    let (job_tx, job_rx) = mpsc::channel::<Job>();
    let job_rx = Arc::new(Mutex::new(job_rx));

    let (results_tx, results_rx) = mpsc::channel::<i32>();

    // TODO: spawn 3 worker threads. Each should loop: lock \`job_rx\` just
    // long enough to call .recv(), then match on the result — Ok(job) runs
    // the job, Err(_) breaks the loop. Remember not to hold the lock while
    // the job itself runs.

    for n in 0..5 {
        let results_tx = results_tx.clone();
        let job: Job = Box::new(move || {
            let square = n * n;
            results_tx.send(square).unwrap();
        });
        job_tx.send(job).unwrap();
    }

    drop(job_tx);
    drop(results_tx);

    let total: i32 = results_rx.iter().take(5).sum();
    println!("total = {total}");
}
`,
          hints: [
            { title: 'The worker loop shape', body: 'Each of the 3 threads needs its own Arc::clone(&job_rx) moved in, then a `loop { ... }` that matches on `job_rx.lock().unwrap().recv()`.' },
            { title: 'Keep the guard nameless', body: 'Write it as `job_rx.lock().unwrap().recv()` in one expression (not split across a named `let guard = ...` binding) so the lock releases before `job()` runs — otherwise all 3 workers would serialize on the lock exactly like the debug challenge above.' },
            { title: 'Breaking out cleanly', body: 'Match the recv() result: Ok(job) => job(), Err(_) => break. Once job_tx and every clone are dropped, recv() starts returning Err and each worker exits its loop instead of spinning.' },
          ],
          solutionCode: `use std::sync::{mpsc, Arc, Mutex};
use std::thread;

type Job = Box<dyn FnOnce() + Send + 'static>;

fn main() {
    let (job_tx, job_rx) = mpsc::channel::<Job>();
    let job_rx = Arc::new(Mutex::new(job_rx));

    let (results_tx, results_rx) = mpsc::channel::<i32>();

    for _ in 0..3 {
        let job_rx = Arc::clone(&job_rx);
        thread::spawn(move || loop {
            let message = job_rx.lock().unwrap().recv();
            match message {
                Ok(job) => job(),
                Err(_) => break,
            }
        });
    }

    for n in 0..5 {
        let results_tx = results_tx.clone();
        let job: Job = Box::new(move || {
            let square = n * n;
            results_tx.send(square).unwrap();
        });
        job_tx.send(job).unwrap();
    }

    drop(job_tx);
    drop(results_tx);

    let total: i32 = results_rx.iter().take(5).sum();
    println!("total = {total}");
}
`,
          solutionExplanation:
            'Three workers share one Arc<Mutex<Receiver<Job>>> — Arc lets them all point at the same Mutex, and the Mutex ensures only one worker pops a job off the queue at a time. Because `job_rx.lock().unwrap().recv()` never names its guard, the lock releases immediately after recv() returns, so workers execute their jobs (and send results) fully in parallel rather than one at a time. Since main only sums 5 results off `results_rx`, it does not matter which worker handled which value or in what order the results arrive — the sum of squares 0² + 1² + 2² + 3² + 4² is 30 regardless.',
          expectedOutputContains: ['total = 30'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does the shared job queue need to be Arc<Mutex<Receiver<Job>>> instead of just handing each worker its own Receiver?',
            options: [
              { id: 'a', text: 'mpsc supports only ONE Receiver per channel — Arc<Mutex<_>> is how several worker threads share access to that single Receiver' },
              { id: 'b', text: 'Receiver<T> does not implement Send, so it has to be wrapped before it can be used in a thread at all' },
            ],
            correctOptionIds: ['a'],
            explanation: 'mpsc is single-consumer by design. To let multiple workers pull from the same queue, they all need access to the one Receiver that exists — Arc shares it, Mutex serializes each pop.',
          },
          {
            id: 'q2',
            prompt: 'Why is it important that the MutexGuard from `receiver.lock().unwrap()` is NOT bound to a named variable before calling .recv()?',
            options: [
              { id: 'a', text: "It isn't important — naming it would behave identically" },
              { id: 'b', text: 'A named guard lives until the end of its enclosing block, holding the lock across the job\'s entire execution and serializing every worker; an unnamed temporary drops at the end of the statement, releasing the lock right after recv() returns' },
            ],
            correctOptionIds: ['b'],
            explanation: 'This is the exact bug in the debug challenge: naming the guard extends its lifetime past the job() call, so only one worker can ever be "inside" a job at a time — defeating the whole point of having multiple workers.',
          },
          {
            id: 'q3',
            prompt: 'What causes each worker\'s loop to end during the ThreadPool\'s shutdown?',
            options: [
              { id: 'a', text: 'The ThreadPool sends a special "stop" Job to each worker' },
              { id: 'b', text: 'Dropping the ThreadPool\'s Sender closes the channel; each worker\'s next recv() call then returns Err, and its match breaks the loop' },
              { id: 'c', text: 'The process is forcibly killed when the ThreadPool is dropped' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Drop::drop on ThreadPool drops the Sender, which closes the channel. recv() on a closed, empty channel returns Err, and each Worker\'s loop treats that as its signal to stop.',
          },
          {
            id: 'q4',
            prompt: 'Why is the Job type alias Box<dyn FnOnce() + Send + \'static> instead of Box<dyn Fn() + Send + \'static>?',
            options: [
              { id: 'a', text: 'A job is expected to run exactly once — FnOnce allows the closure to consume (move out of) anything it captured, which Fn would not permit' },
              { id: 'b', text: 'FnOnce is required because closures cannot be boxed otherwise' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Each job runs a single time and is then discarded, so FnOnce is both sufficient and more permissive — it allows jobs that move captured data out (e.g. sending it through a channel) rather than only borrowing it.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Async/Await, Tokio, Streams & Macros (added)
  // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
  // async/await & Tokio
  // ---------------------------------------------------------------------
  'ra-async-await-tokio': {
    id: 'ra-async-await-tokio',
    heroSummary:
      'async fn and .await are ergonomic syntax over the exact Future/Poll/Waker state machine you already know — Tokio is the executor that actually drives it, and tokio::spawn is how you run many of these state machines concurrently on a handful of threads.',
    dependencyChain: {
      learned: 'The Future trait, Poll::Pending/Ready, the executor loop, and the Waker that lets a pending future ask to be polled again once it can make progress.',
      why: 'Writing state machines by hand (like the CountdownFuture from the previous lesson) does not scale to real programs full of branches, loops, and error handling. async/await gives the compiler that job, and Tokio gives you a production-grade executor to drive the result — plus the tools (tasks, channels) to run many of them at once.',
      build: 'async fn as a compiler-generated Future, .await as a suspend/resume point in that Future, #[tokio::main] and tokio::spawn for concurrent tasks, and tokio::sync::mpsc channels for tasks to talk to each other.',
      next: 'Streams (async sequences of values over time), and tokio::select!/join!/timeout for racing and bounding concurrent futures.',
    },
    sections: [
      {
        type: 'explain',
        title: 'async fn is a Future in a trenchcoat',
        body: [
          'You already know that a Future is a struct implementing poll(), where the executor calls poll() in a loop, gets Pending until a Waker says otherwise, and eventually gets Ready(value). Writing that struct and its poll() by hand for anything non-trivial — branches, loops, multiple awaited operations in sequence — is painful.',
          "async fn is the compiler doing that transformation for you. Writing `async fn fetch_value() -> i32 { ... }` does NOT run any code when called — it immediately returns an anonymous struct implementing `Future<Output = i32>`. The body only starts executing once something polls that future, which is exactly the same rule as the hand-rolled CountdownFuture from the previous lesson.",
          'Each `.await` inside that body is a potential suspend point. `some_future.await` desugars to roughly: poll the future; if Pending, suspend this whole generated state machine (returning Pending up to whoever polled it) and remember exactly where we paused; if Ready(value), unwrap value and keep executing the rest of the function with it. It is literally the poll loop, written for you, one state per .await.',
        ],
        bullets: [
          '`async fn foo() -> T` desugars to a function returning `impl Future<Output = T>` — calling it builds the state machine but does not run it',
          '`.await` = "poll this future; if Pending, pause here and give control back to whoever polled ME; if Ready, unwrap and continue"',
          'Nothing runs until something (an executor) polls the outermost future — this is why a bare async fn call by itself does nothing observable',
        ],
        callout: {
          tone: 'accent',
          text: 'If you remember one thing: .await never blocks the OS thread. It suspends THIS future so the executor can go poll a different one, then comes back later — that is the whole point of async over threads.',
        },
      },
      {
        type: 'explain',
        title: 'Tokio: the executor that actually does the polling',
        body: [
          'The Future trait and async/await syntax are part of core Rust — but Rust deliberately ships with no built-in executor. You choose one. Tokio is the dominant choice: a multi-threaded, work-stealing executor plus a full non-blocking I/O layer (sockets, timers, filesystem) that all correctly implement Poll/Waker under the hood.',
          '`#[tokio::main] async fn main() { ... }` is a macro that rewrites your async main into a normal, synchronous `fn main()` that spins up a Tokio runtime and hands your async block to it as the first task to poll to completion. Everything you await inside eventually bottoms out in a Tokio-provided future (a timer, a socket read, a channel receive) that knows how to register real Wakers with the OS.',
          '`tokio::spawn(some_future)` is how you get concurrency, not just one future at a time. It hands the future to the runtime as an independent task — the runtime\'s scheduler will poll it on any of its worker threads, interleaved with every other spawned task, without you managing threads yourself. spawn returns a JoinHandle you can .await to get the task\'s result back.',
        ],
        bullets: [
          '#[tokio::main] = "build a Tokio runtime and run this async block as the root task"',
          'tokio::spawn(future) = "schedule this as an independent, concurrently-polled task" (returns a JoinHandle<T>)',
          'A spawned task can outlive the function that spawned it — it keeps running on the runtime until it completes or the runtime shuts down',
        ],
      },
      {
        type: 'diagram',
        title: 'One runtime, many tasks, a handful of threads',
        description: 'Watch two tasks spawned onto the same Tokio runtime get interleaved on worker threads — exactly the executor loop from the previous lesson, just now polling MULTIPLE futures instead of one.',
        diagram: {
          title: 'tokio::spawn interleaving two tasks',
          height: 340,
          frames: [
            {
              caption: '#[tokio::main] starts the runtime with a pool of worker threads, ready to poll tasks.',
              nodes: [
                { id: 'rt', label: 'Tokio runtime', sublabel: 'worker threads', tone: 'stack', x: 20, y: 50 },
                { id: 'main', label: 'main() task', tone: 'default', x: 60, y: 20 },
              ],
              edges: [{ from: 'rt', to: 'main', label: 'poll()', tone: 'accent', animated: true }],
            },
            {
              caption: 'main() calls tokio::spawn twice — task A and task B are now independent, scheduled on the runtime.',
              nodes: [
                { id: 'rt', label: 'Tokio runtime', sublabel: 'worker threads', tone: 'stack', x: 20, y: 50 },
                { id: 'main', label: 'main() task', tone: 'muted', x: 60, y: 12 },
                { id: 'a', label: 'Task A', sublabel: 'fetch(1)', tone: 'default', x: 60, y: 50 },
                { id: 'b', label: 'Task B', sublabel: 'fetch(2)', tone: 'default', x: 60, y: 85 },
              ],
              edges: [
                { from: 'main', to: 'a', label: 'spawn', dashed: true },
                { from: 'main', to: 'b', label: 'spawn', dashed: true },
              ],
            },
            {
              caption: 'The runtime polls Task A first. It hits an .await on a timer that has not fired yet, and returns Pending.',
              nodes: [
                { id: 'rt', label: 'Tokio runtime', sublabel: 'worker threads', tone: 'stack', x: 20, y: 50 },
                { id: 'a', label: 'Task A', sublabel: 'Pending (waiting on timer)', tone: 'warning', x: 60, y: 30 },
                { id: 'b', label: 'Task B', tone: 'default', x: 60, y: 78 },
              ],
              edges: [{ from: 'rt', to: 'a', label: 'poll() -> Pending', tone: 'warning' }],
            },
            {
              caption: 'Instead of waiting idle, the runtime immediately polls Task B on the SAME thread — this is the whole win over blocking I/O.',
              nodes: [
                { id: 'rt', label: 'Tokio runtime', sublabel: 'worker threads', tone: 'stack', x: 20, y: 50 },
                { id: 'a', label: 'Task A', sublabel: 'suspended', tone: 'muted', x: 60, y: 30 },
                { id: 'b', label: 'Task B', sublabel: 'polling now', tone: 'accent', x: 60, y: 78 },
              ],
              edges: [{ from: 'rt', to: 'b', label: 'poll()', tone: 'accent', animated: true }],
            },
            {
              caption: 'Task A\'s timer eventually fires, waking it. The runtime polls A again; this time it completes.',
              nodes: [
                { id: 'rt', label: 'Tokio runtime', sublabel: 'worker threads', tone: 'stack', x: 20, y: 50 },
                { id: 'a', label: 'Task A', sublabel: 'Ready(1)', tone: 'success', x: 60, y: 30 },
                { id: 'b', label: 'Task B', sublabel: 'Ready(2)', tone: 'success', x: 60, y: 78 },
              ],
              edges: [
                { from: 'rt', to: 'a', label: 'poll() -> Ready', tone: 'success' },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Spawning concurrent tasks and joining their results',
        description: 'Requires a real async runtime — this needs the tokio crate and cannot run in the browser Playground. To run locally: create a project, add `tokio = { version = "1", features = ["full"] }` to Cargo.toml, then `cargo run`. Notice how fetch(id) is a plain async fn: calling it builds a future, and tokio::spawn is what actually gets it polled concurrently with the others.',
        code: `use std::time::Duration;

async fn fetch(id: u32) -> u32 {
    // Simulates non-blocking work (a network call, a DB query...).
    // sleep().await suspends THIS task without blocking the thread,
    // so the runtime is free to poll other tasks in the meantime.
    tokio::time::sleep(Duration::from_millis(50)).await;
    id * 10
}

#[tokio::main]
async fn main() {
    // Each spawn hands the runtime an independent task. They start
    // running concurrently as soon as they're spawned, not when awaited.
    let handle_a = tokio::spawn(fetch(1));
    let handle_b = tokio::spawn(fetch(2));
    let handle_c = tokio::spawn(fetch(3));

    // .await on a JoinHandle waits for that specific task to finish
    // and unwraps its Result<T, JoinError> (Err only if the task panicked).
    let a = handle_a.await.unwrap();
    let b = handle_b.await.unwrap();
    let c = handle_c.await.unwrap();

    println!("results = {} {} {}", a, b, c);
    // Total wall time is ~50ms, not ~150ms -- the three sleeps overlap.
}
`,
        runnable: false,
      },
      {
        type: 'code',
        title: 'Tasks talking to each other with tokio::sync::mpsc',
        description: 'Requires the tokio crate (dependency shown above) — mpsc is an async, multi-producer single-consumer channel built for tasks, not threads. `runnable: false` for the same reason: no executor available in-browser.',
        code: `use tokio::sync::mpsc;

async fn worker(id: u32, tx: mpsc::Sender<String>) {
    let msg = format!("worker {id} done");
    // send().await suspends if the channel buffer is full, resuming
    // once the receiver has made room -- backpressure, for free.
    tx.send(msg).await.expect("receiver dropped");
}

#[tokio::main]
async fn main() {
    // A bounded channel: at most 8 messages buffered before senders wait.
    let (tx, mut rx) = mpsc::channel::<String>(8);

    for id in 0..3 {
        let tx_clone = tx.clone(); // mpsc::Sender is Clone -- one per producer
        tokio::spawn(worker(id, tx_clone));
    }
    drop(tx); // drop our own sender so the channel closes once workers finish

    // recv() yields None once every Sender has been dropped and the
    // buffer is drained -- that's how the receiving loop knows to stop.
    while let Some(msg) = rx.recv().await {
        println!("received: {msg}");
    }
}
`,
        runnable: false,
      },
      {
        type: 'exercise',
        title: 'Exercise: fan out and collect',
        exercise: {
          problem:
            'Write an async fn `square(n: u32) -> u32` that (after a short simulated delay) returns `n * n`. In `main`, spawn three tasks calling `square(2)`, `square(3)`, and `square(4)` with `tokio::spawn`, then await each JoinHandle and print all three results. This exercise describes real async/Tokio code — the in-browser runner cannot execute it, so reason through what the code should print rather than running it.',
          starterCode: `use std::time::Duration;

async fn square(n: u32) -> u32 {
    tokio::time::sleep(Duration::from_millis(10)).await;
    // TODO: return n squared
}

#[tokio::main]
async fn main() {
    // TODO: spawn three tasks calling square(2), square(3), square(4)
    // TODO: await each JoinHandle and print the three results
}
`,
          hints: [
            { title: 'tokio::spawn takes a future, not a function pointer', body: 'Call `square(2)` to build the future first (this does not run it), then pass that future into `tokio::spawn(...)`. spawn is what schedules it to actually be polled.' },
            { title: 'JoinHandle<T> is itself awaitable', body: 'tokio::spawn returns a `JoinHandle<u32>` here. `.await` on it yields a `Result<u32, JoinError>` — `.unwrap()` gets you the u32 if the task did not panic.' },
            { title: 'Order of spawning vs order of awaiting', body: 'All three spawn() calls should happen before you start awaiting any of the handles, so the three tasks actually overlap instead of running strictly one after another.' },
          ],
          solutionCode: `use std::time::Duration;

async fn square(n: u32) -> u32 {
    tokio::time::sleep(Duration::from_millis(10)).await;
    n * n
}

#[tokio::main]
async fn main() {
    let h1 = tokio::spawn(square(2));
    let h2 = tokio::spawn(square(3));
    let h3 = tokio::spawn(square(4));

    let r1 = h1.await.unwrap();
    let r2 = h2.await.unwrap();
    let r3 = h3.await.unwrap();

    println!("results = {} {} {}", r1, r2, r3);
}
`,
          solutionExplanation:
            'All three square(...) futures are spawned before any is awaited, so their ~10ms sleeps run concurrently on the Tokio runtime instead of stacking up to ~30ms. Each JoinHandle.await gives back a Result<u32, JoinError>; unwrap() extracts the u32 assuming the task did not panic. The printed line is "results = 4 9 16".',
          expectedOutputContains: ['results = 4 9 16'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the task that never runs',
        challenge: {
          problem: 'This code compiles and runs, but "task ran" never prints. Why does the spawned task seem to vanish?',
          brokenCode: `use std::time::Duration;

async fn background_work() {
    tokio::time::sleep(Duration::from_millis(20)).await;
    println!("task ran");
}

#[tokio::main]
async fn main() {
    tokio::spawn(background_work());
    println!("main finished");
}
`,
          bugExplanation:
            'tokio::spawn schedules the task, but does NOT wait for it. main() immediately reaches the end of its own async block after printing "main finished" -- and #[tokio::main] shuts the whole runtime down as soon as the top-level future (main) completes. If the spawned task has not finished its 20ms sleep by then, it gets dropped mid-flight, along with any output it had not printed yet. This is a common surprise: a spawned task\'s lifetime is tied to the runtime staying alive, not to anything resembling structured scope.',
          hints: [
            { title: 'What does spawn actually return?', body: 'tokio::spawn returns a JoinHandle immediately, without pausing main. If nothing ever awaits that handle, main has no reason to wait for the task either.' },
            { title: 'What happens when #[tokio::main]\'s async fn main returns?', body: 'The runtime is torn down as soon as the root future finishes -- any tasks still in flight are dropped, whether or not they printed anything yet.' },
            { title: 'The fix is to actually wait', body: 'Capture the JoinHandle returned by spawn and .await it before main ends, so main does not finish (and the runtime does not shut down) until the background task is done.' },
          ],
          fixedCode: `use std::time::Duration;

async fn background_work() {
    tokio::time::sleep(Duration::from_millis(20)).await;
    println!("task ran");
}

#[tokio::main]
async fn main() {
    let handle = tokio::spawn(background_work());
    println!("main finished");
    handle.await.unwrap(); // wait for the task before the runtime shuts down
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
            prompt: 'What does calling an async fn (without awaiting or spawning it) actually do?',
            options: [
              { id: 'a', text: 'Runs the function body immediately on the current thread' },
              { id: 'b', text: 'Builds and returns a Future value implementing poll() for that body — nothing in the body executes yet' },
              { id: 'c', text: 'Schedules the function to run on a Tokio worker thread right away' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Just like the hand-rolled CountdownFuture from the previous lesson, an async fn call only constructs the state machine. Nothing runs until something polls it — via .await, tokio::spawn, or an executor driving it directly.',
          },
          {
            id: 'q2',
            prompt: 'What does .await actually cause at the point it appears in an async fn?',
            options: [
              { id: 'a', text: 'It blocks the current OS thread until the awaited future is Ready' },
              { id: 'b', text: 'It polls the awaited future; if Pending, it suspends the enclosing generated Future (returning control to whatever polled IT) and resumes from that exact point once woken' },
            ],
            correctOptionIds: ['b'],
            explanation: '.await never blocks a thread. It is a suspend/resume point in the compiler-generated state machine — exactly the Pending/Waker mechanism from the futures lesson, just written for you by the compiler.',
          },
          {
            id: 'q3',
            prompt: 'What is the effect of tokio::spawn(some_future) that a plain .await does not give you?',
            options: [
              { id: 'a', text: 'It schedules the future as an independent task the runtime can poll concurrently with everything else, instead of running it to completion inline' },
              { id: 'b', text: 'It runs the future on a brand-new OS thread, one per spawned task' },
              { id: 'c', text: 'It makes the future run synchronously before continuing' },
            ],
            correctOptionIds: ['a'],
            explanation: 'tokio::spawn hands the future to the runtime\'s scheduler as its own task, which can be interleaved with other tasks across the runtime\'s (much smaller) pool of worker threads — that is the concurrency win over plain sequential .await.',
          },
          {
            id: 'q4',
            prompt: 'In the debug challenge, why did "task ran" fail to print even though tokio::spawn was called correctly?',
            options: [
              { id: 'a', text: 'tokio::spawn silently swallows panics' },
              { id: 'b', text: 'main() finished and the runtime shut down before the spawned task\'s 20ms sleep completed, since nothing awaited its JoinHandle' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A spawned task keeps running only as long as the runtime is alive. #[tokio::main] tears the runtime down as soon as the root async main future completes — so any in-flight spawned tasks that no one waited on get dropped.',
          },
          {
            id: 'q5',
            prompt: 'What is the purpose of tokio::sync::mpsc::channel(8) in the worker example?',
            options: [
              { id: 'a', text: 'It creates a synchronous, blocking queue for use outside async code' },
              { id: 'b', text: 'It creates an async, bounded channel where send().await suspends (without blocking a thread) if the buffer of 8 is full, resuming once the receiver drains it' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Tokio channels are built for async code: both send (on a bounded channel) and recv are async operations that suspend the calling task rather than blocking a thread, giving you backpressure for free.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Async Streams, Cancellation & Timeouts
  // ---------------------------------------------------------------------
  'ra-async-streams-cancellation': {
    id: 'ra-async-streams-cancellation',
    heroSummary:
      'A Stream is what Iterator would look like if producing the next item could take time — poll_next instead of next, Pending instead of an immediate answer. select!, join!, and timeout are how you race, combine, and bound futures that might otherwise run (or wait) forever.',
    dependencyChain: {
      learned: 'async fn / .await as sugar over Future/Poll, #[tokio::main] and tokio::spawn for running concurrent tasks, and tokio::sync::mpsc for tasks to communicate.',
      why: 'Not every async value is a single one-shot result. Some produce a SEQUENCE of values over time (a stream of websocket messages, ticks of a timer), and real systems need to bound how long they wait on any given future rather than waiting forever.',
      build: 'The Stream trait (poll_next producing Some(item)/None over time), tokio::select! for racing multiple futures and taking whichever resolves first, tokio::time::timeout for bounding a future\'s runtime, and tokio::join! for running several futures concurrently to full completion.',
      next: 'Combining these primitives (spawn + channels + select! + timeout) into full async services — the async HTTP server and WebSocket projects ahead.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Stream: an Iterator whose next item is not ready yet',
        body: [
          "You know Iterator: next(&mut self) -> Option<Item>, called repeatedly until it returns None. Stream is the async version: poll_next(self: Pin<&mut Self>, cx: &mut Context) -> Poll<Option<Item>>. Instead of next() answering immediately, poll_next can return Pending — 'the next item is not ready yet, poll me again once you're woken' — using the exact same Poll/Waker machinery as any other future.",
          "In other words: Iterator produces values one at a time, synchronously. Future produces ONE value, asynchronously. Stream produces MANY values, asynchronously — it is the intersection of the two ideas. A stream of incoming websocket frames, a stream of rows from a paginated API, or tokio_stream's interval() (a stream that yields a value on each timer tick) are all natural fits.",
          "The Stream trait itself lives in the `futures` crate (or `tokio_stream`, a thin Tokio-flavored wrapper) — unlike Future, it is not yet in std. In practice you rarely call poll_next by hand; you use combinators like `.next().await` (from `StreamExt`) to pull the next item, which reads just like calling `.next()` on a regular iterator, except it's an async call you await.",
        ],
        bullets: [
          'Iterator: next() -> Option<Item>, synchronous, one item per call',
          'Future: poll() -> Poll<Item>, asynchronous, exactly ONE item ever',
          'Stream: poll_next() -> Poll<Option<Item>>, asynchronous, MANY items over time, ending in None',
        ],
      },
      {
        type: 'code',
        title: 'Consuming a stream with StreamExt::next()',
        description: 'Needs the tokio crate plus tokio-stream for the Stream/StreamExt types used here — add `tokio = { version = "1", features = ["full"] }` and `tokio-stream = "0.1"` to Cargo.toml. Not runnable in-browser: this needs a real Tokio runtime and timer machinery.',
        code: `use tokio_stream::StreamExt;
use std::time::Duration;

#[tokio::main]
async fn main() {
    // interval() yields a value once per period -- a Stream of "ticks",
    // conceptually infinite, backed by an async timer under the hood.
    let mut ticks = tokio_stream::wrappers::IntervalStream::new(
        tokio::time::interval(Duration::from_millis(10)),
    );

    let mut count = 0;
    // .next().await pulls the next item, suspending (not blocking) until
    // poll_next reports Some(item) is ready -- exactly like .await on a
    // one-shot future, just called repeatedly until we decide to stop.
    while let Some(_tick) = ticks.next().await {
        count += 1;
        println!("tick {count}");
        if count == 3 {
            break; // streams don't have to be drained to completion
        }
    }
}
`,
        runnable: false,
      },
      {
        type: 'explain',
        title: 'Bounding and racing futures: timeout, select!, join!',
        body: [
          "A future that never resolves is a real failure mode: a server that never responds, a channel no one ever sends on. `tokio::time::timeout(duration, future)` wraps any future and races it against a timer, returning `Ok(value)` if the future finished first or `Err(Elapsed)` if the duration ran out first — the original future is dropped (cancelled) if it lost the race.",
          "`tokio::select!` generalizes that idea: give it several futures/branches, and it polls all of them, proceeding with whichever completes FIRST — the rest are dropped (cancelled) unpolled. This is exactly how you'd implement your own timeout: `select! { result = some_future => ..., _ = sleep(d) => ... }` races the real work against a timer branch by hand.",
          "`tokio::join!` is the opposite: give it several futures and it drives ALL of them concurrently, only completing once EVERY one of them has finished, returning a tuple of all their results. Where select! is 'first one wins, cancel the rest,' join! is 'wait for all of them, in parallel, not sequentially.'",
        ],
        bullets: [
          'timeout(duration, future) -> Ok(value) if future wins, Err(Elapsed) if the clock wins first; the loser is dropped',
          'select! { ... } -> polls several branches, proceeds with the FIRST ready one, drops (cancels) the other unpolled futures',
          'join! (...) -> awaits ALL given futures concurrently, completing only once every one of them is Ready',
          'Dropping a future that is still Pending is exactly how cancellation works in async Rust — a dropped future simply stops being polled, ever',
        ],
        callout: {
          tone: 'warning',
          text: 'Cancellation in async Rust is implicit: there is no cancel() method. A future is cancelled by being DROPPED before it completes — which is exactly what select! does to every losing branch, and what timeout does to the future that ran out of time.',
        },
      },
      {
        type: 'diagram',
        title: 'select! racing a real operation against a timeout',
        description: 'Two futures enter select!, only one (or the timer) survives — the other is dropped mid-flight the instant a winner is decided.',
        diagram: {
          title: 'select! { op vs sleep }',
          height: 320,
          frames: [
            {
              caption: 'select! polls both branches: the real operation, and a timer sleep set as the timeout budget.',
              nodes: [
                { id: 'sel', label: 'select!', tone: 'stack', x: 50, y: 15 },
                { id: 'op', label: 'operation()', tone: 'default', x: 25, y: 55 },
                { id: 'timer', label: 'sleep(budget)', tone: 'muted', x: 75, y: 55 },
              ],
              edges: [
                { from: 'sel', to: 'op', label: 'poll()', tone: 'accent' },
                { from: 'sel', to: 'timer', label: 'poll()', tone: 'accent' },
              ],
            },
            {
              caption: 'Neither is ready yet -- both return Pending. select! waits for whichever Waker fires first.',
              nodes: [
                { id: 'sel', label: 'select!', tone: 'stack', x: 50, y: 15 },
                { id: 'op', label: 'operation()', tone: 'warning', x: 25, y: 55 },
                { id: 'timer', label: 'sleep(budget)', tone: 'warning', x: 75, y: 55 },
              ],
              edges: [
                { from: 'op', to: 'sel', label: 'Pending', tone: 'warning', dashed: true },
                { from: 'timer', to: 'sel', label: 'Pending', tone: 'warning', dashed: true },
              ],
            },
            {
              caption: 'The operation finishes first and returns Ready -- it wins the race.',
              nodes: [
                { id: 'sel', label: 'select!', tone: 'stack', x: 50, y: 15 },
                { id: 'op', label: 'operation()', tone: 'success', x: 25, y: 55 },
                { id: 'timer', label: 'sleep(budget)', tone: 'muted', x: 75, y: 55 },
              ],
              edges: [{ from: 'op', to: 'sel', label: 'Ready(value)', tone: 'success' }],
            },
            {
              caption: 'select! immediately drops the still-pending sleep branch -- it will never be polled again. This drop IS the cancellation.',
              nodes: [
                { id: 'sel', label: 'select!', tone: 'stack', x: 50, y: 30 },
                { id: 'op', label: 'operation() (used)', tone: 'success', x: 30, y: 65 },
                { id: 'timer', label: 'sleep(budget) DROPPED', tone: 'danger', x: 75, y: 65, invalid: true },
              ],
              edges: [{ from: 'sel', to: 'timer', label: 'drop (cancel)', tone: 'danger', dashed: true }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'timeout, select!, and join! side by side',
        description: 'Needs the tokio crate (`tokio = { version = "1", features = ["full"] }`) — timers and select!/join! macros only exist with a real async runtime, so this cannot run on the in-browser Playground.',
        code: `use std::time::Duration;
use tokio::time::{sleep, timeout};

async fn slow_operation() -> &'static str {
    sleep(Duration::from_millis(200)).await;
    "operation finished"
}

async fn quick_operation() -> &'static str {
    sleep(Duration::from_millis(10)).await;
    "quick result"
}

#[tokio::main]
async fn main() {
    // 1. timeout: bound how long we wait for slow_operation.
    match timeout(Duration::from_millis(50), slow_operation()).await {
        Ok(result) => println!("finished in time: {result}"),
        Err(_elapsed) => println!("timed out waiting for slow_operation"),
    }

    // 2. select!: race two futures directly, keep whichever wins.
    tokio::select! {
        result = slow_operation() => println!("slow won: {result}"),
        result = quick_operation() => println!("quick won: {result}"),
    }
    // Prints "quick won: quick result" -- slow_operation's future is
    // dropped (cancelled) the instant quick_operation resolves first.

    // 3. join!: run both concurrently, wait for BOTH to finish.
    let (a, b) = tokio::join!(slow_operation(), quick_operation());
    println!("both finished: {a} / {b}");
    // Total time here is ~200ms (bounded by the slower one), not
    // ~210ms -- both futures were polled concurrently, not sequentially.
}
`,
        runnable: false,
      },
      {
        type: 'exercise',
        title: 'Exercise: give an operation a time budget',
        exercise: {
          problem:
            'Write an async fn `unreliable_fetch() -> &\'static str` that sleeps for 100ms then returns "data". In main, call it through `tokio::time::timeout` with a 30ms budget, and print "timed out" if it does not make it, or "got: <value>" if it does. This is real Tokio async code — reason through the expected output rather than running it in-browser.',
          starterCode: `use std::time::Duration;
use tokio::time::{sleep, timeout};

async fn unreliable_fetch() -> &'static str {
    sleep(Duration::from_millis(100)).await;
    "data"
}

#[tokio::main]
async fn main() {
    // TODO: call unreliable_fetch() through timeout() with a 30ms budget.
    // TODO: match on the Result and print "timed out" or "got: <value>".
}
`,
          hints: [
            { title: 'timeout\'s signature', body: '`timeout(duration, future)` returns a future that resolves to `Result<T, Elapsed>` where T is the wrapped future\'s output type -- await THAT to get the Result.' },
            { title: 'Which branch wins here?', body: 'The budget (30ms) is shorter than the sleep inside unreliable_fetch (100ms) -- the timer will win the internal race every time, so expect the Err(Elapsed) branch.' },
            { title: 'Matching the Result', body: 'Ok(value) => the wrapped future finished in time, value is its output. Err(_) => Elapsed, the future ran out of time and was dropped.' },
          ],
          solutionCode: `use std::time::Duration;
use tokio::time::{sleep, timeout};

async fn unreliable_fetch() -> &'static str {
    sleep(Duration::from_millis(100)).await;
    "data"
}

#[tokio::main]
async fn main() {
    match timeout(Duration::from_millis(30), unreliable_fetch()).await {
        Ok(value) => println!("got: {value}"),
        Err(_elapsed) => println!("timed out"),
    }
}
`,
          solutionExplanation:
            'timeout races unreliable_fetch() (100ms) against an internal 30ms timer. Since the timer resolves first, timeout returns Err(Elapsed), unreliable_fetch\'s in-flight future is dropped (cancelled) without ever completing, and the program prints "timed out".',
          expectedOutputContains: ['timed out'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'How does Stream relate to Iterator and Future?',
            options: [
              { id: 'a', text: 'Stream produces many values over time, asynchronously — combining Iterator\'s "many values" with Future\'s "not ready yet, poll again" via poll_next returning Poll<Option<Item>>' },
              { id: 'b', text: 'Stream is just a renamed alias for Future with no real difference' },
              { id: 'c', text: 'Stream is the synchronous version of Future' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Iterator = many values, synchronous. Future = one value, asynchronous. Stream = many values, asynchronous — poll_next can return Pending between items, just like poll can on a plain future.',
          },
          {
            id: 'q2',
            prompt: 'In `tokio::select! { a = fut_a => ..., b = fut_b => ... }`, what happens to the branch that does NOT finish first?',
            options: [
              { id: 'a', text: 'It keeps running in the background until it eventually finishes on its own' },
              { id: 'b', text: 'Its future is dropped as soon as a winner is decided — this drop is how cancellation happens, there is no separate cancel() call' },
            ],
            correctOptionIds: ['b'],
            explanation: 'select! polls every branch, and the instant one resolves, every other branch\'s future is dropped without further polling. Async Rust has no cancel() method — dropping a Pending future IS cancelling it.',
          },
          {
            id: 'q3',
            prompt: 'What does tokio::time::timeout(duration, future) return when the duration elapses before the future resolves?',
            options: [
              { id: 'a', text: 'Ok(value), using a default value' },
              { id: 'b', text: 'Err(Elapsed), and the wrapped future is dropped without completing' },
              { id: 'c', text: 'It panics' },
            ],
            correctOptionIds: ['b'],
            explanation: 'timeout returns a Result<T, Elapsed>. If the timer wins the internal race, you get Err(Elapsed) and the original future — whatever work it was doing — is cancelled via drop.',
          },
          {
            id: 'q4',
            prompt: 'How does tokio::join!(fut_a, fut_b) differ from calling `fut_a.await` followed by `fut_b.await` sequentially?',
            options: [
              { id: 'a', text: 'There is no difference — join! is purely syntactic sugar for sequential awaiting' },
              { id: 'b', text: 'join! polls both futures concurrently on the same task, so their waiting time can overlap; sequential awaiting fully finishes fut_a before fut_b even starts making progress' },
            ],
            correctOptionIds: ['b'],
            explanation: 'join! interleaves polling of all given futures within the current task, so time spent Pending on one can overlap with progress on another — total time tends toward the SLOWEST future, not the sum of all of them.',
          },
          {
            id: 'q5',
            prompt: 'Why is Stream not part of std, unlike Future?',
            options: [
              { id: 'a', text: 'Stream currently lives in external crates (the `futures` crate, or `tokio_stream` as a Tokio-flavored wrapper) rather than in the standard library' },
              { id: 'b', text: 'Stream is a deprecated trait that no longer has any real use' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Only Future made it into std. Stream (and its ergonomic StreamExt combinators like .next()) live in the `futures` crate or `tokio_stream`, which you add as a dependency alongside tokio.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Macros: Declarative & Procedural
  // ---------------------------------------------------------------------
  'ra-macros': {
    id: 'ra-macros',
    heroSummary:
      'Macros write code that writes code, running at compile time before type checking even happens. macro_rules! matches patterns in your source syntax; procedural macros are full Rust functions that transform token streams — together they explain how vec![], println!, and #[derive(Debug)] all work.',
    dependencyChain: {
      learned: 'Generics and trait bounds — how to abstract over TYPES so one function or struct works for many of them, as long as the number and shape of arguments stays fixed.',
      why: 'Generics abstract over types, but they cannot abstract over SYNTAX — a variable number of arguments, a new keyword-like construct, or generating a trait impl automatically for every field of a struct. That is a different kind of repetition, and macros are the tool built for it.',
      build: 'macro_rules! pattern matching and repetition for declarative macros, and the three kinds of procedural macros (function-like, derive, attribute) at a conceptual level, plus a clear rule for when a macro is the right tool versus a function or generic.',
      next: 'unsafe Rust and FFI — another place where the language hands you a sharp, powerful tool and trusts you to use it deliberately.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Why generics are not enough',
        body: [
          "A generic function like `fn largest<T: PartialOrd>(list: &[T]) -> &T` abstracts over WHICH type you plug in, but the SHAPE of the call site never changes: `largest(&list)` always takes exactly one argument, of a fixed number and fixed structural role. No amount of generics lets you write a function that accepts 1 argument, or 2, or 7, all with the same name, the way `vec![1, 2, 3]` and `vec![1, 2, 3, 4, 5]` both work via `vec!`.",
          'Macros operate one level up: instead of operating on VALUES at runtime, they operate on SOURCE CODE (as a stream of tokens) at COMPILE time, before type checking happens, and produce more Rust source code as output, which is then compiled normally. This lets a macro abstract over syntax itself — variable argument counts, generating repetitive trait impls, or inventing what looks like a new bit of syntax.',
          'Rust has two macro systems: declarative macros (`macro_rules!`), which match a pattern against the tokens you write and substitute a template, and procedural macros, which are Rust functions that take a TokenStream in and produce a TokenStream out — arbitrary code, not just pattern substitution.',
        ],
        bullets: [
          'Generics: abstract over TYPES, fixed call shape, resolved partly at compile time via monomorphization, still normal function calls',
          'Macros: abstract over SYNTAX itself, expand to new source code BEFORE type checking, can accept a variable/unusual shape of input',
          'Rule of thumb: reach for a macro only when a function or generic literally cannot express what you need — usually variable-arity input or generating repetitive boilerplate',
        ],
      },
      {
        type: 'code',
        title: 'A minimal macro_rules!: building your own vec!-like macro',
        description: 'Pure std, no external crate needed — macro_rules! is part of the core language, so this runs anywhere.',
        code: `// my_vec![] mimics vec![]: accepts ANY number of comma-separated
// expressions and expands into code that pushes each one.
macro_rules! my_vec {
    // The empty case: my_vec![] with nothing inside.
    () => {
        Vec::new()
    };
    // $($x:expr),* matches zero or more expressions separated by commas,
    // binding each one to the repeated metavariable $x.
    ( $( $x:expr ),* ) => {
        {
            let mut v = Vec::new();
            $( v.push($x); )*   // this line is repeated once per matched $x
            v
        }
    };
}

fn main() {
    let empty: Vec<i32> = my_vec![];
    let nums = my_vec![1, 2, 3, 4];
    let words = my_vec!["a", "b"];

    println!("empty = {:?}", empty);
    println!("nums = {:?}", nums);
    println!("words = {:?}", words);
}
`,
        runnable: true,
      },
      {
        type: 'code',
        title: 'Variadic min!: repetition folding down to one expression',
        description: 'Also pure std, runnable as-is. Demonstrates recursive macro expansion, which is how many real macro_rules! macros handle a variable number of arguments.',
        code: `// min!(a) => a
// min!(a, b, ...) => the smaller of a and min!(b, ...) -- the macro
// expands recursively, one comparison per extra argument.
macro_rules! min {
    ( $x:expr ) => {
        $x
    };
    ( $x:expr, $( $rest:expr ),+ ) => {
        {
            let rest_min = min!( $( $rest ),+ );
            if $x < rest_min { $x } else { rest_min }
        }
    };
}

fn main() {
    println!("min!(5) = {}", min!(5));
    println!("min!(3, 1, 4, 1, 5) = {}", min!(3, 1, 4, 1, 5));
    println!("min!(9, 2) = {}", min!(9, 2));
}
`,
        runnable: true,
      },
      {
        type: 'explain',
        title: 'Procedural macros: three flavors, one shape',
        body: [
          "A procedural macro is a Rust function with the signature `fn(TokenStream) -> TokenStream` — it receives the tokens of whatever it's attached to, and returns tokens that REPLACE (or add to) them. Unlike macro_rules!, which is pattern-matching + substitution, a proc macro's body is arbitrary Rust code: you can parse the input (almost always with the `syn` crate), build up new syntax trees, and emit them (almost always with `quote!`). This is strictly more powerful, and strictly more work to write.",
          "There are three kinds. Function-like proc macros look like a macro call — `my_macro!(...)` — but the body can do anything, not just pattern-match. Derive macros are invoked via `#[derive(MyTrait)]` above a struct or enum, and their job is specifically to generate a trait impl FOR that type — this is how `#[derive(Debug)]`, `#[derive(Clone)]`, and `#[derive(Serialize)]` (serde) all work: each reads the struct's fields and emits an `impl Debug for YourType { ... }` block mechanically. Attribute macros look like `#[my_attribute]` placed above an item (often a function) and can rewrite that item's body arbitrarily — this is how `#[tokio::main]` transforms an `async fn main` into a synchronous one that boots a runtime, and how `#[async_trait]` reshapes trait methods to support async fns in traits.",
          "The hard constraint: a proc macro's DEFINING crate must be declared `proc-macro = true` in its Cargo.toml, and it can export ONLY proc-macro functions — no other public items. That is why proc macros always live in their own separate crate (often named `foo-derive` or `foo-macros` next to a `foo` crate that re-exports and uses them) — you cannot mix ordinary library code and proc-macro definitions in one crate.",
        ],
        bullets: [
          'Function-like: `my_macro!(...)` — arbitrary Rust code processes the input tokens, not just pattern substitution',
          'Derive: `#[derive(MyTrait)]` — reads a struct/enum\'s shape and generates a trait impl for it (Debug, Clone, Serialize, ...)',
          'Attribute: `#[my_attribute]` above an item — rewrites that item\'s tokens arbitrarily (#[tokio::main], #[async_trait])',
          'All three: fn(TokenStream) -> TokenStream, must live in a crate with `proc-macro = true`, and typically use the `syn` crate to parse input and `quote!` to build output',
        ],
        callout: {
          tone: 'warning',
          text: 'You will write macro_rules! far more often than proc macros. Proc macros need their own crate, the syn/quote dependencies, and meaningfully more boilerplate — most projects only reach for one when writing a library that others will #[derive(...)] against.',
        },
      },
      {
        type: 'code',
        title: 'Illustrative: a derive macro\'s shape (not runnable here)',
        description: 'Proc macros must be DEFINED in their own crate with `proc-macro = true` in Cargo.toml (e.g. a `describe-derive` crate exporting this function), and USED from a separate crate that depends on it. This snippet shows the shape of that defining crate using the syn/quote crates — it is illustrative only, not runnable as a standalone file, and needs `syn = "2"`, `quote = "1"`, and `proc-macro2 = "1"` as dependencies.',
        code: `// Cargo.toml for the macro-defining crate would need:
//   [lib]
//   proc-macro = true
//   [dependencies]
//   syn = "2"
//   quote = "1"

use proc_macro::TokenStream;
use quote::quote;
use syn::{parse_macro_input, DeriveInput};

// Invoked elsewhere as: #[derive(Describe)] on a struct.
#[proc_macro_derive(Describe)]
pub fn describe_derive(input: TokenStream) -> TokenStream {
    // Parse the tokens of whatever this is attached to into a syntax tree.
    let ast = parse_macro_input!(input as DeriveInput);
    let name = ast.ident; // the struct/enum's name

    // quote! builds the OUTPUT tokens: a new impl block for that type.
    let expanded = quote! {
        impl #name {
            fn describe() -> &'static str {
                stringify!(#name)
            }
        }
    };

    expanded.into()
}

// Usage from a DIFFERENT crate that depends on the one above:
//
// #[derive(Describe)]
// struct Widget;
//
// fn main() {
//     println!("{}", Widget::describe()); // prints "Widget"
// }
`,
        runnable: false,
      },
      {
        type: 'compare',
        title: 'macro_rules! vs procedural macros vs plain functions/generics',
        columns: [
          {
            heading: 'Function / generic',
            body: [
              'Operates on VALUES at runtime (or monomorphized per-type at compile time), fixed call shape.',
              'Use for: almost everything — the default tool.',
              'Simplest to write, read, and debug; full type checking on the definition itself.',
            ],
          },
          {
            heading: 'macro_rules!',
            body: [
              'Pattern-matches your literal source tokens and substitutes a template; can accept a variable number/shape of arguments via repetition ($(...)*).',
              'Use for: variadic-style APIs (vec!, my_vec!, min!), reducing boilerplate that a function\'s fixed signature cannot express.',
              'Lives inline in any crate, no extra dependencies, but error messages point at expansion sites and can be confusing.',
            ],
          },
          {
            heading: 'Procedural macro',
            body: [
              'A real Rust function: TokenStream in, TokenStream out — arbitrary logic, usually via syn (parse) + quote (emit).',
              'Use for: #[derive(...)] trait implementations, framework attributes like #[tokio::main], mini embedded-DSLs.',
              'Must live in its own proc-macro crate; most powerful, most machinery, hardest to debug — reach for this last.',
            ],
          },
        ],
      },
      {
        type: 'exercise',
        title: 'Exercise: a variadic max! macro',
        exercise: {
          problem:
            'Write a macro_rules! macro `max!` that takes one or more comma-separated expressions and expands to the largest of them — mirroring the min! macro above but keeping the larger value at each step. `max!(3, 7, 2)` should evaluate to `7`.',
          starterCode: `macro_rules! max {
    ( $x:expr ) => {
        $x
    };
    // TODO: handle two-or-more arguments by recursively computing
    // the max of the rest, then comparing $x against that.
}

fn main() {
    println!("max!(5) = {}", max!(5));
    println!("max!(3, 7, 2) = {}", max!(3, 7, 2));
    println!("max!(1, 9, 4, 9, 2) = {}", max!(1, 9, 4, 9, 2));
}
`,
          hints: [
            { title: 'Mirror min!\'s structure', body: 'The base case ($x:expr alone) just returns $x. The recursive case needs to match $x:expr followed by a comma and one-or-more more expressions: `$x:expr, $( $rest:expr ),+`.' },
            { title: 'Recurse, then compare', body: 'Inside the recursive arm, first compute `let rest_max = max!( $( $rest ),+ );` -- this expands the macro again on the remaining arguments -- then compare $x against rest_max and keep the larger one.' },
            { title: 'Wrap the block', body: 'Like min!, wrap the let + if in a `{ }` block so the whole arm evaluates to a single expression (the larger value), regardless of how many arguments were passed.' },
          ],
          solutionCode: `macro_rules! max {
    ( $x:expr ) => {
        $x
    };
    ( $x:expr, $( $rest:expr ),+ ) => {
        {
            let rest_max = max!( $( $rest ),+ );
            if $x > rest_max { $x } else { rest_max }
        }
    };
}

fn main() {
    println!("max!(5) = {}", max!(5));
    println!("max!(3, 7, 2) = {}", max!(3, 7, 2));
    println!("max!(1, 9, 4, 9, 2) = {}", max!(1, 9, 4, 9, 2));
}
`,
          solutionExplanation:
            'max! mirrors min! exactly, but flips the comparison: the recursive arm computes the max of everything after $x, then keeps $x only if it is strictly greater than that. The base case ($x:expr alone) terminates the recursion once only one expression remains, exactly as in min!.',
          expectedOutputContains: ['max!(5) = 5', 'max!(3, 7, 2) = 7', 'max!(1, 9, 4, 9, 2) = 9'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What can a macro do that a generic function cannot?',
            options: [
              { id: 'a', text: 'Run faster at runtime than a monomorphized generic function' },
              { id: 'b', text: 'Abstract over the SYNTAX and SHAPE of the call site itself — e.g. accepting a variable number of arguments — since macros operate on source tokens before type checking, not on fixed-arity function calls' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Generics abstract over types but keep a fixed call shape. Macros expand to new source code before type checking even starts, so they can accept things a function signature fundamentally cannot, like a variable number of comma-separated arguments.',
          },
          {
            id: 'q2',
            prompt: 'In `macro_rules! my_vec { ( $( $x:expr ),* ) => { ... $( v.push($x); )* ... } }`, what does `$( ... )*` mean?',
            options: [
              { id: 'a', text: 'It matches (or emits) the enclosed pattern zero or more times — once per comma-separated item that was matched' },
              { id: 'b', text: 'It matches exactly one occurrence, optionally' },
            ],
            correctOptionIds: ['a'],
            explanation: '$(...)* is macro_rules! repetition: on the matching side it captures zero-or-more repeated expressions into $x; on the template side, writing $( v.push($x); )* emits that line once per captured repetition.',
          },
          {
            id: 'q3',
            prompt: 'What are the three kinds of procedural macros?',
            options: [
              { id: 'a', text: 'Function-like (my_macro!(...)), derive (#[derive(MyTrait)]), and attribute (#[my_attribute])' },
              { id: 'b', text: 'Inline, external, and hybrid macros' },
              { id: 'c', text: 'Struct macros, enum macros, and trait macros' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Function-like macros look like macro calls but run arbitrary code; derive macros generate a trait impl from #[derive(...)]; attribute macros rewrite the item they annotate, like #[tokio::main] transforming an async main.',
          },
          {
            id: 'q4',
            prompt: 'Why must a procedural macro be defined in its own dedicated crate?',
            options: [
              { id: 'a', text: 'A crate with `proc-macro = true` in Cargo.toml can only export proc-macro functions — it cannot mix in ordinary public items, so proc-macro definitions and regular library code cannot share one crate' },
              { id: 'b', text: 'It is a historical convention with no real technical requirement behind it' },
            ],
            correctOptionIds: ['a'],
            explanation: 'The `proc-macro = true` crate setting is a hard compiler constraint: such a crate\'s public API can only be proc-macro entry points. That is why proc macros are always split into their own crate (often alongside a regular crate that re-exports them).',
          },
          {
            id: 'q5',
            prompt: 'Which of these is the best signal that you should reach for a macro rather than a function or generic?',
            options: [
              { id: 'a', text: 'You want the code to run marginally faster' },
              { id: 'b', text: 'You need to accept a variable number/shape of arguments, or generate repetitive code (like a trait impl per struct field) that a fixed function signature cannot express' },
              { id: 'c', text: 'You want to avoid writing type annotations' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Macros exist to abstract over syntax and repetition a function or generic literally cannot express — variadic call sites (vec!, min!) or mechanically generating boilerplate (derive). If a function or generic can express it, prefer that; it is simpler to read, write, and debug.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Unsafe/FFI, Performance & Error Design (added)
  // ---------------------------------------------------------------------
// ---------------------------------------------------------------------
  // ra-unsafe-ffi
  // ---------------------------------------------------------------------
  'ra-unsafe-ffi': {
    id: 'ra-unsafe-ffi',
    heroSummary:
      'Stepping outside the borrow checker on purpose, and calling into C. `unsafe` does not turn off Rust\'s rules — it unlocks exactly five additional capabilities the compiler cannot verify for you, and asks you to uphold their invariants by hand.',
    dependencyChain: {
      learned:
        'Deref and Drop — how smart pointers behave like the values they wrap, and run cleanup code automatically when they go out of scope.',
      why:
        'Some problems genuinely need to step outside what safe Rust can express: calling into a C library, hand-building a data structure the borrow checker cannot reason about, or implementing a smart pointer from scratch. `unsafe` is how you do that — as a narrow, explicit, auditable opt-out, not a blanket bypass of everything you have learned so far.',
      build:
        'Raw pointers (*const T / *mut T), the five specific things `unsafe` unlocks, and calling into C code through `extern "C"` blocks.',
      next:
        'Performance and zero-cost abstractions — once you can reason about raw memory yourself, you can reason precisely about what the compiler is (and is not) doing on your behalf at runtime.',
    },
    sections: [
      {
        type: 'explain',
        title: 'unsafe does not disable the borrow checker',
        body: [
          'This is the single most common misconception about `unsafe`: people assume it turns off Rust\'s safety checks. It does not. Ownership, moves, borrowing, and lifetimes are all still fully enforced inside an `unsafe` block — you cannot have two live mutable references to the same data there any more than anywhere else.',
          'What `unsafe` actually does is unlock exactly five additional capabilities that the compiler has no way to verify are correct, so it refuses to let you do them without an explicit signal that you have checked the invariants yourself:',
        ],
        bullets: [
          'Dereference a raw pointer (*const T / *mut T)',
          'Call an unsafe function or method — including functions declared in an extern "C" block',
          'Access or modify a mutable static variable',
          'Implement an unsafe trait',
          'Access a field of a union',
        ],
        callout: {
          tone: 'warning',
          text: '"unsafe" is a promise from you to the compiler: "I have manually verified an invariant that would normally be checked automatically." If that promise is wrong, the result is undefined behavior — not a panic, not a compile error, but a program that is allowed to do literally anything, including appearing to work correctly today and breaking tomorrow under a different compiler version or optimization level.',
        },
      },
      {
        type: 'explain',
        title: 'Raw pointers: *const T and *mut T',
        body: [
          'A raw pointer is just an address, with none of the guarantees a reference (&T / &mut T) gives you. You can create raw pointers in ordinary safe code — `&x as *const i32` — it is only *dereferencing* one that requires `unsafe`.',
        ],
        bullets: [
          'Raw pointers are allowed to be null, or to dangle (point at memory that has been freed or gone out of scope) — the compiler tracks none of this for them.',
          'Multiple *mut T pointers are allowed to alias the same location at the same time. Ordinary &mut T references forbid this at compile time; raw pointers simply do not enforce it.',
          'Raw pointers carry no lifetime. Nothing stops a *const T from outliving the value it originally pointed at.',
          'They are not automatically dereferenced, and there is no ownership implied — a raw pointer going out of scope does not drop anything.',
        ],
      },
      {
        type: 'code',
        title: 'Dereferencing a raw pointer safely, inside unsafe',
        description:
          'Two raw pointers to the SAME stack value — one immutable, one mutable — existing at the same time. Ordinary references could never do this; raw pointers can, because the borrow checker does not track them. Reading and writing through them still requires an unsafe block.',
        code: `fn main() {
    let mut num = 5;

    let r1 = &num as *const i32;
    let r2 = &mut num as *mut i32;

    unsafe {
        println!("r1 is: {}", *r1);
        *r2 += 5;
        println!("r2 is: {}", *r2);
    }

    println!("num is now: {}", num);
}
`,
        runnable: true,
      },
      {
        type: 'diagram',
        title: 'Raw pointers can alias — references cannot',
        description:
          'Step through what makes raw pointers different from references: two pointers to one location with no compiler-enforced aliasing rule, and the danger of a pointer that outlives its data.',
        diagram: {
          title: 'r1: *const i32 and r2: *mut i32, same address',
          height: 340,
          frames: [
            {
              caption: '`num` lives on the stack holding the value five. `r1`, an immutable raw pointer, is created from a reference to it.',
              nodes: [
                { id: 'num', label: 'num', sublabel: 'i32 = 5', tone: 'stack', x: 55, y: 70 },
                { id: 'r1', label: 'r1', sublabel: '*const i32', tone: 'default', x: 20, y: 25 },
              ],
              edges: [{ from: 'r1', to: 'num', label: 'points to' }],
            },
            {
              caption: 'Now `r2`, a MUTABLE raw pointer, is also created pointing at that exact same address. Ordinary references would never allow an immutable and a mutable borrow to coexist like this — raw pointers carry no such guarantee at all.',
              nodes: [
                { id: 'num', label: 'num', sublabel: 'i32 = 5', tone: 'stack', x: 55, y: 70 },
                { id: 'r1', label: 'r1', sublabel: '*const i32', tone: 'default', x: 15, y: 20 },
                { id: 'r2', label: 'r2', sublabel: '*mut i32', tone: 'accent', x: 90, y: 20 },
              ],
              edges: [
                { from: 'r1', to: 'num', label: 'points to' },
                { from: 'r2', to: 'num', label: 'also points to', tone: 'accent' },
              ],
            },
            {
              caption: 'Inside an unsafe block, dereferencing `r1` reads the value five directly out of that stack slot.',
              nodes: [
                { id: 'num', label: 'num', sublabel: 'i32 = 5', tone: 'stack', x: 55, y: 70 },
                { id: 'r1', label: 'r1', sublabel: '*const i32', tone: 'success', x: 15, y: 20 },
                { id: 'r2', label: 'r2', sublabel: '*mut i32', tone: 'accent', x: 90, y: 20 },
              ],
              edges: [
                { from: 'r1', to: 'num', label: 'unsafe { *r1 } reads 5', tone: 'success', animated: true },
                { from: 'r2', to: 'num', tone: 'accent' },
              ],
            },
            {
              caption: 'Writing through `r2` inside the same unsafe block overwrites that slot to ten. Both pointers see the change immediately, because they were never two copies of the data — they were always two names for the same address.',
              nodes: [
                { id: 'num', label: 'num', sublabel: 'i32 = 10', tone: 'warning', x: 55, y: 70 },
                { id: 'r1', label: 'r1', sublabel: '*const i32', tone: 'default', x: 15, y: 20 },
                { id: 'r2', label: 'r2', sublabel: '*mut i32', tone: 'success', x: 90, y: 20 },
              ],
              edges: [
                { from: 'r2', to: 'num', label: 'unsafe { *r2 += 5 }', tone: 'success', animated: true },
                { from: 'r1', to: 'num', tone: 'muted' },
              ],
            },
            {
              caption: 'Raw pointers carry no lifetime. Nothing stops the value they point at from going out of scope while the pointer itself still exists — leaving it dangling. Dereferencing a dangling pointer is undefined behavior: it might read garbage, might crash, or might quietly "work" today and break tomorrow.',
              nodes: [
                { id: 'gone', label: 'freed stack frame', shape: 'ghost', tone: 'muted', x: 55, y: 70 },
                { id: 'danglingptr', label: 'ptr', sublabel: '*const i32 — dangling', tone: 'danger', x: 55, y: 20 },
              ],
              edges: [{ from: 'danglingptr', to: 'gone', label: 'dereferencing = undefined behavior', tone: 'danger', dashed: true }],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'FFI: calling into C\'s abs() function',
        description:
          'extern "C" declares a function using the C calling convention — the ABI: how arguments are passed, how the return value comes back, and how the symbol is resolved at link time — instead of Rust\'s own unspecified convention. Every function declared inside an extern "C" block is implicitly unsafe to call, because the compiler cannot verify that the C side upholds Rust\'s safety invariants. This is the textbook example (it calls libc\'s abs) and it is correct, idiomatic FFI Rust: with a normal `cargo run` / `rustc` on macOS or Linux it compiles and links against the system libc with no extra Cargo.toml dependency, since std already links against it. Marked non-runnable here only because this specific in-browser playground sandbox may not link against a system libc the same way a real toolchain does — the code itself is real and correct.',
        code: `extern "C" {
    fn abs(input: i32) -> i32;
}

fn main() {
    unsafe {
        println!("Absolute value of -3 according to C: {}", abs(-3));
    }
}
`,
        runnable: false,
      },
      {
        type: 'exercise',
        title: 'Exercise: swap two values through raw pointers',
        exercise: {
          problem:
            'Implement `unsafe fn swap_via_raw_pointers(a: *mut i32, b: *mut i32)` so it swaps the values `a` and `b` point at, using only raw pointer reads and writes (no `std::mem::swap`). Then call it from `main` inside an `unsafe` block.',
          starterCode: `unsafe fn swap_via_raw_pointers(a: *mut i32, b: *mut i32) {
    // TODO: read *a and *b, then write each value back through the OTHER
    // pointer, so the two locations end up swapped.
}

fn main() {
    let mut x = 1;
    let mut y = 2;

    let ptr_x = &mut x as *mut i32;
    let ptr_y = &mut y as *mut i32;

    unsafe {
        swap_via_raw_pointers(ptr_x, ptr_y);
    }

    println!("x = {x}, y = {y}");
}
`,
          hints: [
            { title: 'Dereferencing needs unsafe', body: '`*a` reads the i32 living at that address, and `*a = value` writes to it. Both are only allowed inside an unsafe block or an unsafe fn body.' },
            { title: 'It is an ordinary three-step swap', body: 'Save `*a` into a temporary local first — otherwise you overwrite it before you have read it. Then: `*a = *b;` and finally write the saved temporary into `*b`.' },
            { title: 'Wrap the body in its own unsafe block too', body: 'Recent Rust editions warn if you dereference raw pointers inside an unsafe fn without an explicit inner `unsafe { ... }` block, even though the fn itself is already unsafe. Wrapping the three lines in `unsafe { ... }` keeps this warning-free across editions.' },
          ],
          solutionCode: `unsafe fn swap_via_raw_pointers(a: *mut i32, b: *mut i32) {
    unsafe {
        let temp = *a;
        *a = *b;
        *b = temp;
    }
}

fn main() {
    let mut x = 1;
    let mut y = 2;

    let ptr_x = &mut x as *mut i32;
    let ptr_y = &mut y as *mut i32;

    unsafe {
        swap_via_raw_pointers(ptr_x, ptr_y);
    }

    println!("x = {x}, y = {y}");
}
`,
          solutionExplanation:
            'This is a manual three-step swap performed through addresses instead of variable names: read `*a` into `temp` before anything is overwritten, copy `*b` into `*a`, then write `temp` (the original `*a`) into `*b`. Real code should almost always reach for `std::mem::swap(&mut x, &mut y)` instead — this exercise exists purely to practice raw pointer dereferencing and writing inside `unsafe`.',
          expectedOutputContains: ['x = 2, y = 1'],
        },
      },
      {
        type: 'debug',
        title: 'Fix the dangling raw pointer',
        challenge: {
          problem:
            'This program compiles with no errors or warnings about lifetimes at all — and yet reading `*ptr` in main is undefined behavior. Find out why the compiler let this through, and fix it.',
          brokenCode: `fn make_dangling() -> *const i32 {
    let x = 42;
    &x as *const i32
}

fn main() {
    let ptr = make_dangling();
    unsafe {
        println!("value = {}", *ptr);
    }
}
`,
          bugExplanation:
            'If `make_dangling` returned `&i32` (an ordinary reference), the borrow checker would reject this outright: a reference can never outlive the value it points at, and `x` is dropped the instant `make_dangling` returns. But `*const i32` is a raw pointer — the compiler tracks NO lifetime for it at all, so it happily lets you return a pointer to a value that is about to be destroyed. By the time `main` dereferences `ptr`, `x`\'s stack slot has been reclaimed; reading it is undefined behavior. It might print 42 anyway (nothing has overwritten that memory yet, purely by luck), or it might print garbage, or the behavior could change entirely with a different compiler version or optimization level — that unpredictability IS the bug. The type system offered no protection here because raw pointers are explicitly the tool you use when you are promising to track validity yourself.',
          hints: [
            { title: 'Compare it to returning a reference', body: 'Try changing the return type to `&i32` — rustc immediately rejects it with a lifetime error ("returns a reference to data owned by the current function"). The raw pointer version has no such check.' },
            { title: 'Where does x actually live?', body: '`x` is a local variable on `make_dangling`\'s stack frame. That frame is gone the moment the function returns — `x` does not get promoted anywhere just because you took a pointer to it.' },
            { title: 'What would a real fix look like?', body: 'Either return the value itself (by copy or move) instead of a pointer to a local, or restructure so the pointer is only ever used while its target is still guaranteed to be alive (e.g. the caller owns the value and passes a pointer INTO the function, rather than the function handing one back out).' },
          ],
          fixedCode: `fn make_value() -> i32 {
    let x = 42;
    x
}

fn main() {
    let value = make_value();
    println!("value = {value}");
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
            prompt: 'Which of these does the unsafe keyword actually do?',
            options: [
              { id: 'a', text: 'Disables the borrow checker and all of Rust\'s ownership rules for the duration of the block' },
              { id: 'b', text: 'Unlocks exactly five specific capabilities (like dereferencing a raw pointer or calling an unsafe fn) that the compiler cannot verify are correct on its own — everything else, including ownership and borrowing, is still fully enforced' },
              { id: 'c', text: 'Tells the compiler to skip type checking inside the block' },
            ],
            correctOptionIds: ['b'],
            explanation: 'unsafe is narrow by design. It is not a global safety switch — ownership, moves, and borrow checking on ordinary references all still apply inside an unsafe block. It only unlocks the five operations the compiler has no way to verify.',
          },
          {
            id: 'q2',
            prompt: 'Why can two raw pointers (*const T and *mut T) point at the same memory location at the same time, when two references (&T and &mut T) cannot?',
            options: [
              { id: 'a', text: 'References and raw pointers are actually identical; this is a common misconception' },
              { id: 'b', text: 'The borrow checker tracks aliasing rules for references, but raw pointers are explicitly not tracked by it at all — the aliasing guarantee simply does not exist for them' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Raw pointers are, by design, outside the borrow checker\'s reasoning. That is exactly why dereferencing one requires unsafe: you, not the compiler, are responsible for making sure no aliasing rule is actually being violated in a way that causes real problems.',
          },
          {
            id: 'q3',
            prompt: 'In the debug challenge, why did the compiler allow make_dangling to return a raw pointer to a local variable, when it would have rejected the equivalent code using a reference?',
            options: [
              { id: 'a', text: 'Because raw pointers carry no lifetime information for the compiler to check against' },
              { id: 'b', text: 'Because the compiler does check it, but only produces a warning instead of an error' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Lifetime checking is a property of references specifically. Raw pointers opt out of that checking entirely, which is precisely what makes returning one to a value that is about to be dropped compile without complaint — and dereferencing it later undefined behavior.',
          },
          {
            id: 'q4',
            prompt: 'What does extern "C" specify, and why does calling a function declared inside one require unsafe?',
            options: [
              { id: 'a', text: 'It specifies the C calling convention (the ABI) for the function; it is unsafe because the compiler cannot verify that the C side actually upholds Rust\'s safety invariants' },
              { id: 'b', text: 'It specifies that the function must be written in C source code and compiled by Rust itself' },
              { id: 'c', text: 'It is only a naming convention with no effect on how the function is actually called' },
            ],
            correctOptionIds: ['a'],
            explanation: 'extern "C" tells the compiler to use the C ABI for argument passing, return values, and symbol resolution, so Rust can link against foreign code. Since the compiler has no visibility into what that foreign code actually does, every call across that boundary is an unverifiable trust boundary — hence unsafe.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ra-performance
  // ---------------------------------------------------------------------
  'ra-performance': {
    id: 'ra-performance',
    heroSummary:
      "Why Rust's abstractions don't cost you at runtime, and how to prove it — from iterator chains that compile to the same assembly as a hand-written loop, to the very real vtable cost of dyn Trait, to how struct field order silently changes how much memory your data actually uses.",
    dependencyChain: {
      learned:
        'Static dispatch (generics, monomorphized to concrete code at compile time) versus dynamic dispatch (dyn Trait, a vtable lookup at runtime) — and that these are genuinely different mechanisms with different runtime costs.',
      why:
        'Rust promises abstractions with no runtime penalty, but that promise only means something once you can point at the assembly, or a benchmark, and actually verify it. This lesson gives you the vocabulary and the tools to check "zero-cost" instead of taking it on faith.',
      build:
        'Why iterator chains and generics compile down to code as tight as a hand-written loop, the right tool for each profiling question (cargo flamegraph, perf, criterion), and how struct field order affects memory layout through padding.',
      next:
        'Error design and logging — once your hot paths are provably correct and fast, the next production concern is making failures legible: well-designed error types and structured logs.',
    },
    sections: [
      {
        type: 'explain',
        title: 'What "zero-cost abstraction" actually promises',
        body: [
          'Bjarne Stroustrup\'s original formulation, which Rust adopts as a design principle, is two-sided: "what you don\'t use, you don\'t pay for" — and additionally, "what you do use, you couldn\'t hand code any better." An abstraction is zero-cost when the compiled output is indistinguishable in cost from what an expert would have written by hand without it.',
          'Iterator chains are the clearest example. `nums.iter().filter(...).map(...).sum()` looks like it allocates intermediate collections and pays for a chain of virtual calls between stages — but it does not. Each adapter (`filter`, `map`, `sum`) is a generic struct implementing `Iterator`, and the whole chain gets inlined and fused by the optimizer into a single tight loop, with no intermediate allocation and no per-element dispatch overhead. In a release build, it typically compiles to assembly indistinguishable from the equivalent hand-written for loop.',
          'Generics get their zero runtime cost from monomorphization: a generic function like `fn largest<T: PartialOrd>(items: &[T]) -> &T` is not compiled once and dispatched at runtime — the compiler generates a separate, fully concrete copy of it for every distinct type it is actually called with (largest::<i32>, largest::<String>, ...), exactly as if you had hand-written one function per type. Every call site is a direct, staticaly-known call the optimizer can inline freely. The tradeoff is binary size and compile time: more instantiations means more compiled code, not slower code.',
          'This is the direct opposite of dyn Trait\'s dispatch, which the previous lesson covered: a trait object is a fat pointer (data pointer + vtable pointer), and every method call through it is an indirect call resolved through that vtable at runtime. That indirection is small, but it is real — and just as importantly, it is usually an inlining barrier, which can prevent the optimizer from doing further optimizations across the call. Static dispatch (generics) has none of that cost; you are trading it for larger compiled output. Neither one is "wrong" — they are different points on the same tradeoff, and now you have language for both sides of it.',
        ],
      },
      {
        type: 'code',
        title: 'An iterator chain vs a hand-written loop',
        description:
          'Same computation, two styles. In a release build (`cargo build --release`), these two functions compile down to essentially the same machine code — no heap allocation for intermediate steps, no per-call overhead for filter/map, just a single fused loop. You can verify this yourself with a tool like godbolt.org or `cargo asm` on real hardware; here we can at least confirm they produce identical results.',
        code: `fn sum_of_squares_iterator(nums: &[i32]) -> i32 {
    nums.iter()
        .filter(|&&n| n % 2 == 0)
        .map(|&n| n * n)
        .sum()
}

fn sum_of_squares_loop(nums: &[i32]) -> i32 {
    let mut total = 0;
    for &n in nums {
        if n % 2 == 0 {
            total += n * n;
        }
    }
    total
}

fn main() {
    let nums = vec![1, 2, 3, 4, 5, 6];
    println!("iterator: {}", sum_of_squares_iterator(&nums));
    println!("loop:     {}", sum_of_squares_loop(&nums));
}
`,
        runnable: true,
      },
      {
        type: 'compare',
        title: 'Profiling tools: which question does each one answer?',
        columns: [
          {
            heading: 'cargo flamegraph',
            body: [
              'Answers: "where is my program actually spending its time?"',
              'Wraps a sampling profiler (perf on Linux, dtrace on macOS) and renders the results as an SVG flamegraph — wider frames mean more time spent in that function and everything it called.',
              'Best first step for "this is slow, but I don\'t know where" — it gives you a map before you start guessing.',
            ],
          },
          {
            heading: 'perf / Instruments',
            body: [
              'Answers: "what is the CPU actually doing, at a hardware level?"',
              'perf (Linux) and Instruments (macOS) are the low-level sampling profilers cargo flamegraph wraps for you — used directly, they expose cache misses, branch mispredictions, and instruction-level counters flamegraph summarizes away.',
              'Reach for these directly when a flamegraph has already pointed you at a hot function and you need to know WHY it is slow at the CPU level, not just that it is slow.',
            ],
          },
          {
            heading: 'criterion (cargo bench)',
            body: [
              'Answers: "is version A of this function actually faster than version B, with statistical confidence?"',
              'A benchmarking crate that runs your code many times, accounts for warm-up and system noise, and reports results with confidence intervals — unlike a naive std::time::Instant::now() timing, which is noisy enough to be misleading on a single run.',
              'Use it whenever you are making a specific, comparative performance claim ("this rewrite is faster") rather than just exploring where time goes.',
            ],
          },
        ],
      },
      {
        type: 'diagram',
        title: 'Same fields, different order: where the padding goes',
        description:
          'A struct with #[repr(C)] lays its fields out in memory in exactly the order you declare them — which means declaration order directly controls how much padding the compiler is forced to insert for alignment. Watch the byte layout change as the SAME four fields get reordered.',
        diagram: {
          title: 'OrderedC { a: u8, b: u32, c: u8, d: u16 } vs PackedC (reordered)',
          height: 320,
          frames: [
            {
              caption: 'OrderedC declares fields a, b, c, d in that order, and #[repr(C)] guarantees the compiler lays them out in memory in exactly that sequence, byte for byte, the same way C would.',
              nodes: [
                { id: 'a', label: 'a', sublabel: 'u8 · 1 byte', tone: 'stack', x: 9, y: 45 },
                { id: 'b', label: 'b', sublabel: 'u32 · 4 bytes', tone: 'stack', x: 50, y: 45 },
                { id: 'c', label: 'c', sublabel: 'u8 · 1 byte', tone: 'stack', x: 69, y: 45 },
                { id: 'd', label: 'd', sublabel: 'u16 · 2 bytes', tone: 'stack', x: 88, y: 45 },
              ],
            },
            {
              caption: 'b needs to start on a 4-byte boundary, but a only used up 1 byte — so the compiler must insert 3 padding bytes before b. A smaller gap appears before d for the same reason. Nothing is stored in that padding; it is purely wasted space spent satisfying alignment.',
              nodes: [
                { id: 'a', label: 'a', sublabel: 'u8 · 1 byte', tone: 'stack', x: 9, y: 45 },
                { id: 'pad1', label: 'padding', sublabel: '3 bytes, unused', tone: 'muted', shape: 'ghost', x: 24, y: 45 },
                { id: 'b', label: 'b', sublabel: 'u32 · 4 bytes', tone: 'stack', x: 50, y: 45 },
                { id: 'c', label: 'c', sublabel: 'u8 · 1 byte', tone: 'stack', x: 69, y: 45 },
                { id: 'pad2', label: 'pad', sublabel: '1 byte, unused', tone: 'muted', shape: 'ghost', x: 76, y: 45 },
                { id: 'd', label: 'd', sublabel: 'u16 · 2 bytes', tone: 'stack', x: 88, y: 45 },
              ],
            },
            {
              caption: 'Total: 1 + 3 + 4 + 1 + 1 + 2 = 12 bytes, of which 4 are pure padding — a third of the struct is wasted on alignment, purely because of declaration order.',
              nodes: [
                { id: 'ordc', label: 'OrderedC', sublabel: '12 bytes total (4 wasted)', tone: 'warning', shape: 'box', w: 70, h: 20, x: 50, y: 45 },
              ],
            },
            {
              caption: 'PackedC declares the exact same four fields — just reordered from largest alignment to smallest: b (4 bytes), then d (2 bytes), then a and c (1 byte each).',
              nodes: [
                { id: 'b2', label: 'b', sublabel: 'u32 · 4 bytes', tone: 'success', x: 20, y: 45 },
                { id: 'd2', label: 'd', sublabel: 'u16 · 2 bytes', tone: 'success', x: 55, y: 45 },
                { id: 'a2', label: 'a', sublabel: 'u8 · 1 byte', tone: 'success', x: 78, y: 45 },
                { id: 'c2', label: 'c', sublabel: 'u8 · 1 byte', tone: 'success', x: 91, y: 45 },
              ],
            },
            {
              caption: 'Every field now lands on a boundary it already satisfies — zero padding anywhere. Same data, same four fields, but reordering them alone shrinks the struct from 12 bytes to 8: a full third smaller, with nothing removed.',
              nodes: [
                { id: 'ordc2', label: 'OrderedC', sublabel: '12 bytes total', tone: 'warning', shape: 'box', w: 60, h: 18, x: 50, y: 25 },
                { id: 'packedc', label: 'PackedC', sublabel: '8 bytes total, zero padding', tone: 'success', shape: 'box', w: 40, h: 18, x: 50, y: 65 },
              ],
            },
          ],
        },
      },
      {
        type: 'code',
        title: 'Proving it with std::mem::size_of',
        description:
          "Rust's default struct layout (repr(Rust)) is deliberately left unspecified — the compiler is free to reorder your fields itself to minimize padding, so Ordered below will often print the same size as the hand-packed version even though it is declared in the \"bad\" order. #[repr(C)] turns that off: it forces the compiler to preserve your declared order exactly, which is what C (and therefore FFI) requires — and that is exactly where field order becomes YOUR responsibility again.",
        code: `struct Ordered {
    a: u8,
    b: u32,
    c: u8,
    d: u16,
}

#[repr(C)]
struct OrderedC {
    a: u8,
    b: u32,
    c: u8,
    d: u16,
}

#[repr(C)]
struct PackedC {
    b: u32,
    d: u16,
    a: u8,
    c: u8,
}

fn main() {
    println!("default repr(Rust), declared u8,u32,u8,u16: {} bytes", std::mem::size_of::<Ordered>());
    println!("repr(C), same declared order:                {} bytes", std::mem::size_of::<OrderedC>());
    println!("repr(C), fields reordered by alignment:       {} bytes", std::mem::size_of::<PackedC>());
}
`,
        runnable: true,
      },
      {
        type: 'exercise',
        title: 'Exercise: shrink a struct by reordering its fields',
        exercise: {
          problem:
            'Define `Packed` with the exact same four fields as `Inefficient` (`flag_a: bool`, `id: u64`, `flag_b: bool`, `count: u32`), reordered to minimize `std::mem::size_of::<Packed>()`. Use `#[repr(C)]` on both structs so the layout is deterministic and print both sizes.',
          starterCode: `#[repr(C)]
struct Inefficient {
    flag_a: bool,
    id: u64,
    flag_b: bool,
    count: u32,
}

// TODO: define \`Packed\` with the same four fields, reordered to minimize its size.

fn main() {
    println!("Inefficient: {} bytes", std::mem::size_of::<Inefficient>());
    // TODO: print size_of::<Packed>() too
}
`,
          hints: [
            { title: 'Sort by alignment, largest first', body: 'A field\'s alignment is (roughly) its own size for primitives. Put the 8-byte `u64` first, then the 4-byte `u32`, then the two 1-byte `bool`s last — each field then already sits on a boundary it needs, with no gap required before it.' },
            { title: 'There will still be SOME padding', body: 'The struct\'s overall alignment is the alignment of its widest field (8, from the u64), so its total size must be rounded up to a multiple of 8. Even the well-packed version has a couple of trailing padding bytes at the very end — that part is unavoidable, not a mistake.' },
            { title: '#[repr(C)] on both structs', body: 'Without it, the compiler is already free to reorder Inefficient\'s fields itself, which would hide the effect you are trying to demonstrate. #[repr(C)] pins both layouts to their declared order so the comparison is real.' },
          ],
          solutionCode: `#[repr(C)]
struct Inefficient {
    flag_a: bool,
    id: u64,
    flag_b: bool,
    count: u32,
}

#[repr(C)]
struct Packed {
    id: u64,
    count: u32,
    flag_a: bool,
    flag_b: bool,
}

fn main() {
    println!("Inefficient: {} bytes", std::mem::size_of::<Inefficient>());
    println!("Packed: {} bytes", std::mem::size_of::<Packed>());
}
`,
          solutionExplanation:
            'Inefficient interleaves a 1-byte bool, an 8-byte u64, another 1-byte bool, and a 4-byte u32 — each alignment jump forces the compiler to insert padding, ending at 24 bytes for only 14 bytes of real data. Packed puts the widest field (u64) first, then the next widest (u32), then the two bools together at the end where their 1-byte alignment needs nothing — landing at 16 bytes: a third smaller, for the exact same fields.',
          expectedOutputContains: ['Inefficient: 24 bytes', 'Packed: 16 bytes'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does "zero-cost abstraction" mean, precisely?',
            options: [
              { id: 'a', text: 'The abstraction has no cost at all, ever, under any circumstances' },
              { id: 'b', text: 'You do not pay any runtime cost for a feature you do not use, and the feature you DO use compiles to code as good as what an expert would hand-write without it' },
              { id: 'c', text: 'The abstraction is free to compile but may run slower than hand-written code' },
            ],
            correctOptionIds: ['b'],
            explanation: 'It is a two-sided promise: no penalty for unused features, and no penalty (versus optimal hand-written code) for the features you do use. Iterator chains compiling to the same assembly as a manual loop is the textbook example.',
          },
          {
            id: 'q2',
            prompt: 'What is monomorphization, and what does it cost you?',
            options: [
              { id: 'a', text: 'The compiler generates one concrete, fully-typed copy of a generic function per distinct type it is called with — this costs binary size and compile time, not runtime dispatch cost' },
              { id: 'b', text: 'The compiler picks the correct implementation of a generic function at runtime via a lookup table' },
              { id: 'c', text: 'It converts all generic code into dyn Trait objects automatically' },
            ],
            correctOptionIds: ['a'],
            explanation: 'Each concrete instantiation of a generic function is compiled separately, as if you had hand-written one version per type — the tradeoff is more compiled code and slower builds, not slower execution.',
          },
          {
            id: 'q3',
            prompt: 'Why does calling a method through dyn Trait have a real (if usually small) runtime cost that a generic function <T: Trait> does not?',
            options: [
              { id: 'a', text: 'dyn Trait methods are interpreted rather than compiled' },
              { id: 'b', text: 'The call goes through a vtable lookup at runtime (an indirect call), and that indirection is usually a barrier the optimizer cannot inline across — a monomorphized generic call is direct and fully inlinable' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A trait object is a fat pointer to data plus a vtable; every method call is resolved through that vtable at runtime. Static dispatch (generics) has no such indirection because the concrete type — and therefore the exact function — is known at compile time.',
          },
          {
            id: 'q4',
            prompt: 'You want a statistically credible answer to "is this refactor actually faster?" Which tool is built for exactly that question?',
            options: [
              { id: 'a', text: 'cargo flamegraph' },
              { id: 'b', text: 'criterion, via cargo bench' },
              { id: 'c', text: 'perf' },
            ],
            correctOptionIds: ['b'],
            explanation: 'criterion runs your code repeatedly, accounts for warm-up and system noise, and reports results with confidence intervals — a naive Instant::now() timing on one run is too noisy to trust for a comparative claim. flamegraph and perf answer "where is time going," not "is A faster than B."',
          },
          {
            id: 'q5',
            prompt: 'Why did reordering the SAME four fields in the diagram shrink OrderedC from 12 bytes to 8?',
            options: [
              { id: 'a', text: 'Because #[repr(C)] compresses fields automatically once they are reordered' },
              { id: 'b', text: 'Because putting the largest-aligned field first meant every subsequent field could start on a boundary it already satisfied, eliminating the padding bytes that alignment mismatches had forced in the original order' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Padding exists only to satisfy alignment requirements between fields. Ordering fields from largest alignment to smallest means each field\'s natural position already lands on a valid boundary for the next one, leaving nothing to pad.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // ra-error-design-logging
  // ---------------------------------------------------------------------
  'ra-error-design-logging': {
    id: 'ra-error-design-logging',
    heroSummary:
      'Designing error types for a library, and structured logging for production services. A quick Result<T, String> is fine for a script — a real library needs error types callers can match on and convert between, and a real service needs leveled, structured logs instead of println! debugging left in by accident.',
    dependencyChain: {
      learned:
        'Option<T> and Result<T, E> as ordinary enums, pattern matching with match, and the ? operator for propagating a single error type upward.',
      why:
        'ri-option-result got you propagating errors correctly. This lesson is about designing the error TYPE itself well: implementing std::error::Error and Display by hand so you understand exactly what a crate like thiserror is generating for you, knowing when a library should expose matchable variants versus when an application should reach for one catch-all error type, and where log and tracing fit once println! stops being enough.',
      build:
        'A hand-written error enum implementing std::error::Error, Display, and From; the thiserror crate that generates that same boilerplate from attributes; anyhow for applications that just want context attached to a dynamic error; and the role log/tracing play for structured, leveled logging.',
      next:
        'Testing, integration tests, and benchmarking — well-typed errors are exactly what you assert against in tests, and cargo bench is the same measurement discipline the performance lesson pointed you at, made precise.',
    },
    sections: [
      {
        type: 'explain',
        title: 'What makes an error type "library-quality"?',
        body: [
          'Returning `Result<T, String>` works, but it throws away information: the caller gets a message meant for a human, with no way to distinguish "the file was not found" from "the input was invalid" except by parsing text. A library-quality error type is an enum with one variant per distinct failure mode, so callers can `match` on exactly which one happened and react differently — retry on one variant, surface a user-facing message on another, propagate a third unchanged.',
          'To play well with the rest of Rust\'s error handling, that enum needs to implement three things: `std::fmt::Display` (a human-readable message), `std::error::Error` (which marks it as a "real" error type or the ecosystem, and lets it participate in a chain of causes via the `source()` method), and usually one or more `From<...>` impls so that `?` can convert an underlying error — like `std::io::Error` — into your type automatically at the point it is propagated.',
        ],
      },
      {
        type: 'code',
        title: 'A hand-written error enum, done properly',
        description:
          'Every piece of boilerplate here — Display, Error::source, and From<io::Error> — is exactly what a crate like thiserror generates for you from attributes, shown next. Understanding this version first is what makes the derive macro legible instead of magic.',
        code: `use std::error::Error;
use std::fmt;
use std::io;

#[derive(Debug)]
enum AppError {
    NotFound,
    InvalidInput(String),
    Io(io::Error),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound => write!(f, "resource not found"),
            AppError::InvalidInput(msg) => write!(f, "invalid input: {msg}"),
            AppError::Io(e) => write!(f, "io error: {e}"),
        }
    }
}

impl Error for AppError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            AppError::Io(e) => Some(e),
            _ => None,
        }
    }
}

impl From<io::Error> for AppError {
    fn from(e: io::Error) -> Self {
        AppError::Io(e)
    }
}

fn validate(input: &str) -> Result<(), AppError> {
    if input.is_empty() {
        return Err(AppError::InvalidInput("input cannot be empty".to_string()));
    }
    Ok(())
}

fn read_config() -> Result<String, AppError> {
    // std::fs::read_to_string returns Result<String, io::Error>; ? uses our
    // From<io::Error> impl above to convert it into AppError automatically.
    let contents = std::fs::read_to_string("config.toml")?;
    Ok(contents)
}

fn main() {
    match validate("") {
        Ok(()) => println!("input ok"),
        Err(e) => println!("validation failed: {e}"),
    }

    match read_config() {
        Ok(contents) => println!("config = {contents}"),
        Err(e) => println!("failed to read config: {e}"),
    }
}
`,
        runnable: true,
      },
      {
        type: 'code',
        title: 'The same type, with #[derive(thiserror::Error)]',
        description:
          'This needs the thiserror crate (add `thiserror = "1"` to Cargo.toml) — it is not in std, so this snippet is not runnable here, but it is the direct, correct equivalent of the hand-written version above. #[error("...")] generates the Display impl; #[from] on the Io field generates BOTH the From<io::Error> impl and wires that field up as the source() for Error::source — three hand-written impls collapse into attributes on the enum itself.',
        code: `use thiserror::Error;

#[derive(Debug, Error)]
enum AppError {
    #[error("resource not found")]
    NotFound,

    #[error("invalid input: {0}")]
    InvalidInput(String),

    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

// validate() and read_config() are IDENTICAL to the hand-written version —
// AppError's public shape (variants, Display, ?-compatibility via From) is
// unchanged. Only the ~15 lines of trait impls above have disappeared.
`,
        runnable: false,
      },
      {
        type: 'compare',
        title: 'thiserror vs anyhow: library vs application',
        columns: [
          {
            heading: 'thiserror — for libraries',
            body: [
              'You define a concrete enum with one variant per failure mode; thiserror derives Display/Error/From for you from attributes.',
              'Callers outside your crate can match on the specific variant and react differently — this is the whole point of exposing a real type instead of a string.',
              'Use it whenever OTHER code needs to distinguish between your error cases, not just print them.',
            ],
          },
          {
            heading: 'anyhow — for applications',
            body: [
              'anyhow::Error is one dynamic, type-erased error type that can hold ANY error implementing std::error::Error, plus an optional attached backtrace and a chain of ".context(...)" messages.',
              'You do not define variants at all — a binary\'s main() typically just wants "something failed, here is a readable chain of why," not a type callers will match on (there usually is no caller; it is the top of the program).',
              'Use it in application code (a CLI, a service\'s main.rs) where you are consuming errors from many different crates and just need to report them, not distinguish between them programmatically.',
            ],
          },
        ],
      },
      {
        type: 'explain',
        title: 'log and tracing: structured, leveled logging',
        body: [
          'println! is fine for a script, but it has no concept of severity, no way to be turned off in production without editing source, and no structure a log aggregator can filter or query on. The `log` crate is the standard facade for this: it provides five macros — `error!`, `warn!`, `info!`, `debug!`, `trace!` — plus a global logger interface, but no actual implementation. You choose a backend (commonly `env_logger`) that reads the `RUST_LOG` environment variable and decides which levels actually get printed and where.',
          'tracing goes further: alongside leveled events, it introduces spans — a way to record not just a single point in time but the START and END of an operation, with nested context. In an async service handling many concurrent requests on a small pool of threads, plain log lines from interleaved requests are impossible to untangle; a tracing span tagged with a request ID keeps every log line inside it correctly attributed to the request it belongs to, even as the executor hops between tasks. tracing-subscriber is its equivalent of env_logger — the backend that actually decides what gets printed and how.',
        ],
      },
      {
        type: 'code',
        title: 'Illustrative: log macros and their backend',
        description:
          'Needs the log crate for the macros plus a concrete backend to actually print anything (add `log = "0.4"` and `env_logger = "0.11"` to Cargo.toml) — log itself is only a facade with no built-in implementation, which is why nothing prints until env_logger::init() runs. Shown for illustration only; not runnable here.',
        code: `use log::{error, info, warn};

fn process_order(order_id: u64) {
    info!("processing order {order_id}");
    if order_id == 0 {
        warn!("order id is zero — this looks like a bug upstream");
    }
    error!("failed to charge payment for order {order_id}");
}

fn main() {
    env_logger::init(); // reads RUST_LOG to decide which levels actually print
    process_order(42);
}
`,
        runnable: false,
      },
      {
        type: 'exercise',
        title: 'Exercise: add a matchable variant to an error enum',
        exercise: {
          problem:
            'Add a `PermissionDenied(String)` variant to `AppError`, wire it into the `Display` impl (format it as `"permission denied: {msg}"`), and implement `check_access(is_admin: bool)` so it returns that variant with the message `"admin role required"` when `is_admin` is false, and `Ok(())` otherwise.',
          starterCode: `use std::fmt;

#[derive(Debug)]
enum AppError {
    NotFound,
    InvalidInput(String),
    // TODO: add a PermissionDenied(String) variant
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound => write!(f, "resource not found"),
            AppError::InvalidInput(msg) => write!(f, "invalid input: {msg}"),
            // TODO: format PermissionDenied as "permission denied: {msg}"
        }
    }
}

fn check_access(is_admin: bool) -> Result<(), AppError> {
    // TODO: return Err(AppError::PermissionDenied("admin role required".to_string()))
    // when is_admin is false, Ok(()) otherwise.
    Ok(())
}

fn main() {
    match check_access(false) {
        Ok(()) => println!("access granted"),
        Err(e) => println!("access check failed: {e}"),
    }

    match check_access(true) {
        Ok(()) => println!("access granted"),
        Err(e) => println!("access check failed: {e}"),
    }
}
`,
          hints: [
            { title: 'The new variant', body: 'Add `PermissionDenied(String)` as a third variant on the enum, right alongside NotFound and InvalidInput.' },
            { title: 'Matching it in Display', body: 'Add a new match arm before the closing brace: `AppError::PermissionDenied(msg) => write!(f, "permission denied: {msg}"),`.' },
            { title: 'The function body', body: 'An early return covers it: `if !is_admin { return Err(AppError::PermissionDenied("admin role required".to_string())); }` followed by `Ok(())`.' },
          ],
          solutionCode: `use std::fmt;

#[derive(Debug)]
enum AppError {
    NotFound,
    InvalidInput(String),
    PermissionDenied(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::NotFound => write!(f, "resource not found"),
            AppError::InvalidInput(msg) => write!(f, "invalid input: {msg}"),
            AppError::PermissionDenied(msg) => write!(f, "permission denied: {msg}"),
        }
    }
}

fn check_access(is_admin: bool) -> Result<(), AppError> {
    if !is_admin {
        return Err(AppError::PermissionDenied("admin role required".to_string()));
    }
    Ok(())
}

fn main() {
    match check_access(false) {
        Ok(()) => println!("access granted"),
        Err(e) => println!("access check failed: {e}"),
    }

    match check_access(true) {
        Ok(()) => println!("access granted"),
        Err(e) => println!("access check failed: {e}"),
    }
}
`,
          solutionExplanation:
            'The new variant carries a String just like InvalidInput does, so it slots into the existing Debug derive with no extra work. The Display match gains one arm formatting it the same way the others are formatted, and check_access returns it as an early Err exactly the way validate() did earlier in this lesson — a caller matching on AppError can now tell "permission" apart from "not found" or "bad input" instead of parsing a message string.',
          expectedOutputContains: ['access check failed: permission denied: admin role required', 'access granted'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why implement std::error::Error (with its source() method) instead of just Display, for an error type?',
            options: [
              { id: 'a', text: 'source() lets your error type report the underlying cause it wraps (e.g. the io::Error inside an Io variant), letting tools and calling code walk a full chain of causes back to the root' },
              { id: 'b', text: 'It is required before you can use the ? operator at all' },
              { id: 'c', text: 'It is purely cosmetic and has no functional effect' },
            ],
            correctOptionIds: ['a'],
            explanation: 'std::error::Error::source() is what lets an error report "and this is what caused ME" — tools like anyhow walk this chain to print a full causal history, not just the top-level message.',
          },
          {
            id: 'q2',
            prompt: 'A library crate exposes a function that can fail in three distinct, meaningfully different ways that callers need to branch on. Which crate is the better fit for its error type?',
            options: [
              { id: 'a', text: 'anyhow, since it is the more popular of the two' },
              { id: 'b', text: 'thiserror, since it produces a concrete enum with named variants callers can match on — exactly what "meaningfully different, needs branching" calls for' },
            ],
            correctOptionIds: ['b'],
            explanation: 'thiserror is for exactly this case: a real, matchable type. anyhow deliberately erases the concrete type, which is right for an application\'s top level but wrong when callers need to distinguish cases.',
          },
          {
            id: 'q3',
            prompt: 'What does the #[from] attribute do inside a #[derive(thiserror::Error)] enum?',
            options: [
              { id: 'a', text: 'It generates a From<TheFieldType> for TheEnum impl (and wires the field as that variant\'s source()), which is exactly what lets ? convert the underlying error automatically' },
              { id: 'b', text: 'It renames the field for display purposes only' },
              { id: 'c', text: 'It marks the field as optional' },
            ],
            correctOptionIds: ['a'],
            explanation: '#[from] is thiserror generating the same From impl (plus wiring source()) that was written out by hand in the std-only version earlier in this lesson — it is the mechanism that makes `some_io_call()?` work inside a function returning your custom error type.',
          },
          {
            id: 'q4',
            prompt: 'What does the log crate itself actually do, separate from a backend like env_logger?',
            options: [
              { id: 'a', text: 'It performs the actual writing of log lines to stdout, a file, or a remote collector' },
              { id: 'b', text: 'It is only a facade: the macros (info!, warn!, ...) and a global logger interface, with no built-in implementation — nothing is printed anywhere until a concrete backend like env_logger is initialized' },
            ],
            correctOptionIds: ['b'],
            explanation: 'log deliberately separates "what gets logged" (your code, via its macros) from "what happens to a logged event" (the backend you choose). Without initializing a backend, log macro calls are effectively no-ops.',
          },
          {
            id: 'q5',
            prompt: 'What does tracing add on top of what log already provides?',
            options: [
              { id: 'a', text: 'Faster macro expansion at compile time, with no other differences' },
              { id: 'b', text: 'Spans: recorded start/end context for an operation, so that concurrent, interleaved async tasks on the same thread pool can still be attributed correctly instead of their log lines being tangled together' },
            ],
            correctOptionIds: ['b'],
            explanation: 'log records isolated point-in-time events. tracing\'s spans record the duration and nested context of an operation, which is exactly what you need once many tasks are interleaving on a small pool of threads, as in an async service.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Testing, Workspace Architecture & Multithreaded Server Project (added)
  // ---------------------------------------------------------------------
// ─────────────────────────────────────────────────────────────────────
  // ra-testing-benchmarking
  // ─────────────────────────────────────────────────────────────────────
  'ra-testing-benchmarking': {
    id: 'ra-testing-benchmarking',
    heroSummary:
      'Rust ships its test runner in the toolchain, not as an add-on: #[test] functions, an external tests/ directory for testing your public API like an outsider, and even runnable code inside your documentation comments.',
    dependencyChain: {
      learned: 'Custom error enums and Result/? propagation, from Error Design & Logging.',
      why: "A hand-written error type is only trustworthy once you can prove, mechanically, which conditions produce which Err variant -- that proof is exactly what a test suite is.",
      build: '#[test] functions with assert!/assert_eq!/#[should_panic], the tests/ directory for integration tests against your crate\'s public API, and doc-tests that keep your documentation honest.',
      next: 'Cargo workspaces and rustdoc -- organizing a codebase (and its docs) once it outgrows a single crate.',
    },
    sections: [
      {
        type: 'explain',
        title: "Tests aren't a separate tool -- they're built into cargo",
        body: [
          "Rust treats testing as a first-class part of the language, not a third-party library you bolt on. `#[test]` is a built-in attribute, `cargo test` is a built-in subcommand, and the compiler itself understands the difference between a normal build and a test build.",
          'There are three distinct kinds of tests you\'ll write, and they answer three different questions. Unit tests (inline, in `#[cfg(test)] mod tests`) ask "does this one function behave correctly, including its private internals?" Integration tests (in a top-level `tests/` directory) ask "does my crate work correctly from the outside, using only what I\'ve made `pub`?" Doc-tests (inside `///` comments) ask "does the example I put in my documentation still actually work?"',
          "On top of correctness, `cargo bench` (or more commonly the `criterion` crate) answers a fourth question: not \"is it correct\" but \"is it fast, and did my last change make it faster or slower?\"",
        ],
        bullets: [
          'Unit tests: fast, inline, can see private items -- for testing implementation details.',
          'Integration tests: slower, external, only see `pub` items -- for testing the contract you promise callers.',
          'Doc-tests: examples in documentation that cargo actually compiles and runs as tests.',
          'Benchmarks: measure performance, not correctness, ideally with `criterion` for statistically sound results.',
        ],
      },
      {
        type: 'code',
        title: 'Unit tests: #[test], assert!, assert_eq!, and #[should_panic]',
        description:
          "This is real, complete code as it would appear in a library's src/lib.rs -- it has no fn main, so this playground can't execute it directly. `cargo test` is how you'd actually run it: it compiles the crate twice (once normally, once with #[cfg(test)] code included) and runs every function tagged #[test].",
        language: 'rust',
        runnable: false,
        code: `#[derive(Debug, PartialEq)]
pub enum WithdrawError {
    InsufficientFunds,
    AccountFrozen,
}

pub fn withdraw(balance: u64, amount: u64, frozen: bool) -> Result<u64, WithdrawError> {
    if frozen {
        return Err(WithdrawError::AccountFrozen);
    }
    if amount > balance {
        return Err(WithdrawError::InsufficientFunds);
    }
    Ok(balance - amount)
}

// #[cfg(test)] tells the compiler to include this module ONLY when building
// for tests -- it adds zero size and zero cost to a normal release build.
#[cfg(test)]
mod tests {
    // use super::* pulls in everything from the parent module, including
    // private items -- unit tests can see internals that outside callers can't.
    use super::*;

    #[test]
    fn withdraw_succeeds_when_funds_are_sufficient() {
        assert_eq!(withdraw(100, 40, false), Ok(60));
    }

    #[test]
    fn withdraw_fails_on_insufficient_funds() {
        assert_eq!(withdraw(100, 150, false), Err(WithdrawError::InsufficientFunds));
    }

    #[test]
    fn withdraw_fails_on_frozen_account() {
        let result = withdraw(100, 10, true);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), WithdrawError::AccountFrozen);
    }

    // #[should_panic] flips the pass/fail condition: this test PASSES only
    // if the code inside panics, and FAILS if it completes normally.
    #[test]
    #[should_panic]
    fn unwrapping_an_err_panics() {
        withdraw(100, 150, false).unwrap();
    }
}
`,
      },
      {
        type: 'terminal',
        title: 'Running it with cargo test',
        description:
          "cargo test compiles the crate's test binary and runs every #[test] function, reporting each one individually and then a summary line.",
        lines: [
          { prompt: '$', text: 'cargo test' },
          { text: 'running 4 tests' },
          { text: 'test tests::unwrapping_an_err_panics - should panic ... ok' },
          { text: 'test tests::withdraw_fails_on_frozen_account ... ok' },
          { text: 'test tests::withdraw_fails_on_insufficient_funds ... ok' },
          { text: 'test tests::withdraw_succeeds_when_funds_are_sufficient ... ok' },
          { text: '' },
          { text: 'test result: ok. 4 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out' },
        ],
      },
      {
        type: 'explain',
        title: 'Integration tests: proving the public API works from the outside',
        body: [
          "Anything placed under a top-level tests/ directory (a sibling of src/) is an integration test. Cargo compiles EACH FILE in tests/ as its own separate crate that depends on your library the same way an external user's project would -- via `use your_crate_name::{...}`.",
          "That's the key difference from unit tests: an integration test can only see items you marked `pub`. If a function is private, tests/ simply cannot reach it -- which is exactly the point. Integration tests validate the CONTRACT you're promising callers, not your internal implementation, so refactoring internals without changing the public API should never break them.",
          'Every `.rs` file directly under tests/ becomes its own test binary; `cargo test` builds and runs all of them alongside your unit tests and doc-tests.',
        ],
      },
      {
        type: 'code',
        title: 'tests/withdraw_test.rs',
        description:
          'Note the import: it goes through the crate name (my_bank, standing in for whatever this library is actually called), exactly like a downstream consumer of the crate would write it -- not through a relative module path.',
        language: 'rust',
        runnable: false,
        code: `// tests/withdraw_test.rs
//
// This file is compiled as its own crate, separate from src/lib.rs, so it
// can only use my_bank's public API -- exactly like a real external user.

use my_bank::{withdraw, WithdrawError};

#[test]
fn integration_withdraw_reports_insufficient_funds() {
    assert_eq!(withdraw(50, 100, false), Err(WithdrawError::InsufficientFunds));
}

#[test]
fn integration_withdraw_succeeds() {
    assert_eq!(withdraw(50, 20, false), Ok(30));
}
`,
      },
      {
        type: 'code',
        title: 'Doc-tests: examples cargo actually runs',
        description:
          "The fenced code block inside the /// comment below isn't just for show -- cargo test extracts it, compiles it as its own tiny program (with the crate name standing in for whatever you called your library), and runs it as a real test. If double()'s behavior ever changes, this example breaks right alongside your other tests. The fn main() below it is only here so THIS playground has something to execute; the doc-test itself lives inside the comment.",
        language: 'rust',
        runnable: true,
        code: `/// Doubles a number and returns the result.
///
/// # Examples
///
/// \`\`\`
/// assert_eq!(mathkit::double(21), 42);
/// \`\`\`
pub fn double(n: i32) -> i32 {
    n * 2
}

fn main() {
    println!("double(21) = {}", double(21));
}
`,
      },
      {
        type: 'code',
        title: 'Measuring performance: cargo bench and criterion',
        description:
          "Rust's built-in #[bench] attribute only works on nightly Rust, so almost every real project reaches for the criterion crate instead (added under [dev-dependencies], so it never affects your actual build). Criterion runs your function many times, applies statistics to filter out noise, and warns you when a change made things measurably slower or faster -- this snippet needs the external criterion crate and a benches/ directory, so it's illustrative rather than runnable here.",
        language: 'rust',
        runnable: false,
        code: `// benches/my_benchmark.rs -- requires criterion as a dev-dependency:
//
//   [dev-dependencies]
//   criterion = "0.5"
//
//   [[bench]]
//   name = "my_benchmark"
//   harness = false

use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 1,
        1 => 1,
        n => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn bench_fibonacci(c: &mut Criterion) {
    // black_box prevents the compiler from noticing the input never changes
    // and optimizing the whole call away -- without it you'd benchmark nothing.
    c.bench_function("fib 20", |b| b.iter(|| fibonacci(black_box(20))));
}

criterion_group!(benches, bench_fibonacci);
criterion_main!(benches);
`,
      },
      {
        type: 'exercise',
        title: 'Exercise: assert on the Err variant',
        exercise: {
          problem:
            "Implement `checkout(cart_total, wallet_balance)` so it returns `Err(CheckoutError::InsufficientFunds)` when the wallet can't cover the cart, and `Ok(remaining_balance)` otherwise. main() checks both paths with assert_eq! -- exactly the same assertions a real #[test] function would make, just called directly so this playground can run them.",
          starterCode: `#[derive(Debug, PartialEq)]
enum CheckoutError {
    InsufficientFunds,
}

fn checkout(cart_total: f64, wallet_balance: f64) -> Result<f64, CheckoutError> {
    // TODO: return Err(CheckoutError::InsufficientFunds) if wallet_balance < cart_total,
    // otherwise Ok(wallet_balance - cart_total)
    Ok(0.0)
}

fn main() {
    assert_eq!(checkout(30.0, 100.0), Ok(70.0));
    assert_eq!(checkout(150.0, 100.0), Err(CheckoutError::InsufficientFunds));
    println!("all checks passed");
}
`,
          hints: [
            { title: 'Check the failing condition first', body: 'if wallet_balance < cart_total, return Err(CheckoutError::InsufficientFunds) immediately.' },
            { title: 'Otherwise, wrap the successful result', body: 'Ok(wallet_balance - cart_total) is the remaining balance after the purchase.' },
            { title: 'assert_eq! needs Debug and PartialEq', body: 'That is exactly why CheckoutError derives both -- assert_eq! has to be able to compare and print Result<f64, CheckoutError> values.' },
          ],
          solutionCode: `#[derive(Debug, PartialEq)]
enum CheckoutError {
    InsufficientFunds,
}

fn checkout(cart_total: f64, wallet_balance: f64) -> Result<f64, CheckoutError> {
    if wallet_balance < cart_total {
        return Err(CheckoutError::InsufficientFunds);
    }
    Ok(wallet_balance - cart_total)
}

fn main() {
    assert_eq!(checkout(30.0, 100.0), Ok(70.0));
    assert_eq!(checkout(150.0, 100.0), Err(CheckoutError::InsufficientFunds));
    println!("all checks passed");
}
`,
          solutionExplanation:
            "checkout checks the failing condition up front and returns Err immediately, otherwise wrapping the arithmetic in Ok. Both assert_eq! calls compare a whole Result<f64, CheckoutError> value -- the second one specifically proves the function produces the right Err variant under the right condition, which is the heart of testing a fallible function.",
          expectedOutputContains: ['all checks passed'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does an integration test under tests/ fail to compile if it tries to call a private (non-pub) function?',
            options: [
              { id: 'a', text: "tests/ files don't support calling functions at all" },
              { id: 'b', text: 'Each file under tests/ is compiled as its own separate crate, so it only sees the library\'s public API -- exactly like a real external user would' },
              { id: 'c', text: 'Private functions can only be called from src/main.rs' },
              { id: 'd', text: 'tests/ can only test structs, never standalone functions' },
            ],
            correctOptionIds: ['b'],
            explanation: "Integration tests exist to validate the contract you're promising callers, not your internal implementation -- so Cargo compiles them as an external crate that can only reach pub items, the same access a downstream user would have.",
          },
          {
            id: 'q2',
            prompt: 'What does #[should_panic] change about a #[test] function?',
            options: [
              { id: 'a', text: 'It skips the test entirely' },
              { id: 'b', text: 'The test now passes only if the function panics, and fails if it completes normally' },
              { id: 'c', text: 'It runs the test twice to double-check the result' },
              { id: 'd', text: 'It silences println! output from the test' },
            ],
            correctOptionIds: ['b'],
            explanation: '#[should_panic] flips the usual pass/fail rule -- a panic is the expected, correct outcome, so the test fails if the code returns normally instead.',
          },
          {
            id: 'q3',
            prompt: 'What is a "doc-test"?',
            options: [
              { id: 'a', text: 'A comment that cargo ignores completely' },
              { id: 'b', text: 'A fenced code block inside a /// doc comment that cargo test actually compiles and runs, checking that your documentation\'s example still works' },
              { id: 'c', text: 'A special variant of #[cfg(test)] mod tests' },
              { id: 'd', text: 'A benchmark that only runs when generating documentation' },
            ],
            correctOptionIds: ['b'],
            explanation: 'cargo test extracts every fenced code block from your /// (and //!) doc comments, compiles each one as a tiny standalone program, and runs it -- so a documentation example that goes stale becomes a failing test, not silently wrong prose.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // ra-workspace-architecture
  // ─────────────────────────────────────────────────────────────────────
  'ra-workspace-architecture': {
    id: 'ra-workspace-architecture',
    heroSummary:
      'Real Rust projects split into multiple crates sharing one workspace -- a core library holding the logic, and thin binaries (or later, a Tauri app) that adapt it to a specific interface. This is the exact shape every Tauri app takes.',
    dependencyChain: {
      learned: 'How to write and run unit tests, integration tests, doc-tests, and benchmarks with confidence.',
      why: "A well-tested codebase still needs to be well-organized -- workspaces, a clean public API, and generated docs are what let a Rust project (and the people reading it) scale past a single file.",
      build: 'A Cargo workspace splitting logic into a core library crate and a thin binary crate, API design habits (impl AsRef<str>, returning Result instead of panicking, a minimal pub surface), and rustdoc basics.',
      next: "This exact core-crate + adapter-crate split is the shape every Tauri app takes -- a core crate holding your logic, and the Tauri app's src-tauri crate as the thin adapter exposing it to the webview.",
    },
    sections: [
      {
        type: 'explain',
        title: 'Why one crate becomes many',
        body: [
          "A `[workspace]` in Cargo.toml groups several crates so they share one Cargo.lock (every crate agrees on the same dependency versions) and one target/ directory (shared build artifacts, faster incremental builds). It is NOT a monorepo trick -- it's the normal way a non-trivial Rust project is organized.",
          'The most common split is a library crate holding all the real logic (fully testable in isolation, with zero knowledge of any user interface) plus one or more thin binary crates that adapt that logic to a specific front end: a CLI, a web server, a desktop app.',
          "This is directly where the course is headed. A Tauri application is a Rust workspace where one crate is your application's core logic, and another -- the auto-generated src-tauri crate -- is a thin adapter that exposes that logic as commands the webview frontend can call. Everything in this lesson about splitting core from cli applies unchanged when cli becomes src-tauri.",
        ],
      },
      {
        type: 'code',
        title: 'The workspace Cargo.toml files',
        description:
          "A workspace root Cargo.toml has no [package] section of its own -- just a [workspace] table listing member crates by directory. Each member is a completely normal crate with its own Cargo.toml.",
        language: 'toml',
        runnable: false,
        code: `# Cargo.toml  (workspace root -- lives at the project's top level)
[workspace]
members = ["core", "cli"]
resolver = "2"

# core/Cargo.toml
[package]
name = "core"
version = "0.1.0"
edition = "2021"

[dependencies]

# cli/Cargo.toml
[package]
name = "cli"
version = "0.1.0"
edition = "2021"

[dependencies]
core = { path = "../core" }
`,
      },
      {
        type: 'code',
        title: 'core/src/lib.rs and cli/src/main.rs',
        description:
          "core holds the logic and is unit-tested on its own, with no I/O and no knowledge of who's calling it. cli is a thin adapter: parse input, call into core, print the result. Since these are two separate crates in two separate files, this snippet won't run as a single program here -- it's shown to illustrate the split, not to execute.",
        language: 'rust',
        runnable: false,
        code: `// core/src/lib.rs
//
//! Core domain logic, with zero knowledge of any UI, CLI, or Tauri command.
//! This is exactly what a Tauri app's core crate will look like later.

pub fn greeting(name: &str) -> String {
    format!("Hello, {name}!")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn greets_by_name() {
        assert_eq!(greeting("Ferris"), "Hello, Ferris!");
    }
}

// cli/src/main.rs
//
// A thin adapter: parse input, call into core, print the result. A Tauri
// app's src-tauri crate plays exactly this role later, wiring commands to
// a webview frontend instead of a terminal.
fn main() {
    let name = std::env::args().nth(1).unwrap_or_else(|| "world".to_string());
    println!("{}", core::greeting(&name));
}
`,
      },
      {
        type: 'diagram',
        title: 'The shape that carries forward into Tauri',
        description: 'The same core-plus-adapter shape shows up again, unchanged, once the adapter crate becomes a Tauri app instead of a CLI.',
        diagram: {
          title: 'workspace: core + cli, then core + src-tauri',
          frames: [
            {
              caption: 'A workspace is one root Cargo.toml with a workspace table listing member crates -- here, a core library crate and a cli binary crate, sharing one Cargo.lock and one target directory.',
              nodes: [
                { id: 'workspace', label: 'workspace', sublabel: 'Cargo.toml', shape: 'ghost', tone: 'muted', x: 50, y: 10 },
                { id: 'core', label: 'core', sublabel: 'lib crate', tone: 'accent', x: 30, y: 55 },
                { id: 'cli', label: 'cli', sublabel: 'bin crate', tone: 'default', x: 70, y: 55 },
              ],
              edges: [
                { from: 'workspace', to: 'core', tone: 'muted', dashed: true },
                { from: 'workspace', to: 'cli', tone: 'muted', dashed: true },
              ],
            },
            {
              caption: 'cli depends on core through a path dependency and calls its public functions -- all the real logic lives in core, fully testable on its own with no CLI parsing or terminal I/O involved.',
              nodes: [
                { id: 'workspace', label: 'workspace', sublabel: 'Cargo.toml', shape: 'ghost', tone: 'muted', x: 50, y: 10 },
                { id: 'core', label: 'core', sublabel: 'lib crate', tone: 'accent', x: 30, y: 55 },
                { id: 'cli', label: 'cli', sublabel: 'bin crate', tone: 'default', x: 70, y: 55 },
              ],
              edges: [
                { from: 'workspace', to: 'core', tone: 'muted', dashed: true },
                { from: 'workspace', to: 'cli', tone: 'muted', dashed: true },
                { from: 'cli', to: 'core', label: 'depends on', tone: 'accent' },
              ],
            },
            {
              caption: 'A Tauri desktop app takes exactly this shape. Swap the cli binary crate for the auto-generated src-tauri crate -- it depends on the same kind of core crate, and exposes its functions as commands the webview frontend invokes, instead of printing to a terminal.',
              nodes: [
                { id: 'core', label: 'core', sublabel: 'lib crate', tone: 'accent', x: 25, y: 50 },
                { id: 'tauri-app', label: 'src-tauri', sublabel: 'tauri app crate', tone: 'default', x: 60, y: 50 },
                { id: 'webview', label: 'webview frontend', sublabel: 'HTML / CSS / JS', shape: 'ghost', tone: 'muted', x: 92, y: 50 },
              ],
              edges: [
                { from: 'tauri-app', to: 'core', label: 'depends on', tone: 'accent' },
                { from: 'webview', to: 'tauri-app', label: 'invoke() commands', tone: 'success', dashed: true },
              ],
            },
          ],
        },
      },
      {
        type: 'compare',
        title: 'What makes a good public API',
        columns: [
          {
            heading: 'Accept the general type',
            body: [
              'Prefer impl AsRef<str> (or &str) over String for parameters -- it lets callers pass a &str, String, or &String without an extra .to_string() or .clone() just to satisfy the signature.',
              'Prefer &[T] over &Vec<T> for the same reason -- a slice accepts arrays, Vecs, and other slices alike.',
            ],
          },
          {
            heading: 'Report failure, never panic',
            body: [
              'A library function that can fail should return Result<T, E>, letting the CALLER decide whether to unwrap(), log, retry, or propagate with ?.',
              'Reserve panic! for actual bugs -- violated invariants your own code guarantees -- not for input a caller could reasonably supply. An unrecognized config value is a Result, not a panic.',
            ],
          },
          {
            heading: 'Keep the public surface small',
            body: [
              "Everything is private by default; mark only what callers truly need as pub. A smaller public surface is fewer things you're promising to keep backwards-compatible forever.",
              "pub(crate) shares an item across your own crate's modules without exposing it to downstream users at all.",
            ],
          },
        ],
      },
      {
        type: 'code',
        title: 'Applying it: impl AsRef<str> and Result instead of panic',
        description: 'A small, self-contained example of the first two API design principles in action.',
        language: 'rust',
        runnable: true,
        code: `use std::fmt;

#[derive(Debug)]
pub struct BlankNameError;

impl fmt::Display for BlankNameError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "name must not be blank")
    }
}

// impl AsRef<str> accepts &str, String, and &String alike -- callers never
// need an extra .to_string() just to satisfy this signature.
pub fn greeting(name: impl AsRef<str>) -> Result<String, BlankNameError> {
    let name = name.as_ref();
    if name.trim().is_empty() {
        return Err(BlankNameError);
    }
    Ok(format!("Hello, {name}!"))
}

fn main() {
    let owned = String::from("Ferris");
    println!("{}", greeting(&owned).unwrap());  // &String -> works
    println!("{}", greeting("Crab").unwrap());   // &str    -> works
    println!("{}", greeting(owned).unwrap());    // String  -> works

    match greeting("   ") {
        Ok(s) => println!("{}", s),
        Err(e) => println!("rejected: {}", e),
    }
}
`,
      },
      {
        type: 'terminal',
        title: 'rustdoc: documentation as a first-class artifact',
        description:
          "Every /// comment attached to a public item (and every //! comment at the top of a module) is documentation source. cargo doc --open compiles all of it into a browsable HTML site and opens it -- the same kind of page you see on docs.rs for any published crate. Combined with the previous lesson's doc-tests, this means your documentation's examples are checked by the compiler, not just written in good faith.",
        lines: [
          { prompt: '$', text: 'cargo doc --open' },
          { text: 'Documenting core v0.1.0' },
          { text: 'Documenting cli v0.1.0' },
          { text: 'Finished generating documentation' },
          { text: '(opens target/doc/core/index.html in your default browser)' },
        ],
      },
      {
        type: 'exercise',
        title: 'Exercise: refactor toward a better API',
        exercise: {
          problem:
            "shout() below takes ownership of a String it doesn't need to own, and panics on empty input instead of reporting failure. Change its signature to `fn shout(text: impl AsRef<str>) -> Result<String, EmptyInputError>`, and update main() to call it without .to_string() and handle both the Ok and Err cases instead of letting it panic.",
          starterCode: `#[derive(Debug)]
struct EmptyInputError;

fn shout(text: String) -> String {
    if text.is_empty() {
        panic!("text must not be empty");
    }
    text.to_uppercase()
}

fn main() {
    println!("{}", shout("hello".to_string()));
    println!("{}", shout("".to_string()));
}
`,
          hints: [
            { title: 'Change the parameter type', body: 'fn shout(text: impl AsRef<str>) -> Result<String, EmptyInputError> accepts &str directly -- no .to_string() needed at the call site.' },
            { title: 'Get a &str inside the function', body: 'Call text.as_ref() first, then .is_empty() and .to_uppercase() work on that &str exactly as before.' },
            { title: 'Replace panic! with Err', body: 'return Err(EmptyInputError) instead of panicking -- the caller now decides what to do with bad input, using match or if let.' },
          ],
          solutionCode: `#[derive(Debug)]
struct EmptyInputError;

fn shout(text: impl AsRef<str>) -> Result<String, EmptyInputError> {
    let text = text.as_ref();
    if text.is_empty() {
        return Err(EmptyInputError);
    }
    Ok(text.to_uppercase())
}

fn main() {
    match shout("hello") {
        Ok(s) => println!("{}", s),
        Err(_) => println!("error: input was empty"),
    }

    match shout("") {
        Ok(s) => println!("{}", s),
        Err(_) => println!("error: input was empty"),
    }
}
`,
          solutionExplanation:
            'Accepting impl AsRef<str> instead of String means shout("hello") works without an explicit .to_string() -- the caller was never forced to allocate ownership it never needed. Returning Result<String, EmptyInputError> instead of panicking hands the failure decision to the caller: main() here chooses to print a message, but another caller could just as easily log the error, retry, or propagate it with ?.',
          expectedOutputContains: ['HELLO', 'error: input was empty'],
        },
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why do cli and core share one Cargo.lock and one target/ directory inside a workspace?',
            options: [
              { id: 'a', text: "It's an arbitrary Cargo requirement with no real benefit" },
              { id: 'b', text: 'Because workspace members are built as one unit -- shared dependency versions stay consistent across every crate, and build artifacts are reused instead of duplicated' },
              { id: 'c', text: 'Because binary crates are not allowed to have their own Cargo.lock' },
              { id: 'd', text: 'There is no shared state between workspace members' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A workspace exists specifically so related crates agree on one set of dependency versions and reuse compiled artifacts, instead of each crate resolving and building its dependency tree independently.',
          },
          {
            id: 'q2',
            prompt: 'Why is `impl AsRef<str>` often preferred over `String` as a function parameter type?',
            options: [
              { id: 'a', text: "It's required for the function to compile at all" },
              { id: 'b', text: "It lets callers pass a &str, String, or &String without an unnecessary allocation or clone just to satisfy the signature" },
              { id: 'c', text: 'String parameters are deprecated in modern Rust' },
              { id: 'd', text: "It makes the function's return type faster" },
            ],
            correctOptionIds: ['b'],
            explanation: 'impl AsRef<str> accepts any of the common string-ish types directly, so callers never need to add a throwaway .to_string() purely to match your signature.',
          },
          {
            id: 'q3',
            prompt: 'What generates the browsable HTML documentation produced by `cargo doc --open`?',
            options: [
              { id: 'a', text: 'Every // line comment anywhere in the crate' },
              { id: 'b', text: 'Every /// doc comment (and //! module-level doc comment) attached to a public item' },
              { id: 'c', text: 'Only the README.md file at the crate root' },
              { id: 'd', text: 'Comments written inside function bodies' },
            ],
            correctOptionIds: ['b'],
            explanation: 'rustdoc walks the public items in your crate and renders their attached /// and //! comments into HTML -- ordinary // comments inside function bodies are never included.',
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // ra-proj-multithreaded-server
  // ─────────────────────────────────────────────────────────────────────
  'ra-proj-multithreaded-server': {
    id: 'ra-proj-multithreaded-server',
    heroSummary:
      'A TCP server that binds a listener, hands every connection to a fixed-size thread pool instead of spawning threads without limit, and shuts down gracefully by joining every worker thread before exiting.',
    dependencyChain: {
      learned: 'A hand-rolled ThreadPool from the Thread Pools lesson: a Job type, a Message enum, Worker threads pulling jobs off a shared channel, and a Drop impl that joins every worker.',
      why: "A thread pool is only useful once it's driving real concurrent I/O -- accepting many TCP connections without spawning an unbounded number of OS threads, one per connection.",
      build: 'A TcpListener-based server that hands each connection to the pool for handling, plus the classic graceful-shutdown pattern: Drop sends a stop signal and joins every thread.',
      next: 'Async servers built on Tokio and Axum solve the same "handle many connections" problem with a fundamentally different, non-thread-per-task model -- coming up in Advanced Async Rust.',
    },
    sections: [
      {
        type: 'explain',
        title: "Reusing the thread pool for real I/O",
        body: [
          "The previous lesson built a ThreadPool from scratch: a fixed number of worker threads, a shared mpsc channel carrying boxed closures (Job = Box<dyn FnOnce() + Send + 'static>), and a Drop impl that sends a Terminate message to every worker and joins each thread before the pool itself is destroyed. None of that changes here -- it's reused exactly as-is.",
          "What's new is what the pool is doing work FOR: a TcpListener accepting real network connections. Instead of spawning a fresh OS thread per connection (which becomes catastrophically expensive under load) or handling connections one at a time on a single thread (which stalls every other client behind a slow one), each accepted connection is handed to pool.execute() and processed by whichever worker thread is free.",
          "This exact pattern -- bind, accept in a loop, hand off to a bounded pool, shut down by joining every worker -- is the classic ending of the Rust Book's own book-writing project, and it's foundational: every production server framework (including the async ones coming up later) is solving this same 'bounded concurrency' problem, just with a different execution model.",
        ],
        callout: {
          tone: 'accent',
          text: "The runnable demo below deliberately accepts only ONE connection (via .take(1)) so it terminates instead of listening forever. A real server drops that limit and loops indefinitely.",
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Bind a TcpListener and accept incoming connections in a loop.',
          'Reuse the hand-rolled ThreadPool from the previous lesson to handle each connection on a worker thread, instead of blocking the accept loop.',
          'Serve a minimal, canned HTTP response for each connection.',
          "Shut the server down gracefully: stop accepting, then let ThreadPool's Drop impl send Terminate to every worker and join each thread before the process exits.",
        ],
        steps: [
          {
            title: '1. Bind the listener',
            description:
              'TcpListener::bind returns as soon as the OS has a listening socket ready to accept connections. Binding to port 0 asks the OS to pick any free port itself, which is what makes this demo hermetic -- it never collides with a port already in use on the machine running it.',
            code: `let listener = TcpListener::bind("127.0.0.1:0").unwrap();
let addr = listener.local_addr().unwrap();
println!("server: listening on {}", addr);`,
          },
          {
            title: '2. Reuse the ThreadPool from the previous lesson',
            description:
              "Job, Message, Worker, and ThreadPool are unchanged from the Thread Pools lesson -- a fixed set of worker threads pull closures off a shared mpsc channel behind a Mutex. Their full definitions are omitted here since they're identical to before; you'll see them again in the complete program below.",
            code: `let pool = ThreadPool::new(4);`,
          },
          {
            title: '3. Accept connections and hand them to the pool',
            description:
              'listener.incoming() yields one Result<TcpStream, _> per connection as it arrives. Each connection is handed to pool.execute so a WORKER thread -- not the accept loop itself -- does the reading and writing. .take(1) limits this demo to exactly one connection so it terminates instead of listening forever; a real server would drop the .take(1) and loop indefinitely.',
            code: `for stream in listener.incoming().take(1) {
    let stream = stream.unwrap();
    pool.execute(move || {
        handle_connection(stream);
    });
}`,
          },
          {
            title: '4. Handle the connection',
            description:
              "Reading is a plain, blocking .read() call -- it returns as soon as ANY bytes are available; it does not wait for the client to close the socket. Writing back a full response and then letting stream drop at the end of the function closes the connection, which is exactly what unblocks the client's read_to_string() on the other end.",
            code: `fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 512];
    let n = stream.read(&mut buffer).unwrap();
    println!("server: read {} bytes from the client", n);

    let response = "HTTP/1.1 200 OK\\r\\n\\r\\nHello from the thread pool!";
    stream.write_all(response.as_bytes()).unwrap();
}`,
          },
          {
            title: '5. Shut down gracefully',
            description:
              "main() joins the client thread so its output prints before the program ends, then lets pool go out of scope. ThreadPool's Drop impl sends one Message::Terminate per worker and joins every worker thread, so the process never exits while a worker could still be mid-job.",
            code: `client.join().unwrap();
println!("main: shutting down");
// pool drops here: Drop sends one Message::Terminate per worker and joins
// every worker thread before the process actually exits.`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete multithreaded server',
        description:
          'A client thread stands in for a real network caller so this demo is self-contained: it connects to the server, sends one request, prints the response, and the whole program then exits cleanly instead of blocking forever.',
        language: 'rust',
        runnable: true,
        code: `use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;

// ---- The thread pool, unchanged from the previous lesson ----

type Job = Box<dyn FnOnce() + Send + 'static>;

enum Message {
    NewJob(Job),
    Terminate,
}

struct Worker {
    id: usize,
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Message>>>) -> Worker {
        let thread = thread::spawn(move || loop {
            let message = receiver.lock().unwrap().recv().unwrap();
            match message {
                Message::NewJob(job) => {
                    job();
                }
                Message::Terminate => {
                    break;
                }
            }
        });
        Worker { id, thread: Some(thread) }
    }
}

struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Message>,
}

impl ThreadPool {
    fn new(size: usize) -> ThreadPool {
        assert!(size > 0);
        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));
        let mut workers = Vec::with_capacity(size);
        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }
        ThreadPool { workers, sender }
    }

    fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.send(Message::NewJob(job)).unwrap();
    }
}

impl Drop for ThreadPool {
    fn drop(&mut self) {
        for _ in &self.workers {
            self.sender.send(Message::Terminate).unwrap();
        }
        for worker in &mut self.workers {
            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

// ---- The server itself ----

fn handle_connection(mut stream: TcpStream) {
    let mut buffer = [0; 512];
    let n = stream.read(&mut buffer).unwrap();
    println!("server: read {} bytes from the client", n);

    let response = "HTTP/1.1 200 OK\\r\\n\\r\\nHello from the thread pool!";
    stream.write_all(response.as_bytes()).unwrap();
    stream.flush().unwrap();
    // stream is dropped here, closing the socket -- that's what lets the
    // client's read_to_string() below see EOF and return.
}

fn main() {
    let listener = TcpListener::bind("127.0.0.1:0").unwrap();
    let addr = listener.local_addr().unwrap();
    println!("server: listening on {}", addr);

    let pool = ThreadPool::new(4);

    // A client thread stands in for a real caller connecting over the network,
    // so this whole demo is self-contained and terminates on its own.
    let client = thread::spawn(move || {
        let mut stream = TcpStream::connect(addr).unwrap();
        stream.write_all(b"GET / HTTP/1.1\\r\\n\\r\\n").unwrap();

        let mut response = String::new();
        stream.read_to_string(&mut response).unwrap();
        println!("client: received -> {:?}", response);
    });

    // Accept exactly one connection so this demo terminates instead of
    // blocking forever -- a real server would loop over listener.incoming()
    // without take(1).
    for stream in listener.incoming().take(1) {
        let stream = stream.unwrap();
        pool.execute(move || {
            handle_connection(stream);
        });
    }

    client.join().unwrap();
    println!("main: shutting down");
    // pool drops here: Drop sends one Message::Terminate per worker and
    // joins every worker thread before the process actually exits.
}
`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does this demo call .take(1) on listener.incoming()?',
            options: [
              { id: 'a', text: 'To reduce memory usage while accepting connections' },
              { id: 'b', text: 'So the accept loop terminates after one connection instead of blocking forever waiting for another connection that will never arrive' },
              { id: 'c', text: 'Because listener.incoming() can only ever accept one connection per program' },
              { id: 'd', text: 'It has no effect on this program' },
            ],
            correctOptionIds: ['b'],
            explanation: 'listener.incoming() is an infinite iterator of incoming connections; without a limit, the for loop would block indefinitely waiting for a second connection that never comes, so the demo would never reach its clean shutdown.',
          },
          {
            id: 'q2',
            prompt: 'What does implementing Drop for ThreadPool guarantee that simply letting the program end would not?',
            options: [
              { id: 'a', text: 'That the program runs faster' },
              { id: 'b', text: 'That every worker receives a Terminate message and is joined -- so the process never exits while a worker could still be mid-job' },
              { id: 'c', text: 'That deadlocks become impossible' },
              { id: 'd', text: 'That every struct containing a Vec must implement Drop' },
            ],
            correctOptionIds: ['b'],
            explanation: "Without Drop, the OS threads backing each Worker would simply be abandoned when the process exits -- Drop turns 'the pool goes out of scope' into an explicit, orderly shutdown: signal every worker, then wait for each one to actually finish.",
          },
          {
            id: 'q3',
            prompt: "In handle_connection, why does the client's read_to_string() eventually return instead of blocking forever?",
            options: [
              { id: 'a', text: 'Because the server calls stream.flush()' },
              { id: 'b', text: 'Because the TcpStream inside handle_connection is dropped at the end of the function, closing the connection and sending the client an end-of-file signal' },
              { id: 'c', text: 'Because read_to_string has a built-in timeout' },
              { id: 'd', text: 'Because the client explicitly calls a shutdown method' },
            ],
            correctOptionIds: ['b'],
            explanation: 'read_to_string keeps reading until it sees EOF. Nothing on the client side triggers that -- it happens because the server-side stream variable goes out of scope and is dropped at the end of handle_connection, which closes that end of the TCP connection.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Axum HTTP Server, REST API & WebSocket Projects (added)
  // ---------------------------------------------------------------------
// ────────────────────────────────────────────────────────────────────────
  // ra-proj-async-http-server
  // ────────────────────────────────────────────────────────────────────────
  'ra-proj-async-http-server': {
    id: 'ra-proj-async-http-server',
    heroSummary:
      'Build a small async web server with Tokio and Axum — a handful of routes, a path parameter, and a JSON body — and see how Axum turns ordinary async functions into HTTP handlers with almost no boilerplate.',
    dependencyChain: {
      learned: 'async fn, .await, #[tokio::main], and spawning tasks onto the Tokio runtime.',
      why: 'Every real Rust web service is an async program: a request handler awaits a database call, another handler awaits a downstream HTTP call, and the runtime interleaves thousands of these without spinning up a thread per connection. Axum is the thin, idiomatic layer that turns that async foundation into routes and handlers.',
      build: 'A working Axum app: a Router wired to async handler functions, a path extractor, a JSON extractor, and the axum::serve entry point that replaces manual TCP accept loops.',
      next: 'The Production-Style REST API project takes this exact app and hardens it — proper error types, shared state, and integration tests.',
    },
    sections: [
      {
        type: 'explain',
        title: 'What Axum actually is',
        body: [
          "Axum is not a framework in the Django/Rails sense — it's a thin routing and extraction layer built directly on top of Tokio and hyper (the HTTP implementation). There's no magic reflection or code generation: a \"handler\" is just an async fn whose argument types and return type Axum knows how to plug into an HTTP request/response cycle.",
          'The core idea is extractors. Each argument to a handler function is a type that knows how to pull itself out of an incoming request — Path<T> pulls a URL segment, Json<T> deserializes the request body, State<T> hands you shared app state. Axum inspects the function signature and wires the right extractor for each argument automatically, in argument order.',
          "The return type works the same way in reverse: anything implementing IntoResponse can come back from a handler — a String, a &'static str, a (StatusCode, String) tuple, or Json<T> for a JSON body. Axum converts it into an HTTP response for you.",
          "A Router maps a path and HTTP method to a handler. Router::new().route(\"/users/:id\", get(get_user)) says: a GET request whose path matches /users/:id gets dispatched to get_user, with the :id segment available to a Path<u32> extractor inside it.",
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Add tokio (with the "full" feature set), axum, serde, and serde_json as dependencies.',
          'Write a GET / handler that returns a plain greeting.',
          'Write a GET /users/:id handler that extracts a path parameter and returns it in the response.',
          'Write a POST /users handler that deserializes a JSON body and echoes it back as JSON.',
          'Wire all three routes into one Router and serve it with axum::serve on a TcpListener.',
        ],
        steps: [
          {
            title: '1. Dependencies',
            description:
              'This project needs four crates in Cargo.toml. tokio needs the "full" feature for its macros and networking; serde needs "derive" so you can #[derive(Serialize, Deserialize)] on your own structs.',
            code: `[dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.7"
serde = { version = "1", features = ["derive"] }
serde_json = "1"`,
          },
          {
            title: '2. A trivial GET handler',
            description:
              "The simplest possible handler: no arguments, a string return type. String implements IntoResponse directly, so Axum turns it into a 200 OK with a text/plain body — no extractor, no wrapping required.",
            code: `async fn root() -> String {
    "Hello from Axum!".to_string()
}`,
          },
          {
            title: '3. A path parameter with Path<T>',
            description:
              'Path<u32> extracts the :id segment of the URL and parses it into a u32. If the segment cannot be parsed (e.g. someone requests /users/abc), Axum rejects the request with a 400 before your handler body ever runs — the extractor validates for you.',
            code: `use axum::extract::Path;

async fn get_user(Path(id): Path<u32>) -> String {
    format!("You asked for user #{id}")
}`,
          },
          {
            title: '4. A JSON body with Json<T>',
            description:
              'Define a struct that mirrors the expected request shape and derive Serialize and Deserialize on it. Json<CreateUser> as an argument deserializes the request body into that struct (returning 400 Unprocessable Entity on malformed JSON); returning Json<T> serializes a value back out as the response body with a Content-Type: application/json header set automatically.',
            code: `use axum::Json;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
struct CreateUser {
    name: String,
    email: String,
}

async fn create_user(Json(payload): Json<CreateUser>) -> Json<CreateUser> {
    // In a real app you'd persist \`payload\` here. For now, just echo it back
    // to prove the round-trip: JSON in, same JSON out.
    Json(payload)
}`,
          },
          {
            title: '5. Wire up the Router and serve it',
            description:
              'Router::new().route(path, method(handler)) registers each endpoint; .route() calls chain because each one returns Self. axum::serve takes a tokio::net::TcpListener (bound with the async TcpListener::bind(...).await) and the Router, and drives the accept loop itself — this is the modern axum 0.7 entry point, replacing the older axum::Server::bind API.',
            code: `use axum::{routing::{get, post}, Router};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(root))
        .route("/users/:id", get(get_user))
        .route("/users", post(create_user));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete async HTTP server',
        description:
          'Requires tokio = { version = "1", features = ["full"] }, axum = "0.7", serde = { version = "1", features = ["derive"] }, and serde_json = "1" in Cargo.toml. This binds a real socket and runs an accept loop forever, so it is not runnable in the in-browser playground — read it as the reference shape for a real Axum project (e.g. run with `cargo run` and hit it with `curl localhost:3000`, `curl localhost:3000/users/7`, or `curl -X POST localhost:3000/users -H "content-type: application/json" -d \'{"name":"Ada","email":"ada@example.com"}\'`).',
        language: 'rust',
        runnable: false,
        code: `use axum::{
    extract::Path,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
struct CreateUser {
    name: String,
    email: String,
}

async fn root() -> String {
    "Hello from Axum!".to_string()
}

async fn get_user(Path(id): Path<u32>) -> String {
    format!("You asked for user #{id}")
}

async fn create_user(Json(payload): Json<CreateUser>) -> Json<CreateUser> {
    // Echo the parsed body straight back out as JSON, proving the
    // deserialize -> handle -> serialize round trip works end to end.
    Json(payload)
}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(root))
        .route("/users/:id", get(get_user))
        .route("/users", post(create_user));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'How does Axum know that `Path(id): Path<u32>` should come from the URL and not, say, the request body?',
            options: [
              { id: 'a', text: 'Axum guesses based on the argument name "id".' },
              { id: 'b', text: 'Each extractor type (Path<T>, Json<T>, State<T>, ...) implements a trait that defines how to pull itself out of a request; Axum just calls it.' },
              { id: 'c', text: 'You must manually register which argument maps to which part of the request.' },
              { id: 'd', text: 'Axum always assumes the first argument is a path parameter.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Extraction is trait-based (FromRequestParts / FromRequest), not name- or position-based magic. Path<T> knows to look at route parameters; Json<T> knows to look at (and deserialize) the body.',
          },
          {
            id: 'q2',
            prompt: 'What happens if a client requests GET /users/abc against this server?',
            options: [
              { id: 'a', text: 'get_user runs with id set to 0.' },
              { id: 'b', text: 'The server panics and crashes.' },
              { id: 'c', text: 'The Path<u32> extractor fails to parse "abc" as a u32 and Axum returns a 400 before get_user\'s body ever runs.' },
              { id: 'd', text: 'Axum falls back to treating it as a string automatically.' },
            ],
            correctOptionIds: ['c'],
            explanation: 'Extraction can fail, and Axum handles that failure by rejecting the request with an appropriate error response — your handler code only runs once every extractor has succeeded.',
          },
          {
            id: 'q3',
            prompt: 'Why does axum::serve take a tokio::net::TcpListener instead of just a port number or address string?',
            options: [
              { id: 'a', text: 'It doesn\'t — this is legacy code from an older axum version.' },
              { id: 'b', text: 'Binding the socket is a separate, fallible async step (it can fail if the port is in use); passing the already-bound listener keeps that concern out of axum::serve itself.' },
              { id: 'c', text: 'TcpListener is required so Axum can support UDP as well.' },
              { id: 'd', text: 'It\'s purely stylistic and has no functional reason.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'You bind and .await the listener yourself (so you control and can inspect/log the bind step, e.g. via listener.local_addr()), then hand the ready listener to axum::serve, which owns the accept loop from that point on.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // ra-proj-rest-api
  // ────────────────────────────────────────────────────────────────────────
  'ra-proj-rest-api': {
    id: 'ra-proj-rest-api',
    heroSummary:
      'Turn the toy Axum app into something closer to production: a real error type that maps domain failures to HTTP status codes, shared in-memory state behind Arc<Mutex<...>>, and an integration test that exercises a route without opening a socket.',
    dependencyChain: {
      learned: 'A basic Axum Router with GET/POST handlers using Path and Json extractors, from the Async HTTP Server project.',
      why: 'A demo server that just returns strings is one unwrap() away from crashing on bad input. Real services need handlers that return typed errors mapped to correct status codes, state that survives across requests, and tests that don\'t require spinning up an actual TCP listener for every CI run.',
      build: 'A custom AppError enum implementing IntoResponse, Arc<Mutex<HashMap<...>>> as shared state via the State extractor, and the Router + tower::ServiceExt::oneshot pattern for in-process integration tests.',
      next: 'The Database-Backed Service project swaps the in-memory HashMap for a real sqlx-backed store behind the same State<AppState> shape.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Three things a toy server is missing',
        body: [
          "Error handling. Right now a handler that can fail has nowhere good to put that failure — you either .unwrap() (and crash the whole worker task on bad input) or manually match and return raw (StatusCode, String) tuples everywhere, which gets repetitive and inconsistent fast. The fix is a custom error enum that implements Axum's IntoResponse trait once, so every handler can just use `Result<Json<T>, AppError>` and get consistent status codes and JSON error bodies for free via `?`.",
          "Shared state. Handlers are plain functions — they don't have `self`, so where do they keep data between requests? Axum's State<T> extractor is the answer: you build one shared value, hand a clone of it to `Router::with_state`, and every handler that asks for `State<AppState>` gets access to the same underlying data. Since multiple requests run concurrently, that shared data needs the same Arc<Mutex<T>> pattern from the concurrency chapter — Arc for shared ownership across tasks, Mutex for exclusive access while mutating.",
          "Tests that don't bind a socket. Testing a real HTTP API by spawning a server and firing curl at it is slow and flaky (port conflicts, timing). Because a Router is just a tower::Service, you can build one in a test, construct a Request by hand, and call it directly in-process with `ServiceExt::oneshot` — no network, no listener, just calling the same routing/extraction/handler code path a real request would take.",
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Add tower and tower-http (for tests) and confirm axum, tokio, serde, and serde_json are in Cargo.toml.',
          'Define an AppError enum and implement IntoResponse for it so failures become correct HTTP responses.',
          'Define AppState holding an Arc<Mutex<HashMap<u32, User>>> and thread it through the Router with State.',
          'Rewrite the user handlers to read/write shared state and return Result<Json<T>, AppError>.',
          'Write an integration test that calls a route via Router + oneshot, with no real socket involved.',
        ],
        steps: [
          {
            title: '1. Dependencies',
            description:
              'Same core four as the previous project, plus tower for the Service trait used in tests. tower-http is optional here but commonly added alongside it for tracing/logging middleware in a real service.',
            code: `[dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.7"
serde = { version = "1", features = ["derive"] }
serde_json = "1"

[dev-dependencies]
tower = { version = "0.4", features = ["util"] }`,
          },
          {
            title: '2. A real error type',
            description:
              "AppError models the ways a handler can fail as data, not ad-hoc strings. Implementing IntoResponse for it means every handler that returns Result<_, AppError> gets consistent, correct status codes just by using `?` — no repeated match blocks scattered across handlers.",
            code: `use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

enum AppError {
    NotFound,
    InvalidInput(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "user not found".to_string()),
            AppError::InvalidInput(msg) => (StatusCode::BAD_REQUEST, msg),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}`,
          },
          {
            title: '3. Shared state behind Arc<Mutex<...>>',
            description:
              "AppState is the single value every handler will share. Wrapping the HashMap in Mutex gives exclusive access during a mutation, and wrapping that in Arc lets every cloned handle share ownership of the same underlying data across concurrently-running request tasks — the exact Arc<Mutex<T>> pattern from the concurrency chapter, just applied to HTTP handlers instead of spawned threads.",
            code: `use std::{collections::HashMap, sync::{Arc, Mutex}};
use serde::{Deserialize, Serialize};

#[derive(Clone, Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

#[derive(Clone)]
struct AppState {
    users: Arc<Mutex<HashMap<u32, User>>>,
}

impl AppState {
    fn new() -> Self {
        AppState { users: Arc::new(Mutex::new(HashMap::new())) }
    }
}`,
          },
          {
            title: '4. Handlers that use State and return Result',
            description:
              "State<AppState> is just another extractor argument, resolved from the state passed to Router::with_state. Each handler locks the Mutex only for as long as it needs it, then returns Result<Json<T>, AppError> — the ? operator on a failed lookup converts straight into the matching HTTP response via the IntoResponse impl above.",
            code: `use axum::extract::{Path, State};

async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<u32>,
) -> Result<Json<User>, AppError> {
    let users = state.users.lock().unwrap();
    users.get(&id).cloned().map(Json).ok_or(AppError::NotFound)
}

async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<User>,
) -> Result<Json<User>, AppError> {
    if payload.name.trim().is_empty() {
        return Err(AppError::InvalidInput("name must not be empty".into()));
    }
    let mut users = state.users.lock().unwrap();
    users.insert(payload.id, payload.clone());
    Ok(Json(payload))
}`,
          },
          {
            title: '5. An integration test with oneshot',
            description:
              "tower::ServiceExt::oneshot sends a single Request through a Service and awaits its Response — and Router implements Service, so you can build the exact same app used in main() and drive it directly, with no bound port, no client, and no timing flakiness. This is the standard way to integration-test an Axum app.",
            code: `#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use tower::ServiceExt; // for \`.oneshot()\`

    #[tokio::test]
    async fn get_user_not_found_returns_404() {
        let state = AppState::new();
        let app = Router::new()
            .route("/users/:id", axum::routing::get(get_user))
            .with_state(state);

        let response = app
            .oneshot(
                Request::builder()
                    .uri("/users/42")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete production-style REST API',
        description:
          'Requires tokio = { version = "1", features = ["full"] }, axum = "0.7", serde = { version = "1", features = ["derive"] }, serde_json = "1", and tower = { version = "0.4", features = ["util"] } (dev-dependency, for the test). This binds a real socket via axum::serve, so it is not runnable in the in-browser playground — read it as the reference shape for a production-style Axum service.',
        language: 'rust',
        runnable: false,
        code: `use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

#[derive(Clone, Serialize, Deserialize)]
struct User {
    id: u32,
    name: String,
    email: String,
}

#[derive(Clone)]
struct AppState {
    users: Arc<Mutex<HashMap<u32, User>>>,
}

impl AppState {
    fn new() -> Self {
        AppState { users: Arc::new(Mutex::new(HashMap::new())) }
    }
}

enum AppError {
    NotFound,
    InvalidInput(String),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::NotFound => (StatusCode::NOT_FOUND, "user not found".to_string()),
            AppError::InvalidInput(msg) => (StatusCode::BAD_REQUEST, msg),
        };
        (status, Json(json!({ "error": message }))).into_response()
    }
}

async fn get_user(
    State(state): State<AppState>,
    Path(id): Path<u32>,
) -> Result<Json<User>, AppError> {
    let users = state.users.lock().unwrap();
    users.get(&id).cloned().map(Json).ok_or(AppError::NotFound)
}

async fn create_user(
    State(state): State<AppState>,
    Json(payload): Json<User>,
) -> Result<Json<User>, AppError> {
    if payload.name.trim().is_empty() {
        return Err(AppError::InvalidInput("name must not be empty".into()));
    }
    let mut users = state.users.lock().unwrap();
    users.insert(payload.id, payload.clone());
    Ok(Json(payload))
}

fn app(state: AppState) -> Router {
    Router::new()
        .route("/users/:id", get(get_user))
        .route("/users", post(create_user))
        .with_state(state)
}

#[tokio::main]
async fn main() {
    let state = AppState::new();
    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());

    axum::serve(listener, app(state)).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::Body,
        http::{Request, StatusCode},
    };
    use tower::ServiceExt; // for \`.oneshot()\`

    #[tokio::test]
    async fn get_user_not_found_returns_404() {
        let state = AppState::new();
        let response = app(state)
            .oneshot(
                Request::builder()
                    .uri("/users/42")
                    .body(Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();

        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why implement IntoResponse for a custom AppError enum instead of matching on errors inside every handler?',
            options: [
              { id: 'a', text: 'It\'s required by the Rust compiler for any enum used in a Result.' },
              { id: 'b', text: 'It centralizes the mapping from domain failure to HTTP status/body in one place, so handlers can just use `?` and return Result<_, AppError>.' },
              { id: 'c', text: 'It makes the enum derive Serialize automatically.' },
              { id: 'd', text: 'It has no real benefit over manual matching, it\'s purely stylistic.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Implementing IntoResponse once means every handler gets consistent error responses "for free" via the ? operator, instead of duplicating status-code logic in every handler.',
          },
          {
            id: 'q2',
            prompt: 'In `AppState { users: Arc<Mutex<HashMap<u32, User>>> }`, what does the Arc contribute that Mutex alone would not?',
            options: [
              { id: 'a', text: 'Arc prevents two requests from reading the map at the same time.' },
              { id: 'b', text: 'Arc lets multiple handler invocations (each in its own task) share ownership of the same underlying map; Mutex alone has nothing to say about shared ownership across tasks.' },
              { id: 'c', text: 'Arc makes the HashMap thread-safe by itself.' },
              { id: 'd', text: 'Arc and Mutex do the same thing here, so either alone would work.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Mutex<T> provides safe exclusive access to the data it wraps, but every clone of AppState needs to point at the *same* map — that shared ownership across concurrently-running tasks is exactly what Arc provides.',
          },
          {
            id: 'q3',
            prompt: 'What does `app(state).oneshot(request).await` let you test that a real client/server round trip would not add value over?',
            options: [
              { id: 'a', text: 'It tests a completely different code path than production traffic uses.' },
              { id: 'b', text: 'It exercises the exact same Router (routing, extraction, handler, IntoResponse) as production traffic, just without binding a real socket or running a client — faster and free of port/timing flakiness.' },
              { id: 'c', text: 'It skips your handler code entirely and only checks routing.' },
              { id: 'd', text: 'oneshot only works for GET requests.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Because Router implements tower::Service, oneshot drives one request through the identical logic a real server would use — it\'s the standard pattern for fast, deterministic Axum integration tests.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // ra-proj-websocket-app
  // ────────────────────────────────────────────────────────────────────────
  'ra-proj-websocket-app': {
    id: 'ra-proj-websocket-app',
    heroSummary:
      'Build a chat-room-style WebSocket server: clients upgrade an HTTP connection to a persistent socket, and every message one client sends gets broadcast to every other connected client via a shared tokio::sync::broadcast channel.',
    dependencyChain: {
      learned: 'The Stream trait, select! for racing multiple async operations, and join! for running several futures concurrently.',
      why: 'A WebSocket connection is fundamentally two independent streams running at once — messages coming in from the client, and messages that need to go out to the client from other clients entirely. Juggling "read from the socket" and "read from a broadcast channel" concurrently on the same connection is exactly what select! and stream-based thinking were built for.',
      build: 'Splitting a WebSocket into a sender and receiver half, a tokio::sync::broadcast::channel as the shared hub every connection subscribes to, and a per-connection task that concurrently forwards in both directions.',
      next: 'This closes out the async/web track in the Advanced projects — from here, the Database-Backed Service and Job Queue projects apply the same Tokio foundations to persistence and background work.',
    },
    sections: [
      {
        type: 'explain',
        title: 'From HTTP request to persistent socket',
        body: [
          "A WebSocket connection starts life as a normal HTTP GET request carrying an Upgrade: websocket header. Axum's WebSocketUpgrade extractor recognizes this handshake and hands your handler a callback — you give it an async closure that takes the now-upgraded WebSocket and runs for as long as that connection stays open, instead of returning immediately like a typical request handler.",
          "Once upgraded, a WebSocket is both a Sink (you send Message values into it) and a Stream (you receive Message values out of it). Calling .split() on it gives you two independent halves — a sender you can move into one task and a receiver you can move into another — so reading and writing can happen concurrently instead of one blocking the other.",
          "Broadcasting to many clients needs a different channel than the mpsc channel from earlier lessons. mpsc is multi-producer, single-consumer: many senders, but only one thing on the receiving end ever sees each message. A chat room needs the opposite fan-out shape — one message in, and every connected client should see a copy of it. tokio::sync::broadcast::channel is built exactly for that: every clone of the Receiver gets its own independent copy of every value sent, in order, for as long as it stays subscribed. Call .subscribe() on the Sender (or an existing Receiver) once per connection to get that connection's own copy of the stream.",
          'Putting it together: each connection spawns a task that does two things concurrently via select! or two spawned sub-tasks — read incoming Message::Text from the client and re-send it into the shared broadcast channel (fan-in), and read from this connection\'s broadcast subscription and write each value out to this client\'s WebSocket sender half (fan-out). Every connected client runs the same loop, so one client\'s message reaches all the others.',
        ],
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Add tokio, axum (its ws feature is included by default), and futures-util (for splitting the socket) as dependencies.',
          'Create a shared broadcast::Sender<String> as app state, alongside the existing State pattern.',
          'Write a handler that accepts a WebSocketUpgrade and hands off to a per-connection async function.',
          'Split the socket into sender/receiver halves and run the forward loop (client -> broadcast) and relay loop (broadcast -> client) concurrently.',
          'Wire the WebSocket route into a Router alongside the shared broadcast state.',
        ],
        steps: [
          {
            title: '1. Dependencies',
            description:
              'axum\'s ws module is available by default (no extra feature flag needed in axum 0.7). futures-util gives you StreamExt/SinkExt for .split(), .next(), and .send() on the WebSocket.',
            code: `[dependencies]
tokio = { version = "1", features = ["full"] }
axum = "0.7"
futures-util = "0.3"`,
          },
          {
            title: '2. Shared state: one broadcast channel for the whole server',
            description:
              'broadcast::channel(capacity) returns a (Sender<T>, Receiver<T>) pair; the capacity is how many not-yet-read messages it buffers per subscriber before old ones start being dropped for slow readers. We only keep the Sender in AppState — each new connection calls .subscribe() on it to get its own Receiver.',
            code: `use tokio::sync::broadcast;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<String>,
}

impl AppState {
    fn new() -> Self {
        let (tx, _rx) = broadcast::channel(100);
        AppState { tx }
    }
}`,
          },
          {
            title: '3. The upgrade handler',
            description:
              'WebSocketUpgrade is an extractor like any other. Calling .on_upgrade(callback) returns the response Axum sends back to complete the handshake; the callback itself receives the live WebSocket once the upgrade finishes and becomes the entire lifetime of that connection.',
            code: `use axum::{
    extract::{ws::WebSocketUpgrade, State},
    response::Response,
};

async fn ws_handler(
    ws: WebSocketUpgrade,
    State(state): State<AppState>,
) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}`,
          },
          {
            title: '4. Split the socket, subscribe, and run both directions concurrently',
            description:
              'socket.split() gives a SplitSink (send only) and SplitStream (receive only). Each connection subscribes to the shared broadcast channel to get its own Receiver. Two tasks then run concurrently: one forwards this client\'s incoming text into the broadcast channel; the other relays every broadcast value out through this client\'s sender. tokio::select! waits on both and exits the connection loop the moment either side ends (e.g. the client disconnects).',
            code: `use axum::extract::ws::{Message, WebSocket};
use futures_util::{SinkExt, StreamExt};

async fn handle_socket(socket: WebSocket, state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();

    // Fan-out: relay every broadcast message to this client.
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg)).await.is_err() {
                break; // client disconnected
            }
        }
    });

    // Fan-in: forward this client's messages into the shared broadcast channel.
    let tx = state.tx.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            let _ = tx.send(text); // Err means no subscribers; safe to ignore
        }
    });

    // Whichever task finishes first (client gone, or channel closed) wins;
    // abort the other so the connection's resources are cleaned up.
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    }
}`,
          },
          {
            title: '5. Wire it into the Router',
            description:
              'The WebSocket route looks exactly like any other Axum route — the only difference is the handler\'s first argument is a WebSocketUpgrade instead of a Path or Json extractor.',
            code: `use axum::{routing::get, Router};

#[tokio::main]
async fn main() {
    let state = AppState::new();
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete WebSocket chat server',
        description:
          'Requires tokio = { version = "1", features = ["full"] }, axum = "0.7", and futures-util = "0.3" in Cargo.toml. Connect multiple WebSocket clients to ws://localhost:3000/ws (e.g. with `websocat` or a small browser script) and every message any one client sends is broadcast to all the others. This binds a real socket and runs indefinitely, so it is not runnable in the in-browser playground — read it as the reference shape for a real broadcast-based WebSocket server.',
        language: 'rust',
        runnable: false,
        code: `use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        State,
    },
    response::Response,
    routing::get,
    Router,
};
use futures_util::{SinkExt, StreamExt};
use tokio::sync::broadcast;

#[derive(Clone)]
struct AppState {
    tx: broadcast::Sender<String>,
}

impl AppState {
    fn new() -> Self {
        // Buffer up to 100 not-yet-read messages per subscriber. Unlike an
        // mpsc channel (many producers, one consumer), every subscriber here
        // gets its own independent copy of every message sent.
        let (tx, _rx) = broadcast::channel(100);
        AppState { tx }
    }
}

async fn ws_handler(ws: WebSocketUpgrade, State(state): State<AppState>) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, state))
}

async fn handle_socket(socket: WebSocket, state: AppState) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = state.tx.subscribe();

    // Fan-out: this connection's broadcast subscription -> this client's socket.
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            if sender.send(Message::Text(msg)).await.is_err() {
                break;
            }
        }
    });

    // Fan-in: this client's socket -> the shared broadcast channel.
    let tx = state.tx.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            let _ = tx.send(text);
        }
    });

    // Race both directions; whichever ends first (disconnect either way)
    // triggers cleanup of the other.
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    }
}

#[tokio::main]
async fn main() {
    let state = AppState::new();
    let app = Router::new()
        .route("/ws", get(ws_handler))
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    println!("listening on {}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does the broadcast channel here replace the mpsc channel used in earlier lessons, rather than just reusing mpsc?',
            options: [
              { id: 'a', text: 'mpsc channels cannot hold String values.' },
              { id: 'b', text: 'mpsc is many-producers/single-consumer, so only one receiver would ever see each message; broadcast gives every subscriber its own independent copy of every value sent, which is what "every client sees every message" requires.' },
              { id: 'c', text: 'broadcast is simply a faster version of mpsc with no semantic difference.' },
              { id: 'd', text: 'Axum requires broadcast channels specifically for WebSockets by API design.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The fan-out requirement — one message reaching many independent listeners — is exactly the shape broadcast::channel is designed for; mpsc would only ever deliver each message to one consumer.',
          },
          {
            id: 'q2',
            prompt: 'What does calling .split() on the WebSocket accomplish?',
            options: [
              { id: 'a', text: 'It splits the connection into two separate TCP sockets.' },
              { id: 'b', text: 'It divides the single WebSocket into an independent sender half and receiver half, so one task can write while a different task reads, concurrently.' },
              { id: 'c', text: 'It duplicates every incoming message so it can be processed twice.' },
              { id: 'd', text: 'It is required before you can call .subscribe() on the broadcast channel.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A WebSocket is both a Sink and a Stream; .split() separates those two capabilities into their own values so sending and receiving can proceed on independent tasks instead of serializing on one.',
          },
          {
            id: 'q3',
            prompt: 'In the handle_socket function, what is tokio::select! doing with send_task and recv_task?',
            options: [
              { id: 'a', text: 'Running them one after another, send_task first.' },
              { id: 'b', text: 'Waiting for both tasks to complete before continuing.' },
              { id: 'c', text: 'Waiting for whichever of the two spawned tasks finishes first, then aborting the other one, so the connection is cleaned up as soon as either direction ends.' },
              { id: 'd', text: 'Retrying whichever task fails first.' },
            ],
            correctOptionIds: ['c'],
            explanation: 'select! races several futures and proceeds as soon as the first one resolves. Here that means: the instant either the client disconnects (ending recv_task) or the send side errors out, the other task is aborted so resources for that connection aren\'t left running forever.',
          },
        ],
      },
    ],
  },

  // ---------------------------------------------------------------------
  // Database Service, Job Queue & CLI Devtool Projects (added)
  // ---------------------------------------------------------------------
// ────────────────────────────────────────────────────────────────────────
  // ra-proj-db-backed-service
  // ────────────────────────────────────────────────────────────────────────
  'ra-proj-db-backed-service': {
    id: 'ra-proj-db-backed-service',
    heroSummary:
      'Rip the Arc<Mutex<HashMap>> out of your REST API and replace it with a real SQLite database, wired through sqlx connection pools and versioned migrations.',
    dependencyChain: {
      learned: 'How to build an axum REST API backed by an in-memory Arc<Mutex<HashMap<u64, Todo>>>, shared across handlers via State.',
      why: 'An in-memory HashMap disappears the moment the process restarts, and a Mutex serializes every request through one lock — neither survives contact with production. A real service needs data that outlives the process and a storage layer that can serve concurrent requests without one giant lock.',
      build: 'How to open a SqlitePool, run migrations to create your schema, and swap every HashMap operation for an async sqlx query — all while keeping the exact same axum handler signatures.',
      next: 'From here the natural extensions are transactions for multi-step writes, connection pool tuning under load, and eventually swapping SQLite for Postgres — sqlx makes that swap mostly a matter of changing the pool type and query syntax.',
    },
    sections: [
      {
        type: 'explain',
        title: 'Why the HashMap has to go',
        body: [
          "Your REST API project used `Arc<Mutex<HashMap<u64, Todo>>>` as shared state — every handler locked the mutex, read or wrote the map, and unlocked. That works for a demo, but it has two fatal problems for a real service: the data lives only in process memory (restart the server, lose everything), and the mutex means every single request — reads included — waits in line behind every other request, even ones touching completely unrelated rows.",
          "A real database fixes both. SQLite gives you a durable file on disk that survives restarts, and sqlx gives you a connection pool: instead of one lock guarding all your data, you get a small pool of connections that independent requests can borrow concurrently. Reads no longer block other reads.",
          "The shape of the fix is almost boring: `SqlitePool` replaces `Arc<Mutex<HashMap>>` as your shared state, and each handler's HashMap.get/.insert/.remove becomes an `await`ed sqlx query. The axum wiring — `State<T>`, router, handler signatures — barely changes at all.",
        ],
        callout: {
          tone: 'accent',
          text: "sqlx is compile-time checked: if you use the query! macro against a real database at build time, sqlx verifies your SQL and the shape of the rows it returns against your actual schema. Get a column name wrong and the build fails, not a 2am production alert.",
        },
      },
      {
        type: 'explain',
        title: 'Pools, migrations, and the two query styles',
        body: [
          "`SqlitePool::connect(url)` doesn't open one connection — it opens a small managed pool of them (SQLite still serializes writes internally, but reads can proceed concurrently, and the pool means you're not paying connection setup cost on every request). You create the pool once at startup and clone it into every handler via axum's `State` extractor — `SqlitePool` is cheap to clone because it's an `Arc` internally.",
          "Migrations are just numbered SQL files that describe how your schema evolves over time — `sqlx migrate add create_todos` generates a timestamped file under `migrations/`, you write the `CREATE TABLE` in it, and `sqlx::migrate!().run(&pool).await` applies any migrations that haven't run yet, in order, tracking which ones already ran in a `_sqlx_migrations` table it manages for you. This is how you evolve a schema safely across deploys instead of hand-editing a database file.",
          "sqlx gives you two ways to write queries. The `query!`/`query_as!` macros check your SQL against a real database (or a cached `.sqlx` offline file) at compile time — you get compile errors for typos in column names or type mismatches, which is the big sqlx selling point. The non-macro `sqlx::query(...)` / `sqlx::query_as::<_, T>(...)` style skips that compile-time check but doesn't require a live database or `DATABASE_URL` to be set just to build the project — often the pragmatic choice for a lesson, a CI pipeline, or a codebase where contributors shouldn't need a database running just to `cargo build`.",
        ],
      },
      {
        type: 'diagram',
        title: 'Request flow: HashMap vs. SQLite',
        description: 'The handler signature and axum wiring stay identical — only what sits behind State<T> changes.',
        diagram: {
          title: 'From Arc<Mutex<HashMap>> to SqlitePool',
          height: 300,
          frames: [
            {
              caption: 'Before: every request locks the same mutex around an in-memory map.',
              nodes: [
                { id: 'req1', label: 'GET /todos', x: 10, y: 20, tone: 'default', shape: 'pill' },
                { id: 'req2', label: 'POST /todos', x: 10, y: 60, tone: 'default', shape: 'pill' },
                { id: 'mutex', label: 'Mutex<HashMap>', sublabel: 'one lock, in memory', x: 55, y: 40, tone: 'warning', shape: 'box' },
                { id: 'gone', label: 'lost on restart', x: 90, y: 40, tone: 'danger', shape: 'ghost' },
              ],
              edges: [
                { from: 'req1', to: 'mutex', label: 'lock...wait', tone: 'warning' },
                { from: 'req2', to: 'mutex', label: 'lock...wait', tone: 'warning' },
                { from: 'mutex', to: 'gone', dashed: true, tone: 'danger' },
              ],
            },
            {
              caption: 'After: requests borrow independent connections from a pool backed by a durable file.',
              nodes: [
                { id: 'req1b', label: 'GET /todos', x: 10, y: 20, tone: 'default', shape: 'pill' },
                { id: 'req2b', label: 'POST /todos', x: 10, y: 60, tone: 'default', shape: 'pill' },
                { id: 'pool', label: 'SqlitePool', sublabel: 'State<SqlitePool>', x: 50, y: 40, tone: 'accent', shape: 'box' },
                { id: 'db', label: 'todos.db', sublabel: 'durable file on disk', x: 90, y: 40, tone: 'success', shape: 'box' },
              ],
              edges: [
                { from: 'req1b', to: 'pool', label: 'borrow conn', tone: 'accent', animated: true },
                { from: 'req2b', to: 'pool', label: 'borrow conn', tone: 'accent', animated: true },
                { from: 'pool', to: 'db', tone: 'success' },
              ],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Add sqlx and tokio as dependencies and connect a SqlitePool.',
          'Write a migration that creates a `todos` table.',
          'Write async CRUD functions (create, get, list, delete) using sqlx query methods.',
          'Wire the pool into axum handlers via State<SqlitePool>, keeping the same routes as the in-memory version.',
        ],
        steps: [
          {
            title: '1. Add the dependencies',
            description: "sqlx needs the `sqlite` feature for the SQLite driver and `runtime-tokio` to integrate with the tokio runtime your axum app already uses. `chrono` is optional but common for timestamp columns.",
            code: `# Cargo.toml
[dependencies]
axum = "0.7"
tokio = { version = "1", features = ["full"] }
sqlx = { version = "0.7", features = ["sqlite", "runtime-tokio"] }
serde = { version = "1", features = ["derive"] }`,
          },
          {
            title: '2. Connect the pool at startup',
            description: "SqlitePool::connect takes a connection URL. `sqlite:todos.db` opens (and creates, if missing) a file on disk — no server process to run, unlike Postgres or MySQL. This replaces the `Arc::new(Mutex::new(HashMap::new()))` line from the in-memory version.",
            code: `use sqlx::sqlite::SqlitePool;

async fn setup_pool() -> Result<SqlitePool, sqlx::Error> {
    let pool = SqlitePool::connect("sqlite:todos.db").await?;
    sqlx::migrate!("./migrations").run(&pool).await?;
    Ok(pool)
}`,
          },
          {
            title: '3. Write the migration',
            description: "Run `sqlx migrate add create_todos` to generate a timestamped file under migrations/, then fill in the schema. `id` as INTEGER PRIMARY KEY auto-increments in SQLite.",
            code: `-- migrations/20240115000000_create_todos.sql
CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);`,
          },
          {
            title: '4. Write CRUD functions against the pool',
            description: "Each function takes `&SqlitePool` and returns a `Result`. This uses the non-macro query style (`sqlx::query(...)` / `query_as(...)`), which compiles without a live database — the tradeoff is you lose sqlx's compile-time SQL verification that the query!/query_as! macros give you against a real schema.",
            code: `use sqlx::{FromRow, Row, SqlitePool};

#[derive(Debug, FromRow, serde::Serialize)]
struct Todo {
    id: i64,
    text: String,
    done: bool,
}

async fn create_todo(pool: &SqlitePool, text: &str) -> Result<Todo, sqlx::Error> {
    let rec = sqlx::query("INSERT INTO todos (text, done) VALUES (?, 0) RETURNING id, text, done")
        .bind(text)
        .fetch_one(pool)
        .await?;
    Ok(Todo {
        id: rec.get("id"),
        text: rec.get("text"),
        done: rec.get("done"),
    })
}

async fn get_todo(pool: &SqlitePool, id: i64) -> Result<Option<Todo>, sqlx::Error> {
    sqlx::query_as::<_, Todo>("SELECT id, text, done FROM todos WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await
}

async fn list_todos(pool: &SqlitePool) -> Result<Vec<Todo>, sqlx::Error> {
    sqlx::query_as::<_, Todo>("SELECT id, text, done FROM todos ORDER BY id")
        .fetch_all(pool)
        .await
}

async fn delete_todo(pool: &SqlitePool, id: i64) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM todos WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}`,
          },
          {
            title: '5. Swap State<Arc<Mutex<HashMap>>> for State<SqlitePool>',
            description: "The handler signatures barely change — State<T> extraction works the same way. The bodies go from lock().unwrap() + HashMap ops to .await on the CRUD functions, and errors from sqlx now map onto real HTTP status codes.",
            code: `use axum::{extract::{Path, State}, http::StatusCode, Json};

async fn create_handler(
    State(pool): State<SqlitePool>,
    Json(body): Json<CreateTodo>,
) -> Result<Json<Todo>, StatusCode> {
    create_todo(&pool, &body.text)
        .await
        .map(Json)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_handler(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<Json<Todo>, StatusCode> {
    match get_todo(&pool, id).await {
        Ok(Some(todo)) => Ok(Json(todo)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The full database-backed service',
        description:
          "This needs a real SQLite database on disk and the sqlx + tokio dependencies from step 1, so it's marked non-runnable here — but every API call shown (SqlitePool::connect, sqlx::migrate!, query/query_as, .bind, .fetch_one/.fetch_optional/.fetch_all/.execute) is exactly what you'd type in a real Cargo project. Copy this into a project with the Cargo.toml from step 1, add the migration file from step 3, and `cargo run` will work against a live todos.db file.",
        language: 'rust',
        runnable: false,
        code: `use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqlitePool, FromRow, Row};

#[derive(Debug, Serialize, FromRow)]
struct Todo {
    id: i64,
    text: String,
    done: bool,
}

#[derive(Debug, Deserialize)]
struct CreateTodo {
    text: String,
}

async fn create_todo(pool: &SqlitePool, text: &str) -> Result<Todo, sqlx::Error> {
    let rec = sqlx::query("INSERT INTO todos (text, done) VALUES (?, 0) RETURNING id, text, done")
        .bind(text)
        .fetch_one(pool)
        .await?;
    Ok(Todo { id: rec.get("id"), text: rec.get("text"), done: rec.get("done") })
}

async fn get_todo(pool: &SqlitePool, id: i64) -> Result<Option<Todo>, sqlx::Error> {
    sqlx::query_as::<_, Todo>("SELECT id, text, done FROM todos WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await
}

async fn list_todos(pool: &SqlitePool) -> Result<Vec<Todo>, sqlx::Error> {
    sqlx::query_as::<_, Todo>("SELECT id, text, done FROM todos ORDER BY id")
        .fetch_all(pool)
        .await
}

async fn delete_todo(pool: &SqlitePool, id: i64) -> Result<bool, sqlx::Error> {
    let result = sqlx::query("DELETE FROM todos WHERE id = ?").bind(id).execute(pool).await?;
    Ok(result.rows_affected() > 0)
}

async fn create_handler(
    State(pool): State<SqlitePool>,
    Json(body): Json<CreateTodo>,
) -> Result<Json<Todo>, StatusCode> {
    create_todo(&pool, &body.text).await.map(Json).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn get_handler(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<Json<Todo>, StatusCode> {
    match get_todo(&pool, id).await {
        Ok(Some(todo)) => Ok(Json(todo)),
        Ok(None) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

async fn list_handler(State(pool): State<SqlitePool>) -> Result<Json<Vec<Todo>>, StatusCode> {
    list_todos(&pool).await.map(Json).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)
}

async fn delete_handler(
    State(pool): State<SqlitePool>,
    Path(id): Path<i64>,
) -> Result<StatusCode, StatusCode> {
    match delete_todo(&pool, id).await {
        Ok(true) => Ok(StatusCode::NO_CONTENT),
        Ok(false) => Err(StatusCode::NOT_FOUND),
        Err(_) => Err(StatusCode::INTERNAL_SERVER_ERROR),
    }
}

#[tokio::main]
async fn main() -> Result<(), sqlx::Error> {
    let pool = SqlitePool::connect("sqlite:todos.db").await?;
    sqlx::migrate!("./migrations").run(&pool).await?;

    let app = Router::new()
        .route("/todos", post(create_handler).get(list_handler))
        .route("/todos/:id", get(get_handler).delete(delete_handler))
        .with_state(pool);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();
    axum::serve(listener, app).await.unwrap();
    Ok(())
}`,
      },
      {
        type: 'terminal',
        title: 'Setting up the database locally',
        description: 'The sqlx-cli tool manages migrations from the command line — install it once, then use it whenever your schema changes.',
        lines: [
          { prompt: '$', text: 'cargo install sqlx-cli --no-default-features --features sqlite' },
          { prompt: '$', text: 'sqlx migrate add create_todos' },
          { text: 'Creating migrations/20240115093042_create_todos.sql' },
          { prompt: '$', text: 'sqlx migrate run --database-url sqlite:todos.db' },
          { text: 'Applied 20240115093042/migrate create_todos (12.4ms)' },
          { prompt: '$', text: 'cargo run' },
          { text: 'listening on 0.0.0.0:3000' },
        ],
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What is the main concurrency advantage of SqlitePool over Arc<Mutex<HashMap>>?',
            options: [
              { id: 'a', text: 'A pool makes SQLite writes faster than any in-memory structure.' },
              { id: 'b', text: 'Independent requests can borrow separate connections from the pool concurrently, instead of all serializing through one mutex lock.' },
              { id: 'c', text: 'Pools eliminate the need for async/await.' },
              { id: 'd', text: 'There is no real difference — it is purely about durability.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'A single Mutex forces every request — even unrelated reads — to wait in line. A pool lets multiple requests hold separate connections at once, so unrelated work no longer blocks on the same lock.',
          },
          {
            id: 'q2',
            prompt: 'What do sqlx migrations solve that hand-editing a database file does not?',
            options: [
              { id: 'a', text: 'They make queries run faster.' },
              { id: 'b', text: 'They give you a versioned, ordered, repeatable way to evolve the schema across every environment and deploy.' },
              { id: 'c', text: 'They remove the need for a schema entirely.' },
              { id: 'd', text: 'They automatically write your CRUD functions.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Migrations are numbered SQL files sqlx tracks in a _sqlx_migrations table — running sqlx::migrate!().run(&pool) applies only the ones that have not run yet, in order, so every environment ends up with the same schema history.',
          },
          {
            id: 'q3',
            prompt: 'Why might a project choose sqlx::query()/query_as() over the query!/query_as! macros?',
            options: [
              { id: 'a', text: 'The macros do not exist in sqlx.' },
              { id: 'b', text: 'The non-macro style avoids requiring a live database (or cached offline data) just to compile the project, at the cost of losing compile-time SQL verification.' },
              { id: 'c', text: 'The non-macro style is always faster at runtime.' },
              { id: 'd', text: 'query() only works with Postgres, not SQLite.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The query!/query_as! macros check your SQL against a real database schema (or a cached .sqlx directory) at compile time, which is powerful but means DATABASE_URL or a cache needs to be set up to build. The plain functions skip that check and compile without a live database.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // ra-proj-job-queue
  // ────────────────────────────────────────────────────────────────────────
  'ra-proj-job-queue': {
    id: 'ra-proj-job-queue',
    heroSummary:
      'Build a std-only job queue: worker threads pull jobs from a shared queue, execute them, and automatically re-enqueue failures up to a retry limit before giving up.',
    dependencyChain: {
      learned: 'How to hand-roll a ThreadPool: a fixed set of worker threads pulling closures off a shared channel or queue instead of spawning a thread per task.',
      why: 'A thread pool runs jobs, but it has no opinion about what happens when a job fails. Real background work — sending emails, processing uploads, calling flaky external APIs — fails transiently all the time, and a production queue needs to retry it instead of losing it silently.',
      build: 'A Job type that tracks its own attempt count, a shared queue guarded by Arc<Mutex<VecDeque<Job>>>, and worker logic that re-enqueues a failed job up to a max retry count before marking it dead.',
      next: 'From here, the natural next step is replacing the in-process VecDeque with a persistent queue (so jobs survive a crash) and adding exponential backoff between retries instead of retrying immediately.',
    },
    sections: [
      {
        type: 'explain',
        title: 'From thread pool to job queue',
        body: [
          "Your thread pool project answered one question: how do you run a bounded number of tasks concurrently without spawning an unbounded number of OS threads? A job queue answers a different question: what happens when a task fails?",
          "A plain thread pool treats every submitted closure the same way — run it once, done. A job queue treats work as a first-class Job value with its own state: how many times has this been attempted, and how many more attempts is it allowed? When a job's work function returns an error, the queue doesn't discard it — it increments the attempt count and pushes it back onto the queue, unless it has already hit the retry limit, in which case it's logged as permanently failed.",
          "This project reuses the same core primitive as the thread pool: a queue shared across threads behind a lock. Here we use `Arc<Mutex<VecDeque<Job>>>` directly rather than the mpsc-channel-based pool, because workers need to both take jobs off the front and push retried jobs onto the back — a `VecDeque` behind a mutex makes both operations equally natural.",
        ],
      },
      {
        type: 'diagram',
        title: 'A job\'s life: run, fail, retry, give up',
        description: 'Each job carries its own attempt counter. Workers pop from the front of the queue; failed jobs go back on the end, until the retry budget runs out.',
        diagram: {
          title: 'Job retry lifecycle',
          height: 320,
          frames: [
            {
              caption: 'A worker pops a fresh job (attempt 1) and runs it. It fails.',
              nodes: [
                { id: 'queue', label: 'VecDeque<Job>', sublabel: 'shared, Mutex-guarded', x: 15, y: 50, tone: 'default', shape: 'box' },
                { id: 'worker', label: 'Worker thread', x: 50, y: 50, tone: 'accent', shape: 'box' },
                { id: 'job', label: 'Job #7', sublabel: 'attempt 1/3', x: 50, y: 15, tone: 'default', shape: 'pill' },
                { id: 'fail', label: 'simulated failure', x: 85, y: 50, tone: 'danger', shape: 'ghost' },
              ],
              edges: [
                { from: 'queue', to: 'worker', label: 'pop', tone: 'accent' },
                { from: 'worker', to: 'fail', dashed: true, tone: 'danger' },
              ],
            },
            {
              caption: 'attempts is incremented, and the job goes back on the queue for another try.',
              nodes: [
                { id: 'queue2', label: 'VecDeque<Job>', x: 15, y: 50, tone: 'default', shape: 'box' },
                { id: 'job2', label: 'Job #7', sublabel: 'attempt 2/3', x: 55, y: 50, tone: 'warning', shape: 'pill' },
              ],
              edges: [{ from: 'job2', to: 'queue2', label: 're-enqueue', tone: 'warning', animated: true }],
            },
            {
              caption: 'On the final allowed attempt it fails again — the job is marked Dead, not retried further.',
              nodes: [
                { id: 'job3', label: 'Job #7', sublabel: 'attempt 3/3 — failed', x: 30, y: 50, tone: 'danger', shape: 'pill' },
                { id: 'dead', label: 'Dead letter', sublabel: 'logged, not retried', x: 75, y: 50, tone: 'danger', shape: 'box' },
              ],
              edges: [{ from: 'job3', to: 'dead', label: 'max retries hit', tone: 'danger' }],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Define a Job struct carrying an id, a work closure, an attempt count, and a max-retries limit.',
          'Build a shared queue with Arc<Mutex<VecDeque<Job>>> that worker threads pull from.',
          'Spawn a fixed number of worker threads that loop: pop a job, run it, re-enqueue on failure.',
          'Simulate occasional failure so retries actually get exercised, and print a clear final outcome per job.',
        ],
        steps: [
          {
            title: '1. Model a Job',
            description: "The work itself is a boxed closure returning Result<(), String> — this lets every job carry different logic while still being stored uniformly in one queue. attempts and max_attempts travel with the job so retry logic doesn't need any external bookkeeping.",
            code: `type JobFn = Box<dyn FnMut() -> Result<(), String> + Send>;

struct Job {
    id: u32,
    attempts: u32,
    max_attempts: u32,
    work: JobFn,
}`,
          },
          {
            title: '2. Build the shared queue',
            description: "Arc lets every worker thread hold a handle to the same queue; Mutex ensures only one thread touches the VecDeque at a time. pop_front() takes the next job to run, push_back() re-enqueues a failed one behind whatever was already waiting.",
            code: `use std::collections::VecDeque;
use std::sync::{Arc, Mutex};

type SharedQueue = Arc<Mutex<VecDeque<Job>>>;

fn new_queue() -> SharedQueue {
    Arc::new(Mutex::new(VecDeque::new()))
}`,
          },
          {
            title: '3. Worker loop: run, retry, or give up',
            description: "Each worker locks the queue only long enough to pop one job, then releases the lock before doing the (potentially slow) work — never hold a lock across real work. On failure, it decides whether to re-enqueue or declare the job dead based on attempts vs. max_attempts.",
            code: `fn worker_loop(id: u32, queue: SharedQueue) {
    loop {
        let job = {
            let mut q = queue.lock().unwrap();
            q.pop_front()
        };

        let Some(mut job) = job else { break; };

        job.attempts += 1;
        match (job.work)() {
            Ok(()) => {
                println!("[worker {id}] job {} succeeded on attempt {}", job.id, job.attempts);
            }
            Err(reason) => {
                if job.attempts >= job.max_attempts {
                    println!(
                        "[worker {id}] job {} DEAD after {} attempts: {reason}",
                        job.id, job.attempts
                    );
                } else {
                    println!(
                        "[worker {id}] job {} failed (attempt {}/{}): {reason} — retrying",
                        job.id, job.attempts, job.max_attempts
                    );
                    queue.lock().unwrap().push_back(job);
                }
            }
        }
    }
}`,
          },
          {
            title: '4. Simulate flaky work and spawn the workers',
            description: "A job that fails a fixed number of times before succeeding is a realistic stand-in for a flaky network call. Workers exit their loop once the queue is empty — fine for a batch run-to-completion queue like this one (a long-lived daemon would instead block on a condvar or channel waiting for new jobs).",
            code: `fn flaky_job(id: u32, fail_until_attempt: u32) -> Job {
    let mut calls = 0;
    Job {
        id,
        attempts: 0,
        max_attempts: 3,
        work: Box::new(move || {
            calls += 1;
            if calls < fail_until_attempt {
                Err(format!("transient error on call {calls}"))
            } else {
                Ok(())
            }
        }),
    }
}

fn main() {
    let queue = new_queue();
    {
        let mut q = queue.lock().unwrap();
        q.push_back(flaky_job(1, 1)); // succeeds immediately
        q.push_back(flaky_job(2, 2)); // fails once, then succeeds
        q.push_back(flaky_job(3, 99)); // never succeeds -> exhausts retries
    }

    let handles: Vec<_> = (0..2)
        .map(|w| {
            let q = Arc::clone(&queue);
            std::thread::spawn(move || worker_loop(w, q))
        })
        .collect();

    for h in handles {
        h.join().unwrap();
    }
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The complete job queue',
        description: 'Fully std-only and runnable as-is — no external crates. Output order between the two workers is nondeterministic (they race for jobs), but each job\'s own attempt sequence and final outcome is always consistent.',
        language: 'rust',
        runnable: true,
        code: `use std::collections::VecDeque;
use std::sync::{Arc, Mutex};

type JobFn = Box<dyn FnMut() -> Result<(), String> + Send>;

struct Job {
    id: u32,
    attempts: u32,
    max_attempts: u32,
    work: JobFn,
}

type SharedQueue = Arc<Mutex<VecDeque<Job>>>;

fn new_queue() -> SharedQueue {
    Arc::new(Mutex::new(VecDeque::new()))
}

fn worker_loop(id: u32, queue: SharedQueue) {
    loop {
        let job = {
            let mut q = queue.lock().unwrap();
            q.pop_front()
        };

        let Some(mut job) = job else { break; };

        job.attempts += 1;
        match (job.work)() {
            Ok(()) => {
                println!("[worker {id}] job {} succeeded on attempt {}", job.id, job.attempts);
            }
            Err(reason) => {
                if job.attempts >= job.max_attempts {
                    println!(
                        "[worker {id}] job {} DEAD after {} attempts: {reason}",
                        job.id, job.attempts
                    );
                } else {
                    println!(
                        "[worker {id}] job {} failed (attempt {}/{}): {reason} -- retrying",
                        job.id, job.attempts, job.max_attempts
                    );
                    queue.lock().unwrap().push_back(job);
                }
            }
        }
    }
}

fn flaky_job(id: u32, fail_until_attempt: u32) -> Job {
    let mut calls = 0;
    Job {
        id,
        attempts: 0,
        max_attempts: 3,
        work: Box::new(move || {
            calls += 1;
            if calls < fail_until_attempt {
                Err(format!("transient error on call {calls}"))
            } else {
                Ok(())
            }
        }),
    }
}

fn main() {
    let queue = new_queue();
    {
        let mut q = queue.lock().unwrap();
        q.push_back(flaky_job(1, 1)); // succeeds immediately
        q.push_back(flaky_job(2, 2)); // fails once, then succeeds
        q.push_back(flaky_job(3, 99)); // never succeeds -- exhausts retries
    }

    let handles: Vec<_> = (0..2)
        .map(|w| {
            let q = Arc::clone(&queue);
            std::thread::spawn(move || worker_loop(w, q))
        })
        .collect();

    for h in handles {
        h.join().unwrap();
    }

    println!("all jobs processed");
}`,
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'Why does the worker lock the queue only to call pop_front(), rather than holding the lock while it runs the job?',
            options: [
              { id: 'a', text: 'Rust requires locks to be released within one statement.' },
              { id: 'b', text: 'Holding a lock across slow work would block every other worker from grabbing a new job for the entire duration, destroying the concurrency the pool exists for.' },
              { id: 'c', text: 'It has no effect either way.' },
              { id: 'd', text: 'VecDeque cannot be accessed inside a MutexGuard.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'The lock is only needed to safely pop one element. If it stayed locked during job execution, only one worker could ever be doing real work at a time — you would have paid for multiple threads and gotten none of the benefit.',
          },
          {
            id: 'q2',
            prompt: 'What decides whether a failed job gets re-enqueued versus marked dead?',
            options: [
              { id: 'a', text: 'Whether the queue is empty.' },
              { id: 'b', text: 'Comparing the job\'s attempts counter (incremented on every run) against its max_attempts limit.' },
              { id: 'c', text: 'A random coin flip.' },
              { id: 'd', text: 'Which worker thread happened to run it.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Each Job carries its own attempts count, incremented every time a worker runs it. Once attempts reaches max_attempts, the worker logs it as dead instead of pushing it back onto the queue.',
          },
          {
            id: 'q3',
            prompt: 'Why is VecDeque a better fit here than a plain Vec?',
            options: [
              { id: 'a', text: 'VecDeque supports efficient push/pop at both ends, letting jobs be taken from the front (FIFO order) while retries are pushed onto the back.' },
              { id: 'b', text: 'Vec cannot hold structs with closures inside them.' },
              { id: 'c', text: 'VecDeque is required for anything wrapped in a Mutex.' },
              { id: 'd', text: 'There is no difference in this context.' },
            ],
            correctOptionIds: ['a'],
            explanation: 'pop_front() and push_back() are both O(1) on a VecDeque. Using a Vec would make pop_front() an O(n) shift of every remaining element, which gets expensive as the queue grows.',
          },
        ],
      },
    ],
  },

  // ────────────────────────────────────────────────────────────────────────
  // ra-proj-cli-devtool
  // ────────────────────────────────────────────────────────────────────────
  'ra-proj-cli-devtool': {
    id: 'ra-proj-cli-devtool',
    heroSummary:
      'Build the shape of a real developer tool: a clap-powered CLI with subcommands, a hand-rolled config file parser, and custom errors that print clean, actionable messages instead of a panic.',
    dependencyChain: {
      learned: 'How to design custom error enums for a library — distinct variants per failure mode, with Display impls that produce human-readable messages.',
      why: 'A library can afford to return a Result and let the caller decide what to do. A CLI tool is the end of the line — there is no caller, just a person staring at a terminal. Your error design skills now have to serve a different audience: someone who typed a command wrong and needs to know exactly what to fix, not a stack trace.',
      build: 'A clap derive-based CLI with real subcommands, a config file reader, and an error-to-exit-code pipeline where every failure prints a clear stderr message and a non-zero exit status — never a panic.',
      next: 'This is close to the real shape of tools like cargo, ripgrep, or git itself — from here, adding shell completions, a --verbose flag wired to the tracing crate from the logging lesson, and packaging with cargo-dist are the natural next steps toward something you would actually publish.',
    },
    sections: [
      {
        type: 'explain',
        title: 'From library errors to CLI errors',
        body: [
          "The error design lesson taught you to model failure as data: an enum with one variant per distinct failure mode, so callers can match on exactly what went wrong. A CLI tool is a caller of last resort — nothing catches its Result and decides what to do next except a human reading the terminal. That changes the job of your error type: it's not just about being matchable, it needs to be genuinely readable, phrased as instructions rather than internals.",
          "The other new ingredient is clap, the de facto standard argument parser in the Rust ecosystem. Its derive API lets you describe your CLI's shape — subcommands, flags, positional args — as plain structs and enums with `#[derive(Parser)]` / `#[derive(Subcommand)]` attributes, and clap generates the parser, the `--help` text, and the error messages for malformed input, all from that one description.",
          "This project ties both together: clap handles 'did the user type a valid command,' and your own error enum handles 'did the command's own logic fail' — a missing config file, a malformed key=value line, an already-initialized project. Both funnel into the same place: a clear message on stderr and a non-zero exit code, never a panic.",
        ],
        callout: {
          tone: 'warning',
          text: "A CLI tool that panics on bad input is a support burden. `unwrap()` in a library is a design choice; `unwrap()` in a CLI's main() is a bug report waiting to happen. Every fallible operation should flow into a Result that main() turns into a clean message and std::process::exit(1).",
        },
      },
      {
        type: 'diagram',
        title: 'How a command becomes an exit code',
        description: 'clap owns argument parsing and its own error output; your DevtoolError owns everything that goes wrong once your code actually runs.',
        diagram: {
          title: 'CLI error pipeline',
          height: 280,
          frames: [
            {
              caption: 'clap parses argv into your Cli struct — or fails fast with its own formatted usage error.',
              nodes: [
                { id: 'argv', label: 'argv', sublabel: 'devtool build --release', x: 10, y: 50, tone: 'default', shape: 'pill' },
                { id: 'clap', label: 'Cli::parse()', x: 45, y: 50, tone: 'accent', shape: 'box' },
                { id: 'badarg', label: 'unknown flag', x: 80, y: 20, tone: 'danger', shape: 'ghost' },
                { id: 'okarg', label: 'Cli { command: Build {..} }', x: 80, y: 70, tone: 'success', shape: 'box' },
              ],
              edges: [
                { from: 'argv', to: 'clap', tone: 'accent' },
                { from: 'clap', to: 'badarg', dashed: true, label: 'clap prints usage, exits(2)', tone: 'danger' },
                { from: 'clap', to: 'okarg', label: 'parsed OK', tone: 'success' },
              ],
            },
            {
              caption: 'Your command logic runs and returns Result<(), DevtoolError> — main() turns Err into stderr + exit(1).',
              nodes: [
                { id: 'run', label: 'run_build()', x: 15, y: 50, tone: 'default', shape: 'box' },
                { id: 'result', label: 'Result<(), DevtoolError>', x: 50, y: 50, tone: 'default', shape: 'pill' },
                { id: 'ok', label: 'exit(0)', x: 85, y: 25, tone: 'success', shape: 'pill' },
                { id: 'err', label: 'eprintln! + exit(1)', x: 85, y: 75, tone: 'danger', shape: 'pill' },
              ],
              edges: [
                { from: 'run', to: 'result', tone: 'accent' },
                { from: 'result', to: 'ok', label: 'Ok(())', tone: 'success' },
                { from: 'result', to: 'err', label: 'Err(e)', tone: 'danger' },
              ],
            },
          ],
        },
      },
      {
        type: 'project-steps',
        title: 'Building it step by step',
        goals: [
          'Define the CLI shape with clap derive: three subcommands — init, build, status.',
          'Design a DevtoolError enum covering config, filesystem, and validation failures, reusing the custom-error patterns from the logging lesson.',
          'Write a small std-only key=value config file parser.',
          'Wire every failure path into a clean stderr message and a non-zero exit code.',
        ],
        steps: [
          {
            title: '1. Describe the CLI with clap derive',
            description: "#[derive(Parser)] turns a struct into a top-level CLI definition; #[derive(Subcommand)] turns an enum into the set of subcommands clap dispatches between. Doc comments above each field/variant become the --help text — clap generates it, you don't hand-write it.",
            code: `// Cargo.toml: clap = { version = "4", features = ["derive"] }
use clap::{Parser, Subcommand};

/// devtool: a small project management CLI
#[derive(Parser)]
#[command(name = "devtool", version, about)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Initialize a new project in the current directory
    Init {
        /// Project name
        #[arg(long)]
        name: String,
    },
    /// Build the project according to devtool.conf
    Build {
        /// Build in release mode
        #[arg(long)]
        release: bool,
    },
    /// Show the current project status
    Status,
}`,
          },
          {
            title: '2. Design the error type',
            description: "Same discipline as the error-design lesson: one variant per distinct failure, each carrying the context needed to explain itself. The Display impl is what the user actually reads, so it's written as an instruction, not a description of internals.",
            code: `use std::fmt;

#[derive(Debug)]
enum DevtoolError {
    ConfigNotFound,
    ConfigMalformed { line: usize, content: String },
    AlreadyInitialized,
    MissingKey(String),
}

impl fmt::Display for DevtoolError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DevtoolError::ConfigNotFound => {
                write!(f, "no devtool.conf found in this directory — run 'devtool init' first")
            }
            DevtoolError::ConfigMalformed { line, content } => {
                write!(f, "devtool.conf line {line} is not valid key=value: \\"{content}\\"")
            }
            DevtoolError::AlreadyInitialized => {
                write!(f, "devtool.conf already exists — this directory is already initialized")
            }
            DevtoolError::MissingKey(key) => {
                write!(f, "devtool.conf is missing required key \\"{key}\\"")
            }
        }
    }
}

impl std::error::Error for DevtoolError {}`,
          },
          {
            title: '3. A hand-rolled key=value config parser',
            description: "A real project would reach for the toml crate — it handles nesting, arrays, and proper escaping that a hand-rolled parser doesn't. This std-only version is enough to demonstrate the pattern: read lines, skip blanks/comments, split on the first '=', and report the exact malformed line back to the user.",
            code: `use std::collections::HashMap;
use std::fs;

fn parse_config(path: &str) -> Result<HashMap<String, String>, DevtoolError> {
    let contents = fs::read_to_string(path).map_err(|_| DevtoolError::ConfigNotFound)?;
    let mut map = HashMap::new();

    for (i, line) in contents.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        match trimmed.split_once('=') {
            Some((key, value)) => {
                map.insert(key.trim().to_string(), value.trim().to_string());
            }
            None => {
                return Err(DevtoolError::ConfigMalformed {
                    line: i + 1,
                    content: trimmed.to_string(),
                });
            }
        }
    }
    Ok(map)
}`,
          },
          {
            title: '4. Implement each subcommand as a function returning Result',
            description: "Each command is its own function so main() stays a thin dispatcher. init refuses to clobber an existing config; build reads the config and reports what it needs but is missing, rather than a generic failure.",
            code: `use std::path::Path;

const CONFIG_PATH: &str = "devtool.conf";

fn run_init(name: &str) -> Result<(), DevtoolError> {
    if Path::new(CONFIG_PATH).exists() {
        return Err(DevtoolError::AlreadyInitialized);
    }
    let contents = format!("name={name}\\nmode=debug\\n");
    fs::write(CONFIG_PATH, contents).expect("failed to write devtool.conf");
    println!("Initialized project \\"{name}\\" -> {CONFIG_PATH}");
    Ok(())
}

fn run_build(release: bool) -> Result<(), DevtoolError> {
    let config = parse_config(CONFIG_PATH)?;
    let name = config.get("name").ok_or_else(|| DevtoolError::MissingKey("name".into()))?;
    let mode = if release { "release" } else { "debug" };
    println!("Building \\"{name}\\" in {mode} mode...");
    println!("Build succeeded.");
    Ok(())
}

fn run_status() -> Result<(), DevtoolError> {
    let config = parse_config(CONFIG_PATH)?;
    for (key, value) in &config {
        println!("{key} = {value}");
    }
    Ok(())
}`,
          },
          {
            title: '5. Dispatch in main() and map errors to exit codes',
            description: "clap::Parser::parse() handles its own malformed-argument errors internally (printing usage and exiting) before main() body even runs. Everything past that point is your DevtoolError — caught once, printed once, with one consistent exit code.",
            code: `fn main() {
    let cli = Cli::parse();

    let result = match cli.command {
        Command::Init { name } => run_init(&name),
        Command::Build { release } => run_build(release),
        Command::Status => run_status(),
    };

    if let Err(e) = result {
        eprintln!("error: {e}");
        std::process::exit(1);
    }
}`,
          },
        ],
      },
      {
        type: 'code',
        title: 'The full CLI (clap-based, non-runnable here)',
        description:
          "This needs `clap = { version = \"4\", features = [\"derive\"] }` in Cargo.toml, so it's marked non-runnable in this sandbox — but the derive macro usage (#[derive(Parser)], #[derive(Subcommand)], #[command(...)], #[arg(...)]) is exactly the real API. Drop this into a project with that dependency and `cargo run -- init --name myproj` works as shown.",
        language: 'rust',
        runnable: false,
        code: `use clap::{Parser, Subcommand};
use std::collections::HashMap;
use std::fmt;
use std::fs;
use std::path::Path;

/// devtool: a small project management CLI
#[derive(Parser)]
#[command(name = "devtool", version, about)]
struct Cli {
    #[command(subcommand)]
    command: Command,
}

#[derive(Subcommand)]
enum Command {
    /// Initialize a new project in the current directory
    Init {
        #[arg(long)]
        name: String,
    },
    /// Build the project according to devtool.conf
    Build {
        #[arg(long)]
        release: bool,
    },
    /// Show the current project status
    Status,
}

#[derive(Debug)]
enum DevtoolError {
    ConfigNotFound,
    ConfigMalformed { line: usize, content: String },
    AlreadyInitialized,
    MissingKey(String),
}

impl fmt::Display for DevtoolError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DevtoolError::ConfigNotFound => {
                write!(f, "no devtool.conf found in this directory -- run 'devtool init' first")
            }
            DevtoolError::ConfigMalformed { line, content } => {
                write!(f, "devtool.conf line {line} is not valid key=value: \\"{content}\\"")
            }
            DevtoolError::AlreadyInitialized => {
                write!(f, "devtool.conf already exists -- this directory is already initialized")
            }
            DevtoolError::MissingKey(key) => {
                write!(f, "devtool.conf is missing required key \\"{key}\\"")
            }
        }
    }
}

impl std::error::Error for DevtoolError {}

const CONFIG_PATH: &str = "devtool.conf";

fn parse_config(path: &str) -> Result<HashMap<String, String>, DevtoolError> {
    let contents = fs::read_to_string(path).map_err(|_| DevtoolError::ConfigNotFound)?;
    let mut map = HashMap::new();
    for (i, line) in contents.lines().enumerate() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }
        match trimmed.split_once('=') {
            Some((key, value)) => {
                map.insert(key.trim().to_string(), value.trim().to_string());
            }
            None => {
                return Err(DevtoolError::ConfigMalformed { line: i + 1, content: trimmed.to_string() });
            }
        }
    }
    Ok(map)
}

fn run_init(name: &str) -> Result<(), DevtoolError> {
    if Path::new(CONFIG_PATH).exists() {
        return Err(DevtoolError::AlreadyInitialized);
    }
    let contents = format!("name={name}\\nmode=debug\\n");
    fs::write(CONFIG_PATH, contents).expect("failed to write devtool.conf");
    println!("Initialized project \\"{name}\\" -> {CONFIG_PATH}");
    Ok(())
}

fn run_build(release: bool) -> Result<(), DevtoolError> {
    let config = parse_config(CONFIG_PATH)?;
    let name = config.get("name").ok_or_else(|| DevtoolError::MissingKey("name".into()))?;
    let mode = if release { "release" } else { "debug" };
    println!("Building \\"{name}\\" in {mode} mode...");
    println!("Build succeeded.");
    Ok(())
}

fn run_status() -> Result<(), DevtoolError> {
    let config = parse_config(CONFIG_PATH)?;
    for (key, value) in &config {
        println!("{key} = {value}");
    }
    Ok(())
}

fn main() {
    let cli = Cli::parse();

    let result = match cli.command {
        Command::Init { name } => run_init(&name),
        Command::Build { release } => run_build(release),
        Command::Status => run_status(),
    };

    if let Err(e) = result {
        eprintln!("error: {e}");
        std::process::exit(1);
    }
}`,
      },
      {
        type: 'terminal',
        title: 'Using the tool',
        description: 'clap generates --help and usage errors for free — you never write that text by hand.',
        lines: [
          { prompt: '$', text: 'devtool --help' },
          { text: 'devtool: a small project management CLI' },
          { text: '' },
          { text: 'Commands:' },
          { text: '  init    Initialize a new project in the current directory' },
          { text: '  build   Build the project according to devtool.conf' },
          { text: '  status  Show the current project status' },
          { prompt: '$', text: 'devtool build' },
          { text: 'error: no devtool.conf found in this directory -- run \'devtool init\' first' },
          { prompt: '$', text: 'echo $?' },
          { text: '1' },
          { prompt: '$', text: 'devtool init --name my-app' },
          { text: 'Initialized project "my-app" -> devtool.conf' },
          { prompt: '$', text: 'devtool build --release' },
          { text: 'Building "my-app" in release mode...' },
          { text: 'Build succeeded.' },
        ],
      },
      {
        type: 'quiz',
        title: 'Check your understanding',
        questions: [
          {
            id: 'q1',
            prompt: 'What does #[derive(Subcommand)] on an enum give you?',
            options: [
              { id: 'a', text: 'It has no effect without also implementing Debug.' },
              { id: 'b', text: 'clap generates a parser that dispatches to the matching enum variant based on the subcommand name typed on the command line, along with --help text from doc comments.' },
              { id: 'c', text: 'It automatically writes the function bodies for each subcommand.' },
              { id: 'd', text: 'It converts the enum into a config file format.' },
            ],
            correctOptionIds: ['b'],
            explanation: '#[derive(Subcommand)] tells clap this enum represents the set of subcommands a CLI accepts — clap builds the matching/parsing logic and help text from the enum\'s shape and doc comments, but the variant bodies (what each command does) are still yours to implement.',
          },
          {
            id: 'q2',
            prompt: 'Why does run_build() use ok_or_else(|| DevtoolError::MissingKey(\"name\".into())) instead of unwrap() on config.get(\"name\")?',
            options: [
              { id: 'a', text: 'unwrap() does not compile on Option<&String>.' },
              { id: 'b', text: 'ok_or_else() converts the missing case into a specific, user-readable DevtoolError instead of panicking with a generic message.' },
              { id: 'c', text: 'They behave identically; it is only a style preference.' },
              { id: 'd', text: 'ok_or_else() is required whenever HashMap is involved.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'unwrap() on a None would panic with a generic "called unwrap on a None value" message and a backtrace — useless to an end user. ok_or_else() turns the missing case into a DevtoolError::MissingKey that main() prints as a clear, actionable message.',
          },
          {
            id: 'q3',
            prompt: 'What happens when a user runs the tool with an argument clap does not recognize, e.g. devtool buld?',
            options: [
              { id: 'a', text: 'Your DevtoolError enum handles it via a Display impl.' },
              { id: 'b', text: 'clap itself detects the invalid subcommand during Cli::parse(), prints a usage/error message, and exits — before any of your command logic or DevtoolError ever runs.' },
              { id: 'c', text: 'The program panics with an unwrap error.' },
              { id: 'd', text: 'It silently does nothing.' },
            ],
            correctOptionIds: ['b'],
            explanation: 'Argument parsing errors are clap\'s responsibility, handled entirely inside Cli::parse() with its own formatted output and exit code — your DevtoolError only ever has to handle failures in your own command logic, not malformed CLI input.',
          },
        ],
      },
    ],
  },
}
