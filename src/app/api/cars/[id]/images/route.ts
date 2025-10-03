import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/config';

async function verifyAdmin(req: NextRequest) {
  // Try cookie first
  let token = req.cookies.get('authToken')?.value;
  if (!token) {
    const auth = req.headers.get('authorization') || '';
    const m = auth.match(/^Bearer\s+(.*)$/i);
    if (m) token = m[1];
  }
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload as { role?: string })?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Verificar autenticación de admin
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const carId = parseInt(id, 10);
  if (isNaN(carId)) {
    return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
  }

  const file = request.body;
  const contentType = request.headers.get('content-type');
  const filename = request.headers.get('x-vercel-filename') || `car-${carId}-image.jpg`;

  if (!file || !contentType) {
    return NextResponse.json({ error: 'No file to upload or content type missing' }, { status: 400 });
  }

  try {
    const blob = await put(filename, file, {
      access: 'public',
      contentType,
    });

    // Now, save the blob URL to our database
    const newImage = await prisma.image.create({
      data: {
        carId: carId,
        url: blob.url,
        source: 'manual', // Mark this image as manually uploaded
        isPrimary: false, // By default, new images are not primary
      },
    });

    return NextResponse.json({ newImage });

  } catch (error) {
    console.error('Failed to upload image:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred during file upload.' },
      { status: 500 }
    );
  }
} 