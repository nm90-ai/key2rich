import { createFileRoute } from "@tanstack/react-router";
import { HEADLINE, SUBTITLE, LedgerPage } from "@/components/quiet-ledger/LedgerPage";

export const Route = createFileRoute("/shallow")({
  head: () => ({
    meta: [
      { title: HEADLINE },
      { name: "description", content: SUBTITLE },
      { property: "og:title", content: HEADLINE },
      { property: "og:description", content: SUBTITLE },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <LedgerPage variant="shallow" />,
});
