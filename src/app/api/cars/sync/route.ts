import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseStringPromise } from 'xml2js';

const FEED_URL = 'https://feeds.inventario.pro/feed/Individual/515/hfvq97q43q0';

// Ensure this route runs on Node.js (not Edge), allows long processing, and is always dynamic
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300; // up to 5 minutes if plan allows

interface XmlValue {
    _: string;
}

interface XmlItem {
    [key: string]: (string | XmlValue)[] | undefined;
}

const extract = (item: XmlItem, key: string): string | null => {
    const value = item?.[key]?.[0];
    if (typeof value === 'object' && '_v' in value) {
        return (value as XmlValue)._.trim() || null;
    }
    if (typeof value === 'string') {
        return value.trim() || null;
    }
    return null;
}

const extractFloat = (item: XmlItem, key: string): number | null => {
    const val = extract(item, key);
    return val ? parseFloat(val.replace(',', '.')) : null; // Handle comma decimal separators
};
const extractInt = (item: XmlItem, key: string): number | null => {
    const val = extract(item, key);
    return val ? parseInt(val, 10) : null;
};


export async function POST(req: Request) {
    try {
        const { offset = 0, limit = 50 } = await (async () => {
            try { return await req.json(); } catch { return { offset: 0, limit: 50 }; }
        })();

        const safeOffset = Math.max(0, Number(offset) || 0);
        const safeLimit = Math.max(1, Math.min(100, Number(limit) || 50));

        const response = await fetch(FEED_URL, { cache: 'no-store' });
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

        const total = items.length;
        const batch = items.slice(safeOffset, safeOffset + safeLimit);

        let createdCount = 0;
        let updatedCount = 0;
        const errorDetails: string[] = [];

        for (const item of batch) { // item here is an <ad>
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
                ?.map((p: XmlItem) => {
                    const url = p?.picture_url?.[0];
                    return url && typeof url === 'string' ? { url } : null;
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
            } catch (e: unknown) {
                const error = e as Error;
                console.error(`Failed to process SKU ${sku}: ${error.message}`);
                errorDetails.push(`SKU ${sku} (${name}): ${error.message}`);
            }
        }
        
        const nextOffset = safeOffset + batch.length;
        const done = nextOffset >= total;

        let message = `Lote procesado (${safeOffset + 1}-${nextOffset} de ${total}). ` +
                      `Creados: ${createdCount}, Actualizados: ${updatedCount}.` +
                      (done ? ' Sincronización completada.' : ' Continúe con el siguiente lote.');
        if (errorDetails.length > 0) {
            message += ` Errores: ${errorDetails.length}. Consulte los logs del servidor para más detalles.`;
            console.error('Errores durante la sincronización:', errorDetails);
        }

        return NextResponse.json({ message, nextOffset, total, done, processed: batch.length });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        console.error('Sync failed:', errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
} 