import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useSpring } from 'motion/react';
import {
  Code,
  Brain,
  Video,
  Settings,
  Sparkles,
  Layers,
  Cpu,
  Activity,
  Terminal,
  Database,
  Eye,
  Zap,
} from 'lucide-react';
import { HomeBackgroundConfig } from '../types';
import { usePortfolio } from '../context/PortfolioContext';

interface PanelData {
  id: string;
  tag: string;
  tagColor: 'orange' | 'cyan' | 'purple' | 'green';
  title: string;
  category: string;
  tech: string;
  icon: React.ElementType;
  previewType: 'code' | 'nodes' | 'chart' | 'radar' | 'timeline' | 'grid';
  stats?: string;
  imageUrl?: string;
  parallax?: boolean;
  blur?: number;
  glow?: boolean;
  opacity?: number;
}

const PANELS_ROW_1: PanelData[] = [
  {
    id: 'p1',
    tag: 'MK FORGE',
    tagColor: 'orange',
    title: 'Autonomous Workflow Mesh',
    category: 'Automation & Cloud',
    tech: 'Python • Orchestration • FastQueue',
    icon: Settings,
    previewType: 'nodes',
    stats: 'LATENCY: 12ms',
  },
  {
    id: 'p2',
    tag: 'WEB LABS',
    tagColor: 'cyan',
    title: 'Kinetic Web3 Dashboard',
    category: 'Full-Stack Architecture',
    tech: 'React 19 • TypeScript • Tailwind',
    icon: Code,
    previewType: 'code',
    stats: 'FPS: 120.0',
  },
  {
    id: 'p3',
    tag: 'NEURAL AI',
    tagColor: 'orange',
    title: 'Tensor Vision Core',
    category: 'Deep Learning / Vision',
    tech: 'PyTorch • OpenCV • TensorRT',
    icon: Brain,
    previewType: 'radar',
    stats: 'CONFIDENCE: 99.4%',
  },
  {
    id: 'p4',
    tag: 'STUDIO',
    tagColor: 'purple',
    title: 'Cinematic 4K Motion Grading',
    category: 'Post-Production & Cuts',
    tech: 'DaVinci • AfterEffects • GLSL',
    icon: Video,
    previewType: 'timeline',
    stats: 'RENDER: 4K 60fps',
  },
  {
    id: 'p5',
    tag: 'SYSTEM',
    tagColor: 'cyan',
    title: 'MK Cluster Telemetry',
    category: 'Distributed Systems',
    tech: 'Docker • Edge Nodes • Microservices',
    icon: Cpu,
    previewType: 'chart',
    stats: 'THROUGHPUT: 18.4 GB/s',
  },
  {
    id: 'p6',
    tag: 'AGENTIC',
    tagColor: 'orange',
    title: 'Autonomous Agent Dispatcher',
    category: 'Generative AI Workflows',
    tech: 'Gemini 2.5 • Multi-Agent • RAG',
    icon: Sparkles,
    previewType: 'grid',
    stats: 'AGENTS: 8 ACTIVE',
  },
];

const PANELS_ROW_2: PanelData[] = [
  {
    id: 'p7',
    tag: 'CREATIVE',
    tagColor: 'cyan',
    title: 'Holographic 3D Viewport',
    category: 'WebGL Interactive',
    tech: 'Three.js • Shader Code • GLTF',
    icon: Layers,
    previewType: 'grid',
    stats: 'DRAWCALLS: 24',
  },
  {
    id: 'p8',
    tag: 'DATABASE',
    tagColor: 'green',
    title: 'Real-Time Event Stream Broker',
    category: 'High-Concurrency Data',
    tech: 'Kafka • WebSockets • Redis',
    icon: Database,
    previewType: 'chart',
    stats: 'EVENTS: 1.4M / sec',
  },
  {
    id: 'p9',
    tag: 'MK FORGE',
    tagColor: 'orange',
    title: 'Cyber Security Perimeter',
    category: 'Zero-Trust Protocol',
    tech: 'JWT • AES-256 • Role RBAC',
    icon: Zap,
    previewType: 'code',
    stats: 'ENCRYPTION: HARDENED',
  },
  {
    id: 'p10',
    tag: 'VISION AI',
    tagColor: 'cyan',
    title: 'Multi-Object Tracking Vector',
    category: 'Computer Vision',
    tech: 'YOLOv8 • CUDA • Stream Engine',
    icon: Eye,
    previewType: 'radar',
    stats: 'TRACKS: 64 ACTIVE',
  },
  {
    id: 'p11',
    tag: 'DEV OPS',
    tagColor: 'orange',
    title: 'Automated CI/CD Pipeline',
    category: 'Continuous Deployment',
    tech: 'GitHub Actions • Cloud Run',
    icon: Terminal,
    previewType: 'nodes',
    stats: 'DEPLOY: INSTANT',
  },
  {
    id: 'p12',
    tag: 'MONITOR',
    tagColor: 'green',
    title: 'System Health HUD',
    category: 'Live Diagnostics',
    tech: 'Grafana • Prometheus • Metrics',
    icon: Activity,
    previewType: 'timeline',
    stats: 'UPTIME: 99.99%',
  },
];

