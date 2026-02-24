import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function CommissionConfig() {
  const navigate = useNavigate();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await axios.get(`${API}/admin/commission-config`);
      setConfig(response.data);
    } catch (error) {
      toast.error('Error al cargar configuración');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/admin/commission-config`, config);
      toast.success('Configuración guardada');
    } catch (error) {
      toast.error('Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-white">Configuración de Comisiones</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-xl">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6" data-testid="commission-form">
            <div>
              <Label className="text-slate-300 mb-2 block text-lg">Tasa de Comisión Predeterminada (%)</Label>
              <p className="text-slate-500 text-sm mb-3">Se aplica a todos los servicios por defecto</p>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={config?.default_rate * 100 || 0}
                onChange={(e) => setConfig({ ...config, default_rate: parseFloat(e.target.value) / 100 })}
                className="bg-black/50 border-white/10 text-white h-12"
                data-testid="default-rate-input"
              />
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xl font-bold text-white mb-4">Vista Previa de Comisiones</h3>
              <div className="space-y-3">
                <div className="flex justify-between p-4 bg-black/30 rounded-lg">
                  <span className="text-slate-400">Servicio de $100</span>
                  <span className="text-[#00e0ff] font-bold">
                    Comisión: ${(100 * (config?.default_rate || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-black/30 rounded-lg">
                  <span className="text-slate-400">Servicio de $200</span>
                  <span className="text-[#00e0ff] font-bold">
                    Comisión: ${(200 * (config?.default_rate || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between p-4 bg-black/30 rounded-lg">
                  <span className="text-slate-400">Servicio de $500</span>
                  <span className="text-[#00e0ff] font-bold">
                    Comisión: ${(500 * (config?.default_rate || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold uppercase tracking-wider h-12"
              data-testid="save-commission-button"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}