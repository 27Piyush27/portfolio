import { useState, useEffect } from "react";

interface TypewriterProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pauseDuration?: number;
}

export function Typewriter({ texts, speed = 100, deleteSpeed = 50, pauseDuration = 2000 }: TypewriterProps) {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const type = () => {
      const fullText = texts[currentIndex];
      
      if (!isDeleting && currentText === fullText) {
        timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
      } else if (isDeleting && currentText === '') {
        setIsDeleting(false);
        setCurrentIndex((prev) => (prev + 1) % texts.length);
      } else {
        const updateText = isDeleting
          ? fullText.substring(0, currentText.length - 1)
          : fullText.substring(0, currentText.length + 1);
        
        setCurrentText(updateText);
        timeout = setTimeout(type, isDeleting ? deleteSpeed : speed);
      }
    };
    
    timeout = setTimeout(type, 500);
    return () => clearTimeout(timeout);
  }, [texts, currentIndex, currentText, isDeleting, pauseDuration, deleteSpeed, speed]);

  return (
    <span className="inline-block">
      {currentText}
      <span className="animate-pulse text-primary">|</span>
    </span>
  );
}