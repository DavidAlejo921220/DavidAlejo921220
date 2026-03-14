import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, DollarSign, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function WalletManagement() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [rechargeData, setRechargeData] = useState({ amount: '', notes: '' });
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    loadDriverWallets();
  }, []);

  const loadDriverWallets = async () => {
    try {
      const response = await axios.get(`${API}/admin/drivers/wallets`);
      setDrivers(response.data);
    } catch (error) {
      toast.error('Error al cargar billeteras');
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!rechargeData.amount || parseFloat(rechargeData.amount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }

    setRecharging(true);
    try {
      const response = await axios.post(`${API}/admin/drivers/recharge`, {
        driver_id: selectedDriver.driver_id,
        amount: parseFloat(rechargeData.amount),
        notes: rechargeData.notes
      });

      toast.success(`✅ ${response.data.message}`);
      setShowRechargeDialog(false);
      setRechargeData({ amount: '', notes: '' });
      loadDriverWallets();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al recargar');
    } finally {
      setRecharging(false);
    }
  };

  const openRechargeDialog = (driver) => {
    setSelectedDriver(driver);
    setShowRechargeDialog(true);
  };

  return (
    <div className="min-h-screen bg-[#0a1120]">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/admin/dashboard')}
            className="text-slate-400 hover:text-white"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Gestión de Billeteras</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Saldos de Conductores</h2>
              <p className="text-slate-400 text-sm mt-1">Gestiona las recargas manualmente</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total conductores</p>
              <p className="text-2xl font-bold text-white">{drivers.length}</p>
            </div>
          </div>

          {loading ? (
            <p className="text-slate-400 text-center py-8">Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="wallets-table">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Conductor</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Placa</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Vehículo</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Teléfono</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Saldo</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Estado</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {drivers.map((driver) => (
                    <tr 
                      key={driver.driver_id} 
                      className={`border-b border-white/5 hover:bg-white/5 ${driver.needs_recharge ? 'bg-red-500/5' : ''}`}
                      data-testid={`driver-row-${driver.driver_id}`}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-semibold">{driver.full_name}</p>
                          <p className="text-xs text-slate-500">{driver.status}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-mono text-[#00e0ff] font-semibold">
                          {driver.vehicle_plate}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {driver.vehicle_brand} {driver.vehicle_model}
                      </td>
                      <td className="py-4 px-4 text-slate-400 font-mono text-sm">
                        {driver.phone}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xl font-bold ${
                          driver.wallet_balance < 1000 ? 'text-red-400' : 
                          driver.wallet_balance < 3000 ? 'text-yellow-400' : 
                          'text-green-400'
                        }`}>
                          {formatCurrency(driver.wallet_balance)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {driver.needs_recharge ? (
                          <span className="flex items-center gap-1 text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            Requiere recarga
                          </span>
                        ) : (
                          <span className="text-green-400 text-sm">✓ OK</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          onClick={() => openRechargeDialog(driver)}
                          className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold"
                          size="sm"
                          data-testid={`recharge-button-${driver.driver_id}`}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Recargar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Dialog de Recarga */}
      <Dialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog}>
        <DialogContent className="bg-[#111827] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Recargar Billetera</DialogTitle>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-4 mt-4">
              <div className="bg-[#0a1120] p-4 rounded-lg border border-white/10">
                <p className="text-sm text-slate-400">Conductor</p>
                <p className="text-lg font-bold text-white">{selectedDriver.full_name}</p>
                <p className="text-sm text-slate-400 mt-1">
                  Placa: <span className="font-mono text-[#00e0ff]">{selectedDriver.vehicle_plate}</span>
                </p>
                <p className="text-sm text-slate-400">
                  Saldo actual: <span className="font-bold text-yellow-400">{formatCurrency(selectedDriver.wallet_balance)}</span>
                </p>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Monto a Recargar (COP)</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={rechargeData.amount}
                  onChange={(e) => setRechargeData({ ...rechargeData, amount: e.target.value })}
                  className="bg-black/50 border-white/10 text-white h-12 text-lg"
                  data-testid="recharge-amount-input"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Nuevo saldo: {formatCurrency(selectedDriver.wallet_balance + parseFloat(rechargeData.amount || 0))}
                </p>
              </div>

              <div>
                <Label className="text-slate-300 mb-2 block">Notas (Opcional)</Label>
                <Textarea
                  placeholder="Recarga vía Nequi confirmada..."
                  value={rechargeData.notes}
                  onChange={(e) => setRechargeData({ ...rechargeData, notes: e.target.value })}
                  className="bg-black/50 border-white/10 text-white"
                  data-testid="recharge-notes-input"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleRecharge}
                  disabled={recharging}
                  className="flex-1 bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-12"
                  data-testid="confirm-recharge-button"
                >
                  {recharging ? 'Procesando...' : 'Confirmar Recarga'}
                </Button>
                <Button
                  onClick={() => setShowRechargeDialog(false)}
                  variant="outline"
                  className="border-white/10 text-slate-400 hover:text-white"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
