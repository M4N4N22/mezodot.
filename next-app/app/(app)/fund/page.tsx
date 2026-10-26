import type { Metadata } from "next";
import { FundPage } from "@/components/fund/FundPage";

export const metadata: Metadata = {
  title: "Fund your agent",
  description:
    "Top up your local agent wallet with MUSD on Mezo — QR, balance, and copy address. Keys stay on your machine. MUSD on other networks will not appear.",
};

export default function FundRoutePage() {
  return <FundPage />;
}
