import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Send, MapPin, Navigation } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AvailableServices() {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [offerData, setOfferData] = useState({ price: '', message: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadServices();
    
    if (socket) {
      socket.on('new_service', () => {
        loadServices();
      });
    }

    return () => {
      if (socket) {
        socket.off('new_service');
      }
    };
  }, [socket]);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API}/services/available`);
      setServices(response.data);
    } catch (error) {
      console.error('Error al cargar servicios');
    }
  };

  const handleSendOffer = async () => {
    if (!offerData.price || parseFloat(offerData.price) <= 0) {
      toast.error('Ingresa un precio válido en COP');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/offers/create`, {
        service_id: selectedService.id,
        price: parseFloat(offerData.price),
        message: offerData.message
      });
      
      toast.success('✅ Oferta enviada exitosamente');
      setShowOfferDialog(false);
      setOfferData({ price: '', message: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al enviar oferta');
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
            onClick={() => navigate('/driver/dashboard')}
            className="text-slate-400 hover:text-white"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Servicios Disponibles</h1>
          <span className="text-slate-400 text-sm">({services.length} disponibles)</span>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {services.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center" data-testid="no-services-message">
            <MapPin className="h-16 w-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No hay servicios disponibles en este momento</p>
            <p className="text-slate-500 text-sm mt-2">Vuelve a revisar más tarde</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="glass-card p-6 rounded-xl hover:border-[#00e0ff]/30 transition-all border border-white/10"
                data-testid={`service-card-${service.id}`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white mb-2">
                    {service.vehicle_brand} {service.vehicle_model}
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {service.vehicle_type} - {service.vehicle_condition}
                  </p>
                  {service.distance_to_driver && (
                    <p className="text-[#00e0ff] text-sm mt-1">
                      📍 A {service.distance_to_driver} km de ti
                    </p>
                  )}
                </div>

                <div className="space-y-3 mb-4 text-sm">
                  <div className="flex items-start gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <MapPin className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-green-400 font-semibold text-xs">RECOGIDA</p>
                      <p className="text-white">{service.pickup_address || 'Ver en mapa'}</p>
                      {service.pickup_location && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.pickup_location.lat},${service.pickup_location.lng}`, '_blank');
                            }}
                            className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30"
                          >
                            📍 Google Maps
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://waze.com/ul?ll=${service.pickup_location.lat},${service.pickup_location.lng}&navigate=yes`, '_blank');
                            }}
                            className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30"
                          >
                            🗺️ Waze
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <Navigation className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-400 font-semibold text-xs">DESTINO</p>
                      <p className="text-white">{service.destination_address || 'Ver en mapa'}</p>
                      {service.destination_location && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.destination_location.lat},${service.destination_location.lng}`, '_blank');
                            }}
                            className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-500/30"
                          >
                            📍 Google Maps
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`https://waze.com/ul?ll=${service.destination_location.lat},${service.destination_location.lng}&navigate=yes`, '_blank');
                            }}
                            className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-500/30"
                          >
                            🗺️ Waze
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {service.description && (
                  <p className="text-slate-500 text-sm mb-4 line-clamp-2 italic">"{service.description}"</p>
                )}

                {/* Precio sugerido por el cliente */}
                {service.suggested_price && (
                  <div className="mb-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                    <p className="text-yellow-400 text-xs font-bold mb-1">💰 PRECIO SUGERIDO POR CLIENTE</p>
                    <p className="text-yellow-300 text-xl font-bold">{formatCurrency(service.suggested_price)}</p>
                    <p className="text-slate-500 text-xs mt-1">Puedes aceptar este valor o enviar tu propia oferta</p>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setSelectedService(service);
                    setShowOfferDialog(true);
                  }}
                  className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider"
                  data-testid={`send-offer-button-${service.id}`}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Oferta
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Oferta - MONEDA EN COP */}
      <Dialog open={showOfferDialog} onOpenChange={setShowOfferDialog}>
        <DialogContent className="bg-[#111827] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Enviar Oferta</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedService?.vehicle_brand} {selectedService?.vehicle_model}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4" data-testid="offer-form">
            {/* Info del servicio */}
            <div className="bg-black/30 p-3 rounded-lg space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-green-400 mt-0.5" />
                <span className="text-slate-300">{selectedService?.pickup_address}</span>
              </div>
              <div className="flex items-start gap-2">
                <Navigation className="h-4 w-4 text-red-400 mt-0.5" />
                <span className="text-slate-300">{selectedService?.destination_address}</span>
              </div>
            </div>

            <div>
              <Label className="text-slate-300 mb-2 block">Precio de tu Oferta (COP - Pesos Colombianos)</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-slate-500">$</span>
                <Input
                  type="number"
                  placeholder="50000"
                  value={offerData.price}
                  onChange={(e) => setOfferData({ ...offerData, price: e.target.value })}
                  className="bg-black/50 border-white/10 text-white h-12 pl-8 text-lg"
                  data-testid="offer-price-input"
                />
                <span className="absolute right-3 top-3 text-slate-500">COP</span>
              </div>
              {offerData.price && (
                <p className="text-[#00e0ff] text-sm mt-1">
                  Tu oferta: {formatCurrency(parseFloat(offerData.price) || 0)}
                </p>
              )}
            </div>
            
            <div>
              <Label className="text-slate-300 mb-2 block">Mensaje al Cliente (Opcional)</Label>
              <Textarea
                placeholder="Ej: Puedo llegar en 15 minutos, tengo grúa plataforma..."
                value={offerData.message}
                onChange={(e) => setOfferData({ ...offerData, message: e.target.value })}
                className="bg-black/50 border-white/10 text-white"
                data-testid="offer-message-input"
              />
            </div>
            
            <Button
              onClick={handleSendOffer}
              disabled={loading || !offerData.price}
              className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-12"
              data-testid="submit-offer-button"
            >
              {loading ? 'Enviando...' : `Enviar Oferta de ${formatCurrency(parseFloat(offerData.price) || 0)}`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
