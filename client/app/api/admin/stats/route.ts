import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

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

    const [
      totalComplaints,
      pendingComplaints,
      assignedComplaints,
      inProgressComplaints,
      resolvedComplaints,
      verifiedComplaints,
      totalCitizens,
      totalWorkers,
      activeWorkers,
    ] = await Promise.all([
      prisma.complaint.count(),

      prisma.complaint.count({
        where: {
          status: "Pending",
        },
      }),

      prisma.complaint.count({
        where: {
          assignedWorkerId: {
            not: null,
          },
        },
      }),

      prisma.complaint.count({
        where: {
          status: "IN_PROGRESS",
        },
      }),

      prisma.complaint.count({
        where: {
          status: "RESOLVED",
        },
      }),

      prisma.complaint.count({
        where: {
          citizenVerified: true,
        },
      }),

      prisma.user.count({
        where: {
          role: "CITIZEN",
        },
      }),

      prisma.user.count({
        where: {
          role: "WORKER",
        },
      }),

      prisma.user.count({
        where: {
          role: "WORKER",
          isActive: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        complaints: {
          total: totalComplaints,
          pending: pendingComplaints,
          assigned: assignedComplaints,
          inProgress: inProgressComplaints,
          resolved: resolvedComplaints,
          citizenVerified: verifiedComplaints,
        },

        users: {
          citizens: totalCitizens,
          workers: totalWorkers,
          activeWorkers,
        },
      },
    });
  } catch (error) {
    console.error("ADMIN_STATS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch admin statistics",
      },
      { status: 500 }
    );
  }
}