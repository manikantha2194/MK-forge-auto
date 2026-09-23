import React, { useState, useEffect } from 'react';

interface ScrollProgressBarProps {
  activeSection?: string;
}

const SECTION_LABELS: Record<string, string> = {
  home: 'Home',
  about: 'About',
  services: 'Services',
  work: 'Featured Work',
  content: 'Content & Media',
  skills: 'Technical Skills',
  experience: 'Career Timeline',
  contact: 'Get In Touch',
};

export const ScrollProgressBar: React.FC<ScrollProgressBarProps> = ({ activeSection }) => {
  const [progress, setProgress] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let ticking = false;
    let scrollTimeout: NodeJS.Timeout | null = null;

    const updateProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

      if (scrollHeight > 0) {
        const currentProgress = (scrollTop / scrollHeight) * 100;
        setProgress(Math.min(100, Math.max(0, currentProgress)));
      } else {
        setProgress(0);
      }
      ticking = false;
    };

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 1400);

      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    };

    updateProgress();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const sectionName = activeSection ? (SECTION_LABELS[activeSection] || activeSection) : '';
  const roundedPercent = Math.round(progress);
  const showBadge = (isScrolling || isHovered) && roundedPercent > 1;

  return (
    <div
      id="scroll-progress-container"
      className="fixed top-0 left-0 right-0 z-[60] group cursor-default"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="progressbar"
      aria-valuenow={roundedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Page scroll position indicator"
    >
      {/* Background Track (Subtle Hairline) */}
      <div className="w-full h-[2.5px] sm:h-[3px] bg-white/[0.04] backdrop-blur-xs relative overflow-hidden">
        {/* Dynamic Progress Fill */}
        <div
          id="scroll-progress-bar"
          className="h-full bg-gradient-to-r from-[#FF5500] via-[#FF7A00] to-[#FFA336] will-change-transform relative transition-transform duration-75 ease-out"
          style={{
            transform: `scaleX(${progress / 100})`,
            transformOrigin: 'left',
          }}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF7A00]/50 to-[#FFA336] shadow-[0_0_10px_rgba(255,122,0,0.8),0_0_3px_rgba(255,122,0,0.9)]" />

          {/* Luminous Leading Edge Point */}
          {roundedPercent > 0 && (
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/2 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-[#FFFFFF] shadow-[0_0_10px_#FFA336,0_0_4px_#FF7A00]" />
          )}
        </div>
      </div>

      {/* Subtle Floating Location Context Badge */}
      <div
        className={`pointer-events-none absolute top-2 right-4 sm:right-8 transition-all duration-300 transform ${
          showBadge
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2'
        }`}
      >
        <div className="px-2.5 py-1 rounded-full bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.3)] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-2 text-[10px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] animate-pulse" />
          {sectionName && (
            <span className="text-[#E0E0E0] font-semibold tracking-wide uppercase">
              {sectionName}
            </span>
          )}
          <span className="text-[#FF7A00] font-bold">
            {roundedPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
