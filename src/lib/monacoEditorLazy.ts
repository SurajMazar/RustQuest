// Configure @monaco-editor/react to use a *minimal* locally-bundled Monaco
// instead of either (a) fetching the whole editor from a CDN at runtime, or
// (b) pulling in monaco-editor's full barrel export, which bundles every
// supported language (60+) and balloons the build by several MB. We only
// ever edit Rust in the interactive playground, so we import just the core
// editor API plus the Rust basic-language contribution.
import { loader } from '@monaco-editor/react'
import * as monaco from 'monaco-editor/editor/editor.api'
import 'monaco-editor/languages/definitions/rust/register.js'
import Editor from '@monaco-editor/react'

loader.config({ monaco })

export default Editor
