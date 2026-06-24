import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  useCmsFaqs, useCmsAnnouncements,
  useUpdateCmsFaq, useDeleteCmsFaq,
  useUpdateCmsAnnouncement, useDeleteCmsAnnouncement,
  type CmsFaq, type CmsAnnouncement,
} from "@/hooks/useCmsData";
import { Loader2, Plus, Pencil, Trash2, ArrowLeft, Save, MessageCircle, Megaphone, HelpCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// ==============================
// FAQ Editor Sub-component
// ==============================
function FaqEditor({
  initial,
  onClose,
}: {
  initial: Partial<CmsFaq> | null;
  onClose: () => void;
}) {
  const updateFaq = useUpdateCmsFaq();
  const [form, setForm] = useState<Partial<CmsFaq>>(
    initial || {
      question: "",
      answer: "",
      category: "general",
      sort_order: 0,
      is_published: true,
    }
  );

  const handleSave = async () => {
    if (!form.question || !form.answer) return;
    await updateFaq.mutateAsync(form);
    onClose();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h2 className="text-xl font-bold font-heading">{form.id ? "Edit FAQ" : "New FAQ"}</h2>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Question</Label>
            <Input
              value={form.question || ""}
              onChange={(e) => setForm(prev => ({ ...prev, question: e.target.value }))}
              placeholder="e.g. How do I deposit funds?"
            />
          </div>
          <div className="space-y-2">
            <Label>Answer</Label>
            <Textarea
              value={form.answer || ""}
              onChange={(e) => setForm(prev => ({ ...prev, answer: e.target.value }))}
              rows={5}
              placeholder="Provide a clear, helpful answer..."
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.category || "general"}
                onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="investments">Investments</SelectItem>
                  <SelectItem value="trading">Copy Trading</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={form.sort_order ?? 0}
                onChange={(e) => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Published</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={form.is_published ?? true}
                  onCheckedChange={(v) => setForm(prev => ({ ...prev, is_published: v }))}
                />
                <span className="text-sm text-muted-foreground">{form.is_published ? "Visible" : "Hidden"}</span>
              </div>
            </div>
          </div>
          <Button onClick={handleSave} disabled={updateFaq.isPending || !form.question || !form.answer}>
            {updateFaq.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {form.id ? "Update FAQ" : "Create FAQ"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ==============================
// Announcement Editor Sub-component
// ==============================
function AnnouncementEditor({
  initial,
  onClose,
}: {
  initial: Partial<CmsAnnouncement> | null;
  onClose: () => void;
}) {
  const updateAnnouncement = useUpdateCmsAnnouncement();
  const [form, setForm] = useState<Partial<CmsAnnouncement>>(
    initial || {
      title: "",
      content: "",
      type: "info",
      is_active: true,
    }
  );

  const handleSave = async () => {
    if (!form.title || !form.content) return;
    await updateAnnouncement.mutateAsync(form);
    onClose();
  };

  const typeColors: Record<string, string> = {
    info: "bg-blue-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    danger: "bg-red-600",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h2 className="text-xl font-bold font-heading">{form.id ? "Edit Announcement" : "New Announcement"}</h2>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label>Title (Bold text)</Label>
            <Input
              value={form.title || ""}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Maintenance Notice"
            />
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              value={form.content || ""}
              onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
              rows={3}
              placeholder="The announcement message shown to all users..."
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={form.type || "info"}
                onValueChange={(v: any) => setForm(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info (Blue)</SelectItem>
                  <SelectItem value="success">Success (Green)</SelectItem>
                  <SelectItem value="warning">Warning (Yellow)</SelectItem>
                  <SelectItem value="danger">Danger (Red)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Active</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={form.is_active ?? true}
                  onCheckedChange={(v) => setForm(prev => ({ ...prev, is_active: v }))}
                />
                <span className="text-sm text-muted-foreground">{form.is_active ? "Showing to users" : "Hidden"}</span>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Preview</Label>
            <div className={`w-full py-2.5 px-4 flex items-center justify-center rounded-lg text-white ${typeColors[form.type || "info"]}`}>
              <div className="flex items-center gap-2 text-center text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>
                  <span className="font-bold mr-2">{form.title || "Title"}</span>
                  {form.content || "Message text"}
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleSave} disabled={updateAnnouncement.isPending || !form.title || !form.content}>
            {updateAnnouncement.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {form.id ? "Update Announcement" : "Create Announcement"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ==============================
// Main Page Component
// ==============================
export default function AdminFAQs() {
  const { data: faqs = [], isLoading: loadingFaqs } = useCmsFaqs(true);
  const { data: announcements = [], isLoading: loadingAnnouncements } = useCmsAnnouncements(true);

  const deleteFaq = useDeleteCmsFaq();
  const deleteAnnouncement = useDeleteCmsAnnouncement();

  const [editingFaq, setEditingFaq] = useState<Partial<CmsFaq> | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<CmsAnnouncement> | null>(null);
  const [showFaqEditor, setShowFaqEditor] = useState(false);
  const [showAnnouncementEditor, setShowAnnouncementEditor] = useState(false);

  if (loadingFaqs || loadingAnnouncements) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  // FAQ Editor
  if (showFaqEditor) {
    return (
      <FaqEditor
        initial={editingFaq}
        onClose={() => { setShowFaqEditor(false); setEditingFaq(null); }}
      />
    );
  }

  // Announcement Editor
  if (showAnnouncementEditor) {
    return (
      <AnnouncementEditor
        initial={editingAnnouncement}
        onClose={() => { setShowAnnouncementEditor(false); setEditingAnnouncement(null); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Communications</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage Frequently Asked Questions and Global Announcements.</p>
        </div>
      </div>

      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="faqs" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> FAQs ({faqs.length})</TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2"><Megaphone className="h-4 w-4" /> Announcements ({announcements.length})</TabsTrigger>
        </TabsList>

        {/* =================== FAQs =================== */}
        <TabsContent value="faqs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /> FAQ Manager</CardTitle>
                <CardDescription>Questions and answers displayed on the public FAQ page.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingFaq(null); setShowFaqEditor(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Add FAQ
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {faqs.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  <HelpCircle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No FAQs yet</p>
                  <p className="text-sm mt-1">The public FAQ page is currently showing default hardcoded questions.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                      <div className="min-w-0 pr-4">
                        <div className="font-medium flex items-center gap-2 flex-wrap">
                          <span className="truncate">{faq.question}</span>
                          <Badge variant={faq.is_published ? "default" : "secondary"} className="text-[10px] flex-shrink-0">
                            {faq.is_published ? "published" : "draft"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] flex-shrink-0 capitalize">
                            {faq.category || "general"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">{faq.answer}</div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          title="Edit"
                          onClick={() => { setEditingFaq({ ...faq }); setShowFaqEditor(true); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          title="Delete"
                          onClick={() => {
                            if (window.confirm("Delete this FAQ?")) deleteFaq.mutate(faq.id);
                          }}
                          disabled={deleteFaq.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* =================== Announcements =================== */}
        <TabsContent value="announcements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Global Announcements</CardTitle>
                <CardDescription>Banners displayed to users at the top of every page.</CardDescription>
              </div>
              <Button size="sm" onClick={() => { setEditingAnnouncement(null); setShowAnnouncementEditor(true); }}>
                <Plus className="h-4 w-4 mr-1" /> Create Announcement
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {announcements.length === 0 ? (
                <div className="text-center p-12 text-muted-foreground">
                  <Megaphone className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="font-medium">No announcements</p>
                  <p className="text-sm mt-1">Create one to display a banner across the entire platform.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {announcements.map((ann) => {
                    const typeColors: Record<string, string> = {
                      info: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
                      success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
                      warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
                      danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
                    };
                    return (
                      <div key={ann.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                        <div className="min-w-0 pr-4">
                          <div className="font-medium flex items-center gap-2 flex-wrap">
                            <span>{ann.title}</span>
                            <Badge variant={ann.is_active ? "default" : "secondary"} className="text-[10px] flex-shrink-0">
                              {ann.is_active ? "active" : "inactive"}
                            </Badge>
                            <Badge className={`text-[10px] flex-shrink-0 border-0 ${typeColors[ann.type] || ""}`}>
                              {ann.type}
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 truncate">{ann.content}</div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            title="Edit"
                            onClick={() => { setEditingAnnouncement({ ...ann }); setShowAnnouncementEditor(true); }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            title="Delete"
                            onClick={() => {
                              if (window.confirm("Delete this announcement?")) deleteAnnouncement.mutate(ann.id);
                            }}
                            disabled={deleteAnnouncement.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
