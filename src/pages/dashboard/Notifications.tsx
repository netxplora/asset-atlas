import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, TrendingUp, Shield, Info, DollarSign, Check, Trash2, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const typeIcons: Record<string, any> = { 
  deposit: DollarSign, 
  withdrawal: DollarSign, 
  investment: TrendingUp, 
  security: Shield, 
  system: Info, 
  trading: TrendingUp 
};

const typeColors: Record<string, string> = { 
  deposit: "bg-success/10 text-success border-success/20", 
  withdrawal: "bg-destructive/10 text-destructive border-destructive/20", 
  investment: "bg-primary/10 text-primary border-primary/20", 
  security: "bg-warning/10 text-warning border-warning/20", 
  system: "bg-muted text-muted-foreground border-border", 
  trading: "bg-blue-500/10 text-blue-500 border-blue-500/20" 
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setNotifications(data);
        setIsLoading(false);
      });

    // Real-time listener for new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications((current) => [payload.new, ...current]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds);
  };

  const markAsRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
  };

  const deleteNotification = async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    await supabase.from("notifications").delete().eq("id", id);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold font-heading">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Stay updated on your account activity and investments.</p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Badge className="bg-primary text-primary-foreground font-semibold px-2.5 py-0.5">
              {unreadCount} New
            </Badge>
          )}
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllRead} className="shadow-sm">
              <Check className="h-4 w-4 mr-2" /> Mark all read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array(5).fill(0).map((_, i) => (
            <Card key={i} className="border-muted animate-pulse">
              <CardContent className="p-5 flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : notifications.length === 0 ? (
          <Card className="border-dashed bg-muted/20 animate-fade-in-up">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-semibold mb-1">You're all caught up!</h3>
              <p className="text-muted-foreground text-sm max-w-sm">
                We'll notify you here when there's activity on your account, successful deposits, or new investment returns.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((n, index) => {
            const Icon = typeIcons[n.type] || Bell;
            const colorClass = typeColors[n.type] || "bg-primary/10 text-primary border-primary/20";
            
            return (
              <Card 
                key={n.id} 
                className={`transition-all duration-300 animate-fade-in-up group ${
                  n.is_read 
                    ? "opacity-70 bg-muted/10 border-transparent hover:opacity-100 hover:bg-background" 
                    : "border-primary/30 shadow-sm bg-primary/5"
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="p-5 flex flex-col sm:flex-row items-start gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 border shadow-sm ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-1 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold text-base leading-none ${n.is_read ? 'text-foreground/80' : 'text-foreground'}`}>
                          {n.title}
                        </h4>
                        {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <div className="text-xs font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                      </div>
                    </div>
                    
                    <p className={`text-sm leading-relaxed ${n.is_read ? 'text-muted-foreground' : 'text-foreground/90'}`}>
                      {n.message}
                    </p>
                    
                    <div className="flex items-center gap-3 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!n.is_read && (
                        <Button variant="ghost" size="sm" className="h-8 text-xs font-medium px-2 hover:bg-primary/10 hover:text-primary" onClick={() => markAsRead(n.id)}>
                          <Check className="h-3.5 w-3.5 mr-1.5" /> Mark as read
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 text-xs font-medium px-2 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteNotification(n.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
