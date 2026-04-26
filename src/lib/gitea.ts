import type { GiteaConfig, RepoFile } from '@/types'

function headers(cfg: GiteaConfig) {
  return {
    Authorization: `token ${cfg.token}`,
    'Content-Type': 'application/json',
  }
}

export async function testConnection(cfg: GiteaConfig): Promise<string> {
  const res = await fetch(`${cfg.url}/api/v1/user`, { headers: headers(cfg) })
  if (!res.ok) throw new Error(`Auth failed (${res.status})`)
  const data = await res.json()
  return data.login as string
}

export async function ensureRepo(cfg: GiteaConfig): Promise<void> {
  const check = await fetch(`${cfg.url}/api/v1/repos/${cfg.user}/${cfg.repo}`, {
    headers: headers(cfg),
  })
  if (check.ok) return

  const create = await fetch(`${cfg.url}/api/v1/user/repos`, {
    method: 'POST',
    headers: headers(cfg),
    body: JSON.stringify({
      name: cfg.repo,
      description: 'Go Piscine exercises',
      private: false,
      auto_init: true,
      default_branch: 'main',
    }),
  })
  if (!create.ok) throw new Error('Could not create repo')
}

export async function getFileSHA(cfg: GiteaConfig, path: string): Promise<string | null> {
  const res = await fetch(
    `${cfg.url}/api/v1/repos/${cfg.user}/${cfg.repo}/contents/${path}`,
    { headers: headers(cfg) }
  )
  if (!res.ok) return null
  const data = await res.json()
  return data.sha ?? null
}

export async function getFileContent(cfg: GiteaConfig, path: string): Promise<{ content: string; sha: string }> {
  const res = await fetch(
    `${cfg.url}/api/v1/repos/${cfg.user}/${cfg.repo}/contents/${path}`,
    { headers: headers(cfg) }
  )
  if (!res.ok) throw new Error(`Could not fetch ${path}`)
  const data = await res.json()
  const content = decodeURIComponent(escape(atob(data.content.replace(/\n/g, ''))))
  return { content, sha: data.sha }
}

export async function pushFile(
  cfg: GiteaConfig,
  path: string,
  content: string,
  sha: string | null
): Promise<string> {
  const encoded = btoa(unescape(encodeURIComponent(content)))
  const body: Record<string, string> = {
    message: sha ? `update ${path}` : `add ${path}`,
    content: encoded,
    branch: 'main',
  }
  if (sha) body.sha = sha

  const res = await fetch(
    `${cfg.url}/api/v1/repos/${cfg.user}/${cfg.repo}/contents/${path}`,
    {
      method: sha ? 'PUT' : 'POST',
      headers: headers(cfg),
      body: JSON.stringify(body),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? `HTTP ${res.status}`)
  }
  const data = await res.json()
  return data.content?.sha ?? ''
}

export async function fetchRepoTree(cfg: GiteaConfig): Promise<RepoFile[]> {
  const res = await fetch(
    `${cfg.url}/api/v1/repos/${cfg.user}/${cfg.repo}/git/trees/main?recursive=true`,
    { headers: headers(cfg) }
  )
  if (!res.ok) throw new Error('Could not fetch repo tree')
  const data = await res.json()
  return (data.tree as { path: string; type: string; sha: string }[])
    .filter(f => f.type === 'blob')
    .filter(f => f.path.endsWith('.go'))
    .map(f => ({ path: f.path, type: 'file', sha: f.sha }))
}
