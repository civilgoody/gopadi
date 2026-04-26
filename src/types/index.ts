export type GiteaConfig = {
  url: string
  user: string
  token: string
  repo: string
}

export type Tab = {
  id: string
  path: string       // e.g. "isnegative.go" or "boolean/main.go"
  content: string
  dirty: boolean     // unsaved local changes
  sha?: string       // gitea file SHA for updates
}

export type RepoFile = {
  path: string
  type: 'file' | 'dir'
  sha: string
}

export type RunStatus = 'idle' | 'running' | 'success' | 'error'
export type PushStatus = 'idle' | 'pushing' | 'ok' | 'error'
