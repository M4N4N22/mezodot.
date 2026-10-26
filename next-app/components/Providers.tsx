"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { http, WagmiProvider } from "wagmi";
import { getActiveMezoChain } from "@/lib/wallet/mezoChain";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "mezodot_local_dev_placeholder";

const activeChain = getActiveMezoChain();

/** Wave 1: Mezo Testnet by default (MEZO_NETWORK / NEXT_PUBLIC_MEZO_NETWORK). */
const config = getDefaultConfig({
  appName: "mezodot.",
  projectId,
  chains: [activeChain],
  transports: {
    [activeChain.id]: http(activeChain.rpcUrls.default.http[0]),
  },
  ssr: true,
});

const rkTheme = lightTheme({
  accentColor: "#1a1a1a",
  accentColorForeground: "#faf9f6",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "small",
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={rkTheme}
          modalSize="compact"
          initialChain={activeChain}
          coolMode={false}
          appInfo={{
            appName: "mezodot.",
            learnMoreUrl: "https://mezo.org/docs",
          }}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
