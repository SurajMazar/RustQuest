// monaco-editor's package.json `exports` map only declares types for the
// package root, not for the deep ESM subpaths we import to keep the bundle
// small (see src/lib/monacoEditorLazy.ts). These ambient shims satisfy the
// type checker; the actual runtime resolution is handled fine by Vite.
declare module 'monaco-editor/editor/editor.api' {
  export * from 'monaco-editor'
}

declare module 'monaco-editor/languages/definitions/rust/register.js'
