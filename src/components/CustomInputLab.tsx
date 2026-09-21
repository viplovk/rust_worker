import React, { useState } from 'react';
import { Sliders, RefreshCw, AlertCircle, Check } from 'lucide-react';

interface CustomInputLabProps {
  currentInput: number[];
  onApplyInput: (newArr: number[]) => void;
}

export const CustomInputLab: React.FC<CustomInputLabProps> = ({
  currentInput,
  onApplyInput,
}) => {
  const [inputText, setInputText] = useState(currentInput.join(', '));
  const [size, setSize] = useState(currentInput.length);
  const [error, setError] = useState<string | null>(null);

  const generatePreset = (type: 'random' | 'sorted' | 'reversed' | 'nearly_sorted' | 'duplicates') => {
    setError(null);
    let arr: number[] = [];
    const n = Math.max(4, Math.min(size, 24));

    if (type === 'random') {
      arr = Array.from({ length: n }, () => Math.floor(Math.random() * 95) + 5);
    } else if (type === 'sorted') {
      arr = Array.from({ length: n }, (_, i) => Math.round((i + 1) * (90 / n)));
    } else if (type === 'reversed') {
      arr = Array.from({ length: n }, (_, i) => Math.round((n - i) * (90 / n)));
    } else if (type === 'nearly_sorted') {
      arr = Array.from({ length: n }, (_, i) => Math.round((i + 1) * (90 / n)));
      if (arr.length > 3) {
        const temp = arr[1];
        arr[1] = arr[arr.length - 2];
        arr[arr.length - 2] = temp;
      }
    } else if (type === 'duplicates') {
      const smallSet = [10, 25, 42, 68];
      arr = Array.from({ length: n }, () => smallSet[Math.floor(Math.random() * smallSet.length)]);
    }

    setInputText(arr.join(', '));
    onApplyInput(arr);
  };

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const parts = inputText
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (parts.length === 0) {
      setError('Array cannot be empty.');
      return;
    }

    const numbers: number[] = [];
    for (const part of parts) {
      const num = Number(part);
      if (isNaN(num)) {
        setError(`"${part}" is not a valid number.`);
        return;
      }
      numbers.push(num);
    }

    if (numbers.length > 32) {
      setError('For visual clarity, maximum array size is 32 elements.');
      return;
    }

    onApplyInput(numbers);
  };

  return (
    <div
      id="custom-input-lab-panel"
      className="bg-[#101216] border border-[#1f222b] rounded-xl p-4 space-y-3 font-mono text-xs"
    >
      <div className="flex items-center justify-between pb-2 border-b border-[#1f222b]">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-stone-100 uppercase tracking-wider text-[11px]">
            Input Generator &amp; Presets
          </span>
        </div>
        <span className="text-[10px] text-stone-500">Custom Dataset</span>
      </div>

      {/* Preset Generator Buttons */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => generatePreset('random')}
          className="px-2.5 py-1 rounded bg-[#161820] hover:bg-[#1f222b] border border-[#252936] text-stone-300 hover:text-amber-300 transition text-[11px]"
        >
          🎲 Random
        </button>
        <button
          type="button"
          onClick={() => generatePreset('sorted')}
          className="px-2.5 py-1 rounded bg-[#161820] hover:bg-[#1f222b] border border-[#252936] text-stone-300 hover:text-amber-300 transition text-[11px]"
        >
          📈 Sorted
        </button>
        <button
          type="button"
          onClick={() => generatePreset('reversed')}
          className="px-2.5 py-1 rounded bg-[#161820] hover:bg-[#1f222b] border border-[#252936] text-stone-300 hover:text-amber-300 transition text-[11px]"
        >
          📉 Reversed
        </button>
        <button
          type="button"
          onClick={() => generatePreset('nearly_sorted')}
          className="px-2.5 py-1 rounded bg-[#161820] hover:bg-[#1f222b] border border-[#252936] text-stone-300 hover:text-amber-300 transition text-[11px]"
        >
          ⚡ Nearly Sorted
        </button>
        <button
          type="button"
          onClick={() => generatePreset('duplicates')}
          className="px-2.5 py-1 rounded bg-[#161820] hover:bg-[#1f222b] border border-[#252936] text-stone-300 hover:text-amber-300 transition text-[11px]"
        >
          🔄 Duplicates
        </button>
      </div>

      {/* Size Slider */}
      <div className="flex items-center gap-3 pt-1">
        <span className="text-stone-400 text-[11px]">Size: {size}</span>
        <input
          type="range"
          min={4}
          max={24}
          value={size}
          onChange={(e) => {
            const newSize = Number(e.target.value);
            setSize(newSize);
          }}
          className="flex-1 h-1.5 bg-[#202430] rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Text input form */}
      <form onSubmit={handleApply} className="space-y-2">
        <div className="flex gap-2">
          <input
            id="custom-input-array-text"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g. 42, 17, 8, 91, 23"
            className="flex-1 px-3 py-1.5 rounded-md bg-[#14161d] border border-[#252936] text-stone-200 placeholder-stone-500 text-xs font-mono focus:outline-none focus:border-amber-500/50"
          />
          <button
            id="custom-input-apply-btn"
            type="submit"
            className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold transition text-xs"
          >
            Apply
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-red-400 text-[11px]">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </div>
  );
};
