import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cars = await prisma.car.findMany({
      include: {
        images: {
          where: {
            isPrimary: true  // Solo cargar imagen principal
          },
          take: 1
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50  // Limitar a 50 coches máximo
    });

    return NextResponse.json(cars);

  } catch (error) {
    console.error('Failed to fetch cars:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
} 