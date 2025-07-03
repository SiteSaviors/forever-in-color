
-- Create user_tokens table to track token balances
CREATE TABLE public.user_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create token_transactions table to track all token purchases and spending
CREATE TABLE public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'spend', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  description TEXT,
  stripe_session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create download_purchases table to track clean image downloads
CREATE TABLE public.download_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  style_id INTEGER NOT NULL,
  style_name TEXT NOT NULL,
  original_image_url TEXT NOT NULL,
  clean_image_url TEXT NOT NULL,
  resolution_tier TEXT NOT NULL CHECK (resolution_tier IN ('standard', 'hd', 'ultra_hd')),
  tokens_spent INTEGER NOT NULL,
  download_count INTEGER NOT NULL DEFAULT 0,
  last_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_tokens
CREATE POLICY "Users can view their own tokens" ON public.user_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens" ON public.user_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens" ON public.user_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for token_transactions
CREATE POLICY "Users can view their own transactions" ON public.token_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.token_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for download_purchases
CREATE POLICY "Users can view their own downloads" ON public.download_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own downloads" ON public.download_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own downloads" ON public.download_purchases
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_tokens_user_id ON public.user_tokens(user_id);
CREATE INDEX idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX idx_token_transactions_created_at ON public.token_transactions(created_at DESC);
CREATE INDEX idx_download_purchases_user_id ON public.download_purchases(user_id);
CREATE INDEX idx_download_purchases_created_at ON public.download_purchases(created_at DESC);

-- Function to automatically create token balance for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_tokens()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_tokens (user_id, balance)
  VALUES (NEW.id, 5); -- Give new users 5 free tokens
  
  INSERT INTO public.token_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.id, 'bonus', 5, 5, 'Welcome bonus - 5 free tokens');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create tokens for new users
CREATE TRIGGER on_auth_user_created_tokens
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_tokens();

-- Function to safely update token balance
CREATE OR REPLACE FUNCTION public.update_token_balance(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT,
  p_description TEXT DEFAULT NULL,
  p_stripe_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  transaction_id UUID
) AS $$
DECLARE
  current_balance INTEGER;
  new_bal INTEGER;
  trans_id UUID;
BEGIN
  -- Lock the user's token record
  SELECT balance INTO current_balance
  FROM public.user_tokens
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check if user has tokens record
  IF current_balance IS NULL THEN
    INSERT INTO public.user_tokens (user_id, balance)
    VALUES (p_user_id, 0);
    current_balance := 0;
  END IF;
  
  -- Calculate new balance
  new_bal := current_balance + p_amount;
  
  -- Prevent negative balance for spending
  IF p_type = 'spend' AND new_bal < 0 THEN
    RETURN QUERY SELECT FALSE, current_balance, NULL::UUID;
    RETURN;
  END IF;
  
  -- Update balance
  UPDATE public.user_tokens
  SET balance = new_bal, updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id, type, amount, balance_after, description, stripe_session_id, metadata
  ) VALUES (
    p_user_id, p_type, p_amount, new_bal, p_description, p_stripe_session_id, p_metadata
  ) RETURNING id INTO trans_id;
  
  RETURN QUERY SELECT TRUE, new_bal, trans_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
