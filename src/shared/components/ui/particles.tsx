"use client";

import { useRef, useEffect } from "react";

interface ParticlesProps {
  quantity?: number;
  staticity?: number;
  ease?: number;
}

interface Particle {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
}

export default function Particles({
  quantity = 50,
  staticity = 70,
  ease = 50,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const canvasSizeRef = useRef({ w: 0, h: 0 });
  const animationIdRef = useRef<number>(1);
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1;
  const rafIdRef = useRef<number>(0);
  const lastMouseMoveRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    contextRef.current = canvas.getContext("2d");
    if (!contextRef.current) return;

    const initCanvas = () => {
      particlesRef.current = [];
      canvasSizeRef.current = {
        w: container.offsetWidth,
        h: container.offsetHeight,
      };

      canvas.width = canvasSizeRef.current.w * dpr;
      canvas.height = canvasSizeRef.current.h * dpr;
      canvas.style.width = `${canvasSizeRef.current.w}px`;
      canvas.style.height = `${canvasSizeRef.current.h}px`;

      if (contextRef.current) {
        contextRef.current.scale(dpr, dpr);
      }

      createParticles();
    };

    const createParticles = () => {
      for (let i = 0; i < quantity; i++) {
        particlesRef.current.push(createParticle());
      }
    };

    const createParticle = (): Particle => ({
      x: Math.random() * canvasSizeRef.current.w,
      y: Math.random() * canvasSizeRef.current.h,
      translateX: 0,
      translateY: 0,
      size: Math.random() * 2 + 0.1,
      alpha: 0,
      targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      magnetism: 0.1 + Math.random() * 4,
    });

    const drawParticle = (particle: Particle) => {
      const ctx = contextRef.current;
      if (!ctx) return;

      ctx.translate(particle.translateX, particle.translateY);
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.alpha})`;
      ctx.fill();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const updateParticle = (particle: Particle, index: number) => {
      const edge = [
        particle.x + particle.translateX - particle.size,
        canvasSizeRef.current.w -
          particle.x -
          particle.translateX -
          particle.size,
        particle.y + particle.translateY - particle.size,
        canvasSizeRef.current.h -
          particle.y -
          particle.translateY -
          particle.size,
      ];

      const closestEdge = Math.min(...edge);
      const remapClosestEdge = Math.max(0, Math.min(1, closestEdge / 20));

      if (remapClosestEdge > 1) {
        particle.alpha = Math.min(particle.alpha + 0.02, particle.targetAlpha);
      } else {
        particle.alpha = particle.targetAlpha * remapClosestEdge;
      }

      particle.x += particle.dx;
      particle.y += particle.dy;
      particle.translateX +=
        (mouseRef.current.x / (staticity / particle.magnetism) -
          particle.translateX) /
        ease;
      particle.translateY +=
        (mouseRef.current.y / (staticity / particle.magnetism) -
          particle.translateY) /
        ease;

      if (
        particle.x < -particle.size ||
        particle.x > canvasSizeRef.current.w + particle.size ||
        particle.y < -particle.size ||
        particle.y > canvasSizeRef.current.h + particle.size
      ) {
        particlesRef.current[index] = createParticle();
      }
    };

    const animate = () => {
      const ctx = contextRef.current;
      if (!ctx) return;

      ctx.clearRect(0, 0, canvasSizeRef.current.w, canvasSizeRef.current.h);

      particlesRef.current.forEach((particle, i) => {
        updateParticle(particle, i);
        drawParticle(particle);
      });

      animationIdRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseMoveRef.current < 16) return;
      lastMouseMoveRef.current = now;

      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleResize = () => {
      if (rafIdRef.current) return;
      rafIdRef.current = requestAnimationFrame(() => {
        initCanvas();
        rafIdRef.current = 0;
      });
    };

    initCanvas();
    animate();

    window.addEventListener("resize", handleResize, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [quantity, staticity, ease]);

  return (
    <div
      className="fixed inset-0 pointer-events-none"
      ref={containerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
