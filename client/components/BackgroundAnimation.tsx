'use client';

import { useEffect, useRef } from 'react';

export default function BackgroundAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);

    const particles: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }[] = [];

    const particleCount = 95;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2.2 + 1.2,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Connecting Lines
      ctx.strokeStyle = 'rgba(56,189,248,0.2)';
      ctx.lineWidth = 1.1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Moving Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;

        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = 'rgba(56,189,248,0.9)';
        ctx.fillStyle = 'rgba(255,255,255,0.95)';

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#020817]">
      {/* 3D Network Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Cyan Glow */}
      <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl animate-pulse" />

      {/* Blue Glow */}
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-3xl animate-pulse" />

      {/* Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:40px_40px]" />
    </div>
  );
}