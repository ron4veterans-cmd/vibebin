import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold tracking-tight">
              VibeBin
            </span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted hover:text-foreground transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium bg-accent text-background px-4 py-2 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-tight max-w-3xl mx-auto">
            Never lose a good prompt again
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed">
            The simple place for AI builders and vibe coders to save, organize,
            and reuse their best prompts and agent configs.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto text-base font-medium bg-accent text-background px-8 py-3 rounded-lg hover:bg-accent-hover transition-colors"
            >
              Start for free
            </Link>
            <p className="text-sm text-muted">
              25 prompts free · No credit card required
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="border-t border-border bg-surface">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="grid md:grid-cols-3 gap-10">
              <div>
                <h3 className="text-lg font-medium mb-2">Save instantly</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Paste any prompt or agent config. Add a title, tags, and a
                  short note. Done in seconds.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Find fast</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Full-text search and tags so you can pull up the exact prompt
                  you need without scrolling through old chats.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">One-click reuse</h3>
                <p className="text-muted text-sm leading-relaxed">
                  Copy to clipboard and paste straight into ChatGPT, Claude,
                  Cursor, or any other tool.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t border-border">
          <div className="max-w-5xl mx-auto px-6 py-20">
            <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-12">
              Simple, honest pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Free */}
              <div className="border border-border rounded-xl p-6 bg-surface">
                <h3 className="text-lg font-medium">Free</h3>
                <p className="mt-2 text-3xl font-semibold">$0</p>
                <ul className="mt-6 space-y-3 text-sm text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    Up to 25 prompts & agent configs
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    Tags and search
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    One-click copy
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="mt-8 block w-full text-center text-sm font-medium border border-border rounded-lg py-2.5 hover:bg-background transition-colors"
                >
                  Get started
                </Link>
              </div>

              {/* Pro */}
              <div className="border border-accent/40 rounded-xl p-6 bg-surface relative">
                <div className="absolute -top-3 left-6 bg-accent text-background text-xs font-medium px-2.5 py-0.5 rounded-full">
                  Most popular
                </div>
                <h3 className="text-lg font-medium">Pro</h3>
                <p className="mt-2 text-3xl font-semibold">
                  $7<span className="text-base font-normal text-muted">/mo</span>
                </p>
                <p className="text-sm text-muted mt-1">or $69/year</p>
                <ul className="mt-6 space-y-3 text-sm text-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    Unlimited prompts & agent configs
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    Collections & folders
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    Public share links
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success mt-0.5">✓</span>
                    Export (JSON / Markdown)
                  </li>
                </ul>
                <Link
                  href="/login"
                  className="mt-8 block w-full text-center text-sm font-medium bg-accent text-background rounded-lg py-2.5 hover:bg-accent-hover transition-colors"
                >
                  Start Pro
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>© {new Date().getFullYear()} VibeBin. All rights reserved.</p>
          <p>Built for AI builders and vibe coders.</p>
        </div>
      </footer>
    </div>
  );
}
