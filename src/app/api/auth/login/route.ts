import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { JWT_SECRET, COOKIE_CONFIG } from '@/lib/config';

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
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Crear cookie httpOnly para el servidor (middleware y layout)
    const serverCookie = serialize(COOKIE_CONFIG.name, token, {
      httpOnly: true,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      maxAge: COOKIE_CONFIG.maxAge,
      path: COOKIE_CONFIG.path,
    });

    // Crear cookie accesible desde JavaScript para el frontend
    const clientCookie = serialize(COOKIE_CONFIG.name, token, {
      httpOnly: false,
      secure: COOKIE_CONFIG.secure,
      sameSite: COOKIE_CONFIG.sameSite,
      maxAge: COOKIE_CONFIG.maxAge,
      path: COOKIE_CONFIG.path,
    });

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    
    const response = NextResponse.json({ 
      jwt: token, // Incluir el token en la respuesta
      user: userWithoutPassword 
    });
    
    // Establecer ambas cookies con el mismo nombre
    response.headers.set('Set-Cookie', [serverCookie, clientCookie].join(', '));
    
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: { message: 'An internal server error occurred.' } }, { status: 500 });
  }
} 