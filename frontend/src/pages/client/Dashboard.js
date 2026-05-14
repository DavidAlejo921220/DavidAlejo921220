import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MapPin, Clock, TrendingUp, MessageCircle, Truck, Eye, CheckCircle, Navigation, Phone, User, Star, Wallet } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import axios from 'axios';
import { toast } from 'sonner';
import NotificationBell from '@/components/NotificationBell';
import AvailableDriversMap from '@/components/AvailableDriversMap';
import RatingTipModal from '@/components/RatingTipModal';
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

const driverIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WHATSAPP_HELP = '+573025159176';

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, logout, token } = useAuth();
  const { socket } = useSocket();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedService, setSelectedService] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [mapView, setMapView] = useState('drivers');
  const [driverLocation, setDriverLocation] = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [driverVehicleInfo, setDriverVehicleInfo] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [serviceToRate, setServiceToRate] = useState(null);

  const loadServices = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API}/services/my-services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
      setLoading(false);

      const active = response.data.find(s => ['accepted', 'in_progress', 'picked_up'].includes(s.status));
      if (active) {
        setSelectedService(active);
        setMapView('tracking');
        loadDriverInfo(active.driver_id);
      }
    } catch {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const termsAccepted = localStorage.getItem('gruaapp_terms_accepted');
    if (!termsAccepted) {
      setShowTermsPopup(true);
    }
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    if (socket && selectedService) {
      socket.on('driver_location_update', (data) => {
        if (data.service_id === selectedService.id) {
          setDriverLocation(data.location);
        }
      });

      return () => {
        socket.off('driver_location_update');
      };
    }
  }, [socket, selectedService]);

  const loadDriverInfo = async (driverId) => {
    if (!driverId || !token) return;
    try {
      const response = await axios.get(`${API}/auth/users/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDriverInfo(response.data);
      
      // Cargar info del vehículo del conductor
      const vehicleResponse = await axios.get(`${API}/drivers/info/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDriverVehicleInfo(vehicleResponse.data);
    } catch {
      // Error silenciado
    }
  };

  const checkAndShowRating = async (service) => {
    if (service.status === 'completed' && service.driver_id && token) {
      try {
        const response = await axios.get(`${API}/ratings/service/${service.id}/check`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.data.rated) {
          setServiceToRate(service);
          setShowRatingModal(true);
        }
      } catch (error) {
        // Error silenciado
      }
    }
  };

  const handleViewService = async (service) => {
    setSelectedService(service);
    setDriverLocation(null);
    setDriverInfo(null);
    setDriverVehicleInfo(null);
    
    if (service.driver_id) {
      await loadDriverInfo(service.driver_id);
    }
    
    setShowDetailDialog(true);
    
    // Si el servicio está completado, verificar si necesita calificación
    if (service.status === 'completed') {
      await checkAndShowRating(service);
    }
  };

  const acceptTerms = () => {
    localStorage.setItem('gruaapp_terms_accepted', 'true');
    setShowTermsPopup(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      created: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      negotiating: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
      on_way: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      picked_up: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      in_transit: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status] || 'bg-slate-500/20 text-slate-400';
  };

  const getStatusText = (status) => {
    const texts = {
      created: '📝 Creado',
      negotiating: '💬 En negociación',
      accepted: '✅ Aceptado',
      on_way: '🚛 En camino',
      picked_up: '🔧 Recogido',
      in_transit: '🛣️ En tránsito',
      completed: '✔️ Completado',
      cancelled: '❌ Cancelado'
    };
    return texts[status] || status;
  };

  const getFilteredServices = () => {
    if (filter === 'all') return services;
    if (filter === 'active') return services.filter(s => !['completed', 'cancelled'].includes(s.status));
    if (filter === 'completed') return services.filter(s => s.status === 'completed');
    return services;
  };

  const filteredServices = getFilteredServices();
  const stats = {
    total: services.length,
    active: services.filter(s => !['completed', 'cancelled'].includes(s.status)).length,
    completed: services.filter(s => s.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://static.prod-images.emergentagent.com/jobs/4d6d68fe-1392-4b8b-95de-0896fbae6116/images/6dd94c30201b82c0db798c24c5f11f318e92f4633b0624b679a02b2944046c88.png" 
              alt="GruaApp" 
              className="h-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/wallet')}
              className="text-[#00e0ff] hover:bg-[#00e0ff]/10"
              data-testid="wallet-button"
            >
              <Wallet className="h-5 w-5" />
            </Button>
            <NotificationBell />
            <span className="text-slate-300">Hola, {user?.full_name}</span>
            <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-white" data-testid="logout-button">
              Salir
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="dashboard-title">Panel de Cliente</h1>
            <p className="text-slate-400">Gestiona tus solicitudes de servicio</p>
          </div>
          <Button
            onClick={() => navigate('/client/create-service')}
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider"
            data-testid="create-service-button"
          >
            <Plus className="mr-2 h-5 w-5" />
            Solicitar Grúa
          </Button>
        </div>

        {/* Stats con filtros funcionales */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div 
            onClick={() => setFilter('all')}
            className={`glass-card p-6 rounded-xl cursor-pointer transition-all ${filter === 'all' ? 'border-2 border-[#00e0ff]' : 'border border-white/10 hover:border-white/30'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Servicios Totales</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <Truck className="h-8 w-8 text-[#00e0ff]" />
            </div>
          </div>

          <div 
            onClick={() => setFilter('active')}
            className={`glass-card p-6 rounded-xl cursor-pointer transition-all ${filter === 'active' ? 'border-2 border-yellow-400' : 'border border-white/10 hover:border-white/30'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Servicios Activos</p>
                <p className="text-3xl font-bold text-yellow-400 mt-2">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
            {filter === 'active' && <p className="text-yellow-400 text-xs mt-2">✓ Filtrando activos</p>}
          </div>

          <div 
            onClick={() => setFilter('completed')}
            className={`glass-card p-6 rounded-xl cursor-pointer transition-all ${filter === 'completed' ? 'border-2 border-green-400' : 'border border-white/10 hover:border-white/30'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Completados</p>
                <p className="text-3xl font-bold text-green-400 mt-2">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            {filter === 'completed' && <p className="text-green-400 text-xs mt-2">✓ Filtrando completados</p>}
          </div>
        </div>

        {/* Mapa de Conductores */}
        <div className="glass-card p-6 rounded-xl mb-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#00e0ff]" />
            Conductores Disponibles
          </h2>
          <div className="h-[300px] rounded-lg overflow-hidden">
            <AvailableDriversMap />
          </div>
        </div>

        {/* Lista de Servicios */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">
              {filter === 'all' ? 'Todos los Servicios' : filter === 'active' ? 'Servicios Activos' : 'Servicios Completados'}
              <span className="text-slate-500 text-lg ml-2">({filteredServices.length})</span>
            </h2>
            {filter !== 'all' && (
              <Button variant="ghost" onClick={() => setFilter('all')} className="text-slate-400 hover:text-white">
                Ver todos
              </Button>
            )}
          </div>
          
          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">
                {filter === 'all' ? 'No tienes servicios' : filter === 'active' ? 'No hay servicios activos' : 'No hay servicios completados'}
              </p>
              {filter === 'all' && (
                <Button
                  onClick={() => navigate('/client/create-service')}
                  className="mt-4 bg-[#00e0ff] text-black hover:bg-[#33eaff]"
                >
                  Solicitar tu primera grúa
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                  data-testid={`service-card-${service.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">
                          {service.vehicle_brand} {service.vehicle_model}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(service.status)}`}>
                          {getStatusText(service.status)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{service.vehicle_type}</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-green-400" />
                          {service.pickup_address || 'Ver ubicación'}
                        </p>
                        <p className="text-sm text-slate-500 flex items-center gap-1">
                          <Navigation className="h-3 w-3 text-red-400" />
                          {service.destination_address || 'Ver destino'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {service.final_price && (
                        <p className="text-[#00e0ff] font-bold text-xl">{formatCurrency(service.final_price)}</p>
                      )}
                      <div className="text-sm text-slate-500 mt-1">
                        {new Date(service.created_at).toLocaleDateString('es-CO')}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewService(service)}
                        className="mt-2 border-[#00e0ff]/50 text-[#00e0ff] hover:bg-[#00e0ff]/10"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Detalle
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Ayuda flotante */}
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={() => {
              const message = encodeURIComponent('Hola, necesito ayuda con GruaApp');
              window.open(`https://wa.me/${WHATSAPP_HELP.replace('+', '')}?text=${message}`, '_blank');
            }}
            className="bg-green-500 text-white hover:bg-green-600 shadow-lg rounded-full h-14 px-6"
            data-testid="floating-help-button"
          >
            <MessageCircle className="h-6 w-6 mr-2" />
            Ayuda
          </Button>
        </div>
      </div>

      {/* Dialog de Detalle del Servicio con Mapa del Conductor */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {selectedService?.vehicle_brand} {selectedService?.vehicle_model}
            </DialogTitle>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-4 mt-4">
              {/* Estado */}
              <div className={`p-3 rounded-lg border text-center ${getStatusColor(selectedService.status)}`}>
                <p className="text-lg font-bold">{getStatusText(selectedService.status)}</p>
              </div>

              {/* Precio */}
              {selectedService.final_price && (
                <div className="text-center">
                  <p className="text-slate-400 text-sm">Precio acordado</p>
                  <p className="text-[#00e0ff] text-3xl font-bold">{formatCurrency(selectedService.final_price)}</p>
                </div>
              )}

              {/* Info del Conductor (si hay conductor asignado) */}
              {selectedService.driver_id && driverInfo && (
                <div className="bg-[#00e0ff]/10 p-4 rounded-lg border border-[#00e0ff]/30">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <User className="h-5 w-5 text-[#00e0ff]" />
                    Tu Conductor
                  </h4>
                  <div className="space-y-2">
                    <p className="text-white text-lg font-bold">{driverInfo.full_name}</p>
                    <a 
                      href={`tel:${driverInfo.phone}`}
                      className="flex items-center gap-2 text-[#00e0ff] hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      {driverInfo.phone}
                    </a>
                    {/* Info del Vehículo */}
                    {driverVehicleInfo && (
                      <div className="mt-3 p-3 bg-black/30 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-400 font-bold">
                          <Truck className="h-4 w-4" />
                          Placa: {driverVehicleInfo.vehicle_plate || 'N/A'}
                        </div>
                        <p className="text-slate-400 text-sm mt-1">
                          {driverVehicleInfo.vehicle_brand} {driverVehicleInfo.vehicle_model}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      onClick={() => navigate(`/chat/${selectedService.id}`)}
                      className="flex-1 bg-[#7200c4] text-white hover:bg-[#8e2bd9]"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                    <Button
                      onClick={() => window.open(`tel:${driverInfo.phone}`, '_self')}
                      className="flex-1 bg-green-500 text-white hover:bg-green-600"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </Button>
                  </div>
                </div>
              )}

              {/* Mapa con ubicación del conductor */}
              {selectedService.pickup_location && ['accepted', 'on_way'].includes(selectedService.status) && (
                <div>
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-400" />
                    Ubicación de la Grúa
                  </h4>
                  <div className="h-[250px] rounded-lg overflow-hidden border border-white/10">
                    <MapContainer
                      center={[selectedService.pickup_location.lat, selectedService.pickup_location.lng]}
                      zoom={14}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      <Marker position={[selectedService.pickup_location.lat, selectedService.pickup_location.lng]} icon={pickupIcon}>
                        <Popup>📍 Tu ubicación</Popup>
                      </Marker>
                      {driverLocation && (
                        <>
                          <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
                            <Popup>🚛 Tu grúa viene aquí</Popup>
                          </Marker>
                          <Polyline
                            positions={[
                              [driverLocation.lat, driverLocation.lng],
                              [selectedService.pickup_location.lat, selectedService.pickup_location.lng]
                            ]}
                            color="#00e0ff"
                            weight={3}
                          />
                        </>
                      )}
                    </MapContainer>
                  </div>
                  {!driverLocation && (
                    <p className="text-slate-500 text-sm text-center mt-2">
                      Esperando ubicación del conductor...
                    </p>
                  )}
                </div>
              )}

              {/* Direcciones */}
              <div className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                  <p className="text-green-400 font-bold text-xs mb-1">📍 RECOGIDA</p>
                  <p className="text-white">{selectedService.pickup_address}</p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-400 font-bold text-xs mb-1">🏁 DESTINO</p>
                  <p className="text-white">{selectedService.destination_address}</p>
                </div>
              </div>

              {/* Ver Ofertas */}
              {['created', 'negotiating'].includes(selectedService.status) && (
                <Button
                  onClick={() => {
                    setShowDetailDialog(false);
                    navigate(`/client/service/${selectedService.id}/offers`);
                  }}
                  className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold"
                >
                  Ver Ofertas de Conductores
                </Button>
              )}

              {/* Botón para calificar servicio completado */}
              {selectedService.status === 'completed' && selectedService.driver_id && (
                <Button
                  onClick={() => {
                    setServiceToRate(selectedService);
                    setShowRatingModal(true);
                  }}
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-bold"
                  data-testid="rate-service-button"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Calificar Servicio y Dejar Propina
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Popup de Términos y Condiciones */}
      <Dialog open={showTermsPopup} onOpenChange={() => {}}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-lg" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              ⚠️ Términos de Uso
            </DialogTitle>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg text-sm text-slate-300 max-h-[300px] overflow-y-auto">
              <p className="mb-4">
                <strong className="text-white">EXENCIÓN DE RESPONSABILIDAD</strong>
              </p>
              <p className="mb-4">
                La aplicación <strong>GruaApp</strong> actúa únicamente como una plataforma tecnológica que conecta a usuarios que requieren servicios de grúa con conductores independientes que ofrecen dicho servicio.
              </p>
              <p className="mb-4">
                La plataforma <strong>NO presta directamente el servicio de grúa</strong> ni se hace responsable por la ejecución, calidad del servicio, daños, retrasos o cualquier inconveniente derivado del servicio prestado por los conductores.
              </p>
              <p className="mb-4">
                En caso de presentarse algún incidente o inconveniente durante la prestación del servicio, la plataforma podrá proporcionar los datos del conductor o del vehículo involucrado para facilitar la comunicación entre las partes y la resolución del caso.
              </p>
              <p className="text-yellow-400 font-bold">
                Al continuar usando la aplicación, aceptas estos términos y condiciones.
              </p>
            </div>
            
            <Button
              onClick={acceptTerms}
              className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase h-12"
            >
              Acepto los Términos
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Calificación y Propina */}
      <RatingTipModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        service={serviceToRate || selectedService}
        driverInfo={driverInfo}
        onComplete={() => {
          setServiceToRate(null);
          loadServices();
        }}
      />
    </div>
  );
}
