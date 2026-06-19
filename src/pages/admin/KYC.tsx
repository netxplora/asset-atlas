import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle2, XCircle, Clock, FileText, User, Mail, Calendar, Wallet, Shield, ExternalLink, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";
import { useAdminUsers, useAdminUpdateKYC } from "@/hooks/useSupabaseData";

export default function AdminKYC() {
  const { data: users = [], isLoading } = useAdminUsers();
  const updateKYC = useAdminUpdateKYC();
  const [selected, setSelected] = useState<any | null>(null);
  const [notes, setNotes] = useState("");

  const handleAction = (userId: string, status: "verified" | "rejected") => {
    updateKYC.mutate({ user_id: userId, kyc_status: status }, {
      onSuccess: () => {
        setSelected(null);
        setNotes("");
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified": return <Badge className="bg-success text-success-foreground">Verified</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      case "pending": return <Badge variant="outline" className="border-warning text-warning">Pending</Badge>;
      default: return <Badge variant="outline">Unverified</Badge>;
    }
  };

  // Filter users who have submitted KYC (pending, verified, or rejected — not unverified)
  const kycUsers = users.filter((u: any) => u.kyc_status !== "unverified");

  const isDocImage = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">KYC Management</h1>
        <div className="flex gap-3 text-sm">
          <div className="flex items-center gap-1"><Clock className="h-4 w-4 text-warning" /> Pending: {kycUsers.filter((k: any) => k.kyc_status === "pending").length}</div>
          <div className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4 text-success" /> Verified: {kycUsers.filter((k: any) => k.kyc_status === "verified").length}</div>
        </div>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="verified">Verified</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        {["pending", "verified", "rejected", "all"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left font-medium">User</th><th className="p-3 text-left font-medium">Email</th><th className="p-3 text-left font-medium">Document</th><th className="p-3 text-left font-medium">Status</th><th className="p-3 text-left font-medium">Date</th><th className="p-3 text-left font-medium">Actions</th></tr></thead>
                    <tbody className="divide-y">
                      {isLoading ? (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading KYC submissions...</td></tr>
                      ) : kycUsers.filter((k: any) => tab === "all" || k.kyc_status === tab).length === 0 ? (
                        <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No submissions found.</td></tr>
                      ) : kycUsers.filter((k: any) => tab === "all" || k.kyc_status === tab).map((k: any) => (
                        <tr key={k.user_id}>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted border overflow-hidden flex items-center justify-center flex-shrink-0">
                                {k.avatar_url ? (
                                  <img src={k.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <User className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className="font-medium">{k.first_name} {k.last_name}</div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">{k.email}</td>
                          <td className="p-3">
                            {k.kyc_document_url ? (
                              <a href={k.kyc_document_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-xs flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5" /> View Document
                              </a>
                            ) : (
                              <span className="text-xs text-muted-foreground">No document</span>
                            )}
                          </td>
                          <td className="p-3">{getStatusBadge(k.kyc_status)}</td>
                          <td className="p-3">{new Date(k.updated_at).toLocaleDateString()}</td>
                          <td className="p-3">
                            <div className="flex gap-1">
                              <Button size="sm" variant="ghost" onClick={() => { setSelected(k); setNotes(""); }}><Eye className="h-3.5 w-3.5 mr-1" /> Review</Button>
                              {k.kyc_status === "pending" && (
                                <>
                                  <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleAction(k.user_id, "verified")} disabled={updateKYC.isPending}>Approve</Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleAction(k.user_id, "rejected")} disabled={updateKYC.isPending}>Reject</Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Detailed Review Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh]">
          <DialogHeader><DialogTitle>KYC Review</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4 overflow-y-auto max-h-[65vh] pr-2">
              {/* User Profile Section */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                <div className="h-14 w-14 rounded-full bg-muted border-2 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {selected.avatar_url ? (
                    <img src={selected.avatar_url} alt="User profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-7 w-7 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold">{selected.first_name || "—"} {selected.last_name || "—"}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3.5 w-3.5" /> {selected.email || "No email"}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    {getStatusBadge(selected.kyc_status)}
                  </div>
                </div>
              </div>

              {/* User Details Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <Wallet className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Account Balance</div>
                    <div className="font-semibold">${Number(selected.balance || 0).toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Joined</div>
                    <div className="font-semibold">{new Date(selected.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <Shield className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">User ID</div>
                    <div className="font-mono text-xs truncate max-w-[180px]">{selected.user_id}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg border">
                  <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                  <div>
                    <div className="text-xs text-muted-foreground">Last Updated</div>
                    <div className="font-semibold">{new Date(selected.updated_at).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>

              {/* ID Verification Details */}
              {(selected.kyc_id_type || selected.kyc_id_number) && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-3 rounded-lg border">
                    <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">ID Type</div>
                      <div className="font-semibold capitalize">{selected.kyc_id_type?.replace('_', ' ') || '—'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg border">
                    <CreditCard className="h-4 w-4 text-primary flex-shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">ID Number</div>
                      <div className="font-semibold font-mono text-sm">{selected.kyc_id_number || '—'}</div>
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* KYC Document Section */}
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> KYC Document</h4>
                {selected.kyc_document_url ? (
                  <div className="space-y-3">
                    {isDocImage(selected.kyc_document_url) ? (
                      <div className="border rounded-lg overflow-hidden bg-muted/30">
                        <img
                          src={selected.kyc_document_url}
                          alt="KYC Document"
                          className="w-full max-h-[250px] object-contain"
                        />
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted/50 border flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Document uploaded (PDF)</p>
                          <p className="text-xs text-muted-foreground">Click below to view the full document</p>
                        </div>
                      </div>
                    )}
                    <a
                      href={selected.kyc_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> Open Document in New Tab
                    </a>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-muted/30 border border-dashed text-center">
                    <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No document was uploaded by this user.</p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Admin Notes */}
              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add review notes (optional)..." rows={3} />
              </div>

              {/* Action Buttons */}
              {selected.kyc_status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => handleAction(selected.user_id, "verified")}
                    disabled={updateKYC.isPending}
                  >
                    {updateKYC.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-1" />}
                    Approve KYC
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleAction(selected.user_id, "rejected")}
                    disabled={updateKYC.isPending}
                  >
                    {updateKYC.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <XCircle className="h-4 w-4 mr-1" />}
                    Reject KYC
                  </Button>
                </div>
              )}
              {selected.kyc_status !== "pending" && (
                <div className="text-sm text-center text-muted-foreground py-2">
                  This submission has already been {selected.kyc_status}. No action required.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
