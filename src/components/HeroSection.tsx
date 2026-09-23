import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Code, Brain, Video, PenTool, Settings, Sparkles, Send } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { MediaFallback } from './MediaFallback';
import { InteractiveHeroBackground } from './InteractiveHeroBackground';

interface HeroSectionProps {
  onViewWork: () => void;
  onHireMe: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onViewWork, onHireMe }) => {
  const { profile, heroConfig } = usePortfolio();
  const heroRef = useRef<HTMLDivElement | null>(null);

  // Mouse parallax coordinates
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringHero, setIsHoveringHero] = useState(false);

  useEffect(() => {
    // Disable parallax on touch screens or small devices
    const isMobile = window.matchMedia('(max-width: 1024px)').matches;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const heroCharacterSrc = profile?.media?.heroCharacter || heroConfig?.profileImage || '/assets/hero-character.svg';
  const shortGreeting = heroConfig?.badgeText || profile?.shortGreeting || "HI, I'M MANI";
  const mainHeadline = heroConfig?.heading || profile?.mainHeadline || "FREELANCER";
  const subHeadline = heroConfig?.subtitle || profile?.subHeadline || "AI/ML • WEB DESIGNER • CONTENT CREATOR";
  const tagline = heroConfig?.description || profile?.tagline || "Turning Ideas into Digital Reality";
  const primaryCtaText = heroConfig?.primaryBtnText || "View My Work";
  const secondaryCtaText = heroConfig?.secondaryBtnText || "Hire Me";

  const handlePrimaryClick = () => {
    const url = heroConfig?.primaryBtnUrl;
    if (url?.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    } else if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (primaryCtaText.toLowerCase().includes('hire') || primaryCtaText.toLowerCase().includes('contact')) {
      onHireMe();
    } else {
      onViewWork();
    }
  };

  const handleSecondaryClick = () => {
    const url = heroConfig?.secondaryBtnUrl;
    if (url?.startsWith('#')) {
      const el = document.querySelector(url);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    } else if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (secondaryCtaText.toLowerCase().includes('work') || secondaryCtaText.toLowerCase().includes('portfolio')) {
      onViewWork();
    } else {
      onHireMe();
    }
  };

  const pills = (profile?.badges && profile.badges.length > 0)
    ? profile.badges.map((h: string) => ({ label: h, icon: '⚡' }))
    : [
        { label: 'Innovate', icon: '⚡' },
        { label: 'Create', icon: '🌙' },
        { label: 'Automate', icon: '⚙️' },
        { label: 'Grow', icon: '📈' },
      ];

  return (
    <section
      id="home"
      ref={heroRef}
      onMouseEnter={() => setIsHoveringHero(true)}
      onMouseLeave={() => {
        setIsHoveringHero(false);
        setMousePos({ x: 0, y: 0 });
      }}
      className="relative min-h-[92vh] lg:min-h-screen pt-28 pb-16 lg:pt-32 lg:pb-24 flex items-center justify-center overflow-hidden"
    >
      {/* 3D Continuously Moving Interactive Background Gallery */}
      <InteractiveHeroBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* =========================================
              LEFT COLUMN: TYPOGRAPHY & INTRO
             ========================================= */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left z-20">
            
            {/* Top Greeting Badge */}
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#0D0D0D]/80 border border-[rgba(255,122,0,0.3)] shadow-[0_0_15px_-3px_rgba(255,122,0,0.3)] mb-6 transition-transform hover:scale-105">
              <span className="w-2 h-2 rounded-full bg-[#FF7A00] animate-ping" />
              <span className="font-mono text-xs uppercase tracking-[0.25em] text-[#FF8A00] font-bold">
                {shortGreeting}
              </span>
              <span className="hidden sm:inline w-8 h-[1px] bg-gradient-to-r from-[#FF7A00] to-transparent" />
            </div>

            {/* Massive Display Headline: FREELANCER */}
            <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight uppercase leading-[0.95] text-white select-none">
              <span className="bg-gradient-to-b from-white via-[#EFEFEF] to-[#888888] bg-clip-text text-transparent drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                {mainHeadline}
              </span>
            </h1>

            {/* Futuristic Subtitle: AI/ML • WEB DESIGNER • CONTENT CREATOR */}
            <div className="mt-4 sm:mt-5 text-lg sm:text-2xl lg:text-3xl font-display font-extrabold tracking-wide uppercase text-[#FF7A00] flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-[#FF8A00] drop-shadow-[0_0_15px_rgba(255,122,0,0.5)]">
                {subHeadline}
              </span>
            </div>

            {/* Short Tagline */}
            <p className="mt-4 text-base sm:text-lg text-[#B8B8B8] max-w-xl font-light leading-relaxed">
              {tagline}
            </p>

            {/* Pill Feature Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
              {pills.map((pill: { label: string; icon: string }) => (
                <div
                  key={pill.label}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-[rgba(255,122,0,0.2)] text-xs text-[#B8B8B8] shadow-sm hover:border-[#FF7A00]/50 transition-colors"
                >
                  <span>{pill.icon}</span>
                  <span className="font-medium tracking-wide">{pill.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                id="hero-view-work-btn"
                onClick={handlePrimaryClick}
                className="orange-glow-btn flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 rounded-full text-black font-extrabold text-sm tracking-wider uppercase shadow-[0_0_30px_rgba(255,122,0,0.5)] hover:shadow-[0_0_40px_rgba(255,138,0,0.8)] transition-all transform hover:-translate-y-1 cursor-pointer"
              >
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 text-black stroke-[3]" />
              </button>

              <button
                id="hero-hire-me-btn"
                onClick={handleSecondaryClick}
                className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-4 rounded-full text-white font-semibold text-sm tracking-wider uppercase bg-[#0D0D0D] border border-[rgba(255,122,0,0.4)] hover:border-[#FF7A00] hover:bg-white/[0.05] transition-all transform hover:-translate-y-1 shadow-[0_0_15px_-4px_rgba(255,122,0,0.25)] cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#FF7A00]" />
                <span>{secondaryCtaText}</span>
              </button>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: CHARACTER & ORBIT VISUAL SYSTEM
             ========================================= */}
          <div className="lg:col-span-5 relative flex items-center justify-center min-h-[440px] sm:min-h-[520px] lg:min-h-[620px]">
            
            {/* Interactive Outer Parallax Wrapper */}
            <div
              className="relative w-full max-w-[480px] sm:max-w-[540px] aspect-[4/5] flex items-center justify-center transition-transform duration-300 ease-out"
              style={{
                transform: `translate3d(${mousePos.x * 12}px, ${mousePos.y * 12}px, 0)`,
              }}
            >

              {/* 1. Main Glowing Orange Circular Ring behind character */}
              <div
                className="absolute w-[290px] h-[290px] sm:w-[370px] sm:h-[370px] rounded-full z-0 transition-transform duration-500"
                style={{
                  border: '2px solid rgba(255, 122, 0, 0.75)',
                  boxShadow: '0 0 50px rgba(255, 122, 0, 0.45), inset 0 0 35px rgba(255, 122, 0, 0.3)',
                  transform: `translate3d(${mousePos.x * -6}px, ${mousePos.y * -6}px, 0)`,
                }}
              />

              {/* 2. Secondary Orbit Rings (Concentric & Tilted) */}
              <div
                className="absolute w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-full border border-[rgba(255,122,0,0.25)] border-dashed z-0 pointer-events-none"
                style={{
                  animation: 'orbitSpin 60s linear infinite',
                }}
              />

              <div
                className="absolute w-[400px] h-[400px] sm:w-[500px] sm:h-[500px] rounded-full border border-[rgba(255,122,0,0.15)] z-0 pointer-events-none"
                style={{
                  transform: 'rotate(25deg)',
                }}
              />

              {/* 3. Small Glowing Particles Moving Around Orbit */}
              <div
                className="absolute w-[360px] h-[360px] sm:w-[450px] sm:h-[450px] z-0 pointer-events-none"
                style={{
                  animation: 'orbitSpin 24s linear infinite',
                }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FF8A00] shadow-[0_0_12px_#FF7A00]" />
                <div className="absolute bottom-4 right-12 w-2.5 h-2.5 rounded-full bg-[#FFBA00] shadow-[0_0_10px_#FFBA00]" />
                <div className="absolute top-1/3 left-2 w-2 h-2 rounded-full bg-[#FF7A00] shadow-[0_0_8px_#FF7A00]" />
              </div>

              {/* 4 & 5. Character Visual (Large, Centered, Floating gently) */}
              <div
                className="relative z-10 w-[82%] sm:w-[88%] h-[82%] sm:h-[88%] flex items-center justify-center transition-transform duration-300"
                style={{
                  animation: 'floatGentle 6s ease-in-out infinite',
                  transform: `translate3d(${mousePos.x * 6}px, ${mousePos.y * 6}px, 0)`,
                }}
              >
                <MediaFallback
                  src={heroCharacterSrc}
                  fallbackSrc="/assets/hero-character.svg"
                  alt="Manikantha Hero Character"
                  className="w-full h-full object-contain filter drop-shadow-[0_15px_35px_rgba(255,122,0,0.3)] transition-all"
                  fallbackText="Manikantha Character"
                />
              </div>

              {/* 7. Skill / Service Cards Floating Around Character */}

              {/* Top Left: Web Development */}
              <div
                className="absolute -top-3 left-0 sm:left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.4)] shadow-[0_0_20px_rgba(255,122,0,0.25)] backdrop-blur-md transition-transform duration-300 hover:scale-105 select-none"
                style={{
                  transform: `translate3d(${mousePos.x * -16}px, ${mousePos.y * -14}px, 0)`,
                  animation: 'floatGentle 5s ease-in-out infinite 0.5s',
                }}
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF7A00]/15 flex items-center justify-center text-[#FF8A00]">
                  <Code className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-display font-bold text-white leading-tight">Web Dev</div>
                  <div className="text-[9px] text-[#777777] font-mono">React &amp; TS</div>
                </div>
              </div>

              {/* Top Right: AI/ML */}
              <div
                className="absolute top-4 right-0 sm:right-2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.4)] shadow-[0_0_20px_rgba(255,122,0,0.25)] backdrop-blur-md transition-transform duration-300 hover:scale-105 select-none"
                style={{
                  transform: `translate3d(${mousePos.x * -18}px, ${mousePos.y * -10}px, 0)`,
                  animation: 'floatGentle 5.5s ease-in-out infinite 1.2s',
                }}
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF7A00]/15 flex items-center justify-center text-[#FF8A00]">
                  <Brain className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-display font-bold text-white leading-tight">AI / ML</div>
                  <div className="text-[9px] text-[#777777] font-mono">Vision &amp; LLMs</div>
                </div>
              </div>

              {/* Middle Left: Video Editing */}
              <div
                className="absolute top-1/2 -left-2 sm:-left-6 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.4)] shadow-[0_0_20px_rgba(255,122,0,0.25)] backdrop-blur-md transition-transform duration-300 hover:scale-105 select-none"
                style={{
                  transform: `translate3d(${mousePos.x * -12}px, ${mousePos.y * 10}px, 0)`,
                  animation: 'floatGentle 6.2s ease-in-out infinite 0.8s',
                }}
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF7A00]/15 flex items-center justify-center text-[#FF8A00]">
                  <Video className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-display font-bold text-white leading-tight">Video Editing</div>
                  <div className="text-[9px] text-[#777777] font-mono">Motion &amp; Cuts</div>
                </div>
              </div>

              {/* Middle Right: Content Creation */}
              <div
                className="absolute top-1/2 -right-2 sm:-right-6 -translate-y-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.4)] shadow-[0_0_20px_rgba(255,122,0,0.25)] backdrop-blur-md transition-transform duration-300 hover:scale-105 select-none"
                style={{
                  transform: `translate3d(${mousePos.x * -15}px, ${mousePos.y * 8}px, 0)`,
                  animation: 'floatGentle 5.8s ease-in-out infinite 2s',
                }}
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF7A00]/15 flex items-center justify-center text-[#FF8A00]">
                  <PenTool className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[11px] font-display font-bold text-white leading-tight">Content</div>
                  <div className="text-[9px] text-[#777777] font-mono">Tech &amp; Media</div>
                </div>
              </div>

              {/* Bottom Center: Automation */}
              <div
                className="absolute -bottom-4 z-20 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.45)] shadow-[0_0_25px_rgba(255,122,0,0.3)] backdrop-blur-md transition-transform duration-300 hover:scale-105 select-none"
                style={{
                  transform: `translate3d(${mousePos.x * -10}px, ${mousePos.y * 14}px, 0)`,
                  animation: 'floatGentle 6.5s ease-in-out infinite 1.5s',
                }}
              >
                <div className="w-7 h-7 rounded-lg bg-[#FF7A00]/20 flex items-center justify-center text-[#FF8A00]">
                  <Settings className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-[12px] font-display font-bold text-white leading-tight">Automation</div>
                  <div className="text-[9px] text-[#777777] font-mono">Python &amp; Cloud</div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
