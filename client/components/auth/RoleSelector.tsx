'use client';

import React from 'react';
import { Role } from '@/types/auth';

interface RoleSelectorProps {
  selectedRole: Role;
  onSelectRole: (role: Role) => void;
}

export default function RoleSelector({ selectedRole, onSelectRole }: RoleSelectorProps) {
  const roles: { role: Role; title: string; desc: string; icon: string }[] = [
    { role: 'CITIZEN', title: 'Citizen', desc: 'Report issues & track civic services', icon: 'fa-user' },
    { role: 'WORKER', title: 'Field Worker', desc: 'Manage ward tasks & update field status', icon: 'fa-hard-hat' },
    { role: 'ADMIN', title: 'Administrator', desc: 'Full system oversight & analytics', icon: 'fa-shield-alt' },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {roles.map((item) => {
        const isSelected = selectedRole === item.role;
        return (
          <button
            key={item.role}
            type="button"
            onClick={() => onSelectRole(item.role)}
            className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all duration-300 ${
              isSelected
                ? 'bg-gradient-to-b from-blue-600/30 to-cyan-500/20 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] text-white'
                : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-lg mb-1.5 ${isSelected ? 'text-cyan-400' : 'text-gray-400'}`} />
            <span className="text-xs font-bold">{item.title}</span>
            <span className="text-[9px] text-gray-400 mt-0.5 leading-tight hidden sm:block">{item.desc}</span>
          </button>
        );
      })}
    </div>
  );
}