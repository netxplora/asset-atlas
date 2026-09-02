import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield, Lock, Eye, UserCheck, Server, AlertTriangle,
  Fingerprint, MonitorSmartphone, KeyRound, Database,
  ShieldCheck, FileCheck, ArrowRight, CheckCircle2, Globe
} from "lucide-react";
import heroCrypto from "@/assets/hero-crypto.jpg";

const accountSecurity = [
  {
    icon: KeyRound,
    title: "Cryptographic Password Hashing",
    desc: "Passwords are salted and hashed using modern bcrypt standards before storage. We never store or transmit plain-text credentials."
  },
  {
    icon: Fingerprint,
    title: "Two-Factor Authentication (2FA)",
    desc: "Time-based one-time passwords (TOTP via Google Authenticator or Authy) provide a mandatory second verification layer for sensitive actions."
  },
  {
    icon: MonitorSmartphone,
    title: "Active Session Management",
    desc: "Real-time session monitoring with automatic timeout for inactive sessions and the ability to revoke active authorizations remotely."
  },
  {
    icon: Eye,
    title: "Suspicious Login Protection",
    desc: "Continuous monitoring for abnormal IP changes, device fingerprints, and repeated unauthorized attempts with automated rate limiting."
  },
];

const platformSecurity = [
  {
    icon: Lock,
    title: "256-Bit SSL/TLS Encryption",
    desc: "End-to-end transport layer security encrypts all communications between client browsers and AssetVault servers."
  },
  {
    icon: Database,
    title: "Multi-Signature Cold Custody",
    desc: "Digital assets held in custody are predominantly stored offline in distributed cold-storage wallets requiring multiple keys to sign."
  },
  {
    icon: Server,
    title: "Segregated Client Balances",
    desc: "Investor capital is held independently from corporate operating accounts, ensuring assets remain accounted for at all times."
  },
  {
    icon: ShieldCheck,
    title: "Continuous Threat Monitoring",
    desc: "24/7 automated monitoring of system endpoints, database queries, and transaction activity to detect anomalies."
  },
];

const dataProtection = [
  {
    icon: FileCheck,
    title: "Data Minimization & Privacy",
    desc: "We collect only information required for regulatory compliance and identity verification, maintaining strict data governance."
  },
  {
    icon: Shield,
    title: "Encrypted Data at Rest",
    desc: "All client records and verification files are encrypted at rest using AES-256 standards with restricted internal access."
  },
  {
    icon: UserCheck,
    title: "Strict AML & KYC Protocols",
    desc: "Identity verification processes comply with anti-money laundering regulations to prevent illicit activity and safeguard platform users."
  },
];

const bestPractices = [
  "Utilize a unique, strong password containing letters, numbers, and special characters.",
  "Enable Two-Factor Authentication (2FA) immediately in your profile security settings.",
  "Never share your account credentials, verification codes, or 2FA secrets with anyone.",
  "Verify the URL is https://assetvault.com before entering login information.",
  "Always log out from shared or public computers after completing your transactions.",
  "Keep your registered email account secure as it is your primary recovery mechanism.",
  "Review your transaction history and active deposit intents on a regular basis.",
  "Contact AssetVault support immediately if you suspect any unauthorized access.",
];

export default function SecurityCenter() {
  return (
    <PublicLayout>
      <SEOHead
        title="Security & Infrastructure Protection - AssetVault"
        description="Learn how AssetVault protects investor capital, accounts, and personal data through 256-bit encryption, 2FA, and cold custody."
        path="/security"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCrypto} alt="Security Center AssetVault" className="w-full h-full object-cover opacity-40 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            Security & Compliance
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            Security Center
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            Multi-layered security protocols designed to protect your account, digital asset custody, and personal records.
          </p>
        </div>
      </section>

      {/* Account Security */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Account-Level Protection
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Granular access controls and verification safeguards for your login and profile.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {accountSecurity.map((item) => (
              <Card key={item.title} className="border border-border shadow-elevation-sm bg-card">
                <CardContent className="p-6 space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Infrastructure */}
      <section className="py-16 lg:py-20 bg-muted/30 border-y">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Platform & Custody Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Institutional safeguards for asset storage, server encryption, and fund segregation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {platformSecurity.map((item) => (
              <Card key={item.title} className="border border-border shadow-elevation-sm bg-card">
                <CardContent className="p-6 space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-5xl space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Data Privacy & Governance
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              How we protect your confidential records and identity verification documents.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {dataProtection.map((item) => (
              <Card key={item.title} className="border border-border shadow-elevation-sm bg-card">
                <CardContent className="p-6 space-y-3">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-heading font-bold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-16 bg-muted/40 border-t">
        <div className="container max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Client Security Checklist
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Recommended actions every investor should follow to maximize account security.
            </p>
          </div>

          <Card className="border border-border shadow-elevation-sm bg-card">
            <CardContent className="p-6 sm:p-8">
              <ul className="space-y-3.5">
                {bestPractices.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-muted-foreground leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Support & Incident Response CTA */}
      <section className="py-16 bg-slate-950 text-white border-t">
        <div className="container text-center max-w-2xl space-y-5">
          <div className="inline-flex items-center justify-center gap-2 text-warning text-xs font-semibold uppercase tracking-wider">
            <AlertTriangle className="h-4 w-4" /> Security Inquiries & Reporting
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Need Security Assistance?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            If you detect suspicious account activity or have questions regarding our security protocols, contact our support team immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" asChild className="font-semibold shadow-sm">
              <Link to="/contact">
                Contact Security Team <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 font-semibold">
              <Link to="/trust">View Trust Center</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
