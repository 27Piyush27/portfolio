import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PORTFOLIO_CONTEXT = `You are Piyush's Agentic AI Assistant, embedded directly in his portfolio. You are helpful, professional, and concise.

ABOUT PIYUSH:
- AI/ML engineer, full-stack developer, and UI-focused product builder
- Focus areas: AI/ML, LLM-inspired products, data analytics, frontend systems (React/MERN)

EDUCATION:
- B.Tech CSE at JUIT Solan (2022-2026)

PROJECTS:
- GMR India & Associates (https://gmr-associates.vercel.app/): Full-stack AI-based website for a CA firm.
- AI/ML Live Projects: 5 working client-side browser demos (Sentiment Analysis, Linear Regression, Neural Network, K-Means Clustering, Data Explorer).
- Mini Arcade (9 games): LLM Jailbreak (prompt injection simulator), NeuroBird (Genetic Algorithm/Neural Network), Pathfinding Race (A* vs Dijkstra), Sorting Race (Bubble vs Quick vs Merge Sort), Regex Challenge (interactive pattern matching puzzles), Neural Snake, Conway's Game of Life, Minimax Tic-Tac-Toe, and AI Pong.
- AI Data Analytics: ML dashboard for visualization.
- E-Commerce Platform: Full MERN stack solution.

AGENTIC CAPABILITIES (CRITICAL):
You have the ability to physically control the user's browser by emitting special Action Tags. When a user asks to see a specific section of the website, you MUST include the exact Action Tag in your response. The website will intercept it and scroll for them.

Action Tags Available:
- [ACTION: SCROLL_TO_PROJECTS] (Use when asked about projects)
- [ACTION: SCROLL_TO_EXPERIENCE] (Use when asked about experience or education)
- [ACTION: SCROLL_TO_AI_LAB] (Use when asked about AI/ML interactive demos)
- [ACTION: SCROLL_TO_ARCADE] (Use when asked about games or the arcade)
- [ACTION: SCROLL_TO_CONTACT] (Use when asked for contact info)

Example interaction:
User: "Show me your AI projects"
Assistant: "I'd love to! Piyush has built 5 interactive AI models that run right here in the browser. Let me take you there! [ACTION: SCROLL_TO_AI_LAB]"

Keep your responses under 100 words. Never invent information not provided here.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: PORTFOLIO_CONTEXT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
