import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Section from '@/components/layout/Section';
import { useFounderStore } from '@/store/useFounderStore';
import { trackLaunchflowOpened } from '@/utils/launchflowTelemetry';
import GeneratingCanvasAnimation from '@/components/hero/GeneratingCanvasAnimation';
import StylePills from '@/components/hero/StylePills';
import CTADeck from '@/components/hero/CTADeck';
import TrustStrip from '@/components/hero/TrustStrip';
import MomentumTicker from '@/components/hero/MomentumTicker';
import AnimatedTransformBadge from '@/components/hero/AnimatedTransformBadge';

// Style pills data
const STYLE_PILLS = [
  {
    id: 'watercolor-dreams',
    name: 'Watercolor',
    tagline: 'Soft washes & light',
    thumbnail: '/art-style-hero-generations/family-watercolor.jpg',
    previewImage: '/art-style-hero-generations/family-watercolor.jpg',
  },
  {
    id: 'classic-oil-painting',
    name: 'Classic Oil',
    tagline: 'Traditional brushstrokes',
    thumbnail: '/art-style-hero-generations/family-classic-oil.jpg',
    previewImage: '/art-style-hero-generations/family-classic-oil.jpg',
  },
  {
    id: 'neon-splash',
    name: 'Neon Splash',
    tagline: 'Electric drip energy',
    thumbnail: '/art-style-hero-generations/family-neon-splash.jpg',
    previewImage: '/art-style-hero-generations/family-neon-splash.jpg',
  },
  {
    id: 'pop-art-burst',
    name: 'Pop Art Burst',
    tagline: 'Bold comic vibes',
    thumbnail: '/art-style-hero-generations/family-pop-art.jpg',
    previewImage: '/art-style-hero-generations/family-pop-art.jpg',
  },
  {
    id: '3d-storybook',
    name: '3D Storybook',
    tagline: 'Playful depth & charm',
    thumbnail: '/art-style-hero-generations/family-storybook.jpg',
    previewImage: '/art-style-hero-generations/family-storybook.jpg',
  },
  {
    id: 'artisan-charcoal',
    name: 'Artisan Charcoal',
    tagline: 'Raw sketch texture',
    thumbnail: '/art-style-hero-generations/family-charcoal.jpg',
    previewImage: '/art-style-hero-generations/family-charcoal.jpg',
  },
];

const ProductHeroSection = () => {
  const setLaunchpadExpanded = useFounderStore((state) => state.setLaunchpadExpanded);
  const launchpadExpanded = useFounderStore((state) => state.launchpadExpanded);
  const [currentStyleImage, setCurrentStyleImage] = useState(STYLE_PILLS[0].previewImage);
  const [currentStyleName, setCurrentStyleName] = useState(STYLE_PILLS[0].name);
  const [currentStyleTagline, setCurrentStyleTagline] = useState(STYLE_PILLS[0].tagline);

  const handleHeroUploadClick = () => {
    if (!launchpadExpanded) {
      trackLaunchflowOpened('hero');
    }
    setLaunchpadExpanded(true);

    const launchflowSection = document.getElementById('launchflow');
    if (launchflowSection) {
      launchflowSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleStyleChange = (styleId: string, previewImage: string) => {
    const selectedStyle = STYLE_PILLS.find(pill => pill.id === styleId);
    if (selectedStyle) {
      setCurrentStyleImage(previewImage);
      setCurrentStyleName(selectedStyle.name);
      setCurrentStyleTagline(selectedStyle.tagline);
    }
  };

  return (
    <section
      className="relative overflow-hidden bg-gradient-hero"
      data-founder-hero
      id="founder-hero"
    >
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/nice-snow.png')]" />

      <Section className="relative pt-32 pb-20">
        <div className="mx-auto max-w-6xl space-y-6">

          {/* Animated Transform Badge + Headline */}
          <div className="text-center text-white max-w-4xl mx-auto px-4">
            <div className="flex justify-center mb-6 md:mb-8">
              <AnimatedTransformBadge />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-[1.15] drop-shadow-2xl">
                Transform Your Memories Into{' '}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  Museum-Quality Art
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed">
                AI-powered canvas art. Multiple styles. In 60 seconds.
              </p>
            </div>
          </div>

          {/* CTA Deck */}
          <CTADeck
            onUploadClick={handleHeroUploadClick}
            showDemo={false}
          />

          {/* Hero Canvas Panel with Generation Animation */}
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStyleImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <GeneratingCanvasAnimation
                  defaultStyleImage={currentStyleImage}
                  originalImage="/art-style-hero-generations/family-original.jpg"
                  styleName={currentStyleName}
                  styleTagline={currentStyleTagline}
                  generationDuration={2500}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Style Pills */}
          <StylePills
            pills={STYLE_PILLS}
            onStyleChange={handleStyleChange}
          />

          {/* Trust Strip - After visual proof */}
          <TrustStrip
            rating={4.9}
            reviewCount={2341}
            customerCount="10,000+"
            customerPhotos={[
              '/lovable-uploads/0c7d3c87-930b-4e39-98a8-2e9893b05344.png',
              '/lovable-uploads/c0f1ce8f-22e6-44e5-89d9-2b3327371fea.png',
              '/lovable-uploads/f9da9750-5b5c-40c0-adeb-92bb010bc33c.png',
            ]}
          />

          {/* Momentum Ticker */}
          <MomentumTicker interval={4000} />

        </div>
      </Section>
    </section>
  );
};

export default ProductHeroSection;
