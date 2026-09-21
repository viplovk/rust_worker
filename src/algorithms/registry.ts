import { AlgorithmDefinition } from '../types';

export const ALGORITHM_REGISTRY: AlgorithmDefinition[] = [
  // ==========================================
  // SORTING
  // ==========================================
  {
    id: 'quick_sort',
    name: 'Quick Sort',
    category: 'sorting',
    difficulty: 'Intermediate',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(log n)',
    auxiliarySpace: 'O(log n) call stack',
    stable: false,
    inPlace: true,
    overview:
      'Quick Sort is an efficient, comparison-based divide-and-conquer algorithm. It selects an element as a pivot and partitions the array around the pivot such that elements less than the pivot are placed before it and greater elements after it.',
    howItWorks: [
      'Choose a pivot element from the subarray (commonly the rightmost element in Lomuto partition).',
      'Initialize a boundary pointer `i` at the low index to track elements smaller than the pivot.',
      'Scan with pointer `j` through the range: whenever `arr[j] <= pivot`, swap `arr[i]` and `arr[j]`, then advance `i`.',
      'Place the pivot into its final sorted position by swapping `arr[i]` and `arr[high]`.',
      'Recursively sort the partitions strictly to the left and right of the placed pivot.',
    ],
    rustConcepts: [
      {
        concept: 'Mutable Slices (&mut [T])',
        explanation:
          'Rust slices represent a view into a contiguous sequence. `&mut [T]` guarantees exclusive, safe in-place mutation without pointer aliasing bugs.',
        codeSnippet: 'fn quick_sort(arr: &mut [i32])',
      },
      {
        concept: 'slice::split_at_mut',
        explanation:
          'To recursively sort left and right partitions concurrently or safely without violating Rust borrow checker rules, `split_at_mut` splits one mutable slice into two disjoint mutable slices.',
        codeSnippet: 'let (left, right) = arr.split_at_mut(mid);',
      },
      {
        concept: 'Slice swap method',
        explanation:
          'Safe in-place swapping via `arr.swap(i, j)` handles simultaneous index reads and writes without temporary copies or unsafe memory operations.',
        codeSnippet: 'arr.swap(i, j);',
      },
    ],
    defaultInput: [42, 17, 8, 91, 23, 56, 4, 73],
    inputFormat: 'array',
    rustSourceCode: `/// Quick Sort implementation in idiomatic Rust using Lomuto partitioning
pub fn quick_sort(arr: &mut [i32]) {
    let len = arr.len();
    if len <= 1 {
        return; // Base case: single element is already sorted
    }
    quick_sort_range(arr, 0, len - 1);
}

fn quick_sort_range(arr: &mut [i32], low: usize, high: usize) {
    if low < high {
        // Partition array around pivot element
        let p = partition(arr, low, high);
        
        // Recurse on left subarray if valid index
        if p > 0 && p > low {
            quick_sort_range(arr, low, p - 1);
        }
        // Recurse on right subarray
        quick_sort_range(arr, p + 1, high);
    }
}

fn partition(arr: &mut [i32], low: usize, high: usize) -> usize {
    let pivot = arr[high]; // Select rightmost element as pivot
    let mut i = low;

    for j in low..high {
        // Compare current element against chosen pivot
        if arr[j] <= pivot {
            if i != j {
                arr.swap(i, j); // Expand smaller element partition
            }
            i += 1;
        }
    }

    // Place pivot in its definitive sorted position
    arr.swap(i, high);
    i // Return partition index
}`,
  },
  {
    id: 'merge_sort',
    name: 'Merge Sort',
    category: 'sorting',
    difficulty: 'Intermediate',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(n)',
    auxiliarySpace: 'O(n) auxiliary buffer',
    stable: true,
    inPlace: false,
    overview:
      'Merge Sort is a stable, divide-and-conquer comparison algorithm. It recursively halves the array until base subarrays of size 1 are reached, then merges the sorted halves using an auxiliary buffer.',
    howItWorks: [
      'Divide the sequence in half by finding the midpoint `mid = len / 2`.',
      'Recursively sort the left subarray and the right subarray.',
      'Merge the two sorted sequences by comparing their front elements sequentially.',
      'Copy the merged ordered sequence back into the original slice.',
    ],
    rustConcepts: [
      {
        concept: 'Vec<T> allocation & buffer borrowing',
        explanation:
          'Merge Sort requires auxiliary space. In Rust, we allocate a reusable buffer `let mut temp = Vec::with_capacity(len)` to avoid reallocating on every recursion depth.',
        codeSnippet: 'let mut buffer = Vec::with_capacity(arr.len());',
      },
      {
        concept: 'slice::copy_from_slice',
        explanation:
          'High-performance vectorized memory copy safely moves ordered merged elements back into the source slice without bounds checking overhead.',
        codeSnippet: 'arr[low..=high].copy_from_slice(&temp);',
      },
    ],
    defaultInput: [38, 27, 43, 3, 9, 82, 10, 19],
    inputFormat: 'array',
    rustSourceCode: `/// Merge Sort implementation in Rust
pub fn merge_sort(arr: &mut [i32]) {
    let n = arr.len();
    if n <= 1 {
        return;
    }
    let mut temp = arr.to_vec(); // Auxiliary allocation
    merge_sort_helper(arr, &mut temp, 0, n - 1);
}

fn merge_sort_helper(arr: &mut [i32], temp: &mut [i32], low: usize, high: usize) {
    if low >= high {
        return;
    }
    let mid = low + (high - low) / 2;
    merge_sort_helper(arr, temp, low, mid);
    merge_sort_helper(arr, temp, mid + 1, high);
    merge(arr, temp, low, mid, high);
}

fn merge(arr: &mut [i32], temp: &mut [i32], low: usize, mid: usize, high: usize) {
    let (mut i, mut j, mut k) = (low, mid + 1, low);

    while i <= mid && j <= high {
        if arr[i] <= arr[j] {
            temp[k] = arr[i];
            i += 1;
        } else {
            temp[k] = arr[j];
            j += 1;
        }
        k += 1;
    }

    while i <= mid {
        temp[k] = arr[i];
        i += 1;
        k += 1;
    }

    while j <= high {
        temp[k] = arr[j];
        j += 1;
        k += 1;
    }

    arr[low..=high].copy_from_slice(&temp[low..=high]);
}`,
  },
  {
    id: 'bubble_sort',
    name: 'Bubble Sort',
    category: 'sorting',
    difficulty: 'Beginner',
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    stable: true,
    inPlace: true,
    overview:
      'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Pass-by-pass, the largest unsorted value "bubbles up" to the end of the array.',
    howItWorks: [
      'Iterate through the array from index 0 to `n - 1`.',
      'Compare each adjacent pair `arr[j]` and `arr[j + 1]`.',
      'If `arr[j] > arr[j + 1]`, swap them and set a swapped flag to true.',
      'If a complete pass completes with no swaps, early terminate because the array is already sorted.',
    ],
    rustConcepts: [
      {
        concept: 'Exclusive borrowing in loops',
        explanation:
          'Iterating with `for j in 0..(n - 1 - i)` maintains strict bounds check safety while mutating via slice indices.',
        codeSnippet: 'arr.swap(j, j + 1);',
      },
    ],
    defaultInput: [64, 34, 25, 12, 22, 11, 90],
    inputFormat: 'array',
    rustSourceCode: `/// Bubble Sort with early-exit optimization in Rust
pub fn bubble_sort(arr: &mut [i32]) {
    let n = arr.len();
    if n <= 1 {
        return;
    }

    for i in 0..n {
        let mut swapped = false;
        for j in 0..(n - 1 - i) {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
                swapped = true;
            }
        }
        if !swapped {
            break; // Array is sorted early
        }
    }
}`,
  },
  {
    id: 'insertion_sort',
    name: 'Insertion Sort',
    category: 'sorting',
    difficulty: 'Beginner',
    bestCase: 'O(n)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    stable: true,
    inPlace: true,
    overview:
      'Insertion Sort builds the final sorted array one item at a time. It consumes elements from the input list sequentially and shifts larger elements to the right to insert the current item into its correct position.',
    howItWorks: [
      'Start from index 1 (as index 0 is trivially sorted).',
      'Store `key = arr[i]`.',
      'Compare `key` with preceding elements `arr[j]`: shift `arr[j]` to `arr[j + 1]` as long as `arr[j] > key`.',
      'Insert `key` into the created gap at `arr[j + 1]`.',
    ],
    rustConcepts: [
      {
        concept: 'Safe underflow prevention with usize',
        explanation:
          'Because Rust index types `usize` cannot be negative, decrementing past zero would panic in debug mode. Rust code uses checked subtraction or loop breaks.',
        codeSnippet: 'while j > 0 && arr[j - 1] > key',
      },
    ],
    defaultInput: [12, 11, 13, 5, 6, 7],
    inputFormat: 'array',
    rustSourceCode: `/// Insertion Sort in Rust with safe usize indexing
pub fn insertion_sort(arr: &mut [i32]) {
    let n = arr.len();
    for i in 1..n {
        let key = arr[i];
        let mut j = i;

        while j > 0 && arr[j - 1] > key {
            arr[j] = arr[j - 1]; // Shift element right
            j -= 1;
        }
        arr[j] = key; // Place key in sorted location
    }
}`,
  },
  {
    id: 'selection_sort',
    name: 'Selection Sort',
    category: 'sorting',
    difficulty: 'Beginner',
    bestCase: 'O(n²)',
    averageCase: 'O(n²)',
    worstCase: 'O(n²)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    stable: false,
    inPlace: true,
    overview:
      'Selection Sort divides the input list into two parts: a sorted sublist built up from left to right and an unsorted sublist. It repeatedly finds the minimum element from the unsorted sublist and swaps it with the leftmost unsorted element.',
    howItWorks: [
      'Iterate through the array with boundary pointer `i`.',
      'Find the index of the minimum element in the range `i..n`.',
      'Swap the found minimum element with `arr[i]`.',
      'Advance boundary pointer `i`.',
    ],
    rustConcepts: [
      {
        concept: 'Min-index search with iterators',
        explanation:
          'Rust iterator patterns like `arr[i..].iter().enumerate().min()` demonstrate functional idioms alongside imperative loops.',
      },
    ],
    defaultInput: [29, 10, 14, 37, 13, 5, 42],
    inputFormat: 'array',
    rustSourceCode: `/// Selection Sort in Rust
pub fn selection_sort(arr: &mut [i32]) {
    let n = arr.len();
    for i in 0..n {
        let mut min_idx = i;
        for j in (i + 1)..n {
            if arr[j] < arr[min_idx] {
                min_idx = j;
            }
        }
        if min_idx != i {
            arr.swap(i, min_idx);
        }
    }
}`,
  },
  {
    id: 'heap_sort',
    name: 'Heap Sort',
    category: 'sorting',
    difficulty: 'Intermediate',
    bestCase: 'O(n log n)',
    averageCase: 'O(n log n)',
    worstCase: 'O(n log n)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    stable: false,
    inPlace: true,
    overview:
      'Heap Sort converts the array in-place into a Max Heap where the root is always the largest element. It repeatedly extracts the maximum root by swapping it to the end of the array and restoring the heap property via sift-down.',
    howItWorks: [
      'Build a max-heap in-place from the bottom up, starting from parent nodes `n/2 - 1` down to 0.',
      'Swap the root `arr[0]` (maximum element) with the last element of the heap `arr[i]`.',
      'Reduce the heap boundary size by 1.',
      'Call heapify (sift-down) on the new root to restore the max-heap property.',
    ],
    rustConcepts: [
      {
        concept: 'std::collections::BinaryHeap vs. in-place slices',
        explanation:
          'While Rust standard library provides `BinaryHeap`, in-place Heap Sort organizes memory directly inside `&mut [T]` without extra heap allocations.',
      },
    ],
    defaultInput: [12, 11, 13, 5, 6, 7, 19, 2],
    inputFormat: 'array',
    rustSourceCode: `/// In-place Max-Heap Sort in Rust
pub fn heap_sort(arr: &mut [i32]) {
    let n = arr.len();
    if n <= 1 {
        return;
    }

    // Step 1: Build max heap
    for i in (0..=(n / 2 - 1)).rev() {
        heapify(arr, n, i);
    }

    // Step 2: Extract elements one by one from heap
    for i in (1..n).rev() {
        arr.swap(0, i); // Move current root to end
        heapify(arr, i, 0); // Restore max heap on reduced heap
    }
}

fn heapify(arr: &mut [i32], heap_size: usize, root: usize) {
    let mut largest = root;
    let left = 2 * root + 1;
    let right = 2 * root + 2;

    if left < heap_size && arr[left] > arr[largest] {
        largest = left;
    }
    if right < heap_size && arr[right] > arr[largest] {
        largest = right;
    }

    if largest != root {
        arr.swap(root, largest);
        heapify(arr, heap_size, largest);
    }
}`,
  },
  {
    id: 'counting_sort',
    name: 'Counting Sort',
    category: 'sorting',
    difficulty: 'Intermediate',
    bestCase: 'O(n + k)',
    averageCase: 'O(n + k)',
    worstCase: 'O(n + k)',
    spaceComplexity: 'O(k)',
    auxiliarySpace: 'O(n + k)',
    stable: true,
    inPlace: false,
    overview:
      'Counting Sort is a non-comparison integer sorting algorithm. It counts the number of occurrences of each distinct value and calculates the cumulative prefix sum of counts to place each element into its exact index.',
    howItWorks: [
      'Find the minimum and maximum values in the input array to determine key range `k`.',
      'Allocate a frequency count vector of size `k + 1`.',
      'Count occurrences of each value.',
      'Compute prefix sums across count array to compute exact output offsets.',
      'Place elements in output array iterating backwards to preserve stability.',
    ],
    rustConcepts: [
      {
        concept: 'usize indexing and bounds mapping',
        explanation:
          'Offset arithmetic `val - min as usize` maps arbitrary positive/negative integer domains into valid Rust vector indices.',
      },
    ],
    defaultInput: [4, 2, 2, 8, 3, 3, 1, 6],
    inputFormat: 'array',
    rustSourceCode: `/// Counting Sort in Rust for non-negative integers
pub fn counting_sort(arr: &mut [i32]) {
    if arr.is_empty() {
        return;
    }
    let min = *arr.iter().min().unwrap();
    let max = *arr.iter().max().unwrap();
    let range = (max - min + 1) as usize;

    let mut count = vec![0usize; range];
    for &val in arr.iter() {
        count[(val - min) as usize] += 1;
    }

    // Cumulative sums for stable offsets
    for i in 1..range {
        count[i] += count[i - 1];
    }

    let mut output = vec![0i32; arr.len()];
    for &val in arr.iter().rev() {
        let idx = (val - min) as usize;
        count[idx] -= 1;
        output[count[idx]] = val;
    }

    arr.copy_from_slice(&output);
}`,
  },

  // ==========================================
  // SEARCHING
  // ==========================================
  {
    id: 'binary_search',
    name: 'Binary Search',
    category: 'searching',
    difficulty: 'Beginner',
    bestCase: 'O(1)',
    averageCase: 'O(log n)',
    worstCase: 'O(log n)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    overview:
      'Binary Search finds the position of a target value within a sorted array. It compares the target value to the middle element and halves the search interval repeatedly.',
    howItWorks: [
      'Initialize `low = 0` and `high = len - 1`.',
      'Calculate middle index using safe overflow prevention: `mid = low + (high - low) / 2`.',
      'If `arr[mid] == target`, search is complete (match found).',
      'If `arr[mid] < target`, narrow search to right half (`low = mid + 1`).',
      'If `arr[mid] > target`, narrow search to left half (`high = mid - 1`).',
    ],
    rustConcepts: [
      {
        concept: 'Option<usize> return type',
        explanation:
          'Rust does not use -1 or null pointers for search misses. Standard idiom is returning `Option<usize>` with `Some(index)` or `None`.',
        codeSnippet: 'fn binary_search(arr: &[i32], target: i32) -> Option<usize>',
      },
      {
        concept: 'Overflow-safe midpoint computation',
        explanation:
          '`low + (high - low) / 2` avoids integer overflow bugs common in `(low + high) / 2`.',
      },
    ],
    defaultInput: [4, 8, 17, 23, 42, 56, 73, 91],
    inputFormat: 'search_array',
    rustSourceCode: `/// Binary Search in Rust returning Option<usize>
pub fn binary_search(arr: &[i32], target: i32) -> Option<usize> {
    if arr.is_empty() {
        return None;
    }
    let mut low = 0usize;
    let mut high = arr.len() - 1;

    while low <= high {
        let mid = low + (high - low) / 2; // Prevent integer overflow
        let val = arr[mid];

        if val == target {
            return Some(mid); // Found target
        } else if val < target {
            low = mid + 1; // Discard left half
        } else {
            if mid == 0 {
                break; // Prevent underflow on high = mid - 1
            }
            high = mid - 1; // Discard right half
        }
    }
    None // Target not found
}`,
  },
  {
    id: 'linear_search',
    name: 'Linear Search',
    category: 'searching',
    difficulty: 'Beginner',
    bestCase: 'O(1)',
    averageCase: 'O(n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    overview:
      'Linear Search sequentially checks each element of the list until a match is found or the whole list has been searched. It requires no ordering assumptions on the input data.',
    howItWorks: [
      'Iterate through array from index 0 to `len - 1`.',
      'At each index, compare element with target value.',
      'If match, return `Some(index)`.',
      'If reached end without match, return `None`.',
    ],
    rustConcepts: [
      {
        concept: 'Iterator::position method',
        explanation:
          'In Rust, standard search on a slice is often written functionally via `arr.iter().position(|&x| x == target)`.',
      },
    ],
    defaultInput: [19, 42, 7, 88, 3, 56, 12],
    inputFormat: 'search_array',
    rustSourceCode: `/// Linear Search in Rust
pub fn linear_search(arr: &[i32], target: i32) -> Option<usize> {
    for (index, &value) in arr.iter().enumerate() {
        if value == target {
            return Some(index);
        }
    }
    None
}`,
  },

  // ==========================================
  // ARRAYS
  // ==========================================
  {
    id: 'kadane',
    name: "Kadane's Algorithm",
    category: 'arrays',
    difficulty: 'Intermediate',
    bestCase: 'O(n)',
    averageCase: 'O(n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    overview:
      "Kadane's Algorithm scans the given array from left to right and at the i-th position, calculates the maximum subarray sum ending at that position in linear time.",
    howItWorks: [
      'Maintain `current_sum` (max sum ending at current position) and `max_so_far`.',
      'For each number: `current_sum = max(num, current_sum + num)`.',
      'Update `max_so_far = max(max_so_far, current_sum)`.',
      'Tracks optimal start and end subarray bounds alongside sum.',
    ],
    rustConcepts: [
      {
        concept: 'std::cmp::max on primitives',
        explanation:
          'Using `max()` from standard library provides clear, branchless intent while updating state trackers.',
      },
    ],
    defaultInput: [-2, 1, -3, 4, -1, 2, 1, -5, 4],
    inputFormat: 'array',
    rustSourceCode: `/// Kadane's Maximum Subarray Algorithm in Rust
pub fn max_sub_array(arr: &[i32]) -> i32 {
    if arr.is_empty() {
        return 0;
    }
    let mut current_sum = arr[0];
    let mut max_sum = arr[0];

    for &val in arr.iter().skip(1) {
        current_sum = std::cmp::max(val, current_sum + val);
        max_sum = std::cmp::max(max_sum, current_sum);
    }
    max_sum
}`,
  },
  {
    id: 'reverse_array',
    name: 'Array Reversal',
    category: 'arrays',
    difficulty: 'Beginner',
    bestCase: 'O(n)',
    averageCase: 'O(n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(1)',
    auxiliarySpace: 'O(1)',
    overview:
      'In-place array reversal using two pointers moving towards the center, swapping elements until they meet.',
    howItWorks: [
      'Place pointer `left = 0` and `right = len - 1`.',
      'While `left < right`, swap elements at `left` and `right`.',
      'Increment `left`, decrement `right`.',
    ],
    rustConcepts: [
      {
        concept: 'slice::reverse method',
        explanation: 'Rust provides built-in `arr.reverse()` optimized with SIMD and pointer arithmetic.',
      },
    ],
    defaultInput: [1, 2, 3, 4, 5, 6, 7, 8],
    inputFormat: 'array',
    rustSourceCode: `/// Two-pointer in-place array reversal in Rust
pub fn reverse_slice(arr: &mut [i32]) {
    if arr.len() <= 1 {
        return;
    }
    let mut left = 0;
    let mut right = arr.len() - 1;

    while left < right {
        arr.swap(left, right);
        left += 1;
        right -= 1;
    }
}`,
  },

  // ==========================================
  // STACK & QUEUE
  // ==========================================
  {
    id: 'stack_lifo',
    name: 'Stack (LIFO)',
    category: 'stack_queue',
    difficulty: 'Beginner',
    bestCase: 'O(1)',
    averageCase: 'O(1)',
    worstCase: 'O(1)',
    spaceComplexity: 'O(n)',
    auxiliarySpace: 'O(1)',
    overview:
      'A Stack is a Last-In, First-Out (LIFO) linear data structure. Elements can only be added (pushed) or removed (popped) from the top of the stack.',
    howItWorks: [
      'Push adds an element to the top.',
      'Pop removes and returns the most recently added top element.',
      'Peek inspects the current top element without removing it.',
    ],
    rustConcepts: [
      {
        concept: 'Vec as standard Stack',
        explanation:
          'In Rust, `Vec<T>` implements amortized O(1) `push()` and `pop()` directly returning `Option<T>`.',
        codeSnippet: 'let mut stack: Vec<i32> = Vec::new();\nstack.push(10);\nlet top = stack.pop();',
      },
    ],
    defaultInput: [10, 20, 30, 40, 50],
    inputFormat: 'array',
    rustSourceCode: `/// Idiomatic LIFO Stack in Rust using Vec<T>
pub struct Stack<T> {
    elements: Vec<T>,
}

impl<T> Stack<T> {
    pub fn new() -> Self {
        Stack { elements: Vec::new() }
    }

    pub fn push(&mut self, item: T) {
        self.elements.push(item);
    }

    pub fn pop(&mut self) -> Option<T> {
        self.elements.pop()
    }

    pub fn peek(&self) -> Option<&T> {
        self.elements.last()
    }

    pub fn len(&self) -> usize {
        self.elements.len()
    }
}`,
  },
  {
    id: 'queue_fifo',
    name: 'Queue (FIFO)',
    category: 'stack_queue',
    difficulty: 'Beginner',
    bestCase: 'O(1)',
    averageCase: 'O(1)',
    worstCase: 'O(1)',
    spaceComplexity: 'O(n)',
    auxiliarySpace: 'O(1)',
    overview:
      'A Queue is a First-In, First-Out (FIFO) linear data structure. Elements are enqueued at the back and dequeued from the front.',
    howItWorks: [
      'Enqueue appends an item to the rear of the queue.',
      'Dequeue removes the earliest added item from the front.',
    ],
    rustConcepts: [
      {
        concept: 'std::collections::VecDeque',
        explanation:
          'Rust standard library includes `VecDeque<T>`, a double-ended queue implemented with a growable ring buffer for O(1) front and back operations.',
        codeSnippet: 'use std::collections::VecDeque;\nlet mut q = VecDeque::new();',
      },
    ],
    defaultInput: [10, 20, 30, 40, 50],
    inputFormat: 'array',
    rustSourceCode: `use std::collections::VecDeque;

/// FIFO Queue using Rust's ring-buffered VecDeque
pub struct Queue<T> {
    ring: VecDeque<T>,
}

impl<T> Queue<T> {
    pub fn new() -> Self {
        Queue { ring: VecDeque::new() }
    }

    pub fn enqueue(&mut self, item: T) {
        self.ring.push_back(item);
    }

    pub fn dequeue(&mut self) -> Option<T> {
        self.ring.pop_front()
    }

    pub fn front(&self) -> Option<&T> {
        self.ring.front()
    }
}`,
  },

  // ==========================================
  // TREES
  // ==========================================
  {
    id: 'bst_search_insert',
    name: 'Binary Search Tree',
    category: 'trees',
    difficulty: 'Intermediate',
    bestCase: 'O(log n)',
    averageCase: 'O(log n)',
    worstCase: 'O(n)',
    spaceComplexity: 'O(n)',
    auxiliarySpace: 'O(h) stack',
    overview:
      'A Binary Search Tree (BST) maintains the invariant that for every node, all values in its left subtree are strictly smaller and all values in its right subtree are strictly greater.',
    howItWorks: [
      'To search: compare target with current node. If equal, found. If smaller, move left. If larger, move right.',
      'To insert: follow search path until a null child is reached, then link the new node.',
    ],
    rustConcepts: [
      {
        concept: 'Option<Box<TreeNode>>',
        explanation:
          'Because Rust requires types to have known size at compile time, recursive structures require indirection via heap allocation (`Box<T>`).',
        codeSnippet: 'type Link<T> = Option<Box<TreeNode<T>>>;',
      },
    ],
    defaultInput: [50, 30, 70, 20, 40, 60, 80],
    inputFormat: 'array',
    rustSourceCode: `/// Binary Search Tree node in Rust using Option<Box<Node>>
pub struct Node<T: Ord> {
    pub val: T,
    pub left: Option<Box<Node<T>>>,
    pub right: Option<Box<Node<T>>>,
}

impl<T: Ord> Node<T> {
    pub fn new(val: T) -> Self {
        Node { val, left: None, right: None }
    }

    pub fn insert(&mut self, new_val: T) {
        if new_val < self.val {
            match self.left {
                Some(ref mut child) => child.insert(new_val),
                None => self.left = Some(Box::new(Node::new(new_val))),
            }
        } else if new_val > self.val {
            match self.right {
                Some(ref mut child) => child.insert(new_val),
                None => self.right = Some(Box::new(Node::new(new_val))),
            }
        }
    }

    pub fn search(&self, target: &T) -> bool {
        if target == &self.val {
            true
        } else if target < &self.val {
            self.left.as_ref().map_or(false, |c| c.search(target))
        } else {
            self.right.as_ref().map_or(false, |c| c.search(target))
        }
    }
}`,
  },

  // ==========================================
  // GRAPHS
  // ==========================================
  {
    id: 'dijkstra',
    name: "Dijkstra's Shortest Path",
    category: 'graphs',
    difficulty: 'Advanced',
    bestCase: 'O((V + E) log V)',
    averageCase: 'O((V + E) log V)',
    worstCase: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    auxiliarySpace: 'O(V) distances + priority queue',
    overview:
      "Dijkstra's algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights using a min-priority queue.",
    howItWorks: [
      'Initialize distance to source node as 0 and all other nodes to infinity.',
      'Push `(0, start_node)` into a min-priority queue.',
      'Pop node `u` with the smallest known tentative distance.',
      'Relax all outgoing edges `(u, v, weight)`: if `dist[u] + weight < dist[v]`, update `dist[v]` and push `v` into the queue.',
      'Repeat until the priority queue is empty.',
    ],
    rustConcepts: [
      {
        concept: 'BinaryHeap with Reverse<T>',
        explanation:
          "Rust's `std::collections::BinaryHeap` is a max-heap by default. We wrap entries in `std::cmp::Reverse` or implement `Ord` to convert it into a min-heap for Dijkstra.",
        codeSnippet: 'use std::collections::BinaryHeap;\nlet mut pq = BinaryHeap::new();',
      },
    ],
    defaultInput: {
      nodes: [
        { id: 'A', label: 'A (Start)', x: 80, y: 150 },
        { id: 'B', label: 'B', x: 220, y: 70 },
        { id: 'C', label: 'C', x: 220, y: 230 },
        { id: 'D', label: 'D', x: 380, y: 70 },
        { id: 'E', label: 'E (Target)', x: 480, y: 150 },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 4 },
        { from: 'A', to: 'C', weight: 2 },
        { from: 'B', to: 'C', weight: 1 },
        { from: 'B', to: 'D', weight: 5 },
        { from: 'C', to: 'D', weight: 8 },
        { from: 'C', to: 'E', weight: 10 },
        { from: 'D', to: 'E', weight: 2 },
      ],
      directed: false,
    },
    inputFormat: 'graph',
    rustSourceCode: `use std::cmp::Ordering;
use std::collections::BinaryHeap;

#[derive(Copy, Clone, Eq, PartialEq)]
struct State {
    cost: usize,
    node: usize,
}

// Invert ordering so BinaryHeap becomes a min-heap
impl Ord for State {
    fn cmp(&self, other: &Self) -> Ordering {
        other.cost.cmp(&self.cost)
    }
}
impl PartialOrd for State {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

pub fn dijkstra(adj: &[Vec<(usize, usize)>], start: usize) -> Vec<usize> {
    let mut dist = vec![usize::MAX; adj.len()];
    let mut heap = BinaryHeap::new();

    dist[start] = 0;
    heap.push(State { cost: 0, node: start });

    while let Some(State { cost, node }) = heap.pop() {
        if cost > dist[node] {
            continue;
        }
        for &(next_node, weight) in &adj[node] {
            let next_cost = cost + weight;
            if next_cost < dist[next_node] {
                dist[next_node] = next_cost;
                heap.push(State { cost: next_cost, node: next_node });
            }
        }
    }
    dist
}`,
  },
  {
    id: 'bfs',
    name: 'Breadth-First Search (BFS)',
    category: 'graphs',
    difficulty: 'Intermediate',
    bestCase: 'O(V + E)',
    averageCase: 'O(V + E)',
    worstCase: 'O(V + E)',
    spaceComplexity: 'O(V)',
    auxiliarySpace: 'O(V) visited set + queue',
    overview:
      'BFS explores graph vertices layer-by-layer starting from a root node. It uses a FIFO queue to visit all immediate neighbors before proceeding to the next level.',
    howItWorks: [
      'Mark the starting vertex as visited and push it into a queue.',
      'While the queue is not empty, dequeue front vertex `u`.',
      'For each unvisited neighbor `v` of `u`, mark `v` as visited and enqueue it.',
    ],
    rustConcepts: [
      {
        concept: 'HashSet for visited membership',
        explanation: '`std::collections::HashSet` ensures O(1) expected visited checks.',
      },
    ],
    defaultInput: {
      nodes: [
        { id: 'A', label: 'A', x: 80, y: 150 },
        { id: 'B', label: 'B', x: 220, y: 70 },
        { id: 'C', label: 'C', x: 220, y: 230 },
        { id: 'D', label: 'D', x: 380, y: 70 },
        { id: 'E', label: 'E', x: 480, y: 150 },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 1 },
        { from: 'A', to: 'C', weight: 1 },
        { from: 'B', to: 'D', weight: 1 },
        { from: 'C', to: 'D', weight: 1 },
        { from: 'D', to: 'E', weight: 1 },
      ],
      directed: false,
    },
    inputFormat: 'graph',
    rustSourceCode: `use std::collections::{HashSet, VecDeque};

/// Breadth-First Search in Rust
pub fn bfs(adj: &[Vec<usize>], start: usize) -> Vec<usize> {
    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    let mut order = Vec::new();

    visited.insert(start);
    queue.push_back(start);

    while let Some(u) = queue.pop_front() {
        order.push(u);
        for &v in &adj[u] {
            if visited.insert(v) {
                queue.push_back(v);
            }
        }
    }
    order
}`,
  },
  {
    id: 'dfs',
    name: 'Depth-First Search (DFS)',
    category: 'graphs',
    difficulty: 'Intermediate',
    bestCase: 'O(V + E)',
    averageCase: 'O(V + E)',
    worstCase: 'O(V + E)',
    spaceComplexity: 'O(V)',
    auxiliarySpace: 'O(V) call stack',
    overview:
      'DFS traverses a graph by exploring as far as possible along each branch before backtracking.',
    howItWorks: [
      'Mark the current vertex as visited.',
      'Recursively visit each unvisited adjacent vertex.',
      'Backtrack when no unvisited neighbor remains.',
    ],
    rustConcepts: [
      {
        concept: 'Recursion with mutable slice borrows',
        explanation: 'Passing `&mut [bool]` visited slice down the call tree.',
      },
    ],
    defaultInput: {
      nodes: [
        { id: 'A', label: 'A', x: 80, y: 150 },
        { id: 'B', label: 'B', x: 220, y: 70 },
        { id: 'C', label: 'C', x: 220, y: 230 },
        { id: 'D', label: 'D', x: 380, y: 70 },
        { id: 'E', label: 'E', x: 480, y: 150 },
      ],
      edges: [
        { from: 'A', to: 'B', weight: 1 },
        { from: 'A', to: 'C', weight: 1 },
        { from: 'B', to: 'D', weight: 1 },
        { from: 'C', to: 'D', weight: 1 },
        { from: 'D', to: 'E', weight: 1 },
      ],
      directed: false,
    },
    inputFormat: 'graph',
    rustSourceCode: `/// Recursive Depth-First Search in Rust
pub fn dfs(adj: &[Vec<usize>], start: usize) -> Vec<usize> {
    let mut visited = vec![false; adj.len()];
    let mut order = Vec::new();
    dfs_visit(adj, start, &mut visited, &mut order);
    order
}

fn dfs_visit(adj: &[Vec<usize>], u: usize, visited: &mut [bool], order: &mut Vec<usize>) {
    visited[u] = true;
    order.push(u);

    for &v in &adj[u] {
        if !visited[v] {
            dfs_visit(adj, v, visited, order);
        }
    }
}`,
  },

  // ==========================================
  // DYNAMIC PROGRAMMING
  // ==========================================
  {
    id: 'knapsack_01',
    name: '0/1 Knapsack Problem',
    category: 'dp',
    difficulty: 'Advanced',
    bestCase: 'O(n · W)',
    averageCase: 'O(n · W)',
    worstCase: 'O(n · W)',
    spaceComplexity: 'O(n · W)',
    auxiliarySpace: 'O(n · W) DP table or O(W) 1D',
    overview:
      'Given weights and values of n items, determine the maximum value that can fit into a knapsack of capacity W without dividing items.',
    howItWorks: [
      'Construct a 2D table `dp[i][w]` where `i` is items considered and `w` is remaining capacity.',
      'If item weight exceeds capacity: `dp[i][w] = dp[i-1][w]`.',
      'Otherwise: `dp[i][w] = max(dp[i-1][w], val[i] + dp[i-1][w - wt[i]])`.',
    ],
    rustConcepts: [
      {
        concept: '2D vectors vs flat 1D buffer',
        explanation: 'Using `vec![vec![0; capacity + 1]; n + 1]` in Rust.',
      },
    ],
    defaultInput: {
      capacity: 7,
      weights: [1, 3, 4, 5],
      values: [1, 4, 5, 7],
    },
    inputFormat: 'dp_knapsack',
    rustSourceCode: `/// 0/1 Knapsack dynamic programming in Rust
pub fn knapsack_01(capacity: usize, weights: &[usize], values: &[usize]) -> usize {
    let n = weights.len();
    let mut dp = vec![vec![0usize; capacity + 1]; n + 1];

    for i in 1..=n {
        let wt = weights[i - 1];
        let val = values[i - 1];
        for w in 1..=capacity {
            if wt <= w {
                dp[i][w] = std::cmp::max(dp[i - 1][w], val + dp[i - 1][w - wt]);
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    dp[n][capacity]
}`,
  },
  {
    id: 'coin_change',
    name: 'Coin Change (Min Coins)',
    category: 'dp',
    difficulty: 'Intermediate',
    bestCase: 'O(amount · c)',
    averageCase: 'O(amount · c)',
    worstCase: 'O(amount · c)',
    spaceComplexity: 'O(amount)',
    auxiliarySpace: 'O(amount)',
    overview:
      'Calculates the minimum number of coins needed to make up a given target amount using unlimited quantities of given coin denominations.',
    howItWorks: [
      'Create a 1D DP array of size `amount + 1` filled with infinity, with `dp[0] = 0`.',
      'For each amount from 1 to `target`: check each coin denomination.',
      'If `coin <= amount`: `dp[amount] = min(dp[amount], 1 + dp[amount - coin])`.',
    ],
    rustConcepts: [
      {
        concept: 'Saturating arithmetic',
        explanation: 'Avoids integer overflows when adding 1 to uninitialized sentinel values.',
      },
    ],
    defaultInput: [1, 2, 5],
    inputFormat: 'array',
    rustSourceCode: `/// Coin Change in Rust
pub fn coin_change(coins: &[usize], amount: usize) -> Option<usize> {
    let mut dp = vec![usize::MAX; amount + 1];
    dp[0] = 0;

    for i in 1..=amount {
        for &coin in coins {
            if coin <= i && dp[i - coin] != usize::MAX {
                dp[i] = std::cmp::min(dp[i], dp[i - coin] + 1);
            }
        }
    }

    if dp[amount] == usize::MAX { None } else { Some(dp[amount]) }
}`,
  },
];
