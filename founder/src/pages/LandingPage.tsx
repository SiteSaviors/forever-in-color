import HeroSection from '@/sections/HeroSection';
import StyleShowcase from '@/sections/StyleShowcase';
import LivingCanvasStory from '@/sections/LivingCanvasStory';
import StepsJourney from '@/sections/StepsJourney';
import FooterCTA from '@/sections/FooterCTA';

const LandingPage = () => {
  return (
    <div className="bg-slate-950 text-white">
      <HeroSection />
      <StyleShowcase />
      <LivingCanvasStory />
      <StepsJourney />
      <FooterCTA />
    </div>
  );
};

export default LandingPage;
