import Image from "next/image";
import { BRAND_ASSETS } from "@/lib/brand/assets";

type MusdOnMezoMarkProps = {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
};

const SIZES = {
  sm: 22,
  md: 28,
  lg: 36,
} as const;

/** Standalone MUSD mark — Mezo’s Bitcoin-backed stablecoin (no chain badge overlay). */
export function MusdOnMezoMark({
  size = "md",
  showLabel = true,
  className = "",
}: MusdOnMezoMarkProps) {
  const px = SIZES[size];

  return (
    <span className={["inline-flex items-center gap-2.5", className].join(" ")}>
      <Image
        src={BRAND_ASSETS.musdToken}
        alt=""
        width={px}
        height={px}
        className="shrink-0 rounded-full"
        unoptimized
        aria-hidden
      />
      {showLabel ? (
        <span className={"text-sm font-medium tracking-tight text-foreground"}>
          MUSD
        </span>
      ) : null}
    </span>
  );
}

export function MusdOnMezoPrice({
  amount,
  className = "",
  withMark = false,
}: {
  amount: string;
  className?: string;
  withMark?: boolean;
}) {
  return (
    <span
      className={["inline-flex items-center gap-1.5 tabular-nums", className].join(
        " ",
      )}
    >
      {withMark ? <MusdOnMezoMark size="sm" showLabel={false} /> : null}
      <span>
        <span className="font-medium text-foreground">{amount}</span>
        {" "}
        <span className="font-sans text-[0.92em] font-medium text-foreground">
          MUSD
        </span>
      </span>
    </span>
  );
}

export function MusdOnMezoCallout({ className = "" }: { className?: string }) {
  return (
    <div
      className={[
        "flex items-start gap-3 rounded-xl border border-line bg-surface-muted px-4 py-3.5",
        className,
      ].join(" ")}
    >
      <MusdOnMezoMark size="md" showLabel={false} className="mt-0.5" />
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-foreground">
          MUSD only
        </p>
        <p className="mt-1 text-[13px] leading-relaxed text-muted">
          Send MUSD on the Mezo network to this address (testnet: borrow at
          testnet.mezo.org). Also keep BTC for gas (faucet.test.mezo.org).
        </p>
      </div>
    </div>
  );
}
