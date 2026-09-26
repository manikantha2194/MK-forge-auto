import React from 'react';
import { ArrowUp, Heart, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export const Footer: React.FC = () => {
  const { profile } = usePortfolio();

  const brandIcon = profile?.media?.brandIcon || '/assets/mk-logo.svg';
  const brandBanner = profile?.media?.brandBanner || '/assets/mk-forge-auto.svg';
  const brandName = profile?.brandName || 'MANIKANTHA';

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Work', href: '#work' },
    { label: 'Content', href: '#content' },
    { label: 'Skills', href: '#skills' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <footer className="relative z-10 bg-[#050505] border-t border-[rgba(255,122,0,0.18)] py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Banner (BANNER_FORGE_AUTO slot) */}
        <div className="w-full mb-10 rounded-2xl overflow-hidden border border-[rgba(255,122,0,0.25)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] bg-[#0A0A0A] max-h-48 sm:max-h-56 relative group">
          <img
            src={brandBanner}
            alt="Brand Banner forge_auto"
            data-slot="BANNER_FORGE_AUTO"
            referrerPolicy="no-referrer"
            onError={(e) => {
              if (e.currentTarget.src !== window.location.origin + '/assets/mk-forge-auto.svg') {
                e.currentTarget.src = '/assets/mk-forge-auto.svg';
              }
            }}
            className="w-full h-full object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/80 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-3 left-4 flex items-center gap-2 pointer-events-none">
            <span className="px-2.5 py-0.5 rounded-full bg-black/70 border border-[#FF7A00]/40 text-[#FF7A00] font-mono text-[10px] font-bold tracking-widest uppercase backdrop-blur-sm">
              MK forge_auto
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          
          {/* Brand Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden p-0.5 border border-[rgba(255,122,0,0.4)] shadow-[0_0_15px_rgba(255,122,0,0.3)] bg-[#0D0D0D]">
              <img
                src={brandIcon}
                alt="Brand Icon"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.currentTarget.src !== window.location.origin + '/assets/mk-logo.svg') {
                    e.currentTarget.src = '/assets/mk-logo.svg';
                  }
                }}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-wider text-white">
                {brandName}
              </span>
              <div className="text-[11px] font-mono text-[#FF7A00] tracking-widest uppercase">
                MK forge_auto
              </div>
            </div>
          </div>

          {/* Nav Quick Links */}
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-[#B8B8B8]">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#FF7A00] transition-colors font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Back to Top */}
          <button
            onClick={scrollToTop}
            id="footer-back-to-top-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] hover:border-[#FF7A00] text-xs font-semibold text-[#B8B8B8] hover:text-white transition-all cursor-pointer shadow-md group"
            aria-label="Back to Top"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-[#FF7A00] group-hover:-translate-y-1 transition-transform" />
          </button>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777] font-mono">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <div className="flex items-center gap-1.5">
            <span>Engineered with</span>
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Futuristic Precision</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
