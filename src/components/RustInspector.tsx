import React from 'react';
import { Cpu, BookOpen, ShieldCheck, Check } from 'lucide-react';
import { RustConcept } from '../types';

interface RustInspectorProps {
  concepts: RustConcept[];
}

export const RustInspector: React.FC<RustInspectorProps> = ({ concepts }) => {
  return (
    <div
      id="rust-inspector-panel"
      className="bg-[#101216] border border-[#1f222b] rounded-xl p-4 space-y-3 font-mono text-xs"
    >
      <div className="flex items-center gap-2 pb-2 border-b border-[#1f222b]">
        <ShieldCheck className="w-4 h-4 text-amber-400" />
        <span className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">
          Rust Architectural Concepts
        </span>
      </div>

      <div className="space-y-3">
        {concepts.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[#14161d] border border-[#232734] space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{item.concept}</span>
            </div>
            <p className="text-xs font-sans text-stone-400 leading-relaxed font-normal">
              {item.explanation}
            </p>
            {item.codeSnippet && (
              <pre className="p-2 rounded bg-[#0b0d11] text-[11px] font-mono text-stone-300 border border-[#1b1e27] overflow-x-auto">
                {item.codeSnippet}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
