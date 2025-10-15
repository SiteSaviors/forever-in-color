import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type GeneratingCanvasAnimationProps = {
  defaultStyleImage: string;
  videoSrc?: string;
  posterImage?: string;
  generationDuration?: number;
  className?: string;
  onGenerationComplete?: () => void;
};

const GeneratingCanvasAnimation = ({
  defaultStyleImage,
  videoSrc,
  posterImage,
  generationDuration = 2500,
  className = '',
  onGenerationComplete,
}: GeneratingCanvasAnimationProps) => {
  const [phase, setPhase] = useState<'loading' | 'generating' | 'complete'>('loading');
  const [hasPlayed, setHasPlayed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Skip animation, go straight to complete
      setPhase('complete');
      setHasPlayed(true);
      return;
    }

    // Start with loading phase
    setPhase('loading');

    // Brief loading, then start generation
    const loadingTimer = setTimeout(() => {
      setPhase('generating');

      // Play video if available
      if (videoRef.current && videoSrc) {
        videoRef.current.play().catch(() => {
          // Video playback failed, skip to complete
          setPhase('complete');
        });
      }
    }, 300);

    // Auto-complete after duration
    const completeTimer = setTimeout(() => {
      setPhase('complete');
      setHasPlayed(true);
      onGenerationComplete?.();
    }, generationDuration + 300);

    return () => {
      clearTimeout(loadingTimer);
      clearTimeout(completeTimer);
    };
  }, [videoSrc, generationDuration, onGenerationComplete]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden bg-slate-900 shadow-2xl ${className}`}>
      {/* Canvas Image (always present) */}
      <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
        <img
          src={defaultStyleImage}
          alt="AI Generated Canvas"
          className="w-full h-full object-cover"
        />

        {/* Video Overlay (if provided and generating) */}
        {videoSrc && phase === 'generating' && (
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            poster={posterImage}
            playsInline
            muted
            onEnded={() => {
              setPhase('complete');
              setHasPlayed(true);
            }}
          >
            <source src={videoSrc} type="video/mp4" />
            <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm" />
          </video>
        )}

        {/* Generation Overlay */}
        <AnimatePresence>
          {phase !== 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center"
            >
              <div className="flex flex-col items-center gap-4">
                {/* Spinning badge */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-400 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-purple-400" />
                  </div>
                </motion.div>

                {/* Shimmer progress text */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <p className="text-lg font-semibold text-white mb-1">
                    {phase === 'loading' ? 'Initializing AI...' : 'Generating your canvas...'}
                  </p>
                  <p className="text-sm text-white/60">Just a moment</p>
                </motion.div>

                {/* Progress shimmer bar */}
                <motion.div
                  initial={{ width: '20%' }}
                  animate={{ width: '100%' }}
                  transition={{
                    duration: generationDuration / 1000,
                    ease: 'easeInOut',
                  }}
                  className="w-48 h-1 bg-purple-500/30 rounded-full overflow-hidden"
                >
                  <motion.div
                    animate={{
                      x: ['0%', '100%'],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="h-full w-1/3 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                  />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Badge (appears when complete) */}
        <AnimatePresence>
          {phase === 'complete' && !hasPlayed && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Generated!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom info strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Classic Oil Painting</p>
            <p className="text-xs text-white/60">Traditional brush strokes</p>
          </div>
          {phase === 'complete' && (
            <div className="text-xs text-emerald-400 font-medium">
              Ready in 2.3s ⚡
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneratingCanvasAnimation;
