import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function POST(
  request: Request,
  { params }: PageProps
) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    if (user.role !== 'WORKER') {
      return NextResponse.json(
        { error: 'Only workers can complete complaints.' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const body = await request.json();

    const workerLatitude = Number(body.latitude);
    const workerLongitude = Number(body.longitude);

    if (
      !Number.isFinite(workerLatitude) ||
      !Number.isFinite(workerLongitude)
    ) {
      return NextResponse.json(
        { error: 'Valid worker location is required.' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.findUnique({
      where: {
        id,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found.' },
        { status: 404 }
      );
    }

    if (complaint.assignedWorkerId !== user.id) {
      return NextResponse.json(
        {
          error:
            'This complaint is not assigned to you.',
        },
        { status: 403 }
      );
    }

    if (
      complaint.latitude === null ||
      complaint.longitude === null
    ) {
      return NextResponse.json(
        {
          error:
            'Complaint location is not available.',
        },
        { status: 400 }
      );
    }

    const distance = calculateDistance(
      complaint.latitude,
      complaint.longitude,
      workerLatitude,
      workerLongitude
    );

    // Worker must be within 100 meters of complaint location.
    if (distance > 100) {
      return NextResponse.json(
        {
          error:
            'You must be within 100 meters of the complaint location to mark it as completed.',
          distance: Math.round(distance),
        },
        { status: 403 }
      );
    }

    if (complaint.citizenVerified) {
      return NextResponse.json(
        {
          error:
            'This complaint has already been verified by the citizen.',
        },
        { status: 400 }
      );
    }

    const updatedComplaint = await prisma.complaint.update({
      where: {
        id,
      },
      data: {
        workCompletedAt: new Date(),
        status: 'PENDING_VERIFICATION',
      },
    });

    if (complaint.userId) {
      await prisma.notification.create({
        data: {
          userId: complaint.userId,
          title: 'Complaint Work Completed',
          message:
            'The assigned worker has completed the work. Please verify whether your problem has been resolved and submit your feedback.',
          type: 'COMPLAINT_COMPLETED',
        },
      });
    }

    return NextResponse.json({
      message:
        'Work marked as completed. Waiting for citizen verification.',
      complaint: updatedComplaint,
      distance: Math.round(distance),
    });
  } catch (error) {
    console.error(
      'Worker complete complaint error:',
      error
    );

    return NextResponse.json(
      {
        error: 'Internal server error.',
      },
      { status: 500 }
    );
  }
}