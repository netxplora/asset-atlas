import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { differenceInDays } from "date-fns";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Wallet, TrendingUp, BarChart3, ArrowUpRight, Copy, ArrowRight,
  ShieldCheck, ArrowDownToLine, History, AlertCircle, PieChart as PieIcon,
  CheckCircle2, Clock, ExternalLink, RefreshCw
} from "lucide-react";
import {
  useProfile, useUserTransactions, useTraders, useUserInvestments,
  useUserActiveDepositIntent, useCancelDepositIntent, useCheckDepositLifecycle
} from "@/hooks/useSupabaseData";

const ALLOCATION_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#8B5CF6"];

function StatSkeleton() {
  return (
    <Card className="border border-border/70 shadow-sm bg-card">
      <CardContent className="p-4 sm:p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: transactions = [], isLoading: txLoading } = useUserTransactions();
  const { data: traders = [], isLoading: tradersLoading } = useTraders();
  const { data: investments = [], isLoading: invLoading } = useUserInvestments();

  const { data: activeIntent } = useUserActiveDepositIntent();
  const cancelDepositIntent = useCancelDepositIntent();
  const checkLifecycle = useCheckDepositLifecycle();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any | null>(null);

  useEffect(() => {
    checkLifecycle.mutate();
  }, []);

  const isLoading = profileLoading || txLoading || tradersLoading || invLoading;

  const totalBalance = profile?.balance || 0;
  const depositTotal = transactions
    .filter((t: any) => t.type === 'deposit' && t.status === 'completed')
    .reduce((acc: number, t: any) => acc + (t.amount || 0), 0);

  const activeInvestments = investments.filter((inv: any) => inv.status === 'active');
  const totalInvested = activeInvestments.reduce((sum: number, inv: any) => sum + Number(inv.amount || 0), 0);
  const totalEarned = activeInvestments.reduce((sum: number, inv: any) => {
    const daysElapsed = differenceInDays(new Date(), new Date(inv.start_date || new Date()));
    const progress = Math.min(Math.max(daysElapsed / (inv.duration_days || 30), 0), 1);
    return sum + (Number(inv.amount || 0) * Number(inv.roi_percentage || 0) / 100) * progress;
  }, 0);

  const avgRoi = totalInvested > 0 ? (totalEarned / totalInvested * 100) : 0;
  const availableBalance = Math.max(totalBalance - totalInvested, 0);

  // Asset allocation breakdown
  const forexTotal = activeInvestments.filter((i: any) => i.plans?.category === 'Forex' || i.plans?.category === 'forex').reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  const cryptoTotal = activeInvestments.filter((i: any) => i.plans?.category === 'Crypto' || i.plans?.category === 'crypto').reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  const commodityTotal = activeInvestments.filter((i: any) => i.plans?.category === 'Commodities' || i.plans?.category === 'commodities').reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
  
  const allocationData = [
    ...(forexTotal > 0 ? [{ name: "Forex", value: forexTotal }] : []),
    ...(cryptoTotal > 0 ? [{ name: "Crypto", value: cryptoTotal }] : []),
    ...(commodityTotal > 0 ? [{ name: "Commodities", value: commodityTotal }] : []),
  ];

  const hasInvestments = activeInvestments.length > 0;

  // Real data for chart (if investments exist, we'll plot current value)
  const performanceChartData = hasInvestments ? [
    { month: "Start", balance: totalBalance - totalEarned },
    { month: "Current", balance: totalBalance },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground">
            Portfolio Overview
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Welcome back, {profile?.first_name ? `${profile.first_name}` : "Investor"}. Here is your real-time account summary.
          </p>
        </div>

        {!profileLoading && profile && profile.kyc_status !== "verified" && (
          <div className="flex items-center gap-2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-3.5 py-2 rounded-xl text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>Identity verification required for withdrawals.</span>
            <Link to="/dashboard/profile" className="underline ml-1 font-bold">Verify ID</Link>
          </div>
        )}
      </div>

      {/* Active Deposit Intent Alert Banner */}
      {activeIntent && (activeIntent.status === "Awaiting Payment" || activeIntent.status === "Awaiting Confirmation") && (
        <div className="bg-primary/5 border border-primary/25 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading font-bold text-sm text-foreground">Pending Direct Deposit In Progress</h4>
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0 text-[10px] font-semibold">
                  {activeIntent.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                You initiated a deposit in {activeIntent.selected_currency} ({activeIntent.selected_network || "Mainnet"}). Complete verification or track status.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Button size="sm" asChild className="w-full sm:w-auto font-semibold shadow-sm">
              <Link to="/dashboard/deposit">
                Continue Deposit <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCancelDialog(true)}
              className="w-full sm:w-auto text-xs text-muted-foreground hover:text-destructive"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ─── 2-Column Mobile-First Primary Cards Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            {/* Total Balance */}
            <Card className="border border-border/80 shadow-elevation-sm bg-card">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Balance</span>
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">
                  ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Available: ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </CardContent>
            </Card>

            {/* Total Profit Earned */}
            <Card className="border border-border/80 shadow-elevation-sm bg-card">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Profit</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-success truncate">
                  +${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <ArrowUpRight className="h-3 w-3" /> {avgRoi.toFixed(1)}% Avg Yield
                </div>
              </CardContent>
            </Card>

            {/* Active Investments */}
            <Card className="border border-border/80 shadow-elevation-sm bg-card">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active Plans</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">
                  {activeInvestments.length} Active
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Invested: ${totalInvested.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            {/* Total Deposits */}
            <Card className="border border-border/80 shadow-elevation-sm bg-card">
              <CardContent className="p-4 sm:p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Deposited</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <History className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-heading font-bold text-foreground truncate">
                  ${depositTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Direct On-Chain Deposits
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ─── Prominent Quick Actions Grid ─── */}
      <div className="space-y-3">
        <h2 className="text-sm font-heading font-semibold text-foreground uppercase tracking-wider">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to="/dashboard/deposit"
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-primary/50 hover:shadow-elevation-sm transition-all text-xs font-semibold text-foreground group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <span>Deposit Funds</span>
          </Link>

          <Link
            to="/dashboard/withdraw"
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-amber-500/50 hover:shadow-elevation-sm transition-all text-xs font-semibold text-foreground group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-amber-500">
              <ArrowDownToLine className="h-5 w-5" />
            </div>
            <span>Withdraw Funds</span>
          </Link>

          <Link
            to="/dashboard/investments"
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-blue-500/50 hover:shadow-elevation-sm transition-all text-xs font-semibold text-foreground group"
          >
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-blue-500">
              <BarChart3 className="h-5 w-5" />
            </div>
            <span>Explore Plans</span>
          </Link>

          <Link
            to="/dashboard/copy-trading"
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-emerald-500/50 hover:shadow-elevation-sm transition-all text-xs font-semibold text-foreground group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-emerald-500">
              <Copy className="h-5 w-5" />
            </div>
            <span>Copy Trading</span>
          </Link>

          <Link
            to="/dashboard/portfolio"
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-purple-500/50 hover:shadow-elevation-sm transition-all text-xs font-semibold text-foreground group"
          >
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-purple-500">
              <PieIcon className="h-5 w-5" />
            </div>
            <span>My Portfolio</span>
          </Link>

          <Link
            to="/dashboard/profile"
            className="flex flex-col items-center justify-center p-3.5 sm:p-4 bg-card border border-border/80 rounded-xl hover:border-primary/50 hover:shadow-elevation-sm transition-all text-xs font-semibold text-foreground group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span>Verification & 2FA</span>
          </Link>
        </div>
      </div>

      {/* ─── Visual Charts & Activity Grid ─── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2 border border-border shadow-elevation-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
            <div>
              <CardTitle className="text-base font-heading font-bold text-foreground">
                Portfolio Growth & Yield
              </CardTitle>
              <CardDescription className="text-xs">
                Historical monthly return progression
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-semibold">
              Live Analytics
            </Badge>
          </CardHeader>
          <CardContent className="pt-5">
            {!hasInvestments ? (
              <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 border border-dashed rounded-xl bg-muted/20">
                <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-sm font-semibold text-foreground mb-1">Portfolio Performance</h3>
                <p className="text-xs text-muted-foreground max-w-[250px] mb-4">
                  Performance data will appear here after your first investment.
                </p>
                <Button size="sm" asChild variant="outline">
                  <Link to="/dashboard/investments">Explore Investments</Link>
                </Button>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0F172A", borderColor: "#1E293B", borderRadius: "8px", color: "#fff", fontSize: "12px" }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Balance"]}
                    />
                    <Area type="monotone" dataKey="balance" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBalance)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Asset Diversification */}
        <Card className="border border-border shadow-elevation-sm bg-card flex flex-col justify-between">
          <CardHeader className="pb-2 border-b">
            <CardTitle className="text-base font-heading font-bold text-foreground">
              Asset Allocation
            </CardTitle>
            <CardDescription className="text-xs">
              Distribution across asset categories
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
            {!hasInvestments ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6 border border-dashed rounded-xl bg-muted/20">
                <PieIcon className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-xs text-muted-foreground max-w-[200px]">
                  No active assets allocated. Start investing to build your portfolio.
                </p>
              </div>
            ) : (
              <>
                <div className="h-44 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ALLOCATION_COLORS[index % ALLOCATION_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", color: "#fff", fontSize: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-2 border-t text-xs">
                  {allocationData.map((data, idx) => (
                    <div key={data.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ALLOCATION_COLORS[idx % ALLOCATION_COLORS.length] }} /> 
                        {data.name}
                      </span>
                      <span className="font-semibold text-foreground">
                        {((data.value / totalInvested) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Recent Transactions & Recommended Traders ─── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 border border-border shadow-elevation-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div>
              <CardTitle className="text-base font-heading font-bold text-foreground">
                Recent Financial Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Latest deposits, withdrawals, and strategy yields
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-primary">
              <Link to="/dashboard/transactions">
                View All <ArrowRight className="h-3 w-3 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-xl">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1.5 flex-1 ml-3">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))
              ) : transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx: any) => {
                  const isPositive = tx.type === 'deposit' || tx.type.includes('profit');
                  const statusColor =
                    tx.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    tx.status === 'pending' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-destructive/10 text-destructive';

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/70 hover:bg-muted/40 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                          {tx.type === 'deposit' ? <TrendingUp className="h-4 w-4" /> : tx.type === 'withdrawal' ? <ArrowDownToLine className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                        </div>
                        <div>
                          <div className="font-heading font-semibold text-xs sm:text-sm text-foreground capitalize">{tx.type}</div>
                          <div className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className={`font-heading font-bold text-xs sm:text-sm ${isPositive ? 'text-success' : 'text-foreground'}`}>
                          {isPositive ? '+' : ''}${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block ${statusColor}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 bg-muted/20 border border-dashed rounded-xl space-y-2">
                  <History className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="text-xs font-semibold text-foreground">No recent transactions recorded</p>
                  <p className="text-[11px] text-muted-foreground">When you fund your account or invest, receipts appear here.</p>
                  <Button size="sm" variant="outline" asChild className="mt-2 text-xs">
                    <Link to="/dashboard/deposit">Deposit Funds</Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Verified Traders */}
        <Card className="border border-border shadow-elevation-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
            <div>
              <CardTitle className="text-base font-heading font-bold text-foreground">
                Top Copy Traders
              </CardTitle>
              <CardDescription className="text-xs">
                Verified market performance
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-xs font-semibold text-primary">
              <Link to="/dashboard/copy-trading">Explore</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))
              ) : traders.length > 0 ? (
                traders.slice(0, 4).map((trader: any) => (
                  <div key={trader.id} className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={trader.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trader.name}`}
                        alt={trader.name}
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div>
                        <div className="font-heading font-semibold text-xs text-foreground">{trader.name}</div>
                        <div className="text-[10px] text-muted-foreground">{trader.followers || 0} Copiers</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      +{trader.win_rate || 0}% Win
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No traders available.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cancel Deposit Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-lg">Cancel Deposit Process?</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
              Cancelling will terminate this active deposit session. Any unconfirmed payment intent will be closed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" size="sm" onClick={() => setShowCancelDialog(false)} disabled={cancelDepositIntent.isPending}>
              Keep Active
            </Button>
            <Button
              variant="destructive"
              size="sm"
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

      {/* Transaction Detail Dialog */}
      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-lg">Transaction Receipt</DialogTitle>
              <DialogDescription className="text-xs">Reference ID: {selectedTx.id}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-xs py-2">
              <div className="flex justify-between p-2.5 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground">Transaction Type:</span>
                <span className="font-bold capitalize text-foreground">{selectedTx.type}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-bold text-foreground">${Number(selectedTx.amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-bold text-primary uppercase">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between p-2.5 bg-muted/40 rounded-lg">
                <span className="text-muted-foreground">Date:</span>
                <span className="text-foreground">{new Date(selectedTx.created_at).toLocaleString()}</span>
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setSelectedTx(null)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
