'use client';

import { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subtext: string;
  borderColor?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  subtext,
  borderColor = 'cyan-400',
}: StatCardProps) {
  return (
    <div
      className={`p-4 rounded-2xl bg-black/40 border border-${borderColor}/30 backdrop-blur-md shadow-lg flex items-center space-x-4`}
    >
      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
        {icon}
      </div>
      <div>
        <p className="text-[11px] text-gray-400 uppercase font-medium tracking-wider">
          {label}
        </p>
        <p className="text-lg font-bold text-white tracking-tight">{value}</p>
        <p className="text-[10px] text-cyan-400">{subtext}</p>
      </div>
    </div>
  );
}