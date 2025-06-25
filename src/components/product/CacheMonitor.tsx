
import React, { useState, useEffect } from 'react';
import { previewCache, logCachePerformance } from '@/utils/previewCache';
import { memoryManager, logMemoryUsage } from '@/utils/memoryManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, Trash2, Info } from 'lucide-react';

interface CacheMonitorProps {
  showInDev?: boolean;
}

const CacheMonitor = ({ showInDev = true }: CacheMonitorProps) => {
  const [stats, setStats] = useState(previewCache.getStats());
  const [memoryUsage, setMemoryUsage] = useState(memoryManager.getMemoryUsage());
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development or when explicitly enabled
  useEffect(() => {
    const isDev = process.env.NODE_ENV === 'development';
    const showMonitor = showInDev && isDev;
    setIsVisible(showMonitor);
  }, [showInDev]);

  // Update stats periodically
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setStats(previewCache.getStats());
      setMemoryUsage(memoryManager.getMemoryUsage());
    }, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleClearCache = () => {
    previewCache.clearCache();
    setStats(previewCache.getStats());
    console.log('🗑️ Cache cleared manually');
  };

  const handleMemoryCleanup = () => {
    memoryManager.cleanupImageElements();
    setMemoryUsage(memoryManager.getMemoryUsage());
    console.log('🧹 Memory cleanup performed');
  };

  const handleLogPerformance = () => {
    logCachePerformance();
    logMemoryUsage();
  };

  if (!isVisible) return null;

  const cacheSize = previewCache.getCacheSizeMB();
  const hitRateColor = stats.hitRate > 0.7 ? 'text-green-600' : 
                      stats.hitRate > 0.4 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 backdrop-blur shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Info className="w-4 h-4" />
          Preview Cache Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Cache Statistics */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Cache Entries:</span>
            <span className="font-mono">{stats.totalEntries}/50</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Cache Size:</span>
            <span className="font-mono">{cacheSize.toFixed(1)} MB</span>
          </div>
          <div className="flex justify-between text-xs">
            <span>Hit Rate:</span>
            <span className={`font-mono ${hitRateColor}`}>
              {(stats.hitRate * 100).toFixed(1)}%
            </span>
          </div>
          <Progress 
            value={stats.hitRate * 100} 
            className="h-1" 
          />
        </div>

        {/* Memory Usage */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Memory Usage:</span>
            <span className="font-mono">{memoryUsage.estimatedMB.toFixed(1)} MB</span>
          </div>
          {memoryUsage.estimatedMB > 100 && (
            <div className="text-xs text-yellow-600">
              {memoryUsage.recommendation}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleClearCache}
            className="flex-1 text-xs"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear Cache
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMemoryCleanup}
            className="flex-1 text-xs"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Cleanup
          </Button>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          onClick={handleLogPerformance}
          className="w-full text-xs"
        >
          Log Performance
        </Button>
      </CardContent>
    </Card>
  );
};

export default CacheMonitor;
