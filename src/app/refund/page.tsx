export default function RefundPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-semibold">Refund Policy</h1>
      <p className="mt-4 text-muted text-sm">Last updated: October 21, 2026</p>
      <div className="mt-8 space-y-4 text-sm text-muted">
        <p>Pro subscriptions can be canceled at any time. You will retain access until the end of the 
current billing period.</p>
        <p>If you are unsatisfied, contact support within 14 days of purchase for a full refund.</p>
        <p>Refunds are processed through Paddle and may take several days to appear.</p>
      </div>
    </div>
  );
}
