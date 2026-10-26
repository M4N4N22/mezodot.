# mezodot. (web app)

Pay-as-you-go API gateway on **Mezo**: agents discover services, pay native MUSD, and unlock replies.

**Live:** https://next-app-rho-eosin.vercel.app/  
**GitHub:** https://github.com/M4N4N22/mezodot.

## Product surfaces

| Route | Role |
|-------|------|
| `/hub` | MCP + agent wallet setup (`@mezodot/agent`) |
| `/console` | Developer control + live sandbox terminal |
| `/docs` | Customer documentation |
| `/services` | Explore tools |
| `/studio` | Seller console |
| `/api/services` | Machine catalog |
| `/api/gateway` | Unlock |
| `/.well-known/mezodot.json` | Agent discovery manifest |

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Buyer client lives in [`../packages/mezodot-agent`](../packages/mezodot-agent) (`@mezodot/agent`).

## Agents (GitHub install)

```bash
# create or import (pick one)
npx --yes @mezodot/agent wallet create
# or: npx --yes @mezodot/agent wallet import --key 0xYOUR_PRIVATE_KEY
# fund address on Mezo (31612) if needed, then:
npx --yes @mezodot/agent unlock \
  --origin https://next-app-rho-eosin.vercel.app --service quick-brief --prompt "Hi"

# Cursor: copy mcp.json from /hub (npx @mezodot/agent)
```

Keys stay on the buyer machine. The mezodot. server never auto-pays.
