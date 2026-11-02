import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service – VibeBin",
};

export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="mt-4 text-muted text-sm"><strong>Last updated:</strong> November 1, 2026</p>
      <div className="mt-8 space-y-8 text-sm text-muted leading-relaxed">
        <p>These Terms of Service (“Terms”) govern your use of VibeBin (“the Service”), operated by VibeBin (“we”, “us”, or “our”). By accessing or using the Service, you agree to these Terms.</p>
        <section>
          <h2 className="text-base font-semibold text-foreground">1. The Service</h2>
          <div className="mt-2 space-y-2">
            <p>VibeBin helps you save, organize, and reuse prompts, ideas, and related content. Features may change over time.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">2. Accounts</h2>
          <div className="mt-2 space-y-2">
            <p>You are responsible for maintaining the security of your account and for all activity that occurs under it. You must provide accurate information when creating an account.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">3. Acceptable Use</h2>
          <div className="mt-2 space-y-2">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to the Service or other users’ data</li>
              <li>Upload content that infringes intellectual property rights or is harmful, abusive, or unlawful</li>
              <li>Reverse engineer, scrape, or interfere with the Service</li>
            </ul>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">4. Content</h2>
          <div className="mt-2 space-y-2">
            <p>You retain ownership of the content you upload. By uploading content, you grant us a limited license to store, display, and process it solely to provide the Service to you.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">5. Subscriptions and Payments</h2>
          <div className="mt-2 space-y-2">
            <p>Paid features are billed through Paddle. Prices, billing cycles, and available plans are shown at the time of purchase. All fees are non-refundable except as stated in our Refund Policy or required by law.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">6. Termination</h2>
          <div className="mt-2 space-y-2">
            <p>We may suspend or terminate your access if you violate these Terms. You may cancel your account at any time.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">7. Disclaimer</h2>
          <div className="mt-2 space-y-2">
            <p>The Service is provided “as is.” We do not guarantee uninterrupted or error-free operation. AI-generated suggestions or outputs are not guaranteed to be accurate.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">8. Limitation of Liability</h2>
          <div className="mt-2 space-y-2">
            <p>To the maximum extent permitted by law, we are not liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">9. Changes</h2>
          <div className="mt-2 space-y-2">
            <p>We may update these Terms. Continued use after changes constitutes acceptance of the new Terms.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">10. Contact</h2>
          <div className="mt-2 space-y-2">
            <p>Questions? Email us at <a href="mailto:info@vibebin.app" className="underline underline-offset-2 hover:text-foreground transition-colors">info@vibebin.app</a>.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
