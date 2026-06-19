import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, TrendingUp, BarChart3, ArrowUpRight, Copy, ArrowRight, ShieldCheck, ArrowDownToLine, History, AlertCircle } from "lucide-react";
import { useProfile, useUserTransactions, useTraders, useUserInvestments, useUserActiveDepositIntent, useCancelDepositIntent, useCheckDepositLifecycle } from "@/hooks/useSupabaseData";
import { differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-5 w-5 rounded-full" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: transactions, isLoading: txLoading } = useUserTransactions();
  const { data: traders, isLoading: tradersLoading } = useTraders();
  const { data: investments = [], isLoading: invLoading } = useUserInvestments();

  const { data: activeIntent } = useUserActiveDepositIntent();
  const cancelDepositIntent = useCancelDepositIntent();
  const checkLifecycle = useCheckDepositLifecycle();
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  useEffect(() => {
    checkLifecycle.mutate();
  }, []);

  const isLoading = profileLoading || txLoading || tradersLoading || invLoading;

  const totalBalance = profile?.balance || 0;
  const depositTotal = transactions?.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((acc, t) => acc + (t.amount || 0), 0) || 0;

  const activeInvestments = investments.filter((inv: any) => inv.status === 'active');
  const totalInvested = activeInvestments.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
  const totalEarned = activeInvestments.reduce((sum: number, inv: any) => {
    const daysElapsed = differenceInDays(new Date(), new Date(inv.start_date));
    const progress = Math.min(daysElapsed / inv.duration_days, 1);
    return sum + (Number(inv.amount) * Number(inv.roi_percentage) / 100) * progress;
  }, 0);
  const avgRoi = totalInvested > 0 ? (totalEarned / totalInvested * 100) : 0;

  const stats = [
    { label: "Account Balance", value: `$${totalBalance.toLocaleString()}`, icon: Wallet, change: null, gradient: "bg-gradient-blue", text: "text-white" },
    { label: "Total Deposits", value: `$${depositTotal.toLocaleString()}`, icon: TrendingUp, change: null, gradient: "bg-gradient-amber", text: "text-white" },
    { label: "Active Investments", value: String(activeInvestments.length), icon: BarChart3, change: null, gradient: "bg-gradient-purple", text: "text-white" },
    { label: "Total ROI", value: `${avgRoi.toFixed(1)}%`, icon: ArrowUpRight, change: null, gradient: "bg-gradient-green", text: "text-white" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-heading font-bold">Welcome back, {profile?.first_name || 'Investor'}</h1>
          <p className="text-muted-foreground text-sm">Here's what's happening with your account today.</p>
        </div>
        
        {!profileLoading && profile && profile.kyc_status !== "verified" && (
          <div className="flex items-center gap-2 bg-warning/10 text-warning border border-warning/20 px-4 py-2 rounded-lg text-sm font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span>Identity verification required for withdrawals.</span>
            <Link to="/dashboard/profile" className="underline ml-1">Verify Now</Link>
          </div>
        )}
      </div>

      {activeIntent && (activeIntent.status === "Awaiting Payment" || activeIntent.status === "Awaiting Confirmation") && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Unfinished Cryptocurrency Purchase</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                You started a purchase of {activeIntent.selected_currency} on {new Date(activeIntent.initiated_timestamp).toLocaleString()}. Continue your deposit confirmation below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Button variant="default" size="sm" asChild className="w-full md:w-auto font-semibold">
              <Link to="/dashboard/deposit">Continue Deposit</Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full md:w-auto text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Deposit
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading 
          ? Array(4).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((s, i) => (
            <Card key={s.label} className={`border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up ${s.gradient} ${s.text}`} style={{ animationDelay: `${(i + 1) * 100}ms` }}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <s.icon className="h-4 w-4 text-white" />
                  </div>
                  {s.change && (
                    <span className="text-[10px] sm:text-xs font-medium text-white flex items-center gap-0.5 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                      <ArrowUpRight className="h-3 w-3" />{s.change}
                    </span>
                  )}
                </div>
                <div className="text-xl sm:text-2xl font-bold font-heading truncate">{s.value}</div>
                <div className="text-[10px] sm:text-xs text-white/80 mt-1 font-medium">{s.label}</div>
              </CardContent>
            </Card>
          ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="text-base font-heading">Recent Transactions</CardTitle>
              <CardDescription>Your latest financial activity</CardDescription>
            </div>
            <Link to="/dashboard/transactions" className="text-xs text-primary hover:underline flex items-center">
              View All <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50">
                    <div className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right flex flex-col items-end">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                  </div>
                ))
              ) : transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'deposit' || tx.type.includes('profit') ? 'bg-success/10 text-success' : tx.type === 'withdrawal' ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                        {tx.type === 'deposit' ? <TrendingUp className="h-4 w-4" /> : tx.type === 'withdrawal' ? <Wallet className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                      </div>
                      <div>
                        <div className="font-medium text-sm capitalize">{tx.type}</div>
                        <div className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold text-sm ${tx.type === 'deposit' || tx.type.includes('profit') ? "text-success" : "text-foreground"}`}>
                        {tx.type === 'deposit' || tx.type.includes('profit') ? '+' : ''}${tx.amount}
                      </div>
                      <div className={`text-[10px] font-medium uppercase px-2 py-0.5 rounded-full inline-block mt-1 ${tx.status === 'completed' ? 'bg-success/10 text-success' : tx.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                        {tx.status}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-center p-8 bg-muted/20 rounded-lg border border-dashed flex flex-col items-center justify-center space-y-3">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <History className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <div>
                    <p className="font-medium">No recent transactions</p>
                    <p className="text-muted-foreground text-xs mt-1">When you deposit or invest, it will appear here.</p>
                  </div>
                  <Button variant="outline" size="sm" asChild className="mt-2">
                    <Link to="/dashboard/deposit">Deposit Funds</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="text-base font-heading">Top Traders</CardTitle>
              </div>
              <Link to="/dashboard/copy-trading" className="text-xs text-primary hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))
                ) : traders && traders.length > 0 ? (
                  traders.slice(0, 4).map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={c.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + c.name} alt={c.name} className="w-8 h-8 rounded-full bg-muted border" />
                        <div>
                          <div className="font-medium text-sm leading-none mb-1">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">{c.followers} Followers</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-xs text-success bg-success/10 px-2 py-0.5 rounded-full inline-block">+{c.win_rate}% Win</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground p-2 text-center">No traders available</div>
                )}
              </div>
            </CardContent>
          </Card>

          {activeIntent && (
            <Card className="border shadow-sm animate-fade-in-up" style={{ animationDelay: "450ms" }}>
              <CardHeader className="pb-2 border-b">
                <CardTitle className="text-base font-heading flex items-center justify-between">
                  Pending Deposit Activity
                  <Badge className="bg-warning/10 text-warning border-0 text-[10px] uppercase font-bold tracking-wider">{activeIntent.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="text-xs space-y-2 bg-muted/30 p-3 rounded-lg border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Currency:</span>
                    <span className="font-bold">{activeIntent.selected_currency}</span>
                  </div>
                  {activeIntent.selected_network && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-medium">{activeIntent.selected_network}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initiated:</span>
                    <span>{new Date(activeIntent.initiated_timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                {(activeIntent.status === "Awaiting Payment" || activeIntent.status === "Awaiting Confirmation") ? (
                  <Button className="w-full font-semibold group flex items-center justify-center gap-2" asChild>
                    <Link to="/dashboard/deposit">
                      Continue Confirmation <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full font-semibold bg-muted text-muted-foreground" disabled>
                    Under Review
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="border shadow-sm animate-fade-in-up" style={{ animationDelay: "500ms" }}>
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-base font-heading">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-3">
                <Link to="/dashboard/deposit" className="flex flex-col items-center justify-center p-4 bg-muted/30 border rounded-xl hover:bg-gradient-blue hover:text-white hover:border-transparent transition-all text-xs font-semibold shadow-sm group">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <Wallet className="h-5 w-5 text-blue-600" />
                  </div>
                  Deposit
                </Link>
                <Link to="/dashboard/withdraw" className="flex flex-col items-center justify-center p-4 bg-muted/30 border rounded-xl hover:bg-gradient-amber hover:text-white hover:border-transparent transition-all text-xs font-semibold shadow-sm group">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <ArrowDownToLine className="h-5 w-5 text-amber-500" />
                  </div>
                  Withdraw
                </Link>
                <Link to="/dashboard/investments" className="flex flex-col items-center justify-center p-4 bg-muted/30 border rounded-xl hover:bg-gradient-purple hover:text-white hover:border-transparent transition-all text-xs font-semibold shadow-sm group">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                  </div>
                  Invest
                </Link>
                <Link to="/dashboard/copy-trading" className="flex flex-col items-center justify-center p-4 bg-muted/30 border rounded-xl hover:bg-gradient-teal hover:text-white hover:border-transparent transition-all text-xs font-semibold shadow-sm group">
                  <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                    <Copy className="h-5 w-5 text-teal-600" />
                  </div>
                  Copy Trade
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Cancel Deposit Process?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this pending deposit process? This action cannot be undone and will cancel your session.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setShowCancelDialog(false)} disabled={cancelDepositIntent.isPending}>
              Keep Active
            </Button>
            <Button 
              variant="destructive" 
              onClick={async () => {
                if (activeIntent) {
                  await cancelDepositIntent.mutateAsync(activeIntent.id);
                  setShowCancelDialog(false);
                }
              }}
              disabled={cancelDepositIntent.isPending}
            >
              {cancelDepositIntent.isPending ? "Cancelling..." : "Cancel Deposit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Force reload
