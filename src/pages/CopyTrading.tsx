import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { TrendingUp, Shield, Target, Users, Zap, Eye, Search, AlertTriangle } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEOHead } from "@/components/SEOHead";
import heroCopytrading from "@/assets/hero-copytrading.jpg";
import { TraderPreviewDialog } from "@/components/TraderPreviewDialog";
import { useTraders } from "@/hooks/useSupabaseData";

function TraderCard({ t, onPreview }: { t: any; onPreview: (t: any) => void }) {
  const riskColor = t.risk_level === 'High' ? 'text-destructive' : t.risk_level === 'Low' ? 'text-success' : 'text-warning';

  return (
    <Card className="hover:shadow-elevation-md transition-all duration-300 hover:-translate-y-1">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={t.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + t.name} alt={t.name} className="w-12 h-12 rounded-full object-cover border ring-2 ring-background" width={48} height={48} loading="lazy" />
            <div>
              <div className="font-heading font-semibold">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.followers} followers</div>
            </div>
          </div>
          <Badge variant={t.win_rate >= 80 ? "default" : "secondary"}>{t.win_rate >= 80 ? "Elite" : "Pro"}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-3 rounded-lg">
          <div><span className="text-muted-foreground text-xs block mb-1">Total Profit</span><div className="font-bold text-success text-base">+${t.total_profit.toLocaleString()}</div></div>
          <div><span className="text-muted-foreground text-xs block mb-1">Win Rate</span><div className="font-bold text-base">{t.win_rate}%</div></div>
        </div>
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-muted-foreground flex items-center gap-1">
            <AlertTriangle className={`h-3 w-3 ${riskColor}`} /> Risk Level
          </span>
          <span className={`font-medium ${riskColor}`}>{t.risk_level || 'Medium'}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => onPreview(t)}>
            <Eye className="h-3.5 w-3.5 mr-1" /> Preview
          </Button>
          <Button className="flex-1" size="sm" asChild>
            <Link to="/register">Copy Trader</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CopyTrading() {
  const { data: traders = [] } = useTraders();
  const [previewTrader, setPreviewTrader] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");

  const filteredTraders = useMemo(() => {
    return traders.filter((t: any) => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
      const riskLevel = t.risk_level || 'Medium';
      const matchesRisk = riskFilter === "all" || riskLevel.toLowerCase() === riskFilter.toLowerCase();
      return matchesSearch && matchesRisk;
    });
  }, [traders, searchQuery, riskFilter]);

  return (
    <PublicLayout>
      <SEOHead title="Copy Trading" description="Mirror professional traders automatically and earn consistent returns with AssetVault's copy trading platform." path="/copy-trading" />
      <section className="relative min-h-[400px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroCopytrading} alt="Copy Trading" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">Copy Trading</h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">Follow top-performing traders and automatically mirror their strategies for consistent returns.</p>
        </div>
      </section>

      <section className="py-8 border-b">
        <div className="container grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: TrendingUp, label: "Avg. 22% ROI", desc: "Across all verified traders" },
            { icon: Shield, label: "Verified Traders", desc: "Rigorous vetting process" },
            { icon: Target, label: "Real-time Tracking", desc: "Monitor every trade live" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-4">
              <s.icon className="h-6 w-6 text-primary mb-1" />
              <span className="font-semibold">{s.label}</span>
              <span className="text-xs text-muted-foreground">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">How Copy Trading Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, step: "1", title: "Browse Traders", desc: "Explore our curated list of professional traders across Forex, Crypto, and Commodities." },
              { icon: Target, step: "2", title: "Meet Requirements", desc: "Ensure your account balance meets the trader's minimum requirement to start copying." },
              { icon: Zap, step: "3", title: "Start Copying", desc: "Click copy and our platform automatically mirrors all trades in real time." },
              { icon: TrendingUp, step: "4", title: "Earn Returns", desc: "Receive proportional returns based on the trader's performance and your investment." },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center mx-auto text-primary-foreground font-bold">{item.step}</div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
            <div className="relative w-full md:w-96 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search traders by name..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-8 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="forex">Forex</TabsTrigger>
              <TabsTrigger value="crypto">Crypto</TabsTrigger>
              <TabsTrigger value="commodities">Commodities</TabsTrigger>
            </TabsList>
            {["all", "forex", "crypto", "commodities"].map((tab) => (
              <TabsContent key={tab} value={tab}>
                {filteredTraders.filter((t: any) => tab === "all" || (t.category && t.category.toLowerCase() === tab.toLowerCase())).length === 0 ? (
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="text-lg font-heading font-medium">No traders found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTraders
                      .filter((t: any) => tab === "all" || (t.category && t.category.toLowerCase() === tab.toLowerCase()))
                      .map((t: any) => <TraderCard key={t.id} t={t} onPreview={setPreviewTrader} />)}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-2xl font-bold text-center mb-8">Trader Ranking System</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { rank: "Starter", color: "border-muted-foreground/30", badgeColor: "bg-muted text-muted-foreground", desc: "New traders building their track record", min: "$100" },
              { rank: "Silver", color: "border-muted-foreground", badgeColor: "bg-secondary text-secondary-foreground", desc: "Consistent performers with moderate experience", min: "$500" },
              { rank: "Gold", color: "border-accent", badgeColor: "bg-accent text-accent-foreground", desc: "Proven traders with strong ROI history", min: "$2,000" },
              { rank: "Elite", color: "border-primary", badgeColor: "bg-primary text-primary-foreground", desc: "Top-tier traders with exceptional track records", min: "$10,000" },
            ].map((r) => (
              <Card key={r.rank} className={`border-2 ${r.color}`}>
                <CardContent className="p-6 text-center space-y-2">
                  <Badge className={r.badgeColor}>{r.rank}</Badge>
                  <p className="text-sm text-muted-foreground">{r.desc}</p>
                  <p className="text-xs text-muted-foreground">Min. Balance: <span className="font-semibold text-foreground">{r.min}</span></p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <TraderPreviewDialog
        trader={previewTrader}
        open={!!previewTrader}
        onOpenChange={(open) => !open && setPreviewTrader(null)}
      />
    </PublicLayout>
  );
}
