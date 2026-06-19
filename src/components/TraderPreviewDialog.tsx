import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Users, BarChart3, Calendar } from "lucide-react";

interface Props {
  trader: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function TraderPreviewDialog({ trader, open, onOpenChange, actionLabel = "Copy Trader", onAction }: Props) {
  if (!trader) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Trader Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-center gap-4">
            <img src={trader.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + trader.name} alt={trader.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary/20" width={64} height={64} />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{trader.name}</h3>
                <Badge>{trader.win_rate >= 80 ? "Elite" : "Pro"}</Badge>
                {trader.category && (
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">{trader.category}</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{trader.followers} Followers</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" /> Member since {new Date(trader.created_at).getFullYear()}
              </p>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-muted-foreground">{trader.bio || "Professional trader on the platform."}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <TrendingUp className="h-4 w-4 mx-auto mb-1 text-success" />
              <div className="font-bold text-success">+${trader.total_profit.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Total Profit</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <BarChart3 className="h-4 w-4 mx-auto mb-1 text-primary" />
              <div className="font-bold">{trader.win_rate}%</div>
              <div className="text-[10px] text-muted-foreground">Win Rate</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 text-center">
              <Users className="h-4 w-4 mx-auto mb-1 text-primary" />
              <div className="font-bold">{trader.followers?.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">Followers</div>
            </div>
          </div>

          {/* Performance bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Win Rate Performance</span>
              <span className="font-medium">{trader.win_rate}%</span>
            </div>
            <Progress value={trader.win_rate} className="h-2" />
          </div>

          {onAction && (
            <Button className="w-full" onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
