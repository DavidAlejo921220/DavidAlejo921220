import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { 
  Truck, Shield, Zap, Users, MapPin, MessageCircle, 
  Clock, Star, DollarSign, Navigation, History, Phone,
  CheckCircle, ArrowRight, Package, Weight, FileText
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('clients');

  // SEO Keywords optimizadas
  const seoKeywords = [
    "grúa online",
    "grúas de carro",
    "grúas de moto",
    "grúas para salidas de patios",
    "grúas de patios",
    "grúas veinticuatro horas",
    "grúas 24 horas",
    "grúas por aplicación",
    "grúa ya",
    "grúas en Bogotá",
    "servicio de grúa Colombia",
    "transporte de vehículos",
    "grúas baratas",
    "grúas económicas"
  ];

  const services = [
    { icon: Truck, title: "Grúas de Carro", desc: "Servicio de grúas para carros varados, accidentados o sin batería en Bogotá y Colombia", alt: "grúas de carro en bogotá" },
    { icon: Package, title: "Grúas de Moto", desc: "Transporte seguro de motos con plataforma especializada. Grúas 24 horas", alt: "grúas de moto colombia" },
    { icon: Weight, title: "Grúas para Salidas de Patios", desc: "Recogemos tu vehículo en cualquier patio. Grúas de patios disponibles ya", alt: "grúas para salidas de patios" },
    { icon: FileText, title: "Carga Especial", desc: "Transporte de carga pesada con manifiesto y seguro incluido", alt: "transporte carga especial" }
  ];

  const clientFeatures = [
    {
      icon: Zap,
      title: 'Solicitud Rápida',
      description: 'Solicita tu grúa en segundos. Solo indica ubicación y destino.',
      benefit: 'Rapidez',
      mockup: {
        title: 'Solicitar Grúa',
        elements: ['Tipo de vehículo', 'Ubicación actual', 'Destino', 'Enviar solicitud']
      }
    },
    {
      icon: MapPin,
      title: 'Seguimiento GPS',
      description: 'Ve en tiempo real dónde está tu grúa mientras llega.',
      benefit: 'Seguimiento 24/7',
      mockup: {
        title: 'Tu grúa en camino',
        elements: ['Mapa en vivo', 'ETA: 12 min', 'Conductor: Juan', 'Placa: ABC-123']
      }
    },
    {
      icon: MessageCircle,
      title: 'Chat Directo',
      description: 'Comunícate con tu conductor sin salir de la app.',
      benefit: 'Comunicación directa',
      mockup: {
        title: 'Chat del Servicio',
        elements: ['Mensajes en tiempo real', 'Enviar ubicación', 'Llamar conductor']
      }
    },
    {
      icon: Shield,
      title: 'Pago Seguro',
      description: 'Compara ofertas y paga solo cuando aceptes.',
      benefit: 'Seguridad',
      mockup: {
        title: 'Ofertas Recibidas',
        elements: ['$85.000 - Juan ⭐4.9', '$92.000 - Pedro ⭐4.8', 'Aceptar oferta']
      }
    }
  ];

  const driverFeatures = [
    {
      icon: Navigation,
      title: 'Servicios Cercanos',
      description: 'Recibe solicitudes de clientes cerca de tu ubicación.',
      benefit: 'Más servicios',
      mockup: {
        title: 'Servicios Disponibles',
        elements: ['3 servicios cerca', 'A 2.5 km de ti', 'Ver detalles', 'Enviar oferta']
      }
    },
    {
      icon: MapPin,
      title: 'Mapa con Ruta',
      description: 'Navegación integrada hasta el punto de recogida.',
      benefit: 'Mejores tiempos',
      mockup: {
        title: 'Navegación',
        elements: ['Ruta optimizada', 'Punto de recogida', 'Destino final', 'Iniciar GPS']
      }
    },
    {
      icon: History,
      title: 'Historial de Ganancias',
      description: 'Consulta tus ingresos y estadísticas en tiempo real.',
      benefit: 'Control total',
      mockup: {
        title: 'Mis Ganancias',
        elements: ['Hoy: $250.000', 'Semana: $1.2M', '15 servicios', 'Ver detalle']
      }
    },
    {
      icon: MessageCircle,
      title: 'Chat con Cliente',
      description: 'Coordina detalles directamente con quien te contrata.',
      benefit: 'Comunicación fácil',
      mockup: {
        title: 'Chat',
        elements: ['Mensajes del cliente', 'Enviar ubicación', 'Confirmar llegada']
      }
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a1120] overflow-x-hidden">
      <Helmet>
        <title>Grúa Online 24 Horas | Grúas de Carro y Moto en Bogotá | GruaApp - Grúa Ya</title>
        <meta name="description" content="Grúa online #1 en Colombia. Grúas de carro, grúas de moto y grúas para salidas de patios. Servicio de grúas veinticuatro horas en Bogotá. Pide tu grúa por aplicación. ¡Grúa ya en minutos!" />
        <meta name="keywords" content="grúa online, grúas de carro, grúas de moto, grúas para salidas de patios, grúas de patios, grúas veinticuatro horas, grúas 24 horas, grúas por aplicación, grúa ya, grúas en Bogotá, servicio de grúa Colombia" />
        <link rel="canonical" href="https://gruaapp.com/" />
        <meta property="og:title" content="Grúa Online 24 Horas | Grúas de Carro y Moto | GruaApp" />
        <meta property="og:description" content="La app #1 de grúas en Colombia. Grúas de carro, moto y salidas de patios. Servicio 24 horas. ¡Pide tu grúa ya!" />
        <meta property="og:url" content="https://gruaapp.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      {/* H1 Principal SEO */}
      <h1 className="sr-only">Grúa Online en Bogotá y Colombia - Grúas de Carro, Grúas de Moto, Grúas para Salidas de Patios - Servicio 24 Horas</h1>
      
      {/* SEO Keywords - Hidden pero indexable */}
      <div className="sr-only">
        <h2>Servicio de Grúas Online en Bogotá</h2>
        <p>GruaApp es la plataforma líder de grúa online en Colombia. Ofrecemos grúas de carro y grúas de moto las 24 horas del día, los 7 días de la semana.</p>
        <h2>Grúas para Salidas de Patios</h2>
        <p>Especialistas en grúas para salidas de patios y grúas de patios. Recogemos tu vehículo en cualquier patio de Bogotá y Colombia.</p>
        <h2>Grúas Veinticuatro Horas</h2>
        <p>Servicio de grúas veinticuatro horas disponible en toda Colombia. Grúas 24 horas para emergencias vehiculares.</p>
        <h2>Grúas por Aplicación - Grúa Ya</h2>
        <p>Pide tu grúa por aplicación de manera fácil y rápida. Con GruaApp tienes tu grúa ya en minutos. La mejor app de grúas en Colombia.</p>
        <h2>Cobertura Nacional de Grúas</h2>
        <p>Grúas de carro en Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga. Servicio de grúas en todo el país.</p>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7200c4]/20 via-transparent to-[#00e0ff]/20" />
        
        <nav className="relative z-10 container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-3">
            <img 
              src="https://static.prod-images.emergentagent.com/jobs/4d6d68fe-1392-4b8b-95de-0896fbae6116/images/6dd94c30201b82c0db798c24c5f11f318e92f4633b0624b679a02b2944046c88.png" 
              alt="GruaApp - Grúa online 24 horas en Bogotá Colombia"
              className="h-10 sm:h-12"
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-slate-300 hover:text-[#00e0ff] text-sm sm:text-base px-2 sm:px-4"
              data-testid="nav-login-button"
            >
              Ingresar
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold text-sm sm:text-base px-3 sm:px-4"
              data-testid="nav-register-button"
            >
              Registrarse
            </Button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 sm:py-20 text-center">
          {/* H2 visible con keywords */}
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
            Grúa Online
            <span className="block text-[#00e0ff] mt-2 text-3xl sm:text-4xl md:text-5xl">¡Tu Grúa Ya en Minutos!</span>
          </h2>
          
          {/* Banner Cashback */}
          <div className="inline-block bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-full px-6 py-2 mb-6">
            <span className="text-green-400 font-bold">🎉 ¡5% CASHBACK en tu primer servicio de grúa!</span>
          </div>
          
          <p className="text-base sm:text-xl text-slate-300 mb-6 max-w-3xl mx-auto leading-relaxed px-4">
            <strong className="text-white">Grúas de carro y grúas de moto</strong> en Bogotá y toda Colombia. 
            Servicio de <strong className="text-[#00e0ff]">grúas 24 horas</strong>. Grúas para salidas de patios. 
            ¡Pide tu grúa por aplicación ahora!
          </p>

          {/* Servicios destacados con keywords */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-8">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                <service.icon className="h-6 w-6 text-[#00e0ff] mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">{service.title}</p>
                <p className="text-slate-400 text-xs">{service.desc}</p>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Button 
              size="lg"
              onClick={() => navigate('/register?role=client')}
              className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
              data-testid="hero-client-button"
            >
              <Truck className="mr-2 h-5 w-5" />
              Necesito una Grúa
            </Button>
            <Button 
              size="lg"
              onClick={() => navigate('/register?role=driver')}
              className="border-2 border-[#7200c4] text-[#7200c4] hover:bg-[#7200c4] hover:text-white font-bold uppercase tracking-wider px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
              data-testid="hero-driver-button"
            >
              <Users className="mr-2 h-5 w-5" />
              Soy Conductor
            </Button>
          </div>

          {/* Cobertura Nacional */}
          <p className="text-slate-400 text-sm mt-6">
            📍 Cobertura: Bogotá, Medellín, Cali, Barranquilla, Cartagena y todo Colombia
          </p>
        </div>
      </div>

      {/* App Features Section - Tabs */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            ¿Cómo funciona GruaApp?
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto px-4">
            La plataforma que conecta clientes con conductores de grúa verificados en Colombia
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8 sm:mb-12 px-4">
          <div className="bg-[#111827] p-1 rounded-xl flex w-full max-w-md">
            <button
              onClick={() => setActiveTab('clients')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-sm sm:text-base transition-all ${
                activeTab === 'clients'
                  ? 'bg-[#00e0ff] text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
              Para Clientes
            </button>
            <button
              onClick={() => setActiveTab('drivers')}
              className={`flex-1 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-bold text-sm sm:text-base transition-all ${
                activeTab === 'drivers'
                  ? 'bg-[#7200c4] text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Truck className="h-4 w-4 sm:h-5 sm:w-5 inline mr-2" />
              Para Conductores
            </button>
          </div>
        </div>

        {/* Features Grid with App Mockups */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-0">
          {(activeTab === 'clients' ? clientFeatures : driverFeatures).map((feature, index) => (
            <div 
              key={index}
              className={`rounded-xl border transition-all hover:scale-105 overflow-hidden ${
                activeTab === 'clients'
                  ? 'bg-[#111827] border-[#00e0ff]/20 hover:border-[#00e0ff]/50'
                  : 'bg-[#111827] border-[#7200c4]/20 hover:border-[#7200c4]/50'
              }`}
            >
              {/* Phone Mockup */}
              <div className={`p-3 ${activeTab === 'clients' ? 'bg-[#00e0ff]/5' : 'bg-[#7200c4]/5'}`}>
                <div className="bg-[#0a1120] rounded-xl p-3 border border-white/10">
                  {/* Phone header */}
                  <div className={`text-center py-2 rounded-t-lg mb-2 ${
                    activeTab === 'clients' ? 'bg-[#00e0ff]/10' : 'bg-[#7200c4]/10'
                  }`}>
                    <p className={`text-xs font-bold ${
                      activeTab === 'clients' ? 'text-[#00e0ff]' : 'text-[#7200c4]'
                    }`}>{feature.mockup.title}</p>
                  </div>
                  {/* Phone content */}
                  <div className="space-y-1.5">
                    {feature.mockup.elements.map((el, i) => (
                      <div key={i} className="bg-white/5 rounded px-2 py-1.5 text-xs text-slate-400 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          activeTab === 'clients' ? 'bg-[#00e0ff]' : 'bg-[#7200c4]'
                        }`}></div>
                        {el}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Feature info */}
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'clients' ? 'bg-[#00e0ff]/10' : 'bg-[#7200c4]/10'
                  }`}>
                    <feature.icon className={`h-5 w-5 ${
                      activeTab === 'clients' ? 'text-[#00e0ff]' : 'text-[#7200c4]'
                    }`} />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{feature.title}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-3">{feature.description}</p>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  activeTab === 'clients' ? 'text-[#00e0ff]' : 'text-[#7200c4]'
                }`}>
                  <CheckCircle className="h-3 w-3" />
                  {feature.benefit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA after tabs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-10 sm:mt-12 px-4">
          <Button 
            size="lg"
            onClick={() => navigate('/register?role=client')}
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
          >
            Solicita tu grúa ahora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg"
            onClick={() => navigate('/register?role=driver')}
            className="bg-[#7200c4] text-white hover:bg-[#8a2be2] font-bold px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
          >
            Únete como conductor
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-[#111827] py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="p-6 sm:p-8 rounded-xl bg-[#0a1120] border border-white/10" data-testid="feature-marketplace">
              <div className="bg-[#00e0ff]/10 w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 sm:h-8 sm:w-8 text-[#00e0ff]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Marketplace en Tiempo Real</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Publica tu solicitud y recibe múltiples ofertas de conductores cercanos. 
                Elige la que mejor se ajuste a tu presupuesto.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl bg-[#0a1120] border border-white/10" data-testid="feature-security">
              <div className="bg-[#7200c4]/10 w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-[#7200c4]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">100% Seguro</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Conductores verificados, sistema de calificaciones y soporte 24/7 
                para tu tranquilidad.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-xl bg-[#0a1120] border border-white/10" data-testid="feature-tracking">
              <div className="bg-[#00e0ff]/10 w-14 h-14 sm:w-16 sm:h-16 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-[#00e0ff]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Disponible 24/7</h3>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Servicio disponible las 24 horas, los 7 días de la semana. 
                Siempre hay un conductor listo para ayudarte.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-r from-[#00e0ff]/10 to-[#7200c4]/10 p-8 sm:p-12 rounded-2xl text-center border border-white/10">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Comienza Ahora
          </h2>
          <p className="text-base sm:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Únete a GruaApp, la plataforma #1 de asistencia vehicular en Bogotá.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider px-8 sm:px-12 py-5 sm:py-6 text-base sm:text-lg w-full sm:w-auto"
            data-testid="cta-register-button"
          >
            Registrarse Gratis
          </Button>
        </div>
      </section>

      {/* Footer SEO */}
      <footer className="bg-[#111827] border-t border-white/10 py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <img 
              src="https://static.prod-images.emergentagent.com/jobs/4d6d68fe-1392-4b8b-95de-0896fbae6116/images/6dd94c30201b82c0db798c24c5f11f318e92f4633b0624b679a02b2944046c88.png" 
              alt="GruaApp - Solicitar grúa online Bogotá"
              className="h-10 sm:h-12 mx-auto mb-4"
            />
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto mb-4 px-4">
              Prestamos servicio de grúas en Bogotá en zonas como Suba, Chapinero, Usaquén, Kennedy, 
              Engativá y toda la ciudad, con atención inmediata las 24 horas.
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <a href="/gruas-en-bogota" className="text-[#00e0ff] hover:underline">Grúas en Bogotá</a>
              <a href="/gruas-24-horas-bogota" className="text-[#00e0ff] hover:underline">Grúas 24 Horas</a>
              <a href="/gruas-baratas-bogota" className="text-[#00e0ff] hover:underline">Grúas Baratas</a>
            </div>
            <p className="text-slate-500 text-xs mt-6">
              © 2026 GruaApp. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
