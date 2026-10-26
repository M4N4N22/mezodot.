/**
 * Mezo network selection — Wave 1 defaults to testnet.
 *
 * Set NEXT_PUBLIC_MEZO_NETWORK=testnet | mainnet (default: testnet).
 */

export type MezoNetworkId = "mainnet" | "testnet";

export const MEZO_MAINNET_CHAIN_ID = 31612 as const;
export const MEZO_TESTNET_CHAIN_ID = 31611 as const;

export const MEZO_MAINNET_RPC_DEFAULT = "https://mezo.drpc.org" as const;
export const MEZO_TESTNET_RPC_DEFAULT = "https://rpc.test.mezo.org" as const;

export const MEZO_MAINNET_EXPLORER = "https://explorer.mezo.org" as const;
export const MEZO_TESTNET_EXPLORER = "https://explorer.test.mezo.org" as const;

/** Canonical MUSD token addresses */
export const MUSD_MAINNET =
  "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186" as const;
export const MUSD_TESTNET =
  "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503" as const;

function parseNetwork(raw: string | undefined): MezoNetworkId {
  const v = (raw ?? "testnet").trim().toLowerCase();
  if (v === "mainnet" || v === "mezo-mainnet" || v === "31612") return "mainnet";
  return "testnet";
}

/** Active Mezo network for this process / browser build. */
export function getMezoNetwork(): MezoNetworkId {
  return parseNetwork(
    process.env.NEXT_PUBLIC_MEZO_NETWORK ?? process.env.MEZO_NETWORK,
  );
}

export function isMezoTestnet(): boolean {
  return getMezoNetwork() === "testnet";
}

export function getMezoChainId(): number {
  return getMezoNetwork() === "testnet"
    ? MEZO_TESTNET_CHAIN_ID
    : MEZO_MAINNET_CHAIN_ID;
}

export function getMezoRpcUrl(): string {
  if (getMezoNetwork() === "testnet") {
    return (
      process.env.NEXT_PUBLIC_MEZO_TESTNET_RPC_URL?.trim() ||
      process.env.MEZO_TESTNET_RPC_URL?.trim() ||
      MEZO_TESTNET_RPC_DEFAULT
    );
  }
  return (
    process.env.NEXT_PUBLIC_MEZO_MAINNET_RPC_URL?.trim() ||
    process.env.MEZO_MAINNET_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEZO_RPC_URL?.trim() ||
    process.env.MEZO_RPC_URL?.trim() ||
    MEZO_MAINNET_RPC_DEFAULT
  );
}

export function getMezoExplorerBase(): string {
  if (getMezoNetwork() === "testnet") {
    return (
      process.env.NEXT_PUBLIC_MEZO_TESTNET_EXPLORER?.trim() ||
      MEZO_TESTNET_EXPLORER
    );
  }
  return (
    process.env.NEXT_PUBLIC_MEZO_MAINNET_EXPLORER?.trim() || MEZO_MAINNET_EXPLORER
  );
}

/** @deprecated Use getMezoExplorerBase */
export const getArcExplorerBase = getMezoExplorerBase;

export function getMezoExplorerTxBase(): string {
  return `${getMezoExplorerBase().replace(/\/$/, "")}/tx/`;
}

/** @deprecated Use getMezoExplorerTxBase */
export const getArcExplorerTxBase = getMezoExplorerTxBase;

export function getMezoExplorerAddressBase(): string {
  return `${getMezoExplorerBase().replace(/\/$/, "")}/address/`;
}

/** @deprecated Use getMezoExplorerAddressBase */
export const getArcExplorerAddressBase = getMezoExplorerAddressBase;

/** PromptGateway for the active network. */
export function getPromptGatewayAddress(): `0x${string}` | "" {
  if (getMezoNetwork() === "testnet") {
    const a =
      process.env.PROMPT_GATEWAY_ADDRESS_TESTNET?.trim() ||
      process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS_TESTNET?.trim() ||
      "";
    return a as `0x${string}` | "";
  }
  const a =
    process.env.PROMPT_GATEWAY_ADDRESS_MAINNET?.trim() ||
    process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS_MAINNET?.trim() ||
    process.env.PROMPT_GATEWAY_ADDRESS?.trim() ||
    process.env.NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS?.trim() ||
    "";
  return a as `0x${string}` | "";
}

/** MUSD ERC-20 for the active network. */
export function getMusdAddress(): `0x${string}` {
  if (getMezoNetwork() === "testnet") {
    const a =
      process.env.MUSD_ADDRESS_TESTNET?.trim() ||
      process.env.NEXT_PUBLIC_MUSD_ADDRESS_TESTNET?.trim() ||
      process.env.NEXT_PUBLIC_MUSD_ADDRESS?.trim() ||
      MUSD_TESTNET;
    return a as `0x${string}`;
  }
  const a =
    process.env.MUSD_ADDRESS_MAINNET?.trim() ||
    process.env.NEXT_PUBLIC_MUSD_ADDRESS_MAINNET?.trim() ||
    process.env.NEXT_PUBLIC_MUSD_ADDRESS?.trim() ||
    MUSD_MAINNET;
  return a as `0x${string}`;
}
