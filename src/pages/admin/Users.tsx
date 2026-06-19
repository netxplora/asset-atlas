import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Pencil, DollarSign, Users as UsersIcon, ShieldCheck, ShieldOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAdminUsers, useAdminUpdateUser, usePromoteToAdmin, useRevokeAdmin } from "@/hooks/useSupabaseData";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsers() {
  const { data: users = [], isLoading } = useAdminUsers();
  const updateUser = useAdminUpdateUser();
  const promoteToAdmin = usePromoteToAdmin();
  const revokeAdmin = useRevokeAdmin();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState("");
  
  const [editUser, setEditUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", kyc_status: "", pnl_mode: "" });
  
  const [balanceUser, setBalanceUser] = useState<any>(null);
  const [newBalance, setNewBalance] = useState("");

  // Role management dialogs
  const [promoteTarget, setPromoteTarget] = useState<any>(null);
  const [revokeTarget, setRevokeTarget] = useState<any>(null);

  const filtered = users.filter((u: any) =>
    (u.first_name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.last_name || "").toLowerCase().includes(search.toLowerCase()) || 
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (u: any) => {
    setEditUser(u);
    setEditForm({ first_name: u.first_name || "", last_name: u.last_name || "", kyc_status: u.kyc_status, pnl_mode: u.pnl_mode || "normal" });
  };

  const handleEditSave = () => {
    if (!editUser) return;
    updateUser.mutate({
      id: editUser.user_id,
      updates: {
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        kyc_status: editForm.kyc_status,
        pnl_mode: editForm.pnl_mode
      }
    }, {
      onSuccess: () => setEditUser(null)
    });
  };

  const handleBalanceUpdate = () => {
    if (!balanceUser || newBalance === "") return;
    updateUser.mutate({
      id: balanceUser.user_id,
      updates: { balance: parseFloat(newBalance) }
    }, {
      onSuccess: () => {
        setBalanceUser(null);
        setNewBalance("");
      }
    });
  };

  const handlePromote = () => {
    if (!promoteTarget) return;
    promoteToAdmin.mutate(promoteTarget.user_id, {
      onSuccess: () => setPromoteTarget(null),
    });
  };

  const handleRevoke = () => {
    if (!revokeTarget) return;
    revokeAdmin.mutate(revokeTarget.user_id, {
      onSuccess: () => setRevokeTarget(null),
    });
  };

  const totalUsers = users.length;
  const verifiedCount = users.filter((u: any) => u.kyc_status === "verified").length;
  const adminCount = users.filter((u: any) => u.role === "admin").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{isLoading ? "Loading..." : `${totalUsers} users · ${adminCount} admins · ${verifiedCount} verified`}</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9 bg-background" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">User</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Balance</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">KYC</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">PnL Mode</th>
                  <th className="p-3 text-right font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-3"><div className="flex items-center gap-3"><Skeleton className="h-9 w-9 rounded-full" /><div className="space-y-2"><Skeleton className="h-4 w-28" /><Skeleton className="h-3 w-40" /></div></div></td>
                      <td className="p-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                      <td className="p-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                      <td className="p-3"><div className="flex justify-end gap-1"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-20" /></div></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                      <UsersIcon className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="font-medium">No users found</p>
                      {search && <p className="text-xs mt-1">Try adjusting your search query.</p>}
                    </td>
                  </tr>
                ) : filtered.map((u: any) => {
                  const isCurrentUser = u.user_id === currentUser?.id;
                  const isUserAdmin = u.role === "admin";

                  return (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                            {(u.first_name?.[0] || '?').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{u.first_name} {u.last_name}</div>
                            <div className="text-xs text-muted-foreground">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={isUserAdmin ? "default" : "outline"}
                          className={`text-[10px] uppercase tracking-wider ${isUserAdmin ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}`}
                        >
                          {isUserAdmin ? "Admin" : "User"}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold">${(u.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                      <td className="p-3">
                        <Badge variant={u.kyc_status === "verified" ? "default" : "outline"} className={`text-[10px] uppercase tracking-wider ${u.kyc_status === "verified" ? "bg-success" : "capitalize"}`}>
                          {u.kyc_status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider capitalize">{u.pnl_mode || "normal"}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1 justify-end flex-wrap">
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => openEdit(u)}><Pencil className="h-3 w-3 mr-1.5" /> Edit</Button>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setBalanceUser(u); setNewBalance(""); }}><DollarSign className="h-3 w-3 mr-1.5" /> Balance</Button>
                          {isUserAdmin ? (
                            !isCurrentUser && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                                onClick={() => setRevokeTarget(u)}
                              >
                                <ShieldOff className="h-3 w-3 mr-1.5" /> Revoke Admin
                              </Button>
                            )
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                              onClick={() => setPromoteTarget(u)}
                            >
                              <ShieldCheck className="h-3 w-3 mr-1.5" /> Promote
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Edit User</DialogTitle>
            <DialogDescription>Update user details and verification settings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label className="text-xs font-medium">First Name</Label><Input value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} className="h-10" /></div>
              <div className="space-y-2"><Label className="text-xs font-medium">Last Name</Label><Input value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} className="h-10" /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">KYC Status</Label>
              <Select value={editForm.kyc_status} onValueChange={v => setEditForm(f => ({ ...f, kyc_status: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">Copy Trading PnL Logic</Label>
              <Select value={editForm.pnl_mode} onValueChange={v => setEditForm(f => ({ ...f, pnl_mode: v }))}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select logic" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal (Win Rate Based)</SelectItem>
                  <SelectItem value="high">High Profit (Fast Climb)</SelectItem>
                  <SelectItem value="low">Low Profit (Forced Losses)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full font-semibold" onClick={handleEditSave} disabled={updateUser.isPending}>
              {updateUser.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Balance Update Dialog */}
      <Dialog open={!!balanceUser} onOpenChange={(open) => !open && setBalanceUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">Update Balance</DialogTitle>
            <DialogDescription>{balanceUser?.first_name} {balanceUser?.last_name} — {balanceUser?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-muted/50 p-4 rounded-lg border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Balance</span>
              <span className="font-bold text-lg">${(balanceUser?.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium">New Balance (USD)</Label>
              <Input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} placeholder="Enter new balance" className="h-12 text-lg font-medium" />
            </div>
            <Button className="w-full font-semibold" onClick={handleBalanceUpdate} disabled={updateUser.isPending}>
              {updateUser.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : "Update Balance"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote to Admin Confirmation Dialog */}
      <Dialog open={!!promoteTarget} onOpenChange={(open) => !open && setPromoteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-600" /> Promote to Admin
            </DialogTitle>
            <DialogDescription>
              You are about to grant full administrative access to this user. They will be able to manage all platform resources.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-400 text-sm font-bold shrink-0">
                  {(promoteTarget?.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{promoteTarget?.first_name} {promoteTarget?.last_name}</div>
                  <div className="text-xs text-muted-foreground">{promoteTarget?.email}</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This action will be recorded in the audit log. The user will gain access to all admin features immediately.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPromoteTarget(null)}>Cancel</Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handlePromote}
              disabled={promoteToAdmin.isPending}
            >
              {promoteToAdmin.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Promoting...</> : "Confirm Promotion"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Admin Confirmation Dialog */}
      <Dialog open={!!revokeTarget} onOpenChange={(open) => !open && setRevokeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <ShieldOff className="h-5 w-5 text-destructive" /> Revoke Admin Access
            </DialogTitle>
            <DialogDescription>
              You are about to remove administrative access from this user. They will only have standard user permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center text-destructive text-sm font-bold shrink-0">
                  {(revokeTarget?.first_name?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <div className="font-medium">{revokeTarget?.first_name} {revokeTarget?.last_name}</div>
                  <div className="text-xs text-muted-foreground">{revokeTarget?.email}</div>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              This action will be recorded in the audit log. The user will lose access to the admin dashboard immediately.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRevokeTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={revokeAdmin.isPending}
            >
              {revokeAdmin.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Revoking...</> : "Confirm Revocation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
