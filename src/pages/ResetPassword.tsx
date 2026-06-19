import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check, CheckCircle2 } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; general?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session && !window.location.hash.includes("type=recovery")) {
        toast({
          title: "Invalid Link",
          description: "The password reset link is invalid or has expired.",
          variant: "destructive"
        });
        navigate("/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setErrors({});
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (!password) return score;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthColor = 
    passwordStrength === 0 ? "bg-muted" :
    passwordStrength === 1 ? "bg-destructive" :
    passwordStrength === 2 ? "bg-warning" :
    passwordStrength === 3 ? "bg-primary" : "bg-success";

  const strengthLabel = 
    passwordStrength === 0 ? "" :
    passwordStrength === 1 ? "Weak" :
    passwordStrength === 2 ? "Fair" :
    passwordStrength === 3 ? "Good" : "Strong";

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: { password?: string; confirmPassword?: string; general?: string } = {};
    if (password.length < 8) newErrors.password = "Password must be at least 8 characters long.";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (updateError) {
      setErrors({ general: updateError.message });
      toast({
        title: "Update Failed",
        description: updateError.message,
        variant: "destructive"
      });
    } else {
      setSuccess(true);
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthLayout 
      title={success ? "Password Updated" : "Set New Password"} 
      subtitle={success ? "Your password has been successfully updated." : "Please enter your new strong password below."}
    >
      {success ? (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
          </div>
          <Button className="w-full" size="lg" asChild>
            <Link to="/login">Proceed to Log In</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-5 animate-fade-in-up" onSubmit={handleUpdatePassword} noValidate>
          {errors.general && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md mb-4">
              {errors.general}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>New Password</Label>
            <PasswordInput 
              id="password"
              placeholder="••••••••" 
              value={password} 
              onChange={e => {
                setPassword(e.target.value);
                if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
              }} 
              className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
            
            {/* Password Strength Meter */}
            {password.length > 0 && (
              <div className="space-y-1 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Password strength</span>
                  <span className={`font-medium ${passwordStrength < 2 ? 'text-destructive' : passwordStrength === 4 ? 'text-success' : 'text-foreground'}`}>{strengthLabel}</span>
                </div>
                <div className="flex gap-1 h-1.5">
                  {[1, 2, 3, 4].map((index) => (
                    <div 
                      key={index} 
                      className={`flex-1 rounded-full transition-all duration-300 ${index <= passwordStrength ? strengthColor : 'bg-muted'}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground pt-1 space-y-1">
                  <div className="flex items-center gap-1.5"><Check className={`h-3 w-3 ${password.length >= 8 ? 'text-success' : 'text-muted-foreground/30'}`} /> 8+ characters</div>
                  <div className="flex items-center gap-1.5"><Check className={`h-3 w-3 ${/[A-Z]/.test(password) ? 'text-success' : 'text-muted-foreground/30'}`} /> Uppercase letter</div>
                  <div className="flex items-center gap-1.5"><Check className={`h-3 w-3 ${/[0-9]/.test(password) ? 'text-success' : 'text-muted-foreground/30'}`} /> Number</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className={errors.confirmPassword ? "text-destructive" : ""}>Confirm Password</Label>
            <PasswordInput 
              id="confirmPassword"
              placeholder="••••••••" 
              value={confirmPassword} 
              onChange={e => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: undefined }));
              }} 
              className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.confirmPassword && <p className="text-xs text-destructive mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button className="w-full" type="submit" size="lg" disabled={loading || password.length < 8}>
            {loading ? "Updating Password..." : "Update Password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
