"use client";

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import AuthGuard from "@/components/auth/AuthGuard";

/* =========================================================
   TYPES
========================================================= */

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

type FleetStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "MAINTENANCE"
  | "INACTIVE";

type FuelType =
  | "DIESEL"
  | "CNG"
  | "ELECTRIC"
  | "HYBRID";

interface FleetProfile {
  vehicleNo: string;
  type: string;
  fuel: FuelType;
  ward: string;
  driver: string;
  status: FleetStatus;
  kmToday: number;
  kmMonth: number;
  fuelCostToday: number;
  monthlyFuelCost: number;
  co2KgToday: number;
  maintenanceCost: number;
  purchaseYear: number;
  ageYears: number;
  utilization: number;
  batteryHealth?: number;
  capacity: string;
  assignment: string;
}

interface ProcurementItem {
  type: string;
  current: number;
  recommended: number;
  reason: string;
  urgency: "NOW" | "NEXT" | "PLANNED";
}

interface MaintenanceItem {
  vehicle: string;
  type: string;
  issue: string;
  cost: number;
  status: "IN_REPAIR" | "READY" | "SCRAPPED";
  recovered: number;
}

/* =========================================================
   DEMO 2026 DELHI FLEET INTELLIGENCE
   Explicitly mock/demo data.
========================================================= */

const DEMO_FLEET: FleetProfile[] = [
  {
    vehicleNo: "DL01-GC-2041",
    type: "Compactor Garbage Truck",
    fuel: "CNG",
    ward: "Rohini",
    driver: "Rajesh Kumar",
    status: "ASSIGNED",
    kmToday: 118,
    kmMonth: 2476,
    fuelCostToday: 1420,
    monthlyFuelCost: 29800,
    co2KgToday: 64,
    maintenanceCost: 3200,
    purchaseYear: 2022,
    ageYears: 4,
    utilization: 88,
    capacity: "14 m³",
    assignment: "North Rohini collection route",
  },
  {
    vehicleNo: "DL01-GC-2188",
    type: "Compactor Garbage Truck",
    fuel: "CNG",
    ward: "Dwarka",
    driver: "Amit Singh",
    status: "ASSIGNED",
    kmToday: 132,
    kmMonth: 2812,
    fuelCostToday: 1580,
    monthlyFuelCost: 32500,
    co2KgToday: 71,
    maintenanceCost: 4100,
    purchaseYear: 2021,
    ageYears: 5,
    utilization: 93,
    capacity: "16 m³",
    assignment: "Dwarka sector collection",
  },
  {
    vehicleNo: "DL02-RC-8812",
    type: "Road Sweeper",
    fuel: "DIESEL",
    ward: "Karol Bagh",
    driver: "Mohit Verma",
    status: "ASSIGNED",
    kmToday: 94,
    kmMonth: 2138,
    fuelCostToday: 1910,
    monthlyFuelCost: 42100,
    co2KgToday: 92,
    maintenanceCost: 6900,
    purchaseYear: 2020,
    ageYears: 6,
    utilization: 81,
    capacity: "6 m³",
    assignment: "Main arterial road sweeping",
  },
  {
    vehicleNo: "DL02-RC-9014",
    type: "Road Sweeper",
    fuel: "ELECTRIC",
    ward: "Central Delhi",
    driver: "Vikas Sharma",
    status: "AVAILABLE",
    kmToday: 71,
    kmMonth: 1640,
    fuelCostToday: 320,
    monthlyFuelCost: 6900,
    co2KgToday: 0,
    maintenanceCost: 1800,
    purchaseYear: 2024,
    ageYears: 2,
    utilization: 64,
    batteryHealth: 94,
    capacity: "5 m³",
    assignment: "Standby / emergency route",
  },
  {
    vehicleNo: "DL03-WT-1107",
    type: "Water Tanker",
    fuel: "DIESEL",
    ward: "Najafgarh",
    driver: "Sandeep Yadav",
    status: "ASSIGNED",
    kmToday: 109,
    kmMonth: 2398,
    fuelCostToday: 2260,
    monthlyFuelCost: 47700,
    co2KgToday: 108,
    maintenanceCost: 5800,
    purchaseYear: 2019,
    ageYears: 7,
    utilization: 86,
    capacity: "10,000 L",
    assignment: "Water emergency response",
  },
  {
    vehicleNo: "DL03-WT-1182",
    type: "Water Tanker",
    fuel: "CNG",
    ward: "Narela",
    driver: "Deepak Rana",
    status: "ASSIGNED",
    kmToday: 88,
    kmMonth: 1960,
    fuelCostToday: 1290,
    monthlyFuelCost: 28200,
    co2KgToday: 58,
    maintenanceCost: 2700,
    purchaseYear: 2023,
    ageYears: 3,
    utilization: 74,
    capacity: "8,000 L",
    assignment: "Water supply support",
  },
  {
    vehicleNo: "DL04-SW-7721",
    type: "Sewer Jetting Vehicle",
    fuel: "DIESEL",
    ward: "Shahdara",
    driver: "Pankaj Meena",
    status: "MAINTENANCE",
    kmToday: 0,
    kmMonth: 702,
    fuelCostToday: 0,
    monthlyFuelCost: 18400,
    co2KgToday: 0,
    maintenanceCost: 48600,
    purchaseYear: 2018,
    ageYears: 8,
    utilization: 42,
    capacity: "6,000 L",
    assignment: "Workshop",
  },
  {
    vehicleNo: "DL04-SW-7902",
    type: "Sewer Jetting Vehicle",
    fuel: "DIESEL",
    ward: "East Delhi",
    driver: "Nitin Kumar",
    status: "ASSIGNED",
    kmToday: 83,
    kmMonth: 1742,
    fuelCostToday: 2020,
    monthlyFuelCost: 39800,
    co2KgToday: 97,
    maintenanceCost: 8400,
    purchaseYear: 2021,
    ageYears: 5,
    utilization: 78,
    capacity: "8,000 L",
    assignment: "Drainage response unit",
  },
  {
    vehicleNo: "DL05-IC-4301",
    type: "Inspection SUV",
    fuel: "HYBRID",
    ward: "Civil Lines",
    driver: "Ankit Gupta",
    status: "ASSIGNED",
    kmToday: 126,
    kmMonth: 2912,
    fuelCostToday: 980,
    monthlyFuelCost: 21400,
    co2KgToday: 31,
    maintenanceCost: 2400,
    purchaseYear: 2023,
    ageYears: 3,
    utilization: 91,
    capacity: "5 seats",
    assignment: "Ward inspection / enforcement",
  },
  {
    vehicleNo: "DL05-IC-4319",
    type: "Inspection SUV",
    fuel: "ELECTRIC",
    ward: "South Delhi",
    driver: "Rohit Malik",
    status: "AVAILABLE",
    kmToday: 57,
    kmMonth: 1334,
    fuelCostToday: 210,
    monthlyFuelCost: 4800,
    co2KgToday: 0,
    maintenanceCost: 1200,
    purchaseYear: 2025,
    ageYears: 1,
    utilization: 52,
    batteryHealth: 97,
    capacity: "5 seats",
    assignment: "Standby",
  },
  {
    vehicleNo: "DL06-MW-6620",
    type: "Mechanical Workshop Van",
    fuel: "CNG",
    ward: "West Delhi",
    driver: "Sunil Rawat",
    status: "ASSIGNED",
    kmToday: 103,
    kmMonth: 2208,
    fuelCostToday: 1210,
    monthlyFuelCost: 26800,
    co2KgToday: 52,
    maintenanceCost: 3100,
    purchaseYear: 2022,
    ageYears: 4,
    utilization: 83,
    capacity: "Workshop",
    assignment: "Mobile maintenance support",
  },
  {
    vehicleNo: "DL06-EV-1004",
    type: "Electric Waste Mini Truck",
    fuel: "ELECTRIC",
    ward: "Greater Kailash",
    driver: "Arjun Das",
    status: "ASSIGNED",
    kmToday: 82,
    kmMonth: 1830,
    fuelCostToday: 280,
    monthlyFuelCost: 6100,
    co2KgToday: 0,
    maintenanceCost: 1700,
    purchaseYear: 2025,
    ageYears: 1,
    utilization: 77,
    batteryHealth: 91,
    capacity: "4 m³",
    assignment: "Zero-emission local collection",
  },
];

