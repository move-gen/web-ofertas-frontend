import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

// Configuración de autenticación con Google Sheets
const getGoogleAuth = async () => {
  // Verificar si tenemos credenciales en Base64 (método preferido)
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    try {
      // Decodificar las credenciales Base64
      const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
      const credentials = JSON.parse(credentialsJson);
      
      // Usar GoogleAuth con las credenciales completas
      const googleAuth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
      
      const authClient = await googleAuth.getClient();
      return authClient;
      
    } catch (base64Error) {
      console.error('Error procesando credenciales Base64:', base64Error);
      // Continuar con el método alternativo
    }
  }
  
  // Método alternativo: usar email y clave privada separados
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Faltan credenciales de Google Sheets. Verifica GOOGLE_CREDENTIALS_BASE64 o GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY en las variables de entorno.');
  }

  // Usar JWT directamente para mayor control
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  await auth.authorize();
  return auth;
};

// Función para mapear datos del sheet a formato de lead
const mapSheetRowToLead = (row: (string | number | boolean)[], headers: string[]) => {
  const leadData: Record<string, string | number | null> = {};
  
  headers.forEach((header, index) => {
    const rawValue = row[index];
    const value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
    const normalizedHeader = header.toLowerCase().trim();
    
    // Mapeo de columnas comunes
    switch (normalizedHeader) {
      case 'nombre':
      case 'first_name':
      case 'firstname':
        leadData.firstName = value;
        break;
      case 'apellido':
      case 'apellidos':
      case 'last_name':
      case 'lastname':
        leadData.lastName = value;
        break;
      case 'email':
      case 'correo':
      case 'correo_electronico':
        leadData.email = value;
        break;
      case 'telefono':
      case 'teléfono':
      case 'phone':
      case 'movil':
      case 'móvil':
        leadData.phone = value;
        break;
      case 'mensaje':
      case 'message':
      case 'comentario':
      case 'comentarios':
        leadData.message = value;
        break;
      case 'marca':
      case 'make':
      case 'car_make':
        leadData.carMake = value;
        break;
      case 'modelo':
      case 'model':
      case 'car_model':
        leadData.carModel = value;
        break;
      case 'año':
      case 'year':
      case 'car_year':
        if (value) {
          const yearNum = parseInt(value);
          // Validar que sea un año razonable (entre 1900 y año actual + 2)
          const currentYear = new Date().getFullYear();
          if (!isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 2) {
            leadData.carYear = yearNum;
          } else {
            leadData.carYear = null;
          }
        } else {
          leadData.carYear = null;
        }
        break;
      case 'matricula':
      case 'matrícula':
      case 'license_plate':
      case 'numberplate':
        leadData.carLicensePlate = value;
        break;
      case 'stock':
      case 'stock_number':
      case 'sku':
        leadData.carStockNumber = value;
        break;
      case 'fuente':
      case 'source':
        leadData.source = value;
        break;
      case 'medio':
      case 'medium':
        leadData.medium = value;
        break;
      case 'campaña':
      case 'campaign':
        leadData.campaign = value;
        break;
    }
  });
  
  return leadData;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { spreadsheetId, range, sheetName } = body;

    // Validar parámetros requeridos
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId es requerido' },
        { status: 400 }
      );
    }

    // Configurar autenticación
    const auth = await getGoogleAuth();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Determinar el rango a leer
    const finalRange = range || `${sheetName || 'Hoja1'}!A:Z`;

    console.log(`Leyendo datos de Google Sheets: ${spreadsheetId}, rango: ${finalRange}`);

    // Leer datos del sheet con configuración adicional
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: finalRange,
      valueRenderOption: 'UNFORMATTED_VALUE', // Obtener valores sin formato
      dateTimeRenderOption: 'FORMATTED_STRING' // Fechas como strings
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos en la hoja de cálculo' },
        { status: 404 }
      );
    }

    // La primera fila contiene los headers
    const headers = rows[0];
    const dataRows = rows.slice(1);

    console.log(`Headers encontrados: ${headers.join(', ')}`);
    console.log(`Filas de datos: ${dataRows.length}`);

    // Procesar cada fila y crear leads
    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: [] as string[],
      leads: [] as unknown[]
    };

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      // Saltar filas completamente vacías
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        continue;
      }
      
      results.processed++;

      try {
        // Mapear datos de la fila
        const leadData = mapSheetRowToLead(row, headers);

        // Validar datos mínimos requeridos
        if (!leadData.firstName || !leadData.email) {
          results.errors.push(`Fila ${i + 2}: Faltan datos requeridos (nombre o email)`);
          continue;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailStr = String(leadData.email);
        if (!emailRegex.test(emailStr)) {
          results.errors.push(`Fila ${i + 2}: Email inválido: ${emailStr}`);
          continue;
        }

        // Buscar si ya existe un lead con este email
        const existingLead = await prisma.lead.findFirst({
          where: { email: emailStr }
        });

        // Intentar encontrar el coche relacionado si se proporciona SKU
        let carId = null;
        if (leadData.carStockNumber) {
          const car = await prisma.car.findFirst({
            where: { sku: String(leadData.carStockNumber) }
          });
          if (car) {
            carId = car.id;
          }
        }

        // Preparar datos del lead
        const leadPayload = {
          firstName: String(leadData.firstName),
          lastName: String(leadData.lastName || ''),
          email: emailStr,
          phone: leadData.phone ? String(leadData.phone) : null,
          message: leadData.message ? String(leadData.message) : null,
          carId,
          carMake: leadData.carMake ? String(leadData.carMake) : null,
          carModel: leadData.carModel ? String(leadData.carModel) : null,
          carYear: typeof leadData.carYear === 'number' ? leadData.carYear : null,
          carLicensePlate: leadData.carLicensePlate ? String(leadData.carLicensePlate) : null,
          carStockNumber: leadData.carStockNumber ? String(leadData.carStockNumber) : null,
          source: leadData.source ? String(leadData.source) : 'google_sheets',
          medium: leadData.medium ? String(leadData.medium) : 'import',
          campaign: leadData.campaign ? String(leadData.campaign) : 'sheets_import',
          walcuStatus: 'pending'
        };

        let lead;
        if (existingLead) {
          // Actualizar lead existente
          lead = await prisma.lead.update({
            where: { id: existingLead.id },
            data: leadPayload
          });
          results.updated++;
        } else {
          // Crear nuevo lead
          lead = await prisma.lead.create({
            data: leadPayload
          });
          results.created++;
        }

        results.leads.push(lead);

        // Enviar automáticamente a Walcu como lead de adquisición/tasación
        try {
          console.log(`Enviando lead ${lead.id} a Walcu como tasación`);
          
          // Preparar datos del vehículo del cliente (que quiere vender)
          const carData = {
            make: leadData.carMake ? String(leadData.carMake) : '',
            model: leadData.carModel ? String(leadData.carModel) : '',
            year: typeof leadData.carYear === 'number' ? leadData.carYear : new Date().getFullYear(),
            license_plate: leadData.carLicensePlate ? String(leadData.carLicensePlate) : '',
            stock_number: leadData.carStockNumber ? String(leadData.carStockNumber) : '',
            category: 'car' as const,
            type: 'used' as const
          };

          // Preparar mensaje con campos adicionales no mapeados
          let fullMessage = leadData.message ? String(leadData.message) : 'Cliente interesado en vender su vehículo';
          
          // Añadir campos adicionales al mensaje si existen
          const additionalFields = Object.entries(leadData)
            .filter(([key, value]) => 
              value && 
              !['firstName', 'lastName', 'email', 'phone', 'message', 'carMake', 'carModel', 'carYear', 'carLicensePlate', 'carStockNumber', 'source', 'medium', 'campaign'].includes(key)
            )
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
          
          if (additionalFields) {
            fullMessage += ` | Información adicional: ${additionalFields}`;
          }

          // Enviar a Walcu como lead de tasación/adquisición
          const walcuResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/walcu/leads`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'appraisal', // Tipo tasación para adquisición
              firstName: String(leadData.firstName),
              lastName: String(leadData.lastName || ''),
              email: String(leadData.email),
              phone: leadData.phone ? String(leadData.phone) : undefined,
              message: fullMessage,
              car: carData,
              source: leadData.source ? String(leadData.source) : 'google_sheets',
              medium: leadData.medium ? String(leadData.medium) : 'manual_import',
              campaign: leadData.campaign ? String(leadData.campaign) : 'acquisition_import'
            })
          });

          if (walcuResponse.ok) {
            const walcuResult = await walcuResponse.json();
            console.log(`Lead ${lead.id} enviado exitosamente a Walcu`, walcuResult.data?._id);
            
            // Actualizar el lead con el ID de Walcu
            await prisma.lead.update({
              where: { id: lead.id },
              data: { 
                walcuLeadId: walcuResult.data?._id || null,
                walcuStatus: 'sent'
              }
            });
          } else {
            const walcuError = await walcuResponse.text();
            console.error(`Error enviando lead ${lead.id} a Walcu:`, walcuResponse.status, walcuError);
            
            await prisma.lead.update({
              where: { id: lead.id },
              data: { 
                walcuStatus: 'failed',
                walcuError: `HTTP ${walcuResponse.status}: ${walcuError}`
              }
            });
          }
        } catch (walcuError) {
          console.error(`Error enviando lead ${lead.id} a Walcu:`, walcuError);
          
          await prisma.lead.update({
            where: { id: lead.id },
            data: { 
              walcuStatus: 'failed',
              walcuError: walcuError instanceof Error ? walcuError.message : 'Error desconocido'
            }
          });
        }

      } catch (error) {
        console.error(`Error procesando fila ${i + 2}:`, error);
        results.errors.push(`Fila ${i + 2}: Error procesando datos - ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log('Resultados de importación:', results);

    return NextResponse.json({
      success: true,
      message: `Importación completada. ${results.created} leads creados, ${results.updated} actualizados`,
      data: {
        processed: results.processed,
        created: results.created,
        updated: results.updated,
        errors: results.errors,
        totalLeads: results.leads.length
      }
    });

  } catch (error: unknown) {
    console.error('Error en importación de Google Sheets:', error);
    
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;
    
    // Verificar si es un error de la API de Google
    const apiError = error as { response?: { status?: number } };
    if (apiError.response?.status) {
      // Errores específicos de la API de Google
      switch (apiError.response.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica el ID de la hoja y el rango.';
          statusCode = 400;
          break;
        case 401:
          errorMessage = 'Error de autenticación. Verifica las credenciales de la cuenta de servicio.';
          statusCode = 401;
          break;
        case 403:
          errorMessage = 'Sin permisos para acceder a la hoja de cálculo. Verifica que la hoja esté compartida con la cuenta de servicio.';
          statusCode = 403;
          break;
        case 404:
          errorMessage = 'Hoja de cálculo no encontrada. Verifica el ID de la hoja.';
          statusCode = 404;
          break;
        case 429:
          errorMessage = 'Límite de solicitudes excedido. Intenta de nuevo en unos minutos.';
          statusCode = 429;
          break;
        default:
          errorMessage = `Error de la API de Google: ${apiError.response.status}`;
      }
    } else if (error instanceof Error) {
      if (error.message.includes('Unable to parse range')) {
        errorMessage = 'Rango de celdas inválido. Usa formato como A1:Z100 o NombreHoja!A1:Z100';
        statusCode = 400;
      } else if (error.message.includes('Requested entity was not found')) {
        errorMessage = 'Hoja de cálculo no encontrada o sin permisos';
        statusCode = 404;
      } else if (error.message.includes('The caller does not have permission')) {
        errorMessage = 'Sin permisos para acceder a la hoja de cálculo';
        statusCode = 403;
      } else if (error.message.includes('credenciales')) {
        errorMessage = error.message;
        statusCode = 500;
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          message: error instanceof Error ? error.message : 'Unknown error',
          status: apiError.response?.status,
          statusText: (apiError.response as { statusText?: string })?.statusText
        } : undefined
      },
      { status: statusCode }
    );
  }
}

