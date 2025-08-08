import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import CarPageClient from '@/components/CarPageClient';

export default async function CarPage({ params }: { params: { id: string } }) {
    const carId = parseInt(params.id, 10);
    if (isNaN(carId)) notFound();

    const car = await prisma.car.findUnique({
        where: { id: carId },
        include: { images: { orderBy: { isPrimary: 'desc' } } },
    });

    if (!car) notFound();

    return <CarPageClient car={car} />;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const carId = parseInt(params.id, 10);
    const car = await prisma.car.findUnique({ where: { id: carId } });

    if (!car) {
        return { title: 'Coche no encontrado' };
    }
    return { title: car.name, description: car.description || car.name };
}
