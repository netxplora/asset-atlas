import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, Eye, Clock, Search, ArrowUpDown, ChevronLeft, ChevronRight, Wallet, Calendar, AlertCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { useAdminDeposits, useAdminUpdateDeposit, useAdminDepositIntents } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const ITEMS_PER_PAGE = 10;

export default function AdminDeposits() {
  const { data: deposits = [], isLoading } = useAdminDeposits();
  const { data: intents = [], isLoading: isLoadingIntents } = useAdminDepositIntents();
  const updateDeposit = useAdminUpdateDeposit();
  
  const [viewMode, setViewMode] = useState<"deposits" | "intents">("deposits");
  
  const [selectedDeposit, setSelectedDeposit] = useState<any | null>(null);
  const [notes, setNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeTab, setActiveTab] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  // Intents filters state
  const [intentSearchQuery, setIntentSearchQuery] = useState("");
  const [intentStatusFilter, setIntentStatusFilter] = useState("all");
  const [intentCurrencyFilter, setIntentCurrencyFilter] = useState("all");
  const [selectedIntent, setSelectedIntent] = useState<any | null>(null);
  const [intentPage, setIntentPage] = useState(1);

  // Fetch audit logs for the selected intent
  const { data: auditLogs = [], isLoading: loadingAudit } = useQuery({
    queryKey: ["depositAuditLogs", selectedIntent?.id],
    queryFn: async () => {
      if (!selectedIntent?.id) return [];
      const { data, error } = await supabase
        .from("deposit_audit_logs")
        .select("*")
        .eq("intent_id", selectedIntent.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedIntent?.id,
  });

  const uniqueCurrencies = useMemo(() => {
    const currencies = intents.map((i: any) => i.selected_currency);
    return ["all", ...new Set(currencies)];
  }, [intents]);

  const filteredIntents = useMemo(() => {
    let result = intents;

    if (intentStatusFilter !== "all") {
      result = result.filter((i: any) => i.status.toLowerCase() === intentStatusFilter.toLowerCase());
    }

    if (intentCurrencyFilter !== "all") {
      result = result.filter((i: any) => i.selected_currency.toLowerCase() === intentCurrencyFilter.toLowerCase());
    }

    if (intentSearchQuery.trim()) {
      const q = intentSearchQuery.toLowerCase();
      result = result.filter((i: any) => 
        i.id.toLowerCase().includes(q) ||
        i.tx_hash?.toLowerCase().includes(q) ||
        i.profiles?.first_name?.toLowerCase().includes(q) ||
        i.profiles?.last_name?.toLowerCase().includes(q) ||
        i.profiles?.email?.toLowerCase().includes(q)
      );
    }

    result = [...result].sort((a: any, b: any) => {
      const db = new Date(b.initiated_timestamp).getTime();
      const da = new Date(a.initiated_timestamp).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [intents, intentStatusFilter, intentCurrencyFilter, intentSearchQuery, sortOrder]);

  const totalIntentPages = Math.ceil(filteredIntents.length / ITEMS_PER_PAGE);
  const paginatedIntents = filteredIntents.slice((intentPage - 1) * ITEMS_PER_PAGE, intentPage * ITEMS_PER_PAGE);

  // Reset page when filters change
  const handleTabChange = (val: string) => { setActiveTab(val); setCurrentPage(1); };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); };

  const filteredAndSorted = useMemo(() => {
    let result = deposits;

    // Filter by tab status
    if (activeTab !== "all") {
      result = result.filter((d: any) => d.status === activeTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d: any) => 
        d.id.toLowerCase().includes(q) ||
        d.tx_hash?.toLowerCase().includes(q) ||
        d.profiles?.first_name?.toLowerCase().includes(q) ||
        d.profiles?.last_name?.toLowerCase().includes(q) ||
        d.profiles?.email?.toLowerCase().includes(q)
      );
    }

    // Sort by date
    result = [...result].sort((a: any, b: any) => {
      const db = new Date(b.created_at).getTime();
      const da = new Date(a.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [deposits, activeTab, searchQuery, sortOrder]);

  // Pagination logic
  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleAction = (id: string, action: "approved" | "rejected") => {
    updateDeposit.mutate({ id, status: action, admin_notes: notes }, {
      onSuccess: () => {
        if (selectedDeposit && selectedDeposit.id === id) {
          setSelectedDeposit(null);
          setNotes("");
        }
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-success/10 text-success hover:bg-success/20 border-0 px-2.5 py-0.5">Approved</Badge>;
      case "rejected": return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-0 px-2.5 py-0.5">Rejected</Badge>;
      default: return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-0 px-2.5 py-0.5 capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Deposit Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {viewMode === "deposits" 
              ? (isLoading ? 'Loading...' : `${deposits.length} total · ${deposits.filter((d: any) => d.status === "pending").length} pending`)
              : (isLoadingIntents ? 'Loading...' : `${intents.length} total intents · ${intents.filter((i: any) => ["awaiting payment", "awaiting confirmation"].includes(i.status.toLowerCase())).length} active`)
            }
          </p>
        </div>
        <div className="flex gap-2 bg-muted p-1 rounded-lg shrink-0">
          <Button 
            variant={viewMode === "deposits" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => { setViewMode("deposits"); setCurrentPage(1); }}
            className="font-semibold text-xs h-8"
          >
            Deposits
          </Button>
          <Button 
            variant={viewMode === "intents" ? "secondary" : "ghost"} 
            size="sm" 
            onClick={() => { setViewMode("intents"); setIntentPage(1); }}
            className="font-semibold text-xs h-8"
          >
            Deposit Intents
          </Button>
        </div>
      </div>

      {viewMode === "deposits" ? (
        <div className="space-y-6">
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
                <Input type="search" placeholder="Search ID, email, hash..." className="pl-8 bg-background" value={searchQuery} onChange={handleSearchChange} />
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
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Record ID</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Investor</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Method</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-36" /></div></td>
                      <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center">
                        <Wallet className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground font-medium">No deposits found</p>
                        {searchQuery && <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters.</p>}
                      </td>
                    </tr>
                ) : paginatedData.map((d: any) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.id.substring(0,8)}...</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{d.profiles?.first_name} {d.profiles?.last_name}</div>
                        <div className="text-xs text-muted-foreground">{d.profiles?.email}</div>
                      </td>
                      <td className="px-4 py-3 font-bold text-success">${d.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 capitalize">{d.method || d.currency}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(d.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">{getStatusBadge(d.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 items-center">
                          <Dialog open={selectedDeposit?.id === d.id} onOpenChange={(open) => !open && setSelectedDeposit(null)}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8" onClick={() => { setSelectedDeposit(d); setNotes(d.admin_notes || ""); }}>
                                <Eye className="h-3.5 w-3.5 mr-1" /> View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                              <DialogHeader><DialogTitle>Deposit Action Review</DialogTitle></DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm bg-muted/50 p-4 rounded-lg">
                                  <div className="col-span-2 flex justify-between border-b pb-2 mb-2">
                                    <span className="text-muted-foreground">Record ID:</span>
                                    <span className="font-mono text-xs">{d.id}</span>
                                  </div>
                                  <div><span className="text-muted-foreground block text-xs">Investor Name</span> <span className="font-medium">{d.profiles?.first_name} {d.profiles?.last_name}</span></div>
                                  <div><span className="text-muted-foreground block text-xs">Account ID (User)</span> <span className="font-mono text-xs">{d.user_id.substring(0,12)}...</span></div>
                                  <div><span className="text-muted-foreground block text-xs">Deposit Amount</span> <span className="font-bold text-success text-base">${d.amount.toLocaleString()}</span></div>
                                  <div><span className="text-muted-foreground block text-xs">Method</span> <span className="font-medium capitalize">{d.method || d.currency}</span></div>
                                  <div><span className="text-muted-foreground block text-xs">Submitted On</span> <span>{new Date(d.created_at).toLocaleString()}</span></div>
                                  <div className="col-span-2"><span className="text-muted-foreground block text-xs">Proof of Payment (Tx Hash / Sender Wallet)</span> <code className="text-xs bg-background p-1.5 rounded block mt-1 break-all border">{d.tx_hash || 'None provided'}</code></div>
                                  {d.user_notes && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground block text-xs">User Notes</span>
                                      <div className="text-sm bg-background p-2 rounded block mt-1 border whitespace-pre-wrap">{d.user_notes}</div>
                                    </div>
                                  )}
                                  {d.screenshot_url && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground block text-xs mb-1">Attached Screenshot</span>
                                      <a href={d.screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-block border rounded-lg overflow-hidden bg-background">
                                        <img src={d.screenshot_url} alt="Payment screenshot" className="max-h-48 object-contain w-full hover:opacity-90 transition-opacity" />
                                      </a>
                                    </div>
                                  )}
                                </div>

                                <div className="space-y-2">
                                  <Label>Internal Administrative Notes</Label>
                                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Required when rejecting, optional for approval..." rows={3} disabled={d.status !== "pending"} />
                                </div>

                                {d.status === "pending" && (
                                  <div className="flex gap-3 pt-2">
                                    <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => handleAction(d.id, "approved")} disabled={updateDeposit.isPending}>
                                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve & Credit Funds
                                    </Button>
                                    <Button variant="destructive" className="flex-1" onClick={() => handleAction(d.id, "rejected")} disabled={updateDeposit.isPending || !notes.trim()}>
                                      <XCircle className="h-4 w-4 mr-1.5" /> Reject Request
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </td>
                    </tr>
                ))}
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
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-muted/20 p-4 rounded-xl border">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">User Search</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                placeholder="Search user, ID, hash..." 
                className="pl-8 bg-background h-9 text-xs" 
                value={intentSearchQuery} 
                onChange={(e) => { setIntentSearchQuery(e.target.value); setIntentPage(1); }} 
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Filter Status</Label>
            <Select value={intentStatusFilter} onValueChange={(v) => { setIntentStatusFilter(v); setIntentPage(1); }}>
              <SelectTrigger className="h-9 bg-background text-xs">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="awaiting payment">Awaiting Payment</SelectItem>
                <SelectItem value="awaiting confirmation">Awaiting Confirmation</SelectItem>
                <SelectItem value="pending verification">Pending Verification</SelectItem>
                <SelectItem value="under review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-muted-foreground">Filter Currency</Label>
            <Select value={intentCurrencyFilter} onValueChange={(v) => { setIntentCurrencyFilter(v); setIntentPage(1); }}>
              <SelectTrigger className="h-9 bg-background text-xs capitalize">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCurrencies.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c === "all" ? "All Currencies" : c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-end shrink-0 sm:w-auto">
          <div className="space-y-1.5 w-full sm:w-[120px]">
            <Label className="text-xs font-semibold text-muted-foreground">Sort Order</Label>
            <Select value={sortOrder} onValueChange={(v: "newest" | "oldest") => setSortOrder(v)}>
              <SelectTrigger className="h-9 bg-background text-xs">
                <div className="flex items-center"><ArrowUpDown className="mr-2 h-3 w-3" /> Sort</div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Intent ID</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Investor</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Currency</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Wallet</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Initiated</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoadingIntents ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-36" /></div></td>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : paginatedIntents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Wallet className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground font-medium">No deposit intents found</p>
                    </td>
                  </tr>
                ) : paginatedIntents.map((intent: any) => (
                  <tr key={intent.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{intent.id.substring(0,8)}...</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{intent.profiles?.first_name} {intent.profiles?.last_name}</div>
                      <div className="text-xs text-muted-foreground">{intent.profiles?.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold">{intent.selected_currency}</span>
                      {intent.selected_network && <span className="text-xs text-muted-foreground block">{intent.selected_network}</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[150px]" title={intent.wallet_address}>
                      {intent.wallet_address}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(intent.initiated_timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">{getStatusBadge(intent.status)}</td>
                    <td className="px-4 py-3">
                      <Dialog open={selectedIntent?.id === intent.id} onOpenChange={(open) => !open && setSelectedIntent(null)}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8" onClick={() => setSelectedIntent(intent)}>
                            <Eye className="h-3.5 w-3.5 mr-1" /> Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                          <DialogHeader>
                            <DialogTitle>Deposit Intent Session Details</DialogTitle>
                            <DialogDescription>Full tracking audit and parameters for this deposit intent</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs bg-muted/50 p-4 rounded-lg">
                              <div className="col-span-2 flex justify-between border-b pb-2 mb-1">
                                <span className="text-muted-foreground font-semibold">Intent Session ID:</span>
                                <span className="font-mono">{intent.id}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Investor</span>
                                <span className="font-semibold">{intent.profiles?.first_name} {intent.profiles?.last_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Email</span>
                                <span className="font-mono">{intent.profiles?.email}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Currency / Network</span>
                                <span className="font-semibold">{intent.selected_currency} {intent.selected_network && `(${intent.selected_network})`}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Provider Method</span>
                                <span className="capitalize">{intent.deposit_method}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="text-muted-foreground block">Intended Wallet Destination Address</span>
                                <code className="block p-1 bg-background border rounded font-mono text-[10px] select-all truncate mt-0.5">{intent.wallet_address}</code>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Session Initiated</span>
                                <span>{new Date(intent.initiated_timestamp).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Last Active</span>
                                <span>{new Date(intent.last_activity_timestamp).toLocaleString()}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Amount Configured</span>
                                <span className="font-bold text-success">${intent.amount ? intent.amount.toLocaleString() : "Not specified"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground block">Current Status</span>
                                <span className="mt-0.5 inline-block">{getStatusBadge(intent.status)}</span>
                              </div>
                            </div>

                            {/* Details from user submission */}
                            {intent.tx_hash && (
                              <div className="space-y-2 border-t pt-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">User Submission Details</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs bg-primary/5 p-3 rounded-lg border border-primary/10">
                                  <div>
                                    <span className="text-muted-foreground block">Amount Actually Sent</span>
                                    <span className="font-bold text-success text-sm">${intent.amount_sent?.toLocaleString()}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground block">Transaction Hash (TxID)</span>
                                    <code className="font-mono text-[10px] break-all">{intent.tx_hash}</code>
                                  </div>
                                  {intent.user_notes && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground block">User Notes</span>
                                      <p className="mt-0.5 bg-background p-1.5 border rounded">{intent.user_notes}</p>
                                    </div>
                                  )}
                                  {intent.screenshot_url && (
                                    <div className="col-span-2">
                                      <span className="text-muted-foreground block mb-1">Screenshot Proof</span>
                                      <a href={intent.screenshot_url} target="_blank" rel="noopener noreferrer" className="inline-block border rounded bg-background overflow-hidden">
                                        <img src={intent.screenshot_url} alt="Proof" className="max-h-32 object-contain" />
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Audit Trail Timeline */}
                            <div className="space-y-2 border-t pt-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Audit Trail Activity Logs</h4>
                              <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                                {loadingAudit ? (
                                  <Skeleton className="h-10 w-full" />
                                ) : auditLogs.length === 0 ? (
                                  <p className="text-xs text-muted-foreground">No logs found for this session</p>
                                ) : (
                                  auditLogs.map((log: any) => (
                                    <div key={log.id} className="text-xs flex gap-2 justify-between items-start border-b pb-1">
                                      <div>
                                        <span className="font-bold text-primary mr-1.5">[{log.action}]</span>
                                        <span className="text-muted-foreground">
                                          {log.action === 'INITIATE' && `Session started. Currency: ${log.details?.currency}`}
                                          {log.action === 'CANCEL' && `Session cancelled by user.`}
                                          {log.action === 'STATUS_CHANGE' && `Status changed from ${log.details?.from_status} to ${log.details?.to_status}.`}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(log.created_at).toLocaleTimeString()}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalIntentPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {((intentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(intentPage * ITEMS_PER_PAGE, filteredIntents.length)} of {filteredIntents.length} records
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setIntentPage(p => Math.max(1, p - 1))} disabled={intentPage === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-medium">Page {intentPage} of {totalIntentPages}</div>
                <Button variant="outline" size="sm" onClick={() => setIntentPage(p => Math.min(totalIntentPages, p + 1))} disabled={intentPage === totalIntentPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )}
    </div>
  );
}
