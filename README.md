# Pygame Zero Visual Studio

A browser-based Python workshop. Students edit real Python as the main document. Optional syntax snippets reduce repetitive typing while students choose names, values, conditions, actions and execution order.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The editor autosaves source in this browser. First Run needs internet access to download Pyodide 0.27.7 from cdn.jsdelivr.net.

## Workflow

- Edit `game.py` directly, or edit a syntax snippet and insert it at your cursor. Undo/Redo include snippet insertion and loading Starter.
- Both editors use CodeMirror with a Python parser and a VS Code Dark+ inspired palette. This is syntax highlighting, not a Python language server. The desktop toolbox uses categories and a fixed preview/insert area instead of a scrolling syntax list.
- Run Python opens a larger preview. Pause and Step update help inspect state; Stop terminates the worker and returns to editing.
- The executed source is the same source that Copy and Download export. Each Run starts a fresh program.
- Existing v1 structured projects are converted to source on first use. Their original stored data is retained. The old application source is backed up in `work/LegacyApp.tsx.bak`.
- English lecture notes, exercises, worked code, teacher checkpoints and preview limitations are available at `/lecture-notes.html`. Use Print / Save as PDF for a classroom handout.

## Project notes

- `src/App.tsx` owns source editing, snippets, history, migration and export.
- `src/components/CodePreview.tsx` manages a terminable worker, canvas output and variable inspection.
- `public/python-worker.js` loads Pyodide and executes the source; `public/preview-runtime.py` implements a small display adapter.
- Supported display APIs: Actor with built-in illustrations and 52 × 52 rectangular bounds; position/angle/edges; colliderect; keyboard state; draw/update; screen clear/fill/text; print. Normal Python control flow and standard-library random execute in Python.
- The adapter targets 60 updates/s with fixed dt = 1/60; browser scheduling can be slower. It is not the full Pygame Zero package. Mouse/key event hooks, sound, timers, animation helpers, custom images and other drawing methods are outside the current scope. Unsupported event hooks report an error.
- Desktop exports need Pygame Zero plus matching PNG files under `images/`. The .py download does not bundle the browser illustrations.

This is a frontend prototype with browser Python execution and a limited Pygame Zero display adapter. TypeScript and the production build passed after this revision; interactive browser behaviour has not been reverified.
