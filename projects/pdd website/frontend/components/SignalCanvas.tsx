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
}

/**
 * SignalCanvas Component v2.5
 * Dual-Trace Support: Displays both Raw and AI-Filtered signals for comparison.
 */
export default function SignalCanvas({ label, rawData, filteredData, color = "#10B981", isLive, isPaused, showRaw = true }: SignalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

        const width = rect.width;
        const height = rect.height;
        const midY = height / 2;
        const yScale = height / 160;

        ctx.clearRect(0, 0, width, height);

        // 1. Clinical Grid
        ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
        for (let i = 0; i < height; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

        const step = width / (filteredData.length - 1);

        // 2. Draw RAW Signal (Faint Red/Orange)
        if (showRaw && rawData && rawData.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(239, 68, 68, 0.3)"; // Red-500 with opacity
            ctx.lineWidth = 1;
            rawData.forEach((val, i) => {
                const x = i * step;
                const y = midY - (val * yScale);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // 3. Draw FILTERED Signal (Primary Color)
        if (filteredData && filteredData.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          filteredData.forEach((val, i) => {
            const x = i * step;
            const y = midY - (val * yScale);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          if (isLive && !isPaused) {
              const lastVal = filteredData[filteredData.length - 1];
              const lastX = (filteredData.length - 1) * step;
              const lastY = midY - (lastVal * yScale);

              ctx.beginPath();
              ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
              ctx.fillStyle = color;
              ctx.shadowBlur = 12;
              ctx.shadowColor = color;
              ctx.fill();
          }
        }
    };

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(render));
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    render();
    return () => resizeObserver.disconnect();
  }, [rawData, filteredData, isLive, isPaused, color, showRaw]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#070b14] rounded-lg border border-white/5 overflow-hidden">
      <div className="absolute top-2 left-3 z-10 flex items-center gap-3">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
        {showRaw && <span className="text-[7px] font-bold text-red-500/40 uppercase tracking-widest">Raw Overlay Active</span>}
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
