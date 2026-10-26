/**
 * Public npm distribution for @mezodot/agent.
 * https://www.npmjs.com/package/@mezodot/agent
 */

export const AGENT_NPM_PACKAGE = "@mezodot/agent";

/** @deprecated Alias kept for older imports — same as AGENT_NPM_PACKAGE */
export const AGENT_GIT_PACKAGE = AGENT_NPM_PACKAGE;

export const AGENT_GITHUB_REPO = "M4N4N22/mezodot.";
export const AGENT_GITHUB_URL = `https://github.com/${AGENT_GITHUB_REPO}`;
export const AGENT_PACKAGE_PATH = "packages/mezodot-agent";

export const agentInstallCommands = {
  /** One-shot CLI via npx */
  npxWalletCreate: `npx --yes ${AGENT_NPM_PACKAGE} wallet create`,
  npxWalletImport: `npx --yes ${AGENT_NPM_PACKAGE} wallet import --key 0xYOUR_PRIVATE_KEY`,
  npxWalletImportFromEnv: `npx --yes ${AGENT_NPM_PACKAGE} wallet import --from-env`,
  npxWalletStatus: `npx --yes ${AGENT_NPM_PACKAGE} wallet status`,
  npxUnlock: (origin: string) =>
    `npx --yes ${AGENT_NPM_PACKAGE} unlock --origin ${origin} --service quick-brief --prompt "Hi"`,
  npxMcp: (origin: string) =>
    `npx --yes ${AGENT_NPM_PACKAGE} mcp --origin ${origin}`,
  /** Add as a dependency */
  npmInstall: `npm install ${AGENT_NPM_PACKAGE}`,
  /** Clone + link (offline / contributors) */
  cloneLink: `# clone once
git clone ${AGENT_GITHUB_URL}.git
cd mezodot./${AGENT_PACKAGE_PATH}
npm install && npm run build && npm link
mezodot wallet create
# or: mezodot wallet import --key 0x…`,
} as const;

/** Cursor mcp.json using npm-backed npx */
export function agentMcpProxyConfig(origin: string): string {
  const host = origin.replace(/\/$/, "");
  return JSON.stringify(
    {
      mcpServers: {
        mezodot: {
          command: "npx",
          args: ["--yes", AGENT_NPM_PACKAGE, "mcp", "--origin", host],
        },
      },
    },
    null,
    2,
  );
}
