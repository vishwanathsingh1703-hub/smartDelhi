'use client';

import { useState } from 'react';
import { Users, HardHat, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface RoleSelectionProps {
  onComplete: () => void;
}

export default function RoleSelection({ onComplete }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'Citizen' | 'Worker' | 'Admin'>('Citizen');

  return (
    <div className="space-y-5 text-left py-2">
      <div>
        <h3 className="text-base font-bold text-white mb-1">Select Your Access Role</h3>
        <p className="text-xs text-gray-400">Choose your operational scope to personalize your dashboard interface.</p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Citizen Card */}
        <div
          onClick={() => setSelectedRole('Citizen')}
          className={`p-4 rounded-2xl border cursor-pointer transition duration-300 flex items-center justify-between ${
            selectedRole === 'Citizen'
              ? 'bg-blue-950/40 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.25)]'
              : 'bg-black/40 border-white/10 hover:border-blue-500/40'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Citizen Portal</h4>
              <p className="text-[11px] text-gray-400">Report civic issues, track complaints and stay updated.</p>
            </div>
          </div>
          {selectedRole === 'Citizen' && <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />}
        </div>

        {/* Worker Card */}
        <div
          onClick={() => setSelectedRole('Worker')}
          className={`p-4 rounded-2xl border cursor-pointer transition duration-300 flex items-center justify-between ${
            selectedRole === 'Worker'
              ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
              : 'bg-black/40 border-white/10 hover:border-emerald-500/40'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">MCD Worker Portal</h4>
              <p className="text-[11px] text-gray-400">View assigned field tasks, update statuses and resolve tickets.</p>
            </div>
          </div>
          {selectedRole === 'Worker' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        </div>

        {/* Admin Card */}
        <div
          onClick={() => setSelectedRole('Admin')}
          className={`p-4 rounded-2xl border cursor-pointer transition duration-300 flex items-center justify-between ${
            selectedRole === 'Admin'
              ? 'bg-purple-950/40 border-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
              : 'bg-black/40 border-white/10 hover:border-purple-500/40'
          }`}
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Admin Command Center</h4>
              <p className="text-[11px] text-gray-400">Manage users, oversee all 272 wards, analytics and overrides.</p>
            </div>
          </div>
          {selectedRole === 'Admin' && <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0" />}
        </div>
      </div>

      <button
        onClick={onComplete}
        className="w-full mt-3 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:brightness-110 transition flex items-center justify-center space-x-2"
      >
        <span>Continue to Dashboard</span>
      </button>
    </div>
  );
}