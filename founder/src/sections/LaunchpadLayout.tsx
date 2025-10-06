import Section from '@/components/layout/Section';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFounderStore } from '@/store/useFounderStore';
import { useEffect, useMemo, useRef } from 'react';
import { emitStepOneEvent } from '@/utils/telemetry';
import PhotoUploader from '@/components/launchpad/PhotoUploader';

const LaunchpadLayout = () => {
  const styles = useFounderStore((state) => state.styles);
  const selectStyle = useFounderStore((state) => state.selectStyle);
  const generatePreviews = useFounderStore((state) => state.generatePreviews);
  const previewStatus = useFounderStore((state) => state.previewStatus);
  const previews = useFounderStore((state) => state.previews);
  const uploadedImage = useFounderStore((state) => state.uploadedImage);
  const currentStyle = useFounderStore((state) => state.currentStyle());

  useEffect(() => {
    void generatePreviews(styles.slice(0, 3).map((style) => style.id));
  }, [generatePreviews, styles]);

  const handleStyleSelect = (id: string) => {
    selectStyle(id);
    emitStepOneEvent({ type: 'preview', styleId: id, status: 'generating' });
    void generatePreviews([id]).then(() => emitStepOneEvent({ type: 'preview', styleId: id, status: 'ready' }));
  };

  const previewTiles = useMemo(() => styles.slice(0, 4), [styles]);
  const orientation = useFounderStore((state) => state.orientation);
  const currentPreviewState = currentStyle ? previews[currentStyle.id] : undefined;
  const statusLabel = currentPreviewState?.status === 'ready'
    ? 'Preview ready'
    : currentPreviewState?.status === 'loading'
      ? 'Generating…'
      : previewStatus;

  const lastStyleIdRef = useRef<string | null>(null);
  const lastPreviewStatusRef = useRef(previewStatus);

  useEffect(() => {
    emitStepOneEvent({ type: 'substep', value: 'upload' });
  }, []);

  useEffect(() => {
    if (currentStyle?.id && lastStyleIdRef.current !== currentStyle.id) {
      emitStepOneEvent({ type: 'substep', value: 'style-selection' });
      lastStyleIdRef.current = currentStyle.id;
    }
  }, [currentStyle?.id]);

  useEffect(() => {
    if (previewStatus === 'ready' && lastPreviewStatusRef.current !== 'ready') {
      emitStepOneEvent({ type: 'substep', value: 'complete' });
    }
    lastPreviewStatusRef.current = previewStatus;
  }, [previewStatus]);

  return (
    <Section id="launchpad">
      <div className="flex items-center gap-3 text-sm text-brand-indigo uppercase tracking-[0.3em] mb-6">
        <span className="w-2 h-2 rounded-full bg-brand-indigo" /> Launchpad
      </div>
      <div className="grid lg:grid-cols-[1fr_400px] gap-12">
        <div className="space-y-8">
          <h2 className="text-3xl font-semibold">Step 1 • Upload & Choose Style</h2>
          <p className="text-white/70 text-lg max-w-3xl">
            The launchpad keeps upload, crop, and style exploration in one split view. As soon as you tap a style, the
            preview rail streams results with blur skeletons to eliminate dead time.
          </p>
          <div className="grid lg:grid-cols-2 gap-6">
            <PhotoUploader />
            <Card glass className="space-y-4">
              <h3 className="text-xl font-semibold text-white">Live Preview Rail</h3>
              <p className="text-sm text-white/70">
                Parallel requests generate multiple styles in seconds. Choose your favorite to continue.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-white/70">
                {previewTiles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleSelect(style.id)}
                    className="relative h-28 rounded-xl bg-gradient-card border border-white/10 flex items-end p-3 text-left hover:border-white/40 transition overflow-hidden"
                  >
                    {style.name}
                    {previews[style.id]?.status === 'loading' && (
                      <span className="absolute inset-0 bg-white/10 animate-pulse" />
                    )}
                    {previews[style.id]?.status === 'ready' && (
                      <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-white/80 text-slate-900">Ready</span>
                    )}
                    {previews[style.id]?.status === 'error' && (
                      <span className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-red-500/90 text-white">Error</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-white/60">
                <span>Status: {statusLabel}</span>
                <span>Orientation: {orientation}</span>
              </div>
            </Card>
          </div>
        </div>
        <aside className="glass-card backdrop-blur-md space-y-4">
          <h3 className="text-lg font-semibold text-white">Preview Summary</h3>
          <div className="space-y-3 text-sm text-white/70">
            <div className="flex justify-between">
              <span>Photo</span>
              <span>{uploadedImage ? 'Uploaded' : 'Awaiting upload'}</span>
            </div>
            <div className="flex justify-between">
              <span>Style</span>
              <span>{currentStyle?.name ?? '—'}</span>
            </div>
            <div className="flex justify-between"><span>Status</span><span>{statusLabel}</span></div>
            <div className="flex justify-between"><span>Orientation</span><span>{orientation}</span></div>
          </div>
          <Button
            className="w-full"
            disabled={previewStatus !== 'ready'}
            onClick={() => emitStepOneEvent({ type: 'cta', value: 'continue-to-studio' })}
          >
            Continue to Studio
          </Button>
          <p className="text-xs text-white/60">
            Once a preview renders, the CTA unlocks. The sticky order rail mirrors this panel throughout the flow.
          </p>
        </aside>
      </div>
    </Section>
  );
};

export default LaunchpadLayout;
