'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to login');
      }

     if (data.user.role === 'ADMIN') {
  router.push('/dashboard/admin');
} else if (data.user.role === 'WORKER') {
  router.push('/dashboard/worker');
} else {
  router.push('/dashboard/citizen');
}

router.refresh();
      router.refresh();
    } catch (err: unknown) {
  setError(err instanceof Error ? err.message : 'An error occurred during login');
}finally {
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
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
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
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
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
            <span>Sign In to Platform</span>
            <i className="fa-solid fa-arrow-right text-xs" />
          </>
        )}
      </button>
    </form>
  );
}