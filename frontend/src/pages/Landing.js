import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Truck, Shield, Zap, Users } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a1120]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#7200c4]/20 via-transparent to-[#00e0ff]/20" />
        
        <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_tow-nexus/artifacts/ykgd2d1v_WhatsApp%20Image%202026-02-23%20at%207.40.40%20PM.jpeg" 
              alt="GruaApp" 
              className="h-12"
            />
          </div>
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-slate-300 hover:text-[#00e0ff]"
              data-testid="nav-login-button"
            >
              Iniciar Sesión
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider"
              data-testid="nav-register-button"
            >
              Registrarse
            </Button>
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight">
            GruaApp
            <span className="block text-[#00e0ff] mt-2">Tu Grúa en Minutos</span>
          </h1>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            La forma más rápida de conseguir grúa en Colombia. 
            Compara precios, elige la mejor oferta y ahorra dinero.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg"
              onClick={() => navigate('/register?role=client')}
              className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-widest px-8 py-6 text-lg neon-glow"
              data-testid="hero-client-button"
            >
              <Truck className="mr-2 h-5 w-5" />
              Necesito una Grúa
            </Button>
            <Button 
              size="lg"
              onClick={() => navigate('/register?role=driver')}
              className="border-2 border-[#7200c4] text-[#7200c4] hover:bg-[#7200c4] hover:text-white font-bold uppercase tracking-widest px-8 py-6 text-lg"
              data-testid="hero-driver-button"
            >
              <Users className="mr-2 h-5 w-5" />
              Soy Conductor
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 rounded-xl hover:border-[#00e0ff]/30 transition-all" data-testid="feature-marketplace">
            <div className="bg-[#00e0ff]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-[#00e0ff]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Marketplace en Tiempo Real</h3>
            <p className="text-slate-400 leading-relaxed">
              Publica tu solicitud y recibe múltiples ofertas de conductores cercanos en Colombia. 
              Elige la que mejor se ajuste a tu presupuesto.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover:border-[#7200c4]/30 transition-all" data-testid="feature-security">
            <div className="bg-[#7200c4]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-[#7200c4]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">100% Seguro</h3>
            <p className="text-slate-400 leading-relaxed">
              Verificación de conductores, sistema de calificaciones y soporte 24/7 
              para tu tranquilidad.
            </p>
          </div>

          <div className="glass-card p-8 rounded-xl hover:border-[#00e0ff]/30 transition-all" data-testid="feature-tracking">
            <div className="bg-[#00e0ff]/10 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
              <Truck className="h-8 w-8 text-[#00e0ff]" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Seguimiento en Vivo</h3>
            <p className="text-slate-400 leading-relaxed">
              Rastrea la ubicación de tu grúa en tiempo real y comunícate directamente 
              con el conductor.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-6 py-20">
        <div className="glass-card p-12 rounded-2xl text-center border border-[#00e0ff]/20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Comienza Ahora
          </h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Únete a GruaApp, la plataforma #1 de asistencia vehicular en Colombia.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-widest px-12 py-6 text-lg neon-glow"
            data-testid="cta-register-button"
          >
            Registrarse Gratis
          </Button>
        </div>
      </div>
    </div>
  );
}