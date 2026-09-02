import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, TrendingUp, BarChart3, ShieldCheck, PieChart, Brain,
  ArrowRight, CheckCircle2, Globe, Search, HelpCircle, Layers
} from "lucide-react";
import heroMain from "@/assets/hero-main.jpg";

const categories = [
  {
    id: "basics",
    title: "Investing Basics",
    desc: "Learn core fundamentals of capital management, asset classifications, and how financial markets function.",
    icon: BookOpen,
    topics: [
      "Asset class fundamentals (Forex, Cryptocurrency, Commodities)",
      "Balancing risk exposure against target returns",
      "Structuring long-term capital horizons",
      "Compounding mechanics and reinvestment strategy",
      "Understanding order types and trade lifecycles",
    ],
  },
  {
    id: "forex",
    title: "Forex Market Mechanics",
    desc: "Understand global currency trading, exchange rate drivers, liquidity cycles, and spread management.",
    icon: Globe,
    topics: [
      "Major, minor, and emerging currency pairs",
      "Bid-ask spreads and liquidity provider mechanics",
      "Central bank monetary policies and interest rate impacts",
      "Economic calendar interpretation and news releases",
      "Risk mitigation in volatile currency sessions",
    ],
  },
  {
    id: "crypto",
    title: "Cryptocurrency & Digital Assets",
    desc: "Understand on-chain mechanics, token utility, multi-signature custody, and digital asset portfolio allocation.",
    icon: BarChart3,
    topics: [
      "Bitcoin, Ethereum, and digital asset valuation models",
      "Cold storage custody and multi-signature security",
      "On-chain transactions and hash verification",
      "Market cycle volatility and risk management",
      "Direct wallet transfers and network confirmations",
    ],
  },
  {
    id: "risk",
    title: "Risk & Capital Management",
    desc: "Learn essential safeguards to protect principal capital, control drawdowns, and maintain systematic discipline.",
    icon: ShieldCheck,
    topics: [
      "Position sizing guidelines based on account equity",
      "Defining automated stop-loss and take-profit parameters",
      "Avoiding emotional decision-making in volatile markets",
      "Segregated fund protection and counterparty awareness",
      "Hedging techniques across correlated asset classes",
    ],
  },
  {
    id: "diversification",
    title: "Portfolio Diversification",
    desc: "Learn how allocating capital across uncorrelated asset classes reduces portfolio volatility over time.",
    icon: PieChart,
    topics: [
      "Asset class correlation matrices and risk distribution",
      "Periodic rebalancing methods to protect gains",
      "Balancing high-liquidity vs. tangible store-of-value assets",
      "Conservative vs. growth-oriented portfolio models",
      "Monitoring performance metrics across market cycles",
    ],
  },
  {
    id: "copytrading",
    title: "Copy Trading Strategy",
    desc: "Explore how automated copy trading works, how to evaluate trader track records, and how to manage copy allocations.",
    icon: Brain,
    topics: [
      "Evaluating trader win rates, historical drawdowns, and tenure",
      "Setting individual trader allocation caps",
      "Managing proportional trade sizing in real time",
      "Monitoring open positions from your investor portal",
      "Knowing when to adjust or pause trader subscriptions",
    ],
  },
];

const glossaryTerms = [
  { term: "ROI (Return on Investment)", def: "A performance measure used to evaluate the efficiency or profitability of an investment, calculated as net profit divided by initial capital." },
  { term: "Segregated Accounts", def: "A fund safety practice where investor balances are kept completely separate from company operational funds." },
  { term: "Spread", def: "The difference between the bid (buy) price and the ask (sell) price of a financial asset in the market." },
  { term: "Cold Storage", def: "An offline security protocol for digital assets designed to protect private keys from unauthorized online access." },
  { term: "KYC (Know Your Customer)", def: "A standard regulatory verification process that confirms the identity of registered investors to protect platform integrity." },
  { term: "Stop Loss", def: "A risk management instruction designed to limit potential losses on an open investment position if prices move unfavorably." },
];

