import type {
  PriorityLevel,
  ScoreComponentBreakdown,
  AIScoreBreakdown,
} from "./aiScoreTypes";

export interface WardScoreInput {
  ward: string;

  population: number;
  households: number;

  importanceScore: number;
  infrastructureScore: number;

  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;

  highPriorityComplaints: number;
  criticalComplaints?: number;

  activeWorkers: number;

  averageAgeDays?: number;

  // Optional: useful for future analytics
  waterComplaints?: number;
  roadComplaints?: number;
  garbageComplaints?: number;
  sewageComplaints?: number;
  electricityComplaints?: number;
}

export interface WardScoreResult {
  ward: string;

  score: number;

  performance:
    | "EXCELLENT"
    | "GOOD"
    | "MODERATE"
    | "CRITICAL";

  priorityLevel: PriorityLevel;

  complaintPressure: number;
  resolutionScore: number;
  infrastructureScore: number;
  importanceScore: number;
  workloadScore: number;

  pendingPressure: number;
  agingScore: number;
  severityScore: number;

  resolutionRate: number;

  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;

  activeWorkers: number;
  complaintsPerWorker: number;

  breakdown: AIScoreBreakdown;
}


/* -------------------------------------------------------
   Utility Functions
------------------------------------------------------- */

function safeNumber(value: unknown): number {
  if (typeof value !== "number") {
    return 0;
  }

  if (!Number.isFinite(value)) {
    return 0;
  }

  return value;
}


function nonNegative(value: unknown): number {
  return Math.max(0, safeNumber(value));
}


function clamp(
  value: number,
  min = 0,
  max = 100,
): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    Math.max(value, min),
    max,
  );
}


function round(
  value: number,
  decimals = 1,
): number {
  const multiplier = 10 ** decimals;

  return Number(
    (Math.round(value * multiplier) / multiplier).toFixed(
      decimals,
    ),
  );
}


/* -------------------------------------------------------
   Priority
------------------------------------------------------- */

function getPriorityLevel(
  score: number,
): PriorityLevel {
  if (score >= 80) {
    return "LOW";
  }

  if (score >= 60) {
    return "MEDIUM";
  }

  if (score >= 40) {
    return "HIGH";
  }

  return "CRITICAL";
}


/* -------------------------------------------------------
   Performance
------------------------------------------------------- */

function getPerformance(
  score: number,
):
  | "EXCELLENT"
  | "GOOD"
  | "MODERATE"
  | "CRITICAL" {

  if (score >= 80) {
    return "EXCELLENT";
  }

  if (score >= 65) {
    return "GOOD";
  }

  if (score >= 45) {
    return "MODERATE";
  }

  return "CRITICAL";
}


/* -------------------------------------------------------
   Main Ward AI Score Engine
------------------------------------------------------- */

