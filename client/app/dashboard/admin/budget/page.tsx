"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  Calculator,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Database,
  Gauge,
  IndianRupee,
  Landmark,
  Layers3,
  MapPinned,
  Network,
  PieChart,
  RefreshCw,
  Scale,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
  Waves,
  HardHat,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface WardBudget {
  id: string;
  number: number;
  name: string;
  zone?: string | null;

  population: number;
  households: number;

  complaintCount: number;
  workerCount: number;

  needScore: number;

  recommendedBudget: number;
  currentBudget: number;
  spentBudget: number;

  /*
   Optional fields.
   Add these later in your API to unlock deeper intelligence.
  */
  previousBudget?: number;
  previousSpentBudget?: number;

  infrastructureScore?: number;
  roadScore?: number;
  sanitationScore?: number;
  drainageScore?: number;
  waterScore?: number;
  greenScore?: number;
}

interface Summary {
  totalWards: number;
  totalPopulation: number;
  totalHouseholds: number;
  totalComplaints: number;
  totalActiveWorkers: number;
  totalBudget: number;
}

type Tab =
  | "overview"
  | "allocation"
  | "wards"
  | "forecast"
  | "rebalance";

interface Department {
  name: string;
  amount: number;
  color: string;
  description: string;
}

/* =========================================================
   VERIFIED DELHI 2026-27 BUDGET DATA
========================================================= */

const DELHI_BUDGET = 103700;

const GNCTD_MCD_ALLOCATION = 11266;

const MCD_INTERNAL_BUDGET = 17583;

