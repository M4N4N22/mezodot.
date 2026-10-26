# Deploy mezodot. on Mezo Testnet

## Deployer

Address (from `contracts/.env`, gitignored):

```
0x610B0a6F85d00f8f3CdE1BD39A0C300a30b1D4fd
```

Funded with ~0.05 testnet BTC.

## Live deployment (Mezo Testnet)

| Field | Value |
|-------|--------|
| **Live app** | https://next-app-rho-eosin.vercel.app/ |
| **GitHub** | https://github.com/M4N4N22/mezodot. |
| PromptGateway | [`0xda82cF44546f2f414370dDeb0F6dAAd3F21822e6`](https://explorer.test.mezo.org/address/0xda82cF44546f2f414370dDeb0F6dAAd3F21822e6) |
| MUSD | `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| Owner / treasury | `0x610B0a6F85d00f8f3CdE1BD39A0C300a30b1D4fd` |
| Tests | [TEST_REPORT.md](contracts/TEST_REPORT.md) — 9/9 pass before deploy |

Gateway addresses are also written into `next-app/.env.local`.

## Steps (re-deploy)

```bash
cd contracts
npm test
npm run deploy:mezo-testnet
```

Paste the printed block into `next-app/.env.local`.

For buyer unlocks, borrow MUSD at https://testnet.mezo.org (protocol minimum ~2000 MUSD).

```bash
cd next-app
npm run dev
```

Or deploy on Vercel with **Root Directory = `next-app`**.

## Verify

- App: https://next-app-rho-eosin.vercel.app/
- GitHub: https://github.com/M4N4N22/mezodot.
- Health: https://next-app-rho-eosin.vercel.app/api/health
- Explorer: `https://explorer.test.mezo.org/address/<gateway>`
- Unlock a seed/demo service from Explore or MCP `mezodot_unlock`

See also [contracts/TEST_REPORT.md](contracts/TEST_REPORT.md).
