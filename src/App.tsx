import { useEffect, useRef, useState } from 'react';
import { EditorView } from '@codemirror/view';
import { undo, redo } from '@codemirror/commands';
import { PythonEditor } from './components/PythonEditor';
import { loadSavedProject } from './lib/sampleProject';
import { generatePython } from './lib/generatePython';
import { CodePreview } from './components/CodePreview';
import './workbench.css';

const STARTER = `WIDTH = 800
HEIGHT = 600

player = Actor("spaceship", (150, 300))

def draw():
    screen.clear()
    player.draw()

def update():
    if keyboard.right:
        player.x += 5
`;
const SNIPPETS = [
  { label: 'Actor', group: 'Setup', code: 'player = Actor("spaceship", (150, 300))', help: 'Choose a name, image and coordinates. Add a draw call inside draw().' },
  { label: 'Variable', group: 'Setup', code: 'speed = 5', help: 'Type your own variable name and initial value.' },
  { label: 'Draw actor', group: 'Draw', code: 'player.draw()', help: 'Insert inside draw(). Use your actor name.' },
  { label: 'Show text', group: 'Draw', code: 'screen.draw.text(f"Score: {score}", (20, 20), color="white")', help: 'Insert inside draw(). Define score first.' },
  { label: 'If condition', group: 'Logic', code: 'if player.x > 400:\n    pass', help: 'Replace the condition and pass with your own action.' },
  { label: 'If / else', group: 'Logic', code: 'if score >= 10:\n    pass\nelse:\n    pass', help: 'Write each branch. Define score before using it.' },
  { label: 'Key held', group: 'Logic', code: 'if keyboard.right:\n    player.x += 5', help: 'Edit the key, actor, axis and distance. Checked every update.' },
  { label: 'Change value', group: 'Logic', code: 'player.x += 5', help: 'Type a number or expression, such as speed * dt.' },
  { label: 'Repeat: for', group: 'Logic', code: 'for i in range(3):\n    print(i)', help: 'Edit the range and body. The loop completes within one call.' },
  { label: 'Function', group: 'Structure', code: 'def reset_player():\n    player.pos = (150, 300)', help: 'Define at the left margin, then call reset_player() where needed.' },
  { label: 'Collision condition', group: 'Logic', code: 'if player.colliderect(coin):\n    pass', help: 'Create both actors first. Choose your own actions.' },
  { label: 'Print value', group: 'Debug', code: 'print(player.x)', help: 'Inspect values in Output. Inside update(), this prints repeatedly.' },
];
const STORAGE = 'pyzero:python-source:v2';
function initialCode() {
  try {
    const saved = localStorage.getItem(STORAGE);
    if (saved !== null) return saved;
    const old = loadSavedProject();
    if (old) return generatePython(old).code;
  } catch { /* Storage is optional. */ }
  return STARTER;
}

