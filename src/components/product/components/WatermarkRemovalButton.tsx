
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Coins, Zap, Crown, Star } from 'lucide-react';
import { useWatermarkRemoval } from '../hooks/useWatermarkRemoval';
import TokenBalance from '@/components/ui/TokenBalance';

interface ResolutionOption {
  tier: 'standard' | 'hd' | 'ultra_hd';
  label: string;
  description: string;
  tokens: number;
  icon: React.ReactNode;
  popular?: boolean;
}

const resolutionOptions: ResolutionOption[] = [
  {
    tier: 'standard',
    label: 'Standard',
    description: '1024x1024 • Perfect for social media',
    tokens: 3,
    icon: <Download className="w-4 h-4" />
  },
  {
    tier: 'hd',
    label: 'HD',
    description: '2048x2048 • High quality prints',
    tokens: 4,
    icon: <Star className="w-4 h-4" />,
    popular: true
  },
  {
    tier: 'ultra_hd',
    label: 'Ultra HD',
    description: '4096x4096 • Professional quality',
    tokens: 5,
    icon: <Crown className="w-4 h-4" />
  }
];

interface WatermarkRemovalButtonProps {
  styleId: number;
  styleName: string;
  originalImageUrl: string;
  hasGeneratedPreview: boolean;
  className?: string;
}

const WatermarkRemovalButton = ({
  styleId,
  styleName,
  originalImageUrl,
  hasGeneratedPreview,
  className = ''
}: WatermarkRemovalButtonProps) => {
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const { removeWatermarkAndDownload, isProcessing, canAfford, getTokenCost, balance } = useWatermarkRemoval();

  const handleDownload = async (resolutionTier: 'standard' | 'hd' | 'ultra_hd') => {
    const result = await removeWatermarkAndDownload({
      styleId,
      styleName,
      originalImageUrl,
      resolutionTier
    });

    if (result.success && result.downloadUrl) {
      // Trigger download
      const link = document.createElement('a');
      link.href = result.downloadUrl;
      link.download = `${styleName}_${resolutionTier}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setShowResolutionModal(false);
    } else {
      alert(result.error || 'Download failed');
    }
  };

  if (!hasGeneratedPreview) {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setShowResolutionModal(true)}
        className={`bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
        disabled={balance < 3}
      >
        <Download className="w-4 h-4 mr-2" />
        Remove Watermark & Download
        <Coins className="w-4 h-4 ml-2" />
      </Button>

      <Dialog open={showResolutionModal} onOpenChange={setShowResolutionModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Choose Download Quality
            </DialogTitle>
            <p className="text-gray-600">
              Select your preferred resolution for <span className="font-medium">{styleName}</span>
            </p>
          </DialogHeader>

          <div className="mb-6">
            <TokenBalance variant="full" showPurchaseButton={true} />
          </div>

          <div className="grid gap-4">
            {resolutionOptions.map((option) => {
              const affordable = canAfford(option.tier);
              const cost = getTokenCost(option.tier);

              return (
                <div
                  key={option.tier}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    affordable 
                      ? 'border-gray-200 hover:border-purple-300 hover:shadow-md' 
                      : 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
                  } ${
                    option.popular ? 'ring-2 ring-purple-200 bg-purple-50' : ''
                  }`}
                  onClick={() => affordable && handleDownload(option.tier)}
                >
                  {option.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                      Most Popular
                    </Badge>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        option.popular 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{option.label}</h3>
                        <p className="text-sm text-gray-600">{option.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <Coins className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-900">{cost}</span>
                        </div>
                        <p className="text-xs text-gray-500">tokens</p>
                      </div>

                      <Button
                        size="sm"
                        disabled={!affordable || isProcessing}
                        className={`${
                          option.popular
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            : 'bg-gray-900 hover:bg-gray-800'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(option.tier);
                        }}
                      >
                        {isProcessing ? 'Processing...' : 'Download'}
                      </Button>
                    </div>
                  </div>

                  {!affordable && (
                    <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-sm font-medium text-gray-600">Insufficient tokens</p>
                        <p className="text-xs text-gray-500">Need {cost} tokens</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>• Watermark-free downloads • Instant delivery • HD & Ultra HD use AI upscaling</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WatermarkRemovalButton;
