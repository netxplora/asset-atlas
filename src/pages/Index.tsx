import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp, Shield, BarChart3, Users, ArrowRight, Star,
  Globe, Wallet, Copy, ChevronRight, Smartphone, CheckCircle2,
  Lock, Zap, PieChart, Clock, Award, Headphones
} from "lucide-react";
import heroMain from "@/assets/hero-main.jpg";
import heroSlide2 from "@/assets/hero-slide-2.png";
import heroSlide3 from "@/assets/hero-slide-3.png";
import heroForex from "@/assets/hero-forex.jpg";
import heroCrypto from "@/assets/hero-crypto.jpg";
import heroCommodities from "@/assets/hero-commodities.jpg";
import appMockup from "@/assets/app-mockup.png";

const heroImages = [heroMain, heroSlide2, heroSlide3];

const cryptoTicker = [
  { pair: "BTC/USD", price: "64,230.50", change: "+2.4%" },
  { pair: "ETH/USD", price: "3,450.20", change: "+1.8%" },
  { pair: "SOL/USD", price: "145.80", change: "+5.2%" },
  { pair: "XRP/USD", price: "0.58", change: "-0.5%" },
  { pair: "BNB/USD", price: "590.30", change: "+1.2%" },
  { pair: "ADA/USD", price: "0.45", change: "+0.8%" },
  { pair: "DOGE/USD", price: "0.15", change: "+4.1%" },
  { pair: "AVAX/USD", price: "35.20", change: "-1.2%" },
];

const stats = [
  { label: "Active Investors", value: "25,000+", icon: Users },
  { label: "Assets Under Management", value: "$180M+", icon: Wallet },
  { label: "Average ROI", value: "18.5%", icon: TrendingUp },
  { label: "Countries Supported", value: "120+", icon: Globe },
];

const categories = [
  { title: "Forex", desc: "Trade major, minor, and exotic currency pairs with competitive spreads and expert-managed plans.", image: heroForex },
  { title: "Crypto", desc: "Invest in Bitcoin, Ethereum, and top altcoins with institutional-grade security and diversified strategies.", image: heroCrypto },
  { title: "Commodities", desc: "Diversify with Gold, Silver, Oil and other physical assets for long-term wealth preservation.", image: heroCommodities },
];

const features = [
  { title: "Copy Trading", desc: "Mirror professional traders automatically and earn consistent returns without trading experience.", icon: Copy },
  { title: "Smart Portfolio", desc: "AI-powered portfolio management tools that optimize your asset allocation in real time.", icon: BarChart3 },
  { title: "Bank-Grade Security", desc: "256-bit encryption, 2FA protection, and cold storage for digital assets.", icon: Shield },
  { title: "24/7 Support", desc: "Round-the-clock customer assistance via live chat, email, and phone.", icon: Headphones },
  { title: "Fast Withdrawals", desc: "Process withdrawals within 24 hours with multiple payment methods available.", icon: Zap },
  { title: "Real-time Analytics", desc: "Track your portfolio performance with detailed charts and ROI breakdowns.", icon: PieChart },
];

const testimonials = [
  { name: "James W.", role: "Forex Investor", text: "AssetVault's copy trading feature helped me earn consistent returns without needing to trade myself. The platform is incredibly professional.", rating: 5, verified: true },
  { name: "Sarah L.", role: "Crypto Investor", text: "The platform is incredibly intuitive. I've been investing in crypto plans for 6 months with great results. Customer support is outstanding.", rating: 5, verified: true },
  { name: "Michael R.", role: "Commodities Investor", text: "Professional platform with excellent ROI tracking. My gold investments have performed exceptionally well even during market volatility.", rating: 5, verified: true },
  { name: "Emily T.", role: "Forex Investor", text: "I switched from another platform and immediately noticed the difference. Clean interface, transparent fees, and reliable returns.", rating: 5, verified: true },
];

