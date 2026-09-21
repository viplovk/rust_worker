import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ALGORITHM_REGISTRY } from './algorithms/registry';
import { wasmBridge } from './wasm/bridge';
import { AlgorithmDefinition, ExecutionTrace, TraceEvent } from './types';

// Components
import { LandingPage } from './components/LandingPage';
import { Header, ActiveTab } from './components/Header';
import { AlgorithmExplorer } from './components/AlgorithmExplorer';
import { VisualizerCanvas } from './components/VisualizerCanvas';
import { TimelineControls } from './components/TimelineControls';
import { ComplexityAuditor } from './components/ComplexityAuditor';
import { StepExplanationPanel } from './components/StepExplanationPanel';
import { RustCodeEditor } from './components/RustCodeEditor';
import { RustInspector } from './components/RustInspector';
import { CustomInputLab } from './components/CustomInputLab';
import { ComplexityAuditMode } from './components/ComplexityAuditMode';
import { ComparisonMode } from './components/ComparisonMode';
import { ComplexityCheatSheet } from './components/ComplexityCheatSheet';
import { BigOExplainer } from './components/BigOExplainer';
import { CommandPalette } from './components/CommandPalette';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab | 'landing'>('landing');
  const [selectedAlgoId, setSelectedAlgoId] = useState<string>('quick_sort');
  const [whyMode, setWhyMode] = useState<boolean>(true);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Execution & Trace State
  const [customInput, setCustomInput] = useState<any>(null);
  const [trace, setTrace] = useState<ExecutionTrace | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const selectedAlgo: AlgorithmDefinition =
    ALGORITHM_REGISTRY.find((a) => a.id === selectedAlgoId) || ALGORITHM_REGISTRY[0];

  const wasmStatus = wasmBridge.getEngineStatus();

  // Load / Re-run Algorithm
  const loadTrace = useCallback(
    async (algoId: string, inputToUse?: any) => {
      const algo = ALGORITHM_REGISTRY.find((a) => a.id === algoId) || ALGORITHM_REGISTRY[0];
      const data = inputToUse ?? (customInput || algo.defaultInput);

      try {
        const executionTrace = await wasmBridge.execute(algo.id, data);
        setTrace(executionTrace);
        setCurrentStepIndex(0);
        setIsPlaying(false);
      } catch (err) {
        console.error('Failed to generate execution trace:', err);
      }
    },
    [customInput]
  );

  // When selected algorithm changes
  useEffect(() => {
    setCustomInput(null);
    loadTrace(selectedAlgoId, null);
  }, [selectedAlgoId, loadTrace]);

  // Current Step Event
  const currentEvent: TraceEvent | undefined = trace?.events[currentStepIndex];
  const totalSteps = trace?.events.length || 0;

  // Playback timer loop
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
      return;
    }

    const intervalMs = Math.max(80, Math.round(500 / playbackSpeed));
    playTimerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (!trace || prev >= trace.events.length - 1) {
          setIsPlaying(false);
          // Celebration confetti on completion
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
              colors: ['#f59e0b', '#38bdf8', '#10b981'],
            });
          } catch (e) {
            // ignore
          }
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, trace]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      const targetTag = (e.target as HTMLElement)?.tagName;
      if (targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentStepIndex((prev) => Math.min(totalSteps - 1, prev + 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentStepIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        setCurrentStepIndex(0);
        setIsPlaying(false);
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setCurrentStepIndex(Math.max(0, totalSteps - 1));
        setIsPlaying(false);
      } else if (e.key.toLowerCase() === 'w') {
        e.preventDefault();
        setWhyMode((prev) => !prev);
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalSteps]);

  // Handler for custom array input
  const handleApplyCustomInput = (newArr: number[]) => {
    setCustomInput(newArr);
    loadTrace(selectedAlgoId, newArr);
  };

  // Nav actions
  const handleLaunchVisualizer = (algoId?: string) => {
    if (algoId) setSelectedAlgoId(algoId);
    setActiveTab('visualizer');
  };

  const handleSelectAlgorithmFromAnywhere = (id: string) => {
    setSelectedAlgoId(id);
    setActiveTab('visualizer');
    setIsSearchOpen(false);
  };

  // If on landing page
  if (activeTab === 'landing') {
    return (
      <LandingPage
        onLaunchVisualizer={handleLaunchVisualizer}
        onExploreAlgorithms={() => setActiveTab('cheatsheet')}
      />
    );
  }

  return (
    <div id="rust-dsa-lab-root" className="min-h-screen bg-[#0b0c0e] text-[#ededed] flex flex-col font-sans">
      {/* Top Navigation Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        whyMode={whyMode}
        onToggleWhyMode={() => setWhyMode((prev) => !prev)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onGoHome={() => setActiveTab('landing')}
        wasmStatus={wasmStatus}
      />

      {/* Main Content Area */}
      {activeTab === 'auditor' ? (
        <main className="flex-1 overflow-y-auto">
          <ComplexityAuditMode />
        </main>
      ) : activeTab === 'compare' ? (
        <main className="flex-1 overflow-y-auto">
          <ComparisonMode />
        </main>
      ) : activeTab === 'cheatsheet' ? (
        <main className="flex-1 overflow-y-auto">
          <ComplexityCheatSheet onSelectAlgorithm={handleSelectAlgorithmFromAnywhere} />
        </main>
      ) : activeTab === 'bigo' ? (
        <main className="flex-1 overflow-y-auto">
          <BigOExplainer />
        </main>
      ) : (
        /* Visualizer Mode */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar Algorithm Explorer */}
          <AlgorithmExplorer
            selectedAlgorithmId={selectedAlgoId}
            onSelectAlgorithm={(id) => setSelectedAlgoId(id)}
          />

          {/* Main Visualizer Workspace */}
          <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto space-y-4 max-w-7xl mx-auto w-full">
            {/* Upper Workspace: Visualizer Canvas + Timeline Controls */}
            <div className="space-y-3">
              <VisualizerCanvas
                algorithm={selectedAlgo}
                currentEvent={currentEvent}
                totalSteps={totalSteps}
              />

              <TimelineControls
                currentStep={currentStepIndex + 1}
                totalSteps={totalSteps}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                onStepChange={(step) => setCurrentStepIndex(step - 1)}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onSpeedChange={setPlaybackSpeed}
                onReset={() => {
                  setCurrentStepIndex(0);
                  setIsPlaying(false);
                }}
                onSkipToEnd={() => {
                  setCurrentStepIndex(Math.max(0, totalSteps - 1));
                  setIsPlaying(false);
                }}
              />
            </div>

            {/* Middle Workspace: Step Narrative + Complexity Auditor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <StepExplanationPanel currentEvent={currentEvent} whyMode={whyMode} />

              <ComplexityAuditor
                algorithm={selectedAlgo}
                stats={
                  trace?.stats || {
                    comparisons: 0,
                    swaps: 0,
                    writes: 0,
                    reads: 0,
                    recursiveCalls: 0,
                    allocations: 0,
                    totalSteps: 0,
                    durationNs: 0,
                    measuredTimeMs: 0,
                  }
                }
                currentStep={currentStepIndex + 1}
                totalSteps={totalSteps}
                inputSize={
                  Array.isArray(customInput || selectedAlgo.defaultInput)
                    ? (customInput || selectedAlgo.defaultInput).length
                    : 8
                }
              />
            </div>

            {/* Lower Workspace: Rust Code Editor + Rust Architectural Concepts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <RustCodeEditor
                sourceCode={selectedAlgo.rustSourceCode}
                activeLine={currentEvent?.sourceLine}
                fileName={`${selectedAlgo.id}.rs`}
              />

              <div className="space-y-4">
                <RustInspector concepts={selectedAlgo.rustConcepts} />

                {selectedAlgo.inputFormat === 'array' && (
                  <CustomInputLab
                    currentInput={customInput || selectedAlgo.defaultInput}
                    onApplyInput={handleApplyCustomInput}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Global Modals */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectAlgorithm={handleSelectAlgorithmFromAnywhere}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default App;
