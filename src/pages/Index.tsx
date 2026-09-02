import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  TrendingUp, Shield, BarChart3, Users, ArrowRight, Star,
  Globe, Wallet, Copy, ChevronRight, Smartphone, CheckCircle2,
  Lock, Zap, PieChart, Clock, Award, Headphones,
  ShieldCheck, UserCheck, Banknote, Eye, FileCheck, HelpCircle,
  ArrowUpRight, RefreshCw, Layers
} from "lucide-react";
import heroMain from "@/assets/hero-main.jpg";
import heroSlide2 from "@/assets/hero-slide-2.png";
import heroSlide3 from "@/assets/hero-slide-3.png";
import heroForex from "@/assets/hero-forex.jpg";
import heroCrypto from "@/assets/hero-crypto.jpg";
import heroCommodities from "@/assets/hero-commodities.jpg";
import appMockup from "@/assets/app-mockup.png";
import { useAppSettings } from "@/hooks/useCmsData";
import { SEOHead } from "@/components/SEOHead";

const heroImages = [heroMain, heroSlide2, heroSlide3];

const cryptoTicker = [
  { pair: "BTC/USD", price: "64,230.50", change: "+2.4%" },
  { pair: "ETH/USD", price: "3,450.20", change: "+1.8%" },
  { pair: "EUR/USD", price: "1.0845", change: "+0.3%" },
  { pair: "XAU/USD (Gold)", price: "2,385.60", change: "+0.9%" },
  { pair: "SOL/USD", price: "145.80", change: "+5.2%" },
  { pair: "GBP/USD", price: "1.2910", change: "-0.2%" },
  { pair: "BRENT OIL", price: "84.20", change: "+1.1%" },
  { pair: "BNB/USD", price: "590.30", change: "+1.2%" },
];

const trustBar = [
  { label: "256-Bit SSL Encryption", icon: Lock },
  { label: "Segregated Accounts", icon: Banknote },
  { label: "Verified KYC Accounts", icon: UserCheck },
  { label: "Direct Crypto Deposits", icon: Wallet },
  { label: "Dedicated Client Support", icon: Headphones },
];

const categories = [
  {
    title: "Forex Trading",
    badge: "High Liquidity",
    desc: "Trade major, minor, and emerging currency pairs with competitive spreads and disciplined risk management.",
    image: heroForex,
    metrics: "24/5 Markets • Low Slippage",
    link: "/plans"
  },
  {
    title: "Cryptocurrency",
    badge: "Digital Assets",
    desc: "Gain managed exposure to Bitcoin, Ethereum, and market-leading digital assets secured with cold-storage protocols.",
    image: heroCrypto,
    metrics: "24/7 Markets • Cold Storage",
    link: "/plans"
  },
  {
    title: "Commodities",
    badge: "Tangible Assets",
    desc: "Diversify your portfolio with Gold, Silver, Crude Oil, and core physical commodities to protect against market volatility.",
    image: heroCommodities,
    metrics: "Inflation Hedge • Physical Assets",
    link: "/plans"
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Create Account",
    desc: "Complete a simple 2-minute registration with your email and secure credentials.",
    icon: Users
  },
  {
    step: "02",
    title: "Verify Identity",
    desc: "Submit a valid government ID for fast account verification and fraud protection.",
    icon: UserCheck
  },
  {
    step: "03",
    title: "Fund Account",
    desc: "Transfer funds directly through supported digital asset networks with instant receipt tracking.",
    icon: Banknote
  },
  {
    step: "04",
    title: "Select Strategy",
    desc: "Choose an investment plan that aligns with your capital objectives or copy a professional trader.",
    icon: BarChart3
  },
  {
    step: "05",
    title: "Track Portfolio",
    desc: "Monitor yields, active positions, and performance reports in real time from your dashboard.",
    icon: Eye
  },
  {
    step: "06",
    title: "Withdraw Earnings",
    desc: "Submit withdrawal requests directly to your destination wallet with transparent status tracking.",
    icon: Wallet
  },
];

