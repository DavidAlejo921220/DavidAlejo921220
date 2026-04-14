import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Wallet, Copy, Gift, Send, CheckCircle, Clock, Users } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MyWallet() {
  const navigate = useNavigate();
  const [walletInfo, setWalletInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [nequiNumber, setNequiNumber] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      const response = await axios.get(`${API}/referrals/wallet`);
      setWalletInfo(response.data);
    } catch (error) {
      toast.error('Error al cargar información del monedero');
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (walletInfo?.referral_code) {
      navigator.clipboard.writeText(walletInfo.referral_code);
      toast.success('¡Código copiado!');
    }
  };

  const handleWithdraw = async () => {
    if (!nequiNumber || nequiNumber.length !== 10) {
      toast.error('Ingresa un número Nequi válido (10 dígitos)');
      return;
    }

    setWithdrawing(true);
    try {
      await axios.post(`${API}/referrals/withdraw`, {
        nequi_number: nequiNumber
      });
      toast.success('¡Solicitud enviada! El administrador procesará tu retiro.');
      setShowWithdrawModal(false);
      setNequiNumber('');
      loadWalletInfo();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al solicitar retiro');
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center">
        <div className="text-[#00e0ff]">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1120]">
      {/* Header */}
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-[#00e0ff]" />
            <h1 className="text-xl font-bold text-white">Mi Monedero</h1>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Saldo */}
        <div className="bg-gradient-to-r from-[#00e0ff]/20 to-[#7200c4]/20 p-6 rounded-xl border border-white/10">
          <p className="text-slate-400 text-sm mb-1">Saldo disponible</p>
          <p className="text-4xl font-bold text-white mb-4">
            {formatCurrency(walletInfo?.commission_balance || 0)}
          </p>
          
          {walletInfo?.pending_withdrawal ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <Clock className="h-5 w-5" />
                <span className="font-bold">Solicitud en proceso</span>
              </div>
              <p className="text-slate-400 text-sm">
                Monto: {formatCurrency(walletInfo.pending_withdrawal.amount)}
              </p>
              <p className="text-slate-400 text-sm">
                Nequi: {walletInfo.pending_withdrawal.nequi_number}
              </p>
              <p className="text-slate-500 text-xs mt-2">
                El administrador gestionará tu transferencia pronto.
              </p>
            </div>
          ) : (
            <Button
              onClick={() => setShowWithdrawModal(true)}
              disabled={!walletInfo?.commission_balance || walletInfo.commission_balance <= 0}
              className="bg-green-500 text-white hover:bg-green-600 font-bold w-full sm:w-auto"
            >
              <Send className="h-4 w-4 mr-2" />
              Redimir a Nequi
            </Button>
          )}
        </div>

        {/* Código de Referido */}
        <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="h-5 w-5 text-[#7200c4]" />
            <h2 className="text-lg font-bold text-white">Tu Código de Referido</h2>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 bg-[#0a1120] p-4 rounded-lg border border-[#00e0ff]/30">
              <p className="text-2xl font-mono font-bold text-[#00e0ff] text-center tracking-widest">
                {walletInfo?.referral_code || '---'}
              </p>
            </div>
            <Button
              onClick={copyReferralCode}
              variant="outline"
              className="border-[#00e0ff]/30 text-[#00e0ff] hover:bg-[#00e0ff]/10"
            >
              <Copy className="h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-slate-400 text-sm">
            Comparte este código con tus amigos. Cuando lo usen en un servicio, 
            recibirás el <span className="text-[#00e0ff] font-bold">5% del valor</span> como comisión.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-[#00e0ff]" />
            <h2 className="text-lg font-bold text-white">Estadísticas</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0a1120] p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-[#00e0ff]">{walletInfo?.total_referrals || 0}</p>
              <p className="text-slate-400 text-sm">Referidos exitosos</p>
            </div>
            <div className="bg-[#0a1120] p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-green-400">5%</p>
              <p className="text-slate-400 text-sm">Comisión por servicio</p>
            </div>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="bg-[#111827] p-6 rounded-xl border border-white/10">
          <h2 className="text-lg font-bold text-white mb-4">¿Cómo funciona?</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">1</div>
              <p className="text-slate-400">Comparte tu código con amigos que necesiten grúa</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">2</div>
              <p className="text-slate-400">Cuando soliciten un servicio, ingresan tu código</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">3</div>
              <p className="text-slate-400">Al completar el servicio, recibes 5% de comisión</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-[#00e0ff] rounded-full flex items-center justify-center text-black font-bold shrink-0">4</div>
              <p className="text-slate-400">Retira tu dinero a Nequi cuando quieras</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Retiro */}
      <Dialog open={showWithdrawModal} onOpenChange={setShowWithdrawModal}>
        <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Send className="h-5 w-5 text-green-400" />
              Retirar a Nequi
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/30">
              <p className="text-slate-400 text-sm">Monto a retirar</p>
              <p className="text-2xl font-bold text-green-400">
                {formatCurrency(walletInfo?.commission_balance || 0)}
              </p>
            </div>
            
            <div>
              <label className="text-slate-400 text-sm block mb-2">
                Número Nequi (10 dígitos)
              </label>
              <Input
                type="tel"
                value={nequiNumber}
                onChange={(e) => setNequiNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="3001234567"
                className="bg-[#0a1120] border-white/10 text-white text-lg text-center tracking-widest"
                maxLength={10}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 border-white/20 text-slate-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleWithdraw}
                disabled={withdrawing || nequiNumber.length !== 10}
                className="flex-1 bg-green-500 text-white hover:bg-green-600"
              >
                {withdrawing ? 'Enviando...' : 'Confirmar Retiro'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
