import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Shield, ArrowRight, CheckCircle2, Wallet, Upload,
  Clock, UserCheck, Banknote, FileText, AlertTriangle,
  ArrowDownToLine, Eye, ShieldCheck, Scale
} from "lucide-react";
import heroLegal from "@/assets/hero-legal.png";

const depositSteps = [
  { step: "1", title: "Log in to Your Dashboard", desc: "Access your investor dashboard and navigate to the Deposit page." },
  { step: "2", title: "Select Payment Method", desc: "Choose from supported cryptocurrency options (BTC, ETH, USDT, etc.)." },
  { step: "3", title: "Send Funds to Provided Address", desc: "Transfer funds to the wallet address displayed. Double-check the address and network before sending." },
  { step: "4", title: "Submit Transaction Hash", desc: "After sending, enter your transaction hash (TXID) on the confirmation page as proof of payment." },
  { step: "5", title: "Await Verification", desc: "Our team verifies the transaction on the blockchain. This typically takes 1-24 hours depending on network congestion." },
  { step: "6", title: "Funds Credited", desc: "Once verified, the deposit amount is credited to your account balance and is ready for investment." },
];

const withdrawalSteps = [
  { step: "1", title: "KYC Verification Required", desc: "Your identity must be verified before you can make any withdrawal. Complete verification from your Profile settings." },
  { step: "2", title: "Submit Withdrawal Request", desc: "From the Withdraw page, enter the amount and your receiving wallet address or bank details." },
  { step: "3", title: "Security Review", desc: "Our compliance team reviews the withdrawal for security purposes. This is to protect your funds from unauthorized requests." },
  { step: "4", title: "Approval & Processing", desc: "Once approved, the withdrawal is processed. Processing typically takes 1-3 business days." },
  { step: "5", title: "Funds Delivered", desc: "Funds are sent to your specified address or account. You will receive a notification when the transfer is complete." },
];

const kycRequirements = [
  { title: "Government-Issued Photo ID", desc: "Passport, national ID card, or driver's license. The document must be valid and not expired.", icon: FileText },
  { title: "Proof of Address", desc: "Recent utility bill, bank statement, or government correspondence dated within the last 3 months.", icon: FileText },
  { title: "Selfie Verification", desc: "A clear selfie holding your ID document for identity confirmation (if required).", icon: UserCheck },
];

const timelines = [
  { action: "Account Registration", time: "Instant", note: "Email verification required" },
  { action: "KYC Verification", time: "1-24 hours", note: "During business hours" },
  { action: "Deposit Verification", time: "1-24 hours", note: "After blockchain confirmation" },
  { action: "Investment Activation", time: "Instant", note: "After deposit confirmation" },
  { action: "Withdrawal Processing", time: "1-3 business days", note: "After security review" },
  { action: "Support Response", time: "Under 24 hours", note: "Email and live chat" },
];

const investorResponsibilities = [
  "Provide accurate and truthful information during registration and KYC",
  "Keep your account credentials secure and enable 2FA",
  "Review and understand the risk disclosure before investing",
  "Only invest amounts you can afford to lose",
  "Report any suspicious activity on your account immediately",
  "Keep your contact information up to date for important notifications",
  "Comply with your local tax and financial reporting obligations",
];

export default function TrustCenter() {
  return (
    <PublicLayout>
      <SEOHead title="Trust & Transparency" description="Learn how deposits, withdrawals, verification, and fund processing work on AssetVault. Full transparency into our processes." path="/trust" />

      {/* Hero */}
      <section className="relative min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroLegal} alt="Trust Center" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 md:py-20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-sm bg-white/10 text-white backdrop-blur-sm">
            <Eye className="h-4 w-4 text-accent" /> Full Transparency
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">Trust & Transparency Center</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">A clear guide to how our platform operates — from deposits to withdrawals.</p>
        </div>
      </section>

      {/* How Deposits Work */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">How Deposits Work</h2>
              <p className="text-sm text-muted-foreground">Step-by-step guide to funding your account.</p>
            </div>
          </div>
          <div className="space-y-4">
            {depositSteps.map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{item.step}</div>
                <div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Withdrawals Work */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowDownToLine className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">How Withdrawals Work</h2>
              <p className="text-sm text-muted-foreground">How to request and receive your funds.</p>
            </div>
          </div>
          <div className="space-y-4">
            {withdrawalSteps.map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{item.step}</div>
                <div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Verification Process (KYC)</h2>
              <p className="text-sm text-muted-foreground">What you need to verify your identity.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {kycRequirements.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-5 space-y-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="bg-muted/50 border rounded-lg p-4 text-sm text-muted-foreground">
            <strong className="text-foreground">Why is KYC required?</strong> KYC verification helps us prevent fraud, money laundering, and identity theft. It's a standard practice in the financial industry and protects both you and the platform community.
          </div>
        </div>
      </section>

      {/* Processing Timelines */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Processing Timelines</h2>
              <p className="text-sm text-muted-foreground">Expected processing times for common operations.</p>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {timelines.map((item) => (
                  <div key={item.action} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-medium text-sm">{item.action}</div>
                      <div className="text-xs text-muted-foreground">{item.note}</div>
                    </div>
                    <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{item.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Security & Policies */}
      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6 space-y-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Security Measures</h3>
                <p className="text-sm text-muted-foreground">Our platform is protected by 256-bit SSL encryption, 2FA, cold storage for digital assets, and 24/7 monitoring.</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/security">View Security Center <ArrowRight className="ml-2 h-3 w-3" /></Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 space-y-4">
                <Scale className="h-8 w-8 text-primary" />
                <h3 className="text-lg font-bold">Platform Policies</h3>
                <p className="text-sm text-muted-foreground">Review our terms of service, privacy policy, and risk disclosure documents for complete policy information.</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild><Link to="/privacy-policy">Privacy</Link></Button>
                  <Button variant="outline" size="sm" asChild><Link to="/terms-of-service">Terms</Link></Button>
                  <Button variant="outline" size="sm" asChild><Link to="/risk-disclosure">Risk</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investor Responsibilities */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">Investor Responsibilities</h2>
            <p className="text-muted-foreground text-sm">As an AssetVault investor, you agree to the following responsibilities.</p>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <ul className="space-y-4">
                {investorResponsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                    <span>{item}</span>
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
          <h2 className="text-2xl font-bold">Have Questions About Our Processes?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">Our support team is here to help. Reach out any time for assistance with deposits, withdrawals, or account verification.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/contact">Contact Support <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/faq">View FAQ</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
