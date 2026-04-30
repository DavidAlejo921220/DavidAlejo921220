import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DollarSign, Truck, TrendingUp, MapPin, Power, AlertTriangle, MessageCircle, FileWarning, CreditCard, List, Wallet } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';
import NotificationBell from '@/components/NotificationBell';
import RechargeModal from '@/components/RechargeModal';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const WHATSAPP_HELP = '+573025159176';

export default function DriverDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [services, setServices] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0, earnings: 0 });
  const [available, setAvailable] = useState(false);
  const [locationInterval, setLocationInterval] = useState(null);
  const [wallet, setWallet] = useState({ balance: 0, needs_recharge: false });
  const [driverInfo, setDriverInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const loadWallet = async () => {
    try {
      const response = await axios.get(`${API}/drivers/wallet`);
      setWallet(response.data);
      setDriverInfo(response.data.driver_info || null);
      
      // Cargar estado de disponibilidad desde el backend
      if (response.data.available !== undefined) {
        setAvailable(response.data.available);
        
        // Si estaba disponible, reiniciar el intervalo de ubicación
        if (response.data.available && navigator.geolocation) {
          startLocationTracking();
        }
      }
      
      if (response.data.low_balance_warning) {
        toast.warning(`⚠️ Saldo bajo: ${formatCurrency(response.data.balance)}`, { duration: 10000 });
      }
    } catch (error) {
      // Si no encuentra el conductor, significa que no ha completado el registro
      if (error.response?.status === 404) {
        setDriverInfo(null);
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para iniciar tracking de ubicación
  const startLocationTracking = () => {
    if (locationInterval) clearInterval(locationInterval);
    
    const interval = setInterval(() => {
      navigator.geolocation.getCurrentPosition((pos) => {
        axios.post(`${API}/drivers/availability`, {
          available: true,
          current_location: { lat: pos.coords.latitude, lng: pos.coords.longitude }
        }).catch(() => {});
      });
    }, 15000);
    setLocationInterval(interval);
  };

  const toggleAvailability = async (checked) => {
    // Verificar si puede activarse
    if (checked) {
      if (!driverInfo) {
        toast.error('Debes completar tu registro de conductor primero');
        navigate('/driver/registration');
        return;
      }
      if (wallet.balance <= 0) {
        toast.error('No puedes activarte con saldo $0. Contacta a soporte para recargar.');
        openWhatsAppHelp('recarga de saldo');
        return;
      }
    }

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
            
            toast.success(checked ? '✅ Ahora estás disponible' : '⏸️ No disponible');
            
            if (checked) {
              startLocationTracking();
            } else {
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
        () => {
          toast.error('No se pudo obtener tu ubicación');
          setAvailable(false);
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
      setAvailable(false);
    }
  };

  useEffect(() => {
    loadData();
    loadWallet();
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
      // Error silenciado
    }
  };

  const openWhatsAppHelp = (topic = '') => {
    const message = encodeURIComponent(`Hola, necesito ayuda con ${topic || 'GruaApp'}`);
    window.open(`https://wa.me/${WHATSAPP_HELP.replace('+', '')}?text=${message}`, '_blank');
  };

  const canAccessServices = driverInfo && wallet.balance > 0;

  // Mostrar pantalla de registro pendiente si no tiene registro de conductor
  if (!loading && !driverInfo) {
    return (
      <div className="min-h-screen bg-[#0a1120]">
        <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <img src="https://static.prod-images.emergentagent.com/jobs/4d6d68fe-1392-4b8b-95de-0896fbae6116/images/6dd94c30201b82c0db798c24c5f11f318e92f4633b0624b679a02b2944046c88.png" alt="GruaApp" className="h-10" />
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate('/wallet')}
                className="text-[#00e0ff] hover:bg-[#00e0ff]/10"
              >
                <Wallet className="h-5 w-5" />
              </Button>
              <NotificationBell />
              <span className="text-slate-300">{user?.full_name}</span>
              <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-white">Salir</Button>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-6 py-16">
          <div className="max-w-xl mx-auto text-center">
            <FileWarning className="h-24 w-24 text-yellow-400 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4">Completa tu Registro</h1>
            <p className="text-slate-400 text-lg mb-8">
              Para empezar a recibir servicios, necesitas completar tu registro con la información de tu vehículo, placa y fotos.
            </p>
            <Button
              onClick={() => navigate('/driver/registration')}
              className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-14 px-8 text-lg"
              data-testid="complete-registration-button"
            >
              <Truck className="mr-2 h-6 w-6" />
              Completar Registro de Conductor
            </Button>
            <div className="mt-8">
              <Button
                variant="outline"
                onClick={() => openWhatsAppHelp('registro de conductor')}
                className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                ¿Necesitas ayuda?
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <img src="https://static.prod-images.emergentagent.com/jobs/4d6d68fe-1392-4b8b-95de-0896fbae6116/images/6dd94c30201b82c0db798c24c5f11f318e92f4633b0624b679a02b2944046c88.png" alt="GruaApp" className="h-10" />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <span className="text-slate-300">Conductor: {user?.full_name}</span>
            <Button variant="ghost" onClick={logout} className="text-slate-400 hover:text-white" data-testid="logout-button">Salir</Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Alerta de saldo 0 - BLOQUEANTE */}
        {wallet.balance <= 0 && (
          <div className="glass-card p-6 rounded-xl mb-8 border-2 border-red-500/50 bg-red-500/10">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-12 w-12 text-red-400 flex-shrink-0" />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-red-400 mb-2">⛔ Saldo Agotado - No puedes recibir servicios</h2>
                <p className="text-slate-300 mb-4">
                  Tu saldo es <span className="font-bold text-red-400">{formatCurrency(0)}</span>. 
                  Necesitas recargar para poder activarte y ver servicios disponibles.
                </p>
                <Button
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-[#7200c4] text-white hover:bg-[#8e2bd9] font-bold"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Recargar Saldo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle de Disponibilidad */}
        <div className={`glass-card p-6 rounded-xl mb-8 border-2 ${canAccessServices ? 'border-[#00e0ff]/30' : 'border-red-500/30 opacity-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Power className={`h-8 w-8 ${available ? 'text-green-400' : 'text-slate-500'}`} />
              <div>
                <Label htmlFor="availability-toggle" className="text-xl font-bold text-white cursor-pointer">
                  Estado: {available ? 'Disponible' : 'No Disponible'}
                </Label>
                <p className="text-sm text-slate-400">
                  {!canAccessServices 
                    ? '⚠️ Necesitas saldo para activarte' 
                    : available ? 'Recibiendo solicitudes' : 'Activa para recibir servicios'}
                </p>
              </div>
            </div>
            <Switch
              id="availability-toggle"
              checked={available}
              onCheckedChange={toggleAvailability}
              className="scale-150"
              disabled={!canAccessServices}
              data-testid="availability-switch"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="dashboard-title">Panel de Conductor</h1>
            <p className="text-slate-400">Gestiona tus servicios y ganancias</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/driver/my-services')}
              className="bg-[#7200c4] text-white hover:bg-[#8e2bd9] font-bold uppercase tracking-wider"
              data-testid="my-services-button"
            >
              <List className="mr-2 h-5 w-5" />
              Mis Servicios
            </Button>
            <Button
              onClick={() => {
                if (!canAccessServices) {
                  toast.error('Necesitas saldo para ver servicios disponibles');
                  return;
                }
                navigate('/driver/available');
              }}
              className={`font-bold uppercase tracking-wider ${canAccessServices ? 'bg-[#00e0ff] text-black hover:bg-[#33eaff]' : 'bg-slate-600 text-slate-400 cursor-not-allowed'}`}
              disabled={!canAccessServices}
              data-testid="view-available-button"
            >
              <MapPin className="mr-2 h-5 w-5" />
              Ver Disponibles
            </Button>
          </div>
        </div>

        {/* Saldo de Billetera con botón de recarga */}
        {wallet.needs_recharge && wallet.balance > 0 && (
          <div className="glass-card p-6 rounded-xl mb-8 border-2 border-yellow-500/50 bg-yellow-500/5">
            <div className="flex items-start gap-4">
              <DollarSign className="h-8 w-8 text-yellow-400" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-yellow-400 mb-2">⚠️ Saldo Bajo</h3>
                <p className="text-slate-300 mb-3">
                  Tu saldo es <span className="font-bold text-yellow-400">{formatCurrency(wallet.balance)}</span>. 
                  Recarga pronto para no quedarte sin saldo.
                </p>
                <Button
                  onClick={() => setShowRechargeModal(true)}
                  className="bg-[#7200c4] text-white hover:bg-[#8e2bd9] font-bold"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Recargar Saldo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Saldo Disponible</p>
                <p className={`text-3xl font-bold mt-2 ${wallet.balance <= 0 ? 'text-red-400' : wallet.balance < 1000 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {formatCurrency(wallet.balance)}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${wallet.balance <= 0 ? 'text-red-400' : 'text-green-400'}`} />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Servicios Activos</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.active}</p>
              </div>
              <Truck className="h-8 w-8 text-[#00e0ff]" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Completados</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.completed}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border border-white/10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-400 text-sm">Ganancias Totales</p>
                <p className="text-3xl font-bold text-white mt-2">{formatCurrency(stats.earnings)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Lista de servicios */}
        <div className="glass-card p-6 rounded-xl border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">Mis Servicios</h2>
          {services.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-16 w-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No tienes servicios asignados</p>
              {canAccessServices && (
                <Button
                  onClick={() => navigate('/driver/available')}
                  className="mt-4 bg-[#00e0ff] text-black hover:bg-[#33eaff]"
                >
                  Buscar Servicios Disponibles
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {services.slice(0, 5).map(service => (
                <div key={service.id} className="p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-white font-semibold">{service.vehicle_brand} {service.vehicle_model}</p>
                      <p className="text-sm text-slate-400">{service.vehicle_type}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        service.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        service.status === 'accepted' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {service.status.toUpperCase()}
                      </span>
                      {service.final_price && (
                        <p className="text-green-400 font-bold mt-1">{formatCurrency(service.final_price)}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botón de Ayuda flotante */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-3">
          <Button
            onClick={() => setShowRechargeModal(true)}
            className="bg-[#7200c4] text-white hover:bg-[#8e2bd9] shadow-lg rounded-full h-12 px-4"
            data-testid="floating-recharge-button"
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Recargar
          </Button>
          <Button
            onClick={() => openWhatsAppHelp()}
            className="bg-green-500 text-white hover:bg-green-600 shadow-lg rounded-full h-12 px-4"
            data-testid="floating-help-button"
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            Ayuda
          </Button>
        </div>
      </div>

      {/* Modal de Recarga */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        balance={wallet.balance}
        vehiclePlate={driverInfo?.vehicle_plate}
      />
    </div>
  );
}
