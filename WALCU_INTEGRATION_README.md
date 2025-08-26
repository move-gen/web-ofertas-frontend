# Integración con Walcu CRM

Esta documentación describe la implementación completa de la integración con Walcu CRM para la gestión automatizada de leads y clientes.

## 📋 Tabla de Contenidos

1. [Configuración](#configuración)
2. [Arquitectura](#arquitectura)
3. [Servicios](#servicios)
4. [API Routes](#api-routes)
5. [Hooks y Componentes](#hooks-y-componentes)
6. [Uso](#uso)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## ⚙️ Configuración

### Variables de Entorno Requeridas

```bash
# Variables del servidor (NO exponer en frontend)
WALCU_BASE_URL=https://api.crm.walcu.com
WALCU_DEALER_ID=tu_dealer_id
WALCU_APP_ID=tu_app_id
WALCU_SECRET_KEY=tu_secret_key

# Variables públicas (opcionales, solo para display)
NEXT_PUBLIC_WALCU_APP_NAME=Walcu CRM
NEXT_PUBLIC_WALCU_DEALER_ID=tu_dealer_id
```

### Instalación de Dependencias

```bash
npm install axios @types/node
```

## 🏗️ Arquitectura

La integración sigue una arquitectura en capas:

```
Frontend Components
       ↓
   useWalcuCRM Hook
       ↓
   API Routes
       ↓
   WalcuService
       ↓
   WalcuClientService + WalcuLeadService
       ↓
   WalcuCRMService (Base)
       ↓
   Walcu CRM API
```

### Estructura de Archivos

```
src/
├── services/
│   ├── walcu-crm.ts          # Servicio base
│   ├── walcu-client.ts       # Gestión de clientes
│   ├── walcu-lead.ts         # Gestión de leads
│   └── walcu-service.ts      # Servicio principal
├── types/
│   └── walcu-crm.ts          # Tipos e interfaces
├── hooks/
│   └── useWalcuCRM.ts        # Hook personalizado
├── app/api/walcu/
│   ├── clients/route.ts      # API de clientes
│   ├── leads/route.ts        # API de leads
│   └── forms/route.ts        # API de formularios
└── lib/
    └── walcu-config.ts       # Configuración
```

## 🔧 Servicios

### WalcuCRMService (Base)

Servicio base que maneja la configuración y comunicación HTTP con Walcu CRM.

**Características:**
- Configuración automática desde variables de entorno
- Interceptores para logging de requests/responses
- Manejo centralizado de errores
- Timeout configurable (10 segundos por defecto)

### WalcuClientService

Gestiona la creación, búsqueda y actualización de clientes.

**Métodos principales:**
- `createClient()` - Crea un nuevo cliente
- `findClientByEmail()` - Busca cliente por email
- `findClientByPhone()` - Busca cliente por teléfono
- `createOrFindClient()` - Crea o encuentra cliente existente

### WalcuLeadService

Gestiona la creación y gestión de leads de diferentes tipos.

**Tipos de leads soportados:**
- **Sale Leads** - Interés en compra de vehículos
- **Aftersale Leads** - Servicios postventa
- **Appraisal Leads** - Tasaciones de vehículos

**Métodos principales:**
- `createSaleLead()` - Crea lead de venta
- `createAftersaleLead()` - Crea lead de postventa
- `createAppraisalLead()` - Crea lead de tasación
- `createCarInterestLead()` - Crea lead de interés en vehículo específico

### WalcuService

Servicio principal que coordina la creación de clientes y leads.

**Métodos principales:**
- `processContactForm()` - Procesa formulario de contacto
- `processCarInterestForm()` - Procesa interés en vehículo
- `processAppraisalForm()` - Procesa solicitud de tasación
- `checkConnection()` - Verifica conectividad
- `getIntegrationStats()` - Obtiene estadísticas

## 🌐 API Routes

### `/api/walcu/clients`

**POST** - Crea un nuevo cliente
**GET** - Busca cliente por email o teléfono

### `/api/walcu/leads`

**POST** - Crea un nuevo lead (especificar tipo)
**GET** - Obtiene lead por ID y tipo

### `/api/walcu/forms`

**POST** - Procesa formularios completos
**GET** - Acciones del sistema (conexión, estadísticas)

## 🎣 Hooks y Componentes

### useWalcuCRM

Hook personalizado que proporciona acceso a todas las funcionalidades de Walcu CRM.

**Funcionalidades:**
- Estado de carga y errores
- Métodos para procesar formularios
- Verificación de conectividad
- Obtención de estadísticas

### WalcuTestComponent

Componente de prueba para verificar la integración.

**Características:**
- Botones para probar diferentes funcionalidades
- Visualización de resultados y errores
- Información de configuración
- Notas importantes de seguridad

## 📖 Uso

### 1. Procesar Formulario de Contacto

```typescript
import { useWalcuCRM } from '@/hooks/useWalcuCRM';

function ContactForm() {
  const { processContactForm, loading, error } = useWalcuCRM();

  const handleSubmit = async (formData: any) => {
    const result = await processContactForm({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      message: formData.message
    });

    if (result.success) {
      console.log('Lead enviado a Walcu CRM:', result.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar'}
      </button>
      {error && <div className="error">{error}</div>}
    </form>
  );
}
```

### 2. Procesar Interés en Vehículo

```typescript
const result = await processCarInterestForm({
  firstName: 'Juan',
  lastName: 'Pérez',
  email: 'juan@example.com',
  phone: '+34600000000',
  message: 'Me interesa este vehículo',
  car: {
    make: 'BMW',
    model: 'X3',
    year: 2022,
    price: 45000
  }
});
```

### 3. Verificar Conexión

```typescript
const { checkConnection } = useWalcuCRM();

const handleCheckConnection = async () => {
  const result = await checkConnection();
  if (result.success) {
    console.log('Conexión exitosa con Walcu CRM');
  } else {
    console.error('Error de conexión:', result.error);
  }
};
```

## 🧪 Testing

### 1. Componente de Prueba

Usa `WalcuTestComponent` para probar la integración:

```typescript
import WalcuTestComponent from '@/components/WalcuTestComponent';

export default function TestPage() {
  return <WalcuTestComponent />;
}
```

### 2. Pruebas de API

```bash
# Probar conexión
curl "http://localhost:3000/api/walcu/forms?action=connection"

# Probar formulario de contacto
curl -X POST "http://localhost:3000/api/walcu/forms" \
  -H "Content-Type: application/json" \
  -d '{
    "formType": "contact",
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

### 3. Verificación de Configuración

```typescript
import { validateWalcuConfig } from '@/lib/walcu-config';

const config = validateWalcuConfig();
console.log('Configuración válida:', config.isValid);
console.log('Variables faltantes:', config.missingVars);
```

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Error de Credenciales

**Síntoma:** `Missing required Walcu CRM environment variables`

**Solución:** Verificar que todas las variables de entorno estén configuradas:
- `WALCU_BASE_URL`
- `WALCU_DEALER_ID`
- `WALCU_APP_ID`
- `WALCU_SECRET_KEY`

#### 2. Error de Conexión

**Síntoma:** `Error de conexión con Walcu CRM`

**Solución:**
- Verificar que la URL base sea correcta
- Comprobar que el dealer ID sea válido
- Verificar que las credenciales sean correctas
- Comprobar conectividad de red

#### 3. Error de Formulario

**Síntoma:** `Error procesando formulario en Walcu CRM`

**Solución:**
- Verificar que todos los campos requeridos estén presentes
- Comprobar el formato de los datos
- Revisar logs del servidor para más detalles

### Logs y Debugging

La integración incluye logging detallado:

```typescript
// En consola del servidor
console.log('Walcu CRM Request: POST /clients');
console.log('Walcu CRM Response: 200 /clients');
console.log('Cliente creado exitosamente en Walcu CRM: 12345');
```

### Monitoreo

```typescript
// Obtener estadísticas de la integración
const stats = await getStats();
console.log('Estado de la integración:', stats.data.status);
console.log('Última sincronización:', stats.data.lastSync);
```

## 🚀 Próximos Pasos

### Mejoras Planificadas

1. **Métricas Avanzadas**
   - Contadores reales de clientes y leads
   - Tiempos de respuesta de la API
   - Tasa de éxito de envíos

2. **Retry Logic**
   - Reintentos automáticos en fallos
   - Cola de reintentos
   - Notificaciones de fallos

3. **Dashboard de Admin**
   - Vista de estadísticas en tiempo real
   - Logs de errores
   - Configuración de la integración

4. **Sincronización Bidireccional**
   - Actualización de leads desde Walcu CRM
   - Sincronización de estados
   - Webhooks para notificaciones

### Consideraciones de Seguridad

- ✅ Credenciales solo en servidor
- ✅ Validación de datos de entrada
- ✅ Manejo elegante de errores
- ✅ Timeouts para evitar bloqueos
- ✅ Logging sin información sensible

### Consideraciones de Performance

- ✅ Operaciones asíncronas
- ✅ Timeouts configurables
- ✅ Manejo de estados de carga
- ✅ Fallbacks en caso de error
- ✅ Logging optimizado

## 📞 Soporte

Para problemas o preguntas sobre la integración:

1. Revisar logs del servidor
2. Verificar configuración de variables de entorno
3. Usar el componente de prueba para diagnóstico
4. Consultar la documentación de Walcu CRM API

---

**Nota:** Esta integración está diseñada para ser robusta y no interrumpir la funcionalidad principal de la aplicación en caso de fallos en Walcu CRM.
