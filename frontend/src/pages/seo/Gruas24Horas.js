import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Moon, Sun, Shield, Zap } from 'lucide-react';

export default function Gruas24Horas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <Helmet>
        <title>Grúas 24 Horas en Bogotá | Servicio Urgente | GruaApp</title>
        <meta name="description" content="Servicio de grúas disponible las 24 horas en Bogotá. Atención inmediata en horarios nocturnos y festivos. Llegamos en minutos." />
        <link rel="canonical" href="https://gruaapp.com/gruas-24-horas-bogota" />
      </Helmet>
      
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-[#111827] to-[#0a1120]">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center gap-4 mb-6">
            <Sun className="h-10 w-10 text-yellow-400" />
            <Moon className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Grúas <span className="text-[#00e0ff]">24 Horas</span> en Bogotá
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Servicio de grúas disponible las 24 horas del día, los 7 días de la semana. 
            Atención inmediata en cualquier momento, incluso en horarios nocturnos y festivos.
          </p>
          <Button 
            onClick={() => navigate('/register?role=client')}
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold text-lg px-8 py-6"
          >
            <Phone className="mr-2 h-5 w-5" />
            Solicitar Grúa Ahora
          </Button>
        </div>
      </section>

      {/* Ventajas 24/7 */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Servicio de Grúas 24 Horas: Rápido, Seguro y Económico
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
            <Clock className="h-12 w-12 text-[#00e0ff] mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Disponibilidad Total</h3>
            <p className="text-slate-400">
              No importa la hora, siempre hay un conductor disponible para atenderte. 
              Madrugada, noche, festivos - estamos para ti.
            </p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
            <Zap className="h-12 w-12 text-yellow-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Respuesta Inmediata</h3>
            <p className="text-slate-400">
              Tiempos de respuesta menores a 30 minutos en cualquier zona de Bogotá, 
              incluso en horarios de alta demanda.
            </p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
            <Shield className="h-12 w-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Seguridad Garantizada</h3>
            <p className="text-slate-400">
              Conductores verificados y seguimiento en tiempo real de tu servicio 
              para mayor tranquilidad.
            </p>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
            <Phone className="h-12 w-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Comunicación Directa</h3>
            <p className="text-slate-400">
              Chat en tiempo real con tu conductor y soporte por WhatsApp disponible 
              las 24 horas.
            </p>
          </div>
        </div>
      </section>

      {/* Qué hacer si te varas */}
      <section className="py-16 bg-[#111827]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            ¿Qué hacer si tu carro se varó en Bogotá?
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">1</div>
              <div>
                <h3 className="text-white font-bold mb-1">Mantén la calma</h3>
                <p className="text-slate-400">Enciende las luces de emergencia y ubica el vehículo en un lugar seguro si es posible.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">2</div>
              <div>
                <h3 className="text-white font-bold mb-1">Solicita tu grúa</h3>
                <p className="text-slate-400">Ingresa a GruaApp y solicita el servicio indicando tu ubicación exacta.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">3</div>
              <div>
                <h3 className="text-white font-bold mb-1">Recibe ofertas</h3>
                <p className="text-slate-400">Compara precios de diferentes conductores y elige el que más te convenga.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">4</div>
              <div>
                <h3 className="text-white font-bold mb-1">Seguimiento en tiempo real</h3>
                <p className="text-slate-400">Visualiza la ubicación de tu grúa mientras llega a recogerte.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#00e0ff]/20 to-[#7200c4]/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Servicio de Grúa Urgente en Bogotá 24 Horas
          </h2>
          <p className="text-slate-300 mb-8">
            Un servicio de grúa urgente puede llegar en menos de 30 minutos. 
            Contamos con cobertura en toda la ciudad.
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
