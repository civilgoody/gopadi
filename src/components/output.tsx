import { useRef, useEffect, useState } from 'react'
import { useStore } from '@/store'

const MIN_H = 56
const DEFAULT_H = 200

export default function Output() {
  const { output, runStatus, execTime } = useStore()
  const [height, setHeight] = useState(DEFAULT_H)
  const dragging = useRef(false)
  const startY = useRef(0)
  const startH = useRef(0)

  function onMouseDown(e: React.MouseEvent | React.TouchEvent) {
    dragging.current = true
    startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY
    startH.current = height
  }

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragging.current) return
      const y = 'touches' in e ? e.touches[0].clientY : e.clientY
      const delta = startY.current - y
      setHeight(Math.max(MIN_H, Math.min(window.innerHeight * 0.7, startH.current + delta)))
    }
    function onUp() { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('touchmove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const statusColor = {
    idle: '#4a5568',
    running: '#d29922',
    success: '#3fb950',
    error: '#f85149',
  }[runStatus]

  const statusLabel = {
    idle: 'ready',
    running: 'running…',
    success: 'success',
    error: 'error',
  }[runStatus]

  return (
    <div className="flex flex-col shrink-0 bg-[#0f1419]" style={{ height }}>
      {/* Drag handle */}
      <div
        className="h-[3px] cursor-ns-resize bg-[#1e2730] hover:bg-[#00d2ff] transition-colors shrink-0 select-none"
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e2730] shrink-0">
        <span className="text-[10px] font-semibold tracking-widest text-[#4a5568] uppercase">Output</span>
        <div className="flex items-center gap-2">
          <span
            className={`size-1.5 rounded-full transition-colors ${runStatus === 'running' ? 'animate-pulse' : ''}`}
            style={{ background: statusColor }}
          />
          <span className="text-[10px] font-mono" style={{ color: statusColor }}>{statusLabel}</span>
          {execTime && (
            <span className="text-[10px] font-mono text-[#2a3545]">{execTime}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <pre className={`
        flex-1 overflow-auto px-4 py-3 text-xs font-mono leading-relaxed whitespace-pre-wrap break-words
        ${runStatus === 'error' ? 'text-red-400' : 'text-[#c9d8e8]'}
      `}>
        {output || (
          <span className="text-[#2a3545] italic">Press ▶ Run to execute your code</span>
        )}
      </pre>
    </div>
  )
}
