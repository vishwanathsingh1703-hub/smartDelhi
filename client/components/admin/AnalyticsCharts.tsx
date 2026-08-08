"use client";

interface ChartItem {
  name: string;
  count: number;
}

interface WardItem {
  ward: string;
  count: number;
}

interface MonthlyItem {
  month: string;
  count: number;
}

interface Props {
  categories: ChartItem[];
  statuses: ChartItem[];
  priorities: ChartItem[];
  wards: WardItem[];
  monthlyTrend: MonthlyItem[];
}

export default function AnalyticsCharts({
  categories,
  statuses,
  priorities,
  wards,
  monthlyTrend,
}: Props) {
  const maxCategory = Math.max(
    ...categories.map((item) => item.count),
    1
  );

  const maxWard = Math.max(
    ...wards.slice(0, 10).map(
      (item) => item.count
    ),
    1
  );

  const maxMonthly = Math.max(
    ...monthlyTrend.map(
      (item) => item.count
    ),
    1
  );

  const maxPriority = Math.max(
    ...priorities.map(
      (item) => item.count
    ),
    1
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

      {/* CATEGORY */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-blue-400 text-xs uppercase tracking-wider font-semibold">
          Complaint Intelligence
        </p>

        <h2 className="text-xl font-semibold mt-1">
          Category Distribution
        </h2>

        <div className="space-y-5 mt-6">
          {categories.length === 0 ? (
            <p className="text-gray-500">
              No category data available.
            </p>
          ) : (
            categories.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span>
                    {item.name}
                  </span>

                  <span className="text-gray-400">
                    {item.count}
                  </span>
                </div>

                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        (item.count /
                          maxCategory) *
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

      {/* STATUS */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-green-400 text-xs uppercase tracking-wider font-semibold">
          Workflow Performance
        </p>

        <h2 className="text-xl font-semibold mt-1">
          Complaint Status
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-6">
          {statuses.length === 0 ? (
            <p className="text-gray-500 col-span-2">
              No status data available.
            </p>
          ) : (
            statuses.map((item) => (
              <div
                key={item.name}
                className="bg-slate-950 border border-slate-800 rounded-xl p-5"
              >
                <p className="text-gray-500 text-sm">
                  {item.name}
                </p>

                <p className="text-3xl font-bold mt-2">
                  {item.count}
                </p>

                <div className="mt-4 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        (item.count /
                          Math.max(
                            ...statuses.map(
                              (s) => s.count
                            ),
                            1
                          )) *
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

      {/* MONTHLY TREND */}
      <div className="xl:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-purple-400 text-xs uppercase tracking-wider font-semibold">
          Trend Analysis
        </p>

        <h2 className="text-xl font-semibold mt-1">
          Complaint Trend
        </h2>

        <div className="mt-8 flex items-end gap-3 h-64 overflow-x-auto">
          {monthlyTrend.length === 0 ? (
            <p className="text-gray-500">
              No monthly trend data available.
            </p>
          ) : (
            monthlyTrend.map((item) => (
              <div
                key={item.month}
                className="min-w-[60px] h-full flex flex-col justify-end items-center"
              >
                <span className="text-xs text-gray-400 mb-2">
                  {item.count}
                </span>

                <div
                  className="w-10 bg-purple-500 rounded-t-lg transition-all"
                  style={{
                    height: `${Math.max(
                      (item.count /
                        maxMonthly) *
                        75,
                      8
                    )}%`,
                  }}
                />

                <span className="text-[10px] text-gray-500 mt-2 rotate-[-45deg] origin-top">
                  {item.month}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* WARD PERFORMANCE */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-orange-400 text-xs uppercase tracking-wider font-semibold">
          Ward Intelligence
        </p>

        <h2 className="text-xl font-semibold mt-1">
          Top Complaint Wards
        </h2>

        <div className="space-y-5 mt-6">
          {wards.slice(0, 10).map(
            (item, index) => (
              <div key={item.ward}>
                <div className="flex justify-between text-sm mb-2">
                  <span>
                    #{index + 1} {item.ward}
                  </span>

                  <span className="text-gray-400">
                    {item.count}
                  </span>
                </div>

                <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        (item.count /
                          maxWard) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* PRIORITY */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
        <p className="text-red-400 text-xs uppercase tracking-wider font-semibold">
          Risk Intelligence
        </p>

        <h2 className="text-xl font-semibold mt-1">
          Priority Distribution
        </h2>

        <div className="space-y-5 mt-6">
          {priorities.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-sm mb-2">
                <span>
                  {item.name}
                </span>

                <span className="text-gray-400">
                  {item.count}
                </span>
              </div>

              <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{
                    width: `${Math.min(
                      (item.count /
                        maxPriority) *
                        100,
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