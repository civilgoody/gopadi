import { useRef, useState } from "react";
import { FaXmark, FaCircle, FaPlus } from "react-icons/fa6";
import { useStore } from "@/store";

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, newTab } = useStore();

  const [naming, setNaming] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function startNew() {
    setNameVal("");
    setNaming(true);
    // defer focus so the input is mounted
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitNew() {
    const raw = nameVal.trim();
    if (raw) {
      const path = raw.endsWith(".go") ? raw : `${raw}.go`;
      // don't open duplicate
      if (!tabs.find((t) => t.path === path)) newTab(path);
      else setActiveTab(tabs.find((t) => t.path === path)!.id);
    }
    setNaming(false);
  }

  if (tabs.length === 0 && !naming) return null;

  return (
    <div
      className="flex overflow-x-auto border-b border-[#1e2730] bg-[#0f1419]"
      style={{ scrollbarWidth: "none" }}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTabId;
        const name = tab.path.split("/").pop()!;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              group flex items-center gap-2 px-4 py-2.5 text-xs font-mono whitespace-nowrap
              border-r border-[#1e2730] transition-all shrink-0 relative
              ${
                active
                  ? "bg-[#0a0e14] text-[#e2eaf4]"
                  : "bg-[#0f1419] text-[#4a5568] hover:text-[#8899aa]"
              }
            `}
          >
            {active && (
              <span className="absolute top-0 left-0 right-0 h-[2px] bg-[#00d2ff]" />
            )}
            {tab.dirty && (
              <FaCircle
                className="text-[#00d2ff] opacity-70"
                style={{ fontSize: 5 }}
              />
            )}
            <span>{name}</span>
            {tab.path !== "main.go" && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1 cursor-pointer"
              >
                <FaXmark style={{ fontSize: 10 }} />
              </span>
            )}
          </button>
        );
      })}

      {/* Inline new-file input */}
      {naming ? (
        <input
          ref={inputRef}
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitNew();
            if (e.key === "Escape") setNaming(false);
          }}
          onBlur={commitNew}
          placeholder="filename.go"
          className="px-3 py-2.5 text-xs font-mono bg-[#141a22] text-[#e2eaf4]
            border-r border-[#1e2730] outline-none w-32
            placeholder:text-[#2a3545]"
        />
      ) : (
        <button
          onClick={startNew}
          title="New file"
          className="px-3 py-2.5 text-[#2a3545] hover:text-[#00d2ff] transition-colors shrink-0"
        >
          <FaPlus style={{ fontSize: 10 }} />
        </button>
      )}
    </div>
  );
}
