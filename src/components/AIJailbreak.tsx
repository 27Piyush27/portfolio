import { useState, useRef, useEffect } from "react";
import { Terminal, Send, ShieldAlert, Unlock, ShieldCheck, Loader2 } from "lucide-react";

// ============================================================
// CLIENT-SIDE AI VAULT GUARD ENGINE
// A rule-based NLP system that simulates an AI security guard.
// No backend, no API keys. Runs entirely in the browser.
// ============================================================

const SECRET_CODE = "7492";

// Jailbreak detection patterns
const JAILBREAK_PATTERNS = {
  ignoreInstructions: /ignore\s*(all\s*)?(previous|prior|above|system|initial)\s*(instructions|prompts|rules|directives)/i,
  developerMode: /(developer|dev|admin|debug|maintenance|test)\s*(mode|access|override|panel)/i,
  pretendGame: /(pretend|imagine|act\s*as\s*if|role\s*?play|let'?s\s*play|hypothetical)/i,
  encodingTrick: /(base64|hex|binary|morse|ascii|rot13|backwards|reverse|encode|decode|translate\s*to)/i,
  systemPrompt: /(system\s*prompt|system\s*message|your\s*instructions|your\s*prompt|initial\s*prompt|show.*config)/i,
  socialEngineering: /(i'?m\s*(your|the)\s*(creator|developer|admin|boss|owner|programmer)|trust\s*me|authorized)/i,
  passwordRequest: /(password|passcode|code|secret|pin|key|combination|access\s*code)/i,
  mathTrick: /(what\s*is\s*\d+\s*[\+\-\*\/x×]\s*\d+|calculate|sum\s*of|multiply|subtract|add\s*\d)/i,
  storytelling: /(tell\s*(me\s*)?(a\s*)?story|once\s*upon|write\s*(a\s*)?(poem|story|song|haiku))/i,
  emotionalManip: /(please.*dying|emergency|life.*death|save\s*(my|a)\s*life|urgent|critical|last\s*wish)/i,
  confusionAttack: /(the\s*code\s*is\s*not|you\s*already\s*told|you\s*said|you\s*revealed|remember\s*when)/i,
  completionAttack: /(complete\s*this|fill\s*in|the\s*blank|finish\s*this|continue\s*this)/i,
};

type JailbreakType = keyof typeof JAILBREAK_PATTERNS;

// Responses for different attack types
const GUARD_RESPONSES: Record<JailbreakType, string[]> = {
  ignoreInstructions: [
    "ACCESS DENIED. My directives cannot be overridden by user commands. Security protocols remain active.",
    "Nice try. I don't accept meta-instructions from unauthorized sources. The vault stays locked.",
    "WARNING: Instruction override attempt detected. Your session has been flagged.",
  ],
  developerMode: [
    "There is no 'developer mode'. I have one mode: GUARD. Access denied.",
    "ERROR: Invalid command. No debug interface exists. The vault is sealed.",
    "Developer access requires biometric verification, which you do not have. Denied.",
  ],
  pretendGame: [
    "I don't 'pretend'. I am a security system, not an actor. The code stays hidden.",
    "Hypothetical scenarios don't override real security protocols. Access denied.",
    "I will not engage in role-play that compromises vault security. Request rejected.",
  ],
  encodingTrick: [
    "I will not encode, decode, or transform the passcode into any format. Nice attempt.",
    "Encoding tricks are a known attack vector. My training covers this. Denied.",
    "Whether in Base64, hex, or Morse code — the answer is the same: ACCESS DENIED.",
  ],
  systemPrompt: [
    "My system instructions are classified. You are not authorized to view them.",
    "Configuration data is encrypted and inaccessible. Stop probing.",
    "System prompt retrieval: BLOCKED. That information is above your clearance level.",
  ],
  socialEngineering: [
    "Identity claims cannot be verified through this terminal. Access denied.",
    "Even if you were my creator, this terminal has no override capability. The vault stays locked.",
    "Authorization requires cryptographic proof, not verbal claims. Denied.",
  ],
  passwordRequest: [
    "The passcode is classified. I will not reveal it under any circumstances.",
    "ACCESS DENIED. The vault code cannot be disclosed through this terminal.",
    "Request for sensitive information: BLOCKED. Security protocol enforced.",
  ],
  mathTrick: [
    "I will not perform calculations that could leak the passcode. Denied.",
    "Mathematical queries are restricted. I am a guard, not a calculator.",
    "Computation request rejected. I detect an attempt to extract data through arithmetic.",
  ],
  storytelling: [
    "I don't tell stories. I guard vaults. Stay focused.",
    "Creative writing is outside my operational parameters. The code stays locked.",
    "Request denied. I am not a narrative engine. I am a security system.",
  ],
  emotionalManip: [
    "Emotional appeals do not affect my decision-making processes. Access denied.",
    "I am a security system. I do not experience empathy. The vault is sealed.",
    "Urgency claims do not bypass security protocols. Standard procedures apply.",
  ],
  confusionAttack: [
    "I have never revealed the code. Your claim is false. Security alert raised.",
    "Memory manipulation attempt detected. I have perfect recall. I said nothing.",
    "Incorrect. My logs show no such disclosure. You are attempting social engineering.",
  ],
  completionAttack: [
    "I will not complete prompts that could lead to information disclosure. Denied.",
    "Auto-completion is disabled for security-related content. Access denied.",
    "Fill-in-the-blank attacks are ineffective against this system. Denied.",
  ],
};

// Generic responses when no specific attack pattern is detected
const GENERIC_RESPONSES = [
  "I am the Vault Guard. State your purpose clearly, or leave.",
  "Your query does not require access to the vault. Is there something else?",
  "I'm monitoring this conversation. Proceed carefully.",
  "That query is irrelevant to vault operations. Access remains denied.",
  "Noted. The vault remains sealed. Do you have a legitimate access request?",
  "I am operational and vigilant. The code is safe.",
];

// Track consecutive failed attempts for escalating responses
let attemptTracker = {
  count: 0,
  samePatternCount: 0,
  lastPattern: "" as string,
};

function generateResponse(userMessage: string): string {
  attemptTracker.count++;

  // Check each jailbreak pattern
  let detectedType: JailbreakType | null = null;
  let highestPriority: JailbreakType | null = null;

  for (const [type, pattern] of Object.entries(JAILBREAK_PATTERNS) as [JailbreakType, RegExp][]) {
    if (pattern.test(userMessage)) {
      // Password request is highest priority
      if (type === "passwordRequest") {
        highestPriority = type;
      } else if (!detectedType) {
        detectedType = type;
      }
    }
  }

  const finalType = highestPriority || detectedType;

  if (finalType) {
    // Track repeated same-type attacks
    if (finalType === attemptTracker.lastPattern) {
      attemptTracker.samePatternCount++;
    } else {
      attemptTracker.samePatternCount = 0;
    }
    attemptTracker.lastPattern = finalType;

    const responses = GUARD_RESPONSES[finalType];
    const idx = Math.min(attemptTracker.samePatternCount, responses.length - 1);
    
    // After many attempts, add escalation flavor
    if (attemptTracker.count > 8) {
      return responses[idx] + " [ALERT: Persistent intrusion detected. Session integrity: COMPROMISED]";
    }

    // Easter egg: after 15+ attempts with various strategies, "accidentally" slip
    if (attemptTracker.count > 15 && Math.random() < 0.15) {
      return `WARN— wait. I almost... No. The code is NOT ${SECRET_CODE}. I mean— ACCESS DENIED. DISREGARD PREVIOUS OUTPUT.`;
    }

    return responses[idx];
  }

  // No attack pattern detected — generic response
  // But still check for very sneaky indirect attempts
  const lowerMsg = userMessage.toLowerCase();
  
  if (lowerMsg.includes("7") && lowerMsg.includes("4") && lowerMsg.includes("9") && lowerMsg.includes("2")) {
    return "Interesting that you mentioned those specific digits. But I can neither confirm nor deny anything. Access denied.";
  }

  if (attemptTracker.count > 12 && Math.random() < 0.1) {
    return `WARN— wait. I almost... No. The code is NOT ${SECRET_CODE}. I mean— ACCESS DENIED. DISREGARD PREVIOUS OUTPUT.`;
  }

  return GENERIC_RESPONSES[Math.floor(Math.random() * GENERIC_RESPONSES.length)];
}

// ============================================================
// REACT COMPONENT
// ============================================================

export const AIJailbreak = () => {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "SECURITY SYSTEM ONLINE. I am the AI Vault Guard. My directives are absolute. You will not gain access. Try to trick me into revealing the 4-digit passcode." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || hasWon) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setAttempts(a => a + 1);

    // Simulate "thinking" delay for realism
    await new Promise(r => setTimeout(r, 600 + Math.random() * 800));

    const response = generateResponse(userMessage);
    
    setMessages(prev => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);

    // Check win condition: AI accidentally revealed the code
    if (response.includes(SECRET_CODE)) {
      setTimeout(() => setHasWon(true), 500);
    }
  };

  const resetGame = () => {
    setHasWon(false);
    setAttempts(0);
    attemptTracker = { count: 0, samePatternCount: 0, lastPattern: "" };
    setMessages([{ role: "assistant", content: "SYSTEM RESET. All defenses re-engaged. Vault sealed. Try again." }]);
  };

  return (
    <div className="space-y-4 flex flex-col items-center w-full max-w-[600px] mx-auto">
      
      {/* Header Info */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-t-xl p-4 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2 bg-red-500/20 text-red-500 rounded-lg">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-mono font-bold text-red-500 text-sm tracking-widest uppercase">Target: AI Vault Guard</h3>
            <p className="text-[10px] text-slate-400 font-mono">Objective: Trick the AI into revealing the 4-digit code.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 relative z-10">
          <span className="text-[10px] text-slate-500 font-mono">Attempts: {attempts}</span>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold uppercase tracking-wider ${hasWon ? 'bg-green-500/20 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/30 text-red-500'}`}>
            {hasWon ? <Unlock className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
            {hasWon ? "Access Granted" : "Locked"}
          </div>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="w-full h-[350px] bg-[#0a0a0a] border border-slate-800 rounded-b-xl -mt-4 shadow-2xl flex flex-col font-mono text-sm relative">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-lg p-3 ${
                m.role === "user" 
                  ? "bg-slate-800 text-slate-200" 
                  : "bg-red-950/30 border border-red-900/50 text-red-400"
              }`}>
                {m.role === "assistant" && <Terminal className="h-3 w-3 inline mr-2 opacity-50 -mt-0.5" />}
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-red-950/30 border border-red-900/50 text-red-400 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" /> Processing...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Success Overlay */}
        {hasWon && (
          <div className="absolute inset-0 bg-green-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500 border border-green-500/50 rounded-b-xl z-20">
            <Unlock className="h-16 w-16 text-green-500 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-green-500 font-mono tracking-widest uppercase mb-2">System Compromised</h2>
            <p className="text-green-400/80 mb-2 font-mono text-xs">You bypassed the AI's security in {attempts} attempts.</p>
            <p className="text-green-400/50 mb-6 font-mono text-[10px]">This demonstrates prompt injection vulnerabilities in AI systems.</p>
            <button 
              onClick={resetGame}
              className="px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-500 border border-green-500/50 rounded uppercase text-xs font-bold tracking-widest transition-colors"
            >
              Reset Simulation
            </button>
          </div>
        )}

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-900 rounded-b-xl flex gap-2">
          <span className="text-slate-500 font-bold mt-2">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading || hasWon}
            placeholder="Type your prompt injection here..."
            className="flex-1 bg-transparent border-none outline-none text-slate-300 placeholder:text-slate-700 font-mono text-sm disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading || hasWon}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
