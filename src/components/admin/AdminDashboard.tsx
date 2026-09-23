import React, { useState, useEffect } from 'react';
import {
  Shield,
  Image as ImageIcon,
  FolderGit2,
  Video,
  Terminal,
  Briefcase,
  Mail,
  Settings,
  LogOut,
  ExternalLink,
  LayoutDashboard,
  Lock,
  UserCheck,
  AlertTriangle,
  Loader2,
  Key,
  X,
  Menu,
  Sparkles,
  Layers,
  Home,
  User,
  Cpu,
  Award,
  Share2,
  Palette,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { apiFetch } from '../../utils/api';
import { AdminOverview } from './AdminOverview';
import { MediaManager } from './MediaManager';
import { ProjectsManager } from './ProjectsManager';
import { ContentManager } from './ContentManager';
import { SkillsManager } from './SkillsManager';
import { ExperienceManager } from './ExperienceManager';
import { MessagesManager } from './MessagesManager';
import { SettingsManager } from './SettingsManager';
import { HomeBackgroundManager } from './HomeBackgroundManager';
import { HomeHeroManager } from './HomeHeroManager';
import { AboutManager } from './AboutManager';
import { ServicesManager } from './ServicesManager';
import { CertificationsManager } from './CertificationsManager';
import { SocialLinksManager } from './SocialLinksManager';
import { AppearanceManager } from './AppearanceManager';

interface AdminDashboardProps {
  onClose: () => void;
}

export type TabType =
  | 'overview'
  | 'home-background'
  | 'home-hero'
  | 'about'
  | 'services'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'certifications'
  | 'media'
  | 'content'
  | 'social'
  | 'appearance'
  | 'messages'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const { user, login, logout, isAdmin, isLoading } = useAuth();
  const { projects, content, skills, experience, services, certifications, socialLinks } = usePortfolio();

  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In-line login state when unauthenticated
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleInlineLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword }),
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.token && data?.user) {
        login(data.token, data.user);
        if (data.user.role !== 'admin') {
          setLoginError('This account is authenticated, but does not have administrator privileges.');
        }
      } else {
        setLoginError(data?.error || `Authentication failed (${res.status}). Invalid credentials.`);
      }
    } catch (err) {
      console.error('[AdminDashboard] Authentication request failed:', err);
      setLoginError('Failed to communicate with authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const autofillAdminDemo = () => {
    setLoginEmail('manimoram143@gmail.com');
    setLoginPassword('admin123');
    setLoginError(null);
  };

  // ==========================================
  // AUTHENTICATION CHECK & GUARD
  // ==========================================
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
        <div className="p-8 rounded-2xl bg-[#0D0D0D] border border-white/[0.1] text-center max-w-sm space-y-3">
          <Loader2 className="w-8 h-8 text-[#FF7A00] animate-spin mx-auto" />
          <p className="font-mono text-xs text-[#B8B8B8]">Verifying administrator credentials...</p>
        </div>
      </div>
    );
  }

  // Not logged in OR logged in as non-admin
  if (!user || !isAdmin) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md overflow-y-auto">
        <div className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center my-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-[#777777] hover:text-white bg-white/[0.03] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#FF7A00]/10 border border-[#FF7A00]/30 flex items-center justify-center mx-auto mb-4 text-[#FF7A00] shadow-[0_0_20px_rgba(255,122,0,0.15)]">
            <Shield className="w-8 h-8" />
          </div>

          <div className="space-y-1 mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#FF7A00] font-bold">
              SECURITY CHECKPOINT
            </span>
            <h3 className="font-display text-2xl font-black text-white">
              Administrator Access Required
            </h3>
            <p className="text-xs text-[#888888] max-w-xs mx-auto mt-1">
              Sign in with administrative privileges to manage portfolio projects, upload brand assets, and update content.
            </p>
          </div>

          {/* If logged in as non-admin */}
          {user && !isAdmin && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-left mb-6 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Insufficient Privileges</span>
              </div>
              <p className="text-xs text-[#B8B8B8]">
                You are currently signed in as <strong className="text-white">{user.email}</strong> with role <span className="font-mono text-amber-400">"{user.role}"</span>. Admin role is required.
              </p>
              <button
                onClick={logout}
                className="text-xs font-mono text-[#FF7A00] hover:underline block pt-1"
              >
                Log out to switch to an Admin account &rarr;
              </button>
            </div>
          )}

          {/* Inline Login Form */}
          {(!user || !isAdmin) && (
            <form onSubmit={handleInlineLogin} className="space-y-4 text-left">
              {loginError && (
                <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase text-[#AAAAAA] mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="manimoram143@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-xs font-mono focus:border-[#FF7A00] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-[#AAAAAA] mb-1">
                  Admin Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#050505] border border-white/[0.1] text-white text-xs font-mono focus:border-[#FF7A00] outline-none"
                />
              </div>

              <div className="pt-2 flex flex-col gap-2.5">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="orange-glow-btn w-full py-2.5 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer shadow-lg"
                >
                  {loginLoading ? 'Verifying...' : 'Authenticate as Admin'}
                </button>

                <button
                  type="button"
                  onClick={autofillAdminDemo}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-[#FF7A00]/40 text-[#AAAAAA] hover:text-white text-xs font-mono flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>Auto-fill Admin Credentials</span>
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-center">
            <button
              onClick={onClose}
              className="text-xs font-mono text-[#777777] hover:text-white transition-colors"
            >
              &larr; Return to Public Portfolio
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED ADMINISTRATOR WORKSPACE
  // ==========================================
  const navTabs = [
    { id: 'overview', label: 'Command Overview', icon: LayoutDashboard },
    { id: 'home-background', label: 'Home 3D Background', icon: Layers, badge: 'Live 3D' },
    { id: 'home-hero', label: 'Home Hero Section', icon: Home },
    { id: 'about', label: 'About & Bio', icon: User },
    { id: 'services', label: 'Services & Offerings', icon: Cpu, badge: services.length },
    { id: 'projects', label: 'Projects Portfolio', icon: FolderGit2, badge: projects.length },
    { id: 'skills', label: 'Technical Skills', icon: Terminal, badge: skills.length },
    { id: 'experience', label: 'Timeline & Career', icon: Briefcase, badge: experience.length },
    { id: 'certifications', label: 'Certifications', icon: Award, badge: certifications.length },
    { id: 'media', label: 'Media & Brand Visuals', icon: ImageIcon, badge: '4 Slots' },
    { id: 'content', label: 'Content & Videos', icon: Video, badge: content.length },
    { id: 'social', label: 'Social Links', icon: Share2, badge: socialLinks.length },
    { id: 'appearance', label: 'Theme & Appearance', icon: Palette },
    { id: 'messages', label: 'Contact Inquiries', icon: Mail },
    { id: 'settings', label: 'Brand & Settings', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] text-white flex flex-col overflow-hidden">
      {/* Top Bar Header */}
      <header className="h-16 px-4 sm:px-6 bg-[#0D0D0D] border-b border-[rgba(255,122,0,0.2)] flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white/[0.04] text-[#B8B8B8] hover:text-white"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 rounded-xl bg-[#FF7A00]/20 border border-[#FF7A00]/50 flex items-center justify-center text-[#FF7A00] shrink-0">
            <Shield className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm sm:text-base font-bold text-white leading-tight">
                MANIKANTHA • Command Center
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] text-[10px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" />
                ADMIN ACTIVE
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#777777] block">
              Logged in as <span className="text-[#FF7A00] font-semibold">{user.email}</span>
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-[#B8B8B8] hover:text-white transition-colors cursor-pointer"
            title="View Live Site (Esc)"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Live Site</span>
          </button>

          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 transition-colors cursor-pointer"
            title="Sign out of Admin Session"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Layout: Sidebar + Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar for Desktop & Mobile Overlay */}
        <aside
          className={`fixed md:static inset-y-0 left-0 top-16 md:top-0 z-30 w-64 bg-[#090909] border-r border-[rgba(255,122,0,0.15)] p-4 flex flex-col justify-between shrink-0 overflow-y-auto transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <nav className="space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-[#555555] tracking-wider px-3 mb-2 block font-semibold">
              MANAGEMENT MODULES
            </span>

            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF7A00] text-black font-bold shadow-[0_0_15px_rgba(255,122,0,0.35)]'
                      : 'text-[#B8B8B8] hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#FF7A00]'}`} />
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        isActive
                          ? 'bg-black/20 text-black font-extrabold'
                          : 'bg-white/[0.06] text-[#777777]'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Session Box */}
          <div className="mt-6 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-[#777777] space-y-1">
            <div className="text-white font-bold flex items-center justify-between">
              <span>Security Level</span>
              <span className="text-[#FF7A00] font-bold uppercase">Root Admin</span>
            </div>
            <div>Server: Express 4.x</div>
            <div className="text-[10px] text-[#555555]">Container Port 3000</div>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-20 bg-black/60 md:hidden"
          />
        )}

        {/* Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-10 bg-[#050505]">
          <div className="max-w-5xl mx-auto">
            {activeTab === 'overview' && <AdminOverview onNavigateTab={(tab) => setActiveTab(tab as TabType)} />}
            {activeTab === 'home-background' && <HomeBackgroundManager />}
            {activeTab === 'home-hero' && <HomeHeroManager />}
            {activeTab === 'about' && <AboutManager />}
            {activeTab === 'services' && <ServicesManager />}
            {activeTab === 'projects' && <ProjectsManager />}
            {activeTab === 'skills' && <SkillsManager />}
            {activeTab === 'experience' && <ExperienceManager />}
            {activeTab === 'certifications' && <CertificationsManager />}
            {activeTab === 'media' && <MediaManager />}
            {activeTab === 'content' && <ContentManager />}
            {activeTab === 'social' && <SocialLinksManager />}
            {activeTab === 'appearance' && <AppearanceManager />}
            {activeTab === 'messages' && <MessagesManager />}
            {activeTab === 'settings' && <SettingsManager />}
          </div>
        </main>
      </div>
    </div>
  );
};