export function calculateWardScore(
  data: WardScoreInput,
): WardScoreResult {

  /*
   * -----------------------------------------------
   * 1. SANITIZE INPUT
   * -----------------------------------------------
   */

  const population = Math.max(
    nonNegative(data.population),
    1,
  );

  const households = Math.max(
    nonNegative(data.households),
    1,
  );

  const totalComplaints = Math.floor(
    nonNegative(data.totalComplaints),
  );

  const pendingComplaints = Math.min(
    Math.floor(
      nonNegative(data.pendingComplaints),
    ),
    totalComplaints,
  );

  const resolvedComplaints = Math.min(
    Math.floor(
      nonNegative(data.resolvedComplaints),
    ),
    totalComplaints,
  );

  const highPriorityComplaints = Math.min(
    Math.floor(
      nonNegative(data.highPriorityComplaints),
    ),
    totalComplaints,
  );

  const criticalComplaints = Math.min(
    Math.floor(
      nonNegative(data.criticalComplaints),
    ),
    totalComplaints,
  );

  const activeWorkers = Math.max(
    Math.floor(
      nonNegative(data.activeWorkers),
    ),
    1,
  );

  const averageAgeDays = nonNegative(
    data.averageAgeDays,
  );

  /*
   * -----------------------------------------------
   * 2. COMPLAINT PRESSURE
   *
   * Complaints relative to population.
   * -----------------------------------------------
   */

  const complaintsPer1000 =
    (totalComplaints / population) * 1000;

  const complaintPressure = clamp(
    complaintsPer1000 * 10,
  );


  /*
   * -----------------------------------------------
   * 3. RESOLUTION PERFORMANCE
   * -----------------------------------------------
   */

  const resolutionRate =
    totalComplaints > 0
      ? (resolvedComplaints / totalComplaints) * 100
      : 100;

  const resolutionScore = clamp(
    resolutionRate,
  );


  /*
   * -----------------------------------------------
   * 4. PENDING PRESSURE
   *
   * More pending complaints = higher risk.
   * -----------------------------------------------
   */

  const pendingPressure =
    totalComplaints > 0
      ? (pendingComplaints / totalComplaints) * 100
      : 0;


  /*
   * -----------------------------------------------
   * 5. SEVERITY PRESSURE
   *
   * Critical complaints have stronger influence.
   * -----------------------------------------------
   */

  const weightedSeverityCount =
    criticalComplaints * 1.5 +
    Math.max(
      highPriorityComplaints -
        criticalComplaints,
      0,
    );

  const severityRate =
    totalComplaints > 0
      ? (weightedSeverityCount /
          totalComplaints) *
        100
      : 0;

  const severityScore = clamp(
    severityRate,
  );


  /*
   * -----------------------------------------------
   * 6. INFRASTRUCTURE
   *
   * Database value expected roughly 0–10.
   * Converted to 0–100.
   *
   * Higher infrastructure quality reduces risk.
   * -----------------------------------------------
   */

  const infrastructureQuality = clamp(
    nonNegative(data.infrastructureScore) * 10,
  );

  /*
   * Convert quality into risk.
   *
   * Poor infrastructure = high risk.
   */

  const infrastructureRisk =
    100 - infrastructureQuality;


  /*
   * -----------------------------------------------
   * 7. WARD IMPORTANCE
   *
   * Important wards receive higher risk weight.
   * -----------------------------------------------
   */

  const importanceScore = clamp(
    nonNegative(data.importanceScore) * 10,
  );


  /*
   * -----------------------------------------------
   * 8. WORKER WORKLOAD
   * -----------------------------------------------
   */

  const complaintsPerWorker =
    totalComplaints / activeWorkers;

  /*
   * Higher complaints per worker
   * means higher operational pressure.
   */

  const workloadPressure = clamp(
    complaintsPerWorker * 5,
  );

  const workloadScore =
    100 - workloadPressure;


  /*
   * -----------------------------------------------
   * 9. AGING
   *
   * 30+ days = maximum aging risk.
   * -----------------------------------------------
   */

  const agingScore = clamp(
    (averageAgeDays / 30) * 100,
  );


  /*
   * -----------------------------------------------
   * 10. FINAL RISK SCORE
   *
   * Higher score = more urgent/problematic ward.
   *
   * We intentionally make this a RISK SCORE,
   * not a performance score.
   * -----------------------------------------------
   */

  const finalScoreRaw =
    severityScore * 0.20 +
    complaintPressure * 0.15 +
    pendingPressure * 0.20 +
    agingScore * 0.15 +
    infrastructureRisk * 0.10 +
    importanceScore * 0.05 +
    workloadPressure * 0.10 +
    (100 - resolutionScore) * 0.05;

  const score = round(
    clamp(finalScoreRaw),
    1,
  );


  /*
   * -----------------------------------------------
   * 11. PRIORITY
   * -----------------------------------------------
   */

  const priorityLevel =
    getPriorityLevel(score);


  /*
   * -----------------------------------------------
   * 12. PERFORMANCE
   * -----------------------------------------------
   */

  const performance =
    getPerformance(score);


  /*
   * -----------------------------------------------
   * 13. EXPLAINABLE BREAKDOWN
   * -----------------------------------------------
   */

  const severityComponent: ScoreComponentBreakdown = {
    rawScore: round(severityRate),
    normalizedScore: round(severityScore),
    weight: 0.20,
    weightedScore: round(
      severityScore * 0.20,
    ),
    description:
      "Risk caused by high and critical priority complaints.",
  };


  const volumeComponent: ScoreComponentBreakdown = {
    rawScore: round(totalComplaints),
    normalizedScore: round(
      complaintPressure,
    ),
    weight: 0.15,
    weightedScore: round(
      complaintPressure * 0.15,
    ),
    description:
      "Complaint volume normalized against population.",
  };


  const pendingComponent: ScoreComponentBreakdown = {
    rawScore: round(pendingComplaints),
    normalizedScore: round(
      pendingPressure,
    ),
    weight: 0.20,
    weightedScore: round(
      pendingPressure * 0.20,
    ),
    description:
      "Operational pressure from unresolved complaints.",
  };


  const agingComponent: ScoreComponentBreakdown = {
    rawScore: round(averageAgeDays),
    normalizedScore: round(
      agingScore,
    ),
    weight: 0.15,
    weightedScore: round(
      agingScore * 0.15,
    ),
    description:
      "Risk caused by aging unresolved complaints.",
  };


  const resolutionComponent: ScoreComponentBreakdown = {
    rawScore: round(resolutionRate),
    normalizedScore: round(
      100 - resolutionScore,
    ),
    weight: 0.05,
    weightedScore: round(
      (100 - resolutionScore) * 0.05,
    ),
    description:
      "Risk derived from poor complaint resolution performance.",
  };


  const breakdown: AIScoreBreakdown = {
    severity: severityComponent,

    volume: volumeComponent,

    pendingPressure: pendingComponent,

    aging: agingComponent,

    resolutionPerformance:
      resolutionComponent,
  };


  /*
   * -----------------------------------------------
   * 14. FINAL RESULT
   * -----------------------------------------------
   */

  return {
    ward:
      data.ward?.trim() || "Unknown Ward",

    score,

    performance,

    priorityLevel,

    complaintPressure:
      round(complaintPressure),

    resolutionScore:
      round(resolutionScore),

    infrastructureScore:
      round(infrastructureQuality),

    importanceScore:
      round(importanceScore),

    workloadScore:
      round(workloadScore),

    pendingPressure:
      round(pendingPressure),

    agingScore:
      round(agingScore),

    severityScore:
      round(severityScore),

    resolutionRate:
      round(resolutionRate),

    totalComplaints,

    pendingComplaints,

    resolvedComplaints,

    activeWorkers,

    complaintsPerWorker:
      round(complaintsPerWorker),

    breakdown,
  };
}


/* -------------------------------------------------------
   Backward-Compatible Alias
------------------------------------------------------- */

export const calculateWardAIScore =
  calculateWardScore;