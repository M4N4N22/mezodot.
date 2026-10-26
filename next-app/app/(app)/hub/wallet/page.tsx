import type { Metadata } from "next";
import { HubWallet } from "@/components/hub/HubWallet";

export const metadata: Metadata = {
  title: "Wallet help · Hub",
  description:
    "Create and fund a local buyer wallet so agents can settle paid tools on mezodot.",
};

export default function HubWalletPage() {
  return <HubWallet />;
}
