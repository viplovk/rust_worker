export type OpType =
  | 'compare'
  | 'swap'
  | 'write'
  | 'visit'
  | 'pivot'
  | 'partition'
  | 'call'
  | 'return'
  | 'shift'
  | 'insert'
  | 'delete'
  | 'push'
  | 'pop'
  | 'enqueue'
  | 'dequeue'
  | 'allocate'
  | 'done';

export interface TraceEvent {
  step: number;
  op: OpType;
  sourceLine: number;
  indices: number[];
  values: (number | string)[];
  description: string;
  why: string;
  cost: number;
  stackDepth: number;
  snapshot: any;
  auxiliary?: {
    low?: number;
    high?: number;
    pivot?: number;
    i?: number;
    j?: number;
    mid?: number;
    target?: number;
    found?: boolean;
    visited?: (string | number)[];
    distances?: Record<string, number>;
    currentDistance?: number;
    queue?: (string | number)[];
    stack?: (string | number)[];
    top?: number;
    activeEdge?: { from: string; to: string };
    shortestPath?: string[];
    dpGrid?: number[][];
    dpLabels?: { row: string[]; col: string[] };
    activeCell?: [number, number];
    callStack?: string[];
    [key: string]: any;
  };
}

export interface ExecutionStats {
  comparisons: number;
  swaps: number;
  writes: number;
  reads: number;
  recursiveCalls: number;
  allocations: number;
  totalSteps: number;
  durationNs: number;
  measuredTimeMs: number;
}

export interface ExecutionTrace {
  algorithm: string;
  initialState: any;
  finalState: any;
  events: TraceEvent[];
  stats: ExecutionStats;
}

export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'arrays'
  | 'linked_lists'
  | 'stack_queue'
  | 'trees'
  | 'graphs'
  | 'dp'
  | 'recursion';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export interface RustConcept {
  concept: string;
  explanation: string;
  codeSnippet?: string;
}

export interface AlgorithmDefinition {
  id: string;
  name: string;
  category: AlgorithmCategory;
  difficulty: DifficultyLevel;
  bestCase: string;
  averageCase: string;
  worstCase: string;
  spaceComplexity: string;
  auxiliarySpace?: string;
  stable?: boolean;
  inPlace?: boolean;
  overview: string;
  howItWorks: string[];
  rustConcepts: RustConcept[];
  defaultInput: any;
  inputFormat: 'array' | 'search_array' | 'linked_list' | 'graph' | 'tree' | 'dp_knapsack' | 'recursion';
  rustSourceCode: string;
}

export interface AuditPoint {
  size: number;
  comparisons: number;
  swaps: number;
  writes: number;
  reads: number;
  steps: number;
  timeMs: number;
}

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
}

export interface TreeNodeData {
  id: number;
  val: number;
  left?: TreeNodeData | null;
  right?: TreeNodeData | null;
  x?: number;
  y?: number;
}
