import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Mail, Lock, User, Phone, Shield } from 'lucide-react';

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
  const [showOTP, setShowOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await register(formData);
      toast.success(response.message);
      setShowOTP(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp_code: otpCode })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Cuenta verificada exitosamente');
        
        if (formData.role === 'client') {
          navigate('/client/dashboard');
        } else if (formData.role === 'driver') {
          navigate('/driver/dashboard');
        }
      } else {
        toast.error(data.detail || 'Código OTP inválido');
      }
    } catch (error) {
      toast.error('Error al verificar OTP');
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Shield className="h-16 w-16 text-[#00e0ff] mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Verifica tu Email</h1>
            <p className="text-slate-400">Ingresa el código de 6 dígitos enviado a tu correo</p>
          </div>

          <form onSubmit={handleOTPVerify} className="glass-card p-8 rounded-xl" data-testid="otp-form">
            <div className="space-y-6">
              <div>
                <Label htmlFor="otp" className="text-slate-300 mb-2 block">Código OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="bg-black/50 border-white/10 focus:border-[#00e0ff] text-white text-center text-2xl tracking-widest h-14"
                  maxLength={6}
                  required
                  data-testid="otp-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-12"
                disabled={loading}
                data-testid="otp-verify-button"
              >
                {loading ? 'Verificando...' : 'Verificar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1120] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="https://customer-assets.emergentagent.com/job_tow-nexus/artifacts/ykgd2d1v_WhatsApp%20Image%202026-02-23%20at%207.40.40%20PM.jpeg" 
            alt="TowNexus" 
            className="h-16 mx-auto mb-4"
          />
          <h1 className="text-4xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-slate-400">Únete a TowNexus hoy</p>
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
                  placeholder="+1234567890"
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
      </div>
    </div>
  );
}