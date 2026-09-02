import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, Target, Eye, Award, Users, TrendingUp, Globe, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/SEOHead";
import { useAppSettings } from "@/hooks/useCmsData";
import heroAbout from "@/assets/hero-about.png";

const values = [
  {
    icon: ShieldCheck,
    title: "Uncompromising Security",
    desc: "We enforce 256-bit encryption, segregated accounts, and multi-signature cold storage to ensure client funds remain safeguarded at all times."
  },
  {
    icon: Eye,
    title: "Operational Transparency",
    desc: "No hidden charges or obscure terms. Every transaction generates verifiable blockchain hashes and clear performance logs."
  },
  {
    icon: Target,
    title: "Disciplined Risk Management",
    desc: "Every investment plan and copy trading strategy is governed by strict capital preservation guidelines and stop-loss limits."
  },
  {
    icon: Users,
    title: "Dedicated Client Support",
    desc: "Our responsive support team is available 24/7 via live chat and email to assist investors throughout their journey."
  },
];

const pillars = [
  {
    title: "The Problem",
    desc: "Traditional retail financial markets often lack transparent execution, burdening individual investors with complex interfaces, opaque fee structures, and fragmented asset access."
  },
  {
    title: "Our Approach",
    desc: "AssetVault streamlines digital wealth management by integrating Forex, Cryptocurrency, and Commodities into a single, intuitive platform with verified copy trading and fixed-term plans."
  },
  {
    title: "The Outcome",
    desc: "Investors gain immediate access to structured diversification strategies, clear performance metrics, and fast crypto deposit and withdrawal workflows."
  },
];

export default function About() {
  const { data: aboutData } = useAppSettings("about_content");

  const content = {
    hero_title: aboutData?.hero_title || "About AssetVault",
    hero_subtitle: aboutData?.hero_subtitle || "A professional digital asset brokerage dedicated to structured portfolio management and transparent execution.",
    intro_text: aboutData?.intro_text || "AssetVault was established to provide individual and institutional investors with direct, reliable access to global financial markets. By bridging foreign exchange, digital currency assets, and commodity contracts into a single platform, we enable investors to build diversified portfolios backed by disciplined risk management.",
    mission_text: aboutData?.mission_text || "To provide transparent, structured, and accessible investment solutions that allow clients to grow and protect their capital with full operational clarity.",
    vision_text: aboutData?.vision_text || "To serve as a trusted digital asset brokerage recognized for security, clear accountability, and reliable client outcomes across global markets."
  };

  return (
    <PublicLayout>
      <SEOHead
        title="About Us - AssetVault"
        description="Learn about AssetVault's background, core principles, mission, and institutional-grade approach to digital asset management."
        path="/about"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroAbout} alt="About AssetVault" className="w-full h-full object-cover opacity-40 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            Company Overview
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            {content.hero_title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            {content.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Intro Overview */}
      <section className="py-16 lg:py-20 mesh-bg">
        <div className="container max-w-3xl text-center space-y-6 relative z-10 reveal">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Building Sustainable Long-Term Value
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            {content.intro_text}
          </p>
        </div>
      </section>

      {/* Three Pillars */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Why AssetVault Exists
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Our foundational principles for delivering a dependable financial product.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {pillars.map((item) => (
              <Card key={item.title} className="reveal glass-card card-hover group">
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-heading font-bold text-lg text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 stagger-children">
            <Card className="reveal glass-card card-hover shine overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="icon-badge-blue">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground">Our Mission</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {content.mission_text}
                </p>
              </CardContent>
            </Card>

            <Card className="reveal glass-card card-hover shine overflow-hidden">
              <CardContent className="p-8 space-y-4">
                <div className="icon-badge-purple">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-foreground">Our Vision</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {content.vision_text}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-muted/40 border-t">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Core Operating Values
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              The fundamental commitments that guide every feature and customer interaction.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {values.map((v, i) => (
              <Card key={v.title} className="reveal glass-card card-hover">
                <CardContent className="p-6 space-y-3">
                  <div className={`icon-badge ${['icon-badge-blue', 'icon-badge-green', 'icon-badge-amber', 'icon-badge-teal'][i % 4]}`}>
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-heading font-bold text-base text-foreground">{v.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 lg:py-28 bg-slate-950 text-white relative overflow-hidden border-t">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="container relative z-10 text-center max-w-3xl space-y-6 glass p-10 sm:p-14 rounded-3xl border-white/10 reveal">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-white">
            Experience AssetVault Firsthand
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
            Create an account to explore our structured investment plans and verified copy traders.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button size="lg" asChild className="font-semibold shadow-lg glow-primary">
              <Link to="/register">
                Open Free Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold shadow-md" asChild>
              <Link to="/plans">View Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
