import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCmsPageBySlugAdmin, useUpdateCmsPage } from "@/hooks/useCmsData";
import { Loader2, FileText, Save, ArrowLeft, Scale, Shield, AlertTriangle } from "lucide-react";

const LEGAL_PAGES = [
  { slug: "privacy-policy", title: "Privacy Policy", icon: Shield, description: "Data collection, usage, and user rights." },
  { slug: "terms-of-service", title: "Terms of Service", icon: Scale, description: "User agreements, liabilities, and platform rules." },
  { slug: "risk-disclosure", title: "Risk Disclosure", icon: AlertTriangle, description: "Investment risk warnings and disclaimers." },
];

export default function AdminLegalDocs() {
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const activeMeta = LEGAL_PAGES.find(p => p.slug === activeDoc);
  
  const { data: pageData, isLoading } = useCmsPageBySlugAdmin(activeDoc || "");
  const updatePage = useUpdateCmsPage();

  const [form, setForm] = useState({
    title: "",
    content: "",
    status: "published" as "draft" | "published" | "scheduled",
    meta_title: "",
    meta_description: "",
  });

  useEffect(() => {
    if (pageData) {
      setForm({
        title: pageData.title || "",
        content: pageData.content || "",
        status: pageData.status || "published",
        meta_title: pageData.meta_title || "",
        meta_description: pageData.meta_description || "",
      });
    } else if (activeDoc && !isLoading) {
      // Pre-fill with defaults if the page doesn't exist yet
      const meta = LEGAL_PAGES.find(p => p.slug === activeDoc);
      setForm({
        title: meta?.title || "",
        content: "",
        status: "published",
        meta_title: meta?.title || "",
        meta_description: meta?.description || "",
      });
    }
  }, [pageData, activeDoc, isLoading]);

  const handleSave = async () => {
    if (!activeDoc) return;
    
    const payload: any = {
      title: form.title,
      slug: activeDoc,
      content: form.content,
      status: form.status,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
    };
    
    if (pageData?.id) {
      payload.id = pageData.id;
    }
    
    await updatePage.mutateAsync(payload);
  };

  // Document selector view
  if (!activeDoc) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Legal Documents</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage the platform's legal and compliance pages. Changes are reflected on the public site immediately.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEGAL_PAGES.map((page) => (
            <Card 
              key={page.slug} 
              className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all group"
              onClick={() => setActiveDoc(page.slug)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <page.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{page.title}</CardTitle>
                    <CardDescription className="text-xs mt-0.5">{page.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">/{page.slug}</span>
                  <Badge variant="outline" className="text-[10px]">Edit</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-6 text-center">
            <FileText className="h-8 w-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">
              These pages use a hardcoded fallback if no CMS content has been saved yet.
              Click any document above to start editing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Document editor view
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setActiveDoc(null)} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-heading">{activeMeta?.title || "Edit Document"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">/{activeDoc}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Page Content</CardTitle>
              <CardDescription>Use HTML to format your legal document. Headings, paragraphs, lists, and links are all supported.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Page Title</Label>
                <Input 
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={activeMeta?.title}
                />
              </div>
              <div className="space-y-2">
                <Label>Content (HTML)</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm(prev => ({ ...prev, content: e.target.value }))}
                  rows={20}
                  className="font-mono text-sm leading-relaxed"
                  placeholder={`<h2 id="section-1">1. Section Title</h2>\n<p>Your legal text here...</p>`}
                />
                <p className="text-xs text-muted-foreground">
                  Supports standard HTML tags. Use heading IDs for the sidebar navigation (e.g., <code className="bg-muted px-1 rounded">&lt;h2 id="section"&gt;</code>).
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select value={form.status} onValueChange={(v: any) => setForm(prev => ({ ...prev, status: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {pageData?.updated_at && (
                  <p className="text-xs text-muted-foreground">
                    Last updated: {new Date(pageData.updated_at).toLocaleString()}
                  </p>
                )}
                <Button 
                  className="w-full" 
                  onClick={handleSave} 
                  disabled={updatePage.isPending}
                >
                  {updatePage.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {pageData?.id ? "Update Document" : "Publish Document"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Meta Title</Label>
                  <Input 
                    value={form.meta_title}
                    onChange={(e) => setForm(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder={activeMeta?.title}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Meta Description</Label>
                  <Textarea 
                    value={form.meta_description}
                    onChange={(e) => setForm(prev => ({ ...prev, meta_description: e.target.value }))}
                    rows={3}
                    placeholder="Brief description for search engines..."
                  />
                  <p className="text-xs text-muted-foreground">
                    {(form.meta_description || "").length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
