import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield, ArrowRight, CheckCircle2, Wallet, Upload,
  Clock, UserCheck, Banknote, FileText, AlertTriangle,
  ArrowDownToLine, Eye, ShieldCheck, Scale, FileCheck
} from "lucide-react";
import heroCommodities from "@/assets/hero-commodities.jpg";

const depositSteps = [
  { step: "01", title: "Initiate Deposit Intent", desc: "Select your preferred cryptocurrency (BTC, ETH, USDT) and target network in your investor portal." },
  { step: "02", title: "Copy Dedicated Wallet Address", desc: "Use the QR code or one-click copy tool to obtain the platform's funding address for that asset." },
  { step: "03", title: "Broadcast Transaction", desc: "Send funds from your external wallet or exchange, ensuring network selection matches precisely." },
  { step: "04", title: "Submit Transaction Hash (TXID)", desc: "Enter your blockchain transaction hash and optional payment proof screenshot on AssetVault." },
  { step: "05", title: "Blockchain & Team Verification", desc: "Our system confirms on-chain block confirmations and credits your account balance upon verification." },
];

const withdrawalSteps = [
  { step: "01", title: "Complete KYC Verification", desc: "Identity verification is mandatory to comply with AML standards before withdrawal requests can be submitted." },
  { step: "02", title: "Specify Destination Wallet", desc: "Enter your withdrawal amount within available balance limits and provide your destination address." },
  { step: "03", title: "Security & Compliance Check", desc: "Automated checks review the request for anomalous activity, 2FA confirmation, and address validation." },
  { step: "04", title: "Expedited On-Chain Processing", desc: "Approved withdrawals are broadcast directly to the blockchain network with tracking hashes provided." },
];

const kycRequirements = [
  { title: "Government Photo ID", desc: "Valid Passport, National Identity Card, or Driver's License displaying full legal name and date of birth.", icon: FileText },
  { title: "Proof of Address", desc: "Bank statement, utility bill, or official tax document issued within the past 90 days.", icon: FileCheck },
  { title: "Identity Selfie Confirmation", desc: "Clear photograph verifying document holder identity to prevent fraudulent registrations.", icon: UserCheck },
];

const timelines = [
  { action: "Account Creation & Setup", time: "Under 2 minutes", note: "Email verification required" },
  { action: "KYC Verification Review", time: "1 to 24 hours", note: "Standard compliance queue" },
  { action: "Deposit Processing", time: "15 mins to 2 hours", note: "Subject to network block confirmations" },
  { action: "Investment Strategy Allocation", time: "Instant", note: "Available upon funded balance" },
  { action: "Withdrawal Security Processing", time: "1 to 3 business days", note: "Standard compliance verification window" },
  { action: "Live Client Support", time: "Under 15 minutes", note: "Available 24/7 via chat & email" },
];

export default function TrustCenter() {
  return (
    <PublicLayout>
      <SEOHead
        title="Trust & Transparency Operations - AssetVault"
        description="Comprehensive operational policies explaining deposit verification, withdrawal timelines, KYC requirements, and compliance standards."
        path="/trust"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCommodities} alt="Trust Center AssetVault" className="w-full h-full object-cover opacity-40 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            Operational Transparency
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            Trust & Transparency Center
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            Detailed disclosures regarding our financial workflows, verification procedures, and processing standards.
          </p>
        </div>
      </section>

      {/* Deposit Workflow */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Deposit Workflow</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Clear steps for direct cryptocurrency account funding.</p>
            </div>
          </div>

          <div className="space-y-4">
            {depositSteps.map((item) => (
              <Card key={item.step} className="border border-border/80 bg-card shadow-elevation-sm">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Withdrawal Workflow */}
      <section className="py-16 lg:py-20 bg-muted/30 border-y">
        <div className="container max-w-4xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Withdrawal Workflow</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">How available balances are securely requested and disbursed.</p>
            </div>
          </div>

          <div className="space-y-4">
            {withdrawalSteps.map((item) => (
              <Card key={item.step} className="border border-border/80 bg-card shadow-elevation-sm">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-sm shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-foreground">{item.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* KYC Verification Requirements */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-4xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Identity Verification (KYC)</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Required documentation to satisfy global AML standards.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {kycRequirements.map((item) => (
              <Card key={item.title} className="border border-border bg-card shadow-elevation-sm">
                <CardContent className="p-5 space-y-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h3 className="font-heading font-bold text-sm text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Standard Processing Timelines */}
      <section className="py-16 bg-muted/40 border-t">
        <div className="container max-w-4xl space-y-8">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-heading font-bold text-foreground">Standard Processing Timelines</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">Expected operational windows for regular actions.</p>
            </div>
          </div>

          <Card className="border border-border bg-card shadow-elevation-sm overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {timelines.map((item) => (
                  <div key={item.action} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-2 hover:bg-muted/20 transition-colors">
                    <div>
                      <div className="font-medium text-xs sm:text-sm text-foreground">{item.action}</div>
                      <div className="text-[11px] text-muted-foreground">{item.note}</div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary w-fit">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 bg-slate-950 text-white border-t">
        <div className="container text-center max-w-2xl space-y-5">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Have Questions on Platform Processes?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Our client support team is available 24/7 to clarify processing details, verify your documents, or assist with your deposits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" asChild className="font-semibold shadow-sm">
              <Link to="/contact">
                Contact Client Support <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 font-semibold">
              <Link to="/faq">Read Common FAQs</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
