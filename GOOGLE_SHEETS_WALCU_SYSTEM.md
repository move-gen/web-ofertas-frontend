# Sistema de Integración Google Sheets → Walcu CRM

## 📋 Descripción General

Este sistema automatiza la importación de leads desde Google Sheets y su envío automático a Walcu CRM como leads de **tasación/appraisal** (clientes que quieren vender su coche).

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **Google Sheets API Integration** (`src/lib/google-sheets-config.ts`)
2. **Auto Import API** (`src/app/api/admin/leads/auto-import/route.ts`)
3. **Manual Import API** (`src/app/api/admin/leads/import-sheets/route.ts`)
4. **Walcu CRM Service** (`src/services/walcu-crm.ts`)
5. **Payload Builder** (`src/lib/walcu-payload-builder.ts`)
6. **Admin Interface** (`src/app/admin/leads/page.tsx`)

## 🔄 Flujo de Datos

```
Google Sheets → Auto Import → Database → Walcu CRM
     ↓              ↓           ↓          ↓
  Formularios   Procesamiento  Leads    Tasaciones
   Facebook/IG   Multi-hoja   Storage   Automáticas
```

## 📊 Tipos de Leads

### 🔵 Sales Leads (Ventas)
- **Origen**: Formularios web, contacto directo
- **Objetivo**: Cliente quiere **comprar** un coche
- **Walcu Endpoint**: `sales_lead`

### 🟠 Appraisal Leads (Tasaciones)
- **Origen**: Google Sheets (Facebook/Instagram forms)
- **Objetivo**: Cliente quiere **vender/tasar** su coche
- **Walcu Endpoint**: `appraisal_lead`

## 🗂️ Estructura de Google Sheets

### Columnas Mapeadas Automáticamente

| Campo Excel | Campo Sistema | Descripción |
|-------------|---------------|-------------|
| `id` | `leadId` | ID único del lead de Facebook |
| `created_time` | `createdTime` | Fecha de creación (filtro por hoy) |
| `full_name` | Extraído a `firstName` + `lastName` | ✅ Nombre completo del cliente |
| `email` | `email` | Email del cliente (obligatorio) |
| `phone_number` | `phone` | ✅ Teléfono (formato p:+34...) |
| `marca_y_modelo` | `carMake` + `carModel` | ✅ Vehículo de interés |
| `platform` | `source` | Plataforma (fb/ig → facebook/instagram) |
| `campaign_id` | `campaignId` | ID de la campaña |
| `campaign_name` | `campaign` | ✅ Nombre de la campaña |
| `ad_id` | `adId` | ID del anuncio |
| `ad_name` | `adName` | ✅ Nombre del anuncio |
| `adset_id` | `adsetId` | ID del conjunto de anuncios |
| `adset_name` | `adsetName` | ✅ Nombre del conjunto de anuncios |
| `form_id` | `formId` | ID del formulario |
| `form_name` | `formName` | ✅ Nombre del formulario |
| `is_organic` | `isOrganic` | ✅ Si es tráfico orgánico o pagado |
| `lead_status` | `leadStatus` | Estado del lead (CREATED, etc.) |

### ✅ Procesamiento Específico de Facebook/Instagram

#### Limpieza de Datos de Test
- **Detecta y limpia** datos de prueba con formato `<test lead: dummy data for ...>`
- **Extrae nombres reales** de `full_name` automáticamente
- **Procesa teléfonos** con formato `p:+34123456789`

#### Extracción Inteligente de Nombres
```typescript
// Ejemplo: "Diego Armando Gorozabel Cedeño" → 
// firstName: "Diego"
// lastName: "Armando Gorozabel Cedeño"
```

#### Separación de Marca y Modelo
```typescript
// Ejemplo: "honda civic" → 
// carMake: "honda"
// carModel: "civic"

// Ejemplo: "Volvo XC90" → 
// carMake: "Volvo" 
// carModel: "XC90"
```

#### Mensaje Estructurado para Walcu
```
Lead de Facebook/Instagram:
Campaña: Nueva campaña de Clientes potenciales | 
Anuncio: Nuevo anuncio de Clientes potenciales | 
Formulario: Contacto Compra 3 | 
Vehículo de interés: Honda Civic | 
Plataforma: Facebook | 
Tipo: Publicidad pagada

--- Información técnica ---
ad_id: ag:120232641913670214
adset_id: as:120232641913660214
campaign_id: c:120231336285000214
```