const features = [
  {
    title: "Verified Copy Trading",
    desc: "Mirror vetted traders with transparent track records. Set investment caps and auto-replicate trades seamlessly.",
    icon: Copy,
  },
  {
    title: "Structured Investment Plans",
    desc: "Select fixed-term investment tiers across Forex, Crypto, and Commodities with clearly defined return schedules.",
    icon: BarChart3,
  },
  {
    title: "Segregated Client Funds",
    desc: "Investor capital is held independently from platform operational balances to ensure complete asset safety.",
    icon: ShieldCheck,
  },
  {
    title: "Real-Time Portfolio Analytics",
    desc: "Gain comprehensive insights into asset allocation, historical ROI, and portfolio distribution on all devices.",
    icon: PieChart,
  },
  {
    title: "Direct Network Deposits",
    desc: "Fund your account quickly with direct crypto transfers backed by blockchain transaction hash verification.",
    icon: Wallet,
  },
  {
    title: "Dedicated 24/7 Support",
    desc: "Access live chat and email assistance whenever you need guidance with your transactions or account.",
    icon: Headphones,
  },
];

const tradersHighlight = [
  { name: "Alex Chen", market: "Forex Specialist", winRate: "88%", roi: "+24.5%", followers: 1420, risk: "Low" },
  { name: "Maria Santos", market: "Crypto Momentum", winRate: "84%", roi: "+31.2%", followers: 980, risk: "Medium" },
  { name: "David Kim", market: "Commodities & Gold", winRate: "91%", roi: "+18.7%", followers: 2150, risk: "Low" },
  { name: "Lisa Meyer", market: "Multi-Asset Scalper", winRate: "86%", roi: "+22.1%", followers: 1100, risk: "Medium" },
];

const homepageFaqs = [
  {
    q: "What is AssetVault and how does it work?",
    a: "AssetVault is a digital asset brokerage and managed investment platform. Investors can deposit funds, select structured plans across Forex, Cryptocurrency, and Commodities, or mirror verified professional traders through automated copy trading."
  },
  {
    q: "What is the minimum amount required to begin investing?",
    a: "Minimum deposits begin at $100 for Forex starter plans, $250 for Cryptocurrency plans, and $500 for Commodities plans. Detailed minimums and durations for all tiers are available on our Investment Plans page."
  },
  {
    q: "How are investor funds protected?",
    a: "We maintain 256-bit SSL encryption, enforce strict identity verification (KYC), keep client capital in segregated accounts, and utilize cold storage custody for digital assets."
  },
  {
    q: "How do deposits and withdrawals work?",
    a: "Deposits are made directly via cryptocurrency networks (such as Bitcoin, Ethereum, USDT) with verifiable blockchain transaction hashes. Withdrawals can be requested from your user dashboard and are processed after standard security verification."
  },
  {
    q: "Can I monitor my active investments on mobile?",
    a: "Yes. AssetVault features a fully responsive, mobile-first investor dashboard accessible from any modern mobile browser or device."
  },
  {
    q: "How does the Copy Trading system work?",
    a: "Copy trading allows you to allocate capital to verified traders on the platform. When a selected trader executes a trade, your account mirrors that position proportionally based on your chosen allocation."
  }
];

