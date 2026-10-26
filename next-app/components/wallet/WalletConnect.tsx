"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { formatEther } from "viem";
import { useBalance, useReadContract } from "wagmi";
import { BRAND_ASSETS } from "@/lib/brand/assets";
import { erc20Abi, MEZO } from "@/lib/mezo/constants";
import { getMezoChainId } from "@/lib/mezo/network";
import { getActiveMezoChain } from "@/lib/wallet/mezoChain";

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatMusd(value: bigint | undefined): string {
  if (value === undefined) return "—";
  const n = Number(formatEther(value));
  if (!Number.isFinite(n)) return "—";
  if (n >= 100) return n.toFixed(2);
  if (n >= 1) return n.toFixed(3);
  if (n >= 0.01) return n.toFixed(4);
  if (n === 0) return "0";
  return n.toFixed(6);
}

const btnBase =
  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20";

function NetworkBadge({
  ok,
  label,
}: {
  ok: boolean;
  label: string;
}) {
  return (
    <span
      className={[
        "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium tracking-tight",
        ok
          ? "border-line bg-surface-muted text-foreground"
          : "border-amber-700/25 bg-amber-50 text-amber-950",
      ].join(" ")}
      title={ok ? "Mezo" : "Switch to Mezo"}
    >
      <span
        className={[
          "h-1.5 w-1.5 shrink-0 rounded-full",
          ok ? "bg-lime-400" : "bg-amber-600",
        ].join(" ")}
        aria-hidden
      />
      {label}
    </span>
  );
}

function BalanceChip({
  address,
  chainId,
}: {
  address?: `0x${string}`;
  chainId?: number;
}) {
  const expected = getMezoChainId();
  const onMezo = chainId === expected;
  const { data: musdBal } = useReadContract({
    address: MEZO.musdAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: expected,
    query: {
      enabled: Boolean(address) && onMezo,
      refetchInterval: 15_000,
    },
  });
  const { data: btcBal } = useBalance({
    address,
    chainId: expected,
    query: {
      enabled: Boolean(address) && onMezo,
      refetchInterval: 15_000,
    },
  });

  return (
    <span
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-[12px] font-medium text-foreground"
      title={
        onMezo
          ? `MUSD ${formatMusd(musdBal)} · BTC gas ${formatMusd(btcBal?.value)}`
          : "Connect to Mezo to see balance"
      }
    >
      <Image
        src={BRAND_ASSETS.musdToken}
        alt=""
        width={14}
        height={14}
        className="rounded-full"
        unoptimized
      />
      <span className="tabular-nums">
        {onMezo ? formatMusd(musdBal) : "—"}
      </span>
      <span className="text-muted">MUSD</span>
    </span>
  );
}

type WalletConnectProps = {
  compact?: boolean;
  className?: string;
};

/**
 * Branded wallet control — active Mezo network (Wave 1: testnet).
 * Shows network label + MUSD ERC-20 balance.
 */
export function WalletConnect({
  compact = false,
  className = "",
}: WalletConnectProps) {
  const expectedChainId = getMezoChainId();
  const active = getActiveMezoChain();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        const onMezo = chain?.id === expectedChainId;
        const networkLabel = !connected
          ? active.name
          : onMezo
            ? active.name.replace("Mezo ", "") || "Mezo"
            : "Wrong network";

        return (
          <div
            className={[
              compact
                ? "flex flex-wrap items-center justify-end gap-1.5"
                : "flex flex-col items-end gap-1.5",
              !ready ? "opacity-0 pointer-events-none" : "opacity-100",
              className,
            ].join(" ")}
            aria-hidden={!ready}
          >
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <NetworkBadge
                ok={!connected || onMezo}
                label={networkLabel}
              />
              {connected ? (
                <BalanceChip
                  address={account.address as `0x${string}`}
                  chainId={chain.id}
                />
              ) : null}
            </div>

            {!connected ? (
              <button
                type="button"
                onClick={openConnectModal}
                className={`${btnBase} border-transparent bg-foreground text-accent-foreground hover:opacity-90`}
              >
                Connect wallet
              </button>
            ) : !onMezo ? (
              <button
                type="button"
                onClick={() => openChainModal?.() ?? openConnectModal()}
                className={`${btnBase} border-amber-700/30 bg-foreground text-accent-foreground hover:opacity-90`}
              >
                Switch to {active.name}
              </button>
            ) : (
              <button
                type="button"
                onClick={openAccountModal}
                className={`${btnBase} border-line bg-surface text-foreground hover:bg-surface-muted`}
              >
                <span className="font-mono text-[12px]">
                  {shortenAddress(account.address)}
                </span>
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
