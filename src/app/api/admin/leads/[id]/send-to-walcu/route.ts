import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;
    
    console.log(`[WALCU SEND] Enviando lead ${leadId} a Walcu`);
    
    // Buscar el lead
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { car: true }
    });

    if (!lead) {
      return NextResponse.json(
        { success: false, error: 'Lead no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si ya fue enviado exitosamente
    if (lead.walcuStatus === 'sent' && lead.walcuLeadId) {
      return NextResponse.json({
        success: true,
        message: 'Lead ya fue enviado a Walcu anteriormente',
        data: { walcuLeadId: lead.walcuLeadId }
      });
    }

    console.log(`[WALCU SEND] Preparando datos del lead:`, {
      id: lead.id,
      firstName: lead.firstName,
      email: lead.email,
      walcuStatus: lead.walcuStatus
    });

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

    console.log(`[WALCU SEND] Enviando a Walcu API:`, {
      type: 'appraisal',
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      carData
    });

    // Enviar a Walcu usando el mismo endpoint que funciona en los formularios
    const walcuResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/walcu/leadimport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: lead.firstName,
        lastName: lead.lastName || '',
        email: lead.email,
        phone: lead.phone || undefined,
        message: fullMessage,
        car: carData
      })
    });

    if (walcuResponse.ok) {
      const walcuResult = await walcuResponse.json();
      console.log(`[WALCU SEND] Lead enviado exitosamente:`, walcuResult.leadId);
      
      // Actualizar el lead con el ID de Walcu
      await prisma.lead.update({
        where: { id: leadId },
        data: { 
          walcuLeadId: walcuResult.leadId || undefined,
          walcuStatus: 'sent',
          walcuError: undefined // Limpiar errores previos
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Lead enviado exitosamente a Walcu como tasación',
        data: {
          walcuLeadId: walcuResult.leadId,
          leadId: leadId
        }
      });
    } else {
      const walcuError = await walcuResponse.text();
      console.error(`[WALCU SEND] Error enviando a Walcu:`, walcuResponse.status, walcuError);
      
      // Actualizar el lead con el error
      await prisma.lead.update({
        where: { id: leadId },
        data: { 
          walcuStatus: 'failed',
          walcuError: `HTTP ${walcuResponse.status}: ${walcuError}`
        }
      });

      return NextResponse.json(
        {
          success: false,
          error: `Error enviando a Walcu: ${walcuResponse.status} - ${walcuError}`
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[WALCU SEND] Error:', error);
    
    // Actualizar el lead con el error
    try {
      const { id: leadId } = await params;
      await prisma.lead.update({
        where: { id: leadId },
        data: { 
          walcuStatus: 'failed',
          walcuError: error instanceof Error ? error.message : 'Error desconocido'
        }
      });
    } catch (updateError) {
      console.error('[WALCU SEND] Error actualizando lead:', updateError);
    }

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
