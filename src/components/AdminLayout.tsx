import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard, Users, TrendingUp, Copy, History, 
  Shield, Settings, LogOut, Menu, Wallet, ArrowDownToLine, MessageCircle,
  ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft, FileText, Scale
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/logo.png";
import { useSyncAdminDashboard } from "@/hooks/useSupabaseData";
import { NotificationPopover } from "@/components/NotificationPopover";
import { Separator } from "@/components/ui/separator";
import { SEOHead } from "@/components/SEOHead";

const navGroups = [
  {
    label: "Dashboard",
    items: [
      { label: "Overview", to: "/admin", icon: LayoutDashboard },
      { label: "Support", to: "/admin/support", icon: MessageCircle },
    ],
  },
  {
    label: "Financial",
    items: [
      { label: "Deposits", to: "/admin/deposits", icon: Wallet },
      { label: "Withdrawals", to: "/admin/withdrawals", icon: ArrowDownToLine },
      { label: "Transactions", to: "/admin/transactions", icon: History },
      { label: "Wallets", to: "/admin/wallets", icon: Wallet },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Users", to: "/admin/users", icon: Users },
      { label: "Plans", to: "/admin/plans", icon: TrendingUp },
      { label: "Traders", to: "/admin/traders", icon: Copy },
      { label: "KYC", to: "/admin/kyc", icon: Shield },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Audit Logs", to: "/admin/audit", icon: History },
      { label: "Content & Pages", to: "/admin/content", icon: Copy },
      { label: "Blog Posts", to: "/admin/blog", icon: FileText },
      { label: "FAQs & Announce", to: "/admin/faqs", icon: MessageCircle },
      { label: "Legal Documents", to: "/admin/legal", icon: Scale },
      { label: "Brand & CMS", to: "/admin/brand", icon: Settings },
      { label: "Settings", to: "/admin/settings", icon: Settings },
    ],
  },
];

function SidebarNav({ collapsed = false, onNavigate }: { collapsed?: boolean; onNavigate?: () => void }) {
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
    onNavigate?.();
  };

  return (
    <>
      <div className={`p-4 border-b border-sidebar-border flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <Link to="/admin" className={`flex items-center font-bold text-lg ${collapsed ? '' : 'gap-3'}`} onClick={onNavigate}>
          <img src={logo} alt="Admin" className="h-9 w-auto object-contain shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Admin</span>}
        </Link>
      </div>

      <nav className="flex-1 p-2 space-y-4 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/40">
                {group.label}
              </div>
            )}
            {collapsed && <Separator className="my-2 opacity-30" />}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
                    } ${
                      active
                        ? "bg-sidebar-accent text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <item.icon className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        {!collapsed && profile && (
          <div className="px-3 py-2 mb-1">
            <div className="text-xs font-semibold truncate">{profile.first_name} {profile.last_name}</div>
            <div className="text-[10px] text-sidebar-foreground/50 truncate">{profile.email}</div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Back to Site" : undefined}
          className={`flex items-center gap-3 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all duration-200 w-full ${
            collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2'
          }`}
        >
          <LogOut className={`shrink-0 ${collapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
          {!collapsed && "Back to Site"}
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { profile } = useAuth();
  useSyncAdminDashboard();

  // Derive breadcrumb from current path
  const allItems = navGroups.flatMap(g => g.items);
  const currentPage = allItems.find(item => item.to === location.pathname);
  const pageTitle = currentPage?.label || "Admin";

  return (
    <div className="min-h-screen flex bg-muted/30">
      <SEOHead title={`${pageTitle} — Admin`} noIndex={true} />
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 ${
          collapsed ? 'w-[68px]' : 'w-64'
        }`}
      >
        <SidebarNav collapsed={collapsed} />
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-1.5 rounded-md text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-14 border-b bg-background flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 bg-sidebar text-sidebar-foreground">
                <div className="flex flex-col h-full">
                  <SidebarNav onNavigate={() => setMobileOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>

            <div>
              <h2 className="font-semibold font-heading text-base">{pageTitle}</h2>
              <p className="text-[11px] text-muted-foreground hidden sm:block">Administration Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationPopover />
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Admin" className="w-8 h-8 rounded-full object-cover ring-2 ring-border shadow-sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold shadow-sm">
                {profile ? `${(profile.first_name || '')[0] || ''}${(profile.last_name || '')[0] || ''}`.toUpperCase() || 'A' : 'A'}
              </div>
            )}
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 lg:p-6 overflow-auto"><Outlet /></main>
      </div>
    </div>
  );
}
