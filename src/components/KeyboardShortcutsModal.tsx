import React from 'react';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause algorithm playback' },
    { key: '→', desc: 'Step forward one execution event' },
    { key: '←', desc: 'Step backward one execution event' },
    { key: 'R', desc: 'Reset execution to beginning' },
    { key: 'E', desc: 'Skip directly to final completed state' },
    { key: 'W', desc: 'Toggle WHY? mode pedagogical explanation' },
    { key: '⌘ + K', desc: 'Open global algorithm search palette' },
    { key: '?', desc: 'Open this keyboard shortcuts dialog' },
    { key: 'Esc', desc: 'Close open dialogs or modals' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        id="keyboard-shortcuts-modal"
        className="w-full max-w-md rounded-xl bg-[#12141a] border border-[#272a38] shadow-2xl overflow-hidden font-mono text-xs"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#202330]">
          <div className="flex items-center gap-2 text-stone-200">
            <Keyboard className="w-4 h-4 text-amber-400" />
            <span className="font-bold">Keyboard Shortcuts</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-stone-500 hover:text-stone-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-2.5">
          {shortcuts.map((sc, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 border-b border-[#1a1d26]">
              <span className="text-stone-400">{sc.desc}</span>
              <kbd className="px-2 py-0.5 rounded bg-[#1c202c] text-amber-300 border border-[#2b3042] font-semibold text-[11px]">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
