"use client";

import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  Bell,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  CircleCheck,
  CircleGauge,
  Clock3,
  CloudRain,
  Database,
  Download,
  Eye,
  Filter,
  Gauge,
  GitCompare,
  Globe2,
  Layers3,
  MapPinned,
  Maximize2,
  Minus,
  MoreHorizontal,
  Radar,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import AuthGuard from "@/components/auth/AuthGuard";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type PriorityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

interface ScoreComponent {
  rawScore: number;
  normalizedScore: number;
  weight: number;
  weightedScore: number;
  description: string;
}

interface AIScoreBreakdown {
  severity: ScoreComponent;
  volume: ScoreComponent;
  pendingPressure: ScoreComponent;
  aging: ScoreComponent;
  resolutionPerformance: ScoreComponent;
}

interface WardScore {
  wardId: string;
  wardName: string;
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  averageAgeDays: number;
  resolutionRate: number;
  score: number;
  priorityLevel: PriorityLevel;
  breakdown: AIScoreBreakdown;
}

interface Summary {
  overallScore: number;
  averageWardScore: number;
  totalWardsEvaluated: number;
  criticalWardCount: number;
  highPriorityWardCount: number;
  mediumPriorityWardCount: number;
  lowPriorityWardCount: number;
  totalComplaints: number;
  totalPendingComplaints: number;
}

interface APIResponse {
  success: boolean;
  timestamp: string;
  summary: Summary;
  rankings: WardScore[];
}

type SortMode =
  | "risk-desc"
  | "risk-asc"
  | "complaints-desc"
  | "pending-desc"
  | "resolution-desc";

type PriorityFilter = "ALL" | PriorityLevel;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : 0));

function scoreTone(score: number) {
  if (score >= 80) {
    return {
      text: "text-rose-300",
      bg: "bg-rose-500",
      soft: "bg-rose-500/10",
      border: "border-rose-400/20",
      ring: "ring-rose-400/20",
      label: "Critical",
    };
  }

  if (score >= 60) {
    return {
      text: "text-orange-300",
      bg: "bg-orange-500",
      soft: "bg-orange-500/10",
      border: "border-orange-400/20",
      ring: "ring-orange-400/20",
      label: "High",
    };
  }

  if (score >= 40) {
    return {
      text: "text-amber-300",
      bg: "bg-amber-500",
      soft: "bg-amber-500/10",
      border: "border-amber-400/20",
      ring: "ring-amber-400/20",
      label: "Medium",
    };
  }

  return {
    text: "text-emerald-300",
    bg: "bg-emerald-500",
    soft: "bg-emerald-500/10",
    border: "border-emerald-400/20",
    ring: "ring-emerald-400/20",
    label: "Low",
  };
}

function priorityTone(priority: PriorityLevel) {
  switch (priority) {
    case "CRITICAL":
      return {
        text: "text-rose-300",
        bg: "bg-rose-500/12",
        border: "border-rose-400/25",
        dot: "bg-rose-400",
      };
    case "HIGH":
      return {
        text: "text-orange-300",
        bg: "bg-orange-500/12",
        border: "border-orange-400/25",
        dot: "bg-orange-400",
      };
    case "MEDIUM":
      return {
        text: "text-amber-300",
        bg: "bg-amber-500/12",
        border: "border-amber-400/25",
        dot: "bg-amber-400",
      };
    default:
      return {
        text: "text-emerald-300",
        bg: "bg-emerald-500/12",
        border: "border-emerald-400/25",
        dot: "bg-emerald-400",
      };
  }
}

function formatNumber(value: number) {
  return Math.round(value || 0).toLocaleString("en-IN");
}

function formatScore(value: number) {
  return Number(value || 0).toFixed(1);
}

function shortNumber(value: number) {
  const n = Number(value || 0);

  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }

  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}K`;
  }

  return String(Math.round(n));
}

/* -------------------------------------------------------------------------- */
/* Decorative primitives                                                      */
/* -------------------------------------------------------------------------- */

function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#05070d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(99,102,241,0.16),transparent_28%),radial-gradient(circle_at_85%_18%,rgba(14,165,233,0.12),transparent_25%),radial-gradient(circle_at_50%_90%,rgba(168,85,247,0.08),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute left-[8%] top-[14%] h-64 w-64 rounded-full bg-indigo-500/10 blur-[110px]" />
      <div className="absolute right-[4%] top-[32%] h-80 w-80 rounded-full bg-cyan-500/10 blur-[130px]" />
      <div className="absolute bottom-[-8%] left-[38%] h-72 w-72 rounded-full bg-violet-500/10 blur-[120px]" />
    </div>
  );
}

function GlassCard({
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
        "shadow-[0_24px_80px_rgba(0,0,0,0.28)]",
        "backdrop-blur-2xl",
        className,
      ].join(" ")}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      {children}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Circular visualizations                                                     */
/* -------------------------------------------------------------------------- */

function CircularScore({
  score,
  size = 270,
  label = "CITY RISK",
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const radius = 43;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (clamp(score) / 100) * circumference;
  const tone = scoreTone(score);

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <div className="absolute inset-[7%] rounded-full bg-slate-950/80 shadow-[inset_0_0_60px_rgba(0,0,0,0.7)]" />
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full -rotate-90"
      >
        <defs>
          <linearGradient id="city-score-gradient" x1="0" x2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
          <filter id="city-score-glow">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.055)"
          strokeWidth="6"
        />

        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#city-score-gradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          filter="url(#city-score-glow)"
          className="transition-all duration-1000 ease-out"
        />

        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
          strokeDasharray="1 3"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-[0.3em] text-slate-500">
          <Sparkles size={12} className="text-indigo-300" />
          {label}
        </div>

        <div className={`text-6xl font-black tracking-[-0.07em] ${tone.text}`}>
          {formatScore(score)}
        </div>

        <div className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          / 100
        </div>

        <div
          className={[
            "mt-4 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]",
            tone.soft,
            tone.border,
            tone.text,
          ].join(" ")}
        >
          {tone.label} exposure
        </div>
      </div>
    </div>
  );
}

function Donut({
  values,
  total,
  size = 190,
}: {
  values: Array<{ value: number; color: string }>;
  total: number;
  size?: number;
}) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let cursor = 0;

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="12"
        />

        {values.map((item, index) => {
          const fraction = total > 0 ? item.value / total : 0;
          const dash = fraction * circumference;
          const gap = 2;
          const offset = -cursor * circumference;
          cursor += fraction;

          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${Math.max(dash - gap, 0)} ${circumference}`}
              strokeDashoffset={offset}
              className="transition-all duration-700"
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tracking-tight text-white">
          {total}
        </span>
        <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
          wards
        </span>
      </div>
    </div>
  );
}

