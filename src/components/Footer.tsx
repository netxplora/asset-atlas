import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Shield, Lock, Globe, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.png";

const companyLinks = [
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Blog", to: "/blog" },
];

const investmentLinks = [
  { label: "Investment Plans", to: "/plans" },
  { label: "Copy Trading", to: "/copy-trading" },
];

const resourceLinks = [
  { label: "FAQ", to: "/faq" },
  { label: "Security Center", to: "/security" },
  { label: "Trust & Transparency", to: "/trust" },
  { label: "Education Center", to: "/education" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Risk Disclosure", to: "/risk-disclosure" },
];

const socialLinks = [
  { label: "Twitter", href: "#" },
  { label: "LinkedIn", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Main footer content */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 font-heading font-bold text-xl mb-4">
              <img src={logo} alt="AssetVault" className="h-10 md:h-12 w-auto object-contain" />
              AssetVault
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Professional digital asset brokerage platform for Forex, Crypto, and Commodities investments.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-primary" />
                <span>support@assetvault.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-primary" />
                <span>+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span>New York, NY</span>
              </div>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Company</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              {companyLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Investments */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Investments</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              {investmentLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Resources</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              {resourceLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Legal</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              {legalLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trust badges & disclaimer */}
      <div className="border-t">
        <div className="container py-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-success" />
                <span>256-bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Lock className="h-4 w-4 text-success" />
                <span>2FA Protected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4 text-success" />
                <span>120+ Countries</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AssetVault. All rights reserved.
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground/70 leading-relaxed text-center sm:text-left">
            <strong>Risk Warning:</strong> Trading and investing in financial instruments involves significant risk and may not be suitable for all investors. Past performance is not indicative of future results. You should carefully consider your investment objectives, level of experience, and risk appetite before making any investment decisions. Only invest funds that you can afford to lose. Please read our <Link to="/risk-disclosure" className="underline hover:text-foreground">Risk Disclosure</Link> for more information.
          </p>
        </div>
      </div>
    </footer>
  );
}
