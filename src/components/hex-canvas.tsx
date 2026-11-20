"use client";

import { useEffect, useRef } from "react";

type Cell = { x: number; y: number; phase: number };

/**
 * Interactive honeycomb field — hexagons breathe with ambient pulses
 * and glow amber as the pointer moves across the hero.
 * Automatically pauses when the browser tab is hidden or scrolled out of view.
 */
export default function HexCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = 44; // hex radius
    const mouse = { x: -9999, y: -9999 };
    let w = 0;
    let h = 0;
    let cells: Cell[] = [];
    let raf = 0;
    let running = false;
    let inViewport = true;
    let t = 0;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = [];
      const hexW = Math.sqrt(3) * size;
      const cols = Math.ceil(w / hexW) + 2;
      const rows = Math.ceil(h / (size * 1.5)) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          cells.push({
            x: c * hexW + (r % 2 ? hexW / 2 : 0),
            y: r * size * 1.5,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const drawHex = (x: number, y: number, s: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 180) * (60 * i - 30);
        const px = x + s * Math.cos(a);
        const py = y + s * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const tick = () => {
      if (!running) return;
      t += 0.008;
      ctx.clearRect(0, 0, w, h);
      for (const cell of cells) {
        const dx = cell.x - mouse.x;
        const dy = cell.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        const proximity = Math.max(0, 1 - dist / 260);
        const ambient = (Math.sin(t * 2 + cell.phase) + 1) / 2;
        const alpha = 0.028 + ambient * 0.028 + proximity * 0.55;
        drawHex(cell.x, cell.y, size - 2.5);
        if (proximity > 0.02) {
          ctx.fillStyle = `rgba(255,176,0,${(proximity * 0.2).toFixed(3)})`;
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(255,176,0,${alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (reduced || running || document.hidden || !inViewport) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const still = () => {
      ctx.clearRect(0, 0, w, h);
      for (const cell of cells) {
        drawHex(cell.x, cell.y, size - 2.5);
        ctx.strokeStyle = "rgba(255,176,0,0.05)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        inViewport = Boolean(entry?.isIntersecting);
        if (inViewport) start();
        else stop();
      },
      { threshold: 0.01 },
    );

    build();
    if (reduced) {
      still();
    } else {
      io.observe(canvas);
      start();
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVisibility);
    }
    window.addEventListener("resize", build);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener("resize", build);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
