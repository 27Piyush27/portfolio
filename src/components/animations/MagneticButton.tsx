import { useRef, useCallback } from "react";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  onClick?: () => void;
}

// Performance-optimized — uses CSS transforms directly, no React state
export const MagneticButton = ({ children, className = "", strength = 0.3, onClick }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left - rect.width / 2) * strength).toFixed(1);
    const y = ((e.clientY - rect.top - rect.height / 2) * strength).toFixed(1);
    ref.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }, [strength]);

  const handleMouseLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = 'translate3d(0, 0, 0)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`inline-block will-change-transform ${className}`}
      style={{ transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)' }}
    >
      {children}
    </div>
  );
};
