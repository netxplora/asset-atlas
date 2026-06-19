import { PublicLayout } from "@/components/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import heroFaq from "@/assets/hero-faq.jpg";

import { Search, SearchX } from "lucide-react";
import { useState, useMemo } from "react";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const faqs = [
  { q: "What is AssetVault?", a: "AssetVault is a digital asset brokerage platform that allows you to invest in Forex, Crypto, and Commodities through managed investment plans and copy trading. We connect you with professional traders and expertly managed portfolios.", category: "general" },
  { q: "How does copy trading work?", a: "You select a professional trader, meet the minimum balance requirement, and our platform automatically mirrors their trades in your account. You earn proportional returns based on their performance. It's fully automated — no trading experience required.", category: "trading" },
  { q: "What is the minimum investment?", a: "Minimum investments vary by plan. Forex starts at $100, Crypto at $250, and Commodities at $500 for Starter plans. Higher tiers offer better returns with larger minimum investments.", category: "investments" },
  { q: "How do I deposit funds?", a: "You can deposit via bank transfer, cryptocurrency (BTC, ETH, USDT), or supported payment methods through your investor dashboard. After depositing, submit your proof of payment and an admin will verify your deposit.", category: "payments" },
  { q: "When can I withdraw?", a: "Withdrawals are available anytime for your available balance. KYC verification is required for withdrawals. Processing typically takes 1-3 business days depending on the withdrawal method.", category: "payments" },
  { q: "Is my investment secure?", a: "Yes. We use 256-bit encryption, optional 2FA authentication, cold storage for digital assets, and comply with international regulatory standards to protect your funds and data.", category: "general" },
  { q: "What are the trader ranks?", a: "Traders are ranked as Starter, Silver, Gold, and Elite based on their performance, consistency, win rate, and track record. Higher-ranked traders have proven results over longer periods.", category: "trading" },
  { q: "Can I invest in multiple plans?", a: "Absolutely. You can diversify across Forex, Crypto, and Commodities plans simultaneously. We encourage diversification to optimize risk-adjusted returns.", category: "investments" },
  { q: "How is ROI calculated?", a: "ROI is calculated based on the plan's stated return percentage over the specified duration. Returns are credited to your account balance at the end of the investment period.", category: "investments" },
  { q: "What is KYC verification?", a: "KYC (Know Your Customer) is a verification process required for withdrawals. You'll need to provide a valid government-issued ID and proof of address to complete verification.", category: "general" },
];

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredFaqs = useMemo(() => {
    return faqs.filter(f => {
      const matchesSearch = f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeTab === "all" || f.category === activeTab;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeTab]);

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
