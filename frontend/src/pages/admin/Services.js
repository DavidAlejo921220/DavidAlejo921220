import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Eye } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminServices() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await axios.get(`${API}/admin/services`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setServices(response.data);
    } catch (error) {
      toast.error('Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('¿Estás seguro de eliminar este servicio?')) return;
    try {
      await axios.delete(`${API}/services/${serviceId}/cancel`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Servicio eliminado');
      loadServices();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al eliminar');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      created: 'bg-blue-500/20 text-blue-400',
      negotiating: 'bg-yellow-500/20 text-yellow-400',
      accepted: 'bg-green-500/20 text-green-400',
      in_progress: 'bg-purple-500/20 text-purple-400',
      completed: 'bg-emerald-500/20 text-emerald-400',
      cancelled: 'bg-red-500/20 text-red-400'
    };
    const labels = {
      created: 'Creado',
      negotiating: 'Negociando',
      accepted: 'Aceptado',
      in_progress: 'En Progreso',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return <Badge className={styles[status] || 'bg-slate-500/20'}>{labels[status] || status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Gestión de Servicios</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="glass-card p-6 rounded-xl">
          {loading ? (
            <p className="text-slate-400 text-center py-8">Cargando...</p>
          ) : services.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No hay servicios</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400">Vehículo</th>
                    <th className="text-left py-3 px-4 text-slate-400">Origen</th>
                    <th className="text-left py-3 px-4 text-slate-400">Destino</th>
                    <th className="text-left py-3 px-4 text-slate-400">Estado</th>
                    <th className="text-left py-3 px-4 text-slate-400">Precio</th>
                    <th className="text-left py-3 px-4 text-slate-400">Fecha</th>
                    <th className="text-left py-3 px-4 text-slate-400">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-4 px-4 text-white">
                        {service.vehicle_brand} {service.vehicle_model}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-sm max-w-[150px] truncate">
                        {service.pickup_address}
                      </td>
                      <td className="py-4 px-4 text-slate-400 text-sm max-w-[150px] truncate">
                        {service.destination_address}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(service.status)}
                      </td>
                      <td className="py-4 px-4 text-[#00e0ff] font-semibold">
                        {service.final_price ? formatCurrency(service.final_price) : '-'}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-sm">
                        {new Date(service.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-4 px-4">
                        {service.status !== 'completed' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteService(service.id)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            data-testid={`delete-service-${service.id}`}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Eliminar
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
