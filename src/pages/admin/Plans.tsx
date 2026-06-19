import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  useAdminInvestmentPlans,
  useCreateInvestmentPlan,
  useUpdateInvestmentPlan,
  useDeleteInvestmentPlan,
} from "@/hooks/useSupabaseData";

const emptyForm = { name: "", category: "Forex", min_amount: "", roi_percentage: "", duration_days: "", is_active: true, description: "" };

export default function AdminPlans() {
  const { data: plans = [], isLoading } = useAdminInvestmentPlans();
  const createPlan = useCreateInvestmentPlan();
  const updatePlan = useUpdateInvestmentPlan();
  const deletePlan = useDeleteInvestmentPlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: p.category || "Forex",
      min_amount: String(p.min_amount),
      roi_percentage: String(p.roi_percentage),
      duration_days: String(p.duration_days),
      is_active: p.is_active ?? true,
      description: p.description || "",
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.category || !form.min_amount || !form.roi_percentage || !form.duration_days) return;

    const payload = {
      name: form.name,
      category: form.category,
      min_amount: parseFloat(form.min_amount),
      roi_percentage: parseFloat(form.roi_percentage),
      duration_days: parseInt(form.duration_days, 10),
      is_active: form.is_active,
      description: form.description || null,
    };

    if (editingId) {
      updatePlan.mutate({ id: editingId, ...payload }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createPlan.mutate(payload, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = (p: any) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    deletePlan.mutate(p.id);
  };

  const setField = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Investment Plans</h1>
        <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Create Plan</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-3 text-left font-medium">Plan</th>
                  <th className="p-3 text-left font-medium">Category</th>
                  <th className="p-3 text-left font-medium">Min. Investment</th>
                  <th className="p-3 text-left font-medium">ROI</th>
                  <th className="p-3 text-left font-medium">Duration</th>
                  <th className="p-3 text-left font-medium">Status</th>
                  <th className="p-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {plans.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No investment plans yet. Click "Create Plan" to add one.</td></tr>
                )}
                {plans.map((p: any) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3"><Badge variant="outline">{p.category || "—"}</Badge></td>
                    <td className="p-3">${Number(p.min_amount).toLocaleString()}</td>
                    <td className="p-3 font-bold text-success">{p.roi_percentage}%</td>
                    <td className="p-3">{p.duration_days} days</td>
                    <td className="p-3">
                      <Badge variant={p.is_active ? "outline" : "secondary"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
          <DialogHeader><DialogTitle>{editingId ? "Edit Plan" : "Create Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Plan Name</Label><Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="e.g. Gold Forex Plan" /></div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setField("category", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Forex">Forex</SelectItem>
                  <SelectItem value="Crypto">Crypto</SelectItem>
                  <SelectItem value="Commodities">Commodities</SelectItem>
                  <SelectItem value="Stocks">Stocks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Description (optional)</Label><Input value={form.description} onChange={e => setField("description", e.target.value)} placeholder="Brief description of the plan" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Min. Investment ($)</Label><Input type="number" value={form.min_amount} onChange={e => setField("min_amount", e.target.value)} placeholder="1000" /></div>
              <div className="space-y-2"><Label>ROI (%)</Label><Input type="number" value={form.roi_percentage} onChange={e => setField("roi_percentage", e.target.value)} placeholder="12" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Duration (days)</Label><Input type="number" value={form.duration_days} onChange={e => setField("duration_days", e.target.value)} placeholder="60" /></div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.is_active ? "Active" : "Inactive"} onValueChange={v => setField("is_active", v === "Active")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={createPlan.isPending || updatePlan.isPending}>
              {(createPlan.isPending || updatePlan.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
