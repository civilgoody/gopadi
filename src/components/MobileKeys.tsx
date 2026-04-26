// Exposed via a custom event so Editor can receive insertions without prop drilling
export function insertAtCursor(text: string) {
  window.dispatchEvent(new CustomEvent('gopad:insert', { detail: text }))
}

const KEYS = [
  { label: '⇥', value: '\t' },
  { label: '{', value: '{' },
  { label: '}', value: '}' },
  { label: '(', value: '(' },
  { label: ')', value: ')' },
  { label: '[', value: '[' },
  { label: ']', value: ']' },
  { label: ':=', value: ':=' },
  { label: '<-', value: '<-' },
  { label: '"', value: '"' },
  { label: '`', value: '`' },
  { label: 'Println', value: 'fmt.Println("")' },
  { label: 'Printf', value: 'fmt.Printf("", )' },
  { label: 'PrintRune', value: 'z01.PrintRune()' },
  { label: 'func', value: 'func ' },
  { label: 'err≠nil', value: 'if err != nil {\n\t\n}' },
]

export default function MobileKeys() {
  return (
    <div className="flex md:hidden overflow-x-auto gap-1.5 px-2 py-2 bg-[#0f1419] border-t border-[#1e2730] shrink-0"
      style={{ scrollbarWidth: 'none' }}>
      {KEYS.map(k => (
        <button
          key={k.label}
          onPointerDown={e => { e.preventDefault(); insertAtCursor(k.value) }}
          className="shrink-0 px-2.5 py-1 rounded-md bg-[#141a22] border border-[#1e2730]
            text-[11px] font-mono text-[#8899aa] active:bg-[#1e2730] active:text-[#e2eaf4]
            select-none touch-none transition-colors whitespace-nowrap"
        >
          {k.label}
        </button>
      ))}
    </div>
  )
}
