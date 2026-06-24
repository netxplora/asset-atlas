import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import heroContact from "@/assets/hero-contact.jpg";
import { useCmsBrandSettings, useAppSettings } from "@/hooks/useCmsData";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { data: brand } = useCmsBrandSettings();
  const { data: contactData } = useAppSettings("contact_content");

  const content = {
    hero_title: contactData?.hero_title || "Contact Us",
    hero_subtitle: contactData?.hero_subtitle || "Have questions? Our team is here to help you with anything you need.",
    business_hours: contactData?.business_hours || "Mon-Fri: 9AM - 6PM EST"
  };

  const validateForm = (formData: FormData) => {
    const newErrors: { [key: string]: string } = {};
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || name.trim().length < 2) newErrors.name = "Name must be at least 2 characters.";
    if (!email || !/^\\S+@\\S+\\.\\S+$/.test(email)) newErrors.email = "Please enter a valid email address.";
    if (!subject || subject.trim().length < 5) newErrors.subject = "Subject must be at least 5 characters.";
    if (!message || message.trim().length < 10) newErrors.message = "Message must be at least 10 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!validateForm(formData)) return;
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: "Message Sent", description: "We'll get back to you within 24 hours." });
      (e.target as HTMLFormElement).reset();
      setErrors({});
    }, 1000);
  };

  return (
    <PublicLayout>
      <SEOHead title="Contact Us" description="Get in touch with the AssetVault team for support, business inquiries, and partnership opportunities." path="/contact" />
      <section className="relative min-h-[350px] flex items-center">
        <div className="absolute inset-0">
          <img src={heroContact} alt="Contact Us" className="w-full h-full object-cover" width={1920} height={640} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/45" />
        </div>
        <div className="container relative z-10 py-16 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">{content.hero_title}</h1>
          <p className="text-white/80 max-w-xl mx-auto text-lg">{content.hero_subtitle}</p>
        </div>
      </section>

      <section className="py-16">
        <div className="container grid lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: brand?.support_email || brand?.contact_email || "support@assetvault.com" },
              { icon: Phone, label: "Phone", value: brand?.contact_phone || "+1 (800) 555-0199" },
              { icon: MapPin, label: "Address", value: brand?.address || "350 Financial District, New York, NY" },
              { icon: Clock, label: "Business Hours", value: content.business_hours },
            ].map((c, i) => (
              <Card key={c.label} className="group hover:shadow-md transition-all duration-300 hover:border-primary/50 animate-slide-in-right" style={{ animationDelay: `${i * 100}ms` }}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <c.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">{c.label}</div>
                    <div className="font-medium text-sm group-hover:text-primary transition-colors">{c.value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="lg:col-span-2 shadow-lg border-primary/10 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <CardContent className="p-6 md:p-8">
              <h2 className="text-2xl font-heading font-bold mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className={errors.name ? "text-destructive" : ""}>Name</Label>
                    <Input id="name" name="name" placeholder="Your name" className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""} aria-invalid={!!errors.name} />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>Email</Label>
                    <Input id="email" name="email" type="email" placeholder="your@email.com" className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""} aria-invalid={!!errors.email} />
                    {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className={errors.subject ? "text-destructive" : ""}>Subject</Label>
                  <Input id="subject" name="subject" placeholder="How can we help?" className={errors.subject ? "border-destructive focus-visible:ring-destructive" : ""} aria-invalid={!!errors.subject} />
                  {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message" className={errors.message ? "text-destructive" : ""}>Message</Label>
                  <Textarea id="message" name="message" rows={5} placeholder="Tell us more..." className={`resize-none ${errors.message ? "border-destructive focus-visible:ring-destructive" : ""}`} aria-invalid={!!errors.message} />
                  {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                </div>
                <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto">
                  {loading ? "Sending Message..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
