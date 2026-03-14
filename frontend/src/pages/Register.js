import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Lock, User, Phone, MessageCircle } from 'lucide-react';

const WHATSAPP_HELP = '+573025159176';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: searchParams.get('role') || 'client',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('¡Cuenta creada exitosamente!');
      
      // Redirigir según el rol (sin OTP)
      if (formData.role === 'client') {
        navigate('/client/dashboard');
      } else if (formData.role === 'driver') {
        // Los conductores van a completar su registro de vehículo
        navigate('/driver/registration');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppHelp = () => {
    const message = encodeURIComponent('Hola, necesito ayuda con GruaApp');
    window.open(`https://wa.me/${WHATSAPP_HELP.replace('+', '')}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0a1120] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://static.prod-images.emergentagent.com/jobs/4d6d68fe-1392-4b8b-95de-0896fbae6116/images/6dd94c30201b82c0db798c24c5f11f318e92f4633b0624b679a02b2944046c88.png" 
            alt="GruaApp" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-slate-400">Únete a GruaApp hoy</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-xl" data-testid="register-form">
          <div className="space-y-5">
            <div>
              <Label htmlFor="role" className="text-slate-300 mb-2 block">Tipo de Cuenta</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-black/50 border-white/10 focus:border-[#00e0ff] text-white h-12" data-testid="register-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-white/10">
                  <SelectItem value="client" className="text-white">Cliente (Necesito grúa)</SelectItem>
                  <SelectItem value="driver" className="text-white">Conductor (Tengo grúa)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="full_name" className="text-slate-300 mb-2 block">Nombre Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-black/50 border-white/10 focus:border-[#00e0ff] text-white pl-10 h-12"
                  required
                  data-testid="register-name-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-slate-300 mb-2 block">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-black/50 border-white/10 focus:border-[#00e0ff] text-white pl-10 h-12"
                  required
                  data-testid="register-email-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone" className="text-slate-300 mb-2 block">Teléfono</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="3001234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-black/50 border-white/10 focus:border-[#00e0ff] text-white pl-10 h-12"
                  required
                  data-testid="register-phone-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-300 mb-2 block">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-black/50 border-white/10 focus:border-[#00e0ff] text-white pl-10 h-12"
                  required
                  minLength={6}
                  data-testid="register-password-input"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-12"
              disabled={loading}
              data-testid="register-submit-button"
            >
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-[#00e0ff] hover:text-[#33eaff] font-semibold">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </form>

        {/* Botón de Ayuda WhatsApp */}
        <div className="mt-6 text-center">
          <Button
            type="button"
            variant="outline"
            onClick={openWhatsAppHelp}
            className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300"
            data-testid="help-whatsapp-button"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            ¿Necesitas ayuda? Escríbenos
          </Button>
        </div>
      </div>
    </div>
  );
}
