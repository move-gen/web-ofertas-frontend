import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { decode } from 'next-auth/jwt';

const secret = process.env.NEXTAUTH_SECRET;

async function verifyAdmin(req: NextRequest) {
    const token = req.cookies.get('authToken')?.value;
    if (!token) return false;

    try {
        const decoded = await decode({ token, secret });
        return decoded?.role === 'ADMIN';
    } catch (error) {
        console.error('JWT decoding error:', error);
        return false;
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const isAdmin = await verifyAdmin(req);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const carId = parseInt(params.id, 10);
  if (isNaN(carId)) {
    return NextResponse.json({ error: 'Invalid car ID' }, { status: 400 });
  }

  try {
    const { isSold } = await req.json();
    
    if (typeof isSold !== 'boolean') {
      return NextResponse.json({ error: 'Invalid isSold value' }, { status: 400 });
    }

    const updatedCar = await prisma.car.update({
      where: { id: carId },
      data: { isSold },
    });

    return NextResponse.json(updatedCar);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const isAdmin = await verifyAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    const carId = parseInt(params.id, 10);
    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get('offerId');

    if (isNaN(carId) || !offerId || isNaN(parseInt(offerId))) {
      return NextResponse.json({ error: 'Invalid car or offer ID' }, { status: 400 });
    }
  
    try {
      await prisma.offer.update({
        where: { id: parseInt(offerId) },
        data: {
          cars: {
            disconnect: { id: carId },
          },
        },
      });
  
      return NextResponse.json({ message: 'Car removed from offer successfully' });
    } catch (error) {
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  }

