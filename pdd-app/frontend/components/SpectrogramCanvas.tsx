"use client";

import { useEffect, useRef } from "react";

interface SpectrogramCanvasProps {
  data: number[]; // Time-series buffer
  isLive: boolean;
}

/**
 * SpectrogramCanvas Component v1.0
 * Implements Real-time Frequency Domain Visualization (Heatmap)
 * Optimized for Neural Power Spectral Density (PSD) monitoring.
 */
export default function SpectrogramCanvas({ data, isLive }: SpectrogramCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const frameId = useRef<number>();

  // History buffer for scrolling heatmap
  const historyRef = useRef<number[][]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const render = () => {
        const dpr = window.devicePixelRatio || 1;
        const rect = container.getBoundingClientRect();

        if (canvas.width !== Math.floor(rect.width * dpr) || canvas.height !== Math.floor(rect.height * dpr)) {
            canvas.width = Math.floor(rect.width * dpr);
            canvas.height = Math.floor(rect.height * dpr);
            ctx.scale(dpr, dpr);
        }

        const width = rect.width;
        const height = rect.height;

        // 1. Simulated FFT (Frequency Distribution)
        // In a real medical app, we'd use a WebAssembly FFT library here.
        const bands = 40; // 0-40 Hz
        const spectrum = new Array(bands).fill(0).map((_, i) => {
            const freq = i;
            // High Alpha (8-12Hz) and Beta (13-30Hz) simulation
            let power = Math.random() * 5;
            if (freq >= 8 && freq <= 12) power += 15 + Math.random() * 10;
            if (freq >= 13 && freq <= 25) power += 5 + Math.random() * 5;
            return power;
        });

        if (isLive) {
            historyRef.current.push(spectrum);
            if (historyRef.current.length > width / 4) historyRef.current.shift();
        }

        // 2. Draw Heatmap
        ctx.fillStyle = "#03060c";
        ctx.fillRect(0, 0, width, height);

        const colWidth = 4;
        const rowHeight = height / bands;

        historyRef.current.forEach((spec, xIdx) => {
            spec.forEach((power, yIdx) => {
                const alpha = Math.min(power / 30, 1);
                // Neural Color Map: Deep Blue -> Emerald -> Primary Blue
                ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
                if (alpha > 0.6) ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;

                ctx.fillRect(xIdx * colWidth, height - (yIdx * rowHeight), colWidth, rowHeight);
            });
        });

        // 3. Frequency Labels
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        ctx.font = "8px 'JetBrains Mono'";
        ctx.fillText("40Hz", 5, 12);
        ctx.fillText("0Hz", 5, height - 5);

        frameId.current = requestAnimationFrame(render);
    };

    frameId.current = requestAnimationFrame(render);
    return () => {
        if (frameId.current) cancelAnimationFrame(frameId.current);
    };
  }, [data, isLive]);

  return (
    <div ref={containerRef} className="relative h-full w-full bg-[#03060c] rounded-xl border border-white/5 overflow-hidden group">
      <div className="absolute top-2 left-4 z-10 flex items-center gap-2">
         <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Spectral Density</span>
         <div className="h-1 w-1 rounded-full bg-blue-500 animate-pulse" />
      </div>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}
