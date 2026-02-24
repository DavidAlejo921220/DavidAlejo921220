import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (selectedService) {
      loadOffers(selectedService.id);
    }
  }, [selectedService]);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API}/services/my-services`);
      setServices(response.data);
      if (response.data.length > 0) {
        setSelectedService(response.data[0]);
      }
    } catch (error) {
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async (serviceId) => {
    try {
      const response = await axios.get(`${API}/offers/service/${serviceId}`);
      setOffers(response.data);
    } catch (error) {
      console.error('Error al cargar ofertas');
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      await axios.post(`${API}/offers/${offerId}/accept`);
      toast.success('Oferta aceptada');
      loadServices();
      loadOffers(selectedService.id);
    } catch (error) {
      toast.error('Error al aceptar oferta');
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
          <h1 className="text-2xl font-bold text-white">Mis Servicios</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-bold text-white mb-4">Servicios</h2>
            <div className="space-y-3">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedService?.id === service.id
                      ? 'bg-[#00e0ff]/10 border border-[#00e0ff]/30'
                      : 'bg-[#111827] border border-white/10 hover:border-white/20'
                  }`}
                  data-testid={`service-card-${service.id}`}
                >
                  <p className="text-white font-semibold">{service.vehicle_brand} {service.vehicle_model}</p>
                  <p className="text-slate-400 text-sm">{service.status}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 glass-card p-6 rounded-xl">
            {selectedService ? (
              <div data-testid="service-details">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {selectedService.vehicle_brand} {selectedService.vehicle_model}
                    </h2>
                    <p className="text-slate-400">{selectedService.vehicle_type} - {selectedService.vehicle_condition}</p>
                  </div>
                  {selectedService.driver_id && (
                    <Button
                      onClick={() => navigate(`/chat/${selectedService.id}`)}
                      className="bg-[#7200c4] text-white hover:bg-[#8e2bd9]"
                      data-testid="chat-button"
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Chat
                    </Button>
                  )}
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Ofertas Recibidas</h3>
                  {offers.length === 0 ? (
                    <p className="text-slate-400" data-testid="no-offers-message">No hay ofertas aún</p>
                  ) : (
                    <div className="space-y-3">
                      {offers.map((offer) => (
                        <div
                          key={offer.id}
                          className="bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-[#00e0ff] p-4 rounded-lg"
                          data-testid={`offer-card-${offer.id}`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-2xl font-bold text-[#00e0ff]">${offer.price}</p>
                              <p className="text-slate-400 text-sm">{offer.message}</p>
                              <p className="text-slate-500 text-xs mt-1">
                                Estado: <span className={offer.status === 'accepted' ? 'text-green-400' : 'text-yellow-400'}>{offer.status}</span>
                              </p>
                            </div>
                            {offer.status === 'pending' && (
                              <Button
                                onClick={() => handleAcceptOffer(offer.id)}
                                className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold"
                                data-testid={`accept-offer-button-${offer.id}`}
                              >
                                Aceptar
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-center py-12">Selecciona un servicio</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}