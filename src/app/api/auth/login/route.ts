import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email: identifier },
    });

    if (!user) {
      return NextResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: { message: 'Invalid credentials' } }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-default-secret',
      { expiresIn: '1h' }
    );

    // Return user info without the password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ jwt: token, user: userWithoutPassword });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: { message: 'An internal server error occurred.' } }, { status: 500 });
  }
} 