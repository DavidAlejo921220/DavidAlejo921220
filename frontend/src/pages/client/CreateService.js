import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { ArrowLeft, MapPin, Navigation, Crosshair, MessageCircle, CheckCircle2 } from 'lucide-react';
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

// Iconos personalizados
const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WHATSAPP_HELP = '+573025159176';

const COLOMBIA_CENTER = { lat: 4.7110, lng: -74.0721 };

function MapClickHandler({ currentStep, setPickupLocation, setDestinationLocation }) {
  useMapEvents({
    click(e) {
      const location = { lat: e.latlng.lat, lng: e.latlng.lng };
      if (currentStep === 'pickup') {
        setPickupLocation(location);
        toast.success('📍 Punto de RECOGIDA marcado');
      } else {
        setDestinationLocation(location);
        toast.success('🏁 Punto de DESTINO marcado');
      }
    },
  });
  return null;
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
    suggested_price: '',
  });

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          setPickupLocation(userLocation);
          setMapCenter(userLocation);
          setMapKey(prev => prev + 1);
          toast.success('📍 Tu ubicación detectada como punto de recogida');
        },
        () => {
          setMapCenter(COLOMBIA_CENTER);
          setMapKey(prev => prev + 1);
          toast.info('Marca tu ubicación de recogida en el mapa');
        }
      );
    }
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      toast.loading('Obteniendo ubicación...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
          
          if (currentStep === 'pickup') {
            setPickupLocation(userLocation);
            toast.dismiss();
            toast.success('📍 Ubicación de RECOGIDA actualizada');
          } else {
            setDestinationLocation(userLocation);
            toast.dismiss();
            toast.success('🏁 Ubicación de DESTINO actualizada');
          }
          
          setMapCenter(userLocation);
          setMapKey(prev => prev + 1);
        },
        () => {
          toast.dismiss();
          toast.error('No se pudo obtener tu ubicación');
        }
      );
    }
  };

  const openWhatsAppHelp = () => {
    const message = encodeURIComponent('Hola, necesito ayuda para solicitar una grúa en GruaApp');
    window.open(`https://wa.me/${WHATSAPP_HELP.replace('+', '')}?text=${message}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pickupLocation) {
      toast.error('❌ Debes marcar el punto de RECOGIDA en el mapa');
      setCurrentStep('pickup');
      return;
    }
    
    if (!destinationLocation) {
      toast.error('❌ Debes marcar el punto de DESTINO en el mapa');
      setCurrentStep('destination');
      return;
    }

    if (!formData.pickup_address) {
      toast.error('❌ Escribe la dirección de recogida');
      return;
    }

    if (!formData.destination_address) {
      toast.error('❌ Escribe la dirección de destino');
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
      toast.success('✅ ¡Servicio publicado! Pronto recibirás ofertas de conductores.');
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
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/client/dashboard')} className="text-slate-400 hover:text-white" data-testid="back-button">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-white">Solicitar Grúa</h1>
          </div>
          <Button variant="outline" onClick={openWhatsAppHelp} className="border-green-500/50 text-green-400 hover:bg-green-500/10">
            <MessageCircle className="h-5 w-5 mr-2" />
            Ayuda
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Instrucciones */}
        <div className="bg-[#00e0ff]/10 border border-[#00e0ff]/30 rounded-lg p-4 mb-6">
          <h3 className="text-white font-bold mb-2">¿Cómo funciona?</h3>
          <ol className="text-slate-300 text-sm space-y-1">
            <li>1️⃣ Llena los datos de tu vehículo</li>
            <li>2️⃣ Marca en el mapa <span className="text-green-400 font-bold">DÓNDE está tu vehículo</span> (punto verde)</li>
            <li>3️⃣ Marca <span className="text-red-400 font-bold">A DÓNDE lo quieres llevar</span> (punto rojo)</li>
            <li>4️⃣ ¡Listo! Recibirás ofertas de conductores cercanos</li>
          </ol>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="glass-card p-6 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="create-service-form">
              <div>
                <Label className="text-slate-300 mb-2 block">Tipo de Vehículo *</Label>
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
                  <Label className="text-slate-300 mb-2 block">Marca *</Label>
                  <Input
                    placeholder="Toyota, Chevrolet..."
                    value={formData.vehicle_brand}
                    onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                    className="bg-black/50 border-white/10 text-white h-12"
                    required
                    data-testid="vehicle-brand-input"
                  />
                </div>
                <div>
                  <Label className="text-slate-300 mb-2 block">Modelo *</Label>
                  <Input
                    placeholder="Corolla, Spark..."
                    value={formData.vehicle_model}
                    onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                    className="bg-black/50 border-white/10 text-white h-12"
                    required
                    data-testid="vehicle-model-input"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">¿Qué le pasó al vehículo? *</Label>
                <Select value={formData.vehicle_condition} onValueChange={(value) => setFormData({ ...formData, vehicle_condition: value })} required>
                  <SelectTrigger className="bg-black/50 border-white/10 text-white h-12" data-testid="vehicle-condition-select">
                    <SelectValue placeholder="Selecciona el problema" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-white/10">
                    <SelectItem value="varado" className="text-white">Está varado</SelectItem>
                    <SelectItem value="accidentado" className="text-white">Tuvo un accidente</SelectItem>
                    <SelectItem value="no_enciende" className="text-white">No enciende</SelectItem>
                    <SelectItem value="pinchazo" className="text-white">Tiene un pinchazo</SelectItem>
                    <SelectItem value="otro" className="text-white">Otro problema</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Direcciones OBLIGATORIAS */}
              <div className="p-4 border border-green-500/30 rounded-lg bg-green-500/5">
                <Label className="text-green-400 mb-2 block font-bold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  ¿Dónde está tu vehículo? (Recogida) *
                  {pickupLocation && <CheckCircle2 className="h-4 w-4" />}
                </Label>
                <Input
                  placeholder="Ej: Carrera 7 #45-23, Bogotá"
                  value={formData.pickup_address}
                  onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                  className="bg-black/50 border-green-500/30 text-white h-12"
                  required
                  data-testid="pickup-address-input"
                />
              </div>

              <div className="p-4 border border-red-500/30 rounded-lg bg-red-500/5">
                <Label className="text-red-400 mb-2 block font-bold flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  ¿A dónde lo quieres llevar? (Destino) *
                  {destinationLocation && <CheckCircle2 className="h-4 w-4" />}
                </Label>
                <Input
                  placeholder="Ej: Taller Mecánico XYZ, Calle 100"
                  value={formData.destination_address}
                  onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
                  className="bg-black/50 border-red-500/30 text-white h-12"
                  required
                  data-testid="destination-address-input"
                />
              </div>

              {/* Valor Sugerido - Opcional */}
              <div className="p-4 border border-yellow-500/30 rounded-lg bg-yellow-500/5">
                <Label className="text-yellow-400 mb-2 block font-bold">
                  💰 ¿Cuánto estás dispuesto a pagar? (Opcional)
                </Label>
                <Input
                  type="number"
                  placeholder="Valor sugerido en COP (ej: 80000)"
                  value={formData.suggested_price}
                  onChange={(e) => setFormData({ ...formData, suggested_price: e.target.value })}
                  className="bg-black/50 border-yellow-500/30 text-white h-12"
                  data-testid="suggested-price-input"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Esta es solo una sugerencia. Los conductores pueden enviar ofertas diferentes.
                </p>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Información adicional (opcional)</Label>
                <Textarea
                  placeholder="Ej: El carro está en el parqueadero del edificio..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-black/50 border-white/10 text-white min-h-[80px]"
                  data-testid="description-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-14 text-lg"
                disabled={loading || !pickupLocation || !destinationLocation}
                data-testid="submit-service-button"
              >
                {loading ? 'Publicando...' : '🚛 Solicitar Grúa'}
              </Button>
            </form>
          </div>

          {/* Mapa */}
          <div className="glass-card p-6 rounded-xl">
            <div className="mb-4">
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button
                  type="button"
                  variant={currentStep === 'pickup' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('pickup')}
                  className={`${currentStep === 'pickup' ? 'bg-green-500 text-white' : 'border-green-500/50 text-green-400'}`}
                  data-testid="pickup-step-button"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  📍 Marcar Recogida
                  {pickupLocation && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant={currentStep === 'destination' ? 'default' : 'outline'}
                  onClick={() => setCurrentStep('destination')}
                  className={`${currentStep === 'destination' ? 'bg-red-500 text-white' : 'border-red-500/50 text-red-400'}`}
                  data-testid="destination-step-button"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  🏁 Marcar Destino
                  {destinationLocation && <CheckCircle2 className="ml-2 h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  onClick={handleLocateMe}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                  data-testid="locate-me-button"
                >
                  <Crosshair className="mr-2 h-4 w-4" />
                  Mi Ubicación
                </Button>
              </div>
              
              <div className={`p-3 rounded-lg text-sm ${currentStep === 'pickup' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                👆 Toca el mapa para marcar {currentStep === 'pickup' ? 'dónde está tu vehículo (RECOGIDA)' : 'a dónde lo quieres llevar (DESTINO)'}
              </div>
            </div>

            <div className="h-[450px] rounded-lg overflow-hidden border border-white/10" data-testid="service-map">
              <MapContainer
                key={mapKey}
                center={[mapCenter.lat, mapCenter.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap'
                />
                <MapClickHandler 
                  currentStep={currentStep}
                  setPickupLocation={setPickupLocation}
                  setDestinationLocation={setDestinationLocation}
                />
                {pickupLocation && (
                  <Marker position={[pickupLocation.lat, pickupLocation.lng]} icon={pickupIcon}>
                    <Popup>📍 Punto de Recogida</Popup>
                  </Marker>
                )}
                {destinationLocation && (
                  <Marker position={[destinationLocation.lat, destinationLocation.lng]} icon={destinationIcon}>
                    <Popup>🏁 Destino</Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>

            {/* Resumen de ubicaciones */}
            <div className="mt-4 space-y-2">
              <div className={`flex items-center gap-2 text-sm ${pickupLocation ? 'text-green-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full ${pickupLocation ? 'bg-green-400' : 'bg-slate-600'}`} />
                Recogida: {pickupLocation ? '✓ Marcado' : 'Sin marcar'}
              </div>
              <div className={`flex items-center gap-2 text-sm ${destinationLocation ? 'text-red-400' : 'text-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full ${destinationLocation ? 'bg-red-400' : 'bg-slate-600'}`} />
                Destino: {destinationLocation ? '✓ Marcado' : 'Sin marcar'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
