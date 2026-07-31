"use client";

import { useState, useEffect, useRef } from "react";

/**
 * useWaveform Hook v3.0
 * Generates Dual Streams: Raw Signal (with artifacts) and AI-Filtered Signal.
 * Implements real-time detection for Lead Quality and Patient Movement.
 */
export function useWaveform(channelCount: number, isLive: boolean, isPaused: boolean) {
  const [channels, setChannels] = useState<{raw: number[][], filtered: number[][]}>({
    raw: Array(channelCount).fill([]).map(() => Array(200).fill(0)),
    filtered: Array(channelCount).fill([]).map(() => Array(200).fill(0))
  });

  const [artifactStatus, setArtifactStatus] = useState<{type: string, severity: 'low' | 'high' | 'none'}>({
    type: 'Optimal',
    severity: 'none'
  });

  const frameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isLive || isPaused) return;

    const update = () => {
      timeRef.current += 0.02;
      const t = timeRef.current;

      // Randomly trigger artifact states for simulation
      let currentArtifactType = 'Optimal';
      let currentSeverity: 'low' | 'high' | 'none' = 'none';

      const artifactCycle = Math.floor(t / 5) % 4; // Cycle every 5 seconds
      if (artifactCycle === 1) {
          currentArtifactType = 'Patient Movement';
          currentSeverity = 'low';
      } else if (artifactCycle === 2) {
          currentArtifactType = 'Loose Electrode (V2)';
          currentSeverity = 'high';
      }

      setArtifactStatus({ type: currentArtifactType, severity: currentSeverity });

      setChannels(prev => {
        const nextRaw = [...prev.raw];
        const nextFiltered = [...prev.filtered];

        for (let i = 0; i < channelCount; i++) {
          const rawChan = [...nextRaw[i]];
          const filtChan = [...nextFiltered[i]];

          // --- 1. Base Signal (Clean ECG Model) ---
          const bpm = 72;
          const bps = bpm / 60;
          const beatPeriod = 1 / bps;
          const phase = t % beatPeriod;
          let cleanVal = 0;

          // P-QRS-T segments
          if (phase > 0.1 && phase < 0.2) cleanVal += 2 * Math.sin((phase - 0.1) * Math.PI / 0.1);
          if (phase > 0.3 && phase < 0.35) cleanVal -= 5 * Math.sin((phase - 0.3) * Math.PI / 0.05);
          else if (phase >= 0.35 && phase < 0.4) cleanVal += 40 * Math.sin((phase - 0.35) * Math.PI / 0.05);
          else if (phase >= 0.4 && phase < 0.45) cleanVal -= 8 * Math.sin((phase - 0.4) * Math.PI / 0.05);
          if (phase > 0.6 && phase < 0.8) cleanVal += 4 * Math.sin((phase - 0.6) * Math.PI / 0.2);

          // --- 2. Add Artificial Artifacts to Raw ---
          let noise = (Math.random() - 0.5) * 2; // Normal thermal noise

          if (currentSeverity === 'low') {
              // Simulating muscle tremor / movement
              noise += Math.sin(t * 50) * 10 * Math.random();
          } else if (currentSeverity === 'high') {
              // Simulating loose lead (large wander and 50Hz hum)
              noise += Math.sin(t * 0.5) * 30 + Math.sin(t * 100) * 5;
          }

          const rawVal = cleanVal + noise;

          // --- 3. "AI Filtering" Logic ---
          // Simulates a low-pass and baseline-correcting neural network
          const filteredVal = cleanVal + (noise * 0.05); // 95% noise reduction

          rawChan.push(rawVal);
          filtChan.push(filteredVal);

          if (rawChan.length > 200) rawChan.shift();
          if (filtChan.length > 200) filtChan.shift();

          nextRaw[i] = rawChan;
          nextFiltered[i] = filtChan;
        }

        return { raw: nextRaw, filtered: nextFiltered };
      });

      frameRef.current = requestAnimationFrame(update);
    };

    frameRef.current = requestAnimationFrame(update);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isLive, isPaused, channelCount]);

  return { channels, artifactStatus };
}
