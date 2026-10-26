import { ethers } from "hardhat";

/** 0.01 MUSD floor (18 decimals) */
const MIN_FEE = 10_000_000_000_000_000n;
/** 10_000 MUSD fat-finger / griefing cap */
const MAX_FEE = 10_000n * 10n ** 18n;
/** 10% platform fee */
const PLATFORM_FEE_BPS = 1000n;

/** Canonical MUSD addresses — https://mezo.org/docs/users/resources/contracts-reference/ */
const MUSD_BY_CHAIN: Record<string, `0x${string}`> = {
  "31612": "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186",
  "31611": "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
};

const NETWORK_META: Record<
  string,
  {
    label: string;
    explorerAddress: string;
    rpc: string;
    envSuffix: "MAINNET" | "TESTNET";
    networkFlag: "mainnet" | "testnet";
  }
> = {
  "31612": {
    label: "Mezo Mainnet",
    explorerAddress: "https://explorer.mezo.org/address/",
    rpc: "https://mezo.drpc.org",
    envSuffix: "MAINNET",
    networkFlag: "mainnet",
  },
  "31611": {
    label: "Mezo Testnet",
    explorerAddress: "https://explorer.test.mezo.org/address/",
    rpc: "https://rpc.test.mezo.org",
    envSuffix: "TESTNET",
    networkFlag: "testnet",
  },
};

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainKey = network.chainId.toString();
  const meta = NETWORK_META[chainKey];
  if (!meta) {
    throw new Error(
      `Unknown chainId ${chainKey}. Use --network mezoMainnet or mezoTestnet.`,
    );
  }

  const musd =
    (process.env.MUSD_ADDRESS?.trim() as `0x${string}` | undefined) ||
    MUSD_BY_CHAIN[chainKey];
  if (!musd) {
    throw new Error(`No MUSD address for chain ${chainKey}`);
  }

  const treasury =
    process.env.PLATFORM_TREASURY?.trim() || deployer.address;

  console.log("Network:", meta.label);
  console.log("chainId:", chainKey);
  console.log("Deployer (owner):", deployer.address);
  console.log("Treasury:", treasury);
  console.log("MUSD:", musd);
  console.log("minFee:", MIN_FEE.toString());
  console.log("maxFee:", MAX_FEE.toString());
  console.log("platformFeeBps:", PLATFORM_FEE_BPS.toString());

  const gateway = await ethers.deployContract("PromptGateway", [
    musd,
    MIN_FEE,
    MAX_FEE,
    PLATFORM_FEE_BPS,
    treasury,
  ]);
  await gateway.waitForDeployment();

  const address = await gateway.getAddress();
  console.log("\nPromptGateway (MUSD) deployed to:", address);
  console.log("Explorer:", `${meta.explorerAddress}${address}`);

  const gwVar = `PROMPT_GATEWAY_ADDRESS_${meta.envSuffix}`;
  const gwPublic = `NEXT_PUBLIC_PROMPT_GATEWAY_ADDRESS_${meta.envSuffix}`;
  const musdVar = `MUSD_ADDRESS_${meta.envSuffix}`;
  const musdPublic = `NEXT_PUBLIC_MUSD_ADDRESS_${meta.envSuffix}`;
  const rpcVar =
    meta.envSuffix === "TESTNET"
      ? "MEZO_TESTNET_RPC_URL"
      : "MEZO_MAINNET_RPC_URL";
  const rpcPublic =
    meta.envSuffix === "TESTNET"
      ? "NEXT_PUBLIC_MEZO_TESTNET_RPC_URL"
      : "NEXT_PUBLIC_MEZO_MAINNET_RPC_URL";

  console.log("\n--- paste into next-app/.env.local ---\n");
  console.log(`NEXT_PUBLIC_MEZO_NETWORK=${meta.networkFlag}`);
  console.log(`MEZO_NETWORK=${meta.networkFlag}`);
  console.log(`${gwVar}=${address}`);
  console.log(`${gwPublic}=${address}`);
  console.log(`${musdVar}=${musd}`);
  console.log(`${musdPublic}=${musd}`);
  console.log("GATEWAY_FEE_WEI=10000000000000000");
  console.log("NEXT_PUBLIC_GATEWAY_MIN_FEE_WEI=10000000000000000");
  console.log(`NEXT_PUBLIC_GATEWAY_MAX_FEE_WEI=${MAX_FEE.toString()}`);
  console.log("PLATFORM_FEE_BPS=1000");
  console.log(`PLATFORM_TREASURY=${treasury}`);
  console.log(`${rpcVar}=${meta.rpc}`);
  console.log(`${rpcPublic}=${meta.rpc}`);
  console.log("--------------------------------------\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
