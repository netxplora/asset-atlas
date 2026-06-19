import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MailCheck } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);
    // Call Supabase to send reset email
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    setLoading(false);
    setSubmitted(true);
    
    if (resetError) {
      // In a real production scenario, you might want to log this error to a monitoring service,
      // but we shouldn't expose it to the user to prevent email enumeration.
      console.error("Password reset error:", resetError.message);
    }
    
    // Always show a generic success message for security purposes
    toast({ 
      title: "Reset Link Sent", 
      description: "If an account exists, a reset link has been sent to your email." 
    });
  };

  return (
    <AuthLayout 
      title={submitted ? "Check Your Email" : "Forgot Password"} 
      subtitle={submitted ? "We've sent a password reset link to your email address." : "Enter your email to receive a password reset link."}
    >
      {submitted ? (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg text-sm text-center border">
            If an account exists for <strong className="text-foreground">{email}</strong>, a reset link has been sent. Please check your inbox and spam folder.
          </div>
          <div className="space-y-3 pt-4">
            <Button className="w-full" size="lg" asChild>
              <Link to="/login">Return to Log In</Link>
            </Button>
            <Button variant="outline" className="w-full" size="lg" onClick={() => setSubmitted(false)}>
              Try another email
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-5 animate-fade-in-up" onSubmit={handleReset} noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className={error ? "text-destructive" : ""}>Email address</Label>
            <Input 
              id="email"
              type="email" 
              placeholder="your@email.com" 
              value={email} 
              onChange={e => {
                setEmail(e.target.value);
                if (error) setError(undefined);
              }} 
              className={error ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
          <Button className="w-full" type="submit" size="lg" disabled={loading}>
            {loading ? "Sending Link..." : "Send Reset Link"}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground mt-6">
            Remember your password? <Link to="/login" className="text-primary font-medium hover:underline">Log In</Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
