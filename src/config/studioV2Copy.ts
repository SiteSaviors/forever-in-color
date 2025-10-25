export const STUDIO_V2_COPY = {
  insightsHeadline: 'Wondertone Story & Insights',
  insightsSubtext: 'Select a style to discover the magic behind the art.',
  insightsPlaceholder:
    'Your Wondertone Story & Insight will appear here once you upload a photo.',
  storyHeader: (styleName: string) => `Wondertone Story — ${styleName}`,
  storyTeaserTitle: (styleName: string) => `The Story Behind ${styleName}`,
  storyTeaserFooter: 'Upload a photo to unlock the full narrative.',
  discoverLabels: ['Narrative', 'Emotion', 'Perfect For', 'Signature Detail'] as const,
  secondaryCta: {
    label: 'Create Canvas Print',
    subtext: 'Orders ship in 5 days',
  },
  canvasModal: {
    title: 'Configure Your Canvas',
    subtitle: 'Museum-grade materials · Ships in 5 days · 100% satisfaction guarantee.',
    trust: [
      { icon: '⭐', copy: '4.9 • 1,200+ collectors' },
      { icon: '🚚', copy: 'Ships in 5 days' },
      { icon: '🛡️', copy: '100% satisfaction guarantee' },
    ] as const,
    primaryCta: 'Complete Your Order →',
    reviewsPlaceholder: 'Collector reviews and gallery coming soon.',
  },
  shareCaption: (styleName: string) =>
    `Just turned a favorite photo into art with ${styleName}. @Wondertone #ArtFromMemory #TheAIArtCurator`,
} as const;

export type StudioV2Copy = typeof STUDIO_V2_COPY;
