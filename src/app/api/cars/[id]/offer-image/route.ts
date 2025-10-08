import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import { jwtVerify } from 'jose';
import { JWT_SECRET } from '@/lib/config';

async function verifyAdmin(req: NextRequest) {
  // Try cookie first
  let token = req.cookies.get('authToken')?.value;
  if (!token) {
    const auth = req.headers.get('authorization') || '';
    const m = auth.match(/^Bearer\s+(.*)$/i);
    if (m) token = m[1];
  }
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return (payload as { role?: string })?.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('🚀 POST /api/cars/[id]/offer-image iniciado');
  
  const { id } = await params;
  console.log('📋 Car ID recibido:', id);
  
  // Verificar autenticación de admin
  const isAdmin = await verifyAdmin(request);
  console.log('🔐 Verificación de admin:', isAdmin ? 'AUTORIZADO' : 'NO AUTORIZADO');
  
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const carId = parseInt(id, 10);
  if (isNaN(carId)) {
    console.log('❌ ID de coche inválido:', id);
    return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
  }

  const file = request.body;
  const contentType = request.headers.get('content-type');
  const filename = request.headers.get('x-vercel-filename') || `offer-${carId}-${Date.now()}.jpg`;

  console.log('📁 Detalles del archivo:', {
    hasFile: !!file,
    contentType,
    filename
  });

  if (!file || !contentType) {
    console.log('❌ Archivo o content-type faltante');
    return NextResponse.json({ error: 'No file to upload or content type missing' }, { status: 400 });
  }

  try {
    console.log('🔍 Verificando existencia del coche...');
    // Verificar que el coche existe
    const car = await prisma.car.findUnique({
      where: { id: carId }
    });

    if (!car) {
      console.log('❌ Coche no encontrado con ID:', carId);
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    console.log('✅ Coche encontrado:', car.name);
    console.log('📤 Iniciando subida a Vercel Blob...');

    // Subir imagen a Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
      contentType,
    });

    console.log('✅ Imagen subida exitosamente:', blob.url);
    console.log('💾 Actualizando base de datos...');

    // Actualizar el coche con la URL de la imagen de oferta
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: {
        offerImageUrl: blob.url,
      },
    });

    console.log('✅ Base de datos actualizada exitosamente');

    return NextResponse.json({ 
      success: true, 
      offerImageUrl: blob.url,
      message: 'Foto de oferta subida correctamente'
    });

  } catch (error) {
    console.error('❌ Failed to upload offer image:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      name: error instanceof Error ? error.name : 'Unknown error type'
    });
    
    return NextResponse.json(
      { 
        error: 'An internal server error occurred during file upload.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  // Verificar autenticación de admin
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const carId = parseInt(id, 10);
  if (isNaN(carId)) {
    return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
  }

  try {
    // Verificar que el coche existe
    const car = await prisma.car.findUnique({
      where: { id: carId }
    });

    if (!car) {
      return NextResponse.json({ error: 'Car not found' }, { status: 404 });
    }

    // Eliminar la URL de la imagen de oferta
    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: {
        offerImageUrl: null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Foto de oferta eliminada correctamente'
    });

  } catch (error) {
    console.error('Failed to delete offer image:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while deleting the offer image.' },
      { status: 500 }
    );
  }
}
