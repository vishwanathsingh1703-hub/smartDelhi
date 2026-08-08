import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const existingWard = await prisma.ward.findUnique({
      where: {
        id,
      },
    });

    if (!existingWard) {
      return NextResponse.json(
        {
          success: false,
          message: "Ward not found",
        },
        { status: 404 }
      );
    }

    const data: {
      number?: number;
      name?: string;
      zone?: string | null;
      population?: number | null;
      budget?: number;
      isActive?: boolean;
    } = {};

    if (body.number !== undefined) {
      const number = Number(body.number);

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

      data.number = number;
    }

    if (body.name !== undefined) {
      const name = String(body.name).trim();

      if (!name) {
        return NextResponse.json(
          {
            success: false,
            message: "Ward name cannot be empty",
          },
          { status: 400 }
        );
      }

      data.name = name;
    }

    if (body.zone !== undefined) {
      data.zone = body.zone
        ? String(body.zone).trim()
        : null;
    }

    if (body.population !== undefined) {
      data.population =
        body.population === "" ||
        body.population === null
          ? null
          : Number(body.population);
    }

    if (body.budget !== undefined) {
      data.budget = Number(body.budget);
    }

    if (body.isActive !== undefined) {
      data.isActive = Boolean(body.isActive);
    }

    const ward = await prisma.ward.update({
      where: {
        id,
      },
      data,
    });

    return NextResponse.json({
      success: true,
      message: "Ward updated successfully",
      ward,
    });
  } catch (error) {
    console.error("ADMIN_WARD_UPDATE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to update ward",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const user = await getSessionUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;

    const ward = await prisma.ward.findUnique({
      where: {
        id,
      },
    });

    if (!ward) {
      return NextResponse.json(
        {
          success: false,
          message: "Ward not found",
        },
        { status: 404 }
      );
    }

    await prisma.ward.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Ward deleted successfully",
    });
  } catch (error) {
    console.error("ADMIN_WARD_DELETE_ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete ward",
      },
      { status: 500 }
    );
  }
}