const departments: Department[] = [
  {
    name: "Sanitation",
    amount: 4797.78,
    color: "cyan",
    description: "Waste management, cleanliness & landfill operations",
  },
  {
    name: "General Administration",
    amount: 3548.63,
    color: "violet",
    description: "Administrative & institutional expenditure",
  },
  {
    name: "Education",
    amount: 3264.84,
    color: "blue",
    description: "Municipal schools & education infrastructure",
  },
  {
    name: "Public Health & Medical",
    amount: 1925.6,
    color: "emerald",
    description: "Hospitals, dispensaries & public health",
  },
  {
    name: "Engineering",
    amount: 1884.43,
    color: "amber",
    description: "Roads, drainage & civic engineering",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatCr(value: number) {
  if (!Number.isFinite(value)) return "₹0";

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })} Cr`;
}

function formatCompact(value: number) {
  if (!Number.isFinite(value)) return "₹0";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/* =========================================================
   MAIN
========================================================= */

function BudgetDashboard() {
  const [wards, setWards] = useState<WardBudget[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [tab, setTab] = useState<Tab>("overview");

  const [selectedWard, setSelectedWard] =
    useState<WardBudget | null>(null);

  const [transferAmount, setTransferAmount] = useState(50);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/budget", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load budget data"
        );
      }

      setWards(data.wards || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("BUDGET_DASHBOARD_ERROR:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load budget data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetData();
  }, []);

  /* =========================================================
     DERIVED DATA
  ========================================================= */

  const highestNeedWard = useMemo(() => {
    if (!wards.length) return null;

    return [...wards].sort(
      (a, b) => b.needScore - a.needScore
    )[0];
  }, [wards]);

  const lowestNeedWard = useMemo(() => {
    if (!wards.length) return null;

    return [...wards].sort(
      (a, b) => a.needScore - b.needScore
    )[0];
  }, [wards]);

  const highestSpendingWard = useMemo(() => {
    if (!wards.length) return null;

    return [...wards].sort(
      (a, b) => b.spentBudget - a.spentBudget
    )[0];
  }, [wards]);

  const mostUnderfundedWards = useMemo(() => {
    return [...wards]
      .sort(
        (a, b) =>
          b.recommendedBudget -
          b.currentBudget -
          (a.recommendedBudget -
            a.currentBudget)
      )
      .slice(0, 8);
  }, [wards]);

  const budgetGap = useMemo(() => {
    return wards.reduce(
      (total, ward) =>
        total +
        Math.max(
          0,
          ward.recommendedBudget -
            ward.currentBudget
        ),
      0
    );
  }, [wards]);

  const totalSpent = useMemo(() => {
    return wards.reduce(
      (total, ward) =>
        total + (ward.spentBudget || 0),
      0
    );
  }, [wards]);

  const totalCurrentWardBudget = useMemo(() => {
    return wards.reduce(
      (total, ward) =>
        total + (ward.currentBudget || 0),
      0
    );
  }, [wards]);

  const utilizationRate =
    totalCurrentWardBudget > 0
      ? Math.round(
          (totalSpent /
            totalCurrentWardBudget) *
            100
        )
      : 0;

  const avgNeedScore =
    wards.length > 0
      ? wards.reduce(
          (sum, ward) =>
            sum + ward.needScore,
          0
        ) / wards.length
      : 0;

  const forecastNeed =
    totalCurrentWardBudget +
    budgetGap;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white overflow-hidden">
        <AmbientBackground />

        <div className="relative z-10 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="mx-auto h-14 w-14 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 flex items-center justify-center"
            >
              <IndianRupee className="h-6 w-6 text-cyan-300" />
            </motion.div>

            <p className="mt-6 text-sm font-bold">
              Building Fiscal Intelligence
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Aggregating Delhi budget & ward signals...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">
      <AmbientBackground />

      <main className="relative z-10 mx-auto max-w-[1600px] px-4 py-5 md:px-8 md:py-8">

        {/* =====================================================
            HEADER
        ===================================================== */}

        <motion.header
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-7"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/5">
                  <CircleDollarSign className="h-5 w-5 text-cyan-300" />
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-300">
                    SmartDELHI
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.2em] text-slate-600">
                    Fiscal Intelligence Center
                  </div>
                </div>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">
                Delhi Budget
                <span className="text-cyan-300">
                  {" "}Intelligence
                </span>
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
                Understand where Delhi&apos;s money goes,
                which wards need more investment, where
                infrastructure is under pressure and how
                future development funding should be distributed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-300">
                  Fiscal data connected
                </span>
              </div>

              <button
                onClick={fetchBudgetData}
                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-2.5 text-xs font-bold text-slate-300 transition hover:border-cyan-400/30 hover:text-white"
              >
                <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
                Refresh
              </button>

            </div>
          </div>
        </motion.header>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* =====================================================
            TOP CITY FISCAL SNAPSHOT
        ===================================================== */}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-7">

          <FiscalCard
            icon={Landmark}
            label="Delhi Government Budget"
            value={formatCr(DELHI_BUDGET)}
            detail="FY 2026–27"
            accent="cyan"
          />

          <FiscalCard
            icon={Building2}
            label="GNCTD MCD Allocation"
            value={formatCr(
              GNCTD_MCD_ALLOCATION
            )}
            detail={`${(
              (GNCTD_MCD_ALLOCATION /
                DELHI_BUDGET) *
              100
            ).toFixed(1)}% of Delhi budget`}
            accent="blue"
          />

          <FiscalCard
            icon={WalletCards}
            label="MCD Internal Budget"
            value={formatCr(
              MCD_INTERNAL_BUDGET
            )}
            detail="MCD FY 2026–27 expenditure"
            accent="violet"
          />

          <FiscalCard
            icon={Target}
            label="Ward Funding Gap"
            value={formatCr(budgetGap)}
            detail="Based on current ward model"
            accent="amber"
          />

        </section>

        {/* =====================================================
            TABS
        ===================================================== */}

        <div className="mb-7 overflow-x-auto">
          <div className="inline-flex min-w-max rounded-2xl border border-white/10 bg-white/[0.025] p-1.5 backdrop-blur-xl">

            <BudgetTab
              active={tab === "overview"}
              icon={Gauge}
              label="Overview"
              onClick={() => setTab("overview")}
            />

            <BudgetTab
              active={tab === "allocation"}
              icon={PieChart}
              label="Allocation"
              onClick={() => setTab("allocation")}
            />

            <BudgetTab
              active={tab === "wards"}
              icon={MapPinned}
              label="Ward Intelligence"
              onClick={() => setTab("wards")}
            />

            <BudgetTab
              active={tab === "forecast"}
              icon={TrendingUp}
              label="AI Forecast"
              onClick={() => setTab("forecast")}
            />

            <BudgetTab
              active={tab === "rebalance"}
              icon={Scale}
              label="Rebalance"
              onClick={() =>
                setTab("rebalance")
              }
            />

          </div>
        </div>

        {/* =====================================================
            TAB CONTENT
        ===================================================== */}

        <AnimatePresence mode="wait">

          {tab === "overview" && (
            <motion.div
              key="overview"
              initial={{
                opacity: 0,
                x: 25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -25,
              }}
            >

              <OverviewSection
                summary={summary}
                wards={wards}
                utilizationRate={
                  utilizationRate
                }
                avgNeedScore={
                  avgNeedScore
                }
                highestNeedWard={
                  highestNeedWard
                }
                highestSpendingWard={
                  highestSpendingWard
                }
                budgetGap={budgetGap}
              />

            </motion.div>
          )}

          {tab === "allocation" && (
            <motion.div
              key="allocation"
              initial={{
                opacity: 0,
                x: 25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -25,
              }}
            >

              <AllocationSection />

            </motion.div>
          )}

          {tab === "wards" && (
            <motion.div
              key="wards"
              initial={{
                opacity: 0,
                x: 25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -25,
              }}
            >

              <WardIntelligenceSection
                wards={wards}
                mostUnderfundedWards={
                  mostUnderfundedWards
                }
                selectedWard={
                  selectedWard
                }
                setSelectedWard={
                  setSelectedWard
                }
              />

            </motion.div>
          )}

          {tab === "forecast" && (
            <motion.div
              key="forecast"
              initial={{
                opacity: 0,
                x: 25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -25,
              }}
            >

              <ForecastSection
                wards={wards}
                forecastNeed={
                  forecastNeed
                }
                budgetGap={budgetGap}
              />

            </motion.div>
          )}

          {tab === "rebalance" && (
            <motion.div
              key="rebalance"
              initial={{
                opacity: 0,
                x: 25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: -25,
              }}
            >

              <RebalanceSection
                wards={wards}
                transferAmount={
                  transferAmount
                }
                setTransferAmount={
                  setTransferAmount
                }
              />

            </motion.div>
          )}

        </AnimatePresence>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer className="mt-12 flex flex-col gap-2 border-t border-white/5 py-7 text-[10px] uppercase tracking-[0.2em] text-slate-700 md:flex-row md:justify-between">
          <span>
            SmartDELHI • Fiscal Intelligence
          </span>

          <span>
            Delhi Administration • FY 2026–27
          </span>
        </footer>

      </main>
    </div>
  );
}

/* =========================================================
   OVERVIEW
========================================================= */

function OverviewSection({
  summary,
  wards,
  utilizationRate,
  avgNeedScore,
  highestNeedWard,
  highestSpendingWard,
  budgetGap,
}: {
  summary: Summary | null;
  wards: WardBudget[];
  utilizationRate: number;
  avgNeedScore: number;
  highestNeedWard: WardBudget | null;
  highestSpendingWard: WardBudget | null;
  budgetGap: number;
}) {
  return (
    <div className="space-y-6">

      {/* HERO */}
      <section className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">

        <GlassPanel className="relative overflow-hidden">

          <div className="absolute right-[-100px] top-[-100px] h-[350px] w-[350px] rounded-full bg-cyan-400/10 blur-[110px]" />

          <div className="relative">

            <div className="flex items-center justify-between">

              <div>
                <div className="flex items-center gap-2 text-cyan-300">
                  <Activity className="h-4 w-4" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                    Fiscal Health
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-black">
                  Is Delhi spending where it matters?
                </h2>
              </div>

              <div className="hidden md:flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[10px] text-slate-500">
                <Database className="h-3 w-3" />
                LIVE MODEL
              </div>

            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">

              <InsightMetric
                label="Ward utilization"
                value={`${utilizationRate}%`}
                icon={Gauge}
                accent="cyan"
              />

              <InsightMetric
                label="Average need score"
                value={avgNeedScore.toFixed(1)}
                icon={Target}
                accent="violet"
              />

              <InsightMetric
                label="Modeled funding gap"
                value={formatCr(
                  budgetGap
                )}
                icon={ShieldAlert}
                accent="amber"
              />

            </div>

          </div>
        </GlassPanel>

        <GlassPanel>

          <div className="flex items-center gap-2 text-amber-300">
            <Zap className="h-4 w-4" />

            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
              Priority Signal
            </span>
          </div>

          {highestNeedWard ? (
            <>
              <h3 className="mt-4 text-2xl font-black">
                {highestNeedWard.name}
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Highest modeled development need
                among currently available ward data.
              </p>

              <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/5 p-4">

                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">
                    Need score
                  </span>

                  <span className="font-bold text-amber-300">
                    {highestNeedWard.needScore.toFixed(
                      1
                    )}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${clamp(
                        highestNeedWard.needScore,
                        0,
                        100
                      )}%`,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-400"
                  />
                </div>

              </div>
            </>
          ) : (
            <EmptyState />
          )}

        </GlassPanel>

      </section>

      {/* CURRENT DATA */}
      <section className="grid gap-5 lg:grid-cols-2">

        <GlassPanel>

          <SectionTitle
            icon={BarChart3}
            eyebrow="Ward economics"
            title="Current allocation vs actual spending"
          />

          <div className="mt-7 space-y-5">

            {wards
              .slice()
              .sort(
                (a, b) =>
                  b.currentBudget -
                  a.currentBudget
              )
              .slice(0, 7)
              .map((ward, index) => {

                const spend =
                  ward.currentBudget >
                  0
                    ? Math.min(
                        100,
                        (ward.spentBudget /
                          ward.currentBudget) *
                          100
                      )
                    : 0;

                return (
                  <motion.div
                    key={ward.id}
                    initial={{
                      opacity: 0,
                      x: -15,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay:
                        index * 0.05,
                    }}
                  >

                    <div className="mb-2 flex justify-between gap-3">

                      <div>
                        <span className="text-xs font-bold text-white">
                          {ward.name}
                        </span>

                        <span className="ml-2 text-[10px] text-slate-600">
                          Ward {ward.number}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400">
                        {formatCompact(
                          ward.spentBudget
                        )}
                      </span>

                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/5">

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${spend}%`,
                        }}
                        transition={{
                          duration: 0.8,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      />

                    </div>

                  </motion.div>
                );
              })}

          </div>

        </GlassPanel>

        <GlassPanel>

          <SectionTitle
            icon={ShieldAlert}
            eyebrow="Investment signals"
            title="Where should attention move?"
          />

          <div className="mt-6 space-y-3">

            {highestNeedWard && (
              <SignalRow
                icon={ArrowUpRight}
                title="Highest development pressure"
                value={highestNeedWard.name}
                description="Highest need score in available ward data."
                color="amber"
              />
            )}

            {highestSpendingWard && (
              <SignalRow
                icon={TrendingUp}
                title="Highest current spending"
                value={highestSpendingWard.name}
                description={`Current spend ${formatCompact(
                  highestSpendingWard.spentBudget
                )}`}
                color="blue"
              />
            )}

            <SignalRow
              icon={ArrowDownRight}
              title="Modeled redistribution pool"
              value={formatCr(
                Math.max(
                  0,
                  budgetGap
                )
              )}
              description="Potential additional funding requirement."
              color="violet"
            />

          </div>

        </GlassPanel>

      </section>

      {/* PEOPLE */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">

        <StatTile
          label="Wards"
          value={
            summary?.totalWards || 0
          }
          icon={MapPinned}
        />

        <StatTile
          label="Population"
          value={(
            summary?.totalPopulation ||
            0
          ).toLocaleString("en-IN")}
          icon={Users}
        />

        <StatTile
          label="Complaints"
          value={
            summary?.totalComplaints || 0
          }
          icon={ShieldAlert}
        />

        <StatTile
          label="Active Workers"
          value={
            summary?.totalActiveWorkers ||
            0
          }
          icon={HardHat}
        />

      </section>

    </div>
  );
}

/* =========================================================
   ALLOCATION
========================================================= */

function AllocationSection() {
  const totalDepartmentBudget = departments.reduce(
    (sum, department) =>
      sum + department.amount,
    0
  );

  return (
    <div className="space-y-6">

      <section className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]">

        <GlassPanel>

          <SectionTitle
            icon={PieChart}
            eyebrow="Delhi → MCD"
            title="Funding architecture"
          />

          <div className="mt-8">

            <div className="relative mx-auto flex h-64 w-64 items-center justify-center">

              <div className="absolute inset-0 rounded-full border-[28px] border-cyan-400/10" />

              <motion.div
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                }}
                transition={{
                  duration: 0.8,
                }}
                className="absolute inset-5 rounded-full border-[24px] border-cyan-400/30 border-t-blue-400 border-r-violet-400 rotate-[-25deg]"
              />

              <div className="relative text-center">

                <p className="text-4xl font-black">
                  ₹11,266
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-600">
                  Cr • GNCTD → MCD
                </p>

              </div>

            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">

              <SmallFinance
                label="Delhi Budget"
                value="₹1,03,700 Cr"
              />

              <SmallFinance
                label="MCD Grant Share"
                value={`${(
                  (11266 /
                    103700) *
                  100
                ).toFixed(1)}%`}
              />

            </div>

          </div>

        </GlassPanel>

        <GlassPanel>

          <SectionTitle
            icon={Building2}
            eyebrow="MCD internal allocation"
            title="Where the MCD budget is concentrated"
          />

          <div className="mt-7 space-y-6">

            {departments.map(
              (department, index) => {

                const ratio =
                  (department.amount /
                    MCD_INTERNAL_BUDGET) *
                  100;

                return (
                  <DepartmentBar
                    key={department.name}
                    department={
                      department
                    }
                    ratio={ratio}
                    index={index}
                  />
                );
              }
            )}

          </div>

          <div className="mt-7 rounded-2xl border border-white/5 bg-white/[0.02] p-4">

            <div className="flex items-center justify-between">

              <span className="text-xs text-slate-500">
                Listed major departments
              </span>

              <span className="font-bold text-white">
                {formatCr(
                  totalDepartmentBudget
                )}
              </span>

            </div>

            <p className="mt-2 text-[10px] leading-5 text-slate-600">
              Remaining MCD expenditure covers
              other civic functions and heads not
              represented in this simplified view.
            </p>

          </div>

        </GlassPanel>

      </section>

      <GlassPanel>

        <SectionTitle
          icon={Network}
          eyebrow="Department strategy"
          title="What the allocation tells us"
        />

        <div className="mt-6 grid gap-4 md:grid-cols-3">

          <StrategyCard
            title="Sanitation first"
            value="₹4,797.78 Cr"
            description="Sanitation is the largest listed MCD allocation, signalling a major focus on waste management and cleanliness."
            accent="cyan"
          />

          <StrategyCard
            title="Human development"
            value="₹3,264.84 Cr"
            description="Education receives one of the largest departmental allocations, supporting municipal school operations."
            accent="blue"
          />

          <StrategyCard
            title="Civic infrastructure"
            value="₹1,884.43 Cr"
            description="Engineering remains a major spending head for physical civic infrastructure."
            accent="amber"
          />

        </div>

      </GlassPanel>

    </div>
  );
}

/* =========================================================
   WARD INTELLIGENCE
========================================================= */

function WardIntelligenceSection({
  wards,
  mostUnderfundedWards,
  selectedWard,
  setSelectedWard,
}: {
  wards: WardBudget[];
  mostUnderfundedWards: WardBudget[];
  selectedWard: WardBudget | null;
  setSelectedWard: (
    ward: WardBudget | null
  ) => void;
}) {
  return (
    <div className="space-y-6">

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">

        <GlassPanel>

          <SectionTitle
            icon={Target}
            eyebrow="AI ward model"
            title="Investment priority map"
          />

          <div className="mt-7 grid gap-3 sm:grid-cols-2">

            {wards
              .slice()
              .sort(
                (a, b) =>
                  b.needScore -
                  a.needScore
              )
              .slice(0, 10)
              .map((ward, index) => (

                <motion.button
                  key={ward.id}
                  onClick={() =>
                    setSelectedWard(
                      ward
                    )
                  }
                  whileHover={{
                    scale: 1.015,
                  }}
                  className="group rounded-2xl border border-white/7 bg-white/[0.025] p-4 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.035]"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-xs font-bold text-white">
                        {ward.name}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-600">
                        Ward {ward.number}
                      </p>

                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-700 transition group-hover:translate-x-1 group-hover:text-cyan-300" />

                  </div>

                  <div className="mt-4 flex items-end justify-between">

                    <div>

                      <p className="text-2xl font-black">
                        {ward.needScore.toFixed(
                          1
                        )}
                      </p>

                      <p className="text-[9px] uppercase tracking-widest text-slate-600">
                        Need score
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-xs font-bold text-emerald-300">
                        {formatCompact(
                          ward.recommendedBudget
                        )}
                      </p>

                      <p className="text-[9px] text-slate-600">
                        recommended
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 h-1.5 rounded-full bg-white/5">

                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                      style={{
                        width: `${clamp(
                          ward.needScore,
                          0,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </motion.button>

              ))}

          </div>

        </GlassPanel>

        <GlassPanel>

          <SectionTitle
            icon={ShieldAlert}
            eyebrow="Funding pressure"
            title="Most under-funded wards"
          />

          <div className="mt-6 space-y-3">

            {mostUnderfundedWards.map(
              (ward, index) => {

                const gap =
                  ward.recommendedBudget -
                  ward.currentBudget;

                return (
                  <div
                    key={ward.id}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-black/10 p-3"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-400/5 text-xs font-black text-red-300">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-xs font-bold text-white">
                          {ward.name}
                        </p>

                        <p className="text-[9px] text-slate-600">
                          Need {ward.needScore.toFixed(
                            1
                          )}
                        </p>
                      </div>

                    </div>

                    <div className="text-right">

                      <p className="text-xs font-bold text-red-300">
                        +{formatCompact(
                          Math.max(
                            0,
                            gap
                          )
                        )}
                      </p>

                      <p className="text-[9px] text-slate-600">
                        modeled gap
                      </p>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </GlassPanel>

      </section>

      {/* SELECTED WARD */}
      <AnimatePresence>
        {selectedWard && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
          >

            <GlassPanel>

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <div className="flex items-center gap-2 text-cyan-300">
                    <MapPinned className="h-4 w-4" />

                    <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                      Ward intelligence
                    </span>
                  </div>

                  <h2 className="mt-2 text-3xl font-black">
                    {selectedWard.name}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Ward {selectedWard.number}
                    {selectedWard.zone
                      ? ` • ${selectedWard.zone}`
                      : ""}
                  </p>

                </div>

                <button
                  onClick={() =>
                    setSelectedWard(
                      null
                    )
                  }
                  className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-slate-400 hover:text-white"
                >
                  Close
                </button>

              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <WardMetric
                  label="Population"
                  value={selectedWard.population.toLocaleString(
                    "en-IN"
                  )}
                />

                <WardMetric
                  label="Complaints"
                  value={selectedWard.complaintCount.toLocaleString(
                    "en-IN"
                  )}
                />

                <WardMetric
                  label="Current budget"
                  value={formatCompact(
                    selectedWard.currentBudget
                  )}
                />

                <WardMetric
                  label="Recommended"
                  value={formatCompact(
                    selectedWard.recommendedBudget
                  )}
                />

              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-2">

                <ScorePanel
                  title="Development pressure"
                  value={
                    selectedWard.needScore
                  }
                />

                <ScorePanel
                  title="Infrastructure health"
                  value={
                    selectedWard.infrastructureScore
                  }
                  unavailable={
                    selectedWard.infrastructureScore ===
                    undefined
                  }
                />

              </div>

              <div className="mt-6 rounded-2xl border border-amber-400/10 bg-amber-400/5 p-5">

                <div className="flex items-center gap-2 text-amber-300">
                  <Sparkles className="h-4 w-4" />
                  <span className="text-xs font-bold">
                    AI Recommendation
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Based on the current model, this
                  ward should receive approximately{" "}
                  <strong className="text-white">
                    {formatCompact(
                      selectedWard.recommendedBudget
                    )}
                  </strong>{" "}
                  compared with its current allocation
                  of{" "}
                  <strong className="text-white">
                    {formatCompact(
                      selectedWard.currentBudget
                    )}
                  </strong>
                  .
                </p>

              </div>

            </GlassPanel>

          </motion.div>
        )}
      </AnimatePresence>

      {/* DATA LIMITATION */}
      <DataAvailabilityNotice />

    </div>
  );
}

/* =========================================================
   FORECAST
========================================================= */

function ForecastSection({
  wards,
  forecastNeed,
  budgetGap,
}: {
  wards: WardBudget[];
  forecastNeed: number;
  budgetGap: number;
}) {
  const topNeeds = wards
    .slice()
    .sort(
      (a, b) =>
        b.needScore -
        a.needScore
    )
    .slice(0, 6);

  return (
    <div className="space-y-6">

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">

        <GlassPanel className="relative overflow-hidden">

          <div className="absolute right-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-[120px]" />

          <div className="relative">

            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles className="h-4 w-4" />

              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
                Development Forecast
              </span>
            </div>

            <h2 className="mt-3 text-3xl font-black">
              How much should Delhi invest next?
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
              SmartDELHI can combine ward population,
              complaint pressure, workforce load and
              infrastructure indicators to produce a
              development-funding requirement model.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">

              <ForecastNumber
                label="Current modeled"
                value={formatCr(
                  forecastNeed -
                    budgetGap
                )}
              />

              <ForecastNumber
                label="Additional need"
                value={formatCr(
                  budgetGap
                )}
              />

              <ForecastNumber
                label="Projected requirement"
                value={formatCr(
                  forecastNeed
                )}
              />

            </div>

          </div>

        </GlassPanel>

        <GlassPanel>

          <SectionTitle
            icon={Calculator}
            eyebrow="AI model"
            title="Funding logic"
          />

          <div className="mt-6 space-y-3">

            <LogicStep
              number="01"
              title="Measure need"
              description="Population + complaints + infrastructure pressure"
            />

            <LogicStep
              number="02"
              title="Measure delivery"
              description="Workers + current spending + utilization"
            />

            <LogicStep
              number="03"
              title="Calculate gap"
              description="Recommended allocation − current allocation"
            />

            <LogicStep
              number="04"
              title="Optimize"
              description="Move surplus toward higher-need wards"
            />

          </div>

        </GlassPanel>

      </section>

      <GlassPanel>

        <SectionTitle
          icon={TrendingUp}
          eyebrow="Priority investment"
          title="Where future development money should go"
        />

        <div className="mt-7 space-y-4">

          {topNeeds.map(
            (ward, index) => {

              const percentage =
                ward.recommendedBudget >
                0
                  ? clamp(
                      (ward.needScore /
                        100) *
                        100,
                      0,
                      100
                    )
                  : 0;

              return (
                <div
                  key={ward.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-4"
                >

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-400/5 text-xs font-black text-violet-300">
                        {index + 1}
                      </div>

                      <div>

                        <p className="text-sm font-bold">
                          {ward.name}
                        </p>

                        <p className="text-[10px] text-slate-600">
                          Need score{" "}
                          {ward.needScore.toFixed(
                            1
                          )}
                        </p>

                      </div>

                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-sm font-black text-emerald-300">
                        {formatCompact(
                          ward.recommendedBudget
                        )}
                      </p>

                      <p className="text-[9px] uppercase tracking-widest text-slate-600">
                        recommended
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${percentage}%`,
                      }}
                      transition={{
                        duration: 0.8,
                        delay:
                          index * 0.05,
                      }}
                      className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400"
                    />

                  </div>

                </div>
              );
            }
          )}

        </div>

      </GlassPanel>

    </div>
  );
}

/* =========================================================
   REBALANCE
========================================================= */

function RebalanceSection({
  wards,
  transferAmount,
  setTransferAmount,
}: {
  wards: WardBudget[];
  transferAmount: number;
  setTransferAmount: (
    value: number
  ) => void;
}) {
  const donors = wards
    .filter(
      (ward) =>
        ward.currentBudget >
        ward.recommendedBudget
    )
    .sort(
      (a, b) =>
        b.currentBudget -
        b.recommendedBudget -
        (a.currentBudget -
          a.recommendedBudget)
    )
    .slice(0, 3);

  const receivers = wards
    .filter(
      (ward) =>
        ward.recommendedBudget >
        ward.currentBudget
    )
    .sort(
      (a, b) =>
        b.recommendedBudget -
        b.currentBudget -
        (a.recommendedBudget -
          a.currentBudget)
    )
    .slice(0, 3);

  return (
    <div className="space-y-6">

      <GlassPanel className="relative overflow-hidden">

        <div className="absolute left-[-100px] bottom-[-100px] h-[350px] w-[350px] rounded-full bg-emerald-400/10 blur-[110px]" />

        <div className="relative">

          <div className="flex items-center gap-2 text-emerald-300">
            <Scale className="h-4 w-4" />

            <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
              Budget Rebalancer
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-black">
            Move money where the city needs it
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            The model identifies wards with allocation
            surplus and wards where recommended funding
            exceeds current allocation.
          </p>

          <div className="mt-8">

            <label className="text-xs font-bold text-slate-400">
              Simulation transfer
            </label>

            <div className="mt-3 flex items-center gap-4">

              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={transferAmount}
                onChange={(e) =>
                  setTransferAmount(
                    Number(
                      e.target.value
                    )
                  )
                }
                className="w-full accent-cyan-400"
              />

              <div className="min-w-[100px] rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3 text-center">

                <p className="text-lg font-black text-cyan-300">
                  ₹{transferAmount}
                </p>

                <p className="text-[9px] text-slate-600">
                  simulated Cr
                </p>

              </div>

            </div>

          </div>

        </div>

      </GlassPanel>

      <section className="grid gap-5 lg:grid-cols-2">

        <RebalanceColumn
          title="Potential donor wards"
          subtitle="Current budget above modeled need"
          wards={donors}
          type="donor"
        />

        <RebalanceColumn
          title="Priority receiver wards"
          subtitle="Recommended budget above current funding"
          wards={receivers}
          type="receiver"
        />

      </section>

      <GlassPanel>

        <SectionTitle
          icon={Sparkles}
          eyebrow="Recommended action"
          title="AI reallocation strategy"
        />

        <div className="mt-6 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-6">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-bold text-cyan-300">
                Suggested simulation
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Transfer approximately{" "}
                <strong className="text-white">
                  ₹{transferAmount} Cr
                </strong>{" "}
                from a surplus ward toward a high-need
                ward and compare the resulting funding gap.
              </p>

            </div>

            <button
              className="rounded-xl bg-cyan-400 px-5 py-3 text-xs font-black text-slate-950 transition hover:bg-cyan-300"
            >
              Run Simulation
            </button>

          </div>

        </div>

      </GlassPanel>

    </div>
  );
}

/* =========================================================
   REBALANCE COLUMN
========================================================= */

function RebalanceColumn({
  title,
  subtitle,
  wards,
  type,
}: {
  title: string;
  subtitle: string;
  wards: WardBudget[];
  type: "donor" | "receiver";
}) {
  return (
    <GlassPanel>

      <div className="flex items-start justify-between">

        <div>

          <h3 className="font-black">
            {title}
          </h3>

          <p className="mt-1 text-[10px] text-slate-600">
            {subtitle}
          </p>

        </div>

        {type === "donor" ? (
          <ArrowDownRight className="h-5 w-5 text-blue-300" />
        ) : (
          <ArrowUpRight className="h-5 w-5 text-emerald-300" />
        )}

      </div>

      <div className="mt-6 space-y-3">

        {wards.length === 0 ? (
          <EmptyState />
        ) : (
          wards.map((ward) => {

            const difference =
              type === "donor"
                ? ward.currentBudget -
                  ward.recommendedBudget
                : ward.recommendedBudget -
                  ward.currentBudget;

            return (
              <div
                key={ward.id}
                className="rounded-xl border border-white/5 bg-black/10 p-4"
              >

                <div className="flex justify-between">

                  <span className="text-xs font-bold">
                    {ward.name}
                  </span>

                  <span
                    className={
                      type === "donor"
                        ? "text-xs font-bold text-blue-300"
                        : "text-xs font-bold text-emerald-300"
                    }
                  >
                    {formatCompact(
                      difference
                    )}
                  </span>

                </div>

                <div className="mt-2 text-[10px] text-slate-600">
                  Current{" "}
                  {formatCompact(
                    ward.currentBudget
                  )}{" "}
                  • Recommended{" "}
                  {formatCompact(
                    ward.recommendedBudget
                  )}
                </div>

              </div>
            );
          })
        )}

      </div>

    </GlassPanel>
  );
}

/* =========================================================
   DEPARTMENT BAR
========================================================= */

function DepartmentBar({
  department,
  ratio,
  index,
}: {
  department: Department;
  ratio: number;
  index: number;
}) {
  const colors: Record<
    string,
    string
  > = {
    cyan: "from-cyan-400 to-blue-400",
    violet:
      "from-violet-400 to-fuchsia-400",
    blue:
      "from-blue-400 to-indigo-400",
    emerald:
      "from-emerald-400 to-teal-400",
    amber:
      "from-amber-400 to-orange-400",
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
        x: -20,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      transition={{
        delay: index * 0.08,
      }}
    >

      <div className="flex items-end justify-between gap-3">

        <div>

          <p className="text-xs font-bold text-white">
            {department.name}
          </p>

          <p className="mt-1 text-[10px] text-slate-600">
            {department.description}
          </p>

        </div>

        <div className="text-right">

          <p className="text-sm font-black">
            {formatCr(
              department.amount
            )}
          </p>

          <p className="text-[9px] text-slate-600">
            {ratio.toFixed(1)}%
          </p>

        </div>

      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${ratio}%`,
          }}
          transition={{
            duration: 1,
            delay: index * 0.08,
          }}
          className={`h-full rounded-full bg-gradient-to-r ${colors[department.color]}`}
        />

      </div>

    </motion.div>
  );
}

/* =========================================================
   UI COMPONENTS
========================================================= */

function FiscalCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  accent: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    cyan: "text-cyan-300 bg-cyan-400/5 border-cyan-400/10",
    blue: "text-blue-300 bg-blue-400/5 border-blue-400/10",
    violet:
      "text-violet-300 bg-violet-400/5 border-violet-400/10",
    amber:
      "text-amber-300 bg-amber-400/5 border-amber-400/10",
  };

  return (
    <motion.div
      whileHover={{
        y: -4,
      }}
      className="group relative overflow-hidden rounded-2xl border border-white/7 bg-white/[0.025] p-5 backdrop-blur-xl"
    >

      <div className="absolute right-[-35px] top-[-35px] h-28 w-28 rounded-full bg-cyan-400/5 blur-2xl" />

      <div className="relative">

        <div
          className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl border ${styles[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-600">
          {label}
        </p>

        <p className="mt-2 text-2xl font-black tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-[10px] text-slate-600">
          {detail}
        </p>

      </div>

    </motion.div>
  );
}

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[26px] border border-white/[0.07] bg-white/[0.025] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.18)] backdrop-blur-2xl md:p-7 ${className}`}
    >
      {children}
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>

      <div className="flex items-center gap-2 text-cyan-300">

        <Icon className="h-4 w-4" />

        <span className="text-[10px] font-bold uppercase tracking-[0.25em]">
          {eyebrow}
        </span>

      </div>

      <h2 className="mt-2 text-xl font-black">
        {title}
      </h2>

    </div>
  );
}

function InsightMetric({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent: string;
}) {
  const colors: Record<
    string,
    string
  > = {
    cyan: "text-cyan-300 bg-cyan-400/5",
    violet:
      "text-violet-300 bg-violet-400/5",
    amber:
      "text-amber-300 bg-amber-400/5",
  };

  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 p-4">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[accent]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <p className="mt-4 text-2xl font-black">
        {value}
      </p>

      <p className="mt-1 text-[9px] uppercase tracking-widest text-slate-600">
        {label}
      </p>

    </div>
  );
}

function SignalRow({
  icon: Icon,
  title,
  value,
  description,
  color,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    amber: "text-amber-300 bg-amber-400/5",
    blue: "text-blue-300 bg-blue-400/5",
    violet:
      "text-violet-300 bg-violet-400/5",
  };

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/5 bg-black/10 p-4">

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles[color]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">

        <p className="text-[10px] uppercase tracking-widest text-slate-600">
          {title}
        </p>

        <p className="mt-1 truncate text-sm font-bold text-white">
          {value}
        </p>

        <p className="mt-1 text-[10px] text-slate-600">
          {description}
        </p>

      </div>

    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-5">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
            {label}
          </p>

          <p className="mt-2 text-2xl font-black">
            {value}
          </p>

        </div>

        <Icon className="h-5 w-5 text-cyan-300/70" />

      </div>

    </div>
  );
}

function BudgetTab({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
        active
          ? "text-white"
          : "text-slate-600 hover:text-slate-300"
      }`}
    >

      {active && (
        <motion.div
          layoutId="budgetTab"
          className="absolute inset-0 rounded-xl bg-cyan-400/10 border border-cyan-400/10"
        />
      )}

      <span className="relative flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>

    </button>
  );
}

function SmallFinance({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">

      <p className="text-[9px] uppercase tracking-widest text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-sm font-black text-white">
        {value}
      </p>

    </div>
  );
}

function StrategyCard({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  accent: string;
}) {
  const styles: Record<
    string,
    string
  > = {
    cyan: "border-cyan-400/10 bg-cyan-400/5 text-cyan-300",
    blue: "border-blue-400/10 bg-blue-400/5 text-blue-300",
    amber: "border-amber-400/10 bg-amber-400/5 text-amber-300",
  };

  return (
    <div
      className={`rounded-2xl border p-5 ${styles[accent]}`}
    >

      <p className="text-xs font-bold">
        {title}
      </p>

      <p className="mt-3 text-2xl font-black text-white">
        {value}
      </p>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}

function WardMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/10 p-4">

      <p className="text-[9px] uppercase tracking-widest text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-lg font-black">
        {value}
      </p>

    </div>
  );
}

function ScorePanel({
  title,
  value,
  unavailable = false,
}: {
  title: string;
  value?: number;
  unavailable?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 p-5">

      <div className="flex justify-between">

        <p className="text-xs font-bold">
          {title}
        </p>

        {unavailable ? (
          <span className="text-[9px] text-slate-600">
            Awaiting data
          </span>
        ) : (
          <span className="text-xs font-black text-cyan-300">
            {value?.toFixed(1)}
          </span>
        )}

      </div>

      {!unavailable && (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">

          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
            style={{
              width: `${clamp(
                value || 0,
                0,
                100
              )}%`,
            }}
          />

        </div>
      )}

    </div>
  );
}

function ForecastNumber({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/10 p-5">

      <p className="text-[9px] uppercase tracking-widest text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-xl font-black">
        {value}
      </p>

    </div>
  );
}

function LogicStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/5 bg-black/10 p-3">

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-400/5 text-[10px] font-black text-violet-300">
        {number}
      </div>

      <div>

        <p className="text-xs font-bold">
          {title}
        </p>

        <p className="mt-1 text-[10px] leading-4 text-slate-600">
          {description}
        </p>

      </div>

    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-white/7 p-8 text-center text-xs text-slate-600">
      No data available.
    </div>
  );
}

