'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

import FeatureCard from '@/components/FeatureCard';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import RoleSelection from '@/components/RoleSelection';
import StatCard from '@/components/StatCard';

import {
  Shield,
  Lock,
  Cpu,
  KeyRound,
  MapPin,
  Activity,
  Clock,
} from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // ==========================================
  // BACKGROUND NETWORK ANIMATION
  // ==========================================

  useEffect(() => {
    const canvas = document.getElementById(
      'bg-canvas'
    ) as HTMLCanvasElement | null;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    let width = 0;
    let height = 0;
    let animationFrameId = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    resize();

    window.addEventListener('resize', resize);

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 1.5 + 0.8,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 1;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > width) {
          particle.vx *= -1;
        }

        if (particle.y < 0 || particle.y > height) {
          particle.vy *= -1;
        }

        ctx.beginPath();

        ctx.arc(
          particle.x,
          particle.y,
          particle.radius,
          0,
          Math.PI * 2
        );

        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // ==========================================
  // REGISTER SUCCESS
  // ==========================================

  const handleRegisterSuccess = () => {
    setShowRoleSelection(true);
  };

  // ==========================================
  // ROLE SELECTION COMPLETE
  // ==========================================

  const handleRoleSelectionComplete = () => {
    // Default registration role is Citizen.
    // Citizen dashboard route:
    router.replace('/dashboard/citizen');
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-x-hidden">

      {/* =========================================
          BACKGROUND IMAGE
      ========================================= */}

      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/auth-bg.png"
          alt="SmartDELHI Background"
          fill
          priority
          className="object-cover object-center opacity-60"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#030712]/60 via-[#030712]/40 to-[#030712]/75" />
      </div>

      {/* =========================================
          NETWORK CANVAS
      ========================================= */}

      <canvas
        id="bg-canvas"
        className="fixed inset-0 z-[1] pointer-events-none"
      />

      {/* =========================================
          PAGE CONTENT
      ========================================= */}

      <div className="relative z-10 flex flex-col justify-between min-h-screen px-4 md:px-8 py-4 max-w-7xl mx-auto w-full">

        {/* =========================================
            TOP NAVBAR
        ========================================= */}

        <header className="w-full flex items-center justify-between py-3 border-b border-cyan-500/10">

          {/* LOGO */}

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Shield className="w-5 h-5 text-white animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-wide">
                  Smart
                  <span className="text-cyan-400">DELHI</span>
                </span>
              </div>

              <p className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">
                Civic Intelligence Platform
              </p>
            </div>
          </div>

          {/* NAVIGATION */}

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">

            <Link
              href="/"
              className="hover:text-cyan-400 transition"
            >
              Home
            </Link>

            <Link
              href="/"
              className="hover:text-cyan-400 transition"
            >
              Complains
            </Link>

            <Link
              href="/"
              className="hover:text-cyan-400 transition"
            >
              Heatmap
            </Link>

            <Link
              href="/"
              className="hover:text-cyan-400 transition"
            >
              Report
            </Link>
            <Link
              href="/about-us"
              className="text-cyan-400 hover:text-cyan-300 transition"
            >
              About Us
            </Link>

            <Link
              href="/"
              className="hover:text-cyan-400 transition"
            >
              Contact Us
            </Link>

          </nav>

          {/* BACK TO HOME */}

          <Link
            href="/"
            className="bg-black/40 backdrop-blur-md border border-cyan-400/30 text-white font-semibold text-sm px-6 py-2 rounded-full shadow-lg hover:border-cyan-400 hover:bg-cyan-500/10 transition duration-300"
          >
            Back to Home
          </Link>

        </header>

        {/* =========================================
            MAIN SECTION
        ========================================= */}

        <main className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto items-center py-8">

          {/* =======================================
              LEFT SIDE
          ======================================= */}

          <div className="lg:col-span-6 space-y-6">

            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-400/30 text-cyan-300 text-xs font-medium tracking-wide shadow-inner">

              <Shield className="w-3.5 h-3.5 text-cyan-400" />

              <span>
                AI Powered Authentication
              </span>

            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">

              Secure Access
              <br />

              to SmartDELHI
              <br />

              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-200">
                Command Center
              </span>

            </h1>

            <p className="text-gray-300 text-sm sm:text-base max-w-xl leading-relaxed">
              Access India&apos;s most advanced civic intelligence
              platform designed for citizens, MCD workers, and
              municipal administrators.
            </p>

            {/* FEATURE CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">

              <FeatureCard
                icon={
                  <KeyRound className="w-5 h-5 text-cyan-400" />
                }
                title="JWT Protected"
                description="Secure token-based user authentication protocol."
              />

              <FeatureCard
                icon={
                  <Lock className="w-5 h-5 text-cyan-400" />
                }
                title="End-to-End"
                description="Encrypted payloads across all active network nodes."
              />

              <FeatureCard
                icon={
                  <Cpu className="w-5 h-5 text-cyan-400" />
                }
                title="Role Based"
                description="Granular permission mapping for custom access levels."
              />

            </div>
          </div>

          {/* =======================================
              RIGHT SIDE
          ======================================= */}

          <div className="lg:col-span-6 flex justify-center lg:justify-end relative">

            <div className="w-full max-w-md relative bg-black/50 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl shadow-cyan-950/50">

              {/* =================================
                  TAB SWITCHER
              ================================= */}

              {!showRoleSelection && (
                <div className="grid grid-cols-2 bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-cyan-400/20 mb-6 shadow-inner">

                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'login'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Login
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('register')}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${activeTab === 'register'
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25'
                        : 'text-gray-400 hover:text-white'
                      }`}
                  >
                    Register
                  </button>

                </div>
              )}

              {/* =================================
                  FORM CONTENT
              ================================= */}

              <div className="relative">

                {showRoleSelection ? (

                  <RoleSelection
                    onComplete={handleRoleSelectionComplete}
                  />

                ) : activeTab === 'login' ? (

                  <LoginForm />

                ) : (

                  <RegisterForm
                    onSuccess={handleRegisterSuccess}
                  />

                )}

              </div>

              {/* =================================
                  BOTTOM SWITCH
              ================================= */}

              {!showRoleSelection && (
                <div className="mt-6 text-center text-xs text-gray-400 border-t border-cyan-500/10 pt-4">

                  {activeTab === 'login' ? (

                    <p>
                      Don&apos;t have an account?{' '}

                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                      >
                        Register here
                      </button>
                    </p>

                  ) : (

                    <p>
                      Already have an account?{' '}

                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="text-cyan-400 font-semibold hover:underline cursor-pointer"
                      >
                        Login here
                      </button>
                    </p>

                  )}

                </div>
              )}

            </div>
          </div>

        </main>

        {/* =========================================
            BOTTOM STATISTICS
        ========================================= */}

        <footer className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-t border-cyan-500/10">

          <StatCard
            icon={
              <MapPin className="w-5 h-5 text-cyan-400" />
            }
            label="Active Coverage"
            value="272 Wards"
            subtext="Fully monitored civic zones"
            borderColor="cyan-400"
          />

          <StatCard
            icon={
              <Activity className="w-5 h-5 text-emerald-400" />
            }
            label="Verification Engine"
            value="98.7% AI Accuracy"
            subtext="Automated report classification"
            borderColor="emerald-400"
          />

          <StatCard
            icon={
              <Clock className="w-5 h-5 text-blue-400" />
            }
            label="System Availability"
            value="24/7 Monitoring"
            subtext="Real-time incident response"
            borderColor="blue-500"
          />

        </footer>

      </div>
    </div>
  );
}