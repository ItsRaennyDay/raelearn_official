"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#2A5230", "#4A8A52", "#F5D76E", "#E8A03A", "#7DAA82", "#F5F0E8"];

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  rotation: number; rotationSpeed: number;
  size: number; color: string;
  shape: "rect" | "circle";
}

/** Fire-once canvas confetti burst. Renders a fixed full-screen canvas, animates, then removes itself. */
export default function Confetti({ durationMs = 2600 }: { durationMs?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const w = window.innerWidth;
    const count = 140;
    const particles: Particle[] = Array.from({ length: count }, () => {
      const fromLeft = Math.random() < 0.5;
      return {
        x: fromLeft ? Math.random() * w * 0.3 : w - Math.random() * w * 0.3,
        y: -20 - Math.random() * 200,
        vx: (Math.random() - 0.5) * 6,
        vy: 3 + Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        size: 6 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: Math.random() < 0.5 ? "rect" : "circle",
      };
    });

    let raf = 0;
    const gravity = 0.12;
    const start = performance.now();

    function frame(now: number) {
      const elapsed = now - start;
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const p of particles) {
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.fillStyle = p.color;
        const fade = Math.max(0, 1 - elapsed / durationMs);
        ctx!.globalAlpha = fade;
        if (p.shape === "rect") {
          ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx!.beginPath();
          ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx!.fill();
        }
        ctx!.restore();
      }

      if (elapsed < durationMs) {
        raf = requestAnimationFrame(frame);
      }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[200]"
      aria-hidden="true"
    />
  );
}