function DataAvailabilityNotice() {
  return (
    <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.03] p-5">

      <div className="flex items-start gap-3">

        <Database className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />

        <div>

          <p className="text-xs font-bold text-amber-300">
            Intelligence model data boundary
          </p>

          <p className="mt-2 text-[11px] leading-5 text-slate-600">
            Delhi/MCD aggregate budget figures are based
            on published FY 2026–27 budget information.
            Ward-level historical spending, infrastructure
            quality and previous-year comparisons require
            those fields to be supplied by the SmartDELHI
            database/API before they can be presented as
            factual ward performance metrics.
          </p>

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   BACKGROUND
========================================================= */

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">

      <div className="absolute left-[5%] top-[5%] h-[500px] w-[500px] rounded-full bg-cyan-500/[0.035] blur-[130px]" />

      <div className="absolute right-[0%] top-[30%] h-[600px] w-[600px] rounded-full bg-violet-500/[0.025] blur-[150px]" />

      <div className="absolute bottom-[-200px] left-[30%] h-[500px] w-[500px] rounded-full bg-blue-500/[0.025] blur-[130px]" />

      <div className="absolute inset-0 opacity-[0.025]">
        <svg
          width="100%"
          height="100%"
        >
          <defs>
            <pattern
              id="budgetGrid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          <rect
            width="100%"
            height="100%"
            fill="url(#budgetGrid)"
          />
        </svg>
      </div>

    </div>
  );
}

/* =========================================================
   USERS ICON WRAPPER
========================================================= */

function UsersIcon() {
  return (
    <HardHat className="h-5 w-5" />
  );
}

/* =========================================================
   EXPORT
========================================================= */

export default function AdminBudgetPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <BudgetDashboard />
    </AuthGuard>
  );
}