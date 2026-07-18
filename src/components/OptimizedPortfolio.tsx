import { useState, useEffect, useRef, Suspense, lazy, memo, useCallback, useMemo } from "react";
import AIExperienceLab from "@/components/AIExperienceLab";
import { ChatBot } from "@/components/ChatBot";
import { motion, useScroll, useTransform, useSpring, useInView, AnimatePresence, useMotionValueEvent, useVelocity } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Typewriter } from "@/components/Typewriter";
import { useSmoothScroll } from "@/components/SmoothScroll";
import { TextReveal, LetterReveal, LineReveal, MagneticButton, TiltCard, GradientBlob, ParallaxReveal } from "@/components/animations";
import { Code2, Palette, Smartphone, Globe, Mail, Phone, Github, Linkedin, ExternalLink, ChevronDown, Menu, X, MapPin, Calendar, Award, Briefcase, GraduationCap, Send, Sparkles, Zap, Star, Brain, Download, ArrowRight, ArrowUpRight, Quote, CheckCircle2, Loader2, Sun, Moon } from "lucide-react";

import udacityGenaiCert from "@/assets/udacity-genai-certificate.avif";
import udemyPythonMlCert from "@/assets/udemy-python-ml-certificate.avif";
import udemyUiuxCert from "@/assets/udemy-uiux-certificate.avif";
import nptelCloudCert from "@/assets/nptel-cloud-certificate.avif";
import newtonPythonCert from "@/assets/newton-python-certificate.avif";
import deloitteCert from "@/assets/deloitte-certificate.avif";
import intelCert from "@/assets/intel-certificate.avif";
import internpeCert from "@/assets/internpe-certificate.png";
import promptEngCert from "@/assets/prompt-engineering-certificate.jpg";

const Hero3D = lazy(() => import("@/components/Hero3D"));

// ===== NEURAL NETWORK PARTICLE CANVAS =====
const NeuralCanvas = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0;
    const nodes: { x: number; y: number; vx: number; vy: number; radius: number; phase: number }[] = [];
    const nodeCount = 45;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    };

    const init = () => {
      resize();
      nodes.length = 0;
      for (let i = 0; i < nodeCount; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2.5 + 1,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, w, h);
      const isDark = document.documentElement.classList.contains("dark");
      const primaryColor = isDark ? "139, 92, 246" : "45, 212, 168";
      const violetColor = isDark ? "167, 139, 250" : "139, 92, 246";

      // Update & draw nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        // Mouse attraction — gentle pull
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          node.vx += (dx / dist) * 0.015;
          node.vy += (dy / dist) * 0.015;
        }

        // Damping
        node.vx *= 0.995;
        node.vy *= 0.995;

        // Bounce
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        // Pulsing radius
        const pulse = Math.sin(time * 0.001 + node.phase) * 0.5 + 0.5;
        const r = node.radius * (0.8 + pulse * 0.4);

        // Draw node with glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        const color = i % 3 === 0 ? violetColor : primaryColor;
        ctx.fillStyle = `rgba(${color}, ${0.4 + pulse * 0.3})`;
        ctx.fill();

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${0.04 + pulse * 0.03})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const alpha = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            const useViolet = (i + j) % 4 === 0;
            ctx.strokeStyle = `rgba(${useViolet ? violetColor : primaryColor}, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    init();
    animFrameRef.current = requestAnimationFrame(draw);
    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="neural-canvas-container">
      <canvas ref={canvasRef} className="neural-canvas" />
    </div>
  );
});

// ===== LOADING SCREEN — Neural network animation =====
const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(timer); setTimeout(onComplete, 400); return 100; }
        return p + 2.5;
      });
    }, 25);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* Neural network SVG animation */}
      <motion.div
        className="relative mb-10 w-24 h-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Connection lines */}
          {[
            [20, 30, 50, 20], [20, 30, 50, 50], [20, 70, 50, 50], [20, 70, 50, 80],
            [50, 20, 80, 40], [50, 50, 80, 40], [50, 50, 80, 60], [50, 80, 80, 60],
          ].map(([x1, y1, x2, y2], i) => (
            <motion.line
              key={`line-${i}`}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-primary/30"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.08, ease: "easeOut" }}
            />
          ))}
          {/* Nodes */}
          {[
            [20, 30], [20, 70], [50, 20], [50, 50], [50, 80], [80, 40], [80, 60]
          ].map(([cx, cy], i) => (
            <motion.circle
              key={`node-${i}`}
              cx={cx} cy={cy} r="4"
              className={i % 2 === 0 ? "fill-primary" : "fill-accent-violet"}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: [0.4, 1, 0.4] }}
              transition={{
                scale: { duration: 0.4, delay: 0.1 + i * 0.1, type: "spring" },
                opacity: { duration: 2, delay: 0.5 + i * 0.15, repeat: Infinity, ease: "easeInOut" }
              }}
            />
          ))}
        </svg>
      </motion.div>

      <div className="w-48 h-[2px] bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent-violet)))"
          }}
        />
      </div>
      <motion.p
        className="text-xs text-muted-foreground mt-4 font-mono"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Initializing neural interface...
      </motion.p>
    </motion.div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-6 h-6 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
  </div>
);

// ===== Animation Variants — upgraded spring physics =====
const appleEase = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: appleEase } },
};

const fadeLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: appleEase } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.9, ease: appleEase } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.88, y: 30 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: appleEase } },
};

const clipReveal = {
  hidden: { clipPath: "inset(100% 0 0 0)", opacity: 0 },
  visible: { clipPath: "inset(0 0 0 0)", opacity: 1, transition: { duration: 1, ease: appleEase } },
};

const slideReveal = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0% 0 0)", transition: { duration: 1, ease: appleEase } },
};

// ===== Interactive Cursor with Trail =====
const InteractiveCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let rafId: number;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const trail = { x: 0, y: 0 };

    const animate = () => {
      // Cursor ring — spring-physics lag
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.left = `${current.x}px`;
        cursorRef.current.style.top = `${current.y}px`;
      }

      // Trail — even slower for dreamy effect
      trail.x += (target.x - trail.x) * 0.06;
      trail.y += (target.y - trail.y) * 0.06;
      if (trailRef.current) {
        trailRef.current.style.left = `${trail.x}px`;
        trailRef.current.style.top = `${trail.y}px`;
      }

      rafId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (cursorDotRef.current) {
        cursorDotRef.current.style.left = `${e.clientX}px`;
        cursorDotRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [role="button"]')) setIsHovering(true);
    };
    const handleMouseOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a, button, [role="button"]')) setIsHovering(false);
    };

    rafId = requestAnimationFrame(animate);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseout', handleMouseOut, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  return (
    <>
      <div ref={trailRef} className="cursor-trail hidden md:block" />
      <div ref={cursorRef} className={`cursor-ring hidden md:flex items-center justify-center ${isHovering ? 'cursor-ring-expanded' : ''}`} />
      <div ref={cursorDotRef} className="cursor-dot hidden md:block" />
    </>
  );
};

// ===== Dark Mode =====
const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(d => !d) };
};

// Spotlight Card with mouse tracking + glow halo
const SpotlightCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
    cardRef.current.style.setProperty("--halo-x", `${x}px`);
    cardRef.current.style.setProperty("--halo-y", `${y}px`);
  }, []);

  return (
    <div ref={cardRef} onMouseMove={handleMouseMove} className={`spotlight-card glow-halo ${className}`}>
      {children}
    </div>
  );
};

// Counter Animation — spring physics
const useCounter = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref as any, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end, duration]);

  return { count, ref };
};

// Animated Section with scroll-triggered reveal — earlier trigger for fluidity
const AnimatedSection = ({ children, id, className }: { children: React.ReactNode; id: string; className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.section id={id} ref={ref} className={className} initial="hidden" animate={isInView ? "visible" : "hidden"} variants={staggerContainer}>
      {children}
    </motion.section>
  );
};

// Section Divider with gradient mesh
const SectionDivider = () => (
  <div className="section-divider-mesh" aria-hidden="true" />
);

// Skill Marquee with hover pause
const SkillMarquee = memo(({ items }: { items: string[] }) => (
  <div className="overflow-hidden py-6">
    <div className="marquee-track">
      {[...items, ...items].map((skill, i) => (
        <motion.span
          key={i}
          className="skill-badge whitespace-nowrap press-effect cursor-default"
          whileHover={{ scale: 1.1, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {skill}
        </motion.span>
      ))}
    </div>
  </div>
));

// Testimonials
const testimonials = [
  { name: "Rajesh Kumar", role: "CEO, TechStartup", quote: "Piyush delivered an exceptional website that exceeded our expectations. His attention to detail and creative approach made all the difference.", avatar: "RK" },
  { name: "Ananya Sharma", role: "Product Manager", quote: "Working with Piyush was a fantastic experience. He understood our vision perfectly and translated it into a beautiful, functional product.", avatar: "AS" },
  { name: "Vikram Singh", role: "Founder, DesignCo", quote: "The quality of work and professionalism is outstanding. Piyush has a rare combination of technical skill and design sensibility.", avatar: "VS" },
];

const TestimonialSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % testimonials.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -30, filter: "blur(4px)" }}
          transition={{ duration: 0.7, ease: appleEase }}
          className="text-center"
        >
          <motion.div
            className="text-6xl text-foreground/5 mb-4"
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
          >
            "
          </motion.div>
          <p className="text-xl sm:text-2xl lg:text-3xl text-foreground leading-relaxed font-medium mb-8 tracking-tight">
            {testimonials[current].quote}
          </p>
          <div className="flex items-center justify-center gap-4">
            <motion.div
              className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center text-background font-semibold text-sm"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.3 }}
            >
              {testimonials[current].avatar}
            </motion.div>
            <div className="text-left">
              <p className="font-semibold text-sm">{testimonials[current].name}</p>
              <p className="text-muted-foreground text-sm">{testimonials[current].role}</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'bg-foreground w-8' : 'bg-muted-foreground/20 w-1.5'}`}
          />
        ))}
      </div>
    </div>
  );
};

