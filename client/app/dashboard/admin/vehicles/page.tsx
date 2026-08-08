"use client";

import { useEffect, useState } from "react";

import AuthGuard from "@/components/auth/AuthGuard";

interface Vehicle {
  id: string;
  vehicleNo: string;
  type: string;
  ward?: string | null;
  status: string;
  driverName?: string | null;
  driverPhone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isActive: boolean;
}

const emptyForm = {
  vehicleNo: "",
  type: "Garbage Truck",
  ward: "",
  status: "AVAILABLE",
  driverName: "",
  driverPhone: "",
};

function VehiclesDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const fetchVehicles = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/vehicles"
      );

      const data = await response.json();

      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error(
        "VEHICLES_FETCH_ERROR:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const createVehicle = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!form.vehicleNo.trim()) {
      alert("Vehicle number is required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/admin/vehicles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to create vehicle."
        );
        return;
      }

      setVehicles((current) => [
        data.vehicle,
        ...current,
      ]);

      setForm(emptyForm);
      setShowForm(false);

      alert("Vehicle added successfully.");
    } catch (error) {
      console.error(
        "VEHICLE_CREATE_ERROR:",
        error
      );

      alert("Failed to create vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const deactivateVehicle = async (
    vehicleId: string
  ) => {
    const confirmed = window.confirm(
      "Deactivate this vehicle?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        "/api/admin/vehicles",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: vehicleId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to deactivate vehicle."
        );
        return;
      }

      setVehicles((current) =>
        current.map((vehicle) =>
          vehicle.id === vehicleId
            ? {
                ...vehicle,
                isActive: false,
                status: "INACTIVE",
              }
            : vehicle
        )
      );
    } catch (error) {
      console.error(
        "VEHICLE_DELETE_ERROR:",
        error
      );

      alert(
        "Failed to deactivate vehicle."
      );
    }
  };

  const activeVehicles = vehicles.filter(
    (vehicle) => vehicle.isActive
  ).length;

  const availableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.isActive &&
      vehicle.status === "AVAILABLE"
  ).length;

  const assignedVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.isActive &&
      vehicle.status === "ASSIGNED"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />

          <p className="text-gray-400 mt-4">
            Loading vehicles...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

          <div>
            <p className="text-blue-400 text-sm uppercase tracking-wider font-semibold">
              SmartDELHI Administration
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-2">
              Vehicle Management
            </h1>

            <p className="text-gray-400 mt-2">
              Monitor and manage civic service vehicles.
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={fetchVehicles}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition"
            >
              Refresh
            </button>

            <button
              onClick={() =>
                setShowForm(!showForm)
              }
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition"
            >
              {showForm
                ? "Close Form"
                : "+ Add Vehicle"}
            </button>

          </div>

        </div>

        {/* STATS */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

          <Stat
            title="Total"
            value={vehicles.length}
          />

          <Stat
            title="Active"
            value={activeVehicles}
          />

          <Stat
            title="Available"
            value={availableVehicles}
          />

          <Stat
            title="Assigned"
            value={assignedVehicles}
          />

        </div>

        {/* ADD VEHICLE FORM */}

        {showForm && (
          <form
            onSubmit={createVehicle}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8"
          >

            <h2 className="text-xl font-semibold mb-5">
              Add New Vehicle
            </h2>

            <div className="grid md:grid-cols-2 gap-4">

              <input
                value={form.vehicleNo}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vehicleNo:
                      e.target.value,
                  })
                }
                placeholder="Vehicle Number"
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
              />

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
              >
                <option>
                  Garbage Truck
                </option>

                <option>
                  Water Tanker
                </option>

                <option>
                  Road Cleaning Vehicle
                </option>

                <option>
                  Sewer Vehicle
                </option>

                <option>
                  Inspection Vehicle
                </option>

                <option>
                  Other
                </option>
              </select>

              <input
                value={form.ward}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ward: e.target.value,
                  })
                }
                placeholder="Ward"
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
              />

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
              >
                <option value="AVAILABLE">
                  Available
                </option>

                <option value="ASSIGNED">
                  Assigned
                </option>

                <option value="MAINTENANCE">
                  Maintenance
                </option>
              </select>

              <input
                value={form.driverName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    driverName:
                      e.target.value,
                  })
                }
                placeholder="Driver Name"
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
              />

              <input
                value={form.driverPhone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    driverPhone:
                      e.target.value,
                  })
                }
                placeholder="Driver Phone"
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none"
              />

            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 px-6 py-3 rounded-xl bg-green-600 hover:bg-green-500 disabled:opacity-50 transition"
            >
              {saving
                ? "Saving..."
                : "Create Vehicle"}
            </button>

          </form>
        )}

        {/* VEHICLE TABLE */}

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">

          <div className="p-5 border-b border-slate-800">
            <h2 className="text-xl font-semibold">
              Vehicle Fleet
            </h2>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No vehicles registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-slate-950 text-gray-400">
                  <tr>

                    <th className="text-left px-5 py-4">
                      Vehicle
                    </th>

                    <th className="text-left px-5 py-4">
                      Type
                    </th>

                    <th className="text-left px-5 py-4">
                      Ward
                    </th>

                    <th className="text-left px-5 py-4">
                      Driver
                    </th>

                    <th className="text-left px-5 py-4">
                      Status
                    </th>

                    <th className="text-left px-5 py-4">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {vehicles.map((vehicle) => (

                    <tr
                      key={vehicle.id}
                      className="border-t border-slate-800 hover:bg-slate-800/40"
                    >

                      <td className="px-5 py-5">
                        <div className="font-semibold">
                          {vehicle.vehicleNo}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {vehicle.isActive
                            ? "Active"
                            : "Inactive"}
                        </div>
                      </td>

                      <td className="px-5 py-5">
                        {vehicle.type}
                      </td>

                      <td className="px-5 py-5">
                        {vehicle.ward ||
                          "Not assigned"}
                      </td>

                      <td className="px-5 py-5">
                        <div>
                          {vehicle.driverName ||
                            "No driver"}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {vehicle.driverPhone ||
                            "-"}
                        </div>
                      </td>

                      <td className="px-5 py-5">

                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            vehicle.status ===
                            "AVAILABLE"
                              ? "bg-green-500/20 text-green-400"
                              : vehicle.status ===
                                "ASSIGNED"
                              ? "bg-blue-500/20 text-blue-400"
                              : vehicle.status ===
                                "MAINTENANCE"
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {vehicle.status}
                        </span>

                      </td>

                      <td className="px-5 py-5">

                        {vehicle.isActive && (
                          <button
                            onClick={() =>
                              deactivateVehicle(
                                vehicle.id
                              )
                            }
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition"
                          >
                            Deactivate
                          </button>
                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <p className="text-gray-500 text-sm">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>
    </div>
  );
}

export default function AdminVehiclesPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <VehiclesDashboard />
    </AuthGuard>
  );
}