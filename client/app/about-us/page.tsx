"use client";
import SmartDelhiBackground from "@/components/about/SmartDelhiBackground";
import Link from "next/link";
import {
    ArrowRight,
    BrainCircuit,
    Building2,
    CheckCircle2,
    Cpu,
    Globe2,
    MapPinned,
    ShieldCheck,
    Sparkles,
    Target,
    Users,
    Zap,
} from "lucide-react";

import { motion, type Variants } from "framer-motion";

const fadeUp: Variants = {
    hidden: {
        opacity: 0,
        y: 30,
    },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut",
        },
    },
};

const stagger = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.12,
        },
    },
};

export default function AboutUsPage() {
    return (
        <main className="min-h-screen bg-[#020711] text-white overflow-hidden">

            {/* BACKGROUND */}
            <div className="fixed inset-0 pointer-events-none">
                <SmartDelhiBackground />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,212,255,0.12),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(37,99,235,0.12),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(0,255,200,0.08),transparent_30%)]" />

                <motion.div
                    animate={{
                        opacity: [0.2, 0.45, 0.2],
                        scale: [1, 1.15, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px]"
                />

                <motion.div
                    animate={{
                        opacity: [0.15, 0.35, 0.15],
                        scale: [1.1, 1, 1.1],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="absolute right-0 top-1/3 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[140px]"
                />
            </div>

            {/* NAVBAR */}
            <header className="relative z-50 border-b border-white/10 bg-[#020711]/70 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full border border-cyan-400/40 bg-cyan-400/5 flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-cyan-400" />
                        </div>

                        <div>
                            <div className="text-xl font-bold tracking-tight">
                                Smart<span className="text-cyan-400"> DELHI</span>
                            </div>

                            <div className="text-[9px] tracking-[0.2em] text-gray-500 uppercase">
                                Cleaner City. Smarter Future.
                            </div>
                        </div>
                    </Link>

                    <nav className="hidden lg:flex items-center gap-8 text-sm text-gray-300">
                        <Link href="/" className="hover:text-cyan-400 transition">
                            Home
                        </Link>

                        <Link
                            href="/dashboard"
                            className="hover:text-cyan-400 transition"
                        >
                            Complaints
                        </Link>

                        <Link
                            href="/live-map"
                            className="hover:text-cyan-400 transition"
                        >
                            Heat Map
                        </Link>

                        <Link
                            href="/reports"
                            className="hover:text-cyan-400 transition"
                        >
                            Reports
                        </Link>

                        <Link
                            href="/about-us"
                            className="text-cyan-400 relative"
                        >
                            About Us

                            <span className="absolute -bottom-7 left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                        </Link>

                        <Link
                            href="/contact"
                            className="hover:text-cyan-400 transition"
                        >
                            Contact Us
                        </Link>
                    </nav>

                    <Link
                        href="/login"
                        className="px-5 py-2.5 rounded-xl border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 transition text-sm"
                    >
                        Login | Register
                    </Link>
                </div>
            </header>

            {/* HERO */}
            <section className="relative z-10 min-h-[calc(100vh-80px)] flex items-center">

                <div className="max-w-7xl mx-auto px-6 py0 w-full">

                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* LEFT */}
                        <motion.div
                            variants={stagger}
                            initial="hidden"
                            animate="visible"
                        >



                            <motion.h1
                                variants={fadeUp}
                                className="mt-7 text-5xl md:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight"
                            >
                                Building the
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-500">
                                    Digital Delhi
                                </span>
                                of Tomorrow.
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                className="mt-7 max-w-xl text-gray-400 text-lg leading-8"
                            >
                                SmartDELHI is a next-generation intelligent civic technology platform designed to bring citizens, workers, administrators, AI, and real-time urban intelligence together within one connected ecosystem. From reporting and tracking civic issues to analyzing ward-level performance, visualizing city-wide intelligence, and enabling data-driven decision-making, SmartDELHI transforms fragmented civic operations into a unified digital experience. Powered by AI, geospatial intelligence, real-time data, and transparent workflows, the platform is built to make Delhi more responsive, efficient, accountable, and future-ready turning citizen participation and technology into meaningful, measurable improvements across the city.
                            </motion.p>
                            <br />
                            <motion.div
                                variants={fadeUp}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 text-cyan-300 text-xs tracking-widest uppercase"
                            >
                                <Sparkles className="w-4 h-4" />
                                The Minds Behind SmartDELHI
                            </motion.div>

                            <motion.div
                                variants={fadeUp}
                                className="mt-9 flex flex-wrap gap-4"
                            >
                                <Link
                                    href="/dashboard"
                                    className="group px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold shadow-lg shadow-cyan-500/20 hover:scale-[1.03] transition"
                                >
                                    Explore Platform

                                    <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition" />
                                </Link>

                                <Link
                                    href="/contact"
                                    className="px-6 py-3.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                                >
                                    Connect With Us
                                </Link>
                            </motion.div>

                            {/* MINI STATS */}
                            {/* <motion.div
                                variants={fadeUp}
                                className="grid grid-cols-3 gap-4 mt-12 max-w-xl"
                            >
                                {[
                                    ["AI", "Powered"],
                                    ["GIS", "Integrated"],
                                    ["24/7", "Intelligence"],
                                ].map(([value, label]) => (
                                    <div
                                        key={value}
                                        className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-4"
                                    >
                                        <div className="text-2xl font-bold text-cyan-300">
                                            {value}
                                        </div>

                                        <div className="text-xs text-gray-500 mt-1">
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </motion.div> */}

                        </motion.div>


                        {/* RIGHT - SMARTDELHI DIGITAL SHOWCASE */}
                        <motion.div
                            initial={{ opacity: 0, x: 80 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                                duration: 1.1,
                                ease: "easeOut",
                            }}
                            className="relative w-full h-[620px] lg:h-[680px]"
                        >
                            {/* BACK GLOW */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[420px] bg-cyan-500/10 blur-[120px] rounded-full" />

                            {/* FLOOR / AMBIENT SHADOW */}
                            <div className="absolute left-[8%] right-[8%] bottom-[4%] h-[180px] bg-cyan-500/[0.07] blur-[70px] rounded-full" />

                            {/* DIGITAL GRID FLOOR */}
                            <div
                                className="absolute bottom-[5%] left-[4%] right-[4%] h-[180px] opacity-[0.18]"
                                style={{
                                    backgroundImage: `
                linear-gradient(rgba(34,211,238,0.35) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34,211,238,0.35) 1px, transparent 1px)
            `,
                                    backgroundSize: "42px 42px",
                                    transform: "perspective(500px) rotateX(62deg)",
                                    transformOrigin: "center bottom",
                                    maskImage:
                                        "linear-gradient(to top, black, transparent 85%)",
                                    WebkitMaskImage:
                                        "linear-gradient(to top, black, transparent 85%)",
                                }}
                            />

                            {/* TOP LABEL */}
                            <motion.div
                                initial={{ opacity: 0, y: -15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.7 }}
                                className="absolute top-2 left-1/2 -translate-x-1/2 z-30"
                            >
                                {/* <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-[#07101d]/80 backdrop-blur-xl shadow-[0_0_30px_rgba(0,200,255,0.08)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />

            <span className="text-[9px] uppercase tracking-[0.3em] text-cyan-300 whitespace-nowrap">
                Digital Innovation Lab
            </span>
        </div> */}
                            </motion.div>

                            {/* SCREEN 01 - BACK LEFT */}
                            <motion.div
                                initial={{ opacity: 0, x: -50, y: 35, rotate: -8 }}
                                animate={{ opacity: 1, x: 0, y: 0, rotate: -8 }}
                                transition={{
                                    delay: 0.2,
                                    duration: 0.9,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -10,
                                    rotate: -5,
                                    scale: 1.035,
                                    zIndex: 40,
                                }}
                                className="absolute z-10 left-[1%] top-[17%] w-[43%] rounded-[20px] border border-cyan-400/20 bg-[#06101c]/90 p-[5px] shadow-[0_25px_70px_rgba(0,0,0,0.65),0_0_35px_rgba(0,200,255,0.08)] transition-transform duration-500"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-black">
                                    <img
                                        src="/images/innovator-1.png"
                                        alt="SmartDELHI interface"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-black/20 pointer-events-none" />
                                </div>
                            </motion.div>

                            {/* SCREEN 02 - BACK RIGHT */}
                            <motion.div
                                initial={{ opacity: 0, x: 50, y: 35, rotate: 8 }}
                                animate={{ opacity: 1, x: 0, y: 0, rotate: 8 }}
                                transition={{
                                    delay: 0.3,
                                    duration: 0.9,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -10,
                                    rotate: 5,
                                    scale: 1.035,
                                    zIndex: 40,
                                }}
                                className="absolute z-10 right-[1%] top-[18%] w-[43%] rounded-[20px] border border-cyan-400/20 bg-[#06101c]/90 p-[5px] shadow-[0_25px_70px_rgba(0,0,0,0.65),0_0_35px_rgba(0,200,255,0.08)] transition-transform duration-500"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[16px] bg-black">
                                    <img
                                        src="/images/innovator-2.png"
                                        alt="SmartDELHI dashboard"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-black/20 pointer-events-none" />
                                </div>
                            </motion.div>

                            {/* SCREEN 03 - CENTER HERO */}
                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 55,
                                    scale: 0.86,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}
                                transition={{
                                    delay: 0.45,
                                    duration: 1.1,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -8,
                                    scale: 1.025,
                                }}
                                className="absolute z-30 left-1/2 -translate-x-1/2 top-[25%] w-[67%] rounded-[24px] border border-cyan-300/30 bg-[#07101d] p-[6px] shadow-[0_35px_100px_rgba(0,0,0,0.8),0_0_65px_rgba(0,200,255,0.16)] transition-transform duration-500"
                            >
                                {/* SCREEN FRAME */}
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-black">

                                    <img
                                        src="/images/innovator-3.png"
                                        alt="SmartDELHI main interface"
                                        className="w-full h-full object-cover"
                                    />

                                    {/* SCREEN REFLECTION */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

                                    {/* CYAN EDGE */}
                                    <div className="absolute inset-0 rounded-[18px] ring-1 ring-inset ring-cyan-300/10 pointer-events-none" />
                                </div>

                                {/* MONITOR BASE */}
                                <div className="relative mx-auto h-8 w-[32%]">
                                    <div className="absolute left-1/2 -translate-x-1/2 top-0 h-5 w-[18%] bg-[#101b29] border-x border-cyan-400/10" />
                                    <div className="absolute left-1/2 -translate-x-1/2 top-5 h-[3px] w-[90%] rounded-full bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
                                </div>
                            </motion.div>

                            {/* SCREEN 04 - BOTTOM LEFT */}
                            <motion.div
                                initial={{ opacity: 0, x: -40, y: 70 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{
                                    delay: 0.55,
                                    duration: 0.9,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -12,
                                    scale: 1.04,
                                    zIndex: 50,
                                }}
                                className="absolute z-20 left-[5%] bottom-[10%] w-[39%] rounded-[18px] border border-cyan-400/20 bg-[#06101c]/95 p-[5px] shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_30px_rgba(0,200,255,0.08)] transition-all duration-500"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-black">
                                    <img
                                        src="/images/innovator-4.png"
                                        alt="SmartDELHI analytics"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            </motion.div>

                            {/* SCREEN 05 - BOTTOM RIGHT */}
                            <motion.div
                                initial={{ opacity: 0, x: 40, y: 70 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                transition={{
                                    delay: 0.65,
                                    duration: 0.9,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -12,
                                    scale: 1.04,
                                    zIndex: 50,
                                }}
                                className="absolute z-20 right-[5%] bottom-[10%] w-[39%] rounded-[18px] border border-cyan-400/20 bg-[#06101c]/95 p-[5px] shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_30px_rgba(0,200,255,0.08)] transition-all duration-500"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[14px] bg-black">
                                    <img
                                        src="/images/innovator-5.png"
                                        alt="SmartDELHI civic intelligence"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                                </div>
                            </motion.div>

                            {/* SCREEN 06 - FRONT SMALL */}
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.85 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{
                                    delay: 0.75,
                                    duration: 0.9,
                                    ease: "easeOut",
                                }}
                                whileHover={{
                                    y: -10,
                                    scale: 1.06,
                                    zIndex: 60,
                                }}
                                className="absolute z-40 left-1/2 -translate-x-1/2 bottom-[2%] w-[29%] rounded-[16px] border border-cyan-300/25 bg-[#07101d] p-[5px] shadow-[0_25px_80px_rgba(0,0,0,0.8),0_0_35px_rgba(0,200,255,0.12)] transition-all duration-500"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-black">
                                    <img
                                        src="/images/innovator-6.png"
                                        alt="SmartDELHI interface preview"
                                        className="w-full h-full object-cover"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-transparent pointer-events-none" />
                                </div>
                            </motion.div>

                            {/* FLOATING STATUS */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1, duration: 0.7 }}
                                className="absolute z-50 right-[1%] bottom-[1%] px-3 py-2 rounded-xl border border-emerald-400/20 bg-[#06101c]/90 backdrop-blur-xl shadow-xl"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                                    </span>

                                    <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-300">
                                        System Online
                                    </span>
                                </div>
                            </motion.div>
                        </motion.div>

                    </div>
                </div>
            </section>

            {/* MISSION */}
            <section className="relative z-10 py-28 border-t border-white/5">

                <div className="max-w-7xl mx-auto px-6">

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={fadeUp}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <div className="text-cyan-400 text-xs tracking-[0.3em] uppercase">
                            Our Mission
                        </div>

                        <h2 className="mt-5 text-4xl md:text-5xl font-bold">
                            Technology that solves
                            <span className="text-cyan-400"> real problems.</span>
                        </h2>

                        <p className="mt-6 text-gray-400 leading-8">
                            We believe civic technology should not simply display
                            information. It should understand problems, connect people,
                            predict situations and help authorities take better decisions.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                        className="grid md:grid-cols-3 gap-6 mt-16"
                    >

                        {[
                            {
                                icon: BrainCircuit,
                                title: "Intelligent",
                                text: "AI-powered systems convert civic data into actionable intelligence.",
                            },
                            {
                                icon: Globe2,
                                title: "Connected",
                                text: "GIS, citizens, workers and administrators operate through one ecosystem.",
                            },

                            {
                                icon: Target,
                                title: "Impact Driven",
                                text: "Every feature is designed around measurable real-world civic outcomes.",
                            },
                            {
                                icon: BrainCircuit,
                                title: "Predictive",
                                text: "AI identifies patterns, risks and emerging civic issues before they become larger problems.",
                            },

                            {
                                icon: MapPinned,
                                title: "Transparent",
                                text: "Real-time tracking and verified data make civic operations more accountable.",
                            },

                            {
                                icon: Zap,
                                title: "Responsive",
                                text: "SmartDELHI enables faster coordination between citizens, workers and authorities.",
                            },
                        ].map((item) => {
                            const Icon = item.icon;

                            return (
                                <motion.div
                                    key={item.title}
                                    variants={fadeUp}
                                    whileHover={{
                                        y: -8,
                                        scale: 1.02,
                                    }}
                                    className="group p-7 rounded-3xl border border-white/10 bg-white/[0.025] hover:border-cyan-400/30 transition"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
                                        <Icon className="w-7 h-7 text-cyan-400" />
                                    </div>

                                    <h3 className="mt-6 text-xl font-bold">
                                        {item.title}
                                    </h3>

                                    <p className="mt-3 text-sm text-gray-500 leading-7">
                                        {item.text}
                                    </p>
                                </motion.div>
                            );
                        })}

                    </motion.div>

                </div>
            </section>

            {/* HOW WE BUILD */}
            <section className="relative z-10 py-32 overflow-hidden">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="grid lg:grid-cols-[0.82fr_1.18fr] gap-16 xl:gap-20 items-center">

                        {/* =========================================================
                LEFT CONTENT
            ========================================================= */}

                        <motion.div
                            initial={{ opacity: 0, x: -60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{
                                duration: 0.9,
                                ease: "easeOut",
                            }}
                        >

                            <div className="text-cyan-400 text-xs tracking-[0.35em] uppercase">
                                Our Technology
                            </div>

                            <h2 className="mt-5 text-4xl md:text-5xl xl:text-[62px] leading-[1.02] font-bold tracking-[-0.04em]">

                                One platform.

                                <span className="block text-blue-400">
                                    Multiple intelligence
                                </span>

                                <span className="block text-blue-400">
                                    layers.
                                </span>

                            </h2>

                            <p className="mt-7 max-w-xl text-gray-400 text-base xl:text-lg leading-8">

                                SmartDELHI combines modern software engineering with AI,
                                GIS and civic workflows to create a unified operating layer
                                for the city.

                            </p>

                            <div className="mt-9 space-y-4">

                                {[
                                    "Artificial Intelligence",
                                    "Real-time GIS Intelligence",
                                    "Citizen Complaint Management",
                                    "Worker Task Management",
                                    "Ward Performance Analytics",
                                    "Predictive Civic Intelligence",
                                ].map((item, index) => (

                                    <motion.div
                                        key={item}
                                        initial={{
                                            opacity: 0,
                                            x: -20,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.08,
                                        }}
                                        className="group flex items-center gap-3 text-sm text-gray-300"
                                    >

                                        <CheckCircle2
                                            className="
                                    w-5 h-5
                                    text-cyan-400
                                    transition-transform
                                    duration-300
                                    group-hover:scale-125
                                "
                                        />

                                        <span className="transition-colors duration-300 group-hover:text-white">
                                            {item}
                                        </span>

                                    </motion.div>

                                ))}

                            </div>

                        </motion.div>


                        {/* =========================================================
                RIGHT — CINEMATIC TECHNOLOGY SCREEN GALLERY
            ========================================================= */}
                        {/* =========================================================
    RIGHT — CINEMATIC TECHNOLOGY SCREEN GALLERY
========================================================= */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: 80,
                                scale: 0.96,
                            }}
                            whileInView={{
                                opacity: 1,
                                x: 0,
                                scale: 1,
                            }}
                            viewport={{
                                once: true,
                                amount: 0.15,
                            }}
                            transition={{
                                duration: 1.1,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="
        relative
        min-h-[620px]
        lg:min-h-[700px]
        flex
        items-center
        justify-center
    "
                        >
                            {/* =====================================================
        AMBIENT CINEMATIC LIGHT
    ===================================================== */}

                            <div
                                className="
            absolute
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[520px]
            h-[520px]
            rounded-full
            bg-cyan-400/[0.08]
            blur-[140px]
            pointer-events-none
        "
                            />

                            <div
                                className="
            absolute
            left-[58%]
            top-[48%]
            -translate-x-1/2
            -translate-y-1/2
            w-[420px]
            h-[420px]
            rounded-full
            bg-blue-500/[0.08]
            blur-[130px]
            pointer-events-none
        "
                            />

                            {/* =====================================================
        SCREEN STAGE
    ===================================================== */}

                            <div
                                className="
            relative
            w-full
            h-[620px]
            lg:h-[680px]
        "
                                style={{
                                    perspective: "1800px",
                                    transformStyle: "preserve-3d",
                                }}
                            >

                                {/* =================================================
            SCREEN 01 — BACK LEFT
        ================================================= */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        x: -30,
                                        y: 20,
                                    }}
                                    whileInView={{
                                        opacity: 0.72,
                                        x: 0,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                    }}
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        opacity: {
                                            duration: 0.8,
                                        },
                                        x: {
                                            duration: 0.9,
                                        },
                                        y: {
                                            duration: 7,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        },
                                    }}
                                    whileHover={{
                                        scale: 1.055,
                                        y: -18,
                                        opacity: 1,
                                        zIndex: 30,
                                    }}
                                    className="
                absolute
                left-[-2%]
                top-[11%]
                w-[53%]
                z-[2]
                cursor-pointer
            "
                                    style={{
                                        transformStyle: "preserve-3d",
                                    }}
                                >
                                    <div
                                        className="
                    relative
                    overflow-hidden
                    rounded-[20px]
                    border
                    border-cyan-300/10
                    bg-[#07101d]
                    shadow-[0_35px_90px_rgba(0,0,0,0.55)]
                "
                                        style={{
                                            transform:
                                                "rotateY(10deg) rotateZ(-3deg)",
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        <img
                                            src="/images/technology/tech-01.png"
                                            alt="SmartDELHI technology interface"
                                            className="
                        block
                        w-full
                        aspect-[16/9]
                        object-cover
                        select-none
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-cyan-400/[0.12]
                        via-transparent
                        to-blue-500/[0.10]
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        top-0
                        h-[35%]
                        bg-gradient-to-b
                        from-white/[0.08]
                        to-transparent
                    "
                                        />

                                        {/* SCREEN EDGE GLOW */}

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        rounded-[20px]
                        ring-1
                        ring-inset
                        ring-cyan-400/[0.08]
                    "
                                        />
                                    </div>
                                </motion.div>


                                {/* =================================================
            SCREEN 02 — BACK RIGHT
        ================================================= */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        x: 30,
                                        y: 20,
                                    }}
                                    whileInView={{
                                        opacity: 0.72,
                                        x: 0,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                    }}
                                    animate={{
                                        y: [0, 12, 0],
                                    }}
                                    transition={{
                                        opacity: {
                                            duration: 0.9,
                                            delay: 0.1,
                                        },
                                        x: {
                                            duration: 0.9,
                                        },
                                        y: {
                                            duration: 8,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        },
                                    }}
                                    whileHover={{
                                        scale: 1.055,
                                        y: -18,
                                        opacity: 1,
                                        zIndex: 30,
                                    }}
                                    className="
                absolute
                right-[-2%]
                top-[8%]
                w-[53%]
                z-[2]
                cursor-pointer
            "
                                    style={{
                                        transformStyle: "preserve-3d",
                                    }}
                                >
                                    <div
                                        className="
                    relative
                    overflow-hidden
                    rounded-[20px]
                    border
                    border-blue-300/10
                    bg-[#07101d]
                    shadow-[0_35px_90px_rgba(0,0,0,0.55)]
                "
                                        style={{
                                            transform:
                                                "rotateY(-10deg) rotateZ(3deg)",
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        <img
                                            src="/images/technology/tech-02.png"
                                            alt="SmartDELHI GIS technology interface"
                                            className="
                        block
                        w-full
                        aspect-[16/9]
                        object-cover
                        select-none
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-bl
                        from-blue-500/[0.12]
                        via-transparent
                        to-cyan-400/[0.10]
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        top-0
                        h-[35%]
                        bg-gradient-to-b
                        from-white/[0.08]
                        to-transparent
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        rounded-[20px]
                        ring-1
                        ring-inset
                        ring-blue-400/[0.08]
                    "
                                        />
                                    </div>
                                </motion.div>


                                {/* =================================================
            SCREEN 03 — MAIN CENTER
        ================================================= */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        scale: 0.9,
                                        y: 20,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        scale: 1,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                    }}
                                    animate={{
                                        y: [0, -8, 0],
                                    }}
                                    transition={{
                                        opacity: {
                                            duration: 1,
                                            delay: 0.15,
                                        },
                                        scale: {
                                            duration: 1,
                                            delay: 0.15,
                                            ease: [0.16, 1, 0.3, 1],
                                        },
                                        y: {
                                            duration: 6,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        },
                                    }}
                                    whileHover={{
                                        scale: 1.035,
                                        y: -14,
                                        zIndex: 50,
                                    }}
                                    className="
                absolute
                left-1/2
                top-1/2
                -translate-x-1/2
                -translate-y-1/2
                w-[72%]
                lg:w-[70%]
                z-[15]
                cursor-pointer
            "
                                    style={{
                                        transformStyle: "preserve-3d",
                                    }}
                                >

                                    {/* MAIN GLOW */}

                                    <div
                                        className="
                    absolute
                    -inset-8
                    rounded-[32px]
                    bg-cyan-400/[0.12]
                    blur-[55px]
                    pointer-events-none
                "
                                    />

                                    <div
                                        className="
                    absolute
                    -inset-3
                    rounded-[26px]
                    border
                    border-cyan-400/10
                    pointer-events-none
                "
                                    />

                                    {/* MAIN SCREEN */}

                                    <div
                                        className="
                    relative
                    overflow-hidden
                    rounded-[22px]
                    border
                    border-white/[0.10]
                    bg-[#06101c]
                    shadow-[0_50px_130px_rgba(0,0,0,0.72)]
                "
                                        style={{
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        <img
                                            src="/images/technology/tech-03.png"
                                            alt="SmartDELHI main technology interface"
                                            className="
                        block
                        w-full
                        aspect-[16/9]
                        object-cover
                        select-none
                    "
                                        />

                                        {/* GLASS */}

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-br
                        from-white/[0.08]
                        via-transparent
                        to-cyan-400/[0.05]
                    "
                                        />

                                        {/* REFLECTION */}

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        top-0
                        h-[42%]
                        bg-gradient-to-b
                        from-white/[0.10]
                        via-white/[0.025]
                        to-transparent
                    "
                                        />

                                        {/* BOTTOM CYAN LIGHT */}

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-[20%]
                        bg-gradient-to-t
                        from-cyan-400/[0.06]
                        to-transparent
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        rounded-[22px]
                        ring-1
                        ring-inset
                        ring-cyan-300/[0.10]
                    "
                                        />
                                    </div>
                                </motion.div>


                                {/* =================================================
            SCREEN 04 — LOWER LEFT
        ================================================= */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        x: -30,
                                    }}
                                    whileInView={{
                                        opacity: 0.86,
                                        x: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                    }}
                                    animate={{
                                        y: [0, 10, 0],
                                    }}
                                    transition={{
                                        opacity: {
                                            duration: 0.8,
                                            delay: 0.2,
                                        },
                                        x: {
                                            duration: 0.8,
                                            delay: 0.2,
                                        },
                                        y: {
                                            duration: 7.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        },
                                    }}
                                    whileHover={{
                                        scale: 1.055,
                                        y: -16,
                                        opacity: 1,
                                        zIndex: 35,
                                    }}
                                    className="
                absolute
                left-[1%]
                bottom-[5%]
                w-[52%]
                z-[7]
                cursor-pointer
            "
                                    style={{
                                        transformStyle: "preserve-3d",
                                    }}
                                >
                                    <div
                                        className="
                    relative
                    overflow-hidden
                    rounded-[20px]
                    border
                    border-cyan-300/10
                    bg-[#07101d]
                    shadow-[0_40px_100px_rgba(0,0,0,0.62)]
                "
                                        style={{
                                            transform:
                                                "rotateY(8deg) rotateZ(-2deg)",
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        <img
                                            src="/images/technology/tech-04.png"
                                            alt="SmartDELHI analytics interface"
                                            className="
                        block
                        w-full
                        aspect-[16/9]
                        object-cover
                        select-none
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-tr
                        from-cyan-400/[0.10]
                        via-transparent
                        to-transparent
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        rounded-[20px]
                        ring-1
                        ring-inset
                        ring-cyan-400/[0.07]
                    "
                                        />
                                    </div>
                                </motion.div>


                                {/* =================================================
            SCREEN 05 — LOWER RIGHT
        ================================================= */}

                                <motion.div
                                    initial={{
                                        opacity: 0,
                                        x: 30,
                                    }}
                                    whileInView={{
                                        opacity: 0.82,
                                        x: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                    }}
                                    animate={{
                                        y: [0, -11, 0],
                                    }}
                                    transition={{
                                        opacity: {
                                            duration: 0.8,
                                            delay: 0.25,
                                        },
                                        x: {
                                            duration: 0.8,
                                            delay: 0.25,
                                        },
                                        y: {
                                            duration: 8.5,
                                            repeat: Infinity,
                                            ease: "easeInOut",
                                        },
                                    }}
                                    whileHover={{
                                        scale: 1.055,
                                        y: -16,
                                        opacity: 1,
                                        zIndex: 35,
                                    }}
                                    className="
                absolute
                right-[1%]
                bottom-[4%]
                w-[52%]
                z-[6]
                cursor-pointer
            "
                                    style={{
                                        transformStyle: "preserve-3d",
                                    }}
                                >
                                    <div
                                        className="
                    relative
                    overflow-hidden
                    rounded-[20px]
                    border
                    border-blue-300/10
                    bg-[#07101d]
                    shadow-[0_40px_100px_rgba(0,0,0,0.62)]
                "
                                        style={{
                                            transform:
                                                "rotateY(-8deg) rotateZ(2deg)",
                                            transformStyle: "preserve-3d",
                                        }}
                                    >
                                        <img
                                            src="/images/technology/tech-05.png"
                                            alt="SmartDELHI civic intelligence interface"
                                            className="
                        block
                        w-full
                        aspect-[16/9]
                        object-cover
                        select-none
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        bg-gradient-to-bl
                        from-blue-500/[0.10]
                        via-transparent
                        to-transparent
                    "
                                        />

                                        <div
                                            className="
                        pointer-events-none
                        absolute
                        inset-0
                        rounded-[20px]
                        ring-1
                        ring-inset
                        ring-blue-400/[0.07]
                    "
                                        />
                                    </div>
                                </motion.div>


                                {/* =================================================
            SCREEN 06 — TOP CENTER FLOATING
        ================================================= */}




                                {/* =================================================
            CINEMATIC FLOOR LIGHT
        ================================================= */}

                                <motion.div
                                    animate={{
                                        scaleX: [1, 1.08, 1],
                                        opacity: [0.35, 0.55, 0.35],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="
                absolute
                left-1/2
                bottom-[1%]
                -translate-x-1/2
                w-[76%]
                h-[70px]
                rounded-full
                bg-cyan-400/[0.10]
                blur-[45px]
                pointer-events-none
            "
                                />

                                {/* FLOOR LINE */}

                                <div
                                    className="
                absolute
                left-1/2
                bottom-[4%]
                -translate-x-1/2
                w-[58%]
                h-px
                bg-gradient-to-r
                from-transparent
                via-cyan-400/35
                to-transparent
                pointer-events-none
            "
                                />

                            </div>


                            {/* =====================================================
        LABEL
    ===================================================== */}

                            <motion.div
                                initial={{
                                    opacity: 0,
                                    y: 15,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                }}
                                transition={{
                                    delay: 0.8,
                                    duration: 0.6,
                                }}
                                className="
            absolute
            bottom-[-8px]
            left-1/2
            -translate-x-1/2
            whitespace-nowrap
            text-[10px]
            tracking-[0.3em]
            uppercase
            text-cyan-400/55
        "
                            >
                                SmartDELHI Intelligence Stack
                            </motion.div>

                        </motion.div>

                    </div>

                </div>

            </section>

            {/* VALUES */}
            <section className="relative z-10 py-32 border-t border-white/[0.06] overflow-hidden">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="grid lg:grid-cols-[1.08fr_0.92fr] gap-16 xl:gap-24 items-center">


                        {/* =========================================================
                LEFT — PURPOSE / VALUES VISUALIZATION
            ========================================================= */}

                        <motion.div
                            initial={{ opacity: 0, x: -60 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.25 }}
                            transition={{
                                duration: 1,
                                ease: "easeOut",
                            }}
                            className="relative min-h-[540px] flex items-center justify-center"
                        >

                            {/* Ambient glow */}

                            <div
                                className="
                        absolute
                        left-1/2
                        top-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                        w-[360px]
                        h-[360px]
                        rounded-full
                        bg-cyan-400/[0.07]
                        blur-[100px]
                    "
                            />

                            <div
                                className="
                        absolute
                        left-1/2
                        top-1/2
                        -translate-x-1/2
                        -translate-y-1/2
                        w-[220px]
                        h-[220px]
                        rounded-full
                        bg-blue-500/[0.08]
                        blur-[70px]
                    "
                            />


                            {/* =====================================================
                    MAIN VISUAL
                ===================================================== */}

                            <div
                                className="
                        relative
                        w-[500px]
                        h-[500px]
                        max-w-full
                        [perspective:1200px]
                    "
                            >

                                {/* Outer orbit */}

                                <motion.div
                                    animate={{
                                        rotate: 360,
                                    }}
                                    transition={{
                                        duration: 35,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="
                            absolute
                            inset-[8%]
                            rounded-full
                            border
                            border-cyan-400/[0.12]
                        "
                                >

                                    <div
                                        className="
                                absolute
                                top-1/2
                                -left-1
                                w-2
                                h-2
                                rounded-full
                                bg-cyan-400
                                shadow-[0_0_18px_rgba(34,211,238,0.9)]
                            "
                                    />

                                </motion.div>


                                {/* Second orbit */}

                                <motion.div
                                    animate={{
                                        rotate: -360,
                                    }}
                                    transition={{
                                        duration: 24,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                    className="
                            absolute
                            inset-[20%]
                            rounded-full
                            border
                            border-blue-400/[0.13]
                        "
                                >

                                    <div
                                        className="
                                absolute
                                right-[8%]
                                top-[10%]
                                w-1.5
                                h-1.5
                                rounded-full
                                bg-blue-400
                                shadow-[0_0_15px_rgba(96,165,250,0.9)]
                            "
                                    />

                                </motion.div>


                                {/* =================================================
                        CONNECTING LINES
                    ================================================= */}

                                <div
                                    className="
                            absolute
                            left-1/2
                            top-[17%]
                            w-px
                            h-[66%]
                            -translate-x-1/2
                            bg-gradient-to-b
                            from-transparent
                            via-cyan-400/25
                            to-transparent
                        "
                                />

                                <div
                                    className="
                            absolute
                            left-[17%]
                            top-1/2
                            w-[66%]
                            h-px
                            -translate-y-1/2
                            bg-gradient-to-r
                            from-transparent
                            via-cyan-400/25
                            to-transparent
                        "
                                />


                                {/* Diagonal connections */}

                                <div
                                    className="
                            absolute
                            left-[25%]
                            top-[25%]
                            w-[50%]
                            h-px
                            bg-gradient-to-r
                            from-transparent
                            via-cyan-400/15
                            to-transparent
                            rotate-45
                            origin-center
                        "
                                />

                                <div
                                    className="
                            absolute
                            left-[25%]
                            top-[25%]
                            w-[50%]
                            h-px
                            bg-gradient-to-r
                            from-transparent
                            via-blue-400/15
                            to-transparent
                            -rotate-45
                            origin-center
                        "
                                />


                                {/* =================================================
                        CENTRAL PURPOSE CORE
                    ================================================= */}

                                <motion.div
                                    animate={{
                                        scale: [1, 1.025, 1],
                                    }}
                                    transition={{
                                        duration: 4,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="
                            absolute
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                            w-[170px]
                            h-[170px]
                            rounded-full
                            flex
                            items-center
                            justify-center
                            z-20
                        "
                                >

                                    {/* Core outer glow */}

                                    <div
                                        className="
                                absolute
                                inset-0
                                rounded-full
                                bg-cyan-400/[0.08]
                                blur-[35px]
                            "
                                    />

                                    {/* Core ring */}

                                    <div
                                        className="
                                absolute
                                inset-0
                                rounded-full
                                border
                                border-cyan-400/30
                                bg-[#06111e]/90
                                backdrop-blur-xl
                                shadow-[0_0_70px_rgba(0,200,255,0.14)]
                            "
                                    />

                                    {/* Inner ring */}

                                    <div
                                        className="
                                absolute
                                inset-[15px]
                                rounded-full
                                border
                                border-cyan-400/10
                            "
                                    />

                                    <div className="relative text-center">

                                        <div className="text-[9px] tracking-[0.35em] uppercase text-cyan-400/70">
                                            SmartDELHI
                                        </div>

                                        <div className="mt-2 text-lg font-semibold text-white">
                                            Purpose
                                        </div>

                                        <div className="mt-1 text-[10px] text-gray-500">
                                            at the core
                                        </div>

                                    </div>

                                </motion.div>


                                {/* =================================================
                        NODE 01 — CURIOSITY
                    ================================================= */}

                                <motion.div
                                    whileHover={{
                                        scale: 1.08,
                                        y: -4,
                                    }}
                                    className="
                            absolute
                            left-[2%]
                            top-[22%]
                            z-30
                            cursor-pointer
                        "
                                >

                                    <div
                                        className="
                                relative
                                flex
                                items-center
                                gap-3
                            "
                                    >

                                        <div
                                            className="
                                    w-12
                                    h-12
                                    rounded-full
                                    border
                                    border-cyan-400/25
                                    bg-[#06111e]/90
                                    backdrop-blur-xl
                                    flex
                                    items-center
                                    justify-center
                                    shadow-[0_0_30px_rgba(0,200,255,0.08)]
                                    transition-all
                                    duration-300
                                    hover:border-cyan-400/60
                                    hover:shadow-[0_0_35px_rgba(0,200,255,0.2)]
                                "
                                        >

                                            <Sparkles className="w-5 h-5 text-cyan-300" />

                                        </div>

                                        <div>

                                            <div className="text-[9px] tracking-[0.25em] uppercase text-cyan-400/60">
                                                01
                                            </div>

                                            <div className="mt-1 text-sm font-semibold text-white">
                                                Curiosity
                                            </div>

                                        </div>

                                    </div>

                                </motion.div>


                                {/* =================================================
                        NODE 02 — ENGINEERING
                    ================================================= */}

                                <motion.div
                                    whileHover={{
                                        scale: 1.08,
                                        y: -4,
                                    }}
                                    className="
                            absolute
                            right-[1%]
                            top-[21%]
                            z-30
                            cursor-pointer
                        "
                                >

                                    <div className="flex items-center gap-3">

                                        <div className="text-right">

                                            <div className="text-[9px] tracking-[0.25em] uppercase text-blue-400/60">
                                                02
                                            </div>

                                            <div className="mt-1 text-sm font-semibold text-white">
                                                Engineering
                                            </div>

                                        </div>

                                        <div
                                            className="
                                    w-12
                                    h-12
                                    rounded-full
                                    border
                                    border-blue-400/25
                                    bg-[#06111e]/90
                                    backdrop-blur-xl
                                    flex
                                    items-center
                                    justify-center
                                    transition-all
                                    duration-300
                                    hover:border-blue-400/60
                                    hover:shadow-[0_0_35px_rgba(59,130,246,0.2)]
                                "
                                        >

                                            <Cpu className="w-5 h-5 text-blue-300" />

                                        </div>

                                    </div>

                                </motion.div>


                                {/* =================================================
                        NODE 03 — RESPONSIBILITY
                    ================================================= */}

                                <motion.div
                                    whileHover={{
                                        scale: 1.08,
                                        y: 4,
                                    }}
                                    className="
                            absolute
                            left-[1%]
                            bottom-[21%]
                            z-30
                            cursor-pointer
                        "
                                >

                                    <div className="flex items-center gap-3">

                                        <div
                                            className="
                                    w-12
                                    h-12
                                    rounded-full
                                    border
                                    border-cyan-400/25
                                    bg-[#06111e]/90
                                    backdrop-blur-xl
                                    flex
                                    items-center
                                    justify-center
                                    transition-all
                                    duration-300
                                    hover:border-cyan-400/60
                                    hover:shadow-[0_0_35px_rgba(0,200,255,0.2)]
                                "
                                        >

                                            <ShieldCheck className="w-5 h-5 text-cyan-300" />

                                        </div>

                                        <div>

                                            <div className="text-[9px] tracking-[0.25em] uppercase text-cyan-400/60">
                                                03
                                            </div>

                                            <div className="mt-1 text-sm font-semibold text-white">
                                                Responsibility
                                            </div>

                                        </div>

                                    </div>

                                </motion.div>


                                {/* =================================================
                        NODE 04 — IMPACT
                    ================================================= */}

                                <motion.div
                                    whileHover={{
                                        scale: 1.08,
                                        y: 4,
                                    }}
                                    className="
                            absolute
                            right-[2%]
                            bottom-[20%]
                            z-30
                            cursor-pointer
                        "
                                >

                                    <div className="flex items-center gap-3">

                                        <div className="text-right">

                                            <div className="text-[9px] tracking-[0.25em] uppercase text-blue-400/60">
                                                04
                                            </div>

                                            <div className="mt-1 text-sm font-semibold text-white">
                                                Impact
                                            </div>

                                        </div>

                                        <div
                                            className="
                                    w-12
                                    h-12
                                    rounded-full
                                    border
                                    border-blue-400/25
                                    bg-[#06111e]/90
                                    backdrop-blur-xl
                                    flex
                                    items-center
                                    justify-center
                                    transition-all
                                    duration-300
                                    hover:border-blue-400/60
                                    hover:shadow-[0_0_35px_rgba(59,130,246,0.2)]
                                "
                                        >

                                            <Target className="w-5 h-5 text-blue-300" />

                                        </div>

                                    </div>

                                </motion.div>


                                {/* =================================================
                        MOVING DATA PULSES
                    ================================================= */}

                                <motion.div
                                    animate={{
                                        x: [0, 180, 0],
                                        opacity: [0.2, 1, 0.2],
                                    }}
                                    transition={{
                                        duration: 5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                    className="
                            absolute
                            left-[31%]
                            top-1/2
                            w-1.5
                            h-1.5
                            rounded-full
                            bg-cyan-300
                            shadow-[0_0_15px_rgba(34,211,238,1)]
                            z-10
                        "
                                />

                                <motion.div
                                    animate={{
                                        x: [0, -170, 0],
                                        opacity: [0.2, 1, 0.2],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                        delay: 1.5,
                                    }}
                                    className="
                            absolute
                            left-[67%]
                            top-1/2
                            w-1.5
                            h-1.5
                            rounded-full
                            bg-blue-300
                            shadow-[0_0_15px_rgba(96,165,250,1)]
                            z-10
                        "
                                />


                                {/* =================================================
                        BOTTOM STATUS
                    ================================================= */}

                                <div
                                    className="
                            absolute
                            left-1/2
                            bottom-[5%]
                            -translate-x-1/2
                            flex
                            items-center
                            gap-3
                            whitespace-nowrap
                        "
                                >

                                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />

                                    <span className="text-[9px] tracking-[0.3em] uppercase text-gray-500">
                                        Principles → Decisions → Impact
                                    </span>

                                </div>

                            </div>

                        </motion.div>


                        {/* =========================================================
                RIGHT — EDITORIAL CONTENT
            ========================================================= */}

                        <motion.div
                            initial={{
                                opacity: 0,
                                x: 60,
                            }}
                            whileInView={{
                                opacity: 1,
                                x: 0,
                            }}
                            viewport={{
                                once: true,
                                amount: 0.25,
                            }}
                            transition={{
                                duration: 0.9,
                                ease: "easeOut",
                            }}
                        >

                            <div className="text-cyan-400 text-xs tracking-[0.35em] uppercase">
                                What Drives Us
                            </div>

                            <h2
                                className="
                        mt-5
                        text-4xl
                        md:text-5xl
                        xl:text-[64px]
                        leading-[1.02]
                        tracking-[-0.045em]
                        font-bold
                    "
                            >

                                Innovation

                                <span className="block text-blue-400">
                                    with purpose.
                                </span>

                            </h2>

                            <p
                                className="
                        mt-7
                        max-w-xl
                        text-gray-400
                        text-base
                        xl:text-lg
                        leading-8
                    "
                            >
                                We build technology with a simple principle:
                                intelligence should create measurable value for
                                the people and the city it serves.
                            </p>


                            {/* =====================================================
                    PRINCIPLE LIST
                ===================================================== */}

                            <div className="mt-10">

                                {[
                                    {
                                        number: "01",
                                        title: "Curiosity",
                                        text: "Question the ordinary. Look deeper before building.",
                                    },
                                    {
                                        number: "02",
                                        title: "Engineering",
                                        text: "Turn complex civic problems into practical systems.",
                                    },
                                    {
                                        number: "03",
                                        title: "Responsibility",
                                        text: "Design technology around people, trust and accountability.",
                                    },
                                    {
                                        number: "04",
                                        title: "Impact",
                                        text: "Measure success by the difference technology creates.",
                                    },
                                ].map((item, index) => (

                                    <motion.div
                                        key={item.number}
                                        initial={{
                                            opacity: 0,
                                            x: 25,
                                        }}
                                        whileInView={{
                                            opacity: 1,
                                            x: 0,
                                        }}
                                        viewport={{
                                            once: true,
                                        }}
                                        transition={{
                                            duration: 0.5,
                                            delay: index * 0.1,
                                        }}
                                        className="
                                group
                                relative
                                py-5
                                border-b
                                border-white/[0.07]
                                cursor-default
                            "
                                    >

                                        {/* Hover line */}

                                        <div
                                            className="
                                    absolute
                                    left-0
                                    bottom-0
                                    h-px
                                    w-0
                                    bg-cyan-400
                                    transition-all
                                    duration-500
                                    group-hover:w-full
                                "
                                        />

                                        <div className="flex items-start gap-6">

                                            <span
                                                className="
                                        pt-1
                                        text-xs
                                        font-mono
                                        tracking-widest
                                        text-cyan-400/60
                                        group-hover:text-cyan-300
                                        transition-colors
                                    "
                                            >
                                                {item.number}
                                            </span>

                                            <div className="flex-1">

                                                <h3
                                                    className="
                                            text-lg
                                            font-semibold
                                            text-gray-200
                                            group-hover:text-white
                                            transition-colors
                                        "
                                                >
                                                    {item.title}
                                                </h3>

                                                <p
                                                    className="
                                            mt-1.5
                                            text-sm
                                            leading-6
                                            text-gray-500
                                            group-hover:text-gray-400
                                            transition-colors
                                        "
                                                >
                                                    {item.text}
                                                </p>

                                            </div>

                                            <ArrowRight
                                                className="
                                        w-4
                                        h-4
                                        mt-1
                                        text-gray-700
                                        -translate-x-2
                                        opacity-0
                                        group-hover:opacity-100
                                        group-hover:translate-x-0
                                        group-hover:text-cyan-400
                                        transition-all
                                        duration-300
                                    "
                                            />

                                        </div>

                                    </motion.div>

                                ))}

                            </div>


                            {/* Bottom statement */}

                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7 }}
                                className="mt-8 flex items-center gap-3"
                            >

                                <div className="w-8 h-px bg-cyan-400/50" />

                                <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500">
                                    Technology with a civic conscience
                                </span>

                            </motion.div>

                        </motion.div>

                    </div>

                </div>

            </section>

            {/* =========================================================
    ABOUT THE INNOVATOR
========================================================= */}

            {/* =========================================================
    ABOUT THE INNOVATOR — CINEMATIC FULL BLEED IMAGE
========================================================= */}

            <section className="relative z-10 w-full h-[650px] md:h-[750px] lg:h-[850px] overflow-hidden">

                <motion.div
                    initial={{
                        opacity: 0,
                        scale: 1.06,
                    }}
                    whileInView={{
                        opacity: 1,
                        scale: 1,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.15,
                    }}
                    transition={{
                        duration: 1.4,
                        ease: "easeOut",
                    }}
                    className="absolute inset-0"
                >

                    <img
                        src="/images/innovator.png"
                        alt="SmartDELHI Innovator"
                        className="
                w-full
                h-full
                object-cover
                object-center
            "
                    />

                </motion.div>

            </section>



            {/* =========================================================
    PREMIUM CTA
========================================================= */}

            <section className="relative z-10 py-28 md:py-36 overflow-hidden">

                <div className="max-w-7xl mx-auto px-6">

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >

                        {/* Ambient glow */}

                        <div className="absolute -inset-10 rounded-[48px] bg-cyan-500/[0.06] blur-[90px] pointer-events-none" />

                        <div className="relative overflow-hidden rounded-[38px] border border-white/[0.10] bg-[#071321]/80 backdrop-blur-2xl">

                            {/* Top cyan line */}

                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

                            {/* Decorative glow */}

                            <motion.div
                                animate={{
                                    x: [0, 80, 0],
                                    y: [0, -30, 0],
                                }}
                                transition={{
                                    duration: 12,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-blue-500/[0.08] blur-[80px] pointer-events-none"
                            />

                            <motion.div
                                animate={{
                                    x: [0, -60, 0],
                                    y: [0, 30, 0],
                                }}
                                transition={{
                                    duration: 14,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                                className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-cyan-400/[0.07] blur-[100px] pointer-events-none"
                            />

                            {/* Content */}

                            <div className="relative px-7 py-16 md:px-16 md:py-20 lg:px-24 lg:py-24">

                                <div className="max-w-4xl mx-auto text-center">

                                    {/* Eyebrow */}

                                    <motion.div
                                        initial={{ opacity: 0, y: 12 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.15, duration: 0.5 }}
                                        className="inline-flex items-center gap-3 text-[11px] tracking-[0.35em] uppercase text-cyan-400"
                                    >

                                        <span className="w-8 h-px bg-cyan-400/60" />

                                        SmartDELHI

                                        <span className="w-8 h-px bg-cyan-400/60" />

                                    </motion.div>


                                    {/* Heading */}

                                    <motion.h2
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.25,
                                            duration: 0.7,
                                            ease: "easeOut",
                                        }}
                                        className="mt-7 text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.04em] leading-[1.05]"
                                    >

                                        Let&apos;s build a

                                        <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                                            smarter city.
                                        </span>

                                    </motion.h2>


                                    {/* Description */}

                                    <motion.p
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.4,
                                            duration: 0.6,
                                        }}
                                        className="mt-7 max-w-2xl mx-auto text-gray-400 text-base md:text-lg leading-8"
                                    >
                                        SmartDELHI is more than a digital platform.
                                        It is a connected civic intelligence system designed
                                        to make cities more responsive, transparent and
                                        intelligently managed.
                                    </motion.p>


                                    {/* Buttons */}

                                    <motion.div
                                        initial={{ opacity: 0, y: 18 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.55,
                                            duration: 0.6,
                                        }}
                                        className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
                                    >

                                        <Link
                                            href="/"
                                            className="
                                    group
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-3
                                    min-w-[190px]
                                    px-7
                                    py-4
                                    rounded-2xl
                                    bg-gradient-to-r
                                    from-cyan-400
                                    to-blue-600
                                    text-white
                                    font-semibold
                                    shadow-[0_15px_45px_rgba(0,190,255,0.20)]
                                    transition-all
                                    duration-300
                                    hover:scale-[1.03]
                                    hover:shadow-[0_20px_60px_rgba(0,190,255,0.30)]
                                "
                                        >

                                            Explore SmartDELHI

                                            <ArrowRight
                                                className="
                                        w-5
                                        h-5
                                        transition-transform
                                        duration-300
                                        group-hover:translate-x-1
                                    "
                                            />

                                        </Link>


                                        <Link
                                            href="/complaints"
                                            className="
                                    inline-flex
                                    items-center
                                    justify-center
                                    min-w-[150px]
                                    px-7
                                    py-4
                                    rounded-2xl
                                    border
                                    border-white/10
                                    bg-white/[0.03]
                                    text-gray-300
                                    font-medium
                                    transition-all
                                    duration-300
                                    hover:bg-white/[0.07]
                                    hover:border-cyan-400/30
                                    hover:text-white
                                "
                                        >

                                            Get Started

                                        </Link>

                                    </motion.div>


                                    {/* Bottom status */}

                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        whileInView={{ opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            delay: 0.75,
                                            duration: 0.6,
                                        }}
                                        className="mt-10 flex items-center justify-center gap-2 text-[11px] tracking-[0.2em] uppercase text-gray-600"
                                    >

                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

                                        Civic intelligence • AI • GIS • People

                                    </motion.div>

                                </div>

                            </div>

                        </div>

                    </motion.div>

                </div>

            </section>


            {/* =========================================================
    PREMIUM FOOTER
========================================================= */}

            <footer className="relative z-10 border-t border-white/[0.07]">

                <div className="max-w-7xl mx-auto px-6">

                    <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-5">

                        {/* Brand */}

                        <div className="flex items-center gap-3">

                            <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />

                            <p className="text-xs text-gray-500">
                                © {new Date().getFullYear()} SmartDELHI
                            </p>

                            <span className="hidden sm:block text-gray-700">
                                •
                            </span>

                            <p className="hidden sm:block text-xs text-gray-600">
                                Built for a smarter Delhi.
                            </p>

                        </div>


                        {/* Navigation */}

                        <nav className="flex items-center gap-7 text-xs">

                            <Link
                                href="/"
                                className="
                        text-gray-500
                        transition-colors
                        duration-300
                        hover:text-white
                    "
                            >
                                Home
                            </Link>

                            <Link
                                href="/about-us"
                                className="
                        text-cyan-400
                        transition-colors
                        duration-300
                        hover:text-cyan-300
                    "
                            >
                                About Us
                            </Link>

                            <Link
                                href="/contact"
                                className="
                        text-gray-500
                        transition-colors
                        duration-300
                        hover:text-white
                    "
                            >
                                Contact
                            </Link>

                        </nav>

                    </div>

                    {/* Bottom micro line */}

                    <div className="pb-6 flex items-center justify-center">

                        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

                    </div>

                </div>

            </footer>
        </main>
    );
}