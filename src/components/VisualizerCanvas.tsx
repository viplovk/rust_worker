import React, { useState } from 'react';
import {
  BarChart3,
  Layers,
  ArrowRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
} from 'lucide-react';
import { TraceEvent, AlgorithmDefinition } from '../types';

interface VisualizerCanvasProps {
  algorithm: AlgorithmDefinition;
  currentEvent?: TraceEvent;
  totalSteps: number;
}

export const VisualizerCanvas: React.FC<VisualizerCanvasProps> = ({
  algorithm,
  currentEvent,
  totalSteps,
}) => {
  const [arrayViewMode, setArrayViewMode] = useState<'bars' | 'blocks'>('bars');

  // If no trace event yet, show placeholder or initial state
  const snapshot = currentEvent?.snapshot ?? algorithm.defaultInput;
  const aux = currentEvent?.auxiliary || {};

  // Render specific canvas based on algorithm inputFormat or category
  const renderContent = () => {
    if (algorithm.inputFormat === 'graph') {
      return renderGraphCanvas(snapshot, currentEvent, aux);
    }
    if (algorithm.inputFormat === 'dp_knapsack') {
      return renderDpCanvas(snapshot, currentEvent, aux);
    }
    if (algorithm.category === 'stack_queue') {
      return renderStackQueueCanvas(snapshot, currentEvent, aux, algorithm.id);
    }
    // Default to array visualization
    return renderArrayCanvas(snapshot, currentEvent, aux, arrayViewMode);
  };

  return (
    <div
      id="visualizer-canvas-container"
      className="relative flex-1 bg-[#0b0c0e] rounded-xl border border-[#1f222b] flex flex-col overflow-hidden min-h-[360px]"
    >
      {/* Canvas Header Controls */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#101216] border-b border-[#1f222b] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-stone-200">{algorithm.name}</span>
          <span className="text-stone-500">·</span>
          <span className="text-amber-400 capitalize">{currentEvent?.op || 'Initial State'}</span>
        </div>

        <div className="flex items-center gap-2">
          {algorithm.inputFormat !== 'graph' && algorithm.inputFormat !== 'dp_knapsack' && (
            <div className="inline-flex rounded-md bg-[#16181f] p-0.5 border border-[#252936]">
              <button
                type="button"
                onClick={() => setArrayViewMode('bars')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  arrayViewMode === 'bars'
                    ? 'bg-[#222633] text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 inline mr-1" />
                Bars
              </button>
              <button
                type="button"
                onClick={() => setArrayViewMode('blocks')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition ${
                  arrayViewMode === 'blocks'
                    ? 'bg-[#222633] text-amber-300'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 inline mr-1" />
                Blocks
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-auto">
        {renderContent()}
      </div>

      {/* Legend & Aux Indicators */}
      <div className="px-4 py-2 bg-[#0e1014] border-t border-[#1a1d24] flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-stone-400">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
            <span>Pivot / Target</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400" />
            <span>Active / Compare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-orange-400" />
            <span>Swap / Write</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
            <span>Sorted / Optimal</span>
          </div>
        </div>

        <div>
          {currentEvent?.auxiliary?.i !== undefined && (
            <span className="mr-3 text-amber-300">i = {currentEvent.auxiliary.i}</span>
          )}
          {currentEvent?.auxiliary?.j !== undefined && (
            <span className="mr-3 text-cyan-300">j = {currentEvent.auxiliary.j}</span>
          )}
          {currentEvent?.auxiliary?.mid !== undefined && (
            <span className="mr-3 text-purple-300">mid = {currentEvent.auxiliary.mid}</span>
          )}
          {currentEvent?.auxiliary?.pivot !== undefined && (
            <span className="text-amber-400 font-semibold">
              pivot = [{currentEvent.auxiliary.pivot}]
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// ARRAY VISUALIZER
// ==========================================
function renderArrayCanvas(
  rawSnapshot: any,
  currentEvent?: TraceEvent,
  aux?: any,
  viewMode: 'bars' | 'blocks' = 'bars'
) {
  const arr: number[] = Array.isArray(rawSnapshot) ? rawSnapshot : [1, 2, 3, 4, 5];
  const maxVal = Math.max(...arr, 10);
  const minVal = Math.min(...arr, 0);
  const range = maxVal - minVal || 1;

  const indices = currentEvent?.indices || [];
  const op = currentEvent?.op;
  const isDone = op === 'done';

  return (
    <div className="w-full max-w-4xl flex flex-col items-center justify-center">
      {viewMode === 'bars' ? (
        <div className="w-full h-72 flex items-end justify-center gap-1.5 sm:gap-2 px-2 pb-2">
          {arr.map((val, idx) => {
            const isPivot = aux?.pivot === idx;
            const isCompared = (op === 'compare' && indices.includes(idx)) || aux?.mid === idx;
            const isSwapped = (op === 'swap' || op === 'write' || op === 'shift') && indices.includes(idx);
            const isBoundary = aux?.low === idx || aux?.high === idx;
            const isPartitionI = aux?.i === idx;
            const isPartitionJ = aux?.j === idx;

            // Height normalization
            const normalizedHeight = Math.max(12, Math.round(((val - minVal) / range) * 100));

            let barColor = 'bg-[#272a33] text-stone-400 border-[#323642]';
            if (isDone) {
              barColor = 'bg-emerald-600/90 text-emerald-100 border-emerald-400';
            } else if (isPivot) {
              barColor = 'bg-amber-500 text-stone-950 font-bold border-amber-300 shadow-lg shadow-amber-500/25';
            } else if (isSwapped) {
              barColor = 'bg-orange-500 text-stone-950 font-bold border-orange-300 shadow-md shadow-orange-500/25';
            } else if (isCompared) {
              barColor = 'bg-cyan-400 text-stone-950 font-bold border-cyan-200 shadow-md shadow-cyan-400/25';
            }

            return (
              <div
                key={idx}
                className="flex-1 flex flex-col items-center justify-end h-full min-w-[24px] max-w-[56px] transition-all duration-200"
              >
                {/* Pointer tags above */}
                <div className="h-6 flex items-center justify-center text-[10px] font-mono font-semibold">
                  {isPivot && <span className="text-amber-400">pivot</span>}
                  {isPartitionI && !isPivot && <span className="text-amber-300">i</span>}
                  {isPartitionJ && !isPivot && <span className="text-cyan-300">j</span>}
                  {aux?.mid === idx && <span className="text-purple-300">mid</span>}
                </div>

                {/* Value displayed atop bar */}
                <span className="text-xs font-mono font-medium mb-1 text-stone-300 select-none">
                  {val}
                </span>

                {/* The Bar */}
                <div
                  style={{ height: `${normalizedHeight}%` }}
                  className={`w-full rounded-t-md border-t-2 border-x transition-all duration-200 flex items-center justify-center ${barColor}`}
                />

                {/* Index tag below */}
                <div className="mt-2 text-[10px] font-mono text-stone-500 select-none">
                  [{idx}]
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Blocks View */
        <div className="flex flex-wrap gap-2.5 justify-center items-center p-4 max-w-3xl">
          {arr.map((val, idx) => {
            const isPivot = aux?.pivot === idx;
            const isCompared = op === 'compare' && indices.includes(idx);
            const isSwapped = (op === 'swap' || op === 'write') && indices.includes(idx);
            const isFound = aux?.found && indices.includes(idx);

            let blockStyle = 'bg-[#15171e] border-[#292d3a] text-stone-200';
            if (isFound || isDone) {
              blockStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200';
            } else if (isPivot) {
              blockStyle = 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold';
            } else if (isSwapped) {
              blockStyle = 'bg-orange-500/20 border-orange-400 text-orange-200 font-bold';
            } else if (isCompared) {
              blockStyle = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold';
            }

            return (
              <div
                key={idx}
                className={`flex flex-col items-center justify-center w-14 h-16 rounded-lg border text-center transition-all ${blockStyle}`}
              >
                <span className="text-sm font-mono font-semibold">{val}</span>
                <span className="text-[10px] font-mono text-stone-500">[{idx}]</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// GRAPH CANVAS (Dijkstra, BFS, DFS)
// ==========================================
function renderGraphCanvas(snapshot: any, currentEvent?: TraceEvent, aux?: any) {
  const nodes = snapshot?.nodes || [];
  const edges = snapshot?.edges || [];
  const distances = aux?.distances || {};
  const activeNode = aux?.activeNode;
  const activeEdge = aux?.activeEdge;
  const visited: string[] = aux?.visited || [];
  const shortestPath: string[] = aux?.shortestPath || [];

  return (
    <div className="w-full h-80 relative flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 560 300">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((e: any, idx: number) => {
          const u = nodes.find((n: any) => n.id === e.from);
          const v = nodes.find((n: any) => n.id === e.to);
          if (!u || !v) return null;

          const isActiveEdge =
            (activeEdge?.from === e.from && activeEdge?.to === e.to) ||
            (activeEdge?.from === e.to && activeEdge?.to === e.from);

          // Check if part of shortest path
          let isShortestPathEdge = false;
          for (let i = 0; i < shortestPath.length - 1; i++) {
            if (
              (shortestPath[i] === e.from && shortestPath[i + 1] === e.to) ||
              (shortestPath[i] === e.to && shortestPath[i + 1] === e.from)
            ) {
              isShortestPathEdge = true;
              break;
            }
          }

          const midX = (u.x + v.x) / 2;
          const midY = (u.y + v.y) / 2;

          let strokeColor = '#2b2f3d';
          let strokeWidth = 2;
          if (isShortestPathEdge) {
            strokeColor = '#f59e0b';
            strokeWidth = 4;
          } else if (isActiveEdge) {
            strokeColor = '#22d3ee';
            strokeWidth = 3;
          }

          return (
            <g key={idx}>
              <line
                x1={u.x}
                y1={u.y}
                x2={v.x}
                y2={v.y}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                className="transition-all duration-300"
              />
              {/* Edge weight badge */}
              <circle cx={midX} cy={midY} r="10" fill="#12141a" stroke="#2b2f3d" />
              <text
                x={midX}
                y={midY + 3.5}
                textAnchor="middle"
                fill="#9ca3af"
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {e.weight}
              </text>
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((n: any) => {
          const isCurrent = activeNode === n.id;
          const isVisited = visited.includes(n.id);
          const isTarget = n.id === nodes[nodes.length - 1]?.id;
          const dist = distances[n.id];
          const distStr = dist === Infinity || dist === undefined ? '∞' : dist;

          let fill = '#161821';
          let stroke = '#363b4d';
          if (isCurrent) {
            fill = '#0e3b43';
            stroke = '#22d3ee';
          } else if (isVisited) {
            fill = '#093325';
            stroke = '#10b981';
          }

          return (
            <g key={n.id} className="cursor-pointer transition-all duration-300">
              <circle
                cx={n.x}
                cy={n.y}
                r="22"
                fill={fill}
                stroke={stroke}
                strokeWidth="2.5"
                filter={isCurrent ? 'url(#glow)' : undefined}
              />
              <text
                x={n.x}
                y={n.y - 2}
                textAnchor="middle"
                fill="#ededed"
                fontSize="12"
                fontWeight="bold"
                fontFamily="JetBrains Mono, monospace"
              >
                {n.id}
              </text>
              {/* Distance badge below node */}
              <rect
                x={n.x - 16}
                y={n.y + 26}
                width="32"
                height="16"
                rx="4"
                fill="#0b0d12"
                stroke={stroke}
                strokeWidth="1"
              />
              <text
                x={n.x}
                y={n.y + 38}
                textAnchor="middle"
                fill={isVisited ? '#34d399' : '#9ca3af'}
                fontSize="10"
                fontFamily="JetBrains Mono, monospace"
              >
                {distStr}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ==========================================
// STACK & QUEUE CANVAS
// ==========================================
function renderStackQueueCanvas(
  snapshot: any,
  currentEvent?: TraceEvent,
  aux?: any,
  algoId: string = 'stack_lifo'
) {
  const items: number[] = Array.isArray(snapshot) ? snapshot : [];
  const isStack = algoId === 'stack_lifo';

  return (
    <div className="w-full flex flex-col items-center justify-center p-4">
      {isStack ? (
        /* Vertical Stack Container */
        <div className="w-56 flex flex-col items-center">
          <div className="text-xs font-mono text-amber-400 mb-2 flex items-center gap-1.5">
            <span>TOP OF STACK (LIFO)</span>
          </div>
          <div className="w-full min-h-[220px] max-h-[260px] border-b-4 border-x-4 border-amber-500/40 rounded-b-xl bg-[#12141a] p-3 flex flex-col-reverse gap-2 overflow-y-auto">
            {items.length === 0 ? (
              <div className="text-center text-xs font-mono text-stone-500 my-auto">
                Stack is Empty
              </div>
            ) : (
              items.map((val, idx) => {
                const isTop = idx === items.length - 1;
                return (
                  <div
                    key={idx}
                    className={`w-full py-2.5 rounded-md border text-center font-mono text-sm font-semibold transition ${
                      isTop
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                        : 'bg-[#1a1d26] border-[#292d3b] text-stone-300'
                    }`}
                  >
                    {val} {isTop && <span className="text-xs text-amber-400 ml-1">← TOP</span>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        /* Horizontal Queue Pipeline */
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between text-xs font-mono text-stone-400 mb-2">
            <span className="text-emerald-400">FRONT (Dequeue) &larr;</span>
            <span className="text-cyan-400">&larr; REAR (Enqueue)</span>
          </div>
          <div className="w-full h-20 border-y-2 border-stone-700 bg-[#12141a] rounded-lg flex items-center gap-2 p-3 overflow-x-auto">
            {items.length === 0 ? (
              <div className="text-center text-xs font-mono text-stone-500 w-full">
                Queue is Empty
              </div>
            ) : (
              items.map((val, idx) => {
                const isFront = idx === 0;
                const isRear = idx === items.length - 1;
                return (
                  <div
                    key={idx}
                    className={`h-12 min-w-[50px] px-3 rounded-md border flex items-center justify-center font-mono font-semibold text-sm ${
                      isFront
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-200'
                        : isRear
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-200'
                        : 'bg-[#191c25] border-[#272b38] text-stone-200'
                    }`}
                  >
                    {val}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// DYNAMIC PROGRAMMING CANVAS (Knapsack)
// ==========================================
function renderDpCanvas(snapshot: any, currentEvent?: TraceEvent, aux?: any) {
  const grid: number[][] = aux?.dpGrid || (Array.isArray(snapshot) ? snapshot : []);
  const activeCell = aux?.activeCell || [-1, -1];

  if (!grid || grid.length === 0) {
    return <div className="text-xs font-mono text-stone-500">Initializing DP table...</div>;
  }

  return (
    <div className="w-full max-w-3xl overflow-auto p-2">
      <table className="w-full border-collapse font-mono text-xs text-stone-300">
        <thead>
          <tr>
            <th className="p-2 border border-[#252834] bg-[#14161d] text-stone-500 text-left">
              Item \ Cap
            </th>
            {grid[0].map((_, cap) => (
              <th
                key={cap}
                className="p-2 border border-[#252834] bg-[#14161d] text-stone-400 text-center"
              >
                w={cap}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((row, i) => (
            <tr key={i}>
              <td className="p-2 border border-[#252834] bg-[#12141a] font-semibold text-stone-400">
                {i === 0 ? '0 (Empty)' : `Item ${i}`}
              </td>
              {row.map((cell, w) => {
                const isActive = activeCell[0] === i && activeCell[1] === w;
                return (
                  <td
                    key={w}
                    className={`p-2 border border-[#252834] text-center transition-colors ${
                      isActive
                        ? 'bg-amber-500/30 text-amber-200 font-bold border-amber-400'
                        : 'bg-[#0f1116] text-stone-300'
                    }`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
