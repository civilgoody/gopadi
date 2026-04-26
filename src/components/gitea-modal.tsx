import { useState } from 'react'
import { useStore } from '@/store'
import { testConnection } from '@/lib/gitea'
import type { GiteaConfig } from '@/types'

type Props = { open: boolean; onClose: () => void }

export default function GiteaModal({ open, onClose }: Props) {
  const { gitea, setGitea } = useStore()
  const [form, setForm] = useState<GiteaConfig>(gitea)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState('')
  const [testOk, setTestOk] = useState(false)

  function field(key: keyof GiteaConfig) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleTest() {
    setTesting(true)
    setTestMsg('')
    try {
      const login = await testConnection({ ...form, url: form.url.replace(/\/$/, '') })
      setTestMsg(`✓ Connected as @${login}`)
      setTestOk(true)
    } catch (e) {
      setTestMsg((e as Error).message)
      setTestOk(false)
    } finally {
      setTesting(false)
    }
  }

  function handleSave() {
    const cfg = { ...form, url: form.url.replace(/\/$/, '') }
    setGitea(cfg)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm bg-[#0f1419] border border-[#1e2730] rounded-2xl p-6 shadow-2xl">
        <div className="mb-5">
          <h2 className="text-sm font-bold text-[#00d2ff] tracking-widest uppercase mb-1">Gitea</h2>
          <p className="text-[11px] text-[#4a5568] leading-relaxed">
            Token stored in localStorage only — never leaves your browser.
            Generate one at <span className="font-mono text-[#6b7f93]">Settings → Applications</span> with <span className="font-mono text-[#6b7f93]">repo</span> scope.
          </p>
        </div>

        {[
          { key: 'url' as const, label: 'GITEA URL', placeholder: 'https://acad.learn2earn.ng/git', type: 'url' },
          { key: 'user' as const, label: 'USERNAME', placeholder: 'glawani', type: 'text' },
          { key: 'token' as const, label: 'ACCESS TOKEN', placeholder: '••••••••••', type: 'password' },
          { key: 'repo' as const, label: 'REPO NAME', placeholder: 'piscine-go', type: 'text' },
        ].map(({ key, label, placeholder, type }) => (
          <div key={key} className="mb-3">
            <label className="block text-[10px] font-semibold tracking-widest text-[#4a5568] mb-1.5">{label}</label>
            <input
              type={type}
              value={form[key]}
              onChange={field(key)}
              placeholder={placeholder}
              className="w-full bg-[#0a0e14] border border-[#1e2730] rounded-lg px-3 py-2
                text-xs font-mono text-[#e2eaf4] placeholder:text-[#2a3545]
                focus:outline-none focus:border-[#00d2ff] transition-colors"
            />
          </div>
        ))}

        {testMsg && (
          <p className={`text-[11px] mb-3 ${testOk ? 'text-emerald-400' : 'text-red-400'}`}>{testMsg}</p>
        )}

        <div className="flex gap-2 mt-5">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[#1e2730] text-xs text-[#4a5568]
              hover:text-[#e2eaf4] hover:border-[#4a5568] transition-colors">
            Cancel
          </button>
          <button onClick={handleTest} disabled={testing}
            className="flex-1 py-2 rounded-lg border border-[#1e2730] text-xs text-[#6b7f93]
              hover:text-[#00d2ff] hover:border-[#00d2ff] transition-colors disabled:opacity-40">
            {testing ? 'Testing…' : 'Test'}
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2 rounded-lg bg-[#00d2ff] text-black text-xs font-bold
              hover:bg-[#00e5ff] transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
