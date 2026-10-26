import { defineChain } from "viem";
import {
  MEZO_MAINNET_CHAIN_ID,
  MEZO_MAINNET_EXPLORER,
  MEZO_TESTNET_CHAIN_ID,
  MEZO_TESTNET_EXPLORER,
  getMezoNetwork,
  getMezoRpcUrlDefault,
  getMusdAddressDefault,
  networkFromChainId,
  type MezoNetworkId,
} from "../constants.js";

export function resolveRpcUrl(
  override?: string,
  network?: MezoNetworkId,
): string {
  if (override?.trim()) return override.trim();
  return getMezoRpcUrlDefault(network ?? getMezoNetwork());
}

export function mezoChain(params?: {
  chainId?: number;
  rpcUrl?: string;
  network?: MezoNetworkId;
}) {
  const network =
    params?.network ??
    (params?.chainId != null
      ? networkFromChainId(params.chainId)
      : getMezoNetwork());
  const chainId =
    params?.chainId ??
    (network === "testnet" ? MEZO_TESTNET_CHAIN_ID : MEZO_MAINNET_CHAIN_ID);
  const rpcUrl = resolveRpcUrl(params?.rpcUrl, network);
  const explorer =
    network === "testnet" ? MEZO_TESTNET_EXPLORER : MEZO_MAINNET_EXPLORER;

  return defineChain({
    id: chainId,
    name: network === "testnet" ? "Mezo Testnet" : "Mezo",
    nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
    rpcUrls: {
      default: { http: [rpcUrl] },
    },
    blockExplorers: {
      default: { name: "Mezo Explorer", url: explorer },
    },
  });
}

/** @deprecated Use mezoChain() */
export function mezoMainnet(rpcUrl?: string) {
  return mezoChain({ network: "mainnet", rpcUrl });
}

export const erc20Abi = [
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** PromptGateway V4 — MUSD ERC-20 settle. */
export const promptGatewayAbi = [
  {
    type: "function",
    name: "depositPayment",
    stateMutability: "nonpayable",
    inputs: [
      { name: "paymentId", type: "bytes32" },
      { name: "seller", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "minFee",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "musd",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

export function resolveMusdAddress(
  network?: MezoNetworkId,
): `0x${string}` {
  return getMusdAddressDefault(network ?? getMezoNetwork());
}
