import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { ArrowLeft, MapPin, Navigation, Crosshair } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Coordenadas de Colombia (Bogotá como centro)
const COLOMBIA_CENTER = { lat: 4.7110, lng: -74.0721 };

function LocationMarker({ position, setPosition, type }) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function CreateService() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [destinationLocation, setDestinationLocation] = useState(null);
  const [currentStep, setCurrentStep] = useState('pickup');
  const [mapCenter, setMapCenter] = useState(COLOMBIA_CENTER);
  const [mapKey, setMapKey] = useState(0);
  const [formData, setFormData] = useState({
    vehicle_type: '',
    vehicle_brand: '',
    vehicle_model: '',
    vehicle_condition: '',
    pickup_address: '',
    destination_address: '',
    description: '',
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setPickupLocation(userLocation);
          setMapCenter(userLocation);
          setMapKey(prev => prev + 1);
          toast.success('Ubicación detectada');
        },
        (error) => {
          console.error('Error getting location:', error);
          setPickupLocation(COLOMBIA_CENTER);
          setMapCenter(COLOMBIA_CENTER);
          setMapKey(prev => prev + 1);
          toast.info('Usando ubicación por defecto (Bogotá, Colombia)');
        }
      );
    } else {
      setPickupLocation(COLOMBIA_CENTER);
      setMapCenter(COLOMBIA_CENTER);
      setMapKey(prev => prev + 1);
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      toast.loading('Obteniendo tu ubicación...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (currentStep === 'pickup') {
            setPickupLocation(userLocation);
          } else {
            setDestinationLocation(userLocation);
          }
          
          setMapCenter(userLocation);
          setMapKey(prev => prev + 1);
          toast.dismiss();
          toast.success('¡Ubicación actualizada!');
        },
        (error) => {
          toast.dismiss();
          toast.error('No se pudo obtener tu ubicación. Verifica los permisos.');
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pickupLocation || !destinationLocation) {
      toast.error('Selecciona ubicaciones de recogida y destino en el mapa');
      return;
    }

    setLoading(true);
    try {
      const serviceData = {
        ...formData,
        pickup_location: pickupLocation,
        destination_location: destinationLocation,
      };

      await axios.post(`${API}/services/create`, serviceData);
      toast.success('Servicio creado exitosamente');
      navigate('/client/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear servicio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/client/dashboard')}
            className="text-slate-400 hover:text-white"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Solicitar Grúa</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="create-service-form">
              <div>
                <Label className="text-slate-300 mb-2 block">Tipo de Vehículo</Label>
                <Select value={formData.vehicle_type} onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })} required>
                  <SelectTrigger className="bg-black/50 border-white/10 text-white h-12" data-testid="vehicle-type-select">
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="carro" className="text-white">Carro</SelectItem>
                    <SelectItem value="moto" className="text-white">Moto</SelectItem>
                    <SelectItem value="camioneta" className="text-white">Camioneta</SelectItem>
                    <SelectItem value="camion" className="text-white">Camión</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 mb-2 block">Marca</Label>
                  <Input
                    placeholder="Toyota"
                    value={formData.vehicle_brand}
                    onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                    className="bg-black/50 border-white/10 text-white h-12"
                    required
                    data-testid="vehicle-brand-input"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Modelo</Label>
                  <Input
                    placeholder="Corolla"
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    className="bg-black/50 border-white/10 text-white h-12"
                    required
                    data-testid="vehicle-model-input"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Estado del Vehículo</Label>
                <Select value={formData.vehicle_condition} onValueChange={(value) => setFormData({ ...formData, vehicle_condition: value })} required>
                  <SelectTrigger className="bg-black/50 border-white/10 text-white h-12" data-testid="vehicle-condition-select">
                    <SelectValue placeholder="Selecciona estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="varado" className="text-white">Varado</SelectItem>
                    <SelectItem value="accidentado" className="text-white">Accidentado</SelectItem>
                    <SelectItem value="no_enciende" className="text-white">No enciende</SelectItem>
                    <SelectItem value="pinchazo" className="text-white">Pinchazo</SelectItem>
                    <SelectItem value="otro" className="text-white">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Dirección de Recogida (Opcional)</Label>
                <Input
                  placeholder="Calle 123, Ciudad"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                  className="bg-black/50 border-white/10 text-white h-12"
                  data-testid="pickup-address-input"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Dirección de Destino (Opcional)</Label>
                <Input
                  placeholder="Taller mecánico XYZ"
                  value={formData.destination_address}
                  onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
                  className="bg-black/50 border-white/10 text-white h-12"
                  data-testid="destination-address-input"
                />
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Descripción Adicional</Label>
                <Textarea
                  placeholder="Detalles adicionales..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-black/50 border-white/10 text-white min-h-[100px]"
                  data-testid="description-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-12"
                disabled={loading}
                data-testid="submit-service-button"
              >
                {loading ? 'Creando...' : 'Publicar Solicitud'}
              </Button>
            </form>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <div className="mb-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant={currentStep === 'pickup' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('pickup')}
                  className={currentStep === 'pickup' ? 'bg-[#00e0ff] text-black' : 'border-white/10 text-slate-400'}
                  data-testid="pickup-step-button"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Recogida
                </Button>
                <Button
                  variant={currentStep === 'destination' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('destination')}
                  className={currentStep === 'destination' ? 'bg-[#00e0ff] text-black' : 'border-white/10 text-slate-400'}
                  data-testid="destination-step-button"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Destino
                </Button>
                <Button
                  onClick={handleLocateMe}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold"
                  data-testid="locate-me-button"
                >
                  <Crosshair className="mr-2 h-4 w-4" />
                  Ubicarme
                </Button>
              </div>
              <p className="text-slate-400 text-sm">
                Haz clic en el mapa para marcar la ubicación de {currentStep === 'pickup' ? 'recogida' : 'destino'}
              </p>
            </div>

            <div className="h-[500px] rounded-lg overflow-hidden border border-white/10" data-testid="service-map">
              <MapContainer
                key={mapKey}
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {currentStep === 'pickup' ? (
                  <LocationMarker position={pickupLocation} setPosition={setPickupLocation} type="pickup" />
                ) : (
                  <LocationMarker position={destinationLocation} setPosition={setDestinationLocation} type="destination" />
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}