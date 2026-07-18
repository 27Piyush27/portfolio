import { useState, useRef, useEffect, useCallback, memo, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Brain, TrendingUp, Network, Atom, BarChart3, Play, RotateCcw, Plus, Minus, Sparkles, ChevronRight, Pause, SkipForward, MousePointerClick } from "lucide-react";
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { LineReveal } from "@/components/animations";

const appleEase = [0.25, 0.1, 0.25, 1] as const;

// ============================================================
// PROJECT 1: SENTIMENT ANALYSIS ENGINE
// Uses AFINN-inspired lexicon for real-time text scoring
// ============================================================

const AFINN_LEXICON: Record<string, number> = {
  // Strongly positive
  "excellent": 4, "amazing": 4, "awesome": 4, "outstanding": 4, "brilliant": 4, "fantastic": 4, "superb": 4, "magnificent": 4, "wonderful": 4, "exceptional": 4, "perfect": 4, "love": 3, "loved": 3, "loving": 3, "best": 3, "beautiful": 3, "great": 3, "happy": 3, "joy": 3, "incredible": 3, "impressive": 3, "remarkable": 3, "thrilled": 3, "delighted": 3, "grateful": 3, "blessed": 3, "excited": 3, "exciting": 3, "paradise": 3, "triumph": 3, "celebrate": 3,
  // Positive
  "good": 2, "nice": 2, "like": 2, "enjoy": 2, "enjoyed": 2, "helpful": 2, "thanks": 2, "thank": 2, "cool": 2, "interesting": 2, "fun": 2, "recommend": 2, "pleased": 2, "glad": 2, "positive": 2, "appreciate": 2, "agree": 2, "win": 2, "winning": 2, "better": 2, "improved": 2, "smart": 2, "elegant": 2, "creative": 2, "innovative": 2, "efficient": 2, "effective": 2, "valuable": 2, "useful": 2,
  // Slightly positive
  "ok": 1, "okay": 1, "fine": 1, "well": 1, "fair": 1, "decent": 1, "pleasant": 1, "calm": 1, "easy": 1, "simple": 1, "clean": 1, "clear": 1, "safe": 1, "correct": 1, "right": 1, "true": 1, "sure": 1, "hope": 1, "hopeful": 1, "possible": 1,
  // Slightly negative
  "boring": -1, "mediocre": -1, "meh": -1, "dull": -1, "confusing": -1, "confused": -1, "slow": -1, "problem": -1, "issue": -1, "difficult": -1, "hard": -1, "annoying": -1, "concern": -1, "concerned": -1, "worried": -1, "doubt": -1, "skeptical": -1, "unfortunately": -1, "wrong": -1, "miss": -1, "missing": -1,
  // Negative
  "bad": -2, "poor": -2, "terrible": -2, "ugly": -2, "hate": -2, "hated": -2, "awful": -2, "waste": -2, "angry": -2, "annoyed": -2, "disappointed": -2, "disappointing": -2, "frustrating": -2, "frustrated": -2, "fail": -2, "failed": -2, "failure": -2, "broken": -2, "useless": -2, "sad": -2, "unhappy": -2, "worst": -2, "painful": -2, "damage": -2, "damaged": -2, "lost": -2, "lose": -2, "losing": -2, "reject": -2,
  // Strongly negative
  "horrible": -3, "disgusting": -3, "disaster": -3, "catastrophe": -3, "nightmare": -3, "toxic": -3, "destroy": -3, "destroyed": -3, "ruined": -3, "pathetic": -3, "miserable": -3, "dreadful": -3, "atrocious": -3, "abysmal": -3, "horrific": -3, "devastating": -3, "despise": -3, "loathe": -3, "repulsive": -3,
  // Intensifiers (handled separately)
  "very": 0, "really": 0, "extremely": 0, "absolutely": 0, "totally": 0, "completely": 0, "incredibly": 0,
  // Negators
  "not": 0, "no": 0, "never": 0, "neither": 0, "nobody": 0, "nothing": 0, "nowhere": 0, "hardly": 0, "barely": 0,
};

const INTENSIFIERS = new Set(["very", "really", "extremely", "absolutely", "totally", "completely", "incredibly", "so", "such"]);
const NEGATORS = new Set(["not", "no", "never", "neither", "hardly", "barely", "don't", "doesn't", "didn't", "won't", "wouldn't", "shouldn't", "can't", "cannot", "isn't", "aren't", "wasn't", "weren't"]);

interface AnalysisResult {
  score: number;
  normalized: number;
  positive: string[];
  negative: string[];
  emotions: { label: string; value: number }[];
}

