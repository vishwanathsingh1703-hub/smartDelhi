"use client";

import { useEffect, useMemo, useState } from "react";

import AuthGuard from "@/components/auth/AuthGuard";
import BudgetCharts from "@/components/admin/BudgetCharts";
import BudgetAllocationTable from "@/components/admin/BudgetAllocationTable";

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
}

interface Summary {
  totalWards: number;
  totalPopulation: number;
  totalHouseholds: number;
  totalComplaints: number;
  totalActiveWorkers: number;
  totalBudget: number;
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "₹0";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${Math.round(value).toLocaleString(
    "en-IN"
  )}`;
}

function BudgetDashboard() {
  const [wards, setWards] = useState<WardBudget[]>(
    []
  );

  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/budget",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to load budget data"
        );
      }

      setWards(data.wards || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error(
        "BUDGET_DASHBOARD_ERROR:",
        err
      );

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

  const highestNeedWard = useMemo(() => {
    if (wards.length === 0) return null;

    return [...wards].sort(
      (a, b) =>
        b.needScore - a.needScore
    )[0];
  }, [wards]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-400">
            Loading budget intelligence...
          </p>
        </div>
      </div>
    );
  }

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
              Budget Intelligence
            </h1>

            <p className="text-gray-400 mt-2 max-w-2xl">
              Data-driven ward budget analysis based
              on population, households, complaints,
              infrastructure and workforce.
            </p>
          </div>

          <button
            onClick={fetchBudgetData}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
          >
            Refresh Data
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Total Wards
            </p>

            <p className="text-3xl font-bold mt-2">
              {summary?.totalWards || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Population
            </p>

            <p className="text-3xl font-bold mt-2">
              {(
                summary?.totalPopulation || 0
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Complaints
            </p>

            <p className="text-3xl font-bold mt-2 text-blue-400">
              {summary?.totalComplaints || 0}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Current Budget
            </p>

            <p className="text-3xl font-bold mt-2 text-green-400">
              {formatCurrency(
                summary?.totalBudget || 0
              )}
            </p>
          </div>
        </div>

        {/* TOP PRIORITY */}
        {highestNeedWard && (
          <div className="mb-8 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                  Highest Current Need
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  {highestNeedWard.name}
                </h2>

                <p className="text-gray-400 mt-1">
                  Need Score:{" "}
                  <span className="text-white font-semibold">
                    {highestNeedWard.needScore.toFixed(
                      1
                    )}
                  </span>
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-gray-500 text-sm">
                  Recommended Allocation
                </p>

                <p className="text-2xl font-bold text-green-400 mt-1">
                  {formatCurrency(
                    highestNeedWard.recommendedBudget
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* CHARTS */}
        <BudgetCharts wards={wards} />

        {/* TABLE */}
        <BudgetAllocationTable
          wards={wards}
        />
      </div>
    </div>
  );
}

export default function AdminBudgetPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <BudgetDashboard />
    </AuthGuard>
  );
}