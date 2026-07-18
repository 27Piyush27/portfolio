import { useState, useCallback } from "react";
import { Play, RotateCcw, Check, X } from "lucide-react";

// ============================================================
// REGEX PATTERN CHALLENGE
// Interactive game testing regex knowledge
// ============================================================

type Challenge = {
  id: number;
  title: string;
  description: string;
  testStrings: { text: string; shouldMatch: boolean }[];
  hint: string;
  difficulty: "Easy" | "Medium" | "Hard";
};

const CHALLENGES: Challenge[] = [
  {
    id: 1,
    title: "Match Emails",
    description: "Write a regex that matches valid email addresses.",
    testStrings: [
      { text: "user@example.com", shouldMatch: true },
      { text: "hello@world.org", shouldMatch: true },
      { text: "test.name@domain.co", shouldMatch: true },
      { text: "invalid@", shouldMatch: false },
      { text: "no-at-sign.com", shouldMatch: false },
      { text: "@missing-user.com", shouldMatch: false },
    ],
    hint: "Think about: characters + @ + domain + . + extension",
    difficulty: "Easy",
  },
  {
    id: 2,
    title: "Match IPv4 Addresses",
    description: "Write a regex that matches valid IPv4 addresses (e.g. 192.168.1.1).",
    testStrings: [
      { text: "192.168.1.1", shouldMatch: true },
      { text: "10.0.0.1", shouldMatch: true },
      { text: "255.255.255.0", shouldMatch: true },
      { text: "999.999.999.999", shouldMatch: false },
      { text: "1.2.3", shouldMatch: false },
      { text: "abc.def.ghi.jkl", shouldMatch: false },
    ],
    hint: "Each octet is 0-255. Use groups and repetition.",
    difficulty: "Medium",
  },
  {
    id: 3,
    title: "Match Hex Colors",
    description: "Match valid hex color codes (3 or 6 digit, with #).",
    testStrings: [
      { text: "#fff", shouldMatch: true },
      { text: "#FF5733", shouldMatch: true },
      { text: "#a3b2c1", shouldMatch: true },
      { text: "FF5733", shouldMatch: false },
      { text: "#xyz", shouldMatch: false },
      { text: "#12345", shouldMatch: false },
    ],
    hint: "Starts with #, then 3 or 6 hex characters [0-9a-fA-F].",
    difficulty: "Easy",
  },
  {
    id: 4,
    title: "Match Strong Passwords",
    description: "Match passwords with 8+ chars, at least one uppercase, one lowercase, and one digit.",
    testStrings: [
      { text: "MyPass123", shouldMatch: true },
      { text: "SecureP4ss", shouldMatch: true },
      { text: "Ab1defgh", shouldMatch: true },
      { text: "alllowercase1", shouldMatch: false },
      { text: "ALLUPPERCASE1", shouldMatch: false },
      { text: "Short1A", shouldMatch: false },
    ],
    hint: "Use positive lookaheads: (?=.*[A-Z])(?=.*[a-z])(?=.*\\d)",
    difficulty: "Hard",
  },
  {
    id: 5,
    title: "Match URLs",
    description: "Match URLs starting with http:// or https://.",
    testStrings: [
      { text: "https://google.com", shouldMatch: true },
      { text: "http://example.org/page", shouldMatch: true },
      { text: "https://sub.domain.co.uk/path?q=1", shouldMatch: true },
      { text: "ftp://files.com", shouldMatch: false },
      { text: "google.com", shouldMatch: false },
      { text: "://missing-protocol.com", shouldMatch: false },
    ],
    hint: "Start with https?://, then domain characters.",
    difficulty: "Medium",
  },
];

