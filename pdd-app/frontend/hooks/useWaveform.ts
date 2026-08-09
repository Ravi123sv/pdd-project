"use client";

import { useState, useEffect, useRef } from "react";

export type ArtifactSeverity = 'low' | 'high' | 'none';

export interface DSPFilterConfig {
    lowPass: boolean;  // 35Hz suppression
    highPass: boolean; // 0.5Hz baseline wander suppression
    notch: boolean;    // 50/60Hz mains noise suppression
}

/**
 * useWaveform Hook v5.0
 * Generates Dual Streams: Raw Signal (with artifacts) and AI-Filtered Signal.
 * Added: DSP Filter Suite (Low-Pass, High-Pass, Notch).
 * Added: Sweep Speed control (12.5, 25, 50 mm/s) for diagnostic fidelity.
 * Added: Manual Artifact Injection support for clinical stress-testing.
 */
export function useWaveform(
    channelCount: number,
    isLive: boolean,
    isPaused: boolean,
    manualArtifact?: { type: string, severity: ArtifactSeverity },
    sweepSpeed: 12.5 | 25 | 50 = 25,
    dspFilters: DSPFilterConfig = { lowPass: true, highPass: true, notch: true }
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
      const speedFactor = sweepSpeed / 25;
      const deltaT = 0.02 * speedFactor;
      timeRef.current += deltaT;

      if (timeRef.current > 3600) timeRef.current = 0;
      const t = timeRef.current;

      const modality = channelCount === 8 ? 'EEG' : (channelCount === 12 ? 'ECG' : 'EMG');

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

          // --- 1. Base Signal Generation ---
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

          // --- 2. Add Artificial Artifacts to Raw ---
          let noise = (Math.random() - 0.5) * 2;

          // High-Freq Noise (EMG interference)
          const hfNoise = Math.sin(t * 150) * (currentSeverity === 'high' ? 12 : 1);
          // Baseline Wander (0.1Hz)
          const bwNoise = Math.sin(t * 0.2) * (currentSeverity === 'high' ? 30 : 0.5);
          // Mains Hum (50Hz)
          const mainsNoise = Math.sin(t * 100 * Math.PI) * (currentSeverity === 'high' ? 8 : 0.2);

          if (currentSeverity === 'low') noise += hfNoise * 5;
          else if (currentSeverity === 'high') noise += hfNoise * 10 + bwNoise + mainsNoise;

          const rawVal = cleanVal + noise;

          // --- 3. Neural DSP Filter Chain ---
          let filteredVal = rawVal;

          if (dspFilters.lowPass) filteredVal -= (hfNoise * 0.95);
          if (dspFilters.highPass) filteredVal -= (bwNoise * 0.98);
          if (dspFilters.notch) filteredVal -= (mainsNoise * 0.99);

          // Final Neural Smoothing (Residual Noise Suppression)
          filteredVal = cleanVal + ((filteredVal - cleanVal) * 0.1);

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
  }, [isLive, isPaused, channelCount, manualArtifact, sweepSpeed, dspFilters]);

  return { channels, artifactStatus };
}
