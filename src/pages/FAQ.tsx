import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEOHead } from "@/components/SEOHead";
import { useCmsFaqs } from "@/hooks/useCmsData";
import {
  Search, HelpCircle, ArrowRight, MessageCircle, Mail,
  ShieldCheck, Wallet, UserCheck, BarChart3, Lock
} from "lucide-react";
import heroFaq from "@/assets/hero-faq.jpg";

const defaultFaqs = [
  // Account & Registration
  { q: "What is AssetVault and how does the platform operate?", a: "AssetVault is a digital asset brokerage and managed strategy platform. Investors can deposit cryptocurrency funds to allocate towards fixed-term investment plans across Forex, Cryptocurrency, and Commodities, or mirror verified professional traders through automated copy trading.", category: "account" },
  { q: "How do I create and activate an account?", a: "Click 'Get Started' on the navigation bar, provide your legal name, email, and a secure password, and confirm your registration email. The process takes under two minutes.", category: "account" },
  { q: "Can I register multiple accounts?", a: "No. In accordance with AML compliance policies, each individual investor is limited to one registered profile. Duplicate registrations will be flagged for compliance review.", category: "account" },

  // KYC & Verification
  { q: "What is KYC verification and why is it mandatory?", a: "Know Your Customer (KYC) is a standard identity verification process that confirms your legal identity to prevent fraud, identity theft, and money laundering. It is mandatory for processing all withdrawals.", category: "kyc" },
  { q: "What documents are required to complete KYC?", a: "You will need a valid government-issued photo ID (Passport, National ID, or Driver's License) and a Proof of Address document dated within the past 90 days (utility bill or bank statement).", category: "kyc" },
  { q: "How long does KYC verification take?", a: "Submissions are reviewed by our compliance team within 1 to 24 hours. You will receive an instant notification once your verification status updates to Verified.", category: "kyc" },

  // Deposits
  { q: "How do I deposit funds into my account?", a: "Navigate to the Deposit section in your investor portal, choose your cryptocurrency (BTC, ETH, USDT), copy the provided wallet address or scan the QR code, broadcast the transfer, and submit your transaction hash (TXID) as proof of payment.", category: "deposits" },
  { q: "What is the minimum deposit amount?", a: "Minimum deposit thresholds correspond to your selected investment tier, starting at $100 for Forex starter plans and $250 for Cryptocurrency plans.", category: "deposits" },
  { q: "How long do crypto deposits take to reflect in my balance?", a: "Deposits are credited once the blockchain network achieves required block confirmations, typically within 15 minutes to 2 hours.", category: "deposits" },

  // Withdrawals
  { q: "How do I request a withdrawal of my available balance?", a: "From the Withdraw section of your portal, enter your requested amount within your available balance and specify your destination wallet address. Your account must be KYC-verified to submit withdrawals.", category: "withdrawals" },
  { q: "What are the processing timelines for withdrawals?", a: "Withdrawal requests undergo security verification and are typically processed within 1 to 3 business days directly to your blockchain wallet address.", category: "withdrawals" },
  { q: "Are there platform withdrawal fees?", a: "AssetVault does not assess platform withdrawal charges. Standard network transaction (gas) fees are deducted automatically based on current blockchain network congestion.", category: "withdrawals" },

  // Investments
  { q: "Can I allocate capital to multiple investment plans simultaneously?", a: "Yes. You can hold active plans across Forex, Cryptocurrency, and Commodities at the same time to achieve balanced portfolio diversification.", category: "investments" },
  { q: "How are returns credited to my balance?", a: "Yields accrue based on your plan's stated schedule. Upon maturity of the investment duration, both principal and earned profit are credited to your available balance.", category: "investments" },
  { q: "Can an active investment plan be cancelled prior to maturity?", a: "Investment allocations are locked for the duration of the plan term to enable disciplined strategy execution by trading managers.", category: "investments" },

  // Copy Trading
  { q: "How does the Copy Trading feature work?", a: "You select a verified trader from our directory, choose your capital allocation, and our system automatically replicates their trades proportionally in your account with zero manual intervention required.", category: "copytrading" },
  { q: "Can I stop copying a trader or adjust my allocation?", a: "Yes. You have full control to pause or stop copying a trader at any time from your Copy Trading dashboard. Open positions remain until closed or managed.", category: "copytrading" },

  // Security & Fees
  { q: "How does AssetVault ensure fund security?", a: "We employ 256-bit SSL encryption, enforce optional 2FA, store the majority of digital custody in offline cold wallets, and keep client capital in segregated accounts.", category: "security" },
  { q: "What should I do if I forget my account credentials?", a: "Click 'Forgot Password' on the login page and enter your registered email address to receive a secure password reset link that remains valid for 60 minutes.", category: "security" }
];

