/** Shared gateway types — server + agent clients. Not for UI copy. */

import {
  MEZO_MAINNET_CHAIN_ID,
  MEZO_MAINNET_RPC_DEFAULT,
  getMezoChainId,
} from "@/lib/mezo/network";

/** @deprecated Prefer getMezoChainId() — kept for imports; resolves active network. */
export const ARC_CHAIN_ID = getMezoChainId();

/** Mainnet default RPC (legacy constant name). */
export const MEZO_RPC_URL_DEFAULT = MEZO_MAINNET_RPC_DEFAULT;

/** Mainnet chain id constant for docs / static references. */
export const ARC_MAINNET_ID = MEZO_MAINNET_CHAIN_ID;

export const MUSD_DECIMALS = 18 as const;

/** 0.01 MUSD in Mezo native 18-decimal wei */
export const GATEWAY_FEE_WEI_DEFAULT = BigInt("10000000000000000");
export const GATEWAY_FEE_USDC = "0.01" as const;

export type GatewayErrorCode =
  | "MISSING_HEADERS"
  | "INVALID_SIGNATURE"
  | "TX_NOT_FOUND"
  | "TX_NOT_CONFIRMED"
  | "WRONG_CHAIN"
  | "WRONG_RECIPIENT"
  | "INSUFFICIENT_AMOUNT"
  | "TX_ALREADY_CONSUMED"
  | "PAYMENT_ID_UNUSED"
  | "PAYLOAD_INVALID"
  | "UPSTREAM_FAILED"
  | "GATEWAY_NOT_CONFIGURED"
  | "AMOUNT_MISMATCH"
  | "SERVICE_NOT_FOUND"
  | "SERVICE_PAUSED"
  | "SERVICE_MISCONFIGURED"
  | "RATE_LIMITED"
  | "SELLER_MISMATCH"
  | "DURABLE_STORE_REQUIRED"
  | "UNLOCK_CREDIT_INVALID";

export interface GatewayTargetPayload {
  service: string;
  input: unknown;
  clientRequestId?: string;
}

export interface GatewayAuthMessage {
  domain: "mezodot.gateway";
  chainId: number;
  gateway: `0x${string}`;
  txHash: `0x${string}`;
  feeWei: string;
  service: string;
  inputHash: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
}

export interface GatewayPaymentInstructions {
  chainId: number;
  gateway: `0x${string}`;
  /** Seller address for depositPayment(paymentId, seller). Null if unknown. */
  seller: `0x${string}` | null;
  feeWei: string;
  feeUsdc: string;
  method: "depositPayment";
  paymentIdHint: string;
  rpcUrl: string;
  explorerTxBase: string;
  unlockPath: "/api/gateway";
  auth: "EIP-191";
}

export interface Gateway402Body {
  ok: false;
  status: 402;
  error: {
    code: GatewayErrorCode;
    message: string;
    payment: GatewayPaymentInstructions;
  };
  /** x402 v2 negotiation payload (also base64 in PAYMENT-REQUIRED header) */
  x402?: unknown;
  requestId: string;
  timestamp: string;
}

export interface GatewaySettlement {
  txHash: `0x${string}`;
  payer: `0x${string}`;
  amountWei: string;
  amountUsdc: string;
  paymentId: `0x${string}`;
  blockNumber: number;
  verifiedAt: string;
}

export interface Gateway200Body {
  ok: true;
  status: 200;
  settlement: GatewaySettlement;
  result: unknown;
  meta: {
    requestId: string;
    service: string;
    latencyMs: number;
    mock: boolean;
    /** True when unlocked via DEMO_AGENT_SECRET (not an on-chain payment). */
    demo: boolean;
  };
}

export interface VerifiedMezoPayment {
  txHash: `0x${string}`;
  payer: `0x${string}`;
  paymentId: `0x${string}`;
  amountWei: bigint;
  blockNumber: bigint;
  logIndex: number;
}
