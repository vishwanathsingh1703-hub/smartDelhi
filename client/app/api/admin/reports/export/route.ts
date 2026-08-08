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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const escapeCsv = (value: unknown) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const header = [
      "Complaint ID",
      "Title",
      "Category",
      "Ward",
      "Status",
      "Priority",
      "Worker",
      "Created At",
      "Completed At",
      "Citizen Verified",
    ];

    const rows = complaints.map((complaint) => [
      complaint.id,
      complaint.title,
      complaint.category,
      complaint.ward,
      complaint.status,
      complaint.priority,
      complaint.assignedWorker?.name || "Not Assigned",
      complaint.createdAt.toISOString(),
      complaint.workCompletedAt?.toISOString() || "",
      complaint.citizenVerified ? "Yes" : "No",
    ]);

    const csv = [
      header,
      ...rows,
    ]
      .map((row) =>
        row.map(escapeCsv).join(",")
      )
      .join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type":
          "text/csv; charset=utf-8",
        "Content-Disposition":
          'attachment; filename="smartdelhi-report.csv"',
      },
    });
  } catch (error) {
    console.error(
      "ADMIN_REPORT_EXPORT_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to export report",
      },
      { status: 500 }
    );
  }
}