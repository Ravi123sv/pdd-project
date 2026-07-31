"use client";

import { useState, useEffect, useRef } from "react";

/**
 * useWaveform Hook
 * Generates realistic physiological waveforms (ECG/EEG)
 * In production, this would subscribe to a WebSocket or Bluetooth stream.
 */
export function useWaveform(channelCount: number, isLive: boolean, isPaused: boolean) {
  const [channels, setChannels] = useState<number[][]>(
    Array(channelCount).fill([]).map(() => Array(200).fill(0))
  );
  const frameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isLive || isPaused) return;

    const update = () => {
      timeRef.current += 0.05;
      const t = timeRef.current;

      setChannels(prev => prev.map((channel, i) => {
        const next = [...channel];

        // --- Realistic Signal Generation ---

        // 1. Base Sine Wave (Baseline)
        let val = Math.sin(t * 0.5) * 2;

        // 2. QRS Complex Simulation (for ECG)
        // A spike every ~1 second (t is incremented by 0.05, so every ~20 frames)
        const pulseIndex = Math.floor(t * 1.2) % 20;
        if (pulseIndex === 0) {
            val += Math.random() > 0.5 ? 40 : 35; // R-wave spike
        } else if (pulseIndex === 1) {
            val -= 10; // S-wave dip
        }

        // 3. High Frequency Noise (EMG interference)
        val += (Math.random() - 0.5) * 4;

        // 4. Low Frequency Drift
        val += Math.sin(t * 0.1) * 5;

        next.push(val);

        // Maintain buffer size (200 points for smooth scrolling)
        if (next.length > 200) next.shift();
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
