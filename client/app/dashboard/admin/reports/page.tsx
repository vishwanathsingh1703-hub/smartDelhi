"use client";

import { useEffect, useState } from "react";

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

function ReportsDashboard() {
  const [summary, setSummary] =
    useState<Summary | null>(null);

  const [complaints, setComplaints] =
    useState<Complaint[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

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
          data.message || "Failed to load reports"
        );
      }

      setSummary(data.summary);
      setComplaints(data.complaints);
    } catch (error) {
      console.error(
        "REPORTS_DASHBOARD_ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white p-8">
        Loading reports...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-blue-400 text-sm uppercase tracking-wider font-semibold">
              SmartDELHI Administration
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Reports Center
            </h1>

            <p className="text-gray-400 mt-2">
              Generate and monitor civic complaint reports.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={fetchReports}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              Refresh
            </button>

            <button
              onClick={downloadReport}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-semibold"
            >
              Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-300">
            {error}
          </div>
        )}

        {/* SUMMARY */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-gray-500">
                Total Complaints
              </p>

              <p className="text-3xl font-bold mt-2">
                {summary.total}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-gray-500">
                Resolved
              </p>

              <p className="text-3xl font-bold mt-2 text-green-400">
                {summary.resolved}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                {summary.resolutionRate}% resolution rate
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-gray-500">
                In Progress
              </p>

              <p className="text-3xl font-bold mt-2 text-blue-400">
                {summary.inProgress}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                Pending: {summary.pending}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <p className="text-gray-500">
                Citizen Verified
              </p>

              <p className="text-3xl font-bold mt-2 text-purple-400">
                {summary.verified}
              </p>
            </div>

          </div>
        )}

        {/* REPORT TABLE */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-800">
            <h2 className="text-xl font-semibold">
              Complaint Report
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Latest civic complaints and resolution status.
            </p>
          </div>

          {complaints.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No complaints available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                <thead className="bg-slate-950 text-gray-400">
                  <tr>
                    <th className="text-left px-5 py-4">
                      Complaint
                    </th>

                    <th className="text-left px-5 py-4">
                      Category
                    </th>

                    <th className="text-left px-5 py-4">
                      Ward
                    </th>

                    <th className="text-left px-5 py-4">
                      Priority
                    </th>

                    <th className="text-left px-5 py-4">
                      Status
                    </th>

                    <th className="text-left px-5 py-4">
                      Worker
                    </th>

                    <th className="text-left px-5 py-4">
                      Verified
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      className="border-t border-slate-800 hover:bg-slate-800/40"
                    >
                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {complaint.title}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(
                            complaint.createdAt
                          ).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        {complaint.category}
                      </td>

                      <td className="px-5 py-5">
                        {complaint.ward}
                      </td>

                      <td className="px-5 py-5">
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400">
                          {complaint.priority}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                          {complaint.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        {complaint.assignedWorker?.name ||
                          "Not Assigned"}
                      </td>

                      <td className="px-5 py-5">
                        {complaint.citizenVerified ? (
                          <span className="text-green-400 font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-500">
                            No
                          </span>
                        )}
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

export default function AdminReportsPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <ReportsDashboard />
    </AuthGuard>
  );
}