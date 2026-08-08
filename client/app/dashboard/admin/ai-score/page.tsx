"use client";

import { useCallback, useEffect, useState } from "react";

import AuthGuard from "@/components/auth/AuthGuard";

type PriorityLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW";

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

function getPriorityClass(
  priority: PriorityLevel,
) {
  switch (priority) {
    case "CRITICAL":
      return "bg-red-500/15 text-red-400 border-red-500/30";

    case "HIGH":
      return "bg-orange-500/15 text-orange-400 border-orange-500/30";

    case "MEDIUM":
      return "bg-yellow-500/15 text-yellow-400 border-yellow-500/30";

    default:
      return "bg-green-500/15 text-green-400 border-green-500/30";
  }
}

function getScoreColor(score: number) {
  if (score >= 80) {
    return "text-red-400";
  }

  if (score >= 60) {
    return "text-orange-400";
  }

  if (score >= 40) {
    return "text-yellow-400";
  }

  return "text-green-400";
}

function getScoreBar(score: number) {
  if (score >= 80) {
    return "bg-red-500";
  }

  if (score >= 60) {
    return "bg-orange-500";
  }

  if (score >= 40) {
    return "bg-yellow-500";
  }

  return "bg-green-500";
}

function AIScoreDashboard() {
  const [wards, setWards] = useState<WardScore[]>([]);
  const [summary, setSummary] = useState<Summary | null>(
    null,
  );

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [expandedWard, setExpandedWard] = useState<
    string | null
  >(null);

  const fetchScores = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        const response = await fetch(
          "/api/admin/ai-score",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data: APIResponse = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            "Failed to load AI ward scores.",
          );
        }

        setWards(data.rankings ?? []);
        setSummary(data.summary ?? null);
      } catch (error) {
        console.error(
          "AI_SCORE_DASHBOARD_ERROR:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Failed to load AI scores.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />

          <p className="mt-4 text-gray-400">
            Loading AI ward intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-6 lg:px-8">

        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-purple-400 text-sm uppercase tracking-[0.2em] font-semibold">
              SmartDELHI Intelligence
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              AI Ward Score
            </h1>

            <p className="text-gray-400 mt-2 max-w-2xl">
              Explainable civic risk intelligence for
              ward-level complaint management and
              operational prioritization.
            </p>
          </div>

          <button
            onClick={() => fetchScores(true)}
            disabled={refreshing}
            className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
          >
            {refreshing
              ? "Recalculating..."
              : "Recalculate Scores"}
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
            <p className="text-red-300 font-medium">
              {error}
            </p>

            <button
              onClick={() => fetchScores(true)}
              className="mt-3 text-sm text-red-400 hover:text-red-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* SUMMARY */}

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">
                Wards Evaluated
              </p>

              <p className="text-3xl font-bold mt-2">
                {summary.totalWardsEvaluated}
              </p>
            </div>

            <div className="bg-slate-900 border border-purple-500/20 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">
                Overall Risk
              </p>

              <p
                className={`text-3xl font-bold mt-2 ${getScoreColor(
                  summary.overallScore,
                )}`}
              >
                {summary.overallScore}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">
                Average Ward Score
              </p>

              <p className="text-3xl font-bold mt-2 text-purple-400">
                {summary.averageWardScore}
              </p>
            </div>

            <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">
                Critical
              </p>

              <p className="text-3xl font-bold mt-2 text-red-400">
                {summary.criticalWardCount}
              </p>
            </div>

            <div className="bg-slate-900 border border-orange-500/20 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">
                High Priority
              </p>

              <p className="text-3xl font-bold mt-2 text-orange-400">
                {summary.highPriorityWardCount}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <p className="text-gray-500 text-sm">
                Pending Complaints
              </p>

              <p className="text-3xl font-bold mt-2 text-yellow-400">
                {summary.totalPendingComplaints}
              </p>
            </div>

          </div>
        )}

        {/* PRIORITY DISTRIBUTION */}

        {summary && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-purple-400 text-xs uppercase tracking-wider font-semibold">
                  Risk Distribution
                </p>

                <h2 className="text-lg font-semibold mt-1">
                  Ward Priority Overview
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-red-400 text-sm">
                  Critical
                </p>

                <p className="text-2xl font-bold mt-1">
                  {summary.criticalWardCount}
                </p>
              </div>

              <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 p-4">
                <p className="text-orange-400 text-sm">
                  High
                </p>

                <p className="text-2xl font-bold mt-1">
                  {summary.highPriorityWardCount}
                </p>
              </div>

              <div className="rounded-xl bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-yellow-400 text-sm">
                  Medium
                </p>

                <p className="text-2xl font-bold mt-1">
                  {summary.mediumPriorityWardCount}
                </p>
              </div>

              <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4">
                <p className="text-green-400 text-sm">
                  Low
                </p>

                <p className="text-2xl font-bold mt-1">
                  {summary.lowPriorityWardCount}
                </p>
              </div>

            </div>
          </div>
        )}

        {/* RANKING */}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-5 md:p-6 border-b border-slate-800">
            <p className="text-purple-400 text-xs uppercase tracking-wider font-semibold">
              AI Ranking Engine
            </p>

            <h2 className="text-xl font-semibold mt-1">
              Ward Risk Ranking
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Higher score indicates greater civic
              intervention priority.
            </p>
          </div>

          {wards.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">
                No ward score data available.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">

              {wards.map((ward, index) => {
                const isExpanded =
                  expandedWard === ward.wardId;

                return (
                  <div key={`${ward.wardId}-${index}`}>

                    {/* ROW */}

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedWard(
                          isExpanded
                            ? null
                            : ward.wardId,
                        )
                      }
                      className="w-full text-left p-5 md:p-6 hover:bg-slate-800/40 transition"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">

                        {/* RANK */}

                        <div className="lg:col-span-1">
                          <p className="text-xs text-gray-500">
                            RANK
                          </p>

                          <p className="text-xl font-bold text-purple-400 mt-1">
                            #{index + 1}
                          </p>
                        </div>

                        {/* WARD */}

                        <div className="lg:col-span-3">
                          <p className="font-semibold text-lg">
                            {ward.wardName}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            ID: {ward.wardId}
                          </p>
                        </div>

                        {/* SCORE */}

                        <div className="lg:col-span-3">
                          <div className="flex items-center gap-3">

                            <span
                              className={`text-2xl font-bold ${getScoreColor(
                                ward.score,
                              )}`}
                            >
                              {ward.score}
                            </span>

                            <div className="flex-1 max-w-[180px]">
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${getScoreBar(
                                    ward.score,
                                  )}`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Math.max(
                                        0,
                                        ward.score,
                                      ),
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>

                          </div>

                          <p className="text-xs text-gray-500 mt-1">
                            AI Risk Score
                          </p>
                        </div>

                        {/* PRIORITY */}

                        <div className="lg:col-span-2">
                          <span
                            className={`inline-flex px-3 py-1.5 rounded-full border text-xs font-bold ${getPriorityClass(
                              ward.priorityLevel,
                            )}`}
                          >
                            {ward.priorityLevel}
                          </span>
                        </div>

                        {/* COMPLAINTS */}

                        <div className="lg:col-span-2">
                          <p className="text-xs text-gray-500">
                            COMPLAINTS
                          </p>

                          <p className="font-semibold mt-1">
                            {ward.totalComplaints}
                          </p>

                          <p className="text-xs text-yellow-400 mt-1">
                            {ward.pendingComplaints} pending
                          </p>
                        </div>

                        {/* ARROW */}

                        <div className="lg:col-span-1 text-right">
                          <span className="text-gray-500 text-lg">
                            {isExpanded
                              ? "−"
                              : "+"}
                          </span>
                        </div>

                      </div>
                    </button>

                    {/* BREAKDOWN */}

                    {isExpanded && (
                      <div className="px-5 md:px-6 pb-6">

                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
                            <div>
                              <p className="text-purple-400 text-xs uppercase tracking-wider font-semibold">
                                Explainable AI
                              </p>

                              <h3 className="text-lg font-semibold mt-1">
                                Score Breakdown
                              </h3>
                            </div>

                            <div className="text-sm text-gray-400">
                              Resolution Rate:{" "}
                              <span className="text-white font-semibold">
                                {ward.resolutionRate}%
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">

                            {[
                              {
                                name: "Severity",
                                data: ward.breakdown.severity,
                              },
                              {
                                name: "Volume",
                                data: ward.breakdown.volume,
                              },
                              {
                                name: "Pending",
                                data: ward.breakdown.pendingPressure,
                              },
                              {
                                name: "Aging",
                                data: ward.breakdown.aging,
                              },
                              {
                                name: "Resolution Risk",
                                data: ward.breakdown.resolutionPerformance,
                              },
                            ].map((item) => (
                              <div
                                key={item.name}
                                className="rounded-xl bg-slate-900 border border-slate-800 p-4"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold">
                                    {item.name}
                                  </p>

                                  <span className="text-xs text-purple-400">
                                    ×
                                    {item.data.weight}
                                  </span>
                                </div>

                                <p className="text-2xl font-bold mt-3">
                                  {
                                    item.data
                                      .normalizedScore
                                  }
                                </p>

                                <div className="h-1.5 bg-slate-800 rounded-full mt-3 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${getScoreBar(
                                      item.data.normalizedScore,
                                    )}`}
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(
                                          0,
                                          item.data.normalizedScore,
                                        ),
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                  {
                                    item.data
                                      .description
                                  }
                                </p>

                                <p className="text-xs text-gray-600 mt-2">
                                  Weighted:{" "}
                                  {
                                    item.data
                                      .weightedScore
                                  }
                                </p>
                              </div>
                            ))}

                          </div>

                          {/* WARD METRICS */}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">

                            <div className="bg-slate-900 rounded-xl p-4">
                              <p className="text-xs text-gray-500">
                                Resolved
                              </p>

                              <p className="text-xl font-bold mt-1 text-green-400">
                                {
                                  ward.resolvedComplaints
                                }
                              </p>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-4">
                              <p className="text-xs text-gray-500">
                                Pending
                              </p>

                              <p className="text-xl font-bold mt-1 text-yellow-400">
                                {
                                  ward.pendingComplaints
                                }
                              </p>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-4">
                              <p className="text-xs text-gray-500">
                                Avg. Age
                              </p>

                              <p className="text-xl font-bold mt-1">
                                {
                                  ward.averageAgeDays
                                }{" "}
                                <span className="text-sm text-gray-500">
                                  days
                                </span>
                              </p>
                            </div>

                            <div className="bg-slate-900 rounded-xl p-4">
                              <p className="text-xs text-gray-500">
                                Resolution
                              </p>

                              <p className="text-xl font-bold mt-1 text-cyan-400">
                                {
                                  ward.resolutionRate
                                }
                                %
                              </p>
                            </div>

                          </div>

                        </div>
                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* FOOTER EXPLANATION */}

        <div className="mt-6 bg-purple-500/10 border border-purple-500/20 rounded-2xl p-5">
          <p className="text-sm text-purple-300 leading-relaxed">
            The SmartDELHI AI Risk Score combines
            complaint severity, complaint volume,
            pending pressure, complaint aging,
            infrastructure condition, ward importance,
            worker workload, and resolution performance
            to produce an explainable 0–100 civic risk
            score.
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AdminAIScorePage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AIScoreDashboard />
    </AuthGuard>
  );
}