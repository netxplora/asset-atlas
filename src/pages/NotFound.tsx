import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FileQuestion, Search, Home, HelpCircle, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PublicLayout } from "@/components/PublicLayout";

const NotFound = () => {
  const location = useLocation();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/faq?q=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <PublicLayout>
      <div className="flex min-h-[70vh] flex-col items-center justify-center py-20 px-4 text-center">
        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border-8 border-background shadow-sm">
            <FileQuestion className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-6xl font-heading font-bold text-primary">404</h1>
          <h2 className="mb-4 text-2xl font-bold">Page Not Found</h2>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track.
          </p>

          <form onSubmit={handleSearch} className="flex w-full max-w-md mx-auto items-center space-x-2 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search for answers..." 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
            <CardLink to="/" icon={Home} title="Home" desc="Return to homepage" />
            <CardLink to="/plans" icon={TrendingUp} title="Plans" desc="View investment tiers" />
            <CardLink to="/faq" icon={HelpCircle} title="Help Center" desc="Read our FAQs" />
          </div>

          <Button variant="link" asChild>
            <Link to="/" className="text-primary hover:text-primary/80 group">
              Back to Homepage <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}

function CardLink({ to, icon: Icon, title, desc }: { to: string, icon: any, title: string, desc: string }) {
  return (
    <Link to={to} className="block group">
      <div className="border rounded-xl p-4 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-md bg-card h-full">
        <Icon className="h-5 w-5 text-primary mb-2" />
        <h3 className="font-medium text-sm mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
      </div>
    </Link>
  );
};

export default NotFound;
