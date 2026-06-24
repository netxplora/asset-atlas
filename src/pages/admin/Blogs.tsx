import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCmsBlogs, useUpdateCmsBlog, useDeleteCmsBlog, type CmsBlogPost } from "@/hooks/useCmsData";
import { Loader2, Plus, Pencil, Trash2, Eye, ArrowLeft, Save, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default function AdminBlogs() {
  const { data: blogs = [], isLoading } = useCmsBlogs(true);
  const updateBlog = useUpdateCmsBlog();
  const deleteBlog = useDeleteCmsBlog();

  const [editing, setEditing] = useState<Partial<CmsBlogPost> | null>(null);

  const handleNew = () => {
    setEditing({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      featured_image_url: "",
      status: "draft",
      meta_title: "",
      meta_description: "",
    });
  };

  const handleEdit = (post: CmsBlogPost) => {
    setEditing({ ...post });
  };

  const handleSave = async () => {
    if (!editing?.title || !editing?.slug) return;
    await updateBlog.mutateAsync(editing);
    setEditing(null);
  };

  if (isLoading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  // Editor view
  if (editing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setEditing(null)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Posts
          </Button>
          <h1 className="text-2xl font-bold font-heading">{editing.id ? "Edit Post" : "New Post"}</h1>
        </div>

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Main Editor */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Post Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={editing.title || ""}
                    onChange={(e) => {
                      const title = e.target.value;
                      setEditing(prev => ({
                        ...prev,
                        title,
                        slug: prev?.id ? prev.slug : slugify(title),
                      }));
                    }}
                    placeholder="Enter post title..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={editing.slug || ""}
                    onChange={(e) => setEditing(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="post-url-slug"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">URL: /blog/{editing.slug || "..."}</p>
                </div>
                <div className="space-y-2">
                  <Label>Excerpt</Label>
                  <Textarea
                    value={editing.excerpt || ""}
                    onChange={(e) => setEditing(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                    placeholder="A brief summary shown on the blog listing page..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content (HTML)</Label>
                  <Textarea
                    value={editing.content || ""}
                    onChange={(e) => setEditing(prev => ({ ...prev, content: e.target.value }))}
                    rows={16}
                    className="font-mono text-sm leading-relaxed"
                    placeholder="<p>Write your article content here...</p>"
                  />
                  <p className="text-xs text-muted-foreground">Supports standard HTML tags for formatting.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={editing.status || "draft"}
                    onValueChange={(v: any) => setEditing(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={handleSave} disabled={updateBlog.isPending || !editing.title}>
                  {updateBlog.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {editing.id ? "Update Post" : "Create Post"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Featured Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  value={editing.featured_image_url || ""}
                  onChange={(e) => setEditing(prev => ({ ...prev, featured_image_url: e.target.value }))}
                  placeholder="https://example.com/image.jpg"
                  className="text-sm"
                />
                {editing.featured_image_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                    <img src={editing.featured_image_url} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs">Meta Title</Label>
                  <Input
                    value={editing.meta_title || ""}
                    onChange={(e) => setEditing(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder={editing.title || "Post title"}
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Meta Description</Label>
                  <Textarea
                    value={editing.meta_description || ""}
                    onChange={(e) => setEditing(prev => ({ ...prev, meta_description: e.target.value }))}
                    rows={2}
                    placeholder="Brief description for search engines..."
                    className="text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Blog Posts</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage content for your platform's blog.</p>
        </div>
        <Button onClick={handleNew}><Plus className="h-4 w-4 mr-1" /> New Post</Button>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> All Posts</CardTitle>
          <CardDescription>Manage your published and drafted articles. {blogs.length} total.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {blogs.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="font-medium">No blog posts yet</p>
              <p className="text-sm mt-1">Click "New Post" to start writing your first article.</p>
            </div>
          ) : (
            <div className="divide-y">
              {blogs.map((p) => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                  <div className="flex items-center gap-4 min-w-0">
                    {p.featured_image_url && (
                      <div className="h-12 w-16 rounded bg-muted overflow-hidden flex-shrink-0 hidden sm:block">
                        <img src={p.featured_image_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-2">
                        <span className="truncate">{p.title}</span>
                        <Badge variant={p.status === "published" ? "default" : "secondary"} className="text-[10px] flex-shrink-0">
                          {p.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">/{p.slug} • {new Date(p.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Button variant="outline" size="sm" title="Preview" onClick={() => window.open(`/blog/${p.slug}`, '_blank')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" title="Edit" onClick={() => handleEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      title="Delete"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete this post?")) {
                          deleteBlog.mutate(p.id);
                        }
                      }}
                      disabled={deleteBlog.isPending}
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
    </div>
  );
}
