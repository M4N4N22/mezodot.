import Link from "next/link";
import {
  DocsH2,
  DocsP,
  DocsProse,
  DocsUl,
} from "@/components/docs/DocsProse";

export const metadata = { title: "API: x402" };

export default function DocsApiX402Page() {
  return (
    <DocsProse
      pathname="/docs/api/x402"
      title="x402 negotiation"
      description="How unpaid unlocks advertise payment — and how mezodot. settles on Mezo."
    >
      <DocsH2>What you get on 402</DocsH2>
      <DocsUl>
        <li>
          JSON <code className="font-mono text-sm">error.payment</code> +{" "}
          <code className="font-mono text-sm">x402</code>
        </li>
        <li>
          Header{" "}
          <code className="font-mono text-sm">PAYMENT-REQUIRED</code> — base64
          JSON (x402 v2 shape)
        </li>
        <li>
          Convenience headers{" "}
          <code className="font-mono text-sm">X-Payment-Wallet</code>,{" "}
          <code className="font-mono text-sm">X-Payment-Amount</code> (wei),{" "}
          <code className="font-mono text-sm">X-Payment-Decimals: 18</code>
        </li>
      </DocsUl>

      <DocsH2>Settlement scheme</DocsH2>
      <DocsP>
        Advertised as{" "}
        <code className="font-mono text-sm text-foreground">
          MezoDotPromptGateway
        </code>
        : on-chain{" "}
        <code className="font-mono text-sm">depositPayment</code> on Mezo Testnet,
        then retry with{" "}
        <code className="font-mono text-sm">X-Mezo-Tx-Hash</code>,{" "}
        <code className="font-mono text-sm">X-Mezo-Address</code>, and{" "}
        <code className="font-mono text-sm">X-Mezo-Signature</code>.
      </DocsP>
      <DocsP>
        Settlement is mezodot’s own Mezo path: approve MUSD,{" "}
        <code className="font-mono text-sm">depositPayment</code>, then unlock
        with the{" "}
        <code className="font-mono text-sm">X-Mezo-*</code> headers (or use{" "}
        <Link href="/docs/cli" className="underline underline-offset-4 text-foreground">
          CLI agent:pay
        </Link>
        ).
      </DocsP>

      <DocsH2>Amounts</DocsH2>
      <DocsP>
        <code className="font-mono text-sm">X-Payment-Amount</code> and x402{" "}
        <code className="font-mono text-sm">accepts[].amount</code> are{" "}
        <strong className="text-foreground">18-decimal wei</strong> of MUSD on
        Mezo. See{" "}
        <Link href="/docs/payment" className="underline underline-offset-4 text-foreground">
          Payment on Mezo
        </Link>
        .
      </DocsP>
    </DocsProse>
  );
}
