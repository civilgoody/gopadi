import { FaXmark, FaCircle } from 'react-icons/fa6'
import { useStore } from '@/store'

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useStore()

  if (tabs.length === 0) return null

  return (
    <div className="flex overflow-x-auto scrollbar-none border-b border-[#1e2730] bg-[#0f1419]"
      style={{ scrollbarWidth: 'none' }}>
      {tabs.map(tab => {
        const active = tab.id === activeTabId
        const name = tab.path.split('/').pop()!
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              group flex items-center gap-2 px-4 py-2.5 text-xs font-mono whitespace-nowrap
              border-r border-[#1e2730] transition-all shrink-0 relative
              ${active
                ? 'bg-[#0a0e14] text-[#e2eaf4]'
                : 'bg-[#0f1419] text-[#4a5568] hover:text-[#8899aa]'}
            `}
          >
            {active && (
              <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#00d2ff]" />
            )}
            {tab.dirty && (
              <FaCircle className="text-[#00d2ff] opacity-70" style={{ fontSize: 5 }} />
            )}
            <span>{name}</span>
            {tab.path !== 'untitled.go' && (
              <span
                onClick={e => { e.stopPropagation(); closeTab(tab.id) }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1 cursor-pointer"
              >
                <FaXmark style={{ fontSize: 10 }} />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
