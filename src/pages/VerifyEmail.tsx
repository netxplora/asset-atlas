import { AuthLayout } from "@/components/AuthLayout";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { MailOpen, ArrowRight } from "lucide-react";

export default function VerifyEmail() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const email = searchParams.get('email') || 'your email address';

  return (
    <AuthLayout 
      title="Verify Your Email" 
      subtitle="We need to verify your email address before you can start investing."
    >
      <div className="space-y-8 animate-fade-in-up">
        <div className="flex justify-center mb-2">
          <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center border-4 border-background shadow-sm">
            <MailOpen className="h-10 w-10 text-primary" />
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            We've sent a verification link to <strong className="text-foreground">{email}</strong>. 
            Please check your inbox and click the link to activate your account.
          </p>
          
          <div className="p-4 bg-muted/50 rounded-lg text-sm border text-left">
            <h4 className="font-semibold mb-2 text-foreground">Didn't receive an email?</h4>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Check your spam or junk folder</li>
              <li>Ensure the email address provided is correct</li>
              <li>Wait a few minutes, as some emails may be delayed</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <Button className="w-full" size="lg" asChild>
            <Link to="/login">Go to Log In <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
          
          <div className="text-center text-sm text-muted-foreground pt-4">
            Need to use a different email? <Link to="/register" className="text-primary font-medium hover:underline">Sign up again</Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
