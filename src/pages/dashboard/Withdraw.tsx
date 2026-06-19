import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, CheckCircle2, Clock, XCircle, ArrowUpRight, ShieldCheck, AlertCircle, Banknote, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useUserWithdrawals, useSubmitWithdrawal } from "@/hooks/useSupabaseData";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusConfig: Record<string, { icon: any; className: string }> = {
  pending: { icon: Clock, className: "text-warning bg-warning/10" },
  approved: { icon: CheckCircle2, className: "text-success bg-success/10" },
  rejected: { icon: XCircle, className: "text-destructive bg-destructive/10" },
};

export default function Withdraw() {
  const { toast } = useToast();
  const { profile, loading: profileLoading } = useAuth();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: history = [], isLoading: loadingHistory } = useUserWithdrawals();
  const submitWithdrawal = useSubmitWithdrawal();

  const kycVerified = profile?.is_kyc_verified;
  const balance = profile?.balance ?? 0;

  const handleWithdrawClick = () => {
    if (!amount || !method || !walletAddress) {
      toast({ title: "Missing Information", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    if (parseFloat(amount) > balance) {
      toast({ title: "Insufficient Balance", description: "You don't have enough funds.", variant: "destructive" });
      return;
    }
    if (!kycVerified) {
      toast({ title: "KYC Required", description: "Please complete KYC verification first.", variant: "destructive" });
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmWithdraw = () => {
    const methodLabels: Record<string, string> = { btc: "Bitcoin", eth: "Ethereum", usdt: "USDT", bank: "Bank Transfer" };
    
    submitWithdrawal.mutate({
      amount: parseFloat(amount),
      currency: methodLabels[method] || method,
      wallet_address: walletAddress,
    }, {
      onSuccess: () => {
        setAmount("");
        setMethod("");
        setWalletAddress("");
        setShowConfirm(false);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading">Withdraw Funds</h1>
        <p className="text-muted-foreground text-sm mt-1">Transfer your available balance to your external wallet or bank.</p>
      </div>

      {!profileLoading && !kycVerified && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-up">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <ShieldAlert className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <h3 className="font-semibold text-destructive">Identity Verification Required</h3>
              <p className="text-sm text-destructive/80 mt-1 max-w-2xl">
                To comply with anti-money laundering regulations and ensure the security of your funds, you must verify your identity before making a withdrawal.
              </p>
            </div>
          </div>
          <Button variant="destructive" className="shrink-0 w-full sm:w-auto" asChild>
            <Link to="/dashboard/profile">Verify Identity Now</Link>
          </Button>
        </div>
      )}

      {profileLoading && (
        <Skeleton className="h-24 w-full rounded-xl" />
      )}

      <div className="grid lg:grid-cols-5 gap-6 xl:gap-8">
        <div className="lg:col-span-3 space-y-6">
          <Card className={`animate-fade-in-up transition-opacity ${!kycVerified && !profileLoading ? 'opacity-60 pointer-events-none grayscale-[0.2]' : ''}`} style={{ animationDelay: "100ms" }}>
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" /> New Withdrawal
              </CardTitle>
              <CardDescription>Request a payout to your preferred destination</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Available Balance</div>
                  <div className="text-2xl font-bold font-heading">${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                  <ArrowUpRight className="h-6 w-6 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Amount to Withdraw (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    className="pl-8 h-12 text-lg font-medium shadow-inner"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-9 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10"
                    onClick={() => setAmount(balance.toString())}
                  >
                    MAX
                  </Button>
                </div>
                {amount && parseFloat(amount) > balance && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> Amount exceeds available balance
                  </p>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Withdrawal Method</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="h-12"><SelectValue placeholder="Select destination" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="eth">Ethereum (ETH)</SelectItem>
                    <SelectItem value="usdt">Tether (USDT TRC-20)</SelectItem>
                    <SelectItem value="bank">Bank Transfer (Wire/ACH)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {method && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                  <Label className="text-sm font-medium flex justify-between">
                    {method === 'bank' ? 'Bank Account Details' : 'Destination Wallet Address'}
                  </Label>
                  {method === 'bank' ? (
                    <textarea 
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Include Account Name, Account Number, Routing Number/SWIFT, and Bank Name..."
                      value={walletAddress}
                      onChange={e => setWalletAddress(e.target.value)}
                    />
                  ) : (
                    <Input 
                      placeholder={`Enter your ${method.toUpperCase()} address`} 
                      value={walletAddress} 
                      onChange={e => setWalletAddress(e.target.value)} 
                      className="h-12 font-mono text-sm shadow-inner"
                    />
                  )}
                  <p className="text-xs text-muted-foreground">
                    Please double check your details. Transactions cannot be reversed once processed.
                  </p>
                </div>
              )}

              <Button 
                size="lg" 
                className="w-full font-semibold mt-4" 
                onClick={handleWithdrawClick} 
                disabled={!kycVerified || !amount || !method || !walletAddress || parseFloat(amount) > balance}
              >
                Submit Withdrawal Request
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <Card className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base">Important Information</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Clock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Withdrawals are manually reviewed and typically processed within <strong>24-48 business hours</strong>.</p>
              </div>
              <div className="flex gap-3">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>For security, large withdrawals may require additional verification via email or phone.</p>
              </div>
              <div className="flex gap-3">
                <Banknote className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p>Ensure your receiving wallet supports the network you selected. We are not responsible for funds sent to incorrect addresses.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-base">Recent Withdrawals</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y max-h-[400px] overflow-y-auto">
                {loadingHistory ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex justify-between items-center">
                      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-3 w-24" /></div>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  ))
                ) : history.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
                    <Banknote className="h-8 w-8 text-muted-foreground/50 mb-2" />
                    <p className="text-sm">No withdrawal history</p>
                  </div>
                ) : (
                  history.slice(0, 5).map((h: any) => {
                    const config = statusConfig[h.status] || statusConfig.pending;
                    const StatusIcon = config.icon;
                    return (
                      <div key={h.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-bold text-sm">${Number(h.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{h.currency} · {new Date(h.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.className}`}>
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

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-heading">Confirm Withdrawal Request</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-foreground mt-4 space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg border space-y-3">
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground text-sm">Amount</span>
                  <span className="font-bold">${parseFloat(amount || "0").toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center border-b border-border/50 pb-2">
                  <span className="text-muted-foreground text-sm">Destination</span>
                  <span className="font-semibold text-sm capitalize">{method === 'bank' ? 'Bank Transfer' : method.toUpperCase()}</span>
                </div>
                <div className="pt-1">
                  <span className="text-muted-foreground text-sm block mb-1">Details</span>
                  <span className="font-mono text-xs break-all bg-background px-2 py-1 rounded border block">
                    {walletAddress}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This withdrawal request will be submitted for administrative review. Once processed, funds will be sent to the destination provided.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmWithdraw} disabled={submitWithdrawal.isPending} className="font-semibold">
              {submitWithdrawal.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : "Confirm Request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
