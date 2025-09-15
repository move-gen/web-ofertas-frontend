import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';
import { GOOGLE_SHEETS_CONFIG, autoMapColumns, getUnmappedColumns } from '@/lib/google-sheets-config';

// Función para logging detallado
const logDebug = (message: string, data?: unknown) => {
  console.log(`[AUTO-IMPORT DEBUG] ${new Date().toISOString()} - ${message}`);
  if (data) {
    console.log(`[AUTO-IMPORT DATA]`, JSON.stringify(data, null, 2));
  }
};

const logError = (message: string, error?: unknown) => {
  console.error(`[AUTO-IMPORT ERROR] ${new Date().toISOString()} - ${message}`);
  if (error) {
    console.error(`[AUTO-IMPORT ERROR DETAILS]`, error);
  }
};

// Configuración de autenticación con Google Sheets
const getGoogleAuth = async () => {
  logDebug('Iniciando configuración de autenticación Google');
  
  // Verificar si tenemos credenciales en Base64 (método preferido)
  if (process.env.GOOGLE_CREDENTIALS_BASE64) {
    logDebug('Usando credenciales Base64 (método recomendado)');
    
    try {
      // Decodificar las credenciales Base64
      const credentialsJson = Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, 'base64').toString('utf-8');
      const credentials = JSON.parse(credentialsJson);
      
      logDebug('Credenciales Base64 decodificadas exitosamente', {
        type: credentials.type,
        client_email: credentials.client_email,
        project_id: credentials.project_id
      });
      
      // Usar GoogleAuth con las credenciales completas
      const googleAuth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
      });
      
      const authClient = await googleAuth.getClient();
      logDebug('Autenticación con credenciales Base64 exitosa');
      return authClient;
      
    } catch (base64Error) {
      logError('Error procesando credenciales Base64', base64Error);
      // Continuar con el método alternativo
    }
  }
  
  // Método alternativo: usar email y clave privada separados
  logDebug('Usando método alternativo con email y clave privada separados');
  
  // Validar que las variables de entorno existan
  logDebug('Verificando variables de entorno', {
    hasEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
    emailValue: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? 'SET' : 'NOT_SET',
    privateKeyLength: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.length : 0
  });
  
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    logError('Faltan credenciales de Google Sheets');
    throw new Error('Faltan credenciales de Google Sheets. Verifica GOOGLE_CREDENTIALS_BASE64 o GOOGLE_SERVICE_ACCOUNT_EMAIL y GOOGLE_PRIVATE_KEY en las variables de entorno.');
  }

  // Procesar la clave privada más cuidadosamente
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    .replace(/\\n/g, '\n')
    .replace(/"/g, '')  // Remover comillas si las hay
    .trim();
    
  logDebug('Clave privada procesada', {
    keyStartsWith: privateKey.substring(0, 50),
    keyEndsWith: privateKey.substring(privateKey.length - 50),
    keyLength: privateKey.length,
    hasBeginMarker: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
    hasEndMarker: privateKey.includes('-----END PRIVATE KEY-----')
  });

  try {
    // Método 1: Intentar con JWT directo
    logDebug('Intentando autenticación con JWT directo');
    const jwtAuth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    await jwtAuth.authorize();
    logDebug('Autenticación JWT exitosa');
    return jwtAuth;
    
  } catch (jwtError) {
    logError('Error con JWT directo, intentando GoogleAuth', jwtError);
    
    // Método 2: Usar GoogleAuth como alternativa
    const googleAuth = new google.auth.GoogleAuth({
      credentials: {
        type: 'service_account',
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
    });
    
    const authClient = await googleAuth.getClient();
    logDebug('Autenticación GoogleAuth exitosa');
    return authClient;
  }
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
  logDebug('=== INICIANDO IMPORTACIÓN AUTOMÁTICA ===');
  
  try {
    // Verificar configuración inicial
    logDebug('Verificando configuración inicial', {
      config: GOOGLE_SHEETS_CONFIG
    });
    
    // Verificar si hay configuración por defecto
    if (!GOOGLE_SHEETS_CONFIG.DEFAULT_SPREADSHEET_ID) {
      logError('No hay spreadsheet ID configurado');
      return NextResponse.json(
        { 
          error: 'No hay hoja de cálculo configurada por defecto. Configura GOOGLE_SHEETS_DEFAULT_SPREADSHEET_ID en las variables de entorno.',
          requiresManualConfig: true
        },
        { status: 400 }
      );
    }

    // Configurar autenticación
    logDebug('Configurando autenticación');
    const auth = await getGoogleAuth();
    logDebug('Autenticación completada exitosamente');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sheets = google.sheets({ version: 'v4', auth: auth as any });
    logDebug('Cliente Google Sheets creado');

    // Usar configuración por defecto
    const spreadsheetId = GOOGLE_SHEETS_CONFIG.DEFAULT_SPREADSHEET_ID;
    const sheetName = GOOGLE_SHEETS_CONFIG.DEFAULT_SHEET_NAME;
    const range = GOOGLE_SHEETS_CONFIG.DEFAULT_RANGE || `${sheetName}!A:ZZ`; // Leer todas las columnas

    logDebug('Configuración de importación', {
      spreadsheetId,
      sheetName,
      range
    });

    // Leer datos del sheet
    logDebug('Realizando petición a Google Sheets API');
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
    });

    logDebug('Respuesta recibida de Google Sheets API', {
      hasData: !!response.data,
      hasValues: !!response.data.values,
      valuesLength: response.data.values?.length || 0
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      logError('No se encontraron datos en la hoja de cálculo');
      return NextResponse.json(
        { error: 'No se encontraron datos en la hoja de cálculo' },
        { status: 404 }
      );
    }

    // La primera fila contiene los headers
    const headers = rows[0].map(h => String(h));
    const dataRows = rows.slice(1);

    logDebug('Datos extraídos del sheet', {
      headers,
      totalRows: rows.length,
      dataRowsCount: dataRows.length,
      firstDataRow: dataRows[0] || null
    });

    // Mapeo automático de columnas
    logDebug('Iniciando mapeo automático de columnas');
    const columnMapping = autoMapColumns(headers);
    const unmappedColumns = getUnmappedColumns(headers, columnMapping);

    logDebug('Mapeo de columnas completado', {
      columnMapping,
      unmappedColumns,
      mappedCount: Object.keys(columnMapping).length,
      unmappedCount: unmappedColumns.length
    });

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

    logDebug('Iniciando procesamiento de filas', {
      totalDataRows: dataRows.length
    });

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      
      logDebug(`Procesando fila ${i + 1}/${dataRows.length}`, {
        rowIndex: i,
        rowData: row,
        isEmpty: !row || row.every(cell => !cell || String(cell).trim() === '')
      });
      
      // Saltar filas completamente vacías
      if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
        logDebug(`Saltando fila ${i + 2} (vacía)`);
        continue;
      }
      
      results.processed++;

      try {
        // Mapear datos de la fila
        logDebug(`Mapeando datos de fila ${i + 2}`);
        const { leadData, additionalData } = mapSheetRowToLead(row, headers, columnMapping, unmappedColumns);

        logDebug(`Datos mapeados para fila ${i + 2}`, {
          leadData,
          additionalData
        });

        // Extraer datos de forma flexible
        // Si no hay firstName, intentar extraer de full_name o usar valor por defecto
        if (!leadData.firstName && additionalData.full_name) {
          const fullName = String(additionalData.full_name).trim();
          const nameParts = fullName.split(' ');
          leadData.firstName = nameParts[0] || '';
          leadData.lastName = nameParts.slice(1).join(' ') || '';
          logDebug(`Extrayendo nombre de full_name: ${fullName} -> ${leadData.firstName} ${leadData.lastName}`);
        }

        // Valores por defecto para campos obligatorios
        if (!leadData.firstName) {
          leadData.firstName = 'Cliente';
        }
        
        if (!leadData.email) {
          // Generar un email temporal basado en la fila
          leadData.email = `lead_fila_${i + 2}_${Date.now()}@temp.local`;
          logDebug(`Generando email temporal para fila ${i + 2}: ${leadData.email}`);
        }

        // Validar formato de email solo si parece ser un email real
        const emailStr = String(leadData.email);
        if (!emailStr.includes('@temp.local')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailStr)) {
            // Si el email es inválido, generar uno temporal pero mantener el original en el mensaje
            const originalEmail = emailStr;
            leadData.email = `lead_fila_${i + 2}_${Date.now()}@temp.local`;
            leadData.message = leadData.message ? 
              `${leadData.message} | Email original: ${originalEmail}` : 
              `Email original: ${originalEmail}`;
            logDebug(`Email inválido convertido a temporal para fila ${i + 2}: ${originalEmail} -> ${leadData.email}`);
          }
        }

        // Buscar si ya existe un lead con este email
        logDebug(`Buscando lead existente con email: ${emailStr}`);
        const existingLead = await prisma.lead.findFirst({
          where: { email: emailStr }
        });
        
        logDebug(`Resultado búsqueda lead existente`, {
          found: !!existingLead,
          leadId: existingLead?.id || null
        });

        // Intentar encontrar el coche relacionado si se proporciona SKU
        let carId = null;
        if (leadData.carStockNumber) {
          logDebug(`Buscando coche con SKU: ${leadData.carStockNumber}`);
          const car = await prisma.car.findFirst({
            where: { sku: String(leadData.carStockNumber) }
          });
          if (car) {
            carId = car.id;
            logDebug(`Coche encontrado`, { carId, carSku: car.sku });
          } else {
            logDebug(`No se encontró coche con SKU: ${leadData.carStockNumber}`);
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

        logDebug(`Preparando payload del lead para fila ${i + 2}`, {
          leadPayload
        });

        let lead;
        if (existingLead) {
          // Solo actualizar si han pasado más de 24 horas desde la última actualización
          const lastUpdate = new Date(existingLead.updatedAt);
          const now = new Date();
          const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
          
          logDebug(`Lead existente - verificando si actualizar`, {
            lastUpdate: lastUpdate.toISOString(),
            now: now.toISOString(),
            hoursDiff,
            shouldUpdate: hoursDiff > 24
          });
          
          if (hoursDiff > 24) {
            logDebug(`Actualizando lead existente: ${existingLead.id}`);
            lead = await prisma.lead.update({
              where: { id: existingLead.id },
              data: leadPayload
            });
            results.updated++;
            logDebug(`Lead actualizado exitosamente: ${lead.id}`);
          } else {
            logDebug(`Saltando lead (actualizado recientemente): ${existingLead.id}`);
            results.skipped++;
            continue;
          }
        } else {
          // Crear nuevo lead
          logDebug(`Creando nuevo lead`);
          lead = await prisma.lead.create({
            data: leadPayload
          });
          results.created++;
          logDebug(`Lead creado exitosamente: ${lead.id}`);
        }

        results.leads.push(lead);

        // Enviar automáticamente a Walcu como lead de adquisición/tasación
        try {
          logDebug(`Enviando lead ${lead.id} a Walcu como tasación`);
          
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
          
          // Añadir campos adicionales al mensaje
          if (Object.keys(additionalData).length > 0) {
            const additionalInfo = Object.entries(additionalData)
              .filter(([, value]) => value)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ');
            
            if (additionalInfo) {
              fullMessage += ` | Información adicional: ${additionalInfo}`;
            }
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
              medium: leadData.medium ? String(leadData.medium) : 'auto_import',
              campaign: leadData.campaign ? String(leadData.campaign) : 'acquisition_import'
            })
          });

          if (walcuResponse.ok) {
            const walcuResult = await walcuResponse.json();
            logDebug(`Lead ${lead.id} enviado exitosamente a Walcu`, { walcuId: walcuResult.data?._id });
            
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
            logError(`Error enviando lead ${lead.id} a Walcu`, { status: walcuResponse.status, error: walcuError });
            
            await prisma.lead.update({
              where: { id: lead.id },
              data: { 
                walcuStatus: 'failed',
                walcuError: `HTTP ${walcuResponse.status}: ${walcuError}`
              }
            });
          }
        } catch (walcuError) {
          logError(`Error enviando lead ${lead.id} a Walcu`, walcuError);
          
          await prisma.lead.update({
            where: { id: lead.id },
            data: { 
              walcuStatus: 'failed',
              walcuError: walcuError instanceof Error ? walcuError.message : 'Error desconocido'
            }
          });
        }

      } catch (error) {
        logError(`Error procesando fila ${i + 2}`, error);
        results.errors.push(`Fila ${i + 2}: Error procesando datos - ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }

    logDebug('=== IMPORTACIÓN COMPLETADA ===', {
      results: {
        processed: results.processed,
        created: results.created,
        updated: results.updated,
        skipped: results.skipped,
        errorsCount: results.errors.length,
        totalLeads: results.leads.length
      }
    });

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
    logError('=== ERROR CRÍTICO EN IMPORTACIÓN AUTOMÁTICA ===', error);
    
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
