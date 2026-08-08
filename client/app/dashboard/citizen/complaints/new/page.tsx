'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Send,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const categories = [
  'Road Damage',
  'Garbage',
  'Street Light',
  'Water Supply',
  'Sewerage',
  'Drainage',
  'Traffic',
  'Other',
];

export default function NewComplaintPage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [ward, setWard] = useState('');
  const [priority, setPriority] = useState('Medium');

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (!title.trim()) {
        throw new Error('Complaint title is required.');
      }

      if (!category) {
        throw new Error('Please select a complaint category.');
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category,
          ward: ward.trim(),
          priority,
          latitude: latitude.trim() || null,
          longitude: longitude.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || data?.message || 'Unable to submit complaint.'
        );
      }

      setSuccess(true);

      setTimeout(() => {
        router.push('/dashboard/citizen');
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit complaint. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      {/* Header */}
      <header className="border-b border-cyan-500/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <span className="font-bold text-lg tracking-wide">
              Smart<span className="text-blue-500">DELHI</span>
            </span>

            <p className="text-[9px] text-gray-400 tracking-wider uppercase font-semibold">
              Citizen Portal
            </p>
          </div>

          <Link
            href="/dashboard/citizen"
            className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Page heading */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5" />
            Civic Complaint
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
            Submit a Complaint
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Report a civic issue to the SmartDELHI municipal command center.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />

            <div>
              <p className="font-semibold">Submission failed</p>
              <p className="mt-1 text-red-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
            Complaint submitted successfully. Redirecting...
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-gray-950/80 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-5 sm:p-7 shadow-2xl"
        >
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Complaint Title *
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Garbage not collected near main road"
                required
                maxLength={150}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition cursor-pointer"
              >
                <option value="" className="bg-gray-950">
                  Select complaint category
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-gray-950"
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the problem in detail..."
                rows={5}
                maxLength={1000}
                className="w-full resize-none bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
              />

              <p className="mt-1 text-[10px] text-gray-600 text-right">
                {description.length}/1000
              </p>
            </div>

            {/* Ward + Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ward */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Ward
                </label>

                <input
                  type="text"
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  placeholder="Example: Ward 42"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                />

                <p className="mt-1.5 text-[10px] text-gray-500">
                  Leave blank to use your registered ward.
                </p>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition cursor-pointer"
                >
                  <option value="Low" className="bg-gray-950">
                    Low
                  </option>

                  <option value="Medium" className="bg-gray-950">
                    Medium
                  </option>

                  <option value="High" className="bg-gray-950">
                    High
                  </option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-white/10 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-cyan-400" />

                <div>
                  <p className="text-xs font-semibold text-gray-300">
                    Location
                  </p>

                  <p className="text-[10px] text-gray-500">
                    Optional — you can add coordinates later.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Latitude */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">
                    Latitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="28.6139"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>

                {/* Longitude */}
                <div>
                  <label className="block text-[11px] text-gray-400 mb-1.5">
                    Longitude
                  </label>

                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="77.2090"
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || success}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Submitting Complaint...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}