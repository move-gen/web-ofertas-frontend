import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.headers.get('authorization');
  if (!token) {
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