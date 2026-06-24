import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldAlert, History, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const ACTION_COLORS: Record<string, string> = {
  CREATED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  UPDATED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  DELETED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  APPROVED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  REJECTED: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

function getActionColor(action: string) {
  const upper = (action || "").toUpperCase();
  for (const key of Object.keys(ACTION_COLORS)) {
    if (upper.startsWith(key)) return ACTION_COLORS[key];
  }
  return "bg-muted text-muted-foreground border-border";
}

function getTableLabel(action: string) {
  const upper = (action || "").toUpperCase();
  if (upper.includes("CMS_PAGES")) return "Page";
  if (upper.includes("CMS_BLOG_POSTS")) return "Blog";
  if (upper.includes("CMS_FAQS")) return "FAQ";
  if (upper.includes("CMS_ANNOUNCEMENTS")) return "Announcement";
  if (upper.includes("CMS_BRAND_SETTINGS")) return "Brand";
  if (upper.includes("APP_SETTINGS")) return "Settings";
  if (upper.includes("DEPOSIT")) return "Deposit";
  if (upper.includes("WITHDRAWAL")) return "Withdrawal";
  if (upper.includes("USER") || upper.includes("PROFILE")) return "User";
  if (upper.includes("INVESTMENT")) return "Investment";
  return null;
}

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ["adminAuditLogs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("admin_audit_logs")
        .select("*, profiles:admin_id(first_name, last_name, email)")
        .order("created_at", { ascending: false })
        .limit(200);
      
      if (error) {
        console.warn("Audit logs table might not exist yet", error);
        return [];
      }
      return data || [];
    },
  });

  const filtered = logs.filter((log: any) => {
    const matchesSearch = 
      (log.action || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.profiles?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (log.target_id || "").toLowerCase().includes(search.toLowerCase());
    
    if (filterCategory === "all") return matchesSearch;
    if (filterCategory === "cms") {
      return matchesSearch && (
        (log.action || "").toUpperCase().includes("CMS_") ||
        (log.action || "").toUpperCase().includes("APP_SETTINGS")
      );
    }
    if (filterCategory === "financial") {
      return matchesSearch && (
        (log.action || "").toUpperCase().includes("DEPOSIT") ||
        (log.action || "").toUpperCase().includes("WITHDRAWAL") ||
        (log.action || "").toUpperCase().includes("INVESTMENT")
      );
    }
    if (filterCategory === "user") {
      return matchesSearch && (
        (log.action || "").toUpperCase().includes("USER") ||
        (log.action || "").toUpperCase().includes("PROFILE") ||
        (log.action || "").toUpperCase().includes("ROLE")
      );
    }
    return matchesSearch;
  });

  const cmsCount = logs.filter((l: any) => 
    (l.action || "").toUpperCase().includes("CMS_") || (l.action || "").toUpperCase().includes("APP_SETTINGS")
  ).length;
  const financialCount = logs.filter((l: any) => 
    (l.action || "").toUpperCase().includes("DEPOSIT") || (l.action || "").toUpperCase().includes("WITHDRAWAL")
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Track administrative actions and system changes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setFilterCategory("all")}>
          <CardContent className="py-4 px-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Logs</p>
              <p className="text-2xl font-bold">{logs.length}</p>
            </div>
            {filterCategory === "all" && <div className="h-2 w-2 rounded-full bg-primary" />}
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setFilterCategory("cms")}>
          <CardContent className="py-4 px-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">CMS Actions</p>
              <p className="text-2xl font-bold">{cmsCount}</p>
            </div>
            {filterCategory === "cms" && <div className="h-2 w-2 rounded-full bg-primary" />}
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setFilterCategory("financial")}>
          <CardContent className="py-4 px-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Financial</p>
              <p className="text-2xl font-bold">{financialCount}</p>
            </div>
            {filterCategory === "financial" && <div className="h-2 w-2 rounded-full bg-primary" />}
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setFilterCategory("user")}>
          <CardContent className="py-4 px-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">User Mgmt</p>
              <p className="text-2xl font-bold">{logs.length - cmsCount - financialCount}</p>
            </div>
            {filterCategory === "user" && <div className="h-2 w-2 rounded-full bg-primary" />}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg flex items-center gap-2"><History className="h-5 w-5 text-primary" /> System Logs</CardTitle>
              <CardDescription>Recent actions performed by administrators. Showing {filtered.length} of {logs.length} entries.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9 bg-background h-9 text-sm" 
                  placeholder="Search actions, emails..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[130px] h-9">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="cms">CMS Only</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="user">User Mgmt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr className="border-b">
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Timestamp</th>
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Admin</th>
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Action</th>
                  <th className="p-4 font-medium uppercase text-xs tracking-wider">Target</th>
                  <th className="p-4 font-medium uppercase text-xs tracking-wider w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="p-4"><Skeleton className="h-4 w-8" /></td>
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      <ShieldAlert className="h-8 w-8 mx-auto text-muted-foreground/30 mb-2" />
                      <p className="font-medium">No audit logs found</p>
                      <p className="text-xs mt-1">Logs will appear here once administrators perform actions.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((log: any) => {
                    const isExpanded = expandedRow === log.id;
                    const tableLabel = getTableLabel(log.action);

                    return (
                      <>
                        <tr key={log.id} className="hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setExpandedRow(isExpanded ? null : log.id)}>
                          <td className="p-4 whitespace-nowrap text-muted-foreground text-xs">
                            <div>{new Date(log.created_at).toLocaleDateString()}</div>
                            <div className="text-[10px]">{new Date(log.created_at).toLocaleTimeString()}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-medium text-sm">{log.profiles?.first_name} {log.profiles?.last_name}</div>
                            <div className="text-xs text-muted-foreground">{log.profiles?.email}</div>
                          </td>
                          <td className="p-4">
                            <Badge variant="outline" className={`text-[10px] tracking-wide font-semibold border ${getActionColor(log.action)}`}>
                              {(log.action || "").replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {tableLabel && (
                                <Badge variant="secondary" className="text-[10px]">{tableLabel}</Badge>
                              )}
                              <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]" title={log.target_id}>
                                {log.target_id ? log.target_id.substring(0, 8) + '...' : '—'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {isExpanded 
                              ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                              : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            }
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${log.id}-details`} className="bg-muted/20">
                            <td colSpan={5} className="p-4">
                              <div className="max-w-2xl">
                                <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Raw Details</p>
                                <pre className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg overflow-x-auto max-h-60 border">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
