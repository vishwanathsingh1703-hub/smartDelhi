"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
}

export default function SmartDelhiBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animationFrame = 0;
    let particles: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      createParticles();
    };

    const createParticles = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const count = Math.min(
        230,
        Math.max(120, Math.floor((width * height) / 9500))
      );

      particles = [];

      for (let i = 0; i < count; i++) {
        /*
         * Important:
         * Most particles begin toward the LEFT side.
         * Then they gradually spread across the screen.
         */
        const spread = Math.pow(Math.random(), 1.55);

        particles.push({
          x: width * (0.02 + spread * 0.98),
          y: Math.random() * height,

          // pseudo 3D depth
          z: 0.15 + Math.random() * 0.85,

          vx: 0.08 + Math.random() * 0.18,
          vy: (Math.random() - 0.5) * 0.08,

          size: 0.7 + Math.random() * 1.8,

          opacity:
            0.22 +
            Math.random() * 0.42 +
            (1 - spread) * 0.12,

          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawGrid = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      /*
       * Very subtle futuristic grid.
       */
      ctx.save();

      ctx.globalAlpha = 0.055;

      ctx.strokeStyle = "#00d9ff";
      ctx.lineWidth = 1;

      const spacing = 90;

      for (let x = 0; x < width; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawParticles = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      /*
       * Connections only happen between nearby particles.
       */
      const connectionDistance = 150;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        /*
         * 3D movement
         */
        p.x += p.vx * (0.7 + p.z);
        p.y += p.vy;

        /*
         * Slow floating motion
         */
        p.y += Math.sin(time * 0.00045 + p.phase) * 0.025;

        /*
         * Wrap around
         */
        if (p.x > width + 20) {
          p.x = -20;
          p.y = Math.random() * height;
        }

        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        /*
         * Depth affects size and brightness.
         */
        const depthScale = 0.65 + p.z * 0.75;

        const radius = p.size * depthScale;

        /*
         * LEFT SIDE = denser + brighter
         */
        const leftInfluence = Math.max(
          0,
          1 - p.x / (width * 0.65)
        );

        const alpha =
          p.opacity *
          (0.72 + leftInfluence * 0.45);

        /*
         * Glow
         */
        ctx.beginPath();

        ctx.shadowBlur = 12 + p.z * 8;
        ctx.shadowColor = "rgba(0, 220, 255, 0.8)";

        ctx.fillStyle = `rgba(
          0,
          210,
          255,
          ${Math.min(alpha, 0.8)}
        )`;

        ctx.arc(
          p.x,
          p.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.shadowBlur = 0;

        /*
         * Connections
         */
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];

          const dx = p.x - q.x;
          const dy = p.y - q.y;

          const distance = Math.sqrt(
            dx * dx + dy * dy
          );

          if (distance < connectionDistance) {
            const strength =
              (1 - distance / connectionDistance) *
              0.13;

            /*
             * Connections are slightly stronger
             * on the left side.
             */
            const connectionBoost =
              1 +
              Math.max(
                0,
                1 - p.x / (width * 0.55)
              ) *
                0.9;

            ctx.beginPath();

            ctx.strokeStyle = `rgba(
              0,
              190,
              255,
              ${strength * connectionBoost}
            )`;

            ctx.lineWidth = 0.7;

            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);

            ctx.stroke();
          }
        }
      }
    };

    const drawLightField = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      /*
       * Large cyan atmospheric glow from LEFT.
       */
      const pulse =
        0.85 +
        Math.sin(time * 0.0005) * 0.08;

      const gradient = ctx.createRadialGradient(
        width * 0.12,
        height * 0.45,
        0,
        width * 0.32,
        height * 0.48,
        width * 0.7
      );

      gradient.addColorStop(
        0,
        `rgba(0, 220, 255, ${0.12 * pulse})`
      );

      gradient.addColorStop(
        0.35,
        "rgba(0, 130, 255, 0.055)"
      );

      gradient.addColorStop(
        0.7,
        "rgba(0, 80, 180, 0.02)"
      );

      gradient.addColorStop(
        1,
        "rgba(0, 0, 0, 0)"
      );

      ctx.fillStyle = gradient;

      ctx.fillRect(
        0,
        0,
        width,
        height
      );
    };

    const animate = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      ctx.clearRect(
        0,
        0,
        width,
        height
      );

      /*
       * Base background
       */
      ctx.fillStyle = "#020712";

      ctx.fillRect(
        0,
        0,
        width,
        height
      );

      drawLightField(time);
      drawGrid();
      drawParticles(time);

      animationFrame =
        requestAnimationFrame(animate);
    };

    resize();

    window.addEventListener(
      "resize",
      resize
    );

    animationFrame =
      requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
}