/* =========================================================
   MOCK FINANCIAL / OPERATIONS DATA
========================================================= */

const FLEET_FINANCE = {
  annualFuelBudget: 42.8,
  annualFuelSpend: 31.6,
  maintenanceBudget: 18.4,
  maintenanceSpend: 12.7,
  acquisitionBudget: 96,
  acquisitionSpend: 61,
  salvageRecovered: 4.8,
  insuranceRecovered: 2.1,
  avgDieselPerLiter: 91.4,
  avgCngPerKg: 78,
  electricityPerKwh: 8.2,
};

const MAINTENANCE: MaintenanceItem[] = [
  {
    vehicle: "DL04-SW-7721",
    type: "Sewer Jetting Vehicle",
    issue: "High-pressure pump failure",
    cost: 48600,
    status: "IN_REPAIR",
    recovered: 0,
  },
  {
    vehicle: "DL02-RC-7710",
    type: "Road Sweeper",
    issue: "Hydraulic system failure",
    cost: 74200,
    status: "READY",
    recovered: 18500,
  },
  {
    vehicle: "DL01-GC-1904",
    type: "Compactor Truck",
    issue: "End-of-life chassis",
    cost: 0,
    status: "SCRAPPED",
    recovered: 142000,
  },
  {
    vehicle: "DL03-WT-0842",
    type: "Water Tanker",
    issue: "Tank corrosion",
    cost: 31800,
    status: "SCRAPPED",
    recovered: 68000,
  },
];

const PROCUREMENT: ProcurementItem[] = [
  {
    type: "Electric Waste Mini Truck",
    current: 6,
    recommended: 18,
    reason: "High suitability for dense residential collection routes",
    urgency: "NOW",
  },
  {
    type: "Electric Road Sweeper",
    current: 3,
    recommended: 10,
    reason: "Lower operating cost and zero tailpipe emissions",
    urgency: "NEXT",
  },
  {
    type: "CNG Compactor",
    current: 26,
    recommended: 34,
    reason: "Highest fleet utilization category",
    urgency: "NEXT",
  },
  {
    type: "Sewer Jetting Vehicle",
    current: 9,
    recommended: 12,
    reason: "Long response times in high-density drainage zones",
    urgency: "PLANNED",
  },
];

/* =========================================================
   HELPERS
========================================================= */

function money(value: number, decimals = 1) {
  return `₹${value.toFixed(decimals)}L`;
}