// Endpoint para obtener información de la hoja (headers, etc.)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    const sheetName = searchParams.get('sheetName') || 'Hoja1';

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'spreadsheetId es requerido' },
        { status: 400 }
      );
    }

    const auth = await getGoogleAuth();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheets = google.sheets({ version: 'v4', auth: auth as any });

    // Obtener información de la hoja
    const spreadsheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });

    // Obtener los headers (primera fila)
    const headersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`,
      valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const headers = headersResponse.data.values?.[0] || [];

    // Obtener una muestra de datos (primeras 5 filas)
    const sampleResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!2:6`,
      valueRenderOption: 'UNFORMATTED_VALUE'
    });

    const sampleData = sampleResponse.data.values || [];

    return NextResponse.json({
      success: true,
      data: {
        title: spreadsheetInfo.data.properties?.title,
        sheets: spreadsheetInfo.data.sheets?.map(sheet => ({
          title: sheet.properties?.title,
          sheetId: sheet.properties?.sheetId,
          rowCount: sheet.properties?.gridProperties?.rowCount,
          columnCount: sheet.properties?.gridProperties?.columnCount
        })),
        headers,
        sampleData,
        totalRows: sampleData.length + 1 // +1 por el header
      }
    });

  } catch (error: unknown) {
    console.error('Error obteniendo información de Google Sheets:', error);
    
    let errorMessage = 'Error obteniendo información de la hoja de cálculo';
    let statusCode = 500;
    
    // Verificar si es un error de la API de Google
    const apiError = error as { response?: { status?: number } };
    if (apiError.response?.status) {
      switch (apiError.response.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica el ID de la hoja.';
          statusCode = 400;
          break;
        case 401:
          errorMessage = 'Error de autenticación. Verifica las credenciales.';
          statusCode = 401;
          break;
        case 403:
          errorMessage = 'Sin permisos para acceder a la hoja de cálculo.';
          statusCode = 403;
          break;
        case 404:
          errorMessage = 'Hoja de cálculo no encontrada.';
          statusCode = 404;
          break;
        default:
          errorMessage = `Error de la API de Google: ${apiError.response.status}`;
      }
    } else if (error instanceof Error && error.message.includes('credenciales')) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : 'Unknown error') : undefined
      },
      { status: statusCode }
    );
  }
}
