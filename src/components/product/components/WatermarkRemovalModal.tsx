
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, Download, Plus, AlertCircle, CheckCircle } from '@/components/ui/icons';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ResolutionSelector from './ResolutionSelector';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useDownloadPurchases } from '@/hooks/useDownloadPurchases';
import TokenPurchaseModal from '@/components/ui/TokenPurchaseModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WatermarkRemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  styleName: string;
  styleId: number;
  onRemoveWatermark: (resolution: string, tokens: number) => Promise<void>;
}

const WatermarkRemovalModal: React.FC<WatermarkRemovalModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  styleName,
  styleId,
  onRemoveWatermark
}) => {
  const [selectedResolution, setSelectedResolution] = useState<string>('hd');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTokenPurchaseOpen, setIsTokenPurchaseOpen] = useState(false);
  const [cleanImageUrl, setCleanImageUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const { balance, refreshBalance } = useTokenBalance();
  const { refreshPurchases } = useDownloadPurchases();
  const { toast } = useToast();

  const getTokensForResolution = (resolution: string): number => {
    const tokenMap = { 'standard': 3, 'hd': 4, 'ultra-hd': 5 };
    return tokenMap[resolution as keyof typeof tokenMap] || 4;
  };

  const selectedTokens = getTokensForResolution(selectedResolution);
  const hasEnoughTokens = balance >= selectedTokens;

  const handleRemoveWatermark = async () => {
    if (!hasEnoughTokens) {
      setIsTokenPurchaseOpen(true);
      return;
    }

    setIsProcessing(true);
    try {
      
      const { data, error } = await supabase.functions.invoke('remove-watermark', {
        body: {
          imageUrl,
          styleId,
          styleName,
          resolution: selectedResolution,
          tokens: selectedTokens
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to remove watermark');
      }

      if (!data.success || !data.cleanImageUrl) {
        throw new Error(data.error || 'Failed to generate clean image');
      }

      setCleanImageUrl(data.cleanImageUrl);
      setIsSuccess(true);
      refreshBalance();
      refreshPurchases(); // Refresh purchase history to show new purchase

      toast({
        title: "Watermark Removed!",
        description: "Your clean image is ready for download.",
      });

      // Call the original callback for any additional handling
      await onRemoveWatermark(selectedResolution, selectedTokens);

    } catch (_error) {
      toast({
        title: "Error",
        description: _error instanceof Error ? _error.message : "Failed to remove watermark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (cleanImageUrl) {
      const link = document.createElement('a');
      link.href = cleanImageUrl;
      link.download = `${styleName.replace(/\s+/g, '_')}_${selectedResolution}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Downloaded!",
        description: "Your image has been downloaded successfully.",
      });
    }
  };

  const handleTokenPurchaseComplete = () => {
    setIsTokenPurchaseOpen(false);
    refreshBalance();
  };

  const handleClose = () => {
    setIsSuccess(false);
    setCleanImageUrl(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold text-center">
              {isSuccess ? (
                <>
                  <CheckCircle className="w-6 h-6 inline-block mr-2 text-green-600" />
                  Download Ready!
                </>
              ) : (
                <>
                  <Download className="w-6 h-6 inline-block mr-2 text-green-600" />
                  Remove Watermark & Download
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Success State */}
            {isSuccess && cleanImageUrl ? (
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <img
                    src={cleanImageUrl}
                    alt={`${styleName} - Clean version`}
                    className="max-w-full max-h-64 object-contain rounded-lg shadow-md"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Clean Version
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Your watermark-free version of <span className="font-medium">{styleName}</span> is ready!
                </p>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Preview Image */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <img
                      src={imageUrl}
                      alt={`${styleName} preview`}
                      className="max-w-full max-h-64 object-contain rounded-lg shadow-md"
                    />
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Watermarked
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Style: <span className="font-medium">{styleName}</span>
                  </p>
                </div>

                {/* Token Balance Display */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600 fill-yellow-500" />
                      <span className="font-medium text-yellow-800">
                        Your Token Balance: {balance} tokens
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsTokenPurchaseOpen(true)}
                      className="text-yellow-700 border-yellow-300 hover:bg-yellow-100"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Buy More
                    </Button>
                  </div>
                </div>

                <ResolutionSelector
                  selectedResolution={selectedResolution}
                  onResolutionSelect={setSelectedResolution}
                  userTokenBalance={balance}
                />

                {!hasEnoughTokens && (
                  <Alert className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      You need {selectedTokens - balance} more tokens to download this resolution. 
                      Purchase tokens or select a lower resolution.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRemoveWatermark}
                    disabled={isProcessing}
                    className={`flex-1 ${
                      hasEnoughTokens
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-pulse" />
                        Processing...
                      </>
                    ) : hasEnoughTokens ? (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Remove Watermark ({selectedTokens} tokens)
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Buy Tokens & Remove
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Token Purchase Modal */}
      <TokenPurchaseModal
        isOpen={isTokenPurchaseOpen}
        onClose={handleTokenPurchaseComplete}
      />
    </>
  );
};

export default WatermarkRemovalModal;
