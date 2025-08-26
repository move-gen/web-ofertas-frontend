import { WalcuCRMService } from './walcu-crm';
import { 
  WalcuClient, 
  WalcuClientData, 
  WalcuContact, 
  WalcuAddress,
  WalcuBusinessDetails 
} from '@/types/walcu-crm';

export class WalcuClientService extends WalcuCRMService {
  
  /**
   * Crea un nuevo cliente en Walcu CRM
   */
  async createClient(clientData: WalcuClientData): Promise<WalcuClient> {
    try {
      // Preparar los datos del cliente
      const preparedData = this.prepareClientData(clientData);
      
      const response = await this.api.post('/clients', preparedData);
      console.log('Cliente creado exitosamente en Walcu CRM:', response.data._id);
      
      return response.data;
    } catch (error) {
      this.handleError('createClient', error);
    }
  }

  /**
   * Busca un cliente por email
   */
  async findClientByEmail(email: string): Promise<WalcuClient | null> {
    try {
      const response = await this.api.get('/clients', {
        params: {
          q: JSON.stringify({ "computed.client_emails": email }),
          limit: 1
        }
      });

      if (response.data && response.data.length > 0) {
        console.log('Cliente encontrado en Walcu CRM:', response.data[0]._id);
        return response.data[0];
      }

      return null;
    } catch (error) {
      console.error('Error buscando cliente por email:', error);
      return null;
    }
  }

  /**
   * Busca un cliente por teléfono
   */
  async findClientByPhone(phone: string): Promise<WalcuClient | null> {
    try {
      const response = await this.api.get('/clients', {
        params: {
          q: JSON.stringify({ "computed.client_phones": phone }),
          limit: 1
        }
      });

      if (response.data && response.data.length > 0) {
        console.log('Cliente encontrado por teléfono en Walcu CRM:', response.data[0]._id);
        return response.data[0];
      }

      return null;
    } catch (error) {
      console.error('Error buscando cliente por teléfono:', error);
      return null;
    }
  }

  /**
   * Actualiza un cliente existente
   */
  async updateClient(clientId: string, updateData: Partial<WalcuClientData>): Promise<WalcuClient> {
    try {
      const response = await this.api.patch(`/clients/${clientId}`, [
        {
          op: 'replace',
          path: '/contacts',
          value: updateData.contacts
        },
        {
          op: 'replace',
          path: '/primary_contact',
          value: updateData.primary_contact
        }
      ]);

      console.log('Cliente actualizado exitosamente en Walcu CRM:', clientId);
      return response.data;
    } catch (error) {
      this.handleError('updateClient', error);
    }
  }

  /**
   * Obtiene un cliente por ID
   */
  async getClientById(clientId: string): Promise<WalcuClient> {
    try {
      const response = await this.api.get(`/clients/${clientId}`);
      return response.data;
    } catch (error) {
      this.handleError('getClientById', error);
    }
  }

  /**
   * Crea o encuentra un cliente basado en la información proporcionada
   */
  async createOrFindClient(contactInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    address?: Partial<WalcuAddress>;
    businessDetails?: Partial<WalcuBusinessDetails>;
  }): Promise<WalcuClient> {
    try {
      // Primero intentar encontrar por email
      let existingClient = await this.findClientByEmail(contactInfo.email);
      
      if (existingClient) {
        console.log('Cliente existente encontrado, actualizando información...');
        
        // Actualizar información si es necesario
        const updatedClient = await this.updateClient(existingClient._id, {
          contacts: existingClient.contacts,
          primary_contact: existingClient.primary_contact,
          address: contactInfo.address || existingClient.address,
          business_details: contactInfo.businessDetails || existingClient.business_details
        });
        
        return updatedClient;
      }

      // Si no existe, crear uno nuevo
      console.log('Creando nuevo cliente en Walcu CRM...');
      
      const newClientData: WalcuClientData = {
        dealer_id: this.dealerId,
        created_by: 'system',
        contacts: [{
          name: {
            first_name: contactInfo.firstName,
            last_name: contactInfo.lastName,
            raw_name: `${contactInfo.firstName} ${contactInfo.lastName}`
          },
          phones: contactInfo.phone ? [contactInfo.phone] : [],
          emails: [contactInfo.email]
        }],
        primary_contact: {
          name: {
            first_name: contactInfo.firstName,
            last_name: contactInfo.lastName,
            raw_name: `${contactInfo.firstName} ${contactInfo.lastName}`
          },
          phones: contactInfo.phone ? [contactInfo.phone] : [],
          emails: [contactInfo.email]
        },
        address: contactInfo.address,
        business_details: contactInfo.businessDetails
      };

      return await this.createClient(newClientData);
    } catch (error) {
      this.handleError('createOrFindClient', error);
    }
  }

  /**
   * Prepara los datos del cliente para envío a Walcu CRM
   */
  private prepareClientData(clientData: WalcuClientData): WalcuClientData {
    // Asegurar que los campos requeridos estén presentes
    const preparedData = {
      ...clientData,
      dealer_id: this.dealerId,
      created_by: clientData.created_by || 'system',
      contacts: clientData.contacts.map(contact => ({
        ...contact,
        name: {
          ...contact.name,
          parsed: true
        }
      })),
      primary_contact: {
        ...clientData.primary_contact,
        name: {
          ...clientData.primary_contact.name,
          parsed: true
        }
      }
    };

    return preparedData;
  }

  /**
   * Valida que los datos del cliente sean correctos
   */
  private validateClientData(clientData: WalcuClientData): boolean {
    if (!clientData.contacts || clientData.contacts.length === 0) {
      throw new Error('El cliente debe tener al menos un contacto');
    }

    if (!clientData.primary_contact) {
      throw new Error('El cliente debe tener un contacto principal');
    }

    if (!clientData.primary_contact.name.first_name || !clientData.primary_contact.name.last_name) {
      throw new Error('El contacto principal debe tener nombre y apellido');
    }

    if (!clientData.primary_contact.emails || clientData.primary_contact.emails.length === 0) {
      throw new Error('El contacto principal debe tener al menos un email');
    }

    return true;
  }
}
