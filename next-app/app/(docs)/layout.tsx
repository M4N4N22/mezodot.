import type { Metadata } from "next";
import { DocsLayoutClient } from "@/components/docs/DocsLayout";

export const metadata: Metadata = {
  title: {
    default: "Documentation — mezodot.",
    template: "%s — mezodot. docs",
  },
  description:
    "How agents discover, pay, and unlock gated APIs on Mezo — and how sellers publish on mezodot.",
};

export default function DocsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DocsLayoutClient>{children}</DocsLayoutClient>;
}
