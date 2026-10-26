import {
  createPublicClient,
  decodeEventLog,
  http,
  type Hex,
  type Log,
} from "viem";
import { MEZO, promptGatewayAbi } from "@/lib/mezo/constants";
import type { VerifiedMezoPayment } from "@/lib/types/gateway";

const mezoChainDef = {
  id: MEZO.chainId,
  name: "Mezo",
  nativeCurrency: { name: "Bitcoin", symbol: "BTC", decimals: 18 },
  rpcUrls: {
    default: { http: [MEZO.rpcUrl] },
  },
} as const;

export function getMezoClient() {
  return createPublicClient({
    chain: mezoChainDef,
    transport: http(MEZO.rpcUrl),
  });
}

export class PaymentVerificationError extends Error {
  constructor(
    public code:
      | "GATEWAY_NOT_CONFIGURED"
      | "TX_NOT_FOUND"
      | "TX_NOT_CONFIRMED"
      | "WRONG_RECIPIENT"
      | "INSUFFICIENT_AMOUNT"
      | "PAYMENT_ID_UNUSED"
      | "AMOUNT_MISMATCH"
      | "SELLER_MISMATCH",
    message: string,
  ) {
    super(message);
    this.name = "PaymentVerificationError";
  }
}

export type VerifiedV2Payment = VerifiedMezoPayment & {
  seller: `0x${string}`;
  sellerAmountWei: bigint;
  platformAmountWei: bigint;
};

function parsePaymentDeposited(log: Log): {
  payer: `0x${string}`;
  seller: `0x${string}`;
  paymentId: `0x${string}`;
  amount: bigint;
  sellerAmount: bigint;
  platformAmount: bigint;
} | null {
  try {
    const decoded = decodeEventLog({
      abi: promptGatewayAbi,
      data: log.data,
      topics: log.topics,
    });
    if (decoded.eventName !== "PaymentDeposited") return null;
    const args = decoded.args as {
      payer: `0x${string}`;
      seller: `0x${string}`;
      paymentId: `0x${string}`;
      amount: bigint;
      sellerAmount: bigint;
      platformAmount: bigint;
    };
    return args;
  } catch {
    return null;
  }
}

export async function verifyMezoPayment(params: {
  txHash: Hex;
  expectedPayer: `0x${string}`;
  expectedSeller: `0x${string}`;
  expectedAmount: bigint;
}): Promise<VerifiedV2Payment> {
  if (!MEZO.gatewayAddress || MEZO.gatewayAddress.length !== 42) {
    throw new PaymentVerificationError(
      "GATEWAY_NOT_CONFIGURED",
      "PROMPT_GATEWAY_ADDRESS is not set",
    );
  }

  const client = getMezoClient();
  const receipt = await client.getTransactionReceipt({
    hash: params.txHash,
  });

  if (!receipt) {
    throw new PaymentVerificationError("TX_NOT_FOUND", "Transaction not found");
  }
  if (receipt.status !== "success") {
    throw new PaymentVerificationError(
      "TX_NOT_CONFIRMED",
      "Transaction failed on-chain",
    );
  }

  const gateway = MEZO.gatewayAddress.toLowerCase();
  let matched: VerifiedV2Payment | null = null;

  for (let i = 0; i < receipt.logs.length; i++) {
    const log = receipt.logs[i];
    if (log.address.toLowerCase() !== gateway) continue;

    const parsed = parsePaymentDeposited(log);
    if (!parsed) continue;

    if (parsed.payer.toLowerCase() !== params.expectedPayer.toLowerCase()) {
      continue;
    }
    if (parsed.seller.toLowerCase() !== params.expectedSeller.toLowerCase()) {
      throw new PaymentVerificationError(
        "SELLER_MISMATCH",
        "Payment seller does not match this service",
      );
    }
    if (parsed.amount < MEZO.feeWei) {
      throw new PaymentVerificationError(
        "INSUFFICIENT_AMOUNT",
        `Paid ${parsed.amount}, platform minimum ${MEZO.feeWei}`,
      );
    }
    if (parsed.amount !== params.expectedAmount) {
      throw new PaymentVerificationError(
        "AMOUNT_MISMATCH",
        `Paid ${parsed.amount}, service price ${params.expectedAmount}`,
      );
    }

    matched = {
      txHash: params.txHash,
      payer: parsed.payer,
      seller: parsed.seller,
      paymentId: parsed.paymentId,
      amountWei: parsed.amount,
      sellerAmountWei: parsed.sellerAmount,
      platformAmountWei: parsed.platformAmount,
      blockNumber: receipt.blockNumber,
      logIndex: i,
    };
    break;
  }

  if (!matched) {
    throw new PaymentVerificationError(
      "WRONG_RECIPIENT",
      "No matching PaymentDeposited event for this payer",
    );
  }

  const used = await client.readContract({
    address: MEZO.gatewayAddress,
    abi: promptGatewayAbi,
    functionName: "isUsed",
    args: [matched.paymentId],
  });

  if (!used) {
    throw new PaymentVerificationError(
      "PAYMENT_ID_UNUSED",
      "Payment id is not marked used on-chain",
    );
  }

  return matched;
}
