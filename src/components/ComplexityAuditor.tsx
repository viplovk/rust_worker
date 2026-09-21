import React from 'react';
import {
  Activity,
  CheckCircle2,
  Clock,
  Database,
  GitFork,
  HelpCircle,
  Maximize2,
  Minimize2,
  TrendingUp,
} from 'lucide-react';
import { AlgorithmDefinition, ExecutionStats } from '../types';

interface ComplexityAuditorProps {
  algorithm: AlgorithmDefinition;
  stats: ExecutionStats;
  currentStep: number;
  totalSteps: number;
  inputSize: number;
}

export const ComplexityAuditor: React.FC<ComplexityAuditorProps> = ({
  algorithm,
  stats,
  currentStep,
  totalSteps,
  inputSize,
}) => {
  // SVG Growth Curve generator for visual comparison
  const width = 360;
  const height = 180;
  const padding = 30;

  // Theoretical points for curves
  const nValues = [2, 4, 8, 16, 32, 64];

  // Helper to map values to SVG coordinates
  const maxX = 64;
  const maxY = 250;

  const toX = (n: number) => padding + ((n - 2) / (maxX - 2)) * (width - 2 * padding);
  const toY = (ops: number) => height - padding - (Math.min(ops, maxY) / maxY) * (height - 2 * padding);

  // Generate paths
  const pathO1 = `M ${toX(2)} ${toY(1)} L ${toX(64)} ${toY(1)}`;
  const pathOLogN = nValues.map((n, i) => `${i === 0 ? 'M' : 'L'} ${toX(n)} ${toY(Math.log2(n) * 10)}`).join(' ');
  const pathON = nValues.map((n, i) => `${i === 0 ? 'M' : 'L'} ${toX(n)} ${toY(n * 2)}`).join(' ');
  const pathONLogN = nValues.map((n, i) => `${i === 0 ? 'M' : 'L'} ${toX(n)} ${toY(n * Math.log2(n) * 1.5)}`).join(' ');
  const pathON2 = nValues.map((n, i) => `${i === 0 ? 'M' : 'L'} ${toX(n)} ${toY(Math.pow(n, 2) * 0.2)}`).join(' ');

  // Current observed point
  const observedX = toX(Math.min(inputSize, maxX));
  const observedY = toY(stats.comparisons + stats.swaps);

  return (
    <div
      id="complexity-auditor-panel"
      className="bg-[#101216] border border-[#1f222b] rounded-xl p-4 space-y-4 font-mono text-xs"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f222b]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">
            Complexity Auditor
          </span>
        </div>
        <span className="text-[10px] text-stone-500">Theoretical vs Observed</span>
      </div>

      {/* Theoretical Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2.5 rounded-lg bg-[#14161d] border border-[#232734]">
          <div className="text-[10px] text-stone-500">Best Case</div>
          <div className="text-sm font-bold text-emerald-400 mt-0.5">{algorithm.bestCase}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#14161d] border border-[#232734]">
          <div className="text-[10px] text-stone-500">Average Case</div>
          <div className="text-sm font-bold text-amber-400 mt-0.5">{algorithm.averageCase}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#14161d] border border-[#232734]">
          <div className="text-[10px] text-stone-500">Worst Case</div>
          <div className="text-sm font-bold text-red-400 mt-0.5">{algorithm.worstCase}</div>
        </div>

        <div className="p-2.5 rounded-lg bg-[#14161d] border border-[#232734]">
          <div className="text-[10px] text-stone-500">Space Complexity</div>
          <div className="text-sm font-bold text-cyan-400 mt-0.5">{algorithm.spaceComplexity}</div>
        </div>
      </div>

      {/* Observed Metrics Grid */}
      <div className="p-3 rounded-lg bg-[#0d0f13] border border-[#1c1f28] space-y-2">
        <div className="text-[11px] font-semibold text-stone-300 flex items-center justify-between">
          <span>Live Execution Counters</span>
          <span className="text-emerald-400 font-normal">N = {inputSize} elements</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-stone-300 pt-1">
          <div>
            <span className="text-[10px] text-stone-500 block">Comparisons</span>
            <span className="text-base font-bold text-cyan-300">{stats.comparisons}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Swaps / Writes</span>
            <span className="text-base font-bold text-orange-300">{stats.swaps + stats.writes}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Memory Reads</span>
            <span className="text-base font-bold text-purple-300">{stats.reads}</span>
          </div>
          <div>
            <span className="text-[10px] text-stone-500 block">Measured Time</span>
            <span className="text-base font-bold text-emerald-300">{stats.measuredTimeMs} ms</span>
          </div>
        </div>

        <div className="pt-2 border-t border-[#1a1d26] grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-stone-400">
          <div>
            Recursive Calls: <span className="text-stone-200">{stats.recursiveCalls}</span>
          </div>
          <div>
            Aux Allocations: <span className="text-stone-200">{stats.allocations}</span>
          </div>
          <div>
            Stable: <span className="text-stone-200">{algorithm.stable ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>

      {/* Comparative Growth Chart */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-stone-400">
          <span>Theoretical Growth Reference vs Observed Point</span>
          <span className="text-amber-400 font-semibold">● Current Run</span>
        </div>

        <div className="w-full bg-[#0a0c0f] rounded-lg border border-[#1c1f28] p-2 flex items-center justify-center">
          <svg className="w-full h-36" viewBox={`0 0 ${width} ${height}`}>
            {/* Axes */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="#2d313e"
              strokeWidth="1"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="#2d313e"
              strokeWidth="1"
            />

            {/* Labels */}
            <text x={width - padding + 4} y={height - padding + 3} fill="#6b7280" fontSize="9">
              N
            </text>
            <text x={padding - 18} y={padding - 6} fill="#6b7280" fontSize="9">
              Ops
            </text>

            {/* Curves */}
            <path d={pathO1} fill="none" stroke="#4b5563" strokeWidth="1" strokeDasharray="2,2" />
            <path d={pathOLogN} fill="none" stroke="#059669" strokeWidth="1.2" strokeDasharray="3,3" />
            <path d={pathON} fill="none" stroke="#2563eb" strokeWidth="1.2" />
            <path d={pathONLogN} fill="none" stroke="#d97706" strokeWidth="1.5" />
            <path d={pathON2} fill="none" stroke="#dc2626" strokeWidth="1" strokeDasharray="3,3" />

            {/* Current Observed Point */}
            <circle
              cx={observedX}
              cy={observedY}
              r="5"
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-[10px] text-stone-500 justify-center">
          <span className="text-emerald-500">-- O(log n)</span>
          <span className="text-blue-500">― O(n)</span>
          <span className="text-amber-500 font-semibold">― O(n log n)</span>
          <span className="text-red-500">-- O(n²)</span>
        </div>
      </div>
    </div>
  );
};
