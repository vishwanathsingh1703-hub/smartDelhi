"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/components/auth/AuthGuard";
import AnalyticsCharts from "@/components/admin/AnalyticsCharts";

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

function AnalyticsDashboard() {
  const [data, setData] =
    useState<AnalyticsData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/analytics",
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to load analytics"
        );
      }

      setData(result.analytics);
    } catch (error) {
      console.error(
        "ANALYTICS_DASHBOARD_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 text-red-300">
            {error ||
              "Analytics data unavailable."}
          </div>
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

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <p className="text-blue-400 text-sm uppercase tracking-wider font-semibold">
              SmartDELHI Administration
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Civic Analytics
            </h1>

            <p className="text-gray-400 mt-2">
              Real-time complaint and workforce
              intelligence.
            </p>
          </div>

          <button
            onClick={fetchAnalytics}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
          >
            Refresh Analytics
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Total Complaints
            </p>

            <p className="text-3xl font-bold mt-2">
              {summary.totalComplaints}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Resolved
            </p>

            <p className="text-3xl font-bold mt-2 text-green-400">
              {summary.resolvedComplaints}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Resolution rate:{" "}
              {summary.resolutionRate}%
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              In Progress
            </p>

            <p className="text-3xl font-bold mt-2 text-blue-400">
              {summary.inProgressComplaints}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Pending:{" "}
              {summary.pendingComplaints}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              High Priority
            </p>

            <p className="text-3xl font-bold mt-2 text-red-400">
              {summary.highPriorityComplaints}
            </p>

            <p className="text-xs text-gray-500 mt-2">
              Active workers:{" "}
              {summary.activeWorkers}
            </p>
          </div>

        </div>

        {/* SECONDARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Registered Citizens
            </p>

            <p className="text-2xl font-bold mt-2">
              {summary.totalCitizens}
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Complaint Categories
            </p>

            <p className="text-2xl font-bold mt-2">
              {categories.length}
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Active Complaint Wards
            </p>

            <p className="text-2xl font-bold mt-2">
              {wards.length}
            </p>
          </div>

        </div>

        {/* CHARTS */}
        <AnalyticsCharts
          categories={categories}
          statuses={statuses}
          priorities={priorities}
          wards={wards}
          monthlyTrend={monthlyTrend}
        />

      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <AnalyticsDashboard />
    </AuthGuard>
  );
}