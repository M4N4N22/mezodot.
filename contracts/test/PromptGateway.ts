import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

/** 0.01 MUSD floor (18 decimals) */
const MIN_FEE = 10_000_000_000_000_000n;
/** 10_000 MUSD fat-finger cap */
const MAX_FEE = 10_000n * 10n ** 18n;
const FEE_BPS = 1000n; // 10%
const MINT = 100_000n * 10n ** 18n;

describe("PromptGateway MUSD ERC-20", () => {
  async function deployFixture() {
    const [owner, payer, seller, other, treasury] = await ethers.getSigners();
    const musd = await ethers.deployContract("MockERC20", [
      "Mezo USD",
      "MUSD",
      18,
    ]);
    await musd.mint(payer.address, MINT);

    const gateway = await ethers.deployContract("PromptGateway", [
      await musd.getAddress(),
      MIN_FEE,
      MAX_FEE,
      FEE_BPS,
      treasury.address,
    ]);

    const gatewayAddr = await gateway.getAddress();
    await musd.connect(payer).approve(gatewayAddr, ethers.MaxUint256);

    return { gateway, musd, owner, payer, seller, other, treasury, gatewayAddr };
  }

  async function deployGateway(
    musdAddr: string,
    minFee: bigint,
    maxFee: bigint,
    bps: bigint,
    treasury: string,
  ) {
    return ethers.deployContract("PromptGateway", [
      musdAddr,
      minFee,
      maxFee,
      bps,
      treasury,
    ]);
  }

  describe("constructor", () => {
    it("locks owner, treasury, musd, fees", async () => {
      const { gateway, musd, owner, treasury } = await loadFixture(deployFixture);
      expect(await gateway.owner()).to.equal(owner.address);
      expect(await gateway.treasury()).to.equal(treasury.address);
      expect(await gateway.musd()).to.equal(await musd.getAddress());
      expect(await gateway.minFee()).to.equal(MIN_FEE);
      expect(await gateway.maxFee()).to.equal(MAX_FEE);
      expect(await gateway.platformFeeBps()).to.equal(FEE_BPS);
      expect(await gateway.feeAmount()).to.equal(MIN_FEE);
    });

    it("rejects invalid constructor args", async () => {
      const { gateway, musd, treasury } = await loadFixture(deployFixture);
      const musdAddr = await musd.getAddress();

      await expect(
        deployGateway(ethers.ZeroAddress, MIN_FEE, MAX_FEE, FEE_BPS, treasury.address),
      ).to.be.revertedWithCustomError(gateway, "InvalidToken");

      await expect(
        deployGateway(musdAddr, 0n, MAX_FEE, FEE_BPS, treasury.address),
      ).to.be.revertedWithCustomError(gateway, "InvalidFeeRange");

      await expect(
        deployGateway(musdAddr, MIN_FEE, MIN_FEE - 1n, FEE_BPS, treasury.address),
      ).to.be.revertedWithCustomError(gateway, "InvalidFeeRange");

      await expect(
        deployGateway(musdAddr, MIN_FEE, MAX_FEE, 10_001n, treasury.address),
      ).to.be.revertedWithCustomError(gateway, "InvalidBps");

      await expect(
        deployGateway(musdAddr, MIN_FEE, MAX_FEE, FEE_BPS, ethers.ZeroAddress),
      ).to.be.revertedWithCustomError(gateway, "InvalidTreasury");
    });
  });

  describe("depositPayment", () => {
    it("splits at exact minFee and records paymentAmount", async () => {
      const { gateway, musd, payer, seller, gatewayAddr } =
        await loadFixture(deployFixture);
      const paymentId = ethers.id("exact-min");
      const platformAmount = (MIN_FEE * FEE_BPS) / 10_000n;
      const sellerAmount = MIN_FEE - platformAmount;

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, seller.address, MIN_FEE),
      )
        .to.emit(gateway, "PaymentDeposited")
        .withArgs(
          payer.address,
          seller.address,
          paymentId,
          MIN_FEE,
          sellerAmount,
          platformAmount,
        );

      expect(await gateway.pendingSeller(seller.address)).to.equal(sellerAmount);
      expect(await gateway.pendingPlatform()).to.equal(platformAmount);
      expect(await gateway.totalPending()).to.equal(MIN_FEE);
      expect(await gateway.paymentAmount(paymentId)).to.equal(MIN_FEE);
      expect(await gateway.isUsed(paymentId)).to.equal(true);
      expect(await musd.balanceOf(gatewayAddr)).to.equal(MIN_FEE);
    });

    it("accumulates multiple deposits for one seller", async () => {
      const { gateway, payer, seller } = await loadFixture(deployFixture);
      await gateway
        .connect(payer)
        .depositPayment(ethers.id("a"), seller.address, MIN_FEE);
      await gateway
        .connect(payer)
        .depositPayment(ethers.id("b"), seller.address, MIN_FEE * 2n);

      const total = MIN_FEE + MIN_FEE * 2n;
      const platform = (total * FEE_BPS) / 10_000n;
      expect(await gateway.pendingPlatform()).to.equal(platform);
      expect(await gateway.pendingSeller(seller.address)).to.equal(
        total - platform,
      );
      expect(await gateway.totalPending()).to.equal(total);
    });

    it("previewSplit matches deposit accounting", async () => {
      const { gateway } = await loadFixture(deployFixture);
      const amount = MIN_FEE * 3n;
      const [sellerAmount, platformAmount] = await gateway.previewSplit(amount);
      expect(platformAmount).to.equal((amount * FEE_BPS) / 10_000n);
      expect(sellerAmount).to.equal(amount - platformAmount);
    });

    it("rejects below min, above max, zero id, zero seller, self seller, replay", async () => {
      const { gateway, musd, payer, seller, treasury, gatewayAddr } =
        await loadFixture(deployFixture);
      const paymentId = ethers.id("pay-bad");
      const musdAddr = await musd.getAddress();

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, seller.address, MIN_FEE - 1n),
      ).to.be.revertedWithCustomError(gateway, "BelowMinFee");

      const tight = await deployGateway(
        musdAddr,
        MIN_FEE,
        MIN_FEE,
        FEE_BPS,
        treasury.address,
      );
      await musd.connect(payer).approve(await tight.getAddress(), ethers.MaxUint256);
      await expect(
        tight
          .connect(payer)
          .depositPayment(paymentId, seller.address, MIN_FEE + 1n),
      ).to.be.revertedWithCustomError(tight, "AboveMaxFee");

      await expect(
        gateway
          .connect(payer)
          .depositPayment(ethers.ZeroHash, seller.address, MIN_FEE),
      ).to.be.revertedWithCustomError(gateway, "InvalidPaymentId");

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, ethers.ZeroAddress, MIN_FEE),
      ).to.be.revertedWithCustomError(gateway, "InvalidSeller");

      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, gatewayAddr, MIN_FEE),
      ).to.be.revertedWithCustomError(gateway, "InvalidSeller");

      await gateway
        .connect(payer)
        .depositPayment(paymentId, seller.address, MIN_FEE);
      await expect(
        gateway
          .connect(payer)
          .depositPayment(paymentId, seller.address, MIN_FEE),
      ).to.be.revertedWithCustomError(gateway, "PaymentAlreadyUsed");
    });

    it("rejects naked ETH via receive", async () => {
      const { gateway, payer } = await loadFixture(deployFixture);
      const addr = await gateway.getAddress();

      await expect(
        payer.sendTransaction({ to: addr, value: MIN_FEE }),
      ).to.be.revertedWithCustomError(gateway, "DirectDepositDisabled");
    });

    it("handles 0% and 100% platform fee extremes", async () => {
      const { musd, payer, seller, treasury } = await loadFixture(deployFixture);
      const musdAddr = await musd.getAddress();

      const zeroBps = await deployGateway(
        musdAddr,
        MIN_FEE,
        MAX_FEE,
        0n,
        treasury.address,
      );
      await musd.connect(payer).approve(await zeroBps.getAddress(), ethers.MaxUint256);
      await zeroBps
        .connect(payer)
        .depositPayment(ethers.id("z"), seller.address, MIN_FEE);
      expect(await zeroBps.pendingSeller(seller.address)).to.equal(MIN_FEE);
      expect(await zeroBps.pendingPlatform()).to.equal(0n);

      const fullBps = await deployGateway(
        musdAddr,
        MIN_FEE,
        MAX_FEE,
        10_000n,
        treasury.address,
      );
      await musd.connect(payer).approve(await fullBps.getAddress(), ethers.MaxUint256);
      await fullBps
        .connect(payer)
        .depositPayment(ethers.id("f"), seller.address, MIN_FEE);
      expect(await fullBps.pendingSeller(seller.address)).to.equal(0n);
      expect(await fullBps.pendingPlatform()).to.equal(MIN_FEE);
    });
  });

  describe("withdrawals", () => {
    it("lets seller and platform withdraw MUSD to treasury", async () => {
      const { gateway, musd, owner, payer, seller, other, treasury, gatewayAddr } =
        await loadFixture(deployFixture);
      const amount = MIN_FEE * 2n;
      const platformAmount = (amount * FEE_BPS) / 10_000n;
      const sellerAmount = amount - platformAmount;

      await gateway
        .connect(payer)
        .depositPayment(ethers.id("w1"), seller.address, amount);

      await expect(
        gateway.connect(other).withdrawSeller(),
      ).to.be.revertedWithCustomError(gateway, "NothingToWithdraw");

      const sellerBefore = await musd.balanceOf(seller.address);
      await expect(gateway.connect(seller).withdrawSeller())
        .to.emit(gateway, "SellerWithdrawn")
        .withArgs(seller.address, sellerAmount);
      expect(await musd.balanceOf(seller.address)).to.equal(
        sellerBefore + sellerAmount,
      );

      expect(await gateway.pendingSeller(seller.address)).to.equal(0n);
      expect(await gateway.totalPending()).to.equal(platformAmount);

      await expect(
        gateway.connect(seller).withdrawSeller(),
      ).to.be.revertedWithCustomError(gateway, "NothingToWithdraw");

      await expect(
        gateway.connect(other).withdrawPlatform(),
      ).to.be.revertedWithCustomError(gateway, "OnlyOwner");

      const treasuryBefore = await musd.balanceOf(treasury.address);
      await expect(gateway.connect(owner).withdrawPlatform())
        .to.emit(gateway, "PlatformWithdrawn")
        .withArgs(treasury.address, platformAmount);
      expect(await musd.balanceOf(treasury.address)).to.equal(
        treasuryBefore + platformAmount,
      );

      expect(await gateway.pendingPlatform()).to.equal(0n);
      expect(await gateway.totalPending()).to.equal(0n);
      expect(await musd.balanceOf(gatewayAddr)).to.equal(0n);
    });
  });
});
