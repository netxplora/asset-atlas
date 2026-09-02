import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, Briefcase, TrendingUp, DollarSign, Clock, Search,
  Filter, XCircle, AlertTriangle, CheckCircle2, Ban, Eye,
} from "lucide-react";
import { useAdminUserInvestments, useAdminCancelInvestment } from "@/hooks/useSupabaseData";
import { format, differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";

type InvestmentRecord = {
  id: string;
  amount: number;
  roi_percentage: number;
  duration_days: number;
  start_date: string;
  end_date: string;
  profit_generated: number | null;
  status: string;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  penalty_amount: number | null;
  refunded_amount: number | null;
  user_id: string;
  plan: { name: string; category?: string } | null;
  user: { full_name: string | null; email: string | null; balance: number | null } | null;
};

const statusConfig: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  active:    { label: "Active",    cls: "bg-success/10 text-success border-success/20",       icon: <CheckCircle2 className="h-3 w-3" /> },
  completed: { label: "Completed", cls: "bg-primary/10 text-primary border-primary/20",       icon: <TrendingUp className="h-3 w-3" /> },
  cancelled: { label: "Cancelled", cls: "bg-destructive/10 text-destructive border-destructive/20", icon: <Ban className="h-3 w-3" /> },
};

export default function AdminInvestments() {
  const { data: investments = [], isLoading } = useAdminUserInvestments();
  const cancelMutation = useAdminCancelInvestment();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelTarget, setCancelTarget] = useState<InvestmentRecord | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [detailTarget, setDetailTarget] = useState<InvestmentRecord | null>(null);

  const filtered = (investments as InvestmentRecord[]).filter(inv => {
    const matchSearch =
      search === "" ||
      (inv.user?.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.user?.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (inv.plan?.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Summary stats
  const totalLocked   = (investments as InvestmentRecord[]).filter(i => i.status === "active").reduce((s, i) => s + Number(i.amount), 0);
  const totalProfit   = (investments as InvestmentRecord[]).reduce((s, i) => s + Number(i.profit_generated ?? 0), 0);
  const activeCount   = (investments as InvestmentRecord[]).filter(i => i.status === "active").length;
  const completedCount = (investments as InvestmentRecord[]).filter(i => i.status === "completed").length;

  const handleForceCancel = () => {
    if (!cancelTarget) return;
    cancelMutation.mutate({ investmentId: cancelTarget.id, reason: cancelReason || "Admin cancelled" }, {
      onSuccess: () => { setCancelTarget(null); setCancelReason(""); },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-foreground tracking-tight">User Investments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage all active, completed, and cancelled investments across the platform.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Capital Locked</p>
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading">${totalLocked.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground mt-1">{activeCount} active investment{activeCount !== 1 ? "s" : ""}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">ROI Distributed</p>
              <div className="p-1.5 bg-success/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading text-success">+${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all investments</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active</p>
              <div className="p-1.5 bg-success/10 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Completed</p>
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <Briefcase className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold font-heading">{completedCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Matured investments</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <CardTitle className="text-base">All Investments</CardTitle>
              <CardDescription>{filtered.length} record{filtered.length !== 1 ? "s" : ""}</CardDescription>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search user or plan..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
              <Briefcase className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-medium">No investments found</p>
              <p className="text-sm mt-1">Try adjusting your search or filter.</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map(inv => {
                const totalDays = inv.duration_days;
                const daysElapsed = Math.max(0, differenceInDays(new Date(), new Date(inv.start_date)));
                const progress = Math.min((daysElapsed / totalDays) * 100, 100);
                const badge = statusConfig[inv.status] ?? statusConfig.cancelled;
                const earned = Number(inv.profit_generated ?? 0);
                const expectedTotal = inv.amount * (inv.roi_percentage / 100);

                return (
                  <div key={inv.id} className="p-4 sm:p-5 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      {/* Left */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm truncate max-w-[180px]">
                            {inv.user?.full_name || inv.user?.email || inv.user_id.slice(0, 8)}
                          </span>
                          <Badge variant="outline" className={`text-[10px] flex items-center gap-1 ${badge.cls}`}>
                            {badge.icon}{badge.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground">·</span>
                          <span className="text-xs text-muted-foreground font-medium">{inv.plan?.name ?? "Plan"}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(inv.start_date), "MMM dd")} → {format(new Date(inv.end_date), "MMM dd, yyyy")}
                          </span>
                          {inv.status === "active" && (
                            <span className="text-foreground font-medium">
                              {Math.max(0, differenceInDays(new Date(inv.end_date), new Date()))}d remaining
                            </span>
                          )}
                        </div>
                        {inv.status === "active" && (
                          <Progress value={progress} className="h-1.5 max-w-xs" />
                        )}
                        {inv.status === "cancelled" && inv.cancellation_reason && (
                          <p className="text-xs text-muted-foreground">Reason: {inv.cancellation_reason}</p>
                        )}
                      </div>

                      {/* Right metrics */}
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Principal</p>
                          <p className="font-bold text-sm">${Number(inv.amount).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">ROI</p>
                          <p className="font-bold text-sm text-primary">+{inv.roi_percentage}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Earned</p>
                          <p className="font-bold text-sm text-success">
                            +${earned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            <span className="font-normal text-muted-foreground"> / ${expectedTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            title="View details"
                            onClick={() => setDetailTarget(inv)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {inv.status === "active" && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              title="Force cancel (no penalty)"
                              onClick={() => { setCancelTarget(inv); setCancelReason(""); }}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailTarget} onOpenChange={open => { if (!open) setDetailTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Investment Details</DialogTitle>
          </DialogHeader>
          {detailTarget && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-muted-foreground">User</p><p className="font-semibold">{detailTarget.user?.full_name || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Email</p><p className="font-semibold truncate">{detailTarget.user?.email || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Plan</p><p className="font-semibold">{detailTarget.plan?.name || "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={`${statusConfig[detailTarget.status]?.cls} text-[10px]`}>
                    {statusConfig[detailTarget.status]?.label}
                  </Badge>
                </div>
                <div><p className="text-xs text-muted-foreground">Amount</p><p className="font-bold">${Number(detailTarget.amount).toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">ROI</p><p className="font-bold text-primary">+{detailTarget.roi_percentage}%</p></div>
                <div><p className="text-xs text-muted-foreground">Profit Earned</p><p className="font-bold text-success">+${Number(detailTarget.profit_generated ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                <div><p className="text-xs text-muted-foreground">Duration</p><p className="font-semibold">{detailTarget.duration_days} days</p></div>
                <div><p className="text-xs text-muted-foreground">Start Date</p><p className="font-semibold">{format(new Date(detailTarget.start_date), "MMM dd, yyyy")}</p></div>
                <div><p className="text-xs text-muted-foreground">End Date</p><p className="font-semibold">{format(new Date(detailTarget.end_date), "MMM dd, yyyy")}</p></div>
                {detailTarget.penalty_amount != null && Number(detailTarget.penalty_amount) > 0 && (
                  <div><p className="text-xs text-muted-foreground">Penalty</p><p className="font-bold text-destructive">-${Number(detailTarget.penalty_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                )}
                {detailTarget.refunded_amount != null && Number(detailTarget.refunded_amount) > 0 && (
                  <div><p className="text-xs text-muted-foreground">Refunded</p><p className="font-bold text-success">${Number(detailTarget.refunded_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p></div>
                )}
              </div>
              {detailTarget.cancellation_reason && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Cancellation Reason</p>
                  <p className="text-sm">{detailTarget.cancellation_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailTarget(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Cancel Dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={open => { if (!open) { setCancelTarget(null); setCancelReason(""); } }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Force Cancel Investment
            </DialogTitle>
            <DialogDescription>
              Admin cancellation issues a <strong>full refund</strong> with no penalty to the user.
            </DialogDescription>
          </DialogHeader>
          {cancelTarget && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">User</span>
                  <span className="font-semibold">{cancelTarget.user?.full_name || cancelTarget.user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Principal</span>
                  <span className="font-bold">${Number(cancelTarget.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-success">
                  <span>Full Refund</span>
                  <span className="font-bold">${Number(cancelTarget.amount).toLocaleString()}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cancel-reason" className="text-sm font-semibold">Reason (required)</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="e.g. User requested via support ticket #1234"
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setCancelTarget(null); setCancelReason(""); }} className="flex-1">
              Go Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleForceCancel}
              disabled={cancelMutation.isPending || !cancelReason.trim()}
              className="flex-1"
            >
              {cancelMutation.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
              ) : "Confirm Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
