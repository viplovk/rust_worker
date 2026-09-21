import React, { useState } from 'react';
import {
  Activity,
  Play,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { wasmBridge } from '../wasm/bridge';
import { AuditPoint } from '../types';
import { ALGORITHM_REGISTRY } from '../algorithms/registry';

export const ComplexityAuditMode: React.FC = () => {
  const [selectedAlgoId, setSelectedAlgoId] = useState('quick_sort');
  const [isRunning, setIsRunning] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditPoint[] | null>(null);

  const selectedAlgo = ALGORITHM_REGISTRY.find((a) => a.id === selectedAlgoId) || ALGORITHM_REGISTRY[0];

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const sizes = [10, 25, 50, 100, 250, 500];
      const results = await wasmBridge.runComplexityAudit(selectedAlgoId, sizes);
      setAuditResults(results);
    } catch (err) {
      console.error('Audit execution error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  // Empirical growth ratio estimation
  const estimateGrowth = (pts: AuditPoint[]) => {
    if (pts.length < 3) return 'Insufficient data';
    const first = pts[0];
    const last = pts[pts.length - 1];

    const sizeRatio = last.size / first.size; // e.g. 50
    const opRatio = (last.comparisons + last.swaps) / Math.max(1, first.comparisons + first.swaps);

    if (opRatio < sizeRatio * 0.3) {
      return 'Observed growth is roughly O(log n) or Sublinear';
    } else if (opRatio <= sizeRatio * 1.6) {
      return 'Observed growth is roughly O(n) Linear';
    } else if (opRatio <= sizeRatio * Math.log2(sizeRatio) * 1.5) {
      return 'Observed growth matches approximately O(n log n) - Empirical estimate';
    } else {
      return 'Observed growth matches approximately O(n²) Quadratic';
    }
  };

  // SVG dimensions
  const svgWidth = 540;
  const svgHeight = 220;
  const padding = 35;

  const maxSteps = auditResults
    ? Math.max(...auditResults.map((r) => r.comparisons + r.swaps), 100)
    : 1000;
  const maxSize = 500;

  const getX = (size: number) => padding + (size / maxSize) * (svgWidth - 2 * padding);
  const getY = (val: number) => svgHeight - padding - (val / maxSteps) * (svgHeight - 2 * padding);

  return (
    <div id="complexity-audit-mode-container" className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-xs">
      {/* Title banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f222b]">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-sans text-stone-100">Empirical Complexity Auditor</h2>
          </div>
          <p className="text-stone-400 mt-1 font-sans">
            Benchmark real algorithm operations across varying input sizes (N = 10..500) and plot empirical curves.
          </p>
        </div>

        {/* Algorithm Selector & Run Button */}
        <div className="flex items-center gap-2">
          <select
            id="audit-algo-select"
            value={selectedAlgoId}
            onChange={(e) => {
              setSelectedAlgoId(e.target.value);
              setAuditResults(null);
            }}
            className="px-3 py-2 rounded-lg bg-[#14161e] border border-[#252a38] text-stone-200 text-xs font-mono focus:outline-none"
          >
            {ALGORITHM_REGISTRY.map((algo) => (
              <option key={algo.id} value={algo.id}>
                {algo.name} ({algo.averageCase})
              </option>
            ))}
          </select>

          <button
            id="run-audit-btn"
            type="button"
            onClick={handleRunAudit}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold transition shadow-md shadow-amber-900/20"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Run Audit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Algorithm theoretical baseline */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">Theoretical Best</span>
          <span className="block text-base font-bold text-emerald-400 mt-0.5">{selectedAlgo.bestCase}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">Theoretical Average</span>
          <span className="block text-base font-bold text-amber-400 mt-0.5">{selectedAlgo.averageCase}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">Theoretical Worst</span>
          <span className="block text-base font-bold text-red-400 mt-0.5">{selectedAlgo.worstCase}</span>
        </div>
        <div className="p-3 rounded-lg bg-[#101217] border border-[#1f222b]">
          <span className="text-[10px] text-stone-500">Space Complexity</span>
          <span className="block text-base font-bold text-cyan-400 mt-0.5">{selectedAlgo.spaceComplexity}</span>
        </div>
      </div>

      {/* Results Section */}
      {auditResults ? (
        <div className="space-y-6">
          {/* Empirical Verdict */}
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-300 font-sans text-sm">
                {estimateGrowth(auditResults)}
              </div>
              <p className="text-stone-400 font-sans text-xs mt-1">
                Based on measured operations scaling from N=10 to N=500. Real comparison and memory write operations were
                tallied directly from execution events.
              </p>
            </div>
          </div>

          {/* Graph & Table Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SVG Empirical Growth Chart */}
            <div className="p-4 rounded-xl bg-[#101217] border border-[#1f222b] space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-200">Observed Growth Curve (Comparisons + Swaps)</span>
                <span className="text-[10px] text-stone-500">Y: Operations, X: Input Size N</span>
              </div>

              <div className="w-full bg-[#0a0c0f] rounded-lg border border-[#1a1d26] p-2 flex items-center justify-center">
                <svg className="w-full h-56" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                  {/* Grid Lines */}
                  {[0.25, 0.5, 0.75, 1].map((pct, idx) => (
                    <line
                      key={idx}
                      x1={padding}
                      y1={getY(maxSteps * pct)}
                      x2={svgWidth - padding}
                      y2={getY(maxSteps * pct)}
                      stroke="#1a1d26"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Axes */}
                  <line
                    x1={padding}
                    y1={svgHeight - padding}
                    x2={svgWidth - padding}
                    y2={svgHeight - padding}
                    stroke="#2e3342"
                    strokeWidth="1.5"
                  />
                  <line
                    x1={padding}
                    y1={padding}
                    x2={padding}
                    y2={svgHeight - padding}
                    stroke="#2e3342"
                    strokeWidth="1.5"
                  />

                  {/* Connecting Line of empirical points */}
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2.5"
                    points={auditResults
                      .map((r) => `${getX(r.size)},${getY(r.comparisons + r.swaps)}`)
                      .join(' ')}
                  />

                  {/* Data Points */}
                  {auditResults.map((r, idx) => (
                    <g key={idx}>
                      <circle
                        cx={getX(r.size)}
                        cy={getY(r.comparisons + r.swaps)}
                        r="5"
                        fill="#f59e0b"
                        stroke="#0a0c0f"
                        strokeWidth="2"
                      />
                      <text
                        x={getX(r.size)}
                        y={getY(r.comparisons + r.swaps) - 10}
                        textAnchor="middle"
                        fill="#d1d5db"
                        fontSize="9"
                      >
                        {r.comparisons + r.swaps}
                      </text>
                      <text
                        x={getX(r.size)}
                        y={svgHeight - padding + 15}
                        textAnchor="middle"
                        fill="#6b7280"
                        fontSize="9"
                      >
                        {r.size}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* Empirical Data Table */}
            <div className="p-4 rounded-xl bg-[#101217] border border-[#1f222b] space-y-3 overflow-hidden">
              <span className="font-bold text-stone-200 block">Empirical Metrics Table</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-stone-300">
                  <thead>
                    <tr className="border-b border-[#242835] text-stone-500 text-[11px]">
                      <th className="py-2 px-3">N</th>
                      <th className="py-2 px-3">Comparisons</th>
                      <th className="py-2 px-3">Swaps/Writes</th>
                      <th className="py-2 px-3">Total Steps</th>
                      <th className="py-2 px-3">Time (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditResults.map((row) => (
                      <tr key={row.size} className="border-b border-[#1a1d26] hover:bg-[#141720]">
                        <td className="py-2.5 px-3 font-bold text-amber-400">{row.size}</td>
                        <td className="py-2.5 px-3 text-cyan-300">{row.comparisons}</td>
                        <td className="py-2.5 px-3 text-orange-300">{row.swaps + row.writes}</td>
                        <td className="py-2.5 px-3">{row.steps}</td>
                        <td className="py-2.5 px-3 text-emerald-400">{row.timeMs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-xl border border-dashed border-[#242836] bg-[#0c0e12] space-y-3">
          <Activity className="w-8 h-8 text-stone-600 mx-auto" />
          <div className="text-stone-300 font-sans text-sm font-semibold">
            Ready to audit {selectedAlgo.name}
          </div>
          <p className="text-stone-500 max-w-md mx-auto font-sans text-xs">
            Click "Run Audit" to benchmark real operations across 6 input sizes and plot the empirical computational curve.
          </p>
        </div>
      )}
    </div>
  );
};
