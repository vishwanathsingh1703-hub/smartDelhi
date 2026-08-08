"use client";

import { useEffect, useMemo, useState } from "react";

import AuthGuard from "@/components/auth/AuthGuard";

interface Ward {
  id: string;
  number: number;
  name: string;
  zone?: string | null;
  population?: number | null;
  budget: number;
  isActive: boolean;
  complaintCount: number;
}

interface Worker {
  id: string;
  name: string;
  ward?: string | null;
  isActive: boolean;
}

function WardsDashboard() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [zoneFilter, setZoneFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchWardData = async () => {
    try {
      setLoading(true);

      const [wardsResponse, workersResponse] =
        await Promise.all([
          fetch("/api/admin/wards"),
          fetch("/api/admin/workers"),
        ]);

      const wardsData = await wardsResponse.json();
      const workersData = await workersResponse.json();

      if (!wardsResponse.ok || !wardsData.success) {
        throw new Error(
          wardsData.message ||
            "Failed to fetch ward data"
        );
      }

      setWards(wardsData.wards || []);

      if (workersData.success) {
        setWorkers(workersData.workers || []);
      }
    } catch (error) {
      console.error("WARD_DATA_ERROR:", error);
      alert("Failed to load ward data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWardData();
  }, []);

  const zones = useMemo(() => {
    return Array.from(
      new Set(
        wards
          .map((ward) => ward.zone)
          .filter(Boolean)
      )
    ) as string[];
  }, [wards]);

  const filteredWards = useMemo(() => {
    const value = search.trim().toLowerCase();

    return wards.filter((ward) => {
      const matchesSearch =
        !value ||
        ward.name.toLowerCase().includes(value) ||
        String(ward.number).includes(value);

      const matchesZone =
        zoneFilter === "ALL" ||
        ward.zone === zoneFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE"
          ? ward.isActive
          : !ward.isActive);

      return (
        matchesSearch &&
        matchesZone &&
        matchesStatus
      );
    });
  }, [
    wards,
    search,
    zoneFilter,
    statusFilter,
  ]);

  const getWorkerCount = (ward: Ward) => {
    return workers.filter((worker) => {
      if (!worker.isActive || !worker.ward) {
        return false;
      }

      const workerWard =
        worker.ward.trim().toLowerCase();

      return (
        workerWard ===
          String(ward.number).toLowerCase() ||
        workerWard ===
          ward.name.trim().toLowerCase()
      );
    }).length;
  };

  const totalComplaints = wards.reduce(
    (total, ward) =>
      total + ward.complaintCount,
    0
  );

  const activeWards = wards.filter(
    (ward) => ward.isActive
  ).length;

  const inactiveWards =
    wards.length - activeWards;

  const totalActiveWorkers = workers.filter(
    (worker) => worker.isActive
  ).length;

  const totalBudget = wards.reduce(
    (total, ward) =>
      total + (ward.budget || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-gray-400 mt-4">
            Loading ward data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">

          <div>
            <p className="text-blue-400 text-sm uppercase tracking-wider font-semibold">
              SmartDELHI Administration
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Ward Management
            </h1>

            <p className="text-gray-400 mt-2">
              Manage Delhi municipal wards,
              workforce and complaints.
            </p>
          </div>

          <button
            onClick={fetchWardData}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
          >
            Refresh
          </button>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Total Wards
            </p>

            <p className="text-3xl font-bold mt-2">
              {wards.length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Active Wards
            </p>

            <p className="text-3xl font-bold mt-2 text-green-400">
              {activeWards}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Inactive Wards
            </p>

            <p className="text-3xl font-bold mt-2 text-red-400">
              {inactiveWards}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Complaints
            </p>

            <p className="text-3xl font-bold mt-2 text-blue-400">
              {totalComplaints}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <p className="text-gray-500 text-sm">
              Active Workers
            </p>

            <p className="text-3xl font-bold mt-2 text-purple-400">
              {totalActiveWorkers}
            </p>
          </div>

        </div>

        {/* BUDGET */}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-6">

          <p className="text-gray-500 text-sm">
            Total Allocated Ward Budget
          </p>

          <p className="text-2xl font-bold mt-2">
            ₹
            {totalBudget.toLocaleString(
              "en-IN"
            )}
          </p>

        </div>

        {/* FILTERS */}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 mb-6">

          <div className="grid md:grid-cols-3 gap-4">

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search ward number or name..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={zoneFilter}
              onChange={(e) =>
                setZoneFilter(e.target.value)
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="ALL">
                All Zones
              </option>

              {zones.map((zone) => (
                <option
                  key={zone}
                  value={zone}
                >
                  {zone}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
            >
              <option value="ALL">
                All Status
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="INACTIVE">
                Inactive
              </option>
            </select>

          </div>

        </div>

        {/* WARD TABLE */}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-800">

            <h2 className="text-xl font-semibold">
              Delhi Ward Overview
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Showing {filteredWards.length} of{" "}
              {wards.length} wards.
            </p>

          </div>

          {filteredWards.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No ward data found.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-950 text-gray-400">

                  <tr>

                    <th className="text-left px-5 py-4">
                      #
                    </th>

                    <th className="text-left px-5 py-4">
                      Ward
                    </th>

                    <th className="text-left px-5 py-4">
                      Zone
                    </th>

                    <th className="text-left px-5 py-4">
                      Population
                    </th>

                    <th className="text-left px-5 py-4">
                      Complaints
                    </th>

                    <th className="text-left px-5 py-4">
                      Workers
                    </th>

                    <th className="text-left px-5 py-4">
                      Budget
                    </th>

                    <th className="text-left px-5 py-4">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredWards.map(
                    (ward) => {

                      const workerCount =
                        getWorkerCount(ward);

                      const workload =
                        workerCount > 0
                          ? ward.complaintCount /
                            workerCount
                          : ward.complaintCount;

                      return (
                        <tr
                          key={ward.id}
                          className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                        >

                          <td className="px-5 py-5 font-bold text-blue-400">
                            {ward.number}
                          </td>

                          <td className="px-5 py-5">

                            <div className="font-semibold">
                              {ward.name}
                            </div>

                          </td>

                          <td className="px-5 py-5 text-gray-400">
                            {ward.zone || "-"}
                          </td>

                          <td className="px-5 py-5">
                            {ward.population
                              ? ward.population.toLocaleString(
                                  "en-IN"
                                )
                              : "-"}
                          </td>

                          <td className="px-5 py-5">

                            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                              {ward.complaintCount}
                            </span>

                          </td>

                          <td className="px-5 py-5">

                            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                              {workerCount}
                            </span>

                          </td>

                          <td className="px-5 py-5">
                            ₹
                            {(
                              ward.budget || 0
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-5 py-5">

                            {ward.isActive ? (
                              <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                                Active
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                                Inactive
                              </span>
                            )}

                            <div className="text-xs text-gray-500 mt-2">
                              Load:{" "}
                              {workload.toFixed(
                                1
                              )}
                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

        {/* INFO */}

        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">

          <p className="text-sm text-blue-300">
            Ward data is now loaded from the
            dedicated Ward database model. Complaint
            counts are calculated from existing
            complaint records, while active workers
            are matched using their assigned ward.
          </p>

        </div>

      </div>

    </div>
  );
}

export default function AdminWardsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <WardsDashboard />
    </AuthGuard>
  );
}