"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Globe2,
    Headphones,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    Radio,
    Send,
    ShieldCheck,
    Sparkles,
    Users,
    X,
    Zap,
} from "lucide-react";

/* =========================================================
   PARTICLE NETWORK
========================================================= */

type Particle = {
    x: number;
    y: number;
    z: number;
    size: number;
    speed: number;
    drift: number;
    opacity: number;
};

function ParticleNetwork() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrame = 0;
        let width = 0;
        let height = 0;

        const particles: Particle[] = [];

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);

            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        const createParticles = () => {
            particles.length = 0;

            const count = Math.min(
                170,
                Math.max(90, Math.floor((width * height) / 10500))
            );

            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z: Math.random(),
                    size: Math.random() * 1.7 + 0.4,
                    speed: Math.random() * 0.32 + 0.08,
                    drift: Math.random() * 0.7 - 0.35,
                    opacity: Math.random() * 0.55 + 0.15,
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            /* ambient glow */
            const glow = ctx.createRadialGradient(
                width * 0.5,
                height * 0.45,
                0,
                width * 0.5,
                height * 0.45,
                Math.max(width, height) * 0.7
            );

            glow.addColorStop(0, "rgba(8, 145, 178, 0.055)");
            glow.addColorStop(0.45, "rgba(15, 23, 42, 0.025)");
            glow.addColorStop(1, "rgba(2, 6, 23, 0)");

            ctx.fillStyle = glow;
            ctx.fillRect(0, 0, width, height);

            /* particles */
            for (const p of particles) {
                p.y -= p.speed;
                p.x += p.drift * 0.12;

                if (p.y < -10) {
                    p.y = height + 10;
                    p.x = Math.random() * width;
                }

                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;

                const depth = 0.35 + p.z * 0.9;
                const radius = p.size * depth;

                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

                ctx.fillStyle = `rgba(34, 211, 238, ${p.opacity * depth * 0.8
                    })`;

                ctx.fill();
            }

            /* connections */
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];

                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 135) {
                        const opacity = (1 - distance / 135) * 0.14;

                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);

                        ctx.strokeStyle = `rgba(14, 165, 233, ${opacity})`;
                        ctx.lineWidth = 0.6;
                        ctx.stroke();
                    }
                }
            }

            animationFrame = requestAnimationFrame(draw);
        };

        resize();
        createParticles();
        draw();

        const handleResize = () => {
            resize();
            createParticles();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        />
    );
}

/* =========================================================
   DATA
========================================================= */

const contactChannels = [
    {
        icon: MessageSquare,
        title: "Citizen Support",
        description:
            "Report civic issues, track complaints or get help with your SmartDELHI account.",
        action: "Open Citizen Support",
        href: "/dashboard/citizen",
    },
    {
        icon: Building2,
        title: "MCD & Administration",
        description:
            "For municipal departments, ward officers and administrative coordination.",
        action: "Administration Desk",
        href: "/dashboard/admin",
    },
    {
        icon: Headphones,
        title: "Technical Support",
        description:
            "Facing an issue with the platform, map, dashboard or complaint system?",
        action: "Technical Help",
        href: "#contact-form",
    },
];

const quickTopics = [
    "Report a civic issue",
    "Complaint status",
    "Citizen account",
    "MCD coordination",
    "Technical problem",
    "Data & transparency",
];

/* =========================================================
   PAGE
========================================================= */

