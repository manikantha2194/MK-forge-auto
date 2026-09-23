import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  pulseSpeed: number;
}

export const AnimatedBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Create particles
    const particleCount = Math.min(Math.floor((width * height) / 28000), 55);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.4 + 0.15,
        alpha: Math.random() * 0.4 + 0.15,
        pulseSpeed: Math.random() * 0.015 + 0.005,
      });
    }

    let time = 0;

    const render = () => {
      time += 1;
      ctx.clearRect(0, 0, width, height);

      // Draw faint connections between close particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255, 122, 0, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges smoothly
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Gentle breathing alpha
        const currentAlpha = p.baseAlpha + Math.sin(time * p.pulseSpeed) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 138, 0, ${Math.max(0.05, currentAlpha)})`;
        ctx.shadowBlur = p.radius * 3.5;
        ctx.shadowColor = 'rgba(255, 122, 0, 0.7)';
        ctx.fill();
        ctx.shadowBlur = 0; // reset
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#050505]">
      {/* Subtle perspective cyber-grid */}
      <div
        className="absolute inset-0 opacity-40 cyber-grid"
        style={{
          maskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, black 20%, transparent 80%)',
        }}
      />

      {/* Primary Slow-Moving Orange Ambient Glow Blob (Top Right) */}
      <div
        className="absolute -top-[15%] -right-[10%] w-[650px] h-[650px] md:w-[850px] md:h-[850px] rounded-full blur-[140px] opacity-25 animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(255,122,0,0.45) 0%, rgba(255,85,0,0.15) 50%, transparent 70%)',
          animationDuration: '14s',
        }}
      />

      {/* Secondary Soft Orange Glow Blob (Center-Left) */}
      <div
        className="absolute top-[35%] -left-[15%] w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full blur-[160px] opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(255,138,0,0.35) 0%, rgba(255,90,0,0.08) 55%, transparent 70%)',
          animation: 'floatGentle 18s ease-in-out infinite alternate',
        }}
      />

      {/* Lower Ambient Highlight (Bottom Center/Right) */}
      <div
        className="absolute -bottom-[20%] left-[25%] w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full blur-[170px] opacity-15"
        style={{
          background: 'radial-gradient(circle, rgba(255,110,0,0.3) 0%, rgba(255,60,0,0.05) 60%, transparent 75%)',
          animation: 'pulseGlow 12s ease-in-out infinite',
        }}
      />

      {/* Interactive Floating Particle and Constellation Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />
    </div>
  );
};
