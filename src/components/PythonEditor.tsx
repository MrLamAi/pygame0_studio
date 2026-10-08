import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { HighlightStyle, syntaxHighlighting, indentUnit } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { tags } from '@lezer/highlight';

// Palette inspired by VS Code Dark+. Parser-based highlighting, not Pylance semantics.
const theme = EditorView.theme({
  '&': { backgroundColor: '#1e1e1e', color: '#d4d4d4', height: '100%' },
  '.cm-content': { fontFamily: 'Consolas, "Courier New", monospace', padding: '14px 0', caretColor: '#ffffff' },
  '.cm-scroller': { fontFamily: 'Consolas, "Courier New", monospace', lineHeight: '1.75', overflow: 'auto' },
  '.cm-gutters': { backgroundColor: '#1e1e1e', color: '#858585', border: 'none' },
  '.cm-activeLineGutter': { backgroundColor: '#292929', color: '#cccccc' },
  '.cm-activeLine': { backgroundColor: '#ffffff08' },
  '.cm-cursor': { borderLeftColor: '#ffffff' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#264f78 !important' },
  '.cm-matchingBracket': { backgroundColor: '#3d5266', outline: '1px solid #7b8994' },
  '.cm-tooltip': { backgroundColor: '#252526', color: '#d4d4d4', border: '1px solid #555' },
}, { dark: true });
const colors = HighlightStyle.define([
  { tag: tags.keyword, color: '#c586c0' },
  { tag: [tags.definitionKeyword, tags.modifier, tags.bool, tags.null], color: '#569cd6' },
  { tag: [tags.variableName, tags.propertyName], color: '#9cdcfe' },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: '#dcdcaa' },
  { tag: [tags.definition(tags.variableName)], color: '#9cdcfe' },
  { tag: [tags.typeName, tags.className], color: '#4ec9b0' },
  { tag: [tags.string, tags.character], color: '#ce9178' },
  { tag: tags.number, color: '#b5cea8' },
  { tag: tags.comment, color: '#6a9955', fontStyle: 'italic' },
  { tag: [tags.operator, tags.punctuation], color: '#d4d4d4' },
]);
const extensions = [python(), indentUnit.of('    '), syntaxHighlighting(colors), theme];
const compactExtensions = [...extensions, EditorView.lineWrapping];
interface Props {
  value: string;
  onChange: (value: string) => void;
  label: string;
  compact?: boolean;
  onReady?: (view: EditorView) => void;
  onCursor?: (position: number) => void;
}
export function PythonEditor({ value, onChange, label, compact, onReady, onCursor }: Props) {
  return <CodeMirror className={compact ? 'python-input compact' : 'python-input'} value={value} onChange={onChange}
    theme="none" height="100%" extensions={compact ? compactExtensions : extensions} indentWithTab={false}
    basicSetup={{ lineNumbers: !compact, foldGutter: !compact, highlightActiveLine: !compact, highlightActiveLineGutter: !compact, autocompletion: false }}
    onCreateEditor={(view) => { view.contentDOM.setAttribute('aria-label', label); onReady?.(view); }}
    onUpdate={(update) => { if (update.selectionSet || update.docChanged) onCursor?.(update.state.selection.main.head); }} />;
}
