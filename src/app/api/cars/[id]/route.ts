import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
    }

    const car = await prisma.car.findUnique({
      where: { id: parsedId },
      include: {
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { source: 'asc' },
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