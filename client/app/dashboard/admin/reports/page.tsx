"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import AuthGuard from "@/components/auth/AuthGuard";

interface Complaint {
  id: string;
  title: string;
  category: string;
  ward: string;
  status: string;
  priority: string;
  createdAt: string;
  workCompletedAt?: string | null;
  citizenVerified: boolean;
  assignedWorker?: {
    name: string;
    ward?: string | null;
  } | null;
}

interface Summary {
  total: number;
  resolved: number;
  pending: number;
  inProgress: number;
  verified: number;
  resolutionRate: number;
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[_-]/g, " ");
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusStyle(status: string) {
  const value = normalize(status);

  if (
    value.includes("resolved") ||
    value.includes("completed") ||
    value.includes("closed")
  ) {
    return {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      dot: "bg-emerald-400",
    };
  }

  if (value.includes("progress")) {
    return {
      bg: "bg-blue-500/10",
      text: "text-blue-400",
      border: "border-blue-500/20",
      dot: "bg-blue-400",
    };
  }

  return {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    dot: "bg-amber-400",
  };
}

function getPriorityStyle(priority: string) {
  const value = normalize(priority);

  if (value.includes("critical")) {
    return "bg-red-500/10 text-red-400 border-red-500/20";
  }

  if (value.includes("high")) {
    return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  }

  if (value.includes("medium")) {
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  }

  return "bg-slate-500/10 text-slate-400 border-slate-500/20";
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.055]">
      <div
        className={cn(
          "absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-20 transition group-hover:opacity-40",
          color
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>

          {sub && (
            <p className="mt-2 text-xs text-slate-500">
              {sub}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]",
            color
          )}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-400">
        {eyebrow}
      </p>

      <h2 className="mt-1 text-xl font-bold tracking-tight text-white">
        {title}
      </h2>

      {description && (
        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      )}
    </div>
  );
}

function ProgressBar({
  value,
  color = "bg-blue-500",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
      <div
        className={cn(
          "h-full rounded-full transition-all duration-700",
          color
        )}
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
        }}
      />
    </div>
  );
}

