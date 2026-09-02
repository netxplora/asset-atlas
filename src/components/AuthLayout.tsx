import { Link } from "react-router-dom";
import heroMain from "@/assets/hero-main.jpg";
import logo from "@/assets/logo.png";
import { ArrowLeft, ShieldCheck, Lock, Wallet, BarChart3, CheckCircle2 } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      <SEOHead title={title} description={subtitle} />

      {/* Brand & Value Panel (Desktop) */}
      <div className="hidden lg:flex relative bg-slate-950 flex-col justify-between p-12 overflow-hidden text-white border-r border-border/40">
        <img
          src={heroMain}
          alt="AssetVault digital asset management"
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 font-heading font-bold text-2xl tracking-tight text-white hover:opacity-90 transition-opacity">
            <img src={logo} alt="AssetVault logo" className="h-8 w-auto object-contain" />
            <span>Asset<span className="text-primary">Vault</span></span>
          </Link>
        </div>

        {/* Trust Highlights */}
        <div className="relative z-10 max-w-md space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15">
              Investor Security Standard
            </div>
            <h2 className="text-3xl font-heading font-bold text-white leading-snug">
              Professional Digital Asset & Investment Management
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Access fixed-term investment plans and verified copy trading across Forex, Cryptocurrency, and Commodities.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/15">
            {[
              "Segregated client accounts separate from corporate operations",
              "Multi-signature offline cold custody for digital assets",
              "Direct cryptocurrency deposits with on-chain verification",
              "24/7 dedicated support via live chat and email",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-xs text-slate-400">
          <span>© {new Date().getFullYear()} AssetVault Platform. Protected by 256-bit SSL encryption.</span>
        </div>
      </div>

      {/* Form Area Panel */}
      <div className="flex flex-col flex-1">
        <div className="p-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[420px] space-y-6">
            <div className="space-y-1.5 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
