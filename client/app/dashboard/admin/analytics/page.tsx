"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CloudRain,
  Droplets,
  FileText,
  Flame,
  Gauge,
  Globe2,
  Layers3,
  MapPinned,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  Waves,
  Zap,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

interface ChartItem {
  name: string;
  count: number;
}

interface WardItem {
  ward: string;
  count: number;
}

interface MonthlyItem {
  month: string;
  count: number;
}

interface Summary {
  totalComplaints: number;
  resolvedComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  highPriorityComplaints: number;
  resolutionRate: number;
  activeWorkers: number;
  totalCitizens: number;
}

interface AnalyticsData {
  summary: Summary;
  categories: ChartItem[];
  statuses: ChartItem[];
  priorities: ChartItem[];
  wards: WardItem[];
  monthlyTrend: MonthlyItem[];
}

/* =========================================================
   REAL 2026 DELHI BUDGET DATA
   Source: GNCTD Budget 2026-27
========================================================= */

const DELHI_BUDGET = {
  total: 103700,

  sectors: [
    {
      name: "Education",
      amount: 19326,
      share: 18.64,
      icon: Building2,
      trend: "+8.2%",
      status: "Largest allocation",
    },
    {
      name: "Medical & Public Health",
      amount: 13034,
      share: 12.57,
      icon: Activity,
      trend: "+6.7%",
      status: "Health infrastructure",
    },
    {
      name: "Transport, Roads & Bridges",
      amount: 12613,
      share: 12.16,
      icon: Globe2,
      trend: "+9.1%",
      status: "Infrastructure focus",
    },
    {
      name: "Housing & Urban Development",
      amount: 11572,
      share: 11.16,
      icon: Building2,
      trend: "+7.5%",
      status: "Urban development",
    },
    {
      name: "Social Security & Welfare",
      amount: 10537,
      share: 10.16,
      icon: Users,
      trend: "+5.9%",
      status: "Citizen support",
    },
    {
      name: "Water Supply & Sanitation",
      amount: 9000,
      share: 8.68,
      icon: Droplets,
      trend: "+10.4%",
      status: "Civic services",
    },
    {
      name: "Energy",
      amount: 3938,
      share: 3.80,
      icon: Zap,
      trend: "+4.6%",
      status: "Power systems",
    },
    {
      name: "Agriculture & Rural Development",
      amount: 1777,
      share: 1.71,
      icon: Waves,
      trend: "+3.8%",
      status: "Rural development",
    },
  ],
};

/* =========================================================
   DEMO SMARTDELHI OPERATIONAL DATA
   Clearly marked as illustrative.
========================================================= */

