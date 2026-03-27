import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone, DollarSign, CheckCircle, TrendingDown, Truck, Calculator } from 'lucide-react';

export default function GruasBaratas() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1120]">
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-[#111827] to-[#0a1120]">
        <div className="container mx-auto px-6 text-center">
          <DollarSign className="h-16 w-16 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Grúas <span className="text-green-400">Baratas</span> en Bogotá
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Encuentra las mejores ofertas de grúas económicas en Bogotá. 
            Compara precios de diferentes conductores y elige la opción más conveniente para ti.
          </p>
          <Button 
            onClick={() => navigate('/register?role=client')}
            className="bg-green-500 text-white hover:bg-green-600 font-bold text-lg px-8 py-6"
          >
            <Phone className="mr-2 h-5 w-5" />
            Cotizar Grúa Gratis
          </Button>
        </div>
      </section>

      {/* Precios */}
      <section className="py-16 container mx-auto px-6">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Grúas Económicas en Bogotá: Precios Reales 2026
        </h2>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-[#111827] p-6 rounded-xl border border-green-500/30 text-center">
            <TrendingDown className="h-10 w-10 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Económico</h3>
            <p className="text-4xl font-bold text-green-400 mb-2">$80.000</p>
            <p className="text-slate-400 text-sm">Servicio local en la misma zona</p>
            <ul className="mt-4 space-y-2 text-left text-slate-400 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Hasta 5 km</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Vehículo liviano</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Horario diurno</li>
            </ul>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl border border-yellow-500/30 text-center">
            <Truck className="h-10 w-10 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Estándar</h3>
            <p className="text-4xl font-bold text-yellow-400 mb-2">$120.000</p>
            <p className="text-slate-400 text-sm">Traslado entre localidades</p>
            <ul className="mt-4 space-y-2 text-left text-slate-400 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-400" /> Hasta 15 km</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-400" /> Todo tipo de vehículo</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-yellow-400" /> Cualquier horario</li>
            </ul>
          </div>
          <div className="bg-[#111827] p-6 rounded-xl border border-[#00e0ff]/30 text-center">
            <Calculator className="h-10 w-10 text-[#00e0ff] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Premium</h3>
            <p className="text-4xl font-bold text-[#00e0ff] mb-2">$180.000+</p>
            <p className="text-slate-400 text-sm">Servicio especial o larga distancia</p>
            <ul className="mt-4 space-y-2 text-left text-slate-400 text-sm">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00e0ff]" /> Distancia ilimitada</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00e0ff]" /> Vehículos pesados</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-[#00e0ff]" /> Servicio urgente</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Cómo conseguir el mejor precio */}
      <section className="py-16 bg-[#111827]">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            ¿Cómo conseguir una grúa barata en Bogotá?
          </h2>
          <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
            <div className="bg-[#0a1120] p-6 rounded-xl">
              <h3 className="text-green-400 font-bold mb-2">✓ Compara ofertas</h3>
              <p className="text-slate-400 text-sm">En GruaApp recibes múltiples ofertas de diferentes conductores para elegir la mejor.</p>
            </div>
            <div className="bg-[#0a1120] p-6 rounded-xl">
              <h3 className="text-green-400 font-bold mb-2">✓ Sugiere tu precio</h3>
              <p className="text-slate-400 text-sm">Indica cuánto estás dispuesto a pagar y los conductores pueden aceptar tu oferta.</p>
            </div>
            <div className="bg-[#0a1120] p-6 rounded-xl">
              <h3 className="text-green-400 font-bold mb-2">✓ Horarios flexibles</h3>
              <p className="text-slate-400 text-sm">Los servicios en horario diurno suelen ser más económicos que los nocturnos.</p>
            </div>
            <div className="bg-[#0a1120] p-6 rounded-xl">
              <h3 className="text-green-400 font-bold mb-2">✓ Sin intermediarios</h3>
              <p className="text-slate-400 text-sm">Conectas directamente con el conductor, sin costos adicionales de agencias.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-500/20 to-[#00e0ff]/20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Grúas Baratas en Bogotá con Atención Inmediata
          </h2>
          <p className="text-slate-300 mb-8">
            Cotiza ahora y recibe tu servicio en minutos. Precios desde $80.000 COP.
          </p>
          <Button 
            onClick={() => navigate('/register?role=client')}
            className="bg-green-500 text-white hover:bg-green-600 font-bold text-xl px-12 py-6"
          >
            Cotizar Grúa Gratis
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
