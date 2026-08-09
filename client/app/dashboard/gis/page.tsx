"use client";

import { useEffect, useMemo, useState } from "react";

import dynamic from "next/dynamic";

import AuthGuard from "@/components/auth/AuthGuard";

import type { GISComplaint } from "@/components/gis/DelhiMap";

const DelhiMap = dynamic(
  () => import("@/components/gis/DelhiMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="text-sm text-slate-400">
            Initializing Delhi GIS...
          </p>
        </div>
      </div>
    ),
  }
);

interface GISStats {
  totalComplaints: number;
  highPriority: number;
  pending: number;
  resolved: number;
}

interface GISResponse {
  complaints: GISComplaint[];
  filters: {
    wards: string[];
    categories: string[];
    statuses: string[];
  };
  stats: GISStats;
}

function GISDashboard() {
  const [data, setData] =
    useState<GISResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [ward, setWard] =
    useState("ALL");

  const [category, setCategory] =
    useState("ALL");

  const [status, setStatus] =
    useState("ALL");

  const [search, setSearch] =
    useState("");

  const fetchGISData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/gis",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.message ||
            "Failed to load GIS data"
        );
      }

      setData(result);
    } catch (error) {
      console.error(
        "GIS_DASHBOARD_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load GIS data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGISData();
  }, []);

  const filteredComplaints =
    useMemo(() => {
      if (!data) {
        return [];
      }

      const query =
        search.trim().toLowerCase();

      return data.complaints.filter(
        (complaint) => {
          const matchesWard =
            ward === "ALL" ||
            complaint.ward === ward;

          const matchesCategory =
            category === "ALL" ||
            complaint.category ===
              category;

          const matchesStatus =
            status === "ALL" ||
            complaint.status ===
              status;

          const matchesSearch =
            !query ||
            complaint.title
              .toLowerCase()
              .includes(query) ||
            complaint.ward
              .toLowerCase()
              .includes(query) ||
            complaint.category
              .toLowerCase()
              .includes(query);

          return (
            matchesWard &&
            matchesCategory &&
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      data,
      ward,
      category,
      status,
      search,
    ]);

  return (
    <div className="min-h-screen bg-[#020617] text-white">

      {/* TOP BAR */}
      <div className="border-b border-slate-800 bg-slate-950/90 px-5 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-green-400" />

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                SmartDELHI • GIS Intelligence
              </p>
            </div>

            <h1 className="mt-1 text-2xl font-bold md:text-3xl">
              Delhi Command Map
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Live civic complaints and spatial intelligence
            </p>
          </div>

          <div className="flex flex-wrap gap-2">

            <select
              value={ward}
              onChange={(e) =>
                setWard(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Wards
              </option>

              {data?.filters.wards.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Categories
              </option>

              {data?.filters.categories.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All Status
              </option>

              {data?.filters.statuses.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <button
              onClick={fetchGISData}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-500"
            >
              Refresh
            </button>

          </div>
        </div>
      </div>

      {/* MAIN */}
      <main className="mx-auto max-w-[1800px] p-4 md:p-5">

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* KPI ROW */}
        <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total Complaints
            </p>

            <p className="mt-2 text-3xl font-bold">
              {data?.stats.totalComplaints ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-xs uppercase tracking-wider text-red-400">
              High Priority
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {data?.stats.highPriority ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-xs uppercase tracking-wider text-yellow-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {data?.stats.pending ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5">
            <p className="text-xs uppercase tracking-wider text-green-400">
              Resolved
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {data?.stats.resolved ?? 0}
            </p>
          </div>

        </div>

        {/* SEARCH */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row">

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search complaint, ward or category..."
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500"
          />

          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-4 text-sm text-slate-400">
            Showing{" "}
            <span className="mx-1 font-bold text-white">
              {filteredComplaints.length}
            </span>
            map points
          </div>

        </div>

        {/* MAP */}
        <div className="h-[calc(100vh-290px)] min-h-[600px] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl">

          {loading ? (
            <div className="flex h-full items-center justify-center bg-slate-950">
              <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

                <p className="font-semibold">
                  Loading Delhi GIS
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Processing civic intelligence...
                </p>
              </div>
            </div>
          ) : (
            <DelhiMap
              complaints={
                filteredComplaints
              }
            />
          )}

        </div>

        {/* FOOTER INFO */}
        <div className="mt-4 flex flex-col justify-between gap-2 text-xs text-slate-500 md:flex-row">
          <p>
            Map data © OpenStreetMap contributors
          </p>

          <p>
            SmartDELHI Spatial Intelligence Engine
          </p>
        </div>

      </main>
    </div>
  );
}

export default function GISPage() {
  return (
    <AuthGuard
      allowedRoles={[
        "ADMIN",
        "CITIZEN",
        "WORKER",
      ]}
    >
      <GISDashboard />
    </AuthGuard>
  );
}