const quickTips = [
  "Start with an allocation you are fully comfortable with and scale systematically over time.",
  "Diversify across multiple asset classes rather than concentrating capital into a single strategy.",
  "Complete identity verification (KYC) immediately upon registration to ensure unrestricted withdrawal access.",
  "Review your portfolio analytics regularly and maintain clear financial objectives.",
  "Review the formal Risk Disclosure to understand product terms and market risks.",
  "Enable Two-Factor Authentication (2FA) in your security settings to safeguard your login credentials.",
];

export default function Education() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesCategory = selectedCategory === "all" || cat.id === selectedCategory;
      const matchesSearch =
        cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <PublicLayout>
      <SEOHead
        title="Investor Education Center - AssetVault"
        description="Comprehensive investor guides covering Forex, Cryptocurrency, Commodities, Risk Management, and Financial Terminology."
        path="/education"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroMain} alt="Education AssetVault" className="w-full h-full object-cover opacity-40 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            Investor Knowledge Hub
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            Investor Education Center
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            Essential market guides and practical concepts to help you navigate your investments with clarity and discipline.
          </p>
        </div>
      </section>

      {/* Search & Topic Filter Bar */}
      <section className="py-8 bg-card border-b">
        <div className="container max-w-4xl space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search educational topics or concepts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 text-sm bg-background"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              { id: "all", label: "All Topics" },
              { id: "basics", label: "Basics" },
              { id: "forex", label: "Forex" },
              { id: "crypto", label: "Crypto" },
              { id: "risk", label: "Risk Management" },
              { id: "diversification", label: "Diversification" },
              { id: "copytrading", label: "Copy Trading" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === tab.id
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

      {/* Educational Topic Cards */}
      <section className="py-16 lg:py-20">
        <div className="container space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Core Learning Modules
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Structured modules designed for investors at every stage of their financial journey.
            </p>
          </div>

          {filteredCategories.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((cat) => (
                <Card key={cat.id} className="border border-border shadow-elevation-sm hover:shadow-elevation-md transition-shadow bg-card flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        <cat.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-heading font-bold text-base text-foreground">{cat.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{cat.desc}</p>
                    <div className="pt-3 border-t space-y-2">
                      <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider block">Key Concepts:</span>
                      <ul className="space-y-1.5">
                        {cat.topics.map((topic) => (
                          <li key={topic} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0 mt-0.5" />
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 border border-dashed rounded-xl space-y-2">
              <p className="text-sm font-semibold text-foreground">No matching educational topics found.</p>
              <p className="text-xs text-muted-foreground">Try modifying your search or reset your filter.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Financial Glossary */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container max-w-4xl space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
              Terminology
            </div>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Essential Financial Glossary
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Standard definitions of key terminology used throughout the AssetVault platform.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {glossaryTerms.map((g) => (
              <Card key={g.term} className="border border-border bg-card">
                <CardContent className="p-4 sm:p-5 space-y-1.5">
                  <h4 className="font-heading font-bold text-sm text-foreground">{g.term}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{g.def}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips for Investors */}
      <section className="py-16">
        <div className="container max-w-3xl space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
              Practical Guidelines for Investors
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">
              Prudent practices to support informed, long-term portfolio growth.
            </p>
          </div>

          <Card className="border border-border bg-card shadow-elevation-sm">
            <CardContent className="p-6 sm:p-8">
              <ul className="space-y-4">
                {quickTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 bg-slate-950 text-white border-t">
        <div className="container text-center max-w-2xl space-y-5">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
            Apply Your Knowledge With AssetVault
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Create an account to explore structured investment plans and verified copy trading strategies today.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" asChild className="font-semibold shadow-sm">
              <Link to="/register">
                Open Investor Account <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/30 text-white hover:bg-white/10 font-semibold">
              <Link to="/plans">Explore Investment Plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
