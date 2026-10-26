import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const MAINNET_KEY =
  process.env.DEPLOYER_PRIVATE_KEY_MAINNET ??
  process.env.DEPLOYER_PRIVATE_KEY ??
  "";
const TESTNET_KEY =
  process.env.DEPLOYER_PRIVATE_KEY_TESTNET ??
  process.env.DEPLOYER_PRIVATE_KEY ??
  "";

const MEZO_MAINNET_RPC =
  process.env.MEZO_MAINNET_RPC_URL ??
  process.env.MEZO_RPC_URL ??
  "https://mezo.drpc.org";
const MEZO_TESTNET_RPC =
  process.env.MEZO_TESTNET_RPC_URL ?? "https://rpc.test.mezo.org";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "london",
      viaIR: false,
    },
  },
  networks: {
    hardhat: {},
    mezoMainnet: {
      url: MEZO_MAINNET_RPC,
      chainId: 31612,
      accounts: MAINNET_KEY ? [MAINNET_KEY] : [],
    },
    mezoTestnet: {
      url: MEZO_TESTNET_RPC,
      chainId: 31611,
      accounts: TESTNET_KEY ? [TESTNET_KEY] : [],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
