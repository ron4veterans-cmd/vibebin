export default function TermsPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Terms of Service</h1>
      <p className="mt-4 text-muted text-sm">Last updated: October 21, 2026</p>
      <div className="mt-8 space-y-4 text-sm text-muted">
        <p>VibeBin is a personal prompt and agent vault. By using the service you agree to these 
terms.</p>
        <p>You may store prompts and agent configurations for your own use. Do not upload illegal or 
harmful content.</p>
        <p>Free accounts are limited to 25 prompts. Pro accounts ($7/month or $69/year) remove the 
limit.</p>
        <p>You can cancel Pro at any time. Access continues until the end of the billing period.</p>
        <p>We may suspend accounts that abuse the service. Contact support if you have questions.</p>
      </div>
    </div>
  );
}
