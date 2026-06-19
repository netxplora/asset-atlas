import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Briefcase, TrendingUp, PieChart, ArrowUpRight, Activity } from "lucide-react";
import { useUserInvestments, useProfile } from "@/hooks/useSupabaseData";
import { differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-8 w-32" />
      </CardContent>
    </Card>
  );
}

export default function Portfolio() {
  const { data: investments = [], isLoading: invLoading } = useUserInvestments();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const isLoading = invLoading || profileLoading;

  // Calculate portfolio stats from live investments
  const activeInvestments = investments.filter((inv: any) => inv.status === 'active');
  const totalInvested = activeInvestments.reduce((sum: number, inv: any) => sum + Number(inv.amount), 0);
  
  // Create portfolio breakdown items
  const portfolioItems = activeInvestments.map((inv: any) => {
    const totalDays = inv.duration_days;
    const daysElapsed = Math.max(0, differenceInDays(new Date(), new Date(inv.start_date)));
    const progress = Math.min(daysElapsed / totalDays, 1);
    const earned = (Number(inv.amount) * Number(inv.roi_percentage) / 100) * progress;
    const expected = (Number(inv.amount) * Number(inv.roi_percentage) / 100);
    const allocation = totalInvested > 0 ? ((Number(inv.amount) / totalInvested) * 100) : 0;

    return {
      id: inv.id,
      name: inv.plan?.name || "Investment",
      value: Number(inv.amount),
      earned,
      expected,
      roi: Number(inv.roi_percentage),
      allocation,
      status: inv.status,
    };
  }).sort((a, b) => b.allocation - a.allocation); // Sort by largest allocation first

  const totalEarned = portfolioItems.reduce((sum: number, p: any) => sum + p.earned, 0);
  const totalExpected = portfolioItems.reduce((sum: number, p: any) => sum + p.expected, 0);
  const avgRoi = portfolioItems.length > 0
    ? portfolioItems.reduce((sum: number, p: any) => sum + p.roi, 0) / portfolioItems.length
    : 0;

  const balance = Number(profile?.balance || 0);
  const totalValue = totalInvested + totalEarned + balance;

  // Calculate allocation including uninvested balance
  const balanceAllocation = totalValue > 0 ? (balance / totalValue) * 100 : 0;
  const investedAllocation = totalValue > 0 ? (totalInvested / totalValue) * 100 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">My Portfolio</h1>
        <p className="text-muted-foreground text-sm mt-1">A detailed breakdown of your asset allocation and performance.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card className="hover:shadow-elevation-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
              <CardContent className="p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="text-sm font-medium text-muted-foreground">Total Value</div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-heading relative z-10">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-5">
                  <Briefcase className="h-32 w-32" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-elevation-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <CardContent className="p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="text-sm font-medium text-muted-foreground">Total Earned</div>
                  <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-success" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-heading text-success relative z-10">
                  +${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-5 text-success">
                  <TrendingUp className="h-32 w-32" />
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-elevation-md transition-all duration-300 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
              <CardContent className="p-5 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2 relative z-10">
                  <div className="text-sm font-medium text-muted-foreground">Avg. ROI</div>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold font-heading text-success relative z-10">
                  +{avgRoi.toFixed(1)}%
                </div>
                <div className="absolute -right-6 -bottom-6 opacity-5">
                  <Activity className="h-32 w-32" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Asset Allocation</CardTitle>
            <CardDescription>Breakdown of your active investments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between"><Skeleton className="h-4 w-1/4" /><Skeleton className="h-4 w-1/5" /></div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : portfolioItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg bg-muted/20">
                <PieChart className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <h3 className="text-base font-semibold mb-1">No Active Investments</h3>
                <p className="text-sm text-muted-foreground max-w-[250px] mb-4">
                  You need active investments to see your portfolio allocation.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/investments">Explore Plans</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {portfolioItems.map((p: any, i: number) => (
                  <div key={p.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{p.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium">
                          {p.allocation.toFixed(1)}%
                        </span>
                      </div>
                      <span className="text-muted-foreground font-medium">
                        ${p.value.toLocaleString()} <span className="text-success ml-1">+{p.roi}%</span>
                      </span>
                    </div>
                    {/* Use a varying color based on index for a chart-like feel */}
                    <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div 
                        className={`h-full flex-1 transition-all duration-500 ease-in-out ${
                          i % 3 === 0 ? 'bg-primary' : i % 3 === 1 ? 'bg-blue-500' : 'bg-indigo-500'
                        }`} 
                        style={{ width: `${p.allocation}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle className="text-lg font-heading">Performance Summary</CardTitle>
            <CardDescription>Your investment metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between py-2 border-b border-border/50"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-4 w-1/4" /></div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Total Invested</span>
                  <span className="font-semibold text-foreground">${totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Uninvested Balance</span>
                  <span className="font-semibold text-foreground">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="text-sm font-medium text-muted-foreground">Current Earnings</span>
                  <span className="font-semibold text-success flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" />
                    ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm font-medium text-muted-foreground">Expected Return</span>
                  <span className="font-semibold text-foreground">${(totalInvested + totalExpected).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>

                <div className="pt-4 mt-2 border-t">
                  <div className="w-full h-3 rounded-full flex overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${investedAllocation}%` }} title={`Invested: ${investedAllocation.toFixed(1)}%`} />
                    <div className="bg-muted-foreground/30 h-full" style={{ width: `${balanceAllocation}%` }} title={`Balance: ${balanceAllocation.toFixed(1)}%`} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Invested</div>
                    <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /> Balance</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
