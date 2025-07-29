import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseStringPromise } from 'xml2js';

const FEED_URL = 'https://feeds.inventario.pro/feed/Individual/515/hfvq97q43q0';

const extract = (item: any, key: string): string | null => {
    const value = item?.[key]?.[0];
    // The parser sometimes includes objects with a '_' key for CDATA content
    if (typeof value === 'object' && value._) {
        return value._.trim() || null;
    }
    if (typeof value === 'string') {
        return value.trim() || null;
    }
    return null;
}

const extractFloat = (item: any, key: string): number | null => {
    const val = extract(item, key);
    return val ? parseFloat(val.replace(',', '.')) : null; // Handle comma decimal separators
};
const extractInt = (item: any, key: string): number | null => {
    const val = extract(item, key);
    return val ? parseInt(val, 10) : null;
};


export async function POST(req: NextRequest) {
    try {
        const response = await fetch(FEED_URL);
        if (!response.ok) throw new Error(`Failed to fetch feed: ${response.statusText}`);
        
        const xmlText = await response.text();
        const parsedXml = await parseStringPromise(xmlText, {
            explicitArray: true,
            charkey: '_', // Use '_' for CDATA content
        });
        
        const items = parsedXml.standard?.ad;
        if (!items || !Array.isArray(items)) {
            const topLevelKeys = Object.keys(parsedXml).join(', ');
            let secondLevelKeys = 'N/A';
            if(parsedXml.standard && parsedXml.standard[0]) {
                secondLevelKeys = Object.keys(parsedXml.standard[0]).join(', ');
            }
            throw new Error(`Could not find 'ad' array in 'standard' element. Top keys: [${topLevelKeys}], Standard keys: [${secondLevelKeys}]`);
        }

        let createdCount = 0;
        let updatedCount = 0;
        const errorDetails: string[] = [];

        for (const item of items) { // item here is an <ad>
            const sku = extract(item, 'id');
            const name = extract(item, 'title');
            const regularPrice = extractFloat(item, 'price');
            const vin = extract(item, 'vin');

            if (!sku || !name || regularPrice === null || !vin) {
                errorDetails.push(`Skipping item due to missing essential data (SKU, Name, Price, or VIN).`);
                continue; 
            }

            const carData = {
                name,
                version: extract(item, 'version'),
                vin,
                regularPrice,
                financedPrice: extractFloat(item, 'financed_price'),
                monthlyFinancingFee: extractFloat(item, 'monthly_financing_fee'),
                vatDeductible: extract(item, 'vat') === 'True',
                make: extract(item, 'make'),
                model: extract(item, 'model'),
                bodytype: extract(item, 'bodytype'),
                year: extractInt(item, 'year'),
                month: extractInt(item, 'month'),
                kms: extractInt(item, 'kms'),
                fuel: extract(item, 'fuel'),
                power: extractInt(item, 'power'),
                transmission: extract(item, 'transmission'),
                color: extract(item, 'color'),
                doors: extractInt(item, 'doors'),
                seats: extractInt(item, 'seats'),
                engineSize: extractInt(item, 'engine_size'),
                gears: extractInt(item, 'gears'),
                store: extract(item, 'store'),
                city: extract(item, 'city'),
                address: extract(item, 'address'),
                numberplate: extract(item, 'numberplate'),
                guarantee: extract(item, 'guarantee'),
                environmentalBadge: extract(item, 'environmental_badge'),
                crashed: extract(item, 'crashed') === '1',
                description: extract(item, 'content'),
                equipment: extract(item, 'equipment'),
            };

            const imageUrls = item.pictures?.[0]?.picture
                ?.map((p: any) => {
                    const url = extract(p, 'picture_url');
                    return url ? { url } : null;
                })
                .filter((img: { url: string; } | null): img is { url: string } => img !== null) ?? [];


            try {
                // We use a transaction to ensure data integrity
                await prisma.$transaction(async (tx) => {
                    // 1. Find the existing car, if any
                    const existingCar = await tx.car.findUnique({ where: { sku: sku } });

                    // 2. If it exists, delete only the images sourced from the "feed"
                    if (existingCar) {
                        await tx.image.deleteMany({
                            where: {
                                carId: existingCar.id,
                                source: 'feed',
                            },
                        });
                    }

                    // 3. Upsert the car data and create the new "feed" images
                    const car = await tx.car.upsert({
                        where: { sku: sku },
                        update: { ...carData, images: { create: imageUrls.map((img: { url: string }) => ({ ...img, source: 'feed' })) } },
                        create: { sku: sku, ...carData, images: { create: imageUrls.map((img: { url: string }) => ({ ...img, source: 'feed' })) } },
                    });

                    if (car.createdAt.getTime() === car.updatedAt.getTime()) {
                        createdCount++;
                    } else {
                        updatedCount++;
                    }
                });
            } catch (e: any) {
                console.error(`Failed to process SKU ${sku}: ${e.message}`);
                errorDetails.push(`SKU ${sku} (${name}): ${e.message}`);
            }
        }
        
        let message = `Sincronización completada. Coches creados: ${createdCount}, actualizados: ${updatedCount}.`;
        if (errorDetails.length > 0) {
            message += ` Errores: ${errorDetails.length}. Consulte los logs del servidor para más detalles.`;
            console.error('Errores durante la sincronización:', errorDetails);
        }

        return NextResponse.json({ message });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        console.error('Sync failed:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 