import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, UserCheck, UserX, Eye, Clock, CheckCircle, Phone, Mail, Truck, FileText, Shield } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DriversValidation() {
  const navigate = useNavigate();
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [approvedDrivers, setApprovedDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [tab, setTab] = useState('pending');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get(`${API}/admin/drivers/pending`),
        axios.get(`${API}/admin/drivers/approved`)
      ]);
      setPendingDrivers(pendingRes.data);
      setApprovedDrivers(approvedRes.data);
    } catch (error) {
      toast.error('Error al cargar conductores');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    setProcessing(true);
    try {
      await axios.post(`${API}/admin/drivers/${driverId}/approve`);
      toast.success('✅ Conductor aprobado exitosamente');
      setShowDetailDialog(false);
      loadDrivers();
    } catch (error) {
      toast.error('Error al aprobar conductor');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (driverId) => {
    if (!confirm('¿Estás seguro de rechazar este conductor? Esta acción eliminará su solicitud.')) {
      return;
    }
    
    setProcessing(true);
    try {
      await axios.post(`${API}/admin/drivers/${driverId}/reject`);
      toast.success('❌ Solicitud de conductor rechazada');
      setShowDetailDialog(false);
      loadDrivers();
    } catch (error) {
      toast.error('Error al rechazar conductor');
    } finally {
      setProcessing(false);
    }
  };

  const viewDriverDetails = (driver) => {
    setSelectedDriver(driver);
    setShowDetailDialog(true);
  };

  const currentList = tab === 'pending' ? pendingDrivers : approvedDrivers;

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
          <UserCheck className="h-6 w-6 text-[#00e0ff]" />
          <h1 className="text-2xl font-bold text-white">Validación de Conductores</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => setTab('pending')}
            className={`${tab === 'pending' ? 'bg-yellow-500 text-black' : 'bg-[#111827] text-white border border-white/10'} font-bold`}
          >
            <Clock className="h-5 w-5 mr-2" />
            Pendientes ({pendingDrivers.length})
          </Button>
          <Button
            onClick={() => setTab('approved')}
            className={`${tab === 'approved' ? 'bg-green-500 text-black' : 'bg-[#111827] text-white border border-white/10'} font-bold`}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Aprobados ({approvedDrivers.length})
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-[#00e0ff] animate-pulse mx-auto mb-4" />
            <p className="text-slate-400">Cargando conductores...</p>
          </div>
        ) : currentList.length === 0 ? (
          <div className="glass-card p-12 rounded-xl text-center">
            {tab === 'pending' ? (
              <>
                <Clock className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay solicitudes pendientes</p>
              </>
            ) : (
              <>
                <CheckCircle className="h-16 w-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay conductores aprobados</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentList.map((driver) => (
              <div
                key={driver.driver_id}
                className="glass-card p-6 rounded-xl border border-white/10 hover:border-[#00e0ff]/30 transition-all"
              >
                <div className="flex items-start gap-4 mb-4">
                  {driver.driver_photo_url ? (
                    <img src={driver.driver_photo_url} alt="Foto" className="w-16 h-16 rounded-full object-cover border-2 border-white/20" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center">
                      <Truck className="h-8 w-8 text-slate-500" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{driver.full_name}</h3>
                    <p className="text-slate-400 text-sm">{driver.vehicle_type}</p>
                    <p className="text-[#00e0ff] font-mono font-bold">{driver.vehicle_plate}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <p className="text-slate-400 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {driver.phone}
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {driver.email}
                  </p>
                  <p className="text-slate-400 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    {driver.vehicle_brand} {driver.vehicle_model}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => viewDriverDetails(driver)}
                    variant="outline"
                    className="flex-1 border-white/10 text-white hover:bg-white/10"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Documentos
                  </Button>
                  {tab === 'pending' && (
                    <Button
                      onClick={() => handleApprove(driver.driver_id)}
                      className="bg-green-500 text-white hover:bg-green-600"
                    >
                      <UserCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Detalle del Conductor */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Truck className="h-6 w-6 text-[#00e0ff]" />
              Documentos del Conductor
            </DialogTitle>
          </DialogHeader>
          
          {selectedDriver && (
            <div className="mt-4 space-y-6">
              {/* Info básica */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Nombre</p>
                  <p className="text-white font-bold text-lg">{selectedDriver.full_name}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Placa</p>
                  <p className="text-[#00e0ff] font-mono font-bold text-xl">{selectedDriver.vehicle_plate}</p>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Teléfono</p>
                  <a href={`tel:${selectedDriver.phone}`} className="text-[#00e0ff] hover:underline">{selectedDriver.phone}</a>
                </div>
                <div className="bg-black/30 p-4 rounded-lg">
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white text-sm">{selectedDriver.email}</p>
                </div>
              </div>

              {/* Vehículo */}
              <div className="bg-black/30 p-4 rounded-lg">
                <p className="text-slate-400 text-sm mb-2">Vehículo</p>
                <p className="text-white font-bold">{selectedDriver.vehicle_type} - {selectedDriver.vehicle_brand} {selectedDriver.vehicle_model}</p>
                <p className="text-slate-400 text-sm mt-1">Licencia: {selectedDriver.license_number}</p>
                <p className="text-slate-400 text-sm">Seguro: {selectedDriver.insurance_info || 'No especificado'}</p>
              </div>

              {/* Documentos con imágenes */}
              <div className="space-y-4">
                <h4 className="text-white font-bold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-[#00e0ff]" />
                  Documentos Adjuntos
                </h4>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Foto Grúa */}
                  <div className="border border-white/10 rounded-lg p-3">
                    <p className="text-green-400 text-sm font-bold mb-2">📸 Foto de la Grúa (con placa)</p>
                    {selectedDriver.vehicle_photo_url ? (
                      <img src={selectedDriver.vehicle_photo_url} alt="Grúa" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <p className="text-red-400 text-sm">❌ No adjuntó</p>
                    )}
                  </div>

                  {/* Tarjeta de Propiedad */}
                  <div className="border border-white/10 rounded-lg p-3">
                    <p className="text-purple-400 text-sm font-bold mb-2">📄 Tarjeta de Propiedad</p>
                    {selectedDriver.vehicle_registration_photo_url ? (
                      <img src={selectedDriver.vehicle_registration_photo_url} alt="Tarjeta" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <p className="text-red-400 text-sm">❌ No adjuntó</p>
                    )}
                  </div>

                  {/* Cédula */}
                  <div className="border border-white/10 rounded-lg p-3">
                    <p className="text-blue-400 text-sm font-bold mb-2">🪪 Cédula del Propietario</p>
                    {selectedDriver.cedula_photo_url ? (
                      <img src={selectedDriver.cedula_photo_url} alt="Cédula" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <p className="text-red-400 text-sm">❌ No adjuntó</p>
                    )}
                  </div>

                  {/* Seguro RCE */}
                  <div className="border border-white/10 rounded-lg p-3">
                    <p className="text-orange-400 text-sm font-bold mb-2 flex items-center gap-1">
                      <Shield className="h-4 w-4" />
                      Seguro RCE (Responsabilidad Civil)
                    </p>
                    {selectedDriver.insurance_photo_url ? (
                      <img src={selectedDriver.insurance_photo_url} alt="Seguro" className="w-full h-40 object-cover rounded-lg" />
                    ) : (
                      <p className="text-red-400 text-sm">❌ No adjuntó</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              {tab === 'pending' && (
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <Button
                    onClick={() => handleApprove(selectedDriver.driver_id)}
                    disabled={processing}
                    className="flex-1 bg-green-500 text-white hover:bg-green-600 font-bold h-12"
                  >
                    <UserCheck className="h-5 w-5 mr-2" />
                    {processing ? 'Procesando...' : 'Aprobar Conductor'}
                  </Button>
                  <Button
                    onClick={() => handleReject(selectedDriver.driver_id)}
                    disabled={processing}
                    variant="outline"
                    className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10 font-bold h-12"
                  >
                    <UserX className="h-5 w-5 mr-2" />
                    Rechazar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
