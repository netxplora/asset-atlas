import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useInvestmentPlans } from "@/hooks/useSupabaseData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEOHead } from "@/components/SEOHead";
import {
  CheckCircle2, ShieldCheck, TrendingUp, Clock, Calculator,
  ArrowRight, AlertTriangle, HelpCircle, BarChart3, Lock
} from "lucide-react";
import heroForex from "@/assets/hero-forex.jpg";
import heroCrypto from "@/assets/hero-crypto.jpg";
import heroCommodities from "@/assets/hero-commodities.jpg";
import heroPlans from "@/assets/hero-main.jpg";

const defaultPlans: Record<string, any[]> = {
  forex: [
    { tier: "Forex Starter", min: "$100", rawMin: 100, roi: "8%", rawRoi: 8, duration: "30 Days", risk: "Low", recommended: "Entry-level Forex plan for new investors in currency markets." },
    { tier: "Forex Silver", min: "$1,000", rawMin: 1000, roi: "12%", rawRoi: 12, duration: "60 Days", risk: "Medium", recommended: "Intermediate Forex plan for consistent capital growth." },
    { tier: "Forex Gold", min: "$5,000", rawMin: 5000, roi: "18%", rawRoi: 18, duration: "90 Days", risk: "Medium", recommended: "Advanced Forex allocation for experienced currency investors." },
    { tier: "Forex Elite", min: "$25,000", rawMin: 25000, roi: "25%", rawRoi: 25, duration: "180 Days", risk: "High", recommended: "High-net-worth long-term Forex strategy with maximum exposure." },
  ],
  crypto: [
    { tier: "Crypto Starter", min: "$250", rawMin: 250, roi: "10%", rawRoi: 10, duration: "30 Days", risk: "Medium", recommended: "Entry point into digital asset markets with managed exposure." },
    { tier: "Crypto Silver", min: "$2,500", rawMin: 2500, roi: "15%", rawRoi: 15, duration: "60 Days", risk: "Medium", recommended: "Balanced crypto allocation across top-cap digital assets." },
    { tier: "Crypto Gold", min: "$10,000", rawMin: 10000, roi: "22%", rawRoi: 22, duration: "90 Days", risk: "High", recommended: "High-yield crypto strategy for experienced digital asset investors." },
    { tier: "Crypto Elite", min: "$50,000", rawMin: 50000, roi: "30%", rawRoi: 30, duration: "180 Days", risk: "High", recommended: "Institutional-scale crypto allocation with active portfolio management." },
  ],
  commodities: [
    { tier: "Commodities Starter", min: "$500", rawMin: 500, roi: "6%", rawRoi: 6, duration: "30 Days", risk: "Low", recommended: "Conservative commodities plan ideal for capital preservation." },
    { tier: "Commodities Silver", min: "$3,000", rawMin: 3000, roi: "10%", rawRoi: 10, duration: "60 Days", risk: "Low", recommended: "Diversified physical asset allocation for long-term portfolio growth." },
    { tier: "Commodities Gold", min: "$15,000", rawMin: 15000, roi: "15%", rawRoi: 15, duration: "90 Days", risk: "Medium", recommended: "Balanced precious metals and energy commodities strategy." },
    { tier: "Commodities Elite", min: "$75,000", rawMin: 75000, roi: "20%", rawRoi: 20, duration: "180 Days", risk: "Medium", recommended: "High-net-worth commodities portfolio with dedicated allocation." },
  ],
};

const categoryLabels: Record<string, string> = {
  forex: "Forex Trading",
  crypto: "Cryptocurrency",
  commodities: "Commodities",
};

