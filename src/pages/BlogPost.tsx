import { PublicLayout } from "@/components/PublicLayout";
import { SEOHead } from "@/components/SEOHead";
import { useCmsBlogBySlug } from "@/hooks/useCmsData";
import { Loader2, ArrowLeft } from "lucide-react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = useCmsBlogBySlug(slug || "");

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="flex flex-col min-h-[50vh] items-center justify-center space-y-4">
          <h1 className="text-3xl font-bold">Post not found</h1>
          <p className="text-muted-foreground">The blog post you're looking for doesn't exist or has been removed.</p>
          <Button asChild variant="outline">
            <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <SEOHead 
        title={post.meta_title || post.title} 
        description={post.meta_description || post.excerpt || "Read this article on AssetVault."} 
        path={`/blog/${post.slug}`} 
      />
      
      <article className="py-16">
        <div className="container max-w-3xl">
          <Button asChild variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
            <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
          </Button>
          
          <div className="space-y-4 mb-10 text-center">
            <div className="text-sm text-primary font-medium">{new Date(post.created_at).toLocaleDateString()}</div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading leading-tight">{post.title}</h1>
          </div>

          {post.featured_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted mb-10">
              <img 
                src={post.featured_image_url} 
                alt={post.title} 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div 
            className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-a:text-primary hover:prose-a:text-primary/80"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </div>
      </article>
    </PublicLayout>
  );
}
