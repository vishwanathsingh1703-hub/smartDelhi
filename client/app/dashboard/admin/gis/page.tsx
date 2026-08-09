"use client";

import Link from "next/link";

import AuthGuard from "@/components/auth/AuthGuard";
import dynamic from "next/dynamic";

const DelhiGISMap = dynamic(
  () =>
    import(
      "@/components/gis/DelhiGISMap"
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[650px] items-center justify-center rounded-3xl border border-slate-800 bg-slate-950 text-slate-400">
        Loading Delhi GIS Command Center...
      </div>
    ),
  }
);

function GISDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">

      <div className="mx-auto max-w-[1800px] px-4 py-6 md:px-8">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              SmartDELHI Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              GIS Command Center
            </h1>

            <p className="mt-2 text-slate-400">
              Real-time municipal intelligence across Delhi.
            </p>
          </div>

          <Link
            href="/dashboard/admin"
            className="w-fit rounded-xl border border-slate-800 bg-slate-900 px-5 py-3 text-sm font-semibold transition hover:border-blue-500 hover:bg-slate-800"
          >
            ← Admin Dashboard
          </Link>

        </div>

        {/* GIS MAP */}

        <DelhiGISMap />

      </div>
    </div>
  );
}

export default function AdminGISPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <GISDashboard />
    </AuthGuard>
  );
}