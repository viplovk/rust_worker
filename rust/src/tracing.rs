use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum OpType {
    Compare,
    Swap,
    Write,
    Visit,
    Pivot,
    Partition,
    Call,
    Return,
    Shift,
    Insert,
    Delete,
    Push,
    Pop,
    Enqueue,
    Dequeue,
    Allocate,
    Done,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraceEvent {
    pub step: usize,
    pub op: OpType,
    pub source_line: usize,
    pub indices: Vec<usize>,
    pub values: Vec<i64>,
    pub description: String,
    pub why: String,
    pub cost: usize,
    pub stack_depth: usize,
    pub snapshot: serde_json::Value,
    pub auxiliary: Option<serde_json::Value>,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct ExecutionStats {
    pub comparisons: usize,
    pub swaps: usize,
    pub writes: usize,
    pub reads: usize,
    pub recursive_calls: usize,
    pub allocations: usize,
    pub total_steps: usize,
    pub duration_ns: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionTrace {
    pub algorithm: String,
    pub initial_state: serde_json::Value,
    pub final_state: serde_json::Value,
    pub events: Vec<TraceEvent>,
    pub stats: ExecutionStats,
}

pub struct Tracer {
    pub events: Vec<TraceEvent>,
    pub stats: ExecutionStats,
    pub stack_depth: usize,
}

impl Tracer {
    pub fn new() -> Self {
        Self {
            events: Vec::new(),
            stats: ExecutionStats::default(),
            stack_depth: 0,
        }
    }

    pub fn record(
        &mut self,
        op: OpType,
        source_line: usize,
        indices: Vec<usize>,
        values: Vec<i64>,
        description: String,
        why: String,
        cost: usize,
        snapshot: serde_json::Value,
        auxiliary: Option<serde_json::Value>,
    ) {
        match op {
            OpType::Compare => self.stats.comparisons += 1,
            OpType::Swap => {
                self.stats.swaps += 1;
                self.stats.writes += 2;
            }
            OpType::Write | OpType::Insert | OpType::Shift => self.stats.writes += 1,
            OpType::Call => self.stats.recursive_calls += 1,
            OpType::Allocate => self.stats.allocations += 1,
            _ => {}
        }
        self.stats.reads += indices.len();
        self.stats.total_steps += 1;

        let step = self.events.len() + 1;
        self.events.push(TraceEvent {
            step,
            op,
            source_line,
            indices,
            values,
            description,
            why,
            cost,
            stack_depth: self.stack_depth,
            snapshot,
            auxiliary,
        });
    }
}
