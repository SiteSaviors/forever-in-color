
// Critical CSS extraction and inlining
export class CriticalCSSExtractor {
  private static criticalRules = new Set<string>();
  private static observer: MutationObserver | null = null;

  // Extract critical CSS for above-the-fold content
  static extractCriticalCSS(): string {
    const criticalElements = this.getCriticalElements();
    const criticalCSS = new Set<string>();

    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets);

    stylesheets.forEach(stylesheet => {
      try {
        const rules = Array.from(stylesheet.cssRules || []);
        
        rules.forEach(rule => {
          if (rule instanceof CSSStyleRule) {
            // Check if rule applies to critical elements
            if (this.ruleAppliesToCriticalElements(rule, criticalElements)) {
              criticalCSS.add(rule.cssText);
            }
          }
        });
      } catch (e) {
        // Cross-origin stylesheets may throw errors
        console.warn('Cannot access stylesheet:', e);
      }
    });

    return Array.from(criticalCSS).join('\n');
  }

  // Get elements that are above the fold
  private static getCriticalElements(): Element[] {
    const viewportHeight = window.innerHeight;
    const criticalElements: Element[] = [];

    // Get all elements in the viewport
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          const element = node as Element;
          const rect = element.getBoundingClientRect();
          
          // Element is in critical viewport
          if (rect.top < viewportHeight && rect.bottom > 0) {
            return NodeFilter.FILTER_ACCEPT;
          }
          
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      criticalElements.push(node as Element);
    }

    return criticalElements;
  }

  // Check if CSS rule applies to critical elements
  private static ruleAppliesToCriticalElements(
    rule: CSSStyleRule,
    criticalElements: Element[]
  ): boolean {
    try {
      return criticalElements.some(element => {
        return element.matches(rule.selectorText);
      });
    } catch (e) {
      // Invalid selector
      return false;
    }
  }

  // Inline critical CSS
  static inlineCriticalCSS(criticalCSS: string): void {
    const existingStyle = document.getElementById('critical-css');
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }

  // Load non-critical CSS asynchronously
  static loadNonCriticalCSS(href: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    link.onload = () => {
      link.rel = 'stylesheet';
    };
    document.head.appendChild(link);
  }

  // Monitor for new elements and update critical CSS
  static startCriticalCSSMonitoring(): void {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const rect = element.getBoundingClientRect();
              
              if (rect.top < window.innerHeight && rect.bottom > 0) {
                shouldUpdate = true;
              }
            }
          });
        }
      });

      if (shouldUpdate) {
        // Debounce updates
        setTimeout(() => {
          const newCriticalCSS = this.extractCriticalCSS();
          this.inlineCriticalCSS(newCriticalCSS);
        }, 100);
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Stop monitoring
  static stopCriticalCSSMonitoring(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// Auto-initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const criticalCSS = CriticalCSSExtractor.extractCriticalCSS();
      CriticalCSSExtractor.inlineCriticalCSS(criticalCSS);
      CriticalCSSExtractor.startCriticalCSSMonitoring();
    });
  } else {
    const criticalCSS = CriticalCSSExtractor.extractCriticalCSS();
    CriticalCSSExtractor.inlineCriticalCSS(criticalCSS);
    CriticalCSSExtractor.startCriticalCSSMonitoring();
  }
}
