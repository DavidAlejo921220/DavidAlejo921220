import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, MapPin, Clock, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import NotificationBell from '@/components/NotificationBell';
import AvailableDriversMap from '@/components/AvailableDriversMap';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ClientDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API}/services/my-services`);
      setServices(response.data);
    } catch (error) {
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      created: 'text-blue-400',
      negotiating: 'text-yellow-400',
      accepted: 'text-green-400',
      on_way: 'text-cyan-400',
      picked_up: 'text-purple-400',
      in_transit: 'text-indigo-400',
      completed: 'text-emerald-400',
      cancelled: 'text-red-400'
    };
    return colors[status] || 'text-slate-400';
  };

  const getStatusText = (status) => {
    const texts = {
      created: 'Creado',
      negotiating: 'En negociación',
      accepted: 'Aceptado',
      on_way: 'En camino',
      picked_up: 'Recogido',
      in_transit: 'En tránsito',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="https://static.prod-images.emergentagent.com/jobs/4d6d68fe-1392-4b8b-95de-0896fbae6116/images/6dd94c30201b82c0db798c24c5f11f318e92f4633b0624b679a02b2944046c88.png" 
              alt="TowNexus" 
              className="h-10"
            />
          </div>
          <div className="flex items-center gap-4">
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

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl" data-testid="stat-total-services">
            <div className="flex items-center gap-4">
              <div className="bg-[#00e0ff]/10 p-3 rounded-lg">
                <MapPin className="h-6 w-6 text-[#00e0ff]" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Servicios</p>
                <p className="text-2xl font-bold text-white">{services.length}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl" data-testid="stat-active-services">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-500/10 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Activos</p>
                <p className="text-2xl font-bold text-white">
                  {services.filter(s => ['negotiating', 'accepted', 'on_way', 'picked_up', 'in_transit'].includes(s.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl" data-testid="stat-completed-services">
            <div className="flex items-center gap-4">
              <div className="bg-green-500/10 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Completados</p>
                <p className="text-2xl font-bold text-white">
                  {services.filter(s => s.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa con Grúas Disponibles */}
        <div className="glass-card p-6 rounded-xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Grúas Disponibles Cerca de Ti</h2>
          <p className="text-slate-400 mb-4 text-sm">
            Estas grúas están disponibles y listas para ayudarte
          </p>
          <AvailableDriversMap />
        </div>


        <div className="glass-card p-6 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-6">Mis Servicios</h2>
          
          {loading ? (
            <p className="text-slate-400 text-center py-8">Cargando...</p>
          ) : services.length === 0 ? (
            <div className="text-center py-12" data-testid="no-services-message">
              <MapPin className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">No tienes servicios aún</p>
              <Button
                onClick={() => navigate('/client/create-service')}
                className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold"
              >
                Solicitar tu Primera Grúa
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-[#111827] border border-white/10 rounded-lg p-5 hover:border-[#00e0ff]/30 transition-all cursor-pointer"
                  onClick={() => navigate('/client/my-services', { state: { serviceId: service.id } })}
                  data-testid={`service-item-${service.id}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-white">{service.vehicle_brand} {service.vehicle_model}</h3>
                      <p className="text-slate-400 text-sm">{service.vehicle_type} - {service.vehicle_condition}</p>
                    </div>
                    <span className={`font-semibold ${getStatusColor(service.status)}`}>
                      {getStatusText(service.status)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-500">
                    Creado: {new Date(service.created_at).toLocaleDateString('es-ES')}
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