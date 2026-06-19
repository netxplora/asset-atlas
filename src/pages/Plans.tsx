import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { CheckCircle2, Shield, TrendingUp, Clock, Calculator, ArrowRight } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEOHead } from "@/components/SEOHead";
import heroForex from "@/assets/hero-forex.jpg";
import heroCrypto from "@/assets/hero-crypto.jpg";
import heroCommodities from "@/assets/hero-commodities.jpg";

const plans = {
  forex: [
    { tier: "Starter", min: "$100", roi: "8%", duration: "30 days", risk: "Low" },
    { tier: "Silver", min: "$1,000", roi: "12%", duration: "60 days", risk: "Medium" },
    { tier: "Gold", min: "$5,000", roi: "18%", duration: "90 days", risk: "Medium" },
    { tier: "Elite", min: "$25,000", roi: "25%", duration: "180 days", risk: "High" },
  ],
  crypto: [
    { tier: "Starter", min: "$250", roi: "10%", duration: "30 days", risk: "Medium" },
    { tier: "Silver", min: "$2,500", roi: "15%", duration: "60 days", risk: "Medium" },
    { tier: "Gold", min: "$10,000", roi: "22%", duration: "90 days", risk: "High" },
    { tier: "Elite", min: "$50,000", roi: "30%", duration: "180 days", risk: "High" },
  ],
  commodities: [
    { tier: "Starter", min: "$500", roi: "6%", duration: "30 days", risk: "Low" },
    { tier: "Silver", min: "$3,000", roi: "10%", duration: "60 days", risk: "Low" },
    { tier: "Gold", min: "$15,000", roi: "15%", duration: "90 days", risk: "Medium" },
    { tier: "Elite", min: "$75,000", roi: "20%", duration: "180 days", risk: "Medium" },
  ],
};

const tierColors: Record<string, string> = {
  Starter: "bg-muted text-muted-foreground",
  Silver: "bg-muted text-foreground",
  Gold: "bg-accent/20 text-accent-foreground",
  Elite: "bg-primary/10 text-primary",
};

const heroImages: Record<string, string> = { forex: heroForex, crypto: heroCrypto, commodities: heroCommodities };

