import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Gift, ThumbsUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { formatCurrency } from '@/utils/currency';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function RatingTipModal({ 
  isOpen, 
  onClose, 
  service, 
  driverInfo,
  onComplete 
}) {
  const [step, setStep] = useState('rating'); // 'rating' | 'tip' | 'done'
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [tipAmount, setTipAmount] = useState('');
  const [tipMessage, setTipMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitRating = async () => {
    if (!service?.driver_id) return;
    
    setLoading(true);
    try {
      await axios.post(`${API}/ratings/create`, {
        service_id: service.id,
        to_user_id: service.driver_id,
        rating,
        comment: comment || null
      });
      toast.success('¡Gracias por calificar!');
      setStep('tip');
    } catch (error) {
      toast.error('Error al enviar calificación');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTip = async () => {
    if (!tipAmount || parseFloat(tipAmount) <= 0) {
      toast.error('Ingresa un monto válido');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/ratings/tip`, {
        service_id: service.id,
        driver_id: service.driver_id,
        amount: parseFloat(tipAmount),
        message: tipMessage || null
      });
      toast.success('¡Propina enviada! El conductor te lo agradece.');
      setStep('done');
    } catch (error) {
      toast.error('Error al enviar propina');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipTip = () => {
    setStep('done');
  };

  const handleClose = () => {
    if (onComplete) onComplete();
    onClose();
    // Reset state
    setStep('rating');
    setRating(5);
    setComment('');
    setTipAmount('');
    setTipMessage('');
  };

  const quickTipAmounts = [5000, 10000, 20000, 50000];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#111827] border-white/10 text-white max-w-md">
        {step === 'rating' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                ⭐ Califica el Servicio
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 space-y-6">
              {driverInfo && (
                <div className="text-center">
                  <p className="text-slate-400">Tu conductor fue:</p>
                  <p className="text-white text-xl font-bold">{driverInfo.full_name}</p>
                </div>
              )}
              
              {/* Estrellas */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                    data-testid={`rating-star-${star}`}
                  >
                    <Star 
                      className={`h-10 w-10 ${
                        star <= rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-slate-600'
                      }`} 
                    />
                  </button>
                ))}
              </div>
              
              <p className="text-center text-slate-400">
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && '¡Excelente!'}
              </p>
              
              {/* Comentario */}
              <div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos tu experiencia (opcional)"
                  className="bg-black/50 border-white/10 text-white min-h-[80px]"
                  data-testid="rating-comment"
                />
              </div>
              
              <Button
                onClick={handleSubmitRating}
                disabled={loading}
                className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold h-12"
                data-testid="submit-rating-button"
              >
                {loading ? 'Enviando...' : 'Enviar Calificación'}
              </Button>
            </div>
          </>
        )}

        {step === 'tip' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                🎁 ¿Deseas dejar propina?
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 space-y-6">
              <p className="text-slate-400 text-center">
                Una propina es totalmente voluntaria y va directamente al conductor.
              </p>
              
              {/* Montos rápidos */}
              <div className="grid grid-cols-4 gap-2">
                {quickTipAmounts.map((amount) => (
                  <Button
                    key={amount}
                    variant={tipAmount === String(amount) ? 'default' : 'outline'}
                    onClick={() => setTipAmount(String(amount))}
                    className={`${
                      tipAmount === String(amount) 
                        ? 'bg-[#00e0ff] text-black' 
                        : 'border-white/20 text-white'
                    }`}
                    data-testid={`quick-tip-${amount}`}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
              </div>
              
              {/* Monto personalizado */}
              <div>
                <Input
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="Otro monto en COP"
                  className="bg-black/50 border-white/10 text-white h-12 text-center text-xl"
                  data-testid="custom-tip-amount"
                />
              </div>
              
              {/* Mensaje */}
              <div>
                <Input
                  value={tipMessage}
                  onChange={(e) => setTipMessage(e.target.value)}
                  placeholder="Mensaje para el conductor (opcional)"
                  className="bg-black/50 border-white/10 text-white"
                  data-testid="tip-message"
                />
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkipTip}
                  className="flex-1 border-white/20 text-slate-400"
                  data-testid="skip-tip-button"
                >
                  No, gracias
                </Button>
                <Button
                  onClick={handleSubmitTip}
                  disabled={loading || !tipAmount}
                  className="flex-1 bg-green-500 text-white hover:bg-green-600 font-bold"
                  data-testid="send-tip-button"
                >
                  <Gift className="h-4 w-4 mr-2" />
                  {loading ? 'Enviando...' : 'Enviar Propina'}
                </Button>
              </div>
            </div>
          </>
        )}

        {step === 'done' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                ✅ ¡Gracias!
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 space-y-6 text-center">
              <div className="text-6xl">🙏</div>
              <p className="text-slate-300">
                Tu opinión nos ayuda a mejorar el servicio.
              </p>
              <Button
                onClick={handleClose}
                className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold h-12"
                data-testid="close-rating-modal"
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Cerrar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
