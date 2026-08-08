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

    const wards = await prisma.ward.findMany({
      orderBy: {
        number: "asc",
      },
    });

    const complaints = await prisma.complaint.findMany({
      select: {
        ward: true,
      },
    });

    const complaintMap = new Map<string, number>();

    for (const complaint of complaints) {
      const ward = complaint.ward?.trim();

      if (!ward) continue;

      complaintMap.set(
        ward,
        (complaintMap.get(ward) || 0) + 1
      );
    }

    const result = wards.map((ward) => ({
      ...ward,
      complaintCount:
        complaintMap.get(String(ward.number)) || 0,
    }));

    return NextResponse.json({
      success: true,
      count: result.length,
      wards: result,
    });
  } catch (error) {
    console.error("ADMIN_WARDS_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch ward data",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    const number = Number(body.number);
    const name = String(body.name || "").trim();
    const zone = body.zone
      ? String(body.zone).trim()
      : null;

    const population =
      body.population !== undefined &&
      body.population !== ""
        ? Number(body.population)
        : null;

    const budget =
      body.budget !== undefined &&
      body.budget !== ""
        ? Number(body.budget)
        : 0;

    if (!number || !name) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ward number and name are required",
        },
        { status: 400 }
      );
    }

    if (number < 1 || number > 272) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Ward number must be between 1 and 272",
        },
        { status: 400 }
      );
    }

    const existingWard =
      await prisma.ward.findUnique({
        where: {
          number,
        },
      });

    if (existingWard) {
      return NextResponse.json(
        {
          success: false,
          message: "Ward number already exists",
        },
        { status: 409 }
      );
    }

    const ward = await prisma.ward.create({
      data: {
        number,
        name,
        zone,
        population,
        budget,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Ward created successfully",
        ward,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN_WARD_CREATE_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create ward",
      },
      { status: 500 }
    );
  }
}