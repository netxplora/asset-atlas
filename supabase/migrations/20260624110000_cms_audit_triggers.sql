-- Create a generic trigger function to log CMS activity into admin_audit_logs
CREATE OR REPLACE FUNCTION log_cms_activity()
RETURNS TRIGGER AS $$
DECLARE
    v_admin_id UUID;
    v_action TEXT;
    v_details JSONB;
BEGIN
    -- Get the admin_id from the auth context (auth.uid())
    v_admin_id := auth.uid();

    -- If no admin_id is present (e.g. executed via service role without impersonation), fallback to a system uuid or ignore.
    -- Assuming all CMS changes should be made by authenticated admins.
    IF v_admin_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Determine the action type
    IF TG_OP = 'INSERT' THEN
        v_action := 'CREATED_' || UPPER(TG_TABLE_NAME);
        v_details := jsonb_build_object('record_id', NEW.id, 'table', TG_TABLE_NAME, 'new_data', row_to_json(NEW));
    ELSIF TG_OP = 'UPDATE' THEN
        v_action := 'UPDATED_' || UPPER(TG_TABLE_NAME);
        v_details := jsonb_build_object('record_id', NEW.id, 'table', TG_TABLE_NAME, 'changes', row_to_json(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        v_action := 'DELETED_' || UPPER(TG_TABLE_NAME);
        v_details := jsonb_build_object('record_id', OLD.id, 'table', TG_TABLE_NAME, 'old_data', row_to_json(OLD));
        
        INSERT INTO public.admin_audit_logs (admin_id, target_id, action, details)
        VALUES (v_admin_id, OLD.id::text, v_action, v_details);
        
        RETURN OLD;
    END IF;

    -- For App Settings, the primary key is 'key' not 'id'
    IF TG_TABLE_NAME = 'app_settings' THEN
        IF TG_OP = 'DELETE' THEN
             v_details := jsonb_build_object('record_id', OLD.key, 'table', TG_TABLE_NAME, 'old_data', row_to_json(OLD));
             INSERT INTO public.admin_audit_logs (admin_id, target_id, action, details) VALUES (v_admin_id, OLD.key, v_action, v_details);
             RETURN OLD;
        ELSE
             v_details := jsonb_build_object('record_id', NEW.key, 'table', TG_TABLE_NAME, 'new_data', row_to_json(NEW));
             INSERT INTO public.admin_audit_logs (admin_id, target_id, action, details) VALUES (v_admin_id, NEW.key, v_action, v_details);
             RETURN NEW;
        END IF;
    END IF;

    -- Insert the audit log for standard tables
    INSERT INTO public.admin_audit_logs (admin_id, target_id, action, details)
    VALUES (v_admin_id, NEW.id::text, v_action, v_details);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers to CMS Tables
DROP TRIGGER IF EXISTS trg_audit_cms_pages ON public.cms_pages;
CREATE TRIGGER trg_audit_cms_pages
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_pages
    FOR EACH ROW EXECUTE FUNCTION log_cms_activity();

DROP TRIGGER IF EXISTS trg_audit_cms_faqs ON public.cms_faqs;
CREATE TRIGGER trg_audit_cms_faqs
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_faqs
    FOR EACH ROW EXECUTE FUNCTION log_cms_activity();

DROP TRIGGER IF EXISTS trg_audit_cms_blog_posts ON public.cms_blog_posts;
CREATE TRIGGER trg_audit_cms_blog_posts
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_blog_posts
    FOR EACH ROW EXECUTE FUNCTION log_cms_activity();

DROP TRIGGER IF EXISTS trg_audit_cms_announcements ON public.cms_announcements;
CREATE TRIGGER trg_audit_cms_announcements
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_announcements
    FOR EACH ROW EXECUTE FUNCTION log_cms_activity();

DROP TRIGGER IF EXISTS trg_audit_cms_brand_settings ON public.cms_brand_settings;
CREATE TRIGGER trg_audit_cms_brand_settings
    AFTER INSERT OR UPDATE OR DELETE ON public.cms_brand_settings
    FOR EACH ROW EXECUTE FUNCTION log_cms_activity();

DROP TRIGGER IF EXISTS trg_audit_app_settings ON public.app_settings;
CREATE TRIGGER trg_audit_app_settings
    AFTER INSERT OR UPDATE OR DELETE ON public.app_settings
    FOR EACH ROW EXECUTE FUNCTION log_cms_activity();
