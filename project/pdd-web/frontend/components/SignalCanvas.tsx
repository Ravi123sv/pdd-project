"use client";

import { useEffect, useRef } from "react";

interface SignalCanvasProps {
  label: string;
  data: number[];
  color?: string;
  isLive: boolean;
  isPaused: boolean;
}

export default function SignalCanvas({ label, data, color = "#10B981", isLive, isPaused }: SignalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isLive || isPaused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const midY = height / 2;

    // Clear and draw background grid
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
    }
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
    }

    // Draw signal
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";

    const step = width / data.length;
    data.forEach((val, i) => {
      const x = i * step;
      const y = midY + val;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

  }, [data, isLive, isPaused, color]);

  return (
    <div className="relative h-full w-full bg-[#0F172A] rounded-xl border border-white/5 overflow-hidden group">
      <div className="absolute top-2 left-3 z-10">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{label}</span>
      </div>
      <canvas
        ref={canvasRef}
        width={400}
        height={200}
        className="w-full h-full"
      />
      {isLive && !isPaused && (
        <div className="absolute top-2 right-3 h-1.5 w-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#10B981]" />
      )}
    </div>
  );
}