export default function ContactPage() {
    const [selectedTopic, setSelectedTopic] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const response = await fetch("/api/contact", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name,
                email,
                phone,
                subject,
                message,
            }),
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || "Message failed.");
            return;
        }

        alert("Message sent successfully!");

        // form reset
        setName("");
        setEmail("");
        setPhone("");
        setSubject("");
        setMessage("");
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
            <ParticleNetwork />

            {/* =====================================================
          BACKGROUND LIGHT
      ===================================================== */}

            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute left-[8%] top-[12%] h-[360px] w-[360px] rounded-full bg-cyan-500/[0.055] blur-[120px]" />
                <div className="absolute right-[5%] top-[35%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.045] blur-[140px]" />
                <div className="absolute bottom-[-100px] left-[40%] h-[400px] w-[400px] rounded-full bg-indigo-500/[0.04] blur-[130px]" />
            </div>

            {/* =====================================================
          NAVBAR
      ===================================================== */}

            <header className="relative z-30 border-b border-white/[0.06] bg-[#020817]/60 backdrop-blur-2xl">
                <div className="mx-auto flex h-[74px] max-w-[1450px] items-center justify-between px-6 lg:px-10">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08]">
                            <div className="absolute h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]" />

                            <div className="absolute inset-1 rounded-lg border border-cyan-300/10 transition-all duration-500 group-hover:rotate-45 group-hover:border-cyan-300/30" />
                        </div>

                        <div>
                            <div className="text-[15px] font-bold tracking-[0.08em]">
                                Smart<span className="text-cyan-400">DELHI</span>
                            </div>

                            <div className="text-[9px] tracking-[0.28em] text-slate-500">
                                CIVIC INTELLIGENCE
                            </div>
                        </div>
                    </Link>

                    <nav className="hidden items-center gap-7 md:flex">
                        <Link
                            href="/"
                            className="text-sm text-slate-400 transition hover:text-white"
                        >
                            Home
                        </Link>

                        <Link
                            href="/dashboard/citizen"
                            className="text-sm text-slate-400 transition hover:text-white"
                        >
                            Citizen Portal
                        </Link>

                        <Link
                            href="/report"
                            className="text-sm text-slate-400 transition hover:text-white"
                        >
                            Reports
                        </Link>

                        <Link
                            href="/contact"
                            className="text-sm font-medium text-cyan-300"
                        >
                            Contact
                        </Link>
                    </nav>

                    <button
                        type="button"
                        onClick={() => setMobileMenu(!mobileMenu)}
                        className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5 md:hidden"
                    >
                        {mobileMenu ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <MessageSquare className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <AnimatePresence>
                    {mobileMenu && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-white/[0.06] px-6 py-5 md:hidden"
                        >
                            <div className="flex flex-col gap-4">
                                <Link href="/">Home</Link>
                                <Link href="/dashboard/citizen">Citizen Portal</Link>
                                <Link href="/report">Reports</Link>
                                <Link href="/contact">Contact</Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* =====================================================
          MAIN
      ===================================================== */}

            <div className="relative z-10 mx-auto max-w-[1450px] px-5 pb-24 pt-10 lg:px-10 lg:pt-14">
                {/* =================================================
            HERO
        ================================================= */}
<section className="group relative overflow-hidden rounded-[34px] border border-cyan-400/[0.12] bg-[#07111f]/70 px-6 py-12 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl lg:px-14 lg:py-16">

    {/* SECTION BACKGROUND IMAGE */}
    <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-[0.90] transition-transform duration-[4000ms] ease-out group-hover:scale-[1.03]"
        style={{
            backgroundImage: "url('/images/delhi-contact-bg.jpg')",
        }}
    />

    {/* DARK / CYAN OVERLAY */}
    <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#07111f]/95 via-[#07111f]/80 to-[#07111f]/45" />

    {/* TOP RIGHT GLOW */}
    <div className="absolute right-[-100px] top-[-140px] z-[2] h-[380px] w-[380px] rounded-full bg-cyan-400/[0.06] blur-[100px]" />

    {/* BOTTOM BLUE GLOW */}
    <div className="absolute bottom-[-180px] left-[25%] z-[2] h-[300px] w-[500px] rounded-full bg-blue-500/[0.05] blur-[120px]" />

    {/* CONTENT */}
    <div className="relative z-10 max-w-4xl">

        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-6 flex items-center gap-3"
        >
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />

            <span className="text-xs font-semibold tracking-[0.3em] text-cyan-300">
                SMARTDELHI CIVIC CONNECT
            </span>
        </motion.div>

        <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="text-4xl font-black leading-[1.02] tracking-[-0.04em] sm:text-5xl lg:text-7xl"
        >
            Let&apos;s build
            <br />

            <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                a smarter Delhi.
            </span>
        </motion.h1>

        <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="mt-7 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg"
        >
            Whether you are a citizen, municipal worker, administrator,
            researcher or technology partner, SmartDELHI gives you a direct
            channel to connect with the people and systems working to make
            Delhi cleaner, safer and more responsive.
        </motion.p>

        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.28 }}
            className="mt-9 flex flex-wrap gap-3"
        >

            <div className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-xs text-emerald-300">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                Civic Support Online
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-slate-400">
                <Clock3 className="h-3.5 w-3.5" />
                Response-focused system
            </div>

            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                Citizen-first
            </div>

        </motion.div>

    </div>
