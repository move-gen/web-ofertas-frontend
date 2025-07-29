import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function POST(req: NextRequest) {
  const token = req.headers.get('authorization');
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    }

    const fileContent = await file.text();
    
    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim(),
    });

    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    await prisma.$transaction(async (tx) => {
      for (const row of parsed.data as any[]) {
        const regularPrice = parseFloat(row['Regular price']);
        if (!row['SKU'] || !row['Name'] || isNaN(regularPrice)) {
          errors.push(`Skipping row due to missing SKU, name, or invalid price: ${JSON.stringify(row)}`);
          continue;
        }

        const carData = {
          name: row['Name'],
          published: row['Published'] === '1',
          isFeatured: row['Is featured?'] === '1',
          visibility: row['Visibility in catalog'],
          shortDescription: row['Short description'],
          description: row['Description'],
          regularPrice: regularPrice,
          salePrice: row['Sale price'] ? parseFloat(row['Sale price']) : null,
          currency: row['Currency'] || 'EUR',
          inStock: row['In stock?'] === '1',
          stock: row['Stock'] ? parseInt(row['Stock'], 10) : 1,
        };
        
        const imageUrlsRaw = (row['Images'] || '').split(',');
        const imageUrls = imageUrlsRaw.map((url: string) => ({ url: url.trim() })).filter((img: {url: string}) => img.url);

        const attributes = [];
        for (let i = 1; i <= 5; i++) {
          const name = row[`Attribute ${i} name`];
          const value = row[`Attribute ${i} value(s)`];
          if (name && value) {
            attributes.push({ name, value });
          }
        }

        try {
          const car = await tx.car.upsert({
            where: { sku: row['SKU'] },
            update: {
              ...carData,
              images: { deleteMany: {}, create: imageUrls },
              attributes: { deleteMany: {}, create: attributes },
            },
            create: {
              sku: row['SKU'],
              ...carData,
              images: { create: imageUrls },
              attributes: { create: attributes },
            },
          });
          
          if (car.createdAt.getTime() === car.updatedAt.getTime()) {
            createdCount++;
          } else {
            updatedCount++;
          }
        } catch (e: any) {
          errors.push(`Failed to process row for car "${row['Name']}": ${e.message}`);
        }
      }
    });

    return NextResponse.json({
      message: `Coches creados: ${createdCount}, Coches actualizados: ${updatedCount}. Errores: ${errors.length}`,
      created: createdCount,
      updated: updatedCount,
      errors: errors,
    });

  } catch (error) {
    console.error('Import error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 