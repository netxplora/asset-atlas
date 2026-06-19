import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Upload, CheckCircle2, Clock, XCircle, User, Loader2, FileCheck, Lock, Smartphone, ShieldAlert, Check, Image as ImageIcon, Activity, History, Server, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useUpdateProfile, useSubmitKYC } from "@/hooks/useSupabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const submitKYC = useSubmitKYC();

  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [kycForm, setKycForm] = useState({ idType: "", idNumber: "", level: "Basic" });
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate({
      first_name: formData.first_name,
      last_name: formData.last_name,
      avatar_url: formData.avatar_url,
    });
  };

  const handleUpdatePassword = async () => {
    if (!formData.email) return;
    toast({ title: "Password Reset Requested", description: "A password reset link will be sent to your email shortly." });
    await supabase.auth.resetPasswordForEmail(formData.email);
  };

  const handleKycSubmit = async () => {
    if (!kycForm.idType || !kycForm.idNumber) {
      toast({ title: "Missing Information", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    if (!kycFile) {
      toast({ title: "No Document", description: "Please upload your identity document.", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = kycFile.name.split('.').pop();
      const fileName = `${user?.id}/${kycForm.idType}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('kyc-documents')
        .upload(fileName, kycFile, { upsert: true });

      if (uploadError) throw uploadError;

      const publicUrl = supabase.storage.from('kyc-documents').getPublicUrl(fileName).data.publicUrl;

      submitKYC.mutate({ kyc_document_url: publicUrl, kyc_id_type: kycForm.idType, kyc_id_number: kycForm.idNumber }, {
        onSuccess: () => {
          setKycDialogOpen(false);
          setKycFile(null);
          setKycForm({ idType: "", idNumber: "", level: "Basic" });
        },
      });
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message || "Could not upload document.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const kycStatus = profile?.kyc_status || "unverified";

  const kycStatusConfig: Record<string, any> = {
    unverified: { icon: ShieldAlert, color: "text-muted-foreground", badge: <Badge variant="outline" className="uppercase tracking-wider text-[10px]">Unverified</Badge>, bg: "bg-muted" },
    pending: { icon: Clock, color: "text-warning", badge: <Badge variant="outline" className="border-warning text-warning uppercase tracking-wider text-[10px]">Pending Review</Badge>, bg: "bg-warning/10" },
    verified: { icon: CheckCircle2, color: "text-success", badge: <Badge className="bg-success text-success-foreground uppercase tracking-wider text-[10px]">Verified</Badge>, bg: "bg-success/10" },
    rejected: { icon: XCircle, color: "text-destructive", badge: <Badge variant="destructive" className="uppercase tracking-wider text-[10px]">Rejected</Badge>, bg: "bg-destructive/10" },
  };

  const StatusIcon = kycStatusConfig[kycStatus]?.icon || Shield;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading">Account Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your personal information, security preferences, and verification status.</p>
      </div>

      {/* KYC Status Banner */}
      {kycStatus !== "verified" && !isLoading && (
        <Alert variant={kycStatus === "rejected" ? "destructive" : "default"} className={`border animate-fade-in-up ${kycStatus === 'pending' ? 'bg-warning/10 border-warning/20 text-warning-foreground' : ''}`}>
          <StatusIcon className={`h-5 w-5 ${kycStatus === 'pending' ? 'text-warning' : ''}`} />
          <AlertTitle className="font-semibold flex items-center gap-2">
            Identity Verification 
            {kycStatusConfig[kycStatus]?.badge}
          </AlertTitle>
          <AlertDescription className="mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-sm">
              {kycStatus === "unverified" && "You must complete identity verification (KYC) before you can withdraw funds or access advanced features."}
              {kycStatus === "pending" && "Your documents are currently being reviewed by our compliance team. This process typically takes 24-48 hours."}
              {kycStatus === "rejected" && "Your previous verification attempt was rejected. Please review the requirements and submit valid, clear documents."}
            </span>
            {(kycStatus === "unverified" || kycStatus === "rejected") && (
              <Button size="sm" onClick={() => setKycDialogOpen(true)} disabled={submitKYC.isPending} className="shrink-0">
                {kycStatus === "rejected" ? "Resubmit Documents" : "Start Verification"}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="general" className="flex items-center gap-2"><User className="h-4 w-4" /> General</TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2"><Lock className="h-4 w-4" /> Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 animate-fade-in-up">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg">Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                {isLoading ? (
                  <Skeleton className="h-24 w-24 rounded-full shrink-0" />
                ) : (
                  <div className="relative group">
                    <div className="h-24 w-24 shrink-0 rounded-full bg-muted border-4 border-background shadow-md overflow-hidden flex items-center justify-center relative z-10">
                      {formData.avatar_url ? (
                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-10 w-10 text-muted-foreground" />
                      )}
                    </div>
                    <label className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <ImageIcon className="h-6 w-6 mb-1" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Change</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          toast({ title: "Uploading...", description: "Please wait while we upload your picture." });
                          const fileExt = file.name.split('.').pop();
                          const fileName = `user-${profile?.id}-${Math.random()}.${fileExt}`;
                          const { data, error } = await supabase.storage.from('avatars').upload(fileName, file, { upsert: true });
                          if (error) {
                            toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
                          } else if (data) {
                            const url = supabase.storage.from('avatars').getPublicUrl(fileName).data.publicUrl;
                            setFormData({ ...formData, avatar_url: url });
                            updateProfile.mutate({ avatar_url: url });
                            toast({ title: "Avatar Updated", description: "Your profile picture has been updated." });
                          }
                        }} 
                      />
                    </label>
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{isLoading ? <Skeleton className="h-6 w-48 mb-2" /> : `${formData.first_name} ${formData.last_name}`}</h3>
                  {isLoading ? <Skeleton className="h-4 w-64" /> : <p className="text-sm text-muted-foreground">{formData.email}</p>}
                  <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border/50">
                <div className="space-y-3">
                  <Label>First Name</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : (
                    <Input placeholder="John" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="h-12 bg-muted/50" />
                  )}
                </div>
                <div className="space-y-3">
                  <Label>Last Name</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : (
                    <Input placeholder="Doe" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="h-12 bg-muted/50" />
                  )}
                </div>
                <div className="space-y-3 sm:col-span-2">
                  <Label>Email Address</Label>
                  {isLoading ? <Skeleton className="h-10 w-full" /> : (
                    <Input value={formData.email} disabled className="h-12 bg-muted opacity-70 cursor-not-allowed" />
                  )}
                  <p className="text-xs text-muted-foreground">Email addresses cannot be changed once registered for security reasons.</p>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button size="lg" onClick={handleSaveProfile} disabled={updateProfile.isPending || isLoading} className="w-full sm:w-auto font-semibold">
                  {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6 animate-fade-in-up">
          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Lock className="h-5 w-5 text-primary" /> Password & Authentication</CardTitle>
              <CardDescription>Manage your security preferences and 2FA settings.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/20">
                <div>
                  <h4 className="font-semibold text-sm">Account Password</h4>
                  <p className="text-sm text-muted-foreground mt-1">We will send a secure password reset link to <strong>{formData.email}</strong>.</p>
                </div>
                <Button variant="outline" onClick={handleUpdatePassword} className="shrink-0 shadow-sm">
                  Send Reset Link
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/20">
                <div className="flex items-start gap-3">
                  <div className="mt-1 bg-primary/10 p-2 rounded-full">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-muted-foreground mt-1 max-w-md">Add an extra layer of security to your account. We recommend using an authenticator app like Google Authenticator.</p>
                  </div>
                </div>
                <Button onClick={() => toast({ title: "Coming Soon", description: "2FA setup is currently being upgraded." })} className="shrink-0 shadow-sm">
                  Set Up 2FA
                </Button>
              </div>

            </CardContent>
          </Card>

          {/* Account Health & Sessions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Account Health</CardTitle>
                <CardDescription>Overall security status of your account.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Security Score</span>
                  <span className={`font-bold ${kycStatus === 'verified' ? 'text-success' : 'text-warning'}`}>
                    {kycStatus === 'verified' ? '95%' : '65%'}
                  </span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${kycStatus === 'verified' ? 'bg-success' : 'bg-warning'}`} style={{ width: kycStatus === 'verified' ? '95%' : '65%' }} />
                </div>
                
                <div className="pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-success" /> Email Verified</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20">Good</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      {kycStatus === 'verified' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <ShieldAlert className="h-4 w-4 text-warning" />} 
                      Identity Verification
                    </span>
                    <Badge variant="outline" className={kycStatus === 'verified' ? "bg-success/10 text-success border-success/20" : "bg-warning/10 text-warning border-warning/20"}>
                      {kycStatus === 'verified' ? 'Good' : 'Required'}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground"><ShieldAlert className="h-4 w-4 text-warning" /> Two-Factor Auth</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Action Needed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2"><Server className="h-5 w-5 text-primary" /> Active Sessions</CardTitle>
                <CardDescription>Devices recently logged into your account.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Smartphone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">Chrome on Windows <Badge className="ml-2 text-[9px] uppercase h-4 px-1">Current</Badge></div>
                        <div className="text-xs text-muted-foreground mt-0.5">IP: 192.168.1.105 · New York, USA</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors opacity-75">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">Safari on iPhone 13</div>
                        <div className="text-xs text-muted-foreground mt-0.5">IP: 104.28.10.15 · New York, USA</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">2 days ago</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 border ${kycStatusConfig[kycStatus]?.bg}`}>
                    <StatusIcon className={`h-6 w-6 ${kycStatusConfig[kycStatus]?.color}`} />
                  </div>
                  <div>
                    <div className="font-semibold">KYC Level 1</div>
                    <div className="text-sm text-muted-foreground mt-0.5">Required for all withdrawals</div>
                  </div>
                </div>
                {isLoading ? <Skeleton className="h-6 w-20 rounded-full" /> : kycStatusConfig[kycStatus]?.badge}
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Account Registration
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                  <CheckCircle2 className="h-4 w-4 text-success" /> Email Verification
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-3">
                  {kycStatus === 'verified' ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )} 
                  Identity Verification
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* KYC Submission Dialog */}
      <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading">Complete Identity Verification</DialogTitle>
            <DialogDescription>
              Submit your government-issued ID to verify your account and unlock all features.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-2">
            
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-2">
              <h4 className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Secure & Encrypted</h4>
              <p className="text-xs text-muted-foreground">Your data is securely encrypted and stored in compliance with global privacy regulations. We use this solely to verify your identity.</p>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Document Type</Label>
              <Select value={kycForm.idType} onValueChange={v => setKycForm(f => ({ ...f, idType: v }))}>
                <SelectTrigger className="h-12"><SelectValue placeholder="Select ID type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                  <SelectItem value="national_id">National ID Card</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Document Number</Label>
              <Input 
                value={kycForm.idNumber} 
                onChange={e => setKycForm(f => ({ ...f, idNumber: e.target.value }))} 
                placeholder="Enter the ID number" 
                className="h-12 bg-muted/50"
              />
            </div>

            <div className="space-y-3 pt-2">
              <Label className="text-sm font-medium flex justify-between">
                Upload Document 
                <span className="text-xs text-muted-foreground font-normal">Max 5MB</span>
              </Label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast({ title: "File Too Large", description: "Maximum file size is 5MB.", variant: "destructive" });
                      return;
                    }
                    setKycFile(file);
                  }
                }}
              />
              {kycFile ? (
                <div className="border border-success/30 rounded-lg p-4 flex items-center justify-between gap-3 bg-success/5 animate-in fade-in">
                  <div className="flex items-center gap-3 min-w-0">
                    <FileCheck className="h-8 w-8 text-success flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate pr-4">{kycFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(kycFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0" onClick={() => { setKycFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}>
                    Remove
                  </Button>
                </div>
              ) : (
                <div
                  className="border-2 border-dashed border-primary/20 bg-muted/20 hover:bg-muted/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-12 w-12 bg-background rounded-full border shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm font-medium mb-1">Click to browse or drag and drop</p>
                  <p className="text-xs text-muted-foreground">Please upload a clear, uncropped image. PDF, JPG, or PNG.</p>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <Button
                size="lg"
                className="w-full font-semibold text-base"
                onClick={handleKycSubmit}
                disabled={submitKYC.isPending || uploading || !kycFile || !kycForm.idType || !kycForm.idNumber}
              >
                {(submitKYC.isPending || uploading) ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> {uploading ? "Uploading Securely..." : "Submitting..."}</>
                ) : (
                  "Submit Verification"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
