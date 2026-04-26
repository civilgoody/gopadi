import CodeMirror from '@uiw/react-codemirror'
import { go } from '@codemirror/lang-go'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useStore } from '@/store'

const theme = EditorView.theme({
  '&': { background: '#0a0e14 !important', height: '100%' },
  '.cm-content': { fontFamily: "'JetBrains Mono', monospace", padding: '12px 0' },
  '.cm-gutters': { background: '#0a0e14', borderRight: '1px solid #1e2730', color: '#2a3a4a' },
  '.cm-lineNumbers .cm-gutterElement': { paddingRight: '16px', paddingLeft: '8px' },
  '.cm-activeLine': { background: 'rgba(0,210,255,0.03)' },
  '.cm-activeLineGutter': { background: 'rgba(0,210,255,0.05)', color: '#4a6a7a !important' },
  '.cm-selectionBackground': { background: 'rgba(0,210,255,0.15) !important' },
  '.cm-cursor': { borderLeftColor: '#00d2ff' },
  '.cm-matchingBracket': { background: 'rgba(0,210,255,0.2)', outline: 'none' },
})

export default function Editor() {
  const { tabs, activeTabId, updateTabContent } = useStore()
  const tab = tabs.find(t => t.id === activeTabId)

  if (!tab) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#2a3545] text-sm font-mono">
        No file open
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-hidden">
      <CodeMirror
        key={tab.id}
        value={tab.content}
        height="100%"
        extensions={[go(), theme]}
        theme={oneDark}
        onChange={val => updateTabContent(tab.id, val)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: false,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: false,
          tabSize: 4,
        }}
        style={{ height: '100%' }}
      />
    </div>
  )
}
