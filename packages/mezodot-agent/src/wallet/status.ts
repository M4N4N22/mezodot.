import { createPublicClient, formatEther, http } from "viem";
import {
  MEZO_MAINNET_EXPLORER,
  MEZO_TESTNET_EXPLORER,
  getMezoChainId,
  getMezoNetwork,
  getMusdAddressDefault,
  type MezoNetworkId,
} from "../constants.js";
import {
  erc20Abi,
  mezoChain,
  resolveMusdAddress,
  resolveRpcUrl,
} from "../mezo/chain.js";
import {
  resolvePrivateKey,
  walletAccountFromKey,
} from "./store.js";

/** Default warning line: enough for a few unlocks at the 0.01 MUSD floor. */
export const DEFAULT_LOW_BALANCE_MUSD = 0.05;

export type WalletStatus = {
  address: `0x${string}`;
  balanceWei: string;
  balanceMusd: string;
  balanceBtc: string;
  lowBalance: boolean;
  alertThresholdUsdc: number;
  network: MezoNetworkId;
  chainId: number;
  explorerUrl: string;
  fundHint: string;
  musdAddress: `0x${string}`;
};

function alertThresholdUsdc(): number {
  const raw = process.env.MEZODOT_LOW_BALANCE_MUSD?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return DEFAULT_LOW_BALANCE_MUSD;
}

function explorerAddressUrl(
  address: `0x${string}`,
  network: MezoNetworkId,
): string {
  const base =
    network === "testnet" ? MEZO_TESTNET_EXPLORER : MEZO_MAINNET_EXPLORER;
  return `${base.replace(/\/$/, "")}/address/${address}`;
}

export function fundHintFor(
  address: `0x${string}`,
  network: MezoNetworkId,
): string {
  const chainLabel =
    network === "testnet" ? "Mezo Testnet (31611)" : "Mezo Mainnet (31612)";
  return [
    `Fund ${address} on ${chainLabel}:`,
    `1) BTC for gas — https://faucet.test.mezo.org/ (testnet)`,
    `2) MUSD for unlocks — borrow/swap at https://testnet.mezo.org (min borrow ~2000 MUSD on testnet)`,
    `Keep at least ${alertThresholdUsdc()} MUSD for runtime spend.`,
  ].join(" ");
}

/** MUSD ERC-20 balance + BTC gas check for the local buyer wallet. */
export async function getWalletStatus(opts?: {
  rpcUrl?: string;
  chainId?: number;
  address?: `0x${string}`;
  musdAddress?: `0x${string}`;
}): Promise<WalletStatus> {
  const network = getMezoNetwork();
  const chainId = opts?.chainId ?? getMezoChainId(network);
  const address =
    opts?.address ?? walletAccountFromKey(resolvePrivateKey()).address;
  const musd = opts?.musdAddress ?? resolveMusdAddress(network);
  const rpcUrl = resolveRpcUrl(opts?.rpcUrl, network);
  const chain = mezoChain({ chainId, rpcUrl, network });
  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const [musdWei, btcWei] = await Promise.all([
    client.readContract({
      address: musd,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    }),
    client.getBalance({ address }),
  ]);

  const threshold = alertThresholdUsdc();
  const thresholdWei = BigInt(Math.round(threshold * 1e18));
  const lowBalance = musdWei < thresholdWei;
  const explorerUrl = explorerAddressUrl(address, network);

  return {
    address,
    balanceWei: musdWei.toString(),
    balanceMusd: formatEther(musdWei),
    balanceBtc: formatEther(btcWei),
    lowBalance,
    alertThresholdUsdc: threshold,
    network,
    chainId,
    explorerUrl,
    fundHint: fundHintFor(address, network),
    musdAddress: musd,
  };
}

export function formatWalletStatusHuman(status: WalletStatus): string {
  const flag = status.lowBalance ? "LOW BALANCE" : "OK";
  return [
    `Address:  ${status.address}`,
    `MUSD:     ${status.balanceMusd} (${flag})`,
    `BTC gas:  ${status.balanceBtc}`,
    `Network:  ${status.network} · chain ${status.chainId}`,
    `MUSD:     ${status.musdAddress}`,
    `Alert if below ${status.alertThresholdUsdc} MUSD`,
    `Explorer: ${status.explorerUrl}`,
    status.lowBalance ? `Fund:     ${status.fundHint}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatUsdcFromWei(wei: bigint): string {
  return formatEther(wei);
}

/** unused import guard for getMusdAddressDefault in older call sites */
void getMusdAddressDefault;
