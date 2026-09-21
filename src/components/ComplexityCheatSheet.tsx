import React, { useState } from 'react';
import { Search, BookOpen, ExternalLink, ArrowUpDown } from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../algorithms/registry';

interface ComplexityCheatSheetProps {
  onSelectAlgorithm: (id: string) => void;
}

export const ComplexityCheatSheet: React.FC<ComplexityCheatSheetProps> = ({
  onSelectAlgorithm,
}) => {
  const [filter, setFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filtered = ALGORITHM_REGISTRY.filter((algo) => {
    const matchesSearch =
      algo.name.toLowerCase().includes(filter.toLowerCase()) ||
      algo.category.toLowerCase().includes(filter.toLowerCase());
    const matchesCat = selectedCategory === 'all' || algo.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div id="complexity-cheat-sheet-container" className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f222b]">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-sans text-stone-100">DSA Complexity Cheat Sheet</h2>
          </div>
          <p className="text-stone-400 mt-1 font-sans">
            Reference table of time and space complexities. Click any row to load into the interactive visualizer.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search algorithms..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#14161e] border border-[#252a38] text-stone-200 placeholder-stone-500 text-xs font-mono focus:outline-none"
          />

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#14161e] border border-[#252a38] text-stone-200 text-xs font-mono focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="sorting">Sorting</option>
            <option value="searching">Searching</option>
            <option value="arrays">Arrays</option>
            <option value="stack_queue">Stack &amp; Queue</option>
            <option value="trees">Trees</option>
            <option value="graphs">Graphs</option>
            <option value="dp">Dynamic Programming</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-[#1f222b] bg-[#101217] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-stone-300">
            <thead>
              <tr className="border-b border-[#222633] text-stone-500 text-[11px] bg-[#0c0e12]">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Best Time</th>
                <th className="py-3 px-4">Average Time</th>
                <th className="py-3 px-4">Worst Time</th>
                <th className="py-3 px-4">Space</th>
                <th className="py-3 px-4">In-Place</th>
                <th className="py-3 px-4">Stable</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((algo) => (
                <tr
                  key={algo.id}
                  onClick={() => onSelectAlgorithm(algo.id)}
                  className="border-b border-[#1b1e27] hover:bg-[#141720] cursor-pointer transition group"
                >
                  <td className="py-3 px-4 font-bold text-stone-100 group-hover:text-amber-300">
                    {algo.name}
                  </td>
                  <td className="py-3 px-4 text-stone-400 capitalize">{algo.category}</td>
                  <td className="py-3 px-4 text-emerald-400">{algo.bestCase}</td>
                  <td className="py-3 px-4 text-amber-400 font-bold">{algo.averageCase}</td>
                  <td className="py-3 px-4 text-red-400">{algo.worstCase}</td>
                  <td className="py-3 px-4 text-cyan-300">{algo.spaceComplexity}</td>
                  <td className="py-3 px-4 text-stone-400">
                    {algo.inPlace !== undefined ? (algo.inPlace ? 'Yes' : 'No') : '—'}
                  </td>
                  <td className="py-3 px-4 text-stone-400">
                    {algo.stable !== undefined ? (algo.stable ? 'Yes' : 'No') : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-amber-400/80 group-hover:text-amber-300 text-[11px]">
                      Open &rarr;
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
