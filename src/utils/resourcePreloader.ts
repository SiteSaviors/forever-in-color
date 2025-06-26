
export class ResourcePreloader {
  private static preloadedStyles = new Set<number>();
  private static preloadQueue = new Map<string, Promise<any>>();

  static async preloadStyleResources(styleId: number): Promise<void> {
    if (this.preloadedStyles.has(styleId)) {
      return;
    }

    const preloadPromises: Promise<void>[] = [];
    
    // Preload style preview images
    const styleImageUrl = this.getStyleImageUrl(styleId);
    if (styleImageUrl) {
      preloadPromises.push(this.preloadImage(styleImageUrl));
    }
    
    // Preload related canvas mockup images
    const mockupImageUrl = this.getCanvasMockupUrl(styleId);
    if (mockupImageUrl) {
      preloadPromises.push(this.preloadImage(mockupImageUrl));
    }
    
    // Simulate API warmup
    preloadPromises.push(this.warmupStyleAPI(styleId));
    
    await Promise.allSettled(preloadPromises);
    this.preloadedStyles.add(styleId);
  }

  static preloadImage(url: string): Promise<void> {
    const key = `image:${url}`;
    
    if (!this.preloadQueue.has(key)) {
      const promise = new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
        
        // Timeout after 3 seconds
        setTimeout(() => reject(new Error('Preload timeout')), 3000);
      });
      
      this.preloadQueue.set(key, promise);
    }

    return this.preloadQueue.get(key)!;
  }

  private static async warmupStyleAPI(styleId: number): Promise<void> {
    // Simulate API warmup - could send a small warmup request
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  private static getStyleImageUrl(styleId: number): string | null {
    // Map style IDs to their preview images
    const styleImages: { [key: number]: string } = {
      2: '/images/styles/classic-oil-preview.jpg',
      4: '/images/styles/watercolor-preview.jpg',
      5: '/images/styles/pastel-preview.jpg',
      8: '/images/styles/charcoal-preview.jpg',
      9: '/images/styles/pop-art-preview.jpg'
    };
    
    return styleImages[styleId] || null;
  }

  private static getCanvasMockupUrl(styleId: number): string | null {
    return `/images/canvas-mockups/style-${styleId}.jpg`;
  }

  static isStylePreloaded(styleId: number): boolean {
    return this.preloadedStyles.has(styleId);
  }

  static preloadMultipleStyles(styleIds: number[]): Promise<void[]> {
    return Promise.all(
      styleIds.map(styleId => this.preloadStyleResources(styleId))
    );
  }
}
