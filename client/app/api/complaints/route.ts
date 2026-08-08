import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    // Get JWT token from cookie
    const cookieHeader = request.headers.get('cookie');

    const token = cookieHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    // Verify JWT
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    // Only citizens can submit complaints
    if (payload.role !== 'CITIZEN') {
      return NextResponse.json(
        { error: 'Only citizens can submit complaints.' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      title,
      description,
      category,
      ward,
      priority,
      imageUrl,
      latitude,
      longitude,
    } = body;

    // Basic validation
    if (!title || !category) {
      return NextResponse.json(
        { error: 'Title and category are required.' },
        { status: 400 }
      );
    }

    // Get logged-in user
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User account not found.' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account is inactive.' },
        { status: 403 }
      );
    }

    // Create complaint
    const complaint = await prisma.complaint.create({
      data: {
        title: String(title).trim(),
        description: description
          ? String(description).trim()
          : null,

        category: String(category).trim(),

        ward:
          ward && String(ward).trim()
            ? String(ward).trim()
            : user.ward || 'Unknown',

        priority:
          priority && String(priority).trim()
            ? String(priority).trim()
            : 'Medium',

        imageUrl:
          imageUrl && String(imageUrl).trim()
            ? String(imageUrl).trim()
            : null,

        latitude:
          latitude !== undefined &&
          latitude !== null &&
          latitude !== ''
            ? Number(latitude)
            : null,

        longitude:
          longitude !== undefined &&
          longitude !== null &&
          longitude !== ''
            ? Number(longitude)
            : null,

        userId: user.id,
      },
    });

    // ==========================================
    // AUTO NOTIFICATION CREATION ADDED HERE
    // ==========================================
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Complaint Submitted',
        message: `Your complaint "${complaint.title}" has been submitted successfully.`,
        type: 'SUCCESS',
      },
    });

    return NextResponse.json(
      {
        message: 'Complaint submitted successfully.',
        complaint: {
          id: complaint.id,
          title: complaint.title,
          description: complaint.description,
          category: complaint.category,
          ward: complaint.ward,
          status: complaint.status,
          priority: complaint.priority,
          imageUrl: complaint.imageUrl,
          latitude: complaint.latitude,
          longitude: complaint.longitude,
          createdAt: complaint.createdAt.toISOString(),
          updatedAt: complaint.updatedAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create complaint error:', error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}

// Get logged-in citizen's complaints
export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie');

    const token = cookieHeader
      ?.split(';')
      .find((cookie) => cookie.trim().startsWith('token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login first.' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired session.' },
        { status: 401 }
      );
    }

    const complaints = await prisma.complaint.findMany({
      where: {
        userId: payload.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error);

    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 }
    );
  }
}