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

    const complaints = await prisma.complaint.findMany({
      where: {
        latitude: {
          not: null,
        },
        longitude: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        ward: true,
        status: true,
        priority: true,
        latitude: true,
        longitude: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const wards = Array.from(
      new Set(
        complaints
          .map((item) => item.ward?.trim())
          .filter(Boolean)
      )
    ).sort();

    const categories = Array.from(
      new Set(
        complaints
          .map((item) => item.category?.trim())
          .filter(Boolean)
      )
    ).sort();

    const statuses = Array.from(
      new Set(
        complaints
          .map((item) => item.status?.trim())
          .filter(Boolean)
      )
    ).sort();

    const mappedComplaints = complaints.map(
      (complaint) => ({
        id: complaint.id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        ward: complaint.ward,
        status: complaint.status,
        priority: complaint.priority,
        latitude: complaint.latitude,
        longitude: complaint.longitude,
        createdAt: complaint.createdAt.toISOString(),
      })
    );

    return NextResponse.json({
      success: true,

      mapCenter: {
        latitude: 28.6139,
        longitude: 77.209,
      },

      complaints: mappedComplaints,

      filters: {
        wards,
        categories,
        statuses,
      },

      stats: {
        totalComplaints: mappedComplaints.length,

        highPriority: mappedComplaints.filter(
          (item) =>
            item.priority?.toLowerCase() ===
              "high" ||
            item.priority?.toLowerCase() ===
              "critical"
        ).length,

        pending: mappedComplaints.filter(
          (item) =>
            item.status?.toLowerCase() ===
            "pending"
        ).length,

        resolved: mappedComplaints.filter(
          (item) =>
            item.status?.toLowerCase() ===
              "resolved" ||
            item.status?.toLowerCase() ===
              "completed"
        ).length,
      },
    });
  } catch (error) {
    console.error("GIS_API_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load GIS data",
      },
      { status: 500 }
    );
  }
}