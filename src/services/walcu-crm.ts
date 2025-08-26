import axios, { AxiosInstance, AxiosError } from 'axios';

export class WalcuCRMService {
  protected api: AxiosInstance;
  protected dealerId: string;
  protected baseUrl: string;
  protected appId: string;
  protected secretKey: string;

  constructor() {
    this.dealerId = process.env.WALCU_DEALER_ID!;
    this.baseUrl = process.env.WALCU_BASE_URL!;
    this.appId = process.env.WALCU_APP_ID!;
    this.secretKey = process.env.WALCU_SECRET_KEY!;

    if (!this.dealerId || !this.baseUrl || !this.appId || !this.secretKey) {
      throw new Error('Missing required Walcu CRM environment variables');
    }

    this.api = axios.create({
      baseURL: `${this.baseUrl}/dealers/${this.dealerId}`,
      headers: {
        'Content-Type': 'application/json',
        'X-App-ID': this.appId,
        'X-Secret-Key': this.secretKey,
      },
      timeout: 10000, // 10 segundos de timeout
    });

    // Request interceptor para logging
    this.api.interceptors.request.use(
      (config) => {
        console.log('🌐 WalcuCRMService: Request enviado:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers,
          data: config.data,
          timestamp: new Date().toISOString()
        });
        return config;
      },
      (error) => {
        console.error('❌ WalcuCRMService: Error en request interceptor:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor para logging
    this.api.interceptors.response.use(
      (response) => {
        console.log('✅ WalcuCRMService: Response recibido:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          method: response.config.method?.toUpperCase(),
          data: response.data,
          timestamp: new Date().toISOString()
        });
        return response;
      },
      (error) => {
        console.error('❌ WalcuCRMService: Error en response interceptor:', error);
        console.error('🔍 WalcuCRMService: Detalles del error:', {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method?.toUpperCase(),
          timestamp: new Date().toISOString()
        });
        return Promise.reject(error);
      }
    );
  }

  protected handleError(operation: string, error: AxiosError | Error): never {
    console.error('💥 WalcuCRMService: handleError llamado para operación:', operation);
    console.error('🔍 WalcuCRMService: Tipo de error:', typeof error);
    console.error('📝 WalcuCRMService: Mensaje de error:', error.message);
    
    if (error instanceof AxiosError) {
      console.error('🌐 WalcuCRMService: Error de Axios detectado:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        method: error.config?.method?.toUpperCase(),
        responseData: error.response?.data,
        requestData: error.config?.data,
        headers: error.config?.headers
      });
    } else {
      console.error('⚠️ WalcuCRMService: Error estándar (no Axios):', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    
    const errorMessage = `Walcu CRM Error - ${operation}: ${error instanceof AxiosError ? error.response?.data?.message || error.message : error.message}`;
    console.error('🚨 WalcuCRMService: Error final formateado:', errorMessage);
    
    console.error('📊 WalcuCRMService: Resumen del error:', {
      operation,
      timestamp: new Date().toISOString(),
      errorType: error instanceof AxiosError ? 'AxiosError' : 'Error',
      hasResponse: error instanceof AxiosError ? !!error.response : false,
      hasRequest: error instanceof AxiosError ? !!error.config : false
    });
    
    throw new Error(errorMessage);
  }
}
