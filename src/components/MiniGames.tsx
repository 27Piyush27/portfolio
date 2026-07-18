import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gamepad2, Play, RotateCcw, Cpu, Sparkles, Activity, Crosshair, Circle, BrainCircuit, Map, ShieldAlert, BarChart3, Code2 } from "lucide-react";
import { NeuroBird } from "@/components/NeuroBird";
import { PathfindingRace } from "@/components/PathfindingRace";
import { AIJailbreak } from "@/components/AIJailbreak";
import { SortingVisualizer } from "@/components/SortingVisualizer";
import { RegexChallenge } from "@/components/RegexChallenge";

// ============================================================
// GAME 1: NEURAL SNAKE (Manual + Auto-Pilot)
// ============================================================
const GRID_SIZE = 20;
const CELL_SIZE = 15;
const WIDTH = GRID_SIZE * CELL_SIZE; // 300
const HEIGHT = GRID_SIZE * CELL_SIZE; // 300

type Point = { x: number; y: number };

const NeuralSnake = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 10 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isAutoPilot, setIsAutoPilot] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  // Pathfinding (A* / Greedy) for AutoPilot
  const getNextAutoMove = (currentSnake: Point[], targetFood: Point): Point => {
    const head = currentSnake[0];
    const dx = targetFood.x - head.x;
    const dy = targetFood.y - head.y;
    
    let preferredDir = { x: 0, y: 0 };
    if (Math.abs(dx) > Math.abs(dy)) {
      preferredDir = { x: Math.sign(dx), y: 0 };
    } else if (Math.abs(dy) > 0) {
      preferredDir = { x: 0, y: Math.sign(dy) };
    } else {
      preferredDir = { x: 1, y: 0 }; // Fallback
    }

    // Basic collision avoidance
    const nextX = head.x + preferredDir.x;
    const nextY = head.y + preferredDir.y;
    const willCollide = nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE || currentSnake.some(s => s.x === nextX && s.y === nextY);
    
    if (willCollide) {
      // Try alternatives
      const alternatives = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
      ];
      for (const alt of alternatives) {
        const nx = head.x + alt.x;
        const ny = head.y + alt.y;
        const safe = nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE && !currentSnake.some(s => s.x === nx && s.y === ny);
        if (safe) return alt;
      }
    }
    
    return preferredDir;
  };

  const spawnFood = (currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
       
      if (!currentSnake.some(s => s.x === newFood.x && s.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  };

  useEffect(() => {
    if (!isPlaying || isGameOver) return;
    
    const speed = isAutoPilot ? 50 : 120;
    
    const interval = setInterval(() => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        let nextDir = directionRef.current;
        
        if (isAutoPilot) {
          nextDir = getNextAutoMove(prevSnake, food);
          setDirection(nextDir);
        }

        const newHead = { x: head.x + nextDir.x, y: head.y + nextDir.y };

        // Collisions
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE || 
          newHead.y < 0 || newHead.y >= GRID_SIZE ||
          prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)
        ) {
          setIsGameOver(true);
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];
        
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 1);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, speed);

    return () => clearInterval(interval);
  }, [isPlaying, isGameOver, isAutoPilot, food, score, highScore]);

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAutoPilot) return;
      const key = e.key;
      const cd = directionRef.current;
      if (key === 'ArrowUp' && cd.y === 0) setDirection({ x: 0, y: -1 });
      if (key === 'ArrowDown' && cd.y === 0) setDirection({ x: 0, y: 1 });
      if (key === 'ArrowLeft' && cd.x === 0) setDirection({ x: -1, y: 0 });
      if (key === 'ArrowRight' && cd.x === 0) setDirection({ x: 1, y: 0 });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAutoPilot]);

  // Mobile Swipe Controls
  const touchStartRef = useRef<{x: number, y: number} | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || isAutoPilot) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const cd = directionRef.current;
    
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && cd.x === 0) setDirection({ x: 1, y: 0 });
      else if (dx < 0 && cd.x === 0) setDirection({ x: -1, y: 0 });
    } else {
      if (dy > 0 && cd.y === 0) setDirection({ x: 0, y: 1 });
      else if (dy < 0 && cd.y === 0) setDirection({ x: 0, y: -1 });
    }
    touchStartRef.current = null;
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    
    // Draw Grid
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= WIDTH; i += CELL_SIZE) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, HEIGHT); ctx.stroke(); }
    for (let i = 0; i <= HEIGHT; i += CELL_SIZE) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(WIDTH, i); ctx.stroke(); }

    // Draw Food
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2, CELL_SIZE/2 - 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw Snake
    snake.forEach((segment, i) => {
      ctx.fillStyle = i === 0 ? "#10b981" : "#34d399";
      if (isAutoPilot) ctx.fillStyle = i === 0 ? "#8b5cf6" : "#a78bfa";
      
      ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    
    // Draw auto-pilot target line
    if (isAutoPilot && !isGameOver) {
      const head = snake[0];
      ctx.beginPath();
      ctx.moveTo(head.x * CELL_SIZE + CELL_SIZE/2, head.y * CELL_SIZE + CELL_SIZE/2);
      ctx.lineTo(food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2);
      ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [snake, food, isAutoPilot, isGameOver]);

  useEffect(() => { draw(); }, [draw]);

  const reset = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 10 });
    setDirection({ x: 1, y: 0 });
    setScore(0);
    setIsGameOver(false);
    setIsPlaying(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {!isPlaying ? (
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all">
            <Play className="h-3 w-3" /> Start Game
          </button>
        ) : (
          <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
            <RotateCcw className="h-3 w-3" /> Restart
          </button>
        )}
        <button onClick={() => setIsAutoPilot(!isAutoPilot)} className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all ${isAutoPilot ? 'bg-accent-violet text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
          <Cpu className="h-3 w-3" /> {isAutoPilot ? 'Auto-Pilot Active' : 'Enable Auto-Pilot'}
        </button>
        
        <div className="ml-auto flex gap-4 text-sm font-medium">
          <span className="text-muted-foreground">Score: <span className="text-foreground">{score}</span></span>
          <span className="text-muted-foreground">Best: <span className="text-foreground">{highScore}</span></span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20 relative flex justify-center items-center py-6 touch-none" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        {isGameOver && (
          <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <h3 className="text-2xl font-bold text-red-500 mb-2">Game Over</h3>
            <p className="text-muted-foreground mb-4">Final Score: {score}</p>
            <button onClick={reset} className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium">Play Again</button>
          </div>
        )}
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="rounded-lg shadow-elegant border border-border/20 bg-background" />
      </div>
    </div>
  );
};

