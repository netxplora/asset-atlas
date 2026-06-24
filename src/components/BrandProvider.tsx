import { useEffect } from "react";
import { useCmsBrandSettings } from "@/hooks/useCmsData";

// Helper to convert HEX to HSL (Tailwind format: "H S% L%")
function hexToHsl(hex: string): string | null {
  if (!hex || !hex.startsWith('#')) return null;
  
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  } else {
    return null;
  }

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Function to dynamically load a Google Font
const loadGoogleFont = (fontFamily: string) => {
  if (!fontFamily) return;
  const fontId = `google-font-${fontFamily.replace(/\s+/g, '-')}`;
  if (!document.getElementById(fontId)) {
    const link = document.createElement('link');
    link.id = fontId;
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { data: settings } = useCmsBrandSettings();

  useEffect(() => {
    if (!settings) return;

    const root = document.documentElement;

    // Apply Colors
    if (settings.primary_color) {
      const hsl = hexToHsl(settings.primary_color);
      if (hsl) root.style.setProperty('--primary', hsl);
    }
    if (settings.secondary_color) {
      const hsl = hexToHsl(settings.secondary_color);
      if (hsl) root.style.setProperty('--secondary', hsl);
    }
    if (settings.accent_color) {
      const hsl = hexToHsl(settings.accent_color);
      if (hsl) root.style.setProperty('--accent', hsl);
    }
    if (settings.success_color) {
      const hsl = hexToHsl(settings.success_color);
      if (hsl) root.style.setProperty('--success', hsl);
    }
    if (settings.warning_color) {
      const hsl = hexToHsl(settings.warning_color);
      if (hsl) root.style.setProperty('--warning', hsl);
    }
    if (settings.error_color) {
      const hsl = hexToHsl(settings.error_color);
      if (hsl) root.style.setProperty('--destructive', hsl);
    }

    // Apply Fonts
    if (settings.heading_font) {
      loadGoogleFont(settings.heading_font);
      root.style.setProperty('--font-heading', `"${settings.heading_font}", sans-serif`);
    }
    if (settings.body_font) {
      loadGoogleFont(settings.body_font);
      root.style.setProperty('--font-body', `"${settings.body_font}", sans-serif`);
    }

    // Apply Favicon
    if (settings.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = settings.favicon_url;
    }

  }, [settings]);

  return <>{children}</>;
}
