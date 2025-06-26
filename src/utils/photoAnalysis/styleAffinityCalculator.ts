
export class StyleAffinityCalculator {
  static calculateStyleAffinities(analysis: any): { [styleId: number]: number } {
    const affinities: { [styleId: number]: number } = {};
    
    // Style 1: Original Image - always moderate affinity
    affinities[1] = 0.5;
    
    // Style 2: Classic Oil Painting - great for portraits and complex images
    affinities[2] = analysis.hasPortrait ? 0.9 : 0.6;
    if (analysis.complexity === 'complex') affinities[2] += 0.1;
    if (analysis.contrast === 'high') affinities[2] += 0.1;
    
    // Style 4: Watercolor Dreams - perfect for landscapes and soft images
    affinities[4] = analysis.isLandscape ? 0.9 : 0.5;
    if (analysis.saturation === 'muted') affinities[4] += 0.2;
    if (analysis.brightness === 'bright') affinities[4] += 0.1;
    
    // Style 5: Pastel Bliss - ideal for portraits and soft lighting
    affinities[5] = analysis.hasPortrait ? 0.8 : 0.4;
    if (analysis.brightness === 'bright') affinities[5] += 0.2;
    if (analysis.saturation === 'muted') affinities[5] += 0.2;
    
    // Style 6: Gemstone Poly - modern, geometric style
    affinities[6] = analysis.complexity === 'simple' ? 0.7 : 0.4;
    if (analysis.subjectType === 'object') affinities[6] += 0.2;
    
    // Style 7: 3D Storybook - fun, animated style
    affinities[7] = analysis.saturation === 'vibrant' ? 0.8 : 0.5;
    if (analysis.brightness === 'bright') affinities[7] += 0.1;
    
    // Style 8: Artisan Charcoal - dramatic black and white
    affinities[8] = analysis.contrast === 'high' ? 0.9 : 0.3;
    if (analysis.hasPortrait) affinities[8] += 0.2;
    
    // Style 9: Pop Art Burst - high contrast, vibrant images
    affinities[9] = analysis.contrast === 'high' && analysis.saturation === 'vibrant' ? 0.9 : 0.4;
    if (analysis.brightness === 'bright') affinities[9] += 0.1;
    
    // Style 10: Neon Splash - vibrant, energetic
    affinities[10] = analysis.saturation === 'vibrant' ? 0.8 : 0.3;
    if (analysis.contrast === 'high') affinities[10] += 0.2;
    
    // Style 11: Electric Bloom - futuristic, high-tech
    affinities[11] = analysis.contrast === 'high' ? 0.7 : 0.4;
    if (analysis.saturation === 'vibrant') affinities[11] += 0.2;
    
    // Style 13: Abstract Fusion - artistic, creative
    affinities[13] = analysis.complexity === 'complex' ? 0.7 : 0.5;
    if (analysis.subjectType === 'abstract') affinities[13] += 0.3;
    
    // Style 15: Deco Luxe - elegant, sophisticated
    affinities[15] = analysis.brightness === 'normal' ? 0.6 : 0.4;
    if (analysis.hasPortrait) affinities[15] += 0.2;

    // Normalize affinities to 0-1 range
    Object.keys(affinities).forEach(styleId => {
      affinities[parseInt(styleId)] = Math.min(1, Math.max(0, affinities[parseInt(styleId)]));
    });

    return affinities;
  }

  static generateStyleRecommendations(affinities: { [styleId: number]: number }): number[] {
    return Object.entries(affinities)
      .sort(([, a], [, b]) => b - a)
      .map(([styleId]) => parseInt(styleId));
  }

  static calculateConfidence(affinities: { [styleId: number]: number }): number {
    const scores = Object.values(affinities);
    const maxScore = Math.max(...scores);
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    
    // Higher confidence when there's a clear winner
    return Math.min(1, (maxScore - avgScore) + 0.5);
  }
}
