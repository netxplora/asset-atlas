import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setLoading(false);
      toast({ title: "Login Failed", description: error.message, variant: "destructive" });
      return;
    } 

    // Check if the user is an admin via profiles.role
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      setLoading(false);
      if (profile?.role === "admin") {
        toast({ title: "Welcome back, Admin!" });
        navigate("/admin");
      } else {
        // Sign out if not an admin using the admin portal
        await supabase.auth.signOut();
        toast({ title: "Access Denied", description: "You are not authorized to access the admin portal.", variant: "destructive" });
      }
    }
  };

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center py-12">
        <Card className="w-full max-w-md border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.05)]">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center bg-primary/10 text-primary p-3 rounded-full mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <h1 className="text-2xl font-bold">Admin Portal Login</h1>
              <p className="text-sm text-muted-foreground">Secure access to AssetVault Admin</p>
            </div>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div className="space-y-2"><Label>Admin Email</Label><Input type="email" placeholder="admin@assetvault.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Password</Label><PasswordInput placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
              <Button className="w-full" type="submit" disabled={loading}>{loading ? "Authenticating..." : "Login to Admin Portal"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
