import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Target, Eye, Award, Users, TrendingUp, Globe, Lock } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";
import heroAbout from "@/assets/hero-about.jpg";

const team = [
  { name: "Richard Wells", role: "CEO & Founder", desc: "20+ years in institutional finance", image: "https://i.pravatar.cc/150?img=11" },
  { name: "Amanda Chen", role: "CTO", desc: "Former VP Engineering at a top fintech", image: "https://i.pravatar.cc/150?img=5" },
  { name: "David Okafor", role: "Head of Trading", desc: "15 years managing forex portfolios", image: "https://i.pravatar.cc/150?img=12" },
  { name: "Maria Santos", role: "Chief Compliance Officer", desc: "Expert in global financial regulations", image: "https://i.pravatar.cc/150?img=9" },
];

const milestones = [
  { year: "2018", title: "Founded", desc: "AssetVault was established with a mission to democratize investing." },
  { year: "2020", title: "Global Expansion", desc: "Opened offices in London and Singapore, reaching investors in 50+ countries." },
  { year: "2022", title: "Crypto Integration", desc: "Launched our institutional-grade cryptocurrency trading desk." },
  { year: "2024", title: "AI Portfolio Manager", desc: "Introduced advanced AI tools for automated portfolio rebalancing." },
];

export default function About() {
  return (
    <PublicLayout>
      <SEOHead title="About Us" description="Learn about AssetVault's mission, vision, and the leadership team driving innovation in digital asset management." path="/about" />
      <section className="relative min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroAbout} alt="About AssetVault" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">About AssetVault</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">We're a global asset manager and technology provider dedicated to helping more and more people experience financial well being.</p>
        </div>
      </section>

      {/* Company intro */}
      <section className="py-16">
        <div className="container max-w-3xl text-center space-y-4">
          <p className="text-lg text-muted-foreground leading-relaxed">
            We help millions of people invest to build savings that serve them throughout their lives. As a trusted digital asset brokerage platform, we empower investors worldwide to grow their wealth through Forex, Crypto, and Commodities — with transparency, security, and innovation at our core.
          </p>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container grid md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Target className="h-6 w-6 text-primary" /><h2 className="text-2xl font-bold">Our Mission</h2></div>
            <p className="text-muted-foreground">To democratize access to professional-grade investment tools and strategies, enabling anyone — regardless of experience level — to build wealth through diversified digital assets. We believe everyone deserves access to the same opportunities previously reserved for institutional investors.</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3"><Eye className="h-6 w-6 text-accent" /><h2 className="text-2xl font-bold">Our Vision</h2></div>
            <p className="text-muted-foreground">To become the world's most trusted digital asset brokerage, known for transparency, innovation, and exceptional investor outcomes. We envision a future where smart investing is accessible, secure, and straightforward for everyone globally.</p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Why AssetVault</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-10">We combine cutting-edge technology with decades of financial expertise to deliver a platform you can trust.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Secure & Regulated", desc: "Bank-grade security with 256-bit encryption and full regulatory compliance across jurisdictions." },
              { icon: Award, title: "Proven Track Record", desc: "Consistent returns across market conditions with transparent performance history for all plans." },
              { icon: Target, title: "Expert Strategies", desc: "Access professional trading strategies managed by experienced analysts and portfolio managers." },
              { icon: Eye, title: "Full Transparency", desc: "Real-time tracking of all investments with detailed reporting and no hidden fees." },
            ].map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6 text-center space-y-3">
                  <f.icon className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Our Leadership Team</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((t) => (
              <Card key={t.name}>
                <CardContent className="p-6 text-center space-y-3">
                  <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-primary/20 bg-muted">
                    <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg">{t.name}</h3>
                  <p className="text-sm text-primary font-medium">{t.role}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="max-w-3xl mx-auto">
            <div className="relative border-l-2 border-primary/20 pl-6 space-y-10 ml-4 md:ml-0">
              {milestones.map((m, i) => (
                <div key={m.year} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                  <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-primary ring-4 ring-background" />
                  <div className="font-bold text-primary mb-1">{m.year}</div>
                  <h3 className="text-xl font-heading font-semibold mb-2">{m.title}</h3>
                  <p className="text-muted-foreground">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-10">Platform in Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Users, value: "25,000+", label: "Active Investors" },
              { icon: Globe, value: "120+", label: "Countries" },
              { icon: TrendingUp, value: "$180M+", label: "Assets Managed" },
              { icon: Lock, value: "99.9%", label: "Uptime" },
            ].map((s, i) => (
              <div key={s.label} className="space-y-2 animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                <s.icon className="h-6 w-6 mx-auto text-primary" />
                <div className="text-3xl font-bold animate-count-up" style={{ animationDelay: `${(i * 100) + 300}ms` }}>{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
