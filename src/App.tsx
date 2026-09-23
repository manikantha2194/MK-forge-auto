import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { StatsStrip } from './components/StatsStrip';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { WorkSection } from './components/WorkSection';
import { ContentSection } from './components/ContentSection';
import { SkillsSection } from './components/SkillsSection';
import { ExperienceSection } from './components/ExperienceSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { LoginModal } from './components/LoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ScrollProgressBar } from './components/ScrollProgressBar';

function PortfolioMain() {
  const { isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  // Intersection Observer for active navigation links
  useEffect(() => {
    const sections = ['home', 'about', 'services', 'work', 'content', 'skills', 'experience', 'contact'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 250;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#050505] text-white selection:bg-[#FF7A00] selection:text-black">
      {/* Subtle Top Scroll Progress Bar */}
      <ScrollProgressBar activeSection={activeSection} />

      {/* Dynamic Animated Cyber Background */}
      <AnimatedBackground />

      {/* Sticky Glass Navbar */}
      <Navbar
        activeSection={activeSection}
        onOpenLogin={() => setLoginModalOpen(true)}
        onOpenAdmin={() => setAdminDashboardOpen(true)}
      />

      {/* Page Main Content */}
      <main className="relative z-10">
        <HeroSection
          onViewWork={() => scrollToSection('work')}
          onHireMe={() => scrollToSection('contact')}
        />
        <StatsStrip />
        <AboutSection onContactClick={() => scrollToSection('contact')} />
        <ServicesSection onSelectService={() => scrollToSection('contact')} />
        <WorkSection />
        <ContentSection />
        <SkillsSection />
        <ExperienceSection />
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => {
          setLoginModalOpen(false);
          setAdminDashboardOpen(true);
        }}
      />

      {/* Admin Dashboard */}
      {adminDashboardOpen && (
        <AdminDashboard onClose={() => setAdminDashboardOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PortfolioProvider>
        <PortfolioMain />
      </PortfolioProvider>
    </AuthProvider>
  );
}
