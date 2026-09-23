import React, { useState, useEffect } from 'react';
import { Mail, Trash2, CheckCircle2, AlertCircle, Clock, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ContactMessage } from '../../types';

export const MessagesManager: React.FC = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/contact', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markRead = async (id: string) => {
    try {
      const res = await fetch(`/api/contact/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: true } : m))
        );
      }
    } catch (err) {
      console.error('Error marking message read:', err);
    }
  };

  const deleteMsg = async (id: string) => {
    if (!window.confirm('Delete message?')) return;
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="font-display text-2xl font-bold text-white">
          Contact Form Inquiries
        </h3>
        <p className="text-sm text-[#777777] mt-1">
          Direct inquiries transmitted through the portfolio contact form.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-[#0D0D0D] animate-pulse" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0D0D0D] border border-white/[0.06]">
          <Mail className="w-10 h-10 text-[#555555] mx-auto mb-3" />
          <p className="text-sm text-[#B8B8B8]">No contact messages recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-6 rounded-2xl border transition-all ${
                msg.read
                  ? 'bg-[#0D0D0D] border-white/[0.08]'
                  : 'bg-[#0D0D0D] border-[#FF7A00]/50 shadow-[0_0_20px_rgba(255,122,0,0.15)]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <h4 className="font-display text-base font-bold text-white">{msg.name}</h4>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-xs font-mono text-[#FF7A00] hover:underline"
                  >
                    {msg.email}
                  </a>
                  {!msg.read && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF7A00] text-black font-extrabold text-[10px] uppercase">
                      New
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#777777] font-mono">
                  <Clock className="w-3.5 h-3.5 text-[#555555]" />
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <p className="text-sm text-[#B8B8B8] leading-relaxed whitespace-pre-wrap bg-[#050505] p-4 rounded-xl border border-white/[0.05]">
                {msg.message}
              </p>

              <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/[0.06]">
                {!msg.read && (
                  <button
                    onClick={() => markRead(msg.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#B8B8B8] hover:text-[#FF7A00]"
                  >
                    <Check className="w-4 h-4 text-[#FF7A00]" />
                    <span>Mark as Read</span>
                  </button>
                )}
                <button
                  onClick={() => deleteMsg(msg.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#B8B8B8] hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
