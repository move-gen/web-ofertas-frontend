import { WalcuCRMService } from './walcu-crm';
import { 
  WalcuSaleLead, 
  WalcuSaleLeadData, 
  WalcuAftersaleLead, 
  WalcuAftersaleLeadData,
  WalcuCar,
  WalcuCarListItem,
  WalcuFinance,
  WalcuAddress,
  WalcuBusinessDetails
} from '@/types/walcu-crm';

export class WalcuLeadService extends WalcuCRMService {
  
  /**
   * Crea un lead de venta en Walcu CRM
   */
  async createSaleLead(leadData: WalcuSaleLeadData): Promise<WalcuSaleLead> {
    try {
      console.log('🚀 WalcuLeadService: Iniciando creación de lead de venta...');
      console.log('📋 WalcuLeadService: Datos recibidos:', leadData);
      
      // Preparar los datos del lead
      const preparedData = this.prepareSaleLeadData(leadData);
      
      console.log('📤 WalcuLeadService: Enviando datos a Walcu CRM:', {
        endpoint: '/saleleads',
        data: preparedData,
        headers: this.api.defaults.headers
      });
      
      const response = await this.api.post('/saleleads', preparedData);
      console.log('✅ WalcuLeadService: Lead de venta creado exitosamente en Walcu CRM:', response.data._id);
      
      return response.data;
    } catch (error) {
      console.error('💥 WalcuLeadService: Error creando lead de venta:', error);
      this.handleError('createSaleLead', error as Error);
    }
  }

  /**
   * Crea un lead de postventa en Walcu CRM
   */
  async createAftersaleLead(leadData: WalcuAftersaleLeadData): Promise<WalcuAftersaleLead> {
    try {
      // Preparar los datos del lead
      const preparedData = this.prepareAftersaleLeadData(leadData);
      
      const response = await this.api.post('/aftersaleleads', preparedData);
      console.log('Lead de postventa creado exitosamente en Walcu CRM:', response.data._id);
      
      return response.data;
    } catch (error) {
      this.handleError('createAftersaleLead', error as Error);
    }
  }

  /**
   * Crea un lead de tasación en Walcu CRM
   */
  async createAppraisalLead(leadData: WalcuAftersaleLeadData): Promise<WalcuAftersaleLead> {
    try {
      // Los leads de tasación se crean como aftersale leads
      const preparedData = this.prepareAftersaleLeadData({
        ...leadData,
        type: 'appraisal'
      });
      
      const response = await this.api.post('/appraisalleads', preparedData);
      console.log('Lead de tasación creado exitosamente en Walcu CRM:', response.data._id);
      
      return response.data;
    } catch (error) {
      this.handleError('createAppraisalLead', error as Error);
    }
  }

  /**
   * Obtiene un lead por ID
   */
  async getLeadById(leadId: string, leadType: 'sale' | 'aftersale' | 'appraisal'): Promise<WalcuSaleLead | WalcuAftersaleLead> {
    try {
      let endpoint: string;
      
      switch (leadType) {
        case 'sale':
          endpoint = '/saleleads';
          break;
        case 'aftersale':
          endpoint = '/aftersaleleads';
          break;
        case 'appraisal':
          endpoint = '/appraisalleads';
          break;
        default:
          throw new Error('Tipo de lead no válido');
      }

      const response = await this.api.get(`${endpoint}/${leadId}`);
      return response.data;
    } catch (error) {
      this.handleError('getLeadById', error as Error);
    }
  }

  /**
   * Actualiza un lead existente
   */
  async updateLead(
    leadId: string, 
    leadType: 'sale' | 'aftersale' | 'appraisal', 
    updateData: Partial<WalcuSaleLeadData | WalcuAftersaleLeadData>
  ): Promise<WalcuSaleLead | WalcuAftersaleLead> {
    try {
      let endpoint: string;
      
      switch (leadType) {
        case 'sale':
          endpoint = '/saleleads';
          break;
        case 'aftersale':
          endpoint = '/aftersaleleads';
          break;
        case 'appraisal':
          endpoint = '/appraisalleads';
          break;
        default:
          throw new Error('Tipo de lead no válido');
      }

      const response = await this.api.patch(`${endpoint}/${leadId}`, [
        {
          op: 'replace',
          path: '/inquiry',
          value: updateData.inquiry
        },
        {
          op: 'replace',
          path: '/type',
          value: updateData.type
        }
      ]);

      console.log('Lead actualizado exitosamente en Walcu CRM:', leadId);
      return response.data;
    } catch (error) {
      this.handleError('updateLead', error as Error);
    }
  }

