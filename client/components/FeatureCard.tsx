'use client';

import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-4 rounded-2xl bg-black/40 border border-cyan-400/20 backdrop-blur-md shadow-lg hover:border-cyan-400/40 transition-all duration-300">
      <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
    </div>
  );
}