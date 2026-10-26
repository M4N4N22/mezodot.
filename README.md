# mezodot.

**Pay-as-you-go API access for AI agents — settled in [MUSD](https://mezo.org) on [Mezo](https://mezo.org).**

mezodot. is an **API monetization gateway** for the agentic economy on Mezo. Agents discover a tool, approve + pay MUSD on-chain, prove the payment, and unlock a reply — no accounts, no invoices, no human checkout.

Port of [arcdot.](https://github.com/M4N4N22/arcdot.) for the **Mezo Buildathon** (Track 2: Access & Distribution).

| | |
|---|---|
| **Network (Wave 1)** | Mezo Testnet · Chain ID `31611` · RPC `https://rpc.test.mezo.org` |
| **Payment** | MUSD ERC-20 · Testnet `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503` |
| **Gas** | BTC (native) |
| **Agent client** | `@mezodot/agent` (local wallet + MCP auto-settle) |
| **Explorer** | [explorer.test.mezo.org](https://explorer.test.mezo.org) |

---

## Flow

```text
discover → approve MUSD → depositPayment(paymentId, seller, amount)
         → verify on-chain → unlock upstream → respond
```

| Actor | What they do |
|---|---|
| **Buyers / agents** | Discover a service slug, approve MUSD, settle `depositPayment` on `PromptGateway`, call `POST /api/gateway` (or MCP `mezodot_unlock`) with proof + signature |
| **Sellers** | Publish an HTTPS agent endpoint in Studio, set a price (≥ 0.01 MUSD), earn pending MUSD, withdraw with `withdrawSeller` |
| **Platform** | Catalog + settlement API, 10% platform cut |

---

## Stack

```text
mezodot/
├── contracts/                 # Hardhat — PromptGateway (MUSD ERC-20)
├── packages/mezodot-agent/    # @mezodot/agent — CLI, MCP, SDK
└── next-app/                  # Next.js App Router
```

---

## Quick start

### 1. Contracts

```bash
cd contracts
cp .env.example .env
# Set DEPLOYER_PRIVATE_KEY_TESTNET= (funded with Mezo testnet BTC)
npm install
npm test
npm run deploy:mezo-testnet
```

Paste the printed env block into `next-app/.env.local`.

Testnet BTC faucet: https://faucet.test.mezo.org/  
MUSD: borrow/swap at https://testnet.mezo.org (protocol min borrow ~2000 MUSD).

### 2. App

```bash
cd next-app
cp .env.example .env.local
# paste gateway + MUSD addresses from deploy
npm install
npm run dev
```

### 3. Agent / MCP

```bash
npx --yes @mezodot/agent wallet create
# fund with BTC (gas) + MUSD, then:
npx --yes @mezodot/agent unlock --origin http://localhost:3000 --service <slug> --prompt "Hi"
```

Cursor MCP:

```json
{
  "mcpServers": {
    "mezodot": {
      "command": "npx",
      "args": ["--yes", "@mezodot/agent", "mcp", "--origin", "http://localhost:3000"]
    }
  }
}
```

---

## Mezo Buildathon notes

- **Track:** 2 — Access and Distribution for MUSD/MEZO  
- **Integration:** MUSD ERC-20 micropayments for agent API unlocks  
- **Chain:** Mezo (testnet accepted for Wave 1)  
- **Status:** Existing product (arcdot.) with new Mezo/MUSD integration  

### Judging narrative

mezodot. extends **MUSD utility** beyond human DeFi UX into the **agentic economy**: machines discover payable APIs, pay cents in Bitcoin-backed MUSD, and continue autonomously.

---

## License

MIT
