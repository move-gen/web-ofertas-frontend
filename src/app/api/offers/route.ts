import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, cars } = await req.json();

    if (!title || !cars || !Array.isArray(cars) || cars.length === 0) {
      return NextResponse.json({ error: 'Invalid data: Title and at least one car are required' }, { status: 400 });
    }

    const newOffer = await prisma.offer.create({
      data: {
        title,
        cars: {
          connect: cars.map((carId: number) => ({ id: carId })),
        },
      },
      include: {
        cars: true, // Include the related cars in the response
      },
    });

    return NextResponse.json(newOffer, { status: 201 });

  } catch (error) {
    console.error('Offer creation error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
} 