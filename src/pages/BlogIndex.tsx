import { PublicLayout } from "@/components/PublicLayout";
import { SEOHead } from "@/components/SEOHead";
import { useCmsBlogs } from "@/hooks/useCmsData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Search, BookOpen, ArrowRight, Calendar, Clock } from "lucide-react";

function BlogCardSkeleton() {
  return (
    <Card className="border border-border/60 bg-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-16" />
      </CardContent>
    </Card>
  );
}

export default function BlogIndex() {
  const { data: blogs = [], isLoading } = useCmsBlogs(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return blogs;
    return blogs.filter(
      (p: any) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt?.toLowerCase().includes(search.toLowerCase())
    );
  }, [blogs, search]);

  return (
    <PublicLayout>
      <SEOHead
        title="Market Updates & Platform News - AssetVault"
        description="Read the latest investment insights, platform announcements, and educational articles from the AssetVault team."
        path="/blog"
      />

      {/* Header Banner */}
      <section className="bg-slate-950 text-white py-16 lg:py-20 border-b">
        <div className="container text-center space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15">
            Articles & Updates
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white">
            Market Updates & Platform News
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Practical investment insights, platform announcements, and financial education articles.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-6 bg-card border-b">
        <div className="container max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 text-sm bg-background"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 lg:py-20">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => <BlogCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 border border-dashed rounded-xl space-y-3 max-w-lg mx-auto">
              <BookOpen className="h-10 w-10 text-muted-foreground/40 mx-auto" />
              <h3 className="font-heading font-semibold text-base text-foreground">
                {search ? "No articles matched your search." : "No articles published yet."}
              </h3>
              <p className="text-xs text-muted-foreground">
                {search ? "Try adjusting your search terms." : "Check back soon for the latest updates."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((post: any) => {
                const wordCount = post.content?.split(" ").length || 0;
                const readMins = Math.max(1, Math.round(wordCount / 200));
                return (
                  <Link to={`/blog/${post.slug}`} key={post.id} className="group">
                    <Card className="h-full flex flex-col overflow-hidden border border-border/70 bg-card shadow-elevation-sm hover:border-primary/40 hover:shadow-elevation-md transition-all duration-200">
                      {post.featured_image_url ? (
                        <div className="aspect-video w-full overflow-hidden bg-muted">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-muted/60 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                        </div>
                      )}

                      <CardContent className="p-5 flex-1 flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(post.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                          <span>·</span>
                          <Clock className="h-3 w-3" />
                          <span>{readMins} min read</span>
                        </div>

                        <h2 className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
                          {post.title}
                        </h2>

                        {post.excerpt && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-1 text-xs font-semibold text-primary mt-auto pt-2 border-t border-border/60">
                          Read Article <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
