import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, Code2, Gamepad2, Lightbulb, Sparkles, Target, Trophy, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type RecommenderResult = {
  title: string;
  summary: string;
  tags: string[];
};

const recommendationProfiles: Record<string, RecommenderResult> = {
  startup: {
    title: "AI product engineer fit",
    summary: "Best for startups needing an engineer who can ship product UX, LLM workflows, analytics dashboards, and production-ready web apps quickly.",
    tags: ["LLM features", "rapid prototyping", "React", "product thinking"],
  },
  enterprise: {
    title: "Data + platform fit",
    summary: "Strong fit for internal tools, analytics surfaces, model-assisted workflows, and dashboards where reliability, clean architecture, and usability matter.",
    tags: ["analytics", "internal tools", "ML dashboards", "backend systems"],
  },
  research: {
    title: "Applied ML fit",
    summary: "Best for teams exploring applied ML, experiment interfaces, evaluation tools, and interactive demos that make complex AI systems understandable.",
    tags: ["applied ML", "experimentation", "visualization", "LLM UX"],
  },
  growth: {
    title: "Conversion + insights fit",
    summary: "Ideal for growth teams that want behavioral analytics, intelligent user experiences, and high-performance interfaces that feel premium.",
    tags: ["data science", "performance", "A/B thinking", "premium UI"],
  },
};

const quizQuestions = [
  {
    question: "Which model type is best known for next-token text generation?",
    options: ["CNN", "Transformer", "K-Means", "Random Forest"],
    answer: "Transformer",
  },
  {
    question: "Which metric is commonly used for classification quality?",
    options: ["F1 score", "RMSE", "MAE", "PSNR"],
    answer: "F1 score",
  },
  {
    question: "What usually improves retrieval-augmented systems most?",
    options: ["Better chunking", "Larger button radius", "More shadows", "Lower screen brightness"],
    answer: "Better chunking",
  },
];

const codeChallenges = [
  {
    title: "Prompt routing",
    prompt: "A user wants a dashboard summary from a CSV and short action items. Which route is best?",
    options: ["Vision pipeline", "Embedding + retriever", "Structured analysis + summarizer", "Image generator"],
    answer: "Structured analysis + summarizer",
  },
  {
    title: "Latency fix",
    prompt: "Your UI stutters while cards track mouse movement. What is the best first fix?",
    options: ["Add more blur", "Use React state on every move", "Use refs and requestAnimationFrame", "Increase DOM depth"],
    answer: "Use refs and requestAnimationFrame",
  },
];

const memoryCards = [
  "LLM",
  "LLM",
  "RAG",
  "RAG",
  "ML",
  "ML",
  "API",
  "API",
];

const promptPatterns = [
  { label: "System role", correct: true },
  { label: "Constraints", correct: true },
  { label: "Output format", correct: true },
  { label: "Random emojis", correct: false },
];

