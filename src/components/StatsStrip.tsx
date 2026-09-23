import React from 'react';
import { FolderGit2, Target, Infinity as InfinityIcon, Users, Trophy, Sparkles } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

const getIcon = (name: string) => {
  switch (name) {
    case 'FolderGit2':
      return <FolderGit2 className="w-5 h-5" />;
    case 'Target':
      return <Target className="w-5 h-5" />;
    case 'Infinity':
      return <InfinityIcon className="w-5 h-5" />;
    case 'Users':
      return <Users className="w-5 h-5" />;
    case 'Trophy':
      return <Trophy className="w-5 h-5" />;
    default:
      return <Sparkles className="w-5 h-5" />;
  }
};

export const StatsStrip: React.FC = () => {
  const { stats } = usePortfolio();

  const displayStats = stats && stats.length > 0 ? stats : [
    { id: '1', value: '50+', label: 'Projects', highlight: 'Delivered Worldwide', iconName: 'FolderGit2' },
    { id: '2', value: '100%', label: 'Dedication', highlight: 'Precision Execution', iconName: 'Target' },
    { id: '3', value: '∞', label: 'Learning', highlight: 'Always Evolving', iconName: 'Infinity' },
    { id: '4', value: 'Happy', label: 'Clients', highlight: 'Global Collaboration', iconName: 'Users' },
    { id: '5', value: 'Freelancer', label: 'Always Building', highlight: 'Open to New Ideas', iconName: 'Trophy' },
  ];

  return (
    <section className="relative z-20 -mt-6 sm:-mt-8 mb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {displayStats.map((stat, idx) => (
          <div
            key={stat.id || idx}
            className="group relative p-4 sm:p-5 rounded-2xl bg-[#0D0D0D]/85 border border-[rgba(255,122,0,0.18)] hover:border-[rgba(255,122,0,0.55)] transition-all duration-300 hover:-translate-y-1 backdrop-blur-md shadow-[0_8px_20px_-8px_rgba(0,0,0,0.8)] hover:shadow-[0_12px_30px_-5px_rgba(255,122,0,0.25)] flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient inner card glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF7A00]/10 rounded-full blur-2xl group-hover:bg-[#FF7A00]/20 transition-all pointer-events-none" />

            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FF7A00]/15 border border-[#FF7A00]/30 flex items-center justify-center text-[#FF8A00] group-hover:scale-110 transition-transform">
                {getIcon(stat.iconName)}
              </div>
              <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider">
                0{idx + 1}
              </span>
            </div>

            <div>
              <div className="font-display text-2xl sm:text-3xl lg:text-3xl font-extrabold text-white tracking-tight leading-none group-hover:text-[#FF8A00] transition-colors">
                {stat.value}
              </div>
              <div className="mt-1.5 text-xs sm:text-sm font-semibold text-[#B8B8B8] leading-tight">
                {stat.label}
              </div>
              {stat.highlight && (
                <div className="mt-1 text-[11px] text-[#777777] font-normal truncate">
                  {stat.highlight}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
