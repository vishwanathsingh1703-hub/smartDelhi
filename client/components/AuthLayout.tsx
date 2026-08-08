"use client";

import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative min-h-screen overflow-hidden">

      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/auth-bg.png')",
        }}
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Blue Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-black/70" />

      {/* Blur Effect */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />

      {/* Animated Glow */}
      <div className="absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[160px]" />

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-end px-6 lg:px-20">

        <div className="w-full max-w-md">

          <div
            className="
            rounded-[30px]
            border
            border-white/10
            bg-black/35
            backdrop-blur-2xl
            shadow-[0_0_80px_rgba(37,99,235,0.25)]
            p-8
          "
          >
            {children}
          </div>

        </div>

      </div>

    </main>
  );
}