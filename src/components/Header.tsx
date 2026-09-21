import React from 'react';
import {
  Search,
  HelpCircle,
  Sparkles,
  Cpu,
  Layers,
  BarChart2,
  GitCompare,
  BookOpen,
  TrendingUp,
  Home,
} from 'lucide-react';
import { WasmEngineStatus } from '../wasm/bridge';

export type ActiveTab = 'visualizer' | 'auditor' | 'compare' | 'cheatsheet' | 'bigo';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  whyMode: boolean;
  onToggleWhyMode: () => void;
  onOpenSearch: () => void;
  onOpenShortcuts: () => void;
  onGoHome: () => void;
  wasmStatus: WasmEngineStatus;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  whyMode,
  onToggleWhyMode,
  onOpenSearch,
  onOpenShortcuts,
  onGoHome,
  wasmStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#0e1014]/90 backdrop-blur-md border-b border-[#1f222b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-home-btn"
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 hover:opacity-90 transition group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:border-amber-400/60 transition">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-100 tracking-tight text-sm sm:text-base">
                  RUST DSA LAB
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1e222b] text-amber-400 border border-[#2b303d]">
                  WASM
                </span>
              </div>
              <p className="text-[10px] text-stone-400 font-mono hidden sm:block">
                Algorithm Visualizer &amp; Auditor
              </p>
            </div>
          </button>
        </div>

        {/* Center Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-[#13161c] p-1 rounded-lg border border-[#222631]">
          <button
            id="nav-tab-visualizer"
            type="button"
            onClick={() => onSelectTab('visualizer')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'visualizer'
                ? 'bg-[#222633] text-amber-300 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1d24]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Visualizer</span>
          </button>

          <button
            id="nav-tab-auditor"
            type="button"
            onClick={() => onSelectTab('auditor')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'auditor'
                ? 'bg-[#222633] text-amber-300 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1d24]'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Complexity Auditor</span>
          </button>

          <button
            id="nav-tab-compare"
            type="button"
            onClick={() => onSelectTab('compare')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'compare'
                ? 'bg-[#222633] text-amber-300 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1d24]'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </button>

          <button
            id="nav-tab-cheatsheet"
            type="button"
            onClick={() => onSelectTab('cheatsheet')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'cheatsheet'
                ? 'bg-[#222633] text-amber-300 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1d24]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cheat Sheet</span>
          </button>

          <button
            id="nav-tab-bigo"
            type="button"
            onClick={() => onSelectTab('bigo')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'bigo'
                ? 'bg-[#222633] text-amber-300 shadow-xs'
                : 'text-stone-400 hover:text-stone-200 hover:bg-[#1a1d24]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Big-O Curves</span>
          </button>
        </nav>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <button
            id="header-search-btn"
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#16181f] hover:bg-[#1f222b] border border-[#262a36] text-stone-400 text-xs font-mono transition"
            title="Search Algorithms (⌘K)"
          >
            <Search className="w-3.5 h-3.5 text-stone-400" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden sm:inline text-[10px] px-1 py-0.5 rounded bg-[#222633] text-stone-400 border border-[#303547]">
              ⌘K
            </kbd>
          </button>

          {/* WHY? Mode Toggle */}
          <button
            id="why-mode-toggle-btn"
            type="button"
            onClick={onToggleWhyMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono transition border ${
              whyMode
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold shadow-xs'
                : 'bg-[#16181f] border-[#262a36] text-stone-400 hover:text-stone-200'
            }`}
            title="Toggle WHY Mode: Explains pedagogical rationale behind each algorithm step"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>WHY?</span>
          </button>

          {/* WASM Engine Status badge */}
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#14161d] border border-[#232734] text-[11px] font-mono text-stone-400"
            title={wasmStatus.statusMessage}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="truncate max-w-[110px]">{wasmStatus.engineName}</span>
          </div>

          {/* Shortcuts / Help modal trigger */}
          <button
            id="shortcuts-help-btn"
            type="button"
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-md bg-[#16181f] hover:bg-[#1f222b] border border-[#262a36] text-stone-400 hover:text-stone-200 transition"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Return to Landing */}
          <button
            id="nav-home-icon-btn"
            type="button"
            onClick={onGoHome}
            className="p-1.5 rounded-md bg-[#16181f] hover:bg-[#1f222b] border border-[#262a36] text-stone-400 hover:text-stone-200 transition md:hidden"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="md:hidden flex items-center overflow-x-auto px-4 py-2 border-t border-[#1f222b] gap-2 text-xs bg-[#0b0c0e]">
        {(['visualizer', 'auditor', 'compare', 'cheatsheet', 'bigo'] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onSelectTab(tab)}
            className={`px-2.5 py-1 rounded capitalize whitespace-nowrap ${
              activeTab === tab
                ? 'bg-amber-500/20 text-amber-300 font-medium'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            {tab === 'bigo' ? 'Big-O' : tab}
          </button>
        ))}
      </div>
    </header>
  );
};
