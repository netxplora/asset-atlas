import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, TrendingUp, Wallet, ArrowDownToLine, Copy, DollarSign, 
  Clock, CheckCircle2, AlertCircle, ArrowRight, Shield, Activity, Briefcase
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { useAdminUsers, useAdminDeposits, useAdminWithdrawals, useAdminTraders, useAdminUserInvestments } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

export default function AdminOverview() {
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const { data: deposits = [], isLoading: depositsLoading } = useAdminDeposits();
  const { data: withdrawals = [], isLoading: withdrawalsLoading } = useAdminWithdrawals();
  const { data: traders = [], isLoading: tradersLoading } = useAdminTraders();
  const { data: allInvestments = [], isLoading: investmentsLoading } = useAdminUserInvestments();

  const isLoading = usersLoading || depositsLoading || withdrawalsLoading || tradersLoading || investmentsLoading;

  const totalUsers = users.length;
  const verifiedUsers = users.filter((u: any) => u.kyc_status === "verified").length;
  const totalDeposits = deposits.filter((d: any) => d.status === "approved").reduce((sum: number, d: any) => sum + d.amount, 0);
  const totalWithdrawals = withdrawals.filter((w: any) => w.status === "approved").reduce((sum: number, w: any) => sum + w.amount, 0);
  const pendingDeposits = (deposits as Record<string, unknown>[]).filter((d) => d.status === "pending");
  const pendingWithdrawals = (withdrawals as Record<string, unknown>[]).filter((w) => w.status === "pending");
  const pendingKyc = (users as Record<string, unknown>[]).filter((u) => u.kyc_status === "pending");
  const activeTraders = (traders as Record<string, unknown>[]).filter((t) => t.is_active).length;
  const netDeposits = totalDeposits - totalWithdrawals;

  // Investment metrics
  const activeInvestments = (allInvestments as Record<string, unknown>[]).filter((i) => i.status === "active");
  const totalCapitalLocked = activeInvestments.reduce((s, i) => s + Number(i.amount), 0);
  const totalRoiDistributed = (allInvestments as Record<string, unknown>[]).reduce((s, i) => s + Number(i.profit_generated ?? 0), 0);
  const activeInvestmentCount = activeInvestments.length;

  const stats = [
    { 
      label: "Total Users", 
      value: totalUsers.toLocaleString(), 
      icon: Users, 
      sub: `${verifiedUsers} KYC verified`,
      iconBg: "bg-blue-500/10 text-blue-500",
      link: "/admin/users"
    },
    { 
      label: "Approved Deposits", 
      value: `$${totalDeposits.toLocaleString()}`, 
      icon: TrendingUp, 
      sub: `${pendingDeposits.length} pending review`,
      iconBg: "bg-success/10 text-success",
      link: "/admin/deposits"
    },
    { 
      label: "Approved Withdrawals", 
      value: `$${totalWithdrawals.toLocaleString()}`, 
      icon: ArrowDownToLine, 
      sub: `${pendingWithdrawals.length} pending review`,
      iconBg: "bg-warning/10 text-warning",
      link: "/admin/withdrawals"
    },
    { 
      label: "Capital Locked", 
      value: `$${totalCapitalLocked.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: Briefcase, 
      sub: `${activeInvestmentCount} active investment${activeInvestmentCount !== 1 ? "s" : ""}`,
      iconBg: "bg-purple-500/10 text-purple-500",
      link: "/admin/investments"
    },
    { 
      label: "ROI Distributed", 
      value: `$${totalRoiDistributed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: DollarSign, 
      sub: "Credited to user balances",
      iconBg: "bg-success/10 text-success",
      link: "/admin/investments"
    },
    { 
      label: "Net Revenue", 
      value: `$${netDeposits.toLocaleString()}`, 
      icon: Activity, 
      sub: "Deposits minus withdrawals",
      iconBg: netDeposits >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
      link: "/admin/transactions"
    },
    { 
      label: "Active Traders", 
      value: activeTraders.toString(), 
      icon: Copy, 
      sub: `${(traders as Record<string, unknown>[]).length} total traders`,
      iconBg: "bg-blue-500/10 text-blue-500",
      link: "/admin/traders"
    },
    { 
      label: "KYC Pending", 
      value: pendingKyc.length.toString(), 
      icon: Shield, 
      sub: `${verifiedUsers} already verified`,
      iconBg: "bg-orange-500/10 text-orange-500",
      link: "/admin/kyc"
    },
  ];

  const pendingActions = [
    ...pendingDeposits.slice(0, 4).map((d) => ({
      id: d.id as string,
      type: "deposit" as const,
      label: `Deposit: $${Number(d.amount)?.toLocaleString()} ${(d.currency as string) || ''}`,
      user: (`${(d as Record<string, Record<string,unknown>>).profiles?.first_name || ''} ${(d as Record<string, Record<string,unknown>>).profiles?.last_name || ''}`).trim() || String((d as Record<string, Record<string,unknown>>).profiles?.email || ''),
      date: d.created_at as string,
      link: "/admin/deposits",
    })),
    ...pendingWithdrawals.slice(0, 4).map((w) => ({
      id: w.id as string,
      type: "withdrawal" as const,
      label: `Withdrawal: $${Number(w.amount)?.toLocaleString()} ${(w.currency as string) || ''}`,
      user: (`${(w as Record<string, Record<string,unknown>>).profiles?.first_name || ''} ${(w as Record<string, Record<string,unknown>>).profiles?.last_name || ''}`).trim() || String((w as Record<string, Record<string,unknown>>).profiles?.email || ''),
      date: w.created_at as string,
      link: "/admin/withdrawals",
    })),
    ...pendingKyc.slice(0, 3).map((u) => ({
      id: u.user_id as string,
      type: "kyc" as const,
      label: `KYC Review: ${u.first_name as string} ${u.last_name as string}`,
      user: u.email as string,
      date: (u.updated_at || u.created_at) as string,
      link: "/admin/kyc",
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const typeConfig: Record<string, { icon: React.ElementType; color: string }> = {
    deposit: { icon: Wallet, color: "bg-success/10 text-success" },
    withdrawal: { icon: ArrowDownToLine, color: "bg-warning/10 text-warning" },
    kyc: { icon: Shield, color: "bg-blue-500/10 text-blue-500" },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">Admin Control Panel</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">Consolidated platform metrics and pending review actions.</p>
        </div>
        {!isLoading && pendingActions.length > 0 && (
          <Badge variant="outline" className="border-warning text-warning font-semibold px-3 py-1 text-xs self-start sm:self-auto">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            {pendingActions.length} action{pendingActions.length !== 1 ? 's' : ''} needed
          </Badge>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array(8).fill(0).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-7 w-24 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          : stats.map((s) => (
              <Link key={s.label} to={s.link}>
                <Card className="hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${s.iconBg}`}>
                        <s.icon className="h-5 w-5" />
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all group-hover:translate-x-0.5" />
                    </div>
                    <div className="text-2xl font-bold font-heading">{s.value}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground/70 mt-2">{s.sub}</div>
                  </CardContent>
                </Card>
              </Link>
            ))}
      </div>

      {/* Advanced Analytics */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base flex items-center gap-2"><Activity className="h-4 w-4 text-primary" /> Financial Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: "Current", Deposits: totalDeposits, Withdrawals: totalWithdrawals, "Capital Locked": totalCapitalLocked, "ROI Out": totalRoiDistributed },
                ]} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="Deposits" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Withdrawals" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Capital Locked" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ROI Out" fill="hsl(270 60% 60%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> User Demographics</CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex flex-col items-center justify-center">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Verified', value: verifiedUsers, color: 'hsl(var(--success))' },
                      { name: 'Pending', value: pendingKyc.length, color: 'hsl(var(--warning))' },
                      { name: 'Unverified', value: totalUsers - verifiedUsers - pendingKyc.length, color: 'hsl(var(--muted-foreground))' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      { name: 'Verified', value: verifiedUsers, color: 'hsl(var(--success))' },
                      { name: 'Pending', value: pendingKyc.length, color: 'hsl(var(--warning))' },
                      { name: 'Unverified', value: totalUsers - verifiedUsers - pendingKyc.length, color: 'hsl(var(--muted-foreground))' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center mt-2 text-sm text-muted-foreground">
              Total platform users: <span className="font-bold text-foreground">{totalUsers}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom panels */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-warning" /> Pending Actions
              </span>
              {!isLoading && (
                <Badge variant="secondary" className="text-xs">{pendingActions.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[420px] overflow-y-auto">
              {isLoading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))
              ) : pendingActions.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-success/50 mb-2" />
                  <p className="text-sm text-muted-foreground font-medium">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No pending items require your attention.</p>
                </div>
              ) : (
                pendingActions.map((item) => {
                  const config = typeConfig[item.type];
                  const Icon = config.icon;
                  return (
                    <Link
                      key={item.id}
                      to={item.link}
                      className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors group"
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.label}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.user}</div>
                      </div>
                      <div className="text-[11px] text-muted-foreground/60 whitespace-nowrap shrink-0">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Recent Users
              </span>
              <Button variant="ghost" size="sm" asChild className="text-xs h-7">
                <Link to="/admin/users">View All</Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-[420px] overflow-y-auto">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-40" /></div>
                    </div>
                    <div className="text-right space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-3 w-12" /></div>
                  </div>
                ))
              ) : users.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">No users registered yet.</div>
              ) : (
                (users as Record<string, unknown>[]).slice(0, 6).map((u) => (
                  <div key={u.user_id as string} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                        {((u.first_name as string)?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate">{u.first_name as string} {u.last_name as string}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email as string}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <div className="font-bold text-sm">${(Number(u.balance) || 0).toLocaleString()}</div>
                      <Badge 
                        variant={u.kyc_status === "verified" ? "default" : "outline"} 
                        className={`text-[10px] mt-1 ${u.kyc_status === "verified" ? "bg-success" : "capitalize"}`}
                      >
                        {u.kyc_status as string}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
