import { PublicLayout } from "@/components/PublicLayout";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useCmsPageBySlug } from "@/hooks/useCmsData";

export default function RiskDisclosure() {
  const { data: page, isLoading } = useCmsPageBySlug("risk-disclosure");

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="bg-muted py-16 md:py-20 border-b">
        <div className="container max-w-4xl animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-primary">
            {page?.title || "Risk Disclosure"}
          </h1>
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-background text-muted-foreground shadow-sm">
            Last updated: {page?.updated_at ? new Date(page.updated_at).toLocaleDateString() : "April 8, 2026"}
          </div>
        </div>
      </section>
      
      <section className="container py-16 max-w-4xl">
        <div className="rounded-xl border-2 border-destructive/30 bg-destructive/5 p-6 mb-10 flex items-start gap-4 animate-fade-in-up" style={{ animationDelay: "150ms" }}>
          <AlertTriangle className="h-6 w-6 text-destructive shrink-0 mt-0.5" />
          <div>
            <h3 className="font-heading font-semibold text-foreground mb-1 text-lg">Important Notice</h3>
            <p className="text-muted-foreground leading-relaxed">Trading and investing in Forex, Cryptocurrencies, and Commodities involves substantial risk of loss and is not suitable for every investor. You should carefully consider whether trading is suitable for you in light of your financial condition.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-[250px_1fr] gap-10">
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-2 p-4 bg-muted/30 rounded-xl border animate-fade-in-up" style={{ animationDelay: "200ms" }}>
              <h3 className="font-heading font-semibold mb-3">Contents</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#market-risk" className="hover:text-primary transition-colors">1. Market Risk</a></li>
                <li><a href="#crypto-risks" className="hover:text-primary transition-colors">2. Cryptocurrency Risks</a></li>
                <li><a href="#forex-risks" className="hover:text-primary transition-colors">3. Forex Risks</a></li>
                <li><a href="#commodities-risks" className="hover:text-primary transition-colors">4. Commodities Risks</a></li>
                <li><a href="#copy-trading-risks" className="hover:text-primary transition-colors">5. Copy Trading Risks</a></li>
                <li><a href="#liquidity-risk" className="hover:text-primary transition-colors">6. Liquidity Risk</a></li>
                <li><a href="#technology-risk" className="hover:text-primary transition-colors">7. Technology Risk</a></li>
                <li><a href="#regulatory-risk" className="hover:text-primary transition-colors">8. Regulatory Risk</a></li>
                <li><a href="#no-guaranteed-returns" className="hover:text-primary transition-colors">9. No Guaranteed Returns</a></li>
                <li><a href="#seek-advice" className="hover:text-primary transition-colors">10. Seek Professional Advice</a></li>
              </ul>
            </div>
          </div>
          
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-semibold animate-fade-in-up" style={{ animationDelay: "300ms" }}>
            {page?.content ? (
              <div dangerouslySetInnerHTML={{ __html: page.content }} />
            ) : (
              <>
                <h2 id="market-risk" className="text-2xl mt-0">1. Market Risk</h2>
                <p className="text-muted-foreground leading-relaxed">Financial markets are subject to significant volatility. The value of Forex, Cryptocurrency, and Commodities investments can fluctuate rapidly and unpredictably. You may lose some or all of your invested capital. Past performance is not indicative of future results.</p>

                <h2 id="crypto-risks" className="text-2xl">2. Cryptocurrency Risks</h2>
                <p className="text-muted-foreground leading-relaxed">Cryptocurrencies are highly volatile and speculative. They are subject to regulatory changes, technological vulnerabilities, market manipulation, and liquidity risks. The value of digital assets can drop to zero. Cryptocurrency transactions are irreversible once confirmed on the blockchain.</p>

                <h2 id="forex-risks" className="text-2xl">3. Forex Risks</h2>
                <p className="text-muted-foreground leading-relaxed">Foreign exchange trading involves leverage, which can amplify both gains and losses. Exchange rates are influenced by geopolitical events, economic indicators, interest rate changes, and other factors beyond our control. Leveraged trading can result in losses exceeding your initial investment.</p>

                <h2 id="commodities-risks" className="text-2xl">4. Commodities Risks</h2>
                <p className="text-muted-foreground leading-relaxed">Commodity prices are affected by supply and demand dynamics, weather patterns, geopolitical tensions, government policies, and global economic conditions. Commodities can experience extreme price swings over short periods.</p>

                <h2 id="copy-trading-risks" className="text-2xl">5. Copy Trading Risks</h2>
                <p className="text-muted-foreground leading-relaxed">Copy trading does not guarantee profits. The performance of traders you copy may deteriorate without warning. Past trader performance, win rates, and ROI figures are historical and may not be replicated. You remain fully responsible for the outcome of copied trades.</p>

                <h2 id="liquidity-risk" className="text-2xl">6. Liquidity Risk</h2>
                <p className="text-muted-foreground leading-relaxed">Certain markets or assets may experience reduced liquidity, making it difficult to execute trades at desired prices. This can result in slippage, delayed execution, or inability to close positions.</p>

                <h2 id="technology-risk" className="text-2xl">7. Technology Risk</h2>
                <p className="text-muted-foreground leading-relaxed">Online platforms are subject to system failures, cyber attacks, and connectivity issues. While we implement robust security measures, we cannot guarantee uninterrupted service. Users should not invest funds they cannot afford to lose due to potential technical issues.</p>

                <h2 id="regulatory-risk" className="text-2xl">8. Regulatory Risk</h2>
                <p className="text-muted-foreground leading-relaxed">Financial regulations vary by jurisdiction and are subject to change. Regulatory actions may impact the availability of certain investment products, restrict trading activities, or affect the value of your investments.</p>

                <h2 id="no-guaranteed-returns" className="text-2xl">9. No Guaranteed Returns</h2>
                <p className="text-muted-foreground leading-relaxed">AssetVault does not guarantee any returns on investments. ROI projections shown on the platform are estimates based on historical data and market conditions. Actual returns may differ significantly from projections.</p>

                <h2 id="seek-advice" className="text-2xl">10. Seek Professional Advice</h2>
                <p className="text-muted-foreground leading-relaxed">Before making any investment decisions, we strongly recommend consulting with a qualified financial advisor who can assess your individual circumstances, risk tolerance, and investment goals.</p>
              </>
            )}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
