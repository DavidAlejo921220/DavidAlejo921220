import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, DollarSign, User, Phone, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function WithdrawalRequests() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadWithdrawals();
  }, [showAll]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const endpoint = showAll ? '/referrals/admin/withdrawals/all' : '/referrals/admin/withdrawals';
      const response = await axios.get(`${API}${endpoint}`);
      setWithdrawals(response.data);
    } catch (error) {
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const markAsCompleted = async (withdrawalId) => {
    setProcessingId(withdrawalId);
    try {
      await axios.post(`${API}/referrals/admin/withdrawals/${withdrawalId}/complete`);
      toast.success('Retiro marcado como pagado');
      loadWithdrawals();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al procesar');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = withdrawals.filter(w => w.status === 'pendiente').length;
  const totalPending = withdrawals
    .filter(w => w.status === 'pendiente')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-400" />
            Solicitudes de Retiro
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {pendingCount} pendientes · Total: {formatCurrency(totalPending)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadWithdrawals}
            className="border-white/20 text-slate-400"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button
            variant={showAll ? 'default' : 'outline'}
            onClick={() => setShowAll(!showAll)}
            className={showAll ? 'bg-[#00e0ff] text-black' : 'border-white/20 text-slate-400'}
          >
            {showAll ? 'Ver Pendientes' : 'Ver Todas'}
          </Button>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Cargando...</div>
      ) : withdrawals.length === 0 ? (
        <div className="text-center py-12 bg-[#111827] rounded-xl border border-white/10">
          <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-3" />
          <p className="text-slate-400">No hay solicitudes {showAll ? '' : 'pendientes'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => (
            <div
              key={withdrawal.id}
              className={`p-4 sm:p-6 rounded-xl border ${
                withdrawal.status === 'pendiente'
                  ? 'bg-[#111827] border-yellow-500/30'
                  : 'bg-[#111827]/50 border-white/10'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Info del usuario */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-[#00e0ff]/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-[#00e0ff]" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{withdrawal.user_name}</p>
                      <p className="text-slate-400 text-sm">{withdrawal.user_email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-slate-500 text-xs">Monto</p>
                      <p className="text-green-400 text-xl font-bold">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Nequi</p>
                      <p className="text-white font-mono text-lg flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#00e0ff]" />
                        {withdrawal.nequi_number}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-500 text-xs mt-3">
                    Solicitado: {formatDate(withdrawal.created_at)}
                  </p>
                </div>

                {/* Estado y acciones */}
                <div className="flex flex-col items-end justify-between">
                  <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                    withdrawal.status === 'pendiente'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {withdrawal.status === 'pendiente' ? (
                      <><Clock className="h-3 w-3" /> Pendiente</>
                    ) : (
                      <><CheckCircle className="h-3 w-3" /> Pagado</>
                    )}
                  </div>
                  
                  {withdrawal.status === 'pendiente' && (
                    <Button
                      onClick={() => markAsCompleted(withdrawal.id)}
                      disabled={processingId === withdrawal.id}
                      className="mt-4 bg-green-500 text-white hover:bg-green-600"
                    >
                      {processingId === withdrawal.id ? (
                        'Procesando...'
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como Pagado
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