export default function App() {
  const [code, setCode] = useState(initialCode);
  const [selection, setSelection] = useState(0);
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [category, setCategory] = useState('Setup');
  const [draft, setDraft] = useState(SNIPPETS[0].code);
  const [status, setStatus] = useState('');
  const [saved, setSaved] = useState(true);
  const [running, setRunning] = useState(false);
  const [runCode, setRunCode] = useState('');
  const [runId, setRunId] = useState(0);
  const editor = useRef<EditorView | null>(null);
  const line = code.slice(0, selection).split('\n').length;
  useEffect(() => {
    try { localStorage.setItem(STORAGE, code); setSaved(true); }
    catch { setSaved(false); }
  }, [code]);
  function changeCode(next: string) {
    const view = editor.current;
    if (view) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: next } });
    else setCode(next);
  }
  function insert(text: string) {
    const el = editor.current;
    if (!el) return;
    const { from: start, to: end } = el.state.selection.main;
    const prefix = code.slice(code.lastIndexOf('\n', start - 1) + 1, start);
    const indent = prefix.match(/^ */)?.[0] ?? '';
    let content = text.replace(/\n/g, `\n${indent}`);
    if (prefix.trim()) content = `\n${indent}${content}`;
    if (code.slice(end).split('\n')[0].trim()) content += `\n${indent}`;
    el.dispatch({ changes: { from: start, to: end, insert: content }, selection: { anchor: start, head: start + content.length }, scrollIntoView: true });
    el.focus();
    setStatus('Inserted and selected in game.py. Edit it here; Ctrl+Z undoes insertion.');
  }
  function jump(section: string) {
    const pos = section === 'Setup' ? 0 : code.indexOf(`def ${section.toLowerCase()}(`);
    if (pos < 0) { setStatus(`No ${section.toLowerCase()} function yet. Add one in the editor.`); return; }
    const el = editor.current;
    if (!el) return;
    el.focus(); el.dispatch({ selection: { anchor: pos }, effects: EditorView.scrollIntoView(pos, { y: 'center' }) });
    setSelection(pos);
  }
  function download() {
    const url = URL.createObjectURL(new Blob([code], { type: 'text/x-python' }));
    const a = document.createElement('a'); a.href = url; a.download = 'game.py'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Downloaded game.py. Desktop Pygame Zero also needs matching image files; see lecture notes.');
  }
  return <div className="code-workbench">
    <header className="workbench-header">
      <div><strong>PyZero Studio</strong><span>Python workshop</span></div>
      <nav aria-label="Project actions">
        <a href="./lecture-notes.html" target="_blank" rel="noreferrer">Lecture notes ↗</a>
        <button onClick={() => { changeCode(STARTER); setStatus('Starter loaded. Undo restores your previous code.'); }}>Starter</button>
        <button onClick={download}>Download .py</button>
        <button className="primary" onClick={() => { setRunCode(code); setRunId((id) => id + 1); setRunning(true); }}>▶ Run Python</button>
      </nav>
    </header>
    <main className="coding-layout">
      <aside className="snippet-library">
        <div className="syntax-heading"><div className="eyebrow">PYTHON TOOLBOX</div><h2>Choose → edit → insert</h2></div>
        <div className="syntax-categories" role="group" aria-label="Syntax categories">
          {['Setup', 'Draw', 'Logic', 'Structure', 'Debug'].map((group) => <button key={group} aria-pressed={category === group} onClick={() => { setCategory(group); const i = SNIPPETS.findIndex((s) => s.group === group); setSnippetIndex(i); setDraft(SNIPPETS[i].code); }}>{group}</button>)}
        </div>
        <div className="snippet-list" role="group" aria-label="Python snippets">
          {SNIPPETS.map((snippet, i) => snippet.group === category && <button key={snippet.label} aria-pressed={snippetIndex === i} onClick={() => { setSnippetIndex(i); setDraft(snippet.code); }}><span>{snippet.label}</span></button>)}
        </div>
        <div className="snippet-draft-heading"><strong>{SNIPPETS[snippetIndex].label}</strong><span>Editable preview</span></div>
        <div className="snippet-draft-editor"><PythonEditor compact label="Edit syntax before inserting" value={draft} onChange={setDraft} /></div>
        <p className="snippet-help">{SNIPPETS[snippetIndex].help}</p>
        <div className="snippet-insert-footer"><span>Destination: game.py · line {line}</span><button className="insert-button primary" onClick={() => insert(draft)}>Insert into Python →</button></div>
      </aside>
      <section className="source-panel" aria-label="Python source editor">
        <header><strong>game.py</strong><span>{saved ? 'Saved in this browser' : 'Not saved — download a copy'}</span><button onClick={async () => { try { await navigator.clipboard.writeText(code); setStatus('Python copied.'); } catch { setStatus('Copy unavailable. Select code and copy manually.'); } }}>Copy</button></header>
        <nav aria-label="Code sections">{['Setup', 'Draw', 'Update'].map((s) => <button key={s} onClick={() => jump(s)}>{s}</button>)}<span>Read → Edit → Run → Inspect → Fix</span></nav>
        <div className="editable-code"><PythonEditor value={code} onChange={setCode} label="Python code editor" onReady={(view) => { editor.current = view; }} onCursor={setSelection} /></div>
        <div className="syntax-legend" aria-label="Python colour key"><span className="legend-keyword">Keywords</span><span className="legend-function">Functions</span><span className="legend-variable">Names / parameters</span><span className="legend-string">Strings</span><span className="legend-number">Numbers</span><span className="legend-comment">Comments</span></div>
        <footer id="editor-help"><span>Ln {line} · Python · 4 spaces</span><button onClick={() => editor.current && undo(editor.current)}>Undo</button><button onClick={() => editor.current && redo(editor.current)}>Redo</button><span>Tab moves focus · Enter auto-indents</span></footer>
        <div className="editor-status" role="status">{status || 'Your code is the program. Shortcuts insert text; every line remains editable.'}</div>
      </section>
      <aside className="preview-rail">
        <div className="eyebrow">OUTPUT</div><h2>Preview</h2>
        <CodePreview code={runCode} runId={runId} expanded={running} onClose={() => setRunning(false)} />
        <p>Run opens a larger preview. Stop returns to your code.</p>
        <details><summary>Browser preview support</summary><p>Python runs in your browser. Supported: Actor, keyboard, draw/update, text and print. Sound, mouse events, timers and the full Pygame API are not implemented. First run needs internet to load Python.</p></details>
        <div className="learning-note"><strong>Before you run</strong><p>Predict one change. Run your code. Compare the result, then change one thing.</p><a href="./lecture-notes.html#practice" target="_blank" rel="noreferrer">Open practice tasks ↗</a></div>
      </aside>
    </main>
  </div>;
}
