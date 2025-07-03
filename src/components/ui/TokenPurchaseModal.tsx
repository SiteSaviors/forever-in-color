
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Coins, Star, Zap, Crown } from 'lucide-react';
import { useStripePayment } from '@/components/product/hooks/useStripePayment';

interface TokenPackage {
  id: string;
  tokens: number;
  price: number;
  originalPrice?: number;
  badge?: string;
  popular?: boolean;
  icon: React.ReactNode;
  description: string;
}

const tokenPackages: TokenPackage[] = [
  {
    id: 'starter',
    tokens: 10,
    price: 4.99,
    icon: <Coins className="w-5 h-5" />,
    description: 'Perfect for trying out our AI art styles'
  },
  {
    id: 'popular',
    tokens: 25,
    price: 9.99,
    originalPrice: 12.48,
    badge: 'Most Popular',
    popular: true,
    icon: <Star className="w-5 h-5" />,
    description: 'Great value for regular users'
  },
  {
    id: 'power',
    tokens: 60,
    price: 19.99,
    originalPrice: 29.94,
    badge: 'Best Value',
    icon: <Zap className="w-5 h-5" />,
    description: 'For power users and professionals'
  },
  {
    id: 'unlimited',
    tokens: 150,
    price: 39.99,
    originalPrice: 74.85,
    badge: 'Premium',
    icon: <Crown className="w-5 h-5" />,
    description: 'Maximum value for studios and teams'
  }
];

interface TokenPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TokenPurchaseModal = ({ isOpen, onClose }: TokenPurchaseModalProps) => {
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const { processPayment, isProcessing } = useStripePayment();

  const handlePurchase = async (packageData: TokenPackage) => {
    try {
      const items = [{
        name: `${packageData.tokens} Tokens`,
        description: packageData.description,
        amount: Math.round(packageData.price * 100), // Convert to cents
        quantity: 1,
        metadata: {
          package_id: packageData.id,
          token_amount: packageData.tokens
        }
      }];

      await processPayment(items);
      onClose();
    } catch (error) {
      console.error('Token purchase failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Choose Your Token Package
          </DialogTitle>
          <p className="text-center text-gray-600 mt-2">
            Unlock the full potential of our AI art platform with premium tokens
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {tokenPackages.map((pkg) => (
            <div
              key={pkg.id}
              className={`relative border rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                pkg.popular 
                  ? 'border-purple-200 bg-gradient-to-b from-purple-50 to-pink-50 shadow-md' 
                  : 'border-gray-200 hover:border-purple-200'
              } ${
                selectedPackage?.id === pkg.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {pkg.badge && (
                <Badge 
                  className={`absolute -top-2 left-1/2 transform -translate-x-1/2 ${
                    pkg.popular 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  }`}
                >
                  {pkg.badge}
                </Badge>
              )}

              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-4 ${
                  pkg.popular 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {pkg.icon}
                </div>

                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {pkg.tokens}
                </h3>
                <p className="text-sm text-gray-600 mb-3">Tokens</p>

                <div className="mb-4">
                  <div className="text-2xl font-bold text-gray-900">
                    ${pkg.price}
                  </div>
                  {pkg.originalPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      ${pkg.originalPrice}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    ${(pkg.price / pkg.tokens).toFixed(2)} per token
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  {pkg.description}
                </p>

                <Button
                  className={`w-full ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePurchase(pkg);
                  }}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Secure payment powered by Stripe • Instant token delivery</p>
          <p>All purchases are final • Tokens never expire</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenPurchaseModal;
