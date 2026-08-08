import { NextResponse } from 'next/server';// Standard Next Response
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || 'Invalid registration data.' },
        { status: 400 }
      );
    }

    const { name, email, password, role, ward, phone } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        ward,
        phone,
      },
    });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ward: user.ward,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json({ message: 'Registration successful', user: safeUser }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}