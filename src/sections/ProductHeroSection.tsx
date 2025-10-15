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
    id: 'classic-oil-painting',
    name: 'Classic Oil',
    tagline: 'Traditional brushstrokes',
    thumbnail: '/art-style-thumbnails/classic-oil-painting.jpg',
    previewImage: '/art-style-thumbnails/classic-oil-painting.jpg',
  },
  {
    id: 'neon-splash',
    name: 'Neon Splash',
    tagline: 'Electric drip energy',
    thumbnail: '/art-style-thumbnails/neon-splash.jpg',
    previewImage: '/art-style-thumbnails/neon-splash.jpg',
  },
  {
    id: 'watercolor-dreams',
    name: 'Watercolor Dreams',
    tagline: 'Soft washes & light',
    thumbnail: '/art-style-thumbnails/watercolor-dreams.jpg',
    previewImage: '/art-style-thumbnails/watercolor-dreams.jpg',
  },
  {
    id: 'pop-art-burst',
    name: 'Pop Art Burst',
    tagline: 'Bold comic vibes',
    thumbnail: '/art-style-thumbnails/pop-art-burst.jpg',
    previewImage: '/art-style-thumbnails/pop-art-burst.jpg',
  },
];

const ProductHeroSection = () => {
  const setLaunchpadExpanded = useFounderStore((state) => state.setLaunchpadExpanded);
  const launchpadExpanded = useFounderStore((state) => state.launchpadExpanded);
  const [currentStyleImage, setCurrentStyleImage] = useState(STYLE_PILLS[0].previewImage);

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

  const handleStyleChange = (_styleId: string, previewImage: string) => {
    setCurrentStyleImage(previewImage);
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
        <div className="mx-auto max-w-6xl space-y-6 sm:space-y-12">

          {/* Animated Transform Badge + Headline */}
          <div className="text-center text-white space-y-3 sm:space-y-4 max-w-4xl mx-auto px-4">
            <div className="flex justify-center mb-2 sm:mb-4">
              <AnimatedTransformBadge />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold leading-tight drop-shadow-2xl">
              <span className="hidden md:inline">Transform Your Memories Into </span>
              <span className="md:hidden">Transform Your Memories Into<br /></span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Museum-Quality Art
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/70 leading-relaxed">
              AI-powered canvas art. Multiple styles. In 60 seconds.
            </p>
          </div>

          {/* CTA Deck */}
          <CTADeck
            onUploadClick={handleHeroUploadClick}
            showDemo={false}
          />

          {/* Trust Strip */}
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

          {/* Momentum Ticker */}
          <MomentumTicker interval={4000} />

        </div>
      </Section>
    </section>
  );
};

export default ProductHeroSection;
