import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  BookOpen, TrendingUp, BarChart3, Shield, PieChart, Brain,
  ArrowRight, CheckCircle2, Globe
} from "lucide-react";
import heroLegal from "@/assets/hero-legal.png";

const categories = [
  {
    title: "Investing Basics",
    desc: "Learn the fundamentals of investing, including how markets work, types of assets, and key terminology every investor should know.",
    icon: BookOpen,
    topics: [
      "What is investing and why it matters",
      "Understanding asset classes (Forex, Crypto, Commodities)",
      "Risk vs. reward: finding the right balance",
      "How to set investment goals",
      "The power of compound returns",
    ],
  },
  {
    title: "Forex Education",
    desc: "Understand how the foreign exchange market operates, including currency pairs, spreads, and factors that drive currency valuations.",
    icon: Globe,
    topics: [
      "What is Forex trading?",
      "Understanding currency pairs and spreads",
      "Major vs. minor vs. exotic pairs",
      "Economic indicators that affect exchange rates",
      "Common Forex trading strategies",
    ],
  },
  {
    title: "Cryptocurrency Education",
    desc: "Learn about blockchain technology, major cryptocurrencies, wallet security, and how digital assets fit into a diversified portfolio.",
    icon: BarChart3,
    topics: [
      "What is blockchain and how does it work?",
      "Understanding Bitcoin, Ethereum, and altcoins",
      "How to evaluate cryptocurrency projects",
      "Wallet security and private key management",
      "Crypto market cycles and volatility",
    ],
  },
  {
    title: "Risk Management",
    desc: "Discover strategies to protect your capital, manage exposure, and make informed decisions even during market downturns.",
    icon: Shield,
    topics: [
      "Why risk management matters",
      "Position sizing and capital allocation",
      "Setting stop-loss and take-profit levels",
      "Emotional discipline in investing",
      "Hedging strategies for portfolio protection",
    ],
  },
  {
    title: "Portfolio Diversification",
    desc: "Learn why spreading your investments across different assets and strategies is one of the most effective ways to manage risk.",
    icon: PieChart,
    topics: [
      "What is diversification and why it works",
      "Building a balanced portfolio",
      "Asset allocation by risk profile",
      "Rebalancing your portfolio over time",
      "Diversification across geographies and sectors",
    ],
  },
  {
    title: "Market Analysis",
    desc: "Understand the tools and techniques professional traders use to analyze markets and identify investment opportunities.",
    icon: Brain,
    topics: [
      "Technical analysis fundamentals",
      "Reading charts and price patterns",
      "Fundamental analysis for long-term investing",
      "Using economic calendars and news events",
      "Sentiment analysis and market psychology",
    ],
  },
];

const quickTips = [
  "Start with an amount you're comfortable with — you can always increase your investment later.",
  "Diversify across asset classes to reduce risk. Don't put all your capital into one plan.",
  "Complete your KYC verification early to avoid delays when you want to withdraw.",
  "Review your portfolio regularly and adjust your strategy as your goals change.",
  "Read the risk disclosure before investing. Understand what you're committing to.",
  "Enable two-factor authentication (2FA) to protect your account from unauthorized access.",
];

export default function Education() {
  return (
    <PublicLayout>
      <SEOHead title="Education Center" description="Learn about investing, Forex, cryptocurrency, risk management, and portfolio strategy. Build your knowledge with AssetVault's investor education hub." path="/education" />

      {/* Hero */}
      <section className="relative min-h-[320px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroLegal} alt="Education Center" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 md:py-20 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-sm bg-white/10 text-white backdrop-blur-sm">
            <BookOpen className="h-4 w-4 text-accent" /> Investor Knowledge
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white">Education Center</h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg">Build your investing knowledge. Whether you're new to investing or experienced, our guides cover everything you need.</p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Browse by Topic</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Select a category below to explore key concepts and practical knowledge.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <Card key={cat.title} className="hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <cat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">{cat.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{cat.desc}</p>
                  <ul className="space-y-2">
                    {cat.topics.map((topic) => (
                      <li key={topic} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{topic}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-3">Quick Tips for New Investors</h2>
            <p className="text-muted-foreground text-sm">Practical advice to help you get started on the right foot.</p>
          </div>
          <Card>
            <CardContent className="p-6 md:p-8">
              <ul className="space-y-4">
                {quickTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Blog Link */}
      <section className="py-16">
        <div className="container text-center space-y-5">
          <h2 className="text-2xl font-bold">Want More In-Depth Content?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">Check out our blog for detailed articles, market updates, and investment insights written by our team.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link to="/blog">Read Our Blog <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
