import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const wards =
      await prisma.ward.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          number: "asc",
        },
      });

    const complaints =
      await prisma.complaint.findMany({
        select: {
          ward: true,
          status: true,
          priority: true,
          category: true,
        },
      });

    const workers =
      await prisma.user.findMany({
        where: {
          role: "WORKER",
          isActive: true,
        },
        select: {
          ward: true,
        },
      });

    const complaintMap =
      new Map<string, number>();

    for (const complaint of complaints) {
      const ward =
        complaint.ward
          ?.trim()
          .toLowerCase();

      if (!ward) continue;

      complaintMap.set(
        ward,
        (complaintMap.get(ward) || 0) + 1
      );
    }

    const workerMap =
      new Map<string, number>();

    for (const worker of workers) {
      const ward =
        worker.ward
          ?.trim()
          .toLowerCase();

      if (!ward) continue;

      workerMap.set(
        ward,
        (workerMap.get(ward) || 0) + 1
      );
    }

    const wardAnalytics =
      wards.map((ward) => {
        const key =
          ward.name
            .trim()
            .toLowerCase();

        const complaintCount =
          complaintMap.get(key) || 0;

        const workerCount =
          workerMap.get(key) || 0;

        const workload =
          workerCount > 0
            ? complaintCount /
              workerCount
            : complaintCount;

        const budget =
          ward.budget || 0;

        const spent =
          ward.spentBudget || 0;

        const remaining =
          Math.max(
            budget - spent,
            0
          );

        const utilization =
          budget > 0
            ? (spent / budget) * 100
            : 0;

        return {
          wardId: ward.id,
          wardNumber: ward.number,
          wardName: ward.name,
          zone: ward.zone,

          population:
            ward.population || 0,

          households:
            ward.households || 0,

          complaints:
            complaintCount,

          workers:
            workerCount,

          workload,

          importanceScore:
            ward.importanceScore,

          infrastructureScore:
            ward.infrastructureScore,

          budget,
          spentBudget: spent,
          remainingBudget: remaining,

          utilization:
            Number(
              utilization.toFixed(2)
            ),
        };
      });

    const totalBudget =
      wardAnalytics.reduce(
        (sum, ward) =>
          sum + ward.budget,
        0
      );

    const totalSpent =
      wardAnalytics.reduce(
        (sum, ward) =>
          sum + ward.spentBudget,
        0
      );

    const totalRemaining =
      wardAnalytics.reduce(
        (sum, ward) =>
          sum + ward.remainingBudget,
        0
      );

    const highestComplaintWard =
      [...wardAnalytics].sort(
        (a, b) =>
          b.complaints -
          a.complaints
      )[0] || null;

    const highestWorkloadWard =
      [...wardAnalytics].sort(
        (a, b) =>
          b.workload -
          a.workload
      )[0] || null;

    const highestBudgetWard =
      [...wardAnalytics].sort(
        (a, b) =>
          b.budget -
          a.budget
      )[0] || null;

    const averageUtilization =
      totalBudget > 0
        ? (totalSpent /
            totalBudget) *
          100
        : 0;

    const categoryMap =
      new Map<string, number>();

    for (const complaint of complaints) {
      const category =
        complaint.category ||
        "Other";

      categoryMap.set(
        category,
        (categoryMap.get(category) || 0) +
          1
      );
    }

    const categoryAnalytics =
      Array.from(
        categoryMap.entries()
      )
        .map(
          ([category, count]) => ({
            category,
            count,
          })
        )
        .sort(
          (a, b) =>
            b.count - a.count
        );

    return NextResponse.json({
      success: true,

      summary: {
        totalBudget,
        totalSpent,
        totalRemaining,

        utilization: Number(
          averageUtilization.toFixed(2)
        ),

        totalWards:
          wardAnalytics.length,

        totalWorkers:
          workers.length,

        totalComplaints:
          complaints.length,
      },

      highlights: {
        highestComplaintWard,
        highestWorkloadWard,
        highestBudgetWard,
      },

      wards: wardAnalytics,

      categories:
        categoryAnalytics,
    });
  } catch (error) {
    console.error(
      "BUDGET_ANALYTICS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to generate budget analytics",
      },
      { status: 500 }
    );
  }
}