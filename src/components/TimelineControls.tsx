import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  FastForward,
  Rewind,
  Volume2,
} from 'lucide-react';

interface TimelineControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onStepChange: (step: number) => void;
  onTogglePlay: () => void;
  onSpeedChange: (speed: number) => void;
  onReset: () => void;
  onSkipToEnd: () => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({
  currentStep,
  totalSteps,
  isPlaying,
  playbackSpeed,
  onStepChange,
  onTogglePlay,
  onSpeedChange,
  onReset,
  onSkipToEnd,
}) => {
  const speeds = [0.25, 0.5, 1, 2, 4];

  return (
    <div
      id="timeline-controls-bar"
      className="w-full bg-[#101217] border border-[#1f222b] rounded-xl p-3 sm:p-4 flex flex-col gap-3 font-mono text-xs"
    >
      {/* Top scrubber bar & step counters */}
      <div className="flex items-center gap-3">
        <span className="text-stone-400 shrink-0 font-medium select-none">
          Step <span className="text-amber-400 font-bold">{currentStep}</span> / {totalSteps || 1}
        </span>

        {/* Range Slider */}
        <input
          id="timeline-scrubber-slider"
          type="range"
          min={1}
          max={Math.max(1, totalSteps)}
          value={currentStep}
          onChange={(e) => onStepChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-[#202430] rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
        />

        <span className="text-[11px] text-stone-500 shrink-0 hidden sm:inline">
          {totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0}%
        </span>
      </div>

      {/* Main Buttons Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Playback Control Group */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Reset to Start */}
          <button
            id="timeline-btn-reset"
            type="button"
            onClick={onReset}
            disabled={currentStep <= 1}
            className="p-2 rounded-lg bg-[#181a22] hover:bg-[#20232d] disabled:opacity-30 disabled:cursor-not-allowed border border-[#272b38] text-stone-300 transition"
            title="Reset to beginning"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Step Backward */}
          <button
            id="timeline-btn-prev"
            type="button"
            onClick={() => onStepChange(Math.max(1, currentStep - 1))}
            disabled={currentStep <= 1}
            className="p-2 rounded-lg bg-[#181a22] hover:bg-[#20232d] disabled:opacity-30 disabled:cursor-not-allowed border border-[#272b38] text-stone-300 transition"
            title="Step backward (←)"
          >
            <Rewind className="w-3.5 h-3.5" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            id="timeline-btn-play-pause"
            type="button"
            onClick={onTogglePlay}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-sans transition shadow-md shadow-amber-900/20 active:scale-95"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span className="text-xs">Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span className="text-xs">Play</span>
              </>
            )}
          </button>

          {/* Step Forward */}
          <button
            id="timeline-btn-next"
            type="button"
            onClick={() => onStepChange(Math.min(totalSteps, currentStep + 1))}
            disabled={currentStep >= totalSteps}
            className="p-2 rounded-lg bg-[#181a22] hover:bg-[#20232d] disabled:opacity-30 disabled:cursor-not-allowed border border-[#272b38] text-stone-300 transition"
            title="Step forward (→)"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>

          {/* Skip to End */}
          <button
            id="timeline-btn-skip-end"
            type="button"
            onClick={onSkipToEnd}
            disabled={currentStep >= totalSteps}
            className="p-2 rounded-lg bg-[#181a22] hover:bg-[#20232d] disabled:opacity-30 disabled:cursor-not-allowed border border-[#272b38] text-stone-300 transition"
            title="Skip to end"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-[#14161d] p-0.5 rounded-lg border border-[#242835]">
          <span className="text-[10px] text-stone-500 px-1.5 hidden sm:inline">Speed:</span>
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSpeedChange(s)}
              className={`px-2 py-1 rounded text-[11px] transition ${
                playbackSpeed === s
                  ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