const howItWorks = [
  { step: "1", title: "Create Account", desc: "Sign up in minutes with a simple registration process and complete your KYC verification." },
  { step: "2", title: "Fund Your Account", desc: "Deposit funds via bank transfer, cryptocurrency, or other supported payment methods." },
  { step: "3", title: "Choose Your Strategy", desc: "Select an investment plan or copy a professional trader that matches your goals." },
  { step: "4", title: "Earn Returns", desc: "Monitor your portfolio grow with real-time tracking and receive your ROI on schedule." },
];

import { SEOHead } from "@/components/SEOHead";

export default function Index() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <PublicLayout>
      <SEOHead path="/" />
      {/* Hero */}
      <section className="relative min-h-[600px] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {heroImages.map((img, index) => (
            <div key={index} className="relative min-w-full h-full">
              <img 
                src={img} 
                alt={`Digital investment platform view ${index + 1}`} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/35" />
            </div>
          ))}
        </div>
        
        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentImageIndex 
                  ? "bg-accent scale-110" 
                  : "bg-white/40 hover:bg-white/60"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="container relative z-10 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-sm bg-white/10 text-white backdrop-blur-sm animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <Star className="h-4 w-4 text-accent" /> Trusted by 25,000+ investors worldwide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white font-heading animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              Your Gateway to <span className="text-gradient-gold">Smart Investing</span>
            </h1>
            <p className="text-lg text-white/80 max-w-xl animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              Invest in Forex, Crypto, and Commodities with professional-grade tools, copy trading, and managed investment plans designed for maximum returns.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" asChild>
                <Link to="/register">Start Investing <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link to="/plans">View Plans</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Market Ticker */}
      <div className="bg-muted border-b overflow-hidden relative py-3 group">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-muted to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-muted to-transparent z-10"></div>
        <div className="flex animate-marquee group-hover:[animation-play-state:paused] whitespace-nowrap">
          {/* Double the array for seamless scrolling */}
          {[...cryptoTicker, ...cryptoTicker, ...cryptoTicker].map((item, i) => (
            <div key={i} className="inline-flex items-center gap-2 mx-6 text-sm">
              <span className="font-bold">{item.pair}</span>
              <span className="text-muted-foreground">${item.price}</span>
              <span className={item.change.startsWith('+') ? "text-success font-medium" : "text-destructive font-medium"}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
        <div className="text-center w-full absolute -bottom-5 left-0 opacity-0 group-hover:opacity-100 transition-opacity bg-muted/90 backdrop-blur-sm py-1 z-20 text-[10px] text-muted-foreground">
          Disclaimer: Prices shown are for illustrative purposes only.
        </div>
      </div>

      {/* Stats */}
      <section className="py-12 border-b">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <div key={s.label} className="text-center space-y-1 animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
              <s.icon className="h-6 w-6 mx-auto text-primary mb-2" />
              <div className="text-2xl font-bold animate-count-up" style={{ animationDelay: `${(i * 100) + 300}ms` }}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Categories with images */}
      <section className="py-16 lg:py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Investment Categories</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Choose from our diverse range of investment categories tailored to your financial goals and risk appetite.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {categories.map((c) => (
              <Card key={c.title} className="relative overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="h-48 overflow-hidden">
                  <img src={c.image} alt={`${c.title} investments`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" width={640} height={192} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 flex flex-col justify-end p-6">
                  <h3 className="text-white font-semibold text-xl">{c.title}</h3>
                  <p className="text-white/80 text-sm mb-4">{c.desc}</p>
                  <Button variant="outline" size="sm" className="w-fit" asChild>
                    <Link to="/plans">Explore Plans <ChevronRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Get started with AssetVault in four simple steps and begin your investment journey today.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-primary-foreground font-bold text-xl">{item.step}</div>
                <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Copy Trading */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <h2 className="text-3xl font-bold">Copy Trading Made Simple</h2>
              <p className="text-muted-foreground">Follow top-performing traders and automatically mirror their strategies. No experience needed — let the experts trade for you while you earn proportional returns.</p>
              <ul className="space-y-3">
                {["Browse verified professional traders with proven track records", "Filter by asset class, risk level, and performance metrics", "Set your investment amount and auto-copy trades instantly", "Real-time ROI tracking with detailed performance analytics"].map((t) => (
                  <li key={t} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" /> {t}
                  </li>
                ))}
              </ul>
              <Button asChild>
                <Link to="/copy-trading">Explore Traders <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Alex Chen", asset: "Forex", roi: "+24.5%", rank: "Elite" },
                { name: "Maria S.", asset: "Crypto", roi: "+31.2%", rank: "Gold" },
                { name: "David K.", asset: "Commodities", roi: "+18.7%", rank: "Silver" },
                { name: "Lisa M.", asset: "Forex", roi: "+22.1%", rank: "Elite" },
              ].map((t) => (
                <Card key={t.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">{t.asset}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground font-medium">{t.rank}</span>
                    </div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-lg font-bold text-success">{t.roi}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Why Choose AssetVault</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Built for serious investors who demand performance, security, and simplicity in their investment journey.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-16">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">Your Security Is Our Priority</h2>
              <p className="text-muted-foreground mb-6">We employ industry-leading security measures to protect your funds and personal data at every level.</p>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: "256-bit Encryption", desc: "All data is encrypted using bank-grade SSL technology" },
                  { icon: Shield, title: "2FA Authentication", desc: "Optional two-factor authentication for enhanced account security" },
                  { icon: Award, title: "Regulatory Compliance", desc: "Fully compliant with international financial regulations" },
                  { icon: Clock, title: "24/7 Monitoring", desc: "Round-the-clock system monitoring for suspicious activity" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Card className="bg-gradient-hero text-primary-foreground border-0">
              <CardContent className="p-8 space-y-6">
                <Shield className="h-16 w-16 text-accent" />
                <h3 className="text-2xl font-bold">Bank-Grade Protection</h3>
                <p className="text-primary-foreground/80">Your funds are protected by multi-layer security protocols, including cold storage for digital assets and segregated client accounts.</p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div><div className="text-2xl font-bold text-accent">99.9%</div><div className="text-xs text-primary-foreground/60">Uptime</div></div>
                  <div><div className="text-2xl font-bold text-accent">0</div><div className="text-xs text-primary-foreground/60">Security Breaches</div></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">What Our Investors Say</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">"{t.text}"</p>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                        {t.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-sm flex items-center gap-1.5">
                          {t.name}
                          {t.verified && <CheckCircle2 className="h-3.5 w-3.5 text-success" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Download App */}
      <section className="py-16">
        <div className="container">
          <Card className="bg-gradient-hero text-primary-foreground border-0">
            <CardContent className="p-8 lg:p-12 flex flex-col lg:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-bold">Download Our Mobile App</h2>
                <p className="text-primary-foreground/80">Trade and monitor your investments on the go. Available for iOS and Android with real-time notifications and full portfolio management.</p>
                <div className="flex gap-3">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                    <Smartphone className="mr-2 h-4 w-4" /> App Store
                  </Button>
                  <Button variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    <Smartphone className="mr-2 h-4 w-4" /> Google Play
                  </Button>
                </div>
              </div>
              <div className="flex-shrink-0 animate-slide-in-right">
                <div className="w-64 h-auto rounded-2xl overflow-hidden shadow-elevation-2xl border-4 border-primary-foreground/20 rotate-2 hover:rotate-0 transition-transform duration-500">
                  <img src={appMockup} alt="AssetVault Mobile App" className="w-full h-full object-cover" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container text-center space-y-5">
          <h2 className="text-3xl font-bold">Ready to Start Investing?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Join thousands of investors already growing their wealth with AssetVault. Create your free account and start earning today.</p>
          <Button size="lg" asChild>
            <Link to="/register">Create Free Account <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
