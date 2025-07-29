import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    // Find the image to get its carId
    const imageToUpdate = await prisma.image.findUnique({
      where: { id },
    });

    if (!imageToUpdate) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    // Use a transaction to ensure data integrity
    await prisma.$transaction([
      // 1. Set isPrimary = false for all other images of this car
      prisma.image.updateMany({
        where: {
          carId: imageToUpdate.carId,
          NOT: { id: id },
        },
        data: { isPrimary: false },
      }),
      // 2. Set isPrimary = true for the selected image
      prisma.image.update({
        where: { id: id },
        data: { isPrimary: true },
      }),
    ]);

    return NextResponse.json({ message: 'Primary image updated successfully' });
  } catch (error) {
    console.error('Failed to set primary image:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 