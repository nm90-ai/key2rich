import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Quiet Ledger" },
      {
        name: "description",
        content:
          "How The Quiet Ledger handles visitor data, sponsored offers and affiliate links.",
      },
      { property: "og:title", content: "Privacy Policy — The Quiet Ledger" },
      {
        property: "og:description",
        content:
          "How The Quiet Ledger handles visitor data, sponsored offers and affiliate links.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  const year = new Date().getFullYear();
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-cardline/70">
        <div className="mx-auto max-w-2xl px-5 py-4">
          <Link to="/" className="font-serif text-lg font-bold">
            The Quiet Ledger
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl space-y-5 px-5 py-10 text-[17px] leading-[1.7] text-ink/90">
        <h1 className="font-serif text-3xl font-bold">Privacy Policy</h1>
        <p>
          We record basic, non-personal visit information — the traffic source, the page
          version you saw and the tracking identifier attached to your link — so we can tell
          which articles are worth keeping free.
        </p>
        <p>
          We do not collect names, email addresses or payment details on this site. Sponsored
          offers shown in the unlock step are operated by third parties who have their own
          privacy policies.
        </p>
        <p>
          Some links on this site are affiliate links. If you sign up through one, we may earn
          a commission at no extra cost to you.
        </p>
        <p>
          Questions? Reply to the source that sent you here and we'll pick it up.
        </p>
      </main>
      <footer className="border-t border-cardline/70">
        <div className="mx-auto max-w-2xl px-5 py-8 text-sm text-ink/55">
          © {year} The Quiet Ledger.
        </div>
      </footer>
    </div>
  );
}
