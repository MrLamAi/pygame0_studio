/* global importScripts, loadPyodide */
let python;
let timer;
let paused = false;
async function initialize() {
  importScripts('https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js');
  python = await loadPyodide({ stdout: (text) => postMessage({ type: 'output', text }), stderr: (text) => postMessage({ type: 'output', text }) });
  const response = await fetch('./preview-runtime.py');
  if (!response.ok) throw new Error('Could not load preview runtime.');
  await python.runPythonAsync(await response.text());
}
function frame(advance = true) {
  try {
    python.globals.set('_advance', advance);
    const result = python.runPython('_frame(_advance)');
    postMessage({ type: 'frame', ...JSON.parse(result) });
    return true;
  } catch (error) {
    clearInterval(timer);
    postMessage({ type: 'error', text: String(error) });
    return false;
  }
}
self.onmessage = async ({ data }) => {
  try {
    if (data.type === 'run') {
      await initialize();
      python.globals.set('_source', data.code);
      python.runPython('_start(_source)');
      if (!frame(false)) return;
      postMessage({ type: 'ready' });
      timer = setInterval(() => { if (!paused) frame(); }, 1000 / 60);
    } else if (python && data.type === 'keys') {
      python.globals.set('_keys_json', JSON.stringify(data.keys));
      python.runPython('keyboard._held = set(json.loads(_keys_json))');
    } else if (data.type === 'pause') {
      paused = data.value;
    } else if (python && data.type === 'step' && paused) frame();
  } catch (error) { postMessage({ type: 'error', text: String(error) }); }
};
