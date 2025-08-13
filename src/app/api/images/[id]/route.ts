import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

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
      return NextResponse.json({ error: 'Invalid image ID' }, { status: 400 });
    }

    // First, find the image in our DB to get its URL
    const image = await prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      return NextResponse.json({ error: 'Image not found in database' }, { status: 404 });
    }

    // If it's a manually uploaded image (in Vercel Blob), delete it from there
    if (image.source === 'manual') {
      await del(image.url);
    }
    
    // Finally, delete the image record from our database
    await prisma.image.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Image deleted successfully' });
  } catch (error: unknown) {
    console.error('Failed to delete image:', error);
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
} 