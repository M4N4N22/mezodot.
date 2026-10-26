/** Shared constants — Mezo + MUSD ERC-20 (18 decimals). Gas = BTC. */

export const MEZO_MAINNET_CHAIN_ID = 31612 as const;
export const MEZO_TESTNET_CHAIN_ID = 31611 as const;

export const MEZO_MAINNET_RPC_DEFAULT = "https://mezo.drpc.org" as const;
export const MEZO_TESTNET_RPC_DEFAULT = "https://rpc.test.mezo.org" as const;
export const MEZO_RPC_URL_DEFAULT = MEZO_TESTNET_RPC_DEFAULT;

export const MEZO_MAINNET_EXPLORER = "https://explorer.mezo.org" as const;
export const MEZO_TESTNET_EXPLORER = "https://explorer.test.mezo.org" as const;

export const MUSD_MAINNET =
  "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186" as const;
export const MUSD_TESTNET =
  "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503" as const;

export const GATEWAY_FEE_WEI_DEFAULT = 10_000_000_000_000_000n;

export type MezoNetworkId = "mainnet" | "testnet";
/** @deprecated */
export type ArcNetworkId = MezoNetworkId;

export function getMezoNetwork(): MezoNetworkId {
  const env =
    process.env.MEZO_NETWORK ??
    process.env.NEXT_PUBLIC_MEZO_NETWORK ??
    "testnet";
  const v = env.trim().toLowerCase();
  if (v === "mainnet" || v === "mezo-mainnet" || v === "31612") return "mainnet";
  return "testnet";
}

export function getMezoChainId(network = getMezoNetwork()): number {
  return network === "testnet" ? MEZO_TESTNET_CHAIN_ID : MEZO_MAINNET_CHAIN_ID;
}

export function getMezoRpcUrlDefault(network = getMezoNetwork()): string {
  if (network === "testnet") {
    return (
      process.env.MEZO_TESTNET_RPC_URL?.trim() ||
      process.env.NEXT_PUBLIC_MEZO_TESTNET_RPC_URL?.trim() ||
      MEZO_TESTNET_RPC_DEFAULT
    );
  }
  return (
    process.env.MEZO_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEZO_RPC_URL?.trim() ||
    process.env.MEZO_MAINNET_RPC_URL?.trim() ||
    MEZO_MAINNET_RPC_DEFAULT
  );
}

export function getMusdAddressDefault(
  network = getMezoNetwork(),
): `0x${string}` {
  if (network === "testnet") {
    return (
      (process.env.MUSD_ADDRESS_TESTNET?.trim() as `0x${string}` | undefined) ||
      (process.env.MUSD_ADDRESS?.trim() as `0x${string}` | undefined) ||
      MUSD_TESTNET
    );
  }
  return (
    (process.env.MUSD_ADDRESS_MAINNET?.trim() as `0x${string}` | undefined) ||
    (process.env.MUSD_ADDRESS?.trim() as `0x${string}` | undefined) ||
    MUSD_MAINNET
  );
}

export function networkFromChainId(chainId: number): MezoNetworkId {
  return chainId === MEZO_TESTNET_CHAIN_ID ? "testnet" : "mainnet";
}

export type GatewayAuthMessage = {
  domain: "mezodot.gateway";
  chainId: number;
  gateway: `0x${string}`;
  txHash: `0x${string}`;
  feeWei: string;
  service: string;
  inputHash: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
};

export type PaymentProof = {
  txHash: `0x${string}`;
  address: `0x${string}`;
  signature: `0x${string}`;
  issuedAt: number;
  expiresAt: number;
};

/** Back-compat aliases after rename */
export const ARC_MAINNET_EXPLORER = MEZO_MAINNET_EXPLORER;
export const ARC_TESTNET_EXPLORER = MEZO_TESTNET_EXPLORER;
export const ARC_MAINNET_RPC_DEFAULT = MEZO_MAINNET_RPC_DEFAULT;
export const ARC_TESTNET_RPC_DEFAULT = MEZO_TESTNET_RPC_DEFAULT;
export const ARC_CHAIN_ID = MEZO_MAINNET_CHAIN_ID;
export const ARC_EXPLORER = MEZO_MAINNET_EXPLORER;
