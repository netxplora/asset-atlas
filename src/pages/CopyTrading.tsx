import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEOHead } from "@/components/SEOHead";
import { TraderPreviewDialog } from "@/components/TraderPreviewDialog";
import { useTraders } from "@/hooks/useSupabaseData";
import {
  TrendingUp, ShieldCheck, Target, Users, Zap, Eye,
  Search, AlertTriangle, CheckCircle2, ArrowRight, HelpCircle,
  BarChart3, SlidersHorizontal, Lock
} from "lucide-react";

function TraderCard({ t, onPreview }: { t: any; onPreview: (t: any) => void }) {
  const { user } = useAuth();
  const riskColor =
    t.risk_level === 'High'
      ? 'text-destructive bg-destructive/10'
      : t.risk_level === 'Low'
      ? 'text-success bg-success/10'
      : 'text-warning bg-warning/10';

  const targetLink = user ? "/dashboard/copy-trading" : "/register";

  return (
    <Card className="border border-border shadow-elevation-sm hover:shadow-elevation-md transition-all duration-200 bg-card flex flex-col justify-between">
      <CardContent className="p-5 space-y-4">
        {/* Header with Avatar & Rank */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={t.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`}
              alt={t.name}
              className="w-12 h-12 rounded-full object-cover border border-border ring-2 ring-background"
              width={48}
              height={48}
              loading="lazy"
            />
            <div>
              <h3 className="font-heading font-bold text-sm text-foreground">{t.name}</h3>
              <p className="text-[11px] text-muted-foreground">{t.followers?.toLocaleString() || 0} active copiers</p>
            </div>
          </div>
          <Badge variant={t.win_rate >= 80 ? "default" : "outline"} className="text-[10px] font-semibold">
            {t.win_rate >= 85 ? "Elite" : t.win_rate >= 75 ? "Pro" : "Verified"}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 bg-muted/40 p-3 rounded-xl border border-border/60 text-xs">
          <div>
            <span className="text-[10px] text-muted-foreground block font-medium">Historical Return</span>
            <span className="font-heading font-bold text-success text-sm">+${(t.total_profit || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground block font-medium">Win Ratio</span>
            <span className="font-heading font-bold text-foreground text-sm">{t.win_rate || 0}%</span>
          </div>
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-between text-xs px-1">
          <span className="text-muted-foreground font-medium">Risk Assessment</span>
          <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${riskColor}`}>
            {t.risk_level || 'Medium'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/80">
          <Button variant="outline" size="sm" className="flex-1 text-xs font-semibold" onClick={() => onPreview(t)}>
            <Eye className="h-3.5 w-3.5 mr-1" /> View Profile
          </Button>
          <Button size="sm" className="flex-1 text-xs font-semibold" asChild>
            <Link to={targetLink}>
              {user ? "Copy Trader" : "Start Copying"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
import heroCopytrading from "@/assets/hero-copytrading.jpg";

export default function CopyTrading() {
  const { data: traders = [] } = useTraders();
  const [previewTrader, setPreviewTrader] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("all");
  const [sortBy, setSortBy] = useState("win_rate");

  const filteredTraders = useMemo(() => {
    return traders
      .filter((t: any) => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
        const riskLevel = t.risk_level || 'Medium';
        const matchesRisk = riskFilter === "all" || riskLevel.toLowerCase() === riskFilter.toLowerCase();
        return matchesSearch && matchesRisk;
      })
      .sort((a: any, b: any) => {
        if (sortBy === "win_rate") return (b.win_rate || 0) - (a.win_rate || 0);
        if (sortBy === "followers") return (b.followers || 0) - (a.followers || 0);
        if (sortBy === "profit") return (b.total_profit || 0) - (a.total_profit || 0);
        return 0;
      });
  }, [traders, searchQuery, riskFilter, sortBy]);

  return (
    <PublicLayout>
      <SEOHead
        title="Verified Copy Trading Platform - AssetVault"
        description="Mirror verified market traders automatically. View transparent win rates, risk scores, and execution metrics on AssetVault."
        path="/copy-trading"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroCopytrading} alt="Copy Trading" className="w-full h-full object-cover opacity-40 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            Automated Strategy Replication
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            Verified Copy Trading
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            Follow verified traders with audited track records. Set allocation limits and replicate orders automatically in real time.
          </p>
        </div>
      </section>

      {/* Quick Metrics Bar */}
      <section className="border-b bg-card">
        <div className="container py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl font-heading font-bold text-foreground">100%</div>
            <div className="text-xs text-muted-foreground mt-0.5">Audited Performance Data</div>
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-primary">Proportional</div>
            <div className="text-xs text-muted-foreground mt-0.5">Automated Allocation</div>
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-success">Stop-Loss</div>
            <div className="text-xs text-muted-foreground mt-0.5">Custom Safety Controls</div>
          </div>
          <div>
            <div className="text-2xl font-heading font-bold text-foreground">Instant</div>
            <div className="text-xs text-muted-foreground mt-0.5">Execution Synchronization</div>
          </div>
        </div>
      </section>

      {/* Directory & Filter Section */}
      <section className="py-12 lg:py-16">
        <div className="container space-y-8">
          {/* Controls Bar */}
          <div className="bg-card p-4 sm:p-5 rounded-xl border border-border shadow-elevation-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search traders by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 text-xs sm:text-sm bg-background"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Risk:</span>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="h-10 text-xs bg-background min-w-[120px]">
                      <SelectValue placeholder="All Risk Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk Levels</SelectItem>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="medium">Medium Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                  <span className="text-xs text-muted-foreground font-medium shrink-0">Sort:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="h-10 text-xs bg-background min-w-[130px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="win_rate">Highest Win Rate</SelectItem>
                      <SelectItem value="followers">Most Followers</SelectItem>
                      <SelectItem value="profit">Total Return</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Traders Grid */}
          {filteredTraders.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTraders.map((t) => (
                <TraderCard key={t.id} t={t} onPreview={(trader) => setPreviewTrader(trader)} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/20 border border-dashed rounded-xl space-y-3">
              <Users className="h-10 w-10 text-muted-foreground/50 mx-auto" />
              <h3 className="font-heading font-semibold text-foreground">No traders found</h3>
              <p className="text-xs text-muted-foreground">Try adjusting your search query or risk filters.</p>
              <Button variant="outline" size="sm" onClick={() => { setSearchQuery(""); setRiskFilter("all"); }}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Operates */}
      <section className="py-16 bg-muted/30 border-y">
        <div className="container space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl font-heading font-bold text-foreground">How Copy Trading Operates</h2>
            <p className="text-muted-foreground text-sm">Three straightforward steps to automate your investment strategy.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Select a Trader", desc: "Inspect verified performance metrics, risk ratings, and trading historical logs." },
              { step: "2", title: "Allocate Capital", desc: "Set the amount you wish to allocate and define your custom stop-loss thresholds." },
              { step: "3", title: "Automate Execution", desc: "Orders are automatically replicated in your account proportionally with zero delay." },
            ].map((s) => (
              <Card key={s.step} className="border border-border bg-card">
                <CardContent className="p-6 space-y-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-heading font-bold text-lg mx-auto">
                    {s.step}
                  </div>
                  <h3 className="font-heading font-bold text-base text-foreground">{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trader Preview Modal */}
      {previewTrader && (
        <TraderPreviewDialog
          trader={previewTrader}
          open={!!previewTrader}
          onOpenChange={(open) => !open && setPreviewTrader(null)}
        />
      )}
    </PublicLayout>
  );
}
