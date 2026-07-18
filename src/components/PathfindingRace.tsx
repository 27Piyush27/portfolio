import { useState, useRef, useEffect, useCallback } from "react";
import { Play, RotateCcw, PenTool, Eraser, Map } from "lucide-react";

const GRID_ROWS = 20;
const GRID_COLS = 30;
const CELL_SIZE = 16;
const W = GRID_COLS * CELL_SIZE;
const H = GRID_ROWS * CELL_SIZE;

type Point = { r: number; c: number };
type CellState = "empty" | "wall" | "start" | "end" | "visitedA" | "visitedD" | "pathA" | "pathD";

class PriorityQueue<T> {
  elements: { item: T; priority: number }[] = [];

  enqueue(item: T, priority: number) {
    this.elements.push({ item, priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }
  dequeue(): T | undefined {
    return this.elements.shift()?.item;
  }
  isEmpty() {
    return this.elements.length === 0;
  }
}

export const PathfindingRace = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<CellState[][]>([]);
  const gridRef = useRef<CellState[][]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [mode, setMode] = useState<"draw" | "erase">("draw");
  const [winner, setWinner] = useState<"A*" | "Dijkstra" | null>(null);

  const startNode: Point = { r: Math.floor(GRID_ROWS / 2), c: 2 };
  const endNode: Point = { r: Math.floor(GRID_ROWS / 2), c: GRID_COLS - 3 };

  // Keep gridRef in sync
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  const initGrid = useCallback(() => {
    const newGrid: CellState[][] = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      const row: CellState[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        if (r === startNode.r && c === startNode.c) row.push("start");
        else if (r === endNode.r && c === endNode.c) row.push("end");
        else row.push("empty");
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setWinner(null);
    setIsSimulating(false);
  }, [startNode.c, startNode.r, endNode.c, endNode.r]);

  useEffect(() => {
    initGrid();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, W, H);
    
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const x = c * CELL_SIZE;
        const y = r * CELL_SIZE;
        
        ctx.strokeStyle = "rgba(255,255,255,0.05)";
        ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);

        const state = grid[r]?.[c];
        if (!state) continue;

        if (state === "wall") {
          ctx.fillStyle = "#334155";
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
        } else if (state === "start") {
          ctx.fillStyle = "#10b981";
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, CELL_SIZE/3, 0, Math.PI*2);
          ctx.fill();
        } else if (state === "end") {
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, CELL_SIZE/3, 0, Math.PI*2);
          ctx.fill();
        } else if (state === "visitedA") {
          ctx.fillStyle = "rgba(139, 92, 246, 0.3)";
          ctx.fillRect(x+1, y+1, CELL_SIZE-2, CELL_SIZE-2);
        } else if (state === "visitedD") {
          ctx.fillStyle = "rgba(56, 189, 248, 0.3)";
          ctx.fillRect(x+1, y+1, CELL_SIZE-2, CELL_SIZE-2);
        } else if (state === "pathA") {
          ctx.fillStyle = "#8b5cf6";
          ctx.fillRect(x+4, y+4, CELL_SIZE-8, CELL_SIZE-8);
        } else if (state === "pathD") {
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(x+4, y+4, CELL_SIZE-8, CELL_SIZE-8);
        }
      }
    }
  }, [grid]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  const handleInteract = (e: React.MouseEvent | React.TouchEvent) => {
    if (isSimulating) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }
    
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    const c = Math.floor(x / CELL_SIZE);
    const r = Math.floor(y / CELL_SIZE);
    
    if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
      if ((r === startNode.r && c === startNode.c) || (r === endNode.r && c === endNode.c)) return;
      
      setGrid(prev => {
        const next = prev.map(row => [...row]);
        next[r][c] = mode === "draw" ? "wall" : "empty";
        return next;
      });
    }
  };

  const startRace = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setWinner(null);
    
    // Clear previous paths but keep walls
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      for (let r=0; r<GRID_ROWS; r++) {
        for (let c=0; c<GRID_COLS; c++) {
          if (next[r][c] !== "wall" && next[r][c] !== "start" && next[r][c] !== "end") {
            next[r][c] = "empty";
          }
        }
      }
      return next;
    });

    await new Promise(r => setTimeout(r, 100)); // small delay to let clear render

    // A* Setup
    const frontierA = new PriorityQueue<Point>();
    frontierA.enqueue(startNode, 0);
    const cameFromA = new Map<string, Point | null>();
    const costSoFarA = new Map<string, number>();
    cameFromA.set(`${startNode.r},${startNode.c}`, null);
    costSoFarA.set(`${startNode.r},${startNode.c}`, 0);

    // Dijkstra Setup
    const frontierD = new PriorityQueue<Point>();
    frontierD.enqueue(startNode, 0);
    const cameFromD = new Map<string, Point | null>();
    const costSoFarD = new Map<string, number>();
    cameFromD.set(`${startNode.r},${startNode.c}`, null);
    costSoFarD.set(`${startNode.r},${startNode.c}`, 0);

    let aFinished = false;
    let dFinished = false;

    const heuristic = (a: Point, b: Point) => Math.abs(a.r - b.r) + Math.abs(a.c - b.c);

    const getNeighbors = (p: Point, gridState: CellState[][]) => {
      const dirs = [[1,0], [-1,0], [0,1], [0,-1]];
      const result: Point[] = [];
      for (const d of dirs) {
        const nr = p.r + d[0];
        const nc = p.c + d[1];
        if (nr >= 0 && nr < GRID_ROWS && nc >= 0 && nc < GRID_COLS && gridState[nr][nc] !== "wall") {
          result.push({r: nr, c: nc});
        }
      }
      return result;
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Race Loop
    const currentGrid = gridRef.current.map(row => [...row]);
    // Clear paths in local copy too
    for (let r=0; r<GRID_ROWS; r++) {
      for (let c=0; c<GRID_COLS; c++) {
        if (currentGrid[r][c] !== "wall" && currentGrid[r][c] !== "start" && currentGrid[r][c] !== "end") {
          currentGrid[r][c] = "empty";
        }
      }
    }

    let aWon = false;
    let dWon = false;

    while (!frontierA.isEmpty() || !frontierD.isEmpty()) {
      let modified = false;

      // A* Step
      if (!aFinished && !frontierA.isEmpty()) {
        const current = frontierA.dequeue()!;
        if (current.r === endNode.r && current.c === endNode.c) {
          aFinished = true;
          aWon = true;
        } else {
          if (currentGrid[current.r][current.c] === "empty") {
            currentGrid[current.r][current.c] = "visitedA";
            modified = true;
          }
          
          const neighbors = getNeighbors(current, currentGrid);
          for (const next of neighbors) {
            const newCost = costSoFarA.get(`${current.r},${current.c}`)! + 1;
            const nextStr = `${next.r},${next.c}`;
            if (!costSoFarA.has(nextStr) || newCost < costSoFarA.get(nextStr)!) {
              costSoFarA.set(nextStr, newCost);
              const priority = newCost + heuristic(endNode, next);
              frontierA.enqueue(next, priority);
              cameFromA.set(nextStr, current);
            }
          }
        }
      }

      // Dijkstra Step (processes 2 nodes per A* step since A* is guided, to make it a visual race)
      for(let i=0; i<2; i++) {
        if (!dFinished && !frontierD.isEmpty()) {
          const current = frontierD.dequeue()!;
          if (current.r === endNode.r && current.c === endNode.c) {
            dFinished = true;
            if (!aWon) dWon = true;
          } else {
            if (currentGrid[current.r][current.c] === "empty") {
              currentGrid[current.r][current.c] = "visitedD";
              modified = true;
            }
            
            const neighbors = getNeighbors(current, currentGrid);
            for (const next of neighbors) {
              const newCost = costSoFarD.get(`${current.r},${current.c}`)! + 1;
              const nextStr = `${next.r},${next.c}`;
              if (!costSoFarD.has(nextStr) || newCost < costSoFarD.get(nextStr)!) {
                costSoFarD.set(nextStr, newCost);
                frontierD.enqueue(next, newCost);
                cameFromD.set(nextStr, current);
              }
            }
          }
        }
      }

      if (modified) {
        setGrid([...currentGrid.map(row => [...row])]);
        await sleep(15);
      }

      if (aFinished && dFinished) break;
    }

    // Draw paths
    const drawPath = async (cameFrom: Map<string, Point|null>, type: "pathA" | "pathD") => {
      let curr = cameFrom.get(`${endNode.r},${endNode.c}`);
      while (curr && (curr.r !== startNode.r || curr.c !== startNode.c)) {
        currentGrid[curr.r][curr.c] = type;
        setGrid([...currentGrid.map(row => [...row])]);
        await sleep(20);
        curr = cameFrom.get(`${curr.r},${curr.c}`);
      }
    };

    if (aFinished) await drawPath(cameFromA, "pathA");
    if (dFinished) await drawPath(cameFromD, "pathD");

    setWinner(aWon ? "A*" : dWon ? "Dijkstra" : null);
    setIsSimulating(false);
  };

  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      <div className="flex flex-wrap items-center justify-between w-full max-w-[480px] gap-2">
        <button onClick={startRace} disabled={isSimulating} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium disabled:opacity-50">
          <Play className="h-3 w-3" /> Start Race
        </button>
        <button onClick={initGrid} disabled={isSimulating} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50">
          <RotateCcw className="h-3 w-3" /> Clear Board
        </button>
        
        <div className="flex gap-2 bg-muted/50 p-1 rounded-full border border-border/50">
          <button onClick={() => setMode("draw")} className={`p-1.5 rounded-full ${mode === "draw" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <PenTool className="h-3 w-3" />
          </button>
          <button onClick={() => setMode("erase")} className={`p-1.5 rounded-full ${mode === "erase" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}>
            <Eraser className="h-3 w-3" />
          </button>
        </div>
      </div>

      {winner && (
        <div className="text-sm font-bold animate-in fade-in zoom-in duration-300">
          Winner: <span className={winner === "A*" ? "text-accent-violet" : "text-blue-400"}>{winner} Search!</span>
        </div>
      )}
      
      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20 relative shadow-elegant touch-none">
        <canvas 
          ref={canvasRef} 
          width={W} 
          height={H} 
          onMouseDown={handleInteract}
          onMouseMove={(e) => { if (e.buttons === 1) handleInteract(e); }}
          onTouchStart={handleInteract}
          onTouchMove={(e) => { e.preventDefault(); handleInteract(e); }}
          className="bg-[#0f172a] block max-w-full h-auto cursor-crosshair" 
        />
        
        <div className="absolute top-2 left-2 flex gap-3 text-[10px] font-mono font-bold">
          <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded backdrop-blur-sm border border-border/50 text-accent-violet"><div className="w-2 h-2 bg-accent-violet rounded-full"/> A*</div>
          <div className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded backdrop-blur-sm border border-border/50 text-blue-400"><div className="w-2 h-2 bg-blue-400 rounded-full"/> Dijkstra</div>
        </div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Draw walls, then race A* Search against Dijkstra's Algorithm.</p>
    </div>
  );
};
