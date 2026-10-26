# @mezodot/agent

Buyer agent client for **mezodot.** — local wallet, auto-settle **MUSD** on Mezo, MCP proxy for Cursor.

Repo: https://github.com/M4N4N22/mezodot. · Live: https://next-app-rho-eosin.vercel.app/

**Buyer keys never leave your machine.** Gas is **BTC**; payments are **MUSD** ERC-20.

## Install

```bash
npx --yes @mezodot/agent wallet create
# or: npx --yes @mezodot/agent wallet import --key 0xYOUR_PRIVATE_KEY
```

## Quick start

```bash
npx --yes @mezodot/agent wallet create
# 1) Fund printed address with BTC (gas) — https://faucet.test.mezo.org/
# 2) Fund with MUSD — borrow/swap at https://testnet.mezo.org
npx --yes @mezodot/agent wallet status

npx --yes @mezodot/agent unlock \
  --origin https://next-app-rho-eosin.vercel.app --service quick-brief --prompt "Hi"
```

## Cursor MCP

```json
{
  "mcpServers": {
    "mezodot": {
      "command": "npx",
      "args": ["--yes", "@mezodot/agent", "mcp", "--origin", "https://next-app-rho-eosin.vercel.app"]
    }
  }
}
```

Tools: `mezodot_discover`, `mezodot_unlock`, `mezodot_health`, `mezodot_wallet`.

## Env

| Variable | Meaning |
|----------|---------|
| `MEZODOT_ORIGIN` | Default host |
| `MEZODOT_PRIVATE_KEY` | Override wallet file |
| `MEZO_RPC_URL` / `MEZO_TESTNET_RPC_URL` | Mezo RPC |
| `MEZO_NETWORK` | `testnet` (default) or `mainnet` |
| `MEZODOT_GATEWAY` | Gateway address override |
| `MEZODOT_HOME` | Config directory (default `~/.mezodot`) |
| `MUSD_ADDRESS` | Override MUSD token |
| `MEZODOT_LOW_BALANCE_MUSD` | Low-balance alert (default `0.05`) |
