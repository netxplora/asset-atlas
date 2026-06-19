import { Link } from "react-router-dom";
import heroMain from "@/assets/hero-main.jpg";
import { ArrowLeft } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <SEOHead title={title} description={subtitle} />
      {/* Image Panel */}
      <div className="hidden lg:flex relative bg-muted flex-col justify-between p-12 overflow-hidden">
        <img 
          src={heroMain} 
          alt="Premium digital banking" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-background/20" />
        
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 font-heading font-bold text-2xl tracking-tight text-white hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-lg leading-none">A</span>
            </div>
            AssetVault
          </Link>
        </div>

        <div className="relative z-10 max-w-md animate-fade-in-up">
          <blockquote className="space-y-4">
            <p className="text-3xl font-heading font-bold leading-tight text-white">
              "The most intuitive and secure digital asset brokerage we've ever tested. A true enterprise-grade platform."
            </p>
            <footer className="text-white/80">
              <div className="font-semibold text-white">Sarah Jenkins</div>
              <div className="text-sm">Chief Investment Officer, Apex Capital</div>
            </footer>
          </blockquote>
        </div>
      </div>

      {/* Form Panel */}
      <div className="flex flex-col flex-1">
        <div className="p-6">
          <Link to="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <div className="w-full max-w-[420px] space-y-8 animate-fade-in-up">
            <div className="space-y-2 text-center lg:text-left">
              <h1 className="text-3xl font-heading font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
