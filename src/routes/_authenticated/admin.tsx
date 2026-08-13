import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { getAdminStats } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — The Quiet Ledger" },
      { name: "description", content: "Traffic, conversions and A/B results." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const SOURCES = ["all", "tb", "coin", "fc"] as const;
const VARIANTS = ["all", "deep", "shallow"] as const;

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function AdminPage() {
  const navigate = useNavigate();
  const fetchStats = useServerFn(getAdminStats);
  const [source, setSource] = useState<(typeof SOURCES)[number]>("all");
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => fetchStats(),
    refetchInterval: 60_000,
  });

  const groups = useMemo(
    () =>
      (data?.groups ?? []).filter(
        (g) =>
          (source === "all" || g.source === source) &&
          (variant === "all" || g.variant === variant),
      ),
    [data, source, variant],
  );

  const recent = useMemo(
    () =>
      (data?.recent ?? []).filter(
        (c) =>
          (source === "all" || c.source === source) &&
          (variant === "all" || c.page_variant === variant),
      ),
    [data, source, variant],
  );

  const totals = useMemo(() => {
    const visits = groups.reduce((s, g) => s + g.visits, 0);
    const conversions = groups.reduce((s, g) => s + g.conversions, 0);
    const payout = groups.reduce((s, g) => s + g.payout, 0);
    return {
      visits,
      conversions,
      payout,
      rate: visits ? (conversions / visits) * 100 : 0,
    };
  }, [groups]);

  const logout = async () => {
    await supabase.auth.signOut();
    void navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="border-b border-cardline/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <span className="font-serif text-lg font-bold">The Quiet Ledger · Dashboard</span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-cardline px-3 py-1.5 text-sm hover:bg-white"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8">
        {error && (
          <p className="mb-6 rounded-xl border border-cardline bg-white p-4 text-sm text-brand">
            {(error as Error).message === "Forbidden"
              ? "This account is not allowed to view the dashboard."
              : "Could not load stats. Try refreshing."}
          </p>
        )}

        <div className="mb-6 flex flex-wrap gap-2">
          {SOURCES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSource(s)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                source === s
                  ? "border-brand bg-brand text-white"
                  : "border-cardline bg-white text-ink/70"
              }`}
            >
              {s === "all" ? "All sources" : s}
            </button>
          ))}
          <span className="w-full sm:hidden" />
          {VARIANTS.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVariant(v)}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                variant === v
                  ? "border-brand bg-brand text-white"
                  : "border-cardline bg-white text-ink/70"
              }`}
            >
              {v === "all" ? "All variants" : v}
            </button>
          ))}
        </div>

        <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Kpi label="Total visits" value={isLoading ? "…" : String(totals.visits)} />
          <Kpi
            label="Total conversions"
            value={isLoading ? "…" : String(totals.conversions)}
          />
          <Kpi label="Total payout (credited)" value={isLoading ? "…" : money(totals.payout)} />
          <Kpi
            label="Overall conv. rate"
            value={isLoading ? "…" : `${totals.rate.toFixed(2)}%`}
          />
        </div>

        <section className="mb-8 overflow-x-auto rounded-2xl border border-cardline bg-white">
          <h2 className="border-b border-cardline px-5 py-3 font-serif text-lg font-bold">
            A/B comparison
          </h2>
          <table className="w-full text-sm">
            <thead className="text-left text-ink/55">
              <tr>
                {["Source", "Variant", "Visits", "Conversions", "Conv. rate", "Payout"].map(
                  (h) => (
                    <th key={h} className="px-5 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={`${g.source}-${g.variant}`} className="border-t border-cardline/70">
                  <td className="px-5 py-2">{g.source}</td>
                  <td className="px-5 py-2">{g.variant}</td>
                  <td className="px-5 py-2">{g.visits}</td>
                  <td className="px-5 py-2">{g.conversions}</td>
                  <td className="px-5 py-2">
                    {g.visits ? ((g.conversions / g.visits) * 100).toFixed(2) : "0.00"}%
                  </td>
                  <td className="px-5 py-2">{money(g.payout)}</td>
                </tr>
              ))}
              {!groups.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-ink/55">
                    No data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="overflow-x-auto rounded-2xl border border-cardline bg-white">
          <h2 className="border-b border-cardline px-5 py-3 font-serif text-lg font-bold">
            Recent conversions
          </h2>
          <table className="w-full text-sm">
            <thead className="text-left text-ink/55">
              <tr>
                {["Time", "Source", "Variant", "Subid", "Payout", "Status", "TXID"].map(
                  (h) => (
                    <th key={h} className="px-5 py-2 font-medium">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {recent.map((c) => (
                <tr key={c.txid ?? c.created_at} className="border-t border-cardline/70">
                  <td className="px-5 py-2 whitespace-nowrap">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-2">{c.source}</td>
                  <td className="px-5 py-2">{c.page_variant}</td>
                  <td className="px-5 py-2" title={c.subid ?? ""}>
                    {(c.subid ?? "").slice(0, 22)}
                    {(c.subid ?? "").length > 22 ? "…" : ""}
                  </td>
                  <td className="px-5 py-2">{money(Number(c.payout ?? 0))}</td>
                  <td className="px-5 py-2">
                    <StatusBadge status={c.status ?? "pending"} />
                  </td>
                  <td className="px-5 py-2">{c.txid}</td>
                </tr>
              ))}
              {!recent.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-6 text-ink/55">
                    No conversions yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cardline bg-white p-4">
      <p className="text-xs tracking-wide text-ink/55 uppercase">{label}</p>
      <p className="mt-2 font-serif text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "credited"
      ? "bg-emerald-100 text-emerald-800"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>
  );
}
