import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, DollarSign, AlertTriangle, Edit, Wallet, RefreshCw } from 'lucide-react';
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
  const [editMode, setEditMode] = useState(false);
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    loadDriverWallets();
  }, []);

  const loadDriverWallets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/admin/drivers/wallets`);
      setDrivers(response.data);
    } catch (error) {
      console.error('Error loading wallets:', error);
      toast.error('Error al cargar billeteras. Verifica que hayas iniciado sesión como admin.');
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
        notes: rechargeData.notes || 'Recarga manual'
      });

      toast.success(`✅ ${response.data.message}`);
      setShowRechargeDialog(false);
      setRechargeData({ amount: '', notes: '' });
      setEditMode(false);
      loadDriverWallets();
    } catch (error) {
      console.error('Recharge error:', error);
      toast.error(error.response?.data?.detail || 'Error al recargar. Verifica tu sesión.');
    } finally {
      setRecharging(false);
    }
  };

  const handleSetBalance = async () => {
    const targetBalance = parseFloat(newBalance);
    if (isNaN(targetBalance) || targetBalance < 0) {
      toast.error('Ingresa un saldo válido');
      return;
    }

    const currentBalance = selectedDriver.wallet_balance || 0;
    const difference = targetBalance - currentBalance;

    if (difference === 0) {
      toast.info('El saldo es el mismo, no hay cambios');
      setShowRechargeDialog(false);
      return;
    }

    setRecharging(true);
    try {
      const response = await axios.post(`${API}/admin/drivers/recharge`, {
        driver_id: selectedDriver.driver_id,
        amount: difference,
        notes: `Ajuste de saldo: ${formatCurrency(currentBalance)} → ${formatCurrency(targetBalance)}`
      });

      toast.success(`✅ Saldo actualizado a ${formatCurrency(targetBalance)}`);
      setShowRechargeDialog(false);
      setNewBalance('');
      setEditMode(false);
      loadDriverWallets();
    } catch (error) {
      console.error('Set balance error:', error);
      toast.error(error.response?.data?.detail || 'Error al actualizar saldo');
    } finally {
      setRecharging(false);
    }
  };

  const openRechargeDialog = (driver, isEditMode = false) => {
    setSelectedDriver(driver);
    setEditMode(isEditMode);
    setNewBalance(driver.wallet_balance?.toString() || '0');
    setRechargeData({ amount: '', notes: '' });
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
          <Wallet className="h-6 w-6 text-[#00e0ff]" />
          <h1 className="text-2xl font-bold text-white">Gestión de Billeteras</h1>
          <Button
            variant="ghost"
            onClick={loadDriverWallets}
            className="ml-auto text-slate-400 hover:text-white"
            data-testid="refresh-button"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Saldos de Conductores</h2>
              <p className="text-slate-400 text-sm mt-1">
                Haz clic en la <span className="text-[#00e0ff] font-mono">PLACA</span> para editar el saldo directamente
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Total conductores</p>
              <p className="text-2xl font-bold text-white">{drivers.length}</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-[#00e0ff] animate-spin mx-auto mb-4" />
              <p className="text-slate-400">Cargando billeteras...</p>
            </div>
          ) : drivers.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No hay conductores registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="wallets-table">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Conductor</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">
                      Placa
                      <span className="text-xs text-[#00e0ff] ml-1">(clic para editar)</span>
                    </th>
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
                      className={`border-b border-white/5 hover:bg-white/5 transition-colors ${driver.needs_recharge ? 'bg-red-500/5' : ''}`}
                      data-testid={`driver-row-${driver.driver_id}`}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-white font-semibold">{driver.full_name}</p>
                          <p className="text-xs text-slate-500">{driver.status}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => openRechargeDialog(driver, true)}
                          className="font-mono text-[#00e0ff] font-bold text-lg hover:bg-[#00e0ff]/20 px-3 py-1 rounded-lg transition-all cursor-pointer border border-transparent hover:border-[#00e0ff]/50"
                          data-testid={`plate-button-${driver.driver_id}`}
                          title="Clic para editar saldo"
                        >
                          {driver.vehicle_plate}
                        </button>
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
                          onClick={() => openRechargeDialog(driver, false)}
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

      {/* Dialog de Recarga / Edición de Saldo */}
      <Dialog open={showRechargeDialog} onOpenChange={setShowRechargeDialog}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {editMode ? <Edit className="h-6 w-6 text-[#00e0ff]" /> : <DollarSign className="h-6 w-6 text-[#00e0ff]" />}
              {editMode ? 'Editar Saldo' : 'Recargar Billetera'}
            </DialogTitle>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-4 mt-4">
              {/* Info del conductor */}
              <div className="bg-[#0a1120] p-4 rounded-lg border border-white/10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-slate-400">Conductor</p>
                    <p className="text-lg font-bold text-white">{selectedDriver.full_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Placa</p>
                    <p className="font-mono text-[#00e0ff] font-bold text-xl">{selectedDriver.vehicle_plate}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-sm text-slate-400">Saldo actual</p>
                  <p className={`text-2xl font-bold ${selectedDriver.wallet_balance < 1000 ? 'text-red-400' : 'text-green-400'}`}>
                    {formatCurrency(selectedDriver.wallet_balance)}
                  </p>
                </div>
              </div>

              {/* Tabs para cambiar entre modos */}
              <div className="flex gap-2 p-1 bg-black/30 rounded-lg">
                <button
                  onClick={() => setEditMode(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    !editMode ? 'bg-[#00e0ff] text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Añadir Monto
                </button>
                <button
                  onClick={() => setEditMode(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-semibold transition-all ${
                    editMode ? 'bg-[#00e0ff] text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Establecer Saldo
                </button>
              </div>

              {editMode ? (
                /* Modo edición directa del saldo */
                <div>
                  <Label className="text-slate-300 mb-2 block">Nuevo Saldo (COP)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    className="bg-black/50 border-white/10 text-white h-14 text-2xl font-bold text-center"
                    data-testid="new-balance-input"
                  />
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    {parseFloat(newBalance || 0) > selectedDriver.wallet_balance ? (
                      <span className="text-green-400">
                        +{formatCurrency(parseFloat(newBalance || 0) - selectedDriver.wallet_balance)}
                      </span>
                    ) : parseFloat(newBalance || 0) < selectedDriver.wallet_balance ? (
                      <span className="text-red-400">
                        {formatCurrency(parseFloat(newBalance || 0) - selectedDriver.wallet_balance)}
                      </span>
                    ) : (
                      <span>Sin cambios</span>
                    )}
                  </p>
                </div>
              ) : (
                /* Modo recarga normal */
                <>
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
                      Nuevo saldo: <span className="text-green-400 font-bold">
                        {formatCurrency(selectedDriver.wallet_balance + parseFloat(rechargeData.amount || 0))}
                      </span>
                    </p>
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2 block">Notas (Opcional)</Label>
                    <Textarea
                      placeholder="Ej: Pago recibido por Nequi"
                      value={rechargeData.notes}
                      onChange={(e) => setRechargeData({ ...rechargeData, notes: e.target.value })}
                      className="bg-black/50 border-white/10 text-white"
                      data-testid="recharge-notes-input"
                    />
                  </div>
                </>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={editMode ? handleSetBalance : handleRecharge}
                  disabled={recharging}
                  className="flex-1 bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-12"
                  data-testid="confirm-recharge-button"
                >
                  {recharging ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : editMode ? (
                    'Guardar Saldo'
                  ) : (
                    'Confirmar Recarga'
                  )}
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
