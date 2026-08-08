"use client";

interface WardBudget {
  number: number;
  name: string;
  zone?: string | null;
  population: number;
  households: number;
  complaintCount: number;
  workerCount: number;
  needScore: number;
  recommendedBudget: number;
  currentBudget: number;
  spentBudget: number;
  utilization?: number;
}

interface Props {
  wards: WardBudget[];
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "₹0";

  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }

  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function BudgetAllocationTable({
  wards,
}: Props) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-semibold">
          Ward Budget Allocation
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Wards ranked by calculated budget need score.
        </p>
      </div>

      {wards.length === 0 ? (
        <div className="p-10 text-center text-gray-500">
          No ward budget data available.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-950 text-gray-400">
              <tr>
                <th className="text-left px-5 py-4">
                  Rank
                </th>

                <th className="text-left px-5 py-4">
                  Ward
                </th>

                <th className="text-left px-5 py-4">
                  Population
                </th>

                <th className="text-left px-5 py-4">
                  Complaints
                </th>

                <th className="text-left px-5 py-4">
                  Workers
                </th>

                <th className="text-left px-5 py-4">
                  Need Score
                </th>

                <th className="text-left px-5 py-4">
                  Recommended
                </th>

                <th className="text-left px-5 py-4">
                  Current
                </th>
              </tr>
            </thead>

            <tbody>
              {wards.map((ward, index) => (
                <tr
                  key={ward.number}
                  className="border-t border-slate-800 hover:bg-slate-800/40 transition"
                >
                  <td className="px-5 py-5">
                    <span className="font-bold text-gray-300">
                      #{index + 1}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <div className="font-semibold">
                      {ward.name}
                    </div>

                    {ward.zone && (
                      <div className="text-xs text-gray-500 mt-1">
                        {ward.zone}
                      </div>
                    )}
                  </td>

                  <td className="px-5 py-5">
                    {ward.population.toLocaleString(
                      "en-IN"
                    )}
                  </td>

                  <td className="px-5 py-5">
                    <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400">
                      {ward.complaintCount}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    {ward.workerCount}
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              ward.needScore,
                              100
                            )}%`,
                          }}
                        />
                      </div>

                      <span className="font-semibold">
                        {ward.needScore.toFixed(1)}
                      </span>
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span className="font-semibold text-green-400">
                      {formatCurrency(
                        ward.recommendedBudget
                      )}
                    </span>
                  </td>

                  <td className="px-5 py-5 text-gray-400">
                    {formatCurrency(
                      ward.currentBudget
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}