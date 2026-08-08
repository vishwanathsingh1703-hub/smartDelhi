"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/components/auth/AuthGuard";

interface Worker {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  ward?: string | null;
  isActive: boolean;
  _count: {
    assignedComplaints: number;
  };
}

function WorkersDashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchWorkers = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/workers");
      const data = await response.json();

      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (error) {
      console.error("WORKERS_FETCH_ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const toggleWorker = async (worker: Worker) => {
    try {
      setUpdating(worker.id);

      const response = await fetch(
        `/api/admin/workers/${worker.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !worker.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to update worker");
        return;
      }

      setWorkers((current) =>
        current.map((item) =>
          item.id === worker.id
            ? {
                ...item,
                isActive: data.worker.isActive,
              }
            : item
        )
      );
    } catch (error) {
      console.error("WORKER_UPDATE_ERROR:", error);
      alert("Failed to update worker");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">
            Loading workers...
          </p>
        </div>
      </div>
    );
  }

  const activeWorkers = workers.filter(
    (worker) => worker.isActive
  ).length;

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-blue-400 text-sm uppercase tracking-wider font-semibold">
              SmartDELHI Administration
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Worker Management
            </h1>

            <p className="text-gray-400 mt-2">
              Manage MCD workers and their availability.
            </p>
          </div>

          <button
            onClick={fetchWorkers}
            className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
          >
            Refresh
          </button>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Total Workers
            </p>

            <p className="text-3xl font-bold mt-2">
              {workers.length}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Active Workers
            </p>

            <p className="text-3xl font-bold mt-2 text-green-400">
              {activeWorkers}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <p className="text-gray-500">
              Inactive Workers
            </p>

            <p className="text-3xl font-bold mt-2 text-red-400">
              {workers.length - activeWorkers}
            </p>
          </div>

        </div>

        {/* WORKER LIST */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-800">
            <h2 className="text-xl font-semibold">
              All Workers
            </h2>
          </div>

          {workers.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No workers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-slate-950 text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-4">
                      Worker
                    </th>

                    <th className="text-left px-5 py-4">
                      Contact
                    </th>

                    <th className="text-left px-5 py-4">
                      Ward
                    </th>

                    <th className="text-left px-5 py-4">
                      Complaints
                    </th>

                    <th className="text-left px-5 py-4">
                      Status
                    </th>

                    <th className="text-left px-5 py-4">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {workers.map((worker) => (
                    <tr
                      key={worker.id}
                      className="border-t border-slate-800 hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {worker.name}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {worker.email}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        {worker.phone || "-"}
                      </td>

                      <td className="px-5 py-5">
                        {worker.ward || "Not assigned"}
                      </td>

                      <td className="px-5 py-5">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          {worker._count.assignedComplaints}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        {worker.isActive ? (
                          <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400">
                            Active
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400">
                            Inactive
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <button
                          onClick={() =>
                            toggleWorker(worker)
                          }
                          disabled={
                            updating === worker.id
                          }
                          className={`px-4 py-2 rounded-lg transition disabled:opacity-50 ${
                            worker.isActive
                              ? "bg-red-600 hover:bg-red-500"
                              : "bg-green-600 hover:bg-green-500"
                          }`}
                        >
                          {updating === worker.id
                            ? "Updating..."
                            : worker.isActive
                            ? "Deactivate"
                            : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default function AdminWorkersPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <WorkersDashboard />
    </AuthGuard>
  );
}