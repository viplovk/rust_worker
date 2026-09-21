import React, { useState } from 'react';
import { TrendingUp, Info, HelpCircle } from 'lucide-react';

export const BigOExplainer: React.FC = () => {
  const [n, setN] = useState(16);

  // Compute values for given n
  const opsO1 = 1;
  const opsOLogN = Math.round(Math.log2(n) * 10) / 10;
  const opsON = n;
  const opsONLogN = Math.round(n * Math.log2(n));
  const opsON2 = Math.pow(n, 2);
  const opsO2N = n <= 30 ? Math.pow(2, n) : '> 10^9';
  const opsOFact = n <= 10 ? factorial(n) : '> 10^7';

  function factorial(x: number): number {
    if (x <= 1) return 1;
    return x * factorial(x - 1);
  }

  // SVG dimensions
  const width = 600;
  const height = 260;
  const padding = 40;
  const maxX = 32;
  const maxY = 500;

  const toX = (val: number) => padding + (val / maxX) * (width - 2 * padding);
  const toY = (val: number) => height - padding - (Math.min(val, maxY) / maxY) * (height - 2 * padding);

  const samplePoints = [1, 2, 4, 8, 12, 16, 20, 24, 28, 32];

  const pathO1 = `M ${toX(1)} ${toY(1)} L ${toX(32)} ${toY(1)}`;
  const pathOLogN = samplePoints.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(Math.log2(x) * 15)}`).join(' ');
  const pathON = samplePoints.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(x * 5)}`).join(' ');
  const pathONLogN = samplePoints.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(x * Math.log2(x) * 2.5)}`).join(' ');
  const pathON2 = samplePoints.map((x, i) => `${i === 0 ? 'M' : 'L'} ${toX(x)} ${toY(Math.pow(x, 2) * 0.45)}`).join(' ');

  return (
    <div id="big-o-explainer-container" className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f222b]">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-sans text-stone-100">Big-O Notation Deep Dive</h2>
          </div>
          <p className="text-stone-400 mt-1 font-sans">
            Understand mathematical asymptotic growth rates by dragging the input slider to test operation counts.
          </p>
        </div>

        {/* N Slider */}
        <div className="flex items-center gap-3 bg-[#101217] p-2.5 rounded-lg border border-[#202430]">
          <span className="text-stone-300 font-bold">Input Size N = {n}</span>
          <input
            type="range"
            min={2}
            max={64}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-32 sm:w-44 h-1.5 bg-[#262a37] rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>
      </div>

      {/* Operation Counts at N */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">O(1) Constant</span>
          <div className="text-base font-bold text-emerald-400 mt-0.5">{opsO1} ops</div>
          <span className="text-[9px] text-stone-500">Hash table lookup</span>
        </div>

        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">O(log n) Logarithmic</span>
          <div className="text-base font-bold text-cyan-400 mt-0.5">{opsOLogN} ops</div>
          <span className="text-[9px] text-stone-500">Binary Search</span>
        </div>

        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">O(n) Linear</span>
          <div className="text-base font-bold text-blue-400 mt-0.5">{opsON} ops</div>
          <span className="text-[9px] text-stone-500">Linear Scan / Kadane</span>
        </div>

        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">O(n log n) Linearithmic</span>
          <div className="text-base font-bold text-amber-400 mt-0.5">{opsONLogN} ops</div>
          <span className="text-[9px] text-stone-500">Quick / Merge / Heap Sort</span>
        </div>

        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">O(n²) Quadratic</span>
          <div className="text-base font-bold text-orange-400 mt-0.5">{opsON2} ops</div>
          <span className="text-[9px] text-stone-500">Bubble / Insertion Sort</span>
        </div>

        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">O(2ⁿ) Exponential</span>
          <div className="text-base font-bold text-red-400 mt-0.5">{opsO2N} ops</div>
          <span className="text-[9px] text-stone-500">Recursive Subsets</span>
        </div>
      </div>

      {/* SVG Multi-curve visualizer */}
      <div className="p-4 rounded-xl bg-[#101217] border border-[#1f222b] space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-stone-200">Asymptotic Growth Rate Chart</span>
          <span className="text-[10px] text-stone-500">Relative curve steepness</span>
        </div>

        <div className="w-full bg-[#0a0c0f] rounded-lg border border-[#1a1d26] p-2 flex items-center justify-center">
          <svg className="w-full h-64" viewBox={`0 0 ${width} ${height}`}>
            {/* Grid */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#272a38" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#272a38" strokeWidth="1" />

            {/* Labels */}
            <text x={width - padding + 5} y={height - padding + 4} fill="#6b7280" fontSize="10">N</text>
            <text x={padding - 20} y={padding - 10} fill="#6b7280" fontSize="10">Ops</text>

            {/* Curves */}
            <path d={pathO1} fill="none" stroke="#10b981" strokeWidth="2" />
            <path d={pathOLogN} fill="none" stroke="#38bdf8" strokeWidth="2" />
            <path d={pathON} fill="none" stroke="#60a5fa" strokeWidth="2" />
            <path d={pathONLogN} fill="none" stroke="#f59e0b" strokeWidth="2.5" />
            <path d={pathON2} fill="none" stroke="#f97316" strokeWidth="2" />

            {/* Current N vertical line marker */}
            <line
              x1={toX(Math.min(n, maxX))}
              y1={padding}
              x2={toX(Math.min(n, maxX))}
              y2={height - padding}
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[11px] justify-center pt-2">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> O(1) Constant
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> O(log n) Logarithmic
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> O(n) Linear
          </span>
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> O(n log n) Linearithmic
          </span>
          <span className="flex items-center gap-1.5 text-orange-400">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" /> O(n²) Quadratic
          </span>
        </div>
      </div>
    </div>
  );
};
