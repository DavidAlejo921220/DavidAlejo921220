import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageCircle, MapPin, Navigation, User, Phone, Car, Clock, CheckCircle, Truck, AlertTriangle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusOptions = [
  { value: 'accepted', label: '✅ Aceptado', description: 'Servicio confirmado' },
  { value: 'on_way', label: '🚛 En camino', description: 'Dirigiéndose al punto de recogida' },
  { value: 'picked_up', label: '🔧 Recogido', description: 'Vehículo cargado en la grúa' },
  { value: 'in_transit', label: '🛣️ En tránsito', description: 'En camino al destino' },
  { value: 'completed', label: '✔️ Completado', description: 'Servicio finalizado' },
];

const statusColors = {
  accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  on_way: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  picked_up: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  in_transit: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  completed: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function DriverMyServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [clientInfo, setClientInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadClientInfo(selectedService.client_id);
    }
  }, [selectedService]);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API}/services/my-services`);
      setServices(response.data);
      if (response.data.length > 0 && !selectedService) {
        setSelectedService(response.data[0]);
      }
    } catch (error) {
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const loadClientInfo = async (clientId) => {
    try {
      const response = await axios.get(`${API}/auth/users/${clientId}`);
      setClientInfo(response.data);
    } catch (error) {
      console.error('Error loading client info');
      setClientInfo(null);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedService) return;
    
    setUpdatingStatus(true);
    try {
      await axios.post(`${API}/services/${selectedService.id}/update-status`, {
        status: newStatus
      });
      toast.success(`✅ Estado actualizado a: ${statusOptions.find(s => s.value === newStatus)?.label}`);
      
      // Actualizar servicio localmente
      setSelectedService(prev => ({ ...prev, status: newStatus }));
      setServices(prev => prev.map(s => 
        s.id === selectedService.id ? { ...s, status: newStatus } : s
      ));
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getFilteredServices = () => {
    if (filter === 'all') return services;
    if (filter === 'active') return services.filter(s => !['completed', 'cancelled'].includes(s.status));
    if (filter === 'completed') return services.filter(s => s.status === 'completed');
    return services;
  };

  const filteredServices = getFilteredServices();

  const getStatusLabel = (status) => {
    return statusOptions.find(s => s.value === status)?.label || status;
  };

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/driver/dashboard')}
            className="text-slate-400 hover:text-white"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Truck className="h-6 w-6 text-[#00e0ff]" />
          <h1 className="text-2xl font-bold text-white">Mis Servicios</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-[#00e0ff] animate-pulse mx-auto mb-4" />
            <p className="text-slate-400">Cargando servicios...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            <Truck className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No tienes servicios asignados</p>
            <Button
              onClick={() => navigate('/driver/available')}
              className="mt-4 bg-[#00e0ff] text-black hover:bg-[#33eaff]"
            >
              Buscar Servicios Disponibles
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Lista de Servicios */}
            <div className="glass-card p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">Servicios ({filteredServices.length})</h2>
              </div>
              
              {/* Filtros */}
              <div className="flex gap-2 mb-4">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'bg-[#00e0ff] text-black' : 'border-white/10 text-slate-400'}
                >
                  Todos ({services.length})
                </Button>
                <Button
                  variant={filter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('active')}
                  className={filter === 'active' ? 'bg-yellow-500 text-black' : 'border-white/10 text-slate-400'}
                >
                  Activos ({services.filter(s => !['completed', 'cancelled'].includes(s.status)).length})
                </Button>
                <Button
                  variant={filter === 'completed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('completed')}
                  className={filter === 'completed' ? 'bg-green-500 text-black' : 'border-white/10 text-slate-400'}
                >
                  ✓ ({services.filter(s => s.status === 'completed').length})
                </Button>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedService?.id === service.id
                        ? 'bg-[#00e0ff]/10 border-2 border-[#00e0ff]/50'
                        : 'bg-[#111827] border border-white/10 hover:border-white/30'
                    }`}
                    data-testid={`service-item-${service.id}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-white font-semibold">{service.vehicle_brand} {service.vehicle_model}</p>
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[service.status] || 'bg-slate-500/20 text-slate-400'}`}>
                        {getStatusLabel(service.status)}
                      </span>
                    </div>
                    <p className="text-[#00e0ff] font-bold">{formatCurrency(service.final_price || 0)}</p>
                    <p className="text-slate-500 text-xs mt-1">{new Date(service.created_at).toLocaleDateString('es-CO')}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detalle del Servicio */}
            <div className="lg:col-span-2 space-y-6">
              {selectedService ? (
                <>
                  {/* Encabezado con Estado */}
                  <div className="glass-card p-6 rounded-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">
                          {selectedService.vehicle_brand} {selectedService.vehicle_model}
                        </h2>
                        <p className="text-slate-400">{selectedService.vehicle_type} - {selectedService.vehicle_condition}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00e0ff] text-3xl font-bold">{formatCurrency(selectedService.final_price || 0)}</p>
                        <p className="text-slate-500 text-sm">Precio acordado</p>
                      </div>
                    </div>

                    {/* Cambio de Estado */}
                    <div className="bg-black/30 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white font-bold flex items-center gap-2">
                          <Clock className="h-5 w-5 text-[#00e0ff]" />
                          Estado del Servicio
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-bold border ${statusColors[selectedService.status]}`}>
                          {getStatusLabel(selectedService.status)}
                        </span>
                      </div>
                      
                      {selectedService.status !== 'completed' ? (
                        <div className="flex gap-2 flex-wrap">
                          {statusOptions.map((option) => (
                            <Button
                              key={option.value}
                              onClick={() => handleStatusChange(option.value)}
                              disabled={updatingStatus || selectedService.status === option.value}
                              variant={selectedService.status === option.value ? 'default' : 'outline'}
                              size="sm"
                              className={selectedService.status === option.value 
                                ? 'bg-[#00e0ff] text-black' 
                                : 'border-white/20 text-slate-300 hover:border-[#00e0ff]/50'}
                            >
                              {option.label}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span>Servicio completado exitosamente</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información del Cliente */}
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-[#7200c4]" />
                      Información del Cliente
                    </h3>
                    {clientInfo ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-slate-400" />
                          <span className="text-white">{clientInfo.full_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-slate-400" />
                          <a href={`tel:${clientInfo.phone}`} className="text-[#00e0ff] hover:underline">
                            {clientInfo.phone}
                          </a>
                        </div>
                        <Button
                          onClick={() => navigate(`/chat/${selectedService.id}`)}
                          className="w-full bg-[#7200c4] text-white hover:bg-[#8e2bd9] mt-4"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Chat con Cliente
                        </Button>
                      </div>
                    ) : (
                      <p className="text-slate-500">Cargando información...</p>
                    )}
                  </div>

                  {/* Ubicaciones */}
                  <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-green-400" />
                      Ubicaciones del Servicio
                    </h3>
                    
                    <div className="space-y-4 mb-4">
                      <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                        <p className="text-green-400 font-bold text-sm mb-1">📍 PUNTO DE RECOGIDA</p>
                        <p className="text-white">{selectedService.pickup_address || 'Ver en mapa'}</p>
                      </div>
                      <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        <p className="text-red-400 font-bold text-sm mb-1">🏁 DESTINO</p>
                        <p className="text-white">{selectedService.destination_address || 'Ver en mapa'}</p>
                      </div>
                    </div>

                    {selectedService.description && (
                      <div className="p-3 bg-black/30 rounded-lg mb-4">
                        <p className="text-slate-400 text-sm font-semibold mb-1">Notas del cliente:</p>
                        <p className="text-white italic">"{selectedService.description}"</p>
                      </div>
                    )}

                    {/* Mapa */}
                    {selectedService.pickup_location && (
                      <div className="h-[300px] rounded-lg overflow-hidden border border-white/10">
                        <MapContainer
                          center={[selectedService.pickup_location.lat, selectedService.pickup_location.lng]}
                          zoom={13}
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[selectedService.pickup_location.lat, selectedService.pickup_location.lng]} icon={pickupIcon}>
                            <Popup>📍 Punto de Recogida</Popup>
                          </Marker>
                          {selectedService.destination_location && (
                            <>
                              <Marker position={[selectedService.destination_location.lat, selectedService.destination_location.lng]} icon={destinationIcon}>
                                <Popup>🏁 Destino</Popup>
                              </Marker>
                              <Polyline
                                positions={[
                                  [selectedService.pickup_location.lat, selectedService.pickup_location.lng],
                                  [selectedService.destination_location.lat, selectedService.destination_location.lng]
                                ]}
                                color="#00e0ff"
                                weight={3}
                                dashArray="10, 10"
                              />
                            </>
                          )}
                        </MapContainer>
                      </div>
                    )}

                    {/* Botón de Navegación */}
                    {selectedService.pickup_location && (
                      <Button
                        onClick={() => {
                          const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedService.pickup_location.lat},${selectedService.pickup_location.lng}`;
                          window.open(url, '_blank');
                        }}
                        className="w-full mt-4 bg-blue-500 text-white hover:bg-blue-600"
                      >
                        <Navigation className="mr-2 h-4 w-4" />
                        Abrir en Google Maps
                      </Button>
                    )}
                  </div>
                </>
              ) : (
                <div className="glass-card p-12 rounded-xl text-center">
                  <Car className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Selecciona un servicio para ver los detalles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
