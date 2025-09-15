import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { GOOGLE_SHEETS_CONFIG, autoMapColumns, getUnmappedColumns } from '@/lib/google-sheets-config';

// Configuración de autenticación con Google Sheets
const getGoogleAuth = () => {
  // Validar que las variables de entorno existan
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('Faltan credenciales de Google Sheets. Verifica GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY en las variables de entorno.');
  }

  // Usar JWT directamente para mayor control
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  });
  
  return auth;
};

// Función mejorada para mapear datos del sheet a formato de lead
const mapSheetRowToLead = (
  row: (string | number | boolean)[], 
  headers: string[],
  columnMapping: Record<string, string>,
  unmappedColumns: string[]
) => {
  const leadData: Record<string, string | number | null> = {};
  const additionalData: Record<string, string | number | null> = {};
  
  // Mapear columnas conocidas
  Object.entries(columnMapping).forEach(([field, headerName]) => {
    const headerIndex = headers.indexOf(headerName);
    if (headerIndex !== -1) {
      const rawValue = row[headerIndex];
      const value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
      
      if (field === 'carYear') {
        if (value) {
          const yearNum = parseInt(value);
          const currentYear = new Date().getFullYear();
          if (!isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 2) {
            leadData[field] = yearNum;
          } else {
            leadData[field] = null;
          }
        } else {
          leadData[field] = null;
        }
      } else {
        leadData[field] = value || null;
      }
    }
  });
  
  // Capturar columnas adicionales no mapeadas
  unmappedColumns.forEach(headerName => {
    const headerIndex = headers.indexOf(headerName);
    if (headerIndex !== -1) {
      const rawValue = row[headerIndex];
      const value = rawValue !== undefined && rawValue !== null ? String(rawValue).trim() : '';
      if (value) {
        additionalData[headerName] = value;
      }
    }
  });
  
  return { leadData, additionalData };
};