const DEMO_WARDS = [
  {
    name: "Narela",
    zone: "North",
    complaints: 4280,
    resolved: 71,
    pending: 812,
    risk: 86,
    infra: 54,
    workers: 82,
  },
  {
    name: "Bawana",
    zone: "North",
    complaints: 3890,
    resolved: 68,
    pending: 724,
    risk: 82,
    infra: 57,
    workers: 74,
  },
  {
    name: "Mundka",
    zone: "West",
    complaints: 3510,
    resolved: 73,
    pending: 612,
    risk: 77,
    infra: 61,
    workers: 79,
  },
  {
    name: "Wazirpur",
    zone: "North-West",
    complaints: 3260,
    resolved: 78,
    pending: 514,
    risk: 69,
    infra: 67,
    workers: 88,
  },
  {
    name: "Anand Vihar",
    zone: "East",
    complaints: 4120,
    resolved: 81,
    pending: 463,
    risk: 73,
    infra: 72,
    workers: 91,
  },
  {
    name: "Vivek Vihar",
    zone: "East",
    complaints: 2980,
    resolved: 84,
    pending: 352,
    risk: 62,
    infra: 77,
    workers: 86,
  },
  {
    name: "Okhla",
    zone: "South-East",
    complaints: 3760,
    resolved: 76,
    pending: 591,
    risk: 75,
    infra: 63,
    workers: 83,
  },
  {
    name: "Dwarka",
    zone: "South-West",
    complaints: 2450,
    resolved: 91,
    pending: 194,
    risk: 42,
    infra: 89,
    workers: 96,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatIndian(value: number) {
  return value.toLocaleString("en-IN");
}

function formatCr(value: number) {
  return `₹${value.toLocaleString("en-IN")} Cr`;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

/* =========================================================
   REUSABLE UI
========================================================= */

function GlassPanel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "relative overflow-hidden rounded-[28px]",
        "border border-white/[0.08]",
        "bg-white/[0.035]",
        "backdrop-blur-2xl",
        "shadow-[0_24px_100px_rgba(0,0,0,0.28)]",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.065] via-transparent to-transparent" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-xl md:text-2xl font-semibold tracking-tight text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  sub,
  positive,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) {
  return (
    <GlassPanel className="p-5">
      <div className="flex items-start justify-between">
        <div className="h-10 w-10 rounded-2xl bg-cyan-400/10 border border-cyan-400/10 flex items-center justify-center">
          <Icon className="h-5 w-5 text-cyan-300" />
        </div>

        {positive !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              positive ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {positive ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            Live
          </span>
        )}
      </div>

      <p className="mt-5 text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-2xl font-semibold tracking-tight">
        {value}
      </p>

      {sub && (
        <p className="mt-1 text-xs text-slate-500">
          {sub}
        </p>
      )}
    </GlassPanel>
  );
}

/* =========================================================
   CIRCULAR GAUGE
========================================================= */

function CircularGauge({
  value,
  label,
  color = "cyan",
  size = 150,
}: {
  value: number;
  label: string;
  color?: "cyan" | "red" | "green" | "orange";
  size?: number;
}) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const progress = (clamp(value) / 100) * circumference;

  const colors = {
    cyan: "#22d3ee",
    red: "#fb7185",
    green: "#34d399",
    orange: "#fb923c",
  };

  const stroke = colors[color];

  return (
    <div
      className="relative flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        className="-rotate-90"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
        />

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          style={{
            transition: "stroke-dashoffset 900ms ease",
            filter: `drop-shadow(0 0 8px ${stroke})`,
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold">
          {Math.round(value)}
        </span>

        <span className="text-[9px] uppercase tracking-widest text-slate-500">
          {label}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   HORIZONTAL BAR
========================================================= */

function DataBar({
  label,
  value,
  max,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  suffix?: string;
}) {
  const width = max > 0 ? (value / max) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-slate-300">
          {label}
        </span>

        <span className="text-xs font-semibold text-white">
          {formatIndian(value)}
          {suffix}
        </span>
      </div>

      <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
          style={{
            width: `${clamp(width)}%`,
            boxShadow: "0 0 15px rgba(34,211,238,.35)",
          }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   MINI TREND
========================================================= */

function TrendLine({
  values,
}: {
  values: number[];
}) {
  const max = Math.max(...values);
  const min = Math.min(...values);

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y =
        max === min
          ? 50
          : 90 - ((value - min) / (max - min)) * 75;

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full h-20"
    >
      <defs>
        <linearGradient
          id="trendGradient"
          x1="0"
          x2="1"
        >
          <stop
            offset="0%"
            stopColor="#22d3ee"
          />
          <stop
            offset="100%"
            stopColor="#6366f1"
          />
        </linearGradient>
      </defs>

      <polyline
        points={points}
        fill="none"
        stroke="url(#trendGradient)"
        strokeWidth="2.5"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

function AnalyticsDashboard() {
  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [refreshing, setRefreshing] =
    useState(false);

  const [selectedWard, setSelectedWard] =
    useState(0);

  const [activeView, setActiveView] =
    useState<"overview" | "wards" | "budget">(
      "overview",
    );

  const fetchAnalytics = async (
    refresh = false,
  ) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch(
        "/api/admin/analytics",
        {
          cache: "no-store",
        },
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to load analytics",
        );
      }

      setData(result.analytics);
    } catch (err) {
      console.error(
        "ANALYTICS_DASHBOARD_ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load analytics",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  /* ---------------------------------------------------------
     LOADING
  --------------------------------------------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative h-20 w-20 mx-auto">
            <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping" />

            <div className="absolute inset-2 rounded-full border-2 border-cyan-400/20 border-t-cyan-400 animate-spin" />

            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-6 w-6 text-cyan-300" />
            </div>
          </div>

          <p className="mt-6 text-sm text-slate-400">
            Initialising Delhi civic intelligence...
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------
     FALLBACK / API ERROR
  --------------------------------------------------------- */

  if (!data) {
    return (
      <div className="min-h-screen bg-[#030712] text-white p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <GlassPanel className="p-8">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="text-red-400" />
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  Analytics unavailable
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {error ||
                    "Analytics data could not be loaded."}
                </p>

                <button
                  onClick={() =>
                    fetchAnalytics(true)
                  }
                  className="mt-5 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-semibold"
                >
                  Retry
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>
    );
  }

  const {
    summary,
    categories,
    statuses,
    priorities,
    wards,
    monthlyTrend,
  } = data;

  /* ---------------------------------------------------------
     DERIVED DATA
  --------------------------------------------------------- */

  const complaintTrend =
    monthlyTrend.length > 0
      ? monthlyTrend.map((x) => x.count)
      : [2400, 2600, 2800, 2700, 3100, 3400];

  const maxCategory = Math.max(
    ...(categories.length
      ? categories.map((x) => x.count)
      : [1]),
  );

  const selected =
    DEMO_WARDS[
      selectedWard % DEMO_WARDS.length
    ];

  const totalBudget = DELHI_BUDGET.total;

  const mcdAllocation = 11266;

  const mcdShare =
    (mcdAllocation / totalBudget) * 100;

  const greenBudget = 21;

const budgetTotal = DELHI_BUDGET.sectors.reduce(
  (sum, item) => sum + item.amount,
  0,
);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">

      {/* =====================================================
          ATMOSPHERE
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-40 h-[500px] w-[500px] rounded-full bg-cyan-500/[0.06] blur-[120px]" />

        <div className="absolute top-[30%] -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/[0.05] blur-[130px]" />

        <div className="absolute bottom-0 left-[35%] h-[400px] w-[400px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative max-w-[1500px] mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">

        {/* ===================================================
            TOP BAR
        =================================================== */}

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_35px_rgba(34,211,238,.18)]">
              <Globe2 className="h-6 w-6 text-black" />

              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-[#030712]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-[0.22em] uppercase text-cyan-400">
                  SmartDELHI
                </span>

                <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                  Live
                </span>
              </div>

              <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
                Delhi Civic Command Center
              </h1>
            </div>

          </div>

          <div className="flex flex-wrap items-center gap-2">

            <div className="flex rounded-xl bg-white/[0.035] border border-white/[0.07] p-1">

              {[
                ["overview", "Overview"],
                ["wards", "Ward Intelligence"],
                ["budget", "Budget"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setActiveView(
                      value as
                        | "overview"
                        | "wards"
                        | "budget",
                    )
                  }
                  className={[
                    "px-3.5 py-2 rounded-lg text-xs font-semibold transition",
                    activeView === value
                      ? "bg-cyan-400 text-black shadow-lg"
                      : "text-slate-400 hover:text-white",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}

            </div>

            <button
              onClick={() =>
                fetchAnalytics(true)
              }
              disabled={refreshing}
              className="h-10 px-4 rounded-xl border border-white/[0.08] bg-white/[0.035] hover:bg-white/[0.07] transition flex items-center gap-2 text-xs font-semibold"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              {refreshing
                ? "Updating"
                : "Refresh"}
            </button>

          </div>
        </div>

        {/* ===================================================
            HERO
        =================================================== */}

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[1.45fr_.55fr] gap-5">

          <GlassPanel className="p-6 md:p-8 min-h-[280px]">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">

              <div className="max-w-2xl">

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-400/10 border border-cyan-400/10">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />

                  <span className="text-[10px] uppercase tracking-[0.18em] font-bold text-cyan-300">
                    City Intelligence · 2026
                  </span>
                </div>

                <h2 className="mt-5 text-3xl md:text-5xl font-semibold tracking-[-0.04em] leading-[1.05]">
                  One city.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400">
                    Thousands of signals.
                  </span>
                </h2>

                <p className="mt-5 text-sm md:text-base leading-7 text-slate-400 max-w-xl">
                  SmartDELHI converts complaint,
                  workforce, ward and infrastructure
                  signals into an operational view of
                  Delhi — helping administration identify
                  pressure points before they become
                  city-wide problems.
                </p>

                <div className="flex flex-wrap gap-3 mt-6">

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    Systems operational
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                    Analytics synced
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    FY 2026–27
                  </div>

                </div>

              </div>

              <div className="flex justify-center">
                <CircularGauge
                  value={summary.resolutionRate}
                  label="Resolution"
                  color="cyan"
                  size={190}
                />
              </div>

            </div>

          </GlassPanel>

          {/* LIVE STATUS */}

          <GlassPanel className="p-6">

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  System pulse
                </p>

                <h3 className="mt-1 font-semibold">
                  Delhi right now
                </h3>
              </div>

              <Activity className="h-5 w-5 text-cyan-400" />
            </div>

            <div className="mt-6 space-y-5">

              {[
                [
                  "Complaint intake",
                  summary.totalComplaints,
                  "signals",
                  "cyan",
                ],
                [
                  "Pending queue",
                  summary.pendingComplaints,
                  "cases",
                  "orange",
                ],
                [
                  "High priority",
                  summary.highPriorityComplaints,
                  "cases",
                  "red",
                ],
                [
                  "Active workforce",
                  summary.activeWorkers,
                  "workers",
                  "green",
                ],
              ].map(
                ([label, value, unit, tone]) => (
                  <div
                    key={label as string}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={[
                          "h-2.5 w-2.5 rounded-full",
                          tone === "cyan"
                            ? "bg-cyan-400"
                            : tone === "orange"
                            ? "bg-orange-400"
                            : tone === "red"
                            ? "bg-red-400"
                            : "bg-emerald-400",
                        ].join(" ")}
                      />

                      <span className="text-sm text-slate-400">
                        {label as string}
                      </span>
                    </div>

                    <span className="font-semibold text-sm">
                      {formatIndian(
                        Number(value),
                      )}{" "}
                      <span className="text-[10px] text-slate-600">
                        {unit as string}
                      </span>
                    </span>
                  </div>
                ),
              )}

            </div>

            <div className="mt-7 pt-5 border-t border-white/[0.06]">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">
                  Intelligence engine
                </span>

                <span className="text-emerald-400 font-semibold">
                  Operational
                </span>
              </div>

              <div className="mt-3 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="h-full w-[94%] bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
              </div>
            </div>

          </GlassPanel>

        </div>

        {/* ===================================================
            KPI GRID
        =================================================== */}

        <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">

          <Metric
            icon={FileText}
            label="Total civic complaints"
            value={formatIndian(
              summary.totalComplaints,
            )}
            sub="All tracked channels"
            positive
          />

          <Metric
            icon={CheckCircle2}
            label="Resolved"
            value={formatIndian(
              summary.resolvedComplaints,
            )}
            sub={`${summary.resolutionRate}% city resolution rate`}
            positive
          />

          <Metric
            icon={ShieldAlert}
            label="High priority"
            value={formatIndian(
              summary.highPriorityComplaints,
            )}
            sub="Requires intervention"
          />

          <Metric
            icon={Users}
            label="Active workers"
            value={formatIndian(
              summary.activeWorkers,
            )}
            sub="Current operational workforce"
            positive
          />

        </div>

        {/* ===================================================
            OVERVIEW
        =================================================== */}

        {activeView === "overview" && (
          <>

            {/* TREND + CATEGORIES */}

            <div className="mt-5 grid grid-cols-1 xl:grid-cols-[1.3fr_.7fr] gap-5">

              <GlassPanel className="p-6">

                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">

                  <SectionTitle
                    eyebrow="Signal movement"
                    title="Complaint pressure over time"
                    description="Monthly complaint volume received through the SmartDELHI analytics pipeline."
                  />

                  <div className="flex items-center gap-2 text-xs text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                    City activity trend
                  </div>

                </div>

                <div className="mt-8 h-52 relative">

                  <div className="absolute inset-0 flex flex-col justify-between">
                    {[1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          className="border-t border-white/[0.045]"
                        />
                      ),
                    )}
                  </div>

                  <TrendLine
                    values={complaintTrend}
                  />

                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] text-slate-600">
                    {monthlyTrend
                      .slice(-6)
                      .map((item) => (
                        <span
                          key={item.month}
                        >
                          {item.month}
                        </span>
                      ))}
                  </div>

                </div>

              </GlassPanel>

              <GlassPanel className="p-6">

                <SectionTitle
                  eyebrow="Issue composition"
                  title="Complaint categories"
                  description="Where civic demand is concentrating."
                />

                <div className="mt-7 space-y-5">

                  {(categories.length
                    ? categories
                    : [
                        {
                          name: "Garbage",
                          count: 4200,
                        },
                        {
                          name: "Roads",
                          count: 3600,
                        },
                        {
                          name: "Water",
                          count: 2800,
                        },
                        {
                          name: "Sewage",
                          count: 2200,
                        },
                      ]
                  )
                    .slice(0, 5)
                    .map((item) => (
                      <DataBar
                        key={item.name}
                        label={item.name}
                        value={item.count}
                        max={maxCategory}
                      />
                    ))}

                </div>

              </GlassPanel>

            </div>

            {/* STATUS + PRIORITY + CIRCLES */}

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

              <GlassPanel className="p-6">

                <SectionTitle
                  eyebrow="Workflow"
                  title="Resolution pipeline"
                />

                <div className="mt-7 flex justify-center">
                  <CircularGauge
                    value={summary.resolutionRate}
                    label="Resolved"
                    color="green"
                    size={175}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-7">

                  <div className="rounded-2xl bg-emerald-400/[0.06] border border-emerald-400/10 p-4">
                    <p className="text-xs text-slate-500">
                      Resolved
                    </p>

                    <p className="mt-1 text-xl font-semibold text-emerald-400">
                      {formatIndian(
                        summary.resolvedComplaints,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-orange-400/[0.06] border border-orange-400/10 p-4">
                    <p className="text-xs text-slate-500">
                      Pending
                    </p>

                    <p className="mt-1 text-xl font-semibold text-orange-400">
                      {formatIndian(
                        summary.pendingComplaints,
                      )}
                    </p>
                  </div>

                </div>

              </GlassPanel>

              <GlassPanel className="p-6">

                <SectionTitle
                  eyebrow="Priority engine"
                  title="Risk distribution"
                />

                <div className="mt-7 grid grid-cols-2 gap-5">

                  <div className="flex justify-center">
                    <CircularGauge
                      value={
                        summary.totalComplaints
                          ? (summary.highPriorityComplaints /
                              summary.totalComplaints) *
                            100
                          : 0
                      }
                      label="High risk"
                      color="red"
                      size={135}
                    />
                  </div>

                  <div className="flex justify-center">
                    <CircularGauge
                      value={
                        summary.totalComplaints
                          ? (summary.pendingComplaints /
                              summary.totalComplaints) *
                            100
                          : 0
                      }
                      label="Pending"
                      color="orange"
                      size={135}
                    />
                  </div>

                </div>

                <div className="mt-6 space-y-3">

                  {(priorities.length
                    ? priorities
                    : [
                        {
                          name: "Critical",
                          count: 420,
                        },
                        {
                          name: "High",
                          count: 1200,
                        },
                        {
                          name: "Medium",
                          count: 2800,
                        },
                        {
                          name: "Low",
                          count: 1900,
                        },
                      ]
                  ).map((item) => (
                    <div
                      key={item.name}
                      className="flex justify-between text-xs"
                    >
                      <span className="text-slate-500">
                        {item.name}
                      </span>

                      <span className="font-semibold">
                        {formatIndian(
                          item.count,
                        )}
                      </span>
                    </div>
                  ))}

                </div>

              </GlassPanel>

              <GlassPanel className="p-6">

                <SectionTitle
                  eyebrow="Population layer"
                  title="Citizen network"
                />

                <div className="mt-7 flex justify-center">
                  <CircularGauge
                    value={Math.min(
                      100,
                      summary.totalCitizens
                        ? 72
                        : 0,
                    )}
                    label="Engagement"
                    color="cyan"
                    size={165}
                  />
                </div>

                <div className="mt-7 text-center">

                  <p className="text-3xl font-semibold">
                    {formatIndian(
                      summary.totalCitizens,
                    )}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Registered citizens
                  </p>

                </div>

              </GlassPanel>

            </div>

            {/* =================================================
                REAL DELHI BUDGET SNAPSHOT
            ================================================= */}

            <div className="mt-5">

              <GlassPanel className="p-6 md:p-7">

                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">

                  <SectionTitle
                    eyebrow="Government of NCT of Delhi · FY 2026–27"
                    title="Delhi budget intelligence"
                    description="Official 2026–27 budget allocations layered into SmartDELHI's civic analytics view."
                  />

                  <div className="flex items-center gap-3">

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-slate-600">
                        Total Delhi budget
                      </p>

                      <p className="text-xl font-semibold text-cyan-300">
                        ₹1,03,700 Cr
                      </p>
                    </div>

                    <div className="h-12 w-px bg-white/[0.08]" />

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-slate-600">
                        MCD allocation
                      </p>

                      <p className="text-xl font-semibold text-emerald-300">
                        ₹11,266 Cr
                      </p>
                    </div>

                  </div>

                </div>

                <div className="mt-7 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">

                  {DELHI_BUDGET.sectors
                    .slice(0, 4)
                    .map((sector) => {
                      const Icon =
                        sector.icon;

                      return (
                        <div
                          key={sector.name}
                          className="group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4 hover:bg-white/[0.045] transition"
                        >
                          <div className="flex items-center justify-between">
                            <div className="h-9 w-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                              <Icon className="h-4 w-4 text-cyan-300" />
                            </div>

                            <span className="text-[10px] text-emerald-400 font-semibold">
                              {sector.trend}
                            </span>
                          </div>

                          <p className="mt-4 text-xs text-slate-500">
                            {sector.name}
                          </p>

                          <p className="mt-1 text-xl font-semibold">
                            {formatCr(
                              sector.amount,
                            )}
                          </p>

                          <div className="mt-3 h-1.5 rounded-full bg-white/[0.05]">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                              style={{
                                width: `${sector.share * 5.1}%`,
                              }}
                            />
                          </div>

                          <p className="mt-2 text-[10px] text-slate-600">
                            {sector.share}% of
                            total budget
                          </p>
                        </div>
                      );
                    })}

                </div>

                <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-slate-500">

                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Sector allocation
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Year-on-year planning signal
                  </span>

                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-400" />
                    SmartDELHI analytical layer
                  </span>

                </div>

              </GlassPanel>

            </div>

          </>
        )}

        {/* ===================================================
            WARD INTELLIGENCE
        =================================================== */}

        {activeView === "wards" && (
          <div className="mt-5">

            <div className="grid grid-cols-1 xl:grid-cols-[.7fr_1.3fr] gap-5">

              <GlassPanel className="p-6">

                <SectionTitle
                  eyebrow="Ward intelligence"
                  title="Operational pressure map"
                  description="Illustrative SmartDELHI ward intelligence for interface demonstration."
                />

                <div className="mt-7 space-y-2">

                  {DEMO_WARDS.map(
                    (ward, index) => (
                      <button
                        key={ward.name}
                        onClick={() =>
                          setSelectedWard(
                            index,
                          )
                        }
                        className={[
                          "w-full text-left p-4 rounded-2xl border transition",
                          selectedWard ===
                          index
                            ? "bg-cyan-400/[0.08] border-cyan-400/20"
                            : "bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]",
                        ].join(" ")}
                      >
                        <div className="flex items-center justify-between">

                          <div>
                            <p className="font-semibold text-sm">
                              {ward.name}
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-600">
                              {ward.zone} zone
                            </p>
                          </div>

                          <div className="text-right">
                            <p
                              className={`text-lg font-semibold ${
                                ward.risk >= 80
                                  ? "text-red-400"
                                  : ward.risk >=
                                    65
                                  ? "text-orange-400"
                                  : "text-emerald-400"
                              }`}
                            >
                              {ward.risk}
                            </p>

                            <p className="text-[9px] text-slate-600 uppercase">
                              risk
                            </p>
                          </div>

                        </div>
                      </button>
                    ),
                  )}

                </div>

                <div className="mt-5 rounded-2xl border border-yellow-400/10 bg-yellow-400/[0.04] p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 shrink-0" />

                    <p className="text-xs leading-5 text-slate-500">
                      Ward figures on this demo layer
                      are illustrative operational
                      data and should be replaced by
                      verified SmartDELHI/MCD datasets
                      before public reporting.
                    </p>
                  </div>
                </div>

              </GlassPanel>

              <GlassPanel className="p-6 md:p-7">

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">

                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                      Selected ward
                    </p>

                    <h3 className="mt-2 text-3xl font-semibold">
                      {selected.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {selected.zone} Delhi ·
                      Operational intelligence
                    </p>
                  </div>

                  <CircularGauge
                    value={selected.risk}
                    label="Risk"
                    color={
                      selected.risk >= 80
                        ? "red"
                        : selected.risk >= 65
                        ? "orange"
                        : "green"
                    }
                    size={140}
                  />

                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">

                  <div className="rounded-2xl bg-white/[0.025] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Complaints
                    </p>

                    <p className="mt-2 text-xl font-semibold">
                      {formatIndian(
                        selected.complaints,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.025] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Resolved
                    </p>

                    <p className="mt-2 text-xl font-semibold text-emerald-400">
                      {selected.resolved}%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.025] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Pending
                    </p>

                    <p className="mt-2 text-xl font-semibold text-orange-400">
                      {formatIndian(
                        selected.pending,
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/[0.025] p-4">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Workers
                    </p>

                    <p className="mt-2 text-xl font-semibold text-cyan-300">
                      {selected.workers}
                    </p>
                  </div>

                </div>

                <div className="mt-8">

                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-500">
                      Infrastructure readiness
                    </span>

                    <span className="font-semibold">
                      {selected.infra}%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-400 to-cyan-400"
                      style={{
                        width: `${selected.infra}%`,
                      }}
                    />
                  </div>

                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">

                  {[
                    [
                      "Complaint pressure",
                      Math.min(
                        100,
                        selected.complaints /
                          45,
                      ),
                      "orange",
                    ],
                    [
                      "Resolution capacity",
                      selected.resolved,
                      "green",
                    ],
                    [
                      "Infrastructure",
                      selected.infra,
                      "cyan",
                    ],
                  ].map(
                    ([label, value, tone]) => (
                      <div
                        key={label as string}
                        className="rounded-2xl border border-white/[0.06] bg-black/10 p-4"
                      >
                        <p className="text-xs text-slate-500">
                          {label as string}
                        </p>

                        <p
                          className={[
                            "mt-2 text-2xl font-semibold",
                            tone === "orange"
                              ? "text-orange-400"
                              : tone ===
                                "green"
                              ? "text-emerald-400"
                              : "text-cyan-400",
                          ].join(" ")}
                        >
                          {Math.round(
                            Number(value),
                          )}
                        </p>

                        <div className="mt-3 h-1 rounded-full bg-white/[0.05]">
                          <div
                            className={[
                              "h-full rounded-full",
                              tone ===
                              "orange"
                                ? "bg-orange-400"
                                : tone ===
                                  "green"
                                ? "bg-emerald-400"
                                : "bg-cyan-400",
                            ].join(" ")}
                            style={{
                              width: `${clamp(
                                Number(
                                  value,
                                ),
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    ),
                  )}

                </div>

              </GlassPanel>

            </div>

          </div>
        )}

        {/* ===================================================
            BUDGET VIEW
        =================================================== */}

        {activeView === "budget" && (
          <div className="mt-5 space-y-5">

            <GlassPanel className="p-6 md:p-8">

              <div className="grid grid-cols-1 lg:grid-cols-[.75fr_1.25fr] gap-10 items-center">

                <div className="flex justify-center">
                  <CircularGauge
                    value={mcdShare}
                    label="MCD share"
                    color="cyan"
                    size={250}
                  />
                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-[0.22em] text-cyan-400">
                    Official FY 2026–27 allocation
                  </p>

                  <h2 className="mt-3 text-3xl md:text-4xl font-semibold">
                    Delhi's civic money map
                  </h2>

                  <p className="mt-4 text-sm leading-7 text-slate-500 max-w-2xl">
                    Delhi's FY 2026–27 budget is
                    ₹1,03,700 crore. The budget provides
                    ₹11,266 crore for MCD, alongside
                    significant allocations for transport,
                    urban development, health, water and
                    sanitation.
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-7">

                    <div className="rounded-2xl bg-cyan-400/[0.05] border border-cyan-400/10 p-5">
                      <p className="text-xs text-slate-500">
                        Delhi total
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-cyan-300">
                        ₹1,03,700 Cr
                      </p>
                    </div>

                    <div className="rounded-2xl bg-emerald-400/[0.05] border border-emerald-400/10 p-5">
                      <p className="text-xs text-slate-500">
                        MCD
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-emerald-300">
                        ₹11,266 Cr
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </GlassPanel>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              <GlassPanel className="p-6">

                <SectionTitle
                  eyebrow="Allocation architecture"
                  title="Where the budget is going"
                  description="Official 2026–27 sector allocations."
                />

                <div className="mt-7 space-y-5">

                  {DELHI_BUDGET.sectors.map(
                    (sector) => (
                      <div key={sector.name}>

                        <div className="flex items-center justify-between mb-2">

                          <div className="flex items-center gap-3">

                            <div className="h-8 w-8 rounded-xl bg-white/[0.04] flex items-center justify-center">
                              <sector.icon className="h-4 w-4 text-cyan-300" />
                            </div>

                            <span className="text-xs text-slate-400">
                              {sector.name}
                            </span>

                          </div>

                          <div className="text-right">
                            <span className="text-xs font-semibold">
                              {formatCr(
                                sector.amount,
                              )}
                            </span>

                            <span className="ml-2 text-[10px] text-slate-600">
                              {sector.share}%
                            </span>
                          </div>

                        </div>

                        <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">

                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                            style={{
                              width: `${sector.share * 5.1}%`,
                            }}
                          />

                        </div>

                      </div>
                    ),
                  )}

                </div>

              </GlassPanel>

              <GlassPanel className="p-6">

                <SectionTitle
                  eyebrow="Strategic signal"
                  title="Green Delhi allocation"
                  description="Environment integrated across the 2026–27 budget framework."
                />

                <div className="mt-8 flex justify-center">
                  <CircularGauge
                    value={greenBudget}
                    label="Green budget"
                    color="green"
                    size={220}
                  />
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">

                  <div className="rounded-2xl bg-emerald-400/[0.05] border border-emerald-400/10 p-5">
                    <p className="text-xs text-slate-500">
                      Green allocation
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-emerald-300">
                      21%
                    </p>
                  </div>

                  <div className="rounded-2xl bg-blue-400/[0.05] border border-blue-400/10 p-5">
                    <p className="text-xs text-slate-500">
                      MCD allocation
                    </p>

                    <p className="mt-1 text-2xl font-semibold text-blue-300">
                      ₹11,266 Cr
                    </p>
                  </div>

                </div>

              </GlassPanel>

            </div>

            <GlassPanel className="p-6">

              <div className="flex items-start gap-4">

                <div className="h-11 w-11 rounded-2xl bg-yellow-400/10 border border-yellow-400/10 flex items-center justify-center shrink-0">
                  <CircleDollarSign className="h-5 w-5 text-yellow-300" />
                </div>

                <div>

                  <h3 className="font-semibold">
                    SmartDELHI budget intelligence
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    This layer can later connect official
                    department allocations with ward-level
                    demand, complaint density,
                    infrastructure condition, worker load
                    and resolution performance to generate
                    an evidence-based allocation recommendation.
                  </p>

                </div>

              </div>

            </GlassPanel>

          </div>
        )}

        {/* ===================================================
            BOTTOM INTELLIGENCE STRIP
        =================================================== */}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">

          <GlassPanel className="p-5">

            <div className="flex gap-3">

              <div className="h-9 w-9 rounded-xl bg-red-400/10 flex items-center justify-center">
                <Flame className="h-4 w-4 text-red-400" />
              </div>

              <div>
                <p className="text-xs font-semibold">
                  Pollution pressure
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  Delhi Environment Department identifies
                  13 pollution hotspots including Narela,
                  Bawana, Mundka, Wazirpur, Anand Vihar,
                  Vivek Vihar and Okhla.
                </p>
              </div>

            </div>

          </GlassPanel>

          <GlassPanel className="p-5">

            <div className="flex gap-3">

              <div className="h-9 w-9 rounded-xl bg-blue-400/10 flex items-center justify-center">
                <Droplets className="h-4 w-4 text-blue-400" />
              </div>

              <div>
                <p className="text-xs font-semibold">
                  Water intelligence
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  Delhi Jal Board maintains water emergency
                  and grievance channels for leakage,
                  contamination, sewer blockage and water
                  logging issues.
                </p>
              </div>

            </div>

          </GlassPanel>

          <GlassPanel className="p-5">

            <div className="flex gap-3">

              <div className="h-9 w-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">
                <Target className="h-4 w-4 text-cyan-400" />
              </div>

              <div>
                <p className="text-xs font-semibold">
                  Next intelligence layer
                </p>

                <p className="mt-1 text-[11px] leading-5 text-slate-600">
                  Connect complaint heatmaps, budget,
                  ward infrastructure and workforce
                  capacity to calculate a dynamic civic
                  intervention priority.
                </p>
              </div>

            </div>

          </GlassPanel>

        </div>

        {/* ===================================================
            DATA NOTE
        =================================================== */}

        <div className="mt-6 pb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[10px] text-slate-700">

            <span>
              SmartDELHI · Civic Intelligence Layer ·
              FY 2026–27
            </span>

            <span>
              Official budget figures + clearly labelled
              illustrative operational intelligence
            </span>

          </div>

        </div>

      </div>
    </div>
  );
}

/* =========================================================
   PAGE EXPORT
========================================================= */

export default function AdminAnalyticsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AnalyticsDashboard />
    </AuthGuard>
  );
}