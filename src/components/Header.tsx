import { useState } from 'react'
import { FaBars, FaPlay, FaWandMagicSparkles, FaCodeBranch, FaGear } from 'react-icons/fa6'
import { useStore } from '@/store'
import { runCode, formatCode } from '@/lib/go'
import { ensureRepo, getFileSHA, pushFile } from '@/lib/gitea'
import GiteaModal from './GiteaModal'

export default function Header() {
  const {
    tabs, activeTabId, setDrawerOpen,
    setRunResult, setRunStatus,
    pushStatus, setPushStatus,
    gitea, updateTabContent, setTabSha, markTabClean,
  } = useStore()

  const [giteaOpen, setGiteaOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [formatting, setFormatting] = useState(false)

  const tab = tabs.find(t => t.id === activeTabId)
  const configured = gitea.url && gitea.token && gitea.repo

  async function handleRun() {
    if (!tab || running) return
    setRunning(true)
    setRunStatus('running')
    const start = Date.now()
    try {
      const { output, error } = await runCode(tab.content)
      const time = `${((Date.now() - start) / 1000).toFixed(2)}s`
      setRunResult(error || output, error ? 'error' : 'success', time)
    } catch (e) {
      setRunResult((e as Error).message, 'error', '')
    } finally {
      setRunning(false)
    }
  }

  async function handleFormat() {
    if (!tab || formatting) return
    setFormatting(true)
    try {
      const { code, error } = await formatCode(tab.content)
      if (!error) updateTabContent(activeTabId!, code)
    } finally {
      setFormatting(false)
    }
  }

  async function handlePush() {
    if (!tab || !configured) { setGiteaOpen(true); return }
    setPushStatus('pushing')
    try {
      await ensureRepo(gitea)
      const sha = tab.sha ?? await getFileSHA(gitea, tab.path)
      const newSha = await pushFile(gitea, tab.path, tab.content, sha ?? null)
      setTabSha(tab.id, newSha)
      markTabClean(tab.id)
      setPushStatus('ok')
      setTimeout(() => setPushStatus('idle'), 3000)
    } catch (e) {
      setPushStatus('error')
      setTimeout(() => setPushStatus('idle'), 4000)
    }
  }

  const pushLabel = {
    idle: 'Push',
    pushing: 'Pushing…',
    ok: '✓ Pushed',
    error: '✗ Failed',
  }[pushStatus]

  const pushStyle = {
    idle: 'border-[#1e2730] text-[#4a5568] hover:text-[#00b4a0] hover:border-[#00b4a0]',
    pushing: 'border-[#d29922] text-[#d29922] opacity-70',
    ok: 'border-emerald-500 text-emerald-400',
    error: 'border-red-500 text-red-400',
  }[pushStatus]

  return (
    <>
      <header className="flex items-center gap-2 px-3 py-2.5 bg-[#0f1419] border-b border-[#1e2730] shrink-0">
        {/* Left: hamburger + logo */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 text-[#4a5568] hover:text-[#00d2ff] transition-colors rounded-lg hover:bg-[#141a22]"
        >
          <FaBars style={{ fontSize: 14 }} />
        </button>

        <div className="flex items-center gap-1.5 mr-auto">
          <span className="text-[#00d2ff] font-bold text-sm tracking-tight font-mono">Go</span>
          <span className="text-[#2a3545] font-bold text-sm">Pad</span>
          {tab && (
            <span className="hidden sm:flex items-center gap-1 ml-2 text-[10px] font-mono text-[#2a3545]">
              <span className="text-[#1e2730]">/</span>
              {tab.path}
              {tab.dirty && <span className="size-1.5 rounded-full bg-[#00d2ff] opacity-60" />}
            </span>
          )}
        </div>

        {/* Right: actions */}
        <button
          onClick={handleFormat}
          disabled={formatting}
          title="Format (gofmt)"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#1e2730]
            text-[11px] text-[#4a5568] hover:text-[#e2eaf4] hover:border-[#4a5568]
            transition-colors disabled:opacity-40 font-mono"
        >
          <FaWandMagicSparkles style={{ fontSize: 10 }} />
          fmt
        </button>

        <button
          onClick={handlePush}
          disabled={pushStatus === 'pushing'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px]
            transition-colors disabled:cursor-not-allowed font-medium ${pushStyle}`}
        >
          <FaCodeBranch style={{ fontSize: 10 }} />
          <span className="hidden sm:inline">{pushLabel}</span>
        </button>

        <button
          onClick={handleRun}
          disabled={running}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00d2ff] text-black
            text-[11px] font-bold hover:bg-[#00e5ff] transition-colors disabled:opacity-50
            disabled:cursor-not-allowed"
        >
          {running
            ? <span className="size-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
            : <FaPlay style={{ fontSize: 9 }} />
          }
          <span className="hidden sm:inline">{running ? 'Running…' : 'Run'}</span>
        </button>

        <button
          onClick={() => setGiteaOpen(true)}
          className={`p-2 rounded-lg transition-colors
            ${configured
              ? 'text-[#00b4a0] hover:text-[#00d2ff]'
              : 'text-[#2a3545] hover:text-[#4a5568]'}`}
          title="Gitea settings"
        >
          <FaGear style={{ fontSize: 13 }} />
        </button>
      </header>

      <GiteaModal open={giteaOpen} onClose={() => setGiteaOpen(false)} />
    </>
  )
}