export async function POST() {
  try {
    // Verificar si hay configuración por defecto
    if (!GOOGLE_SHEETS_CONFIG.DEFAULT_SPREADSHEET_ID) {
      return NextResponse.json(
        { 
          error: 'No hay hoja de cálculo configurada por defecto. Configura GOOGLE_SHEETS_DEFAULT_SPREADSHEET_ID en las variables de entorno.',
          requiresManualConfig: true
        },
        { status: 400 }
      );
    }

    // Configurar autenticación
    const auth = getGoogleAuth();
    await auth.authorize();
    const sheets = google.sheets({ version: 'v4', auth });

    // Usar configuración por defecto
    const spreadsheetId = GOOGLE_SHEETS_CONFIG.DEFAULT_SPREADSHEET_ID;
    const sheetName = GOOGLE_SHEETS_CONFIG.DEFAULT_SHEET_NAME;
    const range = GOOGLE_SHEETS_CONFIG.DEFAULT_RANGE || `${sheetName}!A:ZZ`; // Leer todas las columnas

    console.log(`Importación automática desde: ${spreadsheetId}, hoja: ${sheetName}`);

    // Leer datos del sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron datos en la hoja de cálculo' },
        { status: 404 }
      );
    }

    // La primera fila contiene los headers
    const headers = rows[0].map(h => String(h));
    const dataRows = rows.slice(1);

    console.log(`Headers detectados: ${headers.join(', ')}`);
    console.log(`Filas de datos: ${dataRows.length}`);

    // Mapeo automático de columnas
    const columnMapping = autoMapColumns(headers);
    const unmappedColumns = getUnmappedColumns(headers, columnMapping);

    console.log('Mapeo de columnas:', columnMapping);
    console.log('Columnas adicionales:', unmappedColumns);

    // Procesar cada fila y crear leads
    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
      leads: [] as unknown[],
      columnMapping,
      unmappedColumns,
      additionalFieldsFound: unmappedColumns.length > 0
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
        const { leadData, additionalData } = mapSheetRowToLead(row, headers, columnMapping, unmappedColumns);

        // Validar datos mínimos requeridos
        if (!leadData.firstName || !leadData.email) {
          results.errors.push(`Fila ${i + 2}: Faltan datos requeridos (nombre o email)`);
          results.skipped++;
          continue;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailStr = String(leadData.email);
        if (!emailRegex.test(emailStr)) {
          results.errors.push(`Fila ${i + 2}: Email inválido: ${emailStr}`);
          results.skipped++;
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

        // Preparar datos del lead (incluyendo campos adicionales en el mensaje si existen)
        let messageContent = leadData.message ? String(leadData.message) : '';
        
        // Agregar campos adicionales al mensaje si existen
        if (Object.keys(additionalData).length > 0) {
          const additionalInfo = Object.entries(additionalData)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
          
          if (additionalInfo) {
            messageContent = messageContent 
              ? `${messageContent}\n\n--- Información adicional ---\n${additionalInfo}`
              : `--- Información adicional ---\n${additionalInfo}`;
          }
        }

        const leadPayload = {
          firstName: String(leadData.firstName),
          lastName: String(leadData.lastName || ''),
          email: emailStr,
          phone: leadData.phone ? String(leadData.phone) : null,
          message: messageContent || null,
          carId,
          carMake: leadData.carMake ? String(leadData.carMake) : null,
          carModel: leadData.carModel ? String(leadData.carModel) : null,
          carYear: typeof leadData.carYear === 'number' ? leadData.carYear : null,
          carLicensePlate: leadData.carLicensePlate ? String(leadData.carLicensePlate) : null,
          carStockNumber: leadData.carStockNumber ? String(leadData.carStockNumber) : null,
          source: leadData.source ? String(leadData.source) : 'google_sheets_auto',
          medium: leadData.medium ? String(leadData.medium) : 'auto_import',
          campaign: leadData.campaign ? String(leadData.campaign) : 'sheets_auto_import',
          walcuStatus: 'pending'
        };

        let lead;
        if (existingLead) {
          // Solo actualizar si han pasado más de 24 horas desde la última actualización
          const lastUpdate = new Date(existingLead.updatedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff > 24) {
            lead = await prisma.lead.update({
              where: { id: existingLead.id },
              data: leadPayload
            });
            results.updated++;
          } else {
            results.skipped++;
            continue;
          }
        } else {
          // Crear nuevo lead
          lead = await prisma.lead.create({
            data: leadPayload
          });
          results.created++;
        }

        results.leads.push(lead);

      } catch (error) {
        console.error(`Error procesando fila ${i + 2}:`, error);
        results.errors.push(`Fila ${i + 2}: Error procesando datos - ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    console.log('Resultados de importación automática:', results);

    return NextResponse.json({
      success: true,
      message: `Importación automática completada. ${results.created} leads creados, ${results.updated} actualizados, ${results.skipped} omitidos`,
      data: {
        processed: results.processed,
        created: results.created,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors,
        totalLeads: results.leads.length,
        columnMapping: results.columnMapping,
        unmappedColumns: results.unmappedColumns,
        additionalFieldsFound: results.additionalFieldsFound,
        spreadsheetId,
        sheetName
      }
    });

  } catch (error: unknown) {
    console.error('Error en importación automática de Google Sheets:', error);
    
    let errorMessage = 'Error interno del servidor';
    let statusCode = 500;
    
    // Verificar si es un error de la API de Google
    const apiError = error as { response?: { status?: number } };
    if (apiError.response?.status) {
      // Errores específicos de la API de Google
      switch (apiError.response.status) {
        case 400:
          errorMessage = 'Solicitud inválida. Verifica la configuración de la hoja.';
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
          errorMessage = 'Hoja de cálculo no encontrada. Verifica la configuración.';
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
      if (error.message.includes('credenciales')) {
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

// Endpoint GET para verificar configuración
export async function GET() {
  try {
    const config = {
      hasDefaultSpreadsheet: !!GOOGLE_SHEETS_CONFIG.DEFAULT_SPREADSHEET_ID,
      defaultSheetName: GOOGLE_SHEETS_CONFIG.DEFAULT_SHEET_NAME,
      autoImportEnabled: GOOGLE_SHEETS_CONFIG.AUTO_IMPORT_ENABLED,
      autoImportInterval: GOOGLE_SHEETS_CONFIG.AUTO_IMPORT_INTERVAL,
      hasCredentials: !!(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY)
    };

    return NextResponse.json({
      success: true,
      data: config
    });
  } catch {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error obteniendo configuración' 
      },
      { status: 500 }
    );
  }
}
