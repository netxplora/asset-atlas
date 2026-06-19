import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2, Briefcase, TrendingUp, Calendar, AlertCircle, ArrowRight, Wallet } from "lucide-react";
import { useState } from "react";
import { useInvestmentPlans, useUserInvestments, useCreateUserInvestment } from "@/hooks/useSupabaseData";
import { useProfile } from "@/hooks/useSupabaseData";
import { differenceInDays, addDays, format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Investments() {
  const { data: allPlans = [], isLoading: loadingPlans } = useInvestmentPlans();
  const { data: myInvestments = [], isLoading: loadingInv } = useUserInvestments();
  const { data: profile } = useProfile();
  const createInvestment = useCreateUserInvestment();
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [amount, setAmount] = useState("");

  const activePlans = allPlans.filter((p: any) => p.is_active);
  const isLoading = loadingPlans || loadingInv;

  const handleInvest = () => {
    if (!selectedPlan || !amount) return;
    const numAmount = parseFloat(amount);
    if (numAmount < selectedPlan.min_amount) return;
    if (numAmount > (profile?.balance || 0)) {
      // Balance checked in UI, this is a fallback
      return;
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + selectedPlan.duration_days);

    createInvestment.mutate({
      plan_id: selectedPlan.id,
      amount: numAmount,
      roi_percentage: selectedPlan.roi_percentage,
      duration_days: selectedPlan.duration_days,
      end_date: endDate.toISOString(),
    }, {
      onSuccess: () => { setSelectedPlan(null); setAmount(""); },
    });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-success/10 text-success border-success/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Investments</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your active plans and discover new investment opportunities.</p>
      </div>
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="active">Active Investments</TabsTrigger>
          <TabsTrigger value="available">Available Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="grid gap-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-1 space-y-4">
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                        <Skeleton className="h-2 w-full" />
                      </div>
                      <div className="flex gap-4 md:w-1/3">
                        <div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-full" /></div>
                        <div className="space-y-2 flex-1"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-6 w-full" /></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : myInvestments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Active Investments</h3>
                <p className="text-muted-foreground max-w-sm mb-6">
                  You don't have any active investment plans yet. Browse our available plans to start earning.
                </p>
                <Button onClick={() => document.querySelector<HTMLButtonElement>('[value="available"]')?.click()}>
                  Browse Plans
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {myInvestments.map((inv: any, index: number) => {
                const plan = inv.plan;
                const totalDays = inv.duration_days;
                const daysElapsed = Math.max(0, differenceInDays(new Date(), new Date(inv.start_date)));
                const daysRemaining = Math.max(0, totalDays - daysElapsed);
                const progress = Math.min((daysElapsed / totalDays) * 100, 100);
                const earned = (inv.amount * inv.roi_percentage / 100) * Math.min(daysElapsed / totalDays, 1);
                const totalExpected = (inv.amount * inv.roi_percentage / 100);

                return (
                  <Card key={inv.id} className="overflow-hidden animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <div className="h-1 w-full bg-gradient-primary" />
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-lg font-semibold">{plan?.name || "Investment Plan"}</h3>
                                <Badge variant="outline" className={getStatusColor(inv.status)}>
                                  {inv.status === "active" ? "Active" : inv.status === "completed" ? "Completed" : "Cancelled"}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Started {format(new Date(inv.start_date), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div className="text-right hidden lg:block">
                              <div className="text-sm text-muted-foreground mb-1">{daysRemaining} days remaining</div>
                              <div className="font-medium text-sm">{Math.round(progress)}% Complete</div>
                            </div>
                          </div>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-sm lg:hidden">
                              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
                              <span className="font-medium">{daysRemaining} days remaining</span>
                            </div>
                            <Progress value={progress} className="h-2.5" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-8 pt-4 lg:pt-0 lg:border-l lg:pl-8">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Invested</div>
                            <div className="font-semibold text-lg">${Number(inv.amount).toLocaleString()}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Target ROI</div>
                            <div className="font-semibold text-lg text-primary">+{inv.roi_percentage}%</div>
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <div className="text-sm text-muted-foreground mb-1">Current Earnings</div>
                            <div className="font-semibold text-lg text-success flex items-baseline gap-1">
                              +${earned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              <span className="text-xs font-normal text-muted-foreground">/ ${totalExpected.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="available" className="mt-6">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between"><Skeleton className="h-6 w-1/2" /><Skeleton className="h-5 w-16" /></div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-10 w-1/2" />
                    <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))
            ) : activePlans.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No investment plans are currently available.</p>
              </div>
            ) : (
              activePlans.map((p: any, index: number) => (
                <Card key={p.id} className="hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg">{p.name}</CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{p.category || "General"}</Badge>
                    </div>
                    {p.description && <CardDescription>{p.description}</CardDescription>}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="mb-6 flex items-end gap-2 border-b pb-4">
                        <div className="text-4xl font-bold font-heading text-primary">{p.roi_percentage}%</div>
                        <div className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">ROI</div>
                      </div>
                      
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4" /> Min. Deposit</span>
                          <span className="font-medium">${Number(p.min_amount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Duration</span>
                          <span className="font-medium">{p.duration_days} Days</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Payout</span>
                          <span className="font-medium">At End of Term</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full group" 
                      onClick={() => { setSelectedPlan(p); setAmount(String(p.min_amount)); }}
                    >
                      Invest Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Invest Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={(open) => { if (!open) setSelectedPlan(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">Invest in {selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Configure your investment amount to calculate your potential returns.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-6 py-2">
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg border">
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Duration</div>
                  <div className="font-semibold">{selectedPlan.duration_days} Days</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Target ROI</div>
                  <div className="font-semibold text-success">+{selectedPlan.roi_percentage}%</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <Label htmlFor="amount" className="text-sm font-medium">Investment Amount (USD)</Label>
                  <span className="text-xs text-muted-foreground">
                    Available: <span className="font-medium text-foreground">${Number(profile?.balance || 0).toLocaleString()}</span>
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input 
                    id="amount"
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    className="pl-8 text-lg font-medium"
                  />
                </div>
                
                {amount && parseFloat(amount) < selectedPlan.min_amount && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> Minimum investment is ${Number(selectedPlan.min_amount).toLocaleString()}
                  </p>
                )}
                {amount && parseFloat(amount) > (profile?.balance || 0) && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> Insufficient balance. Please deposit funds first.
                  </p>
                )}
              </div>

              {amount && parseFloat(amount) >= selectedPlan.min_amount && parseFloat(amount) <= (profile?.balance || Infinity) && (
                <div className="bg-success/5 border border-success/20 p-4 rounded-lg space-y-2 animate-fade-in-up">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Profit</span>
                    <span className="font-semibold text-success">
                      +${(parseFloat(amount) * selectedPlan.roi_percentage / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Return</span>
                    <span className="font-semibold text-foreground">
                      ${(parseFloat(amount) * (1 + selectedPlan.roi_percentage / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-success/10 mt-2">
                    <span className="text-muted-foreground">Estimated Payout Date</span>
                    <span className="font-medium text-foreground">
                      {format(addDays(new Date(), selectedPlan.duration_days), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                className="w-full font-semibold"
                onClick={handleInvest}
                disabled={
                  createInvestment.isPending ||
                  !amount ||
                  parseFloat(amount) < selectedPlan.min_amount ||
                  parseFloat(amount) > (profile?.balance || 0)
                }
              >
                {createInvestment.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Investment"
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
