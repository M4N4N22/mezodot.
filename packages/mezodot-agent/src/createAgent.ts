import type { Hex } from "viem";
import {
  unlockWithAutoSettle,
  type GatewayCallResult,
} from "./client/gateway.js";
import { callMcpToolWithAutoSettle, mcpRpc } from "./client/mcp.js";
import { resolvePrivateKey } from "./wallet/store.js";

export type CreateMezodotAgentOptions = {
  /** mezodot. host, e.g. https://your-app.vercel.app */
  origin: string;
  /** Override local wallet / env key */
  privateKey?: Hex;
  rpcUrl?: string;
  gateway?: `0x${string}`;
};

export type MezodotAgent = {
  origin: string;
  unlock: (params: {
    service: string;
    input: unknown;
    clientRequestId?: string;
  }) => Promise<{
    gateway: GatewayCallResult;
    txHash?: Hex;
    paymentId?: Hex;
    settled: boolean;
  }>;
  callMcpTool: (
    name: string,
    args?: Record<string, unknown>,
  ) => Promise<unknown>;
  listMcpTools: () => Promise<unknown>;
};

export async function createMezodotAgent(
  options: CreateMezodotAgentOptions,
): Promise<MezodotAgent> {
  const origin = options.origin.replace(/\/$/, "");
  const privateKey = options.privateKey ?? resolvePrivateKey();

  return {
    origin,
    async unlock(params) {
      return unlockWithAutoSettle({
        origin,
        service: params.service,
        input: params.input,
        privateKey,
        rpcUrl: options.rpcUrl,
        gateway: options.gateway,
        clientRequestId: params.clientRequestId,
      });
    },
    async callMcpTool(name, args) {
      const res = await callMcpToolWithAutoSettle({
        origin,
        name,
        arguments: args,
        privateKey,
        rpcUrl: options.rpcUrl,
        gateway: options.gateway,
      });
      if (res.error) {
        throw new Error(res.error.message);
      }
      return res.result;
    },
    async listMcpTools() {
      const res = await mcpRpc(origin, "tools/list");
      if (res.error) throw new Error(res.error.message);
      return res.result;
    },
  };
}
