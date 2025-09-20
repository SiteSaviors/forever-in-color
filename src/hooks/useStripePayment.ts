
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentItem {
  name: string;
  description: string;
  amount: number; // in cents
  quantity?: number;
}

interface TokenPurchaseItem {
  tokens: number;
  amount: number; // in dollars
  packageName: string;
}

interface UseStripePaymentProps {
  customerEmail?: string;
}

export const useStripePayment = ({ customerEmail }: UseStripePaymentProps = {}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processPayment = async (items: PaymentItem[]) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing payment for items:', items);
      
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: items.reduce((total, item) => total + (item.amount * (item.quantity || 1)), 0),
          currency: 'usd',
          customerEmail: customerEmail || 'guest@example.com',
          items: items
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout in a new tab...",
        });
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processTokenPurchase = async (item: TokenPurchaseItem) => {
    setIsProcessing(true);
    
    try {
      console.log('Processing token purchase:', item);
      
      const { data, error } = await supabase.functions.invoke('purchase-tokens', {
        body: item
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
        
        toast({
          title: "Redirecting to Payment",
          description: "Opening Stripe checkout for token purchase...",
        });
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Token purchase error:', error);
      toast({
        title: "Purchase Error",
        description: "Failed to process token purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processPayment,
    processTokenPurchase,
    isProcessing
  };
};
