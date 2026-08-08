'use client';

import React, { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footerText: string;
  footerActionText: string;
  onSwitchMode: () => void;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  footerText,
  footerActionText,
  onSwitchMode,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md bg-gray-950/80 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(0,102,255,0.25)] relative z-10 text-white">
      <div className="text-center space-y-1 mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">{subtitle}</p>
      </div>

      {children}

      <div className="mt-6 text-center text-xs text-gray-400">
        {footerText}{' '}
        <button
          type="button"
          onClick={onSwitchMode}
          className="text-cyan-400 font-semibold hover:underline focus:outline-none"
        >
          {footerActionText}
        </button>
      </div>
    </div>
  );
}