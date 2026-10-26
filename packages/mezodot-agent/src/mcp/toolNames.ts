/** Fixed MCP tool names — services are discovered, not listed as tools. */

export const MCP_META_TOOLS = [
  "mezodot_discover",
  "mezodot_catalog",
  "mezodot_health",
  "mezodot_unlock",
] as const;

/** @deprecated Prefer mezodot_unlock { service }. */
export function toolNameForSlug(slug: string): string {
  return `mezodot_${slug.replace(/-/g, "_")}`;
}

/** @deprecated Per-service MCP tools retired. */
export function slugFromToolName(name: string): string | null {
  if (!name.startsWith("mezodot_")) return null;
  if ((MCP_META_TOOLS as readonly string[]).includes(name)) return null;
  return name.slice("mezodot_".length).replace(/_/g, "-");
}
