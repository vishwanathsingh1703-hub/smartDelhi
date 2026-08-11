"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Lock, Mail, UserRound } from "lucide-react";

export default function LoginPage() {
    const [isRegister, setIsRegister] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");

        try {
            const endpoint = isRegister
                ? "/api/auth/register"
                : "/api/auth/login";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.message || "Something went wrong.");
            }

            setMessage(
                isRegister
                    ? "Registration successful."
                    : "Login successful."
            );

            if (!isRegister) {
                window.location.href = "/";
            }
        } catch (error) {
            setMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#020711] text-white">

            {/* BACKGROUND */}

            <div className="absolute inset-0 overflow-hidden pointer-events-none">

                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px]" />

                <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[150px]" />

                <div className="absolute bottom-0 left-1/3 w-[450px] h-[300px] rounded-full bg-indigo-500/10 blur-[140px]" />

                {/* Network dots */}

                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-[12%] left-[18%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <div className="absolute top-[28%] left-[8%] w-1 h-1 rounded-full bg-cyan-300" />
                    <div className="absolute top-[20%] right-[20%] w-1.5 h-1.5 rounded-full bg-blue-400" />
                    <div className="absolute top-[65%] right-[12%] w-1 h-1 rounded-full bg-cyan-300" />
                    <div className="absolute bottom-[18%] left-[25%] w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </div>

            </div>


            {/* NAVBAR */}

            <header className="relative z-20 border-b border-white/[0.06]">

                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                    <Link
                        href="/"
                        className="text-2xl font-bold tracking-tight"
                    >
                        Smart<span className="text-cyan-400">DELHI</span>
                    </Link>

                    <Link
                        href="/"
                        className="text-sm text-gray-400 hover:text-white transition"
                    >
                        ← Back to SmartDELHI
                    </Link>

                </div>

            </header>


            {/* LOGIN AREA */}

            <section className="relative z-10 min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16">

                <div className="w-full max-w-md">

                    {/* HEADER */}

                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="text-center mb-8"
                    >

                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300 text-xs tracking-[0.25em] uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            Civic Intelligence Platform
                        </div>

                        <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight">
                            {isRegister ? "Create your account." : "Welcome back."}
                        </h1>

                        <p className="mt-4 text-gray-500 text-sm leading-6">
                            {isRegister
                                ? "Join SmartDELHI and help build a smarter, more connected city."
                                : "Sign in to continue to your SmartDELHI civic workspace."
                            }
                        </p>

                    </motion.div>


                    {/* FORM CARD */}

                    <motion.div
                        initial={{ opacity: 0, y: 35, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.1,
                        }}
                        className="relative"
                    >

                        <div className="absolute -inset-5 rounded-[35px] bg-cyan-500/[0.07] blur-[50px]" />

                        <div className="relative rounded-[28px] border border-white/[0.09] bg-[#07101d]/90 backdrop-blur-2xl p-7 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.45)]">

                            {/* FORM */}

                            <form
                                onSubmit={handleSubmit}
                                className="space-y-5"
                            >

                                {/* NAME */}

                                {isRegister && (
                                    <div>
                                        <label className="block mb-2 text-xs text-gray-400 uppercase tracking-widest">
                                            Full Name
                                        </label>

                                        <div className="relative">

                                            <UserRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                                            <input
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) =>
                                                    setForm({
                                                        ...form,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Your name"
                                                className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-cyan-400/50 focus:bg-cyan-400/[0.03]"
                                            />

                                        </div>
                                    </div>
                                )}


                                {/* EMAIL */}

                                <div>

                                    <label className="block mb-2 text-xs text-gray-400 uppercase tracking-widest">
                                        Email
                                    </label>

                                    <div className="relative">

                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                                        <input
                                            type="email"
                                            required
                                            value={form.email}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    email: e.target.value,
                                                })
                                            }
                                            placeholder="you@example.com"
                                            className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-cyan-400/50 focus:bg-cyan-400/[0.03]"
                                        />

                                    </div>

                                </div>


                                {/* PASSWORD */}

                                <div>

                                    <div className="flex items-center justify-between mb-2">

                                        <label className="text-xs text-gray-400 uppercase tracking-widest">
                                            Password
                                        </label>

                                        {!isRegister && (
                                            <button
                                                type="button"
                                                className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                                            >
                                                Forgot password?
                                            </button>
                                        )}

                                    </div>

                                    <div className="relative">

                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />

                                        <input
                                            type="password"
                                            required
                                            value={form.password}
                                            onChange={(e) =>
                                                setForm({
                                                    ...form,
                                                    password: e.target.value,
                                                })
                                            }
                                            placeholder="••••••••"
                                            className="w-full h-12 rounded-xl border border-white/[0.08] bg-white/[0.03] pl-11 pr-4 text-sm text-white placeholder:text-gray-600 outline-none transition focus:border-cyan-400/50 focus:bg-cyan-400/[0.03]"
                                        />

                                    </div>

                                </div>


                                {/* MESSAGE */}

                                {message && (
                                    <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/[0.05] px-4 py-3 text-sm text-cyan-300">
                                        {message}
                                    </div>
                                )}


                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="group w-full h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(0,180,255,0.18)] hover:scale-[1.015] hover:shadow-[0_15px_45px_rgba(0,180,255,0.28)] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
                                >

                                    {loading
                                        ? "Please wait..."
                                        : isRegister
                                            ? "Create Account"
                                            : "Sign In"
                                    }

                                    {!loading && (
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    )}

                                </button>

                            </form>


                            {/* SWITCH */}

                            <div className="mt-7 pt-6 border-t border-white/[0.07] text-center">

                                <p className="text-sm text-gray-500">

                                    {isRegister
                                        ? "Already have an account?"
                                        : "Don't have a SmartDELHI account?"
                                    }

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsRegister(!isRegister);
                                            setMessage("");
                                        }}
                                        className="ml-2 text-cyan-400 hover:text-cyan-300 font-medium transition"
                                    >
                                        {isRegister
                                            ? "Sign in"
                                            : "Register"
                                        }
                                    </button>

                                </p>

                            </div>

                        </div>

                    </motion.div>


                    {/* SECURITY */}

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-6 text-center"
                    >

                        <p className="text-[11px] text-gray-600 tracking-wide">
                            SECURE CIVIC ACCESS · SMARTDELHI
                        </p>

                    </motion.div>

                </div>

            </section>

        </main>
    );
}