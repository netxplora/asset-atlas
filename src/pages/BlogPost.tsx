import { PublicLayout } from "@/components/PublicLayout";
import { SEOHead } from "@/components/SEOHead";
import { useCmsBlogBySlug } from "@/hooks/useCmsData";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, BookOpen, ArrowRight } from "lucide-react";
import { useParams, Link } from "react-router-dom";

export default function BlogPost() {
  const { slug } = useParams();
  const { data: post, isLoading } = useCmsBlogBySlug(slug || "");

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="container max-w-3xl py-12 space-y-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!post) {
    return (
      <PublicLayout>
        <div className="flex flex-col min-h-[60vh] items-center justify-center space-y-4 text-center container">
          <div className="h-16 w-16 rounded-xl bg-muted flex items-center justify-center">
            <BookOpen className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Article Not Found</h1>
          <p className="text-sm text-muted-foreground max-w-md">
            The article you are looking for does not exist or has been removed from our library.
          </p>
          <Button asChild variant="outline">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Articles
            </Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const wordCount = post.content?.split(" ").length || 0;
  const readMins = Math.max(1, Math.round(wordCount / 200));

  return (
    <PublicLayout>
      <SEOHead
        title={post.meta_title || post.title}
        description={post.meta_description || post.excerpt || "Read this article on AssetVault."}
        path={`/blog/${post.slug}`}
      />

      <article className="py-12 lg:py-16">
        <div className="container max-w-3xl">
          {/* Back Navigation */}
          <Button asChild variant="ghost" className="mb-8 -ml-3 text-xs sm:text-sm text-muted-foreground hover:text-foreground">
            <Link to="/blog">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to Articles
            </Link>
          </Button>

          {/* Article Header */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                })}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {readMins} min read
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold leading-tight text-foreground">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4">
                {post.excerpt}
              </p>
            )}
          </div>

          {/* Featured Image */}
          {post.featured_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-muted mb-10 shadow-elevation-md">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Article Body */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight
              prose-h2:text-xl prose-h3:text-lg
              prose-p:text-sm prose-p:leading-relaxed prose-p:text-muted-foreground
              prose-a:text-primary prose-a:font-medium hover:prose-a:text-primary/80
              prose-strong:text-foreground prose-strong:font-semibold
              prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs
              prose-pre:bg-muted prose-pre:border prose-pre:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />

          {/* Footer Navigation */}
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
            <Button asChild variant="outline" size="sm" className="font-semibold">
              <Link to="/blog">
                <ArrowLeft className="mr-1.5 h-4 w-4" /> All Articles
              </Link>
            </Button>
            <Button asChild size="sm" className="font-semibold">
              <Link to="/plans">
                View Investment Plans <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
