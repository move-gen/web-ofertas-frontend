# Configuración de Cloudinary para Upload de Imágenes

## Variables de Entorno Requeridas

Añade estas variables a tu archivo `.env.local` y a Vercel:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
CLOUDINARY_UPLOAD_PRESET=banner_upload
```

## Pasos para Configurar Cloudinary

### 1. Crear cuenta en Cloudinary
- Ve a [cloudinary.com](https://cloudinary.com)
- Crea una cuenta gratuita
- Obtén tus credenciales del dashboard

### 2. Crear Upload Preset
- Ve a Settings > Upload
- Crea un nuevo preset llamado `banner_upload`
- Configura:
  - **Signing Mode**: Unsigned (para uploads desde frontend)
  - **Folder**: `banners`
  - **Allowed formats**: `jpg, png, gif, webp`
  - **Max file size**: `5MB`

### 3. Configurar en Vercel
- Ve a tu proyecto en Vercel
- Settings > Environment Variables
- Añade las 4 variables de entorno

## Funcionamiento

- **Desarrollo**: Las imágenes se guardan localmente en `public/uploads/banners/`
- **Producción**: Las imágenes se suben a Cloudinary automáticamente
- **Fallback**: Si Cloudinary no está configurado, usa base64 en la base de datos

## Ventajas de Cloudinary

- ✅ CDN global para carga rápida
- ✅ Optimización automática de imágenes
- ✅ Transformaciones on-the-fly
- ✅ Almacenamiento ilimitado (plan gratuito)
- ✅ URLs públicas seguras
