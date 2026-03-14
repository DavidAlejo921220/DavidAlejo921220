import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DriverRegistration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_plate: '',
    license_number: '',
    insurance_info: '',
    driver_photo_url: '',
    vehicle_registration_photo_url: '',
    vehicle_photo_url: ''
  });

  // Simular upload de foto (en producción usar Cloudinary, S3, etc.)
  const handlePhotoUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no debe superar 5MB');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Solo se permiten imágenes');
      return;
    }

    toast.loading('Subiendo imagen...');

    // Convertir a base64 (temporal - en producción usar servicio real)
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

    // Validar campos obligatorios
    if (!formData.vehicle_registration_photo_url) {
      toast.error('La foto de la tarjeta de propiedad es obligatoria');
      return;
    }

    setLoading(true);

    try {
      await axios.post(`${API}/drivers/register`, formData);
      toast.success('Información registrada. Pendiente de verificación.');
      navigate('/driver/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar');
    } finally {
      setLoading(false);
    }
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
        <h1 className="text-4xl font-bold text-white mb-2">Registro de Conductor</h1>
        <p className="text-slate-400 mb-8">Completa tu información para empezar a ofrecer servicios</p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Placa</Label>
                <Input
                  placeholder="ABC123"
                  value={formData.vehicle_plate}
                  onChange={(e) => setFormData({...formData, vehicle_plate: e.target.value})}
                  className="bg-black/50 border-white/10 text-white h-12"
                  required
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
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Información del Seguro</Label>
                <Input
                  placeholder="Nombre de la aseguradora y número de póliza"
                  value={formData.insurance_info}
                  onChange={(e) => setFormData({...formData, insurance_info: e.target.value})}
                  className="bg-black/50 border-white/10 text-white h-12"
                />
              </div>
            </div>
          </Card>

          {/* Fotos */}
          <Card className="glass-card p-6 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-4">Fotografías</h2>
            
            <div className="space-y-6">
              {/* Foto del Conductor (Opcional) */}
              <div>
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
                    className="flex items-center gap-2 px-4 py-2 bg-[#00e0ff]/10 border border-[#00e0ff]/30 rounded-lg cursor-pointer hover:bg-[#00e0ff]/20 transition-all"
                  >
                    <Upload className="h-5 w-5 text-[#00e0ff]" />
                    <span className="text-white">Seleccionar Foto</span>
                  </label>
                  {formData.driver_photo_url && (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                </div>
                {formData.driver_photo_url && (
                  <img src={formData.driver_photo_url} alt="Preview" className="mt-3 h-32 w-32 object-cover rounded-lg border border-white/10" />
                )}
              </div>

              {/* Tarjeta de Propiedad (Obligatoria) */}
              <div>
                <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                  Tarjeta de Propiedad del Vehículo <span className="text-red-400">*</span>
                  {!formData.vehicle_registration_photo_url && (
                    <AlertCircle className="h-4 w-4 text-yellow-400" />
                  )}
                </Label>
                <p className="text-xs text-slate-500 mb-2">Sube una foto clara de la tarjeta de propiedad</p>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'vehicle_registration_photo_url')}
                    className="hidden"
                    id="registration-photo"
                    required
                  />
                  <label
                    htmlFor="registration-photo"
                    className="flex items-center gap-2 px-4 py-2 bg-[#7200c4]/10 border border-[#7200c4]/30 rounded-lg cursor-pointer hover:bg-[#7200c4]/20 transition-all"
                  >
                    <Upload className="h-5 w-5 text-[#7200c4]" />
                    <span className="text-white">Seleccionar Tarjeta</span>
                  </label>
                  {formData.vehicle_registration_photo_url && (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                </div>
                {formData.vehicle_registration_photo_url && (
                  <img src={formData.vehicle_registration_photo_url} alt="Preview" className="mt-3 h-32 w-auto object-contain rounded-lg border border-white/10" />
                )}
              </div>

              {/* Foto de la Grúa (Opcional) */}
              <div>
                <Label className="text-slate-300 mb-2 block flex items-center gap-2">
                  Foto de la Grúa <span className="text-xs text-slate-500">(Opcional)</span>
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, 'vehicle_photo_url')}
                    className="hidden"
                    id="vehicle-photo"
                  />
                  <label
                    htmlFor="vehicle-photo"
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg cursor-pointer hover:bg-green-500/20 transition-all"
                  >
                    <Upload className="h-5 w-5 text-green-400" />
                    <span className="text-white">Seleccionar Foto</span>
                  </label>
                  {formData.vehicle_photo_url && (
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  )}
                </div>
                {formData.vehicle_photo_url && (
                  <img src={formData.vehicle_photo_url} alt="Preview" className="mt-3 h-32 w-auto object-cover rounded-lg border border-white/10" />
                )}
              </div>
            </div>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-14 text-lg"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Completar Registro'}
          </Button>
        </form>
      </div>
    </div>
  );
}