function ReportsDashboard() {
  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [filter, setFilter] =
    useState("ALL");

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/reports",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load reports"
        );
      }

      setSummary(data.summary);
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(
        "REPORTS_DASHBOARD_ERROR:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const downloadReport = () => {
    window.open(
      "/api/admin/reports/export",
      "_blank"
    );
  };

  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};

    complaints.forEach((complaint) => {
      const category =
        complaint.category || "Other";

      map[category] =
        (map[category] || 0) + 1;
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [complaints]);

  const wardStats = useMemo(() => {
    const map: Record<
      string,
      {
        total: number;
        resolved: number;
        pending: number;
      }
    > = {};

    complaints.forEach((complaint) => {
      const ward =
        complaint.ward || "Unknown Ward";

      if (!map[ward]) {
        map[ward] = {
          total: 0,
          resolved: 0,
          pending: 0,
        };
      }

      map[ward].total += 1;

      const status =
        normalize(complaint.status);

      if (
        status.includes("resolved") ||
        status.includes("completed") ||
        status.includes("closed")
      ) {
        map[ward].resolved += 1;
      } else {
        map[ward].pending += 1;
      }
    });

    return Object.entries(map)
      .map(([ward, data]) => ({
        ward,
        ...data,
        rate:
          data.total > 0
            ? (data.resolved /
                data.total) *
              100
            : 0,
      }))
      .sort(
        (a, b) =>
          b.rate - a.rate
      );
  }, [complaints]);

  const priorityStats = useMemo(() => {
    const map: Record<string, number> = {};

    complaints.forEach((complaint) => {
      const priority =
        complaint.priority || "Normal";

      map[priority] =
        (map[priority] || 0) + 1;
    });

    return Object.entries(map).sort(
      (a, b) => b[1] - a[1]
    );
  }, [complaints]);

  const filteredComplaints =
    useMemo(() => {
      return complaints.filter(
        (complaint) => {
          const matchesSearch =
            !search ||
            complaint.title
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            complaint.ward
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            complaint.category
              .toLowerCase()
              .includes(search.toLowerCase());

          const matchesFilter =
            filter === "ALL" ||
            normalize(
              complaint.status
            ) === normalize(filter);

          return (
            matchesSearch &&
            matchesFilter
          );
        }
      );
    }, [
      complaints,
      search,
      filter,
    ]);

  const attentionWards = [...wardStats]
    .sort((a, b) => a.rate - b.rate)
    .slice(0, 5);

  const bestWards = [...wardStats]
    .sort((a, b) => b.rate - a.rate)
    .slice(0, 5);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="mx-auto max-w-[1500px] p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 w-72 rounded-xl bg-white/5" />
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(
                (item) => (
                  <div
                    key={item}
                    className="h-32 rounded-2xl bg-white/5"
                  />
                )
              )}
            </div>
            <div className="h-80 rounded-2xl bg-white/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      {/* ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute right-[5%] top-[30%] h-[350px] w-[350px] rounded-full bg-purple-600/10 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[35%] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[140px]" />
      </div>

      <main className="relative mx-auto max-w-[1500px] px-5 py-7 md:px-8 lg:px-10">
        {/* HEADER */}
        <header className="mb-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,.8)]" />

                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-400">
                  Live civic intelligence
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] md:text-5xl">
                Reports
                <span className="ml-3 bg-gradient-to-r from-blue-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                  Command Center
                </span>
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
                Monitor Delhi's civic complaint
                ecosystem, identify service
                bottlenecks and turn complaint
                data into actionable
                administrative intelligence.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={fetchReports}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={downloadReport}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/30"
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </header>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* KPI STRIP */}
        {summary && (
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <StatCard
              label="Total complaints"
              value={summary.total}
              icon={FileText}
              color="text-blue-400"
              sub="All recorded civic issues"
            />

            <StatCard
              label="Resolved"
              value={summary.resolved}
              icon={CheckCircle2}
              color="text-emerald-400"
              sub={`${summary.resolutionRate}% resolution rate`}
            />

            <StatCard
              label="In progress"
              value={summary.inProgress}
              icon={Activity}
              color="text-cyan-400"
              sub="Currently under action"
            />

            <StatCard
              label="Pending"
              value={summary.pending}
              icon={Clock3}
              color="text-amber-400"
              sub="Requires intervention"
            />

            <StatCard
              label="Citizen verified"
              value={summary.verified}
              icon={ShieldCheck}
              color="text-purple-400"
              sub="Verified outcomes"
            />
          </section>
        )}

        {/* TOP INTELLIGENCE */}
        {summary && (
          <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_.8fr_.8fr]">
            {/* Resolution */}
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6 backdrop-blur-xl">
              <SectionHeader
                eyebrow="Performance"
                title="Resolution intelligence"
                description="How efficiently the civic system is closing reported issues."
              />

              <div className="flex flex-col gap-7 md:flex-row md:items-center">
                <div className="relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center rounded-full bg-[conic-gradient(#22c55e_0deg,#22c55e_calc(var(--rate)*3.6deg),rgba(255,255,255,.06)_calc(var(--rate)*3.6deg),rgba(255,255,255,.06)_360deg)]"
                  style={
                    {
                      "--rate":
                        summary.resolutionRate,
                    } as React.CSSProperties
                  }
                >
                  <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-[#07101f]">
                    <span className="text-4xl font-black">
                      {summary.resolutionRate}%
                    </span>
                    <span className="text-xs text-slate-500">
                      resolved
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-5">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">
                        Resolved
                      </span>
                      <span className="font-semibold text-emerald-400">
                        {summary.resolved}
                      </span>
                    </div>

                    <ProgressBar
                      value={
                        summary.total
                          ? (summary.resolved /
                              summary.total) *
                            100
                          : 0
                      }
                      color="bg-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">
                        In progress
                      </span>
                      <span className="font-semibold text-blue-400">
                        {summary.inProgress}
                      </span>
                    </div>

                    <ProgressBar
                      value={
                        summary.total
                          ? (summary.inProgress /
                              summary.total) *
                            100
                          : 0
                      }
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">
                        Pending
                      </span>
                      <span className="font-semibold text-amber-400">
                        {summary.pending}
                      </span>
                    </div>

                    <ProgressBar
                      value={
                        summary.total
                          ? (summary.pending /
                              summary.total) *
                            100
                          : 0
                      }
                      color="bg-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI INSIGHT */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/[0.14] via-cyan-500/[0.05] to-transparent p-6">
              <div className="absolute right-[-30px] top-[-30px] h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />

              <div className="relative">
                <div className="mb-5 flex items-center gap-2">
                  <Sparkles
                    size={18}
                    className="text-cyan-300"
                  />

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Smart insight
                  </span>
                </div>

                <h3 className="text-xl font-bold">
                  Administrative attention
                  required
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {summary.pending > 0
                    ? `${summary.pending} complaints are currently pending. These cases should be prioritized for ward-level intervention.`
                    : "No pending complaints detected. Civic response is currently operating without a pending backlog."}
                </p>

                <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-black/10 p-4">
                  <Target
                    size={20}
                    className="text-cyan-300"
                  />

                  <div>
                    <p className="text-xs text-slate-500">
                      Recommended focus
                    </p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {summary.pending >
                      summary.resolved
                        ? "Reduce pending backlog"
                        : "Maintain resolution momentum"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PRIORITY */}
            <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6">
              <SectionHeader
                eyebrow="Risk"
                title="Priority load"
                description="Complaint severity distribution."
              />

              <div className="space-y-4">
                {priorityStats.length ===
                0 ? (
                  <p className="text-sm text-slate-600">
                    No priority data.
                  </p>
                ) : (
                  priorityStats.map(
                    ([priority, count]) => {
                      const percentage =
                        complaints.length
                          ? (count /
                              complaints.length) *
                            100
                          : 0;

                      return (
                        <div key={priority}>
                          <div className="mb-2 flex justify-between">
                            <span className="text-sm text-slate-400">
                              {priority}
                            </span>

                            <span className="text-sm font-bold text-white">
                              {count}
                            </span>
                          </div>

                          <ProgressBar
                            value={
                              percentage
                            }
                            color={
                              normalize(
                                priority
                              ).includes(
                                "critical"
                              )
                                ? "bg-red-500"
                                : normalize(
                                      priority
                                    ).includes(
                                      "high"
                                    )
                                  ? "bg-orange-500"
                                  : "bg-blue-500"
                            }
                          />
                        </div>
                      );
                    }
                  )
                )}
              </div>
            </div>
          </section>
        )}

        {/* ANALYTICS GRID */}
        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* CATEGORY */}
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6">
            <SectionHeader
              eyebrow="Issue landscape"
              title="Civic issue distribution"
              description="Categories generating the highest complaint volume."
            />

            <div className="space-y-5">
              {categoryStats.length ===
              0 ? (
                <p className="text-sm text-slate-600">
                  No category data.
                </p>
              ) : (
                categoryStats.map(
                  ([category, count], index) => {
                    const percentage =
                      complaints.length
                        ? (count /
                            complaints.length) *
                          100
                        : 0;

                    return (
                      <div key={category}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-400">
                              {index + 1}
                            </span>

                            <span className="text-sm font-medium text-slate-300">
                              {category}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-white">
                            {count}
                          </span>
                        </div>

                        <ProgressBar
                          value={percentage}
                        />
                      </div>
                    );
                  }
                )
              )}
            </div>
          </div>

          {/* WARD PERFORMANCE */}
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.035] p-6">
            <SectionHeader
              eyebrow="Ward intelligence"
              title="Performance leaders"
              description="Wards with the strongest complaint resolution performance."
            />

            <div className="space-y-3">
              {bestWards.length ===
              0 ? (
                <p className="text-sm text-slate-600">
                  No ward data.
                </p>
              ) : (
                bestWards.map(
                  (ward, index) => (
                    <div
                      key={ward.ward}
                      className="flex items-center gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.025] p-3"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-400">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-slate-200">
                            {ward.ward}
                          </span>

                          <span className="text-sm font-bold text-emerald-400">
                            {ward.rate.toFixed(
                              0
                            )}
                            %
                          </span>
                        </div>

                        <div className="mt-2">
                          <ProgressBar
                            value={ward.rate}
                            color="bg-emerald-500"
                          />
                        </div>
                      </div>
                    </div>
                  )
                )
              )}
            </div>
          </div>
        </section>

        {/* ATTENTION REQUIRED */}
        <section className="mb-8 rounded-3xl border border-orange-500/15 bg-gradient-to-br from-orange-500/[0.06] to-transparent p-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400">
                Intervention map
              </p>

              <h2 className="mt-1 text-xl font-bold">
                Wards requiring attention
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Lower resolution performance indicates
                where administrative intervention may be
                required.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-orange-300">
              <ArrowDownRight size={15} />
              Lowest resolution rate
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {attentionWards.map(
              (ward, index) => (
                <div
                  key={ward.ward}
                  className="rounded-2xl border border-white/[0.06] bg-black/10 p-4"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs text-slate-600">
                      #{index + 1}
                    </span>

                    <span className="text-xs font-bold text-orange-400">
                      {ward.rate.toFixed(0)}%
                    </span>
                  </div>

                  <p className="mt-3 truncate text-sm font-bold text-white">
                    {ward.ward}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {ward.pending} unresolved of{" "}
                    {ward.total} complaints
                  </p>

                  <div className="mt-4">
                    <ProgressBar
                      value={ward.rate}
                      color="bg-orange-500"
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </section>

        {/* COMPLAINT REPORT */}
        <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.035] backdrop-blur-xl">
          <div className="border-b border-white/[0.07] p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-400">
                  Live dataset
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  Complaint intelligence
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Search, filter and inspect civic complaints.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                  />

                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search complaint, ward..."
                    className="h-11 w-full rounded-xl border border-white/10 bg-black/10 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40 sm:w-64"
                  />
                </div>

                <select
                  value={filter}
                  onChange={(e) =>
                    setFilter(e.target.value)
                  }
                  className="h-11 rounded-xl border border-white/10 bg-[#07101f] px-4 text-sm text-slate-300 outline-none"
                >
                  <option value="ALL">
                    All statuses
                  </option>
                  <option value="RESOLVED">
                    Resolved
                  </option>
                  <option value="IN_PROGRESS">
                    In Progress
                  </option>
                  <option value="PENDING">
                    Pending
                  </option>
                </select>
              </div>
            </div>
          </div>

          {filteredComplaints.length ===
          0 ? (
            <div className="p-16 text-center">
              <XCircle
                className="mx-auto text-slate-700"
                size={40}
              />

              <p className="mt-4 text-sm text-slate-500">
                No complaints match the current filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-black/10 text-left text-[10px] uppercase tracking-[0.16em] text-slate-600">
                    <th className="px-6 py-4">
                      Complaint
                    </th>
                    <th className="px-6 py-4">
                      Category
                    </th>
                    <th className="px-6 py-4">
                      Ward
                    </th>
                    <th className="px-6 py-4">
                      Priority
                    </th>
                    <th className="px-6 py-4">
                      Status
                    </th>
                    <th className="px-6 py-4">
                      Worker
                    </th>
                    <th className="px-6 py-4">
                      Verification
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredComplaints.map(
                    (complaint) => {
                      const statusStyle =
                        getStatusStyle(
                          complaint.status
                        );

                      return (
                        <tr
                          key={complaint.id}
                          className="group border-b border-white/[0.045] transition hover:bg-white/[0.025]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                                <FileText
                                  size={15}
                                />
                              </div>

                              <div>
                                <p className="max-w-[280px] truncate font-semibold text-slate-200">
                                  {complaint.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-600">
                                  {formatDate(
                                    complaint.createdAt
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-slate-400">
                            {complaint.category}
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-slate-400">
                              {complaint.ward}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={cn(
                                "rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                getPriorityStyle(
                                  complaint.priority
                                )
                              )}
                            >
                              {complaint.priority}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={cn(
                                "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                statusStyle.bg,
                                statusStyle.text,
                                statusStyle.border
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  statusStyle.dot
                                )}
                              />

                              {complaint.status}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-2">
                              <Users
                                size={15}
                                className="text-slate-600"
                              />

                              <span className="text-slate-400">
                                {complaint
                                  .assignedWorker
                                  ?.name ||
                                  "Unassigned"}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            {complaint.citizenVerified ? (
                              <span className="inline-flex items-center gap-1.5 text-emerald-400">
                                <UserCheck
                                  size={15}
                                />
                                Verified
                              </span>
                            ) : (
                              <span className="text-slate-600">
                                Awaiting
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* FOOTER INTELLIGENCE */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <TrendingUp
                size={18}
                className="text-emerald-400"
              />

              <div>
                <p className="text-xs text-slate-600">
                  System signal
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {summary &&
                  summary.resolutionRate >= 80
                    ? "Strong resolution performance"
                    : "Resolution performance needs attention"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <Zap
                size={18}
                className="text-cyan-400"
              />

              <div>
                <p className="text-xs text-slate-600">
                  Active workload
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {summary?.inProgress || 0} complaints
                  under action
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
            <div className="flex items-center gap-3">
              <BarChart3
                size={18}
                className="text-purple-400"
              />

              <div>
                <p className="text-xs text-slate-600">
                  Dataset coverage
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-300">
                  {complaints.length} records analyzed
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <ReportsDashboard />
    </AuthGuard>
  );
}