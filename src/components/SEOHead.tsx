import { Helmet } from "react-helmet-async";
import { useAppSettings, useCmsBrandSettings } from "@/hooks/useCmsData";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function SEOHead({
  title,
  description,
  path = "",
  noIndex = false,
}: SEOHeadProps) {
  const { data: brandSettings } = useCmsBrandSettings();
  const { data: seoSettingsStr } = useAppSettings("seo_settings");
  
  let globalSeo: any = {
    default_title: "AssetVault",
    default_description: "AssetVault is a secure online platform for managing investments, copy trading, and portfolio tracking.",
    default_keywords: "crypto, forex, commodities, investing"
  };

  if (seoSettingsStr) {
    try {
      globalSeo = JSON.parse(seoSettingsStr);
    } catch (e) {
      console.error(e);
    }
  }

  const siteName = globalSeo.default_title || brandSettings?.company_name || "AssetVault";
  const baseUrl = brandSettings?.website_url || "https://assetvault.com";
  
  const formattedTitle = title ? `${title} — ${siteName}` : siteName;
  const activeDescription = description || globalSeo.default_description;
  const canonicalUrl = `${baseUrl}${path}`;

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta name="description" content={activeDescription} />
      <meta name="keywords" content={globalSeo.default_keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={activeDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="website" />
      {brandSettings?.primary_logo_url && <meta property="og:image" content={brandSettings.primary_logo_url} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={activeDescription} />
      {brandSettings?.primary_logo_url && <meta name="twitter:image" content={brandSettings.primary_logo_url} />}

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
