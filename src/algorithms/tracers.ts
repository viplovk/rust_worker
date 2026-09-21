import { ExecutionTrace, TraceEvent, ExecutionStats } from '../types';

/**
 * High-performance deterministic trace generator matching Rust engine semantics
 * Accurately tracks comparisons, swaps, writes, reads, recursive calls, and allocations.
 */
class TraceCollector {
  events: TraceEvent[] = [];
  stats: ExecutionStats = {
    comparisons: 0,
    swaps: 0,
    writes: 0,
    reads: 0,
    recursiveCalls: 0,
    allocations: 0,
    totalSteps: 0,
    durationNs: 0,
    measuredTimeMs: 0,
  };
  stackDepth = 0;

  record(
    op: TraceEvent['op'],
    sourceLine: number,
    indices: number[],
    values: (number | string)[],
    description: string,
    why: string,
    cost: number,
    snapshot: any,
    auxiliary?: any
  ) {
    if (op === 'compare') {
      this.stats.comparisons += 1;
    } else if (op === 'swap') {
      this.stats.swaps += 1;
      this.stats.writes += 2;
    } else if (op === 'write' || op === 'shift' || op === 'insert') {
      this.stats.writes += 1;
    } else if (op === 'call') {
      this.stats.recursiveCalls += 1;
    } else if (op === 'allocate') {
      this.stats.allocations += 1;
    }

    this.stats.reads += indices.length;
    this.stats.totalSteps += 1;

    const step = this.events.length + 1;
    this.events.push({
      step,
      op,
      sourceLine,
      indices,
      values,
      description,
      why,
      cost,
      stackDepth: this.stackDepth,
      snapshot: JSON.parse(JSON.stringify(snapshot)),
      auxiliary: auxiliary ? JSON.parse(JSON.stringify(auxiliary)) : undefined,
    });
  }
}

// ---------------------------------------------------------------------------
// SORTING TRACERS
// ---------------------------------------------------------------------------

