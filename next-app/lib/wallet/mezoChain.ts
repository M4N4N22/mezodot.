import { defineChain } from "viem";
import {
  MEZO_MAINNET_CHAIN_ID,
  MEZO_MAINNET_EXPLORER,
  MEZO_MAINNET_RPC_DEFAULT,
  MEZO_TESTNET_CHAIN_ID,
  MEZO_TESTNET_EXPLORER,
  MEZO_TESTNET_RPC_DEFAULT,
  getMezoNetwork,
} from "@/lib/mezo/network";

export const mezoMainnet = defineChain({
  id: MEZO_MAINNET_CHAIN_ID,
  name: "Mezo",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MEZO_MAINNET_RPC_URL ??
          process.env.NEXT_PUBLIC_MEZO_RPC_URL ??
          MEZO_MAINNET_RPC_DEFAULT,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Mezo Explorer",
      url:
        process.env.NEXT_PUBLIC_MEZO_MAINNET_EXPLORER ?? MEZO_MAINNET_EXPLORER,
    },
  },
});

export const mezoTestnet = defineChain({
  id: MEZO_TESTNET_CHAIN_ID,
  name: "Mezo Testnet",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        process.env.NEXT_PUBLIC_MEZO_TESTNET_RPC_URL ?? MEZO_TESTNET_RPC_DEFAULT,
      ],
    },
  },
  blockExplorers: {
    default: {
      name: "Mezo Testnet Explorer",
      url:
        process.env.NEXT_PUBLIC_MEZO_TESTNET_EXPLORER ?? MEZO_TESTNET_EXPLORER,
    },
  },
  testnet: true,
});

/** Wallet / wagmi chain for the active network (Wave 1: testnet). */
export function getActiveMezoChain() {
  return getMezoNetwork() === "mainnet" ? mezoMainnet : mezoTestnet;
}

/** @deprecated Use getActiveMezoChain() */
export const arcActive = getActiveMezoChain();

export function activeMezoRpcUrl(): string {
  if (getMezoNetwork() === "testnet") {
    return (
      process.env.NEXT_PUBLIC_MEZO_TESTNET_RPC_URL?.trim() ||
      MEZO_TESTNET_RPC_DEFAULT
    );
  }
  return (
    process.env.NEXT_PUBLIC_MEZO_MAINNET_RPC_URL?.trim() ||
    process.env.NEXT_PUBLIC_MEZO_RPC_URL?.trim() ||
    MEZO_MAINNET_RPC_DEFAULT
  );
}

export function activeMezoExplorerBase(): string {
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

/** @deprecated */
export const activeArcExplorerBase = activeMezoExplorerBase;
