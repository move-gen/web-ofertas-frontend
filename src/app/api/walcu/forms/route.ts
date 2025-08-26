import { NextRequest, NextResponse } from 'next/server';
import { WalcuService } from '@/services/walcu-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { formType, ...formData } = body;
    
    if (!formType) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Se requiere especificar el tipo de formulario'
        },
        { status: 400 }
      );
    }

    const walcuService = new WalcuService();
    let result;

    switch (formType) {
      case 'contact':
        result = await walcuService.processContactForm(formData);
        break;
      case 'car_interest':
        result = await walcuService.processCarInterestForm(formData);
        break;
      case 'appraisal':
        result = await walcuService.processAppraisalForm(formData);
        break;
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Tipo de formulario no válido. Debe ser: contact, car_interest o appraisal'
          },
          { status: 400 }
        );
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: result,
        message: `Formulario de ${formType} procesado exitosamente en Walcu CRM`
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Error procesando formulario en Walcu CRM',
        message: result.error || 'Error desconocido'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing form in Walcu:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error processing form in Walcu CRM',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (!action) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Se requiere especificar la acción (connection, stats)'
        },
        { status: 400 }
      );
    }

    const walcuService = new WalcuService();
    let result;

    switch (action) {
      case 'connection':
        result = await walcuService.checkConnection();
        break;
      case 'stats':
        result = await walcuService.getIntegrationStats();
        break;
      default:
        return NextResponse.json(
          { 
            success: false,
            error: 'Acción no válida. Debe ser: connection o stats'
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Acción ${action} ejecutada exitosamente`
    });
  } catch (error) {
    console.error('Error executing action in Walcu:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Error executing action in Walcu CRM',
        message: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
