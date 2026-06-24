import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ==========================================
// TYPES
// ==========================================

export interface CmsBrandSettings {
  id: string;
  company_name: string;
  trading_name?: string;
  description?: string;
  mission_statement?: string;
  vision_statement?: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  support_email?: string;
  compliance_email?: string;
  website_url?: string;
  primary_logo_url?: string;
  light_logo_url?: string;
  dark_logo_url?: string;
  icon_logo_url?: string;
  favicon_url?: string;
  email_logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  success_color?: string;
  warning_color?: string;
  error_color?: string;
  heading_font?: string;
  body_font?: string;
  updated_at: string;
  updated_by?: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  content?: string;
  status: 'draft' | 'published' | 'scheduled';
  scheduled_at?: string;
  meta_title?: string;
  meta_description?: string;
  canonical_url?: string;
  created_at: string;
  updated_at: string;
  author_id?: string;
}

export interface CmsBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  featured_image_url?: string;
  category_id?: string;
  status: 'draft' | 'published' | 'scheduled';
  published_at?: string;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
  author_id?: string;
}

export interface CmsFaq {
  id: string;
  question: string;
  answer: string;
  category?: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CmsAnnouncement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// BRAND & SEO SETTINGS
// ==========================================

export const useCmsBrandSettings = () => {
  return useQuery({
    queryKey: ["cmsBrandSettings"],
    queryFn: async (): Promise<CmsBrandSettings | null> => {
      const { data, error } = await (supabase as any).from("cms_brand_settings").select("*").limit(1).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
};

export const useUpdateCmsBrandSettings = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (updates: any) => {
      // Upsert pattern since there's only 1 row
      const { data: existing } = await (supabase as any).from("cms_brand_settings").select("id").limit(1).maybeSingle();
      
      let error;
      if (existing?.id) {
        ({ error } = await (supabase as any).from("cms_brand_settings").update({ ...updates, updated_by: user?.id, updated_at: new Date().toISOString() }).eq("id", existing.id));
      } else {
        ({ error } = await (supabase as any).from("cms_brand_settings").insert({ ...updates, updated_by: user?.id }));
      }
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsBrandSettings"] });
      toast.success("Brand settings updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update brand settings"),
  });
};

// ==========================================
// PAGES & CONTENT
// ==========================================

export const useCmsPages = (isAdmin = false) => {
  return useQuery({
    queryKey: ["cmsPages", isAdmin],
    queryFn: async (): Promise<CmsPage[]> => {
      const query = (supabase as any).from("cms_pages").select("*").order("created_at", { ascending: false });
      if (!isAdmin) {
        query.eq("status", "published");
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCmsPageBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["cmsPage", slug],
    queryFn: async (): Promise<CmsPage | null> => {
      const { data, error } = await (supabase as any).from("cms_pages").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useCmsPageBySlugAdmin = (slug: string) => {
  return useQuery({
    queryKey: ["cmsPageAdmin", slug],
    queryFn: async (): Promise<CmsPage | null> => {
      const { data, error } = await (supabase as any).from("cms_pages").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useUpdateCmsPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (page: Partial<CmsPage>) => {
      let error;
      if (page.id) {
        ({ error } = await (supabase as any).from("cms_pages").update({ ...page, updated_at: new Date().toISOString() }).eq("id", page.id));
      } else {
        ({ error } = await (supabase as any).from("cms_pages").insert(page));
      }
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      queryClient.invalidateQueries({ queryKey: ["cmsPage"] });
      queryClient.invalidateQueries({ queryKey: ["cmsPageAdmin"] });
      toast.success("Page saved successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save page"),
  });
};

export const useDeleteCmsPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("cms_pages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsPages"] });
      toast.success("Page deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete page"),
  });
};

// ==========================================
// MEDIA UPLOADS
// ==========================================

export const useUploadCmsMedia = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("cms_media").upload(path, file);
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from("cms_media").getPublicUrl(path);
      return urlData.publicUrl;
    },
    onError: (err: any) => toast.error(err.message || "Failed to upload media"),
  });
};

// ==========================================
// APP SETTINGS (KEY-VALUE JSON STORE)
// ==========================================

export const useAppSettings = (key: string) => {
  return useQuery({
    queryKey: ["appSettings", key],
    queryFn: async () => {
      const { data, error } = await supabase.from("app_settings").select("value").eq("key", key).maybeSingle();
      if (error) throw error;
      if (data?.value) {
        try {
          return JSON.parse(data.value);
        } catch (e) {
          return data.value;
        }
      }
      return null;
    },
    enabled: !!key,
  });
};

export const useUpdateAppSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value);
      
      const { data: existing } = await supabase.from("app_settings").select("key").eq("key", key).maybeSingle();
      
      let error;
      if (existing?.key) {
        ({ error } = await supabase.from("app_settings").update({ value: stringValue, updated_at: new Date().toISOString() }).eq("key", key));
      } else {
        ({ error } = await supabase.from("app_settings").insert({ key, value: stringValue }));
      }
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appSettings", variables.key] });
      toast.success("Settings updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update settings"),
  });
};

