import { PublicLayout } from "@/components/PublicLayout";

export default function TermsOfService() {
  return (
    <PublicLayout>
      <section className="bg-muted py-16 md:py-20 border-b">
        <div className="container max-w-4xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary">Terms of Service</h1>
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
                <li><a href="#acceptance" className="hover:text-primary transition-colors">1. Acceptance of Terms</a></li>
                <li><a href="#eligibility" className="hover:text-primary transition-colors">2. Eligibility</a></li>
                <li><a href="#account" className="hover:text-primary transition-colors">3. Account Registration</a></li>
                <li><a href="#services" className="hover:text-primary transition-colors">4. Investment Services</a></li>
                <li><a href="#copy-trading" className="hover:text-primary transition-colors">5. Copy Trading</a></li>
                <li><a href="#deposits" className="hover:text-primary transition-colors">6. Deposits & Withdrawals</a></li>
                <li><a href="#compliance" className="hover:text-primary transition-colors">7. KYC/AML Compliance</a></li>
                <li><a href="#prohibited" className="hover:text-primary transition-colors">8. Prohibited Activities</a></li>
                <li><a href="#liability" className="hover:text-primary transition-colors">9. Limitation of Liability</a></li>
                <li><a href="#modifications" className="hover:text-primary transition-colors">10. Modifications</a></li>
                <li><a href="#contact" className="hover:text-primary transition-colors">11. Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-semibold animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            <h2 id="acceptance" className="text-2xl mt-0">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">By accessing or using AssetVault, you agree to be bound by these Terms of Service. If you do not agree, you may not use our platform. These terms apply to all users, including investors, traders, and visitors.</p>

            <h2 id="eligibility" className="text-2xl">2. Eligibility</h2>
            <p className="text-muted-foreground leading-relaxed">You must be at least 18 years old and legally permitted to engage in financial activities in your jurisdiction. By creating an account, you represent that you meet these requirements and that all information provided is accurate.</p>

            <h2 id="account" className="text-2xl">3. Account Registration</h2>
            <p className="text-muted-foreground leading-relaxed">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access. AssetVault is not liable for losses resulting from unauthorized use of your account.</p>

            <h2 id="services" className="text-2xl">4. Investment Services</h2>
            <p className="text-muted-foreground leading-relaxed">AssetVault provides access to investment plans in Forex, Crypto, and Commodities. All investments carry inherent risk. Past performance does not guarantee future results. Returns described on the platform are projected estimates and not guarantees.</p>

            <h2 id="copy-trading" className="text-2xl">5. Copy Trading</h2>
            <p className="text-muted-foreground leading-relaxed">Copy trading allows you to replicate strategies of professional traders. You acknowledge that copy trading involves risk and that the performance of copied traders may vary. Minimum balance requirements apply and are set at the platform's discretion.</p>

            <h2 id="deposits" className="text-2xl">6. Deposits and Withdrawals</h2>
            <p className="text-muted-foreground leading-relaxed">All deposits must be made through approved payment methods. Deposits remain pending until verified by our administrative team. Withdrawals are subject to KYC verification and processing times. AssetVault reserves the right to delay or decline transactions for security or compliance reasons.</p>

            <h2 id="compliance" className="text-2xl">7. KYC/AML Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">AssetVault complies with Know Your Customer (KYC) and Anti-Money Laundering (AML) regulations. You agree to provide valid identification documents and cooperate with verification processes. Failure to complete KYC may limit account functionality.</p>

            <h2 id="prohibited" className="text-2xl">8. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed">You may not use AssetVault for money laundering, fraud, or any illegal activity. Manipulation of the platform, automated scraping, or interference with platform operations is strictly prohibited.</p>

            <h2 id="liability" className="text-2xl">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">AssetVault is not liable for investment losses, market fluctuations, or service interruptions beyond our reasonable control. Our total liability shall not exceed the amount you have deposited on the platform.</p>

            <h2 id="modifications" className="text-2xl">10. Modifications</h2>
            <p className="text-muted-foreground leading-relaxed">We reserve the right to modify these terms at any time. Material changes will be communicated via email or platform notification. Continued use after modifications constitutes acceptance.</p>

            <h2 id="contact" className="text-2xl">11. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">For questions about these Terms, contact us at <a href="mailto:legal@assetvault.com" className="text-primary hover:underline">legal@assetvault.com</a>.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
