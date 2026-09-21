import React, { useState, useEffect } from 'react';
import { GitCompare, Play, RotateCcw, Check, Sparkles } from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../algorithms/registry';
import { wasmBridge } from '../wasm/bridge';
import { ExecutionTrace } from '../types';

export const ComparisonMode: React.FC = () => {
  const sortingAlgos = ALGORITHM_REGISTRY.filter((a) => a.category === 'sorting');

  const [selectedAlgo1, setSelectedAlgo1] = useState('quick_sort');
  const [selectedAlgo2, setSelectedAlgo2] = useState('merge_sort');
  const [selectedAlgo3, setSelectedAlgo3] = useState('heap_sort');

  const [inputSize, setInputSize] = useState(16);
  const [inputData, setInputData] = useState<number[]>([]);

  const [trace1, setTrace1] = useState<ExecutionTrace | null>(null);
  const [trace2, setTrace2] = useState<ExecutionTrace | null>(null);
  const [trace3, setTrace3] = useState<ExecutionTrace | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Generate random data
  const generateNewData = (size = inputSize) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10);
    setInputData(arr);
    setTrace1(null);
    setTrace2(null);
    setTrace3(null);
  };

  useEffect(() => {
    generateNewData(16);
  }, []);

  const handleRunComparison = async () => {
    if (inputData.length === 0) return;
    setIsRunning(true);

    try {
      const [t1, t2, t3] = await Promise.all([
        wasmBridge.execute(selectedAlgo1, [...inputData]),
        wasmBridge.execute(selectedAlgo2, [...inputData]),
        wasmBridge.execute(selectedAlgo3, [...inputData]),
      ]);

      setTrace1(t1);
      setTrace2(t2);
      setTrace3(t3);
    } catch (e) {
      console.error('Comparison run failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  const getAlgo = (id: string) => ALGORITHM_REGISTRY.find((a) => a.id === id) || ALGORITHM_REGISTRY[0];

  return (
    <div id="comparison-mode-container" className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6 font-mono text-xs">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1f222b]">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-sans text-stone-100">Algorithm Comparison Lab</h2>
          </div>
          <p className="text-stone-400 mt-1 font-sans">
            Benchmark 2 or 3 algorithms on the exact same dataset to observe difference in comparisons, swaps, and memory overhead.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => generateNewData()}
            className="px-3 py-2 rounded-lg bg-[#161821] hover:bg-[#1f222d] border border-[#272b38] text-stone-300 transition text-xs"
          >
            🎲 New Random Array
          </button>

          <button
            id="run-comparison-btn"
            type="button"
            onClick={handleRunComparison}
            disabled={isRunning}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold font-sans transition shadow-md shadow-amber-900/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Comparison</span>
          </button>
        </div>
      </div>

      {/* Input Preview Bar */}
      <div className="p-3 rounded-lg bg-[#0e1015] border border-[#1b1e27] flex items-center gap-3 overflow-x-auto">
        <span className="text-stone-500 shrink-0">Input (N={inputData.length}):</span>
        <div className="flex gap-1.5 overflow-x-auto">
          {inputData.map((v, i) => (
            <span key={i} className="px-1.5 py-0.5 rounded bg-[#161820] text-stone-300 text-[11px]">
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* 3 Side-by-Side Algorithm Slots */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: selectedAlgo1, setter: setSelectedAlgo1, trace: trace1, label: 'Slot 1' },
          { id: selectedAlgo2, setter: setSelectedAlgo2, trace: trace2, label: 'Slot 2' },
          { id: selectedAlgo3, setter: setSelectedAlgo3, trace: trace3, label: 'Slot 3' },
        ].map((slot, idx) => {
          const algo = getAlgo(slot.id);
          const stats = slot.trace?.stats;

          return (
            <div
              key={idx}
              className="bg-[#101217] border border-[#1f222b] rounded-xl p-4 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#1f222b]">
                  <span className="text-[10px] text-stone-500 uppercase">{slot.label}</span>
                  <span className="text-amber-400 text-[10px] font-bold">{algo.averageCase}</span>
                </div>

                {/* Algo Picker */}
                <select
                  value={slot.id}
                  onChange={(e) => {
                    slot.setter(e.target.value);
                  }}
                  className="w-full mt-2 px-2.5 py-1.5 rounded-md bg-[#14161e] border border-[#262a37] text-stone-200 text-xs font-mono focus:outline-none"
                >
                  {sortingAlgos.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>

                <div className="mt-2 text-stone-400 text-[11px] font-sans line-clamp-2">
                  {algo.overview}
                </div>
              </div>

              {/* Metrics Box */}
              <div className="p-3 rounded-lg bg-[#0c0d12] border border-[#1b1e27] space-y-2 mt-3">
                <span className="text-[10px] text-stone-500 uppercase block">Execution Results</span>
                {stats ? (
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Comparisons:</span>
                      <span className="font-bold text-cyan-300">{stats.comparisons}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Swaps / Writes:</span>
                      <span className="font-bold text-orange-300">{stats.swaps + stats.writes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Total Steps:</span>
                      <span className="font-bold text-stone-200">{stats.totalSteps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Aux Allocations:</span>
                      <span className="font-bold text-purple-300">{stats.allocations}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-[#1a1d26]">
                      <span className="text-stone-400">Measured Time:</span>
                      <span className="font-bold text-emerald-400">{stats.measuredTimeMs} ms</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-stone-600 text-[11px] py-4">
                    Press "Run Comparison"
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#1a1d26] text-[10px] text-stone-500 flex justify-between">
                <span>In-place: {algo.inPlace ? 'Yes' : 'No'}</span>
                <span>Stable: {algo.stable ? 'Yes' : 'No'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
