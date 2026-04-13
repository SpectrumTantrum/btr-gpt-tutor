import type { CapabilityDefinition, ToolDefinition } from "@/lib/core/types";

export class PluginRegistry {
  private readonly tools: Map<string, ToolDefinition> = new Map();
  private readonly capabilities: Map<string, CapabilityDefinition> = new Map();

  registerTool(tool: ToolDefinition): void {
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool "${tool.id}" already registered`);
    }
    this.tools.set(tool.id, tool);
  }

  getTool(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  listTools(): readonly ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  registerCapability(capability: CapabilityDefinition): void {
    if (this.capabilities.has(capability.id)) {
      throw new Error(`Capability "${capability.id}" already registered`);
    }
    this.capabilities.set(capability.id, capability);
  }

  getCapability(id: string): CapabilityDefinition | undefined {
    return this.capabilities.get(id);
  }

  listCapabilities(): readonly CapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }
}
