import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Eye, User, Filter, Search } from "lucide-react";
import { useState } from "react";
import { useAdminTraders, useAdminCreateTrader, useAdminUpdateTrader, useAdminDeleteTrader } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Forex", "Crypto", "Commodities"];
const emptyForm = { name: "", bio: "", avatar_url: "", win_rate: "", total_profit: "", followers: "", is_active: true, category: "Forex", min_copy_balance: "500", platform_fee_percentage: "10" };

export default function AdminTraders() {
  const { toast } = useToast();
  const { data: traders = [], isLoading } = useAdminTraders();
  const createTrader = useAdminCreateTrader();
  const updateTrader = useAdminUpdateTrader();
  const deleteTrader = useAdminDeleteTrader();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewTrader, setPreviewTrader] = useState<any | null>(null);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTraders = traders.filter((t: any) => {
    const matchCategory = filterCategory === "all" || t.category === filterCategory;
    const matchSearch = !searchQuery.trim() || 
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bio?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const openCreate = () => { setEditing(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      name: t.name,
      bio: t.bio || "",
      avatar_url: t.avatar_url || "",
      win_rate: String(t.win_rate),
      total_profit: String(t.total_profit),
      followers: String(t.followers),
      is_active: t.is_active,
      category: t.category || "Forex",
      min_copy_balance: String(t.min_copy_balance ?? 500),
      platform_fee_percentage: String(t.platform_fee_percentage ?? 10),
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name) return;
    const data: any = {
      name: form.name,
      bio: form.bio || undefined,
      avatar_url: form.avatar_url || undefined,
      win_rate: parseFloat(form.win_rate) || 0,
      total_profit: parseFloat(form.total_profit) || 0,
      followers: parseInt(form.followers) || 0,
      is_active: form.is_active,
      category: form.category,
      min_copy_balance: parseFloat(form.min_copy_balance) || 500,
      platform_fee_percentage: parseFloat(form.platform_fee_percentage) || 10,
    };

    if (editing) {
      updateTrader.mutate({ id: editing.id, updates: data }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createTrader.mutate(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (t: any) => {
    if (!confirm(`Delete trader "${t.name}"? This cannot be undone.`)) return;
    deleteTrader.mutate(t.id);
  };

  const setField = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "Forex": return "border-blue-500/30 text-blue-600";
      case "Crypto": return "border-orange-500/30 text-orange-600";
      case "Commodities": return "border-emerald-500/30 text-emerald-600";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Copy Trading Management</h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Trader</Button>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search traders..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left font-medium">Trader</th><th className="p-3 text-left font-medium">Category</th><th className="p-3 text-left font-medium">Win Rate</th><th className="p-3 text-left font-medium">Profit</th><th className="p-3 text-left font-medium">Followers</th><th className="p-3 text-left font-medium">Status</th><th className="p-3 text-left font-medium">Actions</th></tr></thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Loading traders...</td></tr>
                ) : filteredTraders.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No traders found.</td></tr>
                ) : filteredTraders.map((t: any) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {t.avatar_url && <img src={t.avatar_url} alt={t.name} className="w-8 h-8 rounded-full object-cover" width={32} height={32} loading="lazy" />}
                        <span className="font-medium">{t.name}</span>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline" className={getCategoryBadgeColor(t.category)}>{t.category || "—"}</Badge></td>
                    <td className="p-3 font-bold text-success">{t.win_rate}%</td>
                    <td className="p-3 font-bold">${t.total_profit.toLocaleString()}</td>
                    <td className="p-3">{t.followers.toLocaleString()}</td>
                    <td className="p-3"><Badge variant={t.is_active ? "default" : "secondary"} className={t.is_active ? "bg-success" : ""}>{t.is_active ? "Active" : "Inactive"}</Badge></td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setPreviewTrader(t)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="outline" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(t)} disabled={deleteTrader.isPending}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit Trader" : "Add Trader"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="Full name" /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setField("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Win Rate (%)</Label><Input type="number" value={form.win_rate} onChange={e => setField("win_rate", e.target.value)} /></div>
              <div className="space-y-2"><Label>Total Profit ($)</Label><Input type="number" value={form.total_profit} onChange={e => setField("total_profit", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min Copy Balance ($)</Label><Input type="number" value={form.min_copy_balance} onChange={e => setField("min_copy_balance", e.target.value)} /></div>
              <div className="space-y-2"><Label>Platform Fee (%)</Label><Input type="number" value={form.platform_fee_percentage} onChange={e => setField("platform_fee_percentage", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Followers</Label><Input type="number" value={form.followers} onChange={e => setField("followers", e.target.value)} /></div>
              <div className="space-y-2 flex items-end gap-2">
                <div className="flex items-center gap-2">
                  <Label>Active</Label>
                  <Switch checked={form.is_active} onCheckedChange={(v) => setField("is_active", v)} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 shrink-0 rounded-full border bg-muted flex items-center justify-center overflow-hidden">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                     <User className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input value={form.avatar_url} onChange={e => setField("avatar_url", e.target.value)} placeholder="https://... OR upload" />
                  <Input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    toast({ title: "Uploading...", description: "Please wait while we upload the image." });
                    const fileExt = file.name.split('.').pop();
                    const fileName = `trader-${Date.now()}-${Math.random()}.${fileExt}`;
                    const { data, error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
                    if (error) {
                      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
                    } else if (data) {
                      const url = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
                      setField("avatar_url", url);
                      toast({ title: "Image Uploaded", description: "Image successfully uploaded." });
                    }
                  }} />
                </div>
              </div>
            </div>
            <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={e => setField("bio", e.target.value)} placeholder="Trader biography..." rows={3} /></div>
            <Button className="w-full" onClick={handleSave} disabled={createTrader.isPending || updateTrader.isPending}>
              {editing ? "Update Trader" : "Add Trader"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTrader} onOpenChange={o => !o && setPreviewTrader(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Trader Profile</DialogTitle></DialogHeader>
          {previewTrader && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {previewTrader.avatar_url && <img src={previewTrader.avatar_url} alt={previewTrader.name} className="w-16 h-16 rounded-full object-cover" />}
                <div>
                  <h3 className="text-lg font-bold">{previewTrader.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={previewTrader.is_active ? "default" : "secondary"} className={previewTrader.is_active ? "bg-success" : ""}>{previewTrader.is_active ? "Active" : "Inactive"}</Badge>
                    <Badge variant="outline" className={getCategoryBadgeColor(previewTrader.category)}>{previewTrader.category || "—"}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold text-success">{previewTrader.win_rate}%</div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold">${previewTrader.total_profit.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Profit</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-lg font-bold">{previewTrader.followers.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
              </div>
              {previewTrader.bio && <p className="text-sm text-muted-foreground">{previewTrader.bio}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
