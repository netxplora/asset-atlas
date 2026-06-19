import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, CheckCircle2, Clock, XCircle, ArrowLeft, ArrowRight, DollarSign, RefreshCw, CreditCard, Wallet, AlertCircle, Loader2, ArrowDownToLine, ExternalLink, Upload, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useMemo, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWallets, useUserDeposits, useSubmitDeposit, useAppSetting, useCryptoProviders, useUserActiveDepositIntent, useCreateDepositIntent, useCancelDepositIntent, useSubmitDepositConfirmation } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";

const statusConfig: Record<string, { icon: any; className: string }> = {
  pending: { icon: Clock, className: "text-warning" },
  approved: { icon: CheckCircle2, className: "text-success" },
  rejected: { icon: XCircle, className: "text-destructive" },
};

export default function Deposit() {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedWalletId, setSelectedWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [txHash, setTxHash] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const { user } = useAuth();

  const { data: wallets = [], isLoading: loadingWallets } = useWallets();
  const { data: history = [], isLoading: loadingHistory } = useUserDeposits();
  const submitDeposit = useSubmitDeposit();

  const { data: activeIntent } = useUserActiveDepositIntent();
  const createDepositIntent = useCreateDepositIntent();
  const cancelDepositIntent = useCancelDepositIntent();
  const submitConfirmation = useSubmitDepositConfirmation();

  const [iframeLoading, setIframeLoading] = useState(true);
  const { data: tpEnabledData } = useAppSetting("tp_crypto_enabled");
  // Default to true if not explicitly set to false
  const tpEnabled = tpEnabledData !== "false";

  const { data: cryptoProviders = [] } = useCryptoProviders();
  const activeProviders = cryptoProviders.filter((p: any) => p.status);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  useEffect(() => {
    if (activeProviders.length > 0 && !selectedProviderId) {
      setSelectedProviderId(activeProviders[0].id);
    }
  }, [activeProviders, selectedProviderId]);

  const activeProvider = activeProviders.find((p: any) => p.id === selectedProviderId) || activeProviders[0];

  const selectedWallet = useMemo(() => wallets.find((w) => w.id === selectedWalletId), [wallets, selectedWalletId]);
  const usdAmount = parseFloat(amount) || 0;
  const cryptoAmount = selectedWallet ? usdAmount / (selectedWallet.exchange_rate || 1) : 0;
  const qrCodeUrl = selectedWallet
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedWallet.address)}`
    : "";

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({ title: "Copied!", description: "Wallet address copied to clipboard." });
  };

  const handleProceed = () => {
    if (!selectedWalletId || usdAmount <= 0) {
      toast({ title: "Missing Information", description: "Please select a payment method and enter an amount.", variant: "destructive" });
      return;
    }
    setStep(2);
    // Scroll to top for step 2
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBuyCrypto = async () => {
    if (!selectedWallet) return;
    try {
      await createDepositIntent.mutateAsync({
        deposit_method: activeProvider.provider_name,
        selected_currency: selectedWallet.currency,
        selected_network: selectedWallet.network || "",
        wallet_address: selectedWallet.address,
        amount: usdAmount,
        wallet_id: selectedWallet.id,
      });
      window.open(activeProvider.provider_url, "_blank");
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to start purchase process.", variant: "destructive" });
    }
  };

  const handleConfirmResumed = async () => {
    if (!txHash.trim()) {
      toast({ title: "Missing Information", description: "Please enter your transaction hash or sender wallet address.", variant: "destructive" });
      return;
    }
    const parsedAmount = parseFloat(amount) || 0;
    if (parsedAmount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter the amount sent.", variant: "destructive" });
      return;
    }

    let screenshot_url = undefined;

    if (screenshotFile && user) {
      setIsUploading(true);
      try {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('deposit_screenshots').upload(fileName, screenshotFile, { upsert: true });

        if (error) throw error;

        if (data) {
          screenshot_url = supabase.storage.from('deposit_screenshots').getPublicUrl(fileName).data.publicUrl;
        }
      } catch (error: any) {
        toast({ title: "Upload Failed", description: error.message || "Failed to upload screenshot", variant: "destructive" });
        setIsUploading(false);
        return;
      }
    }

    submitConfirmation.mutate({
      intentId: activeIntent!.id,
      amount_sent: parsedAmount,
      tx_hash: txHash,
      screenshot_url,
      user_notes: userNotes.trim() || undefined,
      currency: activeIntent!.selected_currency,
      wallet_id: activeIntent!.wallet_id!,
    }, {
      onSuccess: () => {
        setStep(1);
        setSelectedWalletId("");
        setAmount("");
        setTxHash("");
        setUserNotes("");
        setScreenshotFile(null);
        setIsUploading(false);
      },
      onError: () => {
        setIsUploading(false);
      }
    });
  };

  const handleConfirm = async () => {
    if (!txHash.trim()) {
      toast({ title: "Missing Information", description: "Please enter your transaction hash or sender wallet address.", variant: "destructive" });
      return;
    }

    let screenshot_url = undefined;

    if (screenshotFile && user) {
      setIsUploading(true);
      try {
        const fileExt = screenshotFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage.from('deposit_screenshots').upload(fileName, screenshotFile, { upsert: true });

        if (error) throw error;

        if (data) {
          screenshot_url = supabase.storage.from('deposit_screenshots').getPublicUrl(fileName).data.publicUrl;
        }
      } catch (error: any) {
        toast({ title: "Upload Failed", description: error.message || "Failed to upload screenshot", variant: "destructive" });
        setIsUploading(false);
        return;
      }
    }

    submitDeposit.mutate({
      amount: usdAmount,
      currency: selectedWallet!.currency,
      wallet_id: selectedWallet!.id,
      tx_hash: txHash,
      screenshot_url,
      user_notes: userNotes.trim() || undefined,
    }, {
      onSuccess: () => {
        setStep(1);
        setSelectedWalletId("");
        setAmount("");
        setTxHash("");
        setUserNotes("");
        setScreenshotFile(null);
        setIsUploading(false);
      },
      onError: () => {
        setIsUploading(false);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 animate-fade-in-up">
        {(step === 2 || step === 3) && (
          <Button variant="outline" size="icon" onClick={() => setStep(1)} disabled={submitDeposit.isPending || submitConfirmation.isPending} className="shrink-0 transition-transform hover:-translate-x-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold font-heading">Deposit Funds</h1>
          <p className="text-sm text-muted-foreground mt-1">Add capital to your account to start investing.</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${step === 1 ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? "bg-background/20 text-white" : "bg-background text-muted-foreground"}`}>1</span>
          Amount & Method
        </div>
        <div className={`h-0.5 w-8 rounded-full ${step === 2 || step === 3 ? "bg-primary" : "bg-muted"}`} />
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${step === 2 ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? "bg-background/20 text-white" : "bg-background text-muted-foreground"}`}>2</span>
          Payment & Confirm
        </div>
        {activeIntent && (
          <>
            <div className={`h-0.5 w-8 rounded-full ${step === 3 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${step === 3 ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground"}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 3 ? "bg-background/20 text-white" : "bg-background text-muted-foreground"}`}>3</span>
              Payment Confirmation
            </div>
          </>
        )}
      </div>

      {activeIntent && step !== 3 && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm">Unfinished Cryptocurrency Purchase</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                You started a purchase of {activeIntent.selected_currency} on {new Date(activeIntent.initiated_timestamp).toLocaleString()}. Continue your deposit confirmation below.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Button
              variant="default"
              size="sm"
              className="w-full md:w-auto font-semibold"
              onClick={() => {
                setStep(3);
                setAmount(activeIntent.amount ? activeIntent.amount.toString() : "");
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              Continue Deposit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full md:w-auto text-destructive hover:text-destructive hover:bg-destructive/5"
              onClick={() => setShowCancelDialog(true)}
            >
              Cancel Deposit
            </Button>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 1 ? (
            <Card className="animate-fade-in-up border-primary/10 shadow-sm" style={{ animationDelay: "200ms" }}>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Configure Deposit</CardTitle>
                <CardDescription>Select your preferred currency and amount</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Currency / Network</Label>
                  {loadingWallets ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedWalletId} onValueChange={setSelectedWalletId} disabled={loadingWallets}>
                      <SelectTrigger className="h-12"><SelectValue placeholder="Choose a payment method" /></SelectTrigger>
                      <SelectContent>
                        {wallets.map((w: any) => (
                          <SelectItem key={w.id} value={w.id}>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{w.currency}</span>
                              {w.network && <span className="text-muted-foreground">({w.network})</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium">Amount to Deposit (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-11 h-14 text-lg font-medium shadow-inner bg-background"
                      min="0"
                    />
                  </div>
                </div>

                {selectedWallet && usdAmount > 0 && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <RefreshCw className="h-4 w-4" /> Conversion Summary
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm bg-background/50 rounded-lg p-3 border border-border/50">
                      <div>
                        <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Exchange Rate</div>
                        <div className="font-semibold">1 {selectedWallet.currency} = ${Number(selectedWallet.exchange_rate).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">You will pay</div>
                        <div className="font-semibold text-primary">{cryptoAmount.toFixed(selectedWallet.exchange_rate >= 100 ? 6 : 2)} {selectedWallet.currency}</div>
                      </div>
                    </div>
                  </div>
                )}

                <Button size="lg" className="w-full font-semibold group" onClick={handleProceed} disabled={!selectedWalletId || usdAmount <= 0}>
                  Continue to Payment <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ) : step === 2 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Card className="border-primary/20 shadow-md">
                <CardContent className="p-0">
                  <div className="bg-primary/5 p-6 border-b border-primary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="font-bold text-lg">Send Payment</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Please send exactly <strong className="text-foreground">{cryptoAmount.toFixed(selectedWallet!.exchange_rate >= 100 ? 6 : 2)} {selectedWallet!.currency}</strong>
                      </p>
                    </div>
                    <div className="bg-background px-4 py-2 rounded-lg border shadow-sm flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="font-bold text-lg">{usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="p-6">
                    {tpEnabled ? (
                      <Tabs defaultValue="wallet" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="wallet" className="flex items-center gap-2 py-2.5"><Wallet className="h-4 w-4" /> Crypto Transfer</TabsTrigger>
                          <TabsTrigger value="third_party" className="flex items-center gap-2 py-2.5"><CreditCard className="h-4 w-4" /> Buy Crypto (Card)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="wallet" className="space-y-6 animate-fade-in-up">
                          <div className="grid sm:grid-cols-5 gap-6">
                            <div className="sm:col-span-3 space-y-5">
                              <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                                <div className="flex justify-between items-center border-b pb-2">
                                  <span className="text-sm text-muted-foreground">Currency</span>
                                  <span className="font-bold">{selectedWallet!.currency}</span>
                                </div>
                                <div className="flex justify-between items-center border-b pb-2">
                                  <span className="text-sm text-muted-foreground">Network</span>
                                  <span className="font-bold">{selectedWallet!.network || "—"}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                  <span className="text-sm text-muted-foreground">Amount</span>
                                  <span className="font-bold text-primary text-lg">{cryptoAmount.toFixed(selectedWallet!.exchange_rate >= 100 ? 6 : 2)}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-sm font-medium">Destination Address</Label>
                                <div className="flex items-center gap-2">
                                  <code className="flex-1 text-xs sm:text-sm bg-muted p-3.5 rounded-lg break-all font-mono border shadow-inner">{selectedWallet!.address}</code>
                                  <Button variant="secondary" size="icon" className="shrink-0 h-12 w-12" onClick={() => copyAddress(selectedWallet!.address)}><Copy className="h-5 w-5" /></Button>
                                </div>
                              </div>
                            </div>

                            <div className="sm:col-span-2 flex flex-col items-center justify-center gap-3">
                              <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Scan to Pay</div>
                              <div className="border-2 rounded-xl p-3 bg-white shadow-sm inline-block">
                                <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                              </div>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="third_party" className="space-y-6 animate-fade-in-up">
                          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                            <div className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <p className="text-sm font-medium text-yellow-700 dark:text-yellow-500">You are purchasing crypto via a partner.</p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-400">Ensure you use the exact <strong>{selectedWallet!.currency}</strong> wallet address below as the destination for your purchase.</p>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2 relative z-10">
                            <Label className="text-sm font-medium">Destination Address (Copy This)</Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs sm:text-sm bg-muted p-3.5 rounded-lg break-all font-mono border shadow-inner">{selectedWallet!.address}</code>
                              <Button variant="secondary" size="icon" className="shrink-0 h-12 w-12" onClick={() => copyAddress(selectedWallet!.address)}><Copy className="h-5 w-5" /></Button>
                            </div>
                          </div>

                          {activeProviders.length > 0 ? (
                            <div className="space-y-6 mt-6 pt-6 border-t border-dashed">
                              <div className="space-y-4">
                                <Label className="text-sm font-medium">Select Provider & Purchase</Label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <Select
                                    value={selectedProviderId || activeProviders[0]?.id}
                                    onValueChange={(val) => setSelectedProviderId(val)}
                                  >
                                    <SelectTrigger className="w-full sm:w-[300px] h-12">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {activeProviders.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                          {p.provider_name} {p.priority === 1 && <span className="text-muted-foreground ml-1">(Recommended)</span>}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>

                                  {activeProvider && activeProvider.provider_url && (
                                    <Button
                                      size="lg"
                                      className="h-12 w-full sm:w-auto font-semibold shadow-md"
                                      onClick={handleBuyCrypto}
                                    >
                                      Buy Cryptocurrency <ExternalLink className="ml-2 h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Clicking the button above will securely open the provider in a new tab. After purchasing, return here to confirm your deposit.
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="p-8 text-center bg-muted/20 border border-dashed rounded-lg">
                              <p className="text-sm text-muted-foreground">Card purchases are currently unavailable.</p>
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    ) : (
                      <div className="grid sm:grid-cols-5 gap-6">
                        <div className="sm:col-span-3 space-y-5">
                          <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-sm text-muted-foreground">Currency</span>
                              <span className="font-bold">{selectedWallet!.currency}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                              <span className="text-sm text-muted-foreground">Network</span>
                              <span className="font-bold">{selectedWallet!.network || "—"}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                              <span className="text-sm text-muted-foreground">Amount</span>
                              <span className="font-bold text-primary text-lg">{cryptoAmount.toFixed(selectedWallet!.exchange_rate >= 100 ? 6 : 2)}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Destination Address</Label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-xs sm:text-sm bg-muted p-3.5 rounded-lg break-all font-mono border shadow-inner">{selectedWallet!.address}</code>
                              <Button variant="secondary" size="icon" className="shrink-0 h-12 w-12" onClick={() => copyAddress(selectedWallet!.address)}><Copy className="h-5 w-5" /></Button>
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-2 flex flex-col items-center justify-center gap-3">
                          <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Scan to Pay</div>
                          <div className="border-2 rounded-xl p-3 bg-white shadow-sm inline-block">
                            <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-muted/10 border-t space-y-5">
                    <div className="space-y-1">
                      <Label className="text-lg font-bold">Confirm Payment</Label>
                      <p className="text-sm text-muted-foreground">After sending your payment, enter your transaction details below to verify your deposit.</p>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                      <div className="space-y-2">
                        <Label className="font-medium text-sm">Transaction Hash (TxID) <span className="text-destructive">*</span></Label>
                        <Input
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="e.g. 0x1234abcd..."
                          className="h-12 bg-background font-mono shadow-inner"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium text-sm flex items-center justify-between">
                          <span>Payment Screenshot <span className="text-muted-foreground font-normal">(Optional)</span></span>
                        </Label>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 cursor-pointer">
                            <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors ${screenshotFile ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                              {screenshotFile ? (
                                <>
                                  <ImageIcon className="h-6 w-6 text-primary" />
                                  <span className="text-sm font-medium text-primary text-center truncate w-full px-2">{screenshotFile.name}</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setScreenshotFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          {screenshotFile && (
                            <Button variant="ghost" size="sm" onClick={() => setScreenshotFile(null)} className="shrink-0 text-destructive hover:text-destructive">Clear</Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium text-sm">Additional Notes <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Textarea
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          placeholder="Any details to help us identify your payment..."
                          className="bg-background resize-none h-20 shadow-inner"
                        />
                      </div>
                    </div>

                    <Button size="lg" className="w-full max-w-2xl font-semibold shadow-md" onClick={handleConfirm} disabled={!txHash.trim() || submitDeposit.isPending || isUploading}>
                      {(submitDeposit.isPending || isUploading) ? (
                        <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {isUploading ? 'Uploading...' : 'Verifying...'}</>
                      ) : (
                        <><CheckCircle2 className="h-5 w-5 mr-2" /> I Have Completed the Transfer</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <Card className="border-primary/20 shadow-md">
                <CardHeader className="pb-4 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Pending Deposit Activities</CardTitle>
                      <CardDescription>Verify and complete your unfinished cryptocurrency purchase</CardDescription>
                    </div>
                    <Badge className="bg-warning/10 text-warning border-0 capitalize">{activeIntent.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="overflow-x-auto rounded-lg border bg-muted/20">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Field</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-3 font-medium">Deposit ID</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{activeIntent.id}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Status</td>
                          <td className="px-4 py-3 font-semibold text-warning">{activeIntent.status}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Currency</td>
                          <td className="px-4 py-3 font-bold">{activeIntent.selected_currency}</td>
                        </tr>
                        {activeIntent.selected_network && (
                          <tr>
                            <td className="px-4 py-3 font-medium">Network</td>
                            <td className="px-4 py-3">{activeIntent.selected_network}</td>
                          </tr>
                        )}
                        <tr>
                          <td className="px-4 py-3 font-medium">Initiated</td>
                          <td className="px-4 py-3 text-muted-foreground">{new Date(activeIntent.initiated_timestamp).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 font-medium">Wallet Address</td>
                          <td className="px-4 py-3 flex items-center gap-2">
                            <code className="text-xs bg-background p-1.5 rounded font-mono border break-all flex-1">{activeIntent.wallet_address}</code>
                            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0" onClick={() => copyAddress(activeIntent.wallet_address)}><Copy className="h-3.5 w-3.5" /></Button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-8 space-y-6 pt-6 border-t border-dashed">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold">Step 3: Payment Confirmation</h3>
                      <p className="text-sm text-muted-foreground">Submit the transaction details below to verify and credit your deposit.</p>
                    </div>

                    <div className="space-y-4 max-w-2xl">
                      <div className="space-y-2">
                        <Label className="font-medium text-sm">Amount Sent (USD) <span className="text-destructive">*</span></Label>
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="pl-11 h-12 text-base font-medium bg-background"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium text-sm">Transaction Hash (TxID) <span className="text-destructive">*</span></Label>
                        <Input
                          value={txHash}
                          onChange={(e) => setTxHash(e.target.value)}
                          placeholder="e.g. 0x1234abcd..."
                          className="h-12 bg-background font-mono shadow-inner"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium text-sm flex items-center justify-between">
                          <span>Payment Screenshot <span className="text-muted-foreground font-normal">(Optional)</span></span>
                        </Label>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 cursor-pointer">
                            <div className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition-colors ${screenshotFile ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}>
                              {screenshotFile ? (
                                <>
                                  <ImageIcon className="h-6 w-6 text-primary" />
                                  <span className="text-sm font-medium text-primary text-center truncate w-full px-2">{screenshotFile.name}</span>
                                </>
                              ) : (
                                <>
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Click to upload screenshot</span>
                                </>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setScreenshotFile(e.target.files[0]);
                                }
                              }}
                            />
                          </label>
                          {screenshotFile && (
                            <Button variant="ghost" size="sm" onClick={() => setScreenshotFile(null)} className="shrink-0 text-destructive hover:text-destructive">Clear</Button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="font-medium text-sm">Additional Notes <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Textarea
                          value={userNotes}
                          onChange={(e) => setUserNotes(e.target.value)}
                          placeholder="Any details to help us identify your payment..."
                          className="bg-background resize-none h-20 shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 max-w-2xl pt-2">
                      <Button
                        size="lg"
                        className="flex-1 font-semibold shadow-md"
                        onClick={handleConfirmResumed}
                        disabled={!txHash.trim() || parseFloat(amount) <= 0 || submitConfirmation.isPending || isUploading}
                      >
                        {(submitConfirmation.isPending || isUploading) ? (
                          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> {isUploading ? 'Uploading...' : 'Submitting...'}</>
                        ) : (
                          <><CheckCircle2 className="h-5 w-5 mr-2" /> Submit Payment Details</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="sm:w-auto font-semibold text-destructive hover:text-destructive hover:bg-destructive/5"
                        onClick={() => setShowCancelDialog(true)}
                        disabled={submitConfirmation.isPending || isUploading}
                      >
                        Cancel Process
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Card className="sticky top-6">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base flex items-center justify-between">
                Recent Deposits
                <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[500px] overflow-y-auto">
                {loadingHistory ? (
                  Array(4).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex justify-between items-center">
                      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-3 w-24" /></div>
                      <Skeleton className="h-5 w-20 rounded-full" />
                    </div>
                  ))
                ) : history.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                    <Clock className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm">No recent deposits</p>
                  </div>
                ) : (
                  history.slice(0, 8).map((h: any) => {
                    const config = statusConfig[h.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    const currency = h.wallets?.currency || h.currency;

                    return (
                      <div key={h.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-bold text-sm">${Number(h.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {currency} · {new Date(h.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-background border shadow-sm ${config.className}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span className="capitalize">{h.status}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Cancel Deposit Process?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this pending deposit process? This action cannot be undone and will cancel your session.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" onClick={() => setShowCancelDialog(false)} disabled={cancelDepositIntent.isPending}>
              Keep Active
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (activeIntent) {
                  await cancelDepositIntent.mutateAsync(activeIntent.id);
                  setShowCancelDialog(false);
                  setStep(1);
                }
              }}
              disabled={cancelDepositIntent.isPending}
            >
              {cancelDepositIntent.isPending ? "Cancelling..." : "Cancel Deposit"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Force reload
