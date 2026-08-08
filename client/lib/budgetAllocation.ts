export interface BudgetWardInput {
  population: number;
  households: number;
  complaintCount: number;
  importanceScore: number;
  infrastructureScore: number;
  workerCount: number;
}

export interface BudgetAllocationResult {
  populationScore: number;
  householdScore: number;
  complaintScore: number;
  importanceScore: number;
  infrastructureScore: number;
  workloadScore: number;
  needScore: number;
  recommendedBudget: number;
}

const WEIGHTS = {
  population: 0.25,
  households: 0.2,
  complaints: 0.2,
  infrastructure: 0.15,
  importance: 0.1,
  workload: 0.1,
};

function normalize(
  value: number,
  max: number
): number {
  if (max <= 0) return 0;

  return Math.min(
    100,
    Math.max(0, (value / max) * 100)
  );
}

export function calculateWardAllocation(
  ward: BudgetWardInput,
  totals: {
    population: number;
    households: number;
    complaints: number;
    importance: number;
    infrastructure: number;
    workload: number;
  },
  totalBudget: number
): BudgetAllocationResult {
  const populationScore = normalize(
    ward.population,
    totals.population
  );

  const householdScore = normalize(
    ward.households,
    totals.households
  );

  const complaintScore = normalize(
    ward.complaintCount,
    totals.complaints
  );

  const importanceScore = normalize(
    ward.importanceScore,
    totals.importance
  );

  const infrastructureScore = normalize(
    ward.infrastructureScore,
    totals.infrastructure
  );

  const workload =
    ward.workerCount > 0
      ? ward.complaintCount / ward.workerCount
      : ward.complaintCount;

  const workloadScore = normalize(
    workload,
    totals.workload
  );

  const needScore =
    populationScore * WEIGHTS.population +
    householdScore * WEIGHTS.households +
    complaintScore * WEIGHTS.complaints +
    infrastructureScore *
      WEIGHTS.infrastructure +
    importanceScore * WEIGHTS.importance +
    workloadScore * WEIGHTS.workload;

  const recommendedBudget =
    (needScore / 100) * totalBudget;

  return {
    populationScore,
    householdScore,
    complaintScore,
    importanceScore,
    infrastructureScore,
    workloadScore,
    needScore,
    recommendedBudget,
  };
}