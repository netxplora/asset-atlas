import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

const SITE_NAME = "AssetVault";
const BASE_URL = "https://assetvault.com"; // Update with actual domain

/**
 * SEOHead — A reusable component for managing page-level <head> tags.
 * Provides consistent title formatting, meta descriptions, and Open Graph tags.
 */
export function SEOHead({
  title,
  description = "AssetVault is a secure online platform for managing investments, copy trading, and portfolio tracking.",
  path = "",
  noIndex = false,
}: SEOHeadProps) {
  const formattedTitle = title ? `${title} — ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={formattedTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={formattedTitle} />
      <meta name="twitter:description" content={description} />

      {noIndex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
