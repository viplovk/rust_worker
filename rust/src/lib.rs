pub mod tracing;

use tracing::{ExecutionStats, ExecutionTrace, OpType, Tracer};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn run_quick_sort(arr_json: &str) -> Result<String, JsValue> {
    let mut arr: Vec<i64> = serde_json::from_str(arr_json)
        .map_err(|e| JsValue::from_str(&format!("Invalid array JSON: {}", e)))?;
    let initial_state = serde_json::to_value(&arr).unwrap();
    let mut tracer = Tracer::new();

    let len = arr.len();
    if len > 1 {
        quick_sort_recursive(&mut arr, 0, len - 1, &mut tracer);
    }

    let final_state = serde_json::to_value(&arr).unwrap();
    tracer.record(
        OpType::Done,
        35,
        vec![],
        vec![],
        "Quick Sort completed successfully.".to_string(),
        "All partitions have been resolved and the array is strictly sorted in non-decreasing order.".to_string(),
        0,
        final_state.clone(),
        None,
    );

    let trace = ExecutionTrace {
        algorithm: "quick_sort".to_string(),
        initial_state,
        final_state,
        events: tracer.events,
        stats: tracer.stats,
    };

    serde_json::to_string(&trace).map_err(|e| JsValue::from_str(&e.to_string()))
}

fn quick_sort_recursive(arr: &mut [i64], low: usize, high: usize, tracer: &mut Tracer) {
    tracer.stack_depth += 1;
    tracer.record(
        OpType::Call,
        2,
        vec![low, high],
        vec![arr[low], arr[high]],
        format!("quick_sort(low={}, high={}) called", low, high),
        "Divide and conquer step: establishing boundaries for recursive partition.".to_string(),
        1,
        serde_json::to_value(&arr.to_vec()).unwrap(),
        Some(serde_json::json!({ "low": low, "high": high })),
    );

    if low < high {
        let p_idx = partition(arr, low, high, tracer);
        if p_idx > 0 && p_idx > low {
            quick_sort_recursive(arr, low, p_idx - 1, tracer);
        }
        quick_sort_recursive(arr, p_idx + 1, high, tracer);
    }

    tracer.stack_depth -= 1;
}

fn partition(arr: &mut [i64], low: usize, high: usize, tracer: &mut Tracer) -> usize {
    let pivot = arr[high];
    tracer.record(
        OpType::Pivot,
        15,
        vec![high],
        vec![pivot],
        format!("Selected arr[{}] = {} as pivot", high, pivot),
        "Using Lomuto partition scheme with rightmost element as pivot element.".to_string(),
        1,
        serde_json::to_value(&arr.to_vec()).unwrap(),
        Some(serde_json::json!({ "pivot": high, "low": low, "high": high })),
    );

    let mut i = low;
    for j in low..high {
        tracer.record(
            OpType::Compare,
            20,
            vec![j, high],
            vec![arr[j], pivot],
            format!("Comparing arr[{}] ({}) <= pivot ({})", j, arr[j], pivot),
            "Elements smaller than or equal to pivot are moved to the left partition.".to_string(),
            1,
            serde_json::to_value(&arr.to_vec()).unwrap(),
            Some(serde_json::json!({ "i": i, "j": j, "pivot": high })),
        );

        if arr[j] <= pivot {
            if i != j {
                arr.swap(i, j);
                tracer.record(
                    OpType::Swap,
                    24,
                    vec![i, j],
                    vec![arr[i], arr[j]],
                    format!("Swapping arr[{}] with arr[{}]", i, j),
                    "Expanding the left partition boundary by placing smaller element at left index.".to_string(),
                    1,
                    serde_json::to_value(&arr.to_vec()).unwrap(),
                    Some(serde_json::json!({ "i": i, "j": j, "pivot": high })),
                );
            }
            i += 1;
        }
    }

    if i != high {
        arr.swap(i, high);
        tracer.record(
            OpType::Swap,
            30,
            vec![i, high],
            vec![arr[i], arr[high]],
            format!("Placing pivot {} at its sorted partition index {}", pivot, i),
            "Pivot is placed in its final sorted position with smaller elements on left and larger on right.".to_string(),
            1,
            serde_json::to_value(&arr.to_vec()).unwrap(),
            Some(serde_json::json!({ "final_pivot": i })),
        );
    }

    i
}
