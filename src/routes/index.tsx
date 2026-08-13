import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Quiet Ledger — Plain-English Side Income Reporting" },
      {
        name: "description",
        content:
          "Calm, plain-English writing about how regular people quietly add extra income online. No magic buttons, no hype.",
      },
      { property: "og:title", content: "The Quiet Ledger — Plain-English Side Income Reporting" },
      {
        property: "og:description",
        content:
          "Calm, plain-English writing about how regular people quietly add extra income online. No magic buttons, no hype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-cardline/70">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <span className="font-serif text-lg font-bold">The Quiet Ledger</span>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            Free premium read
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-12">
        <h1 className="font-serif text-3xl leading-tight font-bold sm:text-4xl">
          Quiet writing about money that keeps working when you're not.
        </h1>
        <p className="mt-4 text-[17px] leading-[1.7] text-ink/80">
          No magic buttons. No "get rich tomorrow" promises. Just plain-English explanations
          of how regular people are adding extra income online.
        </p>

        <Link
          to="/deep"
          className="mt-8 block rounded-2xl border border-cardline bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        >
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
            Side income
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold">
            Your Side Hustle Is Making You Tired, Not Rich. Here's What Quietly Works On
            Autopilot.
          </h2>
          <p className="mt-3 text-sm text-ink/55">By The Quiet Ledger Desk • 7 min read</p>
        </Link>
      </main>

      <footer className="border-t border-cardline/70">
        <div className="mx-auto max-w-2xl space-y-2 px-5 py-8 text-sm text-ink/55">
          <p>© {year} The Quiet Ledger. Sponsored offers fund free access to this content.</p>
          <p>
            <Link to="/privacy" className="underline hover:text-brand">
              Privacy policy
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
