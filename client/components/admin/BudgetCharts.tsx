"use client";

interface WardBudget {
  number: number;
  name: string;
  population: number;
  complaintCount: number;
  needScore: number;
  recommendedBudget: number;
}

interface Props {
  wards: WardBudget[];
}

function formatBudget(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)} L`;
  }

  return `₹${Math.round(value).toLocaleString(
    "en-IN"
  )}`;
}

export default function BudgetCharts({
  wards,
}: Props) {
  const topNeed = [...wards]
    .sort(
      (a, b) =>
        b.needScore - a.needScore
    )
    .slice(0, 8);

  const topBudget = [...wards]
    .sort(
      (a, b) =>
        b.recommendedBudget -
        a.recommendedBudget
    )
    .slice(0, 8);

  const maxNeed = Math.max(
    ...topNeed.map(
      (ward) => ward.needScore
    ),
    1
  );

  const maxBudget = Math.max(
    ...topBudget.map(
      (ward) =>
        ward.recommendedBudget
    ),
    1
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
      {/* NEED SCORE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="mb-6">
          <p className="text-blue-400 text-xs uppercase tracking-wider font-semibold">
            Intelligence Ranking
          </p>

          <h2 className="text-xl font-semibold mt-1">
            Highest Need Wards
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Based on population, complaints,
            infrastructure and workforce.
          </p>
        </div>

        <div className="space-y-5">
          {topNeed.length === 0 ? (
            <p className="text-gray-500">
              No data available.
            </p>
          ) : (
            topNeed.map((ward, index) => (
              <div key={ward.number}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    #{index + 1} {ward.name}
                  </span>

                  <span className="text-gray-400">
                    {ward.needScore.toFixed(1)}
                  </span>
                </div>

                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (ward.needScore /
                          maxNeed) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* BUDGET */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="mb-6">
          <p className="text-green-400 text-xs uppercase tracking-wider font-semibold">
            Budget Intelligence
          </p>

          <h2 className="text-xl font-semibold mt-1">
            Recommended Allocation
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Highest recommended ward allocations.
          </p>
        </div>

        <div className="space-y-5">
          {topBudget.length === 0 ? (
            <p className="text-gray-500">
              No budget data available.
            </p>
          ) : (
            topBudget.map((ward, index) => (
              <div key={ward.number}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">
                    #{index + 1} {ward.name}
                  </span>

                  <span className="text-green-400">
                    {formatBudget(
                      ward.recommendedBudget
                    )}
                  </span>
                </div>

                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (ward.recommendedBudget /
                          maxBudget) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* COMPLAINT VS POPULATION */}
      <div className="xl:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <div className="mb-6">
          <p className="text-purple-400 text-xs uppercase tracking-wider font-semibold">
            Civic Pressure
          </p>

          <h2 className="text-xl font-semibold mt-1">
            Complaint Distribution
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Complaint volume across the highest-pressure
            wards.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4">
          {topNeed.map((ward) => (
            <div
              key={ward.number}
              className="bg-slate-950 border border-slate-800 rounded-xl p-4"
            >
              <p className="text-xs text-gray-500">
                {ward.name}
              </p>

              <p className="text-2xl font-bold mt-2">
                {ward.complaintCount}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                complaints
              </p>

              <div className="mt-4 h-20 flex items-end">
                <div
                  className="w-full bg-purple-500/70 rounded-t-lg"
                  style={{
                    height: `${Math.min(
                      Math.max(
                        ward.complaintCount * 5,
                        8
                      ),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}