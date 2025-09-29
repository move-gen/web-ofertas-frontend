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

// Función para obtener todas las hojas del spreadsheet
const getAllSheetsInfo = async (sheets: ReturnType<typeof google.sheets>, spreadsheetId: string) => {
  logDebug('Obteniendo información de todas las hojas del spreadsheet');
  
  try {
    const spreadsheetResponse = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties'
    });
    
    const allSheets = spreadsheetResponse.data.sheets?.map((sheet) => ({
      title: sheet.properties?.title || 'Sin nombre',
      sheetId: sheet.properties?.sheetId || 0,
      index: sheet.properties?.index || 0
    })) || [];
    
    logDebug('Hojas detectadas en el spreadsheet', { 
      totalSheets: allSheets.length,
      sheets: allSheets 
    });
    
    return allSheets;
  } catch (error) {
    logError('Error obteniendo información de las hojas', error);
    throw error;
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

// Función para procesar una hoja específica
const processSheet = async (
  sheets: ReturnType<typeof google.sheets>, 
  spreadsheetId: string, 
  sheetName: string, 
  results: {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    leads: unknown[];
    sheetsProcessed: string[];
    totalSheets: number;
  }
) => {
  logDebug(`=== PROCESANDO HOJA: ${sheetName} ===`);
  
  const range = `${sheetName}!A:ZZ`; // Leer todas las columnas de esta hoja
  
  try {
    // Leer datos de la hoja específica
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING'
    });

    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      logDebug(`Hoja ${sheetName} está vacía, saltando...`);
      return;
    }

    // La primera fila contiene los headers
    const headers = rows[0].map(h => String(h));
    const dataRows = rows.slice(1);

    logDebug(`Datos de hoja ${sheetName}`, {
      headers,
      totalRows: rows.length,
      dataRowsCount: dataRows.length
    });

    // Mapeo automático de columnas para esta hoja
    const columnMapping = autoMapColumns(headers);
    const unmappedColumns = getUnmappedColumns(headers, columnMapping);

    logDebug(`Mapeo de columnas para hoja ${sheetName}`, {
      columnMapping,
      unmappedColumns
    });

    // Procesar cada fila de esta hoja
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

        // Procesar el lead (misma lógica que antes pero con sheetName específico)
        await processLeadData(leadData, additionalData, sheetName, results, i);

      } catch (error) {
        logError(`Error procesando fila ${i + 2} de hoja ${sheetName}`, error);
        results.errors.push(`Hoja ${sheetName}, Fila ${i + 2}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
    
  } catch (error) {
    logError(`Error procesando hoja ${sheetName}`, error);
    results.errors.push(`Error procesando hoja ${sheetName}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
};

// Función para procesar los datos de un lead individual
const processLeadData = async (
  leadData: Record<string, string | number | null>,
  additionalData: Record<string, string | number | null>,
  sheetName: string,
  results: {
    processed: number;
    created: number;
    updated: number;
    skipped: number;
    errors: string[];
    leads: unknown[];
    sheetsProcessed: string[];
    totalSheets: number;
  },
  rowIndex: number
) => {
  // Extraer datos de forma flexible
  // Priorizar full_name si está disponible y los nombres individuales no están completos
  if (additionalData.full_name || leadData.fullName) {
    const fullName = String(additionalData.full_name || leadData.fullName).trim();
    if (fullName && (!leadData.firstName || !leadData.lastName)) {
      const nameParts = fullName.split(' ').filter(part => part.trim());
      if (nameParts.length > 0) {
        leadData.firstName = nameParts[0];
        leadData.lastName = nameParts.slice(1).join(' ') || leadData.lastName || '';
      }
    }
  }

  // Mapear platform a source si no hay source definido
  if (!leadData.source && (additionalData.platform || leadData.platform)) {
    const platform = String(additionalData.platform || leadData.platform).toLowerCase();
    if (platform === 'fb' || platform === 'facebook') {
      leadData.source = 'facebook';
    } else if (platform === 'ig' || platform === 'instagram') {
      leadData.source = 'instagram';
    } else {
      leadData.source = platform;
    }
  }

  // Valores por defecto para campos obligatorios
  if (!leadData.firstName) {
    leadData.firstName = 'Cliente';
  }
  
  if (!leadData.email) {
    leadData.email = `lead_${sheetName}_fila_${rowIndex + 2}_${Date.now()}@temp.local`;
  }

  // Validar formato de email
  const emailStr = String(leadData.email);
  if (!emailStr.includes('@temp.local')) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailStr)) {
      const originalEmail = emailStr;
      leadData.email = `lead_${sheetName}_fila_${rowIndex + 2}_${Date.now()}@temp.local`;
      leadData.message = leadData.message ? 
        `${leadData.message} | Email original: ${originalEmail}` : 
        `Email original: ${originalEmail}`;
    }
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
          sheetName: sheetName, // Nombre de la hoja de origen específica
          leadType: 'appraisal', // Leads de Google Sheets son tasaciones
          walcuStatus: 'pending'
        };

  let lead;
  if (existingLead) {
    // Siempre actualizar el lead existente con los nuevos datos
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

  // Verificar si el lead ya fue enviado exitosamente a Walcu
  const shouldSendToWalcu = lead.walcuStatus !== 'sent';
  
  if (!shouldSendToWalcu) {
    logDebug(`Lead ${lead.id} ya fue enviado exitosamente a Walcu (ID: ${lead.walcuLeadId}), omitiendo reenvío automático`);
    return; // No enviar automáticamente si ya fue enviado
  }

  logDebug(`Lead ${lead.id} será enviado a Walcu automáticamente (estado actual: ${lead.walcuStatus})`);

  // Enviar automáticamente a Walcu como lead de adquisición/tasación
  try {
    const { WalcuCRMService } = await import('@/services/walcu-crm');
    const walcuService = new WalcuCRMService();
    
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

            // Importar el servicio de construcción de payloads
            const { buildWalcuPayload, determineLeadType, formatLeadMessage } = await import('@/lib/walcu-payload-builder');
            
            // Determinar el tipo de lead (appraisal para Google Sheets)
            const leadType = determineLeadType(leadData.source ? String(leadData.source) : undefined, sheetName);
            
            // Preparar datos del cliente
            const clientData = {
              foreign_id: `@${Date.now()}`,
              first_name: String(leadData.firstName),
              last_name: String(leadData.lastName || ''),
              email: String(leadData.email),
              phone: leadData.phone ? String(leadData.phone) : undefined
            };
            
            // Preparar datos del lead
            const leadInfo = {
              foreign_id: `lead_${Date.now()}`,
              inquiry: formatLeadMessage(leadType, fullMessage),
              car: {
                make: carData.make,
                model: carData.model,
                year: carData.year,
                license_plate: carData.license_plate,
                stock_number: carData.stock_number
              }
            };
            
            // Crear payload según el tipo de lead
            const leadPayload = buildWalcuPayload(leadType, clientData, leadInfo);
            
            logDebug(`Enviando como ${leadType} lead desde hoja: ${sheetName}`);
    
    const walcuResponse = await walcuService.api.post("/leadimporttasks", leadPayload);
    
    // Actualizar el lead con el ID de Walcu
    await prisma.lead.update({
      where: { id: lead.id },
      data: { 
        walcuLeadId: walcuResponse.data._id || undefined,
        walcuStatus: 'sent'
      }
    });
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

    logDebug('Configuración de importación', {
      spreadsheetId
    });

    // Obtener todas las hojas del spreadsheet
    const allSheets = await getAllSheetsInfo(sheets, spreadsheetId);
    
    if (allSheets.length === 0) {
      logError('No se encontraron hojas en el spreadsheet');
      return NextResponse.json(
        { error: 'No se encontraron hojas en el spreadsheet' },
        { status: 404 }
      );
    }

    // Procesar todas las hojas automáticamente
    const results = {
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [] as string[],
      leads: [] as unknown[],
      sheetsProcessed: [] as string[],
      totalSheets: allSheets.length
    };

    logDebug(`Iniciando procesamiento de ${allSheets.length} hojas`, {
      sheets: allSheets.map(s => s.title)
    });

    // Procesar cada hoja del spreadsheet
    for (const sheet of allSheets) {
      logDebug(`=== PROCESANDO HOJA: ${sheet.title} ===`);
      
      try {
        await processSheet(sheets, spreadsheetId, sheet.title, results);
        results.sheetsProcessed.push(sheet.title);
        logDebug(`Hoja ${sheet.title} procesada exitosamente`);
      } catch (error) {
        logError(`Error procesando hoja ${sheet.title}`, error);
        results.errors.push(`Error en hoja ${sheet.title}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
      message: `Importación automática completada desde ${results.sheetsProcessed.length} hojas. ${results.created} leads creados, ${results.updated} actualizados, ${results.skipped} omitidos`,
      data: {
        processed: results.processed,
        created: results.created,
        updated: results.updated,
        skipped: results.skipped,
        errors: results.errors,
        totalLeads: results.leads.length,
        spreadsheetId,
        totalSheets: results.totalSheets,
        sheetsProcessed: results.sheetsProcessed,
        sheetsWithData: results.sheetsProcessed.length
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
