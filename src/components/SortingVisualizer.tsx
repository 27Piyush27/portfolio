import { useState, useRef, useEffect, useCallback } from "react";
import { Play, RotateCcw, Sparkles } from "lucide-react";

// ============================================================
// SORTING ALGORITHM VISUALIZER
// Visual race between Bubble Sort, Quick Sort, and Merge Sort
// ============================================================

const BAR_COUNT = 40;
const CANVAS_W = 480;
const CANVAS_H = 300;

type SortState = {
  array: number[];
  comparing: [number, number] | null;
  sorted: Set<number>;
};

function generateArray(): number[] {
  const arr: number[] = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    arr.push(Math.floor(Math.random() * (CANVAS_H - 20)) + 10);
  }
  return arr;
}

// Generate sorting steps for animation
type SortStep = { array: number[]; comparing: [number, number] | null; sorted: number[] };

function bubbleSortSteps(inputArr: number[]): SortStep[] {
  const arr = [...inputArr];
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  
  for (let i = arr.length - 1; i > 0; i--) {
    for (let j = 0; j < i; j++) {
      steps.push({ array: [...arr], comparing: [j, j + 1], sorted: [...sorted] });
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
    sorted.push(i);
  }
  sorted.push(0);
  steps.push({ array: [...arr], comparing: null, sorted: [...sorted] });
  return steps;
}

function quickSortSteps(inputArr: number[]): SortStep[] {
  const arr = [...inputArr];
  const steps: SortStep[] = [];
  const sorted: number[] = [];

  function partition(low: number, high: number): number {
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      steps.push({ array: [...arr], comparing: [j, high], sorted: [...sorted] });
      if (arr[j] < pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    sorted.push(i + 1);
    return i + 1;
  }

  function qs(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      qs(low, pi - 1);
      qs(pi + 1, high);
    } else if (low === high) {
      sorted.push(low);
    }
  }

  qs(0, arr.length - 1);
  steps.push({ array: [...arr], comparing: null, sorted: Array.from({ length: arr.length }, (_, i) => i) });
  return steps;
}

function mergeSortSteps(inputArr: number[]): SortStep[] {
  const arr = [...inputArr];
  const steps: SortStep[] = [];
  const sorted: number[] = [];

  function merge(left: number, mid: number, right: number) {
    const temp: number[] = [];
    let i = left, j = mid + 1;

    while (i <= mid && j <= right) {
      steps.push({ array: [...arr], comparing: [i, j], sorted: [...sorted] });
      if (arr[i] <= arr[j]) {
        temp.push(arr[i++]);
      } else {
        temp.push(arr[j++]);
      }
    }
    while (i <= mid) temp.push(arr[i++]);
    while (j <= right) temp.push(arr[j++]);

    for (let k = left; k <= right; k++) {
      arr[k] = temp[k - left];
    }
  }

  function ms(left: number, right: number) {
    if (left < right) {
      const mid = Math.floor((left + right) / 2);
      ms(left, mid);
      ms(mid + 1, right);
      merge(left, mid, right);
    } else {
      sorted.push(left);
    }
  }

  ms(0, arr.length - 1);
  steps.push({ array: [...arr], comparing: null, sorted: Array.from({ length: arr.length }, (_, i) => i) });
  return steps;
}

const ALGORITHMS = [
  { name: "Bubble Sort", color: "#ef4444", fn: bubbleSortSteps, complexity: "O(n²)" },
  { name: "Quick Sort", color: "#10b981", fn: quickSortSteps, complexity: "O(n log n)" },
  { name: "Merge Sort", color: "#8b5cf6", fn: mergeSortSteps, complexity: "O(n log n)" },
];

export const SortingVisualizer = () => {
  const canvasRefs = [useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null), useRef<HTMLCanvasElement>(null)];
  const [isRunning, setIsRunning] = useState(false);
  const [baseArray, setBaseArray] = useState(generateArray);
  const [progress, setProgress] = useState([0, 0, 0]); // percentage
  const [winner, setWinner] = useState<string | null>(null);
  const animRef = useRef<number | null>(null);

  const drawArray = useCallback((ctx: CanvasRenderingContext2D, state: SortStep, color: string) => {
    const barW = CANVAS_W / BAR_COUNT;
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    for (let i = 0; i < state.array.length; i++) {
      const h = state.array[i];
      const x = i * barW;
      const y = CANVAS_H - h;

      if (state.sorted.includes(i)) {
        ctx.fillStyle = color;
      } else if (state.comparing && (i === state.comparing[0] || i === state.comparing[1])) {
        ctx.fillStyle = "#facc15"; // Yellow for comparing
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
      }

      ctx.fillRect(x + 1, y, barW - 2, h);
    }
  }, []);

  // Draw initial state
  useEffect(() => {
    canvasRefs.forEach((ref) => {
      const ctx = ref.current?.getContext("2d");
      if (ctx) {
        drawArray(ctx, { array: baseArray, comparing: null, sorted: [] }, "#fff");
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseArray, drawArray]);

  const startSort = () => {
    if (isRunning) return;
    setIsRunning(true);
    setWinner(null);
    setProgress([0, 0, 0]);

    const allSteps = ALGORITHMS.map(algo => algo.fn([...baseArray]));
    const maxLen = Math.max(...allSteps.map(s => s.length));
    let frame = 0;
    const finished = [false, false, false];
    let firstWinner: string | null = null;

    const animate = () => {
      for (let a = 0; a < 3; a++) {
        const steps = allSteps[a];
        const idx = Math.min(frame, steps.length - 1);
        const ctx = canvasRefs[a].current?.getContext("2d");
        if (ctx) {
          drawArray(ctx, steps[idx], ALGORITHMS[a].color);
        }

        if (frame >= steps.length - 1 && !finished[a]) {
          finished[a] = true;
          if (!firstWinner) {
            firstWinner = ALGORITHMS[a].name;
            setWinner(firstWinner);
          }
        }
        
        setProgress(prev => {
          const next = [...prev];
          next[a] = Math.min(100, Math.round((idx / (steps.length - 1)) * 100));
          return next;
        });
      }

      frame++;
      if (frame <= maxLen) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setIsRunning(false);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  };

  const resetAll = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRunning(false);
    setWinner(null);
    setProgress([0, 0, 0]);
    setBaseArray(generateArray());
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={startSort} disabled={isRunning} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50">
          <Play className="h-3 w-3" /> Race!
        </button>
        <button onClick={resetAll} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3" /> Shuffle
        </button>
        {winner && (
          <span className="ml-auto text-xs font-bold animate-in fade-in">
            Winner: <span className="text-primary">{winner}</span>
          </span>
        )}
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {ALGORITHMS.map((algo, i) => (
          <div key={algo.name} className="rounded-xl border border-border/30 bg-muted/10 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: algo.color }} />
                <span className="text-xs font-semibold">{algo.name}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{algo.complexity}</span>
              </div>
              <div className="text-[10px] font-mono text-muted-foreground">{progress[i]}%</div>
            </div>
            <canvas ref={canvasRefs[i]} width={CANVAS_W} height={100} className="bg-[#0f172a] rounded-lg block w-full h-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};
