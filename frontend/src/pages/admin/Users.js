import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Ban, Search, CheckCircle, Pencil, X } from 'lucide-react';
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
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '' });

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

  const handleUnblockUser = async (userId) => {
    try {
      await axios.post(`${API}/admin/users/${userId}/unblock`);
      toast.success('Usuario desbloqueado');
      loadUsers();
    } catch (error) {
      toast.error('Error al desbloquear usuario');
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || ''
    });
    setEditModal(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`${API}/admin/users/${selectedUser.id}`, editForm);
      toast.success('Usuario actualizado');
      setEditModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al actualizar usuario');
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
                        <div className="flex gap-2 flex-wrap">
                          {user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditModal(user)}
                              className="bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                              data-testid={`edit-button-${user.id}`}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Editar
                            </Button>
                          )}
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
                          {user.status === 'blocked' && user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUnblockUser(user.id)}
                              className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                              data-testid={`unblock-button-${user.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Desbloquear
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Edición */}
      {editModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] rounded-xl p-6 w-full max-w-md border border-white/10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Editar Usuario</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nombre Completo</label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  className="bg-black/50 border-white/10 text-white"
                  data-testid="edit-fullname-input"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <Input
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  className="bg-black/50 border-white/10 text-white"
                  data-testid="edit-email-input"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  className="bg-black/50 border-white/10 text-white"
                  data-testid="edit-phone-input"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setEditModal(false)}
                className="flex-1 border-white/10 text-slate-400"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEditSubmit}
                className="flex-1 bg-[#00e0ff] text-black hover:bg-[#00c4dd]"
                data-testid="save-edit-button"
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}