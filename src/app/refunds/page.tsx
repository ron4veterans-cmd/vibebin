import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy – VibeBin",
};

export default function RefundsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Refund Policy</h1>
      <p className="mt-4 text-muted text-sm"><strong>Last updated:</strong> November 1, 2026</p>
      <div className="mt-8 space-y-8 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-foreground">Eligibility</h2>
          <div className="mt-2 space-y-2">
            <p>If you are not satisfied with a paid VibeBin subscription, you may request a refund within <strong>5 business days</strong> of the initial purchase or renewal, provided you have not substantially used the paid features.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">How to Request a Refund</h2>
          <div className="mt-2 space-y-2">
            <p>Email <a href="mailto:info@vibebin.app" className="underline underline-offset-2 hover:text-foreground transition-colors">info@vibebin.app</a> with:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>The email address on your account</li>
              <li>The date of purchase</li>
              <li>A brief reason for the request</li>
            </ul>
            <p>We will review requests and respond within a few business days. Approved refunds are processed through Paddle and typically appear on your statement within 5–10 business days.</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Exceptions</h2>
          <div className="mt-2 space-y-2">
            <p>Refunds are generally not available for:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Purchases older than 5 business days</li>
              <li>Accounts that have been terminated for violation of our Terms of Service</li>
              <li>Partial billing periods after the refund window</li>
            </ul>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Subscription Cancellation</h2>
          <div className="mt-2 space-y-2">
            <p>You can cancel your subscription at any time. Cancellation stops future billing but does not automatically refund the current period (unless you qualify under the 5-business-day window above).</p>
          </div>
        </section>
        <section>
          <h2 className="text-base font-semibold text-foreground">Contact</h2>
          <div className="mt-2 space-y-2">
            <p>Questions about refunds? Reach us at <a href="mailto:info@vibebin.app" className="underline underline-offset-2 hover:text-foreground transition-colors">info@vibebin.app</a>.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
