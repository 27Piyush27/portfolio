import { useState, useRef, useEffect, useCallback } from "react";
import { Play, RotateCcw, BrainCircuit } from "lucide-react";

// ============================================================
// LIGHTWEIGHT NEURAL NETWORK & GENETIC ALGORITHM
// ============================================================

class NeuralNetwork {
  inputNodes: number;
  hiddenNodes: number;
  outputNodes: number;
  weights_ih: number[][]; // Weights from input to hidden
  weights_ho: number[][]; // Weights from hidden to output
  bias_h: number[];
  bias_o: number[];

  constructor(inNodes: number, hidNodes: number, outNodes: number) {
    this.inputNodes = inNodes;
    this.hiddenNodes = hidNodes;
    this.outputNodes = outNodes;

    // Initialize with random weights between -1 and 1
    this.weights_ih = Array(this.hiddenNodes).fill(0).map(() => Array(this.inputNodes).fill(0).map(() => Math.random() * 2 - 1));
    this.weights_ho = Array(this.outputNodes).fill(0).map(() => Array(this.hiddenNodes).fill(0).map(() => Math.random() * 2 - 1));
    this.bias_h = Array(this.hiddenNodes).fill(0).map(() => Math.random() * 2 - 1);
    this.bias_o = Array(this.outputNodes).fill(0).map(() => Math.random() * 2 - 1);
  }

  // Sigmoid activation
  private sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
  }

  predict(inputs: number[]) {
    // Hidden layer
    const hidden = [];
    for (let i = 0; i < this.hiddenNodes; i++) {
      let sum = 0;
      for (let j = 0; j < this.inputNodes; j++) {
        sum += inputs[j] * this.weights_ih[i][j];
      }
      sum += this.bias_h[i];
      hidden.push(this.sigmoid(sum));
    }

    // Output layer
    const outputs = [];
    for (let i = 0; i < this.outputNodes; i++) {
      let sum = 0;
      for (let j = 0; j < this.hiddenNodes; j++) {
        sum += hidden[j] * this.weights_ho[i][j];
      }
      sum += this.bias_o[i];
      outputs.push(this.sigmoid(sum));
    }

    return outputs;
  }

  copy() {
    const nn = new NeuralNetwork(this.inputNodes, this.hiddenNodes, this.outputNodes);
    nn.weights_ih = this.weights_ih.map(row => [...row]);
    nn.weights_ho = this.weights_ho.map(row => [...row]);
    nn.bias_h = [...this.bias_h];
    nn.bias_o = [...this.bias_o];
    return nn;
  }

  mutate(rate: number) {
    const mutateFunc = (val: number) => {
      if (Math.random() < rate) {
        return val + (Math.random() * 0.2 - 0.1); // Adjust weight by up to ±0.1
      }
      return val;
    };

    this.weights_ih = this.weights_ih.map(row => row.map(mutateFunc));
    this.weights_ho = this.weights_ho.map(row => row.map(mutateFunc));
    this.bias_h = this.bias_h.map(mutateFunc);
    this.bias_o = this.bias_o.map(mutateFunc);
  }
}

// ============================================================
// GAME LOGIC & RENDERING
// ============================================================

const BIRD_RADIUS = 12;
const GRAVITY = 0.6;
const LIFT = -10;
const CANVAS_W = 400;
const CANVAS_H = 400;
const PIPE_WIDTH = 40;
const PIPE_SPEED = 3;
const POPULATION = 50;

class Bird {
  y = CANVAS_H / 2;
  x = 64;
  velocity = 0;
  brain: NeuralNetwork;
  score = 0;
  fitness = 0;
  dead = false;

  constructor(brain?: NeuralNetwork) {
    if (brain) {
      this.brain = brain.copy();
    } else {
      // Inputs: Bird Y, Bird Velocity, Pipe X, Top Pipe Y, Bottom Pipe Y
      this.brain = new NeuralNetwork(5, 8, 1);
    }
  }