export function traceQuickSort(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  function quickSortRange(low: number, high: number) {
    tracer.stackDepth += 1;
    tracer.record(
      'call',
      10,
      [low, high],
      [arr[low], arr[high]],
      `quick_sort_range(low=${low}, high=${high}) invoked`,
      'Divide and conquer step: establishing boundaries for recursive partition.',
      1,
      [...arr],
      { low, high }
    );

    if (low < high) {
      const p = partition(low, high);
      if (p > 0 && p > low) {
        quickSortRange(low, p - 1);
      }
      quickSortRange(p + 1, high);
    }

    tracer.stackDepth -= 1;
  }

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    tracer.record(
      'pivot',
      24,
      [high],
      [pivot],
      `Selected arr[${high}] = ${pivot} as partition pivot`,
      'Lomuto partition scheme selects the rightmost element as pivot.',
      1,
      [...arr],
      { pivot: high, low, high }
    );

    let i = low;
    for (let j = low; j < high; j++) {
      tracer.record(
        'compare',
        29,
        [j, high],
        [arr[j], pivot],
        `Compare arr[${j}] (${arr[j]}) <= pivot (${pivot})`,
        'Elements <= pivot belong in the left partition, elements > pivot belong in the right.',
        1,
        [...arr],
        { i, j, pivot: high, low, high }
      );

      if (arr[j] <= pivot) {
        if (i !== j) {
          const temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
          tracer.record(
            'swap',
            32,
            [i, j],
            [arr[i], arr[j]],
            `Swapped arr[${i}] and arr[${j}]`,
            `Expanding left partition by moving smaller element ${arr[i]} into boundary index ${i}.`,
            1,
            [...arr],
            { i, j, pivot: high, low, high }
          );
        }
        i += 1;
      }
    }

    if (i !== high) {
      const temp = arr[i];
      arr[i] = arr[high];
      arr[high] = temp;
      tracer.record(
        'swap',
        40,
        [i, high],
        [arr[i], arr[high]],
        `Placed pivot ${pivot} at sorted partition index ${i}`,
        'The pivot is now positioned at its final sorted location with all smaller elements to its left and larger to its right.',
        1,
        [...arr],
        { pivot: i, low, high }
      );
    }

    return i;
  }

  if (arr.length > 1) {
    quickSortRange(0, arr.length - 1);
  }

  tracer.record(
    'done',
    6,
    [],
    [],
    'Quick Sort complete',
    'Array is now completely sorted in non-decreasing order.',
    0,
    [...arr]
  );

  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'quick_sort',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceMergeSort(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  function mergeSortHelper(low: number, high: number) {
    tracer.stackDepth += 1;
    tracer.record(
      'call',
      12,
      [low, high],
      [arr[low], arr[high]],
      `merge_sort_helper(low=${low}, high=${high})`,
      'Halving array segment until single-element base cases are reached.',
      1,
      [...arr],
      { low, high }
    );

    if (low < high) {
      const mid = Math.floor(low + (high - low) / 2);
      mergeSortHelper(low, mid);
      mergeSortHelper(mid + 1, high);
      merge(low, mid, high);
    }
    tracer.stackDepth -= 1;
  }

  function merge(low: number, mid: number, high: number) {
    tracer.record(
      'allocate',
      24,
      [],
      [],
      `Allocating merge buffer for range [${low}..=${high}]`,
      'Merge Sort requires auxiliary space to hold elements during merging.',
      1,
      [...arr],
      { low, mid, high }
    );

    const temp: number[] = [];
    let i = low;
    let j = mid + 1;

    while (i <= mid && j <= high) {
      tracer.record(
        'compare',
        28,
        [i, j],
        [arr[i], arr[j]],
        `Compare left arr[${i}] (${arr[i]}) with right arr[${j}] (${arr[j]})`,
        'Selecting the smaller element to maintain sorted order in merged buffer.',
        1,
        [...arr],
        { i, j, low, mid, high }
      );

      if (arr[i] <= arr[j]) {
        temp.push(arr[i]);
        i++;
      } else {
        temp.push(arr[j]);
        j++;
      }
    }

    while (i <= mid) {
      temp.push(arr[i]);
      i++;
    }
    while (j <= high) {
      temp.push(arr[j]);
      j++;
    }

    // Copy back
    for (let k = 0; k < temp.length; k++) {
      arr[low + k] = temp[k];
      tracer.record(
        'write',
        49,
        [low + k],
        [temp[k]],
        `Write sorted value ${temp[k]} back to arr[${low + k}]`,
        'Copying merged elements back to the main array slice.',
        1,
        [...arr],
        { low, high }
      );
    }
  }

  if (arr.length > 1) {
    mergeSortHelper(0, arr.length - 1);
  }

  tracer.record('done', 6, [], [], 'Merge Sort complete', 'All subarrays successfully merged.', 0, [...arr]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'merge_sort',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceBubbleSort(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      tracer.record(
        'compare',
        11,
        [j, j + 1],
        [arr[j], arr[j + 1]],
        `Compare arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]})`,
        'Checking whether adjacent pair is out of sorted order.',
        1,
        [...arr],
        { i, j }
      );

      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
        tracer.record(
          'swap',
          13,
          [j, j + 1],
          [arr[j], arr[j + 1]],
          `Swapped arr[${j}] and arr[${j + 1}]`,
          `Larger value ${arr[j + 1]} bubbles rightwards.`,
          1,
          [...arr],
          { i, j }
        );
      }
    }

    if (!swapped) {
      tracer.record(
        'visit',
        17,
        [],
        [],
        `Early termination at pass ${i + 1}`,
        'No elements were swapped during this pass, meaning array is already sorted.',
        0,
        [...arr]
      );
      break;
    }
  }

  tracer.record('done', 20, [], [], 'Bubble Sort complete', 'Every element is placed in order.', 0, [...arr]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'bubble_sort',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceInsertionSort(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i;
    tracer.record(
      'visit',
      5,
      [i],
      [key],
      `Pick key = arr[${i}] (${key})`,
      'Selecting current unsorted element to insert into preceding sorted sublist.',
      1,
      [...arr],
      { i, key }
    );

    while (j > 0) {
      tracer.record(
        'compare',
        8,
        [j - 1, i],
        [arr[j - 1], key],
        `Compare arr[${j - 1}] (${arr[j - 1]}) > key (${key})`,
        'Checking if preceding element needs to shift right to open a slot for key.',
        1,
        [...arr],
        { i, j, key }
      );

      if (arr[j - 1] > key) {
        arr[j] = arr[j - 1];
        tracer.record(
          'shift',
          9,
          [j - 1, j],
          [arr[j - 1]],
          `Shift arr[${j - 1}] to index ${j}`,
          'Moving larger element rightwards.',
          1,
          [...arr],
          { i, j, key }
        );
        j--;
      } else {
        break;
      }
    }

    arr[j] = key;
    tracer.record(
      'insert',
      12,
      [j],
      [key],
      `Insert key ${key} into index ${j}`,
      'Slot found! Key placed in sorted sublist.',
      1,
      [...arr],
      { i, j, key }
    );
  }

  tracer.record('done', 14, [], [], 'Insertion Sort complete', 'All elements placed.', 0, [...arr]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'insertion_sort',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceSelectionSort(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();
  const n = arr.length;

  for (let i = 0; i < n; i++) {
    let minIdx = i;
    tracer.record(
      'visit',
      5,
      [i],
      [arr[i]],
      `Assume arr[${i}] (${arr[i]}) is candidate minimum`,
      'Starting search for minimum element in remaining unsorted portion.',
      1,
      [...arr],
      { i, minIdx }
    );

    for (let j = i + 1; j < n; j++) {
      tracer.record(
        'compare',
        7,
        [j, minIdx],
        [arr[j], arr[minIdx]],
        `Compare arr[${j}] (${arr[j]}) < min arr[${minIdx}] (${arr[minIdx]})`,
        'Testing if a smaller value exists in the unsorted suffix.',
        1,
        [...arr],
        { i, j, minIdx }
      );

      if (arr[j] < arr[minIdx]) {
        minIdx = j;
        tracer.record(
          'visit',
          8,
          [minIdx],
          [arr[minIdx]],
          `New minimum found at index ${minIdx} (${arr[minIdx]})`,
          'Updating minimum tracker.',
          1,
          [...arr],
          { i, j, minIdx }
        );
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      tracer.record(
        'swap',
        11,
        [i, minIdx],
        [arr[i], arr[minIdx]],
        `Swap minimum element ${arr[i]} into index ${i}`,
        'Placing the smallest unsorted element into its definitive sorted position.',
        1,
        [...arr],
        { i, minIdx }
      );
    }
  }

  tracer.record('done', 14, [], [], 'Selection Sort complete', 'All positions finalized.', 0, [...arr]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'selection_sort',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceHeapSort(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();
  const n = arr.length;

  function heapify(heapSize: number, root: number) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;

    if (left < heapSize) {
      tracer.record(
        'compare',
        23,
        [left, largest],
        [arr[left], arr[largest]],
        `Compare left child arr[${left}] (${arr[left]}) > arr[${largest}] (${arr[largest]})`,
        'Max-heap invariant check: parent must be greater than or equal to both children.',
        1,
        [...arr],
        { root, left, right, heapSize }
      );
      if (arr[left] > arr[largest]) {
        largest = left;
      }
    }

    if (right < heapSize) {
      tracer.record(
        'compare',
        26,
        [right, largest],
        [arr[right], arr[largest]],
        `Compare right child arr[${right}] (${arr[right]}) > arr[${largest}] (${arr[largest]})`,
        'Max-heap invariant check for right child.',
        1,
        [...arr],
        { root, left, right, heapSize }
      );
      if (arr[right] > arr[largest]) {
        largest = right;
      }
    }

    if (largest !== root) {
      const temp = arr[root];
      arr[root] = arr[largest];
      arr[largest] = temp;
      tracer.record(
        'swap',
        30,
        [root, largest],
        [arr[root], arr[largest]],
        `Sift down: Swap root ${arr[largest]} with largest child ${arr[root]}`,
        'Violated max-heap property restored by sifting larger element upwards.',
        1,
        [...arr],
        { root, largest, heapSize }
      );
      heapify(heapSize, largest);
    }
  }

  // Step 1: Build max heap
  tracer.record(
    'visit',
    10,
    [],
    [],
    'Building max heap from bottom-up',
    'Converting array into binary tree where every node is >= its children.',
    1,
    [...arr]
  );

  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(n, i);
  }

  // Step 2: Extract elements
  for (let i = n - 1; i > 0; i--) {
    const temp = arr[0];
    arr[0] = arr[i];
    arr[i] = temp;
    tracer.record(
      'swap',
      16,
      [0, i],
      [arr[0], arr[i]],
      `Extract max root ${arr[i]} and place at end index ${i}`,
      'Root of max-heap is always maximum value in current heap boundary.',
      1,
      [...arr],
      { heapSize: i }
    );
    heapify(i, 0);
  }

  tracer.record('done', 19, [], [], 'Heap Sort complete', 'Max elements extracted in order.', 0, [...arr]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'heap_sort',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceCountingSort(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min + 1;
  const count = new Array(range).fill(0);

  tracer.record(
    'allocate',
    7,
    [],
    [],
    `Allocate frequency vector count[${range}] for range [${min}..=${max}]`,
    'Non-comparison integer sort maps keys directly to frequency buckets.',
    1,
    [...arr],
    { count: [...count] }
  );

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    count[val - min]++;
    tracer.record(
      'write',
      9,
      [i],
      [val],
      `Count occurrence of ${val} (count bucket ${val - min} = ${count[val - min]})`,
      'Tallying occurrences of each integer key.',
      1,
      [...arr],
      { count: [...count] }
    );
  }

  // Cumulative sums
  for (let i = 1; i < range; i++) {
    count[i] += count[i - 1];
  }
  tracer.record(
    'write',
    14,
    [],
    [],
    'Computed prefix sums of count array',
    'Prefix sums determine the exact output positions for stability.',
    1,
    [...arr],
    { count: [...count] }
  );

  const output = new Array(arr.length).fill(0);
  for (let i = arr.length - 1; i >= 0; i--) {
    const val = arr[i];
    const idx = val - min;
    count[idx]--;
    output[count[idx]] = val;
    tracer.record(
      'write',
      20,
      [count[idx]],
      [val],
      `Placed ${val} at output index ${count[idx]}`,
      'Iterating in reverse ensures stability (relative order of identical keys is maintained).',
      1,
      [...output],
      { output: [...output] }
    );
  }

  for (let i = 0; i < arr.length; i++) {
    arr[i] = output[i];
  }

  tracer.record('done', 24, [], [], 'Counting Sort complete', 'Array sorted in O(n + k) time.', 0, [...arr]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'counting_sort',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

// ---------------------------------------------------------------------------
// SEARCHING TRACERS
// ---------------------------------------------------------------------------

export function traceBinarySearch(rawArr: number[], target: number = 42): ExecutionTrace {
  const arr = [...rawArr].sort((a, b) => a - b);
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  let low = 0;
  let high = arr.length - 1;
  let foundIndex = -1;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    const val = arr[mid];

    tracer.record(
      'visit',
      10,
      [mid],
      [val],
      `Calculate midpoint mid = ${mid} (value = ${val}) for search window [${low}..=${high}]`,
      'Binary search inspects the middle element to divide the search space in half.',
      1,
      [...arr],
      { low, high, mid, target }
    );

    tracer.record(
      'compare',
      13,
      [mid],
      [val, target],
      `Compare arr[${mid}] (${val}) with target (${target})`,
      'Checking equality with target.',
      1,
      [...arr],
      { low, high, mid, target }
    );

    if (val === target) {
      foundIndex = mid;
      tracer.record(
        'done',
        14,
        [mid],
        [val],
        `Target ${target} found at index ${mid}!`,
        'Search successful in O(log n) comparisons.',
        0,
        [...arr],
        { low, high, mid, target, found: true }
      );
      break;
    } else if (val < target) {
      tracer.record(
        'shift',
        16,
        [mid],
        [val],
        `${val} < ${target} → Discard left half, set low = ${mid + 1}`,
        'Because the array is sorted, target cannot exist in the lower half.',
        1,
        [...arr],
        { low: mid + 1, high, mid, target }
      );
      low = mid + 1;
    } else {
      tracer.record(
        'shift',
        21,
        [mid],
        [val],
        `${val} > ${target} → Discard right half, set high = ${mid - 1}`,
        'Because the array is sorted, target cannot exist in the upper half.',
        1,
        [...arr],
        { low, high: mid - 1, mid, target }
      );
      if (mid === 0) break;
      high = mid - 1;
    }
  }

  if (foundIndex === -1) {
    tracer.record(
      'done',
      25,
      [],
      [],
      `Target ${target} was not found in array (returns None)`,
      'Search space exhausted with low > high.',
      0,
      [...arr],
      { target, found: false }
    );
  }

  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'binary_search',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceLinearSearch(rawArr: number[], target: number = 42): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  let foundIndex = -1;
  for (let i = 0; i < arr.length; i++) {
    tracer.record(
      'compare',
      4,
      [i],
      [arr[i], target],
      `Compare arr[${i}] (${arr[i]}) with target (${target})`,
      'Sequentially testing each position without ordering assumptions.',
      1,
      [...arr],
      { i, target }
    );

    if (arr[i] === target) {
      foundIndex = i;
      tracer.record(
        'done',
        5,
        [i],
        [arr[i]],
        `Target ${target} found at index ${i}!`,
        'Linear search succeeded.',
        0,
        [...arr],
        { i, target, found: true }
      );
      break;
    }
  }

  if (foundIndex === -1) {
    tracer.record(
      'done',
      8,
      [],
      [],
      `Target ${target} not found (returns None)`,
      'Traversed entire array.',
      0,
      [...arr],
      { target, found: false }
    );
  }

  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'linear_search',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

// ---------------------------------------------------------------------------
// ARRAYS & STACK / QUEUE TRACERS
// ---------------------------------------------------------------------------

export function traceKadane(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  let currentSum = arr[0];
  let maxSum = arr[0];
  let startIdx = 0;
  let endIdx = 0;
  let tempStart = 0;

  tracer.record(
    'visit',
    6,
    [0],
    [arr[0]],
    `Initialize current_sum = ${arr[0]}, max_sum = ${arr[0]}`,
    "Kadane's algorithm maintains maximum subarray ending at the current index.",
    1,
    [...arr],
    { currentSum, maxSum, startIdx, endIdx }
  );

  for (let i = 1; i < arr.length; i++) {
    const val = arr[i];
    if (val > currentSum + val) {
      currentSum = val;
      tempStart = i;
    } else {
      currentSum += val;
    }

    tracer.record(
      'compare',
      10,
      [i],
      [val, currentSum],
      `Index ${i} (${val}): current_sum = max(${val}, ${currentSum - val} + ${val}) = ${currentSum}`,
      'Deciding whether to extend the existing subarray or start fresh from current index.',
      1,
      [...arr],
      { i, currentSum, maxSum, startIdx, endIdx }
    );

    if (currentSum > maxSum) {
      maxSum = currentSum;
      startIdx = tempStart;
      endIdx = i;
      tracer.record(
        'write',
        11,
        [i],
        [maxSum],
        `New maximum subarray sum found: ${maxSum} [indices ${startIdx}..=${endIdx}]`,
        'Updating global optimal sum.',
        1,
        [...arr],
        { i, currentSum, maxSum, startIdx, endIdx }
      );
    }
  }

  tracer.record(
    'done',
    13,
    [],
    [],
    `Maximum subarray sum is ${maxSum}`,
    `Optimal contiguous range spans index ${startIdx} to ${endIdx}.`,
    0,
    [...arr],
    { currentSum, maxSum, startIdx, endIdx }
  );

  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'kadane',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceReverseArray(rawArr: number[]): ExecutionTrace {
  const arr = [...rawArr];
  const initialState = [...arr];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  let left = 0;
  let right = arr.length - 1;

  while (left < right) {
    tracer.record(
      'compare',
      10,
      [left, right],
      [arr[left], arr[right]],
      `Left pointer at ${left} (${arr[left]}), Right pointer at ${right} (${arr[right]})`,
      'Two pointers moving towards center.',
      1,
      [...arr],
      { low: left, high: right }
    );

    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;

    tracer.record(
      'swap',
      11,
      [left, right],
      [arr[left], arr[right]],
      `Swapped arr[${left}] with arr[${right}]`,
      'Exchanging mirror symmetric indices in-place.',
      1,
      [...arr],
      { low: left, high: right }
    );

    left++;
    right--;
  }

  tracer.record('done', 15, [], [], 'Array reversal complete', 'All mirror indices swapped.', 0, [...arr]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'reverse_array',
    initialState,
    finalState: [...arr],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceStack(rawArr: number[]): ExecutionTrace {
  const input = [...rawArr];
  const stack: number[] = [];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  // Sequence of operations: push all, peek, pop two, push new
  for (const val of input) {
    stack.push(val);
    tracer.record(
      'push',
      13,
      [stack.length - 1],
      [val],
      `push(${val}) onto stack (stack depth = ${stack.length})`,
      'Stack LIFO insertion pushes new item to the top of the vector.',
      1,
      [...stack],
      { stack: [...stack], top: stack.length - 1 }
    );
  }

  // Pop
  if (stack.length > 0) {
    const popped = stack.pop();
    tracer.record(
      'pop',
      17,
      [stack.length],
      [popped!],
      `pop() removed top item ${popped}`,
      'LIFO extraction returns the most recently inserted item.',
      1,
      [...stack],
      { stack: [...stack], top: stack.length - 1 }
    );
  }

  tracer.record('done', 25, [], [], 'Stack operations complete', 'Final stack state captured.', 0, [...stack]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'stack_lifo',
    initialState: input,
    finalState: [...stack],
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceQueue(rawArr: number[]): ExecutionTrace {
  const input = [...rawArr];
  const queue: number[] = [];
  const tracer = new TraceCollector();
  const startTime = performance.now();

  for (const val of input) {
    queue.push(val);
    tracer.record(
      'enqueue',
      14,
      [queue.length - 1],
      [val],
      `enqueue(${val}) to rear of queue`,
      'FIFO insertion appends item to the rear of the ring buffer.',
      1,
      [...queue],
      { queue: [...queue] }
    );
  }

  if (queue.length > 0) {
    const dequeued = queue.shift();
    tracer.record(
      'dequeue',
      18,
      [0],
      [dequeued!],
      `dequeue() removed front item ${dequeued}`,
      'FIFO extraction removes the earliest inserted item from the front.',
      1,
      [...queue],
      { queue: [...queue] }
    );
  }

  tracer.record('done', 22, [], [], 'Queue operations complete', 'Final FIFO state captured.', 0, [...queue]);
  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'queue_fifo',
    initialState: input,
    finalState: [...queue],
    events: tracer.events,
    stats: tracer.stats,
  };
}

// ---------------------------------------------------------------------------
// GRAPH TRACERS (Dijkstra, BFS, DFS)
// ---------------------------------------------------------------------------

export function traceDijkstra(graphData: any): ExecutionTrace {
  const tracer = new TraceCollector();
  const startTime = performance.now();
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];

  const nodeIds: string[] = nodes.map((n: any) => n.id);
  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const visited: Set<string> = new Set();

  nodeIds.forEach((id) => {
    distances[id] = Infinity;
    previous[id] = null;
  });

  const startNode = nodeIds[0] || 'A';
  const targetNode = nodeIds[nodeIds.length - 1] || 'E';
  distances[startNode] = 0;

  tracer.record(
    'visit',
    28,
    [],
    [],
    `Initialize distance to start node ${startNode} as 0, all others as ∞`,
    'Dijkstra priority queue initialization.',
    1,
    { nodes, edges },
    { distances: { ...distances }, visited: [] }
  );

  const pq: { node: string; cost: number }[] = [{ node: startNode, cost: 0 }];

  while (pq.length > 0) {
    pq.sort((a, b) => a.cost - b.cost);
    const { node: u, cost } = pq.shift()!;

    if (visited.has(u)) continue;
    visited.add(u);

    tracer.record(
      'visit',
      33,
      [],
      [u, cost],
      `Extracted node ${u} from PriorityQueue with shortest tentative distance ${cost}`,
      'Selecting unvisited vertex with minimum tentative distance.',
      1,
      { nodes, edges },
      { activeNode: u, currentDistance: cost, distances: { ...distances }, visited: Array.from(visited) }
    );

    // Find neighbors
    const outgoing = edges.filter((e: any) => e.from === u || (!graphData.directed && e.to === u));

    for (const edge of outgoing) {
      const v = edge.from === u ? edge.to : edge.from;
      if (visited.has(v)) continue;

      const alt = cost + edge.weight;
      tracer.record(
        'compare',
        38,
        [],
        [alt, distances[v]],
        `Relax edge ${u} -> ${v} (weight ${edge.weight}): compare candidate distance ${alt} < current distance ${distances[v]}`,
        'Edge relaxation checks if going through u provides a shorter path to v.',
        1,
        { nodes, edges },
        {
          activeNode: u,
          activeEdge: { from: u, to: v },
          distances: { ...distances },
          visited: Array.from(visited),
        }
      );

      if (alt < distances[v]) {
        distances[v] = alt;
        previous[v] = u;
        pq.push({ node: v, cost: alt });
        tracer.record(
          'write',
          40,
          [],
          [alt],
          `Updated distance[${v}] = ${alt} via ${u}`,
          'Found strictly shorter route to node.',
          1,
          { nodes, edges },
          { activeNode: u, distances: { ...distances }, visited: Array.from(visited) }
        );
      }
    }
  }

  // Reconstruct shortest path to target
  const path: string[] = [];
  let curr: string | null = targetNode;
  while (curr) {
    path.unshift(curr);
    curr = previous[curr];
  }

  tracer.record(
    'done',
    45,
    [],
    [],
    `Shortest path from ${startNode} to ${targetNode}: ${path.join(' → ')} (Total Cost: ${distances[targetNode]})`,
    'Dijkstra completed with optimal path.',
    0,
    { nodes, edges },
    { distances: { ...distances }, visited: Array.from(visited), shortestPath: path }
  );

  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'dijkstra',
    initialState: graphData,
    finalState: { distances, shortestPath: path },
    events: tracer.events,
    stats: tracer.stats,
  };
}

export function traceBFS(graphData: any): ExecutionTrace {
  const tracer = new TraceCollector();
  const startTime = performance.now();
  const nodes = graphData.nodes || [];
  const edges = graphData.edges || [];
  const startNode = nodes[0]?.id || 'A';

  const visited = new Set<string>();
  const queue: string[] = [];
  const order: string[] = [];

  visited.add(startNode);
  queue.push(startNode);

  tracer.record(
    'enqueue',
    10,
    [],
    [startNode],
    `Mark start node ${startNode} visited and enqueue`,
    'BFS explores vertices layer-by-layer starting with root.',
    1,
    { nodes, edges },
    { queue: [...queue], visited: Array.from(visited) }
  );

  while (queue.length > 0) {
    const u = queue.shift()!;
    order.push(u);

    tracer.record(
      'dequeue',
      13,
      [],
      [u],
      `Dequeued vertex ${u} (visited order: ${order.join(', ')})`,
      'Processing current level vertex.',
      1,
      { nodes, edges },
      { activeNode: u, queue: [...queue], visited: Array.from(visited) }
    );

    const neighbors = edges
      .filter((e: any) => e.from === u || (!graphData.directed && e.to === u))
      .map((e: any) => (e.from === u ? e.to : e.from));

    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        tracer.record(
          'enqueue',
          16,
          [],
          [v],
          `Discovered unvisited neighbor ${v} from ${u} → enqueue`,
          'Queueing neighbor for next layer expansion.',
          1,
          { nodes, edges },
          { activeNode: u, activeEdge: { from: u, to: v }, queue: [...queue], visited: Array.from(visited) }
        );
      }
    }
  }

  tracer.record(
    'done',
    20,
    [],
    [],
    `BFS completed. Traversal order: ${order.join(' → ')}`,
    'All reachable graph vertices traversed.',
    0,
    { nodes, edges },
    { queue: [], visited: Array.from(visited) }
  );

  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'bfs',
    initialState: graphData,
    finalState: { traversalOrder: order },
    events: tracer.events,
    stats: tracer.stats,
  };
}

// ---------------------------------------------------------------------------
// DYNAMIC PROGRAMMING TRACERS (Knapsack, Coin Change)
// ---------------------------------------------------------------------------

export function traceKnapsack(input: any): ExecutionTrace {
  const capacity = input.capacity || 7;
  const weights = input.weights || [1, 3, 4, 5];
  const values = input.values || [1, 4, 5, 7];
  const n = weights.length;

  const tracer = new TraceCollector();
  const startTime = performance.now();

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  tracer.record(
    'allocate',
    6,
    [],
    [],
    `Allocate DP matrix of size (${n + 1}) × (${capacity + 1})`,
    'dp[i][w] represents max value attainable with first i items and capacity w.',
    1,
    dp,
    { dpGrid: dp, activeCell: [0, 0] }
  );

  for (let i = 1; i <= n; i++) {
    const wt = weights[i - 1];
    const val = values[i - 1];

    for (let w = 1; w <= capacity; w++) {
      if (wt <= w) {
        const withoutItem = dp[i - 1][w];
        const withItem = val + dp[i - 1][w - wt];
        dp[i][w] = Math.max(withoutItem, withItem);

        tracer.record(
          'compare',
          12,
          [],
          [withoutItem, withItem],
          `Item ${i} (wt=${wt}, val=${val}) fits at cap ${w}: max(exclude=${withoutItem}, include=${withItem}) = ${dp[i][w]}`,
          'Optimal substructure decision: choose maximum between including or excluding item.',
          1,
          dp,
          { dpGrid: dp, activeCell: [i, w] }
        );
      } else {
        dp[i][w] = dp[i - 1][w];
        tracer.record(
          'write',
          14,
          [],
          [dp[i][w]],
          `Item ${i} weight (${wt}) exceeds capacity ${w} → copy dp[${i - 1}][${w}] = ${dp[i][w]}`,
          'Item is too heavy to fit into current knapsack subproblem.',
          1,
          dp,
          { dpGrid: dp, activeCell: [i, w] }
        );
      }
    }
  }

  tracer.record(
    'done',
    18,
    [],
    [],
    `Maximum value in knapsack is ${dp[n][capacity]}`,
    'Bottom-up dynamic programming resolved full capacity optimum.',
    0,
    dp,
    { dpGrid: dp, activeCell: [n, capacity] }
  );

  tracer.stats.measuredTimeMs = Number((performance.now() - startTime).toFixed(3));

  return {
    algorithm: 'knapsack_01',
    initialState: input,
    finalState: dp[n][capacity],
    events: tracer.events,
    stats: tracer.stats,
  };
}
