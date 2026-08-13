import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import heroImage from "@/assets/hero-split.jpg";
import heroImageMobile from "@/assets/hero-split-mobile.jpg";
import unlockImage from "@/assets/unlock-card.jpg";
import unlockImageMobile from "@/assets/unlock-card-mobile.jpg";
import { recordVisit } from "@/lib/tracking.functions";
import {
  hasCompletionCookie,
  hasSuccessParam,
  isUnlocked,
  launchLocker,
  lockerSrc,
  persistUnlock,
  readTrackingParams,
  watchForCompletion,
  type Variant,
} from "@/lib/quiet-ledger";
import {
  SectionAdvantageA,
  SectionAdvantageB,
  SectionAffiliate,
  SectionHighTicket,
  SectionHowToStart,
  SectionLastHonestThing,
  SectionNotTechy,
  SectionOpening,
  SectionRealProblemA,
  SectionRealProblemB,
} from "./sections";

export const HEADLINE =
  "Your Side Hustle Is Making You Tired, Not Rich. Here's What Quietly Works On Autopilot.";
export const SUBTITLE =
  "No magic buttons. No 'get rich tomorrow' promises. Just a plain-English explanation of how regular people are quietly adding extra income online.";

const DEEP_TEASER =
  "Curious if your country made the hidden-advantage list? It's in the very next section — and it's one of the biggest reasons beginners from the US, UK, Canada and Australia are quietly winning right now. Unlock it free below.";
const SHALLOW_TEASER =
  "The model has a name. And it's the exact reason beginners from the US, UK, Canada and Australia are quietly collecting $500–$1,000 commissions while everyone else grinds. How it works — and your country's hidden advantage — is unlocked free below.";

const BLURRED_PREVIEW = [
  "Affiliate Marketing, Explained Like You're 12",
  "Why 'High-Ticket' Changes the Whole Game",
  "Your Country's Hidden Advantage",
  "How to Start Without Wasting Money",
];

