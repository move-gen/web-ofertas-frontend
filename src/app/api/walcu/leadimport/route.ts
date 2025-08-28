import { NextRequest, NextResponse } from "next/server";
import { WalcuCRMService } from "@/services/walcu-crm";

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 API Route: POST /api/walcu/leadimport iniciado");
    
    const { firstName, lastName, email, phone, message, car } = await request.json();
    const walcuService = new WalcuCRMService();
    
    // Crear payload según el formato oficial de Walcu (JSONLead)
    const leadPayload = {
      payload: {
        client: {
          foreign_id: `@${Date.now()}`,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone: phone || undefined
        },
        sales_lead: {
          foreign_id: `lead_${Date.now()}`,
          inquiry: message,
          car: {
            make: car.make,
            model: car.model,
            year: car.year,
            license_plate: car.license_plate,
            stock_number: car.stock_number
          }
        },
        version: "1.0.0"
      }
    };
    
    console.log("📤 Enviando lead a Walcu CRM usando endpoint oficial:", {
      endpoint: "/leadimporttasks",
      payload: leadPayload
    });
    
    const response = await walcuService.api.post("/leadimporttasks", leadPayload);
    
    console.log("✅ Lead creado exitosamente usando endpoint oficial:", response.data);
    
    return NextResponse.json({
      success: true,
      message: "Lead creado exitosamente en Walcu CRM usando endpoint oficial",
      leadId: response.data._id,
      data: response.data
    });
    
  } catch (error) {
    console.error("💥 Error creando lead con endpoint oficial:", error);
    
    let errorMessage = "Error desconocido";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      if (error.message.includes("401")) {
        statusCode = 401;
        errorMessage = "Error de autenticación con Walcu CRM";
      } else if (error.message.includes("422")) {
        statusCode = 422;
        errorMessage = "Error de validación en Walcu CRM";
      } else if (error.message.includes("404")) {
        statusCode = 404;
        errorMessage = "Endpoint /leadimporttasks no encontrado en Walcu CRM";
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: statusCode });
  }
}
