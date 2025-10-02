
import React from 'react';
import { Zap, Plus } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useAuthStore } from '@/hooks/useAuthStore';

interface TokenBalanceProps {
  onPurchaseClick: () => void;
  className?: string;
}

const TokenBalance: React.FC<TokenBalanceProps> = ({ onPurchaseClick, className = "" }) => {
  const { balance, isLoading } = useTokenBalance();
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full">
        <Zap className="w-4 h-4 text-yellow-600 fill-yellow-500" />
        <span className="text-sm font-semibold text-yellow-800">
          {isLoading ? '...' : balance}
        </span>
      </div>
      <Button
        onClick={onPurchaseClick}
        size="sm"
        variant="outline"
        className="h-8 px-2 text-xs border-yellow-200 text-yellow-700 hover:bg-yellow-50"
      >
        <Plus className="w-3 h-3 mr-1" />
        Buy
      </Button>
    </div>
  );
};

export default TokenBalance;
