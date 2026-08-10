"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import ComplaintList from "@/components/complaints/ComplaintList";

export default function MyComplaintsPage() {
  return (
    <AuthGuard allowedRoles={["CITIZEN"]}>
      <div className="min-h-screen bg-slate-950 px-4 py-8 text-white md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Citizen Portal
            </p>

            <h1 className="mt-2 text-3xl font-bold">
              My Complaints
            </h1>

            <p className="mt-2 text-slate-400">
              Track and manage complaints submitted by you.
            </p>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}