// ==========================================
// FAQS
// ==========================================

export const useCmsFaqs = (adminView = false) => {
  return useQuery({
    queryKey: ["cmsFaqs", adminView],
    queryFn: async (): Promise<CmsFaq[]> => {
      let query = (supabase as any).from("cms_faqs").select("*").order("sort_order", { ascending: true });
      if (!adminView) {
        query = query.eq("is_published", true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpdateCmsFaq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (faq: Partial<CmsFaq>) => {
      let error;
      if (faq.id) {
        ({ error } = await (supabase as any).from("cms_faqs").update({ ...faq, updated_at: new Date().toISOString() }).eq("id", faq.id));
      } else {
        ({ error } = await (supabase as any).from("cms_faqs").insert(faq));
      }
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsFaqs"] });
      toast.success("FAQ saved successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save FAQ"),
  });
};

export const useDeleteCmsFaq = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("cms_faqs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsFaqs"] });
      toast.success("FAQ deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete FAQ"),
  });
};

// ==========================================
// BLOG POSTS
// ==========================================

export const useCmsBlogs = (adminView = false) => {
  return useQuery({
    queryKey: ["cmsBlogs", adminView],
    queryFn: async (): Promise<CmsBlogPost[]> => {
      let query = (supabase as any).from("cms_blog_posts").select("*").order("created_at", { ascending: false });
      if (!adminView) {
        query = query.eq("status", "published");
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useCmsBlogBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["cmsBlog", slug],
    queryFn: async (): Promise<CmsBlogPost | null> => {
      const { data, error } = await (supabase as any).from("cms_blog_posts").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });
};

export const useUpdateCmsBlog = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (post: Partial<CmsBlogPost>) => {
      let error;
      if (post.id) {
        ({ error } = await (supabase as any).from("cms_blog_posts").update({ ...post, updated_at: new Date().toISOString() }).eq("id", post.id));
      } else {
        ({ error } = await (supabase as any).from("cms_blog_posts").insert({ ...post, author_id: user?.id }));
      }
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsBlogs"] });
      queryClient.invalidateQueries({ queryKey: ["cmsBlog"] });
      toast.success("Blog post saved successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save blog post"),
  });
};

export const useDeleteCmsBlog = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("cms_blog_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsBlogs"] });
      toast.success("Blog post deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete blog post"),
  });
};

// ==========================================
// ANNOUNCEMENTS
// ==========================================

export const useCmsAnnouncements = (adminView = false) => {
  return useQuery({
    queryKey: ["cmsAnnouncements", adminView],
    queryFn: async (): Promise<CmsAnnouncement[]> => {
      let query = (supabase as any).from("cms_announcements").select("*").order("created_at", { ascending: false });
      if (!adminView) {
        query = query.eq("is_active", true);
        // Could also filter by dates here if needed, but RLS or client-side filtering can handle it.
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });
};

export const useUpdateCmsAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (announcement: Partial<CmsAnnouncement>) => {
      let error;
      if (announcement.id) {
        ({ error } = await (supabase as any).from("cms_announcements").update({ ...announcement, updated_at: new Date().toISOString() }).eq("id", announcement.id));
      } else {
        ({ error } = await (supabase as any).from("cms_announcements").insert(announcement));
      }
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsAnnouncements"] });
      toast.success("Announcement saved successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to save announcement"),
  });
};

export const useDeleteCmsAnnouncement = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("cms_announcements").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cmsAnnouncements"] });
      toast.success("Announcement deleted successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to delete announcement"),
  });
};
