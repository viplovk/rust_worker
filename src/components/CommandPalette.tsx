import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, BookOpen } from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../algorithms/registry';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAlgorithm: (id: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectAlgorithm,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const results = ALGORITHM_REGISTRY.filter(
    (algo) =>
      algo.name.toLowerCase().includes(query.toLowerCase()) ||
      algo.category.toLowerCase().includes(query.toLowerCase()) ||
      algo.averageCase.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-xs">
      <div
        id="command-palette-modal"
        className="w-full max-w-xl rounded-xl bg-[#12141a] border border-[#272a38] shadow-2xl overflow-hidden font-mono text-xs"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#202330] gap-3">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search algorithms by name, category, or Big-O..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-stone-100 placeholder-stone-500 focus:outline-none text-sm"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[#1e222e] text-stone-400 border border-[#2d3244]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-4 text-center text-stone-500">No matching algorithms found.</div>
          ) : (
            results.map((algo) => (
              <button
                key={algo.id}
                type="button"
                onClick={() => {
                  onSelectAlgorithm(algo.id);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-[#1b1f2b] text-stone-300 hover:text-amber-300 flex items-center justify-between transition group"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                  <span className="font-semibold text-stone-100 group-hover:text-amber-300">
                    {algo.name}
                  </span>
                  <span className="text-[10px] text-stone-500 uppercase">{algo.category}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-amber-400/90">{algo.averageCase}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
