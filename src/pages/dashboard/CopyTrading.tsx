import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, PlayCircle, StopCircle, RefreshCw, Users, BarChart3, ShieldCheck, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { TraderPreviewDialog } from "@/components/TraderPreviewDialog";
import { useTraders, useUserCopyTrades, useStartCopyTrade, useCancelCopyTrade, useProfile, useAppSetting } from "@/hooks/useSupabaseData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

// Generate fake sparkline data for traders
const generateSparklineData = (winRate: number) => {
  const data = [];
  let currentVal = 100;
  for (let i = 0; i < 20; i++) {
    const isWin = Math.random() < (winRate / 100);
    const change = (Math.random() * 5) * (isWin ? 1 : -1);
    currentVal += change;
    data.push({ time: i, value: currentVal });
  }
  return data;
};

export default function DashboardCopyTrading() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: traders = [], isLoading: tradersLoading } = useTraders();
  const { data: userCopyTrades = [], isLoading: tradesLoading } = useUserCopyTrades();
  const { data: globalPnlMode } = useAppSetting("global_pnl_mode");
  
  const startCopyTrade = useStartCopyTrade();
  const cancelCopyTrade = useCancelCopyTrade();
  const { toast } = useToast();

  const [previewTrader, setPreviewTrader] = useState<any | null>(null);
  const [sparklines, setSparklines] = useState<Record<string, any[]>>({});
  
  // Confirmation state
  const [confirmStartTrader, setConfirmStartTrader] = useState<any | null>(null);
  const [confirmStopTrade, setConfirmStopTrade] = useState<any | null>(null);

  // Simulated live PNL
  const [livePnL, setLivePnL] = useState<Record<string, number>>({});
  
  const isLoading = profileLoading || tradersLoading || tradesLoading;

  useEffect(() => {
    if (traders.length > 0 && Object.keys(sparklines).length === 0) {
      const newSparklines: Record<string, any[]> = {};
      traders.forEach((t: any) => {
        newSparklines[t.id] = generateSparklineData(t.win_rate);
      });
      setSparklines(newSparklines);
    }
  }, [traders]);

  useEffect(() => {
    if (!userCopyTrades.length) return;
    
    // Initialize PNL with exactly what's in the DB
    const initialPnL: Record<string, number> = {};
    userCopyTrades.forEach((trade: any) => {
      if (trade.status === 'active') {
        initialPnL[trade.id] = trade.current_pnl || 0;
      }
    });
    setLivePnL(initialPnL);

    // Simulate real-time ticking
    const interval = setInterval(() => {
      setLivePnL(prev => {
        const next = { ...prev };
        userCopyTrades.forEach((trade: any) => {
          if (trade.status === 'active' && trade.traders) {
            // Priority: per-user override > global setting > normal
            const userMode = profile?.pnl_mode || 'normal';
            const effectiveMode = userMode !== 'normal' ? userMode : (globalPnlMode || 'normal');
            let move = 0;
            
            if (effectiveMode === 'high') {
              move = Math.random() * 5 + 1; // Always positive, $1-$6 shift
            } else if (effectiveMode === 'low') {
              move = -(Math.random() * 3 + 0.5); // Always negative, drops $0.5-$3.5
            } else {
              const isWin = Math.random() < (trade.traders.win_rate / 100);
              move = (Math.random() * 2) * (isWin ? 1 : -1);
            }
            
            next[trade.id] = (next[trade.id] || 0) + move;
          }
        });
        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [userCopyTrades, profile?.pnl_mode, globalPnlMode]);

  const activeCopyTrades = userCopyTrades.filter((t: any) => t.status === 'active');

  const onConfirmStart = async () => {
    if (!confirmStartTrader) return;
    if ((profile?.balance || 0) < confirmStartTrader.min_copy_balance) {
      toast({ title: "Insufficient Balance", description: `You need at least $${confirmStartTrader.min_copy_balance.toLocaleString()} to copy this trader.`, variant: "destructive" });
      setConfirmStartTrader(null);
      return;
    }
    
    try {
      await startCopyTrade.mutateAsync({
        traderId: confirmStartTrader.id,
        allocation: confirmStartTrader.min_copy_balance
      });
      setConfirmStartTrader(null);
    } catch (e) {
      // toast is handled in mutation
    }
  };

  const onConfirmStop = async () => {
    if (!confirmStopTrade) return;
    const currentPnl = livePnL[confirmStopTrade.id] || confirmStopTrade.current_pnl || 0;
    
    try {
      await cancelCopyTrade.mutateAsync({
        tradeId: confirmStopTrade.id,
        currentPnl: currentPnl
      });
      setConfirmStopTrade(null);
    } catch (e) {
      // toast is handled in mutation
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Copy Trading</h1>
        <p className="text-muted-foreground text-sm mt-1 max-w-3xl">
          Automatically replicate the strategies of professional traders. Browse verified experts, allocate your capital, and let the platform mirror their positions in real time.
        </p>
      </div>

      {/* Active Copies Section */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      ) : activeCopyTrades.length > 0 ? (
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-xl font-semibold font-heading flex items-center gap-2">
            <div className="relative">
              <PlayCircle className="h-5 w-5 text-primary relative z-10" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            </div>
            Active Copied Traders
          </h2>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeCopyTrades.map((trade: any) => {
              const currentPnl = livePnL[trade.id] || trade.current_pnl || 0;
              const isProfit = currentPnl >= 0;
              const duration = Math.floor((new Date().getTime() - new Date(trade.created_at).getTime()) / (1000 * 60 * 60 * 24));
              const roi = (currentPnl / Number(trade.allocated_capital)) * 100;
              
              return (
                <Card key={trade.id} className="border-primary/20 bg-gradient-to-br from-background to-primary/5 hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${isProfit ? 'bg-success' : 'bg-destructive'}`} />
                  <CardContent className="p-6 flex flex-col justify-between h-full space-y-6 pt-7">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img src={trade.traders?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + trade.traders?.name} alt={trade.traders?.name} className="w-12 h-12 rounded-full border-2 border-background shadow-sm" />
                        <div>
                          <div className="font-bold text-lg leading-tight">{trade.traders?.name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <span className="relative flex h-2 w-2 mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                            </span>
                            {duration === 0 ? 'Started today' : `${duration} days active`}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2" onClick={() => setConfirmStopTrade(trade)} title="Stop Copying">
                        <StopCircle className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/50">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Allocated Capital</div>
                        <div className="font-semibold text-lg">${Number(trade.allocated_capital).toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center justify-end gap-1.5">
                          Live P&L
                          <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground/50" style={{ animationDuration: '3s' }} />
                        </div>
                        <div className={`font-bold text-lg flex items-baseline justify-end gap-1 ${isProfit ? 'text-success' : 'text-destructive'}`}>
                          {isProfit ? '+' : ''}${currentPnl.toFixed(2)}
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-background/50 border ml-1">
                            {isProfit ? '+' : ''}{roi.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="border-dashed bg-muted/20 animate-fade-in-up">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Active Traders</h3>
            <p className="text-muted-foreground max-w-sm mb-6">
              You aren't copying anyone right now. Browse our marketplace of elite traders to get started.
            </p>
            <Button onClick={() => {
              const element = document.getElementById('discover-traders');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Discover Traders
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Trader Marketplace */}
      <div id="discover-traders" className="space-y-6 pt-4">
        <div>
          <h2 className="text-xl font-semibold font-heading">Discover Expert Traders</h2>
          <p className="text-sm text-muted-foreground mt-1">Review historical performance and choose a trader that matches your risk profile.</p>
        </div>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="commodities">Comm.</TabsTrigger>
          </TabsList>
          {["all", "Forex", "Crypto", "Commodities"].map((tab) => (
            <TabsContent key={tab} value={tab.toLowerCase()} className="mt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex items-center gap-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-5 w-1/2" /><Skeleton className="h-3 w-1/3" /></div></div>
                        <Skeleton className="h-16 w-full" />
                        <div className="grid grid-cols-2 gap-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div>
                        <div className="flex gap-2"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-10 w-2/3" /></div>
                      </CardContent>
                    </Card>
                  ))
                ) : traders
                  .filter((t: any) => t.is_active)
                  .filter((t: any) => tab === "all" || t.category === tab)
                  .map((t: any, index: number) => {
                    const isCopying = activeCopyTrades.some((ac: any) => ac.trader_id === t.id);
                    const isElite = t.win_rate >= 80;
                    
                    return (
                      <Card key={t.id} className={`overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-in-up ${isCopying ? "border-primary ring-1 ring-primary/20" : ""}`} style={{ animationDelay: `${index * 50}ms` }}>
                        <CardContent className="p-0">
                          <div className="p-6 space-y-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <img src={t.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + t.name} alt={t.name} className="w-12 h-12 rounded-full object-cover border" loading="lazy" />
                                  {isElite && (
                                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full ring-2 ring-background" title="Elite Trader">
                                      <TrendingUp className="h-3 w-3" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-base flex items-center gap-2">
                                    {t.name}
                                    {isCopying && <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 px-1 py-0 text-[10px]">Copied</Badge>}
                                  </div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {t.followers}</span>
                                    <span>•</span>
                                    <span className="uppercase font-semibold text-[10px] tracking-wider text-primary">{t.category || "Forex"}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Performance Sparkline */}
                            <div className="h-16 w-full mt-2 bg-muted/20 rounded-md border p-1 relative overflow-hidden group">
                              <div className="absolute top-1 left-2 text-[10px] font-medium text-muted-foreground z-10">30d Perf.</div>
                              {sparklines[t.id] && (
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={sparklines[t.id]} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id={`color-${t.id}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isElite ? "#10b981" : "#3b82f6"} stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor={isElite ? "#10b981" : "#3b82f6"} stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <Area type="monotone" dataKey="value" stroke={isElite ? "#10b981" : "#3b82f6"} strokeWidth={2} fillOpacity={1} fill={`url(#color-${t.id})`} />
                                  </AreaChart>
                                </ResponsiveContainer>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                              <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-center">
                                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Win Rate</div>
                                <div className={`font-bold text-lg ${isElite ? 'text-success' : 'text-foreground'}`}>{t.win_rate}%</div>
                              </div>
                              <div className="bg-muted/30 p-3 rounded-lg border border-border/50 text-center">
                                <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Min Copy</div>
                                <div className="font-bold text-lg">${Number(t.min_copy_balance).toLocaleString()}</div>
                              </div>
                            </div>
                            
                            <div className="pt-2 flex gap-3">
                              <Button variant="outline" className="flex-1" onClick={() => setPreviewTrader(t)}>
                                <Eye className="h-4 w-4 mr-2" /> Details
                              </Button>
                              <Button
                                className="flex-1 shadow-sm"
                                variant={isCopying ? "secondary" : "default"}
                                disabled={isCopying || startCopyTrade.isPending}
                                onClick={() => !isCopying && setConfirmStartTrader(t)}
                              >
                                {isCopying ? "Copying" : "Copy"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <TraderPreviewDialog
        trader={previewTrader}
        open={!!previewTrader}
        onOpenChange={(open) => !open && setPreviewTrader(null)}
      />

      {/* Start Copy Confirmation Dialog */}
      <Dialog open={!!confirmStartTrader} onOpenChange={(open) => !open && setConfirmStartTrader(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">Confirm Copy Trade</DialogTitle>
            <DialogDescription>
              Review the details before securely allocating your capital.
            </DialogDescription>
          </DialogHeader>
          {confirmStartTrader && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg border">
                <img src={confirmStartTrader.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + confirmStartTrader.name} alt={confirmStartTrader.name} className="w-12 h-12 rounded-full object-cover border" />
                <div>
                  <div className="font-bold">{confirmStartTrader.name}</div>
                  <div className="text-sm text-success font-medium">{confirmStartTrader.win_rate}% Win Rate</div>
                </div>
              </div>
              
              <div className="space-y-3 p-4 bg-background border rounded-lg">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Copy Capital Required</span>
                  <span className="font-bold text-lg">${Number(confirmStartTrader.min_copy_balance).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm items-center pt-3 border-t">
                  <span className="text-muted-foreground">Available Balance</span>
                  <span className={`font-medium ${profile?.balance < confirmStartTrader.min_copy_balance ? 'text-destructive' : 'text-foreground'}`}>
                    ${Number(profile?.balance || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm items-center pt-3 border-t">
                  <span className="text-muted-foreground flex items-center gap-1">Platform Profit Fee <span title="Charged only on profitable trades"><AlertCircle className="h-3 w-3 text-muted-foreground/70" /></span></span>
                  <span className="font-medium">{Number(confirmStartTrader.platform_fee_percentage)}%</span>
                </div>
              </div>
              
              {profile?.balance < confirmStartTrader.min_copy_balance && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20 flex gap-2 items-start">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block mb-1">Insufficient Balance</strong>
                    Please deposit at least ${(confirmStartTrader.min_copy_balance - (profile?.balance || 0)).toLocaleString()} more to copy this trader.
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setConfirmStartTrader(null)}>Cancel</Button>
            {profile?.balance < confirmStartTrader?.min_copy_balance ? (
              <Button className="w-full sm:w-auto" asChild>
                <Link to="/dashboard/deposit">Deposit Funds</Link>
              </Button>
            ) : (
              <Button className="w-full sm:w-auto" onClick={onConfirmStart} disabled={startCopyTrade.isPending}>
                {startCopyTrade.isPending ? "Allocating..." : "Confirm & Copy"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stop Copy Confirmation Dialog */}
      <Dialog open={!!confirmStopTrade} onOpenChange={(open) => !open && setConfirmStopTrade(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading text-destructive flex items-center gap-2">
              <StopCircle className="h-5 w-5" /> Stop Copying
            </DialogTitle>
            <DialogDescription>
              We will calculate your final return and instantly unlock your balance.
            </DialogDescription>
          </DialogHeader>
          {confirmStopTrade && (
            <div className="space-y-4 py-2">
              <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                <div className="flex justify-between text-sm items-center">
                  <span className="text-muted-foreground">Trader</span>
                  <span className="font-bold">{confirmStopTrade.traders?.name}</span>
                </div>
                <div className="flex justify-between text-sm items-center pt-3 border-t">
                  <span className="text-muted-foreground">Locked Capital</span>
                  <span className="font-medium">${Number(confirmStopTrade.allocated_capital).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm items-center pt-3 border-t">
                  <span className="text-muted-foreground flex items-center gap-1">Live P&L <RefreshCw className="h-3 w-3 animate-spin text-muted-foreground/50" /></span>
                  <span className={`font-bold ${(livePnL[confirmStopTrade.id] || 0) >= 0 ? "text-success" : "text-destructive"}`}>
                    ${(livePnL[confirmStopTrade.id] || confirmStopTrade.current_pnl || 0).toFixed(2)}
                  </span>
                </div>
              </div>
              
              {(() => {
                const profit = livePnL[confirmStopTrade.id] || confirmStopTrade.current_pnl || 0;
                const feePercent = confirmStopTrade.traders?.platform_fee_percentage || 10;
                const fee = profit > 0 ? profit * (feePercent / 100) : 0;
                const finalReturn = Number(confirmStopTrade.allocated_capital) + profit - fee;
                
                return (
                  <div className="bg-background border rounded-lg p-4 space-y-3">
                    {profit > 0 && (
                      <div className="flex justify-between text-sm items-center border-b pb-3">
                        <span className="text-muted-foreground">Platform Fee ({feePercent}% of profit)</span>
                        <span className="font-medium text-destructive">-${fee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-base">Estimated Return</span>
                      <span className="text-xl text-primary">${finalReturn.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-3 mt-4 border-t pt-4">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setConfirmStopTrade(null)}>Keep Copying</Button>
            <Button variant="destructive" className="w-full sm:w-auto" onClick={onConfirmStop} disabled={cancelCopyTrade.isPending}>
              {cancelCopyTrade.isPending ? "Closing Position..." : "Confirm Stop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