  up() {
    this.velocity = LIFT;
  }

  think(pipes: Pipe[]) {
    // Find closest pipe ahead
    let closest = null;
    let closestD = Infinity;
    for (let i = 0; i < pipes.length; i++) {
      const d = (pipes[i].x + PIPE_WIDTH) - this.x;
      if (d > 0 && d < closestD) {
        closest = pipes[i];
        closestD = d;
      }
    }

    if (closest != null) {
      // Normalize inputs between 0 and 1
      const inputs = [];
      inputs[0] = this.y / CANVAS_H;
      inputs[1] = (this.velocity + 20) / 40; // Normalize velocity
      inputs[2] = closest.x / CANVAS_W;
      inputs[3] = closest.top / CANVAS_H;
      inputs[4] = closest.bottom / CANVAS_H;

      const output = this.brain.predict(inputs);
      if (output[0] > 0.5) {
        this.up();
      }
    }
  }

  update() {
    this.score++;
    this.velocity += GRAVITY;
    this.y += this.velocity;

    // Hit floor or ceiling
    if (this.y > CANVAS_H - BIRD_RADIUS || this.y < BIRD_RADIUS) {
      this.dead = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D, isBest: boolean) {
    ctx.fillStyle = isBest ? "rgba(16, 185, 129, 0.9)" : "rgba(16, 185, 129, 0.2)";
    ctx.beginPath();
    ctx.arc(this.x, this.y, BIRD_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    if (isBest) {
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

class Pipe {
  x = CANVAS_W;
  spacing = 110;
  top: number;
  bottom: number;

  constructor() {
    this.top = Math.random() * (CANVAS_H / 2) + 20;
    this.bottom = this.top + this.spacing;
  }

  update() {
    this.x -= PIPE_SPEED;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#334155";
    // Top pipe
    ctx.fillRect(this.x, 0, PIPE_WIDTH, this.top);
    // Bottom pipe
    ctx.fillRect(this.x, this.bottom, PIPE_WIDTH, CANVAS_H - this.bottom);
  }

  hits(bird: Bird) {
    if (bird.y - BIRD_RADIUS < this.top || bird.y + BIRD_RADIUS > this.bottom) {
      if (bird.x + BIRD_RADIUS > this.x && bird.x - BIRD_RADIUS < this.x + PIPE_WIDTH) {
        return true;
      }
    }
    return false;
  }
}

export const NeuroBird = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(1);
  const [maxScore, setMaxScore] = useState(0);
  const [aliveCount, setAliveCount] = useState(POPULATION);

  const state = useRef({
    birds: [] as Bird[],
    savedBirds: [] as Bird[],
    pipes: [] as Pipe[],
    counter: 0,
    bestScore: 0,
  });

  // Genetic Algorithm
  const nextGeneration = useCallback(() => {
    state.current.pipes = [];
    state.current.counter = 0;
    
    // Calculate fitness
    let sum = 0;
    for (const bird of state.current.savedBirds) {
      sum += bird.score;
    }
    for (const bird of state.current.savedBirds) {
      bird.fitness = bird.score / sum;
    }

    // Pick one based on fitness (roulette-wheel selection)
    const pickOne = () => {
      let index = 0;
      let r = Math.random();
      while (r > 0 && index < state.current.savedBirds.length) {
        r = r - state.current.savedBirds[index].fitness;
        index++;
      }
      index = Math.max(0, Math.min(index - 1, state.current.savedBirds.length - 1));
      const bird = state.current.savedBirds[index];
      const child = new Bird(bird.brain);
      child.brain.mutate(0.1);
      return child;
    };

    state.current.birds = [];
    for (let i = 0; i < POPULATION; i++) {
      state.current.birds[i] = pickOne();
    }
    state.current.savedBirds = [];
    setGeneration(g => g + 1);
  }, []);

  const initGame = useCallback(() => {
    state.current.birds = [];
    state.current.savedBirds = [];
    state.current.pipes = [];
    state.current.counter = 0;
    state.current.bestScore = 0;
    setGeneration(1);
    setMaxScore(0);
    
    for (let i = 0; i < POPULATION; i++) {
      state.current.birds.push(new Bird());
    }
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  useEffect(() => {
    let animationId: number;

    const gameLoop = () => {
      if (!isPlaying) {
        // Draw static state
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
          state.current.pipes.forEach(p => p.draw(ctx));
          state.current.birds.forEach(b => b.draw(ctx, false));
        }
        return;
      }

      // Logic
      if (state.current.counter % 70 === 0) {
        state.current.pipes.push(new Pipe());
      }
      state.current.counter++;

      for (let i = state.current.pipes.length - 1; i >= 0; i--) {
        state.current.pipes[i].update();
        
        for (let j = state.current.birds.length - 1; j >= 0; j--) {
          if (state.current.pipes[i].hits(state.current.birds[j])) {
            state.current.birds[j].dead = true;
          }
        }

        if (state.current.pipes[i].x < -PIPE_WIDTH) {
          state.current.pipes.splice(i, 1);
        }
      }

      let currentMaxScore = 0;
      for (let i = state.current.birds.length - 1; i >= 0; i--) {
        const bird = state.current.birds[i];
        if (bird.dead) {
          state.current.savedBirds.push(state.current.birds.splice(i, 1)[0]);
        } else {
          bird.think(state.current.pipes);
          bird.update();
          if (bird.score > currentMaxScore) currentMaxScore = bird.score;
        }
      }

      setAliveCount(state.current.birds.length);
      if (currentMaxScore > state.current.bestScore) {
        state.current.bestScore = currentMaxScore;
        setMaxScore(Math.floor(currentMaxScore / 70)); // rough score based on frames
      }

      if (state.current.birds.length === 0) {
        nextGeneration();
      }

      // Render
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
        
        state.current.pipes.forEach(p => p.draw(ctx));
        
        // Find best bird to highlight
        let bestBirdIdx = 0;
        let maxS = -1;
        for (let i = 0; i < state.current.birds.length; i++) {
          if (state.current.birds[i].score > maxS) {
            maxS = state.current.birds[i].score;
            bestBirdIdx = i;
          }
        }

        state.current.birds.forEach((b, i) => b.draw(ctx, i === bestBirdIdx));
      }

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, nextGeneration]);

  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      <div className="flex flex-wrap items-center justify-between w-full max-w-[400px] gap-4">
        <button onClick={() => setIsPlaying(!isPlaying)} className={`inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full font-medium transition-all ${isPlaying ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
          <Play className="h-3 w-3" /> {isPlaying ? "Pause Learning" : "Start Learning"}
        </button>
        <button onClick={initGame} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3" /> Reset AI
        </button>
        <div className="flex gap-4 text-xs font-mono text-muted-foreground ml-auto">
          <div>GEN: <span className="text-primary font-bold">{generation}</span></div>
          <div>ALIVE: <span className="text-accent-violet font-bold">{aliveCount}/{POPULATION}</span></div>
          <div>SCORE: <span className="text-foreground font-bold">{maxScore}</span></div>
        </div>
      </div>
      
      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20 relative shadow-elegant">
        <canvas 
          ref={canvasRef} 
          width={CANVAS_W} 
          height={CANVAS_H} 
          className="bg-[#0f172a] block max-w-full h-auto" 
        />
        {!isPlaying && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-6 bg-background rounded-2xl border border-border/50 shadow-xl max-w-[80%]">
              <BrainCircuit className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Neuroevolution</h3>
              <p className="text-xs text-muted-foreground">
                Watch a population of {POPULATION} neural networks learn to play Flappy Bird via a Genetic Algorithm. 
                Birds that survive longer pass their mutated "genes" (weights) to the next generation!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
