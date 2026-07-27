"use client";

import { useState, useEffect, useRef } from "react";

export function useWaveform(channelCount: number, isLive: boolean, isPaused: boolean) {
  const [channels, setChannels] = useState<number[][]>(Array(channelCount).fill([]).map(() => Array(100).fill(0)));
  const frameRef = useRef<number>();

  useEffect(() => {
    if (!isLive || isPaused) return;

    const update = () => {
      setChannels(prev => prev.map(channel => {
        const next = [...channel];
        const t = Date.now() / 1000;

        // Simulating physiological signal
        let val = Math.sin(t * 2 * Math.PI * 1.2) * 15;
        if (Math.random() > 0.98) {
            val = (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 100 + 50);
        }

        next.push(val);
        if (next.length > 100) next.shift();
        return next;
      }));
      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isLive, isPaused, channelCount]);

  return channels;
}
