// Lightweight CSS-only gradient blob — no framer-motion overhead
export const GradientBlob = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <div
        className="absolute -top-1/2 -left-1/4 w-[80%] h-[80%] rounded-full opacity-[0.03] blur-[100px] floating-1"
        style={{ background: "hsl(var(--primary))" }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 w-[70%] h-[70%] rounded-full opacity-[0.04] blur-[120px] floating-2"
        style={{ background: "hsl(var(--tech-purple))" }}
      />
    </div>
  );
};

// Noise texture overlay — kept lightweight
export const NoiseOverlay = () => (
  <div
    className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "128px 128px",
    }}
  />
);
