import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ActorArt } from './ActorArt';
import { ACTOR_IMAGES } from '../types/game';

type Command = { kind: string; image?: string; x?: number; y?: number; angle?: number; color?: string; text?: string; size?: number };
type Frame = { commands: Command[]; variables: Record<string, string>; width: number; height: number };
interface Props { code: string; runId: number; expanded: boolean; onClose: () => void }
export function CodePreview({ code, runId, expanded, onClose }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const worker = useRef<Worker | null>(null);
  const [frame, setFrame] = useState<Frame | null>(null);
  const [message, setMessage] = useState('Run your Python to see its output.');
  const [output, setOutput] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({});
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    let active = true;
    Promise.all(ACTOR_IMAGES.map((name) => new Promise<[string, HTMLImageElement]>((resolve) => {
      const img = new Image();
      img.onload = () => resolve([name, img]);
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(renderToStaticMarkup(<ActorArt image={name} size={52} />))}`;
    }))).then((pairs) => { if (active) setImages(Object.fromEntries(pairs)); });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (expanded) dialog.current?.showModal();
    else dialog.current?.close();
  }, [expanded]);
  useEffect(() => {
    if (!expanded || !runId) return;
    setReady(false); setPaused(false); setOutput([]); setFrame(null);
    setMessage('Loading Python… first run may take a moment. Stop is always available.');
    const instance = new Worker(`${import.meta.env.BASE_URL}python-worker.js`);
    worker.current = instance;
    const timeout = setTimeout(() => setMessage('Still loading or executing. Check your connection, or Stop if your code contains an endless loop.'), 20000);
    instance.onmessage = ({ data }) => {
      if (data.type === 'frame') setFrame(data);
      if (data.type === 'ready') { clearTimeout(timeout); setReady(true); canvas.current?.focus(); setMessage('Running · keys control your program · browser adapter, target 60 updates/s'); }
      if (data.type === 'output') setOutput((old) => [...old.slice(-79), data.text]);
      if (data.type === 'error') { clearTimeout(timeout); setReady(false); setMessage('Python stopped. Read the error, then Stop & edit.'); setOutput((old) => [...old.slice(-79), data.text]); }
    };
    instance.onerror = () => { clearTimeout(timeout); setMessage('Python could not load. Check internet access to cdn.jsdelivr.net, then run again.'); };
    instance.postMessage({ type: 'run', code });
    const keys = new Set<string>();
    function key(event: globalThis.KeyboardEvent) {
      if (event.key === 'Escape' || event.key === 'Tab') return;
      if (event.type === 'keydown' && event.target instanceof HTMLButtonElement) return;
      const name = event.key.replace('Arrow', '').toLowerCase();
      if (event.type === 'keydown') keys.add(name); else keys.delete(name);
      if (event.key.startsWith('Arrow') || event.key === ' ') event.preventDefault();
      instance.postMessage({ type: 'keys', keys: [...keys] });
    }
    function blur() { keys.clear(); instance.postMessage({ type: 'keys', keys: [] }); }
    window.addEventListener('keydown', key); window.addEventListener('keyup', key); window.addEventListener('blur', blur);
    return () => { clearTimeout(timeout); instance.terminate(); worker.current = null; window.removeEventListener('keydown', key); window.removeEventListener('keyup', key); window.removeEventListener('blur', blur); };
  }, [expanded, runId, code]);
  useEffect(() => {
    if (!frame || !canvas.current) return;
    const ctx = canvas.current.getContext('2d');
    if (!ctx) return;
    if (canvas.current.width !== frame.width) canvas.current.width = frame.width;
    if (canvas.current.height !== frame.height) canvas.current.height = frame.height;
    for (const cmd of frame.commands) {
      if (cmd.kind === 'fill') { ctx.fillStyle = cmd.color ?? 'black'; ctx.fillRect(0, 0, frame.width, frame.height); }
      if (cmd.kind === 'actor' && cmd.image && images[cmd.image]) {
        ctx.save(); ctx.translate(cmd.x ?? 0, cmd.y ?? 0); ctx.rotate(-(cmd.angle ?? 0) * Math.PI / 180); ctx.drawImage(images[cmd.image], -26, -26, 52, 52); ctx.restore();
      }
      if (cmd.kind === 'text') { ctx.fillStyle = cmd.color ?? 'white'; ctx.font = `${cmd.size ?? 24}px sans-serif`; ctx.textBaseline = 'top'; ctx.fillText(cmd.text ?? '', cmd.x ?? 0, cmd.y ?? 0); }
    }
  }, [frame, images, expanded]);
  const content = <>
    <canvas ref={canvas} width={800} height={600} tabIndex={0} aria-label="Python game preview. Click here to use keyboard controls." />
    <p role="status">{message}</p>
    {expanded && <div className="runtime-inspect"><section><h3>Variables</h3><dl>{Object.entries(frame?.variables ?? {}).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl></section><section><h3>Output / errors</h3><pre tabIndex={0}>{output.join('\n') || 'print() output and Python errors appear here.'}</pre></section></div>}
  </>;
  return <>
    {!expanded && <div className="mini-preview">{content}</div>}
    <dialog ref={dialog} className="run-dialog" aria-labelledby="run-title" onCancel={(e) => { e.preventDefault(); closeRef.current(); }}>
      <header><div><strong id="run-title">Run & inspect</strong><small>Executing the editor’s Python · Stop terminates execution</small></div><button disabled={!ready} onClick={() => { setPaused(!paused); worker.current?.postMessage({ type: 'pause', value: !paused }); }}>{paused ? 'Resume' : 'Pause'}</button><button disabled={!ready || !paused} onClick={() => worker.current?.postMessage({ type: 'step' })}>Step update</button><button autoFocus className="primary" onClick={onClose}>Stop & edit</button></header>
      {expanded && content}
    </dialog>
  </>;
}
