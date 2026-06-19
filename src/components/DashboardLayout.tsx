import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { 
  LayoutDashboard, TrendingUp, Copy, Wallet, ArrowDownToLine, 
  Briefcase, History, User, Bell, LogOut, Menu, ChevronLeft, ChevronRight, Settings, ChevronRight as BreadcrumbSeparatorIcon
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationPopover } from "@/components/NotificationPopover";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { ChatWidget } from "@/components/ChatWidget";
import logo from "@/assets/logo.png";
import { useSyncInvestorDashboard } from "@/hooks/useSupabaseData";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SEOHead } from "@/components/SEOHead";

const navGroups = [
  {
    title: "Platform",
    items: [
      { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Financials",
    items: [
      { label: "Investments", to: "/dashboard/investments", icon: TrendingUp },
      { label: "Copy Trading", to: "/dashboard/copy-trading", icon: Copy },
      { label: "Portfolio", to: "/dashboard/portfolio", icon: Briefcase },
    ]
  },
  {
    title: "Transfers",
    items: [
      { label: "Deposit", to: "/dashboard/deposit", icon: Wallet },
      { label: "Withdraw", to: "/dashboard/withdraw", icon: ArrowDownToLine },
      { label: "Transactions", to: "/dashboard/transactions", icon: History },
    ]
  },
  {
    title: "Account",
    items: [
      { label: "Profile", to: "/dashboard/profile", icon: User },
      { label: "Notifications", to: "/dashboard/notifications", icon: Bell },
    ]
  }
];

const routeLabels: Record<string, string> = {
  "/dashboard": "Overview",
  "/dashboard/investments": "Investments",
  "/dashboard/copy-trading": "Copy Trading",
  "/dashboard/deposit": "Deposit Funds",
  "/dashboard/withdraw": "Withdraw Funds",
  "/dashboard/portfolio": "My Portfolio",
  "/dashboard/transactions": "Transaction History",
  "/dashboard/profile": "Profile & Settings",
  "/dashboard/notifications": "Notifications",
};

function SidebarNav({ onNavigate, collapsed = false }: { onNavigate?: () => void, collapsed?: boolean }) {
  const location = useLocation();
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    onNavigate?.();
  };

  return (
    <>
      <div className={`p-4 border-b border-sidebar-border ${collapsed ? 'flex justify-center' : ''}`}>
        <Link to="/" className={`flex items-center gap-3 font-bold text-xl ${collapsed ? 'justify-center' : ''}`} onClick={onNavigate}>
          <img src={logo} alt="AssetVault" className="h-8 w-8 rounded-lg object-contain shrink-0" />
          {!collapsed && <span className="font-heading tracking-tight">AssetVault</span>}
        </Link>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden px-3 space-y-6">
        {navGroups.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            {!collapsed && (
              <div className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link key={item.to} to={item.to} onClick={onNavigate} title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 group relative
                    ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}
                    ${active ? "bg-sidebar-accent text-sidebar-primary shadow-sm" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"}`}>
                  {active && !collapsed && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-sidebar-primary rounded-r-md" />
                  )}
                  <item.icon className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} ${active ? 'text-sidebar-primary' : 'text-sidebar-foreground/50 group-hover:text-sidebar-foreground transition-colors'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border mt-auto space-y-1.5">
        {isAdmin && (
          <Link to="/admin" onClick={onNavigate} title={collapsed ? "Admin Portal" : undefined}
            className={`flex items-center gap-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 group
            ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`}>
            <Settings className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} text-sidebar-foreground/50 group-hover:text-sidebar-foreground transition-colors`} />
            {!collapsed && <span>Admin Portal</span>}
          </Link>
        )}
        <button onClick={handleLogout} title={collapsed ? "Log Out" : undefined} 
          className={`flex items-center gap-3 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 w-full group
          ${collapsed ? 'justify-center p-2' : 'px-3 py-2.5'}`}>
          <LogOut className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'} group-hover:text-destructive transition-colors`} /> 
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </>
  );
}

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useSyncInvestorDashboard();

  const initials = profile ? `${(profile.first_name || "")[0] || ""}${(profile.last_name || "")[0] || ""}`.toUpperCase() || "U" : "U";
  const fullName = profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User" : "User";
  const currentLabel = routeLabels[location.pathname] || "Dashboard";

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-muted/30">
      <SEOHead title={`${currentLabel} — Dashboard`} noIndex={true} />
      <aside className={`hidden lg:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 relative ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        <SidebarNav collapsed={collapsed} />
        <Button 
          variant="outline" 
          size="icon" 
          className="absolute -right-4 top-6 h-8 w-8 rounded-full bg-background border-border shadow-sm z-10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </aside>
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden shrink-0 h-10 w-10"><Menu className="h-6 w-6" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0 bg-sidebar text-sidebar-foreground border-r-0">
                <div className="flex flex-col h-full"><SidebarNav onNavigate={() => setOpen(false)} /></div>
              </SheetContent>
            </Sheet>
            
            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center text-sm font-medium text-muted-foreground">
              <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
              {location.pathname !== '/dashboard' && (
                <>
                  <BreadcrumbSeparatorIcon className="h-4 w-4 mx-2 text-muted-foreground/50 shrink-0" />
                  <span className="text-foreground">{currentLabel}</span>
                </>
              )}
            </nav>
            <h2 className="font-heading font-semibold text-lg sm:hidden">{currentLabel}</h2>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <NotificationPopover />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 focus-visible:ring-offset-2 p-0 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt={fullName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold">{initials}</div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{fullName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/profile" className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>Profile & Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/investments" className="cursor-pointer flex items-center">
                    <Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>My Investments</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 lg:p-8 overflow-auto bg-muted/20"><Outlet /></main>
        <ChatWidget />
      </div>
    </div>
  );
}