export function LedgerPage({ variant }: { variant: Variant }) {
  const [subid, setSubid] = useState<string>("");
  const [unlocked, setUnlocked] = useState(false);
  const [heroPassed, setHeroPassed] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const sendVisit = useServerFn(recordVisit);
  const showSticky = heroPassed && !cardVisible;

  useEffect(() => {
    const params = readTrackingParams(variant);
    setSubid(params.subid);
    try {
      window.localStorage.setItem("ql_subid", params.subid);
    } catch {
      /* ignore */
    }
    if (isUnlocked(params.subid) || hasCompletionCookie() || hasSuccessParam()) {
      setUnlocked(true);
      persistUnlock(params.subid);
    }
    void sendVisit({ data: params }).catch(() => undefined);
  }, [variant, sendVisit]);

  useEffect(() => {
    if (!subid) return;
    return watchForCompletion(() => {
      persistUnlock(subid);
      setUnlocked(true);
    });
  }, [subid]);

  useEffect(() => {
    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      setHeroPassed(hero.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the two unlock CTAs mutually exclusive: the sticky bar hides while the
  // unlock card is on screen.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) {
      setCardVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setCardVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: "-40px 0px -80px 0px", threshold: 0 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, [unlocked, variant]);

  // Warm the locker CDN early (DNS + TLS + cached script) so the overlay opens
  // in ~1s on click. The script itself is only executed after a click.
  useEffect(() => {
    if (!subid) return;
    const idle =
      window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    idle(() => {
      const pre = document.createElement("link");
      pre.rel = "preconnect";
      pre.href = "https://optilinklock.com";
      pre.crossOrigin = "anonymous";
      document.head.appendChild(pre);

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.as = "script";
      link.href = lockerSrc(subid);
      document.head.appendChild(link);
    });
  }, [subid]);

  const onUnlock = useCallback(() => {
    // Never no-op on an early click: fall back to computing the subid inline
    // if the tracking effect hasn't committed state yet.
    launchLocker(subid || readTrackingParams(variant).subid);
  }, [subid, variant]);

  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-cardline/70">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-4">
          <Link to="/" className="font-serif text-lg font-bold tracking-tight">
            The Quiet Ledger
          </Link>
          <span className="rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            Free premium read
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pt-8 pb-28">
        <div ref={heroRef}>
          <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-brand uppercase">
            Side income · United States edition
          </p>
          <h1 className="font-serif text-3xl leading-tight font-bold sm:text-[2.6rem]">
            {HEADLINE}
          </h1>
          <p className="mt-4 text-[17px] leading-[1.7] text-ink/80">{SUBTITLE}</p>
          <p className="mt-4 text-sm text-ink/55">By The Quiet Ledger Desk • 7 min read</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-ink/70">
            <span className="rounded-full border border-cardline bg-white px-3 py-1">
              🇺🇸 Written for US readers
            </span>
            <span className="rounded-full border border-cardline bg-white px-3 py-1">
              💵 Paid in USD
            </span>
            <span className="rounded-full border border-cardline bg-white px-3 py-1">
              ⚡ No experience needed
            </span>
          </div>


          <figure className="mt-6 -mx-5 sm:mx-0">
            <div className="relative overflow-hidden rounded-none shadow-lg sm:rounded-2xl">
              <picture>
                <source media="(max-width: 639px)" srcSet={heroImageMobile} />
                <img
                  src={heroImage}
                  alt="Split screen: an exhausted delivery rider at night beside the same person relaxed at a laptop with rising earnings"
                  width={1600}
                  height={912}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover object-center sm:aspect-[16/9]"
                />
              </picture>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <div className="mb-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
                    Free to read
                  </span>
                  <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                    2 min to unlock
                  </span>
                </div>
                <p className="font-serif text-lg leading-snug font-bold text-white sm:text-xl">
                  Same hours. Completely different paycheck.
                </p>
              </div>
            </div>
          </figure>
        </div>

        <article className="mt-8">
          <SectionOpening />
          <SectionRealProblemA />

          {variant === "deep" && (
            <>
              <SectionRealProblemB />
              <SectionAffiliate />
              <SectionHighTicket />
              <SectionNotTechy />
            </>
          )}

          {/* Teaser box */}
          <div className="my-8 rounded-xl border border-peachline bg-peach p-5">
            <p className="text-[17px] leading-[1.7] text-ink/90">
              {variant === "deep" ? DEEP_TEASER : SHALLOW_TEASER}
            </p>
          </div>

          {variant === "deep" && <SectionAdvantageA />}

          {variant === "shallow" && !unlocked && (
            <div
              aria-hidden="true"
              className="my-8 space-y-3 select-none"
              style={{ filter: "blur(3px)", opacity: 0.5 }}
            >
              {BLURRED_PREVIEW.map((title) => (
                <p key={title} className="font-serif text-xl font-bold">
                  🔒 {title}
                </p>
              ))}
            </div>
          )}

          {!unlocked && (
            <section
              ref={cardRef}
              className="my-8 rounded-2xl border border-cardline bg-white p-5 shadow-md sm:p-6"
            >
              <div className="relative mb-5 overflow-hidden rounded-xl">
                <picture>
                  <source media="(max-width: 639px)" srcSet={unlockImageMobile} />
                  <img
                    src={unlockImage}
                    alt="A person at a laptop at night seeing a locked earnings balance"
                    width={1200}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover object-center sm:aspect-[3/2]"
                  />
                </picture>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                  🔒 Rest of the article locked
                </span>
              </div>
              <h2 className="font-serif text-2xl font-bold">Continue reading — free</h2>
              <p className="mt-2 text-[17px] leading-[1.7] text-ink/80">
                Complete one quick sponsor offer to unlock the rest of this article
                instantly. No payment, no subscription — that's what keeps this read free.
              </p>
              <ul className="mt-4 space-y-1.5 text-[15px] text-ink/70">
                <li>✅ Takes about 1–2 minutes</li>
                <li>✅ No payment, no card, no subscription</li>
                <li>✅ Unlocks instantly on this device</li>
              </ul>
              <button
                type="button"
                onClick={onUnlock}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-brand to-brand/80 px-6 py-4 text-lg font-bold tracking-tight text-white shadow-lg shadow-brand/25 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                🔓 Unlock The Rest — It's Free
              </button>
              <p className="mt-2 text-center text-xs text-ink/50">
                Free access · No credit card · Instant unlock
              </p>

              <div id="locker-container" />
              <noscript>
                Please enable JavaScript to access this page.
                <meta
                  httpEquiv="refresh"
                  content="0;url=https://optilinklock.com/help/enable_javascript.php?lkt=1"
                />
              </noscript>
            </section>
          )}

          {unlocked && (
            <>
              {variant === "shallow" && (
                <>
                  <SectionRealProblemB />
                  <SectionAffiliate />
                  <SectionHighTicket />
                  <SectionNotTechy />
                  <SectionAdvantageA />
                </>
              )}
              <SectionAdvantageB />
              <SectionHowToStart />
              <SectionLastHonestThing />
            </>
          )}
        </article>
      </main>

      {!unlocked && showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-cardline bg-paper/95 p-3 backdrop-blur">
          <button
            type="button"
            onClick={onUnlock}
            className="mx-auto block w-full max-w-2xl rounded-xl bg-gradient-to-r from-brand to-brand/80 px-6 py-4 text-lg font-bold tracking-tight text-white shadow-lg shadow-brand/25 transition-transform active:scale-[0.99]"
          >
            🔓 Unlock The Rest — Free
          </button>

        </div>
      )}

      <footer className="border-t border-cardline/70">
        <div className="mx-auto max-w-2xl space-y-2 px-5 py-8 text-sm text-ink/55">
          <p>© {year} The Quiet Ledger. Sponsored offers fund free access to this content.</p>
          <p>Some links on this page are affiliate links. They cost you nothing extra.</p>
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
