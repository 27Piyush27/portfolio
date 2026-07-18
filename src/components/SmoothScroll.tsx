import { useEffect, useRef } from 'react';

// Lenis smooth scroll integration — industry gold standard for buttery 60fps scrolling
// Falls back to native smooth scroll if Lenis isn't available
export const useSmoothScroll = () => {
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    let raf: number;

    const initLenis = async () => {
      try {
        const { default: Lenis } = await import('lenis');

        const lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          gestureOrientation: 'vertical',
          smoothWheel: true,
          touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        const animate = (time: number) => {
          lenis.raf(time);
          raf = requestAnimationFrame(animate);
        };

        raf = requestAnimationFrame(animate);

        // Make lenis available globally for scroll-to functionality
        (window as any).__lenis = lenis;
      } catch {
        // Lenis not available — fall back to native smooth scroll
        document.documentElement.style.scrollBehavior = 'smooth';
      }
    };

    initLenis();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
    };
  }, []);

  return lenisRef;
};