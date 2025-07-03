
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useToast } from '@/hooks/use-toast';

export const useTokenBalance = () => {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();
  const { toast } = useToast();

  const fetchBalance = async () => {
    if (!user) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching token balance:', error);
        setBalance(0);
      } else {
        setBalance(data?.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshBalance = () => {
    fetchBalance();
  };

  const spendTokens = async (amount: number) => {
    if (!user) return false;

    try {
      const { data } = await supabase.rpc('update_token_balance', {
        p_user_id: user.id,
        p_amount: -amount,
        p_type: 'spend',
        p_description: 'Watermark removal'
      });

      if (data && data[0]?.success) {
        setBalance(data[0].new_balance);
        return true;
      } else {
        toast({
          title: "Insufficient Tokens",
          description: "You don't have enough tokens for this action.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error spending tokens:', error);
      toast({
        title: "Error",
        description: "Failed to process token transaction.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  return {
    balance,
    isLoading,
    refreshBalance,
    spendTokens,
    hasTokens: balance > 0
  };
};
