import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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
      return NextResponse.json({ error: 'Invalid offer ID' }, { status: 400 });
    }

    await prisma.offer.delete({
      where: { id: parsedId },
    });

    return NextResponse.json({ message: 'Offer deleted successfully' });
  } catch (error: unknown) {
    console.error('Failed to delete offer:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 