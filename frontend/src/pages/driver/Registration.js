import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle, MessageCircle, Truck } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WHATSAPP_HELP = '+573025159176';

export default function DriverRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralValid, setReferralValid] = useState(null);
  const [referralOwner, setReferralOwner] = useState('');
  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_plate: '',
    license_number: '',
    insurance_info: '',
    driver_photo_url: '',
    vehicle_registration_photo_url: '',
    vehicle_photo_url: '',
    cedula_photo_url: '',           // NUEVO: Cédula del propietario
    insurance_photo_url: ''         // NUEVO: Seguro de Responsabilidad Civil
  });

  // Validar código de referido
  const validateReferralCode = async (code) => {
    if (!code || code.length < 4) {
      setReferralValid(null);
      setReferralOwner('');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/referrals/validate/${code}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.valid) {
        setReferralValid(true);
        setReferralOwner(response.data.owner_name);
      } else {
        setReferralValid(false);
        setReferralOwner('');
      }
    } catch (error) {
      setReferralValid(false);
      setReferralOwner('');
    }
  };

  const handlePhotoUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    toast.loading('Subiendo imagen...');

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [fieldName]: reader.result
      }));
      toast.dismiss();
      toast.success('Imagen cargada exitosamente');
    };
    reader.onerror = () => {
      toast.dismiss();
      toast.error('Error al cargar la imagen');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar campos OBLIGATORIOS
    if (!formData.vehicle_plate || formData.vehicle_plate.length < 5) {
      toast.error('La placa del vehículo es obligatoria (mínimo 5 caracteres)');
      return;
    }

    if (!formData.vehicle_photo_url) {
      toast.error('La foto de la grúa con la placa visible es OBLIGATORIA');
      return;
    }

    if (!formData.vehicle_registration_photo_url) {
      toast.error('La foto de la tarjeta de propiedad es OBLIGATORIA');
      return;
    }

    if (!formData.cedula_photo_url) {
      toast.error('La foto de la cédula del propietario es OBLIGATORIA');
      return;
    }

    if (!formData.insurance_photo_url) {
      toast.error('La foto del seguro de responsabilidad civil es OBLIGATORIA');
      return;
    }

    setLoading(true);

    try {
      // Si hay código de referido válido, guardarlo en el usuario
      if (referralCode && referralValid === true) {
        await axios.post(`${API}/referrals/associate`, {
          referral_code: referralCode.toUpperCase()
        });
      }
      
      const response = await axios.post(`${API}/drivers/register`, formData);
      toast.success(response.data.message || '¡Registro enviado!');
      toast.info('Tu cuenta está pendiente de aprobación. Te notificaremos cuando seas aprobado.', { duration: 8000 });
      navigate('/driver/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsAppHelp = () => {
    const message = encodeURIComponent('Hola, necesito ayuda con el registro de conductor en GruaApp');
    window.open(`https://wa.me/${WHATSAPP_HELP.replace('+', '')}?text=${message}`, '_blank');
  };

  if (!user || user.role !== 'driver') {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center">
        <p className="text-white">Solo conductores pueden acceder a esta página</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1120] py-12 px-6">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center gap-4 mb-6">
          <Truck className="h-12 w-12 text-[#00e0ff]" />
          <div>
            <h1 className="text-4xl font-bold text-white">Registro de Conductor</h1>
            <p className="text-slate-400">Completa tu información para empezar a ofrecer servicios</p>
          </div>
        </div>

        {/* Alerta importante */}
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Importante: La placa y foto de la grúa son OBLIGATORIAS
          </p>
          <p className="text-yellow-400/70 text-sm mt-1">
            Sin estos datos no podrás ver ni aceptar servicios
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Código de Referido (Opcional) */}
          <Card className="glass-card p-6 border border-purple-500/30 bg-purple-500/5">
            <h2 className="text-xl font-bold text-purple-400 mb-4">🎁 ¿Te invitó otro conductor?</h2>
            <p className="text-slate-400 text-sm mb-4">
              Si otro conductor te invitó a la plataforma, ingresa su código. Cuando completes tu primer servicio, él recibirá un bono en su saldo.
            </p>
            <Input
              placeholder="Código de 4 caracteres (ej: AB12)"
              value={referralCode}
              onChange={(e) => {
                const code = e.target.value.toUpperCase();
                setReferralCode(code);
                validateReferralCode(code);
              }}
              className={`bg-black/50 text-white h-12 uppercase tracking-widest ${
                referralValid === true 
                  ? 'border-green-500' 
                  : referralValid === false 
                    ? 'border-red-500' 
                    : 'border-purple-500/30'
              }`}
              maxLength={4}
              data-testid="driver-referral-code-input"
            />
            {referralValid === true && (
              <p className="text-green-400 text-sm mt-2">✓ Código de {referralOwner} válido</p>
            )}
            {referralValid === false && referralCode.length > 0 && (
              <p className="text-red-400 text-sm mt-2">✗ Código no válido</p>
            )}
          </Card>

          {/* Información del Vehículo */}
          <Card className="glass-card p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Información del Vehículo</h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Tipo de Vehículo</Label>
                <Input
                  placeholder="Grúa plana, camabaja, etc."
                  value={formData.vehicle_type}
                  onChange={(e) => setFormData({...formData, vehicle_type: e.target.value})}
                  className="bg-black/50 border-white/10 text-white h-12"
                  required
                  data-testid="vehicle-type-input"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Marca</Label>
                <Input
                  placeholder="Chevrolet, Ford, etc."
                  value={formData.vehicle_brand}
                  onChange={(e) => setFormData({...formData, vehicle_brand: e.target.value})}
                  className="bg-black/50 border-white/10 text-white h-12"
                  required
                  data-testid="vehicle-brand-input"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Modelo</Label>
                <Input
                  placeholder="NQR, F-350, etc."
                  value={formData.vehicle_model}
                  onChange={(e) => setFormData({...formData, vehicle_model: e.target.value})}
                  className="bg-black/50 border-white/10 text-white h-12"
                  required
                  data-testid="vehicle-model-input"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                  Placa del Vehículo <span className="text-red-400">* OBLIGATORIO</span>
                </Label>
                <Input
                  placeholder="ABC123"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value.toUpperCase()})}
                  className="bg-black/50 border-[#00e0ff]/50 text-white h-12 font-mono text-lg uppercase"
                  required
                  minLength={5}
                  data-testid="vehicle-plate-input"
                />
              </div>
            </div>
          </Card>

          {/* Documentación */}
          <Card className="glass-card p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Documentación</h2>
            
            <div className="space-y-4">
              <div>
                <Label className="text-slate-300 mb-2 block">Número de Licencia de Conducir</Label>
                <Input
                  placeholder="123456789"
                  value={formData.license_number}
                  onChange={(e) => setFormData({...formData, license_number: e.target.value})}
                  className="bg-black/50 border-white/10 text-white h-12"
                  required
                  data-testid="license-input"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Información del Seguro (Opcional)</Label>
                <Input
                  placeholder="Nombre de la aseguradora y número de póliza"
                  value={formData.insurance_info}
                  onChange={(e) => setFormData({...formData, insurance_info: e.target.value})}
                  className="bg-black/50 border-white/10 text-white h-12"
                  data-testid="insurance-input"
                />
              </div>
            </div>
          </Card>

          {/* Fotos OBLIGATORIAS */}
          <Card className="glass-card p-6 border border-red-500/30 bg-red-500/5">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              Fotografías Obligatorias
              <span className="text-red-400 text-sm font-normal">(Sin estas no podrás trabajar)</span>
            </h2>
            
            <div className="space-y-6 mt-4">
              {/* Foto de la Grúa con PLACA VISIBLE - OBLIGATORIA */}
              <div className="p-4 border border-[#00e0ff]/30 rounded-lg bg-[#00e0ff]/5">
                <Label className="text-white mb-2 block flex items-center gap-2 text-lg font-bold">
                  Foto de la Grúa con PLACA VISIBLE <span className="text-red-400">*</span>
                  {!formData.vehicle_photo_url && (
                    <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                  )}
                </Label>
                <p className="text-slate-400 text-sm mb-3">
                  Sube una foto clara de tu grúa donde se vea la placa del vehículo
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'vehicle_photo_url')}
                    className="hidden"
                    id="vehicle-photo"
                    data-testid="vehicle-photo-input"
                  />
                  <label
                    htmlFor="vehicle-photo"
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all ${
                      formData.vehicle_photo_url 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-[#00e0ff]/10 border border-[#00e0ff]/50 hover:bg-[#00e0ff]/20'
                    }`}
                  >
                    {formData.vehicle_photo_url ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-[#00e0ff]" />
                    )}
                    <span className="text-white font-semibold">
                      {formData.vehicle_photo_url ? 'Foto Cargada ✓' : 'Subir Foto de la Grúa'}
                    </span>
                  </label>
                </div>
                {formData.vehicle_photo_url && (
                  <img src={formData.vehicle_photo_url} alt="Grúa" className="mt-4 h-40 w-auto object-cover rounded-lg border border-white/10" />
                )}
              </div>

              {/* Tarjeta de Propiedad - OBLIGATORIA */}
              <div className="p-4 border border-[#7200c4]/30 rounded-lg bg-[#7200c4]/5">
                <Label className="text-white mb-2 block flex items-center gap-2 text-lg font-bold">
                  Tarjeta de Propiedad <span className="text-red-400">*</span>
                  {!formData.vehicle_registration_photo_url && (
                    <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                  )}
                </Label>
                <p className="text-slate-400 text-sm mb-3">
                  Foto clara de la tarjeta de propiedad del vehículo
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'vehicle_registration_photo_url')}
                    className="hidden"
                    id="registration-photo"
                    data-testid="registration-photo-input"
                  />
                  <label
                    htmlFor="registration-photo"
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all ${
                      formData.vehicle_registration_photo_url 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-[#7200c4]/10 border border-[#7200c4]/50 hover:bg-[#7200c4]/20'
                    }`}
                  >
                    {formData.vehicle_registration_photo_url ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-[#7200c4]" />
                    )}
                    <span className="text-white font-semibold">
                      {formData.vehicle_registration_photo_url ? 'Documento Cargado ✓' : 'Subir Tarjeta de Propiedad'}
                    </span>
                  </label>
                </div>
                {formData.vehicle_registration_photo_url && (
                  <img src={formData.vehicle_registration_photo_url} alt="Tarjeta" className="mt-4 h-32 w-auto object-contain rounded-lg border border-white/10" />
                )}
              </div>

              {/* Cédula del Propietario - OBLIGATORIA */}
              <div className="p-4 border border-blue-500/30 rounded-lg bg-blue-500/5">
                <Label className="text-white mb-2 block flex items-center gap-2 text-lg font-bold">
                  Cédula del Propietario <span className="text-red-400">*</span>
                  {!formData.cedula_photo_url && (
                    <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                  )}
                </Label>
                <p className="text-slate-400 text-sm mb-3">
                  Foto clara de la cédula del propietario del vehículo (ambas caras)
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'cedula_photo_url')}
                    className="hidden"
                    id="cedula-photo"
                    data-testid="cedula-photo-input"
                  />
                  <label
                    htmlFor="cedula-photo"
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all ${
                      formData.cedula_photo_url 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-blue-500/10 border border-blue-500/50 hover:bg-blue-500/20'
                    }`}
                  >
                    {formData.cedula_photo_url ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-blue-400" />
                    )}
                    <span className="text-white font-semibold">
                      {formData.cedula_photo_url ? 'Cédula Cargada ✓' : 'Subir Cédula'}
                    </span>
                  </label>
                </div>
                {formData.cedula_photo_url && (
                  <img src={formData.cedula_photo_url} alt="Cédula" className="mt-4 h-32 w-auto object-contain rounded-lg border border-white/10" />
                )}
              </div>

              {/* Seguro de Responsabilidad Civil - OBLIGATORIO */}
              <div className="p-4 border border-orange-500/30 rounded-lg bg-orange-500/5">
                <Label className="text-white mb-2 block flex items-center gap-2 text-lg font-bold">
                  Seguro de Responsabilidad Civil Extracontractual (RCE) <span className="text-red-400">*</span>
                  {!formData.insurance_photo_url && (
                    <AlertCircle className="h-5 w-5 text-red-400 animate-pulse" />
                  )}
                </Label>
                <p className="text-slate-400 text-sm mb-3">
                  Este seguro cubre daños a terceros, accidentes durante la operación y daños materiales o personales causados durante el servicio
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'insurance_photo_url')}
                    className="hidden"
                    id="insurance-photo"
                    data-testid="insurance-photo-input"
                  />
                  <label
                    htmlFor="insurance-photo"
                    className={`flex items-center gap-2 px-6 py-3 rounded-lg cursor-pointer transition-all ${
                      formData.insurance_photo_url 
                        ? 'bg-green-500/20 border border-green-500/50' 
                        : 'bg-orange-500/10 border border-orange-500/50 hover:bg-orange-500/20'
                    }`}
                  >
                    {formData.insurance_photo_url ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-orange-400" />
                    )}
                    <span className="text-white font-semibold">
                      {formData.insurance_photo_url ? 'Seguro Cargado ✓' : 'Subir Póliza de Seguro RCE'}
                    </span>
                  </label>
                </div>
                {formData.insurance_photo_url && (
                  <img src={formData.insurance_photo_url} alt="Seguro" className="mt-4 h-32 w-auto object-contain rounded-lg border border-white/10" />
                )}
              </div>

              {/* Foto del Conductor - Opcional */}
              <div className="p-4 border border-white/10 rounded-lg">
                <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                  Foto del Conductor <span className="text-xs text-slate-500">(Opcional)</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'driver_photo_url')}
                    className="hidden"
                    id="driver-photo"
                  />
                  <label
                    htmlFor="driver-photo"
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg cursor-pointer hover:bg-white/10 transition-all"
                  >
                    <Upload className="h-5 w-5 text-slate-400" />
                    <span className="text-slate-300">Seleccionar Foto</span>
                  </label>
                  {formData.driver_photo_url && (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                </div>
                {formData.driver_photo_url && (
                  <img src={formData.driver_photo_url} alt="Conductor" className="mt-3 h-24 w-24 object-cover rounded-lg border border-white/10" />
                )}
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-14 text-lg"
            disabled={loading || !formData.vehicle_plate || !formData.vehicle_photo_url || !formData.vehicle_registration_photo_url || !formData.cedula_photo_url || !formData.insurance_photo_url}
            data-testid="submit-registration"
          >
            {loading ? 'Enviando Registro...' : 'Enviar Registro para Aprobación'}
          </Button>

          {/* Botón de Ayuda */}
          <div className="text-center">
            <Button
              type="button"
              variant="outline"
              onClick={openWhatsAppHelp}
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              data-testid="help-button"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              ¿Necesitas ayuda? Escríbenos por WhatsApp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
