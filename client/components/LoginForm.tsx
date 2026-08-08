'use client';

import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || 'Invalid email or password.'
        );
      }

      const userRole = String(data?.user?.role || '').toUpperCase();

      if (userRole === 'ADMIN') {
        window.location.href = '/dashboard/admin';
        return;
      }

      if (userRole === 'WORKER') {
        window.location.href = '/dashboard/worker';
        return;
      }

      window.location.href = '/dashboard/citizen';
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to login. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          Email Address
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Mail className="w-4 h-4" />
          </span>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            disabled={loading}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-medium text-gray-300 mb-1.5">
          Password
        </label>

        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Lock className="w-4 h-4" />
          </span>

          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition disabled:opacity-60"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white transition cursor-pointer disabled:opacity-50"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Remember / Forgot */}
      <div className="flex items-center justify-between text-xs pt-1">
        <label className="flex items-center space-x-2 cursor-pointer text-gray-300">
          <input
            type="checkbox"
            className="rounded bg-black/50 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
          />
          <span>Remember Me</span>
        </label>

        <a
          href="#"
          className="text-cyan-400 hover:underline"
        >
          Forgot Password?
        </a>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <span>Login to Command Center</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}