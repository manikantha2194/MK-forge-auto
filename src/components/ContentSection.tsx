import React from 'react';
import { Youtube, Instagram, Linkedin, Github, ExternalLink, Play, Sparkles, BookOpen } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { ContentItem, PlatformType } from '../types';
import { MediaFallback } from './MediaFallback';

const getPlatformIcon = (platform: PlatformType) => {
  switch (platform) {
    case 'YouTube':
      return <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />;
    case 'Instagram':
      return <Instagram className="w-3.5 h-3.5 text-[#E1306C]" />;
    case 'LinkedIn':
      return <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />;
    case 'GitHub':
      return <Github className="w-3.5 h-3.5 text-white" />;
    default:
      return <ExternalLink className="w-3.5 h-3.5 text-[#FF7A00]" />;
  }
};

export const ContentSection: React.FC = () => {
  const { content, isLoading } = usePortfolio();

  return (
    <section id="content" className="relative z-10 py-20 lg:py-28 bg-[#070707]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0D0D0D] border border-[rgba(255,122,0,0.3)] mb-4 shadow-[0_0_15px_-4px_rgba(255,122,0,0.3)]">
            <BookOpen className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#FF8A00] font-semibold">
              MEDIA &amp; TUTORIALS
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Created <span className="text-[#FF7A00]">Content</span>
          </h2>
          <p className="mt-3 text-[#B8B8B8] max-w-xl text-base sm:text-lg font-light">
            Video tutorials, technical deep dives, motion edits, and open-source workflows.
          </p>
        </div>

        {/* Content Items Grid */}
        {isLoading && content.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-[#0D0D0D] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {content.map((item: ContentItem) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                id={`content-card-${item.id}`}
                className="group relative rounded-2xl bg-[#0D0D0D]/90 border border-[rgba(255,122,0,0.2)] hover:border-[#FF7A00] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_-5px_rgba(255,122,0,0.25)]"
              >
                <div>
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] w-full bg-[#050505] overflow-hidden border-b border-white/[0.06]">
                    <MediaFallback
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      fallbackText={item.title}
                    />

                    {/* Platform Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#050505]/90 border border-white/[0.1] text-xs font-semibold text-white backdrop-blur-md">
                      {getPlatformIcon(item.platform)}
                      <span>{item.platform}</span>
                    </div>

                    {/* Play / View Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-[#FF7A00] text-black flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-black translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#777777] mb-2">
                      <span className="uppercase text-[#FF8A00] font-bold">{item.category}</span>
                      <span>{item.date}</span>
                    </div>

                    <h3 className="font-display text-base font-bold text-white group-hover:text-[#FF8A00] transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    {item.caption && (
                      <p className="mt-2 text-xs text-[#B8B8B8] line-clamp-2 leading-relaxed font-light">
                        {item.caption}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2 text-xs font-bold text-[#FF8A00] group-hover:text-white transition-colors">
                  <span>View Content</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
