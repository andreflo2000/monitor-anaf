import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type Tier = 'free' | 'starter' | 'pro' | 'agency'

export const TIER_LIMITS: Record<Tier, number> = {
  free: 3,
  starter: 25,
  pro: 200,
  agency: 999999,
}