export default function Plans() {
  const { user } = useAuth();
  const { data: dbPlans, isLoading } = useInvestmentPlans();
  
  const [calcAmount, setCalcAmount] = useState<string>("2500");
  const [calcCategory, setCalcCategory] = useState<"forex" | "crypto" | "commodities">("forex");
  const [calcPlanIdx, setCalcPlanIdx] = useState<string>("1");

  // Map DB plans to display shape, grouped by their category column
  const mappedDbPlans = useMemo(() => {
    if (!dbPlans || dbPlans.length === 0) return null;
    return dbPlans
      .filter(p => p.is_active)
      .sort((a, b) => Number(a.min_amount) - Number(b.min_amount));
  }, [dbPlans]);

  const plans = useMemo(() => {
    if (!mappedDbPlans) return defaultPlans;

    const toDisplay = (p: typeof mappedDbPlans[0]) => ({
      id: p.id,
      tier: p.name,
      min: `$${Number(p.min_amount).toLocaleString()}`,
      rawMin: Number(p.min_amount),
      roi: `${p.roi_percentage}%`,
      rawRoi: Number(p.roi_percentage),
      duration: `${p.duration_days} Days`,
      risk: (p.roi_percentage > 50 ? "High" : p.roi_percentage > 15 ? "Medium" : "Low") as string,
      recommended: p.description || "",
    });

    // Group by the category column — "Forex" → forex tab, etc.
    const forex = mappedDbPlans.filter(p => p.category === "Forex").map(toDisplay);
    const crypto = mappedDbPlans.filter(p => p.category === "Crypto").map(toDisplay);
    const commodities = mappedDbPlans.filter(p => p.category === "Commodities").map(toDisplay);

    return {
      forex: forex.length > 0 ? forex : defaultPlans.forex,
      crypto: crypto.length > 0 ? crypto : defaultPlans.crypto,
      commodities: commodities.length > 0 ? commodities : defaultPlans.commodities,
    };
  }, [mappedDbPlans]);

  // Featured plan: prefer any plan with "gold" in name, else second-to-last
  const featuredTierName = useMemo(() => {
    const list = plans.forex;
    if (!list || list.length === 0) return "Gold";
    const goldPlan = list.find(p => p.tier.toLowerCase().includes("gold"));
    if (goldPlan) return goldPlan.tier;
    return list[Math.max(list.length - 2, 0)].tier;
  }, [plans.forex]);

  const calcResult = useMemo(() => {
    const amount = parseFloat(calcAmount) || 0;
    const planList = plans[calcCategory] || [];
    const plan = planList[parseInt(calcPlanIdx)] || planList[0];
    if (!plan) return { profit: 0, total: amount, plan: defaultPlans.forex[0] };
    const roiPercent = plan.rawRoi;
    const profit = amount * (roiPercent / 100);
    const total = amount + profit;
    return { profit, total, plan };
  }, [calcAmount, calcCategory, calcPlanIdx, plans]);

  // Reset plan index when category changes to avoid out-of-bounds
  const handleCategoryChange = (v: "forex" | "crypto" | "commodities") => {
    setCalcCategory(v);
    setCalcPlanIdx("1");
  };

  // Skeleton card for loading state
  const SkeletonCard = () => (
    <div className="rounded-2xl border border-border bg-card p-6 space-y-4 animate-pulse">
      <div className="h-4 w-24 rounded bg-muted" />
      <div className="h-8 w-20 rounded bg-muted" />
      <div className="border-t border-border pt-3 space-y-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-4/6 rounded bg-muted" />
      </div>
      <div className="h-9 w-full rounded bg-muted" />
    </div>
  );

  const targetLink = user ? "/dashboard/investments" : "/register";

  return (
    <PublicLayout>
      <SEOHead
        title="Investment Plans & Returns - AssetVault"
        description="Review structured investment plans across Forex, Cryptocurrency, and Commodities. Transparent minimums, durations, and return calculations."
        path="/plans"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPlans} alt="Investment Plans AssetVault" className="w-full h-full object-cover opacity-50 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            Transparent Pricing & Schedules
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            Structured Investment Plans
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            Select a plan configured for your capital requirements and horizon across Forex, Cryptocurrency, and Commodities.
          </p>
        </div>
      </section>

      {/* Interactive Calculator */}
      <section className="py-12 lg:py-20 mesh-bg border-b">
        <div className="container max-w-4xl relative z-10 reveal">
          <Card className="shadow-elevation-lg glass-card">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto icon-badge-blue mb-4">
                <Calculator className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-heading font-bold text-foreground">
                Investment Return Calculator
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Calculate your estimated returns based on plan duration and capital allocation.
              </p>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Asset Class</Label>
                    <Select
                      value={calcCategory}
                      onValueChange={(v) => handleCategoryChange(v as "forex" | "crypto" | "commodities")}
                    >
                      <SelectTrigger className="h-11 text-sm bg-background">
                        <SelectValue placeholder="Select Asset Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forex">Forex Trading</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="commodities">Commodities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Investment Tier</Label>
                    <Select value={calcPlanIdx} onValueChange={setCalcPlanIdx}>
                      <SelectTrigger className="h-11 text-sm bg-background">
                        <SelectValue placeholder="Select Tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans[calcCategory].map((p, idx) => (
                          <SelectItem key={`${calcCategory}-${idx}-${p.tier}`} value={idx.toString()}>
                            {p.tier} Tier — {p.roi} ({p.duration})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-foreground">Investment Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-muted-foreground font-medium text-sm">$</span>
                      <Input
                        type="number"
                        className="pl-8 h-11 text-base bg-background font-medium"
                        value={calcAmount}
                        onChange={(e) => setCalcAmount(e.target.value)}
                        placeholder="2500"
                        min="50"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Minimum for {calcResult.plan.tier}: {calcResult.plan.min}
                    </p>
                  </div>
                </div>

                {/* Calculation Result Display */}
                <div className="bg-background/40 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-border flex flex-col justify-between space-y-6 shadow-inner">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Estimated Net Profit ({calcResult.plan.duration})</span>
                    <div className="text-3xl sm:text-4xl font-heading font-bold text-success count-in">
                      +${calcResult.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/60 space-y-1">
                    <span className="text-xs text-muted-foreground font-medium">Total Projected Return</span>
                    <div className="text-2xl font-heading font-bold text-foreground">
                      ${calcResult.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>

                  <Button asChild className="w-full h-11 font-semibold shadow-md glow-primary">
                    <Link to={targetLink}>
                      {user ? "Allocate Capital" : "Start Investing Now"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Plan Tiers Grid by Tab */}
      <section className="py-16 lg:py-20">
        <div className="container space-y-12">
          <Tabs defaultValue="forex" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="grid w-full max-w-md grid-cols-3 h-11">
                <TabsTrigger value="forex" className="font-semibold text-xs sm:text-sm">Forex</TabsTrigger>
                <TabsTrigger value="crypto" className="font-semibold text-xs sm:text-sm">Crypto</TabsTrigger>
                <TabsTrigger value="commodities" className="font-semibold text-xs sm:text-sm">Commodities</TabsTrigger>
              </TabsList>
            </div>

            {Object.entries(plans).map(([key, list]) => (
              <TabsContent
                key={key}
                value={key}
                className="space-y-12 data-[state=inactive]:hidden"
                forceMount
              >
                {isLoading ? (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
                  </div>
                ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {list.map((p, i) => {
                    const isFeatured = p.tier === featuredTierName;
                    return (
                      <Card
                        key={`${key}-${i}-${p.tier}`}
                        className={`relative flex flex-col justify-between transition-all duration-300 glass-card card-hover overflow-hidden ${
                          isFeatured ? "border-primary ring-2 ring-primary/20" : ""
                        }`}
                      >
                        {isFeatured && (
                          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full pointer-events-none" />
                        )}
                        {isFeatured && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-sm">
                            Most Selected
                          </div>
                        )}

                        <CardHeader className="pb-3 pt-6 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="font-semibold text-xs">
                              {p.tier} Tier
                            </Badge>
                            <span className={`text-[11px] font-semibold ${p.risk === 'Low' ? 'text-success' : p.risk === 'Medium' ? 'text-warning' : 'text-destructive'}`}>
                              {p.risk} Risk
                            </span>
                          </div>
                          <CardTitle className="text-xl font-heading font-bold text-foreground">
                            {p.roi} <span className="text-xs font-normal text-muted-foreground">ROI</span>
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                          <div className="space-y-2 text-xs pt-2 border-t border-border">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Minimum Capital:</span>
                              <span className="font-semibold text-foreground">{p.min}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span className="font-semibold text-foreground">{p.duration}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Asset Focus:</span>
                              <span className="font-semibold text-foreground">{categoryLabels[key]}</span>
                            </div>
                          </div>

                          <div className="bg-muted/40 p-2.5 rounded-lg text-[11px] text-muted-foreground leading-relaxed">
                            <strong className="text-foreground">Suitability:</strong> {p.recommended}
                          </div>

                          <Button
                            asChild
                            variant={isFeatured ? "default" : "outline"}
                            className="w-full font-semibold"
                          >
                            <Link to={targetLink}>
                              Select Plan <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
                )}

                {/* Plan Comparison Matrix */}
                <div className="bg-card rounded-xl border border-border shadow-elevation-sm overflow-hidden">
                  <div className="p-5 border-b bg-muted/40">
                    <h3 className="font-heading font-bold text-base text-foreground text-center sm:text-left">
                      Feature Comparison — {categoryLabels[key]}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-muted/50 text-muted-foreground border-b">
                        <tr>
                          <th className="p-4 font-semibold">Feature & Coverage</th>
                          <th className="p-4 font-semibold text-center">Starter</th>
                          <th className="p-4 font-semibold text-center">Silver</th>
                          <th className="p-4 font-semibold text-center">Gold</th>
                          <th className="p-4 font-semibold text-center text-primary">Elite</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr className="hover:bg-muted/20">
                          <td className="p-4 font-medium text-foreground">Dedicated Account Specialist</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="p-4 font-medium text-foreground">Daily Performance Reports</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="p-4 font-medium text-foreground">Withdrawal Processing Window</td>
                          <td className="p-4 text-center">Standard (24h)</td>
                          <td className="p-4 text-center">Standard (24h)</td>
                          <td className="p-4 text-center">Priority (12h)</td>
                          <td className="p-4 text-center font-bold text-primary">Expedited</td>
                        </tr>
                        <tr className="hover:bg-muted/20">
                          <td className="p-4 font-medium text-foreground">Risk Management Controls</td>
                          <td className="p-4 text-center">Standard</td>
                          <td className="p-4 text-center">Standard</td>
                          <td className="p-4 text-center">Advanced Stop-Loss</td>
                          <td className="p-4 text-center">Custom Multi-Layer</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Risk Notice */}
      <section className="py-12 bg-muted/30 border-t">
        <div className="container max-w-3xl">
          <Card className="border border-warning/30 bg-warning/5 shadow-sm">
            <CardContent className="p-6 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <h3 className="font-heading font-bold text-sm text-foreground">Investment Risk Notice</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Stated returns reflect historical target yields and model performance. All financial market investments carry risk of capital loss. Verify that your chosen plan corresponds to your risk tolerance before committing capital.
              </p>
              <div className="pt-2">
                <Button variant="outline" size="sm" asChild className="text-xs font-semibold">
                  <Link to="/risk-disclosure">
                    Read Full Risk Disclosure <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
