import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, ShieldAlert, History } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["adminAuditLogs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_audit_logs" as any)
        .select("*, profiles:admin_id(first_name, last_name, email)")
        .order("created_at", { ascending: false })
        .limit(100);
      
      if (error) {
        // Fallback for when the table doesn't exist yet (before migration runs)
        console.warn("Audit logs table might not exist yet", error);
        return [];
      }
      return data || [];
    },
  });

  const filtered = logs.filter((log: any) => 
    (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
    (log.profiles?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track administrative actions and system changes.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-background" 
            placeholder="Search by action or admin email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> System Logs</CardTitle>
          <CardDescription>Recent actions performed by administrators.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="border-b">
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Timestamp</th>
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Admin</th>
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Action</th>
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-48" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                      <ShieldAlert className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="font-medium">No audit logs found</p>
                      <p className="text-xs mt-1">Logs will appear here once administrators perform actions.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 whitespace-nowrap text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <div className="font-medium">{log.profiles?.first_name} {log.profiles?.last_name}</div>
                        <div className="text-xs text-muted-foreground">{log.profiles?.email}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="capitalize text-[11px] tracking-wide">
                          {log.action.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <pre className="text-xs text-muted-foreground bg-muted/50 p-2 rounded max-w-md overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
