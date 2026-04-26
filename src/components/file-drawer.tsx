import { useEffect, useState } from 'react'
import { FaXmark, FaFile, FaFolderOpen, FaRotate, FaPlus } from 'react-icons/fa6'
import { useStore } from '@/store'
import { fetchRepoTree, getFileContent } from '@/lib/gitea'
import type { RepoFile } from '@/types'

export default function FileDrawer() {
  const { drawerOpen, setDrawerOpen, gitea, openTab } = useStore()
  const [files, setFiles] = useState<RepoFile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newPath, setNewPath] = useState('')
  const [showNew, setShowNew] = useState(false)

  const configured = gitea.url && gitea.token && gitea.repo

  useEffect(() => {
    if (drawerOpen && configured) loadTree()
  }, [drawerOpen])

  async function loadTree() {
    setLoading(true)
    setError('')
    try {
      const tree = await fetchRepoTree(gitea)
      setFiles(tree)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function openFile(file: RepoFile) {
    try {
      const { content, sha } = await getFileContent(gitea, file.path)
      openTab({
        id: crypto.randomUUID(),
        path: file.path,
        content,
        dirty: false,
        sha,
      })
      setDrawerOpen(false)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  function createNew() {
    const path = newPath.trim()
    if (!path) return
    openTab({
      id: crypto.randomUUID(),
      path: path.endsWith('.go') ? path : path + '.go',
      content: `package main\n\nimport "github.com/01-edu/z01"\n\nfunc main() {\n\tz01.PrintRune('\\n')\n}\n`,
      dirty: true,
    })
    setNewPath('')
    setShowNew(false)
    setDrawerOpen(false)
  }

  // Group files into folders
  const grouped: Record<string, RepoFile[]> = {}
  const rootFiles: RepoFile[] = []
  for (const f of files) {
    const parts = f.path.split('/')
    if (parts.length === 1) {
      rootFiles.push(f)
    } else {
      const folder = parts.slice(0, -1).join('/')
      grouped[folder] = grouped[folder] ?? []
      grouped[folder].push(f)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200
          ${drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className={`
        fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col
        bg-[#0f1419] border-r border-[#1e2730]
        transition-transform duration-250 ease-out
        ${drawerOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2730]">
          <div>
            <p className="text-xs font-semibold text-[#00d2ff] tracking-widest uppercase">Files</p>
            {gitea.repo && (
              <p className="text-[11px] text-[#4a5568] font-mono mt-0.5">{gitea.user}/{gitea.repo}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadTree} className="text-[#4a5568] hover:text-[#00d2ff] transition-colors p-1">
              <FaRotate className={loading ? 'animate-spin' : ''} style={{ fontSize: 12 }} />
            </button>
            <button onClick={() => setShowNew(v => !v)} className="text-[#4a5568] hover:text-[#00d2ff] transition-colors p-1">
              <FaPlus style={{ fontSize: 12 }} />
            </button>
            <button onClick={() => setDrawerOpen(false)} className="text-[#4a5568] hover:text-[#e2eaf4] transition-colors p-1">
              <FaXmark style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>

        {/* New file input */}
        {showNew && (
          <div className="px-3 py-2 border-b border-[#1e2730]">
            <input
              autoFocus
              value={newPath}
              onChange={e => setNewPath(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createNew()}
              placeholder="isnegative.go or boolean/main.go"
              className="w-full bg-[#0a0e14] border border-[#1e2730] rounded-md px-3 py-1.5
                text-xs font-mono text-[#e2eaf4] placeholder:text-[#4a5568]
                focus:outline-none focus:border-[#00d2ff] transition-colors"
            />
            <p className="text-[10px] text-[#4a5568] mt-1">Press Enter to open</p>
          </div>
        )}

        {/* File tree */}
        <div className="flex-1 overflow-y-auto py-2">
          {!configured && (
            <p className="text-xs text-[#4a5568] px-4 py-3">Configure Gitea first to browse files.</p>
          )}

          {error && (
            <p className="text-xs text-red-400 px-4 py-3">{error}</p>
          )}

          {loading && (
            <p className="text-xs text-[#4a5568] px-4 py-3 animate-pulse">Loading repo…</p>
          )}

          {/* Root files */}
          {rootFiles.map(f => (
            <FileRow key={f.path} file={f} onOpen={openFile} />
          ))}

          {/* Folders */}
          {Object.entries(grouped).map(([folder, folderFiles]) => (
            <FolderGroup key={folder} folder={folder} files={folderFiles} onOpen={openFile} />
          ))}

          {!loading && !error && configured && files.length === 0 && (
            <p className="text-xs text-[#4a5568] px-4 py-3">No .go files yet. Create one with +</p>
          )}
        </div>
      </div>
    </>
  )
}

function FileRow({ file, onOpen, indent = 0 }: { file: RepoFile; onOpen: (f: RepoFile) => void; indent?: number }) {
  const name = file.path.split('/').pop()!
  return (
    <button
      onClick={() => onOpen(file)}
      className="w-full flex items-center gap-2 px-4 py-1.5 text-xs font-mono
        text-[#6b7f93] hover:text-[#e2eaf4] hover:bg-[#141a22] transition-colors text-left"
      style={{ paddingLeft: 16 + indent * 12 }}
    >
      <FaFile className="text-[#00d2ff] opacity-50 shrink-0" style={{ fontSize: 10 }} />
      {name}
    </button>
  )
}

function FolderGroup({ folder, files, onOpen }: { folder: string; files: RepoFile[]; onOpen: (f: RepoFile) => void }) {
  const [open, setOpen] = useState(true)
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-4 py-1.5 text-xs font-mono
          text-[#4a5568] hover:text-[#8899aa] transition-colors"
      >
        <FaFolderOpen className="text-[#00d2ff] opacity-40 shrink-0" style={{ fontSize: 10 }} />
        {folder}/
      </button>
      {open && files.map(f => <FileRow key={f.path} file={f} onOpen={onOpen} indent={1} />)}
    </div>
  )
}
