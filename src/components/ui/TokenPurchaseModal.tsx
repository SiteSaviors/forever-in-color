
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Star, Crown, Sparkles, CreditCard } from 'lucide-react';
import { useStripePayment } from '@/hooks/useStripePayment';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useTokenBalance } from '@/hooks/useTokenBalance';

interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  savings?: string;
  popular?: boolean;
  icon: React.ReactNode;
  description: string;
}

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tokenPackages: TokenPackage[] = [
  {
    id: 'starter',
    name: 'Starter',
    tokens: 10,
    price: 4.99,
    icon: <Zap className="w-5 h-5" />,
    description: 'Perfect for trying out premium features'
  },
  {
    id: 'popular',
    name: 'Popular',
    tokens: 25,
    price: 9.99,
    originalPrice: 12.49,
    savings: '20%',
    popular: true,
    icon: <Star className="w-5 h-5" />,
    description: 'Most popular choice for regular users'
  },
  {
    id: 'power',
    name: 'Power',
    tokens: 60,
    price: 19.99,
    originalPrice: 29.94,
    savings: '33%',
    icon: <Crown className="w-5 h-5" />,
    description: 'Great value for power users'
  },
  {
    id: 'premium',
    name: 'Premium',
    tokens: 150,
    price: 39.99,
    originalPrice: 74.85,
    savings: '47%',
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Best value for professionals'
  }
];

const TokenPurchaseModal: React.FC<TokenPurchaseModalProps> = ({ isOpen, onClose }) => {
  const [selectedPackage, setSelectedPackage] = useState<string>('popular');
  const { processPayment, isProcessing } = useStripePayment();
  const { user } = useAuthStore();
  const { refreshBalance } = useTokenBalance();

  const handlePurchase = async () => {
    const packageData = tokenPackages.find(pkg => pkg.id === selectedPackage);
    if (!packageData || !user) return;

    const items = [{
      name: `${packageData.tokens} Tokens - ${packageData.name} Package`,
      description: `${packageData.description} | Remove watermarks from ${packageData.tokens} generated images`,
      amount: Math.round(packageData.price * 100), // Convert to cents
      quantity: 1
    }];

    await processPayment(items);
    
    // Refresh balance after successful payment
    setTimeout(() => {
      refreshBalance();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <DialogTitle className="text-2xl font-bold text-center text-gray-900">
            <Zap className="w-6 h-6 inline-block mr-2 text-yellow-500" />
            Purchase Tokens
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Remove watermarks and download high-quality versions of your AI art
          </p>
        </DialogHeader>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {tokenPackages.map((pkg) => (
              <div
                key={pkg.id}
                className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedPackage === pkg.id
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                } ${pkg.popular ? 'ring-2 ring-blue-500 ring-opacity-20' : ''}`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3 text-purple-600">
                    {pkg.icon}
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">
                    {pkg.name}
                  </h3>
                  
                  <div className="mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {pkg.tokens}
                    </span>
                    <span className="text-sm text-gray-600 ml-1">tokens</span>
                  </div>
                  
                  <div className="text-center mb-3">
                    <span className="text-2xl font-bold text-purple-600">
                      ${pkg.price}
                    </span>
                    {pkg.originalPrice && (
                      <div className="text-sm text-gray-500">
                        <span className="line-through">${pkg.originalPrice}</span>
                        <Badge variant="outline" className="ml-1 text-green-600 border-green-600">
                          Save {pkg.savings}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    {pkg.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-2 text-gray-900">Token Usage:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Standard Resolution (1024x1024): 3 tokens</li>
              <li>• HD Resolution (2048x2048): 4 tokens</li>
              <li>• Ultra HD Resolution (4096x4096): 5 tokens</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : `Purchase ${tokenPackages.find(p => p.id === selectedPackage)?.tokens} Tokens`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenPurchaseModal;
