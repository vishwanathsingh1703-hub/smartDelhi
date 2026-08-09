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
      complaints,
      workers,
    ] = await Promise.all([
      prisma.complaint.findMany({
        select: {
          ward: true,
          status: true,
          priority: true,
        },
      }),

      prisma.user.findMany({
        where: {
          role: "WORKER",
          isActive: true,
        },
        select: {
          ward: true,
        },
      }),
    ]);

    const wardMap = new Map<
      string,
      {
        complaintCount: number;
        highPriority: number;
        resolved: number;
        activeWorkers: number;
      }
    >();

    for (const complaint of complaints) {
      const ward =
        complaint.ward?.trim();

      if (!ward) continue;

      if (!wardMap.has(ward)) {
        wardMap.set(ward, {
          complaintCount: 0,
          highPriority: 0,
          resolved: 0,
          activeWorkers: 0,
        });
      }

      const data =
        wardMap.get(ward)!;

      data.complaintCount += 1;

      const priority =
        complaint.priority
          ?.toLowerCase();

      if (
        priority === "high" ||
        priority === "critical"
      ) {
        data.highPriority += 1;
      }

      const status =
        complaint.status
          ?.toLowerCase();

      if (
        status === "resolved" ||
        status === "completed"
      ) {
        data.resolved += 1;
      }
    }

    for (const worker of workers) {
      const ward =
        worker.ward?.trim();

      if (!ward) continue;

      if (!wardMap.has(ward)) {
        wardMap.set(ward, {
          complaintCount: 0,
          highPriority: 0,
          resolved: 0,
          activeWorkers: 0,
        });
      }

      wardMap.get(
        ward
      )!.activeWorkers += 1;
    }

    const wards =
      Array.from(
        wardMap.entries()
      )
        .map(
          ([ward, data]) => ({
            ward,
            ...data,
          })
        )
        .sort(
          (a, b) =>
            b.complaintCount -
            a.complaintCount
        );

    return NextResponse.json({
      success: true,
      count: wards.length,
      wards,
    });
  } catch (error) {
    console.error(
      "GIS_WARDS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to load ward intelligence",
      },
      { status: 500 }
    );
  }
}