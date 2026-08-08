'use client';

import { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export default function RegisterForm({
  onSuccess,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    ward: 'Rohini',
    role: 'Citizen',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Please accept the Terms & Privacy Policy.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.fullName.trim(),
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          ward: formData.ward,
          role: formData.role,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            'Registration failed'
        );
      }

      // If the registration API itself logs the user in
      // and creates the token cookie, go directly to dashboard.
      const userRole = String(
        data?.user?.role ||
          data?.role ||
          formData.role
      ).toUpperCase();

      if (userRole === 'ADMIN') {
        window.location.href = '/dashboard/admin';
        return;
      }

      if (userRole === 'WORKER') {
        window.location.href = '/dashboard/worker';
        return;
      }

      window.location.href = '/dashboard/citizen';

      // Kept only as a fallback if parent needs it.
      onSuccess?.();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-xl font-bold text-white">
          Create Account
        </h2>

        <p className="text-xs text-gray-400 mt-1">
          Join the SmartDELHI Command Network
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3.5 text-left"
      >
        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-[11px] font-medium text-gray-300 mb-1">
            Full Name
          </label>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <User className="w-3.5 h-3.5" />
            </span>

            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) =>
                updateField('fullName', e.target.value)
              }
              placeholder="John Doe"
              autoComplete="name"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
            />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-300 mb-1">
              Email Address
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="w-3.5 h-3.5" />
              </span>

              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  updateField('email', e.target.value)
                }
                placeholder="name@example.com"
                autoComplete="email"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-300 mb-1">
              Phone Number
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Phone className="w-3.5 h-3.5" />
              </span>

              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) =>
                  updateField('phone', e.target.value)
                }
                placeholder="+91 98765 43210"
                autoComplete="tel"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              />
            </div>
          </div>
        </div>

        {/* Ward + Role */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-300 mb-1">
              Ward Selection
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
              </span>

              <select
                value={formData.ward}
                onChange={(e) =>
                  updateField('ward', e.target.value)
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 pl-9 text-xs text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition cursor-pointer"
              >
                <option
                  value="Rohini"
                  className="bg-slate-900 text-white"
                >
                  Rohini (Ward 1)
                </option>

                <option
                  value="Janakpuri"
                  className="bg-slate-900 text-white"
                >
                  Janakpuri (Ward 2)
                </option>

                <option
                  value="Dwarka"
                  className="bg-slate-900 text-white"
                >
                  Dwarka (Ward 3)
                </option>

                <option
                  value="Civil Lines"
                  className="bg-slate-900 text-white"
                >
                  Civil Lines (Ward 4)
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-300 mb-1">
              Role
            </label>

           <select
  value={formData.role}
  onChange={(e) =>
    setFormData({ ...formData, role: e.target.value })
  }
  className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
>
  <option value="CITIZEN">Citizen</option>
  <option value="WORKER">MCD Worker</option>
  <option value="ADMIN">Admin</option>
</select>
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-300 mb-1">
              Password
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-3.5 h-3.5" />
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  updateField('password', e.target.value)
                }
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 pl-9 pr-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition"
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-300 mb-1">
              Confirm Password
            </label>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="w-3.5 h-3.5" />
              </span>

              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={(e) =>
                  updateField(
                    'confirmPassword',
                    e.target.value
                  )
                }
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full bg-black/50 border border-white/10 rounded-xl px-3 py-2 pl-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition"
              />
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-center space-x-2 pt-1 text-xs">
          <input
            type="checkbox"
            required
            checked={formData.acceptTerms}
            onChange={(e) =>
              updateField(
                'acceptTerms',
                e.target.checked
              )
            }
            className="rounded bg-black/50 border-white/20 text-cyan-500 focus:ring-0 cursor-pointer"
          />

          <span className="text-gray-300">
            I agree to the{' '}
            <a
              href="#"
              className="text-cyan-400 hover:underline"
            >
              Terms & Privacy Policy
            </a>
          </span>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span>Creating Account...</span>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}