function MiniRing({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  const safeValue = Number.isFinite(value)
    ? Math.min(100, Math.max(0, value))
    : 0;

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="7"
          />

          {/* Progress ring */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition:
                "stroke-dashoffset 700ms ease",
            }}
          />
        </svg>

        <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-white">
          {Math.round(safeValue)}
        </span>
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {label}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          Score health indicator
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Header                                                                     */
/* -------------------------------------------------------------------------- */

function IntelligenceHeader({
  timestamp,
  refreshing,
  onRefresh,
}: {
  timestamp?: string;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  return (
    <header className="mb-7">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-4xl">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-200">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
              SmartDELHI AI Command
            </span>

            <span className="rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Explainable engine online
            </span>
          </div>

          <h1 className="text-4xl font-black tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
            Civic Risk
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-300 to-violet-300 bg-clip-text text-transparent">
              {" "}
              Observatory
            </span>
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 sm:text-base">
            An operational intelligence layer that converts complaint
            severity, demand pressure, backlog, aging and resolution behaviour
            into a transparent ward-level intervention signal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {timestamp && (
            <div className="mr-1 hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3 lg:block">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                Last intelligence cycle
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-300">
                {new Date(timestamp).toLocaleString("en-IN")}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="group inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-xs font-bold text-white transition hover:border-indigo-300/30 hover:bg-indigo-400/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={refreshing ? "animate-spin" : "transition group-hover:rotate-180"}
            />
            {refreshing ? "Recalculating" : "Recalculate AI"}
          </button>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/* Hero                                                                       */
/* -------------------------------------------------------------------------- */

function HeroIntelligence({
  summary,
  wards,
}: {
  summary: Summary;
  wards: WardScore[];
}) {
  const criticalShare =
    summary.totalWardsEvaluated > 0
      ? (summary.criticalWardCount / summary.totalWardsEvaluated) * 100
      : 0;

  const highest = wards[0];

  return (
    <section className="mb-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <GlassCard className="min-h-[390px] p-6 sm:p-8">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-[80px]" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-cyan-500/5 blur-[70px]" />

        <div className="relative flex h-full flex-col justify-between gap-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <CircularScore score={summary.overallScore} />

            <div className="max-w-xl">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">
                <CircleGauge size={13} />
                Delhi-wide intervention signal
              </div>

              <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
                The city is currently operating at{" "}
                <span className={scoreTone(summary.overallScore).text}>
                  {scoreTone(summary.overallScore).label.toLowerCase()}
                </span>{" "}
                civic pressure.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                The score is not a citizen satisfaction rating. It is an
                intervention-priority signal: higher values mean the
                administration should consider faster response, additional
                workforce, infrastructure attention or budget intervention.
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <SignalPill
                  icon={AlertCircle}
                  label={`${formatNumber(summary.totalPendingComplaints)} pending`}
                  tone="warning"
                />
                <SignalPill
                  icon={MapPinned}
                  label={`${summary.totalWardsEvaluated} wards observed`}
                  tone="info"
                />
                <SignalPill
                  icon={CheckCircle2}
                  label={`${summary.averageWardScore} avg score`}
                  tone="success"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <HeroMetric
              label="Critical wards"
              value={summary.criticalWardCount}
              icon={CircleAlert}
              tone="rose"
            />
            <HeroMetric
              label="High priority"
              value={summary.highPriorityWardCount}
              icon={Zap}
              tone="orange"
            />
            <HeroMetric
              label="Total complaints"
              value={shortNumber(summary.totalComplaints)}
              icon={Layers3}
              tone="indigo"
            />
            <HeroMetric
              label="Critical share"
              value={`${criticalShare.toFixed(1)}%`}
              icon={Target}
              tone="cyan"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
              Immediate attention
            </p>
            <h2 className="mt-2 text-xl font-black text-white">
              Highest-risk ward
            </h2>
          </div>
          <div className="rounded-2xl border border-rose-400/15 bg-rose-400/10 p-3 text-rose-300">
            <Radar size={19} />
          </div>
        </div>

        {highest ? (
          <div className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-black tracking-tight text-white">
                  {highest.wardName}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Ward ID · {highest.wardId}
                </p>
              </div>
              <div
                className={`text-5xl font-black tracking-[-0.06em] ${scoreTone(highest.score).text}`}
              >
                {formatScore(highest.score)}
              </div>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-rose-400 transition-all duration-1000"
                style={{ width: `${clamp(highest.score)}%` }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <InsightStat
                label="Pending"
                value={formatNumber(highest.pendingComplaints)}
                accent="text-amber-300"
              />
              <InsightStat
                label="Avg age"
                value={`${formatScore(highest.averageAgeDays)}d`}
                accent="text-orange-300"
              />
              <InsightStat
                label="Resolution"
                value={`${formatScore(highest.resolutionRate)}%`}
                accent="text-cyan-300"
              />
              <InsightStat
                label="Complaints"
                value={formatNumber(highest.totalComplaints)}
                accent="text-indigo-300"
              />
            </div>

            <div className="mt-6 rounded-2xl border border-rose-400/10 bg-rose-400/[0.045] p-4">
              <div className="flex gap-3">
                <CircleAlert className="mt-0.5 shrink-0 text-rose-300" size={17} />
                <div>
                  <p className="text-xs font-bold text-rose-200">
                    Recommended administrative posture
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Review backlog, complaint aging and operational capacity
                    before the next allocation cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </GlassCard>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function SignalPill({
  icon: Icon,
  label,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  tone: "warning" | "info" | "success";
}) {
  const map = {
    warning: "border-amber-400/15 bg-amber-400/5 text-amber-200",
    info: "border-cyan-400/15 bg-cyan-400/5 text-cyan-200",
    success: "border-emerald-400/15 bg-emerald-400/5 text-emerald-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] font-bold ${map[tone]}`}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}

function HeroMetric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone: "rose" | "orange" | "indigo" | "cyan";
}) {
  const colors = {
    rose: "text-rose-300 bg-rose-400/10 border-rose-400/15",
    orange: "text-orange-300 bg-orange-400/10 border-orange-400/15",
    indigo: "text-indigo-300 bg-indigo-400/10 border-indigo-400/15",
    cyan: "text-cyan-300 bg-cyan-400/10 border-cyan-400/15",
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-600">
          {label}
        </span>
        <span className={`rounded-lg border p-1.5 ${colors[tone]}`}>
          <Icon size={12} />
        </span>
      </div>
      <p className="mt-2 text-xl font-black tracking-tight text-white">
        {value}
      </p>
    </div>
  );
}

function InsightStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/20 p-3.5">
      <p className="text-[9px] font-bold uppercase tracking-[0.17em] text-slate-600">
        {label}
      </p>
      <p className={`mt-1.5 text-lg font-black ${accent}`}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-52 items-center justify-center text-center">
      <div>
        <Database className="mx-auto text-slate-700" size={34} />
        <p className="mt-3 text-sm font-semibold text-slate-500">
          No intelligence data available.
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Distribution                                                               */
/* -------------------------------------------------------------------------- */

function RiskDistribution({
  summary,
}: {
  summary: Summary;
}) {
  const total = summary.totalWardsEvaluated;

  return (
    <GlassCard className="p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-300">
            <Activity size={13} />
            Risk topology
          </div>
          <h2 className="mt-2 text-xl font-black text-white">
            Ward priority distribution
          </h2>
          <p className="mt-1 max-w-xl text-xs leading-5 text-slate-500">
            A compact view of how many wards currently sit inside each
            intervention band.
          </p>
        </div>

        <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
          {total} evaluated
        </span>
      </div>

      <div className="mt-7 flex flex-col items-center gap-8 lg:flex-row">
        <Donut
          total={total}
          values={[
            { value: summary.criticalWardCount, color: "#fb7185" },
            { value: summary.highPriorityWardCount, color: "#fb923c" },
            { value: summary.mediumPriorityWardCount, color: "#fbbf24" },
            { value: summary.lowPriorityWardCount, color: "#34d399" },
          ]}
        />

        <div className="grid w-full grid-cols-2 gap-3">
          <DistributionItem
            label="Critical"
            value={summary.criticalWardCount}
            color="rose"
            description="Immediate intervention"
          />
          <DistributionItem
            label="High"
            value={summary.highPriorityWardCount}
            color="orange"
            description="Priority intervention"
          />
          <DistributionItem
            label="Medium"
            value={summary.mediumPriorityWardCount}
            color="amber"
            description="Monitor pressure"
          />
          <DistributionItem
            label="Low"
            value={summary.lowPriorityWardCount}
            color="emerald"
            description="Stable condition"
          />
        </div>
      </div>
    </GlassCard>
  );
}

function DistributionItem({
  label,
  value,
  color,
  description,
}: {
  label: string;
  value: number;
  color: "rose" | "orange" | "amber" | "emerald";
  description: string;
}) {
  const classes = {
    rose: "text-rose-300 border-rose-400/15 bg-rose-400/[0.045]",
    orange: "text-orange-300 border-orange-400/15 bg-orange-400/[0.045]",
    amber: "text-amber-300 border-amber-400/15 bg-amber-400/[0.045]",
    emerald: "text-emerald-300 border-emerald-400/15 bg-emerald-400/[0.045]",
  };

  return (
    <div className={`rounded-2xl border p-4 ${classes[color]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold">{label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
      <p className="mt-1 text-[10px] text-slate-600">{description}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Performance overview                                                       */
/* -------------------------------------------------------------------------- */

function PerformanceOverview({
  wards,
  summary,
}: {
  wards: WardScore[];
  summary: Summary;
}) {
  const topResolution = useMemo(
    () =>
      [...wards]
        .sort((a, b) => b.resolutionRate - a.resolutionRate)
        .slice(0, 5),
    [wards],
  );

  const highestBacklog = useMemo(
    () =>
      [...wards]
        .sort((a, b) => b.pendingComplaints - a.pendingComplaints)
        .slice(0, 5),
    [wards],
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <GlassCard className="p-6">
        <SectionHeading
          eyebrow="Resolution strength"
          title="Best operational performers"
          icon={Award}
          color="emerald"
        />

        <div className="mt-6 space-y-4">
          {topResolution.map((ward, index) => (
            <PerformanceRow
              key={ward.wardId}
              rank={index + 1}
              ward={ward}
              value={ward.resolutionRate}
              suffix="%"
              color="emerald"
            />
          ))}

          {topResolution.length === 0 && <EmptyState />}
        </div>
      </GlassCard>

      <GlassCard className="p-6">
        <SectionHeading
          eyebrow="Backlog pressure"
          title="Where the queue is building"
          icon={TrendingUp}
          color="rose"
        />

        <div className="mt-6 space-y-4">
          {highestBacklog.map((ward, index) => (
            <PerformanceRow
              key={ward.wardId}
              rank={index + 1}
              ward={ward}
              value={ward.pendingComplaints}
              suffix=""
              color="rose"
              maxValue={Math.max(...highestBacklog.map((x) => x.pendingComplaints), 1)}
            />
          ))}

          {highestBacklog.length === 0 && <EmptyState />}
        </div>
      </GlassCard>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  icon: Icon,
  color,
}: {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  color: "emerald" | "rose" | "indigo";
}) {
  const classes = {
    emerald: "text-emerald-300 bg-emerald-400/10 border-emerald-400/15",
    rose: "text-rose-300 bg-rose-400/10 border-rose-400/15",
    indigo: "text-indigo-300 bg-indigo-400/10 border-indigo-400/15",
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`rounded-xl border p-2.5 ${classes[color]}`}>
        <Icon size={17} />
      </span>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-lg font-black text-white">{title}</h2>
      </div>
    </div>
  );
}

function PerformanceRow({
  rank,
  ward,
  value,
  suffix,
  color,
  maxValue,
}: {
  rank: number;
  ward: WardScore;
  value: number;
  suffix: string;
  color: "emerald" | "rose";
  maxValue?: number;
}) {
  const denominator = maxValue ?? 100;
  const width = clamp((value / denominator) * 100);

  return (
    <div className="group">
      <div className="flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.04] text-[10px] font-black text-slate-500">
          {rank}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-xs font-bold text-slate-200">
              {ward.wardName}
            </p>
            <p
              className={`text-xs font-black ${
                color === "emerald" ? "text-emerald-300" : "text-rose-300"
              }`}
            >
              {formatScore(value)}
              {suffix}
            </p>
          </div>

          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                color === "emerald"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-400"
                  : "bg-gradient-to-r from-orange-500 to-rose-500"
              }`}
              style={{ width: `${width}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Controls                                                                   */
/* -------------------------------------------------------------------------- */

function RankingControls({
  query,
  setQuery,
  filter,
  setFilter,
  sort,
  setSort,
  actionableOnly,
  setActionableOnly,
}: {
  query: string;
  setQuery: (value: string) => void;
  filter: PriorityFilter;
  setFilter: (value: PriorityFilter) => void;
  sort: SortMode;
  setSort: (value: SortMode) => void;
  actionableOnly: boolean;
  setActionableOnly: (value: boolean) => void;
}) {
  return (
    <div className="mt-6 flex flex-col gap-3 xl:flex-row xl:items-center">
      <div className="relative min-w-0 flex-1">
        <Search
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"
        />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search ward name or ward ID..."
          className="h-11 w-full rounded-2xl border border-white/[0.07] bg-black/20 pl-11 pr-4 text-xs text-white outline-none transition placeholder:text-slate-700 focus:border-indigo-400/30 focus:bg-indigo-400/[0.025]"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as PriorityFilter[]).map(
          (item) => (
            <button
              type="button"
              key={item}
              onClick={() => setFilter(item)}
              className={[
                "h-11 rounded-2xl border px-3 text-[10px] font-black uppercase tracking-[0.14em] transition",
                filter === item
                  ? "border-indigo-400/30 bg-indigo-400/10 text-indigo-200"
                  : "border-white/[0.07] bg-white/[0.025] text-slate-600 hover:bg-white/[0.05] hover:text-slate-300",
              ].join(" ")}
            >
              {item}
            </button>
          )
        )}
      </div>

      <select
        value={sort}
        onChange={(event) => setSort(event.target.value as SortMode)}
        className="h-11 rounded-2xl border border-white/[0.07] bg-[#0b0f18] px-4 text-xs font-semibold text-slate-300 outline-none"
      >
        <option value="risk-desc">Highest risk first</option>
        <option value="risk-asc">Lowest risk first</option>
        <option value="complaints-desc">Most complaints</option>
        <option value="pending-desc">Most pending</option>
        <option value="resolution-desc">Best resolution</option>
      </select>

      <button
        type="button"
        onClick={() => setActionableOnly(!actionableOnly)}
        className={[
          "inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-4 text-[10px] font-black uppercase tracking-[0.14em] transition",
          actionableOnly
            ? "border-rose-400/25 bg-rose-400/10 text-rose-200"
            : "border-white/[0.07] bg-white/[0.025] text-slate-600",
        ].join(" ")}
      >
        <Filter size={13} />
        Actionable
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Ward intelligence card                                                     */
/* -------------------------------------------------------------------------- */

function WardCard({
  ward,
  index,
  expanded,
  onToggle,
  onInspect,
}: {
  ward: WardScore;
  index: number;
  expanded: boolean;
  onToggle: () => void;
  onInspect: () => void;
}) {
  const tone = scoreTone(ward.score);
  const priority = priorityTone(ward.priorityLevel);

  const factors = [
    {
      label: "Severity",
      value: ward.breakdown.severity.normalizedScore,
      color: "#fb7185",
    },
    {
      label: "Volume",
      value: ward.breakdown.volume.normalizedScore,
      color: "#818cf8",
    },
    {
      label: "Pending",
      value: ward.breakdown.pendingPressure.normalizedScore,
      color: "#fbbf24",
    },
    {
      label: "Aging",
      value: ward.breakdown.aging.normalizedScore,
      color: "#fb923c",
    },
    {
      label: "Resolution",
      value: ward.breakdown.resolutionPerformance.normalizedScore,
      color: "#22d3ee",
    },
  ];

  return (
    <article className="group border-t border-white/[0.055] first:border-t-0">
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[60px_minmax(180px,1fr)_180px_160px_170px_auto] xl:items-center">
          <div className="flex items-center justify-between xl:block">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
                Rank
              </p>
              <p className="mt-1 text-xl font-black text-indigo-300">
                #{index + 1}
              </p>
            </div>

            <div className="xl:hidden">
              <PriorityBadge priority={ward.priorityLevel} />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${tone.border} ${tone.soft}`}
              >
                <Building2 size={18} className={tone.text} />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-white sm:text-lg">
                  {ward.wardName}
                </h3>
                <p className="mt-1 text-[10px] font-semibold text-slate-700">
                  {ward.wardId} · {ward.totalComplaints} total complaints
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
              AI score
            </p>

            <div className="flex items-center gap-3">
              <div
                className={`text-3xl font-black tracking-[-0.05em] ${tone.text}`}
              >
                {formatScore(ward.score)}
              </div>

              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      ward.score >= 80
                        ? "from-orange-500 to-rose-500"
                        : ward.score >= 60
                          ? "from-amber-500 to-orange-500"
                          : ward.score >= 40
                            ? "from-yellow-400 to-amber-500"
                            : "from-emerald-400 to-cyan-400"
                    } transition-all duration-700`}
                    style={{ width: `${clamp(ward.score)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden xl:block">
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
              Priority
            </p>
            <PriorityBadge priority={ward.priorityLevel} />
          </div>

          <div>
            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
              Pressure
            </p>

            <div className="flex gap-1.5">
              <MicroMetric
                label="P"
                value={ward.pendingComplaints}
                tone="amber"
              />
              <MicroMetric
                label="A"
                value={`${formatScore(ward.averageAgeDays)}d`}
                tone="orange"
              />
              <MicroMetric
                label="R"
                value={`${Math.round(ward.resolutionRate)}%`}
                tone="cyan"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 xl:justify-end">
            <button
              type="button"
              onClick={onInspect}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 text-[10px] font-black uppercase tracking-[0.12em] text-slate-500 transition hover:border-indigo-400/20 hover:bg-indigo-400/10 hover:text-indigo-200"
            >
              <Eye size={13} />
              Inspect
            </button>

            <button
              type="button"
              onClick={onToggle}
              aria-expanded={expanded}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-slate-500 transition hover:border-white/15 hover:text-white"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {factors.map((factor) => (
            <FactorChip key={factor.label} {...factor} />
          ))}
        </div>
      </div>

      {expanded && (
        <WardExpanded
          ward={ward}
          onInspect={onInspect}
        />
      )}
    </article>
  );
}

function PriorityBadge({ priority }: { priority: PriorityLevel }) {
  const tone = priorityTone(priority);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] ${tone.bg} ${tone.border} ${tone.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {priority}
    </span>
  );
}

function MicroMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone: "amber" | "orange" | "cyan";
}) {
  const classes = {
    amber: "text-amber-300 border-amber-400/10 bg-amber-400/5",
    orange: "text-orange-300 border-orange-400/10 bg-orange-400/5",
    cyan: "text-cyan-300 border-cyan-400/10 bg-cyan-400/5",
  };

  return (
    <span
      className={`rounded-lg border px-2 py-1 text-[9px] font-black ${classes[tone]}`}
    >
      {label} {value}
    </span>
  );
}

function FactorChip({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.055] bg-black/20 px-2.5 py-1.5">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[9px] font-bold text-slate-600">{label}</span>
      <span className="text-[9px] font-black text-slate-300">
        {Math.round(value)}
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Expanded ward intelligence                                                 */
/* -------------------------------------------------------------------------- */

function WardExpanded({
  ward,
  onInspect,
}: {
  ward: WardScore;
  onInspect: () => void;
}) {
  const items = [
    {
      name: "Severity",
      data: ward.breakdown.severity,
      icon: CircleAlert,
      color: "#fb7185",
    },
    {
      name: "Complaint volume",
      data: ward.breakdown.volume,
      icon: Layers3,
      color: "#818cf8",
    },
    {
      name: "Pending pressure",
      data: ward.breakdown.pendingPressure,
      icon: Clock3,
      color: "#fbbf24",
    },
    {
      name: "Complaint aging",
      data: ward.breakdown.aging,
      icon: TrendingUp,
      color: "#fb923c",
    },
    {
      name: "Resolution performance",
      data: ward.breakdown.resolutionPerformance,
      icon: ShieldCheck,
      color: "#22d3ee",
    },
  ];

  return (
    <div className="border-t border-white/[0.055] bg-black/20 px-5 pb-6 pt-5 sm:px-6">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_260px]">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.22em] text-indigo-300">
                Explainable AI trace
              </p>
              <h4 className="mt-1 text-lg font-black text-white">
                Why {ward.wardName} received {formatScore(ward.score)}
              </h4>
            </div>

            <button
              type="button"
              onClick={onInspect}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-indigo-200"
            >
              <Maximize2 size={12} />
              Open full analysis
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {items.map((item) => (
              <BreakdownCard key={item.name} {...item} />
            ))}
          </div>
        </div>

        <WardHealthPanel ward={ward} />
      </div>
    </div>
  );
}

function BreakdownCard({
  name,
  data,
  icon: Icon,
  color,
}: {
  name: string;
  data: ScoreComponent;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#080b12] p-4">
      <div className="flex items-center justify-between gap-2">
        <span
          className="rounded-lg border p-2"
          style={{
            color,
            borderColor: `${color}25`,
            backgroundColor: `${color}10`,
          }}
        >
          <Icon size={14} />
        </span>

        <span className="text-[9px] font-black text-slate-700">
          ×{data.weight}
        </span>
      </div>

      <p className="mt-4 text-[10px] font-bold text-slate-400">{name}</p>

      <p className="mt-1 text-2xl font-black text-white">
        {Math.round(data.normalizedScore)}
      </p>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${clamp(data.normalizedScore)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <p className="mt-3 text-[10px] leading-5 text-slate-600">
        {data.description}
      </p>

      <div className="mt-3 border-t border-white/[0.05] pt-3 text-[9px] text-slate-700">
        Weighted contribution{" "}
        <span className="font-bold text-slate-400">
          {formatScore(data.weightedScore)}
        </span>
      </div>
    </div>
  );
}

function WardHealthPanel({ ward }: { ward: WardScore }) {
  const stats = [
    ["Resolved", formatNumber(ward.resolvedComplaints), "text-emerald-300"],
    ["Pending", formatNumber(ward.pendingComplaints), "text-amber-300"],
    ["Average age", `${formatScore(ward.averageAgeDays)}d`, "text-orange-300"],
    ["Resolution", `${formatScore(ward.resolutionRate)}%`, "text-cyan-300"],
  ] as const;

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-[#080b12] p-4">
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-700">
        Ward health
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {stats.map(([label, value, color]) => (
          <div key={label} className="rounded-xl bg-white/[0.025] p-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-700">
              {label}
            </p>
            <p className={`mt-1 text-sm font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-white/[0.05] bg-black/20 p-3">
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-indigo-300" />
          <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
            AI interpretation
          </p>
        </div>

        <p className="mt-2 text-[10px] leading-5 text-slate-600">
          {ward.score >= 80
            ? "Strong evidence of immediate operational pressure. Review response capacity and unresolved demand."
            : ward.score >= 60
              ? "Meaningful pressure detected. Prioritize queue reduction and monitor aging."
              : ward.score >= 40
                ? "Moderate pressure. Continue monitoring before the next intervention cycle."
                : "Current indicators remain comparatively stable."}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Full ward modal                                                            */
/* -------------------------------------------------------------------------- */

function WardAnalysisModal({
  ward,
  onClose,
}: {
  ward: WardScore;
  onClose: () => void;
}) {
  const tone = scoreTone(ward.score);

  const factors = [
    ward.breakdown.severity,
    ward.breakdown.volume,
    ward.breakdown.pendingPressure,
    ward.breakdown.aging,
    ward.breakdown.resolutionPerformance,
  ];

  const strongest = [...factors].sort(
    (a, b) => b.normalizedScore - a.normalizedScore
  )[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-md sm:items-center sm:p-6">
      <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-t-[30px] border border-white/10 bg-[#080b12] shadow-[0_40px_120px_rgba(0,0,0,0.65)] sm:rounded-[30px]">
        <div className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#080b12]/95 px-5 py-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-indigo-300">
                Ward intelligence dossier
              </p>
              <h2 className="mt-1 text-xl font-black text-white">
                {ward.wardName}
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-slate-500 hover:text-white"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:p-7 lg:grid-cols-[320px_1fr]">
          <GlassCard className="p-6">
            <div className="flex justify-center">
              <CircularScore score={ward.score} size={235} label="WARD RISK" />
            </div>

            <div className="mt-5 flex justify-center">
              <PriorityBadge priority={ward.priorityLevel} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <InsightStat
                label="Complaints"
                value={formatNumber(ward.totalComplaints)}
                accent="text-indigo-300"
              />
              <InsightStat
                label="Pending"
                value={formatNumber(ward.pendingComplaints)}
                accent="text-amber-300"
              />
              <InsightStat
                label="Resolved"
                value={formatNumber(ward.resolvedComplaints)}
                accent="text-emerald-300"
              />
              <InsightStat
                label="Resolution"
                value={`${formatScore(ward.resolutionRate)}%`}
                accent="text-cyan-300"
              />
            </div>

            <div className="mt-3">
              <InsightStat
                label="Average complaint age"
                value={`${formatScore(ward.averageAgeDays)} days`}
                accent="text-orange-300"
              />
            </div>
          </GlassCard>

          <div className="space-y-5">
            <GlassCard className="p-6">
              <SectionHeading
                eyebrow="Risk anatomy"
                title="Circular factor analysis"
                icon={Radar}
                color="indigo"
              />

              <div className="mt-7 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="flex justify-center">
                  <RadarWheel ward={ward} />
                </div>

                <div className="space-y-4">
                  <FactorExplanation
                    label="Severity"
                    data={ward.breakdown.severity}
                    color="#fb7185"
                  />
                  <FactorExplanation
                    label="Volume"
                    data={ward.breakdown.volume}
                    color="#818cf8"
                  />
                  <FactorExplanation
                    label="Pending pressure"
                    data={ward.breakdown.pendingPressure}
                    color="#fbbf24"
                  />
                  <FactorExplanation
                    label="Aging"
                    data={ward.breakdown.aging}
                    color="#fb923c"
                  />
                  <FactorExplanation
                    label="Resolution"
                    data={ward.breakdown.resolutionPerformance}
                    color="#22d3ee"
                  />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/10 p-2.5 text-indigo-300">
                  <BrainCircuit size={17} />
                </div>

                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-300">
                    AI decision support
                  </p>
                  <h3 className="mt-1 text-base font-black text-white">
                    What should administration look at first?
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                <ActionRecommendation
                  number="01"
                  title="Address strongest pressure"
                  body={`The ${strongest ? "highest-contributing factor" : "leading factor"} should be reviewed before lower-impact indicators.`}
                  color="rose"
                />
                <ActionRecommendation
                  number="02"
                  title="Reduce unresolved queue"
                  body={`${formatNumber(ward.pendingComplaints)} complaints are currently pending in this ward.`}
                  color="amber"
                />
                <ActionRecommendation
                  number="03"
                  title="Protect response quality"
                  body={`Current resolution performance is ${formatScore(ward.resolutionRate)}%.`}
                  color="cyan"
                />
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarWheel({ ward }: { ward: WardScore }) {
  const values = [
    ward.breakdown.severity.normalizedScore,
    ward.breakdown.volume.normalizedScore,
    ward.breakdown.pendingPressure.normalizedScore,
    ward.breakdown.aging.normalizedScore,
    ward.breakdown.resolutionPerformance.normalizedScore,
  ];

  const points = values.map((value, index) => {
    const angle = (-90 + index * 72) * (Math.PI / 180);
    const r = 78 * (clamp(value) / 100);
    return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
  });

  return (
    <div className="relative h-64 w-64">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <polygon
          points="100,20 176,75 147,164 53,164 24,75"
          fill="rgba(129,140,248,0.025)"
          stroke="rgba(255,255,255,0.07)"
        />
        <polygon
          points="100,42 155,82 134,145 66,145 45,82"
          fill="none"
          stroke="rgba(255,255,255,0.055)"
        />
        <polygon
          points="100,64 134,88 121,126 79,126 66,88"
          fill="none"
          stroke="rgba(255,255,255,0.055)"
        />

        {[0, 1, 2, 3, 4].map((index) => {
          const angle = (-90 + index * 72) * (Math.PI / 180);
          return (
            <line
              key={index}
              x1="100"
              y1="100"
              x2={100 + Math.cos(angle) * 80}
              y2={100 + Math.sin(angle) * 80}
              stroke="rgba(255,255,255,0.06)"
            />
          );
        })}

        <polygon
          points={points.join(" ")}
          fill="rgba(129,140,248,0.16)"
          stroke="#818cf8"
          strokeWidth="2"
        />

        {points.map((point, index) => {
          const [x, y] = point.split(",");
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="3.5"
              fill="#0b0f18"
              stroke="#a5b4fc"
              strokeWidth="2"
            />
          );
        })}
      </svg>

      <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[8px] font-black uppercase tracking-[0.12em] text-slate-600">
        Severity
      </span>
      <span className="absolute right-0 top-[31%] text-[8px] font-black uppercase tracking-[0.12em] text-slate-600">
        Volume
      </span>
      <span className="absolute bottom-[10%] right-[11%] text-[8px] font-black uppercase tracking-[0.12em] text-slate-600">
        Pending
      </span>
      <span className="absolute bottom-[10%] left-[11%] text-[8px] font-black uppercase tracking-[0.12em] text-slate-600">
        Aging
      </span>
      <span className="absolute left-0 top-[31%] text-[8px] font-black uppercase tracking-[0.12em] text-slate-600">
        Resolution
      </span>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="rounded-full border border-white/[0.07] bg-[#080b12]/90 px-3 py-2 text-center">
          <p className="text-lg font-black text-white">
            {formatScore(ward.score)}
          </p>
          <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-slate-600">
            composite
          </p>
        </div>
      </div>
    </div>
  );
}

function FactorExplanation({
  label,
  data,
  color,
}: {
  label: string;
  data: ScoreComponent;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: color }}
          />
          <p className="text-xs font-bold text-slate-300">{label}</p>
        </div>

        <p className="text-xs font-black text-white">
          {Math.round(data.normalizedScore)}
        </p>
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${clamp(data.normalizedScore)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <p className="mt-2 text-[9px] leading-4 text-slate-600">
        {data.description}
      </p>
    </div>
  );
}

function ActionRecommendation({
  number,
  title,
  body,
  color,
}: {
  number: string;
  title: string;
  body: string;
  color: "rose" | "amber" | "cyan";
}) {
  const styles = {
    rose: "border-rose-400/10 bg-rose-400/[0.04] text-rose-300",
    amber: "border-amber-400/10 bg-amber-400/[0.04] text-amber-300",
    cyan: "border-cyan-400/10 bg-cyan-400/[0.04] text-cyan-300",
  };

  return (
    <div className={`rounded-2xl border p-4 ${styles[color]}`}>
      <p className="text-[9px] font-black tracking-[0.18em]">{number}</p>
      <p className="mt-3 text-xs font-black text-white">{title}</p>
      <p className="mt-2 text-[10px] leading-5 text-slate-600">{body}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main page                                                                  */
/* -------------------------------------------------------------------------- */

function AIScoreDashboard() {
  const [wards, setWards] = useState<WardScore[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [timestamp, setTimestamp] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [expandedWard, setExpandedWard] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<WardScore | null>(null);

  const [query, setQuery] = useState("");
  const [priorityFilter, setPriorityFilter] =
    useState<PriorityFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("risk-desc");
  const [actionableOnly, setActionableOnly] = useState(false);

  const fetchScores = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await fetch("/api/admin/ai-score", {
        method: "GET",
        cache: "no-store",
      });

      const data: APIResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error("Failed to load AI ward scores.");
      }

      setWards(data.rankings ?? []);
      setSummary(data.summary ?? null);
      setTimestamp(data.timestamp ?? new Date().toISOString());
    } catch (fetchError) {
      console.error("AI_SCORE_DASHBOARD_ERROR:", fetchError);

      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load AI scores."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  const filteredWards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const result = wards.filter((ward) => {
      const matchesQuery =
        !normalizedQuery ||
        ward.wardName.toLowerCase().includes(normalizedQuery) ||
        ward.wardId.toLowerCase().includes(normalizedQuery);

      const matchesPriority =
        priorityFilter === "ALL" ||
        ward.priorityLevel === priorityFilter;

      const matchesActionable =
        !actionableOnly ||
        ward.priorityLevel === "CRITICAL" ||
        ward.priorityLevel === "HIGH";

      return matchesQuery && matchesPriority && matchesActionable;
    });

    return [...result].sort((a, b) => {
      switch (sortMode) {
        case "risk-asc":
          return a.score - b.score;
        case "complaints-desc":
          return b.totalComplaints - a.totalComplaints;
        case "pending-desc":
          return b.pendingComplaints - a.pendingComplaints;
        case "resolution-desc":
          return b.resolutionRate - a.resolutionRate;
        default:
          return b.score - a.score;
      }
    });
  }, [wards, query, priorityFilter, actionableOnly, sortMode]);

  const criticalWard = useMemo(
    () => [...wards].sort((a, b) => b.score - a.score)[0] ?? null,
    [wards]
  );

  const averageResolution = useMemo(() => {
    if (!wards.length) return 0;
    return wards.reduce((sum, ward) => sum + ward.resolutionRate, 0) / wards.length;
  }, [wards]);

  const averageAge = useMemo(() => {
    if (!wards.length) return 0;
    return wards.reduce((sum, ward) => sum + ward.averageAgeDays, 0) / wards.length;
  }, [wards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070d] text-white">
        <AmbientBackground />
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="relative mx-auto h-20 w-20">
              <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/10" />
              <div className="absolute inset-2 rounded-full border border-indigo-400/20 bg-indigo-400/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="animate-pulse text-indigo-300" size={28} />
              </div>
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.25em] text-slate-400">
              Initializing civic intelligence
            </p>
            <p className="mt-2 text-[10px] text-slate-700">
              Loading ward risk model...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#05070d] text-white">
      <AmbientBackground />

      <main className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 xl:px-10">
        <IntelligenceHeader
          timestamp={timestamp}
          refreshing={refreshing}
          onRefresh={() => fetchScores(true)}
        />

        {error && (
          <GlassCard className="mb-6 border-rose-400/20 bg-rose-400/[0.045] p-5">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 shrink-0 text-rose-300" size={18} />
              <div className="flex-1">
                <p className="text-sm font-bold text-rose-200">{error}</p>
                <p className="mt-1 text-xs text-slate-600">
                  The dashboard could not retrieve the current AI scoring
                  cycle.
                </p>
              </div>
              <button
                type="button"
                onClick={() => fetchScores(true)}
                className="rounded-xl border border-rose-400/15 bg-rose-400/10 px-3 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-rose-200"
              >
                Retry
              </button>
            </div>
          </GlassCard>
        )}

        {summary ? (
          <>
            <HeroIntelligence summary={summary} wards={wards} />

            <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <RiskDistribution summary={summary} />

              <GlassCard className="p-6">
                <SectionHeading
                  eyebrow="Operational pulse"
                  title="City-wide response health"
                  icon={Gauge}
                  color="indigo"
                />

                <div className="mt-7 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <MiniRing
                    value={averageResolution}
                    label="Average resolution"
                    color="#22d3ee"
                  />
                  <MiniRing
                    value={Math.max(0, 100 - averageAge * 5)}
                    label="Age health proxy"
                    color="#f59e0b"
                  />
                </div>

                <div className="mt-7 grid grid-cols-3 gap-2">
                  <PulseStat
                    label="Open queue"
                    value={shortNumber(summary.totalPendingComplaints)}
                    icon={Clock3}
                  />
                  <PulseStat
                    label="Observed"
                    value={String(summary.totalWardsEvaluated)}
                    icon={MapPinned}
                  />
                  <PulseStat
                    label="Average risk"
                    value={formatScore(summary.averageWardScore)}
                    icon={Radar}
                  />
                </div>
              </GlassCard>
            </div>

            <div className="mb-5">
              <PerformanceOverview wards={wards} summary={summary} />
            </div>

            <GlassCard className="overflow-hidden">
              <div className="p-6 sm:p-7">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-indigo-300">
                      <GitCompare size={13} />
                      Explainable ranking engine
                    </div>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                      Ward intervention matrix
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
                      Compare civic pressure across wards, inspect the factors
                      behind each score, and isolate the wards requiring action.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/20 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-cyan-300" />
                    <span className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-600">
                      Live model output
                    </span>
                  </div>
                </div>

                <RankingControls
                  query={query}
                  setQuery={setQuery}
                  filter={priorityFilter}
                  setFilter={setPriorityFilter}
                  sort={sortMode}
                  setSort={setSortMode}
                  actionableOnly={actionableOnly}
                  setActionableOnly={setActionableOnly}
                />
              </div>

              <div className="border-t border-white/[0.055]">
                {filteredWards.length === 0 ? (
                  <div className="px-6 py-20 text-center">
                    <Search className="mx-auto text-slate-700" size={32} />
                    <p className="mt-4 text-sm font-bold text-slate-500">
                      No wards match the current filters.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setPriorityFilter("ALL");
                        setActionableOnly(false);
                      }}
                      className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.03] px-4 py-2 text-[9px] font-black uppercase tracking-[0.14em] text-slate-500 hover:text-white"
                    >
                      Reset filters
                    </button>
                  </div>
                ) : (
                  filteredWards.map((ward, index) => (
                    <WardCard
                      key={`${ward.wardId}-${index}`}
                      ward={ward}
                      index={index}
                      expanded={expandedWard === ward.wardId}
                      onToggle={() =>
                        setExpandedWard(
                          expandedWard === ward.wardId ? null : ward.wardId
                        )
                      }
                      onInspect={() => setSelectedWard(ward)}
                    />
                  ))
                )}
              </div>
            </GlassCard>

            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
              <GovernanceCard
                icon={ShieldCheck}
                title="Explainable"
                text="Every score can be decomposed into interpretable civic pressure factors."
                tone="indigo"
              />
              <GovernanceCard
                icon={Database}
                title="Data-driven"
                text="The interface surfaces model output directly from the administration API."
                tone="cyan"
              />
              <GovernanceCard
                icon={Target}
                title="Action-oriented"
                text="Ranking is designed to support prioritization rather than simply display statistics."
                tone="rose"
              />
            </div>

            <footer className="mt-8 flex flex-col gap-3 border-t border-white/[0.05] py-6 text-[9px] font-semibold leading-5 text-slate-700 sm:flex-row sm:items-center sm:justify-between">
              <p>
                SmartDELHI · Civic Risk Observatory · AI-assisted administrative
                decision support
              </p>
              <p>
                Model output should be reviewed with operational and field
                intelligence before resource decisions.
              </p>
            </footer>
          </>
        ) : (
          <GlassCard className="p-10">
            <EmptyState />
          </GlassCard>
        )}
      </main>

      {selectedWard && (
        <WardAnalysisModal
          ward={selectedWard}
          onClose={() => setSelectedWard(null)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pulse / governance                                                         */
/* -------------------------------------------------------------------------- */

function PulseStat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.055] bg-black/20 p-3">
      <div className="flex items-center justify-between">
        <p className="text-[8px] font-black uppercase tracking-[0.16em] text-slate-700">
          {label}
        </p>
        <Icon size={12} className="text-slate-700" />
      </div>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>
  );
}

function GovernanceCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  tone: "indigo" | "cyan" | "rose";
}) {
  const styles = {
    indigo: "text-indigo-300 border-indigo-400/10 bg-indigo-400/[0.035]",
    cyan: "text-cyan-300 border-cyan-400/10 bg-cyan-400/[0.035]",
    rose: "text-rose-300 border-rose-400/10 bg-rose-400/[0.035]",
  };

  return (
    <GlassCard className={`p-5 ${styles[tone]}`}>
      <Icon size={18} />
      <h3 className="mt-4 text-sm font-black text-white">{title}</h3>
      <p className="mt-2 text-[10px] leading-5 text-slate-600">{text}</p>
    </GlassCard>
  );
}

/* -------------------------------------------------------------------------- */
/* Page export                                                                */
/* -------------------------------------------------------------------------- */

export default function AdminAIScorePage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AIScoreDashboard />
    </AuthGuard>
  );
}


