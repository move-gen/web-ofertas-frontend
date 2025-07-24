import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

const generateSlug = (title: string) => {
  const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  return `${slug}-${Date.now()}`;
};

export async function POST(req: NextRequest) {
  try {
    const { offerTitle, csvUrl } = await req.json();

    if (!offerTitle || !csvUrl) {
      return NextResponse.json({ error: 'Title and CSV URL are required.' }, { status: 400 });
    }

    const response = await fetch(csvUrl);
    if (!response.ok) throw new Error('Failed to fetch CSV file.');
    
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });

    const carIds = [];

    for (const row of parsed.data as any[]) {
      const carData = {
        sku: row['SKU'],
        name: row['Name'],
        published: row['Published'] === '1',
        isFeatured: row['Is featured?'] === '1',
        visibility: row['Visibility in catalog'],
        shortDescription: row['Short description'],
        description: row['Description'],
        regularPrice: parseFloat(row['Regular price']),
        salePrice: row['Sale price'] ? parseFloat(row['Sale price']) : null,
        currency: row['Currency'] || 'EUR',
        inStock: row['In stock?'] === '1',
        stock: row['Stock'] ? parseInt(row['Stock'], 10) : 1,
      };

      if (!carData.sku || !carData.name || isNaN(carData.regularPrice)) {
        console.warn('Skipping row due to missing SKU, name, or invalid price:', row);
        continue;
      }

      const car = await prisma.car.upsert({
        where: { sku: carData.sku },
        update: { ...carData },
        create: { ...carData },
      });
      carIds.push(car.id);

      // Clear old images and attributes before adding new ones
      await prisma.image.deleteMany({ where: { carId: car.id } });
      await prisma.attribute.deleteMany({ where: { carId: car.id } });

      const imageUrls = (row['Images'] || '').split(',').map((url: string) => url.trim()).filter(Boolean);
      if (imageUrls.length > 0) {
        await prisma.image.createMany({
          data: imageUrls.map((url: string) => ({ url, carId: car.id })),
        });
      }

      const attributes = [];
      for (let i = 1; i <= 5; i++) {
        const name = row[`Attribute ${i} name`];
        const value = row[`Attribute ${i} value(s)`];
        if (name && value) {
          attributes.push({ name, value, carId: car.id });
        }
      }
      if (attributes.length > 0) {
        await prisma.attribute.createMany({ data: attributes });
      }
    }

    const offerSlug = generateSlug(offerTitle);
    const newOffer = await prisma.offer.create({
      data: {
        title: offerTitle,
        slug: offerSlug,
        cars: { connect: carIds.map(id => ({ id })) },
      },
    });

    const offerUrl = `${process.env.NEXT_PUBLIC_BASE_URL || req.nextUrl.origin}/offers/${newOffer.slug}`;

    return NextResponse.json({
      message: 'Campaign created successfully!',
      offerUrl,
      offer: newOffer,
    });

  } catch (error) {
    console.error('Campaign creation failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 