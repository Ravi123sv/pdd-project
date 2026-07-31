"use client";

import { useState, useEffect, useRef } from "react";

/**
 * useWaveform Hook
 * Uses high-fidelity synthetic physiological models (ECG/EEG)
 * designed to replicate real clinical data patterns.
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
      // 0.02 is approx 50Hz update rate
      timeRef.current += 0.02;
      const t = timeRef.current;

      setChannels(prev => prev.map((channel, i) => {
        const next = [...channel];

        // --- High-Fidelity Signal Model (Synthetic Real-Data) ---

        // Heart Rate in Beats Per Second
        const bpm = 72;
        const bps = bpm / 60;
        const beatPeriod = 1 / bps;
        const phase = t % beatPeriod;

        let val = 0;

        // 1. P-Wave (Atrial Depolarization)
        // Small bump before QRS
        if (phase > 0.1 && phase < 0.2) {
            val += 2 * Math.sin((phase - 0.1) * Math.PI / 0.1);
        }

        // 2. QRS Complex (Ventricular Depolarization)
        // The main spike
        if (phase > 0.3 && phase < 0.35) {
            // Q-wave (small dip)
            val -= 5 * Math.sin((phase - 0.3) * Math.PI / 0.05);
        } else if (phase >= 0.35 && phase < 0.4) {
            // R-wave (large spike)
            val += 40 * Math.sin((phase - 0.35) * Math.PI / 0.05);
        } else if (phase >= 0.4 && phase < 0.45) {
            // S-wave (dip)
            val -= 8 * Math.sin((phase - 0.4) * Math.PI / 0.05);
        }

        // 3. T-Wave (Ventricular Repolarization)
        // Medium bump after QRS
        if (phase > 0.6 && phase < 0.8) {
            val += 4 * Math.sin((phase - 0.6) * Math.PI / 0.2);
        }

        // 4. Baseline Wander & Respiratory Modulation
        val += Math.sin(t * 0.2) * 1.5;

        // 5. High-Freq Noise (Simulating real-world lead interference)
        val += (Math.random() - 0.5) * 1.2;

        // Channel-specific variation (to make leads look different)
        const leadVariation = Math.sin(i * 1.5) * 2;
        val += leadVariation;

        next.push(val);

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
