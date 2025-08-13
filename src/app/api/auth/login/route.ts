import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

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
      { userId: user.id, email: user.email, role: user.role },
      process.env.NEXTAUTH_SECRET || 'your-default-secret',
      { expiresIn: '1h' }
    );

    const cookie = serialize('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    const response = NextResponse.json({ user: userWithoutPassword });
    response.headers.set('Set-Cookie', cookie);
    
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: { message: 'An internal server error occurred.' } }, { status: 500 });
  }
} 