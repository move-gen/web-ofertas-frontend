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
    
    let createdCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transform: (value, header) => {
        if (header === 'year' || header === 'price') {
          return parseFloat(value);
        }
        return value;
      }
    });

    for (const row of parsed.data as any[]) {
      const { name, brand, model, year, price } = row;

      if (!name || !brand || !model || !year || !price) {
        errors.push(`Skipping row due to missing data: ${JSON.stringify(row)}`);
        continue;
      }

      try {
        const result = await prisma.car.upsert({
          where: { name },
          update: { brand, model, year, price },
          create: { name, brand, model, year, price },
        });

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          createdCount++;
        } else {
          updatedCount++;
        }
      } catch (e: any) {
        errors.push(`Failed to process row for car "${name}": ${e.message}`);
      }
    }

    return NextResponse.json({
      message: 'CSV import completed.',
      created: createdCount,
      updated: updatedCount,
      errors: errors,
    });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'An internal server error occurred.' }, { status: 500 });
  }
} 