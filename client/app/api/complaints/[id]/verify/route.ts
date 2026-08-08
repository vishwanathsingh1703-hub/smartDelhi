import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Not logged in' },
        { status: 401 }
      );
    }

    if (user.role !== 'CITIZEN') {
      return NextResponse.json(
        { error: 'Forbidden: Only citizens can verify complaints' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    if (complaint.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this complaint' },
        { status: 403 }
      );
    }

    if (complaint.workCompletedAt === null) {
      return NextResponse.json(
        {
          error:
            'Cannot verify: Work has not been completed by a worker yet',
        },
        { status: 400 }
      );
    }

    if (complaint.citizenVerified) {
      return NextResponse.json(
        { error: 'Complaint has already been verified' },
        { status: 400 }
      );
    }

    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        citizenVerified: true,
        citizenVerifiedAt: new Date(),

        // Complaint becomes RESOLVED after feedback is submitted.
        // Until then it remains pending final resolution.
        status: 'PENDING_VERIFICATION',
      },
    });

    return NextResponse.json({
      success: true,
      message:
        'Complaint verified successfully. Please submit your feedback.',
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('Error verifying complaint:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}