import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CreditCard, Calculator, Info, AlertCircle, Building, Percent, Clock, Shield } from 'lucide-react';

export default function CondicionesFinanciacionPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <CreditCard className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Condiciones de Financiación
          </h1>
          <p className="text-lg text-gray-600">
            Ofertas y condiciones para el ejercicio 2025
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Financiación personalizada con las mejores entidades
          </p>
        </div>

        {/* Introducción */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Operador Autorizado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              Miguel León es un operador autorizado para ofrecer financiación por parte de las financieras 
              con las que tenemos acuerdos actualizados para el ejercicio del <strong>2025</strong>.
            </p>
            <p className="text-gray-700">
              Nosotros como operador procederemos a pasar las operaciones desde nuestro departamento financiero, 
              con los condicionantes de cada financiera con la que operamos, y son los que trasladaremos a nuestros clientes.
            </p>
          </CardContent>
        </Card>

        {/* Entidades financieras */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              Entidades Financieras Colaboradoras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 mb-4">
              Las financieras con las que tenemos acuerdos durante el año del 2025 son:
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-semibold text-blue-800">Santander Consumer Finance</h4>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-semibold text-green-800">BBVA Consumer Finance</h4>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <h4 className="font-semibold text-yellow-800">Caixa Bank Consumer</h4>
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <h4 className="font-semibold text-purple-800">Sofinco</h4>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h4 className="font-semibold text-orange-800">Cetelem</h4>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="font-semibold text-red-800">Confia</h4>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Condiciones de descuento */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-600" />
              Condiciones para Descuentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2">Requisito principal:</h4>
              <p className="text-green-800 text-sm">
                Para poder acogerse a los descuentos por precio de financiación debe de financiar el <strong>100%</strong> del precio financiado.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plazos mínimos */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Plazos Mínimos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Duración mínima:</h4>
              <p className="text-blue-800 text-sm">
                Los plazos mínimos estipulados con las financieras con las que operamos son de <strong>72 meses</strong>.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Tipos de interés 2025 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Tipos de Interés 2025
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 mb-4">
              Los tipos de interés ofertados en el año 2025 por parte de Miguel León en su Web 
              miguelleon.es/encuentratucoche serán los siguientes:
            </p>
            
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Vehículos hasta 6 años:</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-green-800">Hasta 10.000€</div>
                    <div className="text-2xl font-bold text-green-600">8,99%</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-green-800">De 10.000€ a 20.000€</div>
                    <div className="text-2xl font-bold text-green-600">7,99%</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-green-800">Más de 20.000€</div>
                    <div className="text-2xl font-bold text-green-600">6,99%</div>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Vehículos de más de 6 años:</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-yellow-800">Hasta 10.000€</div>
                    <div className="text-2xl font-bold text-yellow-600">9,99%</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-yellow-800">De 10.000€ a 20.000€</div>
                    <div className="text-2xl font-bold text-yellow-600">8,99%</div>
                  </div>
                  <div className="bg-white p-3 rounded border">
                    <div className="font-medium text-yellow-800">Más de 20.000€</div>
                    <div className="text-2xl font-bold text-yellow-600">7,99%</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cuotas ofertadas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Cuotas Ofertadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Características de las cuotas:</h4>
              <p className="text-blue-800 text-sm mb-3">
                Las cuotas ofertadas en los anuncios en la Web de miguelleon.es/encuentratucoche son al plazo máximo permitido 
                en función de la antigüedad del vehículo y con el seguro por parte de la financiera incluido en el precio de la cuota.
              </p>
              <p className="text-blue-800 text-sm">
                Cualquier cambio en el condicionante será evaluado por la financiera y por Miguel León S.L e informado al cliente 
                en el transcurso de la oferta comercial.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Condicionantes de las financieras */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Condicionantes de las Financieras
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">Requisitos obligatorios:</h4>
              <p className="text-orange-800 text-sm">
                Las financieras imponen una serie de condicionantes a la firma que el cliente deberá de valorar y aceptar, 
                con respecto a tipos de interés, plazos, seguros, etc.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Información Adicional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Seguro incluido:</h4>
                <p className="text-green-800 text-sm">
                  El seguro por parte de la financiera está incluido en el precio de la cuota, 
                  proporcionando mayor tranquilidad al cliente.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Evaluación personalizada:</h4>
                <p className="text-blue-800 text-sm">
                  Cada solicitud de financiación es evaluada de forma personalizada, 
                  considerando el perfil del cliente y las características del vehículo.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Asesoramiento especializado:</h4>
                <p className="text-yellow-800 text-sm">
                  Nuestro departamento financiero le asesorará sobre la mejor opción 
                  disponible según sus necesidades y perfil.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enlaces relacionados */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              Información Relacionada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Proceso de Compra-Tasación</h4>
                <p className="text-green-800 text-sm mb-3">
                  Información sobre cómo vendemos tu vehículo.
                </p>
                <a href="/proceso-compra-tasacion" className="text-blue-600 hover:underline font-medium">
                  Ver proceso →
                </a>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Reserva de Vehículo</h4>
                <p className="text-blue-800 text-sm mb-3">
                  Servicio de reserva con garantía legal.
                </p>
                <a href="/reserva-vehiculo" className="text-blue-600 hover:underline font-medium">
                  Ver servicio →
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Para más información sobre financiación, 
            contacta con nuestro departamento financiero en info@miguelleon.es
          </p>
          <p className="mt-2">
            Las condiciones de financiación están sujetas a la aprobación de las entidades financieras.
          </p>
        </div>
      </div>
    </div>
  );
}
