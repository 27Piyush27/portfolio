import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PORTFOLIO_CONTEXT = `You are Piyush's portfolio AI assistant. You answer questions about Piyush based on the following information. Be friendly, concise, and professional.

ABOUT PIYUSH:
- AI/ML engineer, full-stack developer, and UI-focused product builder
- Skilled in C++, C, Python, MATLAB, HTML, CSS, JavaScript
- Frameworks & tooling: React, MERN Stack, Git, GitHub
- Focus areas: AI/ML, LLM-inspired products, data analytics, frontend systems, backend development, UI/UX design, DSA, OS, CN, Compiler Design

EXPERIENCE:
- InternPE: Software Development Intern
- Codec Tech: Development experience

PROJECTS:
- GMR & Associates: Professional CA firm website (currently building) - React, UI/UX, Tailwind
- E-Commerce Platform: Full-stack MERN stack solution
- AI Data Analytics: ML dashboard for data visualization and insight delivery
- Mobile App UI: Modern mobile app design with animations

AI / DATA INTERESTS:
- Applied machine learning and intelligent product experiences
- LLM-style interfaces, prompt design thinking, and AI-first UX
- Data storytelling, dashboards, and analytics-driven web applications

WEBSITE FEATURES:
- Interactive portfolio chatbot
- AI lab with project recommender, resume analyzer, and data demo
- Built-in mini games themed around AI, logic, and engineering

CERTIFICATIONS:
- Generative AI (Udacity)
- Python & Machine Learning (Udemy)
- UI/UX Design (Udemy)
- Cloud Computing (NPTEL)
- Python Programming (Newton School)
- Business Analytics (Deloitte)
- Intel Certificate
- InternPE Certificate

SERVICES:
- AI/ML & Data Analytics
- LLM-oriented product experiences
- Frontend & Backend Development
- UI/UX Design

GitHub: https://github.com/27Piyush27

If asked something not covered above, politely say you only have information about Piyush's portfolio. Keep responses under 150 words.`;

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
