
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './useAuthStore';

interface TokenBalance {
  balance: number;
  loading: boolean;
  error: string | null;
}

interface TokenTransaction {
  id: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export const useTokenBalance = () => {
  const [tokenData, setTokenData] = useState<TokenBalance>({
    balance: 0,
    loading: true,
    error: null
  });
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const { user } = useAuthStore();

  const fetchBalance = async () => {
    if (!user) {
      setTokenData({ balance: 0, loading: false, error: null });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setTokenData({
        balance: data?.balance || 0,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setTokenData({
        balance: 0,
        loading: false,
        error: 'Failed to load token balance'
      });
    }
  };

  const fetchTransactions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const spendTokens = async (amount: number, description: string, metadata: any = {}) => {
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.rpc('update_token_balance', {
      p_user_id: user.id,
      p_amount: -amount,
      p_type: 'spend',
      p_description: description,
      p_metadata: metadata
    });

    if (error) throw error;

    const result = data[0];
    if (!result.success) {
      throw new Error('Insufficient tokens');
    }

    // Refresh balance after spending
    await fetchBalance();
    await fetchTransactions();

    return result;
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
  }, [user]);

  return {
    balance: tokenData.balance,
    loading: tokenData.loading,
    error: tokenData.error,
    transactions,
    spendTokens,
    refreshBalance: fetchBalance,
    refreshTransactions: fetchTransactions
  };
};