function analyzeSentiment(text: string): AnalysisResult {
  const words = text.toLowerCase().replace(/[^\w\s']/g, "").split(/\s+/).filter(Boolean);
  let score = 0;
  const positive: string[] = [];
  const negative: string[] = [];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const val = AFINN_LEXICON[word];
    if (val !== undefined && val !== 0) {
      let modifier = 1;
      // Check for negators in previous 1-3 words
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (NEGATORS.has(words[j])) { modifier *= -1; break; }
      }
      // Check for intensifiers
      if (i > 0 && INTENSIFIERS.has(words[i - 1])) { modifier *= 1.5; }
      const finalVal = val * modifier;
      score += finalVal;
      if (finalVal > 0) positive.push(word);
      else if (finalVal < 0) negative.push(word);
    }
  }

  const maxPossible = Math.max(words.length * 0.5, 1);
  const normalized = Math.max(-1, Math.min(1, score / maxPossible));

  const joy = positive.length * 0.3;
  const anger = negative.filter(w => ["hate", "angry", "annoyed", "frustrated", "frustrating"].includes(w)).length * 0.5;
  const sadness = negative.filter(w => ["sad", "unhappy", "disappointed", "miserable", "lost"].includes(w)).length * 0.5;
  const surprise = positive.filter(w => ["amazing", "incredible", "wow", "awesome", "unbelievable"].includes(w)).length * 0.5;
  const total = Math.max(joy + anger + sadness + surprise, 1);

  return {
    score,
    normalized,
    positive: [...new Set(positive)],
    negative: [...new Set(negative)],
    emotions: [
      { label: "Joy", value: Math.round((joy / total) * 100) || (score > 0 ? 60 : 10) },
      { label: "Anger", value: Math.round((anger / total) * 100) || (score < -2 ? 40 : 5) },
      { label: "Sadness", value: Math.round((sadness / total) * 100) || (score < 0 ? 25 : 5) },
      { label: "Surprise", value: Math.round((surprise / total) * 100) || 10 },
    ],
  };
}

const EXAMPLE_TEXTS = [
  "I absolutely love this amazing product! It's the best thing I've ever used. Brilliant and fantastic quality.",
  "The service was terrible and the staff was incredibly rude. Worst experience of my life. Totally disappointed.",
  "The weather is okay today. Not great but not bad either. It's a fairly normal Tuesday afternoon.",
  "This machine learning model achieved outstanding accuracy! The results are impressive and the training was efficient.",
];

