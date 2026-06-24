import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCmsBrandSettings, useUpdateCmsBrandSettings, useUploadCmsMedia, useAppSettings, useUpdateAppSettings } from "@/hooks/useCmsData";
import { Loader2, Upload, Palette, Type, Building2, Image as ImageIcon, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminBrand() {
  const { data: settings, isLoading } = useCmsBrandSettings();
  const updateSettings = useUpdateCmsBrandSettings();
  const uploadMedia = useUploadCmsMedia();

  const { data: seoSettingsStr } = useAppSettings("seo_settings");
  const updateAppSettings = useUpdateAppSettings();

  const [form, setForm] = useState<any>({});
  const [seoForm, setSeoForm] = useState<any>({
    default_title: "AssetVault",
    default_description: "AssetVault is a secure online platform for managing investments, copy trading, and portfolio tracking.",
    default_keywords: "crypto, forex, commodities, investing"
  });

  useEffect(() => {
    if (settings) {
      setForm(settings);
    }
  }, [settings]);

  useEffect(() => {
    if (seoSettingsStr) {
      try {
        setSeoForm(JSON.parse(seoSettingsStr));
      } catch (e) {
        console.error("Failed to parse SEO settings", e);
      }
    }
  }, [seoSettingsStr]);

  const handleChange = (key: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (section: string) => {
    try {
      if (section === "SEO") {
        await updateAppSettings.mutateAsync({ key: "seo_settings", value: JSON.stringify(seoForm) });
        toast.success("SEO Settings saved successfully");
      } else {
        await updateSettings.mutateAsync(form);
      }
    } catch (error) {
      // toast handled in hook
    }
  };

  const handleFileUpload = async (key: string, file: File) => {
    try {
      toast.info("Uploading image...");
      const url = await uploadMedia.mutateAsync(file);
      handleChange(key, url);
      toast.success("Image uploaded. Remember to save changes.");
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Brand & CMS Center</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage global platform branding, company details, and theme settings.</p>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid grid-cols-5 lg:w-[750px]">
          <TabsTrigger value="company" className="flex items-center gap-2"><Building2 className="h-4 w-4" /> Company</TabsTrigger>
          <TabsTrigger value="logos" className="flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Logos</TabsTrigger>
          <TabsTrigger value="colors" className="flex items-center gap-2"><Palette className="h-4 w-4" /> Colors</TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2"><Type className="h-4 w-4" /> Typography</TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2"><Search className="h-4 w-4" /> SEO</TabsTrigger>
        </TabsList>

        {/* ================================== */}
        {/* COMPANY INFO */}
        {/* ================================== */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Global variables used across the site and in legal documents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input value={form.company_name || ""} onChange={(e) => handleChange("company_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Trading Name (Optional)</Label>
                  <Input value={form.trading_name || ""} onChange={(e) => handleChange("trading_name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input type="email" value={form.support_email || ""} onChange={(e) => handleChange("support_email", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Compliance/Legal Email</Label>
                  <Input type="email" value={form.compliance_email || ""} onChange={(e) => handleChange("compliance_email", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Company Address</Label>
                  <Input value={form.address || ""} onChange={(e) => handleChange("address", e.target.value)} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Mission Statement</Label>
                  <Textarea value={form.mission_statement || ""} onChange={(e) => handleChange("mission_statement", e.target.value)} rows={3} />
                </div>
              </div>
              <Button onClick={() => handleSave("Company Info")} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save Company Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================== */}
        {/* LOGOS */}
        {/* ================================== */}
        <TabsContent value="logos">
          <Card>
            <CardHeader>
              <CardTitle>Brand Assets & Logos</CardTitle>
              <CardDescription>Upload your platform logos for different contexts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Primary Logo */}
                <div className="space-y-4">
                  <Label>Primary Logo (Light Theme)</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-muted/20">
                    {form.primary_logo_url ? (
                      <div className="space-y-4 w-full flex flex-col items-center">
                        <img src={form.primary_logo_url} alt="Primary" className="max-h-16 object-contain bg-white/50 p-2 rounded" />
                        <div className="flex items-center gap-2 w-full">
                          <Input value={form.primary_logo_url} readOnly className="text-xs text-muted-foreground" />
                          <Label className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap flex items-center">
                            <Upload className="h-4 w-4 mr-2" /> Change
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload("primary_logo_url", e.target.files[0])} />
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <Label className="cursor-pointer flex flex-col items-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                          <Upload className="h-5 w-5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Click to upload Primary Logo</span>
                        <span className="text-xs text-muted-foreground mt-1">SVG, PNG, or WebP</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload("primary_logo_url", e.target.files[0])} />
                      </Label>
                    )}
                  </div>
                </div>

                {/* Dark Mode Logo */}
                <div className="space-y-4">
                  <Label>Dark Mode Logo</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-slate-950">
                    {form.dark_logo_url ? (
                      <div className="space-y-4 w-full flex flex-col items-center">
                        <img src={form.dark_logo_url} alt="Dark Mode" className="max-h-16 object-contain" />
                        <div className="flex items-center gap-2 w-full">
                          <Input value={form.dark_logo_url} readOnly className="text-xs bg-slate-900 border-slate-800 text-slate-300" />
                          <Label className="cursor-pointer bg-slate-800 text-slate-200 hover:bg-slate-700 px-3 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap flex items-center">
                            <Upload className="h-4 w-4 mr-2" /> Change
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload("dark_logo_url", e.target.files[0])} />
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <Label className="cursor-pointer flex flex-col items-center text-slate-300">
                        <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="text-sm font-medium">Click to upload Dark Logo</span>
                        <span className="text-xs text-slate-500 mt-1">SVG, PNG, or WebP</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload("dark_logo_url", e.target.files[0])} />
                      </Label>
                    )}
                  </div>
                </div>

                {/* Favicon */}
                <div className="space-y-4">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center bg-muted/20">
                    {form.favicon_url ? (
                      <div className="space-y-4 w-full flex flex-col items-center">
                        <img src={form.favicon_url} alt="Favicon" className="h-10 w-10 object-contain rounded" />
                        <div className="flex items-center gap-2 w-full">
                          <Label className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-2 rounded-md font-medium text-sm transition-colors whitespace-nowrap flex items-center w-full justify-center">
                            <Upload className="h-4 w-4 mr-2" /> Replace Favicon
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload("favicon_url", e.target.files[0])} />
                          </Label>
                        </div>
                      </div>
                    ) : (
                      <Label className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                        <span className="text-sm font-medium">Upload Favicon (Square)</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload("favicon_url", e.target.files[0])} />
                      </Label>
                    )}
                  </div>
                </div>

              </div>
              <Button onClick={() => handleSave("Logos")} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save Logos
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================== */}
        {/* COLORS */}
        {/* ================================== */}
        <TabsContent value="colors">
          <Card>
            <CardHeader>
              <CardTitle>Theme Colors</CardTitle>
              <CardDescription>Define the exact hex codes for your platform's color palette.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md shadow-sm border" style={{ backgroundColor: form.primary_color || "#0f172a" }} />
                    <Input value={form.primary_color || ""} onChange={(e) => handleChange("primary_color", e.target.value)} className="font-mono uppercase" placeholder="#000000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md shadow-sm border" style={{ backgroundColor: form.secondary_color || "#d4af37" }} />
                    <Input value={form.secondary_color || ""} onChange={(e) => handleChange("secondary_color", e.target.value)} className="font-mono uppercase" placeholder="#000000" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md shadow-sm border" style={{ backgroundColor: form.accent_color || "#10b981" }} />
                    <Input value={form.accent_color || ""} onChange={(e) => handleChange("accent_color", e.target.value)} className="font-mono uppercase" placeholder="#000000" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Success Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md shadow-sm border" style={{ backgroundColor: form.success_color || "#22c55e" }} />
                    <Input value={form.success_color || ""} onChange={(e) => handleChange("success_color", e.target.value)} className="font-mono uppercase" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Warning Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md shadow-sm border" style={{ backgroundColor: form.warning_color || "#eab308" }} />
                    <Input value={form.warning_color || ""} onChange={(e) => handleChange("warning_color", e.target.value)} className="font-mono uppercase" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Error Color</Label>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md shadow-sm border" style={{ backgroundColor: form.error_color || "#ef4444" }} />
                    <Input value={form.error_color || ""} onChange={(e) => handleChange("error_color", e.target.value)} className="font-mono uppercase" />
                  </div>
                </div>

              </div>
              <Button onClick={() => handleSave("Colors")} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save Colors
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================== */}
        {/* TYPOGRAPHY */}
        {/* ================================== */}
        <TabsContent value="typography">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Select Google Fonts for your headings and body text.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Heading Font Family</Label>
                  <Input value={form.heading_font || ""} onChange={(e) => handleChange("heading_font", e.target.value)} placeholder="e.g. Poppins" />
                  <p className="text-xs text-muted-foreground">Must be a valid Google Font name.</p>
                </div>
                <div className="space-y-2">
                  <Label>Body Font Family</Label>
                  <Input value={form.body_font || ""} onChange={(e) => handleChange("body_font", e.target.value)} placeholder="e.g. Inter" />
                  <p className="text-xs text-muted-foreground">Must be a valid Google Font name.</p>
                </div>
              </div>
              
              <div className="p-6 border rounded-lg bg-muted/20 space-y-4">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest">Preview</h3>
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold" style={{ fontFamily: form.heading_font || 'inherit' }}>
                    Heading Preview (H1)
                  </h1>
                  <h2 className="text-xl font-semibold" style={{ fontFamily: form.heading_font || 'inherit' }}>
                    Section Heading Preview (H2)
                  </h2>
                  <p className="text-muted-foreground leading-relaxed" style={{ fontFamily: form.body_font || 'inherit' }}>
                    This is a preview of the body text. AssetVault provides premium investment solutions and secure crypto storage. You can see how the font renders here before saving your changes.
                  </p>
                </div>
              </div>

              <Button onClick={() => handleSave("Typography")} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save Typography
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================== */}
        {/* SEO SETTINGS */}
        {/* ================================== */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Global SEO Settings</CardTitle>
              <CardDescription>Configure the default Meta tags used for search engines and social sharing.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Page Title</Label>
                  <Input 
                    value={seoForm.default_title || ""} 
                    onChange={(e) => setSeoForm(prev => ({ ...prev, default_title: e.target.value }))} 
                    placeholder="AssetVault"
                  />
                  <p className="text-xs text-muted-foreground">Appended to individual page titles (e.g. "About Us — AssetVault").</p>
                </div>
                <div className="space-y-2">
                  <Label>Default Meta Description</Label>
                  <Textarea 
                    value={seoForm.default_description || ""} 
                    onChange={(e) => setSeoForm(prev => ({ ...prev, default_description: e.target.value }))} 
                    rows={3} 
                    placeholder="A secure online platform for managing investments..."
                  />
                  <p className="text-xs text-muted-foreground">Used by Google in search results. Optimal length is 150-160 characters.</p>
                </div>
                <div className="space-y-2">
                  <Label>Default Meta Keywords</Label>
                  <Input 
                    value={seoForm.default_keywords || ""} 
                    onChange={(e) => setSeoForm(prev => ({ ...prev, default_keywords: e.target.value }))} 
                    placeholder="crypto, forex, commodities, investing"
                  />
                  <p className="text-xs text-muted-foreground">Comma separated list of keywords.</p>
                </div>
              </div>

              <div className="p-6 border rounded-lg bg-muted/20 space-y-3 mt-6">
                <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-widest mb-2 flex items-center"><Search className="h-4 w-4 mr-2" /> Google Search Preview</h3>
                <div className="bg-white dark:bg-slate-900 p-4 rounded shadow-sm border max-w-xl">
                  <div className="text-sm text-slate-800 dark:text-slate-200 flex items-center mb-1">
                    <div className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-800 mr-3 flex-shrink-0"></div>
                    <div>
                      <div className="text-xs text-slate-500">{form.website_url || "https://assetvault.com"}</div>
                      <div className="text-sm">AssetVault</div>
                    </div>
                  </div>
                  <div className="text-xl text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer truncate">
                    Home — {seoForm.default_title || "AssetVault"}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                    {seoForm.default_description || "A secure online platform for managing investments..."}
                  </div>
                </div>
              </div>

              <Button onClick={() => handleSave("SEO")} disabled={updateAppSettings.isPending}>
                {updateAppSettings.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null} Save SEO Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
