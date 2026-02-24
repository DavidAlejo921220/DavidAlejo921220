import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const statusOptions = [
  { value: 'accepted', label: 'Aceptado' },
  { value: 'on_way', label: 'En camino' },
  { value: 'picked_up', label: 'Recogido' },
  { value: 'in_transit', label: 'En tránsito' },
  { value: 'completed', label: 'Completado' },
];

export default function DriverMyServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API}/services/my-services`);
      setServices(response.data);
      if (response.data.length > 0) {
        setSelectedService(response.data[0]);
      }
    } catch (error) {
      toast.error('Error al cargar servicios');
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await axios.post(`${API}/services/${selectedService.id}/update-status`, {
        status: newStatus
      });
      toast.success('Estado actualizado');
      loadServices();
    } catch (error) {
      toast.error('Error al actualizar estado');
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
                      ? 'bg-[#7200c4]/10 border border-[#7200c4]/30'
                      : 'bg-[#111827] border border-white/10 hover:border-white/20'
                  }`}
                  data-testid={`service-item-${service.id}`}
                >
                  <p className="text-white font-semibold">{service.vehicle_brand} {service.vehicle_model}</p>
                  <p className="text-slate-400 text-sm">${service.final_price}</p>
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
                    <p className="text-[#00e0ff] text-3xl font-bold mt-3">${selectedService.final_price}</p>
                  </div>
                  <Button
                    onClick={() => navigate(`/chat/${selectedService.id}`)}
                    className="bg-[#7200c4] text-white hover:bg-[#8e2bd9]"
                    data-testid="chat-button"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-white mb-3">Actualizar Estado</h3>
                  <Select value={selectedService.status} onValueChange={handleStatusChange}>
                    <SelectTrigger className="bg-black/50 border-white/10 text-white h-12" data-testid="status-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111827] border-white/10">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-white">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">Recogida</h3>
                    <p className="text-white">{selectedService.pickup_address || 'Ver en mapa'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-400 mb-1">Destino</h3>
                    <p className="text-white">{selectedService.destination_address || 'Ver en mapa'}</p>
                  </div>
                  {selectedService.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-400 mb-1">Descripción</h3>
                      <p className="text-white">{selectedService.description}</p>
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