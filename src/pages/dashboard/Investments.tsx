import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Loader2, Briefcase, TrendingUp, Calendar, AlertCircle,
  ArrowRight, Wallet, LineChart, Coins, BarChart3, DollarSign,
  Clock, XCircle, AlertTriangle, CheckCircle2, Ban,
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  useInvestmentPlans, useUserInvestments, useCreateUserInvestment,
  useProfile, useCancelInvestment,
} from "@/hooks/useSupabaseData";
import { differenceInDays, addDays, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

type PlanCategory = "Forex" | "Crypto" | "Commodities";

const CATEGORIES: { key: PlanCategory; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "Forex",       label: "Forex Trading",   icon: LineChart,  color: "text-blue-500",   bg: "bg-blue-500/10"   },
  { key: "Crypto",      label: "Cryptocurrency",   icon: Coins,      color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "Commodities", label: "Commodities",      icon: BarChart3,  color: "text-amber-500",  bg: "bg-amber-500/10"  },
];

export default function Investments() {
  const { data: allPlans = [], isLoading: loadingPlans } = useInvestmentPlans();
  const { data: myInvestments = [], isLoading: loadingInv } = useUserInvestments();
  const { data: profile } = useProfile();
  const createInvestment = useCreateUserInvestment();
  const cancelInvestment = useCancelInvestment();

  const [selectedPlan, setSelectedPlan] = useState<Record<string, unknown> | null>(null);
  const [amount, setAmount] = useState("");
  const [planTab, setPlanTab] = useState<PlanCategory>("Forex");
  const [cancelTarget, setCancelTarget] = useState<Record<string, unknown> | null>(null);

  const activePlans = useMemo(
    () => (allPlans as Record<string, unknown>[]).filter(p => p.is_active),
    [allPlans]
  );

  const plansByCategory = useMemo(() => {
    const grouped: Record<PlanCategory, Record<string, unknown>[]> = { Forex: [], Crypto: [], Commodities: [] };
    activePlans.forEach(p => {
      const cat = (p.category as PlanCategory) || "Forex";
      if (grouped[cat]) grouped[cat].push(p);
    });
    Object.keys(grouped).forEach(k =>
      grouped[k as PlanCategory].sort((a, b) => Number(a.min_amount) - Number(b.min_amount))
    );
    return grouped;
  }, [activePlans]);

  const isLoading = loadingPlans || loadingInv;

  const handleInvest = () => {
    if (!selectedPlan || !amount) return;
    const numAmount = parseFloat(amount);
    if (numAmount < Number(selectedPlan.min_amount)) return;
    if (numAmount > (Number((profile as Record<string, unknown>)?.balance) || 0)) return;

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + Number(selectedPlan.duration_days));

    createInvestment.mutate({
      plan_id: selectedPlan.id as string,
      amount: numAmount,
      roi_percentage: selectedPlan.roi_percentage,
      duration_days: selectedPlan.duration_days,
      end_date: endDate.toISOString(),
    }, {
      onSuccess: () => { setSelectedPlan(null); setAmount(""); },
    });
  };

  const handleCancelConfirm = () => {
    if (!cancelTarget) return;
    cancelInvestment.mutate(cancelTarget.id as string, {
      onSuccess: () => setCancelTarget(null),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":    return { label: "Active",    cls: "bg-success/10 text-success border-success/20", icon: <CheckCircle2 className="h-3 w-3" /> };
      case "completed": return { label: "Completed", cls: "bg-primary/10 text-primary border-primary/20", icon: <TrendingUp className="h-3 w-3" /> };
      case "cancelled": return { label: "Cancelled", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: <Ban className="h-3 w-3" /> };
      default:          return { label: status,      cls: "bg-muted text-muted-foreground border-border", icon: null };
    }
  };

  const PlanCard = ({ p, index, cat }: { p: Record<string, unknown>; index: number; cat: typeof CATEGORIES[0] }) => (
    <Card
      className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col border-border/70"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`h-1 w-full rounded-t-xl ${cat.key === "Forex" ? "bg-blue-500" : cat.key === "Crypto" ? "bg-purple-500" : "bg-amber-500"}`} />
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-bold leading-tight">{p.name as string}</CardTitle>
            {p.description && (
              <CardDescription className="mt-0.5 text-xs line-clamp-2">{p.description as string}</CardDescription>
            )}
          </div>
          <div className={`shrink-0 p-1.5 rounded-lg ${cat.bg}`}>
            <cat.icon className={`h-4 w-4 ${cat.color}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-5 px-5 pb-5">
        <div className="flex items-end gap-2 pb-4 border-b border-border/60">
          <div className="text-4xl font-bold font-heading text-primary">{p.roi_percentage as string}%</div>
          <div className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-widest">Total ROI</div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <DollarSign className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
            <p className="text-[10px] text-muted-foreground">Min.</p>
            <p className="text-xs font-bold">${Number(p.min_amount).toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Clock className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
            <p className="text-[10px] text-muted-foreground">Days</p>
            <p className="text-xs font-bold">{p.duration_days as string}d</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
            <p className="text-[10px] text-muted-foreground">Daily</p>
            <p className="text-xs font-bold">
              {(Number(p.roi_percentage) / Number(p.duration_days)).toFixed(2)}%
            </p>
          </div>
        </div>
        <Button
          className="w-full group font-semibold"
          onClick={() => { setSelectedPlan(p); setAmount(String(p.min_amount)); }}
        >
          Invest Now
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );

  const SkeletonGrid = () => (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <div className="h-1 rounded-t-xl bg-muted" />
          <CardContent className="p-5 space-y-4">
            <div className="h-5 w-2/3 bg-muted rounded" />
            <div className="h-10 w-1/3 bg-muted rounded" />
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3].map(j => <div key={j} className="h-12 bg-muted rounded-lg" />)}
            </div>
            <div className="h-9 bg-muted rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const profileData = profile as Record<string, unknown>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">Investments</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Manage active investment plans and allocate funds across Forex, Crypto, and Commodities.
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full sm:w-[420px] grid-cols-2 h-11">
          <TabsTrigger value="active" className="font-semibold">
            Active Investments
            {(myInvestments as Record<string, unknown>[]).filter(i => i.status === "active").length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px] font-bold">
                {(myInvestments as Record<string, unknown>[]).filter(i => i.status === "active").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="available" className="font-semibold">
            Available Plans
            {activePlans.length > 0 && (
              <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-[10px] font-bold">
                {activePlans.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ── Active Investments ─────────────────────────────────────── */}
        <TabsContent value="active" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between">
                      <div className="h-5 w-1/3 bg-muted rounded" />
                      <div className="h-5 w-16 bg-muted rounded" />
                    </div>
                    <div className="h-2.5 w-full bg-muted rounded" />
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3].map(j => <div key={j} className="h-8 bg-muted rounded" />)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (myInvestments as Record<string, unknown>[]).length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-heading font-bold mb-2">No Active Investments</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">
                  You haven't started an investment yet. Explore the available opportunities and choose one that matches your goals.
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="available"]')?.click()}>
                  Explore Investments
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {(myInvestments as Record<string, unknown>[]).map((inv, index) => {
                const plan = inv.plan as Record<string, unknown>;
                const totalDays = Number(inv.duration_days);
                const daysElapsed = Math.max(0, differenceInDays(new Date(), new Date(inv.start_date as string)));
                const daysRemaining = Math.max(0, totalDays - daysElapsed);
                const progress = Math.min((daysElapsed / totalDays) * 100, 100);
                const totalExpected = Number(inv.amount) * Number(inv.roi_percentage) / 100;
                const earned = Number(inv.profit_generated ?? 0);
                const cat = CATEGORIES.find(c => c.key === (plan?.category || "Forex")) || CATEGORIES[0];
                const badge = getStatusBadge(inv.status as string);

                return (
                  <Card key={inv.id as string} className="overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className={`h-1 w-full ${cat.key === "Forex" ? "bg-blue-500" : cat.key === "Crypto" ? "bg-purple-500" : "bg-amber-500"}`} />
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-base font-semibold">{plan?.name as string || "Investment Plan"}</h3>
                                <Badge variant="outline" className={`flex items-center gap-1 text-[10px] ${badge.cls}`}>
                                  {badge.icon}{badge.label}
                                </Badge>
                                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cat.bg} ${cat.color}`}>
                                  <cat.icon className="h-3 w-3" />
                                  {cat.key}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Started {format(new Date(inv.start_date as string), "MMM dd, yyyy")}
                                {" · "}Matures {format(new Date(inv.end_date as string), "MMM dd, yyyy")}
                              </p>
                            </div>
                            <div className="text-right hidden lg:block shrink-0">
                              <div className="text-sm text-muted-foreground mb-0.5">
                                {inv.status === "active" ? `${daysRemaining} days left` : inv.status}
                              </div>
                              <div className="font-semibold text-sm">{Math.round(progress)}% Complete</div>
                            </div>
                          </div>

                          {inv.status === "active" && (
                            <div className="space-y-1.5">
                              <div className="flex justify-between text-xs lg:hidden">
                                <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
                                <span className="font-medium">{daysRemaining} days left</span>
                              </div>
                              <Progress value={progress} className="h-2.5" />
                            </div>
                          )}

                          {inv.status === "cancelled" && (
                            <div className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-xs text-destructive">
                              <XCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                              <div>
                                <span className="font-semibold">Cancelled</span>
                                {inv.cancellation_reason && <span className="text-muted-foreground"> · {inv.cancellation_reason as string}</span>}
                                {Number(inv.refunded_amount) > 0 && (
                                  <div className="mt-0.5 text-foreground">Refunded: <span className="font-semibold">${Number(inv.refunded_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-4 lg:border-l lg:pl-8 lg:min-w-[260px]">
                          <div className="grid grid-cols-3 gap-4 lg:gap-6">
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Invested</div>
                              <div className="font-bold text-base">${Number(inv.amount).toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Total ROI</div>
                              <div className="font-bold text-base text-primary">+{inv.roi_percentage as string}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground mb-1">Earned</div>
                              <div className="font-bold text-base text-success">
                                +${earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </div>
                            </div>
                          </div>
                          <div className="bg-muted/40 rounded-lg p-2.5 flex justify-between text-xs">
                            <span className="text-muted-foreground">Expected at maturity</span>
                            <span className="font-bold">${(Number(inv.amount) + totalExpected).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          {inv.status === "active" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive font-semibold"
                              onClick={() => setCancelTarget(inv)}
                            >
                              <XCircle className="h-4 w-4 mr-1.5" />
                              Cancel Investment
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Available Plans ──────────────────────────────────────────── */}
        <TabsContent value="available" className="mt-6">
          <Tabs value={planTab} onValueChange={v => setPlanTab(v as PlanCategory)}>
            <TabsList className="grid grid-cols-3 w-full max-w-sm h-10 mb-6">
              {CATEGORIES.map(cat => (
                <TabsTrigger key={cat.key} value={cat.key} className="gap-1.5 text-xs font-semibold">
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.key}
                  {plansByCategory[cat.key].length > 0 && (
                    <Badge variant="secondary" className="ml-0.5 h-4 px-1 text-[9px] font-bold">
                      {plansByCategory[cat.key].length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {CATEGORIES.map(cat => (
              <TabsContent
                key={cat.key}
                value={cat.key}
                className="data-[state=inactive]:hidden"
                forceMount
              >
                {isLoading ? (
                  <SkeletonGrid />
                ) : plansByCategory[cat.key].length === 0 ? (
                  <Card className="border-dashed border-2">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                      <div className={`h-14 w-14 rounded-full flex items-center justify-center ${cat.bg}`}>
                        <cat.icon className={`h-7 w-7 ${cat.color}`} />
                      </div>
                      <p className="font-semibold text-foreground">No {cat.label} Plans Available</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        {cat.label} investment plans will appear here once configured by the platform.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5">
                    {plansByCategory[cat.key].map((p, i) => (
                      <PlanCard key={p.id as string} p={p} index={i} cat={cat} />
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      {/* ── Invest Dialog ──────────────────────────────────────────────────── */}
      <Dialog open={!!selectedPlan} onOpenChange={open => { if (!open) { setSelectedPlan(null); setAmount(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">Invest in {selectedPlan?.name as string}</DialogTitle>
            <DialogDescription>Configure your amount to see projected returns before confirming.</DialogDescription>
          </DialogHeader>

          {selectedPlan && (() => {
            const cat = CATEGORIES.find(c => c.key === (selectedPlan.category || "Forex")) || CATEGORIES[0];
            const numAmount = parseFloat(amount) || 0;
            const profit = numAmount * Number(selectedPlan.roi_percentage) / 100;
            const balance = Number(profileData?.balance) || 0;
            const isValid = numAmount >= Number(selectedPlan.min_amount) && numAmount <= balance;

            return (
              <div className="space-y-5 pt-1">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${cat.bg} ${cat.color}`}>
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.label}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-muted/60 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Total ROI</p>
                    <p className="font-bold text-success text-base">+{selectedPlan.roi_percentage as string}%</p>
                  </div>
                  <div className="bg-muted/60 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Duration</p>
                    <p className="font-bold text-base">{selectedPlan.duration_days as string}d</p>
                  </div>
                  <div className="bg-muted/60 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Daily</p>
                    <p className="font-bold text-base">
                      {(Number(selectedPlan.roi_percentage) / Number(selectedPlan.duration_days)).toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <Label htmlFor="inv-amount" className="text-sm font-semibold">Investment Amount (USD)</Label>
                    <span className="text-xs text-muted-foreground">
                      Balance: <span className="font-semibold text-foreground">${balance.toLocaleString()}</span>
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <Input
                      id="inv-amount"
                      type="number"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="pl-8 text-lg font-semibold h-12"
                      min={Number(selectedPlan.min_amount)}
                    />
                  </div>
                  {amount && numAmount < Number(selectedPlan.min_amount) && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Minimum investment is ${Number(selectedPlan.min_amount).toLocaleString()}
                    </p>
                  )}
                  {amount && numAmount > balance && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Insufficient balance. Please deposit funds first.
                    </p>
                  )}
                </div>

                {isValid && (
                  <div className="bg-success/5 border border-success/20 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Profit</span>
                      <span className="font-bold text-success">
                        +${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Return</span>
                      <span className="font-bold text-foreground">
                        ${(numAmount + profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-success/10 pt-2">
                      <span className="text-muted-foreground">Payout Date</span>
                      <span className="font-semibold">
                        {format(addDays(new Date(), Number(selectedPlan.duration_days)), "MMM dd, yyyy")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  Early cancellation incurs a 10% penalty on your principal. Accrued profits are forfeited.
                </div>

                <Button
                  size="lg"
                  className="w-full font-semibold"
                  onClick={handleInvest}
                  disabled={createInvestment.isPending || !amount || !isValid}
                >
                  {createInvestment.isPending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                  ) : (
                    "Confirm Investment"
                  )}
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Cancel Confirmation Dialog ──────────────────────────────────────── */}
      <Dialog open={!!cancelTarget} onOpenChange={open => { if (!open) setCancelTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Cancel Investment
            </DialogTitle>
            <DialogDescription>
              This action is irreversible. Please review the terms carefully.
            </DialogDescription>
          </DialogHeader>

          {cancelTarget && (
            <div className="space-y-4 py-2">
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Principal Invested</span>
                  <span className="font-bold">${Number(cancelTarget.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>Cancellation Penalty (10%)</span>
                  <span className="font-bold">-${(Number(cancelTarget.amount) * 0.1).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-sm text-destructive">
                  <span>Accrued Profits Forfeited</span>
                  <span className="font-bold">-${Number(cancelTarget.profit_generated ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-destructive/20 pt-3 flex justify-between text-sm">
                  <span className="font-semibold">Amount Refunded</span>
                  <span className="font-bold text-success">
                    ${(Number(cancelTarget.amount) * 0.9).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                The refund will be credited to your available balance immediately.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCancelTarget(null)} className="flex-1">
              Keep Investment
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelInvestment.isPending}
              className="flex-1"
            >
              {cancelInvestment.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Cancelling...</>
              ) : (
                "Yes, Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet balance reminder when no balance */}
      {profileData && Number(profileData.balance) === 0 && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="flex items-center gap-3 p-4">
            <Wallet className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="text-sm">
              <span className="font-semibold text-foreground">Your balance is $0.</span>
              <span className="text-muted-foreground ml-1">Deposit funds to start investing.</span>
            </div>
            <Button size="sm" variant="outline" asChild className="ml-auto shrink-0">
              <a href="/dashboard/deposit">Deposit</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
