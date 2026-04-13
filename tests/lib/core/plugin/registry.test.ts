import { describe, it, expect, beforeEach } from "vitest";
import { PluginRegistry } from "@/lib/core/plugin/registry";
import type { ToolDefinition } from "@/lib/core/types";

describe("PluginRegistry", () => {
  let registry: PluginRegistry;
  beforeEach(() => { registry = new PluginRegistry(); });

  it("registers and retrieves a tool", () => {
    const tool: ToolDefinition = { id: "web_search", name: "Web Search", description: "Search the web", execute: async () => [] };
    registry.registerTool(tool);
    expect(registry.getTool("web_search")).toBe(tool);
  });

  it("returns undefined for unregistered tool", () => {
    expect(registry.getTool("nonexistent")).toBeUndefined();
  });

  it("lists all registered tools", () => {
    registry.registerTool({ id: "t1", name: "T1", description: "", execute: async () => null });
    registry.registerTool({ id: "t2", name: "T2", description: "", execute: async () => null });
    expect(registry.listTools()).toHaveLength(2);
  });

  it("prevents duplicate tool registration", () => {
    const tool: ToolDefinition = { id: "t1", name: "T1", description: "", execute: async () => null };
    registry.registerTool(tool);
    expect(() => registry.registerTool(tool)).toThrow("already registered");
  });
});
