"use client";

import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  HeartPulse,
  Leaf,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useMemo, useState } from "react";

type YearKey = "2023-24" | "2024-25" | "2025-26";

const budgetHistory = [
  {
    year: "2023-24",
    mcdBudget: 16203,
    delhiAllocation: 8241,
  },
  {
    year: "2024-25",
    mcdBudget: 16683,
    delhiAllocation: 8423,
  },
  {
    year: "2025-26",
    mcdBudget: 17003,
    delhiAllocation: 10537,
  },
];

const departments = [
  {
    name: "Sanitation",
    value: 4907.11,
    percentage: 28.86,
    icon: Trash2,
    description: "Waste management, cleanliness and civic sanitation",
  },
  {
    name: "General Administration",
    value: 3542.29,
    percentage: 20.83,
    icon: Building2,
    description: "Administration, salaries and establishment expenses",
  },
  {
    name: "Public Works & Street Lighting",
    value: 2899,
    percentage: 17.05,
    icon: MapPin,
    description: "Road infrastructure, engineering and street lighting",
  },
  {
    name: "Healthcare",
    value: 1833.51,
    percentage: 10.78,
    icon: HeartPulse,
    description: "Public health and medical relief",
  },
  {
    name: "Education",
    value: 1693.73,
    percentage: 9.96,
    icon: FileText,
    description: "MCD schools, education infrastructure and learning",
  },
  {
    name: "Horticulture",
    value: 393.26,
    percentage: 2.31,
    icon: Leaf,
    description: "Parks, plantations and green-space maintenance",
  },
  {
    name: "Veterinary Services",
    value: 108.43,
    percentage: 0.64,
    icon: ShieldCheck,
    description: "Animal welfare and veterinary services",
  },
];

const sources = [
  {
    title: "Delhi Government Budget",
    description: "MCD financial assistance and state budget allocations",
    url: "https://finance.delhi.gov.in/budget-glance",
  },
  {
    title: "MCD Budget Archive",
    description: "Municipal Corporation of Delhi budget and archive records",
    url: "https://mcdonline.nic.in/portal/archiveData",
  },
];

function formatCrore(value: number) {
  return `₹${value.toLocaleString("en-IN")} Cr`;
}

function formatShort(value: number) {
  return `₹${value.toLocaleString("en-IN")} Cr`;
}

