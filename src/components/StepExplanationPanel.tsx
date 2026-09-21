import React from 'react';
import { Sparkles, HelpCircle, Code, ArrowRight, Zap } from 'lucide-react';
import { TraceEvent } from '../types';

interface StepExplanationPanelProps {
  currentEvent?: TraceEvent;
  whyMode: boolean;
}

export const StepExplanationPanel: React.FC<StepExplanationPanelProps> = ({
  currentEvent,
  whyMode,
}) => {
  if (!currentEvent) {
    return (
      <div className="bg-[#101216] border border-[#1f222b] rounded-xl p-4 font-mono text-xs text-stone-500">
        Execution idle. Press Play or Step Forward to begin algorithm execution.
      </div>
    );
  }

  const opColors: Record<TraceEvent['op'], string> = {
    compare: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    swap: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
    pivot: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    write: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    visit: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
    call: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    return: 'bg-stone-500/15 text-stone-300 border-stone-500/30',
    shift: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    insert: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    delete: 'bg-red-500/15 text-red-300 border-red-500/30',
    push: 'bg-pink-500/15 text-pink-300 border-pink-500/30',
    pop: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    enqueue: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    dequeue: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    allocate: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
    partition: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    done: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  const badgeColor = opColors[currentEvent.op] || 'bg-stone-700 text-stone-200';

  return (
    <div
      id="step-explanation-panel"
      className="bg-[#101216] border border-[#1f222b] rounded-xl p-4 space-y-3 font-mono text-xs"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#1f222b]">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
            {currentEvent.op}
          </span>
          <span className="text-stone-400">Step {currentEvent.step}</span>
        </div>

        <div className="flex items-center gap-2 text-stone-500 text-[11px]">
          <Code className="w-3.5 h-3.5 text-stone-400" />
          <span>Line {currentEvent.sourceLine}</span>
          <span className="text-stone-600">·</span>
          <span className="text-amber-400/90 font-semibold">Cost: {currentEvent.cost} op</span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm font-sans text-stone-200 leading-relaxed font-normal">
        {currentEvent.description}
      </p>

      {/* WHY Mode Card */}
      {whyMode && currentEvent.why && (
        <div className="mt-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-stone-300 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>WHY THIS OPERATION OCCURS:</span>
          </div>
          <p className="text-xs font-sans text-stone-300 leading-relaxed font-normal">
            {currentEvent.why}
          </p>
        </div>
      )}
    </div>
  );
};
