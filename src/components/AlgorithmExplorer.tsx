import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  ChevronRight,
  ArrowUpDown,
  Binary,
  Layers,
  Network,
  Cpu,
  GitFork,
  Hash,
  Filter,
} from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../algorithms/registry';
import { AlgorithmDefinition, AlgorithmCategory, DifficultyLevel } from '../types';

interface AlgorithmExplorerProps {
  selectedAlgorithmId: string;
  onSelectAlgorithm: (id: string) => void;
}

const CATEGORY_META: Record<
  AlgorithmCategory,
  { label: string; icon: React.ComponentType<{ className?: string }> }
> = {
  sorting: { label: 'Sorting', icon: ArrowUpDown },
  searching: { label: 'Searching', icon: Search },
  arrays: { label: 'Arrays & Slices', icon: Binary },
  linked_lists: { label: 'Linked Lists', icon: GitFork },
  stack_queue: { label: 'Stack & Queue', icon: Layers },
  trees: { label: 'Trees & BST', icon: Network },
  graphs: { label: 'Graph Algorithms', icon: Cpu },
  dp: { label: 'Dynamic Programming', icon: Hash },
  recursion: { label: 'Recursion', icon: GitFork },
};

export const AlgorithmExplorer: React.FC<AlgorithmExplorerProps> = ({
  selectedAlgorithmId,
  onSelectAlgorithm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyLevel | 'All'>('All');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredAlgorithms = useMemo(() => {
    return ALGORITHM_REGISTRY.filter((algo) => {
      const matchesSearch =
        algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.averageCase.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDifficulty =
        difficultyFilter === 'All' || algo.difficulty === difficultyFilter;

      return matchesSearch && matchesDifficulty;
    });
  }, [searchQuery, difficultyFilter]);

  const grouped = useMemo(() => {
    const map = new Map<AlgorithmCategory, AlgorithmDefinition[]>();
    filteredAlgorithms.forEach((algo) => {
      if (!map.has(algo.category)) {
        map.set(algo.category, []);
      }
      map.get(algo.category)!.push(algo);
    });
    return map;
  }, [filteredAlgorithms]);

  return (
    <aside
      id="algorithm-explorer-sidebar"
      className="w-full md:w-72 shrink-0 bg-[#0d0f13] border-r border-[#1e222b] flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden"
    >
      {/* Top Filter Bar */}
      <div className="p-3 border-b border-[#1e222b] space-y-2.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            id="explorer-search-input"
            type="text"
            placeholder="Filter algorithms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#14161d] border border-[#252936] text-xs font-mono text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
          />
        </div>

        {/* Difficulty Selector */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] font-mono">
          {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2 py-0.5 rounded transition ${
                difficultyFilter === diff
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-200 bg-[#14161c]'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {grouped.size === 0 ? (
          <div className="p-4 text-center text-xs text-stone-500 font-mono">
            No algorithms found matching criteria.
          </div>
        ) : (
          Array.from(grouped.entries()).map(([catKey, algos]) => {
            const meta = CATEGORY_META[catKey] || { label: catKey, icon: Layers };
            const Icon = meta.icon;
            const isCollapsed = !!collapsedCategories[catKey];

            return (
              <div key={catKey} className="space-y-1">
                {/* Category Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(catKey)}
                  className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-[#141720] text-stone-400 hover:text-stone-200 text-xs font-mono font-medium transition"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-amber-400/80" />
                    <span>{meta.label}</span>
                    <span className="text-[10px] text-stone-500 font-normal">({algos.length})</span>
                  </div>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
                  )}
                </button>

                {/* Algorithm Items */}
                {!isCollapsed && (
                  <div className="pl-3 space-y-0.5 border-l border-[#1b1e27] ml-2">
                    {algos.map((algo) => {
                      const isSelected = algo.id === selectedAlgorithmId;
                      return (
                        <button
                          key={algo.id}
                          id={`algo-item-${algo.id}`}
                          type="button"
                          onClick={() => onSelectAlgorithm(algo.id)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between transition ${
                            isSelected
                              ? 'bg-amber-500/15 text-amber-300 font-semibold border border-amber-500/30'
                              : 'text-stone-400 hover:text-stone-200 hover:bg-[#13161e]'
                          }`}
                        >
                          <span className="truncate pr-1">{algo.name}</span>
                          <span className="text-[10px] text-stone-500 font-normal shrink-0">
                            {algo.averageCase}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Explorer Footer Stats */}
      <div className="p-3 border-t border-[#1e222b] text-[11px] font-mono text-stone-500 flex items-center justify-between bg-[#0b0d10]">
        <span>Algorithms: {ALGORITHM_REGISTRY.length}</span>
        <span className="text-amber-400/80">Rust Core</span>
      </div>
    </aside>
  );
};
