import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Shield, Lock } from "lucide-react";
import logo from "@/assets/logo.png";

const platformLinks = [
  { label: "Investment Plans", to: "/plans" },
  { label: "Copy Trading", to: "/copy-trading" },
  { label: "About Us", to: "/about" },
];

const supportLinks = [
  { label: "FAQ", to: "/faq" },
  { label: "Contact Us", to: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", to: "/privacy-policy" },
  { label: "Terms of Service", to: "/terms-of-service" },
  { label: "Risk Disclosure", to: "/risk-disclosure" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      {/* Main footer content */}
      <div className="container py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
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
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Platform</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              {platformLinks.map((link) => (
                <Link key={link.to} to={link.to} className="block hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-semibold mb-4 text-sm">Support</h4>
            <div className="space-y-2.5 text-sm text-muted-foreground">
              {supportLinks.map((link) => (
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

      {/* Trust badges */}
      <div className="border-t">
        <div className="container py-6">
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
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} AssetVault. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
