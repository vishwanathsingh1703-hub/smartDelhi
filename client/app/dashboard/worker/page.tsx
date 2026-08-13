import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BriefcaseBusiness,
  ClipboardList,
  Clock,
  Clock3,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Star,
  IndianRupee,
  TrendingUp,
  Users,
  CalendarCheck2,
  Award,
  CircleGauge,
  UserCheck,
  Activity,
} from 'lucide-react';

import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/* =========================================================
   HELPERS
========================================================= */

function CircularProgress({
  value,
  label,
  subLabel,
  color = '#22d3ee',
  size = 150,
}: {
  value: number;
  label: string;
  subLabel?: string;
  color?: string;
  size?: number;
}) {
  const safeValue = Math.max(0, Math.min(100, value));

  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (safeValue / 100) * circumference;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />

        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white">
          {Math.round(safeValue)}%
        </span>

        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          {label}
        </span>

        {subLabel && (
          <span className="mt-1 text-[9px] text-slate-600">
            {subLabel}
          </span>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.055]">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full ${accent} opacity-[0.08] blur-3xl`}
      />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            {title}
          </p>

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent} bg-opacity-10`}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>

        <p className="mt-4 text-3xl font-black tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default async function WorkerDashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect('/auth');
  }

  if (user.role !== 'WORKER') {
    if (user.role === 'CITIZEN') {
      redirect('/dashboard/citizen');
    }

    if (user.role === 'ADMIN') {
      redirect('/dashboard/admin');
    }

    redirect('/auth');
  }

  /* =======================================================
     DATABASE DATA
  ======================================================= */

  const [
    totalWardComplaints,
    pendingWardComplaints,
    inProgressWardComplaints,
    resolvedWardComplaints,
    assignedComplaints,
    recentWardComplaints,
  ] = await Promise.all([
    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
      },
    }),

    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'PENDING',
      },
    }),

    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'IN_PROGRESS',
      },
    }),

    prisma.complaint.count({
      where: {
        ward: user.ward || undefined,
        status: 'RESOLVED',
      },
    }),

    prisma.complaint.findMany({
      where: {
        assignedWorkerId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    }),

    prisma.complaint.findMany({
      where: {
        ward: user.ward || undefined,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 8,
    }),
  ]);

  /* =======================================================
     PERSONAL WORKER ANALYTICS
  ======================================================= */

  const assignedCount = assignedComplaints.filter(
    (c) =>
      c.status === 'Assigned' ||
      c.status === 'PENDING'
  ).length;

  const inProgressCount = assignedComplaints.filter(
    (c) =>
      c.status === 'InProgress' ||
      c.status === 'IN_PROGRESS'
  ).length;

  const completedCount = assignedComplaints.filter(
    (c) => c.workCompletedAt !== null
  ).length;

  const totalPersonalTasks =
    assignedComplaints.length;

  const completionRate =
    totalPersonalTasks > 0
      ? Math.round(
          (completedCount / totalPersonalTasks) * 100
        )
      : 0;

  const pendingPersonalTasks = Math.max(
    0,
    totalPersonalTasks - completedCount
  );

  /* =======================================================
     CURRENT MONTH SALARY
     
     Replace these with actual salary fields/API later.
  ======================================================= */

  const monthlySalary = 28500;

  const salaryPaid = true;

  /* =======================================================
     CITIZEN REVIEW / RATING
     
     Demo fallback until Review model is connected.
  ======================================================= */

  const citizenRating = 4.7;

  const totalReviews = Math.max(
    12,
    completedCount * 3
  );

  const ratingPercentage = Math.round(
    (citizenRating / 5) * 100
  );

  /* =======================================================
     WORKER PERFORMANCE
  ======================================================= */

  const efficiencyScore = Math.round(
    completionRate * 0.65 +
      ratingPercentage * 0.35
  );

  const wardResolutionRate =
    totalWardComplaints > 0
      ? Math.round(
          (resolvedWardComplaints /
            totalWardComplaints) *
            100
        )
      : 0;

  /* =======================================================
     MONTHLY TASK GRAPH DATA
     
     Current assigned tasks are represented by
     this worker's assignment data.
  ======================================================= */

  const monthlyAssigned = totalPersonalTasks;

  const monthlyCompleted = completedCount;

  const monthlyPending =
    Math.max(
      0,
      monthlyAssigned - monthlyCompleted
    );

  /* =======================================================
     RETURN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden">

      {/* Ambient background */}

      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[140px]" />
        <div className="absolute right-[-10%] top-[20%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.05] blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[140px]" />
      </div>

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#020617]/80 backdrop-blur-2xl">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-blue-600/30 to-cyan-400/20 shadow-lg shadow-cyan-500/10">

              <ShieldCheck className="h-5 w-5 text-cyan-300" />

            </div>

            <div>
              <div className="text-lg font-black tracking-wide">
                Smart<span className="text-cyan-400">DELHI</span>
              </div>

              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Worker Command Center
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <div className="hidden text-right sm:block">
              <p className="text-sm font-bold text-white">
                {user.name}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                {user.ward
                  ? `Ward ${user.ward}`
                  : 'MCD Field Worker'}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm font-black text-cyan-300">
              {user.name
                ?.charAt(0)
                ?.toUpperCase()}
            </div>

            <form
              action="/api/auth/logout"
              method="POST"
            >
              <button
                type="submit"
                className="group flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/[0.06] px-3 py-2 text-xs font-semibold text-rose-300 transition hover:border-rose-400/40 hover:bg-rose-500/10"
              >
                <LogOut className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
                Logout
              </button>
            </form>

          </div>

        </div>

      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">

        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-gradient-to-br from-cyan-500/[0.08] via-white/[0.025] to-blue-500/[0.05] p-6 shadow-2xl sm:p-8">

          <div className="absolute right-[-100px] top-[-100px] h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-[90px]" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-300">
                <Activity className="h-3.5 w-3.5" />
                Live Worker Performance
              </div>

              <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-5xl">
                Welcome back,{' '}
                <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  {user.name}
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                Your personal SmartDELHI performance dashboard.
                Track assigned civic tasks, completion rate,
                citizen satisfaction, salary and ward-level impact
                from one place.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">

                <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400" />
                  Worker Active
                </span>

                <span className="inline-flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                  {user.ward
                    ? `Ward ${user.ward}`
                    : 'Delhi MCD'}
                </span>

              </div>

            </div>

            {/* PERFORMANCE RING */}

            <div className="flex justify-center lg:justify-end">

              <div className="rounded-[2rem] border border-white/[0.07] bg-black/20 p-5 backdrop-blur-xl">

                <CircularProgress
                  value={efficiencyScore}
                  label="Performance"
                  subLabel="Overall score"
                  color="#22d3ee"
                  size={170}
                />

              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            PERSONAL PERFORMANCE
        ================================================= */}

        <section>

          <div className="mb-5 flex items-end justify-between">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
                Personal Analytics
              </p>

              <h2 className="mt-1 text-xl font-black">
                Your Work Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Performance metrics specifically for you.
              </p>
            </div>

            <span className="hidden rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[10px] text-slate-500 sm:block">
              Current Month
            </span>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <MetricCard
              title="Assigned Tasks"
              value={monthlyAssigned}
              description="Tasks assigned to you"
              icon={ClipboardList}
              accent="bg-cyan-400"
            />

            <MetricCard
              title="Completed"
              value={monthlyCompleted}
              description="Successfully completed"
              icon={CheckCircle2}
              accent="bg-emerald-400"
            />

            <MetricCard
              title="In Progress"
              value={inProgressCount}
              description="Currently being handled"
              icon={Clock3}
              accent="bg-blue-400"
            />

            <MetricCard
              title="Pending"
              value={monthlyPending}
              description="Tasks awaiting completion"
              icon={AlertCircle}
              accent="bg-amber-400"
            />

          </div>

        </section>

        {/* =================================================
            TASK CIRCULAR ANALYTICS
        ================================================= */}

        <section className="grid gap-5 lg:grid-cols-3">

          {/* COMPLETION */}

          <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl">

            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Task Completion
              </p>

              <h3 className="mt-1 text-lg font-black">
                Monthly Work Ratio
              </h3>
            </div>

            <div className="flex justify-center">

              <CircularProgress
                value={completionRate}
                label="Completed"
                subLabel={`${completedCount}/${totalPersonalTasks} tasks`}
                color="#34d399"
                size={170}
              />

            </div>

            <div className="mt-6 grid grid-cols-3 gap-2 text-center">

              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-lg font-black text-cyan-300">
                  {monthlyAssigned}
                </p>
                <p className="text-[9px] uppercase text-slate-600">
                  Assigned
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-lg font-black text-emerald-300">
                  {monthlyCompleted}
                </p>
                <p className="text-[9px] uppercase text-slate-600">
                  Done
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-lg font-black text-amber-300">
                  {monthlyPending}
                </p>
                <p className="text-[9px] uppercase text-slate-600">
                  Pending
                </p>
              </div>

            </div>

          </div>

          {/* CITIZEN REVIEW */}

          <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl">

            <div className="mb-5">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Citizen Feedback
              </p>

              <h3 className="mt-1 text-lg font-black">
                Your Citizen Rating
              </h3>
            </div>

            <div className="flex justify-center">

              <CircularProgress
                value={ratingPercentage}
                label="Rating"
                subLabel={`${citizenRating}/5 stars`}
                color="#f59e0b"
                size={170}
              />

            </div>

            <div className="mt-6 text-center">

              <div className="flex justify-center gap-1">

                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <=
                        Math.round(
                          citizenRating
                        )
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-700'
                      }`}
                    />
                  )
                )}

              </div>

              <p className="mt-3 text-sm font-bold text-white">
                {citizenRating}/5
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Based on {totalReviews} citizen reviews
              </p>

            </div>

          </div>

          {/* SALARY */}

          <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl">

            <div className="mb-5 flex items-center justify-between">

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                  Compensation
                </p>

                <h3 className="mt-1 text-lg font-black">
                  Current Month Salary
                </h3>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-400/10">
                <IndianRupee className="h-5 w-5 text-emerald-300" />
              </div>

            </div>

            <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-5">

              <p className="text-[10px] uppercase tracking-widest text-slate-500">
                August 2026
              </p>

              <p className="mt-2 text-4xl font-black text-white">
                ₹{monthlySalary.toLocaleString(
                  'en-IN'
                )}
              </p>

              <div className="mt-4 flex items-center gap-2">

                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                <span className="text-xs font-semibold text-emerald-300">
                  {salaryPaid
                    ? 'Salary Processed'
                    : 'Processing'}
                </span>

              </div>

            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">

              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-600">
                  Worker
                </p>
                <p className="mt-1 truncate text-xs font-semibold text-slate-300">
                  {user.name}
                </p>
              </div>

              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[9px] uppercase tracking-wider text-slate-600">
                  Department
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-300">
                  MCD
                </p>
              </div>

            </div>

          </div>

        </section>

        {/* =================================================
            QUICK ACTION
        ================================================= */}

        <Link
          href="/dashboard/worker/assigned"
          className="group relative block overflow-hidden rounded-[2rem] border border-cyan-400/20 bg-gradient-to-r from-cyan-500/[0.08] via-blue-500/[0.04] to-transparent p-6 transition hover:border-cyan-400/40 hover:bg-cyan-500/[0.1]"
        >

          <div className="absolute right-[-50px] top-[-80px] h-56 w-56 rounded-full bg-cyan-400/[0.08] blur-3xl" />

          <div className="relative flex items-center justify-between gap-5">

            <div className="flex items-center gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
                <BriefcaseBusiness className="h-6 w-6 text-cyan-300" />
              </div>

              <div>

                <h3 className="text-lg font-black">
                  View & Manage Assigned Complaints
                </h3>

                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                  Accept jobs, verify complaint locations,
                  update work status and mark completed tasks.
                </p>

              </div>

            </div>

            <ArrowRight className="h-5 w-5 text-cyan-300 transition group-hover:translate-x-1" />

          </div>

        </Link>

        {/* =================================================
            WARD OVERVIEW
        ================================================= */}

        <section>

          <div className="mb-5">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-cyan-400">
              Ward Intelligence
            </p>

            <h2 className="mt-1 text-xl font-black">
              Ward {user.ward || 'MCD'} Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Civic performance across your assigned area.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <MetricCard
              title="Total Complaints"
              value={totalWardComplaints}
              description="Reported in your ward"
              icon={ClipboardList}
              accent="bg-cyan-400"
            />

            <MetricCard
              title="Pending"
              value={pendingWardComplaints}
              description="Awaiting action"
              icon={AlertCircle}
              accent="bg-amber-400"
            />

            <MetricCard
              title="In Progress"
              value={inProgressWardComplaints}
              description="Currently being handled"
              icon={Clock}
              accent="bg-blue-400"
            />

            <MetricCard
              title="Resolved"
              value={resolvedWardComplaints}
              description={`${wardResolutionRate}% ward resolution rate`}
              icon={CheckCircle2}
              accent="bg-emerald-400"
            />

          </div>

        </section>

        {/* =================================================
            PERFORMANCE INSIGHTS
        ================================================= */}

        <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">

          <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl">

            <div className="mb-6">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                Worker Profile
              </p>

              <h2 className="mt-1 text-xl font-black">
                About Your Performance
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-400/10">
                  <Award className="h-5 w-5 text-violet-300" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Efficiency
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {efficiencyScore}%
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-400/10">
                  <TrendingUp className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Completion
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {completionRate}%
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400/10">
                  <Star className="h-5 w-5 text-amber-300" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Citizen Rating
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {citizenRating}/5
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-400/10">
                  <UserCheck className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                    Completed Work
                  </p>

                  <p className="mt-1 text-xl font-black">
                    {completedCount}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* WARD RESOLUTION RING */}

          <div className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl">

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
              Ward Health
            </p>

            <h2 className="mt-1 text-xl font-black">
              Resolution Rate
            </h2>

            <div className="mt-5 flex justify-center">

              <CircularProgress
                value={wardResolutionRate}
                label="Resolved"
                subLabel={`${resolvedWardComplaints}/${totalWardComplaints}`}
                color="#34d399"
                size={160}
              />

            </div>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
              <CircleGauge className="h-4 w-4 text-emerald-400" />
              Overall ward resolution performance
            </div>

          </div>

        </section>

        {/* =================================================
            RECENT COMPLAINTS
        ================================================= */}

        <section className="rounded-[2rem] border border-white/[0.07] bg-white/[0.035] p-6 shadow-2xl backdrop-blur-xl">

          <div className="mb-6 flex items-center justify-between gap-4">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-400">
                Live Activity
              </p>

              <h2 className="mt-1 text-xl font-black">
                Recent Ward Complaints
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest civic issues reported in your ward.
              </p>
            </div>

            <Link
              href="/dashboard/worker/assigned"
              className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 transition hover:text-cyan-200"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

          </div>

          {recentWardComplaints.length === 0 ? (

            <div className="rounded-2xl border border-dashed border-white/10 py-14 text-center">

              <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-700" />

              <p className="text-sm font-semibold text-slate-300">
                No complaints found
              </p>

              <p className="mt-1 text-xs text-slate-600">
                There are currently no complaints in your ward.
              </p>

            </div>

          ) : (

            <div className="space-y-3">

              {recentWardComplaints.map(
                (complaint) => (

                  <div
                    key={complaint.id}
                    className="group flex flex-col gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-4 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.025] sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-sm font-bold text-white">
                          {complaint.title}
                        </h3>

                        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-2 py-1 text-[9px] font-black uppercase text-cyan-300">
                          {complaint.status.replace(
                            '_',
                            ' '
                          )}
                        </span>

                        <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.06] px-2 py-1 text-[9px] font-black uppercase text-amber-300">
                          {complaint.priority}
                        </span>

                      </div>

                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {complaint.description ||
                          'No description provided.'}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-600">

                        <span>
                          Category:{' '}
                          <strong className="text-slate-400">
                            {complaint.category}
                          </strong>
                        </span>

                        <span>•</span>

                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-cyan-400" />

                          {complaint.latitude !==
                            null &&
                          complaint.longitude !==
                            null
                            ? 'Location Available'
                            : 'No Coordinates'}
                        </span>

                      </div>

                    </div>

                    <Link
                      href="/dashboard/worker/assigned"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] px-4 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400/10"
                    >
                      Manage
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </Link>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </main>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 sm:px-6 lg:px-8">

        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.05] pt-6 text-[10px] text-slate-600 sm:flex-row">

          <p>
            SmartDELHI • Worker Command Center
          </p>

          <p>
            Civic Intelligence & Field Operations
          </p>

        </div>

      </footer>

    </div>
  );
}