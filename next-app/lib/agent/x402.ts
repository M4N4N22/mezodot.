/**
 * x402-compatible negotiation shim for mezodot.
 * Advertises MUSD ERC-20 depositPayment settlement on Mezo (18 decimals).
 * Agents: approve MUSD → depositPayment(paymentId, seller, amount) → X-Mezo-* headers.
 */

import { MEZO } from "@/lib/mezo/constants";
import { GATEWAY_FEE_USDC } from "@/lib/types/gateway";
import type { GatewayPaymentInstructions } from "@/lib/types/gateway";
import type { ServiceRow } from "@/lib/types/catalog";

const ZERO_ADDR =
  "0x0000000000000000000000000000000000000000" as const;

export type X402Accept = {
  scheme: "exact";
  network: `eip155:${number}`;
  asset: "MUSD";
  amount: string;
  payTo: `0x${string}`;
  maxTimeoutSeconds: number;
  extra: {
    name: "MezoDotPromptGateway";
    method: "depositPayment";
    token: `0x${string}`;
    seller: `0x${string}` | null;
    currencyDecimals: 18;
    feeUsdc: string;
    unlockPath: "/api/gateway";
    unlockHeaders: string[];
    auth: "EIP-191";
    paymentIdRequired: true;
    note: string;
  };
};

export type X402PaymentRequired = {
  x402Version: 2;
  resource: {
    url: string;
    description: string;
    mimeType: "application/json";
  };
  accepts: X402Accept[];
  error?: {
    code: string;
    message: string;
  };
};

export function buildPaymentInstructions(
  service?: ServiceRow | null,
): GatewayPaymentInstructions {
  const seller =
    service?.owner_address && /^0x[a-fA-F0-9]{40}$/.test(service.owner_address)
      ? (service.owner_address as `0x${string}`)
      : null;
  return {
    chainId: MEZO.chainId,
    gateway: MEZO.gatewayAddress || ZERO_ADDR,
    seller,
    feeWei: service?.price_wei ?? MEZO.feeWei.toString(),
    feeUsdc: service?.price_usdc ?? GATEWAY_FEE_USDC,
    method: "depositPayment",
    paymentIdHint:
      "Unique bytes32 per deposit; approve MUSD then depositPayment(paymentId, seller, amount)",
    rpcUrl: MEZO.rpcUrl,
    explorerTxBase: MEZO.explorerTxBase,
    unlockPath: "/api/gateway",
    auth: "EIP-191",
  };
}

export function buildX402PaymentRequired(params: {
  payment: GatewayPaymentInstructions;
  service?: ServiceRow | null;
  code?: string;
  message?: string;
  requestUrl?: string;
}): X402PaymentRequired {
  const { payment, service } = params;
  const slug = service?.slug;
  return {
    x402Version: 2,
    resource: {
      url: payment.unlockPath,
      description: slug
        ? `Unlock gated service "${slug}" on mezodot.`
        : "Unlock a gated mezodot. service after MUSD settlement on Mezo.",
      mimeType: "application/json",
    },
    accepts: [
      {
        scheme: "exact",
        network: `eip155:${MEZO.chainId}`,
        asset: "MUSD",
        amount: payment.feeWei,
        payTo: payment.gateway,
        maxTimeoutSeconds: 120,
        extra: {
          name: "MezoDotPromptGateway",
          method: "depositPayment",
          token: MEZO.musdAddress,
          seller: payment.seller,
          currencyDecimals: 18,
          feeUsdc: payment.feeUsdc,
          unlockPath: "/api/gateway",
          unlockHeaders: [
            "X-Mezo-Tx-Hash",
            "X-Mezo-Address",
            "X-Mezo-Signature",
          ],
          auth: "EIP-191",
          paymentIdRequired: true,
          note: "MUSD is ERC-20 (18 decimals). approve(gateway, amount) then depositPayment(paymentId, seller, amount). Gas is BTC on Mezo.",
        },
      },
    ],
    error:
      params.code || params.message
        ? {
            code: params.code ?? "PAYMENT_REQUIRED",
            message: params.message ?? "Payment required",
          }
        : undefined,
  };
}

export function encodePaymentRequiredHeader(
  body: X402PaymentRequired,
): string {
  return Buffer.from(JSON.stringify(body), "utf8").toString("base64");
}

/** Attach x402 + discoverability headers to a 402 NextResponse. */
export function withX402Headers(
  headers: Headers,
  payment: GatewayPaymentInstructions,
  x402: X402PaymentRequired,
): void {
  headers.set("PAYMENT-REQUIRED", encodePaymentRequiredHeader(x402));
  headers.set("X-Payment-Protocol", "x402");
  headers.set("X-Payment-Network", `eip155:${MEZO.chainId}`);
  headers.set("X-Payment-Currency", "MUSD");
  headers.set("X-Payment-Decimals", "18");
  headers.set("X-Payment-Amount", payment.feeWei);
  headers.set("X-Payment-Wallet", payment.gateway);
  headers.set("X-Payment-Token", MEZO.musdAddress);
  if (payment.seller) {
    headers.set("X-Payment-Seller", payment.seller);
  }
  headers.set("X-Payment-Method", "depositPayment");
  headers.set(
    "Access-Control-Expose-Headers",
    [
      "PAYMENT-REQUIRED",
      "X-Payment-Protocol",
      "X-Payment-Network",
      "X-Payment-Currency",
      "X-Payment-Decimals",
      "X-Payment-Amount",
      "X-Payment-Wallet",
      "X-Payment-Token",
      "X-Payment-Seller",
      "X-Payment-Method",
    ].join(", "),
  );
}
