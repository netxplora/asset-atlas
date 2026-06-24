import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield, Lock, Eye, UserCheck, Server, AlertTriangle,
  Fingerprint, MonitorSmartphone, KeyRound, Database,
  ShieldCheck, FileCheck, ArrowRight, CheckCircle2
} from "lucide-react";
import heroLegal from "@/assets/hero-legal.png";

const accountSecurity = [
  { icon: KeyRound, title: "Strong Password Requirements", desc: "All passwords must meet minimum complexity requirements including length, special characters, and mixed case. We never store passwords in plain text — only securely hashed values." },
  { icon: Fingerprint, title: "Two-Factor Authentication (2FA)", desc: "Enable 2FA on your account for an additional layer of security. Even if your password is compromised, your account remains protected with a second verification step." },
  { icon: MonitorSmartphone, title: "Session Management", desc: "Active sessions are monitored and can be reviewed from your profile settings. Inactive sessions are automatically terminated after a period of inactivity." },
  { icon: Eye, title: "Login Monitoring", desc: "Every login attempt is logged with IP address, device type, and timestamp. Suspicious login attempts trigger automatic account protection measures." },
];

const platformSecurity = [
  { icon: Lock, title: "256-bit SSL Encryption", desc: "All data transmitted between your browser and our servers is encrypted using industry-standard 256-bit SSL/TLS encryption — the same standard used by major financial institutions." },
  { icon: Server, title: "Secure Infrastructure", desc: "Our platform runs on enterprise-grade cloud infrastructure with redundant systems, automated backups, and geographic distribution to ensure availability and data integrity." },
  { icon: ShieldCheck, title: "Continuous Monitoring", desc: "Our security team monitors the platform 24/7 for threats, vulnerabilities, and anomalous activity. Automated systems flag and respond to potential issues immediately." },
  { icon: Database, title: "Cold Storage for Digital Assets", desc: "The majority of digital assets held on the platform are stored in offline cold storage wallets, isolated from internet-connected systems to prevent unauthorized access." },
];

const dataProtection = [
  { icon: FileCheck, title: "Privacy Controls", desc: "You have full control over your personal data. We collect only what is necessary for account operation and regulatory compliance. You can request data export or deletion at any time." },
  { icon: Shield, title: "Data Handling", desc: "Personal information is encrypted at rest and in transit. Access to user data is restricted to authorized personnel only, with all access logged and audited." },
  { icon: UserCheck, title: "Regulatory Compliance", desc: "We comply with international data protection regulations including GDPR standards. Our privacy practices are regularly reviewed and updated to meet current requirements." },
];

const bestPractices = [
  "Use a strong, unique password that you don't use on other websites",
  "Enable two-factor authentication (2FA) on your account",
  "Never share your login credentials or 2FA codes with anyone",
  "Verify you're on the official AssetVault website before logging in",
  "Log out of your account when using shared or public devices",
  "Keep your email account secure — it's your account recovery method",
  "Report any suspicious activity to our support team immediately",
  "Regularly review your transaction history for unauthorized activity",
];

export default function SecurityCenter() {
  return (
    <PublicLayout>
      <SEOHead title="Security Center" description="Learn how AssetVault protects your account, funds, and personal data with industry-leading security measures." path="/security" />

      {/* Hero */}
      <section className="relative min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroLegal} alt="Security Center" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 md:py-20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-sm bg-white/10 text-white backdrop-blur-sm">
            <Shield className="h-4 w-4 text-accent" /> Platform Security
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">Security Center</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">How AssetVault protects your account, investments, and personal data.</p>
        </div>
      </section>

      {/* Account Security */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Account Security</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Multiple layers of protection keep your account safe from unauthorized access.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {accountSecurity.map((item) => (
              <Card key={item.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Security */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Platform Security</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Our infrastructure is built with security at every layer.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {platformSecurity.map((item) => (
              <Card key={item.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16">
        <div className="container max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Data Protection</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Your personal data is handled with care and in compliance with international standards.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {dataProtection.map((item) => (
              <Card key={item.title} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6 space-y-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Security Best Practices</h2>
            <p className="text-muted-foreground">Follow these recommendations to keep your account secure.</p>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <ul className="space-y-4">
                {bestPractices.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="container text-center space-y-5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm text-muted-foreground font-medium">If you suspect unauthorized access to your account, contact our support team immediately.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/contact">Contact Support <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/trust">View Trust Center</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
