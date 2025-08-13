import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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
      return NextResponse.json({ error: 'Invalid offer ID' }, { status: 400 });
    }

    // The relation is just a link table, so deleting the offer
    // is enough. The cars themselves are not deleted.
    await prisma.offer.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Offer deleted successfully' });
  } catch (error: unknown) {
    console.error('Failed to delete offer:', error);
    // Handle cases where the offer might not exist (e.g., already deleted)
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 