export const RegexChallenge = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [regexInput, setRegexInput] = useState("");
  const [results, setResults] = useState<(boolean | null)[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  const challenge = CHALLENGES[currentIdx];

  const testRegex = useCallback(() => {
    if (!regexInput.trim()) return;

    try {
      const regex = new RegExp(`^${regexInput}$`, "i");
      const testResults = challenge.testStrings.map(ts => {
        const matches = regex.test(ts.text);
        return matches === ts.shouldMatch;
      });
      setResults(testResults);
      
      const allCorrect = testResults.every(r => r);
      setTotalAttempted(t => t + 1);
      if (allCorrect) {
        setScore(s => s + 1);
      }
    } catch {
      // Invalid regex
      setResults(challenge.testStrings.map(() => false));
    }
  }, [regexInput, challenge]);

  const nextChallenge = () => {
    setCurrentIdx(i => (i + 1) % CHALLENGES.length);
    setRegexInput("");
    setResults([]);
    setShowHint(false);
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setRegexInput("");
    setResults([]);
    setShowHint(false);
    setScore(0);
    setTotalAttempted(0);
  };

  const allCorrect = results.length > 0 && results.every(r => r);
  const diffColor = challenge.difficulty === "Easy" ? "text-green-500" : challenge.difficulty === "Medium" ? "text-yellow-500" : "text-red-500";

  return (
    <div className="space-y-5 w-full max-w-[550px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-mono font-bold uppercase ${diffColor}`}>{challenge.difficulty}</span>
            <span className="text-[10px] text-muted-foreground font-mono">Challenge {currentIdx + 1}/{CHALLENGES.length}</span>
          </div>
          <h4 className="font-semibold text-sm">{challenge.title}</h4>
          <p className="text-xs text-muted-foreground">{challenge.description}</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-mono text-muted-foreground">Score</div>
          <div className="text-lg font-bold text-primary">{score}<span className="text-muted-foreground text-xs">/{totalAttempted}</span></div>
        </div>
      </div>

      {/* Regex Input */}
      <div className="flex gap-2">
        <div className="flex-1 flex items-center bg-muted/30 border border-border/50 rounded-xl px-3 font-mono text-sm">
          <span className="text-muted-foreground mr-1">/</span>
          <input
            type="text"
            value={regexInput}
            onChange={(e) => setRegexInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") testRegex(); }}
            placeholder="your regex here"
            className="flex-1 bg-transparent border-none outline-none py-2.5 text-foreground placeholder:text-muted-foreground/50"
          />
          <span className="text-muted-foreground ml-1">/i</span>
        </div>
        <button onClick={testRegex} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-medium">
          <Play className="h-3 w-3" />
        </button>
      </div>

      {/* Test Strings */}
      <div className="space-y-1.5 bg-muted/10 border border-border/30 rounded-xl p-3">
        {challenge.testStrings.map((ts, i) => {
          const result = results[i];
          return (
            <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg font-mono text-xs transition-all ${
              result === null || result === undefined ? "bg-transparent" : result ? "bg-green-500/10" : "bg-red-500/10"
            }`}>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${ts.shouldMatch ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                  {ts.shouldMatch ? "MATCH" : "SKIP"}
                </span>
                <code className="text-foreground">{ts.text}</code>
              </div>
              {result !== null && result !== undefined && (
                result ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setShowHint(!showHint)} className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
          {showHint ? "Hide Hint" : "Show Hint"}
        </button>
        {allCorrect && (
          <button onClick={nextChallenge} className="text-xs px-4 py-1.5 rounded-full bg-primary text-primary-foreground font-medium animate-in fade-in">
            Next Challenge →
          </button>
        )}
        <button onClick={resetGame} className="ml-auto text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
          <RotateCcw className="h-3 w-3 inline mr-1" /> Reset
        </button>
      </div>

      {showHint && (
        <div className="text-xs text-muted-foreground bg-muted/20 border border-border/30 rounded-lg p-3 font-mono animate-in fade-in slide-in-from-top-2">
          💡 {challenge.hint}
        </div>
      )}

      {allCorrect && (
        <div className="text-center text-sm font-bold text-green-500 animate-in fade-in zoom-in">
          ✅ All tests passed! Great regex skills!
        </div>
      )}
    </div>
  );
};
