import { redirect } from "next/navigation";
import Link from "next/link";
import SmartDelhiAI from "@/components/citizen/SmartDelhiAI";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LogoutButton from "@/components/LogoutButton";
import CitizenStats from "@/components/citizen/CitizenStats";
import CitizenHeatmapBlock from "@/components/citizen/CitizenHeatmapBlock";

import {
  FileText,
  PlusCircle,
  MapPin,
  Bell,
  User,
  ShieldCheck,
  Layers,
  ArrowRight,
  Activity,
  ChevronRight,
  Sparkles,
  Radio,
} from "lucide-react";

export default async function CitizenDashboardPage() {
  const user = await getSessionUser();

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  if (!user) {
    redirect("/auth");
  }

  // =========================================================
  // ROLE ACCESS
  // =========================================================

  if (user.role !== "CITIZEN") {
    if (user.role === "ADMIN") {
      redirect("/dashboard/admin");
    }

    if (user.role === "WORKER") {
      redirect("/dashboard/worker");
    }

    redirect("/auth");
  }

  // =========================================================
  // DATABASE
  // =========================================================

  const [
    totalComplaints,
    pendingCount,
    inProgressCount,
    resolvedCount,
    recentComplaints,
  ] = await Promise.all([
    prisma.complaint.count({
      where: {
        userId: user.id,
      },
    }),

    prisma.complaint.count({
      where: {
        userId: user.id,
        status: "PENDING",
      },
    }),

    prisma.complaint.count({
      where: {
        userId: user.id,
        status: "IN_PROGRESS",
      },
    }),

    prisma.complaint.count({
      where: {
        userId: user.id,
        status: "RESOLVED",
      },
    }),

    prisma.complaint.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    }),
  ]);

  // =========================================================
  // STATUS COLORS
  // =========================================================

  const statusColors: Record<string, string> = {
    PENDING:
      "bg-amber-400/10 border-amber-400/20 text-amber-300",

    IN_PROGRESS:
      "bg-blue-400/10 border-blue-400/20 text-blue-300",

    RESOLVED:
      "bg-emerald-400/10 border-emerald-400/20 text-emerald-300",

    REJECTED:
      "bg-rose-400/10 border-rose-400/20 text-rose-300",
  };

  // =========================================================
  // RESOLUTION PERCENTAGE
  // =========================================================

  const resolutionRate =
    totalComplaints > 0
      ? Math.round(
          (resolvedCount / totalComplaints) * 100
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col overflow-hidden">

      {/* =====================================================
          GLOBAL BACKGROUND
      ===================================================== */}

      <div className="fixed inset-0 pointer-events-none overflow-hidden">

        {/* Main blue glow */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[140px] animate-pulse" />

        {/* Purple glow */}
        <div
          className="absolute top-[35%] -right-48 w-[550px] h-[550px] rounded-full bg-blue-600/10 blur-[150px] animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Bottom glow */}
        <div
          className="absolute -bottom-48 left-[35%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[160px] animate-pulse"
          style={{ animationDelay: "3s" }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#020617]/75 backdrop-blur-2xl">

        <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/dashboard/citizen"
            className="flex items-center gap-3 group"
          >

            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-cyan-400/20 bg-black/40 shadow-lg shadow-cyan-500/10">

              <video
                src="/videos/logo-animation.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/10 transition" />
            </div>

            <div>
              <div className="font-black text-xl tracking-tight">
                Smart
                <span className="text-cyan-400">
                  DELHI
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.8)]" />

                <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                  Citizen Intelligence Portal
                </p>
              </div>
            </div>

          </Link>

          {/* HEADER RIGHT */}

          <div className="flex items-center gap-3">

            {/* Live status */}

            <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04]">

              <Radio className="w-3.5 h-3.5 text-emerald-400" />

              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-300">
                City Systems Online
              </span>

            </div>

            {/* Notifications */}

            <Link
              href="/dashboard/citizen/notifications"
              className="relative p-2.5 rounded-xl border border-white/[0.08] bg-white/[0.035] text-slate-400 hover:text-white hover:border-cyan-400/30 hover:bg-cyan-400/[0.05] transition"
              aria-label="Notifications"
            >

              <Bell className="w-4 h-4" />

              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,.9)]" />

            </Link>

            {/* USER */}

            <div className="hidden sm:flex items-center gap-3 px-3 py-2 rounded-2xl border border-white/[0.08] bg-white/[0.035]">

              <div className="relative">

                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-black shadow-lg shadow-cyan-500/20">

                  {user.name?.charAt(0).toUpperCase()}

                </div>

                <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#020617]" />

              </div>

              <div className="text-left">

                <p className="text-xs font-bold text-white">
                  {user.name}
                </p>

                <p className="text-[9px] text-slate-500">
                  {user.ward
                    ? `Ward ${user.ward}`
                    : "Citizen"}
                </p>

              </div>

            </div>

            {/* LOGOUT */}

            <form
              action="/api/auth/logout"
              method="POST"
            >
              <LogoutButton />
            </form>

          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <div className="relative z-10 flex-1 max-w-[1500px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="lg:col-span-3">

            <div className="sticky top-[95px]">

              <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl p-3 shadow-2xl">

                {/* Sidebar heading */}

                <div className="px-4 pt-3 pb-4">

                  <div className="flex items-center justify-between">

                    <p className="text-[9px] uppercase font-black text-slate-200 tracking-[0.2em]">
                      Navigation
                    </p>

                    <Layers className="w-3.5 h-3.5 text-slate-600" />

                  </div>

                </div>

                <nav className="space-y-1">

                  {/* Overview */}

                  <Link
                    href="/dashboard/citizen"
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border border-cyan-400/20 text-cyan-300 shadow-lg shadow-cyan-500/[0.04]"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                        <Activity className="w-4 h-4 text-cyan-400" />
                      </div>

                      <span className="text-xs font-bold">
                        Overview
                      </span>

                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />

                  </Link>

                  {/* My Complaints */}

                  <Link
                    href="/dashboard/citizen/complaints"
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-xl bg-white/[0.035] flex items-center justify-center group-hover:bg-cyan-400/10">
                        <FileText className="w-4 h-4 group-hover:text-cyan-400" />
                      </div>

                      <span className="text-xs font-semibold">
                        My Complaints
                      </span>

                    </div>

                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />

                  </Link>

                  {/* Submit */}

                  <Link
                    href="/dashboard/citizen/complaints/new"
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-xl bg-white/[0.035] flex items-center justify-center">
                        <PlusCircle className="w-4 h-4 group-hover:text-cyan-400" />
                      </div>

                      <span className="text-xs font-semibold">
                        Submit Complaint
                      </span>

                    </div>

                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />

                  </Link>

                  {/* Notifications */}

                  <Link
                    href="/dashboard/citizen/notifications"
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-xl bg-white/[0.035] flex items-center justify-center">
                        <Bell className="w-4 h-4 group-hover:text-cyan-400" />
                      </div>

                      <span className="text-xs font-semibold">
                        Notifications
                      </span>

                    </div>

                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />

                  </Link>

                  {/* Heatmap */}

                  <Link
                    href="/dashboard/citizen/heatmap"
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-xl bg-white/[0.035] flex items-center justify-center">
                        <MapPin className="w-4 h-4 group-hover:text-cyan-400" />
                      </div>

                      <span className="text-xs font-semibold">
                        Civic Heatmap
                      </span>

                    </div>

                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />

                  </Link>

                  {/* Profile */}

                  <Link
                    href="/dashboard/citizen/profile"
                    className="group flex items-center justify-between px-4 py-3 rounded-2xl text-slate-400 hover:text-white hover:bg-white/[0.04] transition"
                  >

                    <div className="flex items-center gap-3">

                      <div className="w-8 h-8 rounded-xl bg-white/[0.035] flex items-center justify-center">
                        <User className="w-4 h-4 group-hover:text-cyan-400" />
                      </div>

                      <span className="text-xs font-semibold">
                        My Profile
                      </span>

                    </div>

                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />

                  </Link>

                </nav>

                {/* Sidebar bottom */}

                <div className="mt-4 p-4 rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.06] to-blue-500/[0.02]">

                  <div className="flex items-center gap-2 mb-2">

                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />

                    <span className="text-[9px] font-black uppercase tracking-wider text-cyan-300">
                      SmartDELHI AI
                    </span>

                  </div>

                  <p className="text-[10px] leading-relaxed text-slate-500">
                    Intelligent civic assistance and real-time city insights are available through your portal.
                  </p>

                </div>

              </div>

            </div>

          </aside>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main className="lg:col-span-9 space-y-7">

            {/* =================================================
                PREMIUM WELCOME HERO
            ================================================= */}

            <section className="group relative min-h-[330px] rounded-[32px] overflow-hidden border border-cyan-400/20 shadow-2xl shadow-cyan-950/20">

              {/* USER BACKGROUND IMAGE */}

              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-[1.025]"
                style={{
                  backgroundImage:
                    "url('/images/citizen-dashboard-bg.jpg')",
                }}
              />

              {/* Dark cinematic overlay */}

              <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/95 via-[#020617]/75 to-[#020617]/40" />

              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/20" />

              {/* Animated cyan orb */}

              <div
                className="absolute -right-24 -top-28 w-80 h-80 rounded-full bg-cyan-400/20 blur-[90px] animate-pulse"
              />

              {/* Animated blue orb */}

              <div
                className="absolute right-[20%] bottom-[-150px] w-96 h-96 rounded-full bg-blue-600/20 blur-[100px] animate-pulse"
                style={{
                  animationDelay: "1.2s",
                }}
              />

              {/* Animated small light */}

              <div
                className="absolute left-[45%] top-[20%] w-32 h-32 rounded-full bg-cyan-300/10 blur-[60px] animate-pulse"
                style={{
                  animationDelay: "2s",
                }}
              />

              {/* Grid */}

              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(34,211,238,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,.35) 1px, transparent 1px)",
                  backgroundSize: "45px 45px",
                }}
              />

              {/* Moving scan line */}

              <div
                className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"
                style={{
                  top: "35%",
                }}
              />

              {/* HERO CONTENT */}

              <div className="relative z-10 min-h-[330px] p-7 sm:p-10 flex flex-col justify-between">

                <div className="flex flex-wrap items-center gap-2">

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 backdrop-blur-md">

                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                    </span>

                    <span className="text-[10px] uppercase tracking-[0.16em] font-black text-cyan-200">
                      Verified Citizen Portal
                    </span>

                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 backdrop-blur-md text-[10px] text-slate-300">

                    <ShieldCheck className="w-3 h-3 text-emerald-400" />

                    Secure Session

                  </div>

                </div>

                <div className="max-w-3xl mt-8">

                  <p className="text-[10px] uppercase tracking-[0.28em] text-cyan-300/80 font-black">
                    Civic Intelligence • Delhi
                  </p>

                  <h1 className="mt-3 text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">

                    Welcome back,{" "}

                    <span className="bg-gradient-to-r from-white via-white to-cyan-300 bg-clip-text text-transparent">
                      {user.name}
                    </span>

                  </h1>

                  <p className="mt-5 text-sm sm:text-base text-slate-300/80 leading-relaxed max-w-2xl">

                    Track your civic complaints, monitor real-time ward
                    activity, and stay connected with Delhi's intelligent
                    civic response network.

                  </p>

                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">

                  <Link
                    href="/dashboard/citizen/complaints/new"
                    className="group/btn inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-600 text-white text-xs sm:text-sm font-black shadow-xl shadow-cyan-500/20 hover:shadow-cyan-400/30 hover:scale-[1.02] transition-all"
                  >

                    <PlusCircle className="w-4 h-4" />

                    Report a Civic Issue

                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition" />

                  </Link>

                  

                </div>

              </div>

            </section>

            {/* =================================================
                PERSONAL STATS
            ================================================= */}

            <section>

              <div className="flex items-end justify-between mb-4">

                <div>

                  <p className="text-[9px] uppercase tracking-[0.22em] text-cyan-400 font-black">
                    Your Civic Activity
                  </p>

                  <h2 className="mt-1 text-lg font-black text-white">
                    Complaint Intelligence
                  </h2>

                </div>

                <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500">

                  <Activity className="w-3.5 h-3.5 text-cyan-400" />

                  Live account metrics

                </div>

              </div>

              <CitizenStats
                totalComplaints={totalComplaints}
                pendingCount={pendingCount}
                inProgressCount={inProgressCount}
                resolvedCount={resolvedCount}
              />

            </section>

            {/* =================================================
                RESOLUTION INSIGHT
            ================================================= */}

            <section className="relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl p-5 sm:p-6">

              <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-400/[0.04] rounded-full blur-3xl" />

              <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                <div>

                  <p className="text-[9px] uppercase tracking-[0.2em] font-black text-slate-500">
                    Resolution Performance
                  </p>

                  <p className="mt-2 text-sm text-slate-300">
                    Your civic issue resolution rate
                  </p>

                </div>

                <div className="flex items-center gap-5">

                  <div className="w-44 h-2 rounded-full bg-white/[0.06] overflow-hidden">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-1000"
                      style={{
                        width: `${resolutionRate}%`,
                      }}
                    />

                  </div>

                  <span className="text-2xl font-black text-white">
                    {resolutionRate}%
                  </span>

                </div>

              </div>

            </section>

            {/* =================================================
                RECENT COMPLAINTS
            ================================================= */}

            <section className="relative overflow-hidden rounded-[30px] border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl p-5 sm:p-7 shadow-2xl">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

                <div>

                  <div className="flex items-center gap-2">

                    <div className="w-8 h-8 rounded-xl bg-cyan-400/10 border border-cyan-400/10 flex items-center justify-center">

                      <FileText className="w-4 h-4 text-cyan-400" />

                    </div>

                    <h2 className="text-base font-black tracking-tight">
                      Recent Complaints
                    </h2>

                  </div>

                  <p className="text-[11px] text-slate-500 mt-2">
                    Latest civic issues submitted from your account
                  </p>

                </div>

                <Link
                  href="/dashboard/citizen/complaints"
                  className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-black text-cyan-400 hover:text-cyan-300 transition"
                >
                  View All
                  <ArrowRight className="w-3 h-3" />
                </Link>

              </div>

              {recentComplaints.length === 0 ? (

                <div className="text-center py-14 border border-dashed border-white/10 rounded-2xl bg-black/10">

                  <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.035] border border-white/10 flex items-center justify-center">

                    <Layers className="w-6 h-6 text-slate-600" />

                  </div>

                  <p className="text-sm font-bold text-slate-300 mt-4">
                    No complaints filed yet
                  </p>

                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
                    Report road damage, garbage accumulation,
                    street-light failures or other civic issues.
                  </p>

                  <Link
                    href="/dashboard/citizen/complaints/new"
                    className="inline-flex items-center gap-2 mt-5 bg-cyan-400/10 hover:bg-cyan-400/15 border border-cyan-400/20 text-cyan-300 text-xs font-bold px-4 py-2.5 rounded-xl transition"
                  >

                    <PlusCircle className="w-3.5 h-3.5" />

                    Report First Issue

                  </Link>

                </div>

              ) : (

                <div className="space-y-3">

                  {recentComplaints.map((complaint) => (

                    <div
                      key={complaint.id}
                      className="group relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white/[0.025] border border-white/[0.06] hover:border-cyan-400/20 hover:bg-cyan-400/[0.025] transition-all duration-300"
                    >

                      {/* Hover glow */}

                      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent opacity-0 group-hover:opacity-100 transition" />

                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="font-bold text-sm text-white truncate max-w-[280px]">
                            {complaint.title}
                          </span>

                          <span
                            className={`text-[9px] uppercase font-black tracking-wider px-2.5 py-1 rounded-full border ${
                              statusColors[
                                complaint.status
                              ] ||
                              "bg-slate-500/10 text-slate-300 border-slate-500/20"
                            }`}
                          >
                            {complaint.status.replace(
                              "_",
                              " "
                            )}
                          </span>

                        </div>

                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-1">
                          {complaint.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 mt-2.5">

                          <span>
                            Category:{" "}
                            <strong className="text-slate-400">
                              {complaint.category}
                            </strong>
                          </span>

                          <span>•</span>

                          <span className="inline-flex items-center gap-1">

                            <MapPin className="w-3 h-3 text-cyan-500" />

                            Ward{" "}
                            {complaint.ward}

                          </span>

                          <span>•</span>

                          <span>
                            {new Date(
                              complaint.createdAt
                            ).toLocaleDateString()}
                          </span>

                        </div>

                      </div>

                      <Link
                        href={`/dashboard/citizen/complaints/${complaint.id}`}
                        className="flex-shrink-0 inline-flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider font-black text-cyan-400 hover:text-white border border-cyan-400/15 hover:border-cyan-400/30 hover:bg-cyan-400/10 px-4 py-2.5 rounded-xl transition"
                      >

                        View Details

                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />

                      </Link>

                    </div>

                  ))}

                </div>

              )}

            </section>

            {/* =================================================
                HEATMAP
            ================================================= */}

            <CitizenHeatmapBlock />

          </main>

        </div>

      </div>

      {/* =====================================================
          AI ASSISTANT
      ===================================================== */}

      <SmartDelhiAI />

    </div>
  );
}