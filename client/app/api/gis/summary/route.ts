import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const [
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      highPriorityComplaints,
      activeWorkers,
      activeVehicles,
    ] = await Promise.all([
      prisma.complaint.count(),

      prisma.complaint.count({
        where: {
          status: {
            notIn: ["Resolved", "Completed"],
          },
        },
      }),

      prisma.complaint.count({
        where: {
          status: {
            in: ["Resolved", "Completed"],
          },
        },
      }),

      prisma.complaint.count({
        where: {
          priority: {
            in: ["High", "Critical"],
          },
        },
      }),

      prisma.user.count({
        where: {
          role: "WORKER",
          isActive: true,
        },
      }),

      prisma.vehicle.count({
        where: {
          isActive: true,
        },
      }),
    ]);

    const resolutionRate =
      totalComplaints > 0
        ? Math.round(
            (resolvedComplaints /
              totalComplaints) *
              100
          )
        : 0;

    return NextResponse.json({
      success: true,

      summary: {
        totalComplaints,
        pendingComplaints,
        resolvedComplaints,
        highPriorityComplaints,
        activeWorkers,
        activeVehicles,
        resolutionRate,
      },
    });
  } catch (error) {
    console.error(
      "GIS_SUMMARY_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load GIS summary",
      },
      { status: 500 }
    );
  }
}