</section>

                {/* =================================================
            CONTACT CHANNELS
        ================================================= */}

                <section className="mt-8 grid gap-4 lg:grid-cols-3">
                    {contactChannels.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{
                                    duration: 0.6,
                                    delay: index * 0.08,
                                }}
                                whileHover={{ y: -5 }}
                                className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#07111f]/75 p-6 backdrop-blur-xl"
                            >
                                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                                <div className="flex items-start justify-between">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
                                        <Icon className="h-5 w-5 text-cyan-400" />
                                    </div>

                                    <ArrowRight className="h-4 w-4 text-slate-700 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-400" />
                                </div>

                                <h3 className="mt-6 text-lg font-semibold">{item.title}</h3>

                                <p className="mt-2 min-h-[52px] text-sm leading-6 text-slate-500">
                                    {item.description}
                                </p>

                                <Link
                                    href={item.href}
                                    className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan-400 transition hover:text-cyan-300"
                                >
                                    {item.action}
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </section>

                {/* =================================================
            FORM + INFO
        ================================================= */}

                <section
                    id="contact-form"
                    className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]"
                >
                    {/* FORM */}
                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                        className="rounded-[30px] border border-white/[0.08] bg-[#07111f]/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8 lg:p-10"
                    >
                        <div className="mb-8">
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-cyan-400">
                                <Sparkles className="h-4 w-4" />
                                SEND A MESSAGE
                            </div>

                            <h2 className="text-2xl font-bold sm:text-3xl">
                                Tell us what&apos;s happening.
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Share your concern, feedback, partnership request or technical
                                issue. We&apos;ll route it to the appropriate SmartDELHI team.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid gap-5 sm:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Full Name
                                    </label>

                                    <input
                                        required
                                        type="text"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-cyan-400/[0.025] focus:ring-4 focus:ring-cyan-400/[0.05]"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-medium text-slate-400">
                                        Email Address
                                    </label>

                                    <input
                                        required
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-cyan-400/[0.025] focus:ring-4 focus:ring-cyan-400/[0.05]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-400">
                                    What can we help with?
                                </label>

                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {quickTopics.map((topic) => (
                                        <button
                                            key={topic}
                                            type="button"
                                            onClick={() => setSelectedTopic(topic)}
                                            className={`rounded-xl border px-3 py-3 text-left text-xs transition-all duration-300 ${selectedTopic === topic
                                                ? "border-cyan-400/40 bg-cyan-400/[0.08] text-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.06)]"
                                                : "border-white/[0.07] bg-black/15 text-slate-500 hover:border-white/15 hover:text-slate-300"
                                                }`}
                                        >
                                            {topic}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-400">
                                    Subject
                                </label>

                                <input
                                    required
                                    type="text"
                                    placeholder="How can SmartDELHI help?"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-cyan-400/[0.025] focus:ring-4 focus:ring-cyan-400/[0.05]"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-400">
                                    Message
                                </label>

                                <textarea
                                    required
                                    rows={6}
                                    placeholder="Describe your issue, idea or request..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    className="w-full resize-none rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/40 focus:bg-cyan-400/[0.025] focus:ring-4 focus:ring-cyan-400/[0.05]"
                                />
                            </div>

                            <div className="flex flex-col gap-4 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                    Your information stays protected.
                                </div>

                                <button
                                    type="submit"
                                    className="group inline-flex h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 text-sm font-semibold text-white shadow-[0_10px_35px_rgba(14,165,233,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_15px_45px_rgba(14,165,233,0.3)]"
                                >
                                    Send Message
                                    <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" />
                                </button>
                            </div>
                        </form>

                        <AnimatePresence>
                            {submitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mt-5 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300"
                                >
                                    <CheckCircle2 className="h-5 w-5" />

                                    <div>
                                        <div className="font-medium">Message received.</div>
                                        <div className="text-xs text-emerald-400/60">
                                            SmartDELHI has recorded your request.
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* RIGHT INFO */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 25 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="rounded-[30px] border border-white/[0.08] bg-[#07111f]/80 p-7 backdrop-blur-2xl"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06]">
                                <Globe2 className="h-5 w-5 text-cyan-400" />
                            </div>

                            <h3 className="mt-6 text-xl font-bold">
                                SmartDELHI Civic Network
                            </h3>

                            <p className="mt-3 text-sm leading-6 text-slate-500">
                                One digital layer connecting citizens, municipal workers,
                                administration, AI systems and real-time city intelligence.
                            </p>

                            <div className="mt-7 space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />

                                    <div>
                                        <div className="text-sm text-slate-300">City</div>
                                        <div className="mt-1 text-xs text-slate-600">
                                            Delhi, National Capital Territory
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />

                                    <div>
                                        <div className="text-sm text-slate-300">Email</div>
                                        <div className="mt-1 text-xs text-slate-600">
                                            civic@smartdelhi.in
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />

                                    <div>
                                        <div className="text-sm text-slate-300">Citizen Helpline</div>
                                        <div className="mt-1 text-xs text-slate-600">
                                            SmartDELHI Digital Support
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 25 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.1 }}
                            className="relative overflow-hidden rounded-[30px] border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.08] via-[#07111f]/80 to-blue-600/[0.05] p-7 backdrop-blur-2xl"
                        >
                            <div className="absolute right-[-40px] top-[-40px] h-32 w-32 rounded-full bg-cyan-400/10 blur-3xl" />

                            <div className="relative">
                                <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-cyan-300">
                                    <Users className="h-4 w-4" />
                                    WHO CAN CONNECT
                                </div>

                                <div className="mt-6 space-y-3">
                                    {[
                                        "Citizens & residents",
                                        "MCD departments",
                                        "Ward officers",
                                        "Municipal workers",
                                        "Research & civic organizations",
                                        "Technology partners",
                                    ].map((item, index) => (
                                        <motion.div
                                            key={item}
                                            initial={{ opacity: 0, x: 10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{
                                                delay: index * 0.05,
                                                duration: 0.35,
                                            }}
                                            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-black/10 px-3 py-3"
                                        >
                                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400/[0.08] text-[10px] text-cyan-400">
                                                ✓
                                            </span>

                                            <span className="text-xs text-slate-400">
                                                {item}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* =================================================
            BOTTOM CTA
        ================================================= */}

                <motion.section
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative mt-8 overflow-hidden rounded-[30px] border border-white/[0.08] bg-[#07111f]/75 px-6 py-8 backdrop-blur-xl sm:px-10"
                >
                    <div className="absolute inset-y-0 right-0 w-[45%] bg-gradient-to-l from-cyan-400/[0.05] to-transparent" />

                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-cyan-400">
                                <Radio className="h-4 w-4" />
                                CIVIC INTELLIGENCE
                            </div>

                            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
                                See what&apos;s happening across Delhi.
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                Explore live civic intelligence, citizen complaints, ward
                                activity and city-level insights through SmartDELHI.
                            </p>
                        </div>

                        <Link
                            href="/dashboard/citizen"
                            className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-6 py-3 text-sm font-semibold text-cyan-300 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-400/[0.1]"
                        >
                            Explore SmartDELHI
                            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </Link>
                    </div>
                </motion.section>

                {/* =================================================
            FOOTER
        ================================================= */}

                <footer className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-7 text-xs text-slate-600 sm:flex-row">
                    <div>
                        © {new Date().getFullYear()} SmartDELHI · Civic Intelligence
                        Platform
                    </div>

                    <div className="flex items-center gap-5">
                        <Link
                            href="/"
                            className="transition hover:text-slate-300"
                        >
                            Home
                        </Link>

                        <Link
                            href="/report"
                            className="transition hover:text-slate-300"
                        >
                            Reports
                        </Link>

                        <Link
                            href="/dashboard/citizen"
                            className="transition hover:text-slate-300"
                        >
                            Citizen Portal
                        </Link>
                    </div>
                </footer>
            </div>
        </main>
    );
}