// ============================================================
// GAME 2: CONWAY'S GAME OF LIFE
// ============================================================
const LIFE_GRID = 30;
const LIFE_CELL = 12;
const LIFE_W = LIFE_GRID * LIFE_CELL;
const LIFE_H = LIFE_GRID * LIFE_CELL;

const GameOfLife = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [grid, setGrid] = useState<number[][]>(() => {
    const rows = [];
    for (let i = 0; i < LIFE_GRID; i++) {
      rows.push(Array.from(Array(LIFE_GRID), () => (Math.random() > 0.7 ? 1 : 0)));
    }
    return rows;
  });
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);

  const runSimulation = useCallback(() => {
    if (!isRunning) return;
    
    setGrid(g => {
      const nextGrid = g.map(arr => [...arr]);
      let changed = false;
      
      for (let i = 0; i < LIFE_GRID; i++) {
        for (let j = 0; j < LIFE_GRID; j++) {
          let neighbors = 0;
          // Count live neighbors
          for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
              if (x === 0 && y === 0) continue;
              const r = i + x;
              const c = j + y;
              if (r >= 0 && r < LIFE_GRID && c >= 0 && c < LIFE_GRID) {
                neighbors += g[r][c];
              }
            }
          }
          
          if (g[i][j] === 1 && (neighbors < 2 || neighbors > 3)) {
            nextGrid[i][j] = 0;
            changed = true;
          } else if (g[i][j] === 0 && neighbors === 3) {
            nextGrid[i][j] = 1;
            changed = true;
          }
        }
      }
      
      if (changed) setGeneration(gen => gen + 1);
      else setIsRunning(false); // Stop if stable
      
      return nextGrid;
    });
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(runSimulation, 150);
    return () => clearInterval(interval);
  }, [isRunning, runSimulation]);

  const handleCanvasInteraction = (e: React.MouseEvent | React.TouchEvent) => {
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
    
    const x = (clientX - rect.left) * (LIFE_W / rect.width);
    const y = (clientY - rect.top) * (LIFE_H / rect.height);
    
    const col = Math.floor(x / LIFE_CELL);
    const row = Math.floor(y / LIFE_CELL);
    
    if (row >= 0 && row < LIFE_GRID && col >= 0 && col < LIFE_GRID) {
      const newGrid = [...grid];
      newGrid[row][col] = newGrid[row][col] ? 0 : 1;
      setGrid(newGrid);
    }
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, LIFE_W, LIFE_H);
    
    // Draw cells
    for (let i = 0; i < LIFE_GRID; i++) {
      for (let j = 0; j < LIFE_GRID; j++) {
        if (grid[i][j]) {
          ctx.fillStyle = isDark ? "rgba(45,212,168,0.8)" : "rgba(45,212,168,0.9)";
          ctx.fillRect(j * LIFE_CELL, i * LIFE_CELL, LIFE_CELL - 1, LIFE_CELL - 1);
        }
      }
    }
    
    // Draw grid
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= LIFE_W; i += LIFE_CELL) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, LIFE_H); ctx.stroke(); }
    for (let i = 0; i <= LIFE_H; i += LIFE_CELL) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(LIFE_W, i); ctx.stroke(); }
  }, [grid]);

  useEffect(() => { draw(); }, [draw]);

  const clearGrid = () => {
    setIsRunning(false);
    setGrid(Array.from(Array(LIFE_GRID), () => Array(LIFE_GRID).fill(0)));
    setGeneration(0);
  };

  const randomizeGrid = () => {
    setGrid(Array.from(Array(LIFE_GRID), () => Array.from(Array(LIFE_GRID), () => (Math.random() > 0.7 ? 1 : 0))));
    setGeneration(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setIsRunning(!isRunning)} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all">
          <Play className="h-3 w-3" /> {isRunning ? "Pause" : "Start"}
        </button>
        <button onClick={randomizeGrid} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <Sparkles className="h-3 w-3" /> Randomize
        </button>
        <button onClick={clearGrid} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3" /> Clear
        </button>
        
        <div className="ml-auto text-sm text-muted-foreground font-medium">
          Generation: <span className="text-foreground">{generation}</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20 relative flex justify-center items-center py-6 touch-none">
        <canvas 
          ref={canvasRef} 
          width={LIFE_W} 
          height={LIFE_H} 
          onClick={handleCanvasInteraction}
          onTouchMove={(e) => { e.preventDefault(); handleCanvasInteraction(e); }}
          onTouchStart={(e) => { e.preventDefault(); handleCanvasInteraction(e); }}
          className="rounded-lg shadow-elegant border border-border/20 bg-background cursor-crosshair" 
        />
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Click or drag on the grid to add/remove living cells.</p>
    </div>
  );
};