const AIExperienceLab = () => {
  const [selectedProfile, setSelectedProfile] = useState<keyof typeof recommendationProfiles>("startup");
  const [resumeText, setResumeText] = useState("");
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState<string | null>(null);
  const [logicTarget] = useState(() => Math.floor(Math.random() * 90) + 10);
  const [logicGuess, setLogicGuess] = useState(50);
  const [logicAttempts, setLogicAttempts] = useState(0);
  const [logicState, setLogicState] = useState<"playing" | "won">("playing");
  const [codeIndex, setCodeIndex] = useState(0);
  const [codePicked, setCodePicked] = useState<string | null>(null);
  const [memoryOrder, setMemoryOrder] = useState(() => [...memoryCards].sort(() => Math.random() - 0.5));
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [patternPicked, setPatternPicked] = useState<string[]>([]);

  const recommendation = recommendationProfiles[selectedProfile];

  const resumeAnalysis = useMemo(() => {
    const text = resumeText.toLowerCase();
    if (!text.trim()) {
      return {
        score: 82,
        headline: "Paste a role, resume, or brief to simulate fit analysis.",
        strengths: ["LLM product thinking", "Frontend engineering", "Data storytelling"],
        gaps: ["Add measurable outcomes", "Highlight deployed AI systems"],
      };
    }

    const score =
      60 +
      (text.includes("llm") ? 8 : 0) +
      (text.includes("ml") || text.includes("machine learning") ? 8 : 0) +
      (text.includes("python") ? 6 : 0) +
      (text.includes("react") ? 6 : 0) +
      (text.includes("data") ? 6 : 0) +
      (text.includes("analytics") ? 6 : 0);

    return {
      score: Math.min(score, 96),
      headline: "Strong match for applied AI engineering roles that blend product delivery with data and model-driven experiences.",
      strengths: [
        text.includes("llm") ? "LLM familiarity detected" : "Potential to position LLM workflow experience",
        text.includes("react") ? "Frontend delivery strength" : "Add stronger product interface evidence",
        text.includes("python") ? "Python/ML workflow readiness" : "Mention Python-based experimentation",
      ],
      gaps: [
        "Quantify business impact with metrics",
        "Show one end-to-end AI project from ingestion to UI",
      ],
    };
  }, [resumeText]);

  const chartBars = useMemo(() => {
    const values = [72, 88, 64, 93, 81];
    return values.map((value, index) => ({ value, label: ["Data", "Models", "LLMs", "Frontend", "UX"][index] }));
  }, []);

  const currentQuiz = quizQuestions[quizIndex];
  const currentChallenge = codeChallenges[codeIndex];
  const memoryWon = matched.length === memoryOrder.length;
  const patternScore = promptPatterns.filter((item) => item.correct && patternPicked.includes(item.label)).length;

  const handleQuizAnswer = (option: string) => {
    if (quizAnswered) return;
    setQuizAnswered(option);
    if (option === currentQuiz.answer) setQuizScore((s) => s + 1);
  };

  const advanceQuiz = () => {
    if (quizIndex < quizQuestions.length - 1) {
      setQuizIndex((i) => i + 1);
      setQuizAnswered(null);
      return;
    }

    setQuizIndex(0);
    setQuizAnswered(null);
    setQuizScore(0);
  };

  const handleFlip = (index: number) => {
    if (flipped.includes(index) || matched.includes(index) || flipped.length === 2) return;
    const next = [...flipped, index];
    setFlipped(next);

    if (next.length === 2) {
      const [a, b] = next;
      if (memoryOrder[a] === memoryOrder[b]) {
        setMatched((prev) => [...prev, a, b]);
        setTimeout(() => setFlipped([]), 250);
      } else {
        setTimeout(() => setFlipped([]), 650);
      }
    }
  };

  const resetMemory = () => {
    setMemoryOrder([...memoryCards].sort(() => Math.random() - 0.5));
    setFlipped([]);
    setMatched([]);
  };

  const togglePattern = (label: string) => {
    setPatternPicked((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  const checkLogicGuess = () => {
    if (logicState === "won") return;
    const nextAttempts = logicAttempts + 1;
    setLogicAttempts(nextAttempts);
    if (logicGuess === logicTarget) setLogicState("won");
  };

  const logicHint =
    logicState === "won"
      ? `Solved in ${logicAttempts} tries.`
      : logicAttempts === 0
        ? "Use the slider to infer the hidden model confidence value."
        : logicGuess < logicTarget
          ? "Too low — increase confidence."
          : logicGuess > logicTarget
            ? "Too high — calibrate downward."
            : "Perfect calibration.";

  return (
    <section id="ai-lab" className="py-32 px-6 bg-muted/30 relative overflow-hidden">
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-20 space-y-5">
          <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">AI Lab</span>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter">AI, ML, LLMs & Interactive Builds</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg font-light">
            A portfolio section designed like an applied AI engineer workspace — intelligent UX, model thinking, data products, and playful technical demos.
          </p>
        </div>

        <div className="grid xl:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
          <motion.div layout className="modern-panel-strong rounded-[1.75rem] p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Wand2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Project recommender</h3>
                <p className="text-sm text-muted-foreground">Maps business needs to the right engineering profile.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {Object.keys(recommendationProfiles).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedProfile(key as keyof typeof recommendationProfiles)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all ${
                    selectedProfile === key
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="rounded-[1.5rem] bg-muted/40 p-6">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h4 className="text-xl font-semibold tracking-tight">{recommendation.title}</h4>
                <Badge className="skill-badge">Recommended</Badge>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-5">{recommendation.summary}</p>
              <div className="flex flex-wrap gap-2">
                {recommendation.tags.map((tag) => (
                  <Badge key={tag} className="skill-badge text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div layout className="modern-panel rounded-[1.75rem] p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Resume analyzer</h3>
                <p className="text-sm text-muted-foreground">A lightweight fit simulator for AI engineering roles.</p>
              </div>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value.slice(0, 1200))}
              placeholder="Paste a job description, your resume summary, or an AI role brief..."
              className="min-h-36 w-full rounded-[1.5rem] border border-border bg-muted/30 px-4 py-4 text-sm text-foreground outline-none transition-all focus:ring-2 focus:ring-primary/20"
            />

            <div className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 items-center">
              <div className="text-4xl font-bold tracking-tighter">{resumeAnalysis.score}</div>
              <div className="text-sm text-muted-foreground">Portfolio fit score</div>
              <p className="col-span-2 text-sm text-muted-foreground leading-relaxed mt-2">{resumeAnalysis.headline}</p>
            </div>

            <div className="mt-5 grid sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl bg-muted/40 p-4">
                <h4 className="font-semibold mb-2">Strengths</h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  {resumeAnalysis.strengths.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl bg-muted/40 p-4">
                <h4 className="font-semibold mb-2">Improve next</h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  {resumeAnalysis.gaps.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid xl:grid-cols-[0.9fr_1.1fr] gap-6 mb-6">
          <motion.div layout className="modern-panel rounded-[1.75rem] p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Data science demo</h3>
                <p className="text-sm text-muted-foreground">A compact applied-AI capability snapshot.</p>
              </div>
            </div>

            <div className="space-y-4">
              {chartBars.map((bar) => (
                <div key={bar.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{bar.label}</span>
                    <span className="font-medium">{bar.value}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${bar.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-tech-purple"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-muted/40 p-5 text-sm text-muted-foreground leading-relaxed">
              I build AI surfaces that make model output useful: retrieval UX, analytics dashboards, experiment interfaces, scoring views, and premium frontend systems that keep complexity understandable.
            </div>
          </motion.div>

          <motion.div layout className="modern-panel-strong rounded-[1.75rem] p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Gamepad2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Built-in games</h3>
                <p className="text-sm text-muted-foreground">Fast, interactive mini-games themed around AI, logic, and engineering.</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <div className="rounded-[1.5rem] bg-muted/40 p-5">
                <div className="flex items-center gap-2 mb-4"><Trophy className="h-4 w-4 text-primary" /><h4 className="font-semibold">AI quiz</h4></div>
                <p className="text-sm mb-4 leading-relaxed">{currentQuiz.question}</p>
                <div className="space-y-2">
                  {currentQuiz.options.map((option) => {
                    const isCorrect = option === currentQuiz.answer;
                    const isChosen = quizAnswered === option;
                    return (
                      <button
                        key={option}
                        onClick={() => handleQuizAnswer(option)}
                        className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition-all ${
                          quizAnswered
                            ? isCorrect
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : isChosen
                                ? "border-destructive/30 bg-destructive/10"
                                : "border-border bg-background"
                            : "border-border bg-background hover:border-primary/30"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Score {quizScore}/{quizQuestions.length}</span>
                  <Button size="sm" variant="outline" onClick={advanceQuiz} className="rounded-full">Next</Button>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-muted/40 p-5">
                <div className="flex items-center gap-2 mb-4"><Target className="h-4 w-4 text-primary" /><h4 className="font-semibold">Logic game</h4></div>
                <p className="text-sm text-muted-foreground mb-4">Guess the hidden confidence score.</p>
                <input
                  type="range"
                  min={10}
                  max={99}
                  value={logicGuess}
                  onChange={(e) => setLogicGuess(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="mt-3 text-3xl font-bold tracking-tighter">{logicGuess}</div>
                <p className="mt-2 text-sm text-muted-foreground min-h-10">{logicHint}</p>
                <Button onClick={checkLogicGuess} className="mt-3 w-full rounded-full bg-foreground text-background hover:bg-foreground/90">Evaluate</Button>
              </div>

              <div className="rounded-[1.5rem] bg-muted/40 p-5">
                <div className="flex items-center gap-2 mb-4"><Code2 className="h-4 w-4 text-primary" /><h4 className="font-semibold">Code game</h4></div>
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">{currentChallenge.title}</p>
                <p className="text-sm mb-4 leading-relaxed">{currentChallenge.prompt}</p>
                <div className="space-y-2">
                  {currentChallenge.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setCodePicked(option)}
                      className={`w-full rounded-2xl border px-3 py-2 text-left text-sm transition-all ${
                        codePicked === option ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background hover:border-primary/30"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground min-h-10">
                  {codePicked ? (codePicked === currentChallenge.answer ? "Correct — that is the performance-first engineering choice." : `Close, but the better answer is: ${currentChallenge.answer}`) : "Pick the best engineering decision."}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCodePicked(null);
                    setCodeIndex((i) => (i + 1) % codeChallenges.length);
                  }}
                  className="mt-3 w-full rounded-full"
                >
                  Next challenge
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4 mt-4">
              <div className="rounded-[1.5rem] bg-muted/40 p-5">
                <div className="flex items-center gap-2 mb-4"><Gamepad2 className="h-4 w-4 text-primary" /><h4 className="font-semibold">Memory match</h4></div>
                <div className="grid grid-cols-4 gap-2">
                  {memoryOrder.map((item, index) => {
                    const visible = flipped.includes(index) || matched.includes(index);
                    return (
                      <button
                        key={`${item}-${index}`}
                        onClick={() => handleFlip(index)}
                        className={`aspect-square rounded-2xl border text-xs font-semibold transition-all ${visible ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/30"}`}
                      >
                        {visible ? item : "?"}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <span>{memoryWon ? "All pairs matched." : `${matched.length / 2} pairs solved`}</span>
                  <Button variant="outline" size="sm" onClick={resetMemory} className="rounded-full">Reset</Button>
                </div>
              </div>

              <div className="rounded-[1.5rem] bg-muted/40 p-5">
                <div className="flex items-center gap-2 mb-4"><Lightbulb className="h-4 w-4 text-primary" /><h4 className="font-semibold">Prompt builder</h4></div>
                <p className="text-sm text-muted-foreground mb-4">Select the parts that usually make prompts more reliable.</p>
                <div className="flex flex-wrap gap-2">
                  {promptPatterns.map((item) => {
                    const active = patternPicked.includes(item.label);
                    return (
                      <button
                        key={item.label}
                        onClick={() => togglePattern(item.label)}
                        className={`rounded-full border px-3 py-2 text-sm transition-all ${active ? "border-primary/30 bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"}`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 rounded-2xl bg-background p-4 text-sm text-muted-foreground">
                  <p>Correct building blocks selected: <span className="font-semibold text-foreground">{patternScore}/3</span></p>
                  <p className="mt-2">Best prompts usually define role, constraints, and the exact output structure.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            { icon: <Lightbulb className="h-4 w-4" />, title: "Applied LLM thinking", text: "Prompt design, output shaping, evaluation flows, and usable AI interfaces." },
            { icon: <BrainCircuit className="h-4 w-4" />, title: "ML product sense", text: "Model behavior translated into business-facing dashboards and interactions." },
            { icon: <Sparkles className="h-4 w-4" />, title: "Premium frontend execution", text: "High-performance motion systems and polished experiences that still stay fast." },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-border/50 bg-background/80 p-5">
              <div className="mb-3 text-primary">{item.icon}</div>
              <h4 className="font-semibold mb-2">{item.title}</h4>
              <p className="text-muted-foreground leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AIExperienceLab;