// Contact Form with enhanced micro-interactions
const ContactForm = () => {
  const [formState, setFormState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [shakeField, setShakeField] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.includes('@')) { setShakeField('email'); setTimeout(() => setShakeField(null), 600); return; }
    if (!formData.name) { setShakeField('name'); setTimeout(() => setShakeField(null), 600); return; }
    setFormState('sending');
    setTimeout(() => { setFormState('sent'); setTimeout(() => setFormState('idle'), 3000); }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      {(['name', 'email'] as const).map(field => (
        <motion.div
          key={field}
          className={`relative ${shakeField === field ? 'form-shake' : ''}`}
          whileFocus={{ scale: 1.01 }}
        >
          <motion.input
            type={field === 'email' ? 'email' : 'text'}
            value={formData[field]}
            onChange={e => setFormData(d => ({ ...d, [field]: e.target.value }))}
            onFocus={() => setFocusedField(field)}
            onBlur={() => setFocusedField(null)}
            className="w-full px-4 py-3.5 bg-muted/50 border-0 rounded-2xl text-foreground placeholder-transparent peer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
            placeholder={field}
            id={field}
            animate={focusedField === field ? { scale: 1.01 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
          <label
            htmlFor={field}
            className={`absolute left-4 transition-all duration-200 pointer-events-none ${
              focusedField === field || formData[field]
                ? '-top-2.5 text-xs text-primary bg-background px-1.5 rounded'
                : 'top-3.5 text-sm text-muted-foreground'
            }`}
          >
            {field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
        </motion.div>
      ))}

      <div className="relative">
        <textarea
          value={formData.message}
          onChange={e => setFormData(d => ({ ...d, message: e.target.value }))}
          onFocus={() => setFocusedField('message')}
          onBlur={() => setFocusedField(null)}
          rows={4}
          className="w-full px-4 py-3.5 bg-muted/50 border-0 rounded-2xl text-foreground placeholder-transparent peer focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 resize-none"
          placeholder="message"
          id="message"
        />
        <label
          htmlFor="message"
          className={`absolute left-4 transition-all duration-200 pointer-events-none ${
            focusedField === 'message' || formData.message
              ? '-top-2.5 text-xs text-primary bg-background px-1.5 rounded'
              : 'top-3.5 text-sm text-muted-foreground'
          }`}
        >
          Message
        </label>
      </div>

      <MagneticButton strength={0.15} className="w-full">
        <motion.button
          type="submit"
          disabled={formState !== 'idle'}
          className="w-full py-3.5 rounded-2xl font-semibold text-primary-foreground bg-foreground hover:bg-foreground/90 transition-all duration-300 disabled:opacity-70"
          whileHover={formState === 'idle' ? { scale: 1.02 } : {}}
          whileTap={formState === 'idle' ? { scale: 0.98 } : {}}
        >
          <AnimatePresence mode="wait">
            {formState === 'idle' && (
              <motion.span key="idle" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Send className="h-4 w-4" /> Send Message
              </motion.span>
            )}
            {formState === 'sending' && (
              <motion.span key="sending" className="flex items-center justify-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="h-4 w-4 animate-spin" /> Sending...
              </motion.span>
            )}
            {formState === 'sent' && (
              <motion.span key="sent" className="flex items-center justify-center gap-2" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <CheckCircle2 className="h-4 w-4" /> Sent!
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </MagneticButton>
    </form>
  );
};

// ===== Floating Code Snippet =====
const FloatingCodeSnippet = () => (
  <motion.div
    className="code-snippet-float hidden lg:block -bottom-4 -left-8 z-20"
    initial={{ opacity: 0, y: 20, rotateZ: -2 }}
    animate={{ opacity: 1, y: [0, -6, 0], rotateZ: -2 }}
    transition={{
      opacity: { delay: 1.5, duration: 0.6 },
      y: { delay: 2, duration: 5, repeat: Infinity, ease: "easeInOut" }
    }}
  >
    <div className="text-[10px] leading-[1.6] opacity-90">
      <span className="code-comment"># neural_classifier.py</span><br />
      <span className="code-keyword">import</span> torch<br />
      <span className="code-keyword">from</span> transformers <span className="code-keyword">import</span> AutoModel<br />
      <br />
      <span className="code-keyword">class</span> <span className="code-function">NeuralClassifier</span>:<br />
      &nbsp;&nbsp;<span className="code-keyword">def</span> <span className="code-function">predict</span>(self, x):<br />
      &nbsp;&nbsp;&nbsp;&nbsp;<span className="code-keyword">return</span> self.model(x)
    </div>
  </motion.div>
);

// ===== MAIN COMPONENT =====
const OptimizedPortfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isDark, toggle: toggleDark } = useDarkMode();

  const { scrollYProgress } = useScroll();
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 80, damping: 25, restDelta: 0.001 });

  // Scroll velocity for parallax effects
  const scrollVelocity = useVelocity(scrollYProgress);
  const velocitySpring = useSpring(scrollVelocity, { stiffness: 100, damping: 30 });

  // Apple-style hero parallax — no blur filter for 60fps
  const heroParallaxBg = useTransform(scrollYProgress, [0, 0.3], [0, -80]);
  const heroParallaxFg = useTransform(scrollYProgress, [0, 0.3], [0, -30]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.92]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const scrolled = v > 0.02;
    if (scrolled !== navScrolled) setNavScrolled(scrolled);
  });

  useSmoothScroll();

  const yearsCounter = useCounter(2);
  const projectsCounter = useCounter(15);
  const clientsCounter = useCounter(5);

  const navigation = useMemo(() => [
    { name: "Home", href: "home" },
    { name: "About", href: "about" },
    { name: "Capabilities", href: "capabilities" },
    { name: "AI Lab", href: "ai-lab" },
    { name: "Experience", href: "experience" },
    { name: "Skills", href: "skills" },
    { name: "Services", href: "services" },
    { name: "Projects", href: "projects" },
    { name: "Testimonials", href: "testimonials" },
    { name: "Certificates", href: "certificates" },
    { name: "Internships", href: "internships" },
    { name: "Contact", href: "contact" },
  ], []);

  const allSkills = useMemo(() => ["Python", "C++", "JavaScript", "MATLAB", "React", "MERN Stack", "LLM UX", "Prompt Design", "AI & ML", "Data Analytics", "Model Evaluation", "Dashboard Design", "Frontend Systems", "Backend APIs", "Git", "GitHub"], []);

  const skills = useMemo(() => [
    { category: "Core Stack", items: ["Python", "C++", "JavaScript", "React", "MERN Stack", "MATLAB"], icon: <Code2 className="h-5 w-5" /> },
    { category: "AI & Data", items: ["Machine Learning", "LLM Workflows", "Prompt Design", "Data Analytics", "Model Thinking", "Visualization"], icon: <Brain className="h-5 w-5" /> },
    { category: "Engineering", items: ["Frontend Systems", "Backend Development", "UI/UX Design", "Git", "DSA", "API Design"], icon: <Globe className="h-5 w-5" /> },
  ], []);

  const services = useMemo(() => [
    { icon: <Brain className="h-6 w-6" />, title: "AI/ML Product Engineering", description: "Building applied AI experiences, LLM-inspired flows, and intelligent interfaces that feel useful in real products." },
    { icon: <Code2 className="h-6 w-6" />, title: "Data & Analytics Apps", description: "Turning raw data into decision-ready dashboards, visual systems, and exploratory interfaces." },
    { icon: <Globe className="h-6 w-6" />, title: "Full-Stack Web Engineering", description: "Shipping premium web apps with fast frontend architecture, scalable APIs, and clean system design." },
    { icon: <Palette className="h-6 w-6" />, title: "AI-First UX Design", description: "Designing interactions that explain model behavior clearly and keep advanced tools approachable." },
    { icon: <Smartphone className="h-6 w-6" />, title: "Interactive Product Prototyping", description: "Rapidly prototyping polished experiences for startups, experiments, and developer-facing tools." },
  ], []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Use Lenis if available, otherwise fallback
      const lenis = (window as any).__lenis;
      if (lenis) {
        lenis.scrollTo(element, { duration: 1.2 });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) setActiveSection(entry.target.id);
      });
    }, { threshold: [0.5], rootMargin: '-50px 0px' });
    navigation.forEach(({ href }) => {
      const el = document.getElementById(href);
      if (el) observerRef.current?.observe(el);
    });
    return () => { observerRef.current?.disconnect(); };
  }, [navigation]);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      <div className="min-h-screen bg-background relative">
        <InteractiveCursor />

        {/* Scroll progress — gradient bar */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
          style={{
            scaleX: smoothProgress,
            background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent-violet)))"
          }}
        />

        {/* ===== NAVIGATION ===== */}
        <motion.nav
          className={`fixed top-0 w-full z-50 transition-all duration-500 ${
            navScrolled ? 'bg-background/70 backdrop-blur-2xl border-b border-border/30 shadow-[0_10px_40px_hsl(var(--foreground)/0.08)]' : 'bg-transparent'
          }`}
          initial={{ y: -80 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.6, ease: appleEase }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div className="modern-shell rounded-full px-4 sm:px-5 flex justify-between items-center min-h-14">
              <MagneticButton strength={0.2}>
                <motion.div
                  className="font-bold text-base tracking-tight cursor-pointer"
                  onClick={() => scrollToSection('home')}
                  whileHover={{ opacity: 0.7 }}
                >
                  Piyush Thakur
                </motion.div>
              </MagneticButton>

              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item, i) => (
                  <motion.button
                    key={item.name}
                    onClick={() => scrollToSection(item.href)}
                    className={`text-xs px-3 py-2 rounded-full transition-all duration-300 relative ${
                      activeSection === item.href ? "text-background" : "text-muted-foreground hover:text-foreground"
                    }`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    {activeSection === item.href && (
                      <motion.div
                          className="absolute inset-0 rounded-full bg-foreground shadow-[0_10px_30px_hsl(var(--foreground)/0.18)]"
                        layoutId="activeNavPill"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.name}</span>
                  </motion.button>
                ))}
                  <motion.button onClick={toggleDark} className="modern-chip p-2 rounded-full text-muted-foreground hover:text-foreground transition-all ml-1" whileTap={{ scale: 0.9, rotate: 180 }}>
                  {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </motion.button>
              </div>

               <div className="flex items-center gap-2 md:hidden">
                 <motion.button onClick={toggleDark} className="modern-chip p-2 rounded-full text-muted-foreground" whileTap={{ scale: 0.9 }}>
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </motion.button>
                 <motion.button onClick={() => setIsMenuOpen(!isMenuOpen)} className="modern-chip p-2 rounded-full text-muted-foreground" whileTap={{ scale: 0.9 }}>
                  <AnimatePresence mode="wait">
                    {isMenuOpen ? (
                      <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                        <X className="h-5 w-5" />
                      </motion.div>
                    ) : (
                      <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                        <Menu className="h-5 w-5" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                className="md:hidden mx-4 mt-2 modern-shell rounded-[1.75rem] overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: appleEase }}
              >
                <div className="px-6 pt-2 pb-4 space-y-0.5">
                  {navigation.map((item, i) => (
                    <motion.button
                      key={item.name}
                      onClick={() => scrollToSection(item.href)}
                      className={`block w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                        activeSection === item.href ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                      }`}
                      initial={{ x: -30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.05, ease: appleEase }}
                    >
                      {item.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>

        {/* ===== HERO ===== */}
        <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
          <GradientBlob />

          <motion.div className="absolute inset-0 opacity-15" style={{ y: heroParallaxBg, willChange: 'transform' }}>
            <Suspense fallback={<LoadingSpinner />}>
              <Hero3D />
            </Suspense>
          </motion.div>

          <motion.div
            className="relative z-10 max-w-6xl mx-auto w-full px-6 pt-24"
            style={{
              y: heroParallaxFg,
              opacity: heroOpacity,
              scale: heroScale,
              willChange: 'transform, opacity'
            }}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                className="space-y-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="space-y-8">
                  {/* Status pill with pulse */}
                  <motion.div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted"
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tech-emerald opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-tech-emerald" />
                    </span>
                    <span className="text-muted-foreground text-sm">Building AI-native products</span>
                  </motion.div>

                  {/* Massive headline with letter reveal */}
                  <div className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[0.95] tracking-tighter">
                    <LineReveal>
                      <span className="text-muted-foreground block">Hi, I'm</span>
                    </LineReveal>
                    <LineReveal className="mt-2">
                      <span className="text-shimmer block">Piyush Thakur</span>
                    </LineReveal>
                  </div>

                  <motion.div
                    className="text-xl sm:text-2xl text-muted-foreground min-h-[2.5rem] font-light tracking-tight"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                  >
                    <Typewriter texts={["Fullstack AI/ML Engineer", "LLM Product Architect", "Data Science × Web", "Applied ML Builder"]} speed={80} deleteSpeed={40} pauseDuration={2000} />
                  </motion.div>

                  <motion.p
                    className="text-muted-foreground max-w-lg leading-relaxed text-lg font-light"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                  >
                    Building premium AI-native products, data experiences, and high-performance web applications with a strong engineering and design lens.
                  </motion.p>
                </div>

                {/* Stat counters with reveal animation */}
                <motion.div
                  className="flex gap-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  {[
                    { ref: yearsCounter.ref, count: yearsCounter.count, suffix: "+", label: "Years" },
                    { ref: projectsCounter.ref, count: projectsCounter.count, suffix: "+", label: "Projects" },
                    { ref: clientsCounter.ref, count: clientsCounter.count, suffix: "+", label: "Clients" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      ref={stat.ref as any}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + i * 0.15 }}
                    >
                      <div className="text-4xl sm:text-5xl font-bold tracking-tighter tabular-nums">
                        {stat.count}{stat.suffix}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* CTAs with magnetic effect */}
                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                >
                  <MagneticButton strength={0.25}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={() => scrollToSection("projects")}
                        className="bg-foreground text-background hover:bg-foreground/90 px-8 py-6 text-base font-medium rounded-full transition-all cta-breathing relative overflow-hidden"
                      >
                        <span className="cta-shimmer" />
                        View My Work
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  </MagneticButton>
                  <MagneticButton strength={0.25}>
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        onClick={() => scrollToSection("contact")}
                        variant="outline"
                        className="px-8 py-6 text-base font-medium rounded-full border border-border hover:bg-muted transition-all"
                      >
                        Get in Touch
                      </Button>
                    </motion.div>
                  </MagneticButton>
                </motion.div>
              </motion.div>

              {/* Neural Network Canvas replacing static avatar */}
              <motion.div
                className="flex justify-center lg:justify-end"
                initial={{ opacity: 0, scale: 0.85, rotateY: 15 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                transition={{ duration: 1.2, ease: appleEase, delay: 0.5 }}
              >
                <TiltCard tiltStrength={12} className="w-72 sm:w-80 lg:w-96">
                  <div className="aspect-square relative">
                    <motion.div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-foreground/10 to-foreground/5 p-[1px]">
                      <div className="w-full h-full rounded-[2.5rem] bg-background overflow-hidden relative">
                        {/* Neural network canvas */}
                        <NeuralCanvas />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent pointer-events-none" />
                        {/* Initials */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-6xl sm:text-7xl font-bold text-foreground/15 select-none tracking-tighter">PT</span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Floating code snippet */}
                    <FloatingCodeSnippet />

                    {[
                      { icon: <Brain className="h-4 w-4 text-accent-violet" />, pos: "-top-2 -right-2", delay: 0 },
                      { icon: <Code2 className="h-4 w-4 text-foreground/60" />, pos: "top-1/2 -left-4 -translate-y-1/2", delay: 0.5 },
                      { icon: <Sparkles className="h-4 w-4 text-primary" />, pos: "-bottom-2 left-1/2 -translate-x-1/2", delay: 1 },
                    ].map((item, i) => (
                      <motion.div
                        key={i}
                        className={`absolute ${item.pos} p-3 rounded-2xl bg-background border border-border/50 shadow-sm`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                        transition={{
                          opacity: { delay: 1 + item.delay, duration: 0.5 },
                          scale: { delay: 1 + item.delay, type: "spring" },
                          y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: 1.5 + item.delay }
                        }}
                      >
                        {item.icon}
                      </motion.div>
                    ))}
                  </div>
                </TiltCard>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 cursor-pointer z-10"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            onClick={() => scrollToSection('about')}
          >
            <span className="text-xs text-muted-foreground">Scroll</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </section>

        <SectionDivider />

        {/* ===== ABOUT — Scrollytelling ===== */}
        <AnimatedSection id="about" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">About</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">My Journey</h2>
              </LineReveal>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div className="space-y-8" variants={fadeLeft}>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold tracking-tight">Who I Am</h3>
                    <TextReveal
                      text="I'm an AI/ML-focused engineer building at the intersection of machine intelligence, data products, and premium web experiences. My work blends applied ML thinking with frontend precision and product-minded execution."
                      className="text-muted-foreground leading-relaxed text-lg font-light"
                    />
                    <TextReveal
                      text="I enjoy turning complex systems into clear, elegant interfaces — from analytics dashboards and LLM-inspired experiences to high-performance full-stack applications that feel polished and fast."
                      className="text-muted-foreground leading-relaxed text-lg font-light"
                    />
                </div>

                <motion.div className="grid grid-cols-2 gap-4" variants={staggerContainer}>
                  {[
                    { icon: <GraduationCap className="h-5 w-5" />, title: "Education", desc: "B.Tech at JUIT Solan" },
                    { icon: <MapPin className="h-5 w-5" />, title: "Location", desc: "Himachal Pradesh" },
                  ].map((item, i) => (
                    <TiltCard key={i} tiltStrength={8} glare>
                      <motion.div variants={scaleUp} className="p-5 rounded-2xl bg-muted/50">
                        <div className="mb-3 text-foreground/60">{item.icon}</div>
                        <h4 className="font-semibold text-sm mb-0.5">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </motion.div>
                    </TiltCard>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div className="flex justify-center" variants={fadeRight}>
                <ParallaxReveal className="rounded-[2.5rem]">
                  <div className="w-72 sm:w-80 aspect-square rounded-[2.5rem] bg-gradient-to-br from-muted to-muted/30 flex items-center justify-center relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent-violet/5"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    />
                    <span className="text-8xl font-bold text-foreground/10 tracking-tighter select-none relative z-10">PT</span>
                  </div>
                </ParallaxReveal>
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== BENTO CAPABILITIES — 2026 AI-native surface ===== */}
        <AnimatedSection id="capabilities" className="py-32 px-6 relative overflow-hidden">
          <div className="absolute inset-0 mesh-aurora pointer-events-none" />
          <div className="absolute inset-0 grid-backdrop pointer-events-none opacity-40" />
          <div className="max-w-6xl mx-auto relative">
            <motion.div variants={fadeUp} className="text-center mb-16">
              <span className="chip-neon"><Sparkles className="h-3 w-3" /> What I Build</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-display font-semibold mt-6 tracking-tighter">
                  A <span className="kinetic-text">living</span> toolkit
                </h2>
              </LineReveal>
              <p className="text-muted-foreground mt-5 max-w-xl mx-auto font-light">
                AI-native interfaces, spatial 3D, glass surfaces, and kinetic type — engineered to feel alive.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(160px,auto)]"
            >
              {/* Hero AI card */}
              <motion.div variants={clipReveal} className="md:col-span-2 lg:col-span-2 lg:row-span-2">
                <TiltCard tiltStrength={6} glare>
                  <div className="bento-card bento-card--dark h-full min-h-[340px] flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                      <span className="chip-violet"><Brain className="h-3 w-3" /> AI · ML</span>
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-5xl font-display font-semibold tracking-tighter leading-[1.05]">
                        LLM-powered<br/>product surfaces
                      </h3>
                      <p className="text-sm opacity-70 mt-4 max-w-sm">
                        Streaming assistants, retrieval, embeddings, and evals — shipped as calm, glassy UI.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-xs opacity-80">
                      <span>OpenAI</span><span>·</span><span>Gemini</span><span>·</span><span>LangChain</span>
                    </div>
                  </div>
                </TiltCard>
              </motion.div>

              {/* Kinetic type */}
              <motion.div variants={clipReveal}>
                <div className="bento-card bento-card--mint h-full min-h-[160px] flex items-center justify-center">
                  <span className="kinetic-text text-3xl md:text-4xl font-display font-semibold tracking-tighter text-center">
                    kinetic type
                  </span>
                </div>
              </motion.div>

              {/* Spatial 3D */}
              <motion.div variants={clipReveal}>
                <TiltCard tiltStrength={10}>
                  <div className="bento-card h-full min-h-[160px] relative overflow-hidden">
                    <div className="chip-neon mb-3"><Zap className="h-3 w-3" /> 3D</div>
                    <p className="text-sm font-medium">Spatial depth with WebGL — tilt, parallax, ambient light.</p>
                    <div className="absolute -bottom-6 -right-6 w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent-violet opacity-60 blur-2xl" />
                  </div>
                </TiltCard>
              </motion.div>

              {/* Glass v2 */}
              <motion.div variants={clipReveal} className="md:col-span-2">
                <div className="bento-card glass-v2 h-full min-h-[160px] flex items-center justify-between gap-6">
                  <div>
                    <div className="chip-neon mb-3"><Palette className="h-3 w-3" /> Design</div>
                    <h4 className="text-xl font-display font-semibold tracking-tight">Glassmorphism v2</h4>
                    <p className="text-xs text-muted-foreground mt-1">Refractive surfaces, dynamic blur, ambient light.</p>
                  </div>
                  <div className="hidden sm:flex gap-2">
                    <div className="w-14 h-14 rounded-2xl glass-v2 glow-ring" />
                    <div className="w-14 h-14 rounded-2xl glass-v2 -translate-y-2" />
                    <div className="w-14 h-14 rounded-2xl glass-v2 translate-y-1" />
                  </div>
                </div>
              </motion.div>

              {/* Live stats */}
              <motion.div variants={clipReveal}>
                <div className="bento-card h-full min-h-[160px]">
                  <div className="chip-neon mb-3"><Star className="h-3 w-3" /> Live</div>
                  <div className="text-4xl font-display font-semibold tracking-tighter">60→120<span className="text-primary">fps</span></div>
                  <p className="text-xs text-muted-foreground mt-2">GPU-tuned motion. Zero jank.</p>
                </div>
              </motion.div>

              {/* Command bar */}
              <motion.div variants={clipReveal} className="md:col-span-2">
                <div className="bento-card h-full min-h-[160px] flex flex-col justify-between">
                  <div className="chip-violet self-start"><Code2 className="h-3 w-3" /> AI-native</div>
                  <div className="glass-v2 rounded-2xl p-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-violet animate-pulse" />
                    <span className="text-xs text-muted-foreground font-mono flex-1 truncate">Ask AI: "generate a bento layout for..."</span>
                    <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border">⌘K</kbd>
                  </div>
                  <p className="text-xs text-muted-foreground">Command palettes, generative UI, agentic actions.</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        <AIExperienceLab />

        <SectionDivider />

        {/* ===== EXPERIENCE — Animated Timeline ===== */}
        <AnimatedSection id="experience" className="py-32 px-6 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Career</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">Experience</h2>
              </LineReveal>
            </motion.div>

            <div className="relative">
              {/* Animated timeline line */}
              <motion.div
                className="absolute left-6 md:left-1/2 top-0 bottom-0 w-[1px] bg-border/50 -translate-x-1/2"
                variants={slideReveal}
              />

              {/* Glowing dot that follows timeline */}
              <motion.div
                className="absolute left-6 md:left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary glow-pulse z-20"
                initial={{ top: "0%" }}
                whileInView={{ top: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />

              <motion.div className="space-y-16" variants={staggerContainer}>
                {[
                  { title: "Frontend Developer", company: "Freelance", period: "2022 – Present", desc: "Developed responsive web applications using React, JavaScript, and modern CSS frameworks.", icon: <Briefcase className="h-4 w-4" /> },
                  { title: "Web Development Intern", company: "Various Companies", period: "2023", desc: "Gained hands-on experience in full-stack development with MERN stack technologies.", icon: <Code2 className="h-4 w-4" /> },
                  { title: "B.Tech Student", company: "JUIT Solan", period: "2021 – Present", desc: "Pursuing Bachelor's in Technology with focus on Computer Science.", icon: <GraduationCap className="h-4 w-4" /> },
                ].map((exp, i) => (
                  <motion.div
                    key={i}
                    variants={i % 2 === 0 ? fadeLeft : fadeRight}
                    className={`relative flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  >
                    <motion.div
                      className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-foreground border-4 border-background z-10"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.2, type: "spring", stiffness: 300 }}
                    />

                    <div className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${i % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                      <TiltCard tiltStrength={6}>
                        <motion.div
                          className="p-6 rounded-2xl bg-background border border-border/50"
                          whileHover={{ y: -4, borderColor: 'hsl(var(--primary) / 0.3)' }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-muted-foreground">{exp.icon}</span>
                            <span className="text-xs text-muted-foreground font-medium">{exp.period}</span>
                          </div>
                          <h3 className="text-lg font-bold tracking-tight mb-1">{exp.title}</h3>
                          <p className="text-primary text-sm font-medium mb-2">{exp.company}</p>
                          <p className="text-muted-foreground text-sm leading-relaxed">{exp.desc}</p>
                        </motion.div>
                      </TiltCard>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== SKILLS ===== */}
        <AnimatedSection id="skills" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-8">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Expertise</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">Skills & Tech</h2>
              </LineReveal>
            </motion.div>

            <motion.div variants={fadeUp} className="mb-16">
              <SkillMarquee items={allSkills} />
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-6" variants={staggerContainer}>
              {skills.map((cat, i) => (
                <motion.div key={i} variants={clipReveal}>
                  <TiltCard tiltStrength={8}>
                    <div className="p-8 rounded-2xl bg-muted/40 h-full">
                      <div className="flex items-center gap-3 mb-6">
                        <motion.span
                          className="text-foreground/60"
                          whileHover={{ rotate: 360, scale: 1.2 }}
                          transition={{ duration: 0.5 }}
                        >
                          {cat.icon}
                        </motion.span>
                        <h3 className="text-lg font-bold tracking-tight">{cat.category}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {cat.items.map((skill, j) => (
                          <motion.div
                            key={j}
                            whileHover={{ scale: 1.08, y: -3 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                          >
                            <Badge className="skill-badge text-xs">{skill}</Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== SERVICES ===== */}
        <AnimatedSection id="services" className="py-32 px-6 bg-muted/30 relative">
          <GradientBlob />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">What I Do</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">Services</h2>
              </LineReveal>
            </motion.div>

            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer}>
              {services.map((service, i) => (
                <motion.div key={i} variants={clipReveal}>
                  <TiltCard tiltStrength={8}>
                    <SpotlightCard className="p-8 rounded-2xl bg-background border border-border/50 h-full group">
                      <motion.div
                        className="mb-6 text-foreground/50 group-hover:text-foreground transition-colors duration-300"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                        transition={{ type: "spring" }}
                      >
                        {service.icon}
                      </motion.div>
                      <h3 className="text-lg font-bold tracking-tight mb-3">{service.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{service.description}</p>
                      <motion.div
                        className="h-0.5 bg-gradient-to-r from-primary to-accent-violet rounded-full mt-6 origin-left"
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: appleEase }}
                      />
                    </SpotlightCard>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== PROJECTS — with hover parallax ===== */}
        <AnimatedSection id="projects" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Portfolio</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">Featured Projects</h2>
              </LineReveal>
            </motion.div>

            <motion.div className="grid sm:grid-cols-2 gap-6" variants={staggerContainer}>
                {[
                  { title: "AI Data Analytics", desc: "An ML-powered analytics workspace for insight delivery, performance monitoring, and visual storytelling.", tags: ["Python", "ML", "React"], building: false },
                  { title: "LLM Portfolio Assistant", desc: "Streaming portfolio assistant built for fast, contextual responses about projects, skills, and AI work.", tags: ["Lovable AI", "Streaming", "React"] },
                  { title: "GMR & Associates", desc: "Professional CA firm website with modern design, fast UI, and polished product presentation.", tags: ["React", "UI/UX", "Tailwind"], building: true },
                  { title: "E-Commerce Platform", desc: "Full-stack commerce system with scalable architecture, UX polish, and operational flows.", tags: ["React", "Node.js", "MongoDB"] },
                ].map((project, i) => (
                <motion.div key={i} variants={clipReveal}>
                  <TiltCard tiltStrength={6}>
                    <motion.div
                      className="p-6 rounded-2xl bg-muted/40 h-full group cursor-pointer"
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.4, ease: appleEase }}
                    >
                      {/* Project preview with hover zoom */}
                      <div className="aspect-video bg-gradient-to-br from-foreground/5 to-muted rounded-xl mb-6 flex items-center justify-center overflow-hidden relative">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent-violet/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                        <motion.span
                          className="text-3xl font-bold text-foreground/10 tracking-tighter relative z-10"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          transition={{ type: "spring" }}
                        >
                          {project.title.split(' ').map(w => w[0]).join('')}
                        </motion.span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold tracking-tight">{project.title}</h3>
                        {project.building && (
                          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Badge className="bg-accent-violet/10 text-accent-violet border-0 text-[10px] px-2">Building</Badge>
                          </motion.div>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{project.desc}</p>
                      <div className="flex gap-2 mb-5 flex-wrap">
                        {project.tags.map((tag, j) => (
                          <motion.span
                            key={j}
                            className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border/50"
                            whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary) / 0.4)' }}
                          >
                            {tag}
                          </motion.span>
                        ))}
                      </div>
                      <MagneticButton strength={0.15} className="w-full">
                        <Button variant="outline" className="w-full rounded-full hover:bg-foreground hover:text-background transition-all text-sm press-effect border-border/50">
                          <ExternalLink className="h-3.5 w-3.5 mr-2" />
                          {project.building ? "Coming Soon" : "View Project"}
                        </Button>
                      </MagneticButton>
                    </motion.div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 text-center">
              <MagneticButton strength={0.3}>
                <motion.a
                  href="https://github.com/27Piyush27?tab=repositories"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-foreground text-background font-medium transition-all press-effect"
                >
                  <Github className="h-5 w-5" />
                  View All on GitHub
                  <ArrowUpRight className="h-4 w-4" />
                </motion.a>
              </MagneticButton>
            </motion.div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== TESTIMONIALS ===== */}
        <AnimatedSection id="testimonials" className="py-32 px-6 bg-muted/30 relative">
          <GradientBlob />
          <div className="max-w-5xl mx-auto relative z-10">
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Feedback</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">What People Say</h2>
              </LineReveal>
            </motion.div>

            <motion.div variants={fadeUp}>
              <TestimonialSlider />
            </motion.div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== CERTIFICATES ===== */}
        <AnimatedSection id="certificates" className="py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Credentials</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">Certifications</h2>
              </LineReveal>
              <motion.p variants={fadeUp} className="text-muted-foreground mt-6 max-w-lg mx-auto font-light text-lg">
                Industry-recognized credentials that validate my expertise.
              </motion.p>
            </motion.div>

            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer}>
              {[
                { src: udacityGenaiCert, title: "Generative AI", issuer: "Udacity", file: "udacity-genai-certificate.avif" },
                { src: udemyPythonMlCert, title: "Python & Machine Learning", issuer: "Udemy", file: "udemy-python-ml-certificate.avif" },
                { src: udemyUiuxCert, title: "UI/UX Design", issuer: "Udemy", file: "udemy-uiux-certificate.avif" },
                { src: nptelCloudCert, title: "Cloud Computing", issuer: "NPTEL", file: "nptel-cloud-certificate.avif" },
                { src: newtonPythonCert, title: "Python Programming", issuer: "Newton School", file: "newton-python-certificate.avif" },
                { src: deloitteCert, title: "Business Analytics", issuer: "Deloitte", file: "deloitte-certificate.avif" },
                { src: promptEngCert, title: "Introduction to Prompt Engineering for Generative AI", issuer: "LinkedIn Learning", file: "prompt-engineering-certificate.jpg", verify: "https://www.linkedin.com/learning/certificates/f06a176125dcd68b74d78e01b206bf1de13d662b7321778cd48d28bd80679237?trk=share_certificate" },
              ].map((cert, i) => (
                <motion.div key={i} variants={clipReveal}>
                  <TiltCard tiltStrength={6}>
                    <motion.div
                      className="rounded-2xl bg-muted/40 overflow-hidden group"
                      whileHover={{ y: -6 }}
                      transition={{ duration: 0.4 }}
                    >
                      <div className="relative overflow-hidden">
                        <motion.img
                          src={cert.src}
                          alt={cert.title}
                          className="w-full h-44 object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold tracking-tight mb-1">{cert.title}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{cert.issuer}</p>
                        <a href={cert.src} download={cert.file} className="block">
                          <Button variant="outline" className="w-full rounded-full text-sm press-effect border-border/50 hover:bg-foreground hover:text-background transition-all">
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download
                          </Button>
                        </a>
                      </div>
                    </motion.div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== INTERNSHIPS ===== */}
        <AnimatedSection id="internships" className="py-32 px-6 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-20">
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Industry Experience</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 tracking-tighter">Internships</h2>
              </LineReveal>
            </motion.div>

            <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerContainer}>
              {[
                { src: intelCert, company: "Intel Corporation", role: "Software Development Intern", period: "Summer 2023", desc: "Worked on optimizing software performance and contributing to Intel's development tools.", file: "intel-certificate.avif" },
                { src: internpeCert, company: "InternPe", role: "Web Development Intern", period: "Winter 2023", desc: "Developed responsive web applications using modern frameworks.", file: "internpe-certificate.png" },
              ].map((intern, i) => (
                <motion.div key={i} variants={clipReveal}>
                  <TiltCard tiltStrength={6}>
                    <motion.div
                      className="p-8 rounded-2xl bg-background border border-border/50 group"
                      whileHover={{ y: -6, borderColor: 'hsl(var(--primary) / 0.2)' }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-start gap-5">
                        <motion.img
                          src={intern.src}
                          alt={intern.company}
                          className="w-14 h-14 object-cover rounded-2xl border border-border/50"
                          loading="lazy"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring" }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold tracking-tight mb-1">{intern.role}</h3>
                          <p className="text-primary text-sm font-medium mb-1">{intern.company}</p>
                          <p className="text-muted-foreground text-xs mb-3 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {intern.period}
                          </p>
                          <p className="text-muted-foreground text-sm leading-relaxed mb-4">{intern.desc}</p>
                          <a href={intern.src} download={intern.file}>
                            <Button variant="outline" size="sm" className="rounded-full text-xs press-effect border-border/50 hover:bg-foreground hover:text-background transition-all">
                              <Download className="h-3.5 w-3.5 mr-1.5" />
                              Certificate
                            </Button>
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </AnimatedSection>

        <SectionDivider />

        {/* ===== CONTACT ===== */}
        <AnimatedSection id="contact" className="py-32 px-6 relative">
          <GradientBlob />
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div variants={fadeUp}>
              <span className="text-primary text-xs font-semibold tracking-[0.2em] uppercase">Get In Touch</span>
              <LineReveal>
                <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold mt-4 mb-6 tracking-tighter">Let's Work Together</h2>
              </LineReveal>
              <TextReveal
                text="Ready to bring your ideas to life? Let's create something amazing together."
                className="text-muted-foreground max-w-lg mx-auto mb-16 text-lg font-light justify-center"
              />
            </motion.div>

            <motion.div className="grid sm:grid-cols-3 gap-4 mb-16" variants={staggerContainer}>
              {[
                { icon: <Mail className="h-5 w-5" />, title: "Email", value: "27piyushthakur27@gmail.com" },
                { icon: <Phone className="h-5 w-5" />, title: "Phone", value: "+91 8580630951" },
                { icon: <MapPin className="h-5 w-5" />, title: "Location", value: "JUIT Solan, HP" },
              ].map((c, i) => (
                <motion.div key={i} variants={clipReveal}>
                  <TiltCard tiltStrength={8}>
                    <div className="p-6 rounded-2xl bg-muted/40 text-center group">
                      <motion.div
                        className="mx-auto mb-3 text-foreground/50 group-hover:text-primary transition-colors"
                        whileHover={{ scale: 1.2, y: -4 }}
                        transition={{ type: "spring" }}
                      >
                        {c.icon}
                      </motion.div>
                      <h3 className="font-semibold text-sm mb-1">{c.title}</h3>
                      <p className="text-muted-foreground text-xs">{c.value}</p>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <ContactForm />
            </motion.div>

            <motion.div className="flex flex-col sm:flex-row justify-center gap-4 mt-10" variants={fadeUp}>
              <MagneticButton strength={0.25}>
                <motion.a href="mailto:27piyushthakur27@gmail.com" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button className="bg-foreground text-background hover:bg-foreground/90 px-8 py-5 rounded-full font-medium press-effect">
                    <Mail className="h-4 w-4 mr-2" /> Send Email
                  </Button>
                </motion.a>
              </MagneticButton>
              <MagneticButton strength={0.25}>
                <motion.a href="https://linkedin.com/in/piyush-thakur-952364296" target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Button variant="outline" className="px-8 py-5 rounded-full font-medium border-border/50 hover:bg-muted press-effect">
                    <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
                  </Button>
                </motion.a>
              </MagneticButton>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* ===== FOOTER ===== */}
        <motion.footer
          className="py-16 px-6 border-t border-border/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-muted-foreground text-sm">
                © 2026 Piyush Thakur. Crafted with precision.
              </p>
              <div className="flex items-center gap-4">
                {[
                  { icon: <Github className="h-4 w-4" />, href: "https://github.com/27Piyush27" },
                  { icon: <Linkedin className="h-4 w-4" />, href: "https://linkedin.com/in/piyush-thakur-952364296" },
                  { icon: <Mail className="h-4 w-4" />, href: "mailto:27piyushthakur27@gmail.com" },
                ].map((social, i) => (
                  <MagneticButton key={i} strength={0.4}>
                    <motion.a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ y: -3, scale: 1.15 }}
                      className="p-2 rounded-full text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {social.icon}
                    </motion.a>
                  </MagneticButton>
                ))}
              </div>
            </div>
          </div>
        </motion.footer>

        <ChatBot />
      </div>
    </>
  );
};

export default OptimizedPortfolio;
