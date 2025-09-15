import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface BulkSendRequest {
  leadIds: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { leadIds }: BulkSendRequest = await request.json();
    
    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Se requiere una lista de IDs de leads' },
        { status: 400 }
      );
    }

    console.log(`[BULK WALCU SEND] Enviando ${leadIds.length} leads a Walcu`);
    
    // Buscar todos los leads
    const leads = await prisma.lead.findMany({
      where: { 
        id: { in: leadIds },
        walcuStatus: { not: 'sent' } // Solo enviar los que no han sido enviados
      },
      include: { car: true }
    });

    if (leads.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No se encontraron leads válidos para enviar'
      });
    }

    console.log(`[BULK WALCU SEND] Encontrados ${leads.length} leads válidos para enviar`);

    const results = {
      total: leads.length,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Procesar cada lead
    for (const lead of leads) {
      try {
        console.log(`[BULK WALCU SEND] Procesando lead ${lead.id}: ${lead.firstName} ${lead.lastName}`);

        // Preparar datos del vehículo del cliente (que quiere vender)
        const carData = {
          make: lead.carMake || '',
          model: lead.carModel || '',
          year: lead.carYear || new Date().getFullYear(),
          license_plate: lead.carLicensePlate || '',
          stock_number: lead.carStockNumber || '',
          category: 'car' as const,
          type: 'used' as const
        };

        // Preparar mensaje completo
        let fullMessage = lead.message || 'Cliente interesado en vender su vehículo';
        
        // Añadir información adicional si existe
        const additionalInfo = [];
        if (lead.source) additionalInfo.push(`Fuente: ${lead.source}`);
        if (lead.medium) additionalInfo.push(`Medio: ${lead.medium}`);
        if (lead.campaign) additionalInfo.push(`Campaña: ${lead.campaign}`);
        
        if (additionalInfo.length > 0) {
          fullMessage += ` | ${additionalInfo.join(', ')}`;
        }

        // Enviar a Walcu directamente usando el servicio
        try {
          console.log(`[BULK WALCU SEND] Enviando lead ${lead.id} a Walcu directamente`);
          
          const { WalcuCRMService } = await import('@/services/walcu-crm');
          const walcuService = new WalcuCRMService();
          
          // Crear payload según el formato oficial de Walcu (JSONLead)
          const leadPayload = {
            payload: {
              client: {
                foreign_id: `@${Date.now()}`,
                first_name: lead.firstName,
                last_name: lead.lastName || '',
                email: lead.email,
                phone: lead.phone || undefined
              },
              sales_lead: {
                foreign_id: `lead_${Date.now()}`,
                inquiry: fullMessage,
                car: {
                  make: carData.make,
                  model: carData.model,
                  year: carData.year,
                  license_plate: carData.license_plate,
                  stock_number: carData.stock_number
                }
              },
              version: "1.0.0"
            }
          };
          
          console.log(`[BULK WALCU SEND] Payload para Walcu:`, leadPayload);
          
          const walcuResponse = await walcuService.api.post("/leadimporttasks", leadPayload);
          
          console.log(`[BULK WALCU SEND] Lead ${lead.id} enviado exitosamente:`, walcuResponse.data._id);
          
          // Actualizar el lead con el ID de Walcu
          await prisma.lead.update({
            where: { id: lead.id },
            data: { 
              walcuLeadId: walcuResponse.data._id || undefined,
              walcuStatus: 'sent',
              walcuError: undefined // Limpiar errores previos
            }
          });

          results.sent++;
        } catch (walcuDirectError) {
          console.error(`[BULK WALCU SEND] Error enviando lead ${lead.id} a Walcu directamente:`, walcuDirectError);
          
          // Actualizar el lead con el error
          await prisma.lead.update({
            where: { id: lead.id },
            data: { 
              walcuStatus: 'failed',
              walcuError: walcuDirectError instanceof Error ? walcuDirectError.message : 'Error desconocido'
            }
          });

          results.failed++;
          results.errors.push(`${lead.firstName} ${lead.lastName}: ${walcuDirectError instanceof Error ? walcuDirectError.message : 'Error desconocido'}`);
        }
      } catch (leadError) {
        console.error(`[BULK WALCU SEND] Error procesando lead ${lead.id}:`, leadError);
        
        // Actualizar el lead con el error
        await prisma.lead.update({
          where: { id: lead.id },
          data: { 
            walcuStatus: 'failed',
            walcuError: leadError instanceof Error ? leadError.message : 'Error desconocido'
          }
        });

        results.failed++;
        results.errors.push(`${lead.firstName} ${lead.lastName}: ${leadError instanceof Error ? leadError.message : 'Error desconocido'}`);
      }
    }

    console.log(`[BULK WALCU SEND] Proceso completado:`, results);

    return NextResponse.json({
      success: true,
      message: `Proceso completado: ${results.sent} enviados, ${results.failed} fallidos`,
      data: results
    });

  } catch (error) {
    console.error('[BULK WALCU SEND] Error general:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
