"use client";
import { useState } from 'react';
import Link from 'next/link';

// Datos estáticos para evitar carga lenta de API
const POPULAR_MODELS = [
  'FIAT 500', 'Nissan Qashqai', 'BMW X3', 'Audi A4', 'Mercedes-Benz Clase C',
  'Volkswagen Golf', 'Ford Focus', 'Peugeot 308', 'Renault Clio', 'Seat Leon',
  'Kia Sportage', 'Hyundai Tucson', 'Toyota Corolla', 'Honda Civic', 'Mazda CX-5',
  'Opel Astra'
];

const POPULAR_BRANDS = [
  'BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Ford', 'Peugeot', 'Renault', 'FIAT',
  'Nissan', 'Toyota', 'Honda', 'Kia', 'Hyundai', 'Seat', 'Opel', 'Mazda'
];

const FEE_RANGES = [150, 200, 250, 300, 350, 400, 450, 500];

const PRICE_RANGES = [
  { label: 'Hasta 10.000 €', url: '/buscador?priceMax=10000' },
  { label: '10.000 € - 15.000 €', url: '/buscador?priceMin=10000&priceMax=15000' },
  { label: '15.000 € - 20.000 €', url: '/buscador?priceMin=15000&priceMax=20000' },
  { label: '20.000 € - 30.000 €', url: '/buscador?priceMin=20000&priceMax=30000' },
  { label: '30.000 € - 40.000 €', url: '/buscador?priceMin=30000&priceMax=40000' },
  { label: 'Más de 40.000 €', url: '/buscador?priceMin=40000' }
];

export default function QuickSearchSection() {
  const [activeTab, setActiveTab] = useState<'models' | 'brands' | 'fees' | 'prices'>('models');

  return (
    <section className="relative mx-auto my-0 mt-10 w-full max-w-[1390px] max-md:p-5">
      {/* Título */}
      <div className="text-4xl font-bold tracking-tighter text-blue-950 w-full max-md:text-3xl max-md:text-center max-sm:text-2xl">
        Formas de empezar a buscar
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-8 flex-wrap text-sm">
        <button onClick={() => setActiveTab('models')} className={activeTab === 'models' ? 'text-blue-700 font-bold' : 'text-neutral-600 font-bold'}>
          Modelos
        </button>
        <button onClick={() => setActiveTab('brands')} className={activeTab === 'brands' ? 'text-blue-700 font-bold' : 'text-neutral-600 font-bold'}>
          Marcas
        </button>
        <button onClick={() => setActiveTab('fees')} className={activeTab === 'fees' ? 'text-blue-700 font-bold' : 'text-neutral-600 font-bold'}>
          Cuotas
        </button>
        <button onClick={() => setActiveTab('prices')} className={activeTab === 'prices' ? 'text-blue-700 font-bold' : 'text-neutral-600 font-bold'}>
          Precios
        </button>
      </div>
      <div className="mt-3 w-full h-px bg-zinc-200"></div>

      {/* Contenido por pestaña */}
      <div className="mt-8">
        {activeTab === 'models' && (
          <div className="grid grid-cols-4 gap-x-8 gap-y-2 text-base text-neutral-600">
            {POPULAR_MODELS.map((model, idx) => (
              <div key={`model-${idx}`} className="leading-10">
                <Link href={`/buscador?makeAndModel=${encodeURIComponent(model)}`}>{model}</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="grid grid-cols-4 gap-x-8 gap-y-2 text-base text-neutral-600">
            {POPULAR_BRANDS.map((brand, idx) => (
              <div key={`brand-${idx}`} className="leading-10">
                <Link href={`/buscador?make=${encodeURIComponent(brand)}`}>{brand}</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base text-neutral-600">
            {FEE_RANGES.map((fee) => (
              <div key={`fee-${fee}`} className="leading-10">
                <Link href={`/buscador?feeMax=${fee}`}>{`Hasta ${fee} €/mes`}</Link>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'prices' && (
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-base text-neutral-600">
            {PRICE_RANGES.map((range, idx) => (
              <div key={`price-${idx}`} className="leading-10">
                <Link href={range.url}>{range.label}</Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA inferior */}
      <div className="mt-8">
        <Link href="/buscador" className="w-full flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium border px-6 py-3 rounded-3xl border-zinc-200 bg-transparent text-neutral-600 hover:bg-zinc-50">
          <span className="text-base font-bold">Ver más</span>
          <svg width="8" height="15" viewBox="0 0 8 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[14px] h-[14px] transform rotate-90"><path d="M3.64645 14.3536C3.84171 14.5488 4.15829 14.5488 4.35355 14.3536L7.53553 11.1716C7.7308 10.9763 7.7308 10.6597 7.53553 10.4645C7.34027 10.2692 7.02369 10.2692 6.82843 10.4645L4 13.2929L1.17157 10.4645C0.97631 10.2692 0.659728 10.2692 0.464466 10.4645C0.269203 10.6597 0.269203 10.9763 0.464466 11.1716L3.64645 14.3536ZM4 0L3.5 -2.18557e-08L3.5 14L4 14L4.5 14L4.5 2.18557e-08L4 0Z" fill="#7D7A7A"/></svg>
        </Link>
      </div>
    </section>
  );
}


