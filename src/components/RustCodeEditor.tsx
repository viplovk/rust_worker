import React, { useRef, useEffect, useState } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface RustCodeEditorProps {
  sourceCode: string;
  activeLine?: number;
  fileName?: string;
}

export const RustCodeEditor: React.FC<RustCodeEditorProps> = ({
  sourceCode,
  activeLine,
  fileName = 'algorithm.rs',
}) => {
  const [copied, setCopied] = useState(false);
  const [monacoLoaded, setMonacoLoaded] = useState(true);
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Define custom subtle theme for Rust DSA Lab
    monaco.editor.defineTheme('rust-dark-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'c084fc' }, // purple
        { token: 'type', foreground: '38bdf8' }, // sky
        { token: 'number', foreground: 'f59e0b' }, // amber
        { token: 'string', foreground: '34d399' }, // emerald
      ],
      colors: {
        'editor.background': '#0c0e12',
        'editor.lineHighlightBackground': '#1c202a',
        'editorLineNumber.foreground': '#4b5563',
        'editorLineNumber.activeForeground': '#f59e0b',
      },
    });

    monaco.editor.setTheme('rust-dark-theme');
  };

  // Synchronize activeLine decoration
  useEffect(() => {
    if (!editorRef.current || !activeLine) return;

    try {
      const editor = editorRef.current;
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
        {
          range: {
            startLineNumber: activeLine,
            startColumn: 1,
            endLineNumber: activeLine,
            endColumn: 1,
          },
          options: {
            isWholeLine: true,
            className: 'bg-amber-500/20 border-l-4 border-amber-400',
            glyphMarginClassName: 'text-amber-400',
          },
        },
      ]);

      // Scroll into view if needed
      editor.revealLineInCenterIfOutsideViewport(activeLine);
    } catch (e) {
      console.warn('Monaco decoration update error:', e);
    }
  }, [activeLine]);

  return (
    <div
      id="rust-code-editor-container"
      className="bg-[#0c0e12] border border-[#1f222b] rounded-xl flex flex-col overflow-hidden h-[360px] font-mono text-xs"
    >
      {/* Tab bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#12141a] border-b border-[#1f222b]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-stone-300 font-semibold">{fileName}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#1e222d] text-stone-400 border border-[#2b303e]">
            Rust
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeLine && (
            <span className="text-amber-400 text-[11px] font-medium hidden sm:inline">
              Active: Line {activeLine}
            </span>
          )}
          <button
            type="button"
            onClick={handleCopy}
            className="p-1 rounded hover:bg-[#1f232f] text-stone-400 hover:text-stone-200 transition"
            title="Copy Rust Source"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative overflow-hidden">
        {monacoLoaded ? (
          <Editor
            height="100%"
            language="rust"
            value={sourceCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              domReadOnly: true,
              cursorStyle: 'line',
              overviewRulerBorder: false,
              contextmenu: false,
            }}
            onMount={handleEditorDidMount}
          />
        ) : (
          /* Fallback view if Monaco CDN unavailable */
          <pre className="p-3 text-stone-300 overflow-auto h-full text-xs font-mono leading-relaxed">
            {sourceCode.split('\n').map((line, idx) => {
              const lineNum = idx + 1;
              const isActive = lineNum === activeLine;
              return (
                <div
                  key={idx}
                  className={`flex ${
                    isActive ? 'bg-amber-500/20 text-amber-200 border-l-2 border-amber-400' : ''
                  }`}
                >
                  <span className="w-8 text-stone-600 select-none text-right pr-2">
                    {lineNum}
                  </span>
                  <span>{line}</span>
                </div>
              );
            })}
          </pre>
        )}
      </div>
    </div>
  );
};
