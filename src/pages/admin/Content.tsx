import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCmsPages, useAppSettings, useUpdateAppSettings } from "@/hooks/useCmsData";
import { Loader2, FileText, Home, MessageSquareQuote, ShieldCheck, Plus, Pencil, Trash2, Eye, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminContent() {
  const { data: pages = [], isLoading: loadingPages } = useCmsPages(true);
  const { data: homeData, isLoading: loadingHome } = useAppSettings("homepage_content");
  const updateSettings = useUpdateAppSettings();
  
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [homeForm, setHomeForm] = useState({
    hero_title: "",
    hero_highlight: "",
    hero_subtitle: "",
    cta_title: "",
    cta_subtitle: ""
  });

  useEffect(() => {
    if (homeData) {
      setHomeForm({
        hero_title: homeData.hero_title || "",
        hero_highlight: homeData.hero_highlight || "",
        hero_subtitle: homeData.hero_subtitle || "",
        cta_title: homeData.cta_title || "",
        cta_subtitle: homeData.cta_subtitle || ""
      });
    }
  }, [homeData]);

  const handleSaveHome = () => {
    updateSettings.mutate({ key: "homepage_content", value: homeForm }, {
      onSuccess: () => setEditingSection(null)
    });
  };

  if (loadingPages || loadingHome) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Content & Page Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage website pages, homepage layouts, and trust indicators.</p>
        </div>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="pages" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Pages</TabsTrigger>
          <TabsTrigger value="homepage" className="flex items-center gap-2"><Home className="h-4 w-4" /> Homepage</TabsTrigger>
          <TabsTrigger value="testimonials" className="flex items-center gap-2"><MessageSquareQuote className="h-4 w-4" /> Testimonials</TabsTrigger>
          <TabsTrigger value="trust" className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Trust & Partners</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle>Page Manager</CardTitle>
                <CardDescription>Create custom pages or edit standard pages like About and Contact.</CardDescription>
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-1"/> Create Page</Button>
            </CardHeader>
            <CardContent className="p-0">
              {pages.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground text-sm">No pages found. Click Create Page to start.</div>
              ) : (
                <div className="divide-y">
                  {pages.map((p) => (
                    <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {p.title}
                          <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-[10px]">
                            {p.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">/{p.slug}</div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="outline" size="sm" title="Preview"><Eye className="h-4 w-4" /></Button>
                        <Button variant="outline" size="sm" title="Edit"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="destructive" size="sm" title="Delete"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage">
          <Card>
            <CardHeader>
              <CardTitle>Homepage Content</CardTitle>
              <CardDescription>Control the text displayed on the landing page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {editingSection === null ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => setEditingSection('hero')}>
                    <span className="font-bold">Hero Section</span>
                    <span className="text-xs text-muted-foreground">Main headline & background</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                    <span className="font-bold">Statistics Section</span>
                    <span className="text-xs text-muted-foreground">Key platform metrics (Coming soon)</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2 opacity-50 cursor-not-allowed">
                    <span className="font-bold">Features Grid</span>
                    <span className="text-xs text-muted-foreground">Platform capabilities (Coming soon)</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" onClick={() => setEditingSection('cta')}>
                    <span className="font-bold">CTA Section</span>
                    <span className="text-xs text-muted-foreground">Bottom call to action</span>
                  </Button>
                </div>
              ) : editingSection === 'hero' ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Edit Hero Section</h3>
                    <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Hero Title Prefix</Label>
                      <Input 
                        value={homeForm.hero_title} 
                        onChange={e => setHomeForm({...homeForm, hero_title: e.target.value})}
                        placeholder="e.g. Your Gateway to"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hero Title Highlight (Gold Text)</Label>
                      <Input 
                        value={homeForm.hero_highlight} 
                        onChange={e => setHomeForm({...homeForm, hero_highlight: e.target.value})}
                        placeholder="e.g. Smart Investing"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Hero Subtitle</Label>
                      <Textarea 
                        value={homeForm.hero_subtitle} 
                        onChange={e => setHomeForm({...homeForm, hero_subtitle: e.target.value})}
                        placeholder="Enter the hero subtitle text..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveHome} disabled={updateSettings.isPending}>
                    {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              ) : editingSection === 'cta' ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Edit CTA Section</h3>
                    <Button variant="ghost" size="sm" onClick={() => setEditingSection(null)}>Cancel</Button>
                  </div>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>CTA Title</Label>
                      <Input 
                        value={homeForm.cta_title} 
                        onChange={e => setHomeForm({...homeForm, cta_title: e.target.value})}
                        placeholder="e.g. Ready to Start Investing?"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>CTA Subtitle</Label>
                      <Textarea 
                        value={homeForm.cta_subtitle} 
                        onChange={e => setHomeForm({...homeForm, cta_subtitle: e.target.value})}
                        placeholder="Enter the CTA subtitle text..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveHome} disabled={updateSettings.isPending}>
                    {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testimonials">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle>Testimonials</CardTitle>
                <CardDescription>Manage user reviews displayed on the homepage.</CardDescription>
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-1"/> Add Testimonial</Button>
            </CardHeader>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Testimonial manager coming soon.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trust">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div>
                <CardTitle>Trust & Partners</CardTitle>
                <CardDescription>Manage security badges and partner logos.</CardDescription>
              </div>
              <Button size="sm"><Plus className="h-4 w-4 mr-1"/> Add Indicator</Button>
            </CardHeader>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Trust indicator manager coming soon.
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