export default function Index() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { data: homeData } = useAppSettings("homepage_content");
  const { user } = useAuth();
  const investLink = user ? "/dashboard/investments" : "/register";

  const content = {
    hero_title: homeData?.hero_title || "Professional Digital Asset &",
    hero_highlight: homeData?.hero_highlight || "Investment Management",
    hero_subtitle: homeData?.hero_subtitle || "Access managed strategies across Forex, Cryptocurrency, and Commodities with transparent performance metrics, verified copy trading, and dedicated client security.",
    cta_title: homeData?.cta_title || "Ready to Start Building Your Investment Portfolio?",
    cta_subtitle: homeData?.cta_subtitle || "Create your account today and gain immediate access to institutional-grade investment plans and verified copy traders."
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PublicLayout>
      <SEOHead
        title="AssetVault - Professional Digital Asset Brokerage"
        description="Invest in Forex, Cryptocurrency, and Commodities through structured plans and verified copy trading with AssetVault."
        path="/"
      />

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center overflow-hidden bg-slate-950 text-white">
        {/* Background Slideshow */}
        <div
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {heroImages.map((img, index) => (
            <div key={index} className="relative min-w-full h-full">
              <img
                src={img}
                alt={`AssetVault investment platform overview ${index + 1}`}
                className={`w-full h-full object-cover object-center hero-kenburns`}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-950/40 to-transparent" />
            </div>
          ))}
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentImageIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 py-16 lg:py-24">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-medium bg-white/10 text-white backdrop-blur-md animate-fade-in" style={{animationDelay:'0ms'}}>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Verified Financial Platform & Direct Asset Custody</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight text-white leading-tight animate-fade-in-up" style={{animationDelay:'80ms'}}>
              {content.hero_title}{" "}
              <span className="text-primary">{content.hero_highlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed animate-fade-in-up" style={{animationDelay:'180ms'}}>
              {content.hero_subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 animate-fade-in-up" style={{animationDelay:'280ms'}}>
              <Button size="lg" className="font-semibold shadow-md glow-primary" asChild>
                <Link to={investLink}>
                  Start Investing <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-md" asChild>
                <Link to="/plans">Explore Investment Plans</Link>
              </Button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/15 max-w-xl animate-fade-in-up" style={{animationDelay:'380ms'}}>
              <div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-white">3 Asset Classes</div>
                <div className="text-xs text-slate-400">Forex, Crypto, Commodities</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-emerald-400">256-Bit SSL</div>
                <div className="text-xs text-slate-400">Encrypted Infrastructure</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-white">Direct Transfer</div>
                <div className="text-xs text-slate-400">On-Chain Verification</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust Indicators Bar ─── */}
      <section className="border-b bg-card">
        <div className="container py-4">
          <div className="flex flex-wrap items-center justify-between gap-y-3 gap-x-6">
            {trustBar.map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                <item.icon className="h-4 w-4 text-primary shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Market Ticker ─── */}
      <div className="bg-muted/60 border-b overflow-hidden relative py-2.5">
        <div className="flex animate-marquee hover:[animation-play-state:paused] whitespace-nowrap">
          {[...cryptoTicker, ...cryptoTicker].map((item, i) => (
            <div key={i} className="inline-flex items-center gap-2 mx-6 text-xs sm:text-sm">
              <span className="font-semibold text-foreground">{item.pair}</span>
              <span className="text-muted-foreground">${item.price}</span>
              <span className={`font-semibold ${item.change.startsWith('+') ? "text-success" : "text-destructive"}`}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Investment Categories ─── */}
      <section className="py-16 lg:py-20">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Asset Diversity
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Investment Categories
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Select from three distinct asset classes tailored for consistent capital growth and portfolio balance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {categories.map((c) => (
              <Card key={c.title} className="reveal card-hover group overflow-hidden border border-border shadow-elevation-sm flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={c.image}
                    alt={`${c.title} investment strategy`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-background/90 backdrop-blur-md text-foreground text-[11px] font-semibold px-2.5 py-1 rounded-full border shadow-sm">
                      {c.badge}
                    </span>
                  </div>
                </div>
                <CardContent className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-xl font-heading font-bold text-foreground">{c.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{c.metrics}</span>
                    <Button variant="outline" size="sm" asChild className="font-semibold">
                      <Link to={c.link}>
                        View Plans <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How AssetVault Works ─── */}
      <section className="py-16 lg:py-24 mesh-bg">
        <div className="container space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3 reveal">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Platform Workflow
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              How AssetVault Works
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              A transparent, streamlined investment process from initial onboarding to regular withdrawal of earnings.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {howItWorks.map((item, i) => (
              <Card key={item.step} className="reveal glass-card card-hover transition-colors overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110" />
                <CardContent className="p-6 space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="icon-badge-blue">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <span className="font-heading font-extrabold text-2xl text-muted-foreground/40">
                      {item.step}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-heading font-bold text-lg text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Copy Trading Showcase ─── */}
      <section className="py-16 lg:py-20">
        <div className="container space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                Automated Allocation
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Verified Copy Trading
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Follow experienced market specialists and automatically mirror their positions with proportional capital allocation.
              </p>
            </div>
            <Button asChild className="font-semibold shrink-0">
              <Link to="/copy-trading">
                Browse All Traders <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {tradersHighlight.map((trader) => (
              <Card key={trader.name} className="reveal glass-card card-hover shine">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">{trader.market}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {trader.risk} Risk
                    </span>
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-foreground">{trader.name}</h3>
                    <div className="text-xs text-muted-foreground mt-0.5">{trader.followers.toLocaleString()} Copiers</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t text-center">
                    <div className="bg-muted/40 p-2 rounded-lg">
                      <div className="text-[11px] text-muted-foreground font-medium">Win Rate</div>
                      <div className="text-sm font-bold text-foreground">{trader.winRate}</div>
                    </div>
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Yield</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{trader.roi}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" asChild className="w-full font-semibold">
                    <Link to="/copy-trading">Copy Strategy</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why Choose AssetVault ─── */}
      <section className="py-16 lg:py-20 bg-muted/30 border-y">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Platform Features
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Why Investors Choose AssetVault
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Engineered to deliver stability, security, and actionable portfolio control for discerning digital investors.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 stagger-children">
            {features.map((f, i) => (
              <Card key={f.title} className="reveal glass-card card-hover group">
                <CardContent className="p-6 space-y-3">
                  <div className={`icon-badge ${['icon-badge-blue', 'icon-badge-green', 'icon-badge-amber', 'icon-badge-purple', 'icon-badge-teal', 'icon-badge-red'][i % 6]}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust & Security Center Spotlight ─── */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                Security Infrastructure
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Institutional Security & Client Protection
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                We implement comprehensive safeguards to ensure account integrity, prevent unauthorized transactions, and maintain transparent custody standards.
              </p>

              <div className="space-y-4">
                {[
                  { title: "Segregated Balances", desc: "Client funds are stored separately from operational capital." },
                  { title: "Cold Storage Protocols", desc: "Digital assets are secured using offline multi-signature custody." },
                  { title: "Identity Verification (KYC)", desc: "Mandatory compliance checks safeguard against platform abuse." },
                  { title: "Encrypted Data Transmission", desc: "All network traffic is encrypted via high-grade 256-bit SSL protocols." },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <Button variant="outline" asChild className="font-semibold">
                  <Link to="/security">
                    Learn More in Security Center <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Security Visual Card */}
            <div className="gradient-border rounded-xl reveal-right">
              <Card className="shadow-elevation-lg glass-card overflow-hidden">
                <CardContent className="p-8 space-y-6 relative z-10">
                  <div className="icon-badge-blue">
                    <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-heading font-bold text-foreground">Transparent Auditing Standards</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every transaction on AssetVault generates a permanent record with cryptographic verification hashes and detailed status receipts.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="p-4 rounded-xl bg-background border">
                    <div className="text-2xl font-heading font-bold text-primary">100%</div>
                    <div className="text-xs text-muted-foreground mt-1">Proof of Reserves</div>
                  </div>
                  <div className="p-4 rounded-xl bg-background border">
                    <div className="text-2xl font-heading font-bold text-emerald-500">24/7</div>
                    <div className="text-xs text-muted-foreground mt-1">Transaction Monitoring</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Frequently Asked Questions ─── */}
      <section className="py-16 lg:py-20 bg-muted/40 border-y">
        <div className="container max-w-3xl space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Common Questions
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Clear answers to help you navigate your investments with complete clarity.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {homepageFaqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="border border-border/80 rounded-xl px-5 bg-card shadow-elevation-sm data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-sm font-semibold hover:no-underline py-4 text-left text-foreground">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    {faq.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-5 pl-7 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="text-center pt-4">
            <Button variant="outline" asChild className="font-semibold">
              <Link to="/faq">
                View Complete FAQ Directory <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Mobile Platform Showcase ─── */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <Card className="border border-border shadow-elevation-lg bg-card overflow-hidden">
            <CardContent className="p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-10">
              <div className="flex-1 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  Anywhere Access
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                  Manage Your Investments On Any Device
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  The AssetVault portal is fully optimized for mobile, tablet, and desktop environments. Monitor asset performance, initiate transfers, and copy trades wherever you are.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild className="font-semibold shadow-sm">
                    <Link to={investLink}>
                      Open Investor Portal <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="font-semibold">
                    <Link to="/education">Investor Guide</Link>
                  </Button>
                </div>
              </div>

              <div className="flex-shrink-0">
                <div className="w-64 sm:w-72 h-auto rounded-2xl overflow-hidden shadow-elevation-xl border border-border">
                  <img src={appMockup} alt="AssetVault Mobile Experience" className="w-full h-full object-cover" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Final Call to Action ─── */}
      <section className="py-20 lg:py-28 bg-slate-950 text-white relative overflow-hidden">
        {/* Glow behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="container relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8 glass p-10 sm:p-14 rounded-3xl border-white/10 reveal">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white leading-tight">
              {content.cta_title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              {content.cta_subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Button size="lg" asChild className="font-semibold shadow-lg glow-primary">
                <Link to={investLink}>
                  {user ? "Go to Dashboard" : "Create Account"} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 font-semibold shadow-md border border-white/20 transition-colors" asChild>
                <Link to="/plans">View Investment Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
