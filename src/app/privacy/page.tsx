import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Notice – VibeBin",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Privacy Notice</h1>
      <p className="mt-4 text-muted text-sm"><strong>Last updated:</strong> November 1, 2026</p>
      <div className="mt-8 space-y-8 text-sm text-muted leading-relaxed">
        <p>This Privacy Notice explains how VibeBin (“we”) collects, uses, and protects information when you use VibeBin.</p>
        <section>
          <h2 className="text-base font-semibold text-foreground">1. Information We Collect</h2>
          <div className="mt-2 space-y-2">
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>Account information</strong>: email address, name (if provided), and authentication details</li>
              <li><strong>Usage data</strong>: content you save, features you use, and basic interaction logs</li>
              <li><strong>Payment information</strong>: handled entirely by Paddle; we do not store full payment card details</li>
              <li><strong>Technical data</strong>: IP address, browser type, and device information for security and performance</li>
            </ul>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">2. How We Use Information</h2>
          <div className="mt-2 space-y-2">
            <p>We use your information to:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Provide and improve the Service</li>
              <li>Authenticate your account and process subscriptions</li>
              <li>Communicate with you about your account or important updates</li>
              <li>Protect the security and integrity of the Service</li>
            </ul>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">3. Sharing</h2>
          <div className="mt-2 space-y-2">
            <p>We do not sell your personal information. We may share data with:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Service providers (e.g., hosting on Vercel, authentication, payment processing via Paddle) who process data on our behalf</li>
              <li>Authorities when required by law</li>
            </ul>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">4. Data Retention</h2>
          <div className="mt-2 space-y-2">
            <p>We retain your data for as long as your account is active or as needed to provide the Service and comply with legal obligations. You can request deletion of your account and associated data.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">5. Your Rights</h2>
          <div className="mt-2 space-y-2">
            <p>Depending on your location, you may have rights to access, correct, delete, or export your data, or to object to certain processing. Contact us to exercise these rights.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">6. Security</h2>
          <div className="mt-2 space-y-2">
            <p>We use industry-standard measures to protect your information. No method of transmission or storage is 100% secure.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">7. Changes</h2>
          <div className="mt-2 space-y-2">
            <p>We may update this Privacy Notice. We will post the new version on this page with an updated date.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
          <div className="mt-2 space-y-2">
            <p>For privacy questions or requests, email <a href="mailto:info@vibebin.app" className="underline underline-offset-2 hover:text-foreground transition-colors">info@vibebin.app</a>.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
