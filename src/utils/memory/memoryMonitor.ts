
import { MemoryUsage } from './types';

export class MemoryMonitorService {
  // Monitor memory usage (approximate)
  getMemoryUsage(): MemoryUsage {
    const performanceMemory = (performance as any).memory;
    
    if (performanceMemory) {
      const usedMB = performanceMemory.usedJSHeapSize / (1024 * 1024);
      const totalMB = performanceMemory.totalJSHeapSize / (1024 * 1024);
      
      let recommendation = 'Memory usage normal';
      if (usedMB > 100) {
        recommendation = 'Consider clearing cache or compressing images';
      }
      if (usedMB > 200) {
        recommendation = 'High memory usage - clear cache recommended';
      }
      
      return { 
        estimatedMB: usedMB,
        recommendation 
      };
    }
    
    return { 
      estimatedMB: 0, 
      recommendation: 'Memory monitoring not available' 
    };
  }
}
