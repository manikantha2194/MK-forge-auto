import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, Shield, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePortfolio } from '../context/PortfolioContext';

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenAdmin: () => void;
  activeSection: string;
}

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Content', href: '#content' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  onOpenLogin,
  onOpenAdmin,
  activeSection,
}) => {
  const { isAdmin, user } = useAuth();
  const { profile } = usePortfolio();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const logoSrc = profile?.media?.brandIcon || '/assets/mk-logo.svg';
  const brandName = profile?.brandName || 'MANIKANTHA';

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#050505]/85 backdrop-blur-md border-b border-[rgba(255,122,0,0.18)] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand: MK Icon + MANIKANTHA */}
        <a
          href="#home"
          className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A00] rounded-lg p-1"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('#home');
          }}
          aria-label="Manikantha Home"
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden p-0.5 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1 shadow-[0_0_15px_-3px_rgba(255,122,0,0.4)]">
            <img
              src={logoSrc}
              alt="MK Brand Icon"
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.src !== window.location.origin + '/assets/mk-logo.svg') {
                  e.currentTarget.src = '/assets/mk-logo.svg';
                }
              }}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-wider text-white group-hover:text-[#FF8A00] transition-colors">
              {brandName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#777777] -mt-1 font-mono">
              forge_auto
            </span>
          </div>
        </a>

        {/* Desktop Navigation Menu */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 px-3 py-1.5 rounded-full bg-[#0D0D0D]/70 border border-[rgba(255,122,0,0.15)] backdrop-blur-md" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const sectionId = item.href.replace('#', '');
            const isActive = activeSection === sectionId;
            return (
              <button
                key={item.label}
                id={`nav-${sectionId}`}
                onClick={() => handleNavClick(item.href)}
                className={`relative px-3.5 py-1.5 text-xs xl:text-sm font-medium transition-all duration-200 rounded-full select-none cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-[#B8B8B8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-full bg-[#FF7A00]/20 border border-[#FF7A00]/50 -z-10 shadow-[0_0_12px_rgba(255,122,0,0.35)]" />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Area: Login / Admin Button */}
        <div className="hidden lg:flex items-center gap-3">
          {isAdmin ? (
            <button
              id="admin-dashboard-nav-btn"
              onClick={onOpenAdmin}
              className="flex items-center gap-2 px-4 py-2 text-xs xl:text-sm font-semibold text-white bg-gradient-to-r from-[#FF7A00] to-[#FF8A00] rounded-full shadow-[0_0_20px_rgba(255,122,0,0.4)] hover:shadow-[0_0_25px_rgba(255,122,0,0.7)] transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </button>
          ) : (
            <button
              id="login-nav-btn"
              onClick={onOpenLogin}
              className="flex items-center gap-2 px-4 py-2 text-xs xl:text-sm font-semibold text-[#B8B8B8] hover:text-white bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] hover:border-[#FF7A00] rounded-full hover:bg-white/[0.04] transition-all cursor-pointer shadow-[0_0_12px_-3px_rgba(255,122,0,0.2)]"
            >
              <LogIn className="w-4 h-4 text-[#FF7A00]" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl bg-[#FF7A00]/20 border border-[#FF7A00]/40 text-[#FF8A00]"
              aria-label="Admin Portal"
            >
              <Shield className="w-5 h-5" />
            </button>
          )}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.25)] text-[#B8B8B8] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#FF7A00]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#FF7A00]" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[65px] bg-[#050505]/95 backdrop-blur-xl border-b border-[rgba(255,122,0,0.2)] px-6 py-6 shadow-2xl transition-all">
          <div className="flex flex-col space-y-2">
            {NAV_ITEMS.map((item) => {
              const sectionId = item.href.replace('#', '');
              const isActive = activeSection === sectionId;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
                    isActive
                      ? 'bg-[#FF7A00]/15 text-white border border-[#FF7A00]/40 font-semibold'
                      : 'text-[#B8B8B8] hover:bg-white/[0.04] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#777777]" />
                </button>
              );
            })}

            <div className="pt-4 mt-2 border-t border-white/[0.08]">
              {isAdmin ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAdmin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF8A00] text-white font-semibold shadow-lg"
                >
                  <Shield className="w-4 h-4" />
                  <span>Open Admin Portal</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLogin();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] text-white font-semibold"
                >
                  <LogIn className="w-4 h-4 text-[#FF7A00]" />
                  <span>Admin Login</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