const categoryTabs = [
  { id: "all", label: "All Questions" },
  { id: "account", label: "Account & Registration" },
  { id: "kyc", label: "KYC Verification" },
  { id: "deposits", label: "Deposits & Funding" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "investments", label: "Investment Plans" },
  { id: "copytrading", label: "Copy Trading" },
  { id: "security", label: "Security & Policies" },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: dbFaqs = [] } = useCmsFaqs(false);

  const activeFaqs = useMemo(() => {
    if (dbFaqs.length > 0) {
      return dbFaqs.map(f => ({
        q: f.question,
        a: f.answer,
        category: f.category?.toLowerCase() || "account"
      }));
    }
    return defaultFaqs;
  }, [dbFaqs]);

  const filteredFaqs = useMemo(() => {
    return activeFaqs.filter((f) => {
      const matchesSearch =
        f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" ||
        f.category === activeCategory ||
        (activeCategory === "account" && f.category === "general") ||
        (activeCategory === "deposits" && f.category === "payments") ||
        (activeCategory === "withdrawals" && f.category === "payments") ||
        (activeCategory === "copytrading" && f.category === "trading");
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, activeFaqs]);

  return (
    <PublicLayout>
      <SEOHead
        title="Frequently Asked Questions - AssetVault"
        description="Find answers regarding account registration, KYC verification, crypto deposits, withdrawal timelines, and investment plans on AssetVault."
        path="/faq"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroFaq} alt="FAQ AssetVault" className="w-full h-full object-cover opacity-40 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            Help & Knowledge Directory
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            Search our comprehensive directory of answers regarding account management, investment operations, and platform policies.
          </p>
        </div>
      </section>

      {/* Search & Topic Tabs */}
      <section className="py-8 bg-card border-b">
        <div className="container max-w-4xl space-y-5">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for topics, policies, or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-sm bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeCategory === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-16 lg:py-20">
        <div className="container max-w-3xl space-y-8">
          {filteredFaqs.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-3">
              {filteredFaqs.map((faq, i) => (
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
                  <AccordionContent className="text-xs sm:text-sm text-muted-foreground pb-5 pl-7 leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl space-y-3">
              <HelpCircle className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h3 className="font-heading font-semibold text-foreground">No questions found</h3>
              <p className="text-xs text-muted-foreground">Try adjusting your search terms or select another category.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="py-16 bg-muted/40 border-t">
        <div className="container max-w-3xl">
          <Card className="border border-border bg-card shadow-elevation-sm">
            <CardContent className="p-8 text-center space-y-4">
              <h3 className="text-xl font-heading font-bold text-foreground">
                Still Have Questions?
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Our support team is available around the clock via live chat and email to assist you with any questions.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button asChild className="font-semibold">
                  <Link to="/contact">
                    <Mail className="mr-1.5 h-4 w-4" /> Contact Client Support
                  </Link>
                </Button>
                <Button variant="outline" asChild className="font-semibold">
                  <Link to="/education">Visit Education Center</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
