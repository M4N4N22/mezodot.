# mezodot. contracts

`PromptGateway` — immutable MUSD ERC-20 micropayment escrow on Mezo.

## Networks

| Network | Chain ID | RPC | MUSD |
|---------|----------|-----|------|
| Mezo Testnet | 31611 | https://rpc.test.mezo.org | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| Mezo Mainnet | 31612 | https://mezo.drpc.org | `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186` |

## API

- `depositPayment(paymentId, seller, amount)` — pull MUSD via `transferFrom` (caller must approve first)
- `withdrawSeller()` / `withdrawPlatform()` — pull MUSD out
- Floor `minFee` = 0.01 MUSD (`1e16`); platform cut 10%

## Commands

```bash
npm install
npm test
npm run deploy:mezo-testnet
GATEWAY_ADDRESS=0x… SELLER=0x… npm run deposit:mezo-testnet
```
