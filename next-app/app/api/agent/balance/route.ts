import { NextResponse } from "next/server";
import { formatEther, isAddress } from "viem";
import { z } from "zod";
import { erc20Abi, MEZO } from "@/lib/mezo/constants";
import { getMezoExplorerAddressBase } from "@/lib/mezo/network";
import { getMezoClient } from "@/lib/mezo/verifyPayment";

export const runtime = "nodejs";

/** Default warning line — enough for a few unlocks at the 0.01 MUSD floor. */
const DEFAULT_LOW_BALANCE_MUSD = 0.05;

const querySchema = z.object({
  address: z.string().refine((v) => isAddress(v), "Invalid address"),
});

/**
 * Public MUSD + BTC balance lookup for an agent wallet address.
 * Never accepts or returns private keys — Hub funding panel only.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    address: url.searchParams.get("address") ?? "",
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid 0x wallet address." },
      { status: 400 },
    );
  }

  const address = parsed.data.address as `0x${string}`;
  const thresholdRaw = Number(
    process.env.MEZODOT_LOW_BALANCE_MUSD ?? DEFAULT_LOW_BALANCE_MUSD,
  );
  const alertThresholdUsdc =
    Number.isFinite(thresholdRaw) && thresholdRaw >= 0
      ? thresholdRaw
      : DEFAULT_LOW_BALANCE_MUSD;

  try {
    const client = getMezoClient();
    const [musdWei, btcWei] = await Promise.all([
      client.readContract({
        address: MEZO.musdAddress,
        abi: erc20Abi,
        functionName: "balanceOf",
        args: [address],
      }),
      client.getBalance({ address }),
    ]);
    const balanceMusd = formatEther(musdWei);
    const balanceBtc = formatEther(btcWei);
    const thresholdWei = BigInt(Math.round(alertThresholdUsdc * 1e18));
    const lowBalance = musdWei < thresholdWei;
    const explorerUrl = `${getMezoExplorerAddressBase()}${address}`;

    return NextResponse.json({
      address,
      balanceMusd,
      balanceBtc,
      balanceWei: musdWei.toString(),
      lowBalance,
      alertThresholdUsdc,
      network: MEZO.network,
      chainId: MEZO.chainId,
      musdAddress: MEZO.musdAddress,
      explorerUrl,
      fundHint: lowBalance
        ? `Fund ${address} on Mezo ${MEZO.network}: (1) BTC for gas — https://faucet.test.mezo.org/ (2) MUSD — borrow/swap at https://testnet.mezo.org. Keep ≥ ${alertThresholdUsdc} MUSD.`
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Could not read balance on Mezo.",
      },
      { status: 502 },
    );
  }
}
