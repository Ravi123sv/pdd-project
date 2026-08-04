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
 * SignalCanvas Component v3.5
 * Full Dual-Trace Support: Displays Raw (Noise) and AI-Filtered streams simultaneously.
 * Optimized for high-DPI clinical workstation displays.
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
        const yScale = height / 150;

        ctx.clearRect(0, 0, width, height);

        // 1. Digital Grid (Clinical Standard)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
        ctx.lineWidth = 0.5;
        for (let i = 0; i < width; i += 20) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke(); }
        for (let i = 0; i < height; i += 20) { ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke(); }

        const step = width / (filteredData.length - 1);

        // 2. RAW SIGNAL TRACE (Simulated Analog Input)
        if (showRaw && rawData && rawData.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = "rgba(244, 63, 94, 0.4)"; // Rose-500 transparent
            ctx.lineWidth = 1;
            rawData.forEach((val, i) => {
                const x = i * step;
                const y = midY - (val * yScale);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // 3. AI-FILTERED TRACE (Neural Logic Output)
        if (filteredData && filteredData.length > 0) {
          ctx.beginPath();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.2;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          filteredData.forEach((val, i) => {
            const x = i * step;
            const y = midY - (val * yScale);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // Current Handshake Cursor
          if (isLive && !isPaused) {
              const lastVal = filteredData[filteredData.length - 1];
              const lastX = (filteredData.length - 1) * step;
              const lastY = midY - (lastVal * yScale);

              ctx.beginPath();
              ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
              ctx.fillStyle = color;
              ctx.shadowBlur = 15;
              ctx.shadowColor = color;
              ctx.fill();
              ctx.shadowBlur = 0; // Reset for next lead
          }
        }
    };

    const resizeObserver = new ResizeObserver(() => requestAnimationFrame(render));
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    render();
    return () => resizeObserver.disconnect();
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