const SentimentAnalyzer = () => {
  const [text, setText] = useState(EXAMPLE_TEXTS[0]);
  const result = useMemo(() => analyzeSentiment(text), [text]);

  const gaugeRotation = result.normalized * 90; // -90 to 90 degrees
  const sentimentLabel = result.normalized > 0.3 ? "Positive" : result.normalized < -0.3 ? "Negative" : "Neutral";
  const sentimentColor = result.normalized > 0.3 ? "hsl(var(--primary))" : result.normalized < -0.3 ? "hsl(0 70% 55%)" : "hsl(var(--muted-foreground))";
  const emotionColors = ["hsl(var(--primary))", "hsl(0 70% 55%)", "hsl(220 70% 55%)", "hsl(var(--accent-violet))"];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-muted-foreground">Enter text to analyze:</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          className="w-full h-28 px-4 py-3 bg-muted/50 border border-border/50 rounded-2xl text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
          placeholder="Type or paste text here..."
        />
        <div className="flex gap-2 flex-wrap">
          {EXAMPLE_TEXTS.map((ex, i) => (
            <button
              key={i}
              onClick={() => setText(ex)}
              className="text-[10px] px-3 py-1.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-all hover:text-foreground"
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Score gauge */}
        <div className="flex flex-col items-center p-5 rounded-2xl bg-muted/30 border border-border/30">
          <div className="relative w-28 h-16 mb-3">
            <svg viewBox="0 0 120 70" className="w-full h-full">
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="hsl(var(--border))" strokeWidth="8" strokeLinecap="round" />
              <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke={sentimentColor} strokeWidth="8" strokeLinecap="round"
                strokeDasharray="157" strokeDashoffset={157 - (result.normalized + 1) / 2 * 157}
                style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.4s ease" }}
              />
              <line x1="60" y1="60" x2="60" y2="18" stroke={sentimentColor} strokeWidth="2" strokeLinecap="round"
                transform={`rotate(${gaugeRotation}, 60, 60)`}
                style={{ transition: "transform 0.6s ease" }}
              />
              <circle cx="60" cy="60" r="4" fill={sentimentColor} style={{ transition: "fill 0.4s ease" }} />
            </svg>
          </div>
          <div className="text-2xl font-bold tracking-tight" style={{ color: sentimentColor }}>{result.score.toFixed(1)}</div>
          <div className="text-xs text-muted-foreground">{sentimentLabel}</div>
        </div>

        {/* Word highlights */}
        <div className="p-5 rounded-2xl bg-muted/30 border border-border/30 col-span-1 sm:col-span-2">
          <div className="text-xs text-muted-foreground mb-2 font-medium">Detected words:</div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {result.positive.map((w, i) => (
              <span key={`p-${i}`} className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">+{w}</span>
            ))}
            {result.negative.map((w, i) => (
              <span key={`n-${i}`} className="text-[10px] px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-400/20">–{w}</span>
            ))}
            {result.positive.length === 0 && result.negative.length === 0 && (
              <span className="text-[10px] text-muted-foreground italic">No sentiment words detected</span>
            )}
          </div>
          <div className="text-xs text-muted-foreground mb-2 font-medium">Emotion breakdown:</div>
          <div className="space-y-1.5">
            {result.emotions.map((em, i) => (
              <div key={em.label} className="flex items-center gap-2">
                <span className="text-[10px] w-14 text-muted-foreground">{em.label}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: emotionColors[i] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${em.value}%` }}
                    transition={{ duration: 0.6, ease: appleEase as any }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground w-8 text-right">{em.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PROJECT 2: LINEAR REGRESSION PLAYGROUND
// Click to add points, animated gradient descent
// ============================================================

interface Point { x: number; y: number }

const RegressionPlayground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([
    { x: 50, y: 280 }, { x: 100, y: 250 }, { x: 150, y: 210 }, { x: 200, y: 200 },
    { x: 250, y: 170 }, { x: 300, y: 140 }, { x: 350, y: 130 }, { x: 400, y: 90 },
  ]);
  const [slope, setSlope] = useState(0);
  const [intercept, setIntercept] = useState(200);
  const [isTraining, setIsTraining] = useState(false);
  const [loss, setLoss] = useState(0);
  const [r2, setR2] = useState(0);
  const [lossHistory, setLossHistory] = useState<{ step: number; loss: number }[]>([]);
  const animRef = useRef<number>(0);
  const paramsRef = useRef({ m: 0, b: 200 });

  const W = 460;
  const H = 320;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let i = 0; i <= H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

    // Regression line
    const { m, b } = paramsRef.current;
    ctx.beginPath();
    ctx.moveTo(0, b);
    ctx.lineTo(W, m * W + b);
    ctx.strokeStyle = isDark ? "rgba(139,92,246,0.8)" : "rgba(139,92,246,0.7)";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Residual lines
    points.forEach(p => {
      const predicted = m * p.x + b;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, predicted);
      ctx.strokeStyle = isDark ? "rgba(255,100,100,0.2)" : "rgba(255,100,100,0.15)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Points
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(45,212,168,0.9)" : "rgba(45,212,168,0.8)";
      ctx.fill();
      ctx.strokeStyle = isDark ? "rgba(45,212,168,0.3)" : "rgba(45,212,168,0.2)";
      ctx.lineWidth = 3;
      ctx.stroke();
      // glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, 12, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? "rgba(45,212,168,0.08)" : "rgba(45,212,168,0.05)";
      ctx.fill();
    });
  }, [points]);

  useEffect(() => { draw(); }, [draw, slope, intercept]);

  const computeLossAndR2 = (m: number, b: number) => {
    if (points.length === 0) return { loss: 0, r2: 0 };
    const meanY = points.reduce((s, p) => s + p.y, 0) / points.length;
    let ssRes = 0, ssTot = 0;
    points.forEach(p => {
      const pred = m * p.x + b;
      ssRes += (p.y - pred) ** 2;
      ssTot += (p.y - meanY) ** 2;
    });
    return { loss: ssRes / points.length, r2: ssTot > 0 ? 1 - ssRes / ssTot : 0 };
  };

  const train = () => {
    if (points.length < 2) return;
    setIsTraining(true);
    setLossHistory([]);
    paramsRef.current = { m: 0, b: points[0]?.y || 200 };
    let step = 0;
    const lr = 0.0000015;
    const history: { step: number; loss: number }[] = [];

    const step_ = () => {
      const { m, b } = paramsRef.current;
      let dm = 0, db = 0;
      points.forEach(p => {
        const pred = m * p.x + b;
        const err = pred - p.y;
        dm += err * p.x;
        db += err;
      });
      dm = (2 / points.length) * dm;
      db = (2 / points.length) * db;
      paramsRef.current = { m: m - lr * dm, b: b - lr * 0.01 * db };

      const { loss: l, r2: r } = computeLossAndR2(paramsRef.current.m, paramsRef.current.b);
      setSlope(paramsRef.current.m);
      setIntercept(paramsRef.current.b);
      setLoss(l);
      setR2(r);
      history.push({ step, loss: l });
      if (step % 5 === 0) setLossHistory([...history]);
      draw();
      step++;
      if (step < 300) animRef.current = requestAnimationFrame(step_);
      else { setIsTraining(false); setLossHistory([...history]); }
    };
    animRef.current = requestAnimationFrame(step_);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isTraining) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);
    setPoints(p => [...p, { x, y }]);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isTraining) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (W / rect.width);
    const y = (touch.clientY - rect.top) * (H / rect.height);
    setPoints(p => [...p, { x, y }]);
  };

  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setIsTraining(false);
    setPoints([]);
    setSlope(0);
    setIntercept(200);
    setLoss(0);
    setR2(0);
    setLossHistory([]);
    paramsRef.current = { m: 0, b: 200 };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={train} disabled={isTraining || points.length < 2}
          className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-accent-violet text-white font-medium hover:opacity-90 transition-all disabled:opacity-40">
          <Play className="h-3 w-3" /> {isTraining ? "Training..." : "Train (Gradient Descent)"}
        </button>
        <button onClick={reset} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
        <span className="text-[10px] text-muted-foreground ml-auto flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Click canvas to add points</span>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20 relative">
        <canvas ref={canvasRef} width={W} height={H} onClick={handleCanvasClick} onTouchStart={handleCanvasTouch}
          className="w-full cursor-crosshair touch-none" style={{ aspectRatio: `${W}/${H}` }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">Equation</div>
          <div className="text-xs font-mono font-medium">y = {slope.toFixed(3)}x + {intercept.toFixed(1)}</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">R² Score</div>
          <div className="text-xs font-mono font-medium text-primary">{r2.toFixed(4)}</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">MSE Loss</div>
          <div className="text-xs font-mono font-medium text-accent-violet">{loss.toFixed(1)}</div>
        </div>
      </div>

      {lossHistory.length > 0 && (
        <div className="h-32 rounded-xl bg-muted/20 border border-border/30 p-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lossHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="step" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }} />
              <Line type="monotone" dataKey="loss" stroke="hsl(var(--accent-violet))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PROJECT 3: NEURAL NETWORK VISUALIZER
// Interactive forward pass with real sigmoid activations
// ============================================================

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));

const NeuralNetworkViz = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [input1, setInput1] = useState(0.5);
  const [input2, setInput2] = useState(0.8);
  const [weights, setWeights] = useState<number[][]>([]);
  const [activations, setActivations] = useState<number[][]>([]);
  const [animProgress, setAnimProgress] = useState(1);
  const animRef = useRef<number>(0);

  const W = 460;
  const H = 320;
  const layers = [2, 4, 3, 1];

  const randomizeWeights = useCallback(() => {
    const w: number[][] = [];
    for (let l = 0; l < layers.length - 1; l++) {
      for (let i = 0; i < layers[l]; i++) {
        for (let j = 0; j < layers[l + 1]; j++) {
          w.push([l, i, j, (Math.random() - 0.5) * 4]);
        }
      }
    }
    return w;
  }, []);

  const forwardPass = useCallback((w: number[][], i1: number, i2: number) => {
    const acts: number[][] = [[i1, i2]];
    let current = [i1, i2];
    for (let l = 0; l < layers.length - 1; l++) {
      const next: number[] = [];
      for (let j = 0; j < layers[l + 1]; j++) {
        let sum = 0;
        for (let i = 0; i < layers[l]; i++) {
          const wt = w.find(ww => ww[0] === l && ww[1] === i && ww[2] === j);
          sum += current[i] * (wt ? wt[3] : 0);
        }
        next.push(sigmoid(sum));
      }
      acts.push(next);
      current = next;
    }
    return acts;
  }, []);

  useEffect(() => {
    const w = randomizeWeights();
    setWeights(w);
    setActivations(forwardPass(w, input1, input2));
  }, []);

  useEffect(() => {
    if (weights.length > 0) {
      setActivations(forwardPass(weights, input1, input2));
    }
  }, [input1, input2, weights, forwardPass]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || activations.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, W, H);

    const nodePositions: { x: number; y: number }[][] = [];
    const padX = 70;
    const spacingX = (W - padX * 2) / (layers.length - 1);

    layers.forEach((count, l) => {
      const layerPos: { x: number; y: number }[] = [];
      const spacingY = H / (count + 1);
      for (let i = 0; i < count; i++) {
        layerPos.push({ x: padX + l * spacingX, y: spacingY * (i + 1) });
      }
      nodePositions.push(layerPos);
    });

    // Draw connections
    for (let l = 0; l < layers.length - 1; l++) {
      for (let i = 0; i < layers[l]; i++) {
        for (let j = 0; j < layers[l + 1]; j++) {
          const from = nodePositions[l][i];
          const to = nodePositions[l + 1][j];
          const w = weights.find(ww => ww[0] === l && ww[1] === i && ww[2] === j);
          const wVal = w ? w[3] : 0;
          const alpha = Math.min(Math.abs(wVal) / 3, 0.8) * animProgress;
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.strokeStyle = wVal > 0
            ? `rgba(45,212,168,${alpha})`
            : `rgba(239,68,68,${alpha})`;
          ctx.lineWidth = Math.abs(wVal) * 0.6 + 0.5;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodePositions.forEach((layer, l) => {
      layer.forEach((pos, i) => {
        const activation = activations[l]?.[i] ?? 0;
        const radius = 18;

        // Glow
        const gradient = ctx.createRadialGradient(pos.x, pos.y, radius * 0.5, pos.x, pos.y, radius * 2.5);
        gradient.addColorStop(0, `rgba(139,92,246,${activation * 0.15 * animProgress})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(pos.x - radius * 3, pos.y - radius * 3, radius * 6, radius * 6);

        // Node circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
        const intensity = activation * animProgress;
        ctx.fillStyle = isDark
          ? `rgba(${30 + intensity * 80}, ${20 + intensity * 50}, ${60 + intensity * 140}, 0.9)`
          : `rgba(${220 - intensity * 100}, ${220 - intensity * 80}, ${240 - intensity * 20}, 0.95)`;
        ctx.fill();
        ctx.strokeStyle = `rgba(139,92,246,${0.3 + intensity * 0.4})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Value text
        ctx.fillStyle = isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)";
        ctx.font = "bold 10px 'Space Grotesk', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(activation.toFixed(2), pos.x, pos.y);
      });
    });

    // Layer labels
    const labelNames = ["Input", "Hidden 1", "Hidden 2", "Output"];
    nodePositions.forEach((_, l) => {
      ctx.fillStyle = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)";
      ctx.font = "500 10px 'DM Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(labelNames[l], padX + l * spacingX, H - 10);
    });
  }, [activations, weights, animProgress]);

  useEffect(() => { draw(); }, [draw]);

  const handleRandomize = () => {
    setAnimProgress(0);
    const w = randomizeWeights();
    setWeights(w);
    setActivations(forwardPass(w, input1, input2));
    let t = 0;
    const animate = () => {
      t += 0.03;
      setAnimProgress(Math.min(t, 1));
      if (t < 1) animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
  };

  const output = activations[activations.length - 1]?.[0] ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleRandomize}
          className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-accent-violet text-white font-medium hover:opacity-90 transition-all">
          <Sparkles className="h-3 w-3" /> Randomize Weights
        </button>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">Output:</span>
          <span className="text-sm font-mono font-bold text-accent-violet">{output.toFixed(4)}</span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20">
        <canvas ref={canvasRef} width={W} height={H} className="w-full" style={{ aspectRatio: `${W}/${H}` }} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground font-medium">Input 1: {input1.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.01" value={input1} onChange={e => setInput1(+e.target.value)}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary" />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground font-medium">Input 2: {input2.toFixed(2)}</label>
          <input type="range" min="0" max="1" step="0.01" value={input2} onChange={e => setInput2(+e.target.value)}
            className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-accent-violet" />
        </div>
      </div>

      <div className="flex flex-wrap gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary inline-block rounded" /> Positive weight</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-red-400 inline-block rounded" /> Negative weight</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border border-accent-violet/40 inline-block" /> Sigmoid activation</span>
      </div>
    </div>
  );
};

// ============================================================
// PROJECT 4: K-MEANS CLUSTERING
// Interactive step-by-step Lloyd's algorithm
// ============================================================

interface KPoint { x: number; y: number; cluster: number }
interface Centroid { x: number; y: number }

const CLUSTER_COLORS = [
  "45,212,168", "139,92,246", "59,130,246", "245,158,11", "239,68,68", "16,185,129"
];

const KMeansClustering = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<KPoint[]>([]);
  const [centroids, setCentroids] = useState<Centroid[]>([]);
  const [k, setK] = useState(3);
  const [iteration, setIteration] = useState(0);
  const [wcss, setWcss] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const animRef = useRef<number>(0);

  const W = 460;
  const H = 320;

  // Generate sample data
  const generateData = () => {
    const pts: KPoint[] = [];
    const centers = [
      { x: 100, y: 80 }, { x: 350, y: 100 }, { x: 200, y: 260 },
      { x: 380, y: 250 }, { x: 120, y: 180 }
    ];
    for (let c = 0; c < Math.min(k + 1, centers.length); c++) {
      for (let i = 0; i < 15; i++) {
        pts.push({
          x: centers[c].x + (Math.random() - 0.5) * 100,
          y: centers[c].y + (Math.random() - 0.5) * 80,
          cluster: -1,
        });
      }
    }
    setPoints(pts);
    setCentroids([]);
    setIteration(0);
    setWcss(0);
    setIsRunning(false);
  };

  useEffect(() => { generateData(); }, []);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isRunning) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) * (W / rect.width);
    const y = (e.clientY - rect.top) * (H / rect.height);
    setPoints(p => [...p, { x, y, cluster: -1 }]);
  };

  const handleCanvasTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (isRunning) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * (W / rect.width);
    const y = (touch.clientY - rect.top) * (H / rect.height);
    setPoints(p => [...p, { x, y, cluster: -1 }]);
  };

  const initCentroids = () => {
    const shuffled = [...points].sort(() => Math.random() - 0.5);
    const c = shuffled.slice(0, k).map(p => ({ x: p.x, y: p.y }));
    setCentroids(c);
    setIteration(0);
    return c;
  };

  const assignClusters = (pts: KPoint[], cents: Centroid[]) => {
    let totalDist = 0;
    const assigned = pts.map(p => {
      let minDist = Infinity;
      let closest = 0;
      cents.forEach((c, i) => {
        const d = Math.sqrt((p.x - c.x) ** 2 + (p.y - c.y) ** 2);
        if (d < minDist) { minDist = d; closest = i; }
      });
      totalDist += minDist ** 2;
      return { ...p, cluster: closest };
    });
    return { assigned, wcss: totalDist };
  };

  const updateCentroids = (pts: KPoint[], kVal: number) => {
    const newCentroids: Centroid[] = [];
    for (let i = 0; i < kVal; i++) {
      const cluster = pts.filter(p => p.cluster === i);
      if (cluster.length === 0) {
        newCentroids.push({ x: Math.random() * W, y: Math.random() * H });
      } else {
        newCentroids.push({
          x: cluster.reduce((s, p) => s + p.x, 0) / cluster.length,
          y: cluster.reduce((s, p) => s + p.y, 0) / cluster.length,
        });
      }
    }
    return newCentroids;
  };

  const stepOnce = (currentPts?: KPoint[], currentCents?: Centroid[]) => {
    const pts = currentPts || points;
    let cents = currentCents || centroids;
    if (cents.length === 0) cents = initCentroids();

    const { assigned, wcss: w } = assignClusters(pts, cents);
    const newCents = updateCentroids(assigned, k);
    setPoints(assigned);
    setCentroids(newCents);
    setWcss(w);
    setIteration(prev => prev + 1);
    return { pts: assigned, cents: newCents };
  };

  const runFull = () => {
    if (points.length < k) return;
    setIsRunning(true);
    let cents = initCentroids();
    let pts = points;
    let i = 0;

    const step = () => {
      const { assigned, wcss: w } = assignClusters(pts, cents);
      const newCents = updateCentroids(assigned, k);
      pts = assigned;

      const converged = cents.every((c, idx) =>
        Math.abs(c.x - newCents[idx].x) < 0.5 && Math.abs(c.y - newCents[idx].y) < 0.5
      );

      cents = newCents;
      setPoints([...assigned]);
      setCentroids([...newCents]);
      setWcss(w);
      i++;
      setIteration(i);

      if (!converged && i < 50) {
        animRef.current = window.setTimeout(step, 300) as any;
      } else {
        setIsRunning(false);
      }
    };
    step();
  };

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const isDark = document.documentElement.classList.contains("dark");

    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
    for (let i = 0; i <= W; i += 40) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, H); ctx.stroke(); }
    for (let i = 0; i <= H; i += 40) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(W, i); ctx.stroke(); }

    // Points
    points.forEach(p => {
      const color = p.cluster >= 0 ? CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length] : (isDark ? "180,180,180" : "120,120,120");
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.8)`;
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.06)`;
      ctx.fill();
    });

    // Centroids
    centroids.forEach((c, i) => {
      const color = CLUSTER_COLORS[i % CLUSTER_COLORS.length];
      // Glow
      ctx.beginPath();
      ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},0.12)`;
      ctx.fill();
      // Cross
      ctx.strokeStyle = `rgba(${color},0.9)`;
      ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(c.x - 8, c.y); ctx.lineTo(c.x + 8, c.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(c.x, c.y - 8); ctx.lineTo(c.x, c.y + 8); ctx.stroke();
      // Ring
      ctx.beginPath();
      ctx.arc(c.x, c.y, 12, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${color},0.5)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }, [points, centroids]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={runFull} disabled={isRunning || points.length < k}
          className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-40">
          <Play className="h-3 w-3" /> {isRunning ? "Running..." : "Run K-Means"}
        </button>
        <button onClick={() => stepOnce()} disabled={isRunning || points.length < k}
          className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-all disabled:opacity-40">
          <SkipForward className="h-3 w-3" /> Step
        </button>
        <button onClick={generateData}
          className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-full bg-muted text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3" /> New Data
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">K:</span>
          <button onClick={() => setK(Math.max(2, k - 1))} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs"><Minus className="h-3 w-3" /></button>
          <span className="text-sm font-mono font-bold w-4 text-center">{k}</span>
          <button onClick={() => setK(Math.min(6, k + 1))} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs"><Plus className="h-3 w-3" /></button>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-border/30 bg-muted/20">
        <canvas ref={canvasRef} width={W} height={H} onClick={handleCanvasClick} onTouchStart={handleCanvasTouch}
          className="w-full cursor-crosshair touch-none" style={{ aspectRatio: `${W}/${H}` }} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">Iterations</div>
          <div className="text-lg font-mono font-bold">{iteration}</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">WCSS</div>
          <div className="text-xs font-mono font-bold text-primary">{wcss.toFixed(0)}</div>
        </div>
        <div className="p-3 rounded-xl bg-muted/30 border border-border/30 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">Points</div>
          <div className="text-lg font-mono font-bold">{points.length}</div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PROJECT 5: DATA EXPLORER DASHBOARD
// Interactive Recharts dashboard with sample dataset
// ============================================================

const AI_ADOPTION_DATA = [
  { year: "2019", adoption: 23, investment: 12, jobs: 2.1, satisfaction: 45 },
  { year: "2020", adoption: 31, investment: 18, jobs: 2.8, satisfaction: 52 },
  { year: "2021", adoption: 42, investment: 28, jobs: 3.6, satisfaction: 61 },
  { year: "2022", adoption: 56, investment: 42, jobs: 5.2, satisfaction: 68 },
  { year: "2023", adoption: 72, investment: 67, jobs: 7.4, satisfaction: 74 },
  { year: "2024", adoption: 85, investment: 91, jobs: 9.8, satisfaction: 79 },
  { year: "2025", adoption: 92, investment: 118, jobs: 12.1, satisfaction: 83 },
];

const SCATTER_DATA = [
  { accuracy: 72, training: 2, name: "Linear Reg" }, { accuracy: 78, training: 5, name: "SVM" },
  { accuracy: 81, training: 12, name: "Random Forest" }, { accuracy: 84, training: 8, name: "XGBoost" },
  { accuracy: 88, training: 25, name: "CNN" }, { accuracy: 91, training: 48, name: "BERT" },
  { accuracy: 94, training: 120, name: "GPT-3" }, { accuracy: 96, training: 350, name: "GPT-4" },
  { accuracy: 93, training: 80, name: "LLaMA" }, { accuracy: 89, training: 30, name: "ResNet" },
];

type ChartType = "line" | "bar" | "area" | "scatter";

const DataExplorer = () => {
  const [chartType, setChartType] = useState<ChartType>("area");
  const [metric, setMetric] = useState<"adoption" | "investment" | "jobs">("adoption");

  const metricLabels = { adoption: "AI Adoption Rate (%)", investment: "AI Investment ($B)", jobs: "AI Jobs Created (M)" };
  const chartTypes: { type: ChartType; label: string }[] = [
    { type: "area", label: "Area" }, { type: "line", label: "Line" }, { type: "bar", label: "Bar" }, { type: "scatter", label: "Scatter" },
  ];
  const metrics: { key: "adoption" | "investment" | "jobs"; label: string }[] = [
    { key: "adoption", label: "Adoption" }, { key: "investment", label: "Investment" }, { key: "jobs", label: "Jobs" },
  ];

  const tooltipStyle = {
    fontSize: 11, borderRadius: 12,
    border: "1px solid hsl(var(--border))", background: "hsl(var(--background))",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 p-1 rounded-full bg-muted/50 border border-border/30">
          {chartTypes.map(ct => (
            <button key={ct.type} onClick={() => setChartType(ct.type)}
              className={`text-[10px] px-3 py-1.5 rounded-full transition-all ${chartType === ct.type ? "bg-foreground text-background font-medium" : "text-muted-foreground hover:text-foreground"}`}>
              {ct.label}
            </button>
          ))}
        </div>
        {chartType !== "scatter" && (
          <div className="flex gap-1 p-1 rounded-full bg-muted/50 border border-border/30 ml-auto">
            {metrics.map(m => (
              <button key={m.key} onClick={() => setMetric(m.key)}
                className={`text-[10px] px-3 py-1.5 rounded-full transition-all ${metric === m.key ? "bg-accent-violet text-white font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-56 rounded-2xl bg-muted/20 border border-border/30 p-3">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "scatter" ? (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="training" name="Training (GPU hrs)" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Training (GPU hrs)", position: "bottom", fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="accuracy" name="Accuracy (%)" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [name === "accuracy" ? `${value}%` : `${value} hrs`, name === "accuracy" ? "Accuracy" : "Training"]} />
              <Scatter data={SCATTER_DATA} fill="hsl(var(--accent-violet))">
                {SCATTER_DATA.map((_, i) => (
                  <Cell key={i} fill={i >= 6 ? "hsl(var(--accent-violet))" : "hsl(var(--primary))"} />
                ))}
              </Scatter>
            </ScatterChart>
          ) : chartType === "bar" ? (
            <BarChart data={AI_ADOPTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey={metric} radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart data={AI_ADOPTION_DATA}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey={metric} stroke="hsl(var(--primary))" fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          ) : (
            <LineChart data={AI_ADOPTION_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis dataKey="year" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey={metric} stroke="hsl(var(--accent-violet))" strokeWidth={2.5} dot={{ r: 4, fill: "hsl(var(--accent-violet))" }} activeDot={{ r: 6 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="text-[10px] text-muted-foreground text-center">
        {chartType === "scatter"
          ? "ML Model Accuracy vs Training Compute — each dot is a real model"
          : `Global ${metricLabels[metric]} — 2019 to 2025`
        }
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT: Tabbed project selector
// ============================================================

const projects = [
  { id: "sentiment", title: "Sentiment Analysis", subtitle: "NLP Engine", icon: <Brain className="h-5 w-5" />, color: "primary", desc: "Real-time text → sentiment scoring using AFINN lexicon with negation & intensifier handling." },
  { id: "regression", title: "Linear Regression", subtitle: "ML Playground", icon: <TrendingUp className="h-5 w-5" />, color: "accent-violet", desc: "Click to add data points, then watch gradient descent fit a regression line in real time." },
  { id: "neural", title: "Neural Network", subtitle: "Visualizer", icon: <Network className="h-5 w-5" />, color: "primary", desc: "Interactive feedforward network — adjust inputs and see sigmoid activations propagate." },
  { id: "kmeans", title: "K-Means Clustering", subtitle: "Unsupervised ML", icon: <Atom className="h-5 w-5" />, color: "accent-violet", desc: "Add data points, choose K, and watch Lloyd's algorithm converge step-by-step." },
  { id: "dashboard", title: "Data Explorer", subtitle: "Analytics Dashboard", icon: <BarChart3 className="h-5 w-5" />, color: "primary", desc: "Interactive charts exploring global AI adoption trends with multiple visualization modes." },
];

const LiveAIProjects = () => {
  const [activeProject, setActiveProject] = useState("sentiment");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const active = projects.find(p => p.id === activeProject)!;

  return (
    <section id="ai-projects" ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 grid-backdrop pointer-events-none opacity-30" />
      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: appleEase as any }}
        >
          <span className="chip-violet"><Brain className="h-3 w-3" /> Live Demos</span>
          <LineReveal>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-6 tracking-tighter">
              AI/ML <span className="text-gradient-ai">in Action</span>
            </h2>
          </LineReveal>
          <p className="text-muted-foreground mt-5 max-w-xl mx-auto font-light">
            Interactive, working AI/ML projects running entirely in your browser. No API keys, no backend — pure algorithms.
          </p>
        </motion.div>

        {/* Project tabs */}
        <motion.div
          className="flex gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: appleEase as any }}
        >
          {projects.map((p, i) => (
            <motion.button
              key={p.id}
              onClick={() => setActiveProject(p.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeProject === p.id
                  ? "bg-foreground text-background shadow-lg"
                  : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted border border-border/30"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.06 }}
            >
              {p.icon}
              <div className="text-left">
                <div className="text-xs font-semibold leading-tight">{p.title}</div>
                <div className={`text-[9px] leading-tight ${activeProject === p.id ? "text-background/60" : "text-muted-foreground/60"}`}>{p.subtitle}</div>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Active project */}
        <motion.div
          className="rounded-3xl bg-background border border-border/50 p-6 md:p-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: appleEase as any }}
        >
          {/* Gradient accent */}
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
              key={activeProject}
              initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -15, filter: "blur(4px)" }}
              transition={{ duration: 0.4, ease: appleEase as any }}
            >
              {activeProject === "sentiment" && <SentimentAnalyzer />}
              {activeProject === "regression" && <RegressionPlayground />}
              {activeProject === "neural" && <NeuralNetworkViz />}
              {activeProject === "kmeans" && <KMeansClustering />}
              {activeProject === "dashboard" && <DataExplorer />}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

export default LiveAIProjects;