## 🔧 Configuración Técnica

### Variables de Entorno Requeridas
```env
GOOGLE_CREDENTIALS_BASE64=<credentials_en_base64>
WALCU_API_URL=<url_del_api_walcu>
WALCU_API_KEY=<api_key_walcu>
```

### Autenticación Google Sheets
1. **Service Account**: Cuenta de servicio de Google Cloud
2. **Credenciales JSON**: Convertidas a Base64 para seguridad
3. **Permisos**: Acceso de lectura a las hojas compartidas

## 📡 APIs Disponibles

### 1. Auto Import (Automático)
- **Endpoint**: `POST /api/admin/leads/auto-import`
- **Función**: Importa automáticamente desde Google Sheets
- **Frecuencia**: Configurable (webhook o cron)
- **Filtros**: Solo leads de hoy para evitar duplicados

### 2. Manual Import (Manual)
- **Endpoint**: `POST /api/admin/leads/import-sheets`
- **Función**: Importación manual desde admin
- **Uso**: Importaciones puntuales o testing

### 3. Individual Send
- **Endpoint**: `POST /api/admin/leads/[id]/send-to-walcu`
- **Función**: Envía un lead específico a Walcu

### 4. Bulk Send
- **Endpoint**: `POST /api/admin/leads/bulk-send-to-walcu`
- **Función**: Envía múltiples leads seleccionados

## 🎯 Lógica de Procesamiento

### Detección de Tipo de Lead
```typescript
function determineLeadType(source?: string, sheetName?: string): LeadType {
  // Google Sheets leads = appraisal (tasación)
  if (sheetName || source === 'google_sheets_auto' || source === 'google_sheets') {
    return 'appraisal';
  }
  // Web form leads = sales (ventas)
  return 'sales';
}
```

### Construcción de Mensaje
```typescript
// Para leads de tasación (Google Sheets)
const message = `Cliente interesado en vender/tasar su vehículo. 
Mensaje: ${originalMessage}
Información adicional: ${additionalFields}`;

// Para leads de ventas (Web forms)
const message = `Cliente interesado en comprar un vehículo. 
Mensaje: ${originalMessage}`;
```

### Payload para Walcu CRM

#### Appraisal Lead (Tasación)
```json
{
  "payload": {
    "client": {
      "foreign_id": "@1234567890",
      "first_name": "Juan",
      "last_name": "Pérez",
      "email": "juan@email.com",
      "phone": "+34123456789"
    },
    "appraisal_lead": {
      "foreign_id": "lead_1234567890",
      "inquiry": "Cliente interesado en vender/tasar su vehículo...",
      "car": {
        "make": "BMW",
        "model": "X3",
        "year": 2020,
        "license_plate": "1234ABC",
        "stock_number": "BMW001"
      }
    },
    "version": "1.0.0"
  }
}
```

#### Sales Lead (Ventas)
```json
{
  "payload": {
    "client": { /* mismo formato */ },
    "sales_lead": {
      "foreign_id": "lead_1234567890",
      "inquiry": "Cliente interesado en comprar un vehículo...",
      "car": { /* mismo formato */ }
    },
    "version": "1.0.0"
  }
}
```

## 🔍 Gestión de Duplicados

### Identificación de Leads Existentes
- **Clave única**: Email del cliente
- **Actualización**: Siempre actualiza datos existentes
- **Estado Walcu**: Evita reenvío si `walcuStatus === 'sent'`

### Estados de Walcu
- `pending`: Pendiente de envío
- `sent`: Enviado exitosamente
- `failed`: Error en el envío

## 📅 Filtro por Fecha (✅ IMPLEMENTADO)

### ✅ Solución Implementada
- **Filtro automático** por fecha de hoy en auto-import
- **Campos soportados**: `created_time`, `created_at`, `date`, `fecha_creacion`
- **Formato flexible**: Acepta cualquier formato de fecha válido
- **Comparación por día**: Ignora la hora, solo compara YYYY-MM-DD