export default function Plans() {
  const [calcAmount, setCalcAmount] = useState<string>("1000");
  const [calcCategory, setCalcCategory] = useState<"forex" | "crypto" | "commodities">("forex");
  const [calcPlanIdx, setCalcPlanIdx] = useState<string>("1");

  const calcResult = useMemo(() => {
    const amount = parseFloat(calcAmount) || 0;
    const planList = plans[calcCategory];
    const plan = planList[parseInt(calcPlanIdx)] || planList[0];
    
    const roiPercent = parseFloat(plan.roi.replace("%", ""));
    const profit = amount * (roiPercent / 100);
    const total = amount + profit;
    
    return { profit, total, plan };
  }, [calcAmount, calcCategory, calcPlanIdx]);

  return (
    <PublicLayout>
      <SEOHead title="Investment Plans" description="Explore our Forex, Crypto, and Commodities investment plans designed for consistent ROI." path="/plans" />
      <section className="relative min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroForex} alt="Investment Plans" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Investment Plans</h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">Choose a plan that fits your investment goals across Forex, Crypto, and Commodities with transparent ROI.</p>
        </div>
      </section>

      {/* Category images */}
      <section className="py-12 border-b">
        <div className="container grid md:grid-cols-3 gap-6">
          {[
            { title: "Forex", desc: "Currency pairs with competitive spreads", image: heroForex },
            { title: "Crypto", desc: "Bitcoin, Ethereum & top altcoins", image: heroCrypto },
            { title: "Commodities", desc: "Gold, Silver, Oil & more", image: heroCommodities },
          ].map((c) => (
            <div key={c.title} className="relative rounded-lg overflow-hidden h-40 group">
              <img src={c.image} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg">{c.title}</h3>
                <p className="text-white/70 text-sm">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Investment Calculator */}
      <section className="py-12 bg-muted/10">
        <div className="container max-w-4xl">
          <Card className="border-border shadow-elevation-md">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-heading">Investment Calculator</CardTitle>
              <p className="text-muted-foreground">Forecast your potential returns across our premium plans.</p>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label>Investment Category</Label>
                    <Select value={calcCategory} onValueChange={(v: any) => { setCalcCategory(v); setCalcPlanIdx("0"); }}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="forex">Forex Trading</SelectItem>
                        <SelectItem value="crypto">Cryptocurrency</SelectItem>
                        <SelectItem value="commodities">Commodities</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Investment Plan</Label>
                    <Select value={calcPlanIdx} onValueChange={setCalcPlanIdx}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Select Plan" /></SelectTrigger>
                      <SelectContent>
                        {plans[calcCategory].map((p, idx) => (
                          <SelectItem key={p.tier} value={idx.toString()}>
                            {p.tier} ({p.roi} in {p.duration})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Investment Amount (USD)</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-muted-foreground font-medium">$</span>
                      <Input 
                        type="number" 
                        className="pl-8 h-12 text-lg" 
                        value={calcAmount} 
                        onChange={(e) => setCalcAmount(e.target.value)} 
                        placeholder="1000" 
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-8 rounded-2xl border flex flex-col justify-center h-full space-y-6 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Estimated Profit ({calcResult.plan.duration})</p>
                    <div className="text-4xl font-bold text-success">+${calcResult.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  
                  <div className="h-px bg-border w-full" />
                  
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">Total Expected Return</p>
                    <div className="text-3xl font-bold text-foreground">${calcResult.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>

                  <Button className="w-full h-12 font-semibold text-base mt-4" asChild>
                    <Link to="/register">Start Investing <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <Tabs defaultValue="forex" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="forex">Forex</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="commodities">Commodities</TabsTrigger>
            </TabsList>

            {Object.entries(plans).map(([key, list]) => (
              <TabsContent key={key} value={key} className="animate-fade-in-up">
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                  {list.map((p) => (
                    <Card key={p.tier} className={`relative overflow-hidden transition-all duration-300 hover:shadow-elevation-lg hover:-translate-y-1 ${p.tier === "Gold" ? "border-accent shadow-elevation-md ring-1 ring-accent/20" : ""}`}>
                      {p.tier === "Gold" && (
                        <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg z-10">Popular</div>
                      )}
                      <CardHeader className="pb-3">
                        <Badge className={tierColors[p.tier]}>{p.tier}</Badge>
                        <CardTitle className="text-lg mt-2 font-heading">{p.tier} {key.charAt(0).toUpperCase() + key.slice(1)} Plan</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-3xl font-bold text-primary">{p.roi} <span className="text-sm font-normal text-muted-foreground">ROI</span></div>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-muted-foreground">Min. Investment</span><span className="font-medium">{p.min}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-medium">{p.duration}</span></div>
                          <div className="flex justify-between"><span className="text-muted-foreground">Risk Level</span><span className="font-medium">{p.risk}</span></div>
                        </div>
                        <Button className={p.tier === "Gold" ? "w-full bg-accent text-accent-foreground hover:bg-accent/90" : "w-full"} variant={p.tier === "Gold" ? "default" : "outline"} asChild>
                          <Link to="/register">Invest Now</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Feature Comparison Table */}
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden mt-12 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
                  <div className="p-6 border-b bg-muted/30">
                    <h3 className="text-xl font-heading font-bold text-center">Compare {key.charAt(0).toUpperCase() + key.slice(1)} Tiers</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                          <th className="p-4 font-medium">Features</th>
                          <th className="p-4 font-medium text-center">Starter</th>
                          <th className="p-4 font-medium text-center">Silver</th>
                          <th className="p-4 font-medium text-center">Gold</th>
                          <th className="p-4 font-medium text-center text-accent">Elite</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        <tr className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">Dedicated Account Manager</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">Daily Market Analysis</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">Priority Withdrawals</td>
                          <td className="p-4 text-center">Standard (24h)</td>
                          <td className="p-4 text-center">Standard (24h)</td>
                          <td className="p-4 text-center">Priority (12h)</td>
                          <td className="p-4 text-center font-medium text-accent">Instant</td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">Risk Management Strategy</td>
                          <td className="p-4 text-center">Standard</td>
                          <td className="p-4 text-center">Standard</td>
                          <td className="p-4 text-center">Advanced</td>
                          <td className="p-4 text-center">Custom</td>
                        </tr>
                        <tr className="hover:bg-muted/30 transition-colors">
                          <td className="p-4 font-medium">Monthly Strategy Call</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center text-muted-foreground">—</td>
                          <td className="p-4 text-center"><CheckCircle2 className="h-4 w-4 mx-auto text-success" /></td>
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

      {/* Benefits */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-10">Why Invest With Us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, title: "Consistent Returns", desc: "Our managed plans deliver reliable ROI through expert strategies." },
              { icon: Shield, title: "Capital Protection", desc: "Risk management protocols to safeguard your investments." },
              { icon: Clock, title: "Flexible Durations", desc: "Choose plans from 30 to 180 days based on your goals." },
              { icon: CheckCircle2, title: "Transparent Fees", desc: "No hidden charges. What you see is what you get." },
            ].map((f) => (
              <Card key={f.title}>
                <CardContent className="p-6 text-center space-y-3">
                  <f.icon className="h-8 w-8 mx-auto text-primary" />
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
