import { ArrowUpRight } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-[#e0ff4e] min-h-screen flex flex-col justify-between p-8 md:p-16 rounded-b-3xl">
      <div className="flex-grow flex flex-col justify-center">
        <div className="max-w-4xl">
          <p className="text-sm font-medium text-black mb-4">CONTACTo</p>
          <h1 className="text-5xl md:text-7xl font-bold text-black leading-tight">
          Contacta con nosotros
          </h1>
          <div className="max-w-md">
        <p className="text-black text-base">
         Nuestros compañeros de cada departamento recibirán un correo con las peticiones de nuestros clientes y en el plazo de menos de 24 horas, intentaremos atender su petición.
        </p>
      </div>
          <button className="bg-black text-white px-8 py-4 rounded-full text-2xl font-bold flex items-center gap-4 mt-12 hover:bg-gray-800 transition-colors">
            sales interest
            <ArrowUpRight size={32} />
          </button>
        </div>
      </div>
     
    </div>
  );
}