### Lógica del Filtro
```typescript
// Solo procesa leads creados HOY
const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const createdDate = new Date(createdTime).toISOString().split('T')[0];

if (createdDateStr !== todayStr) {
  // SALTAR - Lead no es de hoy
  results.skipped++;
  continue;
}
// PROCESAR - Lead es de hoy
```

### Beneficios
- ✅ **Evita duplicados** - No reprocesa leads antiguos
- ✅ **Optimiza rendimiento** - Solo procesa leads nuevos
- ✅ **Logs detallados** - Muestra qué leads se saltan y por qué
- ✅ **Fallback seguro** - Si no hay fecha, procesa el lead

## 🚀 Funcionalidades del Admin

### Panel de Leads (`/admin/leads`)
- **Vista de todos los leads** con filtros
- **Importación manual** desde Google Sheets
- **Envío individual** a Walcu
- **Envío masivo** de leads seleccionados
- **Estados de Walcu** visibles
- **Columna "Hoja de Origen"** para identificar fuente

### Importación Automática
- **Botón "Importar Automáticamente"**
- **Resultados detallados** por hoja
- **Contadores**: Creados, Actualizados, Omitidos
- **Logs de errores** para debugging

## 🔧 Configuración Multi-Hoja

### Detección Automática
- **Obtiene todas las hojas** del spreadsheet
- **Procesa cada hoja** individualmente
- **Atribuye `sheetName`** a cada lead
- **Maneja errores** por hoja independientemente

### Ejemplo de Configuración
```typescript
const GOOGLE_SHEETS_CONFIG = {
  SPREADSHEET_ID: '1C7rc08_Fty0L-sWucA0-kGXVbPnpOO92oRnfcNX8tQ4',
  COLUMN_MAPPINGS: {
    firstName: ['first_name', 'nombre', 'name'],
    lastName: ['last_name', 'apellido', 'surname'],
    fullName: ['full_name', 'nombre_completo', 'fullname'],
    email: ['email', 'correo', 'mail'],
    phone: ['phone', 'phone_number', 'telefono'],
    // ... más mappings
  }
};
```

## 🐛 Debugging y Logs

### Logs Disponibles
- **Auto Import**: Logs detallados en consola
- **Walcu Envío**: Payloads y respuestas
- **Errores**: Captura y almacenamiento de errores
- **Estados**: Tracking de estados de leads

### Comandos de Debug
```bash
# Ver logs en tiempo real
npm run dev

# Verificar conexión Google Sheets
node scripts/test-google-sheets.mjs

# Crear usuario admin
node scripts/create-user.mjs
```

## ✅ Cambios Recientes Implementados

### Filtro por Fecha de Hoy ✅
- ✅ **Implementado**: Filtro automático por `created_time === today`
- ✅ **Optimizado**: Solo procesa leads del día actual
- ✅ **Logs detallados**: Muestra qué leads se saltan por fecha

### Mapeo Mejorado de Campos ✅
- ✅ **full_name**: Extracción automática a firstName + lastName
- ✅ **phone_number**: Procesamiento del formato `p:+34...`
- ✅ **marca_y_modelo**: Separación automática en carMake + carModel
- ✅ **campaign_name**: Mapeo a campo campaign
- ✅ **Limpieza de datos**: Remoción de prefijos de test de Facebook

### Mensaje Estructurado para Walcu ✅
- ✅ **Información de campaña**: Campaña, anuncio, formulario
- ✅ **Datos del vehículo**: Marca y modelo de interés
- ✅ **Origen del lead**: Plataforma y tipo (orgánico/pagado)
- ✅ **Información técnica**: IDs de Facebook para tracking

## 🔄 Próximas Mejoras

### Webhooks en Tiempo Real 🔄
- Google Sheets → Webhook → Auto Import
- Importación inmediata al recibir nuevo lead
- Reducir latencia de procesamiento

### Dashboard de Métricas 📊
- Estadísticas de importación por día
- Tasas de éxito Walcu por campaña
- Análisis de rendimiento por plataforma

---

## 📞 Soporte

Para problemas o mejoras, revisar:
1. **Logs del servidor** (`npm run dev`)
2. **Estado de variables de entorno**
3. **Permisos de Google Sheets**
4. **Conectividad con Walcu API**
