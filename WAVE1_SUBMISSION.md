# Mezo Buildathon — Wave 1 submission draft (mezodot.)

## Project

**mezodot.** — Pay-as-you-go API gateway for AI agents, settled in **MUSD** on **Mezo**.

Port of arcdot. (Arc / native USDC) → Mezo / MUSD ERC-20.

## AKINDO form answers

| Field | Value |
|-------|--------|
| Project name | mezodot. |
| Category | agent micropayments, MUSD access |
| Track | Track 2 (Access and Distribution) — optionally both |
| Chain | Mezo (testnet for Wave 1) |
| Project status | Existing product with new Mezo/MUSD integration (arcdot.) |
| TL;DR | Agents discover payable APIs, pay MUSD on Mezo, and unlock replies without human checkout. |
| How it works | Sellers publish HTTPS tools + MUSD price. Buyers/agents approve MUSD, call `PromptGateway.depositPayment`, prove the tx to `/api/gateway`, receive the upstream result. Platform takes 10%. |
| Target group | AI agent builders, MCP/IDE users, API sellers who want machine-payable endpoints in MUSD |
| Tech stack | Solidity Hardhat, Next.js, wagmi/viem/RainbowKit, `@mezodot/agent` MCP, Supabase optional |
| Future milestones | 1) Mainnet deploy + npm `@mezodot/agent` 2) Mezo Passport + official x402 facilitator 3) Seller analytics + cross-chain MUSD notes |

## Hard requirements checklist

- [x] MUSD integration (ERC-20 escrow on PromptGateway)
- [x] Working deployment on Mezo testnet — gateway [`0xda82cF44546f2f414370dDeb0F6dAAd3F21822e6`](https://explorer.test.mezo.org/address/0xda82cF44546f2f414370dDeb0F6dAAd3F21822e6)
- [ ] Live app URL (Vercel, root = `next-app`)
- [ ] Public GitHub
- [ ] Deck + 2-min pitch video

## Deploy steps (operator)

Deployer wallet already created in `contracts/.env` (gitignored):

**Address:** `0x610B0a6F85d00f8f3CdE1BD39A0C300a30b1D4fd` (~0.05 testnet BTC funded)

1. `cd contracts && npm run deploy:mezo-testnet` → paste printed env into `next-app/.env.local`
2. Borrow MUSD at https://testnet.mezo.org for buyer/agent wallet
3. `cd next-app && npm run dev` (or deploy Vercel with root `next-app`)
4. Publish a demo tool in Studio; unlock via UI or MCP

## Pitch angle (2 min)

1. Problem: agents can call APIs but cannot pay cents autonomously  
2. Solution: mezodot. — discover → pay MUSD → unlock  
3. Why Mezo: Bitcoin-backed MUSD as the unit of agent commerce; BTC for gas  
4. Demo: MCP unlock tx on explorer  
5. Ask: Wave 2 depth — mainnet + Mezo x402 alignment  

## Scoring map

| Criterion | How we hit it |
|-----------|----------------|
| Mezo Integration 30% | Real MUSD ERC-20 escrow + withdraw path, not a wrapper |
| Product viability 30% | Extends MUSD into agent micropayments (Track 2) |
| Technical 20% | Full stack: contract, gateway verify, agent auto-settle |
| UX 10% | Hub / Fund / Studio carried from production arcdot. |
| Materials 10% | This doc + demo video + live link |
