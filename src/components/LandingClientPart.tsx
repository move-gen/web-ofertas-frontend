"use client";
import { useState, useRef } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { AboutUsMask } from '@/components/ui/AboutUsMask';

const slides = [
  {
    id: 1,
    supertitle: 'Te guiamos en la compra de tu coche',
    title: 'Consigue tu coche ideal',
    description: 'Te llevamos de la mano en la importante decisión de comprar tu coche',
    cta: 'Ver Catálogo',
    video: '/graciosamirador.mp4'
  },
  {
    id: 2,
    supertitle: 'Viaja por nuestras islas ',
    title: 'Explora con nosotros',
    description: 'Te ayudamos a elegir el coche que mas se ajusta a tu estilo de vida y necesidades',
    cta: 'Ver Ofertas',
    video: '/islas-montaña.mp4'
  },
  {
    id: 3,
    supertitle: 'La mejor experiencia',
    title: 'Para los que más te importan',
    description: 'Te ayudamos a elegir ese coche seguro familair y cómodo para los tuyos',
    cta: 'Ver Módelos',
    video: '/nieta.mp4'
  },
  {
    id: 4,
    supertitle: 'Nuestro equipo te asesora',
    title: 'Te vas con las llaves ',
    description: ' Nuestro equipo con mas de 30 años de experiencia te lleva de la mano durante el proceso de manera que solo debe preocuparse por elegir qué coches le gusta mas',
    cta: 'Echa un vistazo',
    video: '/llaves.mp4'
  },
 
];

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { staggerChildren: 0.1, duration: 0.5 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

const statsData = [
    {
        value: '+25',
        title: 'AÑOS DE EXPERIENCIA',
        description: 'Más de dos décadas en el sector del automóvil en Canarias, ofreciendo confianza y un servicio excepcional.'
    },
    {
        value: '+110',
        title: 'PROFESIONALES',
        description: 'Un equipo especializado para guiarte en cada paso del proceso de compra y postventa.'
    },
    {
        value: '+1.500',
        title: 'VEHÍCULOS EN STOCK',
        description: 'Un amplio stock de las principales marcas, revisados y garantizados para asegurar su calidad y fiabilidad.'
    },
    {
        value: '4',
        title: 'ISLAS CON PRESENCIA',
        description: 'Contamos con concesionarios y centros de servicio en Gran Canaria, Tenerife, Fuerteventura y Lanzarote.'
    },
    {
        value: '100%',
        title: 'FINANCIACIÓN A MEDIDA',
        description: 'Ofrecemos opciones de financiación flexibles, incluso sin entrada, para facilitar la adquisición de tu nuevo vehículo.'
    },
    {
        value: '24/7',
        title: 'ATENCIÓN DIGITAL',
        description: 'Contacta con nosotros a través de chat, WhatsApp, email o teléfono para una comunicación directa y eficiente.'
    }
];

export default function LandingClientPart() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slideData = slides[currentSlide];

  const statsRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: statsRef,
    offset: ["start end", "end center"]
  });

  const backgroundColor = useTransform(scrollYProgress, [0.3, 0.5], ["#000000", "#FFFFFF"]);
  const textColor = useTransform(scrollYProgress, [0.3, 0.5], ["#FFFFFF", "#0f286a"]);
  const descriptionColor = useTransform(scrollYProgress, [0.3, 0.5], ["#a1a1aa", "#374151"]);

  return (
    <>
        <section className="relative h-screen w-full overflow-hidden">
          {/* Background Videos */}
          <AnimatePresence>
            <motion.video
              key={slideData.id}
              className="absolute top-0 left-0 h-full w-full object-cover"
              src={slideData.video}
              autoPlay
              loop
              muted
              playsInline
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8 } }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
            />
          </AnimatePresence>
          <div className="absolute top-0 left-0 h-full w-full bg-black/60" />
          
          {/* Content */}
          <div className="relative z-10 flex h-full items-center justify-center text-white">
            <div className="container mx-auto px-6 flex justify-between items-end h-full pb-24">
              {/* Left Side: Text Content */}
              <div className="max-w-xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={slideData.id}
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.p variants={textVariants} className="text-sm font-semibold uppercase tracking-widest text-gray-300">
                      {slideData.supertitle}
                    </motion.p>
                    <motion.h1 variants={textVariants} className="text-6xl md:text-8xl font-bold my-4">
                      {slideData.title}
                    </motion.h1>
                    <motion.p variants={textVariants} className="text-lg text-gray-200">
                      {slideData.description}
                    </motion.p>
                    <motion.button variants={textVariants} className="mt-8 border border-white rounded-full px-8 py-3 text-sm font-medium flex items-center gap-4 hover:bg-white hover:text-black transition-colors">
                      {slideData.cta}
                      <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Side: Navigation */}
              <div className="flex flex-col items-end space-y-6">
                <div className="text-sm">
                    <span>{String(currentSlide + 1).padStart(2, '0')}</span>
                    <span className="text-gray-400"> / {String(slides.length).padStart(2, '0')}</span>
                </div>
                <div className="relative h-px w-32 bg-white/20">
                  <motion.div 
                    className="absolute top-0 left-0 h-px bg-white"
                    initial={{ width: `${(1/slides.length) * 100}%`}}
                    animate={{ x: `${currentSlide * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={prevSlide} className="border border-white/30 rounded-full p-3 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button onClick={nextSlide} className="border border-white/30 rounded-full p-3 hover:bg-white/10 transition-colors">
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <AboutUsMask />

        {/* Stats Section with Scroll Animation */}
        <motion.section 
            ref={statsRef}
            style={{ backgroundColor }}
            className="py-24 sm:py-32"
        >
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
                    {statsData.map((stat, index) => (
                        <div key={index} className="relative pl-8 flex flex-col justify-between" style={{ minHeight: '300px' }}>
                            <div>
                                <motion.div className="absolute top-0 left-0 h-full w-px" style={{ backgroundColor: '#0f286a' }} />
                                <motion.p className="text-9xl font-thin tracking-tighter" style={{ color: textColor }}>{stat.value}</motion.p>
                                <motion.p className="mt-4 text-sm font-semibold uppercase tracking-widest" style={{ color: '#0f286a' }}>{stat.title}</motion.p>
                            </div>
                            <motion.p className="text-sm max-w-xs" style={{ color: descriptionColor }}>{stat.description}</motion.p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.section>
    </>
  );
}