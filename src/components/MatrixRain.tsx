
import React, { useEffect, useRef } from 'react';

const MatrixRain: React.FC<{ speed?: 'slow' | 'normal' | 'fast' }> = ({ speed = 'normal' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const width = window.innerWidth;
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Define duration based on speed
    const getDuration = () => {
      switch (speed) {
        case 'slow': return () => 10 + Math.random() * 15; // 10-25s
        case 'fast': return () => 3 + Math.random() * 5;   // 3-8s
        case 'normal':
        default: return () => 5 + Math.random() * 10;      // 5-15s
      }
    };
    
    const durationFn = getDuration();
    
    // Create about 50 characters for the matrix rain
    for (let i = 0; i < 50; i++) {
      const character = document.createElement('div');
      character.className = 'matrix-rain-char';
      character.style.left = `${Math.random() * width}px`;
      character.style.animationDuration = `${durationFn()}s`;
      character.style.animationDelay = `${Math.random() * 5}s`;
      character.textContent = String.fromCharCode(0x30A0 + Math.random() * 96); // Japanese characters
      
      container.appendChild(character);
    }
    
    const updateRain = () => {
      const children = container.children;
      for (let i = 0; i < children.length; i++) {
        const character = children[i] as HTMLDivElement;
        if (Math.random() < 0.1) {
          character.textContent = String.fromCharCode(0x30A0 + Math.random() * 96);
        }
      }
    };
    
    const intervalId = setInterval(updateRain, 1000);
    
    return () => clearInterval(intervalId);
  }, [speed]);
  
  return <div className="matrix-rain-container" ref={containerRef}></div>;
};

export default MatrixRain;
