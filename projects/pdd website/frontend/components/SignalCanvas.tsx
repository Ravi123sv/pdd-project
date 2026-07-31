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
 * Optimized for Retina/4K and responsive scaling
 */
export default function SignalCanvas({ label, data, color = "#10B981", isLive, isPaused }: SignalCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const render = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Use high resolution for sharp lines (Retina/4K support)
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        // Only update dimensions if they changed to avoid flicker
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        }

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
          ctx.lineWidth = 1.8; // Slightly thicker for universal visibility
          ctx.lineJoin = "round";
          ctx.lineCap = "round";

          const step = width / (data.length - 1);
          data.forEach((val, i) => {
            const x = i * step;
            // Adaptive scaling based on canvas height
            const yScale = height / 160;
            const y = midY - (val * yScale);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();

          // 3. Draw "Current" point glow
          if (isLive && !isPaused) {
              const lastVal = data[data.length - 1];
              const lastX = (data.length - 1) * step;
              const lastY = midY - (lastVal * (height / 160));

              ctx.beginPath();
              ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
              ctx.fillStyle = color;
              ctx.shadowBlur = 12;
              ctx.shadowColor = color;
              ctx.fill();
          }
        }
    };

    // Use ResizeObserver for perfect scaling on any device
    const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(render);
    });

    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }

    render();

    return () => resizeObserver.disconnect();
  }, [data, isLive, isPaused, color]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#0a0f1d] rounded-lg border border-white/5 overflow-hidden group">
      <div className="absolute top-2 left-3 z-10">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{label}</span>
      </div>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      {isLive && !isPaused && (
        <div className="absolute top-2 right-3 h-1 w-1 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#10B981]" />
      )}
    </div>
  );
}
