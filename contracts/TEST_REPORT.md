# PromptGateway — test report

**Date:** 2026-10-26  
**Command:** `npm test` (Hardhat)  
**Result:** **9 passing / 0 failing** (~3s)  
**Solidity:** 0.8.28 · `evmVersion: london`  
**Network under test:** Hardhat local (MockERC20 stand-in for MUSD)

## Suite: PromptGateway MUSD ERC-20

### constructor

| Test | Status |
|------|--------|
| locks owner, treasury, musd, fees | PASS |
| rejects invalid constructor args | PASS |

### depositPayment

| Test | Status |
|------|--------|
| splits at exact minFee and records paymentAmount | PASS |
| accumulates multiple deposits for one seller | PASS |
| previewSplit matches deposit accounting | PASS |
| rejects below min, above max, zero id, zero seller, self seller, replay | PASS |
| rejects naked ETH via receive | PASS |
| handles 0% and 100% platform fee extremes | PASS |

### withdrawals

| Test | Status |
|------|--------|
| lets seller and platform withdraw MUSD to treasury | PASS |

## What is covered

- Immutable constructor params: `musd`, `minFee`, `maxFee`, `platformFeeBps`, `treasury`
- MUSD ERC-20 pull via `transferFrom` after `approve`
- Seller / platform fee split (default 10% platform)
- Replay protection (`usedPaymentId`)
- Native BTC/`msg.value` deposits rejected (`DirectDepositDisabled`)
- Seller and platform MUSD withdrawals

## Out of scope (integration)

On-chain deploy / e2e against Mezo testnet MUSD (`0x1189…Ac503`) is separate from this unit suite. See [DEPLOY.md](../DEPLOY.md).

## Verdict

**Ready to deploy** — deployed after this run.

## Post-test deploy (same day)

| Field | Value |
|-------|--------|
| Network | Mezo Testnet · `31611` |
| Live app | https://next-app-rho-eosin.vercel.app/ |
| GitHub | https://github.com/M4N4N22/mezodot. |
| PromptGateway | [`0xda82cF44546f2f414370dDeb0F6dAAd3F21822e6`](https://explorer.test.mezo.org/address/0xda82cF44546f2f414370dDeb0F6dAAd3F21822e6) |
| Deployer | `0x610B0a6F85d00f8f3CdE1BD39A0C300a30b1D4fd` |
| MUSD | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