function number(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusStyle(status: string) {
  switch (status) {
    case "ASSIGNED":
      return "bg-cyan-400/10 text-cyan-300 border-cyan-400/20";
    case "AVAILABLE":
      return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
    case "MAINTENANCE":
      return "bg-amber-400/10 text-amber-300 border-amber-400/20";
    default:
      return "bg-rose-400/10 text-rose-300 border-rose-400/20";
  }
}

function fuelStyle(fuel: FuelType) {
  switch (fuel) {
    case "ELECTRIC":
      return "bg-emerald-400/10 text-emerald-300";
    case "HYBRID":
      return "bg-violet-400/10 text-violet-300";
    case "CNG":
      return "bg-cyan-400/10 text-cyan-300";
    default:
      return "bg-orange-400/10 text-orange-300";
  }
}

/* =========================================================
   ICONS
========================================================= */

function TruckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M3 6h11v10H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="18" cy="18" r="2" />
    </svg>
  );
}

function LeafIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M20 4C11 4 5 8 5 14c0 3 2 5 5 5 6 0 10-6 10-15Z" />
      <path d="M4 21c3-4 6-7 12-10" />
    </svg>
  );
}

function FuelIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" />
      <path d="M5 9h11" />
      <path d="M16 7h2l3 3v8a2 2 0 0 1-2 2h-1" />
      <path d="M8 13h5" />
    </svg>
  );
}

function ActivityIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M3 12h4l2-7 4 14 2-7h6" />
    </svg>
  );
}

function WrenchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M14 6a4 4 0 0 0-5 5L3 17l4 4 6-6a4 4 0 0 0 5-5l-3 3-3-3 2-4Z" />
    </svg>
  );
}

function MapPinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
    >
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function PlusIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function RefreshIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M20 11a8 8 0 0 0-14.9-4" />
      <path d="M4 4v5h5" />
      <path d="M4 13a8 8 0 0 0 14.9 4" />
      <path d="M20 20v-5h-5" />
    </svg>
  );
}

