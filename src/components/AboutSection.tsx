import React from 'react';
import { Sparkles, CheckCircle2, MessageCircle, FileText, ArrowRight, Code, Brain, Video, Cpu } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { MediaFallback } from './MediaFallback';

interface AboutSectionProps {
  onContactClick: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onContactClick }) => {
  const { profile, aboutConfig } = usePortfolio();

  const aboutPhotoSrc = profile?.media?.aboutPhoto || aboutConfig?.profileImage || '/assets/about-manikantha.svg';
  const headline = aboutConfig?.heading || "Engineering Code & Visual Craft";
  const bioParagraphs: string[] = (aboutConfig?.longDescription && aboutConfig.longDescription.length > 0)
    ? aboutConfig.longDescription
    : (profile?.aboutBio || [
        "I am an enthusiastic AI/ML learner & developer, creative web designer, and digital content creator driven by the pursuit of futuristic technology and aesthetic precision.",
        "My work bridges intelligent algorithms, high-performance web systems, and cinematic video storytelling to turn bold ideas into impactful reality.",
        "Whether developing scalable web platforms, training predictive neural models, or automating repetitive business workflows, I focus on delivering seamless, human-centered experiences."
      ]);
  const whatsappUrl = profile?.socials?.whatsappUrl || 'https://wa.me/919999999999';

  return (
    <section id="about" className="relative z-10 py-20 lg:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] mb-4 shadow-[0_0_15px_-4px_rgba(255,122,0,0.3)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF8A00] font-semibold">
              ABOUT MANIKANTHA
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Engineering Code &amp; <span className="text-[#FF7A00]">Visual Craft</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-transparent via-[#FF7A00] to-transparent mt-4" />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* =========================================
              LEFT: PERSONAL PHOTO IN SLEEK CYBER FRAME
             ========================================= */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[380px] sm:max-w-[420px] aspect-[4/5] group">
              
              {/* Glowing Corner Accents */}
              <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-[#FF7A00] z-20" />
              <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-[#FF7A00] z-20" />

              {/* Ambient Back Glow */}
              <div className="absolute inset-0 bg-[#FF7A00]/20 rounded-3xl blur-2xl group-hover:bg-[#FF7A00]/30 transition-all -z-10" />

              {/* Main Photo Frame */}
              <div className="w-full h-full rounded-2xl overflow-hidden bg-[#0D0D0D] border border-[rgba(255,122,0,0.35)] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.9)] p-2">
                <div className="w-full h-full rounded-xl overflow-hidden bg-[#050505] relative">
                  <MediaFallback
                    src={aboutPhotoSrc}
                    fallbackSrc="/assets/about-manikantha.svg"
                    alt="Manikantha Portrait"
                    className="w-full h-full object-cover object-center filter grayscale-[20%] contrast-105 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700"
                    fallbackText="Manikantha Photo"
                  />
                  {/* Subtle bottom vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                </div>
              </div>

              {/* Floating Badge 1: Tech Architect */}
              <div className="absolute -bottom-4 -left-4 z-20 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0D0D0D]/95 border border-[rgba(255,122,0,0.45)] shadow-[0_10px_25px_rgba(255,122,0,0.25)] backdrop-blur-md select-none">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF7A00] animate-pulse" />
                <span className="font-display text-xs font-bold text-white tracking-wide">
                  Tech Architect &amp; Creator
                </span>
              </div>

              {/* Floating Badge 2: Always Learning */}
              <div className="absolute -top-3 -right-3 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0D0D0D]/95 border border-[rgba(255,122,0,0.3)] shadow-[0_8px_20px_rgba(0,0,0,0.6)] backdrop-blur-md select-none">
                <Brain className="w-4 h-4 text-[#FF7A00]" />
                <span className="font-mono text-[11px] text-[#B8B8B8]">
                  Always Learning ∞
                </span>
              </div>

            </div>
          </div>

          {/* =========================================
              RIGHT: BIO & CAPABILITIES
             ========================================= */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-snug">
              Bridging <span className="text-[#FF7A00]">Artificial Intelligence</span>, Modern Web Systems &amp; Cinematic Media
            </h3>

            <div className="mt-6 space-y-4 text-[#B8B8B8] text-base sm:text-lg leading-relaxed font-light">
              {bioParagraphs.map((paragraph: string, idx: number) => (
                <p key={idx}>
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Core Capability Pillars */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full">
              {[
                { title: 'AI / ML Developer', desc: 'Predictive models, OpenCV, neural vision pipelines', icon: Brain },
                { title: 'Full-Stack Web', desc: 'React, TypeScript, Tailwind, fluid interfaces', icon: Code },
                { title: 'Video & Motion', desc: 'Premiere Pro, DaVinci, kinetic typography', icon: Video },
                { title: 'Automation Pipelines', desc: 'Python scripts, scheduled bots, webhook bridges', icon: Cpu },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-[rgba(255,122,0,0.15)] hover:border-[rgba(255,122,0,0.35)] transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-[#FF7A00]/15 text-[#FF8A00] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-white">{item.title}</h4>
                      <p className="text-xs text-[#777777] mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Row */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                id="about-contact-btn"
                onClick={onContactClick}
                className="orange-glow-btn flex items-center gap-2 px-6 py-3.5 rounded-full text-black font-extrabold text-sm uppercase tracking-wider cursor-pointer"
              >
                <span>Let's Connect</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>

              <a
                id="about-whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.35)] hover:border-[#25D366] text-white hover:text-[#25D366] text-sm font-semibold transition-all shadow-md"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
