import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Star, Truck, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ServiceOffers() {
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const [service, setService] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    loadServiceAndOffers();
  }, [serviceId]);

  const loadServiceAndOffers = async () => {
    try {
      // Cargar detalles del servicio
      const servicesRes = await axios.get(`${API}/services/my-services`);
      const currentService = servicesRes.data.find(s => s.id === serviceId);
      setService(currentService);

      // Cargar ofertas
      const offersRes = await axios.get(`${API}/offers/service/${serviceId}`);
      setOffers(offersRes.data);
    } catch (error) {
      toast.error('Error al cargar ofertas');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    setAccepting(offerId);
    try {
      await axios.post(`${API}/offers/${offerId}/accept`);
      toast.success('¡Oferta aceptada! El conductor ha sido notificado.');
      // Recargar para ver el estado actualizado
      await loadServiceAndOffers();
      // Navegar al dashboard después de un momento
      setTimeout(() => {
        navigate('/client/dashboard');
      }, 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al aceptar oferta');
    } finally {
      setAccepting(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center">
        <div className="text-[#00e0ff] text-xl">Cargando ofertas...</div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Ofertas Recibidas</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Info del Servicio */}
        {service && (
          <div className="glass-card p-6 rounded-xl mb-6 border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">
              {service.vehicle_brand} {service.vehicle_model}
            </h2>
            <p className="text-slate-400">{service.vehicle_type}</p>
            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-400 font-semibold">Recogida:</p>
                <p className="text-slate-300">{service.pickup_address || 'Ver en mapa'}</p>
              </div>
              <div>
                <p className="text-red-400 font-semibold">Destino:</p>
                <p className="text-slate-300">{service.destination_address || 'Ver en mapa'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista de Ofertas */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Truck className="h-6 w-6 text-[#00e0ff]" />
            Ofertas de Conductores
            <span className="text-slate-500 text-lg">({offers.length})</span>
          </h2>

          {offers.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg mb-2">Aún no hay ofertas</p>
              <p className="text-slate-500 text-sm">
                Los conductores cercanos están revisando tu solicitud.
                <br />Te notificaremos cuando recibas ofertas.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className={`p-6 rounded-xl border transition-all ${
                    offer.status === 'accepted' 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : 'bg-gradient-to-r from-slate-900 to-slate-800 border-[#00e0ff]/30 hover:border-[#00e0ff]/50'
                  }`}
                  data-testid={`offer-card-${offer.id}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Info del Conductor */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-[#00e0ff]/20 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-[#00e0ff]" />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg">
                            {offer.driver_name || 'Conductor'}
                          </p>
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-sm">{offer.driver_rating || '5.0'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Precio */}
                      <div className="mb-3">
                        <p className="text-3xl font-bold text-[#00e0ff]">
                          {formatCurrency(offer.price)}
                        </p>
                      </div>

                      {/* Mensaje del conductor */}
                      {offer.message && (
                        <div className="bg-white/5 p-3 rounded-lg mb-3">
                          <p className="text-slate-300 text-sm italic">"{offer.message}"</p>
                        </div>
                      )}

                      {/* Estado */}
                      <div className="flex items-center gap-2">
                        {offer.status === 'pending' && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">
                            Pendiente
                          </span>
                        )}
                        {offer.status === 'accepted' && (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Aceptada
                          </span>
                        )}
                        {offer.status === 'rejected' && (
                          <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">
                            Rechazada
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botón de Aceptar */}
                    {offer.status === 'pending' && (
                      <div className="ml-4">
                        <Button
                          onClick={() => handleAcceptOffer(offer.id)}
                          disabled={accepting === offer.id}
                          className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold px-6 py-3 h-auto"
                          data-testid={`accept-offer-${offer.id}`}
                        >
                          {accepting === offer.id ? (
                            'Aceptando...'
                          ) : (
                            <>
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Aceptar Oferta
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón volver */}
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            onClick={() => navigate('/client/dashboard')}
            className="border-white/20 text-slate-300 hover:bg-white/10"
          >
            Volver al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
