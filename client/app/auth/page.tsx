"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";


import { ArrowLeft } from "lucide-react";

// const router = useRouter();

type Role = "CITIZEN" | "WORKER" | "ADMIN";

export default function AuthPage() {
  const router = useRouter();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("CITIZEN");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [ward, setWard] = useState("");

  const [password, setPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = role === "ADMIN";

  const dashboardForRole = (userRole: string) => {
    switch (userRole) {
      case "ADMIN":
        return "/dashboard/admin";

      case "WORKER":
        return "/dashboard/worker";

      default:
        return "/dashboard/citizen";
    }
  };

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearMessages();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role,
          adminPassword: isAdmin ? adminPassword : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to login.");
      }

      setSuccess("Authentication successful. Opening your dashboard...");

      const destination = dashboardForRole(data.user?.role || role);

      setTimeout(() => {
        router.replace(destination);
        router.refresh();
      }, 600);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    clearMessages();

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          ward,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setSuccess("Account created successfully. You can now login.");

      setMode("login");
      setPassword("");
      setAdminPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    clearMessages();
    setGoogleLoading(true);

    try {
      const response = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credential,
          role,
          adminPassword: isAdmin ? adminPassword : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Google authentication failed."
        );
      }

      setSuccess("Google verification successful.");

      const destination = dashboardForRole(data.user?.role || role);

      setTimeout(() => {
        router.replace(destination);
        router.refresh();
      }, 600);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Google authentication failed."
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  const initializeGoogle = () => {
    if (
      !window.google ||
      !googleButtonRef.current ||
      googleButtonRef.current.childNodes.length > 0
    ) {
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "NEXT_PUBLIC_GOOGLE_CLIENT_ID is missing."
      );
      return;
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response.credential) {
          handleGoogleCredential(response.credential);
        }
      },
    });

    window.google.accounts.id.renderButton(
      googleButtonRef.current,
      {
        theme: "filled_black",
        size: "large",
        width: 390,
        text: "continue_with",
        shape: "pill",
      }
    );
  };

  useEffect(() => {
    initializeGoogle();
  }, [role, mode]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#02060c] text-white">

      {/* GOOGLE SCRIPT */}

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
      />

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute inset-0">

        <div
          className="
            absolute
            inset-0
            bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.10),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.10),transparent_34%)]
          "
        />

        <div
          className="
            absolute
            inset-0
            opacity-[0.16]
            bg-[linear-gradient(rgba(56,189,248,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.08)_1px,transparent_1px)]
            bg-[size:45px_45px]
          "
        />

        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -40, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            left-[8%]
            top-[15%]
            w-[420px]
            h-[420px]
            rounded-full
            bg-cyan-400/[0.06]
            blur-[120px]
          "
        />

        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 17,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="
            absolute
            right-[5%]
            bottom-[5%]
            w-[420px]
            h-[420px]
            rounded-full
            bg-blue-500/[0.07]
            blur-[130px]
          "
        />

      </div>

      {/* =====================================================
          TOP BRAND
      ===================================================== */}

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="
          relative
          z-20
          flex
          items-center
          justify-between
          px-6
          py-6
          sm:px-10
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border
              border-cyan-400/20
              bg-cyan-400/[0.07]
              shadow-[0_0_30px_rgba(34,211,238,0.10)]
            "
          >
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <div className="text-sm font-bold tracking-[0.08em]">
              Smart<span className="text-cyan-300">DELHI</span>
            </div>

            <div className="text-[9px] uppercase tracking-[0.25em] text-slate-600">
              Civic Intelligence
            </div>
          </div>

        </div>

        <div
          className="
            hidden
            items-center
            gap-2
            rounded-full
            border
            border-emerald-400/15
            bg-emerald-400/[0.04]
            px-3
            py-1.5
            text-[9px]
            uppercase
            tracking-[0.18em]
            text-emerald-300
            sm:flex
          "
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
          Systems Operational
        </div>

      </motion.header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-100px)] max-w-7xl items-center px-5 pb-12 sm:px-8">

        <div className="grid w-full items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">

          {/* =================================================
              LEFT — BRAND STORY
          ================================================= */}

          <motion.section
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="hidden lg:block"
          >

            <div className="max-w-xl">

              <div className="mb-7 flex items-center gap-3">

                <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-300">
                  Delhi • Digital Governance
                </span>

              </div>

              <h1 className="text-[64px] font-semibold leading-[0.98] tracking-[-0.055em]">
                One city.
                <br />

                <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  One intelligent
                </span>

                <br />

                ecosystem.
              </h1>

              <p className="mt-7 max-w-lg text-[15px] leading-7 text-slate-400">
                SmartDELHI connects citizens, field workers,
                administrators, GIS intelligence and AI into one
                unified civic platform.
              </p>

              <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">

                {[
                  ["AI", "Verification"],
                  ["GIS", "Intelligence"],
                  ["24/7", "Monitoring"],
                ].map(([value, label]) => (
                  <div
                    key={value}
                    className="
                      rounded-2xl
                      border
                      border-white/[0.07]
                      bg-white/[0.025]
                      px-4
                      py-4
                      backdrop-blur-xl
                    "
                  >
                    <div className="text-lg font-semibold text-white">
                      {value}
                    </div>

                    <div className="mt-1 text-[9px] uppercase tracking-[0.15em] text-slate-600">
                      {label}
                    </div>

                  </div>


                ))}

              </div>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm font-medium text-white hover:bg-cyan-400/10 hover:border-cyan-400/30 hover:text-cyan-300 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>
            </div>

          </motion.section>

          {/* =================================================
              RIGHT — AUTH CARD
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 25,
              scale: 0.97,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.9,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mx-auto w-full max-w-[500px]"
          >

            <div
              className="
                relative
                overflow-hidden
                rounded-[32px]
                border
                border-white/[0.09]
                bg-[#07101b]/90
                p-2
                shadow-[0_40px_120px_rgba(0,0,0,0.65)]
                backdrop-blur-3xl
              "
            >

              <div
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-0
                  h-32
                  w-72
                  -translate-x-1/2
                  bg-cyan-400/[0.07]
                  blur-[70px]
                "
              />

              <div className="relative rounded-[26px] border border-white/[0.05] bg-[#050b14]/95 p-6 sm:p-8">

                {/* HEADER */}

                <div className="mb-7">

                  <div className="mb-3 flex items-center gap-2">

                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.9)]" />

                    <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      Secure Access
                    </span>

                  </div>

                  <AnimatePresence mode="wait">

                    <motion.div
                      key={mode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                        {mode === "login"
                          ? "Welcome back."
                          : "Create your account."}
                      </h2>

                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {mode === "login"
                          ? "Enter your credentials to access SmartDELHI."
                          : "Join the digital civic intelligence network."}
                      </p>
                    </motion.div>

                  </AnimatePresence>

                </div>

                {/* MODE SWITCH */}

                <div
                  className="
                    mb-6
                    grid
                    grid-cols-2
                    rounded-2xl
                    border
                    border-white/[0.06]
                    bg-white/[0.025]
                    p-1
                  "
                >

                  {(["login", "register"] as const).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setMode(item);
                        clearMessages();
                      }}
                      className={`
                        relative
                        rounded-xl
                        py-2.5
                        text-xs
                        font-medium
                        transition
                        ${mode === item
                          ? "bg-white/[0.08] text-white shadow-lg"
                          : "text-slate-500 hover:text-slate-300"
                        }
                      `}
                    >
                      {item === "login" ? "Login" : "Register"}
                    </button>
                  ))}

                </div>

                {/* ROLE */}

                <div className="mb-6">

                  <div className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                    Access level
                  </div>

                  <div className="grid grid-cols-3 gap-2">

                    {[
                      ["CITIZEN", "Citizen"],
                      ["WORKER", "Worker"],
                      ["ADMIN", "Admin"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setRole(value as Role);
                          clearMessages();
                        }}
                        className={`
                          rounded-xl
                          border
                          px-2
                          py-2.5
                          text-[10px]
                          font-medium
                          transition-all
                          ${role === value
                            ? value === "ADMIN"
                              ? "border-amber-400/30 bg-amber-400/[0.08] text-amber-300"
                              : "border-cyan-400/30 bg-cyan-400/[0.08] text-cyan-300"
                            : "border-white/[0.06] bg-white/[0.02] text-slate-500 hover:border-white/10 hover:text-slate-300"
                          }
                        `}
                      >
                        {label}
                      </button>
                    ))}

                  </div>

                </div>

                {/* FORM */}

                <form
                  onSubmit={
                    mode === "login"
                      ? handleLogin
                      : handleRegister
                  }
                  className="space-y-4"
                >

                  {mode === "register" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <Input
                        icon={<UserRound />}
                        placeholder="Full name"
                        value={name}
                        onChange={setName}
                      />

                      <Input
                        icon={<Mail />}
                        placeholder="Phone"
                        value={phone}
                        onChange={setPhone}
                      />

                    </div>
                  )}

                  <Input
                    icon={<Mail />}
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={setEmail}
                  />

                  {mode === "register" && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                      <Input
                        icon={<ShieldCheck />}
                        placeholder="Ward"
                        value={ward}
                        onChange={setWard}
                      />

                      <Input
                        icon={<UserRound />}
                        placeholder="Phone number"
                        value={phone}
                        onChange={setPhone}
                      />

                    </div>
                  )}

                  <div className="relative">

                    <Input
                      icon={<LockKeyhole />}
                      placeholder="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={setPassword}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((v) => !v)
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-slate-600
                        transition
                        hover:text-cyan-300
                      "
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                  {/* ADMIN SECURITY */}

                  <AnimatePresence initial={false}>

                    {isAdmin && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          height: 0,
                          y: -8,
                        }}
                        animate={{
                          opacity: 1,
                          height: "auto",
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          height: 0,
                          y: -8,
                        }}
                        className="overflow-hidden"
                      >

                        <div
                          className="
                            rounded-2xl
                            border
                            border-amber-400/15
                            bg-amber-400/[0.035]
                            p-3
                          "
                        >

                          <div className="mb-2 flex items-center gap-2">

                            <LockKeyhole className="h-3.5 w-3.5 text-amber-300" />

                            <span className="text-[9px] uppercase tracking-[0.2em] text-amber-300">
                              Administrator verification
                            </span>

                          </div>

                          <div className="relative">

                            <input
                              type={
                                showAdminPassword
                                  ? "text"
                                  : "password"
                              }
                              value={adminPassword}
                              onChange={(e) =>
                                setAdminPassword(e.target.value)
                              }
                              placeholder="Admin security password"
                              required={isAdmin}
                              className="
                                h-11
                                w-full
                                rounded-xl
                                border
                                border-amber-400/10
                                bg-black/20
                                px-4
                                pr-11
                                text-xs
                                text-white
                                outline-none
                                placeholder:text-slate-700
                                focus:border-amber-400/30
                              "
                            />

                            <button
                              type="button"
                              onClick={() =>
                                setShowAdminPassword((v) => !v)
                              }
                              className="
                                absolute
                                right-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-600
                                hover:text-amber-300
                              "
                            >
                              {showAdminPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </button>

                          </div>

                          <p className="mt-2 text-[9px] text-slate-600">
                            Required for administrator access.
                          </p>

                        </div>

                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* STATUS */}

                  <AnimatePresence mode="wait">

                    {error && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="
                          flex
                          items-start
                          gap-2
                          rounded-xl
                          border
                          border-red-400/15
                          bg-red-400/[0.05]
                          px-3
                          py-2.5
                          text-[10px]
                          text-red-300
                        "
                      >
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -5,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="
                          flex
                          items-start
                          gap-2
                          rounded-xl
                          border
                          border-emerald-400/15
                          bg-emerald-400/[0.05]
                          px-3
                          py-2.5
                          text-[10px]
                          text-emerald-300
                        "
                      >
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        {success}
                      </motion.div>
                    )}

                  </AnimatePresence>

                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={loading || googleLoading}
                    className="
                      group
                      relative
                      flex
                      h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      overflow-hidden
                      rounded-xl
                      bg-gradient-to-r
                      from-cyan-400
                      via-cyan-500
                      to-blue-600
                      text-sm
                      font-semibold
                      text-slate-950
                      shadow-[0_15px_40px_rgba(34,211,238,0.16)]
                      transition
                      hover:scale-[1.01]
                      hover:shadow-[0_18px_50px_rgba(34,211,238,0.24)]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >

                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        {mode === "login"
                          ? "Enter SmartDELHI"
                          : "Create Account"}

                        <ArrowRight
                          className="
                            h-4
                            w-4
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />
                      </>
                    )}

                  </button>

                </form>

                {/* DIVIDER */}

                <div className="my-6 flex items-center gap-3">

                  <div className="h-px flex-1 bg-white/[0.06]" />

                  <span className="text-[9px] uppercase tracking-[0.2em] text-slate-700">
                    or continue with
                  </span>

                  <div className="h-px flex-1 bg-white/[0.06]" />

                </div>

                {/* GOOGLE */}

                {isAdmin && !adminPassword && (
                  <p className="mb-3 text-center text-[9px] text-amber-400/70">
                    Enter the admin security password before using Google verification.
                  </p>
                )}

                <div
                  ref={googleButtonRef}
                  className={`
                    flex
                    min-h-[42px]
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-xl
                    ${isAdmin && !adminPassword
                      ? "pointer-events-none opacity-40"
                      : ""
                    }
                  `}
                />

                {googleLoading && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-cyan-300">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying Google account...
                  </div>
                )}

                {/* FOOTER */}

                <div className="mt-7 flex items-center justify-center gap-2 text-[9px] text-slate-700">

                  <LockKeyhole className="h-3 w-3" />

                  Secure SmartDELHI authentication

                </div>

              </div>

            </div>

          </motion.section>

        </div>

      </div>

    </main>
  );
}

/* =========================================================
   INPUT COMPONENT
========================================================= */

function Input({
  icon,
  placeholder,
  value,
  onChange,
  type = "text",
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="relative">

      <div
        className="
          pointer-events-none
          absolute
          left-4
          top-1/2
          -translate-y-1/2
          text-slate-600
        "
      >
        {icon}
      </div>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="
          h-12
          w-full
          rounded-xl
          border
          border-white/[0.07]
          bg-white/[0.025]
          pl-11
          pr-4
          text-xs
          text-white
          outline-none
          transition-all
          placeholder:text-slate-700
          focus:border-cyan-400/30
          focus:bg-cyan-400/[0.025]
          focus:shadow-[0_0_0_3px_rgba(34,211,238,0.04)]
        "
      />

    </div>
  );
}