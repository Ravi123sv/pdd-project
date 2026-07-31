"use client";

import { useEffect, useRef } from "react";

interface SignalCanvasProps {
  label: string;
  data: number[];
  color?: string;
  isLive: boolean;
  isPaused: boolean;
}

/**
 * SignalCanvas Component
 * High-performance Waveform Renderer using HTML5 Canvas
 */
export default function SignalCanvas({ label, data, color = "#10B981", isLive, isPaused }: SignalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Use high resolution for sharp lines
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const midY = height / 2;

    // --- Rendering Logic ---
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Grid (Clinical Paper Style)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
    ctx.lineWidth = 0.5;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // 2. Draw Signal Path
    if (data && data.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";

      const step = width / (data.length - 1);
      data.forEach((val, i) => {
        const x = i * step;
        // Invert Y because canvas 0 is top
        const y = midY - (val * (height / 150));

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      // 3. Draw "Current" point glow
      if (isLive && !isPaused) {
          const lastVal = data[data.length - 1];
          const lastX = (data.length - 1) * step;
          const lastY = midY - (lastVal * (height / 150));

          ctx.beginPath();
          ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.shadowBlur = 10;
          ctx.shadowColor = color;
          ctx.stroke();
      }
    }

  }, [data, isLive, isPaused, color]);

  return (
    <div className="relative h-full w-full bg-[#0a0f1d] rounded-lg border border-white/5 overflow-hidden group">
      <div className="absolute top-2 left-3 z-10">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      {isLive && !isPaused && (
        <div className="absolute top-2 right-3 h-1 w-1 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#10B981]" />
      )}
    </div>
  );
}
