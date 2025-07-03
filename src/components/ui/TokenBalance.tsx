
import { Coins, Plus, TrendingUp } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useState } from 'react';
import TokenPurchaseModal from './TokenPurchaseModal';

interface TokenBalanceProps {
  showPurchaseButton?: boolean;
  variant?: 'compact' | 'full';
  className?: string;
}

const TokenBalance = ({ 
  showPurchaseButton = true, 
  variant = 'compact',
  className = '' 
}: TokenBalanceProps) => {
  const { balance, loading, error } = useTokenBalance();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-2 text-red-500 ${className}`}>
        <Coins className="w-4 h-4" />
        <span className="text-sm">Error</span>
      </div>
    );
  }

  const isLowBalance = balance < 3;

  if (variant === 'compact') {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center gap-1">
            <Coins className={`w-4 h-4 ${isLowBalance ? 'text-amber-500' : 'text-purple-600'}`} />
            <span className={`text-sm font-semibold ${isLowBalance ? 'text-amber-600' : 'text-gray-900'}`}>
              {balance}
            </span>
          </div>
          {isLowBalance && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
              Low
            </Badge>
          )}
          {showPurchaseButton && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowPurchaseModal(true)}
              className="p-1 h-6 w-6 rounded-full border-purple-200 hover:border-purple-300"
            >
              <Plus className="w-3 h-3 text-purple-600" />
            </Button>
          )}
        </div>
        <TokenPurchaseModal 
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
        />
      </>
    );
  }

  return (
    <>
      <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Token Balance</p>
              <p className="text-2xl font-bold text-gray-900">{balance}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isLowBalance && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                <TrendingUp className="w-3 h-3 mr-1" />
                Low Balance
              </Badge>
            )}
            {showPurchaseButton && (
              <Button
                onClick={() => setShowPurchaseModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Buy Tokens
              </Button>
            )}
          </div>
        </div>
      </div>
      <TokenPurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />
    </>
  );
};

export default TokenBalance;
