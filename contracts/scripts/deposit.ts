import { ethers } from "hardhat";

/**
 * Smoke deposit (MUSD ERC-20):
 *   GATEWAY_ADDRESS=0x... SELLER=0x... npm run deposit:mezo-testnet
 */

const EXPLORERS: Record<string, string> = {
  "31612": "https://explorer.mezo.org/tx/",
  "31611": "https://explorer.test.mezo.org/tx/",
};

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

async function main() {
  const gatewayAddress = process.env.GATEWAY_ADDRESS;
  const seller = process.env.SELLER;
  if (!gatewayAddress?.startsWith("0x")) {
    throw new Error("Set GATEWAY_ADDRESS");
  }
  if (!seller?.startsWith("0x")) {
    throw new Error("Set SELLER to the service owner address");
  }

  const network = await ethers.provider.getNetwork();
  const explorer =
    EXPLORERS[network.chainId.toString()] ??
    "https://explorer.test.mezo.org/tx/";

  const [payer] = await ethers.getSigners();
  const gateway = await ethers.getContractAt("PromptGateway", gatewayAddress);
  const fee = await gateway.minFee();
  const musdAddr = await gateway.musd();
  const musd = new ethers.Contract(musdAddr, ERC20_ABI, payer);

  const bal = await musd.balanceOf(payer.address);
  if (bal < fee) {
    throw new Error(
      `Insufficient MUSD: have ${bal.toString()}, need ${fee.toString()}`,
    );
  }

  const nonce = BigInt(Date.now());
  const paymentId = ethers.solidityPackedKeccak256(
    ["address", "string", "uint256"],
    [payer.address, "llm.chat", nonce],
  );

  console.log("chainId:", network.chainId.toString());
  console.log("Payer:", payer.address);
  console.log("Seller:", seller);
  console.log("MUSD:", musdAddr);
  console.log("paymentId:", paymentId);
  console.log("amount:", fee.toString());

  const approveTx = await musd.approve(gatewayAddress, fee);
  await approveTx.wait();
  console.log("Approved:", approveTx.hash);

  const tx = await gateway.depositPayment(paymentId, seller, fee);
  console.log("Submitted:", tx.hash);
  const receipt = await tx.wait();
  console.log("Block:", receipt?.blockNumber);
  console.log("Explorer:", `${explorer}${tx.hash}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