function ChevronIcon({
  open,
  className = "",
}: {
  open: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={`${className} transition-transform ${
        open ? "rotate-180" : ""
      }`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* =========================================================
   RING
========================================================= */

function Ring({
  value,
  label,
  sub,
  color,
}: {
  value: number;
  label: string;
  sub?: string;
  color: string;
}) {
  const safe = Number.isFinite(value)
    ? Math.max(0, Math.min(100, value))
    : 0;

  const radius = 39;
  const circumference = 2 * Math.PI * radius;
  const dash = (safe / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <svg
          viewBox="0 0 100 100"
          className="-rotate-90 h-full w-full"
        >
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circumference}`}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-black">
            {Math.round(safe)}%
          </span>
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white">
          {label}
        </p>
        {sub && (
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function MetricCard({
  label,
  value,
  detail,
  icon,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/[0.07] bg-white/[0.035] p-5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/[0.14]">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl opacity-20 ${accent}`}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-3">
            {icon}
          </div>

          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-600">
            2026
          </span>
        </div>

        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>

        <p className="mt-1 text-3xl font-black tracking-tight">
          {value}
        </p>

        <p className="mt-2 text-xs text-slate-500">
          {detail}
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

function VehiclesDashboard() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedVehicle, setExpandedVehicle] =
    useState<string | null>(null);
  const [activeTab, setActiveTab] =
    useState<"overview" | "fleet" | "maintenance" | "procurement">(
      "overview",
    );
  const [fuelFilter, setFuelFilter] =
    useState<"ALL" | FuelType>("ALL");

  const [form, setForm] = useState({
    vehicleNo: "",
    type: "Garbage Truck",
    ward: "",
    status: "AVAILABLE",
    driverName: "",
    driverPhone: "",
  });

  const fetchVehicles = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(
        "/api/admin/vehicles",
        { cache: "no-store" },
      );

      const data = await response.json();

      if (data.success) {
        setVehicles(data.vehicles ?? []);
      }
    } catch (error) {
      console.error("VEHICLES_FETCH_ERROR:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const createVehicle = async (
    event: FormEvent,
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
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to create vehicle.",
        );
        return;
      }

      setVehicles((current) => [
        data.vehicle,
        ...current,
      ]);

      setForm({
        vehicleNo: "",
        type: "Garbage Truck",
        ward: "",
        status: "AVAILABLE",
        driverName: "",
        driverPhone: "",
      });

      setShowForm(false);
      alert("Vehicle added successfully.");
    } catch (error) {
      console.error(
        "VEHICLE_CREATE_ERROR:",
        error,
      );

      alert("Failed to create vehicle.");
    } finally {
      setSaving(false);
    }
  };

  const deactivateVehicle = async (
    vehicleId: string,
  ) => {
    const confirmed = window.confirm(
      "Deactivate this vehicle?",
    );

    if (!confirmed) return;

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
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Failed to deactivate vehicle.",
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
            : vehicle,
        ),
      );
    } catch (error) {
      console.error(
        "VEHICLE_DELETE_ERROR:",
        error,
      );

      alert(
        "Failed to deactivate vehicle.",
      );
    }
  };

  const apiVehicles = useMemo(() => {
    return vehicles.map((vehicle) => ({
      ...vehicle,
      status: vehicle.isActive
        ? vehicle.status
        : "INACTIVE",
    }));
  }, [vehicles]);

  const totalFleet = DEMO_FLEET.length;
  const assigned = DEMO_FLEET.filter(
    (v) => v.status === "ASSIGNED",
  ).length;
  const available = DEMO_FLEET.filter(
    (v) => v.status === "AVAILABLE",
  ).length;
  const maintenance = DEMO_FLEET.filter(
    (v) => v.status === "MAINTENANCE",
  ).length;

  const electric = DEMO_FLEET.filter(
    (v) => v.fuel === "ELECTRIC",
  ).length;

  const hybrid = DEMO_FLEET.filter(
    (v) => v.fuel === "HYBRID",
  ).length;

  const cleanFleet = electric + hybrid;

  const dailyKm = DEMO_FLEET.reduce(
    (sum, v) => sum + v.kmToday,
    0,
  );

  const dailyFuelCost = DEMO_FLEET.reduce(
    (sum, v) => sum + v.fuelCostToday,
    0,
  );

  const dailyCO2 = DEMO_FLEET.reduce(
    (sum, v) => sum + v.co2KgToday,
    0,
  );

  const averageUtilization =
    DEMO_FLEET.reduce(
      (sum, v) => sum + v.utilization,
      0,
    ) / DEMO_FLEET.length;

  const filteredFleet = DEMO_FLEET.filter(
    (vehicle) =>
      fuelFilter === "ALL" ||
      vehicle.fuel === fuelFilter,
  );

  const fleetByFuel = {
    DIESEL: DEMO_FLEET.filter(
      (v) => v.fuel === "DIESEL",
    ).length,
    CNG: DEMO_FLEET.filter(
      (v) => v.fuel === "CNG",
    ).length,
    ELECTRIC: electric,
    HYBRID: hybrid,
  };

  const fuelMax = Math.max(
    ...Object.values(fleetByFuel),
    1,
  );

  const utilizationSegments = [
    {
      label: "High utilization",
      count: DEMO_FLEET.filter(
        (v) => v.utilization >= 80,
      ).length,
      color: "bg-cyan-400",
    },
    {
      label: "Healthy",
      count: DEMO_FLEET.filter(
        (v) =>
          v.utilization >= 60 &&
          v.utilization < 80,
      ).length,
      color: "bg-emerald-400",
    },
    {
      label: "Under-used",
      count: DEMO_FLEET.filter(
        (v) => v.utilization < 60,
      ).length,
      color: "bg-amber-400",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto h-16 w-16">
            <div className="absolute inset-0 rounded-full border border-cyan-400/20" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-400" />
            <TruckIcon className="absolute inset-0 m-auto h-7 w-7 text-cyan-300" />
          </div>

          <p className="mt-5 text-sm text-slate-400">
            Initialising Delhi fleet intelligence...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#030712] text-white">
      {/* BACKGROUND */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[420px] w-[420px] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute right-[-120px] top-[30%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-[120px]" />
        <div className="absolute bottom-[-150px] left-[30%] h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1500px] px-4 py-6 md:px-7 lg:px-10">
        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300" />
                  Fleet intelligence · 2026
                </span>

                <span className="rounded-full border border-white/[0.06] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Demo operational dataset
                </span>
              </div>

              <h1 className="text-4xl font-black tracking-[-0.04em] md:text-6xl">
                Delhi Fleet
                <span className="block bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                  Command Center
                </span>
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400 md:text-base">
                A unified operational view of civic vehicles,
                assignments, mobility, fuel economics,
                maintenance exposure, carbon output and
                future procurement requirements.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => fetchVehicles(true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
              >
                <RefreshIcon
                  className={`h-4 w-4 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />
                {refreshing
                  ? "Syncing..."
                  : "Sync Fleet"}
              </button>

              <button
                onClick={() =>
                  setShowForm(!showForm)
                }
                className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-black text-slate-950 shadow-[0_0_35px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300"
              >
                <PlusIcon className="h-4 w-4" />
                Add Vehicle
              </button>
            </div>
          </div>

          {/* NAV */}
          <div className="mt-7 flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.06] bg-white/[0.025] p-1.5">
            {[
              ["overview", "Fleet overview"],
              ["fleet", "Vehicle registry"],
              ["maintenance", "Maintenance"],
              ["procurement", "Procurement plan"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setActiveTab(
                    key as
                      | "overview"
                      | "fleet"
                      | "maintenance"
                      | "procurement",
                  )
                }
                className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  activeTab === key
                    ? "bg-white text-slate-950"
                    : "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </header>

        {/* =================================================
            ADD FORM
        ================================================= */}

        {showForm && (
          <form
            onSubmit={createVehicle}
            className="mb-7 rounded-[28px] border border-cyan-400/15 bg-cyan-400/[0.025] p-5 shadow-2xl shadow-black/20 md:p-7"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Fleet intake
                </p>
                <h2 className="mt-1 text-xl font-black">
                  Register a new civic vehicle
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-white/[0.05] hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  key: "vehicleNo",
                  placeholder: "Vehicle number",
                },
                {
                  key: "ward",
                  placeholder: "Assigned ward",
                },
                {
                  key: "driverName",
                  placeholder: "Driver name",
                },
                {
                  key: "driverPhone",
                  placeholder: "Driver phone",
                },
              ].map((field) => (
                <input
                  key={field.key}
                  value={
                    form[
                      field.key as keyof typeof form
                    ]
                  }
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [field.key]: e.target.value,
                    })
                  }
                  placeholder={field.placeholder}
                  className="rounded-2xl border border-white/[0.07] bg-black/20 px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
                />
              ))}

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/[0.07] bg-[#07111f] px-4 py-3.5 text-sm outline-none"
              >
                <option>Garbage Truck</option>
                <option>Water Tanker</option>
                <option>Road Cleaning Vehicle</option>
                <option>Sewer Vehicle</option>
                <option>Inspection Vehicle</option>
                <option>Other</option>
              </select>

              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
                className="rounded-2xl border border-white/[0.07] bg-[#07111f] px-4 py-3.5 text-sm outline-none"
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
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-5 rounded-2xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50"
            >
              {saving
                ? "Registering..."
                : "Register Vehicle"}
            </button>
          </form>
        )}

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab === "overview" && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Fleet under command"
                value={number(totalFleet)}
                detail={`${assigned} assigned · ${available} available · ${maintenance} workshop`}
                icon={
                  <TruckIcon className="h-5 w-5 text-cyan-300" />
                }
                accent="bg-cyan-400"
              />

              <MetricCard
                label="Daily movement"
                value={`${number(dailyKm)} km`}
                detail="Estimated combined distance travelled today"
                icon={
                  <ActivityIcon className="h-5 w-5 text-violet-300" />
                }
                accent="bg-violet-400"
              />

              <MetricCard
                label="Operating fuel cost"
                value={`₹${number(
                  dailyFuelCost,
                )}`}
                detail="Approx. daily fuel + charging cost"
                icon={
                  <FuelIcon className="h-5 w-5 text-amber-300" />
                }
                accent="bg-amber-400"
              />

              <MetricCard
                label="Zero-tailpipe fleet"
                value={`${cleanFleet}`}
                detail={`${Math.round(
                  (cleanFleet / totalFleet) * 100,
                )}% electric / hybrid vehicles`}
                icon={
                  <LeafIcon className="h-5 w-5 text-emerald-300" />
                }
                accent="bg-emerald-400"
              />
            </section>

            {/* HERO INTELLIGENCE GRID */}
            <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
              <div className="rounded-[30px] border border-white/[0.07] bg-gradient-to-br from-white/[0.055] to-white/[0.015] p-6 md:p-8">
                <div className="flex flex-col justify-between gap-5 md:flex-row">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                      Operational pulse
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">
                      Fleet efficiency snapshot
                    </h2>
                    <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                      The fleet is currently operating at
                      approximately{" "}
                      <span className="font-bold text-white">
                        {Math.round(
                          averageUtilization,
                        )}
                        %
                      </span>{" "}
                      average utilisation.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/[0.05] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-300">
                      Fleet health
                    </p>
                    <p className="mt-1 text-lg font-black text-emerald-200">
                      Operational
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid gap-7 md:grid-cols-3">
                  <Ring
                    value={averageUtilization}
                    label="Utilisation"
                    sub="Combined active fleet utilisation"
                    color="#22d3ee"
                  />

                  <Ring
                    value={
                      (cleanFleet /
                        totalFleet) *
                      100
                    }
                    label="Clean mobility"
                    sub="Electric + hybrid share"
                    color="#34d399"
                  />

                  <Ring
                    value={
                      ((totalFleet -
                        maintenance) /
                        totalFleet) *
                      100
                    }
                    label="Availability health"
                    sub="Vehicles not currently in workshop"
                    color="#a78bfa"
                  />
                </div>

                <div className="mt-8 grid grid-cols-3 gap-2">
                  {utilizationSegments.map(
                    (segment) => (
                      <div
                        key={segment.label}
                        className="rounded-2xl border border-white/[0.05] bg-black/10 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${segment.color}`}
                          />
                          <span className="text-[10px] text-slate-500">
                            {segment.label}
                          </span>
                        </div>

                        <p className="mt-2 text-xl font-black">
                          {segment.count}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* EMISSION PANEL */}
              <div className="rounded-[30px] border border-emerald-400/10 bg-gradient-to-b from-emerald-400/[0.06] to-white/[0.015] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      Environment
                    </p>
                    <h2 className="mt-2 text-xl font-black">
                      Carbon watch
                    </h2>
                  </div>

                  <LeafIcon className="h-7 w-7 text-emerald-300" />
                </div>

                <div className="mt-8">
                  <p className="text-5xl font-black tracking-tight">
                    {number(dailyCO2)}
                    <span className="ml-1 text-sm font-bold text-slate-500">
                      kg
                    </span>
                  </p>

                  <p className="mt-2 text-sm text-slate-500">
                    estimated tailpipe CO₂ generated today
                  </p>
                </div>

                <div className="mt-8 space-y-5">
                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Diesel contribution
                      </span>
                      <span className="font-bold text-orange-300">
                        {Math.round(
                          (DEMO_FLEET.filter(
                            (v) =>
                              v.fuel ===
                              "DIESEL",
                          ).length /
                            totalFleet) *
                            100,
                        )}
                        %
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-orange-400"
                        style={{
                          width: `${
                            (DEMO_FLEET.filter(
                              (v) =>
                                v.fuel ===
                                "DIESEL",
                            ).length /
                              totalFleet) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">
                        Clean fleet share
                      </span>
                      <span className="font-bold text-emerald-300">
                        {Math.round(
                          (cleanFleet /
                            totalFleet) *
                            100,
                        )}
                        %
                      </span>
                    </div>

                    <div className="mt-2 h-2 rounded-full bg-white/[0.05]">
                      <div
                        className="h-full rounded-full bg-emerald-400"
                        style={{
                          width: `${
                            (cleanFleet /
                              totalFleet) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-emerald-400/10 bg-black/10 p-4">
                  <p className="text-xs leading-6 text-slate-500">
                    Demo planning signal: replacing older
                    diesel assets with electric/CNG units
                    could materially reduce fuel exposure
                    and tailpipe emissions on short urban
                    routes.
                  </p>
                </div>
              </div>
            </section>

            {/* FUEL MIX */}
            <section className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                      Fleet composition
                    </p>
                    <h2 className="mt-1 text-xl font-black">
                      Energy mix
                    </h2>
                  </div>

                  <FuelIcon className="h-6 w-6 text-cyan-300" />
                </div>

                <div className="mt-7 space-y-5">
                  {(
                    Object.entries(
                      fleetByFuel,
                    ) as [
                      FuelType,
                      number,
                    ][]
                  ).map(([fuel, count]) => (
                    <div key={fuel}>
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="font-semibold text-slate-300">
                          {fuel}
                        </span>

                        <span className="text-slate-500">
                          {count} vehicles
                        </span>
                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-white/[0.05]">
                        <div
                          className={`h-full rounded-full ${
                            fuel === "DIESEL"
                              ? "bg-orange-400"
                              : fuel === "CNG"
                                ? "bg-cyan-400"
                                : fuel ===
                                    "ELECTRIC"
                                  ? "bg-emerald-400"
                                  : "bg-violet-400"
                          }`}
                          style={{
                            width: `${
                              (count /
                                fuelMax) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COST PANEL */}
              <div className="rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Fleet economics
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Where the money is moving
                </h2>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  {[
                    [
                      "Fuel budget",
                      money(
                        FLEET_FINANCE.annualFuelBudget,
                      ),
                      money(
                        FLEET_FINANCE.annualFuelSpend,
                      ),
                    ],
                    [
                      "Maintenance",
                      money(
                        FLEET_FINANCE.maintenanceBudget,
                      ),
                      money(
                        FLEET_FINANCE.maintenanceSpend,
                      ),
                    ],
                    [
                      "Acquisition",
                      money(
                        FLEET_FINANCE.acquisitionBudget,
                      ),
                      money(
                        FLEET_FINANCE.acquisitionSpend,
                      ),
                    ],
                    [
                      "Recovered",
                      money(
                        FLEET_FINANCE.salvageRecovered +
                          FLEET_FINANCE.insuranceRecovered,
                      ),
                      "salvage + insurance",
                    ],
                  ].map(
                    ([label, budget, spend]) => (
                      <div
                        key={label}
                        className="rounded-2xl border border-white/[0.05] bg-black/10 p-4"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-slate-600">
                          {label}
                        </p>

                        <p className="mt-2 text-lg font-black">
                          {budget}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {spend}
                        </p>
                      </div>
                    ),
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-4">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500">
                      Approx. daily operating cost
                    </span>

                    <span className="text-sm font-black text-amber-300">
                      ₹{number(dailyFuelCost)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* API VEHICLES */}
            <section className="mt-6 rounded-[28px] border border-white/[0.07] bg-white/[0.03] p-6">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                    Connected fleet registry
                  </p>

                  <h2 className="mt-1 text-xl font-black">
                    Live registered vehicles
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Data below is directly sourced from
                    your vehicle API.
                  </p>
                </div>

                <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  {apiVehicles.length} connected
                </span>
              </div>

              {apiVehicles.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-slate-600">
                  No registered vehicles returned by the
                  API yet.
                </div>
              ) : (
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {apiVehicles.slice(0, 9).map(
                    (vehicle) => (
                      <div
                        key={vehicle.id}
                        className="rounded-2xl border border-white/[0.06] bg-black/10 p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-black">
                              {vehicle.vehicleNo}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {vehicle.type}
                            </p>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusStyle(
                              vehicle.status,
                            )}`}
                          >
                            {statusLabel(
                              vehicle.status,
                            )}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {vehicle.ward ||
                            "No ward assigned"}
                        </div>

                        <div className="mt-2 text-xs text-slate-600">
                          Driver:{" "}
                          {vehicle.driverName ||
                            "Unassigned"}
                        </div>

                        {vehicle.isActive && (
                          <button
                            onClick={() =>
                              deactivateVehicle(
                                vehicle.id,
                              )
                            }
                            className="mt-4 text-[10px] font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300"
                          >
                            Deactivate vehicle
                          </button>
                        )}
                      </div>
                    ),
                  )}
                </div>
              )}
            </section>
          </>
        )}

        {/* =================================================
            FLEET REGISTRY
        ================================================= */}

        {activeTab === "fleet" && (
          <section>
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-300">
                  Operational registry
                </p>

                <h2 className="mt-1 text-2xl font-black">
                  Vehicle-by-vehicle command
                </h2>
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {[
                  "ALL",
                  "DIESEL",
                  "CNG",
                  "ELECTRIC",
                  "HYBRID",
                ].map((fuel) => (
                  <button
                    key={fuel}
                    onClick={() =>
                      setFuelFilter(
                        fuel as
                          | "ALL"
                          | FuelType,
                      )
                    }
                    className={`rounded-xl px-3 py-2 text-[10px] font-black tracking-wider ${
                      fuelFilter === fuel
                        ? "bg-white text-slate-950"
                        : "border border-white/[0.06] text-slate-500 hover:text-white"
                    }`}
                  >
                    {fuel}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {filteredFleet.map(
                (vehicle) => {
                  const open =
                    expandedVehicle ===
                    vehicle.vehicleNo;

                  return (
                    <div
                      key={vehicle.vehicleNo}
                      className="overflow-hidden rounded-[26px] border border-white/[0.07] bg-white/[0.03] transition hover:border-white/[0.12]"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedVehicle(
                            open
                              ? null
                              : vehicle.vehicleNo,
                          )
                        }
                        className="w-full p-5 text-left"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.05] p-3">
                              <TruckIcon className="h-6 w-6 text-cyan-300" />
                            </div>

                            <div>
                              <p className="font-black">
                                {vehicle.vehicleNo}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {vehicle.type}
                              </p>
                            </div>
                          </div>

                          <ChevronIcon
                            open={open}
                            className="h-5 w-5 text-slate-600"
                          />
                        </div>

                        <div className="mt-5 grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-black/10 p-3">
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Today
                            </p>
                            <p className="mt-1 text-sm font-black">
                              {vehicle.kmToday} km
                            </p>
                          </div>

                          <div className="rounded-xl bg-black/10 p-3">
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Util.
                            </p>
                            <p className="mt-1 text-sm font-black">
                              {vehicle.utilization}%
                            </p>
                          </div>

                          <div className="rounded-xl bg-black/10 p-3">
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Fuel
                            </p>
                            <p
                              className={`mt-1 text-[10px] font-black ${fuelStyle(
                                vehicle.fuel,
                              )}`}
                            >
                              {vehicle.fuel}
                            </p>
                          </div>
                        </div>
                      </button>

                      {open && (
                        <div className="border-t border-white/[0.06] bg-black/10 p-5">
                          <div className="grid gap-3 sm:grid-cols-2">
                            {[
                              [
                                "Ward",
                                vehicle.ward,
                              ],
                              [
                                "Driver",
                                vehicle.driver,
                              ],
                              [
                                "Assignment",
                                vehicle.assignment,
                              ],
                              [
                                "Capacity",
                                vehicle.capacity,
                              ],
                              [
                                "Monthly distance",
                                `${number(
                                  vehicle.kmMonth,
                                )} km`,
                              ],
                              [
                                "Monthly fuel",
                                `₹${number(
                                  vehicle.monthlyFuelCost,
                                )}`,
                              ],
                              [
                                "Purchase year",
                                vehicle.purchaseYear,
                              ],
                              [
                                "Maintenance",
                                `₹${number(
                                  vehicle.maintenanceCost,
                                )}`,
                              ],
                            ].map(
                              ([label, value]) => (
                                <div
                                  key={label}
                                  className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                                >
                                  <p className="text-[9px] uppercase tracking-wider text-slate-600">
                                    {label}
                                  </p>
                                  <p className="mt-1 text-xs font-semibold text-slate-300">
                                    {value}
                                  </p>
                                </div>
                              ),
                            )}
                          </div>

                          {vehicle.batteryHealth !==
                            undefined && (
                            <div className="mt-4">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">
                                  Battery health
                                </span>
                                <span className="font-bold text-emerald-300">
                                  {
                                    vehicle.batteryHealth
                                  }
                                  %
                                </span>
                              </div>

                              <div className="mt-2 h-2 rounded-full bg-white/[0.05]">
                                <div
                                  className="h-full rounded-full bg-emerald-400"
                                  style={{
                                    width: `${vehicle.batteryHealth}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </section>
        )}

        {/* =================================================
            MAINTENANCE
        ================================================= */}

        {activeTab === "maintenance" && (
          <section>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Workshop queue"
                value={String(maintenance)}
                detail="Vehicles currently unavailable"
                icon={
                  <WrenchIcon className="h-5 w-5 text-amber-300" />
                }
                accent="bg-amber-400"
              />

              <MetricCard
                label="Repair spend"
                value={money(
                  MAINTENANCE.reduce(
                    (sum, item) =>
                      sum + item.cost,
                    0,
                  ) / 100000,
                )}
                detail="Demo repair expenditure"
                icon={
                  <FuelIcon className="h-5 w-5 text-rose-300" />
                }
                accent="bg-rose-400"
              />

              <MetricCard
                label="Recovered value"
                value={money(
                  MAINTENANCE.reduce(
                    (sum, item) =>
                      sum + item.recovered,
                    0,
                  ) / 100000,
                )}
                detail="Scrap + recovery proceeds"
                icon={
                  <ActivityIcon className="h-5 w-5 text-emerald-300" />
                }
                accent="bg-emerald-400"
              />

              <MetricCard
                label="Net exposure"
                value={money(
                  (MAINTENANCE.reduce(
                    (sum, item) =>
                      sum + item.cost,
                    0,
                  ) -
                    MAINTENANCE.reduce(
                      (sum, item) =>
                        sum + item.recovered,
                      0,
                    )) /
                    100000,
                )}
                detail="Repair cost minus recovered value"
                icon={
                  <WrenchIcon className="h-5 w-5 text-violet-300" />
                }
                accent="bg-violet-400"
              />
            </div>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.03]">
              <div className="border-b border-white/[0.06] p-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-300">
                  Workshop intelligence
                </p>

                <h2 className="mt-1 text-xl font-black">
                  Maintenance & recovery register
                </h2>
              </div>

              <div className="divide-y divide-white/[0.05]">
                {MAINTENANCE.map(
                  (item) => (
                    <div
                      key={item.vehicle}
                      className="grid gap-4 p-5 md:grid-cols-[1.1fr_1fr_1.5fr_auto] md:items-center"
                    >
                      <div>
                        <p className="font-black">
                          {item.vehicle}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {item.type}
                        </p>
                      </div>

                      <div className="text-sm text-slate-400">
                        {item.issue}
                      </div>

                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-slate-600">
                          Financial impact
                        </p>
                        <div className="mt-1 flex gap-4 text-xs">
                          <span className="text-rose-300">
                            Repair ₹
                            {number(item.cost)}
                          </span>
                          <span className="text-emerald-300">
                            Recovered ₹
                            {number(
                              item.recovered,
                            )}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-center text-[9px] font-black ${
                          item.status ===
                          "SCRAPPED"
                            ? "border-rose-400/20 bg-rose-400/10 text-rose-300"
                            : item.status ===
                                "READY"
                              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                              : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {item.status.replaceAll(
                          "_",
                          " ",
                        )}
                      </span>
                    </div>
                  ),
                )}
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            PROCUREMENT
        ================================================= */}

        {activeTab === "procurement" && (
          <section>
            <div className="rounded-[30px] border border-violet-400/10 bg-gradient-to-br from-violet-400/[0.07] to-white/[0.015] p-6 md:p-8">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
                    Planning intelligence
                  </p>

                  <h2 className="mt-2 text-3xl font-black">
                    What should Delhi buy next?
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Illustrative procurement recommendations
                    derived from utilisation, route suitability,
                    operating cost and fleet composition.
                  </p>
                </div>

                <div className="rounded-2xl border border-violet-400/10 bg-violet-400/[0.05] px-4 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-violet-300">
                    Planning horizon
                  </p>
                  <p className="mt-1 text-sm font-black">
                    2026–2028
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {PROCUREMENT.map(
                  (item) => {
                    const gap =
                      item.recommended -
                      item.current;

                    const progress = Math.min(
                      100,
                      (item.current /
                        item.recommended) *
                        100,
                    );

                    return (
                      <div
                        key={item.type}
                        className="rounded-[24px] border border-white/[0.07] bg-black/10 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-black">
                              {item.type}
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {item.reason}
                            </p>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[9px] font-black ${
                              item.urgency ===
                              "NOW"
                                ? "bg-rose-400/10 text-rose-300"
                                : item.urgency ===
                                    "NEXT"
                                  ? "bg-amber-400/10 text-amber-300"
                                  : "bg-cyan-400/10 text-cyan-300"
                            }`}
                          >
                            {item.urgency}
                          </span>
                        </div>

                        <div className="mt-6 flex items-end justify-between">
                          <div>
                            <p className="text-3xl font-black">
                              {item.current}
                            </p>
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Current
                            </p>
                          </div>

                          <div className="pb-2 text-2xl text-slate-700">
                            →
                          </div>

                          <div className="text-right">
                            <p className="text-3xl font-black text-violet-300">
                              {item.recommended}
                            </p>
                            <p className="text-[9px] uppercase tracking-wider text-slate-600">
                              Recommended
                            </p>
                          </div>
                        </div>

                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-violet-400"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                          Fleet gap:{" "}
                          <span className="font-bold text-white">
                            {gap} vehicles
                          </span>
                        </p>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-[26px] border border-white/[0.07] bg-white/[0.03] p-6">
                <LeafIcon className="h-6 w-6 text-emerald-300" />
                <p className="mt-5 text-[10px] uppercase tracking-wider text-slate-600">
                  Renewable transition
                </p>
                <p className="mt-1 text-3xl font-black">
                  +24
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Illustrative additional EV/hybrid units
                  recommended across the planning horizon.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/[0.07] bg-white/[0.03] p-6">
                <FuelIcon className="h-6 w-6 text-amber-300" />
                <p className="mt-5 text-[10px] uppercase tracking-wider text-slate-600">
                  Fuel exposure
                </p>
                <p className="mt-1 text-3xl font-black">
                  {money(
                    FLEET_FINANCE.annualFuelSpend,
                  )}
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Illustrative annual fuel operating spend
                  used for planning UI.
                </p>
              </div>

              <div className="rounded-[26px] border border-white/[0.07] bg-white/[0.03] p-6">
                <TruckIcon className="h-6 w-6 text-cyan-300" />
                <p className="mt-5 text-[10px] uppercase tracking-wider text-slate-600">
                  Daily mobility
                </p>
                <p className="mt-1 text-3xl font-black">
                  {number(dailyKm)} km
                </p>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Estimated daily fleet movement in this
                  demonstration dataset.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* =================================================
            FOOTNOTE
        ================================================= */}

        <footer className="mt-8 border-t border-white/[0.05] pt-5 pb-6">
          <div className="flex flex-col justify-between gap-3 text-[10px] text-slate-600 md:flex-row">
            <p>
              SmartDELHI Fleet Command · Administrative
              intelligence interface
            </p>

            <p>
              Demo fleet economics and operational figures
              are illustrative planning data.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

/* =========================================================
   PAGE EXPORT
========================================================= */

export default function AdminVehiclesPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <VehiclesDashboard />
    </AuthGuard>
  );
}