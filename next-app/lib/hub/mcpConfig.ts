/** Client-safe MCP config snippets for the Integration Hub. */

import {
  AGENT_NPM_PACKAGE,
  agentInstallCommands,
  agentMcpProxyConfig,
} from "@/lib/agent/install";
import { getMezoChainId, getMezoNetwork } from "@/lib/mezo/network";

export function mcpEndpoint(origin: string): string {
  return `${origin.replace(/\/$/, "")}/api/mcp`;
}

/** Cursor / IDE: local @mezodot/agent proxy via npm. */
export function editorMcpConfig(origin: string): string {
  return agentMcpProxyConfig(origin);
}

/** Universal descriptor agents and frameworks can ingest. */
export function universalMcpConfig(origin: string): string {
  const host = origin.replace(/\/$/, "");
  const url = mcpEndpoint(host);
  return JSON.stringify(
    {
      name: "mezodot",
      version: "0.1.0",
      protocol: "mcp",
      transport: "stdio-proxy",
      client: AGENT_NPM_PACKAGE,
      install: AGENT_NPM_PACKAGE,
      remoteEndpoint: url,
      proxy: {
        command: "npx",
        args: ["--yes", AGENT_NPM_PACKAGE, "mcp", "--origin", host],
      },
      methods: ["initialize", "tools/list", "tools/call", "ping"],
      discovery: {
        catalog: `${host}/api/services`,
        wellKnown: `${host}/.well-known/agent.json`,
      },
      payment: {
        chain: getMezoNetwork() === "testnet" ? "mezo-testnet" : "mezo-mainnet",
        chainId: getMezoChainId(),
        note: `Buyer wallet via ${AGENT_NPM_PACKAGE}. Local MCP proxy auto-settles; keys never leave the buyer machine.`,
      },
      docs: `${host}/hub`,
    },
    null,
    2,
  );
}

export function pythonHttpSnippet(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return `# Prefer the buyer client — create or import + fund first, then install only if you import
#
#   ${agentInstallCommands.npxWalletCreate}
#   # or: ${agentInstallCommands.npxWalletImport}
#   # fund on /fund, then for SDK imports:
#
#   ${agentInstallCommands.npmInstall}
#
from pathlib import Path
# Or use Node:
#   ${agentInstallCommands.npxUnlock(host)}

print("Use @mezodot/agent (Node) for settle + unlock. Origin:", "${host}")
`;
}

export function langchainStyleSnippet(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return `# Buyer agent — keys stay on YOUR machine (never on mezodot. server)
#
# 1) ${agentInstallCommands.npxWalletCreate}
#    or: ${agentInstallCommands.npxWalletImport}
# 2) Fund the printed address with MUSD on Mezo
# 3) Use the SDK or CLI (auto-settle)

# Node:
#   ${agentInstallCommands.npmInstall}
#
#   import { createMezodotAgent } from "@mezodot/agent";
#   const agent = await createMezodotAgent({ origin: "${host}" });
#   await agent.unlock({ service: "quick-brief", input: { prompt: "Hi" } });
#   # or: await agent.callMcpTool("mezodot_unlock", { service: "quick-brief", prompt: "Hi" });

# CLI one-liner:
#   ${agentInstallCommands.npxUnlock(host)}

# Cursor: use the MCP proxy JSON from Hub (npx @mezodot/agent)
`;
}

export function curlHandshakeSnippet(origin: string): string {
  const url = mcpEndpoint(origin);
  return `# Descriptor (remote API — discovery only; payment uses @mezodot/agent)
curl -s "${url}" | jq .

# List tools
curl -s -X POST "${url}" \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq .
`;
}
