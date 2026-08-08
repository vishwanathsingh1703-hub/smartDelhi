import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateWardAIScore,
  type WardScoreInput,
} from "@/lib/aiScore";

export async function GET() {
  try {
    /*
     * -----------------------------------------
     * AUTHENTICATION
     * -----------------------------------------
     */

    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required.",
          },
        },
        { status: 401 },
      );
    }

    /*
     * -----------------------------------------
     * ADMIN AUTHORIZATION
     * -----------------------------------------
     */

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Admin access required.",
          },
        },
        { status: 403 },
      );
    }

    /*
     * -----------------------------------------
     * FETCH ACTIVE WARDS
     * -----------------------------------------
     */

    const wards = await prisma.ward.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    /*
     * -----------------------------------------
     * FETCH COMPLAINTS
     * -----------------------------------------
     */

    const complaints = await prisma.complaint.findMany({
      select: {
        id: true,
        ward: true,
        status: true,
        priority: true,
        createdAt: true,
      },
    });

    /*
     * -----------------------------------------
     * FETCH ACTIVE WORKERS
     * -----------------------------------------
     */

    const activeWorkers = await prisma.user.findMany({
      where: {
        role: "WORKER",
        isActive: true,
      },
      select: {
        ward: true,
      },
    });

    /*
     * -----------------------------------------
     * CALCULATE SCORE FOR EACH WARD
     * -----------------------------------------
     */

    const rankings = wards.map((ward) => {
      /*
       * Complaint ward can contain either:
       * - ward name
       * - ward number
       *
       * We support both.
       */

      const wardComplaints = complaints.filter(
        (complaint) => {
          const complaintWard =
            complaint.ward
              ?.trim()
              .toLowerCase();

          const wardName =
            ward.name
              ?.trim()
              .toLowerCase();

          const wardNumber =
            String(ward.number)
              .trim()
              .toLowerCase();

          return (
            complaintWard === wardName ||
            complaintWard === wardNumber ||
            complaintWard === `ward ${wardNumber}`
          );
        },
      );

      /*
       * -----------------------------------------
       * COMPLAINT COUNTS
       * -----------------------------------------
       */

      const totalComplaints =
        wardComplaints.length;

      const pendingComplaints =
        wardComplaints.filter(
          (complaint) => {
            const status =
              complaint.status
                ?.trim()
                .toLowerCase();

            return (
              status === "pending" ||
              status === "open" ||
              status === "assigned" ||
              status === "in progress" ||
              status === "in_progress"
            );
          },
        ).length;

      const resolvedComplaints =
        wardComplaints.filter(
          (complaint) => {
            const status =
              complaint.status
                ?.trim()
                .toLowerCase();

            return (
              status === "resolved" ||
              status === "completed" ||
              status === "closed"
            );
          },
        ).length;

      /*
       * -----------------------------------------
       * PRIORITY COUNTS
       * -----------------------------------------
       */

      const highPriorityComplaints =
        wardComplaints.filter(
          (complaint) => {
            const priority =
              complaint.priority
                ?.trim()
                .toLowerCase();

            return (
              priority === "high" ||
              priority === "critical" ||
              priority === "urgent"
            );
          },
        ).length;

      const criticalComplaints =
        wardComplaints.filter(
          (complaint) =>
            complaint.priority
              ?.trim()
              .toLowerCase() ===
            "critical",
        ).length;

      /*
       * -----------------------------------------
       * AVERAGE COMPLAINT AGE
       * -----------------------------------------
         */

      const now = Date.now();

      const averageAgeDays =
        totalComplaints > 0
          ? wardComplaints.reduce(
              (sum, complaint) => {
                const ageMs =
                  now -
                  complaint.createdAt.getTime();

                const ageDays =
                  Math.max(
                    0,
                    ageMs /
                      (1000 *
                        60 *
                        60 *
                        24),
                  );

                return sum + ageDays;
              },
              0,
            ) / totalComplaints
          : 0;

      /*
       * -----------------------------------------
       * ACTIVE WORKERS IN WARD
       * -----------------------------------------
       */

      const wardWorkers =
        activeWorkers.filter(
          (worker) => {
            if (!worker.ward) {
              return false;
            }

            const workerWard =
              worker.ward
                .trim()
                .toLowerCase();

            const wardName =
              ward.name
                .trim()
                .toLowerCase();

            const wardNumber =
              String(ward.number)
                .trim()
                .toLowerCase();

            return (
              workerWard === wardName ||
              workerWard === wardNumber ||
              workerWard ===
                `ward ${wardNumber}`
            );
          },
        ).length;

      /*
       * -----------------------------------------
       * SCORE INPUT
       * -----------------------------------------
       */

      const scoreInput: WardScoreInput = {
        ward: ward.name,

        population:
          ward.population ?? 0,

        households:
          ward.households ?? 0,

        importanceScore:
          ward.importanceScore,

        infrastructureScore:
          ward.infrastructureScore,

        totalComplaints,

        pendingComplaints,

        resolvedComplaints,

        highPriorityComplaints,

        criticalComplaints,

        activeWorkers:
          wardWorkers,
          
        averageAgeDays,
      };

      return calculateWardAIScore(
        scoreInput,
      );
    });

    /*
     * -----------------------------------------
     * SORT BY RISK SCORE
     * -----------------------------------------
     */

    rankings.sort(
      (a, b) =>
        b.score- a.score,
    );

    /*
     * -----------------------------------------
     * SUMMARY
     * -----------------------------------------
     */

    const totalWardsEvaluated =
      rankings.length;

    const totalComplaints =
      rankings.reduce(
        (sum, ward) =>
          sum + ward.totalComplaints,
        0,
      );

    const totalPendingComplaints =
      rankings.reduce(
        (sum, ward) =>
          sum + ward.pendingComplaints,
        0,
      );

    const averageWardScore =
      totalWardsEvaluated > 0
        ? rankings.reduce(
            (sum, ward) =>
              sum + ward.score,
            0,
          ) / totalWardsEvaluated
        : 0;

    const criticalWardCount =
      rankings.filter(
        (ward) =>
          ward.priorityLevel ===
          "CRITICAL",
      ).length;

    const highPriorityWardCount =
      rankings.filter(
        (ward) =>
          ward.priorityLevel ===
          "HIGH",
      ).length;

    const mediumPriorityWardCount =
      rankings.filter(
        (ward) =>
          ward.priorityLevel ===
          "MEDIUM",
      ).length;

    const lowPriorityWardCount =
      rankings.filter(
        (ward) =>
          ward.priorityLevel ===
          "LOW",
      ).length;

    /*
     * -----------------------------------------
     * OVERALL SCORE
     * -----------------------------------------
     */

    const overallScore =
      rankings.length > 0
        ? rankings[0].score
        : 0;

    /*
     * -----------------------------------------
     * RESPONSE
     * -----------------------------------------
     */

    return NextResponse.json({
      success: true,

      timestamp:
        new Date().toISOString(),

      summary: {
        overallScore: Number(
          overallScore.toFixed(2),
        ),

        averageWardScore: Number(
          averageWardScore.toFixed(2),
        ),

        totalWardsEvaluated,

        criticalWardCount,

        highPriorityWardCount,

        mediumPriorityWardCount,

        lowPriorityWardCount,

        totalComplaints,

        totalPendingComplaints,
      },

      rankings,
    });
  } catch (error) {
    console.error(
      "AI Score API error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "AI_SCORE_ERROR",
          message:
            "Unable to calculate AI scores.",
        },
      },
      { status: 500 },
    );
  }
}