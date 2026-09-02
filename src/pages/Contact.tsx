import { useState } from "react";
import { PublicLayout } from "@/components/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Phone, Clock, Send, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SEOHead } from "@/components/SEOHead";
import { useCmsBrandSettings, useAppSettings } from "@/hooks/useCmsData";

import heroContact from "@/assets/hero-contact.jpg";

export default function Contact() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const { data: brand } = useCmsBrandSettings();
  const { data: contactData } = useAppSettings("contact_content");

  const content = {
    hero_title: contactData?.hero_title || "Contact Client Support",
    hero_subtitle: contactData?.hero_subtitle || "Our support team is available 24/7 to assist you with accounts, deposits, and platform inquiries.",
    business_hours: contactData?.business_hours || "24/7 Global Live Support"
  };

  const validateForm = (formData: FormData) => {
    const newErrors: { [key: string]: string } = {};
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    if (!name || name.trim().length < 2) newErrors.name = "Name must be at least 2 characters.";
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Please enter a valid email address.";
    if (!subject || subject.trim().length < 4) newErrors.subject = "Subject must be at least 4 characters.";
    if (!message || message.trim().length < 10) newErrors.message = "Message must be at least 10 characters.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!validateForm(formData)) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast({
        title: "Message Received",
        description: "Your inquiry has been submitted. A support representative will respond shortly."
      });
      form.reset();
      setErrors({});
    }, 900);
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Contact Client Support - AssetVault"
        description="Reach the AssetVault support team for inquiries regarding accounts, cryptocurrency deposits, copy trading, or technical assistance."
        path="/contact"
      />

      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-20 lg:py-28 border-b overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroContact} alt="Contact AssetVault" className="w-full h-full object-cover opacity-40 hero-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        </div>
        <div className="container text-left space-y-4 max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold uppercase tracking-wider text-slate-300 border border-white/15 backdrop-blur-sm">
            24/7 Assistance
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold tracking-tight text-white drop-shadow-md">
            {content.hero_title}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed drop-shadow-md max-w-2xl">
            {content.hero_subtitle}
          </p>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="py-16 lg:py-20">
        <div className="container grid lg:grid-cols-3 gap-8">
          {/* Contact Details Column */}
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Client Inquiries", value: brand?.support_email || brand?.contact_email || "support@assetvault.com" },
              { icon: Phone, label: "Direct Phone", value: brand?.contact_phone || "+1 (800) 277-3882" },
              { icon: MapPin, label: "Primary Office", value: brand?.address || "Financial District, New York, NY 10005" },
              { icon: Clock, label: "Support Schedule", value: content.business_hours },
            ].map((c) => (
              <Card key={c.label} className="border border-border shadow-elevation-sm bg-card hover:border-primary/40 transition-colors">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground font-medium">{c.label}</div>
                    <div className="font-heading font-semibold text-sm text-foreground mt-0.5">{c.value}</div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card className="border border-border bg-muted/40 shadow-elevation-sm">
              <CardContent className="p-5 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Verified Response Guarantee
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Support tickets and email inquiries are logged with timestamps and assigned to specialized client specialists.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Inquiry Form Column */}
          <Card className="lg:col-span-2 border border-border shadow-elevation-md bg-card">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-2xl font-heading font-bold text-foreground mb-6">
                Submit an Inquiry
              </h2>

              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-fade-in">
                  <div className="h-14 w-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-heading font-bold text-foreground">Message Dispatched</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Thank you for contacting AssetVault. Our compliance and support team will respond via your provided email address shortly.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs font-semibold text-foreground">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full legal name"
                        className={`h-11 text-xs sm:text-sm bg-background ${errors.name ? "border-destructive" : ""}`}
                      />
                      {errors.name && <p className="text-[11px] text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs font-semibold text-foreground">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="name@example.com"
                        className={`h-11 text-xs sm:text-sm bg-background ${errors.email ? "border-destructive" : ""}`}
                      />
                      {errors.email && <p className="text-[11px] text-destructive">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs font-semibold text-foreground">Subject</Label>
                    <Input
                      id="subject"
                      name="subject"
                      placeholder="e.g. Deposit Confirmation, Verification Inquiry"
                      className={`h-11 text-xs sm:text-sm bg-background ${errors.subject ? "border-destructive" : ""}`}
                    />
                    {errors.subject && <p className="text-[11px] text-destructive">{errors.subject}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs font-semibold text-foreground">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      placeholder="Please provide details regarding your request..."
                      className={`resize-none text-xs sm:text-sm bg-background ${errors.message ? "border-destructive" : ""}`}
                    />
                    {errors.message && <p className="text-[11px] text-destructive">{errors.message}</p>}
                  </div>

                  <Button type="submit" size="lg" disabled={loading} className="w-full sm:w-auto font-semibold shadow-sm">
                    {loading ? "Transmitting..." : "Send Inquiry"} <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </PublicLayout>
  );
}