// ============================================================
// GAME 3: TIC-TAC-TOE (Unbeatable Minimax AI)
// ============================================================
type Player = "X" | "O" | null;

const TicTacToeAI = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<Player | "Draw">(null);

  const checkWinner = (squares: Player[]): Player | "Draw" => {
    const lines = [[0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return squares.includes(null) ? null : "Draw";
  };

  const minimax = (squares: Player[], depth: number, isMaximizing: boolean): number => {
    const result = checkWinner(squares);
    if (result === "O") return 10 - depth;
    if (result === "X") return depth - 10;
    if (result === "Draw") return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "O";
          const score = minimax(squares, depth + 1, false);
          squares[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (!squares[i]) {
          squares[i] = "X";
          const score = minimax(squares, depth + 1, true);
          squares[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const makeAIMove = useCallback(() => {
    if (winner) return;
    let bestScore = -Infinity;
    let move = -1;
    const newBoard = [...board];

    for (let i = 0; i < 9; i++) {
      if (!newBoard[i]) {
        newBoard[i] = "O";
        const score = minimax(newBoard, 0, false);
        newBoard[i] = null;
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }
    }

    if (move !== -1) {
      newBoard[move] = "O";
      setBoard(newBoard);
      setWinner(checkWinner(newBoard));
      setIsPlayerTurn(true);
    }
  }, [board, winner]);

  useEffect(() => {
    if (!isPlayerTurn && !winner) {
      const timer = setTimeout(makeAIMove, 400); // Small delay for realism
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, winner]); // makeAIMove is stable enough, or we can just omit it to avoid infinite loops if it's not memoized properly

  const handleCellClick = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;
    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);
    setWinner(checkWinner(newBoard));
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
  };

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-[300px]">
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <div className="text-sm font-medium">
          {winner ? (
            <span className={winner === "X" ? "text-primary" : winner === "O" ? "text-red-500" : "text-muted-foreground"}>
              {winner === "Draw" ? "It's a Draw!" : winner === "X" ? "You Won! (Impossible)" : "AI Won!"}
            </span>
          ) : (
            <span className="text-muted-foreground">{isPlayerTurn ? "Your Turn (X)" : "AI's Turn (O)"}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-muted/20 p-2 rounded-2xl border border-border/30 shadow-elegant">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={!!cell || !!winner || !isPlayerTurn}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl flex items-center justify-center text-4xl sm:text-5xl transition-all duration-200 ${
              cell ? "bg-background shadow-sm border border-border/20" : "bg-muted/10 hover:bg-muted/30 border border-transparent"
            }`}
          >
            {cell === "X" && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-primary"><Crosshair className="w-12 h-12" /></motion.div>}
            {cell === "O" && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-500"><Circle className="w-12 h-12" /></motion.div>}
          </button>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// GAME 4: AI PONG
// ============================================================
const PONG_W = 400;
const PONG_H = 300;
const PADDLE_W = 10;
const PADDLE_H = 60;
const BALL_SIZE = 10;

const AIPong = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ p1: 0, ai: 0 });
  
  const stateRef = useRef({
    ball: { x: PONG_W / 2, y: PONG_H / 2, dx: 4, dy: 4 },
    p1: { y: PONG_H / 2 - PADDLE_H / 2 },
    ai: { y: PONG_H / 2 - PADDLE_H / 2 }
  });

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, PONG_W, PONG_H);
    
    // Draw net
    ctx.setLineDash([10, 10]);
    ctx.beginPath();
    ctx.moveTo(PONG_W / 2, 0);
    ctx.lineTo(PONG_W / 2, PONG_H);
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.stroke();
    ctx.setLineDash([]);

    const state = stateRef.current;

    // Draw paddles
    ctx.fillStyle = "#10b981";
    ctx.fillRect(10, state.p1.y, PADDLE_W, PADDLE_H);
    
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(PONG_W - 20, state.ai.y, PADDLE_W, PADDLE_H);

    // Draw ball
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(state.ball.x, state.ball.y, BALL_SIZE, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    
    const update = () => {
      if (!isPlaying) {
        draw();
        animationFrameId = requestAnimationFrame(update);
        return;
      }

      const state = stateRef.current;
      
      // Move ball
      state.ball.x += state.ball.dx;
      state.ball.y += state.ball.dy;

      // Wall collision (top/bottom)
      if (state.ball.y <= BALL_SIZE || state.ball.y >= PONG_H - BALL_SIZE) {
        state.ball.dy *= -1;
      }

      // AI Logic (simple tracking)
      const aiSpeed = 3.5;
      if (state.ai.y + PADDLE_H / 2 < state.ball.y) {
        state.ai.y += Math.min(aiSpeed, state.ball.y - (state.ai.y + PADDLE_H / 2));
      } else {
        state.ai.y -= Math.min(aiSpeed, (state.ai.y + PADDLE_H / 2) - state.ball.y);
      }

      // Paddle collision (player - left side)
      if (state.ball.x - BALL_SIZE <= 10 + PADDLE_W && state.ball.dx < 0) {
        if (state.ball.y >= state.p1.y && state.ball.y <= state.p1.y + PADDLE_H) {
          state.ball.dx = Math.abs(state.ball.dx) * 1.05; // speed up slightly, ensure positive direction
          state.ball.dy += (state.ball.y - (state.p1.y + PADDLE_H / 2)) * 0.1;
          state.ball.x = 10 + PADDLE_W + BALL_SIZE; // push ball out of paddle
        }
      }
      // Paddle collision (AI - right side)
      if (state.ball.x + BALL_SIZE >= PONG_W - 20 && state.ball.dx > 0) {
        if (state.ball.y >= state.ai.y && state.ball.y <= state.ai.y + PADDLE_H) {
          state.ball.dx = -Math.abs(state.ball.dx) * 1.05; // ensure negative direction
          state.ball.dy += (state.ball.y - (state.ai.y + PADDLE_H / 2)) * 0.1;
          state.ball.x = PONG_W - 20 - BALL_SIZE; // push ball out of paddle
        }
      }

      // Scoring
      if (state.ball.x < 0) {
        setScore(s => ({ ...s, ai: s.ai + 1 }));
        state.ball = { x: PONG_W / 2, y: PONG_H / 2, dx: 4, dy: 4 };
      } else if (state.ball.x > PONG_W) {
        setScore(s => ({ ...s, p1: s.p1 + 1 }));
        state.ball = { x: PONG_W / 2, y: PONG_H / 2, dx: -4, dy: 4 };
      }

      // Constrain paddles
      state.p1.y = Math.max(0, Math.min(PONG_H - PADDLE_H, state.p1.y));
      state.ai.y = Math.max(0, Math.min(PONG_H - PADDLE_H, state.ai.y));

      draw();
      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPlaying, draw]);

  // Controls
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / rect.height;
      const y = (e.clientY - rect.top) * scaleY;
      stateRef.current.p1.y = y - PADDLE_H / 2;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault(); // prevent scrolling
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const scaleY = canvas.height / rect.height;
      const y = (e.touches[0].clientY - rect.top) * scaleY;
      stateRef.current.p1.y = y - PADDLE_H / 2;
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    }
    
    return () => {
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, []);

  const resetScore = () => {
    setScore({ p1: 0, ai: 0 });
    stateRef.current.ball = { x: PONG_W / 2, y: PONG_H / 2, dx: 4, dy: 4 };
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6 flex flex-col items-center">
      <div className="flex items-center gap-4 w-full max-w-[400px]">
        <button onClick={() => setIsPlaying(!isPlaying)} className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all ${isPlaying ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
          <Play className="h-3 w-3" /> {isPlaying ? "Pause" : "Start Game"}
        </button>
        <button onClick={resetScore} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <div className="ml-auto text-xl font-bold tracking-widest text-foreground">
          <span className="text-primary">{score.p1}</span> <span className="text-muted-foreground opacity-50">-</span> <span className="text-red-500">{score.ai}</span>
        </div>
      </div>
      
      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20 relative p-1 shadow-elegant">
        <canvas 
          ref={canvasRef} 
          width={PONG_W} 
          height={PONG_H} 
          className="rounded-xl bg-[#0f172a] block max-w-full h-auto cursor-ns-resize" 
        />
        <div className="absolute top-2 left-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">Player 1</div>
        <div className="absolute top-2 right-4 text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">AI</div>
      </div>
      <p className="text-[10px] text-muted-foreground text-center">Move your mouse or drag up/down to control the left paddle.</p>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const MiniGames = () => {
  const [activeGame, setActiveGame] = useState<"snake" | "life" | "tictactoe" | "pong" | "neuro" | "path" | "jailbreak" | "sort" | "regex">("jailbreak");

  const games = [
    { id: "jailbreak", title: "LLM Jailbreak", desc: "Use Prompt Injection to hack an AI Vault", icon: <ShieldAlert className="h-5 w-5" /> },
    { id: "neuro", title: "NeuroBird (ML)", desc: "Watch an AI learn to play via Genetic Algorithms", icon: <BrainCircuit className="h-5 w-5" /> },
    { id: "path", title: "Pathfinding Race", desc: "A* Search vs Dijkstra's Algorithm", icon: <Map className="h-5 w-5" /> },
    { id: "sort", title: "Sorting Race", desc: "Bubble vs Quick vs Merge Sort visualized", icon: <BarChart3 className="h-5 w-5" /> },
    { id: "regex", title: "Regex Challenge", desc: "Solve pattern matching puzzles with regex", icon: <Code2 className="h-5 w-5" /> },
    { id: "snake", title: "Neural Snake", desc: "Classic snake with an auto-pilot AI mode", icon: <Gamepad2 className="h-5 w-5" /> },
    { id: "life", title: "Game of Life", desc: "Conway's cellular automaton simulation", icon: <Activity className="h-5 w-5" /> },
    { id: "tictactoe", title: "Minimax Tic-Tac-Toe", desc: "Try to beat an unbeatable AI algorithm", icon: <Crosshair className="h-5 w-5" /> },
    { id: "pong", title: "AI Pong", desc: "Table tennis against an AI opponent", icon: <Circle className="h-5 w-5" /> },
  ] as const;

  const active = games.find(g => g.id === activeGame)!;

  return (
    <section className="py-24 px-6 relative z-10" id="arcade">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Take A Break</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">Mini Arcade</h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Algorithm-driven classic games built with React and HTML5 Canvas.
          </p>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-8 items-start">
          <div className="flex flex-col gap-3">
            {games.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGame(g.id as typeof activeGame)}
                className={`text-left p-4 rounded-2xl transition-all border ${
                  activeGame === g.id
                    ? "bg-primary/5 border-primary/20 shadow-neon"
                    : "bg-muted/30 border-transparent hover:bg-muted/60"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${activeGame === g.id ? 'bg-primary/20 text-primary' : 'bg-background text-muted-foreground'}`}>
                    {g.icon}
                  </div>
                  <h3 className={`font-semibold ${activeGame === g.id ? 'text-primary' : 'text-foreground'}`}>
                    {g.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground">{g.desc}</p>
              </button>
            ))}
          </div>

          <div className="p-6 rounded-[2rem] bg-background/50 border border-border/50 shadow-premium relative overflow-hidden backdrop-blur-sm min-h-[500px]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-accent-violet to-primary opacity-50" />

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-muted/50 border border-border/30 text-foreground/60">
                {active.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold tracking-tight">{active.title}</h3>
                <p className="text-xs text-muted-foreground">{active.desc}</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeGame}
                initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
                transition={{ duration: 0.4 }}
              >
                {activeGame === "jailbreak" && <AIJailbreak />}
                {activeGame === "neuro" && <NeuroBird />}
                {activeGame === "path" && <PathfindingRace />}
                {activeGame === "sort" && <SortingVisualizer />}
                {activeGame === "regex" && <RegexChallenge />}
                {activeGame === "snake" && <NeuralSnake />}
                {activeGame === "life" && <GameOfLife />}
                {activeGame === "tictactoe" && <TicTacToeAI />}
                {activeGame === "pong" && <AIPong />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MiniGames;
