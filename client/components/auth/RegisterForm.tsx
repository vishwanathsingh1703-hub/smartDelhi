'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleSelector from './RoleSelector';
import { Role } from '@/types/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('CITIZEN');
  const [ward, setWard] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, ward: ward || undefined, phone: phone || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      // Automatically log user in after registration
      const loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        router.push('/auth');
        return;
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-center">
          {error}
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-300">Select Role</label>
        <RoleSelector selectedRole={role} onSelectRole={setRole} />
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-300">Full Name</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <i className="fa-solid fa-user text-xs" />
          </span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-300">Email Address</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <i className="fa-solid fa-envelope text-xs" />
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-300">Ward (Optional)</label>
          <input
            type="text"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            placeholder="e.g. Ward 12"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-300">Phone (Optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-gray-300">Password</label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <i className="fa-solid fa-lock text-xs" />
          </span>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white"
          >
            <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`} />
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium py-3 rounded-xl shadow-lg shadow-cyan-500/25 transition duration-300 flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <span>Create Secure Account</span>
            <i className="fa-solid fa-arrow-right text-xs" />
          </>
        )}
      </button>
    </form>
  );
}