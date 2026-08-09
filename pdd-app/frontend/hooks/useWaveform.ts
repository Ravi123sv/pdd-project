"use client";

import { useState, useEffect, useRef } from "react";

export type ArtifactSeverity = 'low' | 'high' | 'none';

/**
 * useWaveform Hook v4.5
 * Generates Dual Streams: Raw Signal (with artifacts) and AI-Filtered Signal.
 * Added: Sweep Speed control (12.5, 25, 50 mm/s) for diagnostic fidelity.
 * Added: Manual Artifact Injection support for clinical stress-testing.
 */
export function useWaveform(
    channelCount: number,
    isLive: boolean,
    isPaused: boolean,
    manualArtifact?: { type: string, severity: ArtifactSeverity },
    sweepSpeed: 12.5 | 25 | 50 = 25
) {
  const [channels, setChannels] = useState<{raw: number[][], filtered: number[][]}>({
    raw: Array(channelCount).fill([]).map(() => Array(200).fill(0)),
    filtered: Array(channelCount).fill([]).map(() => Array(200).fill(0))
  });

  const [artifactStatus, setArtifactStatus] = useState<{type: string, severity: ArtifactSeverity}>({
    type: 'Optimal',
    severity: 'none'
  });

  const frameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isLive || isPaused) return;

    const update = () => {
      // Adjusted time increment based on Sweep Speed (Clinical Standard)
      const speedFactor = sweepSpeed / 25;
      const deltaT = 0.02 * speedFactor;
      timeRef.current += deltaT;

      // Prevent floating point drift/overflow on shift-long sessions
      if (timeRef.current > 3600) timeRef.current = 0;

      const t = timeRef.current;

      const modality = channelCount === 8 ? 'EEG' : (channelCount === 12 ? 'ECG' : 'EMG');

      // --- 1. Artifact Determination ---
      let currentArtifactType = 'Optimal';
      let currentSeverity: ArtifactSeverity = 'none';

      if (manualArtifact && manualArtifact.severity !== 'none') {
          currentArtifactType = manualArtifact.type;
          currentSeverity = manualArtifact.severity;
      } else {
          const artifactCycle = Math.floor(t / 8) % 4;
          if (artifactCycle === 1) {
              currentArtifactType = 'Patient Movement';
              currentSeverity = 'low';
          } else if (artifactCycle === 2) {
              currentArtifactType = 'Loose Lead (V2)';
              currentSeverity = 'high';
          }
      }

      setArtifactStatus({ type: currentArtifactType, severity: currentSeverity });

      setChannels(prev => {
        const nextRaw = [...prev.raw];
        const nextFiltered = [...prev.filtered];

        for (let i = 0; i < channelCount; i++) {
          const rawChan = [...nextRaw[i]];
          const filtChan = [...nextFiltered[i]];

          // --- 2. Base Signal Generation ---
          let cleanVal = 0;

          if (modality === 'ECG') {
              const bpm = 72;
              const bps = bpm / 60;
              const beatPeriod = 1 / bps;
              const phase = t % beatPeriod;
              if (phase > 0.1 && phase < 0.2) cleanVal += 2 * Math.sin((phase - 0.1) * Math.PI / 0.1);
              if (phase > 0.3 && phase < 0.35) cleanVal -= 5 * Math.sin((phase - 0.3) * Math.PI / 0.05);
              else if (phase >= 0.35 && phase < 0.4) cleanVal += 40 * Math.sin((phase - 0.35) * Math.PI / 0.05);
              else if (phase >= 0.4 && phase < 0.45) cleanVal -= 8 * Math.sin((phase - 0.4) * Math.PI / 0.05);
              if (phase > 0.6 && phase < 0.8) cleanVal += 4 * Math.sin((phase - 0.6) * Math.PI / 0.2);
          } else if (modality === 'EEG') {
              cleanVal = 6 * Math.sin(t * 10 * Math.PI) + 3 * Math.sin(t * 24 * Math.PI);
          } else if (modality === 'EMG') {
              cleanVal = (Math.random() - 0.5) * 15 * (1 + Math.sin(t * 2));
          }

          // --- 3. Add Artificial Artifacts to Raw ---
          let noise = (Math.random() - 0.5) * 2;
          if (currentSeverity === 'low') noise += Math.sin(t * 40) * 12 * Math.random();
          else if (currentSeverity === 'high') noise += Math.sin(t * 0.4) * 35 + Math.sin(t * 120) * 8;

          const rawVal = cleanVal + noise;

          // --- 4. Neural AI Filter Simulation ---
          const filteredVal = cleanVal + (noise * 0.02);

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
  }, [isLive, isPaused, channelCount, manualArtifact, sweepSpeed]);

  return { channels, artifactStatus };
}
