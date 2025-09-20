-- Fix search_path security issues in database functions
-- Update handle_new_user_tokens function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user_tokens()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.user_tokens (user_id, balance)
  VALUES (NEW.id, 5); -- Give new users 5 free tokens
  
  INSERT INTO public.token_transactions (user_id, type, amount, balance_after, description)
  VALUES (NEW.id, 'bonus', 5, 5, 'Welcome bonus - 5 free tokens');
  
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function with secure search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email,
    new.raw_user_meta_data ->> 'full_name'
  );
  RETURN new;
END;
$function$;

-- Update update_token_balance function with secure search_path
CREATE OR REPLACE FUNCTION public.update_token_balance(p_user_id uuid, p_amount integer, p_type text, p_description text DEFAULT NULL::text, p_stripe_session_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(success boolean, new_balance integer, transaction_id uuid)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
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
$function$;