function BudgetChart() {
  const maxValue = Math.max(
    ...budgetHistory.flatMap((item) => [
      item.mcdBudget,
      item.delhiAllocation,
    ])
  );

  return (
    <div className="mt-8">
      <div className="relative h-[310px] w-full overflow-hidden rounded-3xl border border-white/[0.07] bg-[#050c16]/80 p-5">
        {/* subtle grid */}
        <div className="pointer-events-none absolute inset-0 opacity-30">
          {[0, 1, 2, 3, 4].map((line) => (
            <div
              key={line}
              className="absolute left-5 right-5 border-t border-white/[0.07]"
              style={{
                top: `${18 + line * 18}%`,
              }}
            />
          ))}
        </div>

        <div className="absolute left-4 top-4 text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
          ₹ Crore
        </div>

        <div className="relative z-10 flex h-full items-end justify-around gap-5 px-4 pb-8 pt-10">
          {budgetHistory.map((item, index) => {
            const mcdHeight = (item.mcdBudget / maxValue) * 185;
            const govtHeight =
              (item.delhiAllocation / maxValue) * 185;

            return (
              <div
                key={item.year}
                className="flex h-full flex-1 items-end justify-center gap-2"
              >
                <div className="group relative flex items-end gap-2">
                  {/* MCD total */}
                  <div className="relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: mcdHeight }}
                      transition={{
                        duration: 1,
                        delay: index * 0.15,
                        ease: "easeOut",
                      }}
                      className="w-9 rounded-t-xl bg-gradient-to-t from-cyan-600/40 via-cyan-400/70 to-cyan-300 shadow-[0_-5px_25px_rgba(34,211,238,0.12)]"
                    />

                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-cyan-300 opacity-0 transition group-hover:opacity-100">
                      ₹{item.mcdBudget.toLocaleString("en-IN")} Cr
                    </div>
                  </div>

                  {/* Delhi government allocation */}
                  <div className="relative">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: govtHeight }}
                      transition={{
                        duration: 1,
                        delay: index * 0.15 + 0.12,
                        ease: "easeOut",
                      }}
                      className="w-9 rounded-t-xl bg-gradient-to-t from-blue-700/40 via-blue-500/70 to-indigo-300 shadow-[0_-5px_25px_rgba(59,130,246,0.12)]"
                    />

                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-blue-300 opacity-0 transition group-hover:opacity-100">
                      ₹
                      {item.delhiAllocation.toLocaleString("en-IN")} Cr
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-2 text-xs font-medium text-slate-400">
                  {item.year}
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-2 left-5 flex items-center gap-5 text-[10px] text-slate-500">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            MCD total budget
          </span>

          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Delhi Govt allocation
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ReportPage() {
  const [selectedYear, setSelectedYear] =
    useState<YearKey>("2025-26");

  const selectedBudget = useMemo(
    () =>
      budgetHistory.find(
        (item) => item.year === selectedYear
      )!,
    [selectedYear]
  );

  const allocationGrowth =
    selectedYear === "2023-24"
      ? 0
      : selectedYear === "2024-25"
      ? ((8423 - 8241) / 8241) * 100
      : ((10537 - 8423) / 8423) * 100;

  return (
    <main className="min-h-screen bg-[#020811] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[650px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/[0.055] blur-[150px]" />

        <div className="absolute bottom-[-250px] right-[-150px] h-[600px] w-[600px] rounded-full bg-blue-600/[0.045] blur-[150px]" />

        <div className="absolute inset-0 opacity-[0.035] [background-image:linear-gradient(rgba(255,255,255,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.5)_1px,transparent_1px)] [background-size:60px_60px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10">
        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8"
        >
          <div className="mb-5 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,.8)]" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  SmartDELHI • Civic Finance Intelligence
                </span>
              </div>

              <h1 className="text-4xl font-semibold tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                Delhi Budget
                & MCD Reports
                
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
                A transparent view of Delhi Government funding,
                MCD expenditure priorities and department-level
                allocations across recent financial years.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2 text-xs text-emerald-300">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Government-backed data
              </div>

              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/[0.05] hover:text-white">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh report
              </button>
            </div>
          </div>
        </motion.header>

        {/* KPI ROW */}
        <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "MCD Budget",
              value: formatCrore(selectedBudget.mcdBudget),
              subtitle: selectedYear,
              icon: WalletCards,
              accent: "cyan",
            },
            {
              title: "Delhi Govt → MCD",
              value: formatCrore(selectedBudget.delhiAllocation),
              subtitle: `${selectedYear} allocation`,
              icon: CircleDollarSign,
              accent: "blue",
            },
            {
              title: "YoY Allocation",
              value:
                selectedYear === "2023-24"
                  ? "Baseline"
                  : `+${allocationGrowth.toFixed(1)}%`,
              subtitle: "vs previous year",
              icon: TrendingUp,
              accent: "emerald",
            },
            {
              title: "Largest Department",
              value: "Sanitation",
              subtitle: "₹4,907.11 Cr • 2025-26",
              icon: Sparkles,
              accent: "violet",
            },
          ].map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07111d]/80 p-5 backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-cyan-400/20"
              >
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="mb-5 flex items-center justify-between">
                  <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 text-[9px] uppercase tracking-wider text-slate-500">
                    {item.accent}
                  </span>
                </div>

                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  {item.title}
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {item.subtitle}
                </p>
              </motion.div>
            );
          })}
        </section>

        {/* MAIN GRAPH + INSIGHT */}
        <section className="grid gap-5 xl:grid-cols-[1.65fr_.75fr]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl border border-white/[0.08] bg-[#07111d]/80 p-6 backdrop-blur-xl"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-cyan-300" />

                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                    Fiscal timeline
                  </span>
                </div>

                <h2 className="text-2xl font-semibold tracking-tight">
                  MCD funding trajectory
                </h2>

                <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
                  Comparing the corporation's total budget with
                  direct financial support provided through the
                  Delhi Government budget.
                </p>
              </div>

              <div className="flex rounded-xl border border-white/10 bg-black/20 p-1">
                {budgetHistory.map((item) => (
                  <button
                    key={item.year}
                    onClick={() =>
                      setSelectedYear(item.year as YearKey)
                    }
                    className={`rounded-lg px-3 py-2 text-[10px] transition ${
                      selectedYear === item.year
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "text-slate-500 hover:text-white"
                    }`}
                  >
                    {item.year}
                  </button>
                ))}
              </div>
            </div>

            <BudgetChart />
          </motion.div>

          {/* INSIGHT PANEL */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/[0.07] via-[#07111d] to-blue-500/[0.04] p-6"
          >
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-cyan-400/[0.06] blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.08]">
                <TrendingUp className="h-5 w-5 text-cyan-300" />
              </div>

              <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-300">
                Key finding
              </p>

              <h3 className="mt-2 text-xl font-semibold">
                State support accelerated
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Delhi Government support to MCD increased
                substantially in FY 2025-26, reaching ₹10,537
                crore compared with ₹8,423 crore in FY 2024-25.
              </p>

              <div className="mt-6 rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Increase
                  </span>

                  <span className="text-lg font-semibold text-emerald-300">
                    +25.1%
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "72%" }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2 text-[10px] text-slate-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Data cross-checked against published budget reports
              </div>
            </div>
          </motion.aside>
        </section>

        {/* DEPARTMENT SECTION */}
        <section className="mt-7">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                  Department intelligence
                </span>
              </div>

              <h2 className="text-2xl font-semibold tracking-tight">
                Where MCD money goes
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Major departmental allocations from the FY 2025-26
                MCD budget.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2">
              <span className="text-[10px] text-slate-500">
                Selected fiscal year
              </span>

              <span className="text-xs font-semibold text-white">
                2025-26
              </span>

              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {departments.map((department, index) => {
              const Icon = department.icon;

              return (
                <motion.div
                  key={department.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                  }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#07111d]/80 p-5 backdrop-blur-xl"
                >
                  <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent opacity-0 transition group-hover:opacity-100" />

                  <div className="flex items-start justify-between">
                    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>

                    <span className="rounded-full border border-cyan-400/10 bg-cyan-400/[0.05] px-2.5 py-1 text-[10px] font-medium text-cyan-300">
                      {department.percentage}%
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-white">
                    {department.name}
                  </h3>

                  <p className="mt-1 min-h-[38px] text-xs leading-5 text-slate-500">
                    {department.description}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-semibold tracking-tight text-white">
                        ₹
                        {department.value.toLocaleString("en-IN", {
                          minimumFractionDigits:
                            department.value % 1 === 0 ? 0 : 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>

                      <span className="text-[10px] text-slate-600">
                        crore
                      </span>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${Math.min(
                            department.percentage * 2.7,
                            100
                          )}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.9,
                          delay: index * 0.05,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* TRANSPARENCY SECTION */}
        <section className="mt-7 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl border border-white/[0.08] bg-[#07111d]/80 p-6 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5">
                <FileText className="h-5 w-5 text-cyan-300" />
              </div>

              <div>
                <h2 className="font-semibold">
                  Budget transparency layer
                </h2>

                <p className="text-xs text-slate-500">
                  Track the origin of the figures used by SmartDELHI.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {sources.map((source) => (
                <a
                  key={source.title}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.035]"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-200">
                      {source.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {source.description}
                    </p>
                  </div>

                  <ArrowUpRight className="h-4 w-4 text-slate-600 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-cyan-300" />
                </a>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-emerald-400/10 bg-gradient-to-br from-emerald-400/[0.06] via-[#07111d] to-transparent p-6">
            <div className="absolute -bottom-24 -right-20 h-56 w-56 rounded-full bg-emerald-400/[0.06] blur-3xl" />

            <div className="relative">
              <div className="mb-5 flex items-center gap-2 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">
                  SmartDELHI verification
                </span>
              </div>

              <h3 className="text-xl font-semibold">
                Every number should have a trail.
              </h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                This report separates MCD's own budget outlay from
                Delhi Government financial assistance so citizens can
                understand both the corporation's spending envelope
                and state-level support.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    FY 2025-26
                  </p>

                  <p className="mt-1 text-xl font-semibold text-white">
                    ₹17,003 Cr
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    MCD budget
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-600">
                    State support
                  </p>

                  <p className="mt-1 text-xl font-semibold text-emerald-300">
                    ₹10,537 Cr
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Delhi Govt → MCD
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ================= MCD CIVIC NEED & RISK INTELLIGENCE ================= */}

<section className="mt-16 rounded-[32px] border border-white/[0.08] bg-[#06101c]/80 p-6 md:p-8 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">

  {/* HEADER */}
  <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />

        <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-cyan-300">
          Civic Risk Intelligence
        </span>
      </div>

      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
        Where Delhi Needs More Work
      </h2>

      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
        An analytical view of infrastructure gaps, civic pressure,
        high-risk areas and public-impact indicators across Delhi.
      </p>
    </div>

    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] px-4 py-3">
      <div className="flex items-center gap-2 text-xs font-medium text-emerald-300">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        LIVE CIVIC ANALYSIS
      </div>

      <p className="mt-1 text-[11px] text-slate-500">
        Based on available government & verified reports
      </p>
    </div>

  </div>


  {/* ================= TOP METRICS ================= */}

  <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">

    {/* FUNDING GAP */}
    <div className="group rounded-2xl border border-white/[0.07] bg-black/20 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-cyan-400/30">

      <div className="flex items-center justify-between">

        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Estimated Funding Need
        </span>

        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/5 px-2 py-1 text-[9px] text-cyan-300">
          MODEL
        </span>

      </div>

      <div className="mt-5 text-3xl font-bold text-white">
        ₹18–25K Cr
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Indicative multi-year requirement for major civic
        infrastructure, drainage, sanitation and road renewal.
      </p>

    </div>


    {/* WATERLOGGING */}
    <div className="group rounded-2xl border border-white/[0.07] bg-black/20 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-blue-400/30">

      <div className="flex items-center justify-between">

        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Waterlogging Pressure
        </span>

        <span className="rounded-full border border-blue-400/20 bg-blue-400/5 px-2 py-1 text-[9px] text-blue-300">
          VERIFIED
        </span>

      </div>

      <div className="mt-5 text-3xl font-bold text-white">
        445
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Waterlogging hotspots identified across Delhi for
        monsoon preparedness.
      </p>

    </div>


    {/* DENGUE */}
    <div className="group rounded-2xl border border-white/[0.07] bg-black/20 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-red-400/30">

      <div className="flex items-center justify-between">

        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Dengue Deaths · 2025
        </span>

        <span className="rounded-full border border-red-400/20 bg-red-400/5 px-2 py-1 text-[9px] text-red-300">
          MCD DATA
        </span>

      </div>

      <div className="mt-5 text-3xl font-bold text-white">
        4
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        MCD reported four dengue-related deaths and
        1,493 confirmed cases during 2025.
      </p>

    </div>


    {/* ROAD */}
    <div className="group rounded-2xl border border-white/[0.07] bg-black/20 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/30">

      <div className="flex items-center justify-between">

        <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
          Road Renewal
        </span>

        <span className="rounded-full border border-amber-400/20 bg-amber-400/5 px-2 py-1 text-[9px] text-amber-300">
          2026
        </span>

      </div>

      <div className="mt-5 text-3xl font-bold text-white">
        74%
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        Approximate internal-road redevelopment progress
        reported for the first half of 2026.
      </p>

    </div>

  </div>


  {/* ================= MAIN ANALYSIS GRID ================= */}

  <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">


    {/* DEPARTMENT PRIORITY */}
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-6">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Department Priority
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Where intervention is most urgent
          </h3>
        </div>

        <span className="text-xs text-slate-500">
          SmartDELHI model
        </span>

      </div>


      <div className="mt-7 space-y-5">

        {[
          {
            name: "Drainage & Flood Management",
            value: 94,
            level: "Critical",
          },
          {
            name: "Solid Waste Management",
            value: 89,
            level: "Critical",
          },
          {
            name: "Roads & Pothole Management",
            value: 84,
            level: "High",
          },
          {
            name: "Public Health & Sanitation",
            value: 79,
            level: "High",
          },
          {
            name: "Stray Animal Management",
            value: 71,
            level: "Elevated",
          },
          {
            name: "Parks & Green Infrastructure",
            value: 58,
            level: "Moderate",
          },
        ].map((item) => (

          <div key={item.name}>

            <div className="mb-2 flex items-center justify-between">

              <span className="text-sm text-slate-300">
                {item.name}
              </span>

              <div className="flex items-center gap-3">

                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                  {item.level}
                </span>

                <span className="text-xs font-semibold text-white">
                  {item.value}
                </span>

              </div>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 transition-all duration-1000"
                style={{ width: `${item.value}%` }}
              />

            </div>

          </div>

        ))}

      </div>

    </div>


    {/* WARD PRIORITY */}
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-6">

      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
          Ward Attention Index
        </p>

        <h3 className="mt-2 text-xl font-semibold text-white">
          Priority areas
        </h3>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          Priority score combining complaint density,
          waterlogging, sanitation and infrastructure pressure.
        </p>
      </div>


      <div className="mt-6 space-y-3">

        {[
          ["Kirari", 96],
          ["Burari", 91],
          ["Mustafabad", 87],
          ["Karawal Nagar", 84],
          ["Nangloi Jat", 81],
        ].map(([ward, score], index) => (

          <div
            key={ward}
            className="flex items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
          >

            <span className="w-5 text-xs text-slate-600">
              0{index + 1}
            </span>

            <span className="flex-1 text-sm text-slate-300">
              {ward}
            </span>

            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/[0.06]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                style={{ width: `${score}%` }}
              />

            </div>

            <span className="w-7 text-right text-xs font-semibold text-white">
              {score}
            </span>

          </div>

        ))}

      </div>

    </div>

  </div>


  {/* ================= CIVIC LOSS GRAPH ================= */}

  <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">


    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-6">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Public Impact
          </p>

          <h3 className="mt-2 text-xl font-semibold text-white">
            Reported human-impact incidents
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Incidents reported in public-authority / civic-service
            contexts. These are not all legally attributed to MCD.
          </p>

        </div>

        <span className="rounded-full border border-red-400/20 bg-red-400/5 px-3 py-1 text-[9px] uppercase tracking-wider text-red-300">
          VERIFIED REPORTS
        </span>

      </div>


      <div className="mt-7 space-y-5">

        {[
          {
            year: "2023",
            deaths: 19,
            label: "Dengue-related deaths",
          },
          {
            year: "2024",
            deaths: 11,
            label: "Dengue-related deaths",
          },
          {
            year: "2025",
            deaths: 4,
            label: "Dengue-related deaths",
          },
        ].map((item) => (

          <div key={item.year}>

            <div className="mb-2 flex items-center justify-between">

              <div>
                <span className="text-sm font-medium text-white">
                  {item.year}
                </span>

                <span className="ml-3 text-xs text-slate-600">
                  {item.label}
                </span>
              </div>

              <span className="text-sm font-semibold text-red-300">
                {item.deaths}
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">

              <div
                className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                style={{
                  width: `${(item.deaths / 19) * 100}%`,
                }}
              />

            </div>

          </div>

        ))}

      </div>


      <div className="mt-6 rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4">

        <p className="text-xs leading-6 text-slate-400">
          Separate 2025 reports also documented deaths involving an
          open drain and a sewer-cleaning incident. Authorities/NHRC
          initiated inquiries or notices in these cases.
        </p>

      </div>

    </div>


    {/* ================= NEWSPAPER SLIDER ================= */}

    <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-black/30">

      <div className="absolute left-5 top-5 z-10 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-xl">

        <span className="text-[10px] uppercase tracking-[0.18em] text-white">
          Civic Incident Archive
        </span>

      </div>


      <div className="relative h-[420px]">

        {[
          "/images/reports/delhi-news-01.jpg",
          "/images/reports/delhi-news-02.jpg",
          "/images/reports/delhi-news-03.jpg",
          "/images/reports/delhi-news-04.jpg",
          "/images/reports/delhi-news-05.jpg",
          "/images/reports/delhi-news-06.jpg",
        ].map((image, index) => (

          <img
            key={image}
            src={image}
            alt={`Delhi civic incident newspaper clipping ${index + 1}`}
            className="absolute inset-0 h-full w-full object-cover opacity-0 animate-[civicSlide_36s_infinite]"
            style={{
              animationDelay: `${index * 6}s`,
            }}
          />

        ))}

        <div className="absolute inset-0 bg-gradient-to-t from-[#020812] via-transparent to-black/20" />

      </div>


      <div className="absolute bottom-5 left-5 right-5 z-10">

        <p className="text-xs text-slate-400">
          Newspaper archive
        </p>

        <p className="mt-1 text-sm font-medium text-white">
          Add verified newspaper clippings for incident documentation
        </p>

      </div>

    </div>

  </div>


  {/* ================= DISCLAIMER ================= */}

  <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-amber-400/10 bg-amber-400/[0.025] p-5 md:flex-row md:items-center">

    <div className="flex-1">

      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
        Data methodology
      </p>

      <p className="mt-2 text-xs leading-6 text-slate-500">
        Funding-need and ward-priority values are analytical estimates,
        not official MCD allocations. Incident figures are shown only
        where a reliable report or official record is available.
        SmartDELHI should distinguish verified facts from model-derived
        risk scores.
      </p>

    </div>

    <div className="shrink-0 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-xs text-slate-500">
      Last analysis · 2026
    </div>

  </div>

</section>

        {/* FOOTER */}
        <footer className="mt-8 border-t border-white/[0.06] pt-5 pb-8">
          <div className="flex flex-col justify-between gap-3 text-[10px] text-slate-600 sm:flex-row">
            <p>
              SmartDELHI Government Data Intelligence Layer
            </p>

            <p>
              Figures represent published budget estimates /
              allocations and may differ from actual expenditure.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}