import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserTransactions } from "@/hooks/useSupabaseData";
import { useState } from "react";
import { Search, Download, ArrowUpRight, ArrowDownRight, RefreshCw, FileText } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Transactions() {
  const { data: transactions = [], isLoading } = useUserTransactions();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredTransactions = transactions.filter((tx: any) => {
    const matchesTab = activeTab === "all" || tx.type === activeTab;
    const matchesSearch = 
      tx.type.toLowerCase().includes(searchQuery.toLowerCase()) || 
      tx.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.amount.toString().includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': 
        return <Badge className="bg-success/10 text-success hover:bg-success/20 border-success/20">Completed</Badge>;
      case 'pending': 
        return <Badge className="bg-warning/10 text-warning hover:bg-warning/20 border-warning/20">Pending</Badge>;
      case 'failed': 
      case 'cancelled':
        return <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20 capitalize">{status}</Badge>;
      default: 
        return <Badge variant="outline" className="capitalize">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'deposit': 
        return <div className="h-8 w-8 rounded-full bg-success/10 flex items-center justify-center shrink-0"><ArrowDownRight className="h-4 w-4 text-success" /></div>;
      case 'withdrawal': 
        return <div className="h-8 w-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0"><ArrowUpRight className="h-4 w-4 text-destructive" /></div>;
      case 'investment':
        return <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><RefreshCw className="h-4 w-4 text-primary" /></div>;
      default: 
        return <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0"><FileText className="h-4 w-4 text-muted-foreground" /></div>;
    }
  };

  const handleExport = () => {
    // Basic CSV export
    if (transactions.length === 0) return;
    
    const headers = ["Date", "Type", "Amount", "Status", "ID"];
    const csvContent = [
      headers.join(","),
      ...filteredTransactions.map((tx: any) => 
        `"${format(new Date(tx.created_at), 'yyyy-MM-dd HH:mm')}","${tx.type}","${tx.amount}","${tx.status}","${tx.id}"`
      )
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `assetvault_transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold font-heading">Transaction History</h1>
          <p className="text-muted-foreground text-sm mt-1">View and manage all your deposits, withdrawals, and investments.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isLoading || filteredTransactions.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid grid-cols-4 w-full md:w-[400px]">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="deposit">Deposits</TabsTrigger>
                <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
                <TabsTrigger value="investment">Investments</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search transactions..."
                className="pl-9 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[250px]">Transaction</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-4 w-24" /></div></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                      No transactions found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((tx: any) => {
                    const isPositive = ["deposit", "roi"].includes(tx.type);
                    
                    return (
                      <TableRow key={tx.id} className="group transition-colors hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {getTypeIcon(tx.type)}
                            <div className="font-medium capitalize">{tx.type}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                            <span className="text-muted-foreground block text-xs mt-0.5">
                              {format(new Date(tx.created_at), 'h:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                            {tx.id.substring(0, 8)}...
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(tx.status)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          <span className={isPositive ? "text-success" : tx.type === 'withdrawal' ? "text-foreground" : "text-foreground"}>
                            {isPositive ? "+" : tx.type === 'withdrawal' ? "-" : ""}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
