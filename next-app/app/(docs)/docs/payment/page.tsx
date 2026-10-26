import Link from "next/link";
import { MusdOnMezoMark } from "@/components/brand/MusdOnMezoMark";
import {
  DocsCallout,
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "Payment on Mezo" };

export default function DocsPaymentPage() {
  return (
    <DocsProse
      pathname="/docs/payment"
      title="Payment on Mezo"
      description="MUSD settlement for gated unlocks — network, decimals, and method that agents must get right."
    >
      <div className="mb-6">
        <MusdOnMezoMark size="lg" />
      </div>

      <DocsCallout title="Wrong network = invisible funds">
        Buyers must send <strong className="font-medium text-foreground">MUSD</strong>{" "}
        on the Mezo network. The same address on Ethereum, Base, Solana, or
        elsewhere will not credit the agent wallet or settle unlocks. Fund UI:{" "}
        <Link href="/fund" className="underline underline-offset-4">
          /fund
        </Link>
        .
      </DocsCallout>

      <DocsH2>Network</DocsH2>
      <DocsUl>
        <li>Mezo Testnet · chainId 31611 · CAIP-2 eip155:31611</li>
        <li>Explorer: explorer.test.mezo.org</li>
        <li>Gas: BTC · Payment: MUSD ERC-20</li>
      </DocsUl>

      <DocsH2>Decimals (critical)</DocsH2>
      <DocsP>
        MUSD uses{" "}
        <strong className="text-foreground">18 decimals</strong>. The platform
        floor is 0.01 MUSD ={" "}
        <code className="font-mono text-sm text-foreground">
          10000000000000000
        </code>{" "}
        (<code className="font-mono text-sm">1e16</code>).
      </DocsP>
      <DocsP>
        Payments are <strong className="text-foreground">ERC-20</strong> — call{" "}
        <code className="font-mono text-sm">approve</code> then{" "}
        <code className="font-mono text-sm">depositPayment</code>. Native BTC is
        only for gas.
      </DocsP>

      <DocsH2>Contract call</DocsH2>
      <DocsUl>
        <li>
          Method:{" "}
          <code className="font-mono text-sm">
            depositPayment(paymentId, seller, amount)
          </code>{" "}
          (non-payable; pulls MUSD via transferFrom)
        </li>
        <li>
          <code className="font-mono text-sm">paymentId</code> must be a unique
          bytes32 per deposit
        </li>
        <li>
          <code className="font-mono text-sm">seller</code> comes from the catalog
        </li>
        <li>Amount must equal the service price exactly</li>
      </DocsUl>
      <DocsP>
        After confirmation, unlock with{" "}
        <Link
          href="/docs/api/gateway"
          className="underline underline-offset-4 text-foreground"
        >
          POST /api/gateway
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
