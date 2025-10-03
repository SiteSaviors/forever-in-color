
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useToast } from '@/hooks/use-toast';

interface DownloadPurchase {
  id: string;
  style_id: number;
  style_name: string;
  original_image_url: string;
  clean_image_url: string;
  resolution_tier: string;
  tokens_spent: number;
  download_count: number;
  last_downloaded_at: string | null;
  created_at: string;
}

export const useDownloadPurchases = () => {
  const [purchases, setPurchases] = useState<DownloadPurchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const fetchPurchases = useCallback(async () => {
    if (!user) {
      setPurchases([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('download_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load download history.",
          variant: "destructive",
        });
      } else {
        setPurchases(data || []);
      }
    } catch (_error) {
      setPurchases([]);
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const getPurchaseForStyleAndImage = (styleId: number, imageUrl: string) => {
    return purchases.find(purchase => 
      purchase.style_id === styleId && 
      purchase.original_image_url === imageUrl
    );
  };

  const redownloadPurchase = async (purchaseId: string, fileName: string) => {
    try {
      const purchase = purchases.find(p => p.id === purchaseId);
      if (!purchase) {
        throw new Error('Purchase not found');
      }

      // Download the file
      const link = document.createElement('a');
      link.href = purchase.clean_image_url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Update download count
      const { error } = await supabase
        .from('download_purchases')
        .update({ 
          download_count: purchase.download_count + 1,
          last_downloaded_at: new Date().toISOString()
        })
        .eq('id', purchaseId);

      if (!error) {
        // Update local state
        setPurchases(prev => prev.map(p => 
          p.id === purchaseId 
            ? { ...p, download_count: p.download_count + 1, last_downloaded_at: new Date().toISOString() }
            : p
        ));
      }

      toast({
        title: "Downloaded!",
        description: "Your image has been re-downloaded successfully.",
      });

      return true;
    } catch (_error) {
      toast({
        title: "Error",
        description: _error instanceof Error ? _error.message : "Failed to re-download. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [user, fetchPurchases]);

  return {
    purchases,
    isLoading,
    refreshPurchases: fetchPurchases,
    getPurchaseForStyleAndImage,
    redownloadPurchase,
    hasPurchases: purchases.length > 0
  };
};
