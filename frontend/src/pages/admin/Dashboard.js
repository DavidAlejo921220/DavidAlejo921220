import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Users, Truck, DollarSign, Activity, Settings, Wallet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import { toast } from 'sonner';
import NotificationBell from '@/components/NotificationBell';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard`);
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar dashboard');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { name: 'Ene', servicios: 45, ingresos: 4500 },
    { name: 'Feb', servicios: 52, ingresos: 5200 },
    { name: 'Mar', servicios: 61, ingresos: 6100 },
    { name: 'Abr', servicios: 58, ingresos: 5800 },
    { name: 'May', servicios: 70, ingresos: 7000 },
    { name: 'Jun', servicios: 65, ingresos: 6500 },
  ];

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
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/users')}
              className="text-slate-400 hover:text-white"
              data-testid="users-nav-button"
            >
              Usuarios
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/commission')}
              className="text-slate-400 hover:text-white"
              data-testid="commission-nav-button"
            >
              Comisiones
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/wallets')}
              className="text-slate-400 hover:text-white"
              data-testid="wallets-nav-button"
            >
              Billeteras
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/admin/drivers-validation')}
              className="text-yellow-400 hover:text-yellow-300"
              data-testid="drivers-validation-nav-button"
            >
              Validar Conductores
            </Button>
            <NotificationBell />
            <span className="text-slate-300">Admin: {user?.full_name}</span>
            <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-white" data-testid="logout-button">
              Salir
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-white mb-8" data-testid="dashboard-title">Panel Administrativo</h1>

        {loading ? (
          <p className="text-slate-400">Cargando...</p>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 rounded-xl" data-testid="stat-total-services">
                <div className="flex items-center gap-4">
                  <div className="bg-[#00e0ff]/10 p-3 rounded-lg">
                    <Truck className="h-6 w-6 text-[#00e0ff]" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Servicios</p>
                    <p className="text-2xl font-bold text-white">{stats?.total_services || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl" data-testid="stat-active-services">
                <div className="flex items-center gap-4">
                  <div className="bg-yellow-500/10 p-3 rounded-lg">
                    <Activity className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Servicios Activos</p>
                    <p className="text-2xl font-bold text-white">{stats?.active_services || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl" data-testid="stat-total-users">
                <div className="flex items-center gap-4">
                  <div className="bg-purple-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Usuarios</p>
                    <p className="text-2xl font-bold text-white">{stats?.total_users || 0}</p>
                  </div>
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl" data-testid="stat-total-drivers">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Conductores</p>
                    <p className="text-2xl font-bold text-white">{stats?.total_drivers || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-6 rounded-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Ingresos Totales</h2>
                  <DollarSign className="h-6 w-6 text-[#00e0ff]" />
                </div>
                <p className="text-5xl font-bold text-[#00e0ff]" data-testid="total-revenue">
                  {formatCurrency(stats?.total_revenue || 0)}
                </p>
                <p className="text-slate-400 mt-2">Comisión: {formatCurrency(stats?.total_commission || 0)}</p>
              </div>

              <div className="glass-card p-6 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-6">Acciones Rápidas</h2>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate('/admin/users')}
                    className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold justify-start"
                  >
                    <Users className="mr-2 h-5 w-5" />
                    Gestionar Usuarios
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/services')}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 font-bold justify-start"
                  >
                    <Truck className="mr-2 h-5 w-5" />
                    Gestionar Servicios
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/withdrawals')}
                    className="w-full bg-green-500 text-white hover:bg-green-600 font-bold justify-start"
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Solicitudes de Retiro
                  </Button>
                  <Button
                    onClick={() => navigate('/admin/commission')}
                    className="w-full bg-[#7200c4] text-white hover:bg-[#8e2bd9] font-bold justify-start"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Configurar Comisiones
                  </Button>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-xl">
              <h2 className="text-2xl font-bold text-white mb-6">Servicios por Mes</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="servicios" fill="#00e0ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
}