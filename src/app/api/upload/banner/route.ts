import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const file = request.body;
    const contentType = request.headers.get('content-type');
    const filename = request.headers.get('x-vercel-filename') || `banner-${Date.now()}.jpg`;

    if (!file || !contentType) {
      return NextResponse.json({ error: 'No file to upload or content type missing' }, { status: 400 });
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ 
        error: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, GIF, WebP' 
      }, { status: 400 });
    }

    // Usar exactamente el mismo sistema que /api/cars/[id]/images
    const blob = await put(filename, file, {
      access: 'public',
      contentType,
    });

    return NextResponse.json({ 
      success: true, 
      url: blob.url,
      fileName: filename
    });

  } catch (error) {
    console.error('Error uploading banner:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
