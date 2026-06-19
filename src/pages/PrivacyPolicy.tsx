import { PublicLayout } from "@/components/PublicLayout";

export default function PrivacyPolicy() {
  return (
    <PublicLayout>
      <section className="bg-muted py-16 md:py-20 border-b">
        <div className="container max-w-4xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary">Privacy Policy</h1>
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background text-muted-foreground shadow-sm">
            Last updated: April 8, 2026
          </div>
        </div>
      </section>
      
      <section className="container py-16 max-w-4xl">
        <div className="grid md:grid-cols-[250px_1fr] gap-10">
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-2 p-4 bg-muted/30 rounded-xl border animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h3 className="font-heading font-semibold mb-3">Contents</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#information-we-collect" className="hover:text-primary transition-colors">1. Information We Collect</a></li>
                <li><a href="#how-we-use-your-information" className="hover:text-primary transition-colors">2. How We Use Information</a></li>
                <li><a href="#data-sharing" className="hover:text-primary transition-colors">3. Data Sharing</a></li>
                <li><a href="#data-security" className="hover:text-primary transition-colors">4. Data Security</a></li>
                <li><a href="#cookies" className="hover:text-primary transition-colors">5. Cookies and Tracking</a></li>
                <li><a href="#your-rights" className="hover:text-primary transition-colors">6. Your Rights</a></li>
                <li><a href="#data-retention" className="hover:text-primary transition-colors">7. Data Retention</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">8. Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-semibold animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <h2 id="information-we-collect" className="text-2xl mt-0">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">We collect personal information you provide when creating an account, including your name, email address, phone number, date of birth, and government-issued identification for KYC verification. We also collect financial data such as transaction history, wallet addresses, and investment activity.</p>
            <p className="text-muted-foreground leading-relaxed">We automatically collect device information, IP addresses, browser type, and usage analytics to improve our platform and ensure security.</p>

            <h2 id="how-we-use-your-information" className="text-2xl">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">Your information is used to provide and maintain our services, process transactions, verify your identity (KYC/AML compliance), communicate with you about your account, send notifications about deposit statuses and investment performance, improve our platform, and comply with legal obligations.</p>

            <h2 id="data-sharing" className="text-2xl">3. Data Sharing and Disclosure</h2>
            <p className="text-muted-foreground leading-relaxed">We do not sell your personal information. We may share data with trusted service providers who assist in platform operations, regulatory authorities when required by law, and financial institutions involved in processing your transactions. All third-party providers are contractually bound to protect your data.</p>

            <h2 id="data-security" className="text-2xl">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">We implement industry-standard security measures including encryption of data in transit and at rest, secure authentication protocols, regular security audits, and access controls. Despite our efforts, no system is 100% secure, and we encourage users to protect their credentials.</p>

            <h2 id="cookies" className="text-2xl">5. Cookies and Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">We use cookies and similar technologies to maintain your session, remember preferences, and analyze usage patterns. You may adjust cookie preferences in your browser settings.</p>

            <h2 id="your-rights" className="text-2xl">6. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">Depending on your jurisdiction, you may have rights to access, correct, delete, or port your personal data. To exercise these rights, contact our support team. We will respond within 30 days of receiving your request.</p>

            <h2 id="data-retention" className="text-2xl">7. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">We retain your data for as long as your account is active and as required by law. After account closure, we may retain certain records for regulatory compliance for a period of up to 7 years.</p>

            <h2 id="contact" className="text-2xl">8. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">For questions about this Privacy Policy, contact us at <a href="mailto:privacy@assetvault.com" className="text-primary hover:underline">privacy@assetvault.com</a> or through our Contact page.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