const PANELS_ROW_3: PanelData[] = [
  {
    id: 'p13',
    tag: 'STUDIO',
    tagColor: 'purple',
    title: 'Dynamic VFX Particle Synth',
    category: 'Motion Design',
    tech: 'Cinema 4D • Blender • Octane',
    icon: Video,
    previewType: 'timeline',
    stats: 'PARTICLES: 250K',
  },
  {
    id: 'p14',
    tag: 'NEURAL AI',
    tagColor: 'orange',
    title: 'Cognitive LLM Knowledge Graph',
    category: 'Semantic Search Engine',
    tech: 'Vector DB • Embeddings • Python',
    icon: Brain,
    previewType: 'nodes',
    stats: 'NODES: 85,000',
  },
  {
    id: 'p15',
    tag: 'WEB LABS',
    tagColor: 'cyan',
    title: 'Micro-Frontend Component Library',
    category: 'Modern Design System',
    tech: 'Tailwind v4 • Vite 8 • CSS HUD',
    icon: Code,
    previewType: 'code',
    stats: 'TOKENS: 420',
  },
  {
    id: 'p16',
    tag: 'MK FORGE',
    tagColor: 'orange',
    title: 'Cloud Orchestrator Gateway',
    category: 'Serverless Infrastructure',
    tech: 'Node.js • Express • Async I/O',
    icon: Settings,
    previewType: 'chart',
    stats: 'REQUESTS: 2.8k/s',
  },
  {
    id: 'p17',
    tag: 'AGENTS',
    tagColor: 'cyan',
    title: 'Autonomous Code Synthesizer',
    category: 'Developer Tooling',
    tech: 'TypeScript AST • AI Copilot',
    icon: Sparkles,
    previewType: 'grid',
    stats: 'PASS RATE: 98.6%',
  },
  {
    id: 'p18',
    tag: 'SYSTEM',
    tagColor: 'green',
    title: 'Edge Runtime Cache Matrix',
    category: 'Global Content Delivery',
    tech: 'Cloudflare • Workers • KV',
    icon: Cpu,
    previewType: 'radar',
    stats: 'HIT RATIO: 99.8%',
  },
];

/**
 * Individual Panel Card Component
 */
