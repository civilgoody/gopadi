import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GiteaConfig, Tab, RunStatus, PushStatus } from "@/types";

const DEFAULT_CODE = `package main

import "github.com/01-edu/z01"

func main() {
\tz01.PrintRune('H')
\tz01.PrintRune('e')
\tz01.PrintRune('l')
\tz01.PrintRune('l')
\tz01.PrintRune('o')
\tz01.PrintRune('\\n')
}
`;

type Store = {
  // Gitea
  gitea: GiteaConfig;
  setGitea: (cfg: GiteaConfig) => void;

  // Tabs
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (tab: Tab) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  setTabSha: (id: string, sha: string) => void;
  markTabClean: (id: string) => void;

  // Drawer
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;

  // Run
  output: string;
  runStatus: RunStatus;
  execTime: string;
  setRunResult: (output: string, status: RunStatus, time: string) => void;
  setRunStatus: (s: RunStatus) => void;

  // Push
  pushStatus: PushStatus;
  setPushStatus: (s: PushStatus) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      // Gitea
      gitea: { url: "", user: "", token: "", repo: "piscine-go" },
      setGitea: (cfg) => set({ gitea: cfg }),

      // Tabs
      tabs: [
        {
          id: "default",
          path: "main.go",
          content: DEFAULT_CODE,
          dirty: false,
        },
      ],
      activeTabId: "default",

      openTab: (tab) => {
        const existing = get().tabs.find((t) => t.path === tab.path);
        if (existing) {
          set({ activeTabId: existing.id });
          return;
        }
        set((s) => ({ tabs: [...s.tabs, tab], activeTabId: tab.id }));
      },

      closeTab: (id) => {
        const tabs = get().tabs.filter((t) => t.id !== id);
        const activeTabId =
          get().activeTabId === id
            ? (tabs[tabs.length - 1]?.id ?? null)
            : get().activeTabId;
        set({ tabs, activeTabId });
      },

      setActiveTab: (id) => set({ activeTabId: id }),

      updateTabContent: (id, content) =>
        set((s) => ({
          tabs: s.tabs.map((t) =>
            t.id === id ? { ...t, content, dirty: true } : t,
          ),
        })),

      setTabSha: (id, sha) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, sha } : t)),
        })),

      markTabClean: (id) =>
        set((s) => ({
          tabs: s.tabs.map((t) => (t.id === id ? { ...t, dirty: false } : t)),
        })),

      // Drawer
      drawerOpen: false,
      setDrawerOpen: (v) => set({ drawerOpen: v }),

      // Run
      output: "",
      runStatus: "idle",
      execTime: "",
      setRunResult: (output, runStatus, execTime) =>
        set({ output, runStatus, execTime }),
      setRunStatus: (runStatus) => set({ runStatus }),

      // Push
      pushStatus: "idle",
      setPushStatus: (pushStatus) => set({ pushStatus }),
    }),
    {
      name: "gopad-store",
      partialize: (s) => ({
        gitea: s.gitea,
        tabs: s.tabs,
        activeTabId: s.activeTabId,
      }),
    },
  ),
);
