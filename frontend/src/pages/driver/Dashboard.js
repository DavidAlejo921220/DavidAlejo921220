import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DollarSign, Truck, TrendingUp, MapPin, Power } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, earnings: 0 });
  const [available, setAvailable] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);

  useEffect(() => {

  const toggleAvailability = async (checked) => {
    setAvailable(checked);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            await axios.post(`${API}/drivers/availability`, {
              available: checked,
              current_location: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              }
            });
            
            toast.success(checked ? '✅ Ahora estás disponible para recibir servicios' : '⏸️ Ahora estás no disponible');
            
            // Si está disponible, iniciar actualización automática de ubicación
            if (checked) {
              const interval = setInterval(() => {
                navigator.geolocation.getCurrentPosition((pos) => {
                  // Actualizar ubicación cada 15 segundos
                  axios.post(`${API}/drivers/availability`, {
                    available: true,
                    current_location: {
                      lat: pos.coords.latitude,
                      lng: pos.coords.longitude
                    }
                  }).catch(err => console.error('Error updating location:', err));
                });
              }, 15000);
              setLocationInterval(interval);
            } else {
              // Detener actualización de ubicación
              if (locationInterval) {
                clearInterval(locationInterval);
                setLocationInterval(null);
              }
            }
          } catch (error) {
            toast.error('Error al actualizar disponibilidad');
            setAvailable(!checked);
          }
        },
        (error) => {
          toast.error('No se pudo obtener tu ubicación. Verifica los permisos.');
          setAvailable(false);
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
      setAvailable(false);
    }
  };

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API}/services/my-services`);
      const myServices = response.data;
      setServices(myServices);
      
      const earnings = myServices
        .filter(s => s.status === 'completed' && s.final_price)
        .reduce((sum, s) => sum + s.final_price, 0);
      
      setStats({
        total: myServices.length,
        active: myServices.filter(s => ['accepted', 'on_way', 'picked_up', 'in_transit'].includes(s.status)).length,
        completed: myServices.filter(s => s.status === 'completed').length,
        earnings: earnings
      });
    } catch (error) {
      toast.error('Error al cargar datos');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://customer-assets.emergentagent.com/job_tow-nexus/artifacts/ykgd2d1v_WhatsApp%20Image%202026-02-23%20at%207.40.40%20PM.jpeg" 
              alt="TowNexus" 
              className="h-10"
            />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-300">Conductor: {user?.full_name}</span>
            <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-white" data-testid="logout-button">
              Salir
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Toggle de Disponibilidad */}
        <div className="glass-card p-6 rounded-xl mb-8 border-2 border-[#00e0ff]/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Power className={`h-8 w-8 ${available ? 'text-green-400' : 'text-slate-500'}`} />
              <div>
                <Label htmlFor="availability-toggle" className="text-xl font-bold text-white cursor-pointer">
                  Estado: {available ? 'Disponible' : 'No Disponible'}
                </Label>
                <p className="text-sm text-slate-400">
                  {available ? 'Estás recibiendo solicitudes de servicio' : 'Activa para empezar a recibir servicios'}
                </p>
              </div>
            </div>
            <Switch
              id="availability-toggle"
              checked={available}
              onCheckedChange={toggleAvailability}
              className="scale-150"
              data-testid="availability-switch"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="dashboard-title">Panel de Conductor</h1>
            <p className="text-slate-400">Gestiona tus servicios y ganancias</p>
          </div>
          <Button
            onClick={() => navigate('/driver/available')}
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider"
            data-testid="view-available-button"
          >
            <MapPin className="mr-2 h-5 w-5" />
            Ver Servicios Disponibles
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl" data-testid="stat-earnings">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Ganancias</p>
                <p className="text-2xl font-bold text-white">${stats.earnings.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl" data-testid="stat-total-services">
            <div className="flex items-center gap-4">
              <div className="bg-[#00e0ff]/10 p-3 rounded-lg">
                <Truck className="h-6 w-6 text-[#00e0ff]" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Servicios</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl" data-testid="stat-active-services">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Activos</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl" data-testid="stat-completed">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Completados</p>
                <p className="text-2xl font-bold text-white">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Mis Servicios Activos</h2>
          
          {services.filter(s => ['accepted', 'on_way', 'picked_up', 'in_transit'].includes(s.status)).length === 0 ? (
            <div className="text-center py-12" data-testid="no-active-services">
              <Truck className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No tienes servicios activos</p>
              <Button
                onClick={() => navigate('/driver/available')}
                className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold"
              >
                Buscar Servicios
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {services
                .filter(s => ['accepted', 'on_way', 'picked_up', 'in_transit'].includes(s.status))
                .map((service) => (
                  <div
                    key={service.id}
                    className="bg-gradient-to-r from-slate-900 to-slate-800 border-l-4 border-[#7200c4] p-5 rounded-lg hover:translate-x-1 transition-all cursor-pointer"
                    onClick={() => navigate('/driver/my-services', { state: { serviceId: service.id } })}
                    data-testid={`active-service-${service.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white">{service.vehicle_brand} {service.vehicle_model}</h3>
                        <p className="text-slate-400 text-sm">{service.vehicle_type}</p>
                        <p className="text-[#00e0ff] font-bold mt-2">${service.final_price}</p>
                      </div>
                      <span className="text-yellow-400 font-semibold">{service.status}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}