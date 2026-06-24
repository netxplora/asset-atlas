import { PublicLayout } from "@/components/PublicLayout";
import { SEOHead } from "@/components/SEOHead";
import { useCmsBlogs } from "@/hooks/useCmsData";
import { Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BlogIndex() {
  const { data: blogs = [], isLoading } = useCmsBlogs(false);

  return (
    <PublicLayout>
      <SEOHead title="Blog" description="Latest news, market insights, and updates from AssetVault." path="/blog" />
      
      <section className="py-16 bg-muted/30">
        <div className="container text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold font-heading">Market Insights & News</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Stay updated with the latest trends in digital assets, platform announcements, and expert trading strategies.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
          ) : blogs.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground bg-muted/10 rounded-xl border border-dashed">
              No blog posts published yet. Check back soon!
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogs.map((post) => (
                <Link to={`/blog/${post.slug}`} key={post.id} className="group">
                  <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-all group-hover:border-primary/50">
                    {post.featured_image_url && (
                      <div className="aspect-video w-full overflow-hidden bg-muted">
                        <img 
                          src={post.featured_image_url} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="text-xs text-primary font-medium mb-2">{new Date(post.created_at).toLocaleDateString()}</div>
                      <CardTitle className="group-hover:text-primary transition-colors">{post.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <p className="text-muted-foreground line-clamp-3">{post.excerpt || post.content?.replace(/<[^>]*>?/gm, '').substring(0, 150)}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
