"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Great_Vibes } from "next/font/google";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import ReviewSection from "@/components/ReviewSection";
import DelhiGallery from "@/components/DelhiGallery";
import DelhiCivicIndex from "@/components/DelhiCivicIndex";
const citiesList = [
  "Smart Delhi",
  "Smart Citizen",
  "Digital India",
  "Clean India",
];

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {
  // =========================================================
  // TYPING ANIMATION
  // =========================================================

  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const [currentCityIndex, setCurrentCityIndex] = useState(0);

  useEffect(() => {
    const i = loopNum % citiesList.length;
    // Heatmap / Issue Filter State
    const fullText = citiesList[i];
    
    const timer = setTimeout(() => {
      const updatedText = isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1);

      setDisplayText(updatedText);

      if (!isDeleting && updatedText === fullText) {
        setTimeout(() => setIsDeleting(true), 2100);
        setTypingSpeed(80);
      } else if (isDeleting && updatedText === "") {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
        setCurrentCityIndex((prev) => (prev + 1) % citiesList.length);
        setTypingSpeed(150);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, typingSpeed]);

  // =========================================================
  // BACKGROUND PARTICLE NETWORK
  // =========================================================

  useEffect(() => {
    const canvas = document.getElementById(
      "bg-canvas"
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    resize();

    window.addEventListener("resize", resize);

    // Mouse interaction
    const mouse = {
      x: -1000,
      y: -1000,
      radius: 150,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    // =========================================================
    // PARTICLE CLASS
    // =========================================================

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseRadius: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;

        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = (Math.random() - 0.5) * 0.6;

        this.baseRadius = Math.random() * 1.5 + 1;
        this.radius = this.baseRadius;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > width) {
          this.vx *= -1;
        }

        if (this.y < 0 || this.y > height) {
          this.vy *= -1;
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          this.radius =
            this.baseRadius +
            (1 - distance / mouse.radius) * 2.5;
        } else {
          this.radius = this.baseRadius;
        }
      }

      draw() {
        if (!ctx) return;

        ctx.beginPath();

        ctx.arc(
          this.x,
          this.y,
          this.radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = "rgba(34, 211, 238, 0.7)";
        ctx.fill();
      }
    }

    const particleCount = Math.min(
      Math.floor((width * height) / 12000),
      80
    );

    const particles: Particle[] = Array.from(
      { length: particleCount },
      () => new Particle()
    );

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;

          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            ctx.beginPath();

            ctx.moveTo(
              particles[i].x,
              particles[i].y
            );

            ctx.lineTo(
              particles[j].x,
              particles[j].y
            );

            ctx.strokeStyle = `rgba(14, 165, 233, ${0.2 * (1 - dist / 130)
              })`;

            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(
        "mousemove",
        handleMouseMove
      );
      window.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030712] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/auth-bg.png"
          alt="SmartDELHI Background"
          fill
          priority
          className="object-cover object-center opacity-00"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/85 via-[#030712]/75 to-[#030712]/98" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(14,165,233,0.12),transparent_45%)]" />
      </div>

      {/* =====================================================
          PARTICLE CANVAS
      ===================================================== */}

      <canvas
        id="bg-canvas"
        className="fixed inset-0 z-[1] pointer-events-none"
      />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen flex-col px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            SECTION 1 — HERO
        =================================================== */}

        <section className="min-h-screen flex flex-col">

          {/* =================================================
              NAVBAR
          ================================================= */}

          <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="relative w-14 h-14">
                <Image
                  src="/images/logo-image.png"
                  alt="SmartDELHI Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>

              <div>
                <div className="flex items-center">

                  <span className="font-bold text-3xl tracking-[0.08em]">

                    <span
                      className={`${greatVibes.className} text-5xl text-white leading-none`}
                    >
                      S
                    </span>

                    <span className="-ml-1">
                      mart
                    </span>

                    <span className="-ml-1 text-blue-500">
                      {" "}
                      DELHI
                    </span>

                  </span>

                </div>

                <div className="text-[8px] tracking-[0.4em] uppercase text-slate-500 ml-1">
                  Intelligent Civic Platform
                </div>
              </div>

            </div>

            {/* NAVIGATION */}

            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">

              <a
                href="#"
                className="text-white hover:text-blue-400 transition"
              >
                Home
              </a>

              <a
                href="#"
                className="hover:text-blue-400 transition"
              >
                Complains
              </a>

              <a
                href="#heatmap"
                className="text-blue-400 transition"
              >
                Heat Map
              </a>

              <a
                href="#"
                className="hover:text-blue-400 transition"
              >
                Report
              </a>

              <Link
                href="/about-us"
                className="text-cyan-400 hover:text-cyan-300 transition"
              >
                About Us
              </Link>

              <a
                href="#"
                className="hover:text-blue-400 transition"
              >
                Contact Us
              </a>

            </nav>

            {/* LOGIN */}

            <Link
              href="/auth"
              className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition duration-300"
            >
              <span className="relative z-10">
                Login | Register
              </span>
            </Link>

          </header>

          {/* =================================================
              HERO CONTENT
          ================================================= */}

          <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-8 items-center">

            {/* =================================================
                LEFT HERO
            ================================================= */}

            <div className="lg:col-span-7 space-y-6 relative">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-[10px] tracking-[0.2em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Delhi Civic Intelligence
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight leading-[0.95]">

                The Digital
                <br />

                <span className="text-white">
                  Opera
                </span>

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                  ting System
                </span>

                <br />

                for{" "}

                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                  {displayText}
                </span>

                {!isDeleting && (
                  <span className="animate-pulse text-cyan-400 ml-1">
                    .
                  </span>
                )}

              </h1>

              <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
                SmartDELHI combines AI, GIS mapping, citizen
                reporting, predictive analytics and ward
                intelligence into a single real-time civic
                operating platform.
              </p>

              {/* HERO BUTTONS */}

              <div className="flex flex-wrap items-center gap-4 pt-2">

                <button className="group flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-xl shadow-blue-500/30 hover:brightness-110 hover:-translate-y-0.5 transition">

                  <i className="fa-solid fa-paper-plane text-xs" />

                  <span>
                    Explore Live Map
                  </span>

                  <span className="group-hover:translate-x-1 transition">
                    →
                  </span>

                </button>

                <button className="flex items-center gap-2 bg-gray-900/70 backdrop-blur-md border border-white/10 text-gray-200 px-6 py-3 rounded-xl font-medium text-sm hover:border-blue-500/50 hover:bg-blue-950/30 transition">

                  <i className="fa-solid fa-file-lines text-blue-400" />

                  <span>
                    Report Complaint
                  </span>

                </button>

              </div>

              {/* HERO MINI STATS */}

              <div className="grid grid-cols-3 gap-3 max-w-xl pt-5">

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3">
                  <div className="text-lg font-bold text-cyan-300">
                    272
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Wards
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3">
                  <div className="text-lg font-bold text-emerald-300">
                    96.8%
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    AI Verified
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-3">
                  <div className="text-lg font-bold text-white">
                    18 min
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500">
                    Avg Response
                  </div>
                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT COMMAND CENTER
            ================================================= */}

            <div className="lg:col-span-5 relative group">

              {/* AMBIENT LIGHT */}

              <div
                className="
                  absolute
                  -inset-10
                  rounded-[50px]
                  bg-cyan-500/[0.07]
                  blur-[80px]
                  opacity-70
                  group-hover:opacity-100
                  transition-opacity
                  duration-1000
                  pointer-events-none
                "
              />

              <div
                className="
                  absolute
                  right-0
                  top-10
                  w-64
                  h-64
                  rounded-full
                  bg-blue-600/[0.08]
                  blur-[90px]
                  pointer-events-none
                "
              />

              {/* MAIN PANEL */}

              <motion.div
                initial={{
                  opacity: 0,
                  x: 40,
                  scale: 0.96,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{
                  y: -5,
                }}
                className="
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border
                  border-white/[0.10]
                  bg-[#08111f]/90
                  backdrop-blur-2xl
                  shadow-[0_35px_100px_rgba(0,0,0,0.55)]
                  transition-all
                  duration-700
                "
              >

                {/* TOP LIGHT */}

                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-24 bg-cyan-400/[0.06] blur-[45px] pointer-events-none" />

                {/* =================================================
                    PANEL HEADER
                ================================================= */}

                <div className="relative px-6 sm:px-7 pt-6 pb-5">

                  <div className="flex items-start justify-between">

                    <div>

                      <div className="flex items-center gap-2 text-[10px] tracking-[0.28em] uppercase text-cyan-400 font-semibold">

                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />

                        Delhi Intelligence

                      </div>

                      <h3 className="mt-2 text-2xl sm:text-[27px] font-semibold tracking-[-0.03em] text-white">
                        City Pulse
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Real-time civic activity overview
                      </p>

                    </div>

                    {/* LIVE INDICATOR */}

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300 text-[10px] font-medium">

                      <span className="relative flex w-2 h-2">

                        <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-60 animate-ping" />

                        <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-400" />

                      </span>

                      LIVE

                    </div>

                  </div>

                </div>

                {/* =================================================
                    MAIN ACTIVITY VISUAL
                ================================================= */}

                <div className="relative mx-6 sm:mx-7 h-[205px] overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#050b14]">

                  {/* GRID */}

                  <div className="absolute inset-0 opacity-40 bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)] bg-[size:32px_32px]" />

                  {/* CENTER GLOW */}

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-cyan-400/[0.08] blur-[45px]" />

                  {/* CITY SIGNAL */}

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[135px] h-[135px] rounded-full border border-cyan-400/20" />

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92px] h-[92px] rounded-full border border-cyan-400/20" />

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[45px] h-[45px] rounded-full bg-cyan-400/[0.08] border border-cyan-300/40 shadow-[0_0_30px_rgba(34,211,238,0.18)]" />

                  {/* SCANNING LINE */}

                  <motion.div
                    animate={{
                      x: ["-20%", "120%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-cyan-400/[0.12] to-transparent skew-x-[-12deg]"
                  />

                  {/* SIGNAL POINTS */}

                  <motion.span
                    animate={{
                      y: [0, -5, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                    }}
                    className="absolute left-[24%] top-[30%] w-2 h-2 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,0.8)]"
                  />

                  <motion.span
                    animate={{
                      y: [0, 5, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                    }}
                    className="absolute right-[25%] top-[28%] w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.8)]"
                  />

                  <motion.span
                    animate={{
                      y: [0, -4, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2.8,
                      repeat: Infinity,
                    }}
                    className="absolute right-[30%] bottom-[24%] w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_14px_rgba(192,132,252,0.8)]"
                  />

                  <motion.span
                    animate={{
                      y: [0, 4, 0],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                    }}
                    className="absolute left-[30%] bottom-[25%] w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.8)]"
                  />

                  {/* CENTER LABEL */}

                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">

                    <div className="text-[9px] uppercase tracking-[0.28em] text-cyan-400/70">
                      Delhi
                    </div>

                    <div className="mt-1 text-sm font-semibold text-white">
                      Live Network
                    </div>

                  </div>

                  {/* TOP LEFT LABEL */}

                  <div className="absolute left-4 top-4 text-[9px] uppercase tracking-[0.2em] text-slate-500">
                    Civic activity
                  </div>

                  {/* BOTTOM RIGHT */}

                  <div className="absolute right-4 bottom-4 text-[9px] text-emerald-400 font-medium">
                    ● Systems operational
                  </div>

                </div>

                {/* =================================================
                    LIVE METRICS
                ================================================= */}

                <div className="px-6 sm:px-7 py-6">

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-6">

                    {/* ACTIVE COMPLAINTS */}

                    <div className="group/stat">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        Active Complaints
                      </div>

                      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-white transition-colors group-hover/stat:text-cyan-300">
                        1,284
                      </div>
                    </div>

                    {/* AI VERIFIED */}

                    <div className="group/stat">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        AI Verified
                      </div>

                      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-emerald-300">
                        96.8%
                      </div>
                    </div>

                    {/* RESPONSE */}

                    <div className="group/stat">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        Avg Response
                      </div>

                      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
                        18 min
                      </div>
                    </div>

                    {/* SOLVED */}

                    <div className="group/stat">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        Solved Today
                      </div>

                      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
                        1,031
                      </div>
                    </div>

                    {/* DEPARTMENTS */}

                    <div className="group/stat">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        Departments
                      </div>

                      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-white">
                        12
                      </div>
                    </div>

                    {/* WARDS */}

                    <div className="group/stat">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                        Wards Active
                      </div>

                      <div className="mt-1.5 text-2xl font-semibold tracking-tight text-cyan-300">
                        272
                      </div>
                    </div>

                  </div>

                  {/* BOTTOM STATUS */}

                  <div className="mt-6 pt-5 border-t border-white/[0.07] flex items-center justify-between">

                    <div>

                      <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                        Intelligence status
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        Monitoring Delhi civic systems
                      </div>

                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-emerald-400">

                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />

                      Operational

                    </div>

                  </div>

                </div>

              </motion.div>

            </div>

          </main>

          {/* =================================================
              BOTTOM UTILITY CARDS
          ================================================= */}

          <footer className="max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pb-6">

            {/* GARBAGE */}

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-red-500/60 transition shadow-lg">

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-500" />

              <div className="text-red-400 text-lg mb-2">
                <i className="fa-solid fa-trash-can" />
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Garbage
              </div>

              <div className="text-xl font-bold mt-0.5">
                284
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                Active Complaints
              </div>

            </div>

            {/* ROADS */}

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-amber-500/60 transition shadow-lg">

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-amber-500" />

              <div className="text-amber-400 text-lg mb-2">
                <i className="fa-solid fa-road" />
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Roads
              </div>

              <div className="text-xl font-bold mt-0.5">
                121
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                Active Complaints
              </div>

            </div>

            {/* WATER */}

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-cyan-500/60 transition shadow-lg">

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-cyan-400" />

              <div className="text-cyan-400 text-lg mb-2">
                <i className="fa-solid fa-droplet" />
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Water
              </div>

              <div className="text-xl font-bold mt-0.5">
                89
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                Active Complaints
              </div>

            </div>

            {/* ELECTRICITY */}

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-emerald-500/60 transition shadow-lg">

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-400" />

              <div className="text-emerald-400 text-lg mb-2">
                <i className="fa-solid fa-bolt-lightning" />
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Electricity
              </div>

              <div className="text-xl font-bold mt-0.5">
                52
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                Active Complaints
              </div>

            </div>

            {/* SEWAGE */}

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-purple-500/60 transition shadow-lg">

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-500" />

              <div className="text-purple-400 text-lg mb-2">
                <i className="fa-solid fa-wave-square" />
              </div>

              <div className="text-xs text-gray-400 font-medium">
                Sewage
              </div>

              <div className="text-xl font-bold mt-0.5">
                44
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                Active Complaints
              </div>

            </div>

            {/* AQI */}

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-orange-500/60 transition shadow-lg">

              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500" />

              <div className="text-orange-400 text-lg mb-2">
                <i className="fa-solid fa-cloud-sun" />
              </div>

              <div className="text-xs text-gray-400 font-medium">
                AQI
              </div>

              <div className="text-xl font-bold mt-0.5">
                31
              </div>

              <div className="text-[10px] text-gray-400 mt-1">
                Active Complaints
              </div>

            </div>

          </footer>

        </section>

        {/* =====================================================
            SECTION 2 — LIVE DELHI HEATMAP
        ===================================================== */}

        <section
          id="heatmap"
          className="max-w-7xl mx-auto w-full pt-16 pb-16 space-y-6"
        >

          {/* =================================================
              HEATMAP HEADER
          ================================================= */}



          {/* =================================================
              LOWER GRID
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

            {/* =================================================
                TOP PERFORMING WARDS
            ================================================= */}

            <div className="lg:col-span-7 bg-gray-900/85 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-5 shadow-[0_0_25px_rgba(0,102,255,0.25)]">

              <div className="flex items-center justify-between mb-4">

                <h3 className="text-sm font-bold tracking-wider text-white uppercase">
                  TOP PERFORMING WARDS
                </h3>

                <a
                  href="#"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  <span>
                    View All 272 Wards
                  </span>

                  <i className="fa-solid fa-arrow-right text-[10px]" />
                </a>

              </div>

              {/* TABLE HEADER */}

              <div className="grid grid-cols-12 text-[11px] font-semibold text-gray-400 pb-2 border-b border-white/10 px-2">

                <span className="col-span-1">
                  Rank
                </span>

                <span className="col-span-4">
                  Ward
                </span>

                <span className="col-span-4">
                  Performance Score
                </span>

                <span className="col-span-3 text-right">
                  Avg. Response Time
                </span>

              </div>

              {/* TABLE ROWS */}

              <div className="space-y-3 pt-3 text-xs">

                {/* ROHINI */}

                <div className="grid grid-cols-12 items-center px-2 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition">

                  <span className="col-span-1 font-bold text-blue-400">
                    #1
                  </span>

                  <span className="col-span-4 font-medium text-white">
                    Rohini
                  </span>

                  <span className="col-span-4 flex items-center gap-2">

                    <span className="font-bold">
                      98.7%
                    </span>

                    <div className="w-20 h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div className="w-[98%] h-full bg-emerald-400 rounded-full" />
                    </div>

                  </span>

                  <span className="col-span-3 text-right font-medium text-gray-300">
                    12 min
                  </span>

                </div>

                {/* JANAKPURI */}

                <div className="grid grid-cols-12 items-center px-2 py-2 rounded-xl bg-white/5 border border-white/5 hover:border-emerald-400/20 transition">

                  <span className="col-span-1 font-bold text-blue-400">
                    #2
                  </span>

                  <span className="col-span-4 font-medium text-white">
                    Janakpuri
                  </span>

                  <span className="col-span-4 flex items-center gap-2">

                    <span className="font-bold">
                      97.2%
                    </span>

                    <div className="w-20 h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div className="w-[95%] h-full bg-emerald-400 rounded-full" />
                    </div>

                  </span>

                  <span className="col-span-3 text-right font-medium text-gray-300">
                    14 min
                  </span>

                </div>

              </div>

            </div>

            {/* =================================================
                SYSTEM PERFORMANCE
            ================================================= */}

            <div className="lg:col-span-5 bg-gray-900/85 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-5 shadow-[0_0_25px_rgba(0,102,255,0.25)]">

              <div className="flex items-center justify-between mb-5">

                <div>

                  <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                    System Intelligence
                  </div>

                  <h3 className="text-lg font-bold text-white mt-1">
                    City Performance
                  </h3>

                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300 text-[10px]">
                  Operational
                </div>

              </div>

              {/* PERFORMANCE BARS */}

              <div className="space-y-5">

                <div>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-slate-400">
                      Complaint Resolution
                    </span>

                    <span className="text-white font-semibold">
                      92%
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-black/50 overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    />

                  </div>

                </div>

                <div>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-slate-400">
                      AI Verification
                    </span>

                    <span className="text-white font-semibold">
                      96.8%
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-black/50 overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "96.8%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
                    />

                  </div>

                </div>

                <div>

                  <div className="flex justify-between text-xs mb-2">

                    <span className="text-slate-400">
                      Worker Availability
                    </span>

                    <span className="text-white font-semibold">
                      88%
                    </span>

                  </div>

                  <div className="h-2 rounded-full bg-black/50 overflow-hidden">

                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "88%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-400"
                    />

                  </div>

                </div>

              </div>

              {/* SYSTEM FOOTER */}

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">

                <div className="text-xs text-slate-500">
                  Delhi civic network
                </div>

                <div className="flex items-center gap-2 text-[10px] text-emerald-400">

                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />

                  All systems normal

                </div>

              </div>
           

            </div>

          </div>
          {/* civic index */}
          <DelhiCivicIndex />
 {/*delhi imaage galary*/}
            <DelhiGallery />
            {/* review section  */}
           <ReviewSection />
        </section>

      </div>

    </div>
  );
}