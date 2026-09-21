import React from 'react';
import { Play, Sparkles, Terminal, Cpu, ArrowRight, Gauge, Layers, GitCompare, Code2, BookOpen } from 'lucide-react';
import { ALGORITHM_REGISTRY } from '../algorithms/registry';

interface LandingPageProps {
  onLaunchVisualizer: (algoId?: string) => void;
  onExploreAlgorithms: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchVisualizer,
  onExploreAlgorithms,
}) => {
  const featuredAlgorithms = ALGORITHM_REGISTRY.slice(0, 6);

  return (
    <div id="landing-page-container" className="min-h-screen bg-[#0b0c0e] text-[#ededed] flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#16181d_1px,transparent_1px),linear-gradient(to_bottom,#16181d_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35" />

        <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181a20] border border-[#272a33] text-xs font-mono text-amber-400/90 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span>Rust Engine + WebAssembly Architecture</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-stone-100 leading-[1.12]">
            Algorithms, Visualized.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200">
              Complexity, Audited.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-stone-400 max-w-2xl font-normal leading-relaxed">
            Explore data structures, execute algorithms step-by-step, and inspect their real computational cost
            — powered by Rust and WebAssembly.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <button
              id="launch-visualizer-hero-btn"
              type="button"
              onClick={() => onLaunchVisualizer('quick_sort')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-sm transition shadow-lg shadow-amber-900/20 active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Launch Visualizer</span>
            </button>

            <button
              id="explore-algorithms-hero-btn"
              type="button"
              onClick={onExploreAlgorithms}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#181a20] hover:bg-[#20232a] border border-[#272a33] text-stone-200 font-medium text-sm transition active:scale-[0.98]"
            >
              <BookOpen className="w-4 h-4 text-stone-400" />
              <span>Explore Algorithms</span>
            </button>
          </div>
        </div>

        {/* Abstract Technical Hero Visualization */}
        <div className="mt-14 max-w-5xl mx-auto rounded-xl border border-[#272a33] bg-[#101216] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
          {/* Header pill of mock editor */}
          <div className="flex items-center justify-between pb-4 border-b border-[#20232b] text-xs font-mono text-stone-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
              <span className="text-stone-300 ml-2">quick_sort.rs — Live Step 18 / 42</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-amber-400">Op: COMPARE (arr[4] &lt;= pivot 56)</span>
              <span className="text-emerald-400">Cost: 1 op</span>
            </div>
          </div>

          {/* Interactive abstract visualization preview */}
          <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Visual Bars Simulation */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400 font-mono">
                <span>Partition State (Lomuto Scheme)</span>
                <span>Pivot: 56</span>
              </div>
              <div className="h-36 bg-[#0c0d10] rounded-lg border border-[#1e2028] p-3 flex items-end justify-around gap-1.5 sm:gap-2">
                {[
                  { val: 17, height: '30%', status: 'sorted', label: '17' },
                  { val: 8, height: '18%', status: 'sorted', label: '8' },
                  { val: 23, height: '42%', status: 'active', label: '23' },
                  { val: 4, height: '12%', status: 'compare', label: '4' },
                  { val: 42, height: '65%', status: 'compare', label: '42' },
                  { val: 91, height: '95%', status: 'normal', label: '91' },
                  { val: 73, height: '78%', status: 'normal', label: '73' },
                  { val: 56, height: '60%', status: 'pivot', label: '56' },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-mono text-stone-400">{item.label}</span>
                    <div
                      style={{ height: item.height }}
                      className={`w-full rounded-t transition-all duration-300 ${
                        item.status === 'pivot'
                          ? 'bg-amber-500 shadow-md shadow-amber-500/20'
                          : item.status === 'compare'
                          ? 'bg-cyan-400 shadow-md shadow-cyan-400/20'
                          : item.status === 'active'
                          ? 'bg-orange-400'
                          : item.status === 'sorted'
                          ? 'bg-emerald-500/80'
                          : 'bg-stone-700'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-stone-500">[{idx}]</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded bg-amber-500" /> Pivot
                  <span className="w-2 h-2 rounded bg-cyan-400 ml-2" /> Compare
                  <span className="w-2 h-2 rounded bg-emerald-500 ml-2" /> Sorted
                </span>
                <span>Swaps: 7 · Comparisons: 18</span>
              </div>
            </div>

            {/* Code Snippet with active line pointer */}
            <div className="bg-[#0b0c0e] rounded-lg border border-[#1e2028] p-3 text-xs font-mono text-stone-300 leading-relaxed overflow-x-auto">
              <div className="text-stone-500">// Rust Lomuto Partition Routine</div>
              <div><span className="text-purple-400">fn</span> <span className="text-blue-400">partition</span>(arr: &amp;<span className="text-purple-400">mut</span> [i32], low: usize, high: usize) -&gt; usize &#123;</div>
              <div className="pl-4"><span className="text-purple-400">let</span> pivot = arr[high];</div>
              <div className="pl-4"><span className="text-purple-400">let mut</span> i = low;</div>
              <div className="pl-4"><span className="text-purple-400">for</span> j <span className="text-purple-400">in</span> low..high &#123;</div>
              <div className="pl-8 bg-amber-500/15 text-amber-200 border-l-2 border-amber-400 py-0.5 -mx-3 px-3">
                <span className="text-purple-400">if</span> arr[j] &lt;= pivot &#123; <span className="text-stone-500">// &lt;-- Active Line 29</span>
              </div>
              <div className="pl-12">arr.<span className="text-yellow-300">swap</span>(i, j);</div>
              <div className="pl-12">i += 1;</div>
              <div className="pl-8">&#125;</div>
              <div className="pl-4">&#125;</div>
              <div className="pl-4">arr.<span className="text-yellow-300">swap</span>(i, high);</div>
              <div className="pl-4">i</div>
              <div>&#125;</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#1a1c22]">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-100">
            A Serious Laboratory for Algorithm Engineering
          </h2>
          <p className="text-sm sm:text-base text-stone-400 mt-2">
            Engineered from first principles to expose internal execution traces and computational growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-[#22252e] bg-[#121418] p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-100">Rust &amp; WASM Engine</h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Implemented with authentic idiomatic Rust code: slices, borrow checking, and structured execution traces
              emitted step-by-step.
            </p>
          </div>

          <div className="rounded-xl border border-[#22252e] bg-[#121418] p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Gauge className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-100">Complexity Auditor</h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Don't just memorize Big-O. Run multi-size empirical benchmark audits over N = 10..1000 and plot actual
              comparisons and swaps against mathematical curves.
            </p>
          </div>

          <div className="rounded-xl border border-[#22252e] bg-[#121418] p-5 space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-stone-100">Synchronized Rust Code</h3>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed">
              Monaco-powered Rust editor synchronizes line-by-line with visualization steps. Inspect Rust concepts like
              `&amp;mut [T]` and `Option&lt;Box&lt;Node&gt;&gt;`.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Algorithms Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-[#1a1c22]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-stone-100">Supported Core Algorithms</h3>
            <p className="text-xs sm:text-sm text-stone-400">
              Select an algorithm to jump straight into the execution visualizer.
            </p>
          </div>
          <button
            type="button"
            onClick={onExploreAlgorithms}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300"
          >
            <span>View All 20+ Algorithms</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredAlgorithms.map((algo) => (
            <div
              key={algo.id}
              onClick={() => onLaunchVisualizer(algo.id)}
              className="rounded-xl border border-[#20232b] bg-[#121418] hover:border-amber-500/40 p-4 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-medium text-amber-400 uppercase tracking-wider">
                  {algo.category}
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1b1e26] text-stone-300 border border-[#272a33]">
                  {algo.averageCase}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-stone-100 group-hover:text-amber-300 transition">
                {algo.name}
              </h4>
              <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                {algo.overview}
              </p>
              <div className="mt-3 pt-3 border-t border-[#1e2028] flex items-center justify-between text-xs text-stone-500">
                <span>Space: {algo.spaceComplexity}</span>
                <span className="text-amber-400/80 group-hover:translate-x-0.5 transition inline-flex items-center gap-1">
                  Visualize &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-[#1a1c22] text-center text-xs text-stone-500 font-mono">
        <p>RUST DSA LAB — Interactive Data Structures &amp; Algorithms Visualizer + Complexity Auditor</p>
        <p className="mt-1 text-stone-600">Built with Rust WASM Tracing Architecture, React 18 &amp; Tailwind CSS</p>
      </footer>
    </div>
  );
};
