'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Great_Vibes } from 'next/font/google';

const citiesList = [
  "𝓒ities",
  "𝒟elhi",
  "𝓜umbai",
  "𝓚olkata",
  "𝓒hennai",
  "𝓛ucknow",
  "𝓟atna",
  "𝓙aipur",
];

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
});

export default function Home() {

  // Typing Animation States
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  // Agar kahin aur use ho raha hai to ise rehne do
  const [currentCityIndex, setCurrentCityIndex] = useState(0);

  // Typing Effect
  useEffect(() => {
    const i = loopNum % citiesList.length;
    const fullText = citiesList[i];

    const timer = setTimeout(() => {
      const updatedText = isDeleting
        ? fullText.substring(0, displayText.length - 1)
        : fullText.substring(0, displayText.length + 1);

      setDisplayText(updatedText);

      if (!isDeleting && updatedText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
        setTypingSpeed(80);
      } else if (isDeleting && updatedText === "") {
        setIsDeleting(false);
        setLoopNum((prev) => prev + 1);
        setTypingSpeed(150);
      }
    }, typingSpeed);

    return () => clearTimeout(timer);

  }, [displayText, isDeleting, loopNum, typingSpeed]);

  // -------------------------
// -------------------------
// Background Animation useEffect
// -------------------------

// -------------------------
  // Background Animation
  // -------------------------
 // -------------------------

  // Background Animation useEffect

  // -------------------------



  useEffect(() => {

    const canvas = document.getElementById("bg-canvas") as HTMLCanvasElement | null;

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



    window.addEventListener("resize", resize);

    resize();



    // Mouse Tracking for interaction

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



    // Particle class setup

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



        if (this.x < 0 || this.x > width) this.vx *= -1;

        if (this.y < 0 || this.y > height) this.vy *= -1;



        // Interaction with mouse cursor

        const dx = mouse.x - this.x;

        const dy = mouse.y - this.y;

        const distance = Math.sqrt(dx * dx + dy * dy);



        if (distance < mouse.radius) {

          this.radius = this.baseRadius + (1 - distance / mouse.radius) * 2.5;

        } else {

          this.radius = this.baseRadius;

        }

      }



      draw() {

        if (!ctx) return;

        ctx.beginPath();

        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        ctx.fillStyle = "rgba(34, 211, 238, 0.7)";

        ctx.fill();

      }

    }



    const particleCount = Math.min(Math.floor((width * height) / 12000), 80);

    const particles: Particle[] = Array.from({ length: particleCount }, () => new Particle());



    const animate = () => {

      ctx.clearRect(0, 0, width, height);



      // Connect particles with lines

      for (let i = 0; i < particles.length; i++) {

        particles[i].update();

        particles[i].draw();



        for (let j = i + 1; j < particles.length; j++) {

          const dx = particles[i].x - particles[j].x;

          const dy = particles[i].y - particles[j].y;

          const dist = Math.sqrt(dx * dx + dy * dy);



          if (dist < 130) {

            ctx.beginPath();

            ctx.moveTo(particles[i].x, particles[i].y);

            ctx.lineTo(particles[j].x, particles[j].y);

            ctx.strokeStyle = `rgba(14, 165, 233, ${0.2 * (1 - dist / 130)})`;

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

      window.removeEventListener("mousemove", handleMouseMove);

      window.removeEventListener("mouseleave", handleMouseLeave);

      cancelAnimationFrame(animationFrameId);

    };

  }, []);


  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#030712] text-white">

      {/* BACKGROUND INDIA GATE IMAGE WITH OVERLAY */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/auth-bg.png"
          alt="SmartDELHI Background"
          fill
          priority
          className="object-cover object-center opacity-00"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/90 via-[#030712]/70 to-[#030712]/95" />
      </div>

      {/* 3D INTERACTIVE NETWORK CANVAS ANIMATION */}
      <canvas id="bg-canvas" className="fixed inset-0 z-1 pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between min-h-screen space-y-12 px-4 sm:px-6 lg:px-8">

        {/* ================= SECTION 1: HERO SCREEN ================= */}
        <div className="min-h-screen flex flex-col justify-between">
          {/* Top Navigation Bar */}
          <header className="max-w-7xl mx-auto w-full flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 relative">
                <Image
                  src="/images/logo-image.png"   // agar jpg/webp hai to extension change kar do
                  alt="SmartDELHI Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-3xl tracking-[0.08em]">
                    <span className={`${greatVibes.className} text-5xl text-white leading-none`}>
                      S
                    </span>
                    <span className="-ml-1">mart</span>

                    <span className={`${greatVibes.className} text-5xl text-blue-500 leading-none ml-1`}>
                      D
                    </span>
                    <span className="-ml-1 text-blue-500">ELHI</span>
                  </span>
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
              <a href="#" className="text-white hover:text-blue-400 transition">Platform</a>
              <a href="#" className="hover:text-blue-400 transition">Solutions</a>
              <a href="#" className="text-blue-400 transition">Heatmap</a>
              <a href="#" className="hover:text-blue-400 transition">Analytics</a>
              <a href="#" className="hover:text-blue-400 transition">Dashboard</a>
            </nav>

            <Link
              href="/auth"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 transition duration-300"
            >
              Login / Register
            </Link>
          </header>

          {/* Main Content Grid */}
          <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-6 items-center">

            {/* Left Side: Hero Text */}
            <div className="lg:col-span-7 space-y-6 relative">



              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none">
                The Digit<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">al</span> <br />
                Opera<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">ting System
                </span> <br />
                for<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400"> Smart </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                  {displayText}
                </span>
                {!isDeleting && (
                  <span className="animate-pulse text-cyan-400 ml-1">..</span>
                )}
              </h1>

              <p className="text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed">
                SmartDELHI combines AI, GIS mapping, citizen reporting, predictive analytics and ward intelligence into a single real-time civic operating platform.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium text-sm shadow-xl shadow-blue-500/30 hover:brightness-110 transition">
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                  <span>Explore Live Map</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-900/70 backdrop-blur-md border border-white/10 text-gray-200 px-6 py-3 rounded-xl font-medium text-sm hover:border-blue-500/50 transition">
                  <i className="fa-solid fa-file-lines text-blue-400"></i>
                  <span>Report Complaint</span>
                </button>
              </div>
            </div>

            {/* Right Side: Command Center */}
            <div className="lg:col-span-5 relative">
{/* <div className="absolute -left-8 top-1/4 hidden xl:block bg-gray-900/80 backdrop-blur-md border border-blue-500/30 p-3.5 rounded-2xl z-20 w-48 shadow-[0_0_20px_rgba(0,140,255,0.25)]">
                <div className="flex items-center space-x-2 text-blue-400 text-xs mb-1">
                  <i className="fa-solid fa-wave-square"></i>
                  <span>Live Complaints</span>
                </div>
                <div className="text-2xl font-bold tracking-tight">1,284</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-1">
                  <i className="fa-solid fa-arrow-trend-up"></i> +12% vs yesterday
                </div>
              </div> */}
              

              <div >
                {/*className="absolute -right-8 bottom-1/4 hidden xl:block bg-gray-900/80 backdrop-blur-md border border-blue-500/30 p-3.5 rounded-2xl z-20 w-48 shadow-[0_0_20px_rgba(0,140,255,0.25)]" <div className="flex items-center space-x-2 text-purple-400 text-xs mb-1">
                  <i className="fa-solid fa-crosshairs"></i>
                  <span>AI Accuracy</span>
                </div>
                <div className="text-2xl font-bold tracking-tight text-cyan-300">98.7%</div>
                <div className="text-[10px] text-emerald-400 font-medium mt-1">
                  <i className="fa-solid fa-arrow-trend-up"></i> +4% improvement
                </div> */}
              </div>

              <div className="bg-gray-900/85 backdrop-blur-xl p-5 sm:p-6 rounded-3xl border border-blue-500/40 shadow-[0_0_30px_rgba(0,102,255,0.4)] relative z-10">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] tracking-widest text-blue-400 font-bold uppercase">Delhi Live</span>
                    <h3 className="text-lg font-bold">AI Command Center</h3>
                  </div>
                  <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full text-xs text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-medium">Online</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5 items-center">
                  <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center bg-black/50 rounded-full border border-blue-500/30 overflow-hidden shadow-inner">
                    <div className="absolute w-3/4 h-3/4 rounded-full border border-blue-500/15"></div>
                    <div className="absolute w-1/2 h-1/2 rounded-full border border-blue-500/20"></div>
                    <div className="absolute w-1/4 h-1/4 rounded-full border border-blue-500/25"></div>
                    <div className="absolute w-full h-[1px] bg-blue-500/35"></div>
                    <div className="absolute h-full w-[1px] bg-blue-500/35"></div>
                    <div className="absolute w-full h-full animate-[spin_4s_linear_infinite] flex items-center justify-center origin-center">
                      <div className="w-1/2 h-[2px] bg-gradient-to-r from-transparent to-cyan-400 absolute right-0 top-1/2"></div>
                    </div>
                    <span className="absolute top-10 left-12 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_red]"></span>
                    <span className="absolute top-16 right-10 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_10px_orange]"></span>
                    <span className="absolute bottom-12 right-14 w-2 h-2 bg-purple-400 rounded-full shadow-[0_0_10px_purple]"></span>
                    <span className="absolute bottom-10 left-16 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan]"></span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-triangle-exclamation text-red-400 text-[10px]"></i><span>Active Complaints</span></span>
                      <span className="font-bold">1,284</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-shield-check text-emerald-400 text-[10px]"></i><span>AI Verified</span></span>
                      <span className="font-bold">96.8%</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-clock text-amber-400 text-[10px]"></i><span>Avg. Response Time</span></span>
                      <span className="font-bold">18 min</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-circle-check text-indigo-400 text-[10px]"></i><span>Solved Today</span></span>
                      <span className="font-bold">1,031</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-building text-blue-400 text-[10px]"></i><span>Departments</span></span>
                      <span className="font-bold">12</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                      <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-map-location-dot text-cyan-400 text-[10px]"></i><span>Wards Active</span></span>
                      <span className="font-bold">272</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/10 text-[11px]">
                  <button className="py-1.5 px-2 rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/40 font-medium text-center hover:bg-blue-600/50 transition">AI Auto Route</button>
                  <button className="py-1.5 px-2 rounded-lg bg-white/5 text-gray-300 border border-white/10 font-medium text-center hover:bg-white/10 transition">Live Tracking</button>
                  <button className="py-1.5 px-2 rounded-lg bg-white/5 text-gray-300 border border-white/10 font-medium text-center hover:bg-white/10 transition">Real-time Analytics</button>
                  <button className="py-1.5 px-2 rounded-lg bg-white/5 text-gray-300 border border-white/10 font-medium text-center hover:bg-white/10 transition">Public Transparency</button>
                </div>
              </div>
            </div>

          </main>

          {/* Bottom Utility Cards Grid */}
          <footer className="max-w-7xl mx-auto w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pb-6">
            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-red-500/60 transition shadow-lg">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-red-500"></div>
              <div className="text-red-400 text-lg mb-2"><i className="fa-solid fa-trash-can"></i></div>
              <div className="text-xs text-gray-400 font-medium">Garbage</div>
              <div className="text-xl font-bold mt-0.5">284</div>
              <div className="text-[10px] text-gray-400 mt-1">Active Complaints</div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-amber-500/60 transition shadow-lg">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-amber-500"></div>
              <div className="text-amber-400 text-lg mb-2"><i className="fa-solid fa-road"></i></div>
              <div className="text-xs text-gray-400 font-medium">Roads</div>
              <div className="text-xl font-bold mt-0.5">121</div>
              <div className="text-[10px] text-gray-400 mt-1">Active Complaints</div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-cyan-500/60 transition shadow-lg">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-cyan-400"></div>
              <div className="text-cyan-400 text-lg mb-2"><i className="fa-solid fa-droplet"></i></div>
              <div className="text-xs text-gray-400 font-medium">Water</div>
              <div className="text-xl font-bold mt-0.5">89</div>
              <div className="text-[10px] text-gray-400 mt-1">Active Complaints</div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-emerald-500/60 transition shadow-lg">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-emerald-400"></div>
              <div className="text-emerald-400 text-lg mb-2"><i className="fa-solid fa-bolt-lightning"></i></div>
              <div className="text-xs text-gray-400 font-medium">Electricity</div>
              <div className="text-xl font-bold mt-0.5">52</div>
              <div className="text-[10px] text-gray-400 mt-1">Active Complaints</div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-purple-500/60 transition shadow-lg">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-purple-500"></div>
              <div className="text-purple-400 text-lg mb-2"><i className="fa-solid fa-wave-square"></i></div>
              <div className="text-xs text-gray-400 font-medium">Sewage</div>
              <div className="text-xl font-bold mt-0.5">44</div>
              <div className="text-[10px] text-gray-400 mt-1">Active Complaints</div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-md p-4 rounded-2xl relative overflow-hidden group border border-blue-500/20 hover:border-orange-500/60 transition shadow-lg">
              <div className="absolute bottom-0 left-0 w-full h-[3px] bg-orange-500"></div>
              <div className="text-orange-400 text-lg mb-2"><i className="fa-solid fa-cloud-sun"></i></div>
              <div className="text-xs text-gray-400 font-medium">AQI</div>
              <div className="text-xl font-bold mt-0.5">31</div>
              <div className="text-[10px] text-gray-400 mt-1">Active Complaints</div>
            </div>
          </footer>
        </div>

        {/* ================= SECTION 2: LIVE DELHI HEATMAP ================= */}
        <section className="max-w-7xl mx-auto w-full pt-12 space-y-6">

          {/* Header & Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center space-x-2">
                <span>LIVE DELHI HEATMAP</span>
              </h2>
              <p className="text-xs text-gray-400">Real-time issue density across Delhi</p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="font-medium">Live</span>
              </div>
              <div className="bg-gray-900/80 border border-white/10 px-3 py-1.5 rounded-full text-xs text-gray-300 font-medium">
                Last updated: 3 sec ago
              </div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <button className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-xs shadow-md">All Issues</button>
            <button className="px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 hover:border-blue-500/40 text-xs font-medium transition">Garbage</button>
            <button className="px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 hover:border-blue-500/40 text-xs font-medium transition">Roads</button>
            <button className="px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 hover:border-blue-500/40 text-xs font-medium transition">Water</button>
            <button className="px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 hover:border-blue-500/40 text-xs font-medium transition">Sewage</button>
            <button className="px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 hover:border-blue-500/40 text-xs font-medium transition">Electricity</button>
            <button className="px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 hover:border-blue-500/40 text-xs font-medium transition">AQI</button>
            <button className="px-4 py-1.5 rounded-full bg-gray-900/80 border border-white/10 text-gray-300 hover:border-blue-500/40 text-xs font-medium transition flex items-center space-x-1.5">
              <span>Filter</span> <i className="fa-solid fa-filter text-[10px]"></i>
            </button>
          </div>

          {/* Main Heatmap Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Delhi Map Simulation Box */}
            <div className="lg:col-span-8 bg-gray-900/85 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-4 relative overflow-hidden shadow-[0_0_25px_rgba(0,102,255,0.25)] min-h-[420px] flex items-center justify-center">

              <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px]"></div>

              <div className="absolute inset-0 opacity-20 pointer-events-none flex items-center justify-center">
                <svg className="w-full h-full text-blue-500" viewBox="0 0 600 400" fill="none" stroke="currentColor" strokeWidth="0.8">
                  <path d="M50,80 Q150,40 280,100 T520,120" />
                  <path d="M80,200 Q200,280 350,220 T550,300" />
                  <path d="M120,50 Q220,180 180,350" />
                  <path d="M380,50 Q300,150 450,350" />
                </svg>
              </div>

              {/* Area Labels */}
              <span className="absolute top-10 left-24 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">PITAMPURA</span>
              <span className="absolute top-20 left-16 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">ROHINI</span>
              <span className="absolute top-24 right-28 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">SHAHDARA</span>
              <span className="absolute top-20 right-16 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">GHAZIABAD</span>
              <span className="absolute top-36 left-48 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">CIVIL LINES</span>
              <span className="absolute top-36 left-1/3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">OLD DELHI</span>
              <span className="absolute top-48 left-1/2 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">CONNAUGHT PLACE</span>
              <span className="absolute bottom-24 left-1/3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">KAROL BAGH</span>
              <span className="absolute bottom-16 right-1/3 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">NOIDA</span>
              <span className="absolute bottom-12 left-1/2 text-[10px] tracking-widest text-gray-500 font-semibold uppercase">SAKET</span>

              {/* Heatmap Glowing Nodes */}
              <div className="absolute top-24 left-32 w-6 h-6 rounded-full bg-red-500/30 animate-ping"></div>
              <div className="absolute top-24 left-32 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_red]"></div>

              <div className="absolute top-28 left-56 w-8 h-8 rounded-full bg-orange-500/30 animate-ping"></div>
              <div className="absolute top-28 left-56 w-3.5 h-3.5 rounded-full bg-orange-500 shadow-[0_0_15px_orange]"></div>

              <div className="absolute top-32 right-36 w-6 h-6 rounded-full bg-cyan-400/30 animate-ping"></div>
              <div className="absolute top-32 right-36 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_cyan]"></div>

              <div className="absolute top-36 left-24 w-5 h-5 rounded-full bg-purple-500/30 animate-ping"></div>
              <div className="absolute top-36 left-24 w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_12px_purple]"></div>

              <div className="absolute top-44 left-44 w-7 h-7 rounded-full bg-amber-500/30 animate-ping"></div>
              <div className="absolute top-44 left-44 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_15px_yellow]"></div>

              <div className="absolute top-40 right-44 w-7 h-7 rounded-full bg-red-500/30 animate-ping"></div>
              <div className="absolute top-40 right-44 w-3 h-3 rounded-full bg-red-500 shadow-[0_0_15px_red]"></div>

              <div className="absolute bottom-36 left-28 w-6 h-6 rounded-full bg-emerald-400/30 animate-ping"></div>
              <div className="absolute bottom-36 left-28 w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_emerald]"></div>

              <div className="absolute bottom-28 left-52 w-8 h-8 rounded-full bg-red-500/30 animate-ping"></div>
              <div className="absolute bottom-28 left-52 w-3.5 h-3.5 rounded-full bg-red-500 shadow-[0_0_15px_red]"></div>

              <div className="absolute bottom-24 right-48 w-6 h-6 rounded-full bg-amber-400/30 animate-ping"></div>
              <div className="absolute bottom-24 right-48 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_15px_orange]"></div>

              <div className="absolute bottom-20 left-1/2 w-6 h-6 rounded-full bg-purple-500/30 animate-ping"></div>
              <div className="absolute bottom-20 left-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_purple]"></div>

              {/* Map Floating Controls */}
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col space-y-2 bg-black/60 backdrop-blur-md p-1.5 rounded-xl border border-white/10">
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold text-white transition">+</button>
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-sm font-bold text-white transition">-</button>
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-blue-400 transition"><i className="fa-solid fa-location-crosshairs"></i></button>
                <button className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-xs text-cyan-400 transition"><i className="fa-solid fa-layer-group"></i></button>
              </div>

            </div>

            {/* Today's Overview Panel */}
            <div className="lg:col-span-4 bg-gray-900/85 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-5 shadow-[0_0_25px_rgba(0,102,255,0.25)] flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold tracking-wider text-blue-400 uppercase mb-4">TODAY&apos;S OVERVIEW</h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                    <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-trash-can text-red-400"></i><span>Garbage</span></span>
                    <div className="flex items-center space-x-3"><span className="font-bold">1,284</span><span className="text-emerald-400 font-medium">+12%</span></div>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                    <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-triangle-exclamation text-amber-400"></i><span>Road Damage</span></span>
                    <div className="flex items-center space-x-3"><span className="font-bold">562</span><span className="text-emerald-400 font-medium">+8%</span></div>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                    <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-droplet text-cyan-400"></i><span>Water Leakage</span></span>
                    <div className="flex items-center space-x-3"><span className="font-bold">318</span><span className="text-emerald-400 font-medium">+5%</span></div>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                    <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-wave-square text-purple-400"></i><span>Sewage Overflow</span></span>
                    <div className="flex items-center space-x-3"><span className="font-bold">223</span><span className="text-emerald-400 font-medium">+7%</span></div>
                  </div>
                  <div className="flex items-center justify-between pb-2.5 border-b border-white/5">
                    <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-bolt-lightning text-emerald-400"></i><span>Electricity Issues</span></span>
                    <div className="flex items-center space-x-3"><span className="font-bold">156</span><span className="text-red-400 font-medium">-3%</span></div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center space-x-2 text-gray-300"><i className="fa-solid fa-cloud-sun text-orange-400"></i><span>AQI Alerts</span></span>
                    <div className="flex items-center space-x-3"><span className="font-bold">84</span><span className="text-emerald-400 font-medium">+4%</span></div>
                  </div>
                </div>
              </div>

              {/* Bottom Mini Metrics inside Overview */}
              <div className="grid grid-cols-2 gap-3 pt-5 mt-5 border-t border-white/10">
                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center space-x-1.5 text-cyan-400 text-[11px] mb-1">
                    <i className="fa-solid fa-shield-halved"></i>
                    <span>Total Complaints</span>
                  </div>
                  <div className="text-xl font-bold tracking-tight">1,284</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">+12% vs yesterday</div>
                </div>

                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px] mb-1">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>Resolved Today</span>
                  </div>
                  <div className="text-xl font-bold tracking-tight">1,031</div>
                  <div className="text-[10px] text-emerald-400 font-medium mt-0.5">+15% vs yesterday</div>
                </div>
              </div>

            </div>

          </div>

          {/* Lower Grid: Top Performing Wards & Performance Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-12">

            {/* Top Performing Wards Table */}
            <div className="lg:col-span-7 bg-gray-900/85 backdrop-blur-xl rounded-3xl border border-blue-500/30 p-5 shadow-[0_0_25px_rgba(0,102,255,0.25)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold tracking-wider text-white uppercase">TOP PERFORMING WARDS</h3>
                  <a href="#" className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1">
                    <span>View All 272 Wards</span> <i className="fa-solid fa-arrow-right text-[10px]"></i>
                  </a>
                </div>

                {/* Table Header */}
                <div className="grid grid-cols-12 text-[11px] font-semibold text-gray-400 pb-2 border-b border-white/10 px-2">
                  <span className="col-span-1">Rank</span>
                  <span className="col-span-4">Ward</span>
                  <span className="col-span-4">Performance Score</span>
                  <span className="col-span-3 text-right">Avg. Response Time</span>
                </div>

                {/* Table Rows */}
                <div className="space-y-3 pt-3 text-xs">
                  <div className="grid grid-cols-12 items-center px-2 py-1.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="col-span-1 font-bold text-blue-400">#1</span>
                    <span className="col-span-4 font-medium text-white">Rohini</span>
                    <span className="col-span-4 flex items-center space-x-2">
                      <span className="font-bold">98.7%</span>
                      <div className="w-20 h-1.5 bg-black/50 rounded-full overflow-hidden"><div className="w-[98%] h-full bg-emerald-400 rounded-full"></div></div>
                    </span>
                    <span className="col-span-3 text-right font-medium text-gray-300">12 min</span>
                  </div>

                  <div className="grid grid-cols-12 items-center px-2 py-1.5 rounded-xl bg-white/5 border border-white/5">
                    <span className="col-span-1 font-bold text-blue-400">#2</span>
                    <span className="col-span-4 font-medium text-white">Janakpuri</span>
                    <span className="col-span-4 flex items-center space-x-2">
                      <span className="font-bold">97.2%</span>
                      <div className="w-20 h-1.5 bg-black/50 rounded-full overflow-hidden"><div className="w-[95%] h-full bg-emerald-400 rounded-full"></div></div>
                    </span>
                    <span className="col-span-3 text-right font-medium text-gray-300">14 min</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </section>

      </div>
    </div>
  );
}