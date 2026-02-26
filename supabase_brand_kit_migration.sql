-- Migration Script: Add Brand Kits Table
-- This script creates a new table to store user-specific brand configurations
-- (logos, primary colors, and font styles) for video generation.

-- 1. Create the brand_kits table
CREATE TABLE IF NOT EXISTS public.brand_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#ffffff',
    font_family TEXT DEFAULT 'Inter',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Optional: Enable Row Level Security (RLS) if you are enforcing it on the client side
-- Note: If you only use Service Role keys in Next.js Server Actions/Inngest, RLS is bypassed anyway.
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own brand kit."
    ON public.brand_kits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own brand kit."
    ON public.brand_kits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own brand kit."
    ON public.brand_kits FOR UPDATE
    USING (auth.uid() = user_id);

-- 3. Trigger for updating the 'updated_at' timestamp (if not already existing in db)
-- (Assumes handle_updated_at function exists. Remove if it fails and you don't need accurate updated_at triggers).
-- CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.brand_kits
--   FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);
