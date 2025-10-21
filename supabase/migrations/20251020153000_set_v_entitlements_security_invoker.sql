-- Ensure v_entitlements executes with caller privileges to honor RLS
alter view if exists public.v_entitlements
  set (security_invoker = true);
