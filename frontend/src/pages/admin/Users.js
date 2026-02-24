import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Ban, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function UsersManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (search) {
      setFilteredUsers(
        users.filter(u => 
          u.full_name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [search, users]);

  const loadUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/block`);
      toast.success('Usuario bloqueado');
      loadUsers();
    } catch (error) {
      toast.error('Error al bloquear usuario');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      client: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      driver: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      admin: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return styles[role] || 'bg-slate-500/10 text-slate-400';
  };

  const getStatusBadge = (status) => {
    return status === 'active'
      ? 'bg-green-500/10 text-green-400 border-green-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20';
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
          <h1 className="text-2xl font-bold text-white">Gestión de Usuarios</h1>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="glass-card p-6 rounded-xl">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-500" />
              <Input
                placeholder="Buscar por nombre o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-black/50 border-white/10 text-white pl-10 h-12"
                data-testid="search-input"
              />
            </div>
          </div>

          {loading ? (
            <p className="text-slate-400 text-center py-8">Cargando...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="users-table">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Usuario</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Email</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Teléfono</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Rol</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Estado</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Reputación</th>
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5" data-testid={`user-row-${user.id}`}>
                      <td className="py-4 px-4 text-white">{user.full_name}</td>
                      <td className="py-4 px-4 text-slate-400">{user.email}</td>
                      <td className="py-4 px-4 text-slate-400">{user.phone}</td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleBadge(user.role)}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusBadge(user.status)}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-[#00e0ff] font-semibold">
                        {user.reputation_score.toFixed(1)} ⭐
                      </td>
                      <td className="py-4 px-4">
                        {user.status === 'active' && user.role !== 'admin' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleBlockUser(user.id)}
                            className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            data-testid={`block-button-${user.id}`}
                          >
                            <Ban className="h-4 w-4 mr-1" />
                            Bloquear
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}