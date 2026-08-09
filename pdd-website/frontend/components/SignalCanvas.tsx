"use client";

import { useEffect, useRef } from "react";

interface SignalCanvasProps {
  label: string;
  rawData?: number[];
  filteredData: number[];
  color?: string;
  isLive: boolean;
  isPaused: boolean;
  showRaw?: boolean;
  gain?: number; // Amplitude scaling factor (standard medical gain)
  baselineData?: number[]; // Historical snapshot for visual comparison
}

/**
 * SignalCanvas Component v5.0
 * Optimized High-Performance GPU Rendering
 * Implements Batch-Path rendering, Variable Gain, and Baseline Morphology Overlay.
 */
export default function SignalCanvas({ label, rawData, filteredData, color = "#10B981", isLive, isPaused, showRaw = true, gain = 1, baselineData }: SignalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false }); // Performance optimization
    if (!ctx) return;

    const render = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        // High-DPI Scaling Sync
        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.scale(dpr, dpr);
        }

        const width = rect.width;
        const height = rect.height;
        const midY = height / 2;
        const yScale = (height / 150) * gain;

        // Draw opaque background (Faster than clearRect with alpha: false)
        ctx.fillStyle = "#050810";
        ctx.fillRect(0, 0, width, height);

        // 1. Static Digital Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 0; i < width; i += 20) { ctx.moveTo(i, 0); ctx.lineTo(i, height); }
        for (let i = 0; i < height; i += 20) { ctx.moveTo(0, i); ctx.lineTo(width, i); }
        ctx.stroke();

        const dataLen = filteredData.length;
        if (dataLen < 2) {
            frameId.current = requestAnimationFrame(render);
            return;
        }

        const step = width / (dataLen - 1);

        // 2. BASELINE MORPHOLOGY OVERLAY (Ghost Trace)
        if (baselineData && baselineData.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"; // Ghost white
            ctx.setLineDash([5, 5]); // Dashed for baseline
            ctx.lineWidth = 1;
            const bStep = width / (baselineData.length - 1);
            for (let i = 0; i < baselineData.length; i++) {
                const x = i * bStep;
                const y = midY - (baselineData[i] * yScale);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
            ctx.setLineDash([]); // Reset for main trace
        }

        // 3. RAW SIGNAL TRACE
        if (showRaw && rawData && rawData.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(244, 63, 94, 0.4)";
            ctx.lineWidth = 1;
            for (let i = 0; i < rawData.length; i++) {
                const x = i * step;
                const y = midY - (rawData[i] * yScale);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // 3. AI-FILTERED TRACE
        if (filteredData.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.2;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          for (let i = 0; i < dataLen; i++) {
            const x = i * step;
            const y = midY - (filteredData[i] * yScale);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();

          // Performance Pulse Cursor
          if (isLive && !isPaused) {
              const lastIdx = dataLen - 1;
              const lastX = lastIdx * step;
              const lastY = midY - (filteredData[lastIdx] * yScale);

              ctx.beginPath();
              ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
              ctx.fillStyle = color;
              ctx.fill();
          }
        }

        frameId.current = requestAnimationFrame(render);
    };

    frameId.current = requestAnimationFrame(render);

    return () => {
        if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [rawData, filteredData, isLive, isPaused, color, showRaw]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#050810] rounded-xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-primary/20">
      <div className="absolute top-3 left-4 z-10 flex items-center gap-4">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">{label}</span>
        {showRaw && <div className="h-1.5 w-1.5 rounded-full bg-rose-500/50 animate-pulse" title="Raw Stream Active" />}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
