import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
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
      return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
    }

    const car = await prisma.car.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: [
            { isPrimary: 'desc' }, // Primary image first
            { source: 'asc' }, // Manual images before feed images
          ]
        },
      },
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    return NextResponse.json(car);
  } catch (error) {
    console.error('Failed to fetch car:', error);
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 