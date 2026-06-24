-- ============================================================
-- CMS & BRAND MANAGEMENT FOUNDATION
-- Creates all necessary tables, RLS policies, and storage for the CMS.
-- ============================================================

-- 1. Brand & Company Settings (Single row expected)
CREATE TABLE IF NOT EXISTS public.cms_brand_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL DEFAULT 'AssetVault',
    trading_name TEXT,
    description TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    address TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    support_email TEXT,
    compliance_email TEXT,
    website_url TEXT,
    
    -- Logos
    primary_logo_url TEXT,
    light_logo_url TEXT,
    dark_logo_url TEXT,
    icon_logo_url TEXT,
    favicon_url TEXT,
    email_logo_url TEXT,

    -- Colors (Hex codes)
    primary_color TEXT DEFAULT '#0f172a',
    secondary_color TEXT DEFAULT '#d4af37',
    accent_color TEXT DEFAULT '#10b981',
    success_color TEXT DEFAULT '#22c55e',
    warning_color TEXT DEFAULT '#eab308',
    error_color TEXT DEFAULT '#ef4444',
    
    -- Typography
    heading_font TEXT DEFAULT 'Inter',
    body_font TEXT DEFAULT 'Inter',
    
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 2. SEO Global Settings
CREATE TABLE IF NOT EXISTS public.cms_seo_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_title TEXT NOT NULL DEFAULT 'AssetVault',
    site_description TEXT,
    global_keywords TEXT,
    default_og_image_url TEXT,
    twitter_handle TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 3. Pages (Custom and Standard)
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    scheduled_at TIMESTAMPTZ,
    
    -- Page Specific SEO
    meta_title TEXT,
    meta_description TEXT,
    canonical_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    author_id UUID REFERENCES auth.users(id)
);

-- 4. Homepage Sections
CREATE TABLE IF NOT EXISTS public.cms_homepage_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_name TEXT NOT NULL UNIQUE, -- e.g., 'hero', 'stats', 'features'
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 5. Testimonials
CREATE TABLE IF NOT EXISTS public.cms_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investor_name TEXT NOT NULL,
    investor_photo_url TEXT,
    investor_country TEXT,
    testimonial TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Trust Indicators & Partners
CREATE TABLE IF NOT EXISTS public.cms_trust_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    logo_url TEXT NOT NULL,
    link_url TEXT,
    indicator_type TEXT DEFAULT 'partner' CHECK (indicator_type IN ('partner', 'security', 'certification')),
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0
);

-- 7. Blog Categories & Posts
CREATE TABLE IF NOT EXISTS public.cms_blog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS public.cms_blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    category_id UUID REFERENCES public.cms_blog_categories(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    scheduled_at TIMESTAMPTZ,
    tags TEXT[],
    
    meta_title TEXT,
    meta_description TEXT,
    
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    author_id UUID REFERENCES auth.users(id)
);

-- 8. FAQs
CREATE TABLE IF NOT EXISTS public.cms_faq_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.cms_faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.cms_faq_categories(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- 9. Announcements & Popups
CREATE TABLE IF NOT EXISTS public.cms_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'promotion')),
    display_location TEXT DEFAULT 'dashboard' CHECK (display_location IN ('dashboard', 'homepage', 'banner', 'popup')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'expired')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id)
);

-- 10. Legal Documents
CREATE TABLE IF NOT EXISTS public.cms_legal_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_type TEXT NOT NULL CHECK (document_type IN ('terms', 'privacy', 'risk', 'aml', 'kyc')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    version TEXT NOT NULL,
    effective_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- 11. CMS Audit Logs
CREATE TABLE IF NOT EXISTS public.cms_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    previous_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Rule: Public can SELECT active/published. Admins can do ALL.
-- ==========================================

-- Enable RLS
ALTER TABLE public.cms_brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_trust_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper Function for Admin Check
-- Assuming public.has_role(auth.uid(), 'admin') exists from previous migrations.

-- Read Policies (Public)
CREATE POLICY "Public read brand settings" ON public.cms_brand_settings FOR SELECT USING (true);
CREATE POLICY "Public read seo settings" ON public.cms_seo_settings FOR SELECT USING (true);
CREATE POLICY "Public read published pages" ON public.cms_pages FOR SELECT USING (status = 'published');
CREATE POLICY "Public read active homepage sections" ON public.cms_homepage_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active testimonials" ON public.cms_testimonials FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active trust indicators" ON public.cms_trust_indicators FOR SELECT USING (is_active = true);
CREATE POLICY "Public read blog categories" ON public.cms_blog_categories FOR SELECT USING (true);
CREATE POLICY "Public read published blog posts" ON public.cms_blog_posts FOR SELECT USING (status = 'published');
CREATE POLICY "Public read faq categories" ON public.cms_faq_categories FOR SELECT USING (true);
CREATE POLICY "Public read active faqs" ON public.cms_faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Public read active announcements" ON public.cms_announcements FOR SELECT USING (status = 'active' AND (start_date IS NULL OR start_date <= now()) AND (end_date IS NULL OR end_date >= now()));
CREATE POLICY "Public read published legal docs" ON public.cms_legal_documents FOR SELECT USING (status = 'published');

-- Write Policies (Admins Only)
CREATE POLICY "Admins manage brand settings" ON public.cms_brand_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage seo settings" ON public.cms_seo_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage pages" ON public.cms_pages FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage homepage sections" ON public.cms_homepage_sections FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage testimonials" ON public.cms_testimonials FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage trust indicators" ON public.cms_trust_indicators FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage blog categories" ON public.cms_blog_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage blog posts" ON public.cms_blog_posts FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage faq categories" ON public.cms_faq_categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage faqs" ON public.cms_faqs FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage announcements" ON public.cms_announcements FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage legal docs" ON public.cms_legal_documents FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Audit Logs Policies (Admins read/insert)
CREATE POLICY "Admins view audit logs" ON public.cms_audit_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert audit logs" ON public.cms_audit_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ==========================================
-- STORAGE BUCKET FOR CMS ASSETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cms_media', 'cms_media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access to CMS Media" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'cms_media' );

CREATE POLICY "Admins can upload CMS Media" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'cms_media' AND public.has_role(auth.uid(), 'admin') );

CREATE POLICY "Admins can update CMS Media" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'cms_media' AND public.has_role(auth.uid(), 'admin') );

CREATE POLICY "Admins can delete CMS Media" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'cms_media' AND public.has_role(auth.uid(), 'admin') );

-- ==========================================
-- INITIAL DATA SEEDING
-- ==========================================
INSERT INTO public.cms_brand_settings (company_name) VALUES ('AssetVault') ON CONFLICT DO NOTHING;
INSERT INTO public.cms_seo_settings (site_title) VALUES ('AssetVault') ON CONFLICT DO NOTHING;
