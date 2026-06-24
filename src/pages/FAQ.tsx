import { PublicLayout } from "@/components/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroFaq from "@/assets/hero-faq.jpg";

import { Search, SearchX, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCmsFaqs } from "@/hooks/useCmsData";

const defaultFaqs = [
  // General (4)
  { q: "What is AssetVault?", a: "AssetVault is a digital asset brokerage platform that allows you to invest in Forex, Crypto, and Commodities through managed investment plans and copy trading. We connect you with professional traders and expertly managed portfolios.", category: "general" },
  { q: "Is my investment secure?", a: "Yes. We use 256-bit encryption, optional 2FA authentication, cold storage for digital assets, and comply with international regulatory standards to protect your funds and data.", category: "general" },
  { q: "What countries does AssetVault support?", a: "AssetVault supports investors from over 120 countries worldwide. Some services may be restricted based on local regulations. Check our Terms of Service for the full list of supported regions.", category: "general" },
  { q: "How do I contact customer support?", a: "You can reach our support team via email at support@assetvault.com, through the live chat on our website, or by phone at +1 (800) 123-4567. Our support team is available 24/7.", category: "general" },

  // Registration (3)
  { q: "How do I create an account?", a: "Click 'Register' on the homepage, fill in your details (name, email, password), and verify your email address. Registration takes less than 2 minutes.", category: "general" },
  { q: "Can I have multiple accounts?", a: "No. Each investor is allowed one account. Multiple accounts may be flagged and suspended for security reasons.", category: "general" },
  { q: "What happens after I register?", a: "After registering and verifying your email, you can access your dashboard, deposit funds, and start investing. We recommend completing KYC verification early to avoid delays when withdrawing.", category: "general" },

  // KYC & Verification (3)
  { q: "What is KYC verification?", a: "KYC (Know Your Customer) is a verification process required for withdrawals. You'll need to provide a valid government-issued ID and proof of address to complete verification.", category: "general" },
  { q: "What documents do I need for KYC?", a: "You'll need a valid government-issued photo ID (passport, driver's license, or national ID) and a proof of address document dated within the last 3 months (utility bill, bank statement, or government letter).", category: "general" },
  { q: "How long does KYC verification take?", a: "KYC verification is typically completed within 1-24 hours during business hours. You'll receive an email notification once your verification status is updated.", category: "general" },

  // Deposits (4)
  { q: "How do I deposit funds?", a: "You can deposit via cryptocurrency (BTC, ETH, USDT, and others) through your investor dashboard. After sending funds to the provided wallet address, submit the transaction hash as proof of payment.", category: "payments" },
  { q: "What is the minimum deposit amount?", a: "The minimum deposit amount depends on the investment plan you choose. Generally, the minimum starts at $100 for Forex Starter plans.", category: "payments" },
  { q: "How long do deposits take to process?", a: "Deposits are processed after blockchain confirmation and admin verification, which typically takes 1-24 hours depending on network congestion and verification queue.", category: "payments" },
  { q: "What cryptocurrencies can I use to deposit?", a: "We currently support BTC, ETH, USDT (TRC20 and ERC20), BNB, SOL, and other major cryptocurrencies. The full list is available on the deposit page of your dashboard.", category: "payments" },

  // Withdrawals (4)
  { q: "When can I withdraw?", a: "Withdrawals are available anytime for your available balance. KYC verification is required for withdrawals. Processing typically takes 1-3 business days depending on the withdrawal method.", category: "payments" },
  { q: "Is there a minimum withdrawal amount?", a: "Yes. The minimum withdrawal amount is $50. This threshold helps manage processing fees and ensures efficient fund transfers.", category: "payments" },
  { q: "Are there any withdrawal fees?", a: "AssetVault does not charge withdrawal fees. However, network transaction fees (gas fees for crypto) are paid by the blockchain network and are beyond our control.", category: "payments" },
  { q: "Why was my withdrawal delayed?", a: "Withdrawals may be delayed for security review, incomplete KYC verification, or high processing volumes. If your withdrawal is delayed beyond 3 business days, contact support.", category: "payments" },

  // Investment Plans (4)
  { q: "What is the minimum investment?", a: "Minimum investments vary by plan. Forex starts at $100, Crypto at $250, and Commodities at $500 for Starter plans. Higher tiers offer better returns with larger minimum investments.", category: "investments" },
  { q: "Can I invest in multiple plans?", a: "Absolutely. You can diversify across Forex, Crypto, and Commodities plans simultaneously. We encourage diversification to optimize risk-adjusted returns.", category: "investments" },
  { q: "How is ROI calculated?", a: "ROI is calculated based on the plan's stated return percentage over the specified duration. Returns are credited to your account balance at the end of the investment period.", category: "investments" },
  { q: "Can I cancel an active investment?", a: "Investment plans have a fixed duration and cannot be cancelled once activated. Your principal and earned returns are credited to your balance upon maturity.", category: "investments" },

  // Copy Trading (3)
  { q: "How does copy trading work?", a: "You select a professional trader, meet the minimum balance requirement, and our platform automatically mirrors their trades in your account. You earn proportional returns based on their performance. It's fully automated — no trading experience required.", category: "trading" },
  { q: "What are the trader ranks?", a: "Traders are ranked as Starter, Silver, Gold, and Elite based on their performance, consistency, win rate, and track record. Higher-ranked traders have proven results over longer periods.", category: "trading" },
  { q: "Can I stop copying a trader?", a: "Yes. You can stop copying a trader at any time from your dashboard. Any open positions managed by that trader will remain until they close naturally.", category: "trading" },

  // Security (3)
  { q: "How does AssetVault protect my account?", a: "We protect your account with 256-bit SSL encryption, optional two-factor authentication (2FA), session monitoring, and automated suspicious activity detection. Visit our Security Center for full details.", category: "general" },
  { q: "What is 2FA and should I enable it?", a: "Two-factor authentication (2FA) adds an extra layer of security by requiring a verification code in addition to your password when logging in. We strongly recommend enabling it.", category: "general" },
  { q: "What happens if I forget my password?", a: "Click 'Forgot Password' on the login page and enter your registered email. You'll receive a password reset link. For security, reset links expire after 1 hour.", category: "general" },

  // Fees (2)
  { q: "Does AssetVault charge any platform fees?", a: "AssetVault does not charge sign-up fees, monthly fees, or deposit fees. Specific plan fees, if any, are clearly displayed on the plan details page before you invest.", category: "payments" },
  { q: "Are there hidden charges?", a: "No. All fees and charges are transparently displayed before any transaction. We believe in full transparency with our investors.", category: "payments" },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { data: dbFaqs = [], isLoading } = useCmsFaqs(false);

  // Use database FAQs if they exist, otherwise fallback to default hardcoded FAQs
  const activeFaqs = dbFaqs.length > 0 
    ? dbFaqs.map(f => ({ q: f.question, a: f.answer, category: f.category || "general" }))
    : defaultFaqs;

  const filteredFaqs = useMemo(() => {
    return activeFaqs.filter(f => {
      const matchesSearch = f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeTab === "all" || f.category.toLowerCase() === activeTab.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab, activeFaqs]);

  return (
    <PublicLayout>
      <SEOHead title="FAQ" description="Find answers to common questions about AssetVault, investments, copy trading, and platform security." path="/faq" />
      <section className="relative min-h-[350px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroFaq} alt="FAQ" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Frequently Asked Questions</h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">Find answers to common questions about our platform.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container max-w-4xl">
          <div className="flex flex-col items-center mb-10 space-y-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for answers..." 
                className="pl-10 h-12 text-base rounded-full bg-muted/50 border-muted-foreground/20 focus-visible:ring-primary/30 shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-wrap justify-center h-auto bg-transparent gap-2 p-0">
                <TabsTrigger value="all" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">All Questions</TabsTrigger>
                <TabsTrigger value="general" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">General</TabsTrigger>
                <TabsTrigger value="investments" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">Investments</TabsTrigger>
                <TabsTrigger value="trading" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">Copy Trading</TabsTrigger>
                <TabsTrigger value="payments" className="rounded-full px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shadow-sm">Payments</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <SearchX className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <h3 className="text-lg font-heading font-medium">No results found</h3>
                <p className="text-muted-foreground">We couldn't find any FAQs matching your search.</p>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((f, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border bg-card rounded-lg px-6 shadow-sm data-[state=open]:border-primary/40 data-[state=open]:shadow-md transition-all">
                    <AccordionTrigger className="text-left font-heading font-medium hover:no-underline py-5 text-base">{f.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">{f.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
