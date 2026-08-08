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

    const complaints = await prisma.complaint.findMany({
      select: {
        category: true,
        status: true,
        priority: true,
        ward: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const categoryMap = new Map<string, number>();
    const statusMap = new Map<string, number>();
    const priorityMap = new Map<string, number>();
    const wardMap = new Map<string, number>();
    const monthlyMap = new Map<string, number>();

    for (const complaint of complaints) {
      const category =
        complaint.category?.trim() || "Unknown";

      const status =
        complaint.status?.trim() || "Unknown";

      const priority =
        complaint.priority?.trim() || "Unknown";

      const ward =
        complaint.ward?.trim() || "Unknown";

      categoryMap.set(
        category,
        (categoryMap.get(category) || 0) + 1
      );

      statusMap.set(
        status,
        (statusMap.get(status) || 0) + 1
      );

      priorityMap.set(
        priority,
        (priorityMap.get(priority) || 0) + 1
      );

      wardMap.set(
        ward,
        (wardMap.get(ward) || 0) + 1
      );

      const month = complaint.createdAt
        .toISOString()
        .slice(0, 7);

      monthlyMap.set(
        month,
        (monthlyMap.get(month) || 0) + 1
      );
    }

    const categories = Array.from(
      categoryMap.entries()
    )
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const statuses = Array.from(
      statusMap.entries()
    )
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const priorities = Array.from(
      priorityMap.entries()
    )
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const wards = Array.from(
      wardMap.entries()
    )
      .map(([ward, count]) => ({
        ward,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    const monthlyTrend = Array.from(
      monthlyMap.entries()
    )
      .map(([month, count]) => ({
        month,
        count,
      }))
      .sort((a, b) =>
        a.month.localeCompare(b.month)
      );

    const totalComplaints =
      complaints.length;

    const resolvedComplaints =
      complaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() ===
          "resolved"
      ).length;

    const pendingComplaints =
      complaints.filter(
        (complaint) => {
          const status =
            complaint.status?.toLowerCase();

          return (
            status === "pending" ||
            status === "assigned"
          );
        }
      ).length;

    const inProgressComplaints =
      complaints.filter(
        (complaint) =>
          complaint.status?.toLowerCase() ===
          "in_progress" ||
          complaint.status?.toLowerCase() ===
          "in progress"
      ).length;

    const highPriorityComplaints =
      complaints.filter(
        (complaint) =>
          complaint.priority?.toLowerCase() ===
            "high" ||
          complaint.priority?.toLowerCase() ===
            "critical"
      ).length;

    const resolutionRate =
      totalComplaints > 0
        ? Number(
            (
              (resolvedComplaints /
                totalComplaints) *
              100
            ).toFixed(1)
          )
        : 0;

    const activeWorkers =
      await prisma.user.count({
        where: {
          role: "WORKER",
          isActive: true,
        },
      });

    const totalCitizens =
      await prisma.user.count({
        where: {
          role: "CITIZEN",
          isActive: true,
        },
      });

    return NextResponse.json({
      success: true,

      analytics: {
        summary: {
          totalComplaints,
          resolvedComplaints,
          pendingComplaints,
          inProgressComplaints,
          highPriorityComplaints,
          resolutionRate,
          activeWorkers,
          totalCitizens,
        },

        categories,
        statuses,
        priorities,
        wards,
        monthlyTrend,
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_ANALYTICS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch analytics",
      },
      { status: 500 }
    );
  }
}