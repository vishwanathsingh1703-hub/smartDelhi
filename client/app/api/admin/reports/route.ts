import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getSessionUser();

    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (admin.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Admin access required" },
        { status: 403 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      select: {
        id: true,
        title: true,
        category: true,
        ward: true,
        status: true,
        priority: true,
        createdAt: true,
        workCompletedAt: true,
        citizenVerified: true,
        assignedWorker: {
          select: {
            name: true,
            ward: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = complaints.length;

    const resolved = complaints.filter(
      (c) => c.status.toLowerCase() === "resolved"
    ).length;

    const pending = complaints.filter(
      (c) =>
        c.status.toLowerCase() === "pending"
    ).length;

    const inProgress = complaints.filter(
      (c) => {
        const status = c.status.toLowerCase();

        return (
          status === "in_progress" ||
          status === "in progress"
        );
      }
    ).length;

    const verified = complaints.filter(
      (c) => c.citizenVerified
    ).length;

    const resolutionRate =
      total > 0
        ? Number(((resolved / total) * 100).toFixed(1))
        : 0;

    return NextResponse.json({
      success: true,
      summary: {
        total,
        resolved,
        pending,
        inProgress,
        verified,
        resolutionRate,
      },
      complaints,
    });
  } catch (error) {
    console.error("ADMIN_REPORTS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate report",
      },
      { status: 500 }
    );
  }
}