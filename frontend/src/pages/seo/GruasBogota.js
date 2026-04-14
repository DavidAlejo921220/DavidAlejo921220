import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Phone, Clock, MapPin, Shield, Star, Truck } from 'lucide-react';

export default function GruasBogota() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <Helmet>
        <title>Grúas en Bogotá | Servicio 24 Horas | GruaApp</title>
        <meta name="description" content="El mejor servicio de grúas en Bogotá con atención inmediata las 24 horas. Cobertura en Suba, Chapinero, Usaquén, Kennedy. Solicita tu grúa ahora." />
        <link rel="canonical" href="https://gruaapp.com/gruas-en-bogota" />
      </Helmet>
      
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-[#111827] to-[#0a1120]">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Servicio de <span className="text-[#00e0ff]">Grúas en Bogotá</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            El mejor servicio de grúas en Bogotá con atención inmediata las 24 horas. 
            Cobertura total en Suba, Chapinero, Usaquén, Kennedy, Engativá y toda la ciudad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/register?role=client')}
              className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold text-lg px-8 py-6"
            >
              <Phone className="mr-2 h-5 w-5" />
              Solicitar Grúa Ahora
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://wa.me/573001234567', '_blank')}
              className="border-green-500 text-green-400 hover:bg-green-500/10 font-bold text-lg px-8 py-6"
            >
              WhatsApp Directo
            </Button>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          ¿Por qué elegir nuestro servicio de grúas en Bogotá?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
            <Clock className="h-12 w-12 text-[#00e0ff] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Respuesta en Minutos</h3>
            <p className="text-slate-400">Llegamos en menos de 30 minutos a cualquier punto de Bogotá.</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
            <Shield className="h-12 w-12 text-[#00e0ff] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Conductores Verificados</h3>
            <p className="text-slate-400">Todos nuestros conductores están certificados y asegurados.</p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
            <Star className="h-12 w-12 text-[#00e0ff] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Precios Competitivos</h3>
            <p className="text-slate-400">Compara ofertas de diferentes conductores y elige la mejor.</p>
          </div>
        </div>
      </section>

      {/* Precios */}
      <section className="py-16 bg-[#111827]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            ¿Cuánto cuesta una grúa en Bogotá?
          </h2>
          <div className="max-w-2xl mx-auto bg-[#0a1120] p-8 rounded-xl border border-[#00e0ff]/30">
            <p className="text-slate-300 mb-6">
              El precio de una grúa en Bogotá puede variar entre <span className="text-[#00e0ff] font-bold">$80.000 y $250.000 COP</span>, 
              dependiendo de la distancia, tipo de vehículo y urgencia del servicio.
            </p>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-green-400" />
                Servicio local (misma zona): desde $80.000
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-yellow-400" />
                Traslado entre localidades: desde $120.000
              </li>
              <li className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-red-400" />
                Servicio nocturno/festivo: desde $150.000
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Cobertura */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-8">
          Cobertura de Grúas en Bogotá
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {['Suba', 'Chapinero', 'Usaquén', 'Kennedy', 'Engativá', 'Bosa', 'Fontibón', 'Teusaquillo'].map((zona) => (
            <div key={zona} className="bg-[#111827] p-4 rounded-lg text-center border border-white/10">
              <MapPin className="h-6 w-6 text-[#00e0ff] mx-auto mb-2" />
              <p className="text-white font-semibold">Grúas en {zona}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-[#00e0ff]/20 to-[#7200c4]/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Necesitas una grúa urgente en Bogotá?
          </h2>
          <p className="text-slate-300 mb-8">
            Llegamos en minutos. Servicio rápido, seguro y disponible 24/7.
          </p>
          <Button 
            onClick={() => navigate('/register?role=client')}
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold text-xl px-12 py-6"
          >
            Solicitar Grúa Ahora
          </Button>
        </div>
      </section>

      {/* Footer SEO */}
      <footer className="py-8 bg-[#111827] border-t border-white/10">
        <div className="container mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            Prestamos servicio de grúas en Bogotá en zonas como Suba, Chapinero, Usaquén, Kennedy, 
            Engativá y toda la ciudad, con atención inmediata las 24 horas.
          </p>
          <Button 
            variant="link" 
            onClick={() => navigate('/')}
            className="text-[#00e0ff] mt-4"
          >
            Volver al inicio
          </Button>
        </div>
      </footer>
    </div>
  );
}
