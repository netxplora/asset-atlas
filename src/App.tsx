import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SkipToContent } from "@/components/SkipToContent";
import { BackToTop } from "@/components/BackToTop";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Lazy-loaded page imports for code splitting
const Index = lazy(() => import("./pages/Index"));
const About = lazy(() => import("./pages/About"));
const Plans = lazy(() => import("./pages/Plans"));
const CopyTrading = lazy(() => import("./pages/CopyTrading"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RiskDisclosure = lazy(() => import("./pages/RiskDisclosure"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Dashboard pages
const DashboardLayout = lazy(() => import("./components/DashboardLayout"));
const DashboardOverview = lazy(() => import("./pages/dashboard/Overview"));
const Investments = lazy(() => import("./pages/dashboard/Investments"));
const DashboardCopyTrading = lazy(() => import("./pages/dashboard/CopyTrading"));
const Deposit = lazy(() => import("./pages/dashboard/Deposit"));
const Withdraw = lazy(() => import("./pages/dashboard/Withdraw"));
const Portfolio = lazy(() => import("./pages/dashboard/Portfolio"));
const Transactions = lazy(() => import("./pages/dashboard/Transactions"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const Notifications = lazy(() => import("./pages/dashboard/Notifications"));

// Admin pages
const AdminLayout = lazy(() => import("./components/AdminLayout"));
const AdminOverview = lazy(() => import("./pages/admin/Overview"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminPlans = lazy(() => import("./pages/admin/Plans"));
const AdminTraders = lazy(() => import("./pages/admin/Traders"));
const AdminTransactions = lazy(() => import("./pages/admin/Transactions"));
const AdminDeposits = lazy(() => import("./pages/admin/Deposits"));
const AdminWithdrawals = lazy(() => import("./pages/admin/Withdrawals"));
const AdminWallets = lazy(() => import("./pages/admin/Wallets"));
const AdminKYC = lazy(() => import("./pages/admin/KYC"));
const AdminSettings = lazy(() => import("./pages/admin/Settings"));
const AdminLogin = lazy(() => import("./pages/admin/Login"));
const AdminSupport = lazy(() => import("./pages/admin/Support"));

const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const App = () => (
  <HelmetProvider>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <SkipToContent />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/copy-trading" element={<CopyTrading />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/risk-disclosure" element={<RiskDisclosure />} />
                
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardOverview />} />
                  <Route path="investments" element={<Investments />} />
                  <Route path="copy-trading" element={<DashboardCopyTrading />} />
                  <Route path="deposit" element={<Deposit />} />
                  <Route path="withdraw" element={<Withdraw />} />
                  <Route path="portfolio" element={<Portfolio />} />
                  <Route path="transactions" element={<Transactions />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="notifications" element={<Notifications />} />
                </Route>

                <Route 
                  path="/admin" 
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index element={<AdminOverview />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="audit" element={<AdminAuditLogs />} />
                  <Route path="plans" element={<AdminPlans />} />
                  <Route path="traders" element={<AdminTraders />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="deposits" element={<AdminDeposits />} />
                  <Route path="withdrawals" element={<AdminWithdrawals />} />
                  <Route path="wallets" element={<AdminWallets />} />
                  <Route path="kyc" element={<AdminKYC />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="support" element={<AdminSupport />} />
                </Route>

              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
            <BackToTop />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
  </HelmetProvider>
);

export default App;
