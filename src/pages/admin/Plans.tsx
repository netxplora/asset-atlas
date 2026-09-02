import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus, Pencil, Trash2, Loader2, TrendingUp, DollarSign, Clock, BarChart3,
  Coins, LineChart
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  useAdminInvestmentPlans,
  useCreateInvestmentPlan,
  useUpdateInvestmentPlan,
  useDeleteInvestmentPlan,
} from "@/hooks/useSupabaseData";

type Category = "Forex" | "Crypto" | "Commodities";

const CATEGORIES: { key: Category; label: string; icon: React.ElementType; color: string; bg: string }[] = [
  { key: "Forex", label: "Forex Trading", icon: LineChart, color: "text-blue-500", bg: "bg-blue-500/10" },
  { key: "Crypto", label: "Cryptocurrency", icon: Coins, color: "text-purple-500", bg: "bg-purple-500/10" },
  { key: "Commodities", label: "Commodities", icon: BarChart3, color: "text-amber-500", bg: "bg-amber-500/10" },
];

const emptyForm = {
  name: "",
  category: "Forex" as Category,
  min_amount: "",
  max_amount: "",
  roi_percentage: "",
  duration_days: "",
  is_active: true,
  description: "",
};

export default function AdminPlans() {
  const { data: plans = [], isLoading } = useAdminInvestmentPlans();
  const createPlan = useCreateInvestmentPlan();
  const updatePlan = useUpdateInvestmentPlan();
  const deletePlan = useDeleteInvestmentPlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [activeTab, setActiveTab] = useState<Category>("Forex");

  // Group plans by category
  const plansByCategory = useMemo(() => {
    const grouped: Record<Category, any[]> = { Forex: [], Crypto: [], Commodities: [] };
    plans.forEach((p: any) => {
      const cat = (p.category as Category) || "Forex";
      if (grouped[cat]) grouped[cat].push(p);
    });
    // Sort each category by min_amount ascending
    Object.keys(grouped).forEach(k => {
      grouped[k as Category].sort((a, b) => Number(a.min_amount) - Number(b.min_amount));
    });
    return grouped;
  }, [plans]);

  const openCreate = (cat?: Category) => {
    setEditingId(null);
    setForm({ ...emptyForm, category: cat || activeTab });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      category: (p.category as Category) || "Forex",
      min_amount: String(p.min_amount),
      max_amount: p.max_amount ? String(p.max_amount) : "",
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
      max_amount: form.max_amount ? parseFloat(form.max_amount) : null,
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

  const isSaving = createPlan.isPending || updatePlan.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Investment Plans</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure plans per asset class. Changes reflect immediately on the public Plans page.
          </p>
        </div>
        <Button onClick={() => openCreate()}>
          <Plus className="mr-2 h-4 w-4" /> Add Plan
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><TrendingUp className="h-4 w-4 text-primary" /></div>
            <div>
              <p className="text-xs text-muted-foreground">Total Plans</p>
              <p className="text-xl font-bold">{plans.length}</p>
            </div>
          </CardContent>
        </Card>
        {CATEGORIES.map(cat => (
          <Card key={cat.key} className="border-border/60">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${cat.bg}`}>
                <cat.icon className={`h-4 w-4 ${cat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{cat.key}</p>
                <p className="text-xl font-bold">{plansByCategory[cat.key].length}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Category)}>
        <TabsList className="grid grid-cols-3 w-full max-w-lg h-11">
          {CATEGORIES.map(cat => (
            <TabsTrigger key={cat.key} value={cat.key} className="gap-1.5 font-semibold text-xs sm:text-sm">
              <cat.icon className="h-3.5 w-3.5" />
              {cat.key}
              <Badge
                variant="secondary"
                className="ml-1 h-5 px-1.5 text-[10px] font-bold"
              >
                {plansByCategory[cat.key].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map(cat => {
          const catPlans = plansByCategory[cat.key];
          return (
            <TabsContent key={cat.key} value={cat.key} className="mt-6 space-y-4">
              {/* Category header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${cat.bg}`}>
                    <cat.icon className={`h-4 w-4 ${cat.color}`} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-base">{cat.label} Plans</h2>
                    <p className="text-xs text-muted-foreground">{catPlans.length} plan{catPlans.length !== 1 ? "s" : ""} configured</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => openCreate(cat.key)}>
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add {cat.key} Plan
                </Button>
              </div>

              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="rounded-xl border border-border bg-card p-5 space-y-3 animate-pulse">
                      <div className="h-4 w-32 bg-muted rounded" />
                      <div className="h-6 w-20 bg-muted rounded" />
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded" />)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : catPlans.length === 0 ? (
                <Card className="border-dashed border-2 border-border/60">
                  <CardContent className="p-12 text-center space-y-3">
                    <div className={`mx-auto w-12 h-12 rounded-full ${cat.bg} flex items-center justify-center`}>
                      <cat.icon className={`h-6 w-6 ${cat.color}`} />
                    </div>
                    <p className="font-medium text-foreground">No {cat.label} plans yet</p>
                    <p className="text-sm text-muted-foreground">Add your first {cat.key} investment plan to display it on the public Plans page.</p>
                    <Button onClick={() => openCreate(cat.key)}>
                      <Plus className="mr-2 h-4 w-4" /> Create {cat.key} Plan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {catPlans.map((p: any) => (
                    <Card key={p.id} className={`relative border transition-all hover:shadow-md ${p.is_active ? "border-border" : "border-border/40 opacity-60"}`}>
                      <CardHeader className="pb-3 pt-5 px-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-bold truncate">{p.name}</CardTitle>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description || "No description"}</p>
                          </div>
                          <Badge variant={p.is_active ? "default" : "secondary"} className="shrink-0 text-[10px]">
                            {p.is_active ? "Active" : "Off"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-5 pb-5 space-y-4">
                        {/* Key metrics */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                            <DollarSign className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-none">Min.</p>
                            <p className="text-sm font-bold mt-0.5">${Number(p.min_amount).toLocaleString()}</p>
                          </div>
                          <div className="bg-success/10 rounded-lg p-2.5 text-center">
                            <TrendingUp className="h-3.5 w-3.5 text-success mx-auto mb-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-none">ROI</p>
                            <p className="text-sm font-bold text-success mt-0.5">{p.roi_percentage}%</p>
                          </div>
                          <div className="bg-muted/50 rounded-lg p-2.5 text-center">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground mx-auto mb-0.5" />
                            <p className="text-[10px] text-muted-foreground leading-none">Days</p>
                            <p className="text-sm font-bold mt-0.5">{p.duration_days}d</p>
                          </div>
                        </div>
                        {p.max_amount && (
                          <p className="text-[11px] text-muted-foreground">Max: ${Number(p.max_amount).toLocaleString()}</p>
                        )}
                        {/* Actions */}
                        <div className="flex gap-2 pt-1">
                          <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={() => openEdit(p)}>
                            <Pencil className="mr-1.5 h-3 w-3" /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(p)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Investment Plan" : "Create Investment Plan"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Category selector — locked when editing so plans don't migrate categories silently */}
            <div className="space-y-2">
              <Label>Asset Category</Label>
              <Select value={form.category} onValueChange={v => setField("category", v)} disabled={!!editingId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Forex">Forex Trading</SelectItem>
                  <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="Commodities">Commodities</SelectItem>
                </SelectContent>
              </Select>
              {editingId && <p className="text-[11px] text-muted-foreground">Category cannot be changed after creation. Delete and recreate to move a plan.</p>}
            </div>

            <div className="space-y-2">
              <Label>Plan Name</Label>
              <Input value={form.name} onChange={e => setField("name", e.target.value)} placeholder={`e.g. ${form.category} Starter Plan`} />
            </div>

            <div className="space-y-2">
              <Label>Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
              <Textarea
                value={form.description}
                onChange={e => setField("description", e.target.value)}
                placeholder="Brief description shown on the public Plans page..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min. Investment ($)</Label>
                <Input type="number" value={form.min_amount} onChange={e => setField("min_amount", e.target.value)} placeholder="500" min="0" />
              </div>
              <div className="space-y-2">
                <Label>Max. Investment ($) <span className="text-muted-foreground font-normal text-[11px]">optional</span></Label>
                <Input type="number" value={form.max_amount} onChange={e => setField("max_amount", e.target.value)} placeholder="No limit" min="0" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>ROI (%)</Label>
                <Input type="number" value={form.roi_percentage} onChange={e => setField("roi_percentage", e.target.value)} placeholder="12.5" min="0" step="0.1" />
              </div>
              <div className="space-y-2">
                <Label>Duration (days)</Label>
                <Input type="number" value={form.duration_days} onChange={e => setField("duration_days", e.target.value)} placeholder="30" min="1" />
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-border/60">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible on the public Plans page</p>
              </div>
              <Switch checked={form.is_active} onCheckedChange={v => setField("is_active", v)} />
            </div>

            <Button className="w-full" onClick={handleSave} disabled={isSaving || !form.name || !form.min_amount || !form.roi_percentage || !form.duration_days}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingId ? "Update Plan" : "Create Plan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
