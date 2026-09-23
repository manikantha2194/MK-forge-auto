import React, { useState } from 'react';
import {
  Send,
  Mail,
  MessageCircle,
  Github,
  Linkedin,
  Instagram,
  Youtube,
  Twitter,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { apiFetch } from '../utils/api';

export const ContactSection: React.FC = () => {
  const { profile } = usePortfolio();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    honeypot: '', // invisible to humans, catches bots
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const email = profile?.socials?.email || 'manimoram143@gmail.com';
  const whatsappUrl = profile?.socials?.whatsappUrl || 'https://wa.me/919999999999';
  const socials = profile?.socials;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setStatusMessage('Please fill in all required fields.');
      return;
    }

    setStatus('loading');
    setStatusMessage('');

    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setStatusMessage(data.message || 'Thank you! Your message has been sent to Manikantha.');
        setFormData({ name: '', email: '', message: '', honeypot: '' });
      } else {
        setStatus('error');
        setStatusMessage(data.error || 'Failed to deliver message. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('Network error occurred. You can also reach out via WhatsApp or direct email.');
    }
  };

  return (
    <section id="contact" className="relative z-10 py-20 lg:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] mb-4 shadow-[0_0_15px_-4px_rgba(255,122,0,0.3)]">
            <Send className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF8A00] font-semibold">
              GET IN TOUCH
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Initiate a <span className="text-[#FF7A00]">Conversation</span>
          </h2>
          <p className="mt-3 text-[#B8B8B8] max-w-xl text-base sm:text-lg font-light">
            Have a project in mind, an AI pipeline to build, or want to collaborate? Reach out anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* =========================================
              LEFT: DIRECT CHANNELS & SOCIAL LINKS
             ========================================= */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* WhatsApp Quick Action Card */}
            <a
              id="contact-whatsapp-direct"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.25)] hover:border-[#25D366] transition-all duration-300 flex items-center gap-5 shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(37,211,102,0.25)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/40 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#25D366] font-bold uppercase tracking-wider">
                  INSTANT MESSAGING
                </span>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#25D366] transition-colors">
                  Direct WhatsApp Chat
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  Fastest response for urgent client work &amp; calls
                </p>
              </div>
            </a>

            {/* Email Card */}
            <a
              id="contact-email-direct"
              href={`mailto:${email}`}
              className="group p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.25)] hover:border-[#FF7A00] transition-all duration-300 flex items-center gap-5 shadow-lg hover:shadow-[0_10px_25px_-5px_rgba(255,122,0,0.25)]"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FF7A00]/15 border border-[#FF7A00]/40 flex items-center justify-center text-[#FF7A00] group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-[#FF8A00] font-bold uppercase tracking-wider">
                  DIRECT INBOX
                </span>
                <h3 className="font-display text-lg font-bold text-white group-hover:text-[#FF8A00] transition-colors break-all">
                  {email}
                </h3>
                <p className="text-xs text-[#777777] mt-0.5">
                  For formal inquiries, scopes &amp; proposals
                </p>
              </div>
            </a>

            {/* Social Network Links */}
            <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)]">
              <span className="text-xs font-mono text-[#777777] uppercase tracking-wider block mb-4">
                OFFICIAL DIGITAL PRESENCE
              </span>
              <div className="grid grid-cols-2 gap-3">
                {socials?.github && (
                  <a
                    href={socials.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-medium text-[#B8B8B8] hover:text-white hover:border-[#FF7A00]/50 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                )}
                {socials?.linkedin && (
                  <a
                    href={socials.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-medium text-[#B8B8B8] hover:text-[#0A66C2] hover:border-[#0A66C2]/50 transition-colors"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {socials?.instagram && (
                  <a
                    href={socials.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-medium text-[#B8B8B8] hover:text-[#E1306C] hover:border-[#E1306C]/50 transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </a>
                )}
                {socials?.youtube && (
                  <a
                    href={socials.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-xs font-medium text-[#B8B8B8] hover:text-[#FF0000] hover:border-[#FF0000]/50 transition-colors"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>YouTube</span>
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* =========================================
              RIGHT: SECURE CONTACT FORM
             ========================================= */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.25)] shadow-2xl relative overflow-hidden">
              
              <div className="mb-6">
                <h3 className="font-display text-2xl font-bold text-white">
                  Send a Direct Message
                </h3>
                <p className="text-sm text-[#777777] mt-1">
                  Fill out the form below. Messages are saved securely and delivered directly.
                </p>
              </div>

              {/* Status Feedback Banners */}
              {status === 'success' && (
                <div className="mb-6 p-4 rounded-xl bg-[#25D366]/15 border border-[#25D366]/50 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                  <p className="text-sm text-white font-medium">{statusMessage}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/50 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200 font-medium">{statusMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Honeypot field (hidden from screen, catches bots) */}
                <input
                  type="text"
                  name="honeypot"
                  value={formData.honeypot}
                  onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label htmlFor="contact-name" className="block text-xs font-mono uppercase text-[#B8B8B8] mb-2 font-semibold">
                    Your Name <span className="text-[#FF7A00]">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#050505] border border-[rgba(255,122,0,0.25)] focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] text-white text-sm placeholder-[#555555] transition-all outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-xs font-mono uppercase text-[#B8B8B8] mb-2 font-semibold">
                    Your Email Address <span className="text-[#FF7A00]">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. alex@company.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#050505] border border-[rgba(255,122,0,0.25)] focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] text-white text-sm placeholder-[#555555] transition-all outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-mono uppercase text-[#B8B8B8] mb-2 font-semibold">
                    Project Details &amp; Message <span className="text-[#FF7A00]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your project, timeline, deliverables, or questions..."
                    className="w-full px-4 py-3.5 rounded-xl bg-[#050505] border border-[rgba(255,122,0,0.25)] focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] text-white text-sm placeholder-[#555555] transition-all outline-none resize-none"
                  />
                </div>

                <button
                  id="contact-submit-btn"
                  type="submit"
                  disabled={status === 'loading'}
                  className="orange-glow-btn w-full py-4 rounded-xl text-black font-extrabold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,122,0,0.4)]"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Transmit Message</span>
                      <Send className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
