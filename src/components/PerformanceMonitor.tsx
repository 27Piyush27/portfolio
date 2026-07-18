import { useEffect, useState } from 'react';

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    fps: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Measure load time
    const startTime = performance.now();
    
    const measureLoadTime = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    // FPS monitoring
    let frames = 0;
    let lastTime = performance.now();
    
    const measureFPS = () => {
      frames++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frames * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frames = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(measureFPS);
    };

    // Memory usage
    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = Math.round(memory.usedJSHeapSize / 1048576); // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    window.addEventListener('load', measureLoadTime);
    measureFPS();
    const memoryInterval = setInterval(measureMemory, 5000);

    return () => {
      window.removeEventListener('load', measureLoadTime);
      clearInterval(memoryInterval);
    };
  }, []);

  return metrics;
};