import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();

    // Authentication
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized: Not logged in' },
        { status: 401 }
      );
    }

    // Only citizens can submit feedback
    if (user.role !== 'CITIZEN') {
      return NextResponse.json(
        { error: 'Forbidden: Only citizens can submit feedback' },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Parse request body
    const body = await request.json();

    const rating = Number(body.rating);
    const description =
      typeof body.description === 'string'
        ? body.description.trim()
        : '';

    // Validate rating
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          error: 'Invalid rating. Rating must be an integer between 1 and 5.',
        },
        { status: 400 }
      );
    }

    // Find complaint
    const complaint = await prisma.complaint.findUnique({
      where: {
        id,
      },
      include: {
        feedback: true,
      },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Make sure complaint belongs to logged-in citizen
    if (complaint.userId !== user.id) {
      return NextResponse.json(
        {
          error:
            'Forbidden: You do not own this complaint',
        },
        { status: 403 }
      );
    }

    // Worker must have completed the work
    if (complaint.workCompletedAt === null) {
      return NextResponse.json(
        {
          error:
            'Cannot leave feedback before the worker completes the work',
        },
        { status: 400 }
      );
    }

    // Citizen must verify the work first
    if (!complaint.citizenVerified) {
      return NextResponse.json(
        {
          error:
            'Please verify the complaint before submitting feedback',
        },
        { status: 400 }
      );
    }

    // Prevent duplicate feedback
    if (complaint.feedback) {
      return NextResponse.json(
        {
          error:
            'Feedback has already been submitted for this complaint',
        },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        complaintId: id,

        // Required by your Prisma schema
        citizenId: user.id,

        rating,

        description: description || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Feedback submitted successfully.',
        feedback,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      'Error submitting complaint feedback:',
      error
    );

    return NextResponse.json(
      {
        error: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}