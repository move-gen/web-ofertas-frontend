import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  // A real app would validate the JWT here
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const term = searchParams.get('term') || '';

    const results = await prisma.car.findMany({
      where: {
        name: {
          contains: term,
          mode: 'insensitive',
        },
      },
    });

    return NextResponse.json(results);

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
} 