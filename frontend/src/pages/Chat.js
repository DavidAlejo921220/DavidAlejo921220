import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Send, Check, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Chat() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinServiceRoom, leaveServiceRoom } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    joinServiceRoom(serviceId);

    if (socket) {
      socket.on('new_message', (message) => {
        setMessages(prev => [...prev, message]);
      });
    }

    return () => {
      leaveServiceRoom(serviceId);
      if (socket) {
        socket.off('new_message');
      }
    };
  }, [serviceId, socket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(`${API}/chat/${serviceId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error al cargar mensajes');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post(`${API}/chat/send`, {
        service_id: serviceId,
        message: newMessage,
        message_type: 'text'
      });
      setNewMessage('');
    } catch (error) {
      toast.error('Error al enviar mensaje');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1120] flex flex-col">
      <nav className="border-b border-white/10 bg-[#111827]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-white"
            data-testid="back-button"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Chat del Servicio</h1>
        </div>
      </nav>

      <div className="flex-1 container mx-auto px-6 py-6 flex flex-col max-w-4xl">
        <div className="flex-1 glass-card rounded-xl p-6 mb-4 overflow-y-auto" data-testid="chat-messages">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay mensajes aún</p>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${msg.id}`}
                  >
                    {/* Label de mensaje enviado/recibido */}
                    <div className="flex flex-col">
                      {!isOwnMessage && (
                        <span className="text-xs text-slate-500 mb-1 ml-1">Recibido</span>
                      )}
                      <div
                        className={`max-w-[70%] p-4 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-[#00e0ff] text-black rounded-br-sm'
                            : 'bg-[#7200c4] text-white rounded-bl-sm'
                        }`}
                      >
                        <p className="break-words">{msg.message}</p>
                        <div className={`flex items-center gap-1 mt-2 ${
                          isOwnMessage ? 'justify-end' : ''
                        }`}>
                          <span className={`text-xs ${
                            isOwnMessage ? 'text-black/60' : 'text-white/60'
                          }`}>
                            {new Date(msg.created_at).toLocaleTimeString('es-ES', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                          {/* Indicador de lectura para mensajes propios */}
                          {isOwnMessage && (
                            <CheckCheck className={`h-4 w-4 ${
                              msg.read ? 'text-blue-600' : 'text-black/40'
                            }`} />
                          )}
                        </div>
                      </div>
                      {isOwnMessage && (
                        <span className="text-xs text-slate-500 mt-1 mr-1 text-right">Enviado</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-3" data-testid="chat-form">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            className="bg-[#111827] border-white/10 text-white h-12 flex-1"
            data-testid="message-input"
          />
          <Button
            type="submit"
            className="bg-[#00e0ff] text-black hover:bg-[#33eaff] font-bold px-6"
            data-testid="send-message-button"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}