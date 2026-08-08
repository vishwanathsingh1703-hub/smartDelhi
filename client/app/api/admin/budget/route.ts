import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  calculateWardAllocation,
} from "@/lib/budgetAllocation";

export async function GET() {
  try {
    const admin = await getSessionUser();

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    const wards = await prisma.ward.findMany({
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
        },
      });

    const workers =
      await prisma.user.findMany({
        where: {
          role: "WORKER",
          isActive: true,
        },
        select: {
          id: true,
          ward: true,
        },
      });

    const complaintMap =
      new Map<string, number>();

    for (const complaint of complaints) {
      const ward = complaint.ward
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
      const ward = worker.ward
        ?.trim()
        .toLowerCase();

      if (!ward) continue;

      workerMap.set(
        ward,
        (workerMap.get(ward) || 0) + 1
      );
    }

    const totalPopulation =
      wards.reduce(
        (sum, ward) =>
          sum + (ward.population || 0),
        0
      );

    const totalHouseholds =
      wards.reduce(
        (sum, ward) =>
          sum + (ward.households || 0),
        0
      );

    const totalComplaints =
      complaints.length;

    const totalImportance =
      wards.reduce(
        (sum, ward) =>
          sum + ward.importanceScore,
        0
      );

    const totalInfrastructure =
      wards.reduce(
        (sum, ward) =>
          sum + ward.infrastructureScore,
        0
      );

    const workloads = wards.map((ward) => {
      const key = ward.name
        .trim()
        .toLowerCase();

      const complaintCount =
        complaintMap.get(key) || 0;

      const workerCount =
        workerMap.get(key) || 0;

      return workerCount > 0
        ? complaintCount / workerCount
        : complaintCount;
    });

    const totalWorkload =
      Math.max(...workloads, 0);

    const totalBudget =
      wards.reduce(
        (sum, ward) =>
          sum + (ward.budget || 0),
        0
      );

    const allocationData =
      wards.map((ward) => {
        const key = ward.name
          .trim()
          .toLowerCase();

        const complaintCount =
          complaintMap.get(key) || 0;

        const workerCount =
          workerMap.get(key) || 0;

        const allocation =
          calculateWardAllocation(
            {
              population:
                ward.population || 0,

              households:
                ward.households || 0,

              complaintCount,

              importanceScore:
                ward.importanceScore,

              infrastructureScore:
                ward.infrastructureScore,

              workerCount,
            },
            {
              population:
                totalPopulation,

              households:
                totalHouseholds,

              complaints:
                totalComplaints,

              importance:
                Math.max(
                  totalImportance,
                  ward.importanceScore
                ),

              infrastructure:
                Math.max(
                  totalInfrastructure,
                  ward.infrastructureScore
                ),

              workload:
                totalWorkload,
            },
            totalBudget
          );

        return {
          id: ward.id,
          number: ward.number,
          name: ward.name,
          zone: ward.zone,

          population:
            ward.population || 0,

          households:
            ward.households || 0,

          complaintCount,
          workerCount,

         currentBudget: ward.budget,

spentBudget: ward.spentBudget,

...allocation, 
        };
      });

    allocationData.sort(
      (a, b) =>
        b.needScore - a.needScore
    );

    return NextResponse.json({
      success: true,

      summary: {
        totalWards: wards.length,
        totalPopulation,
        totalHouseholds,
        totalComplaints,
        totalActiveWorkers:
          workers.length,
        totalBudget,
      },

      wards: allocationData,
    });
  } catch (error) {
    console.error(
      "ADMIN_BUDGET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to calculate budget allocation",
      },
      { status: 500 }
    );
  }
}