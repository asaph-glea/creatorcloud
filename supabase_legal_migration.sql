-- Supabase/Neon SQL Migration for Creator Cloud Legal Compliance

-- 1. Add fields to track Legal Term Acceptance and AI Consent
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS accepted_terms_version VARCHAR(50),
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ai_consent BOOLEAN DEFAULT FALSE;

-- Optional: Create an index on ai_consent if queried frequently during job processing
CREATE INDEX IF NOT EXISTS idx_users_ai_consent ON public.users(ai_consent);
