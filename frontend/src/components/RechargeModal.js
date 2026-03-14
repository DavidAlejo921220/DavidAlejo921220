import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DollarSign, Smartphone, QrCode, Copy, CheckCircle, ExternalLink, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const NEQUI_PHONE = '3508476536';
const NEQUI_NAME = 'DAVID GAMBA';
const NEQUI_QR_IMAGE = 'https://customer-assets.emergentagent.com/job_4d6d68fe-1392-4b8b-95de-0896fbae6116/artifacts/9e36x7x7_WhatsApp%20Image%202026-03-14%20at%2012.46.30%20PM.jpeg';

export default function RechargeModal({ isOpen, onClose, balance, vehiclePlate }) {
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(NEQUI_PHONE);
    setCopiedPhone(true);
    toast.success('📋 Número copiado');
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const handleOpenNequi = () => {
    // Deep link de Nequi
    const nequiLink = `nequi://pay?phone=${NEQUI_PHONE}&amount=20000`;
    window.open(nequiLink, '_blank');
    toast.info('📱 Abriendo Nequi...');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-[#00e0ff]" />
            Recargar Saldo
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          {/* Saldo Actual */}
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-center">
            <p className="text-slate-400 text-sm">Tu saldo actual</p>
            <p className={`text-3xl font-bold ${balance <= 0 ? 'text-red-400' : 'text-yellow-400'}`}>
              {formatCurrency(balance || 0)}
            </p>
            {balance <= 0 && (
              <p className="text-red-400 text-sm mt-2 flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                No puedes recibir servicios con saldo $0
              </p>
            )}
          </div>

          {/* Importante: Incluir la placa */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-yellow-400 font-bold flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              ¡IMPORTANTE!
            </p>
            <p className="text-white text-sm">
              Al hacer la transferencia, incluye tu <strong className="text-[#00e0ff]">PLACA</strong> en el mensaje o descripción:
            </p>
            <p className="text-[#00e0ff] text-2xl font-mono font-bold text-center mt-2 bg-black/30 p-2 rounded">
              {vehiclePlate || 'TU PLACA'}
            </p>
            <p className="text-slate-400 text-xs mt-2 text-center">
              Sin la placa no podremos identificar tu recarga
            </p>
          </div>

          {/* Datos de Nequi */}
          <div className="bg-[#7200c4]/10 border border-[#7200c4]/30 p-4 rounded-lg">
            <p className="text-[#7200c4] font-bold mb-3 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Recarga por Nequi
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                <div>
                  <p className="text-slate-400 text-xs">Nombre</p>
                  <p className="text-white font-bold">{NEQUI_NAME}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                <div>
                  <p className="text-slate-400 text-xs">Número Nequi</p>
                  <p className="text-white font-mono text-xl font-bold">{NEQUI_PHONE}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPhone}
                  className="text-[#00e0ff] hover:bg-[#00e0ff]/10"
                >
                  {copiedPhone ? <CheckCircle className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Código QR */}
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-3 flex items-center justify-center gap-2">
              <QrCode className="h-4 w-4" />
              O escanea el código QR de Nequi
            </p>
            <div className="bg-white p-4 rounded-xl inline-block mx-auto">
              <img 
                src={NEQUI_QR_IMAGE} 
                alt="QR Nequi" 
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>

          {/* Botón Abrir Nequi */}
          <Button
            onClick={handleOpenNequi}
            className="w-full bg-[#7200c4] text-white hover:bg-[#8e2bd9] font-bold h-12"
          >
            <ExternalLink className="h-5 w-5 mr-2" />
            Abrir App de Nequi
          </Button>

          {/* Nota final */}
          <p className="text-slate-500 text-xs text-center">
            Una vez realizada la transferencia, tu saldo será actualizado por un administrador.
            Si tienes dudas, contáctanos por WhatsApp.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
