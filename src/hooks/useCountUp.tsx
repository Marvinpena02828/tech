'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  duration?: number;
  start?: number;
  separator?: string;
  suffix?: string;
}

export function useCountUp({
  end,
  duration = 2500,
  start = 0,
  separator = ',',
  suffix = '',
}: UseCountUpOptions & { initialValue?: number }) {
  const [count, setCount] = useState(start);
  const [isComplete, setIsComplete] = useState(false);
  const countRef = useRef(start);
  const frameRef = useRef<number | undefined>(undefined);

  const animate = (initialValue = start) => {
    const startTime = performance.now();
    
    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // easeOutExpo easing function
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const currentCount = Math.floor(initialValue + (end - initialValue) * eased);
      countRef.current = currentCount;
      setCount(currentCount);
      
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setIsComplete(true);
      }
    };
    
    frameRef.current = requestAnimationFrame(step);
  };

  const reset = () => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setCount(start);
    setIsComplete(false);
    countRef.current = start;
  };

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  };

  return {
    count: formatNumber(count) + (isComplete ? suffix : ''),
    isComplete,
    start: animate,
    reset,
  };
}
