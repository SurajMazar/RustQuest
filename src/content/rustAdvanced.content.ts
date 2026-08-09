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
}
