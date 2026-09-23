import React from 'react';
import {
  Shield,
  FolderGit2,
  Image as ImageIcon,
  Mail,
  Terminal,
  Briefcase,
  CheckCircle,
  ExternalLink,
  ArrowRight,
  Server,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePortfolio } from '../../context/PortfolioContext';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const { user, token } = useAuth();
  const { projects, profile, skills, experience } = usePortfolio();

  const featuredCount = projects.filter((p) => p.featured).length;
  const configuredSlotsCount = profile?.media
    ? Object.values(profile.media).filter(Boolean).length
    : 4;

  const statCards = [
    {
      id: 'projects',
      label: 'Portfolio Projects',
      value: projects.length,
      subtext: `${featuredCount} featured on showcase`,
      icon: FolderGit2,
      tab: 'projects',
      color: 'text-[#FF7A00]',
      bgColor: 'bg-[#FF7A00]/10',
      borderColor: 'border-[#FF7A00]/30',
    },
    {
      id: 'media',
      label: 'Brand Media Assets',
      value: `${configuredSlotsCount}/4`,
      subtext: 'Hero, Portrait, Monogram, Banner',
      icon: ImageIcon,
      tab: 'media',
      color: 'text-amber-400',
      bgColor: 'bg-amber-400/10',
      borderColor: 'border-amber-400/30',
    },
    {
      id: 'skills',
      label: 'Active Skills',
      value: skills.length,
      subtext: 'Across 4 technical categories',
      icon: Terminal,
      tab: 'skills',
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-400/10',
      borderColor: 'border-cyan-400/30',
    },
    {
      id: 'timeline',
      label: 'Career Milestones',
      value: experience.length,
      subtext: 'Verified timeline credentials',
      icon: Briefcase,
      tab: 'experience',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-400/10',
      borderColor: 'border-emerald-400/30',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner with Admin Clearance */}
      <div className="relative p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0D0D0D] via-[#141414] to-[#0D0D0D] border border-[rgba(255,122,0,0.3)] shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF7A00]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF7A00]/15 border border-[#FF7A00]/40 text-[#FF7A00] text-xs font-mono font-bold tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-pulse" />
              AUTHENTICATED AS ADMINISTRATOR
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome to Portfolio Command, <span className="text-[#FF7A00]">{user?.name || 'Manikantha'}</span>
            </h3>
            <p className="text-sm text-[#888888] max-w-2xl leading-relaxed">
              Full administrative privileges active. You can manage public projects, upload custom visuals, update technical skill matrices, and oversee communications.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('projects')}
              className="orange-glow-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-black font-extrabold text-xs uppercase tracking-wider cursor-pointer shadow-lg"
            >
              <FolderGit2 className="w-4 h-4" />
              <span>Manage Projects</span>
            </button>
            <button
              onClick={() => onNavigateTab('media')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] hover:border-[#FF7A00]/50 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ImageIcon className="w-4 h-4 text-[#FF7A00]" />
              <span>Media Assets</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => onNavigateTab(card.tab)}
              className="p-5 rounded-2xl bg-[#0D0D0D] border border-white/[0.07] hover:border-[#FF7A00]/40 transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${card.bgColor} ${card.borderColor} border flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#555555] group-hover:text-[#FF7A00] group-hover:translate-x-1 transition-all" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-[#777777] block font-medium">
                  {card.label}
                </span>
                <span className="font-display text-2xl font-black text-white mt-1 block">
                  {card.value}
                </span>
                <span className="text-[11px] font-mono text-[#555555] mt-1 block truncate">
                  {card.subtext}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Access & System Architecture Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Security & Auth Verification Panel */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-4 h-4 text-[#FF7A00]" />
              <h4 className="font-display text-base font-bold text-white uppercase tracking-wider">
                Security &amp; Auth State
              </h4>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Account Role</span>
                <span className="text-[#FF7A00] font-bold uppercase flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-[#FF7A00]" />
                  {user?.role}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Signed-In As</span>
                <span className="text-white font-medium truncate max-w-[160px]">
                  {user?.email}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Session Token</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Active (JWT)
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Endpoints Guard</span>
                <span className="text-[#B8B8B8]">requireAdmin (HTTP 403)</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#555555]">
            <span>MK Security Shield</span>
            <span className="text-[#FF7A00]">Protected</span>
          </div>
        </div>

        {/* Media Slots Quick Health */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#FF7A00]" />
                <h4 className="font-display text-base font-bold text-white uppercase tracking-wider">
                  Branding Media Slots
                </h4>
              </div>
              <button
                onClick={() => onNavigateTab('media')}
                className="text-xs font-mono text-[#FF7A00] hover:underline"
              >
                Configure
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {[
                { slot: 'Hero Visual', val: profile?.media?.heroCharacter || '/assets/hero-character.svg' },
                { slot: 'Portrait Photo', val: profile?.media?.aboutPhoto || '/assets/about-manikantha.svg' },
                { slot: 'Monogram Logo', val: profile?.media?.brandIcon || '/assets/mk-logo.svg' },
                { slot: 'forge_auto Banner', val: profile?.media?.brandBanner || '/assets/mk-forge-auto.svg' },
              ].map((item) => (
                <div
                  key={item.slot}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <span className="text-white font-medium">{item.slot}</span>
                  <span className="text-[11px] text-[#777777] truncate max-w-[140px]">
                    {item.val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('media')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-xs font-mono text-center text-[#B8B8B8] hover:text-white transition-colors"
          >
            Upload or Replace Media Assets &rarr;
          </button>
        </div>

        {/* Server Architecture & Storage */}
        <div className="p-6 rounded-2xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.2)] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-4 h-4 text-[#FF7A00]" />
              <h4 className="font-display text-base font-bold text-white uppercase tracking-wider">
                System Telemetry
              </h4>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Runtime</span>
                <span className="text-white font-bold">Node.js + Express 4</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Ingress Host</span>
                <span className="text-white font-bold">0.0.0.0:3000</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Media Upload Storage</span>
                <span className="text-[#FF7A00] font-bold">/uploads (Multer 10MB)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <span className="text-[#777777]">Data Persistence</span>
                <span className="text-emerald-400 font-bold">data/portfolio.json</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-[#555555]">
            <span>Cloud Run Status</span>
            <span className="text-emerald-400 font-bold">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
};
