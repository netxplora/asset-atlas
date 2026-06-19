import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (!formData.password) return score;
    if (formData.password.length >= 8) score += 1;
    if (/[A-Z]/.test(formData.password)) score += 1;
    if (/[0-9]/.test(formData.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(formData.password)) score += 1;
    return score;
  }, [formData.password]);

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

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Please enter a valid email address.";
    if (!formData.password || formData.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    if (!termsAccepted) newErrors.terms = "You must accept the terms to continue.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: { data: { first_name: formData.firstName, last_name: formData.lastName } },
    });
    setLoading(false);
    
    if (error) {
      toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Account Created", description: "Please check your email to verify your account." });
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    }
  };

  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Start your investment journey with AssetVault today."
    >
      <form className="space-y-5" onSubmit={handleRegister} noValidate>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className={errors.firstName ? "text-destructive" : ""}>First Name</Label>
            <Input 
              id="firstName" name="firstName" placeholder="John" 
              value={formData.firstName} onChange={handleChange} 
              className={errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className={errors.lastName ? "text-destructive" : ""}>Last Name</Label>
            <Input 
              id="lastName" name="lastName" placeholder="Doe" 
              value={formData.lastName} onChange={handleChange} 
              className={errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Email</Label>
          <Input 
            id="email" name="email" type="email" placeholder="your@email.com" 
            value={formData.email} onChange={handleChange} 
            className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className={errors.password ? "text-destructive" : ""}>Password</Label>
          <PasswordInput 
            id="password" name="password" placeholder="••••••••" 
            value={formData.password} onChange={handleChange} 
            className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
          
          {/* Password Strength Meter */}
          {formData.password.length > 0 && (
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
                <div className="flex items-center gap-1.5"><Check className={`h-3 w-3 ${formData.password.length >= 8 ? 'text-success' : 'text-muted-foreground/30'}`} /> 8+ characters</div>
                <div className="flex items-center gap-1.5"><Check className={`h-3 w-3 ${/[A-Z]/.test(formData.password) ? 'text-success' : 'text-muted-foreground/30'}`} /> Uppercase letter</div>
                <div className="flex items-center gap-1.5"><Check className={`h-3 w-3 ${/[0-9]/.test(formData.password) ? 'text-success' : 'text-muted-foreground/30'}`} /> Number</div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-start space-x-2 pt-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted} 
              onCheckedChange={(c) => {
                setTermsAccepted(c as boolean);
                if (errors.terms) setErrors(prev => ({ ...prev, terms: undefined }));
              }} 
            />
            <div className="grid gap-1.5 leading-none">
              <label htmlFor="terms" className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${errors.terms ? "text-destructive" : ""}`}>
                Accept terms and conditions
              </label>
              <p className="text-sm text-muted-foreground">
                You agree to our <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </div>
          </div>
          {errors.terms && <p className="text-xs text-destructive ml-6">{errors.terms}</p>}
        </div>

        <Button className="w-full" type="submit" size="lg" disabled={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground mt-6">
        Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Log In</Link>
      </div>
    </AuthLayout>
  );
}
