'use client';

import Link from 'next/link';
import { Bell, LogOut } from 'lucide-react';

interface CitizenHeaderProps {
  user: {
    name: string;
    ward?: string | null;
  };
}

export default function CitizenHeader({
  user,
}: CitizenHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo / Brand */}
        <Link
          href="/dashboard/citizen"
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/40 border border-blue-500/30 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <video
              src="/videos/logo-animation.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <span className="font-bold text-lg tracking-wide text-white">
              Smart<span className="text-blue-500">DELHI</span>
            </span>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Citizen Portal
            </p>
          </div>
        </Link>

        {/* Right Side */}
        <div className="flex items-center space-x-3 sm:space-x-4">

          {/* Notifications */}
          <Link
            href="/dashboard/citizen/notifications"
            aria-label="Notifications"
            className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-cyan-500/40 transition"
          >
            <Bell className="w-4 h-4" />

            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
          </Link>

          {/* User Info */}
          <div className="hidden sm:flex items-center space-x-3 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
              {user.name?.charAt(0).toUpperCase() || 'C'}
            </div>

            <div className="text-left">
              <p className="font-semibold text-white text-xs leading-tight">
                {user.name}
              </p>

              <p className="text-[10px] text-gray-400">
                {user.ward ? `Ward: ${user.ward}` : 'Citizen Account'}
              </p>
            </div>
          </div>

          {/* Logout */}
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center space-x-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3.5 py-2.5 rounded-xl text-xs font-medium transition shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />

              <span className="hidden md:inline">
                Logout
              </span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}