import React, { useState } from 'react';
import { Save, Lock, CheckCircle, AlertCircle, Loader2, Download, Database, FileJson } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../utils/api';

export const SettingsManager: React.FC = () => {
  const { profile, refreshProfile } = usePortfolio();
  const { token } = useAuth();

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile fields state
  const [form, setForm] = useState({
    name: profile?.name || 'Manikantha',
    brandName: profile?.brandName || 'MANIKANTHA',
    shortGreeting: profile?.shortGreeting || "HI, I'M MANI",
    mainHeadline: profile?.mainHeadline || 'FREELANCER',
    subHeadline: profile?.subHeadline || 'AI/ML • WEB DESIGNER • CONTENT CREATOR',
    tagline: profile?.tagline || 'Turning Ideas into Digital Reality',
    whatsappUrl: profile?.socials?.whatsappUrl || 'https://wa.me/919999999999',
    email: profile?.socials?.email || 'manimoram143@gmail.com',
    github: profile?.socials?.github || 'https://github.com/manikantha',
    linkedin: profile?.socials?.linkedin || 'https://linkedin.com/in/manikantha',
    instagram: profile?.socials?.instagram || 'https://instagram.com/manikantha',
    youtube: profile?.socials?.youtube || 'https://youtube.com/@forge_auto',
    bio1: profile?.aboutBio?.[0] || '',
    bio2: profile?.aboutBio?.[1] || '',
    bio3: profile?.aboutBio?.[2] || '',
  });

  // Password change state
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await apiFetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          brandName: form.brandName,
          shortGreeting: form.shortGreeting,
          mainHeadline: form.mainHeadline,
          subHeadline: form.subHeadline,
          tagline: form.tagline,
          aboutBio: [form.bio1, form.bio2, form.bio3].filter(Boolean),
          socials: {
            whatsappUrl: form.whatsappUrl,
            email: form.email,
            github: form.github,
            linkedin: form.linkedin,
            instagram: form.instagram,
            youtube: form.youtube,
          },
        }),
      });

      if (res.ok) {
        await refreshProfile();
        setProfileMsg({ type: 'success', text: 'Portfolio settings updated successfully.' });
      } else {
        setProfileMsg({ type: 'error', text: 'Failed to update settings.' });
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Network connection error.' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwords.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setSavingPassword(true);
    setPasswordMsg(null);

    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordMsg({ type: 'error', text: data.error || 'Failed to change password.' });
      }
    } catch {
      setPasswordMsg({ type: 'error', text: 'Error changing password.' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Profile Form */}
      <div>
        <div className="mb-6">
          <h3 className="font-display text-2xl font-bold text-white">
            Portfolio Brand &amp; Text Settings
          </h3>
          <p className="text-sm text-[#777777] mt-1">
            Adjust headline copywriting, WhatsApp links, and public profile narratives.
          </p>
        </div>

        {profileMsg && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
              profileMsg.type === 'success'
                ? 'bg-[#25D366]/15 border border-[#25D366]/50 text-white'
                : 'bg-red-500/15 border border-red-500/50 text-red-200'
            }`}
          >
            {profileMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#25D366] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                Brand Name (Display)
              </label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => setForm({ ...form, brandName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                Hero Short Greeting
              </label>
              <input
                type="text"
                value={form.shortGreeting}
                onChange={(e) => setForm({ ...form, shortGreeting: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                Hero Main Headline
              </label>
              <input
                type="text"
                value={form.mainHeadline}
                onChange={(e) => setForm({ ...form, mainHeadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                Hero Sub-headline
              </label>
              <input
                type="text"
                value={form.subHeadline}
                onChange={(e) => setForm({ ...form, subHeadline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                Tagline
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <h4 className="font-display text-base font-bold text-white mb-4">
              Direct Contact &amp; Social Links
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                  Direct WhatsApp Link
                </label>
                <input
                  type="url"
                  value={form.whatsappUrl}
                  onChange={(e) => setForm({ ...form, whatsappUrl: e.target.value })}
                  placeholder="https://wa.me/..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                  Direct Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={form.youtube}
                  onChange={(e) => setForm({ ...form, youtube: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
                  LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  value={form.linkedin}
                  onChange={(e) => setForm({ ...form, linkedin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06]">
            <h4 className="font-display text-base font-bold text-white mb-4">
              About Bio Paragraphs
            </h4>
            <div className="space-y-3">
              <textarea
                rows={2}
                value={form.bio1}
                onChange={(e) => setForm({ ...form, bio1: e.target.value })}
                placeholder="First paragraph..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00] resize-none"
              />
              <textarea
                rows={2}
                value={form.bio2}
                onChange={(e) => setForm({ ...form, bio2: e.target.value })}
                placeholder="Second paragraph..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00] resize-none"
              />
              <textarea
                rows={2}
                value={form.bio3}
                onChange={(e) => setForm({ ...form, bio3: e.target.value })}
                placeholder="Third paragraph..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00] resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingProfile}
            className="orange-glow-btn px-7 py-3 rounded-xl text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {savingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[3]" />
                <span>Save Profile Configuration</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="pt-10 border-t border-white/[0.08]">
        <div className="mb-6">
          <h3 className="font-display text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#FF7A00]" />
            <span>Administrator Credentials</span>
          </h3>
          <p className="text-sm text-[#777777] mt-1">
            Update your admin login password securely.
          </p>
        </div>

        {passwordMsg && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm ${
              passwordMsg.type === 'success'
                ? 'bg-[#25D366]/15 border border-[#25D366]/50 text-white'
                : 'bg-red-500/15 border border-red-500/50 text-red-200'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-[#25D366] shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#B8B8B8] mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-sm outline-none focus:border-[#FF7A00]"
            />
          </div>

          <button
            type="submit"
            disabled={savingPassword}
            className="orange-glow-btn px-6 py-2.5 rounded-xl text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
          >
            {savingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>

      {/* System Backup & Data Export */}
      <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-white/[0.08] space-y-4">
        <div className="flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-[#FF7A00]" />
          <h3 className="font-display font-bold text-base">System Backup &amp; Data Export</h3>
        </div>
        <p className="text-xs text-zinc-400">
          Download a complete, offline JSON snapshot of all projects, skills, timeline, home background parameters, and CMS configurations.
        </p>

        <div className="pt-2">
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await apiFetch('/api/cms/all', {
                  headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              } catch (e) {
                alert('Failed to generate database export.');
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#FF7A00]" />
            <span>Export Database Backup (JSON)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
