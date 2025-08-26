import axios, { AxiosInstance } from 'axios';

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

    // Interceptor para logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Walcu CRM Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Walcu CRM Request Error:', error);
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        console.log(`Walcu CRM Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('Walcu CRM Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  protected handleError(operation: string, error: any): never {
    const errorMessage = `Walcu CRM Error - ${operation}: ${error.response?.data?.message || error.message}`;
    console.error(errorMessage, {
      status: error.response?.status,
      data: error.response?.data,
      operation,
      timestamp: new Date().toISOString()
    });
    throw new Error(errorMessage);
  }
}
