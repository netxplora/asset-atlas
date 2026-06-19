import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useAdminTransactions,
  useAdminUsers,
  useAdminCreateTransaction,
  useAdminUpdateTransaction,
  useAdminDeleteTransaction
} from "@/hooks/useSupabaseData";
import { Plus, Edit2, Trash2, Search, ArrowUpDown, ChevronLeft, ChevronRight, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ITEMS_PER_PAGE = 15;

export default function AdminTransactions() {
  const { data: transactions = [], isLoading } = useAdminTransactions();
  const { data: users = [] } = useAdminUsers();

  const createTx = useAdminCreateTransaction();
  const updateTx = useAdminUpdateTransaction();
  const deleteTx = useAdminDeleteTransaction();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeTab, setActiveTab] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    user_id: "",
    type: "deposit",
    amount: "",
    description: "",
    status: "completed",
  });

  const handleTabChange = (val: string) => { setActiveTab(val); setCurrentPage(1); };
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchQuery(e.target.value); setCurrentPage(1); };

  const filteredAndSorted = useMemo(() => {
    let result = transactions;

    // Filter by tab
    if (activeTab !== "all") {
      if (activeTab === "pending") {
        result = result.filter((tx: any) => tx.status === "pending");
      } else {
        result = result.filter((tx: any) => tx.type === activeTab);
      }
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((tx: any) =>
        tx.id?.toLowerCase().includes(q) ||
        tx.type?.toLowerCase().includes(q) ||
        tx.description?.toLowerCase().includes(q) ||
        tx.profiles?.first_name?.toLowerCase().includes(q) ||
        tx.profiles?.last_name?.toLowerCase().includes(q) ||
        tx.profiles?.email?.toLowerCase().includes(q)
      );
    }

    // Sort
    result = [...result].sort((a: any, b: any) => {
      const db = new Date(b.created_at).getTime();
      const da = new Date(a.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });

    return result;
  }, [transactions, activeTab, searchQuery, sortOrder]);

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginatedData = filteredAndSorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleOpenDialog = (tx?: any) => {
    if (tx) {
      setEditingTx(tx);
      setFormData({
        user_id: tx.user_id,
        type: tx.type,
        amount: tx.amount.toString(),
        description: tx.description || "",
        status: tx.status,
      });
    } else {
      setEditingTx(null);
      setFormData({
        user_id: "",
        type: "deposit",
        amount: "",
        description: "",
        status: "completed",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx && !formData.user_id) return;
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;

    if (editingTx) {
      await updateTx.mutateAsync({
        id: editingTx.id,
        updates: {
          type: formData.type,
          amount: parseFloat(formData.amount),
          description: formData.description,
          status: formData.status,
        }
      });
    } else {
      await createTx.mutateAsync({
        user_id: formData.user_id,
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        status: formData.status,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (tx: any) => {
    if (!confirm(`Delete this ${tx.type} transaction of $${tx.amount?.toLocaleString()}? This cannot be undone.`)) return;
    await deleteTx.mutateAsync(tx.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline" className="border-warning text-warning capitalize">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Transaction Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{isLoading ? 'Loading...' : `${transactions.length} total records`}</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" /> Add Transaction
        </Button>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Transaction" : "New Transaction"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!editingTx && (
              <div className="space-y-2">
                <Label>User <span className="text-destructive">*</span></Label>
                <Select value={formData.user_id} onValueChange={(v) => setFormData({ ...formData, user_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select User" /></SelectTrigger>
                  <SelectContent>
                    {users.map((u: any) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {u.first_name} {u.last_name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.user_id && <p className="text-xs text-destructive">Please select a user</p>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                    <SelectItem value="penalty">Penalty</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="profit">Profit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Amount <span className="text-destructive">*</span></Label>
              <Input type="number" step="0.01" min="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional description" />
            </div>

            <Button type="submit" className="w-full" disabled={createTx.isPending || updateTx.isPending || (!editingTx && !formData.user_id)}>
              {(createTx.isPending || updateTx.isPending) ? "Processing..." : editingTx ? "Update Transaction" : "Create Transaction"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row justify-between gap-4">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full lg:w-auto">
          <TabsList className="w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="deposit">Deposits</TabsTrigger>
            <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search user, type, description..." className="pl-8 bg-background" value={searchQuery} onChange={handleSearchChange} />
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

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Amount</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Description</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="p-3 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-3"><div className="space-y-1.5"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-36" /></div></td>
                      <td className="p-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="p-3"><div className="flex justify-end gap-1"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
                    </tr>
                  ))
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center">
                    <History className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">No transactions found</p>
                  </td></tr>
                ) : paginatedData.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-medium">{tx.profiles?.first_name} {tx.profiles?.last_name}</div>
                      <div className="text-xs text-muted-foreground">{tx.profiles?.email}</div>
                    </td>
                    <td className="p-3"><Badge variant="outline" className="capitalize">{tx.type}</Badge></td>
                    <td className="p-3 font-bold">${tx.amount?.toLocaleString()}</td>
                    <td className="p-3 text-muted-foreground max-w-[200px] truncate">{tx.description || "-"}</td>
                    <td className="p-3 whitespace-nowrap">{new Date(tx.created_at).toLocaleString()}</td>
                    <td className="p-3">{getStatusBadge(tx.status)}</td>
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(tx)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(tx)} disabled={deleteTx.isPending}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
  );
}
