import { Suspense, lazy } from 'react';
import FeaturesSection from './FeaturesSection';
import FooterSection from './FooterSection';
import HeroSection from './HeroSection';
import NavBar from './NavBar';
import ProgressTimeline from './ProgressTimeline';
import StatsSection from './StatsSection';

const HowItWorksSection = lazy(() => import('./HowItWorksSection'));
const DemoSection = lazy(() => import('./DemoSection'));
const UseCasesSection = lazy(() => import('./UseCasesSection'));
const AboutSection = lazy(() => import('./AboutSection'));
const FaqSection = lazy(() => import('./FaqSection'));
const CtaSection = lazy(() => import('./CtaSection'));

type Props = {
    lightMode: boolean;
    darkMode: boolean;
    scrolled: boolean;
    menuOpen: boolean;
    setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
    activeSection: string;
};

export default function LandingPageContent({ lightMode, darkMode, scrolled, menuOpen, setMenuOpen, setDarkMode, activeSection }: Props) {
    return (
        <div
            className="min-h-screen antialiased"
            style={{
                background: lightMode ? 'linear-gradient(135deg, #EDE8F4 0%, #E8EDF8 35%, #EDF0F7 65%, #F0EBF5 100%)' : '#0a0a0f',
                color: lightMode ? '#4A4A4A' : '#e5e7eb',
                scrollBehavior: 'smooth',
                transition: 'background 0.3s ease, color 0.3s ease',
            }}
        >
            <NavBar
                lightMode={lightMode}
                darkMode={darkMode}
                scrolled={scrolled}
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
                setDarkMode={setDarkMode}
                activeSection={activeSection}
            />
            <ProgressTimeline lightMode={lightMode} activeSection={activeSection} />
            <HeroSection lightMode={lightMode} />
            <StatsSection lightMode={lightMode} />
            <FeaturesSection lightMode={lightMode} />
            <Suspense fallback={<div className="h-96" />}>
                <HowItWorksSection lightMode={lightMode} />
                <DemoSection lightMode={lightMode} />
                <UseCasesSection lightMode={lightMode} />
                <AboutSection lightMode={lightMode} />
                <FaqSection lightMode={lightMode} />
                <CtaSection lightMode={lightMode} />
            </Suspense>
            <FooterSection lightMode={lightMode} />
        </div>
    );
}
