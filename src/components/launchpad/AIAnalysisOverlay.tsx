import { useEffect, useState } from 'react';
import { clsx } from 'clsx';

interface AIAnalysisOverlayProps {
  imageUrl: string;
  onComplete: () => void;
  duration?: number; // milliseconds
}

const ANALYSIS_PHASES = [
  { label: 'Analyzing composition', icon: '🎨', delay: 0 },
  { label: 'Detecting subjects', icon: '👤', delay: 800 },
  { label: 'Optimizing framing', icon: '✨', delay: 1600 },
];

const AIAnalysisOverlay = ({ imageUrl, onComplete, duration = 2500 }: AIAnalysisOverlayProps) => {
  const [progress, setProgress] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);

  useEffect(() => {
    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, duration / 50);

    // Phase transitions
    const phaseTimers = ANALYSIS_PHASES.map((phase, index) => {
      return setTimeout(() => {
        setCurrentPhase(index);
      }, phase.delay);
    });

    // Complete callback
    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      phaseTimers.forEach(clearTimeout);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[1.75rem] bg-slate-950/95 backdrop-blur-xl border-2 border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
      {/* Background image with blur and overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={imageUrl}
          alt="Analyzing"
          className="w-full h-full object-cover opacity-20 blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/30 to-slate-900/50" />
      </div>

      {/* Scanning lines effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent animate-scan"
          style={{
            top: `${progress}%`,
            boxShadow: '0 0 20px rgba(168,85,247,0.6)',
          }}
        />
        <div
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent animate-scan-slow"
          style={{
            top: `${(progress * 0.7) % 100}%`,
            boxShadow: '0 0 15px rgba(59,130,246,0.4)',
          }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-0">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="border border-purple-400/30" />
          ))}
        </div>
      </div>

      {/* Pulsing corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-purple-400/60 animate-pulse" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-purple-400/60 animate-pulse" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-purple-400/60 animate-pulse" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-purple-400/60 animate-pulse" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 space-y-6">
        {/* Rotating AI icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur-xl opacity-50 animate-pulse" />
          <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-glow-purple animate-spin-slow">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
        </div>

        {/* Phase messages */}
        <div className="text-center space-y-2 min-h-[80px]">
          {ANALYSIS_PHASES.map((phase, index) => (
            <div
              key={index}
              className={clsx(
                'transition-all duration-500',
                currentPhase === index
                  ? 'opacity-100 transform translate-y-0'
                  : currentPhase > index
                  ? 'opacity-0 transform -translate-y-4'
                  : 'opacity-0 transform translate-y-4'
              )}
            >
              {currentPhase === index && (
                <div className="animate-fadeIn">
                  <div className="text-4xl mb-2 animate-bounce-subtle">{phase.icon}</div>
                  <p className="text-xl font-semibold text-white drop-shadow-lg">
                    {phase.label}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md space-y-2">
          <div className="flex items-center justify-between text-xs text-purple-300 font-semibold">
            <span>AI Analysis</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-slate-900/60 rounded-full overflow-hidden border border-purple-500/30">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-purple-400 rounded-full transition-all duration-200 shadow-glow-purple animate-shimmer"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Particle effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/60 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisOverlay;
