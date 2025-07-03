
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap, Download, Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ResolutionSelector from './ResolutionSelector';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import TokenPurchaseModal from '@/components/ui/TokenPurchaseModal';

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
  const { balance, refreshBalance } = useTokenBalance();

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
      await onRemoveWatermark(selectedResolution, selectedTokens);
      onClose();
    } catch (error) {
      console.error('Failed to remove watermark:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTokenPurchaseComplete = () => {
    setIsTokenPurchaseOpen(false);
    refreshBalance();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold text-center">
              <Download className="w-6 h-6 inline-block mr-2 text-green-600" />
              Remove Watermark & Download
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
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

            {/* Resolution Selector */}
            <ResolutionSelector
              selectedResolution={selectedResolution}
              onResolutionSelect={setSelectedResolution}
              userTokenBalance={balance}
            />

            {/* Insufficient Tokens Warning */}
            {!hasEnoughTokens && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  You need {selectedTokens - balance} more tokens to download this resolution. 
                  Purchase tokens or select a lower resolution.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
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
