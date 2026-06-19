import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, QrCode, Wallet } from "lucide-react";
import { useState } from "react";
import { useAdminWallets, useAdminCreateWallet, useAdminUpdateWallet, useAdminDeleteWallet } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminWallets() {
  const { data: wallets = [], isLoading } = useAdminWallets();
  const createWallet = useAdminCreateWallet();
  const updateWallet = useAdminUpdateWallet();
  const deleteWallet = useAdminDeleteWallet();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ currency: "", address: "", network: "", qr_code_url: "" });

  const openCreate = () => {
    setEditing(null);
    setForm({ currency: "", address: "", network: "", qr_code_url: "" });
    setDialogOpen(true);
  };

  const openEdit = (w: any) => {
    setEditing(w);
    setForm({ currency: w.currency, address: w.address, network: w.network || "", qr_code_url: w.qr_code_url || "" });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.currency || !form.address) return;
    if (editing) {
      updateWallet.mutate({ id: editing.id, updates: { currency: form.currency, address: form.address, network: form.network || null, qr_code_url: form.qr_code_url || null } }, {
        onSuccess: () => setDialogOpen(false)
      });
    } else {
      createWallet.mutate({ currency: form.currency, address: form.address, network: form.network || undefined, qr_code_url: form.qr_code_url || undefined }, {
        onSuccess: () => setDialogOpen(false)
      });
    }
  };

  const handleDelete = (w: any) => {
    if (!confirm(`Delete the ${w.currency} wallet (${w.address.substring(0, 12)}...)? This cannot be undone.`)) return;
    deleteWallet.mutate(w.id);
  };

  const toggleActive = (w: any) => {
    updateWallet.mutate({ id: w.id, updates: { is_active: !w.is_active } });
  };

  const getQrUrl = (address: string) =>
    `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(address)}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Wallet Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{isLoading ? 'Loading...' : `${wallets.length} wallet addresses configured`}</p>
        </div>
        <Button onClick={openCreate} className="shadow-sm"><Plus className="h-4 w-4 mr-1" /> Add Wallet</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Currency</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Address</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Network</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">QR</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="p-3 text-left font-medium text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  Array(3).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-3"><Skeleton className="h-4 w-16" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-3 hidden sm:table-cell"><Skeleton className="h-10 w-10 rounded" /></td>
                      <td className="p-3"><Skeleton className="h-6 w-12 rounded-full" /></td>
                      <td className="p-3"><div className="flex gap-1"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
                    </tr>
                  ))
                ) : wallets.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center">
                    <Wallet className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground font-medium">No wallets configured</p>
                    <p className="text-xs text-muted-foreground mt-1">Add a wallet to enable deposits.</p>
                  </td></tr>
                ) : wallets.map((w: any) => (
                  <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{w.currency}</td>
                    <td className="p-3"><code className="text-xs bg-muted p-1 rounded break-all max-w-[200px] inline-block truncate">{w.address}</code></td>
                    <td className="p-3 text-muted-foreground">{w.network || "-"}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <img src={w.qr_code_url || getQrUrl(w.address)} alt="QR" className="w-10 h-10 rounded" />
                    </td>
                    <td className="p-3">
                      <Switch checked={w.is_active} onCheckedChange={() => toggleActive(w)} />
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(w)} disabled={deleteWallet.isPending}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Wallet" : "Add Wallet Address"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input value={form.currency} onChange={(e) => setForm(f => ({ ...f, currency: e.target.value }))} placeholder="e.g. Bitcoin (BTC)" />
            </div>
            <div className="space-y-2">
              <Label>Wallet Address</Label>
              <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Enter wallet address" />
            </div>
            <div className="space-y-2">
              <Label>Network</Label>
              <Input value={form.network} onChange={(e) => setForm(f => ({ ...f, network: e.target.value }))} placeholder="e.g. ERC-20, Bitcoin Network" />
            </div>
            <div className="space-y-2">
              <Label>Custom QR Code URL (optional)</Label>
              <Input value={form.qr_code_url} onChange={(e) => setForm(f => ({ ...f, qr_code_url: e.target.value }))} placeholder="Leave empty to auto-generate from address" />
              <p className="text-xs text-muted-foreground">If empty, a QR code will be auto-generated from the wallet address.</p>
            </div>
            {form.address && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <QrCode className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">QR Preview:</span>
                <img src={getQrUrl(form.address)} alt="QR Preview" className="w-16 h-16 rounded" />
              </div>
            )}
            <Button className="w-full" onClick={handleSave} disabled={createWallet.isPending || updateWallet.isPending}>
              {editing ? "Update Wallet" : "Create Wallet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
