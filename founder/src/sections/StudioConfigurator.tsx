import { useState } from 'react';
import Section from '@/components/layout/Section';
import { useFounderStore } from '@/store/useFounderStore';
import StickyOrderRail from '@/components/studio/StickyOrderRail';
import LivingCanvasModal from '@/components/studio/LivingCanvasModal';

const StudioConfigurator = () => {
  const styles = useFounderStore((state) => state.styles);
  const selectedStyleId = useFounderStore((state) => state.selectedStyleId);
  const selectStyle = useFounderStore((state) => state.selectStyle);
  const previews = useFounderStore((state) => state.previews);
  const currentStyle = useFounderStore((state) => state.currentStyle());
  const preview = currentStyle ? previews[currentStyle.id] : undefined;
  const generationCount = useFounderStore((state) => state.generationCount);
  const getGenerationLimit = useFounderStore((state) => state.getGenerationLimit);
  const canGenerateMore = useFounderStore((state) => state.canGenerateMore);
  const generatePreviews = useFounderStore((state) => state.generatePreviews);

  const handleStyleClick = (styleId: string) => {
    selectStyle(styleId);
    const previewState = previews[styleId];
    if (previewState?.status === 'loading' || previewState?.status === 'ready') {
      return;
    }

    if (!canGenerateMore()) {
      return;
    }

    void generatePreviews([styleId]);
  };

  const limit = getGenerationLimit();
  const remaining = limit === Infinity ? '∞' : Math.max(0, limit - generationCount);

  return (
    <section className="bg-slate-900 min-h-screen relative" data-studio-section id="studio">
      {/* Header */}
      <div className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-brand-indigo" />
              <span className="text-sm text-brand-indigo uppercase tracking-[0.3em]">Studio</span>
            </div>
          </div>
          <div className="text-white/70 text-sm">
            {currentStyle?.name || 'Select a style'}
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout: Left Sidebar | Center Canvas | Right Sidebar */}
      <div className="flex max-w-[1800px] mx-auto">
        {/* LEFT SIDEBAR: Style Selection (Fixed Width) */}
        <aside className="w-80 bg-slate-950/50 border-r border-white/10 h-screen sticky top-[57px] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-xl font-bold text-white">All Styles</h3>
              <p className="text-xs text-white/60 mt-1">Click to preview</p>
            </div>

            {/* Generation counter */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <p className="text-sm text-white/70 mb-1">Generations Remaining</p>
              <p className="text-2xl font-bold text-white">{remaining} left today</p>
              <p className="text-xs text-white/60 mt-2">Create an account for 5 more</p>
            </div>

            {/* Style list */}
            <div className="space-y-3">
              {styles.map((style) => {
                const isSelected = style.id === selectedStyleId;
                const stylePreview = previews[style.id];
                const isReady = stylePreview?.status === 'ready';

                return (
                  <button
                    key={style.id}
                    onClick={() => handleStyleClick(style.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-2 border-purple-400'
                        : 'bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={style.thumbnail} alt={style.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-purple-500/40">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-semibold text-white">{style.name}</p>
                      <p className="text-xs text-white/60 mt-1 line-clamp-2">{style.description}</p>
                      {isReady && (
                        <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-green-400 font-semibold">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Cached
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Upgrade CTA */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-400/30">
              <p className="text-sm font-semibold text-white mb-2">Want unlimited generations?</p>
              <p className="text-xs text-white/70 mb-3">Upgrade to Creator for unlimited style switching</p>
              <button className="w-full px-4 py-2 rounded-lg bg-gradient-cta text-white text-sm font-bold shadow-glow-purple hover:shadow-glow-purple transition">
                Upgrade - $9.99/mo
              </button>
            </div>
          </div>
        </aside>

        {/* CENTER: Canvas Preview (Flexible) */}
        <main className="flex-1 p-8 flex flex-col items-center justify-start">
          <div className="w-full max-w-2xl">
            {/* Canvas Preview - Reduced size */}
            <div className="relative aspect-square rounded-3xl overflow-hidden border-2 border-white/20 bg-gradient-preview-bg shadow-2xl">
              {preview?.status === 'loading' && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
                  <div className="absolute inset-0 preview-skeleton" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin" />
                    <p className="text-white mt-4 text-sm">Creating your masterpiece...</p>
                  </div>
                </div>
              )}

              {preview?.status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-red-500/10 border-2 border-red-400/30">
                  <svg className="w-12 h-12 text-red-400 mb-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-base font-semibold text-red-300">Preview generation failed</p>
                  <p className="text-sm text-white/60 mt-1">Try selecting a different style</p>
                </div>
              )}

              {preview?.data?.previewUrl || currentStyle?.preview ? (
                <img
                  src={preview?.data?.previewUrl ?? currentStyle?.preview}
                  alt="Canvas preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/40 text-center p-8">
                  <div>
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm">Select a style from the left to see your transformed image</p>
                  </div>
                </div>
              )}

              {/* Ready Badge */}
              {preview?.status === 'ready' && (
                <div className="absolute top-6 right-6 px-4 py-2 rounded-full bg-purple-500/95 text-white text-sm font-semibold shadow-glow-soft backdrop-blur-sm animate-scaleIn">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ready to print
                  </span>
                </div>
              )}

              {/* Watermark overlay (mock) */}
              {preview?.status === 'ready' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="text-white/20 text-6xl font-bold tracking-wider"
                    style={{ transform: 'rotate(-45deg)' }}
                  >
                    WONDERTONE
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: Options + Order Summary (Fixed Width) */}
        <aside className="w-[420px]">
          <div className="sticky top-[57px] p-6">
            <StickyOrderRail />
          </div>
        </aside>
      </div>

      {/* Living Canvas Modal */}
      <LivingCanvasModal />
    </section>
  );
};

export default StudioConfigurator;
