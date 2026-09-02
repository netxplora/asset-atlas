import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, ShieldCheck, Lock, Globe, ArrowUpRight } from "lucide-react";
import logo from "@/assets/logo.png";

const platformLinks = [
  { label: "Investment Plans", to: "/plans" },
  { label: "Copy Trading", to: "/copy-trading" },
  { label: "Security Center", to: "/security" },
  { label: "Trust & Transparency", to: "/trust" },
];

const resourceLinks = [
  { label: "Education Center", to: "/education" },
  { label: "Frequently Asked Questions", to: "/faq" },
  { label: "Market Insights Blog", to: "/blog" },
  { label: "Help & Support", to: "/contact" },
];

const companyLinks = [
  { label: "About AssetVault", to: "/about" },
  { label: "Contact Us", to: "/contact" },
  { label: "Security Practices", to: "/security" },
  { label: "Investor Portal", to: "/login" },
];

const legalLinks = [
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Risk Disclosure", to: "/risk-disclosure" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-card text-card-foreground">
      {/* Main Footer Content */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand & Overview */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 font-heading font-bold text-xl tracking-tight">
              <img src={logo} alt="AssetVault logo" className="h-9 w-auto object-contain" />
              <span>Asset<span className="text-primary">Vault</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              AssetVault is a professional digital asset brokerage platform providing direct access to managed investment strategies across Forex, Cryptocurrency, and Commodities markets.
            </p>
            <div className="space-y-2 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@assetvault.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 (800) 277-3882</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Financial District, New York, NY 10005</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Platform
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {platformLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Resources
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {resourceLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal & Governance */}
          <div className="space-y-3">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-foreground">
              Legal & Compliance
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Security Pillars Bar */}
      <div className="border-t bg-muted/30">
        <div className="container py-4">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <ShieldCheck className="h-4 w-4 text-success" />
                <span>256-Bit SSL Encryption</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Lock className="h-4 w-4 text-success" />
                <span>Two-Factor Authentication</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <Globe className="h-4 w-4 text-success" />
                <span>Segregated Client Accounts</span>
              </div>
            </div>
            <div>
              <span>© {currentYear} AssetVault Platform. All rights reserved.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Risk Warning */}
      <div className="border-t bg-muted/60">
        <div className="container py-4">
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed text-left">
            <strong className="text-foreground">Risk Warning:</strong> Trading and investing in digital assets, foreign exchange, and commodity contracts carries financial risk. Asset values fluctuate based on market conditions. Past performance is not a guarantee of future returns. Carefully consider your investment objectives and risk tolerance prior to committing capital. For detailed policies, review our <Link to="/risk-disclosure" className="underline hover:text-primary">Risk Disclosure Notice</Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
