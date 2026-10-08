import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { CodeSection, GeneratedPython } from '../lib/generatePython';
import type { GameActor } from '../types/game';
import { Icon } from './Icon';

interface PythonPanelProps {
  generated: GeneratedPython;
  projectName: string;
  highlightLines: number[];
  activeSection: CodeSection;
  onSelectSection: (section: CodeSection) => void;
  runtimeActor: GameActor | null;
  runtimeScore: number;
  showScore: boolean;
}

const SECTIONS: { key: CodeSection; label: string; caption: string }[] = [
  { key: 'setup', label: 'Setup', caption: 'Objects and starting values' },
  { key: 'draw', label: 'Draw', caption: 'What appears each frame' },
  { key: 'update', label: 'Update', caption: 'Check inputs and change state' },
];

const TOKEN_PATTERN = /(#.*|f?"(?:[^"\\]|\\.)*"|f?'(?:[^'\\]|\\.)*'|\b(?:import|def|global|if|else|elif|return|for|in|while|True|False|None|and|or|not)\b|\b\d+\b)/g;
const KEYWORDS = new Set(['import', 'def', 'global', 'if', 'else', 'elif', 'return', 'for', 'in', 'while', 'True', 'False', 'None', 'and', 'or', 'not']);

function paintPythonLine(line: string): ReactNode[] {
  const pieces: ReactNode[] = [];
  let cursor = 0;
  for (const match of line.matchAll(TOKEN_PATTERN)) {
    const index = match.index ?? 0;
    if (index > cursor) pieces.push(line.slice(cursor, index));
    const token = match[0];
    let className = 'token-number';
    if (token.startsWith('#')) className = 'token-comment';
    else if (/^(?:f?['"])/.test(token)) className = 'token-string';
    else if (KEYWORDS.has(token)) className = 'token-keyword';
    pieces.push(<span className={className} key={`${index}-${token}`}>{token}</span>);
    cursor = index + token.length;
  }
  if (cursor < line.length) pieces.push(line.slice(cursor));
  return pieces.length ? pieces : [' '];
}

export function PythonPanel({ generated, projectName, highlightLines, activeSection, onSelectSection, runtimeActor, runtimeScore, showScore }: PythonPanelProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const codeViewport = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const lines = generated.code.replace(/\n$/, '').split('\n');
  const primaryLine = highlightLines[0];

  useEffect(() => {
    if (primaryLine) lineRefs.current[primaryLine]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [primaryLine]);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(generated.code);
      setCopied(true);
      setCopyError(false);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = generated.code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const succeeded = document.execCommand('copy');
      textarea.remove();
      setCopied(succeeded);
      setCopyError(!succeeded);
    }
    window.setTimeout(() => { setCopied(false); setCopyError(false); }, 1800);
  }

  function downloadCode() {
    const blob = new Blob([generated.code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = projectName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'game';
    link.href = url;
    link.download = `${filename}.py`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <aside className="python-panel panel" aria-labelledby="python-heading">
      <div className="python-header">
        <div className="python-heading-copy"><span className="python-icon"><Icon name="code" size={17} /></span><div><h2 id="python-heading">Python code</h2><p>Your game, in real Python</p></div></div>
        <span className="python-live"><span className="live-dot" /> Live</span>
      </div>

      <div className="code-toolbar">
        <div className="code-file-tab"><span className="python-file-icon">Py</span><span>game.py</span><span className="code-tab-dot" /></div>
        <div className="code-actions">
          <button className={`code-action-button ${copied ? 'code-action-success' : ''}`} type="button" onClick={copyCode} title="Copy Python code"><Icon name={copied ? 'check' : 'copy'} size={14} />{copied ? 'Copied' : 'Copy'}</button>
          <button className="code-action-button download-action" type="button" onClick={downloadCode} title="Download Python file"><Icon name="download" size={14} /><span>Download</span></button>
        </div>
      </div>

      {runtimeActor ? (
        <div className="runtime-state-bar" aria-label="Live game variables">
          <span className="runtime-state-label"><span className="live-dot" /> Live values</span>
          <span><code>{generated.lineMap.actorIdentifiers[runtimeActor.id]}.x</code><strong>{runtimeActor.x}</strong></span>
          <span><code>{generated.lineMap.actorIdentifiers[runtimeActor.id]}.y</code><strong>{runtimeActor.y}</strong></span>
          {showScore && <span><code>score</code><strong>{runtimeScore}</strong></span>}
        </div>
      ) : null}

      <nav className="code-section-tabs" aria-label="Python code sections">
        <span className="code-section-label">PYTHON FLOW</span>
        {SECTIONS.map((section) => (
          <button
            type="button"
            key={section.key}
            className={`code-section-tab ${activeSection === section.key ? 'code-section-tab-active' : ''}`}
            aria-current={activeSection === section.key ? 'location' : undefined}
            title={section.caption}
            onClick={() => onSelectSection(section.key)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      <div className="code-content" ref={codeViewport}>
        <div className="code-lines" role="region" aria-label="Generated Python code. Use Setup, Draw, and Update to move through the program." tabIndex={0}>
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const active = highlightLines.includes(lineNumber);
            const primary = lineNumber === primaryLine;
            return (
              <div className={`code-line ${active ? 'code-line-active' : ''} ${primary ? 'code-line-primary' : ''}`} key={lineNumber} ref={(node) => { lineRefs.current[lineNumber] = node; }}>
                <span className="line-number" aria-hidden="true">{String(lineNumber).padStart(2, '0')}</span><span className="line-highlight" />
                <code>{paintPythonLine(line)}</code>
              </div>
            );
          })}
        </div>
      </div>

      <div className="python-footer">
        <span className="python-footer-status"><span className="live-dot" /> Auto-generated from your design</span>
        <span className="python-language">Python 3</span>
      </div>
      <div className="sr-only" aria-live="polite">{copied ? 'Python code copied to clipboard.' : copyError ? 'Copy failed. Select and copy the code manually.' : ''}</div>
    </aside>
  );
}
