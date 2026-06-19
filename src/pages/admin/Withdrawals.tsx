import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Eye, Clock, Search, ArrowUpDown, ChevronLeft, ChevronRight, ArrowDownToLine } from "lucide-react";
import { useState, useMemo } from "react";
import { useAdminWithdrawals, useAdminUpdateWithdrawal } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 10;

export default function AdminWithdrawals() {
  const { data: withdrawals = [], isLoading } = useAdminWithdrawals();
  const updateWithdrawal = useAdminUpdateWithdrawal();
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  const handleTabChange = (val: string) => { setActiveTab(val); setCurrentPage(1); };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); };

  const filteredAndSorted = useMemo(() => {
    let result = withdrawals;

    if (activeTab !== "all") {
      result = result.filter((w: any) => w.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((w: any) =>
        w.id.toLowerCase().includes(q) ||
        w.wallet_address?.toLowerCase().includes(q) ||
        w.profiles?.first_name?.toLowerCase().includes(q) ||
        w.profiles?.last_name?.toLowerCase().includes(q) ||
        w.profiles?.email?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a: any, b: any) => {
      const db = new Date(b.created_at).getTime();
      const da = new Date(a.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [withdrawals, activeTab, searchQuery, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAction = (id: string, action: "approved" | "rejected") => {
    updateWithdrawal.mutate({ id, status: action, admin_notes: notes }, {
      onSuccess: () => {
        if (selected && selected.id === id) {
          setSelected(null);
          setNotes("");
        }
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline" className="border-warning text-warning capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Withdrawal Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{isLoading ? 'Loading...' : `${withdrawals.length} total · ${withdrawals.filter((w: any) => w.status === "pending").length} pending`}</p>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1.5 bg-warning/10 text-warning px-2.5 py-1 rounded-md font-medium"><Clock className="h-3.5 w-3.5" /> {withdrawals.filter((w: any) => w.status === "pending").length} Pending</div>
          <div className="flex items-center gap-1.5 bg-success/10 text-success px-2.5 py-1 rounded-md font-medium"><CheckCircle2 className="h-3.5 w-3.5" /> {withdrawals.filter((w: any) => w.status === "approved").length} Approved</div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full lg:w-auto">
          <TabsList className="w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search name, email, wallet..." className="pl-8 bg-background" value={searchQuery} onChange={handleSearchChange} />
          </div>
          <Select value={sortOrder} onValueChange={(v: "newest" | "oldest") => setSortOrder(v)}>
            <SelectTrigger className="w-[120px] bg-background">
              <div className="flex items-center"><ArrowUpDown className="mr-2 h-3 w-3" /> Sort</div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Record ID</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Currency</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">KYC</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-36" /></div></td>
                      <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-14" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-16" /></td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={8} className="p-8 text-center">
                    <ArrowDownToLine className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">No withdrawals found</p>
                    {searchQuery && <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>}
                  </td></tr>
                ) : paginatedData.map((w: any) => {
                  const isKycVerified = w.profiles?.kyc_status === "verified";
                  return (
                    <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-xs text-muted-foreground">{w.id.substring(0, 8)}...</td>
                      <td className="p-3">
                        <div className="font-medium">{w.profiles?.first_name} {w.profiles?.last_name}</div>
                        <div className="text-xs text-muted-foreground">{w.profiles?.email}</div>
                      </td>
                      <td className="p-3 font-bold">${w.amount?.toLocaleString()}</td>
                      <td className="p-3">{w.currency}</td>
                      <td className="p-3">
                        <Badge variant={isKycVerified ? "default" : "destructive"} className={isKycVerified ? "bg-success" : ""}>
                          {isKycVerified ? "Verified" : "Not Verified"}
                        </Badge>
                      </td>
                      <td className="p-3 whitespace-nowrap">{new Date(w.created_at).toLocaleString()}</td>
                      <td className="p-3">{getStatusBadge(w.status)}</td>
                      <td className="p-3">
                        <Button size="sm" variant="ghost" onClick={() => { setSelected(w); setNotes(w.admin_notes || ""); }}>
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSorted.length)} of {filteredAndSorted.length} records
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">Page {currentPage} of {totalPages}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Withdrawal Review — {selected?.id?.substring(0, 8)}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm bg-muted/50 p-4 rounded-lg">
                <div className="col-span-2 flex justify-between border-b pb-2 mb-2">
                  <span className="text-muted-foreground">Record ID:</span>
                  <span className="font-mono text-xs">{selected.id}</span>
                </div>
                <div><span className="text-muted-foreground block text-xs">User Name</span> <span className="font-medium">{selected.profiles?.first_name} {selected.profiles?.last_name}</span></div>
                <div><span className="text-muted-foreground block text-xs">Email</span> <span className="font-medium">{selected.profiles?.email}</span></div>
                <div><span className="text-muted-foreground block text-xs">Amount</span> <span className="font-bold text-base">${selected.amount?.toLocaleString()}</span></div>
                <div><span className="text-muted-foreground block text-xs">Currency</span> <span className="font-medium">{selected.currency}</span></div>
                <div className="col-span-2"><span className="text-muted-foreground block text-xs">Wallet Address</span> <code className="text-xs bg-background p-1.5 rounded block mt-1 break-all border">{selected.wallet_address || 'None provided'}</code></div>
                <div><span className="text-muted-foreground block text-xs">Submitted On</span> <span>{new Date(selected.created_at).toLocaleString()}</span></div>
                <div><span className="text-muted-foreground block text-xs">KYC Status</span>
                  <Badge variant={selected.profiles?.kyc_status === "verified" ? "default" : "destructive"} className={selected.profiles?.kyc_status === "verified" ? "bg-success mt-1" : "mt-1"}>
                    {selected.profiles?.kyc_status === "verified" ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>

              {selected.profiles?.kyc_status !== "verified" && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">⚠ This user has not completed KYC verification. Withdrawals require KYC approval.</div>
              )}

              <div className="space-y-2">
                <Label>Internal Administrative Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Required when rejecting, optional for approval..." rows={3} disabled={selected.status !== "pending"} />
              </div>

              {selected.status === "pending" && (
                <div className="flex gap-3 pt-2">
                  <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => handleAction(selected.id, "approved")} disabled={selected.profiles?.kyc_status !== "verified" || updateWithdrawal.isPending}>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Process
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => handleAction(selected.id, "rejected")} disabled={updateWithdrawal.isPending || !notes.trim()}>
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject Request
                  </Button>
                </div>
              )}

              {selected.status !== "pending" && (
                <div className="text-sm text-muted-foreground text-center py-2">This withdrawal has already been {selected.status}.</div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