const BackgroundPanelCard: React.FC<{
  panel: PanelData;
  smoothMouseX?: any;
  smoothMouseY?: any;
  parallaxFactor?: number;
}> = ({ panel, smoothMouseX, smoothMouseY, parallaxFactor = 1 }) => {
  const Icon = panel.icon;
  const isParallaxEnabled = panel.parallax !== false;

  const [tiltX, setTiltX] = useState(0);
  const [tiltY, setTiltY] = useState(0);

  useAnimationFrame(() => {
    if (!isParallaxEnabled || !smoothMouseX || !smoothMouseY) {
      if (tiltX !== 0 || tiltY !== 0) {
        setTiltX(0);
        setTiltY(0);
      }
      return;
    }
    const mx = smoothMouseX.get() || 0;
    const my = smoothMouseY.get() || 0;
    setTiltX(my * -8 * parallaxFactor);
    setTiltY(mx * 10 * parallaxFactor);
  });

  const tagColorStyles = {
    orange: 'bg-[#FF7A00]/15 text-[#FF7A00] border-[#FF7A00]/30',
    cyan: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/30',
    purple: 'bg-[#A855F7]/15 text-[#C084FC] border-[#A855F7]/30',
    green: 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30',
  }[panel.tagColor];

  const dotColor = {
    orange: 'bg-[#FF7A00]',
    cyan: 'bg-[#00E5FF]',
    purple: 'bg-[#C084FC]',
    green: 'bg-[#34D399]',
  }[panel.tagColor];

  const glowColorHex = {
    orange: 'rgba(255,122,0,0.5)',
    cyan: 'rgba(0,229,255,0.5)',
    purple: 'rgba(192,132,252,0.5)',
    green: 'rgba(52,211,153,0.5)',
  }[panel.tagColor];

  return (
    <div
      className="w-[280px] sm:w-[320px] h-[175px] sm:h-[190px] shrink-0 rounded-2xl bg-[#0A0C10]/85 border shadow-[0_12px_35px_rgba(0,0,0,0.7)] backdrop-blur-sm p-3.5 sm:p-4 flex flex-col justify-between select-none relative overflow-hidden group transition-[box-shadow,border-color]"
      style={{
        transform: isParallaxEnabled && (tiltX !== 0 || tiltY !== 0)
          ? `perspective(600px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateZ(8px)`
          : undefined,
        transformStyle: isParallaxEnabled ? 'preserve-3d' : undefined,
        borderColor: panel.glow ? glowColorHex : 'rgba(255,255,255,0.08)',
        boxShadow: panel.glow
          ? `0 0 24px ${glowColorHex}, 0 12px 35px rgba(0,0,0,0.7)`
          : '0 12px 35px rgba(0,0,0,0.7)',
        filter: panel.blur ? `blur(${panel.blur}px)` : undefined,
        opacity: panel.opacity !== undefined ? panel.opacity : 1,
      }}
    >
      {/* Subtle top reflective border highlight */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
      
      {/* Ambient background glow inside card */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-[#FF7A00]/5 blur-2xl pointer-events-none" />

      {/* Optional Custom Image Asset */}
      {panel.imageUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={panel.imageUrl}
            alt=""
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-40 group-hover:opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-[#0A0C10]/60 to-transparent" />
        </div>
      )}

      {/* Card Header: Browser dots & Tag */}
      <div className="flex items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/60" />
          <div className="w-2 h-2 rounded-full bg-amber-500/60" />
          <div className={`w-2 h-2 rounded-full ${dotColor} shadow-[0_0_6px_currentColor]`} />
        </div>

        <div className="flex items-center gap-2">
          {panel.stats && (
            <span className="hidden sm:inline-block text-[9px] font-mono text-[#777777]">
              {panel.stats}
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded-full border text-[9px] font-mono font-bold tracking-wider uppercase ${tagColorStyles}`}
          >
            {panel.tag}
          </span>
        </div>
      </div>

      {/* Card Middle: Futuristic UI Mockup Visual */}
      <div className="my-1.5 p-2 rounded-xl bg-black/40 border border-white/[0.05] h-[64px] sm:h-[72px] flex items-center justify-between gap-3 overflow-hidden relative z-10">
        {panel.previewType === 'code' && (
          <div className="w-full space-y-1 font-mono text-[9px]">
            <div className="flex items-center gap-1 text-[#666666]">
              <span className="text-[#FF7A00]">&gt;</span>
              <span className="text-white/80">const</span>
              <span className="text-[#00E5FF]">mesh</span>
              <span className="text-white/80">=</span>
              <span className="text-[#A855F7]">forge()</span>
            </div>
            <div className="w-4/5 h-1.5 rounded-full bg-white/[0.08]" />
            <div className="w-3/5 h-1.5 rounded-full bg-[#FF7A00]/30" />
          </div>
        )}

        {panel.previewType === 'nodes' && (
          <div className="w-full h-full flex items-center justify-around relative">
            <div className="w-6 h-6 rounded-lg bg-[#FF7A00]/20 border border-[#FF7A00]/40 flex items-center justify-center text-[8px] font-mono text-[#FF7A00]">
              IN
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#FF7A00]/50 to-[#00E5FF]/50 relative">
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00E5FF] animate-ping" />
            </div>
            <div className="w-6 h-6 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[8px] font-mono text-[#00E5FF]">
              AI
            </div>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-[#00E5FF]/50 to-[#FF7A00]/50" />
            <div className="w-6 h-6 rounded-lg bg-white/[0.08] border border-white/[0.15] flex items-center justify-center text-[8px] font-mono text-white/80">
              OUT
            </div>
          </div>
        )}

        {panel.previewType === 'chart' && (
          <div className="w-full h-full flex items-end gap-1.5 pt-2">
            {[40, 65, 30, 85, 50, 95, 70, 60, 90, 75].map((val, idx) => (
              <div
                key={idx}
                className="flex-1 rounded-t bg-gradient-to-t from-white/[0.05] via-[#FF7A00]/40 to-[#00E5FF]/70"
                style={{ height: `${val}%` }}
              />
            ))}
          </div>
        )}

        {panel.previewType === 'radar' && (
          <div className="w-full h-full flex items-center justify-center relative">
            <div className="w-12 h-12 rounded-full border border-[#00E5FF]/30 flex items-center justify-center">
              <div className="w-7 h-7 rounded-full border border-dashed border-[#FF7A00]/40 animate-spin" />
            </div>
            <div className="absolute top-1 left-3 text-[8px] font-mono text-[#777777]">XY: 48.2 // 19.8</div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A00] shadow-[0_0_8px_#FF7A00]" />
          </div>
        )}

        {panel.previewType === 'timeline' && (
          <div className="w-full h-full flex flex-col justify-center gap-1.5">
            <div className="flex items-center justify-between text-[8px] font-mono text-[#777777]">
              <span>TIMELINE 01</span>
              <span className="text-[#FF7A00]">00:01:24:18</span>
            </div>
            <div className="w-full h-3 rounded bg-white/[0.04] p-0.5 flex items-center gap-1">
              <div className="w-1/3 h-full rounded bg-[#FF7A00]/40" />
              <div className="w-1/2 h-full rounded bg-[#00E5FF]/40" />
              <div className="w-1/6 h-full rounded bg-[#A855F7]/40" />
            </div>
          </div>
        )}

        {panel.previewType === 'grid' && (
          <div className="w-full h-full grid grid-cols-4 gap-1 p-1">
            {Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className={`rounded border border-white/[0.06] ${
                  idx === 1 || idx === 6
                    ? 'bg-[#FF7A00]/30 border-[#FF7A00]/40'
                    : idx === 3
                    ? 'bg-[#00E5FF]/25 border-[#00E5FF]/40'
                    : 'bg-white/[0.02]'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Icon, Title & Technologies */}
      <div className="flex items-center gap-2.5 z-10">
        <div className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-white/80 shrink-0">
          <Icon className="w-3.5 h-3.5 text-[#FF7A00]" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-display font-bold text-white truncate leading-tight">
            {panel.title}
          </h4>
          <p className="text-[10px] text-[#888888] font-mono truncate mt-0.5">
            {panel.tech}
          </p>
        </div>
      </div>
    </div>
  );
};

interface MovingRowProps {
  panels: PanelData[];
  baseSpeed: number; // in pixels per second (positive = right, negative = left)
  layerZ: number; // 3D depth in px
  scale: number;
  opacity: number;
  blurPx: number;
  parallaxFactor: number;
  smoothMouseX: ReturnType<typeof useSpring>;
  smoothMouseY: ReturnType<typeof useSpring>;
}

const MovingRow: React.FC<MovingRowProps> = ({
  panels,
  baseSpeed,
  layerZ,
  scale,
  opacity,
  blurPx,
  parallaxFactor,
  smoothMouseX,
  smoothMouseY,
}) => {
  // Repeat panels 3 times to guarantee smooth, seamless continuous infinite looping
  const repeatedPanels = [...panels, ...panels, ...panels];
  
  // Ref to track accumulated translation position
  const xOffsetRef = useRef(0);
  const rowDomRef = useRef<HTMLDivElement | null>(null);

  // MotionValue for horizontal translation
  const xTranslate = useMotionValue(0);

  // Approximate cycle width for one set of panels:
  // (panels.length * (cardWidth + gap))
  // On desktop card width ~320px + gap 20px = 340px * 6 = 2040px
  const singleCycleWidth = panels.length * 340;

  useAnimationFrame((_, delta) => {
    // Convert delta from ms to seconds
    const deltaSec = delta / 1000;

    // Cursor influence calculation:
    // When cursor moves right (smoothMouseX > 0), panels move slightly right (+ speed boost)
    // When cursor moves left (smoothMouseX < 0), panels move slightly left (- speed boost)
    const mouseXVal = smoothMouseX.get();
    const cursorSpeedBoost = mouseXVal * 18 * parallaxFactor;

    // Accumulate movement
    xOffsetRef.current += (baseSpeed + cursorSpeedBoost) * deltaSec;

    // Mathematically seamless modulo wrapping across one full panel cycle
    if (xOffsetRef.current < -singleCycleWidth) {
      xOffsetRef.current += singleCycleWidth;
    } else if (xOffsetRef.current > 0) {
      xOffsetRef.current -= singleCycleWidth;
    }

    // Direct cursor positional parallax shift (influence the position)
    const cursorDirectShift = mouseXVal * 65 * parallaxFactor;
    const finalX = xOffsetRef.current + cursorDirectShift;

    xTranslate.set(finalX);
  });

  return (
    <div
      className="relative w-full overflow-visible will-change-transform"
      style={{
        transform: `translate3d(0, 0, ${layerZ}px) scale(${scale})`,
        opacity,
        filter: blurPx > 0 ? `blur(${blurPx}px)` : 'none',
      }}
    >
      <motion.div
        ref={rowDomRef}
        style={{ x: xTranslate }}
        className="flex items-center gap-5 w-max will-change-transform"
      >
        {repeatedPanels.map((panel, idx) => (
          <BackgroundPanelCard
            key={`${panel.id}-${idx}`}
            panel={panel}
            smoothMouseX={smoothMouseX}
            smoothMouseY={smoothMouseY}
            parallaxFactor={parallaxFactor}
          />
        ))}
      </motion.div>
    </div>
  );
};

export interface InteractiveHeroBackgroundProps {
  config?: HomeBackgroundConfig | null;
  customConfig?: HomeBackgroundConfig | null;
  isPreview?: boolean;
}

export const InteractiveHeroBackground: React.FC<InteractiveHeroBackgroundProps> = ({
  config: propConfig,
  customConfig,
  isPreview = false,
}) => {
  const { homeBackground: contextConfig } = usePortfolio();
  const effectiveProp = customConfig !== undefined ? customConfig : propConfig;
  const config = effectiveProp !== undefined ? effectiveProp : contextConfig;

  const [isDesktop, setIsDesktop] = useState(true);

  // Mouse position normalized between -1 and 1
  const mouseTargetX = useMotionValue(0);
  const mouseTargetY = useMotionValue(0);

  // Preview container reference for localized mouse interaction
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Spring physics
  const springConfig = { damping: 28, stiffness: 90, mass: 0.6 };
  const smoothMouseX = useSpring(mouseTargetX, springConfig);
  const smoothMouseY = useSpring(mouseTargetY, springConfig);

  // Extracted config options with intelligent defaults
  const enabled = config ? config.enabled : true;
  const autoMotion = config?.autoMotion || {
    enabled: true,
    speed: 1.0,
    direction: 'normal',
    intensity: 1.0,
    horizontal: true,
    vertical: true,
    loopSpeed: 1.0,
  };
  const cursorInteraction = config?.cursorInteraction || {
    enabled: true,
    sensitivity: 1.0,
    movementStrength: 1.0,
    horizontalInfluence: 1.0,
    verticalInfluence: 1.0,
  };
  const motion3D = config?.motion3D || {
    enabled: true,
    perspective: 1300,
    depth: 1.0,
    tiltIntensity: 1.0,
    parallaxStrength: 1.0,
    layerSeparation: 1.0,
  };
  const visual = config?.visual || {
    opacity: 0.40,
    brightness: 1.0,
    blur: 0,
    glowIntensity: 1.0,
    overlayDarkness: 0.70,
    particleIntensity: 1.0,
    lightIntensity: 1.0,
  };
  const colors = config?.colors || {
    primaryGlow: '#FF7A00',
    secondaryGlow: '#00E5FF',
    accentColor: '#FF7A00',
  };

  // Detect device capabilities
  useEffect(() => {
    const checkDevice = () => {
      const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const isWide = window.innerWidth >= 768;
      setIsDesktop(hasFinePointer && isWide);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Cursor listener
  useEffect(() => {
    if (!cursorInteraction.enabled) return;

    if (isPreview && previewContainerRef.current) {
      const target = previewContainerRef.current;
      const handlePreviewMouseMove = (e: MouseEvent) => {
        const rect = target.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        mouseTargetX.set(normX * cursorInteraction.sensitivity);
        mouseTargetY.set(normY * cursorInteraction.sensitivity);
      };
      const handlePreviewMouseLeave = () => {
        mouseTargetX.set(0);
        mouseTargetY.set(0);
      };

      target.addEventListener('mousemove', handlePreviewMouseMove);
      target.addEventListener('mouseleave', handlePreviewMouseLeave);
      return () => {
        target.removeEventListener('mousemove', handlePreviewMouseMove);
        target.removeEventListener('mouseleave', handlePreviewMouseLeave);
      };
    }

    if (!isDesktop) return;

    let timeoutId: NodeJS.Timeout | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const normX = (e.clientX / innerWidth - 0.5) * 2;
      const normY = (e.clientY / innerHeight - 0.5) * 2;

      mouseTargetX.set(normX * cursorInteraction.sensitivity);
      mouseTargetY.set(normY * cursorInteraction.sensitivity);

      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        mouseTargetX.set(0);
        mouseTargetY.set(0);
      }, 1600);
    };

    const handleMouseLeave = () => {
      mouseTargetX.set(0);
      mouseTargetY.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isDesktop, isPreview, cursorInteraction.enabled, cursorInteraction.sensitivity, mouseTargetX, mouseTargetY]);

  // Overall 3D container tilt transforms derived from smooth mouse coordinates
  const containerTiltRef = useRef<HTMLDivElement | null>(null);

  useAnimationFrame(() => {
    if (!containerTiltRef.current) return;

    if (!motion3D.enabled) {
      containerTiltRef.current.style.transform = 'none';
      return;
    }

    const mx = smoothMouseX.get() * cursorInteraction.movementStrength;
    const my = smoothMouseY.get() * cursorInteraction.movementStrength;

    const tilt = motion3D.tiltIntensity;
    const rotX = (6 - my * 5 * cursorInteraction.verticalInfluence) * tilt;
    const rotY = (-8 + mx * 6 * cursorInteraction.horizontalInfluence) * tilt;
    const rotZ = (-2.5 + mx * 1.5) * tilt;
    const transY = my * 22 * motion3D.parallaxStrength;

    containerTiltRef.current.style.transform = `perspective(${motion3D.perspective}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) translateY(${transY}px)`;
  });

  if (!enabled) {
    return null;
  }

  const speedMult = autoMotion.enabled
    ? autoMotion.speed * (autoMotion.direction === 'reverse' ? -1 : 1)
    : 0;

  const layerSep = motion3D.layerSeparation;
  const baseOpacity = visual.opacity;

  const iconLookup: Record<string, React.ElementType> = {
    Code,
    Brain,
    Video,
    Settings,
    Sparkles,
    Layers,
    Cpu,
    Activity,
    Terminal,
    Database,
    Eye,
    Zap,
  };

  const dynamicRow1 = React.useMemo(() => {
    if (!config?.panels || config.panels.length === 0) return PANELS_ROW_1;
    const r1 = config.panels
      .filter((p) => (p.row === 1 || (!p.row && p.order && p.order % 3 === 1)) && p.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((p) => ({
        id: p.id,
        tag: p.tag || 'MK FORGE',
        tagColor: p.tagColor || 'orange',
        title: p.title || 'Visual Panel',
        category: p.category || 'Visual Asset',
        tech: p.tech || 'Digital Art • Vector',
        icon: iconLookup[p.iconName] || Layers,
        previewType: p.previewType || 'grid',
        stats: p.stats,
        imageUrl: p.imageUrl,
        parallax: p.parallax !== false,
        blur: p.blur || 0,
        glow: p.glow || false,
        opacity: p.opacity !== undefined ? p.opacity : 1,
      }));
    return r1.length > 0 ? r1 : PANELS_ROW_1;
  }, [config?.panels]);

  const dynamicRow2 = React.useMemo(() => {
    if (!config?.panels || config.panels.length === 0) return PANELS_ROW_2;
    const r2 = config.panels
      .filter((p) => (p.row === 2 || (!p.row && p.order && p.order % 3 === 2)) && p.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((p) => ({
        id: p.id,
        tag: p.tag || 'WEB LABS',
        tagColor: p.tagColor || 'cyan',
        title: p.title || 'Visual Panel',
        category: p.category || 'Visual Asset',
        tech: p.tech || 'Kinetic • 3D',
        icon: iconLookup[p.iconName] || Layers,
        previewType: p.previewType || 'grid',
        stats: p.stats,
        imageUrl: p.imageUrl,
        parallax: p.parallax !== false,
        blur: p.blur || 0,
        glow: p.glow || false,
        opacity: p.opacity !== undefined ? p.opacity : 1,
      }));
    return r2.length > 0 ? r2 : PANELS_ROW_2;
  }, [config?.panels]);

  const dynamicRow3 = React.useMemo(() => {
    if (!config?.panels || config.panels.length === 0) return PANELS_ROW_3;
    const r3 = config.panels
      .filter((p) => (p.row === 3 || (!p.row && p.order && p.order % 3 === 0)) && p.enabled !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((p) => ({
        id: p.id,
        tag: p.tag || 'SYSTEM',
        tagColor: p.tagColor || 'purple',
        title: p.title || 'Visual Panel',
        category: p.category || 'Visual Asset',
        tech: p.tech || 'Cyber Core',
        icon: iconLookup[p.iconName] || Layers,
        previewType: p.previewType || 'grid',
        stats: p.stats,
        imageUrl: p.imageUrl,
        parallax: p.parallax !== false,
        blur: p.blur || 0,
        glow: p.glow || false,
        opacity: p.opacity !== undefined ? p.opacity : 1,
      }));
    return r3.length > 0 ? r3 : PANELS_ROW_3;
  }, [config?.panels]);

  // Active Multi-layer Backdrop Layers
  const activeBackdropLayers = React.useMemo(() => {
    if (!config?.backdropLayers || config.backdropLayers.length === 0) return [];
    return config.backdropLayers
      .filter((l) => l.enabled !== false && !!l.imageUrl)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [config?.backdropLayers]);

  return (
    <div
      ref={previewContainerRef}
      id="hero-interactive-3d-background"
      className={`absolute inset-0 overflow-hidden select-none flex items-center justify-center ${
        isPreview ? 'relative w-full h-full min-h-[360px] pointer-events-auto cursor-crosshair z-0' : 'pointer-events-none z-0'
      }`}
      aria-hidden="true"
    >
      {/* Multi-Layer Animated Backdrop Layers Stack */}
      {activeBackdropLayers.length > 0 ? (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {activeBackdropLayers.map((layer, idx) => {
            const layerOpacity = (layer.opacity !== undefined ? layer.opacity : 1) * visual.opacity;
            const animType = layer.animation || 'drift';
            const speedScale = Math.max(0.1, (autoMotion.speed || 1) * (layer.parallaxSpeed || 1));

            const animProps =
              !autoMotion.enabled || animType === 'none'
                ? { scale: layer.scale || 1.02, x: 0, y: 0 }
                : animType === 'float'
                ? {
                    y: [-12, 12, -12],
                    scale: [layer.scale || 1.02, (layer.scale || 1.02) * 1.03, layer.scale || 1.02],
                  }
                : animType === 'zoom'
                ? {
                    scale: [layer.scale || 1.0, (layer.scale || 1.0) * 1.08, layer.scale || 1.0],
                  }
                : animType === 'pulse'
                ? {
                    opacity: [layerOpacity * 0.75, layerOpacity, layerOpacity * 0.75],
                  }
                : {
                    // drift
                    scale: [1.02, 1.06, 1.02],
                    x: autoMotion.direction === 'reverse' ? [-14, 14, -14] : [14, -14, 14],
                    y: [-6, 6, -6],
                  };

            return (
              <motion.div
                key={layer.id || `layer-${idx}`}
                className="absolute inset-0 pointer-events-none overflow-hidden"
                style={{
                  zIndex: idx,
                  mixBlendMode: layer.blendMode || 'normal',
                }}
              >
                <motion.img
                  src={layer.imageUrl}
                  alt={layer.name || `Background Layer ${idx + 1}`}
                  className="w-full h-full object-cover will-change-transform scale-105"
                  style={{
                    opacity: layerOpacity,
                    filter: `brightness(${visual.brightness}) blur(${
                      layer.blur !== undefined ? layer.blur : visual.blur
                    }px)`,
                  }}
                  animate={animProps}
                  transition={{
                    duration: (20 + idx * 4) / speedScale,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            );
          })}
          <div
            className="absolute inset-0 bg-[#050505] pointer-events-none"
            style={{ opacity: visual.overlayDarkness, zIndex: activeBackdropLayers.length }}
          />
        </div>
      ) : (
        /* Fallback: Single Full-bleed Animated Background Image Backdrop */
        config?.backgroundImage && (
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <motion.img
              src={config.backgroundImage}
              alt="Hero Animated Background"
              className="w-full h-full object-cover will-change-transform scale-105"
              style={{
                opacity: visual.opacity,
                filter: `brightness(${visual.brightness}) blur(${visual.blur}px)`,
              }}
              animate={
                autoMotion.enabled
                  ? {
                      scale: [1.02, 1.07, 1.02],
                      x: autoMotion.direction === 'reverse' ? [-10, 10, -10] : [10, -10, 10],
                      y: [-6, 6, -6],
                    }
                  : { scale: 1.02, x: 0, y: 0 }
              }
              transition={{
                duration: 20 / Math.max(0.1, autoMotion.speed),
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <div
              className="absolute inset-0 bg-[#050505]"
              style={{ opacity: visual.overlayDarkness }}
            />
          </div>
        )
      )}

      {/* Subtle Radial Gradient Vignette Mask */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 70% 65% at 50% 50%, rgba(5,5,5,${visual.overlayDarkness * 0.6}) 0%, rgba(5,5,5,${visual.overlayDarkness}) 65%, #050505 100%)`,
        }}
      />

      {/* Dynamic Ambient Glow Behind Panels */}
      <div
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundColor: colors.primaryGlow,
          opacity: 0.25 * (visual.glowIntensity ?? 1),
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl pointer-events-none"
        style={{
          backgroundColor: colors.secondaryGlow,
          opacity: 0.2 * (visual.glowIntensity ?? 1),
        }}
      />

      {/* Top and Bottom soft edge blend */}
      {!isPreview && (
        <>
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
        </>
      )}

      {/* 3D Perspective Stage */}
      <div
        ref={containerTiltRef}
        className="w-[140%] sm:w-[130%] lg:w-[125%] -translate-x-[15%] sm:-translate-x-[12%] flex flex-col gap-6 sm:gap-8 will-change-transform"
        style={{
          transformStyle: 'preserve-3d',
          transform: `perspective(${motion3D.perspective}px) rotateX(6deg) rotateY(-8deg) rotateZ(-2.5deg)`,
          filter: `brightness(${visual.brightness}) blur(${visual.blur}px)`,
        }}
      >
        {/* Layer 1 / Row 1 */}
        <MovingRow
          panels={dynamicRow1}
          baseSpeed={-24 * speedMult}
          layerZ={-160 * layerSep}
          scale={0.88}
          opacity={baseOpacity * 0.75}
          blurPx={1.2 + visual.blur}
          parallaxFactor={0.5 * motion3D.parallaxStrength}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
        />

        {/* Layer 2 / Row 2 */}
        <MovingRow
          panels={dynamicRow2}
          baseSpeed={18 * speedMult}
          layerZ={-50 * layerSep}
          scale={0.96}
          opacity={baseOpacity * 0.95}
          blurPx={visual.blur}
          parallaxFactor={0.85 * motion3D.parallaxStrength}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
        />

        {/* Layer 3 / Row 3 */}
        <MovingRow
          panels={dynamicRow3}
          baseSpeed={-30 * speedMult}
          layerZ={30 * layerSep}
          scale={1.04}
          opacity={baseOpacity * 1.05}
          blurPx={visual.blur}
          parallaxFactor={1.25 * motion3D.parallaxStrength}
          smoothMouseX={smoothMouseX}
          smoothMouseY={smoothMouseY}
        />
      </div>
    </div>
  );
};
