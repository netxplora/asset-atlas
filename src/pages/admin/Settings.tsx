import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useAppSetting,
  useUpdateAppSetting,
  useAdminActiveCopyTrades,
  useAdminUpdateCopyTradePnl,
  useAdminUpdateUserPnlMode,
  useCryptoProviders,
  useAdminAddProvider,
  useAdminUpdateProvider,
  useAdminDeleteProvider,
} from "@/hooks/useSupabaseData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Activity, Pencil, Users, Loader2, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

const PNL_OPTIONS = [
  { value: "normal", label: "Normal", description: "PNL follows each trader's actual win rate", icon: Activity, color: "text-blue-500" },
  { value: "high", label: "High Profit", description: "All copy trades show consistent positive returns", icon: TrendingUp, color: "text-emerald-500" },
  { value: "low", label: "Low Profit", description: "All copy trades show declining performance", icon: TrendingDown, color: "text-red-500" },
];

export default function AdminSettings() {
  const { toast } = useToast();
  const { data: globalPnlMode, isLoading: pnlLoading } = useAppSetting("global_pnl_mode");
  const { data: cryptoProviders = [], isLoading: loadingProviders } = useCryptoProviders();
  const addProvider = useAdminAddProvider();
  const updateProvider = useAdminUpdateProvider();
  const deleteProvider = useAdminDeleteProvider();

  const updateSetting = useUpdateAppSetting();
  const { data: activeTrades = [], isLoading: tradesLoading } = useAdminActiveCopyTrades();
  const updatePnl = useAdminUpdateCopyTradePnl();
  const updatePnlMode = useAdminUpdateUserPnlMode();

  const { data: tpEnabledData } = useAppSetting("tp_crypto_enabled");
  const { data: tpNameData } = useAppSetting("tp_crypto_name");
  const { data: tpUrlData } = useAppSetting("tp_crypto_url");
  const { data: tpDescData } = useAppSetting("tp_crypto_desc");

  const [currentTpEnabled, setTpEnabled] = useState(false);
  const [tpName, setTpName] = useState("");
  const [tpUrl, setTpUrl] = useState("");
  const [tpDesc, setTpDesc] = useState("");

  useEffect(() => {
    // Default to true if not explicitly set to false
    if (tpEnabledData !== undefined) setTpEnabled(tpEnabledData !== "false");
    if (tpNameData !== undefined) setTpName(tpNameData || "");
    if (tpUrlData !== undefined) setTpUrl(tpUrlData || "");
    if (tpDescData !== undefined) setTpDesc(tpDescData || "");
  }, [tpEnabledData, tpNameData, tpUrlData, tpDescData]);


  // Provider dialog state
  const [providerDialog, setProviderDialog] = useState<{ open: boolean; data: any | null }>({ open: false, data: null });
  const [pForm, setPForm] = useState({ provider_name: "", provider_url: "", priority: 1, status: true, description: "" });

  const openAddProvider = () => {
    setPForm({ provider_name: "", provider_url: "", priority: 1, status: true, description: "" });
    setProviderDialog({ open: true, data: null });
  };

  const openEditProvider = (p: any) => {
    setPForm({ provider_name: p.provider_name, provider_url: p.provider_url, priority: p.priority, status: p.status, description: p.description || "" });
    setProviderDialog({ open: true, data: p });
  };

  const handleProviderSave = async () => {
    if (providerDialog.data) {
      await updateProvider.mutateAsync({ id: providerDialog.data.id, updates: pForm });
    } else {
      await addProvider.mutateAsync(pForm);
    }
    setProviderDialog({ open: false, data: null });
  };

  const handleProviderDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this provider?")) {
      await deleteProvider.mutateAsync(id);
    }
  };

  // PNL edit dialog state
  const [editPnlTrade, setEditPnlTrade] = useState<any | null>(null);
  const [pnlValue, setPnlValue] = useState("");

  // PNL mode edit dialog state
  const [editPnlModeUser, setEditPnlModeUser] = useState<any | null>(null);
  const [pnlModeValue, setPnlModeValue] = useState("normal");

  const handleSave = (section: string) => {
    toast({ title: "Settings Saved", description: `${section} settings have been updated.` });
  };

  const handlePnlSave = () => {
    if (!editPnlTrade || pnlValue === "") return;
    updatePnl.mutate(
      { tradeId: editPnlTrade.id, currentPnl: parseFloat(pnlValue) },
      { onSuccess: () => { setEditPnlTrade(null); setPnlValue(""); } }
    );
  };

  const handlePnlModeSave = () => {
    if (!editPnlModeUser) return;
    updatePnlMode.mutate(
      { userId: editPnlModeUser.user_id, pnlMode: pnlModeValue },
      { onSuccess: () => { setEditPnlModeUser(null); } }
    );
  };

  const handleTpSave = async () => {
    try {
      await updateSetting.mutateAsync({ key: "tp_crypto_enabled", value: currentTpEnabled ? "true" : "false" });
      await updateSetting.mutateAsync({ key: "tp_crypto_name", value: tpName });
      await updateSetting.mutateAsync({ key: "tp_crypto_url", value: tpUrl });
      await updateSetting.mutateAsync({ key: "tp_crypto_desc", value: tpDesc });
      toast({ title: "Settings Saved", description: "Third party integration settings updated." });
    } catch(err) {
      // toast is already handled by the hook
    }
  };

  const currentPnl = PNL_OPTIONS.find(o => o.value === (globalPnlMode || "normal")) || PNL_OPTIONS[0];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Platform Settings</h1>
      <div className="grid lg:grid-cols-2 gap-6">
        {/* General */}
        <Card>
          <CardHeader><CardTitle className="text-base">General Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2"><Label>Platform Name</Label><Input defaultValue="AssetVault" /></div>
            <div className="space-y-2"><Label>Support Email</Label><Input defaultValue="support@assetvault.com" /></div>
            <div className="space-y-2"><Label>Default Currency</Label><Input defaultValue="USD" /></div>
            <Button onClick={() => handleSave("General")}>Save Settings</Button>
          </CardContent>
        </Card>

        {/* Copy Trading */}
        <Card>
          <CardHeader><CardTitle className="text-base">Copy Trading Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div><Label>Enable Copy Trading</Label><div className="text-xs text-muted-foreground">Allow users to copy traders</div></div>
              <Switch defaultChecked />
            </div>
            <Separator />

            {/* Global PNL Mode Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-semibold">Global PNL Logic</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Controls profit/loss behavior for all copy trades globally.
                    Per-user overrides (set below) take priority.
                  </p>
                </div>
                <Badge variant="outline" className={`text-xs ${currentPnl.color}`}>
                  {currentPnl.label}
                </Badge>
              </div>

              <Select
                value={globalPnlMode || "normal"}
                onValueChange={(val) => updateSetting.mutate({ key: "global_pnl_mode", value: val })}
                disabled={pnlLoading || updateSetting.isPending}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select PNL mode" />
                </SelectTrigger>
                <SelectContent>
                  {PNL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className={`h-3.5 w-3.5 ${opt.color}`} />
                        <span>{opt.label}</span>
                        <span className="text-xs text-muted-foreground ml-1">— {opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {PNL_OPTIONS.map((opt) => {
                  const isActive = (globalPnlMode || "normal") === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => updateSetting.mutate({ key: "global_pnl_mode", value: opt.value })}
                      disabled={updateSetting.isPending}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                        isActive ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <opt.icon className={`h-5 w-5 ${isActive ? opt.color : "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${isActive ? "" : "text-muted-foreground"}`}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />
            <div className="space-y-3">
              <Label>Tier Minimum Balances</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Starter</Label><Input defaultValue="100" /></div>
                <div className="space-y-1"><Label className="text-xs">Silver</Label><Input defaultValue="500" /></div>
                <div className="space-y-1"><Label className="text-xs">Gold</Label><Input defaultValue="2000" /></div>
                <div className="space-y-1"><Label className="text-xs">Elite</Label><Input defaultValue="10000" /></div>
              </div>
            </div>
            <Button onClick={() => handleSave("Copy Trading")}>Save Settings</Button>
          </CardContent>
        </Card>

        {/* ── Active Copy Trading Users ── */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Active Copy Trading Users
              </CardTitle>
              <Badge variant="secondary">{activeTrades.length} active</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {tradesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : activeTrades.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active copy trades at the moment.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Trader</th>
                      <th className="pb-3 font-medium text-right">Capital</th>
                      <th className="pb-3 font-medium text-right">Current PNL</th>
                      <th className="pb-3 font-medium text-center">PNL Mode</th>
                      <th className="pb-3 font-medium text-right">Started</th>
                      <th className="pb-3 font-medium text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTrades.map((trade: any) => {
                      const pnl = trade.current_pnl || 0;
                      const isProfit = pnl >= 0;
                      const userPnlMode = trade.profile?.pnl_mode || "normal";
                      const modeOption = PNL_OPTIONS.find(o => o.value === userPnlMode) || PNL_OPTIONS[0];
                      const daysAgo = Math.floor((Date.now() - new Date(trade.created_at).getTime()) / 86400000);

                      return (
                        <tr key={trade.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-3">
                            <div className="font-medium">
                              {trade.profile?.first_name || "—"} {trade.profile?.last_name || ""}
                            </div>
                            <div className="text-xs text-muted-foreground">{trade.profile?.email || "—"}</div>
                          </td>
                          <td className="py-3">
                            <div className="font-medium">{trade.traders?.name || "—"}</div>
                            <div className="text-xs text-muted-foreground">{trade.traders?.market || "—"}</div>
                          </td>
                          <td className="py-3 text-right font-medium">
                            ${Number(trade.allocated_capital).toLocaleString()}
                          </td>
                          <td className="py-3 text-right">
                            <span className={`font-semibold ${isProfit ? "text-emerald-500" : "text-red-500"}`}>
                              {isProfit ? "+" : ""}${pnl.toFixed(2)}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <Badge variant="outline" className={`text-xs ${modeOption.color}`}>
                              {modeOption.label}
                            </Badge>
                          </td>
                          <td className="py-3 text-right text-muted-foreground text-xs">
                            {daysAgo === 0 ? "Today" : `${daysAgo}d ago`}
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                title="Edit PNL"
                                onClick={() => {
                                  setEditPnlTrade(trade);
                                  setPnlValue(String(pnl));
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Select
                                value={userPnlMode}
                                onValueChange={(val) => {
                                  updatePnlMode.mutate({ userId: trade.user_id, pnlMode: val });
                                }}
                              >
                                <SelectTrigger className="h-7 w-[90px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {PNL_OPTIONS.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      <span className="flex items-center gap-1.5">
                                        <opt.icon className={`h-3 w-3 ${opt.color}`} />
                                        {opt.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Global Payment Settings */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Global Payment Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Configure payment methods, wallet addresses, and QR codes displayed to investors on the deposit page. Manage individual wallets on the <strong>Wallet Management</strong> page.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Deposit Amount (USD)</Label>
                <Input type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label>Maximum Deposit Amount (USD)</Label>
                <Input type="number" defaultValue="100000" />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Deposit Instructions</Label>
              <Textarea defaultValue="Please send the exact amount to the wallet address displayed. After payment, enter your transaction hash and click Confirm Deposit. Your deposit will be credited once verified by the admin team." rows={3} />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Enable Deposit Notifications</Label><div className="text-xs text-muted-foreground">Notify investors on deposit status changes</div></div>
              <Switch defaultChecked />
            </div>
            <Button onClick={() => handleSave("Payment")}>Save Payment Settings</Button>
          </CardContent>
        </Card>

        {/* Crypto Provider Management */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Third Party Crypto Providers</CardTitle>
            <Button size="sm" onClick={openAddProvider}><Plus className="h-4 w-4 mr-1"/> Add Provider</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">Manage dynamic third party crypto purchasing platforms that appear on the deposit page. The provider with the lowest Priority number is the Default.</p>
            
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
              <div><Label>Enable Buy Crypto Feature Globally</Label><div className="text-xs text-muted-foreground">Show the 'Buy Crypto' tab to users</div></div>
              <Switch
                checked={currentTpEnabled}
                onCheckedChange={async (val) => {
                  setTpEnabled(val);
                  await updateSetting.mutateAsync({ key: "tp_crypto_enabled", value: val ? "true" : "false" });
                }}
              />
            </div>

            {loadingProviders ? (
              <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : cryptoProviders.length === 0 ? (
              <div className="text-center p-8 bg-muted/20 border rounded-lg text-muted-foreground text-sm">No providers configured. Click Add Provider to create one.</div>
            ) : (
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Provider</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cryptoProviders.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium">{p.provider_name}<br/><span className="text-xs text-muted-foreground font-normal truncate max-w-[200px] block">{p.provider_url}</span></td>
                        <td className="px-4 py-3">{p.priority}</td>
                        <td className="px-4 py-3">
                          <Switch 
                            checked={p.status} 
                            onCheckedChange={(val) => updateProvider.mutate({ id: p.id, updates: { status: val } })}
                          />
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openEditProvider(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="destructive" size="sm" onClick={() => handleProviderDelete(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Notification Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><Label className="text-sm">Deposit Approved</Label><p className="text-xs text-muted-foreground">Notify when deposit is approved</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><Label className="text-sm">Deposit Rejected</Label><p className="text-xs text-muted-foreground">Notify when deposit is rejected</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><Label className="text-sm">Withdrawal Processed</Label><p className="text-xs text-muted-foreground">Notify on withdrawal status</p></div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div><Label className="text-sm">Investment Matured</Label><p className="text-xs text-muted-foreground">Notify when plan term ends</p></div>
                <Switch defaultChecked />
              </div>
            </div>
            <Button onClick={() => handleSave("Notification")}>Save Notification Settings</Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={providerDialog.open} onOpenChange={(open) => !open && setProviderDialog({ open: false, data: null })}>
        <DialogContent>
          <DialogHeader><DialogTitle>{providerDialog.data ? "Edit Provider" : "Add Provider"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input value={pForm.provider_name} onChange={(e) => setPForm({...pForm, provider_name: e.target.value})} placeholder="e.g. Transak" />
            </div>
            <div className="space-y-2">
              <Label>Embed URL</Label>
              <Input value={pForm.provider_url} onChange={(e) => setPForm({...pForm, provider_url: e.target.value})} placeholder="https://..." />
              <p className="text-xs text-muted-foreground">Be sure to provide the exact iframe/widget embed URL.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Input type="number" min="1" value={pForm.priority} onChange={(e) => setPForm({...pForm, priority: parseInt(e.target.value) || 1})} />
                <p className="text-xs text-muted-foreground">1 is highest priority (Default).</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="pt-2">
                  <Switch checked={pForm.status} onCheckedChange={(val) => setPForm({...pForm, status: val})} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea value={pForm.description} onChange={(e) => setPForm({...pForm, description: e.target.value})} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProviderDialog({ open: false, data: null })}>Cancel</Button>
            <Button onClick={handleProviderSave} disabled={!pForm.provider_name || !pForm.provider_url || addProvider.isPending || updateProvider.isPending}>Save Provider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit PNL Dialog ── */}
      <Dialog open={!!editPnlTrade} onOpenChange={(open) => { if (!open) setEditPnlTrade(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Current PNL</DialogTitle>
          </DialogHeader>
          {editPnlTrade && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {editPnlTrade.profile?.first_name} {editPnlTrade.profile?.last_name}
                </span>
                {" "}copying{" "}
                <span className="font-medium text-foreground">{editPnlTrade.traders?.name}</span>
              </div>
              <div className="space-y-2">
                <Label>PNL Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={pnlValue}
                  onChange={(e) => setPnlValue(e.target.value)}
                  placeholder="e.g. 150.50 or -25.00"
                />
                <p className="text-xs text-muted-foreground">
                  Use positive values for profit, negative for loss.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPnlTrade(null)}>Cancel</Button>
            <Button onClick={handlePnlSave} disabled={updatePnl.isPending}>
              {updatePnl.isPending ? "Saving..." : "Save PNL"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