  /**
   * Crea un lead de interés en vehículo directamente sin crear cliente
   */
  async createCarInterestLeadDirect(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message: string;
    car: WalcuCar;
    address?: Partial<WalcuAddress>;
    businessDetails?: Partial<WalcuBusinessDetails>;
    source?: string;
    medium?: string;
    campaign?: string;
    finance?: WalcuFinance;
  }): Promise<WalcuSaleLead> {
    try {
      console.log('🚀 WalcuLeadService: Creando lead de interés en vehículo directamente...');
      console.log('📋 WalcuLeadService: Datos recibidos:', data);
      
      const carListItem: WalcuCarListItem = {
        car: data.car,
        car_id: data.car._id, // Mantener el ID original del coche
        quantity: 1
      };

      // Crear lead sin client_id - solo con la información del contacto
      const leadData: WalcuSaleLeadData = {
        dealer_id: this.dealerId,
        created_by: this.dealerId, // Usar dealer_id en lugar de "system"
        client_id: this.dealerId, // Usar dealer_id en lugar de "temp_client"
        inquiry: data.message,
        type: 'car_interest',
        location: 'website',
        origin: {
          source: data.source || 'website',
          medium: data.medium || 'car_page',
          campaign: data.campaign || 'car_interest'
        },
        car_list: [carListItem]
        // Remover finance y status para evitar errores de validación
      };

      console.log('📤 WalcuLeadService: Datos del lead preparados:', leadData);
      return await this.createSaleLead(leadData);
    } catch (error) {
      console.error('💥 WalcuLeadService: Error creando lead de interés directamente:', error);
      this.handleError('createCarInterestLeadDirect', error as Error);
    }
  }

  /**
   * Crea un lead de interés en vehículo
   */
  async createCarInterestLead(data: {
    clientId: string;
    car: WalcuCar;
    inquiry: string;
    source?: string;
    medium?: string;
    campaign?: string;
    finance?: WalcuFinance;
  }): Promise<WalcuSaleLead> {
    try {
      console.log('🚀 WalcuLeadService: Creando lead de interés en vehículo...');
      console.log('📋 WalcuLeadService: Datos recibidos:', data);
      
      const carListItem: WalcuCarListItem = {
        car: data.car,
        car_id: data.car._id,
        quantity: 1
      };

      const leadData: WalcuSaleLeadData = {
        dealer_id: this.dealerId,
        created_by: 'system',
        client_id: data.clientId, // REQUERIDO por la API de Walcu CRM
        inquiry: data.inquiry,
        type: 'car_interest',
        location: 'website',
        origin: {
          source: data.source || 'website',
          medium: data.medium || 'car_page',
          campaign: data.campaign || 'car_interest'
        },
        car_list: [carListItem],
        finance: data.finance
      };

      console.log('📤 WalcuLeadService: Datos del lead preparados:', leadData);
      return await this.createSaleLead(leadData);
    } catch (error) {
      console.error('💥 WalcuLeadService: Error creando lead de interés:', error);
      this.handleError('createCarInterestLead', error as Error);
    }
  }

  /**
   * Crea un lead de contacto general
   */
  async createContactLead(data: {
    clientId: string;
    inquiry: string;
    source?: string;
    medium?: string;
    campaign?: string;
  }): Promise<WalcuSaleLead> {
    try {
      const leadData: WalcuSaleLeadData = {
        dealer_id: this.dealerId,
        created_by: 'system',
        client_id: data.clientId,
        inquiry: data.inquiry,
        type: 'contact_form',
        location: 'website',
        origin: {
          source: data.source || 'website',
          medium: data.medium || 'contact_form',
          campaign: data.campaign || 'general_inquiry'
        },
        car_list: []
      };

      return await this.createSaleLead(leadData);
    } catch (error) {
      this.handleError('createContactLead', error as Error);
    }
  }

  /**
   * Crea un lead de tasación de vehículo
   */
  async createAppraisalRequestLead(data: {
    clientId: string;
    car: WalcuCar;
    inquiry: string;
    source?: string;
    medium?: string;
    campaign?: string;
  }): Promise<WalcuAftersaleLead> {
    try {
      const leadData: WalcuAftersaleLeadData = {
        dealer_id: this.dealerId,
        created_by: 'system',
        client_id: data.clientId,
        inquiry: data.inquiry,
        type: 'appraisal_request',
        location: 'website',
        origin: {
          source: data.source || 'website',
          medium: data.medium || 'appraisal_form',
          campaign: data.campaign || 'car_appraisal'
        },
        vehicle: [data.car]
      };

      return await this.createAftersaleLead(leadData);
    } catch (error) {
      this.handleError('createAppraisalRequestLead', error as Error);
    }
  }

  /**
   * Crea un lead de interés en vehículo con payload mínimo
   */
  async createCarInterestLeadMinimal(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    message: string;
    car: WalcuCar;
    source?: string;
    medium?: string;
    campaign?: string;
  }): Promise<WalcuAftersaleLead> {
    try {
      console.log('🚀 WalcuLeadService: Creando lead de interés en vehículo usando aftersaleleads...');
      console.log('📋 WalcuLeadService: Datos recibidos:', data);
      
      // PRIMERO: Crear un cliente real con los datos del formulario
      console.log('👤 WalcuLeadService: Creando cliente real antes del lead...');
      const clientData = {
        dealer_id: this.dealerId,
        contacts: [{
          name: {
            first_name: data.firstName,
            last_name: data.lastName,
            raw_name: `${data.firstName} ${data.lastName}`,
            parsed: true
          },
          phones: data.phone ? [data.phone] : [],
          emails: [data.email]
        }],
        primary_contact: {
          name: {
            first_name: data.firstName,
            last_name: data.lastName,
            raw_name: `${data.firstName} ${data.lastName}`,
            parsed: true
          },
          phones: data.phone ? [data.phone] : [],
          emails: [data.email]
        }
      };

      console.log('📤 WalcuLeadService: Creando cliente con datos:', clientData);
      const clientResponse = await this.api.post('/clients', clientData);
      const clientId = clientResponse.data._id;
      console.log('✅ WalcuLeadService: Cliente creado exitosamente:', clientId);
      
      // SEGUNDO: Crear el lead usando aftersaleleads con vehicle_id
      console.log('🎯 WalcuLeadService: Creando lead de aftersale con vehicle_id...');
      const leadData = {
        dealer_id: this.dealerId,
        client_id: clientId, // ID del cliente real creado
        vehicle_id: data.car._id?.toString() || data.car.stock_number || 'unknown', // ID del coche
        inquiry: data.message,
        type: 'car_interest',
        location: 'website',
        origin: {
          source: data.source || 'website',
          medium: data.medium || 'car_page',
          campaign: data.campaign || 'car_interest'
        }
      };

      console.log('📤 WalcuLeadService: Creando lead de aftersale con datos:', leadData);
      const leadResponse = await this.api.post('/aftersaleleads', leadData);
      console.log('✅ WalcuLeadService: Lead de aftersale creado exitosamente:', leadResponse.data._id);
      
      return leadResponse.data;
    } catch (error) {
      console.error('💥 WalcuLeadService: Error creando lead de interés mínimo:', error);
      this.handleError('createCarInterestLeadMinimal', error as Error);
    }
  }

  /**
   * Prepara los datos del lead de venta para envío a Walcu CRM
   */
  private prepareSaleLeadData(leadData: WalcuSaleLeadData): WalcuSaleLeadData {
    console.log('🔧 WalcuLeadService: Preparando datos del lead de venta...');
    console.log('📋 WalcuLeadService: Datos originales:', leadData);
    
    const preparedData = {
      ...leadData,
      dealer_id: this.dealerId,
      created_by: leadData.created_by || this.dealerId,
      // Asegurar que se envíen los campos requeridos por la API
      type: leadData.type || 'car_interest',
      location: leadData.location || 'website',
      inquiry: leadData.inquiry || 'Interés en vehículo',
      origin: {
        source: leadData.origin.source || 'website',
        medium: leadData.origin.medium || 'form',
        campaign: leadData.origin.campaign || 'general'
      },
      // Remover campos problemáticos como status
      car_list: leadData.car_list.map(carItem => ({
        ...carItem,
        car: {
          ...carItem.car,
          category: carItem.car.category || 'car',
          type: carItem.car.type || 'used'
        }
      }))
    };

    console.log('✅ WalcuLeadService: Datos preparados:', preparedData);
    return preparedData;
  }

  /**
   * Prepara los datos del lead de postventa para envío a Walcu CRM
   */
  private prepareAftersaleLeadData(leadData: WalcuAftersaleLeadData): WalcuAftersaleLeadData {
    const preparedData = {
      ...leadData,
      dealer_id: this.dealerId,
      created_by: leadData.created_by || 'system',
      origin: {
        source: leadData.origin.source || 'website',
        medium: leadData.origin.medium || 'form',
        campaign: leadData.origin.campaign || 'general'
      }
    };

    return preparedData;
  }

  /**
   * Valida que los datos del lead sean correctos
   */
  private validateLeadData(leadData: WalcuSaleLeadData | WalcuAftersaleLeadData): boolean {
    if (!leadData.client_id) {
      throw new Error('El lead debe tener un ID de cliente');
    }

    if (!leadData.inquiry || leadData.inquiry.trim().length === 0) {
      throw new Error('El lead debe tener una consulta');
    }

    if (!leadData.type) {
      throw new Error('El lead debe tener un tipo');
    }

    if (!leadData.origin || !leadData.origin.source || !leadData.origin.medium) {
      throw new Error('El lead debe tener información de origen completa');
    }

    return true;
  }
}
