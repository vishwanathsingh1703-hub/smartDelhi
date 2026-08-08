'use client';

import React, { FormEvent, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, MapPinned, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

const CATEGORIES = [
  'Road Damage',
  'Garbage',
  'Street Light',
  'Water Supply',
  'Drainage',
  'Pollution',
  'Traffic',
  'Public Safety',
  'Other',
];

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

interface ComplaintFormProps {
  onSuccess?: () => void;
}

export default function ComplaintForm({ onSuccess }: ComplaintFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ward, setWard] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by this browser.');
      return;
    }

    setLocationLoading(true);
    setLocationMessage('Getting your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongitude(position.coords.longitude.toString());

        setLocationLoading(false);
        setLocationMessage('Location detected successfully.');
      },
      (err) => {
        setLocationLoading(false);
        setLocationMessage(
          err.code === err.PERMISSION_DENIED
            ? 'Location permission was denied.'
            : 'Unable to detect your location.'
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setSuccess(false);

    if (!title.trim() || !description.trim() || !ward.trim()) {
      setError('Please fill all required fields.');
      return;
    }

    setLoading(true);

    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        category,
        ward: ward.trim(),
        priority,
      };

      if (latitude.trim()) {
        const lat = Number(latitude);
        if (!Number.isNaN(lat)) payload.latitude = lat;
      }

      if (longitude.trim()) {
        const lng = Number(longitude);
        if (!Number.isNaN(lng)) payload.longitude = lng;
      }

      if (imageUrl.trim()) {
        payload.imageUrl = imageUrl.trim();
      }

      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit complaint.');
      }

      setSuccess(true);

      onSuccess?.();

      setTimeout(() => {
        router.push('/dashboard/citizen/complaints');
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong while submitting the complaint.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-gray-950/80 p-12 text-center shadow-2xl">
        <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-emerald-400" />

        <h2 className="text-xl font-bold text-white">
          Complaint Submitted Successfully
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Your complaint has been registered. Redirecting to your complaints...
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-3xl border border-blue-500/30 bg-gray-950/80 p-6 shadow-2xl sm:p-8"
    >
      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Details */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-300">
            Complaint Title *
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={150}
            placeholder="e.g. Broken street light"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-300">
            Category *
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item} className="bg-gray-900">
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ward + Priority */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-300">
            Ward / Location *
          </label>

          <input
            type="text"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            required
            maxLength={120}
            placeholder="e.g. Ward 14, Karol Bagh"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-semibold text-gray-300">
            Priority
          </label>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400"
          >
            {PRIORITIES.map((item) => (
              <option key={item} value={item} className="bg-gray-900">
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-300">
          Detailed Description *
        </label>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={3000}
          rows={6}
          placeholder="Describe the civic issue clearly..."
          className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
        />

        <p className="mt-1 text-right text-[10px] text-gray-500">
          {description.length}/3000
        </p>
      </div>

      {/* Location */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">
              GPS Location
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Optional — helps authorities locate the issue faster.
            </p>
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            disabled={locationLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-2.5 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {locationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MapPinned className="h-4 w-4" />
            )}

            {locationLoading ? 'Detecting...' : 'Use Current Location'}
          </button>
        </div>

        {locationMessage && (
          <p className="mb-3 text-xs text-cyan-400">
            {locationMessage}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            placeholder="Latitude"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
          />

          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            placeholder="Longitude"
            className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-xs text-white outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      {/* Image */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-gray-300">
          Evidence Image URL
        </label>

        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-cyan-400"
        />

        <p className="mt-1 text-[10px] text-gray-500">
          Optional.
        </p>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting Complaint...
          </>
        ) : (
          <>
            <PlusCircle className="h-5 w-5" />
            Submit Complaint
          </>
        )}
      </button>
    </form>
  );
}