import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  _request: NextRequest,
  _context: { params: Promise<{ id: string }> }
) {
  return NextResponse.json({
    success: true,
    message: "Notification read endpoint",
  });
}