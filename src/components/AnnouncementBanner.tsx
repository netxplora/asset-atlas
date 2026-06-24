import { useCmsAnnouncements } from "@/hooks/useCmsData";
import { AlertCircle, CheckCircle2, Info, XCircle, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function AnnouncementBanner() {
  const { data: announcements = [] } = useCmsAnnouncements(false);
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  if (announcements.length === 0) return null;

  return (
    <div className="w-full flex flex-col z-[100] relative">
      {announcements.map((ann) => {
        if (dismissed[ann.id]) return null;

        let bgColor = "bg-primary text-primary-foreground";
        let Icon = Info;

        switch (ann.type) {
          case "info":
            bgColor = "bg-blue-600 text-white";
            Icon = Info;
            break;
          case "success":
            bgColor = "bg-green-600 text-white";
            Icon = CheckCircle2;
            break;
          case "warning":
            bgColor = "bg-yellow-600 text-white";
            Icon = AlertCircle;
            break;
          case "danger":
            bgColor = "bg-red-600 text-white";
            Icon = XCircle;
            break;
        }

        return (
          <div key={ann.id} className={`w-full py-2 px-4 flex items-center justify-center relative ${bgColor}`}>
            <div className="container flex items-center justify-center gap-2 max-w-4xl text-center pr-8">
              <Icon className="h-4 w-4 shrink-0" />
              <p className="text-sm font-medium">
                <span className="font-bold mr-2">{ann.title}</span>
                {ann.content}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-black/10 text-current"
              onClick={() => setDismissed(prev => ({ ...prev, [ann.id]: true }))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
